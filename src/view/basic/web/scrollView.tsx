//
//  scrollView.tsx
//
//  The MIT License
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import _ from 'lodash';
import { ComponentRef, ComponentType, ExtendedCSSProperties, mergeRefs, RefObject, useCallback, useEffect, useRef, useRefHandle, useState } from 'frosty';
import { ScrollBaseProps, ScrollViewProps } from '../types/scrollView';
import { encodeViewStyle } from './css';
import { useFlattenStyle } from '../../../view/style/utils';
import { useResponderEvents } from './events';
import { useResizeObserver, useWindow } from 'frosty/web';
import { View } from './view';

export const useScrollProps = <Target extends any>(
  target: RefObject<Target | null | undefined>,
  ref: RefObject<HTMLElement | null | undefined>,
  {
    horizontal = false,
    vertical = !horizontal,
    scrollEnabled = true,
    directionalLockEnabled = false,
    contentOffset,
    zoomScale = 1,
    maximumZoomScale = 1,
    minimumZoomScale = 1,
    bounces = true,
    bouncesZoom,
    decelerationRate,
    onContentSizeChange,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag,
    onScrollToTop,
  }: ScrollBaseProps<Target>
) => {

  const [isDragging, setIsDragging] = useState(false);
  const [isMomentumScrolling, setIsMomentumScrolling] = useState(false);
  const lastScrollTime = useRef(0);
  const momentumTimeout = useRef<NodeJS.Timeout>();
  const window = useWindow();

  // For directional locking
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const lockDirection = useRef<'horizontal' | 'vertical' | null>(null);

  // Handle content size changes
  useResizeObserver(onContentSizeChange ? ref : null, (e) => {
    const targetInstance = target.current;
    if (!targetInstance || !onContentSizeChange) return;

    const element = e.target as HTMLElement;
    onContentSizeChange.call(targetInstance, {
      _native: e,
      timeStamp: window.performance.now(),
      target: e.target,
      currentTarget: targetInstance,
    });
  });

  // Set initial content offset
  useEffect(() => {
    if (!contentOffset || !ref.current) return;

    const element = ref.current;
    element.scrollLeft = contentOffset.x;
    element.scrollTop = contentOffset.y;
  }, [contentOffset, ref]);

  const _onScroll = useCallback(onScroll ? (e: Event & { currentTarget: HTMLElement }) => {
    const targetInstance = target.current;
    if (!targetInstance) return;

    const element = e.currentTarget;
    const now = window.performance.now();

    if (_.isFunction(onScroll)) {
      onScroll.call(targetInstance, {
        _native: e,
        timeStamp: now,
        target: e.target,
        currentTarget: targetInstance,
        contentOffset: {
          x: element.scrollLeft,
          y: element.scrollTop
        },
        contentSize: {
          height: element.scrollHeight,
          width: element.scrollWidth
        },
        layoutMeasurement: {
          height: element.clientHeight,
          width: element.clientWidth
        },
        zoomScale: zoomScale || 1,
      });
    }

    lastScrollTime.current = now;

    // Handle momentum scrolling detection
    if (momentumTimeout.current) {
      clearTimeout(momentumTimeout.current);
    }

    if (!isDragging && !isMomentumScrolling) {
      setIsMomentumScrolling(true);
      if (_.isFunction(onMomentumScrollBegin)) {
        onMomentumScrollBegin.call(targetInstance, {
          _native: e,
          timeStamp: now,
          target: e.target,
          currentTarget: targetInstance,
        });
      }
    }

    momentumTimeout.current = setTimeout(() => {
      if (isMomentumScrolling) {
        setIsMomentumScrolling(false);
        if (_.isFunction(onMomentumScrollEnd)) {
          onMomentumScrollEnd.call(targetInstance, {
            _native: e,
            timeStamp: window.performance.now(),
            target: e.target,
            currentTarget: targetInstance,
          });
        }
      }
    }, 100);
  } : undefined, [target, onScroll, onMomentumScrollBegin, onMomentumScrollEnd, isDragging, isMomentumScrolling, zoomScale]);

  const _onTouchStart = useCallback((onScrollBeginDrag || onMomentumScrollEnd || directionalLockEnabled) ? (e: TouchEvent | MouseEvent | PointerEvent) => {
    const targetInstance = target.current;
    if (!targetInstance) return;

    setIsDragging(true);

    // Store initial touch position for directional locking
    if (directionalLockEnabled) {
      if (e instanceof TouchEvent && e.touches.length > 0) {
        touchStartPos.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      } else if (e instanceof MouseEvent || e instanceof PointerEvent) {
        touchStartPos.current = {
          x: e.clientX,
          y: e.clientY
        };
      }
      lockDirection.current = null;
    }

    if (isMomentumScrolling) {
      setIsMomentumScrolling(false);
      if (_.isFunction(onMomentumScrollEnd)) {
        onMomentumScrollEnd.call(targetInstance, {
          _native: e,
          timeStamp: e.timeStamp,
          target: e.target,
          currentTarget: targetInstance,
        });
      }
    }

    if (_.isFunction(onScrollBeginDrag)) {
      onScrollBeginDrag.call(targetInstance, {
        _native: e,
        timeStamp: e.timeStamp,
        target: e.target,
        currentTarget: targetInstance,
      });
    }
  } : undefined, [target, onScrollBeginDrag, onMomentumScrollEnd, isMomentumScrolling, directionalLockEnabled]);

  const _onTouchMove = useCallback(directionalLockEnabled ? (e: TouchEvent | MouseEvent | PointerEvent) => {
    if (!touchStartPos.current) return;

    let currentX: number, currentY: number;

    if (e instanceof TouchEvent && e.touches.length > 0) {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else if (e instanceof MouseEvent || e instanceof PointerEvent) {
      currentX = e.clientX;
      currentY = e.clientY;
    } else {
      return;
    }

    const deltaX = Math.abs(currentX - touchStartPos.current.x);
    const deltaY = Math.abs(currentY - touchStartPos.current.y);

    // Only determine direction after minimum movement threshold
    if (deltaX > 10 || deltaY > 10) {
      if (!lockDirection.current) {
        // Determine the primary scroll direction
        lockDirection.current = deltaX > deltaY ? 'horizontal' : 'vertical';
      }

      // Prevent scrolling in the locked direction
      if (lockDirection.current === 'horizontal' && !horizontal) {
        e.preventDefault();
      } else if (lockDirection.current === 'vertical' && !vertical) {
        e.preventDefault();
      }
    }
  } : undefined, [directionalLockEnabled, horizontal, vertical]);

  const _onTouchEnd = useCallback((onScrollEndDrag || directionalLockEnabled) ? (e: TouchEvent | MouseEvent | PointerEvent) => {
    const targetInstance = target.current;
    if (!targetInstance || !isDragging) return;

    setIsDragging(false);

    // Reset directional lock state
    if (directionalLockEnabled) {
      touchStartPos.current = null;
      lockDirection.current = null;
    }

    if (_.isFunction(onScrollEndDrag)) {
      onScrollEndDrag.call(targetInstance, {
        _native: e,
        timeStamp: e.timeStamp,
        target: e.target,
        currentTarget: targetInstance,
      });
    }
  } : undefined, [target, onScrollEndDrag, isDragging, directionalLockEnabled]);

  const _onWheel = useCallback(directionalLockEnabled ? (e: WheelEvent) => {
    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);

    // Determine scroll direction and prevent if not allowed
    if (absX > absY) {
      // Horizontal scrolling
      if (!horizontal) {
        e.preventDefault();
      }
    } else {
      // Vertical scrolling
      if (!vertical) {
        e.preventDefault();
      }
    }
  } : undefined, [directionalLockEnabled, horizontal, vertical]);

  // Use global event listeners for touch/mouse end events (like useResponderEvents does)
  useEffect(() => {
    if (!_onTouchEnd) return;

    const handleGlobalEnd = (e: TouchEvent | MouseEvent | PointerEvent) => {
      _onTouchEnd(e);
    };

    if ('TouchEvent' in window) {
      window.addEventListener('touchend', handleGlobalEnd);
      window.addEventListener('touchcancel', handleGlobalEnd);
      return () => {
        window.removeEventListener('touchend', handleGlobalEnd);
        window.removeEventListener('touchcancel', handleGlobalEnd);
      };
    }

    if ('PointerEvent' in window) {
      window.addEventListener('pointerup', handleGlobalEnd);
      window.addEventListener('pointercancel', handleGlobalEnd);
      return () => {
        window.removeEventListener('pointerup', handleGlobalEnd);
        window.removeEventListener('pointercancel', handleGlobalEnd);
      };
    }

    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('dragstart', handleGlobalEnd);
    return () => {
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('dragstart', handleGlobalEnd);
    };
  }, [_onTouchEnd]);

  // Add global move listeners for Safari directional locking
  useEffect(() => {
    if (!_onTouchMove || !directionalLockEnabled) return;

    const handleGlobalTouchMove = (e: TouchEvent | MouseEvent | PointerEvent) => {
      if (isDragging) {
        _onTouchMove(e);
      }
    };

    // Use passive: false to allow preventDefault
    if ('TouchEvent' in window) {
      window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      return () => window.removeEventListener('touchmove', handleGlobalTouchMove);
    }

    if ('PointerEvent' in window) {
      window.addEventListener('pointermove', handleGlobalTouchMove, { passive: false });
      return () => window.removeEventListener('pointermove', handleGlobalTouchMove);
    }

    window.addEventListener('mousemove', handleGlobalTouchMove, { passive: false });
    return () => window.removeEventListener('mousemove', handleGlobalTouchMove);
  }, [_onTouchMove, directionalLockEnabled, isDragging]);

  // Cleanup momentum timeout on unmount
  useEffect(() => {
    return () => {
      if (momentumTimeout.current) {
        clearTimeout(momentumTimeout.current);
      }
    };
  }, []);

  // Return appropriate event handlers based on browser capabilities (like useResponderEvents)
  const scrollEventHandlers = (() => {
    const baseHandlers = {
      onScroll: _onScroll,
      onWheel: _onWheel,
    };

    if ('TouchEvent' in window) {
      return {
        ...baseHandlers,
        onTouchStart: _onTouchStart,
        onTouchMove: _onTouchMove,
        onTouchEnd: _onTouchEnd,
        onTouchCancel: _onTouchEnd,
      };
    }

    if ('PointerEvent' in window) {
      return {
        ...baseHandlers,
        onPointerDown: _onTouchStart,
        onPointerMove: _onTouchMove,
        onPointerUp: _onTouchEnd,
        onPointerCancel: _onTouchEnd,
      };
    }

    return {
      ...baseHandlers,
      onMouseDown: _onTouchStart,
      onMouseMove: _onTouchMove,
      onMouseUp: _onTouchEnd,
      onDragStart: _onTouchEnd,
    };
  })();

  return {
    style: {
      overflow: scrollEnabled ? 'hidden' : undefined,
      overflowX: horizontal && scrollEnabled ? 'auto' : 'hidden',
      overflowY: vertical && scrollEnabled ? 'auto' : 'hidden',
      overscrollBehavior: bounces ? 'contain' : 'none',
    } as ExtendedCSSProperties,
    ..._.pickBy(scrollEventHandlers, v => !!v),
  };
};

export const ScrollView: ComponentType<ScrollViewProps> = ({
  id,
  ref,
  style,
  contentContainerStyle,
  tabIndex,
  children,
  horizontal = false,
  vertical = !horizontal,
  ...props
}) => {

  const targetRef = useRef<HTMLDivElement>();
  const nativeRef = useRef<ComponentRef<typeof ScrollView>>();
  useRefHandle(mergeRefs(nativeRef, ref), () => ({
    get _native() { return targetRef.current; },
    flashScrollIndicators() { },
    scrollTo(options) {
      const el = targetRef.current;
      if (!el) return;
      const { x, y, animated } = options || {} as any;
      el.scrollTo({
        left: x ?? el.scrollLeft,
        top: y ?? el.scrollTop,
        behavior: animated ? 'smooth' : 'auto',
      });
    },
    scrollToEnd(options) {
      const el = targetRef.current;
      if (!el) return;
      const { animated } = options || {} as any;
      el.scrollTo({
        left: horizontal ? (el.scrollWidth - el.clientWidth) : el.scrollLeft,
        top: vertical ? (el.scrollHeight - el.clientHeight) : el.scrollTop,
        behavior: animated ? 'smooth' : 'auto',
      });
    },
  }), null);

  const { overflow, overflowX, overflowY, ...cssStyle } = encodeViewStyle(useFlattenStyle([
    {
      alignContent: 'flex-start',
      alignItems: 'stretch',
      alignSelf: 'auto',
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: 'black',
      boxSizing: 'border-box',
      display: 'flex',
      flexBasis: 'auto',
      flexDirection: 'column',
      flexShrink: 0,
      justifyContent: 'stretch',
      justifyItems: 'stretch',
      justifySelf: 'auto',
      margin: 0,
      minHeight: 0,
      minWidth: 0,
      padding: 0,
      position: 'relative',
      textDecorationLine: 'none',
      zIndex: 0,
    },
    style,
  ]));

  const { style: scrollStyle, ...scrollProps } = useScrollProps(nativeRef, targetRef, { horizontal, vertical, ...props });

  return (
    <div
      id={id}
      ref={targetRef}
      style={[
        cssStyle,
        scrollStyle,
      ]}
      tabIndex={tabIndex}
      {...scrollProps}
      {...useResponderEvents(props, nativeRef, targetRef)}>
      <View style={contentContainerStyle}>{children}</View>
    </div>
  );
};

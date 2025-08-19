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
import { ComponentRef, ComponentType, ExtendedCSSProperties, mergeRefs, useEffect, useRef, useRefHandle, useCallback } from 'frosty';
import { ScrollBaseProps, ScrollViewProps } from '../types/scrollView';
import { encodeViewStyle } from './css';
import { useFlattenStyle } from '../../../view/style/utils';
import { useResponderEvents } from './events';
import { View } from './view';

export const useScrollProps = <Target extends { _native?: HTMLElement }>({
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
}: ScrollBaseProps<Target>) => {

  // Track scroll and drag state
  const scrollingRef = useRef(false);
  const dragRef = useRef(false);
  const momentumRef = useRef(false);
  const lastScrollPos = useRef({ x: 0, y: 0 });
  const lockDir = useRef<'x' | 'y' | undefined>();
  const momentumTimer = useRef<number | undefined>();

  const clearMomentumTimer = () => {
    if (momentumTimer.current) {
      window.clearTimeout(momentumTimer.current);
      momentumTimer.current = undefined;
    }
  };

  // Helper constructing event shape expected by callbacks
  const buildEvent = (target: HTMLElement) => ({
    currentTarget: target,
    target,
    stopPropagation() { },
    preventDefault() { },
  });

  const call = <K extends keyof ScrollBaseProps<Target>>(handler: ScrollBaseProps<Target>[K], arg: any) => {
    (handler as any)?.call(arg.currentTarget as any, arg);
  };

  const handleScroll = useCallback((e: any) => {
    if (!scrollEnabled) return;
    const target: HTMLElement = e.currentTarget;
    const evt = buildEvent(target) as any;
    const x = target.scrollLeft;
    const y = target.scrollTop;
    const dx = x - lastScrollPos.current.x;
    const dy = y - lastScrollPos.current.y;

    if (directionalLockEnabled && !lockDir.current) {
      if (Math.abs(dx) > Math.abs(dy)) lockDir.current = 'x';
      else if (Math.abs(dy) > Math.abs(dx)) lockDir.current = 'y';
    }

    if (!dragRef.current) {
      dragRef.current = true;
      call(onScrollBeginDrag, evt);
      momentumRef.current = true;
      call(onMomentumScrollBegin, evt);
    }

    const scrollEvent = {
      ...evt,
      contentOffset: { x, y },
      contentSize: { width: target.scrollWidth, height: target.scrollHeight },
      layoutMeasurement: { width: target.clientWidth, height: target.clientHeight },
      zoomScale,
    };
    call(onScroll, scrollEvent);

    // content size change callback triggered each scroll (simpler heuristic)
    call(onContentSizeChange, evt);

    if (y === 0) call(onScrollToTop, evt);

    clearMomentumTimer();
    momentumTimer.current = window.setTimeout(() => {
      if (dragRef.current) {
        dragRef.current = false;
        call(onScrollEndDrag, evt);
      }
      if (momentumRef.current) {
        momentumRef.current = false;
        call(onMomentumScrollEnd, evt);
      }
      lockDir.current = undefined;
    }, 120);

    lastScrollPos.current = { x, y };
  }, [scrollEnabled, directionalLockEnabled, onScrollBeginDrag, onScroll, onScrollEndDrag, onMomentumScrollBegin, onMomentumScrollEnd, onContentSizeChange, onScrollToTop, zoomScale]);

  // Apply initial contentOffset
  const containerRef = useRef<HTMLElement | null>(null);
  const setContainer = useCallback((el: HTMLElement | null) => {
    containerRef.current = el;
    if (el && contentOffset) {
      if (typeof contentOffset.x === 'number') el.scrollLeft = contentOffset.x;
      if (typeof contentOffset.y === 'number') el.scrollTop = contentOffset.y;
    }
  }, [contentOffset?.x, contentOffset?.y]);

  // Update scroll position when contentOffset changes
  useEffect(() => {
    const el = containerRef.current;
    if (el && contentOffset) {
      if (contentOffset.x != null) el.scrollLeft = contentOffset.x;
      if (contentOffset.y != null) el.scrollTop = contentOffset.y;
    }
  }, [contentOffset?.x, contentOffset?.y]);

  useEffect(() => () => clearMomentumTimer(), []);

  return {
    ref: setContainer,
    style: {
      overflow: scrollEnabled ? 'hidden' : undefined,
      overflowX: horizontal && scrollEnabled ? 'auto' : 'hidden',
      overflowY: vertical && scrollEnabled ? 'auto' : 'hidden',
      overscrollBehavior: bounces ? 'contain' : 'none',
      touchAction: directionalLockEnabled ? (horizontal && vertical ? 'pan-x pan-y' : horizontal ? 'pan-x' : 'pan-y') : undefined,
    } as ExtendedCSSProperties,
    onScroll: handleScroll,
  };
};

export const ScrollView: ComponentType<ScrollViewProps> = ({
  id,
  ref,
  style,
  contentContainerStyle,
  tabIndex,
  children,
  ...props
}) => {

  const targetRef = useRef<HTMLDivElement>();
  const nativeRef = useRef<ComponentRef<typeof ScrollView>>();
  useRefHandle(mergeRefs(nativeRef, ref), () => ({
    get _native() { return targetRef.current; },
    flashScrollIndicators() {},
    scrollTo() {},
    scrollToEnd() {},
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

  const { style: scrollStyle, ref: scrollInnerRef, ...scrollProps } = useScrollProps(props as any);

  const combinedRef = useCallback((el: HTMLDivElement | null | undefined) => {
    (targetRef as any).current = el ?? null;
    const pass = el ?? null;
    if (typeof scrollInnerRef === 'function') (scrollInnerRef as any)(pass);
    else if (scrollInnerRef && 'current' in (scrollInnerRef as any)) (scrollInnerRef as any).current = pass;
  }, [scrollInnerRef]);

  return (
    <div
      id={id}
      ref={combinedRef}
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

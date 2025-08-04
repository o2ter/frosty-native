//
//  events.ts
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
import { RefObject, useCallback, useEffect } from 'frosty';
import { ViewEventProps } from '../types/events';
import { useResizeObserver, useWindow } from 'frosty/web';

const supportsTouchEvent = () => typeof window !== 'undefined' && window.TouchEvent != null;
const supportsPointerEvent = () => typeof window !== 'undefined' && window.PointerEvent != null;

const useResponderHandler = ({ onPressIn, onPressMove, onPressOut }: {
  onPressIn: (e: TouchEvent | MouseEvent) => void;
  onPressMove: (e: TouchEvent | MouseEvent) => void;
  onPressOut: (e: TouchEvent | MouseEvent) => void;
}) => {
  const window = useWindow();
  const _onPressOut = useCallback(onPressOut);
  useEffect(() => {
    window.addEventListener('mouseup', _onPressOut as any);
    return () => window.removeEventListener('mouseup', _onPressOut as any);
  }, []);
  if (supportsTouchEvent()) return {
    onTouchStart: (e: TouchEvent) => {
      onPressIn(e);
    },
    onTouchMove: (e: TouchEvent) => {
      onPressMove(e);
    },
    onTouchEnd: (e: TouchEvent) => {
      _onPressOut(e);
    },
    onTouchCancel: (e: TouchEvent) => {
      _onPressOut(e);
    },
  };
  if (supportsPointerEvent()) return {
    onPointerDown: (e: PointerEvent) => {
      onPressIn(e);
    },
    onPointerMove: (e: PointerEvent) => {
      onPressMove(e);
    },
    onPointerUp: (e: PointerEvent) => {
      _onPressOut(e);
    },
    onPointerCancel: (e: PointerEvent) => {
      _onPressOut(e);
    },
  };
  return {
    onMouseDown: (e: MouseEvent) => {
      onPressIn(e);
    },
    onMouseMove: (e: MouseEvent) => {
      onPressMove(e);
    },
    onMouseUp: (e: MouseEvent) => {
      _onPressOut(e);
    },
  }
}

const wrapPressEvent = <Target>(e: TouchEvent | MouseEvent, ref: RefObject<Target | null | undefined>) => e instanceof MouseEvent ? ({
  timestamp: e.timeStamp,
  locationX: e.clientX,
  locationY: e.clientY,
  pageX: e.pageX,
  pageY: e.pageY,
  get currentTarget() { return ref.current!; },
  get target() { return e.target; },
  get touches() { return [e]; },
  get changedTouches() { return [e]; },
}) : ({
  timestamp: e.timeStamp,
  locationX: _.sumBy(e.touches, x => x.clientX) / e.touches.length,
  locationY: _.sumBy(e.touches, x => x.clientY) / e.touches.length,
  pageX: _.sumBy(e.touches, x => x.pageX) / e.touches.length,
  pageY: _.sumBy(e.touches, x => x.pageY) / e.touches.length,
  get currentTarget() { return ref.current!; },
  get target() { return e.target; },
  get touches() { return [...e.touches]; },
  get changedTouches() { return [...e.changedTouches]; },
});

const wrapMouseEvent = <Target>(e: MouseEvent, ref: RefObject<Target | null | undefined>) => ({
  clientX: e.clientX,
  clientY: e.clientY,
  pageX: e.pageX,
  pageY: e.pageY,
  timestamp: e.timeStamp,
  get currentTarget() { return ref.current!; },
  get target() { return e.target; },
});

export const useEventProps = <Target>(
  props: ViewEventProps<Target>,
  targetRef: RefObject<Target | null | undefined>,
  elementRef: RefObject<HTMLElement | null | undefined>
) => {

  const {
    onLayout,
    onHoverIn,
    onHoverOut,
  } = props;

  useResizeObserver(onLayout ? elementRef : null, (e) => {
    if (!onLayout) return;
  });

  if (supportsPointerEvent()) {
    return {
      onPointerEnter: onHoverIn ? (e: MouseEvent) => {
        onHoverIn(wrapMouseEvent(e, targetRef));
      } : undefined,
      onPointerLeave: onHoverOut ? (e: MouseEvent) => {
        onHoverOut(wrapMouseEvent(e, targetRef));
      } : undefined,
    };
  }

  return {
    onMouseEnter: onHoverIn ? (e: MouseEvent) => {
      onHoverIn(wrapMouseEvent(e, targetRef));
    } : undefined,
    onMouseLeave: onHoverOut ? (e: MouseEvent) => {
      onHoverOut(wrapMouseEvent(e, targetRef));
    } : undefined,
  };
};

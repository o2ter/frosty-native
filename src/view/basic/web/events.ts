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

import { RefObject } from 'frosty';
import { ViewEventProps } from '../types/events';
import { useResizeObserver } from 'frosty/web';

const supportsPointerEvent = () => typeof window !== 'undefined' && window.PointerEvent != null;

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

  const { onLayout, onHoverIn, onHoverOut } = props;

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

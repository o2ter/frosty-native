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

import { RefObject, useRef } from 'frosty';
import { ViewEventProps } from '../types/events';
import { useResizeObserver } from 'frosty/web';

const supportsTouchEvent = () => typeof window !== 'undefined' && window.TouchEvent != null;
const supportsPointerEvent = () => typeof window !== 'undefined' && window.PointerEvent != null;

const pressHandler = ({ onPressIn, onPressMove, onPressOut }: {
  onPressIn: (e: TouchEvent | PointerEvent) => void;
  onPressMove: (e: TouchEvent | PointerEvent) => void;
  onPressOut: (e: TouchEvent | PointerEvent) => void;
}) => {
  return supportsTouchEvent ()? {
    onTouchStart: (e: TouchEvent) => {
      onPressIn(e);
    },
    onTouchMove: (e: TouchEvent) => {
      onPressMove(e);
    },
    onTouchEnd: (e: TouchEvent) => {
      onPressOut(e);
    },
    onTouchCancel: (e: TouchEvent) => {
      onPressOut(e);
    },
  } : {
    onPointerDown: (e: PointerEvent) => {
      onPressIn(e);
    },
    onPointerMove: (e: PointerEvent) => {
      onPressMove(e);
    },
    onPointerUp: (e: PointerEvent) => {
      onPressOut(e);
    },
    onPointerCancel: (e: PointerEvent) => {
      onPressOut(e);
    },
  }
}

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
    delayLongPress = 500,
    onLayout,
    onHoverIn,
    onHoverOut,
    onPress,
    onLongPress,
    onPressIn,
    onPressOut,
    onResponderMove,
  } = props;

  const pressState = useRef({
    token: '',
    timeout: true,
  });

  useResizeObserver(onLayout ? elementRef : null, (e) => {
    if (!onLayout) return;
  });

  // const press = pressHandler({
  //   onPressIn: (e) => {
  //     if (onPressIn) onPressIn(wrapMouseEvent(e));
  //     const token = _.uniqueId();
  //     pressState.current.token = token;
  //     pressState.current.timeout = _.isNil(onLongPress);
  //     if (onLongPress) {
  //       setTimeout(() => {
  //         if (pressState.current.token !== token) return;
  //         onLongPress(wrapMouseEvent(e));
  //         pressState.current.timeout = true;
  //       }, delayLongPress);
  //     } else if (onPress) {
  //       onPress(wrapMouseEvent(e));
  //     }
  //   },
  //   onPressMove: (e) => {
  //     if (pressState.current.token === '') return;
  //     if (onResponderMove) onResponderMove(wrapMouseEvent(e));
  //   },
  //   onPressOut: (e) => {
  //     if (pressState.current.token === '') return;
  //     pressState.current.token = '';
  //     if (onPressOut) onPressOut(wrapMouseEvent(e));
  //     if (!pressState.current.timeout) {
  //       if (onPress) onPress(wrapMouseEvent(e));
  //     }
  //   },
  // });

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

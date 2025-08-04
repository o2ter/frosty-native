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

const wrapPressEvent = <Target>(e: TouchEvent | MouseEvent, currentTarget: Target) => e instanceof MouseEvent ? ({
  timestamp: e.timeStamp,
  locationX: e.clientX,
  locationY: e.clientY,
  pageX: e.pageX,
  pageY: e.pageY,
  get currentTarget() { return currentTarget; },
  get target() { return e.target; },
  get touches() { return [e]; },
  get changedTouches() { return [e]; },
}) : ({
  timestamp: e.timeStamp,
  locationX: _.sumBy(e.touches, x => x.clientX) / e.touches.length,
  locationY: _.sumBy(e.touches, x => x.clientY) / e.touches.length,
  pageX: _.sumBy(e.touches, x => x.pageX) / e.touches.length,
  pageY: _.sumBy(e.touches, x => x.pageY) / e.touches.length,
  get currentTarget() { return currentTarget; },
  get target() { return e.target; },
  get touches() { return [...e.touches]; },
  get changedTouches() { return [...e.changedTouches]; },
});

const wrapMouseEvent = <Target>(e: MouseEvent, currentTarget: Target) => ({
  clientX: e.clientX,
  clientY: e.clientY,
  pageX: e.pageX,
  pageY: e.pageY,
  timestamp: e.timeStamp,
  get currentTarget() { return currentTarget; },
  get target() { return e.target; },
});

const _currentResponder = new WeakMap<ReturnType<typeof useWindow>, { target: any; } & ViewEventProps<any>>();

export const useResponderEvents = <Target>(
  props: ViewEventProps<Target>,
  targetRef: RefObject<Target | null | undefined>,
  elementRef: RefObject<HTMLElement | null | undefined>
) => {

  const {
    disabled,
    onLayout,
    onHoverIn,
    onHoverOut,
    onMoveShouldSetResponder,
    onMoveShouldSetResponderCapture,
    onResponderGrant,
    onResponderMove,
    onResponderReject,
    onResponderRelease,
    onResponderTerminate,
    onResponderTerminationRequest,
    onStartShouldSetResponder,
    onStartShouldSetResponderCapture,
  } = props;

  const window = useWindow();

  useResizeObserver(onLayout ? elementRef : null, (e) => {
    if (!onLayout) return;
  });

  const _onHoverIn = onHoverIn && ((e: MouseEvent) => {
    const target = targetRef.current;
    if (!target) return;
    onHoverIn(wrapMouseEvent(e, target));
  });
  const _onHoverOut = onHoverOut && ((e: MouseEvent) => {
    const target = targetRef.current;
    if (!target) return;
    onHoverOut(wrapMouseEvent(e, target));
  });

  const enableResponder = !disabled && (
    _.isFunction(onMoveShouldSetResponder) ||
    _.isFunction(onMoveShouldSetResponderCapture) ||
    _.isFunction(onResponderGrant) ||
    _.isFunction(onResponderMove) ||
    _.isFunction(onResponderReject) ||
    _.isFunction(onResponderRelease) ||
    _.isFunction(onResponderTerminate) ||
    _.isFunction(onResponderTerminationRequest) ||
    _.isFunction(onStartShouldSetResponder) ||
    _.isFunction(onStartShouldSetResponderCapture)
  );

  const _onPressIn = !enableResponder ? undefined : (e: TouchEvent | MouseEvent) => {

    const target = targetRef.current;
    if (!target) return;

    const shouldSetResponder = _.isFunction(onStartShouldSetResponder) ? onStartShouldSetResponder(wrapPressEvent(e, target)) : true;
    if (!shouldSetResponder) return;

    const currentResponder = _currentResponder.get(window);
    if (currentResponder) {
      const {
        onResponderTerminationRequest,
        onResponderTerminate,
      } = currentResponder;
      const termination = _.isFunction(onResponderTerminationRequest) ? onResponderTerminationRequest(wrapPressEvent(e, currentResponder.target)) : true;
      if (termination === false) {
        if (_.isFunction(onResponderReject)) onResponderReject(wrapPressEvent(e, target));
      } else {
        if (_.isFunction(onResponderTerminate)) onResponderTerminate(wrapPressEvent(e, currentResponder.target));
        if (_.isFunction(onResponderGrant)) onResponderGrant(wrapPressEvent(e, target));
        _currentResponder.set(window, { target, ...props });
      }
    } else {

    }

  };
  const _onPressInCapture = !enableResponder ? undefined : (e: TouchEvent | MouseEvent) => {

    const target = targetRef.current;
    if (!target) return;

    const shouldSetResponder = _.isFunction(onStartShouldSetResponderCapture) ? onStartShouldSetResponderCapture(wrapPressEvent(e, target)) : false;
    if (!shouldSetResponder) return;

    const currentResponder = _currentResponder.get(window);
    if (currentResponder) {
      const {
        onResponderTerminationRequest,
        onResponderTerminate,
      } = currentResponder;
      const termination = _.isFunction(onResponderTerminationRequest) ? onResponderTerminationRequest(wrapPressEvent(e, currentResponder.target)) : true;
      if (termination === false) {
        if (_.isFunction(onResponderReject)) onResponderReject(wrapPressEvent(e, target));
      } else {
        if (_.isFunction(onResponderTerminate)) onResponderTerminate(wrapPressEvent(e, currentResponder.target));
        if (_.isFunction(onResponderGrant)) onResponderGrant(wrapPressEvent(e, target));
        _currentResponder.set(window, { target, ...props });
      }
    } else {

    }

  };
  const _onPressMove = !enableResponder ? undefined : (e: TouchEvent | MouseEvent) => {

    const target = targetRef.current;
    if (!target) return;

  };
  const _onPressMoveCapture = !enableResponder ? undefined : (e: TouchEvent | MouseEvent) => {

    const target = targetRef.current;
    if (!target) return;

  };
  const _onPressOut = useCallback(!enableResponder ? undefined : (e: TouchEvent | MouseEvent) => {

    const target = targetRef.current;
    if (!target) return;

  });

  useEffect(() => {
    if (!_onPressOut) return;
    if ('TouchEvent' in window) {
      window.addEventListener('touchend', _onPressOut);
      return () => window.removeEventListener('touchend', _onPressOut);
    };
    if ('PointerEvent' in window) {
      window.addEventListener('pointerup', _onPressOut);
      return () => window.removeEventListener('pointerup', _onPressOut);
    };
    window.addEventListener('mouseup', _onPressOut);
    return () => window.removeEventListener('mouseup', _onPressOut);
  }, []);

  if ('TouchEvent' in window) return _.pickBy({
    onPointerEnter: _onHoverIn,
    onPointerLeave: _onHoverOut,
    onTouchStart: _onPressIn,
    onTouchStartCapture: _onPressInCapture,
    onTouchMove: _onPressMove,
    onTouchMoveCapture: _onPressMoveCapture,
    onTouchEnd: _onPressOut,
    onTouchCancel: _onPressOut,
  }, v => !!v);

  if ('PointerEvent' in window) return _.pickBy({
    onPointerEnter: _onHoverIn,
    onPointerLeave: _onHoverOut,
    onPointerDown: _onPressIn,
    onPointerDownCapture: _onPressInCapture,
    onPointerMove: _onPressMove,
    onPointerMoveCapture: _onPressMoveCapture,
    onPointerUp: _onPressOut,
    onPointerCancel: _onPressOut,
  }, v => !!v);

  return _.pickBy({
    onMouseEnter: _onHoverIn,
    onMouseLeave: _onHoverOut,
    onMouseDown: _onPressIn,
    onMouseDownCapture: _onPressInCapture,
    onMouseMove: _onPressMove,
    onMouseMoveCapture: _onPressMoveCapture,
    onMouseUp: _onPressOut,
  }, v => !!v);
};

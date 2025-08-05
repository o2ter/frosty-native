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
  get touches() {
    return _.includes([
      'mouseup',
      'dragstart',
      'touchend',
      'touchcancel',
    ], e.type) ? [] : [e];
  },
  get targetTouches() {
    return _.includes([
      'mouseup',
      'dragstart',
      'touchend',
      'touchcancel',
    ], e.type) ? [] : [e]; },
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
  get targetTouches() { return [...e.targetTouches]; },
  get changedTouches() { return [...e.changedTouches]; },
});

const wrapMouseEvent = <Target>(e: MouseEvent, currentTarget: Target) => ({
  clientX: e.clientX,
  clientY: e.clientY,
  pageX: e.pageX,
  pageY: e.pageY,
  timestamp: e.timeStamp,
  get target() { return e.target; },
  get currentTarget() { return currentTarget; },
});

/*                                             Negotiation Performed
                                             +-----------------------+
                                            /                         \
Process low level events to    +     Current Responder      +   wantsResponderID
determine who to perform negot-|   (if any exists at all)   |
iation/transition              | Otherwise just pass through|
-------------------------------+----------------------------+------------------+
Bubble to find first ID        |                            |
to return true:wantsResponderID|                            |
                               |                            |
     +--------------+          |                            |
     | onTouchStart |          |                            |
     +------+-------+    none  |                            |
            |            return|                            |
+-----------v-------------+true| +------------------------+ |
|onStartShouldSetResponder|----->| onResponderStart (cur) |<-----------+
+-----------+-------------+    | +------------------------+ |          |
            |                  |                            | +--------+-------+
            | returned true for|       false:REJECT +-------->|onResponderReject
            | wantsResponderID |                    |       | +----------------+
            | (now attempt     | +------------------+-----+ |
            |  handoff)        | | onResponder            | |
            +------------------->|    TerminationRequest  | |
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |         true:GRANT +-------->|onResponderGrant|
                               |                            | +--------+-------+
                               | +------------------------+ |          |
                               | | onResponderTerminate   |<-----------+
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |                    +-------->|onResponderStart|
                               |                            | +----------------+
Bubble to find first ID        |                            |
to return true:wantsResponderID|                            |
                               |                            |
     +-------------+           |                            |
     | onTouchMove |           |                            |
     +------+------+     none  |                            |
            |            return|                            |
+-----------v-------------+true| +------------------------+ |
|onMoveShouldSetResponder |----->| onResponderMove (cur)  |<-----------+
+-----------+-------------+    | +------------------------+ |          |
            |                  |                            | +--------+-------+
            | returned true for|       false:REJECT +-------->|onResponderReject
            | wantsResponderID |                    |       | +----------------+
            | (now attempt     | +------------------+-----+ |
            |  handoff)        | |   onResponder          | |
            +------------------->|      TerminationRequest| |
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |         true:GRANT +-------->|onResponderGrant|
                               |                            | +--------+-------+
                               | +------------------------+ |          |
                               | |   onResponderTerminate |<-----------+
                               | +------------------+-----+ |
                               |                    |       | +----------------+
                               |                    +-------->|onResponderMove |
                               |                            | +----------------+
                               |                            |
                               |                            |
      Some active touch started|                            |
      inside current responder | +------------------------+ |
      +------------------------->|      onResponderEnd    | |
      |                        | +------------------------+ |
  +---+---------+              |                            |
  | onTouchEnd  |              |                            |
  +---+---------+              |                            |
      |                        | +------------------------+ |
      +------------------------->|     onResponderEnd     | |
      No active touches started| +-----------+------------+ |
      inside current responder |             |              |
                               |             v              |
                               | +------------------------+ |
                               | |    onResponderRelease  | |
                               | +------------------------+ |
                               |                            |
                               +                            + */

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
    onResponderStart,
    onResponderMove,
    onResponderEnd,
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
    _.isFunction(onResponderStart) ||
    _.isFunction(onResponderMove) ||
    _.isFunction(onResponderEnd) ||
    _.isFunction(onResponderReject) ||
    _.isFunction(onResponderRelease) ||
    _.isFunction(onResponderTerminate) ||
    _.isFunction(onResponderTerminationRequest) ||
    _.isFunction(onStartShouldSetResponder) ||
    _.isFunction(onStartShouldSetResponderCapture)
  );

  const _transferResponder = (e: TouchEvent | MouseEvent, target: Target) => {

    const currentResponder = _currentResponder.get(window);
    if (!currentResponder) return true;

    const {
      onResponderTerminationRequest,
      onResponderTerminate,
    } = currentResponder;

    const termination = _.isFunction(onResponderTerminationRequest) ? onResponderTerminationRequest(wrapPressEvent(e, currentResponder.target)) : true;

    if (termination === false) {
      if (_.isFunction(onResponderReject)) onResponderReject(wrapPressEvent(e, target));
      return false;
    }

    if (_.isFunction(onResponderGrant)) onResponderGrant(wrapPressEvent(e, target));
    if (_.isFunction(onResponderTerminate)) onResponderTerminate(wrapPressEvent(e, currentResponder.target));

    return true;
  };

  const _onTouchStart = !enableResponder ? undefined : (e: TouchEvent | MouseEvent) => {

    const target = targetRef.current;
    if (!target) return;

    const shouldSetResponder = _.isFunction(onStartShouldSetResponder) ? onStartShouldSetResponder(wrapPressEvent(e, target)) : true;
    if (!shouldSetResponder) return;

    if (_transferResponder(e, target)) {
      if (_.isFunction(onResponderStart)) onResponderStart(wrapPressEvent(e, target));
      _currentResponder.set(window, { target, ...props });
      e.stopPropagation();
    }
  };
  const _onTouchStartCapture = !enableResponder ? undefined : (e: TouchEvent | MouseEvent) => {

    const target = targetRef.current;
    if (!target) return;

    const shouldSetResponder = _.isFunction(onStartShouldSetResponderCapture) ? onStartShouldSetResponderCapture(wrapPressEvent(e, target)) : false;
    if (!shouldSetResponder) return;

    if (_transferResponder(e, target)) {
      if (_.isFunction(onResponderStart)) onResponderStart(wrapPressEvent(e, target));
      _currentResponder.set(window, { target, ...props });
      e.stopPropagation();
    }
  };
  const _onTouchMove = !enableResponder ? undefined : (e: TouchEvent | MouseEvent) => {

    const target = targetRef.current;
    if (!target) return;

    const shouldSetResponder = _.isFunction(onMoveShouldSetResponder) ? onMoveShouldSetResponder(wrapPressEvent(e, target)) : true;
    if (!shouldSetResponder) return;

    if (_transferResponder(e, target)) {
      if (_.isFunction(onResponderMove)) onResponderMove(wrapPressEvent(e, target));
      _currentResponder.set(window, { target, ...props });
      e.stopPropagation();
    }
  };
  const _onTouchMoveCapture = !enableResponder ? undefined : (e: TouchEvent | MouseEvent) => {

    const target = targetRef.current;
    if (!target) return;

    const shouldSetResponder = _.isFunction(onMoveShouldSetResponderCapture) ? onMoveShouldSetResponderCapture(wrapPressEvent(e, target)) : true;
    if (!shouldSetResponder) return;

    if (_transferResponder(e, target)) {
      if (_.isFunction(onResponderMove)) onResponderMove(wrapPressEvent(e, target));
      _currentResponder.set(window, { target, ...props });
      e.stopPropagation();
    }
  };
  const _onTouchEnd = useCallback(!enableResponder ? undefined : (e: TouchEvent | MouseEvent) => {

    const target = targetRef.current;
    if (!target) return;

    const currentResponder = _currentResponder.get(window);
    if (!currentResponder) return;

    const {
      onResponderEnd,
      onResponderRelease,
    } = currentResponder;

    const wrapped = wrapPressEvent(e, currentResponder.target);

    if (_.isFunction(onResponderEnd)) onResponderEnd(wrapped);
    if (_.isEmpty(wrapped.targetTouches)) {
      if (_.isFunction(onResponderRelease)) onResponderRelease(wrapped);
      _currentResponder.delete(window);
    }
  });

  useEffect(() => {
    if (!_onTouchEnd) return;
    if ('TouchEvent' in window) {
      window.addEventListener('touchend', _onTouchEnd);
      return () => window.removeEventListener('touchend', _onTouchEnd);
    };
    if ('PointerEvent' in window) {
      window.addEventListener('pointerup', _onTouchEnd);
      return () => window.removeEventListener('pointerup', _onTouchEnd);
    };
    window.addEventListener('mouseup', _onTouchEnd);
    return () => window.removeEventListener('mouseup', _onTouchEnd);
  }, []);

  if ('TouchEvent' in window) return _.pickBy({
    onPointerEnter: _onHoverIn,
    onPointerLeave: _onHoverOut,
    onTouchStart: _onTouchStart,
    onTouchStartCapture: _onTouchStartCapture,
    onTouchMove: _onTouchMove,
    onTouchMoveCapture: _onTouchMoveCapture,
    onTouchEnd: _onTouchEnd,
    onTouchCancel: _onTouchEnd,
  }, v => !!v);

  if ('PointerEvent' in window) return _.pickBy({
    onPointerEnter: _onHoverIn,
    onPointerLeave: _onHoverOut,
    onPointerDown: _onTouchStart,
    onPointerDownCapture: _onTouchStartCapture,
    onPointerMove: _onTouchMove,
    onPointerMoveCapture: _onTouchMoveCapture,
    onPointerUp: _onTouchEnd,
    onPointerCancel: _onTouchEnd,
  }, v => !!v);

  return _.pickBy({
    onMouseEnter: _onHoverIn,
    onMouseLeave: _onHoverOut,
    onMouseDown: _onTouchStart,
    onMouseDownCapture: _onTouchStartCapture,
    onMouseMove: _onTouchMove,
    onMouseMoveCapture: _onTouchMoveCapture,
    onMouseUp: _onTouchEnd,
    onDragStart: _onTouchEnd,
  }, v => !!v);
};

//
//  pan.ts
//
//  The MIT License
//  Copyright (c) 2021 - 2026 O2ter Limited. All rights reserved.
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
import { useMemo, _useCallbacks } from 'frosty';
import { PressEvent, ViewEventProps } from '../../basic/types/events';

export type PanGestureEvent<Target> = PressEvent<Target> & {
  translationX: number;
  translationY: number;
  velocityX: number;
  velocityY: number;
};

export type PanGestureProps<Target> = {
  minimumPanDistance?: number;
  onPanStart?: (this: Target, event: PanGestureEvent<Target>) => void;
  onPanMove?: (this: Target, event: PanGestureEvent<Target>) => void;
  onPanEnd?: (this: Target, event: PanGestureEvent<Target>) => void;

  // Pan responder events
  onStartShouldSetPanResponder?: (this: Target, event: PressEvent<Target>) => boolean;
  onStartShouldSetPanResponderCapture?: (this: Target, event: PressEvent<Target>) => boolean;
  onMoveShouldSetPanResponder?: (this: Target, event: PressEvent<Target>) => boolean;
  onMoveShouldSetPanResponderCapture?: (this: Target, event: PressEvent<Target>) => boolean;
  onPanResponderGrant?: (this: Target, event: PressEvent<Target>) => void;
  onPanResponderReject?: (this: Target, event: PressEvent<Target>) => void;
  onPanResponderRelease?: (this: Target, event: PanGestureEvent<Target>) => void;
  onPanResponderTerminate?: (this: Target, event: PanGestureEvent<Target>) => void;
  onPanResponderTerminationRequest?: (this: Target, event: PressEvent<Target>) => boolean;
};

// Hook for handling pan gestures only
export const usePanResponder = <Target extends any = any>({
  // Pan gesture props
  minimumPanDistance = 10,
  onPanStart,
  onPanMove,
  onPanEnd,

  // Pan responder props
  onStartShouldSetPanResponder,
  onStartShouldSetPanResponderCapture,
  onMoveShouldSetPanResponder,
  onMoveShouldSetPanResponderCapture,
  onPanResponderGrant,
  onPanResponderReject,
  onPanResponderRelease,
  onPanResponderTerminate,
  onPanResponderTerminationRequest,
}: PanGestureProps<Target>): ViewEventProps<Target> => {

  // Internal state management for pan gestures
  const state = useMemo(() => ({
    isPanning: false,
    hasResponder: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastTimestamp: 0,
    velocityX: 0,
    velocityY: 0,
  }), []);

  // Helper function to create pan gesture events with translation and velocity data
  const createPanEvent = (
    event: PressEvent<Target>,
    translationX: number,
    translationY: number
  ): PanGestureEvent<Target> => ({
    ...event,
    translationX,
    translationY,
    velocityX: state.velocityX,
    velocityY: state.velocityY,
  });

  // Calculate velocity based on movement over time
  const updateVelocity = (currentX: number, currentY: number, timestamp: number) => {
    const timeDelta = timestamp - state.lastTimestamp;
    if (timeDelta > 0) {
      state.velocityX = (currentX - state.lastX) / timeDelta;
      state.velocityY = (currentY - state.lastY) / timeDelta;
    }
    state.lastX = currentX;
    state.lastY = currentY;
    state.lastTimestamp = timestamp;
  };

  // Helper function to handle pan gesture end
  const handlePanEnd = (
    context: Target,
    e: PressEvent<Target>,
    onResponderCallback?: (this: Target, event: PanGestureEvent<Target>) => void
  ) => {
    if (!state.isPanning || !_.isFunction(onPanEnd)) return;

    const translationX = e.pageX - state.startX;
    const translationY = e.pageY - state.startY;
    updateVelocity(e.pageX, e.pageY, e.timeStamp);
    const panEvent = createPanEvent(e, translationX, translationY);

    onPanEnd.call(context, panEvent);
    if (_.isFunction(onResponderCallback)) {
      onResponderCallback.call(context, panEvent);
    }
  };

  const hasPanHandlers = [
    onPanStart, onPanMove, onPanEnd,
    onStartShouldSetPanResponder, onStartShouldSetPanResponderCapture,
    onMoveShouldSetPanResponder, onMoveShouldSetPanResponderCapture,
    onPanResponderGrant, onPanResponderReject,
    onPanResponderRelease, onPanResponderTerminate, onPanResponderTerminationRequest
  ].some(_.isFunction);

  return _useCallbacks(hasPanHandlers ? {
    // ===== RESPONDER LIFECYCLE METHODS =====

    onStartShouldSetResponder: function (this: Target, e: PressEvent<Target>): boolean {
      return _.isFunction(onStartShouldSetPanResponder) ? onStartShouldSetPanResponder.call(this, e) : true;
    },

    onStartShouldSetResponderCapture: function (this: Target, e: PressEvent<Target>): boolean {
      return _.isFunction(onStartShouldSetPanResponderCapture) ? onStartShouldSetPanResponderCapture.call(this, e) : false;
    },

    onMoveShouldSetResponder: function (this: Target, e: PressEvent<Target>): boolean {
      if (_.isFunction(onMoveShouldSetPanResponder)) {
        return onMoveShouldSetPanResponder.call(this, e);
      }

      // Only claim responder on move if we have an active gesture
      if (!state.hasResponder) return false;

      const translationX = e.pageX - state.startX;
      const translationY = e.pageY - state.startY;
      const distance = Math.sqrt(translationX * translationX + translationY * translationY);
      return distance >= minimumPanDistance;
    },

    onMoveShouldSetResponderCapture: function (this: Target, e: PressEvent<Target>): boolean {
      if (_.isFunction(onMoveShouldSetPanResponderCapture)) {
        return onMoveShouldSetPanResponderCapture.call(this, e);
      }

      // Only allow capture if we already have an active gesture
      return state.hasResponder;
    },

    // ===== RESPONDER GRANT/REJECT =====

    onResponderGrant: function (this: Target, e: PressEvent<Target>) {
      if (_.isFunction(onPanResponderGrant)) {
        onPanResponderGrant.call(this, e);
      }

      // Initialize pan gesture state
      Object.assign(state, {
        hasResponder: true,
        startX: e.pageX,
        startY: e.pageY,
        lastX: e.pageX,
        lastY: e.pageY,
        lastTimestamp: e.timeStamp,
        velocityX: 0,
        velocityY: 0,
        isPanning: false,
      });
    },

    onResponderReject: function (this: Target, e: PressEvent<Target>) {
      if (_.isFunction(onPanResponderReject)) {
        onPanResponderReject.call(this, e);
      }
    },

    // ===== GESTURE MOVEMENT =====

    onResponderMove: function (this: Target, e: PressEvent<Target>) {
      // Only handle pan gesture logic if we have the responder
      if (!state.hasResponder) return;

      const translationX = e.pageX - state.startX;
      const translationY = e.pageY - state.startY;
      const distance = Math.sqrt(translationX * translationX + translationY * translationY);

      updateVelocity(e.pageX, e.pageY, e.timeStamp);

      // Check if pan should start
      if (!state.isPanning && distance >= minimumPanDistance) {
        state.isPanning = true;
        if (_.isFunction(onPanStart)) {
          onPanStart.call(this, createPanEvent(e, translationX, translationY));
        }
      }

      // Handle ongoing pan movement
      if (state.isPanning && _.isFunction(onPanMove)) {
        onPanMove.call(this, createPanEvent(e, translationX, translationY));
      }
    },

    // ===== GESTURE END =====

    onResponderRelease: function (this: Target, e: PressEvent<Target>) {
      handlePanEnd(this, e, onPanResponderRelease);

      // Reset all state
      state.isPanning = false;
      state.hasResponder = false;
    },

    onResponderTerminate: function (this: Target, e: PressEvent<Target>) {
      handlePanEnd(this, e, onPanResponderTerminate);

      // Reset all state
      state.isPanning = false;
      state.hasResponder = false;
    },

    onResponderTerminationRequest: function (this: Target, e: PressEvent<Target>): boolean {
      return _.isFunction(onPanResponderTerminationRequest) ? onPanResponderTerminationRequest.call(this, e) : !state.isPanning;
    },
  } : {});
};

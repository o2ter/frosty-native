//
//  gesture.ts
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
import { useMemo } from 'frosty';
import { PressEvent, ViewEventProps, PanGestureEvent } from '../basic/types/events';
import { uniqueId } from 'frosty/_native';
import { _useCallbacks } from '../../internal/hooks/callbacks';

export type PressGestureProps<Target> = {
  delayLongPress?: number;
  onLongPress?: (this: Target, event: PressEvent<Target>) => void;
  onPress?: (this: Target, event: PressEvent<Target>) => void;
  onPressIn?: (this: Target, event: PressEvent<Target>) => void;
  onPressOut?: (this: Target, event: PressEvent<Target>) => void;
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

type GestureResponderProps<Target> = ViewEventProps<Target> &
  PressGestureProps<Target> &
  PanGestureProps<Target>;

export const useGestureResponder = <Target extends any = any>({
  // Press gesture props
  delayLongPress,
  onLongPress,
  onPress,
  onPressIn,
  onPressOut,

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

  // Standard responder props
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
}: GestureResponderProps<Target>) => {

  // Internal state management
  const state = useMemo(() => ({
    // Press gesture state
    token: '',
    timeout: true,

    // Pan gesture state
    isPanning: false,
    hasResponder: false,
    gestureStarted: false,
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
  const calculateVelocity = (currentX: number, currentY: number, timestamp: number) => {
    const timeDelta = timestamp - state.lastTimestamp;
    if (timeDelta > 0) {
      const deltaX = currentX - state.lastX;
      const deltaY = currentY - state.lastY;
      state.velocityX = deltaX / timeDelta;
      state.velocityY = deltaY / timeDelta;
    }
    state.lastX = currentX;
    state.lastY = currentY;
    state.lastTimestamp = timestamp;
  };

  return _useCallbacks(_.pickBy({
    // ===== RESPONDER LIFECYCLE METHODS =====

    onStartShouldSetResponder: function (this: Target, e: PressEvent<Target>) {
      if (onStartShouldSetResponder) return onStartShouldSetResponder.call(this, e);

      // Check pan gesture responder first
      if (onStartShouldSetPanResponder) {
        return onStartShouldSetPanResponder.call(this, e);
      }

      // For any gesture (press or pan), claim responder on start
      const hasGestureHandlers = !!(
        onPress || onPressIn || onPressOut || onLongPress ||
        onPanStart || onPanMove || onPanEnd
      );
      return hasGestureHandlers;
    },

    onStartShouldSetResponderCapture: function (this: Target, e: PressEvent<Target>) {
      if (onStartShouldSetResponderCapture) return onStartShouldSetResponderCapture.call(this, e);
      if (onStartShouldSetPanResponderCapture) return onStartShouldSetPanResponderCapture.call(this, e);
      return false;
    },

    onMoveShouldSetResponder: function (this: Target, e: PressEvent<Target>) {
      if (onMoveShouldSetResponder) return onMoveShouldSetResponder.call(this, e);

      // Check pan responder first
      if (onMoveShouldSetPanResponder) {
        return onMoveShouldSetPanResponder.call(this, e);
      }

      // Only claim responder on move if we already started a gesture on this component
      // This prevents stealing responder from other components
      const hasPanHandlers = !!(onPanStart || onPanMove || onPanEnd);
      if (hasPanHandlers && state.gestureStarted && state.hasResponder) {
        const translationX = e.pageX - state.startX;
        const translationY = e.pageY - state.startY;
        const distance = Math.sqrt(translationX * translationX + translationY * translationY);
        return distance >= minimumPanDistance;
      }

      return false;
    },

    onMoveShouldSetResponderCapture: function (this: Target, e: PressEvent<Target>) {
      if (onMoveShouldSetResponderCapture) return onMoveShouldSetResponderCapture.call(this, e);
      if (onMoveShouldSetPanResponderCapture) return onMoveShouldSetPanResponderCapture.call(this, e);
      return false;
    },

    // ===== RESPONDER GRANT/REJECT =====

    onResponderGrant: function (this: Target, e: PressEvent<Target>) {
      if (onResponderGrant) onResponderGrant.call(this, e);

      // Check if this is for pan gesture and call pan responder grant
      const isPanResponder = !!(
        onPanStart || onPanMove || onPanEnd ||
        onStartShouldSetPanResponder || onMoveShouldSetPanResponder
      );
      if (isPanResponder && onPanResponderGrant) {
        onPanResponderGrant.call(this, e);
      }

      // Update responder state
      state.hasResponder = true;

      // Handle press gesture start
      if (onPressIn) onPressIn.call(this, e);

      // Setup press gesture long press timer
      const token = uniqueId();
      state.token = token;
      state.timeout = false;
      if (onLongPress) {
        setTimeout(() => {
          if (state.token !== token) return;
          onLongPress.call(this, e);
          state.timeout = true;
        }, delayLongPress || 500);
      }

      // Initialize pan gesture state
      state.startX = e.pageX;
      state.startY = e.pageY;
      state.lastX = e.pageX;
      state.lastY = e.pageY;
      state.lastTimestamp = e.timeStamp;
      state.velocityX = 0;
      state.velocityY = 0;
      state.isPanning = false;
      state.gestureStarted = true;
    },

    onResponderReject: function (this: Target, e: PressEvent<Target>) {
      if (onResponderReject) onResponderReject.call(this, e);
      if (onPanResponderReject) onPanResponderReject.call(this, e);
    },

    // ===== GESTURE MOVEMENT =====

    onResponderMove: function (this: Target, e: PressEvent<Target>) {
      if (onResponderMove) onResponderMove.call(this, e);

      // Handle pan gesture logic
      const hasPanHandlers = !!(onPanStart || onPanMove || onPanEnd);
      if (hasPanHandlers) {
        const translationX = e.pageX - state.startX;
        const translationY = e.pageY - state.startY;
        const distance = Math.sqrt(translationX * translationX + translationY * translationY);

        calculateVelocity(e.pageX, e.pageY, e.timeStamp);

        // Check if pan should start
        if (!state.isPanning && distance >= minimumPanDistance) {
          state.isPanning = true;
          if (onPanStart) {
            onPanStart.call(this, createPanEvent(e, translationX, translationY));
          }
        }

        // Handle ongoing pan movement
        if (state.isPanning && onPanMove) {
          onPanMove.call(this, createPanEvent(e, translationX, translationY));
        }
      }
    },

    // ===== GESTURE END =====

    onResponderRelease: function (this: Target, e: PressEvent<Target>) {
      if (onResponderRelease) onResponderRelease.call(this, e);

      // Handle pan gesture end
      if (state.isPanning && onPanEnd) {
        const translationX = e.pageX - state.startX;
        const translationY = e.pageY - state.startY;
        calculateVelocity(e.pageX, e.pageY, e.timeStamp);
        const panEvent = createPanEvent(e, translationX, translationY);

        onPanEnd.call(this, panEvent);

        if (onPanResponderRelease) {
          onPanResponderRelease.call(this, panEvent);
        }
      }

      // Handle press gesture end
      if (state.hasResponder && state.token !== '') {
        state.token = '';
        if (onPressOut) onPressOut.call(this, e);

        // Only trigger press if long press timeout hasn't occurred and no panning
        if (!state.timeout && onPress && !state.isPanning) {
          onPress.call(this, e);
        }
      }

      // Reset all state
      state.isPanning = false;
      state.hasResponder = false;
      state.gestureStarted = false;
    },

    onResponderTerminate: function (this: Target, e: PressEvent<Target>) {
      if (onResponderTerminate) onResponderTerminate.call(this, e);

      // Handle pan gesture termination
      if (state.isPanning && onPanEnd) {
        const translationX = e.pageX - state.startX;
        const translationY = e.pageY - state.startY;
        calculateVelocity(e.pageX, e.pageY, e.timeStamp);
        const panEvent = createPanEvent(e, translationX, translationY);

        onPanEnd.call(this, panEvent);

        if (onPanResponderTerminate) {
          onPanResponderTerminate.call(this, panEvent);
        }
      }

      // Handle press gesture cleanup
      if (state.hasResponder && state.token !== '') {
        state.token = '';
        if (onPressOut) onPressOut.call(this, e);
      }

      // Reset all state
      state.isPanning = false;
      state.hasResponder = false;
      state.gestureStarted = false;
    },

    onResponderTerminationRequest: function (this: Target, e: PressEvent<Target>) {
      if (onResponderTerminationRequest) return onResponderTerminationRequest.call(this, e);
      if (onPanResponderTerminationRequest) return onPanResponderTerminationRequest.call(this, e);

      // Default behavior: allow termination unless actively panning
      return !state.isPanning;
    },

    // ===== PASSTHROUGH HANDLERS =====

    onResponderStart,
    onResponderEnd,
  }, v => _.isFunction(v))) as ViewEventProps<Target>;
};

//
//  pan.ts
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
import { PressEvent, ViewEventProps, PanGestureEvent } from '../../../basic/types/events';
import { _useCallbacks } from '../../../../internal/hooks/callbacks';
import { PanResponderProps } from '../types';

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
}: PanResponderProps<Target>) => {

  // Internal state management for pan gestures
  const state = useMemo(() => ({
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

    onStartShouldSetResponder: function (this: Target, e: PressEvent<Target>): boolean {
      // Check pan gesture responder first
      if (onStartShouldSetPanResponder) {
        return onStartShouldSetPanResponder.call(this, e);
      }

      // For pan gestures, claim responder on start
      const hasPanHandlers = !!(onPanStart || onPanMove || onPanEnd);
      return hasPanHandlers;
    },

    onStartShouldSetResponderCapture: function (this: Target, e: PressEvent<Target>): boolean {
      if (onStartShouldSetPanResponderCapture) return onStartShouldSetPanResponderCapture.call(this, e);
      return false; // Default to false for capture phase
    },

    onMoveShouldSetResponder: function (this: Target, e: PressEvent<Target>): boolean {
      // Check pan responder first
      if (onMoveShouldSetPanResponder) {
        return onMoveShouldSetPanResponder.call(this, e);
      }

      // Only claim responder on move if we already started a gesture on this component
      const hasPanHandlers = !!(onPanStart || onPanMove || onPanEnd);
      if (hasPanHandlers && state.gestureStarted && state.hasResponder) {
        const translationX = e.pageX - state.startX;
        const translationY = e.pageY - state.startY;
        const distance = Math.sqrt(translationX * translationX + translationY * translationY);
        return distance >= minimumPanDistance;
      }

      return false;
    },

    onMoveShouldSetResponderCapture: function (this: Target, e: PressEvent<Target>): boolean {
      if (onMoveShouldSetPanResponderCapture) return onMoveShouldSetPanResponderCapture.call(this, e);
      return true; // Default to true for move capture phase
    },

    // ===== RESPONDER GRANT/REJECT =====

    onResponderGrant: function (this: Target, e: PressEvent<Target>): void {
      // Call pan responder grant if provided
      if (onPanResponderGrant) {
        onPanResponderGrant.call(this, e);
      }

      // Update responder state
      state.hasResponder = true;

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

    onResponderReject: function (this: Target, e: PressEvent<Target>): void {
      if (onPanResponderReject) onPanResponderReject.call(this, e);
    },

    // ===== GESTURE MOVEMENT =====

    onResponderMove: function (this: Target, e: PressEvent<Target>): void {
      // Only handle pan gesture logic if we have the responder AND a gesture was actually started
      if (!state.hasResponder || !state.gestureStarted) return;

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

    onResponderRelease: function (this: Target, e: PressEvent<Target>): void {
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

      // Reset all state
      state.isPanning = false;
      state.hasResponder = false;
      state.gestureStarted = false;
    },

    onResponderTerminate: function (this: Target, e: PressEvent<Target>): void {
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

      // Reset all state
      state.isPanning = false;
      state.hasResponder = false;
      state.gestureStarted = false;
    },

    onResponderTerminationRequest: function (this: Target, e: PressEvent<Target>): boolean {
      if (onPanResponderTerminationRequest) return onPanResponderTerminationRequest.call(this, e);

      // Default behavior: allow termination unless actively panning
      return !state.isPanning;
    },
  }, v => _.isFunction(v))) as ViewEventProps<Target>;
};

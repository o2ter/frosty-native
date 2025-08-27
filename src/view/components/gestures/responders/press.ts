//
//  press.ts
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
import { PressEvent, ViewEventProps } from '../../../basic/types/events';
import { uniqueId } from 'frosty/_native';
import { _useCallbacks } from '../../../../internal/hooks/callbacks';

export type PressGestureProps<Target> = {
  delayLongPress?: number;
  onLongPress?: (this: Target, event: PressEvent<Target>) => void;
  onPress?: (this: Target, event: PressEvent<Target>) => void;
  onPressIn?: (this: Target, event: PressEvent<Target>) => void;
  onPressOut?: (this: Target, event: PressEvent<Target>) => void;
};

// Hook for handling press gestures only
export const usePressResponder = <Target extends any = any>({
  // Press gesture props
  delayLongPress,
  onLongPress,
  onPress,
  onPressIn,
  onPressOut,
}: PressGestureProps<Target>): ViewEventProps<Target> => {

  // Internal state management for press gestures
  const state = useMemo(() => ({
    token: '',
    timeout: true,
  }), []);

  const hasPressHandlers = [onPress, onPressIn, onPressOut, onLongPress].some(_.isFunction);

  return _useCallbacks(hasPressHandlers ? {
    // ===== RESPONDER LIFECYCLE METHODS =====

    onStartShouldSetResponder: () => true,
    onStartShouldSetResponderCapture: () => false,
    onMoveShouldSetResponder: () => false,
    onMoveShouldSetResponderCapture: () => false,

    // ===== RESPONDER GRANT/REJECT =====

    onResponderGrant: function (this: Target, e: PressEvent<Target>): void {
      onPressIn?.call(this, e);

      // Setup long press timer
      const token = uniqueId();
      state.token = token;
      state.timeout = false;

      if (_.isFunction(onLongPress)) {
        setTimeout(() => {
          if (state.token === token) {
            onLongPress.call(this, e);
            state.timeout = true;
          }
        }, delayLongPress || 500);
      }
    },

    // ===== GESTURE END =====

    onResponderRelease: function (this: Target, e: PressEvent<Target>): void {
      if (!state.token) return;

      state.token = '';
      onPressOut?.call(this, e);

      // Only trigger press if long press timeout hasn't occurred
      if (!state.timeout) {
        onPress?.call(this, e);
      }
    },

    onResponderTerminate: function (this: Target, e: PressEvent<Target>): void {
      if (!state.token) return;

      state.token = '';
      onPressOut?.call(this, e);
    },

    onResponderTerminationRequest: () => true,
  } : {});
};

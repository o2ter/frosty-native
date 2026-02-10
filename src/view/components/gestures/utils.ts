//
//  utils.ts
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
import { ViewEventProps } from '../basic/types/events';

// Helper function to merge multiple responder handlers
export const mergeResponders = <Target>(...responders: ViewEventProps<Target>[]): ViewEventProps<Target> => {
  const merged: ViewEventProps<Target> = {};

  // Helper to combine boolean return functions (OR logic)
  const combineBooleanHandlers = (handlerName: keyof ViewEventProps<Target>) => {
    const handlers = responders
      .map(r => r[handlerName])
      .filter((h): h is (this: Target, event: any) => boolean => _.isFunction(h));

    if (handlers.length === 0) return undefined;

    return function (this: Target, event: any): boolean {
      return handlers.some(handler => handler.call(this, event));
    };
  };

  // Helper to combine void return functions (call all)
  const combineVoidHandlers = (handlerName: keyof ViewEventProps<Target>) => {
    const handlers = responders
      .map(r => r[handlerName])
      .filter((h): h is (this: Target, event: any) => void => _.isFunction(h));

    if (handlers.length === 0) return undefined;

    return function (this: Target, event: any): void {
      handlers.forEach(handler => handler.call(this, event));
    };
  };

  // Merge boolean return handlers (should-set responder methods)
  merged.onStartShouldSetResponder = combineBooleanHandlers('onStartShouldSetResponder');
  merged.onStartShouldSetResponderCapture = combineBooleanHandlers('onStartShouldSetResponderCapture');
  merged.onMoveShouldSetResponder = combineBooleanHandlers('onMoveShouldSetResponder');
  merged.onMoveShouldSetResponderCapture = combineBooleanHandlers('onMoveShouldSetResponderCapture');

  // For termination request, be more conservative - only allow if ALL handlers agree
  const terminationHandlers = responders
    .map(r => r.onResponderTerminationRequest)
    .filter((h): h is (this: Target, event: any) => boolean => _.isFunction(h));

  if (terminationHandlers.length > 0) {
    merged.onResponderTerminationRequest = function (this: Target, event: any): boolean {
      return terminationHandlers.every(handler => handler.call(this, event));
    };
  }

  // Merge void return handlers (lifecycle and event methods)
  merged.onResponderGrant = combineVoidHandlers('onResponderGrant');
  merged.onResponderReject = combineVoidHandlers('onResponderReject');
  merged.onResponderStart = combineVoidHandlers('onResponderStart');
  merged.onResponderMove = combineVoidHandlers('onResponderMove');
  merged.onResponderEnd = combineVoidHandlers('onResponderEnd');
  merged.onResponderRelease = combineVoidHandlers('onResponderRelease');
  merged.onResponderTerminate = combineVoidHandlers('onResponderTerminate');

  return merged;
};

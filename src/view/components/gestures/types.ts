//
//  types.ts
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

import { PressEvent, PanGestureEvent } from '../../basic/types/events';

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

// Type definitions for individual hooks
export type PressResponderProps<Target> = PressGestureProps<Target>;
export type PanResponderProps<Target> = PanGestureProps<Target>;

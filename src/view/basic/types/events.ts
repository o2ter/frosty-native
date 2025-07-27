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

export type LayoutEvent<Target> = {
  layout: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  timestamp: number;
  target: Target;
};

export type MouseEvent<Target> = {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  timestamp: number;
  target: Target;
};

export type PressEvent<Target> = {
  changedTouches: PressEvent<Target>[],
  identifier: number;
  locationX: number;
  locationY: number;
  pageX: number;
  pageY: number;
  timestamp: number;
  touches: PressEvent<Target>[],
  target: Target;
};

export type ViewEventProps<Target> = {
  delayLongPress?: number;
  onLayout?: (event: LayoutEvent<Target>) => void;
  onHoverIn?: (event: MouseEvent<Target>) => void;
  onHoverOut?: (event: MouseEvent<Target>) => void;
  onLongPress?: (event: PressEvent<Target>) => void;
  onPress?: (event: PressEvent<Target>) => void;
  onPressIn?: (event: PressEvent<Target>) => void;
  onPressOut?: (event: PressEvent<Target>) => void;
  onMoveShouldSetResponder?: (event: PressEvent<Target>) => boolean;
  onMoveShouldSetResponderCapture?: (event: PressEvent<Target>) => boolean;
  onResponderGrant?: (event: PressEvent<Target>) => void | boolean;
  onResponderMove?: (event: PressEvent<Target>) => void;
  onResponderReject?: (event: PressEvent<Target>) => void;
  onResponderRelease?: (event: PressEvent<Target>) => void;
  onResponderTerminate?: (event: PressEvent<Target>) => void;
  onResponderTerminationRequest?: (event: PressEvent<Target>) => void;
  onStartShouldSetResponder?: (event: PressEvent<Target>) => boolean;
  onStartShouldSetResponderCapture?: (event: PressEvent<Target>) => boolean;
}

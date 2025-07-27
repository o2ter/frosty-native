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

type LayoutEvent = {
  layout: {
    width: number,
    height: number,
    x: number,
    y: number,
  },
};

type MouseEvent = {

};

type PressEvent = {
  changedTouches: PressEvent[],
  identifier: number;
  locationX: number;
  locationY: number;
  pageX: number;
  pageY: number;
  target: number;
  timestamp: number;
  touches: PressEvent[],
};

export type ViewEventProps = {
  delayLongPress?: number;
  onLayout?: (event: { nativeEvent: LayoutEvent }) => void;
  onHoverIn?: (event: { nativeEvent: MouseEvent }) => void;
  onHoverOut?: (event: { nativeEvent: MouseEvent }) => void;
  onLongPress?: (event: { nativeEvent: PressEvent }) => void;
  onPress?: (event: { nativeEvent: PressEvent }) => void;
  onPressIn?: (event: { nativeEvent: PressEvent }) => void;
  onPressOut?: (event: { nativeEvent: PressEvent }) => void;
  onMoveShouldSetResponder?: (event: { nativeEvent: PressEvent }) => boolean;
  onMoveShouldSetResponderCapture?: (event: { nativeEvent: PressEvent }) => boolean;
  onResponderGrant?: (event: { nativeEvent: PressEvent }) => void | boolean;
  onResponderMove?: (event: { nativeEvent: PressEvent }) => void;
  onResponderReject?: (event: { nativeEvent: PressEvent }) => void;
  onResponderRelease?: (event: { nativeEvent: PressEvent }) => void;
  onResponderTerminate?: (event: { nativeEvent: PressEvent }) => void;
  onResponderTerminationRequest?: (event: { nativeEvent: PressEvent }) => void;
  onStartShouldSetResponder?: (event: { nativeEvent: PressEvent }) => boolean;
  onStartShouldSetResponderCapture?: (event: { nativeEvent: PressEvent }) => boolean;
}

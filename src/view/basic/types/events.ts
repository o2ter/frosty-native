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

export type Event<Target> = {
  _native: any;
  timeStamp: number;
  currentTarget: Target;
  target: any;
}

export type LayoutEvent<Target> = Event<Target> & {
  layout: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
};

export type MouseEvent<Target> = Event<Target> & {
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
};

export type Touch = {
  identifier?: number;
  force?: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  radiusX?: number;
  radiusY?: number;
  rotationAngle?: number;
  target: any;
};

export type PressEvent<Target> = Event<Target> & {
  locationX: number;
  locationY: number;
  pageX: number;
  pageY: number;
  touches: Touch[],
  targetTouches: Touch[],
  changedTouches: Touch[],
};

export type ViewEventProps<Target> = {
  disabled?: boolean;
  onLayout?: (this: Target, event: LayoutEvent<Target>) => void;
  onHoverIn?: (this: Target, event: MouseEvent<Target>) => void;
  onHoverOut?: (this: Target, event: MouseEvent<Target>) => void;
  onMoveShouldSetResponder?: (this: Target, event: PressEvent<Target>) => boolean;
  onMoveShouldSetResponderCapture?: (this: Target, event: PressEvent<Target>) => boolean;
  onResponderGrant?: (this: Target, event: PressEvent<Target>) => void;
  onResponderStart?: (this: Target, event: PressEvent<Target>) => void;
  onResponderMove?: (this: Target, event: PressEvent<Target>) => void;
  onResponderEnd?: (this: Target, event: PressEvent<Target>) => void;
  onResponderReject?: (this: Target, event: PressEvent<Target>) => void;
  onResponderRelease?: (this: Target, event: PressEvent<Target>) => void;
  onResponderTerminate?: (this: Target, event: PressEvent<Target>) => void;
  onResponderTerminationRequest?: (this: Target, event: PressEvent<Target>) => boolean;
  onStartShouldSetResponder?: (this: Target, event: PressEvent<Target>) => boolean;
  onStartShouldSetResponderCapture?: (this: Target, event: PressEvent<Target>) => boolean;
}

export type ScrollEventProps<Target> = {
  scrollEnabled?: boolean;
  directionalLockEnabled?: boolean;
  onContentSizeChange?: (this: Target, event: Event<Target>) => void;
  onMomentumScrollBegin?: (this: Target, event: Event<Target>) => void;
  onMomentumScrollEnd?: (this: Target, event: Event<Target>) => void;
  onScroll?: (this: Target, event: Event<Target> & {
    contentInset: { bottom: number; left: number; right: number; top: number; };
    contentOffset: { x: number; y: number; };
    contentSize: { height: number; width: number; };
    layoutMeasurement: { height: number; width: number; };
    zoomScale: number;
  }) => void;
  onScrollBeginDrag?: (this: Target, event: Event<Target>) => void;
  onScrollEndDrag?: (this: Target, event: Event<Target>) => void;
  onScrollToTop?: (this: Target, event: Event<Target>) => void;
}

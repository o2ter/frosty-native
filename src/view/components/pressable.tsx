//
//  pressable.ts
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
import { ComponentProps, ComponentRef, useMemo } from 'frosty';
import { PressEvent, ViewEventProps } from '../basic/types/events';
import { View } from '../basic';
import { uniqueId } from 'frosty/_native';
import { _useCallbacks } from '../../internal/hooks/callbacks';

type PressResponderProps<Target> = ViewEventProps<Target> & {
  delayLongPress?: number;
  onLongPress?: (this: Target, event: PressEvent<Target>) => void;
  onPress?: (this: Target, event: PressEvent<Target>) => void;
  onPressIn?: (this: Target, event: PressEvent<Target>) => void;
  onPressOut?: (this: Target, event: PressEvent<Target>) => void;
};

type PressableProps = ComponentProps<typeof View> & PressResponderProps<NonNullable<ComponentRef<typeof View>>>;

export const usePressResponder = <Target extends any = any>({
  delayLongPress,
  onLongPress,
  onPress,
  onPressIn,
  onPressOut,
  onResponderStart,
  onResponderRelease,
  onResponderTerminate,
}: PressResponderProps<Target>) => {

  const pressState = useMemo(() => ({
    token: '',
    timeout: true,
  }), []);

  function _onPressIn(this: Target, e: PressEvent<Target>) {
    if (onPressIn) onPressIn.call(this, e);
    const token = uniqueId();
    pressState.token = token;
    pressState.timeout = _.isNil(onLongPress);
    if (onLongPress) {
      setTimeout(() => {
        if (pressState.token !== token) return;
        onLongPress.call(this, e);
        pressState.timeout = true;
      }, delayLongPress || 500);
    } else if (onPress) {
      onPress.call(this, e);
    }
  };

  function _onPressOut(this: Target, e: PressEvent<Target>) {
    if (pressState.token === '') return;
    pressState.token = '';
    if (onPressOut) onPressOut.call(this, e);
    if (!pressState.timeout) {
      if (onPress) onPress.call(this, e);
    }
  };

  return _useCallbacks({
    onResponderStart: function (this: Target, e: PressEvent<Target>) {
      if (onResponderStart) onResponderStart.call(this, e);
      _onPressIn.call(this, e);
    },
    onResponderRelease: function (this: Target, e: PressEvent<Target>) {
      if (onResponderRelease) onResponderRelease.call(this, e);
      _onPressOut.call(this, e);
    },
    onResponderTerminate: function (this: Target, e: PressEvent<Target>) {
      if (onResponderTerminate) onResponderTerminate.call(this, e);
      _onPressOut.call(this, e);
    },
  });
};

export const Pressable = ({
  delayLongPress,
  onLongPress,
  onPress,
  onPressIn,
  onPressOut,
  onResponderStart,
  onResponderRelease,
  onResponderTerminate,
  children,
  ...props
}: PressableProps) => {

  const pressHandler = usePressResponder({
    delayLongPress,
    onLongPress,
    onPress,
    onPressIn,
    onPressOut,
    onResponderStart,
    onResponderRelease,
    onResponderTerminate,
  });

  return (
    <View
      {...pressHandler}
      {...props}>
      {children}
    </View>
  );
};

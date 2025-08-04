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
import { ComponentProps, ComponentRef, useRef } from 'frosty';
import { PressEvent, ViewEventProps } from '../basic/types/events';
import { View } from '../basic';
import { uniqueId } from 'frosty/_native';

type PressResponderProps<Target> = ViewEventProps<Target> & {
  delayLongPress?: number;
  onLongPress?: (event: PressEvent<Target>) => void;
  onPress?: (event: PressEvent<Target>) => void;
  onPressIn?: (event: PressEvent<Target>) => void;
  onPressOut?: (event: PressEvent<Target>) => void;
};

type PressableProps = ComponentProps<typeof View> & PressResponderProps<ComponentRef<typeof View>>;

export const PressResponder = {
  create: <Target extends any = any>({
    delayLongPress,
    onLongPress,
    onPress,
    onPressIn,
    onPressOut,
    onResponderGrant,
    onResponderRelease,
    onResponderTerminate,
  }: PressResponderProps<Target>) => {

    const pressState = {
      token: '',
      timeout: true,
    };

    const _onPressIn = (e: PressEvent<Target>) => {
      if (onPressIn) onPressIn(e);
      const token = uniqueId();
      pressState.token = token;
      pressState.timeout = _.isNil(onLongPress);
      if (onLongPress) {
        setTimeout(() => {
          if (pressState.token !== token) return;
          onLongPress(e);
          pressState.timeout = true;
        }, delayLongPress || 500);
      } else if (onPress) {
        onPress(e);
      }
    };

    const _onPressOut = (e: PressEvent<Target>) => {
      if (pressState.token === '') return;
      pressState.token = '';
      if (onPressOut) onPressOut(e);
      if (!pressState.timeout) {
        if (onPress) onPress(e);
      }
    };

    return {
      onResponderGrant: (e: PressEvent<Target>) => {
        if (onResponderGrant) onResponderGrant(e);
        _onPressIn(e);
      },
      onResponderRelease: (e: PressEvent<Target>) => {
        if (onResponderRelease) onResponderRelease(e);
        _onPressOut(e);
      },
      onResponderTerminate: (e: PressEvent<Target>) => {
        if (onResponderTerminate) onResponderTerminate(e);
        _onPressOut(e);
      },
    };
  }
};

export const Pressable = ({
  delayLongPress,
  onLongPress,
  onPress,
  onPressIn,
  onPressOut,
  onResponderGrant,
  onResponderRelease,
  onResponderTerminate,
  children,
  ...props
}: PressableProps) => {

  const pressHandler = useRef(() => PressResponder.create({
    delayLongPress,
    onLongPress,
    onPress,
    onPressIn,
    onPressOut,
    onResponderGrant,
    onResponderRelease,
    onResponderTerminate,
  }));

  return (
    <View
      {...pressHandler}
      {...props}>
      {children}
    </View>
  );
};

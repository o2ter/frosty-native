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

import { ComponentProps, ComponentRef, useRef } from 'frosty';
import { PressEvent } from '../basic/types/events';
import { View } from '../basic';
import { uniqueId } from 'lodash';

type PressableProps = ComponentProps<typeof View> & {
  delayLongPress?: number;
  onLongPress?: (event: PressEvent<ComponentRef<typeof View>>) => void;
  onPress?: (event: PressEvent<ComponentRef<typeof View>>) => void;
  onPressIn?: (event: PressEvent<ComponentRef<typeof View>>) => void;
  onPressOut?: (event: PressEvent<ComponentRef<typeof View>>) => void;
};

export const Pressable = ({
  delayLongPress = 500,
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

  const pressState = useRef({
    token: '',
    timeout: true,
  });

  const _onPressIn = (e: PressEvent<ComponentRef<typeof View>>) => {
    if (onPressIn) onPressIn(e);
    const token = uniqueId();
    pressState.current.token = token;
    pressState.current.timeout = _.isNil(onLongPress);
    if (onLongPress) {
      setTimeout(() => {
        if (pressState.current.token !== token) return;
        onLongPress(e);
        pressState.current.timeout = true;
      }, delayLongPress);
    } else if (onPress) {
      onPress(e);
    }
  };

  const _onPressOut = (e: PressEvent<ComponentRef<typeof View>>) => {
    if (pressState.current.token === '') return;
    pressState.current.token = '';
    if (onPressOut) onPressOut(e);
    if (!pressState.current.timeout) {
      if (onPress) onPress(e);
    }
  };

  return (
    <View
      onResponderGrant={(e) => {
        if (onResponderGrant) onResponderGrant(e);
        _onPressIn(e);
      }}
      onResponderRelease={(e) => {
        if (onResponderRelease) onResponderRelease(e);
        _onPressOut(e);
      }}
      onResponderTerminate={(e) => {
        if (onResponderTerminate) onResponderTerminate(e);
        _onPressOut(e);
      }}
      {...props}>
      {children}
    </View>
  );
};

//
//  app.tsx
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
import { useState, useEffect } from 'frosty';
import { Text, TextInput, useEnvironment, View, Image, Pressable } from '../../src/view';

import './app.scss';

export const App = () => {
  const env = useEnvironment();
  console.log(env);
  return (
    <View style={{
      width: '100%',
      height: '100%',
      flexDirection: 'row',
    }}>
      <View style={{
        flex: 1,
        backgroundColor: 'red',
      }}>
        <TextInput />
        <TextInput multiline />
      </View>
      <View
        onLayout={function (e) { console.log('onLayout', this, e) }}
        style={{
          flex: 1,
          backgroundColor: 'blue',
        }}>
        <Pressable
          onHoverIn={function (e) { console.log('onHoverIn', this, e) }}
          onHoverOut={function (e) { console.log('onHoverOut', this, e) }}
          onPressIn={function (e) { console.log('onPressIn', this, e) }}
          onPressOut={function (e) { console.log('onPressOut', this, e) }}
          onPress={function (e) { console.log('onPress', this, e) }}
        >
          <Text>Hello, <Text>World</Text></Text>
        </Pressable>
        <Text>Hello, <Text>World</Text></Text>
        <Image source="https://upload.wikimedia.org/wikipedia/commons/b/b6/SIPI_Jelly_Beans_4.1.07.tiff" />
        <Image source="https://upload.wikimedia.org/wikipedia/commons/b/b6/SIPI_Jelly_Beans_4.1.07.tiff" />
      </View>
    </View>
  );
};

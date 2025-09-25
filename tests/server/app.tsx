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
import { Image, Pressable, ScrollView, Text, TextInput, useEnvironment, usePanResponder, View } from '../../src/view';

import './app.scss';
import { useState } from 'frosty';

export const App = () => {
  const env = useEnvironment();
  console.log(env);
  const [value, setValue] = useState('');
  const panHandler = usePanResponder({
    onPanStart: (e) => {
      console.log('onPanStart', e);
    },
    onPanMove: (e) => {
      console.log('onPanMove', e);
    },
    onPanEnd: (e) => {
      console.log('onPanEnd', e);
    }
  });
  return (
    <View style={{
      width: '100%',
      gap: 8,
      padding: 8,
    }}>
      <Text>Check Text: <Text style={{ color: 'red' }}>Inner Text</Text></Text>
      <TextInput value={value} onChangeValue={setValue} style={{ backgroundColor: 'lime' }} />
      <TextInput value={value} onChangeValue={setValue} style={{ backgroundColor: 'yellow' }} multiline />
      <TextInput value={value} onChangeValue={setValue} disabled style={{ backgroundColor: 'lime' }} />
      <TextInput value={value} onChangeValue={setValue} disabled style={{ backgroundColor: 'yellow' }} multiline />
      <View style={{ flexDirection: 'row' }}>
        <ScrollView style={{ width: 200, height: 200 }}>
          <Image source='https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' />
        </ScrollView>
        <ScrollView vertical style={{ width: 200, height: 200 }}>
          <Image source='https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' />
        </ScrollView>
        <ScrollView horizontal style={{ width: 200, height: 200 }}>
          <Image source='https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' />
        </ScrollView>
        <ScrollView horizontal vertical style={{ width: 200, height: 200 }}>
          <Image source='https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' />
        </ScrollView>
      </View>
      <Pressable
        onPress={e => console.log('onPress', e)}
        onPressIn={e => console.log('onPressIn', e)}
        onPressOut={e => console.log('onPressOut', e)}
      >
        <Text>Pressable</Text>
      </Pressable>
      <View {...panHandler} style={{ backgroundColor: 'lightblue', width: 200, height: 200, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Pan here</Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <ScrollView style={{ width: 200, height: 200 }}>
          <Image style={{ width: 800, height: 600 }} source='https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' />
        </ScrollView>
        <ScrollView vertical style={{ width: 200, height: 200 }}>
          <Image style={{ width: 800, height: 600 }} source='https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' />
        </ScrollView>
        <ScrollView horizontal style={{ width: 200, height: 200 }}>
          <Image style={{ width: 800, height: 600 }} source='https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' />
        </ScrollView>
        <ScrollView horizontal vertical style={{ width: 200, height: 200 }}>
          <Image style={{ width: 800, height: 600 }} source='https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' />
        </ScrollView>
        <ScrollView
          horizontal
          vertical
          directionalLockEnabled
          style={{ width: 200, height: 200 }}
          onScroll={(e) => { console.log('onScroll', e) }}
          onScrollBeginDrag={(e) => { console.log('onScrollBeginDrag', e) }}
          onContentSizeChange={(e) => { console.log('onContentSizeChange', e) }}
          onScrollEndDrag={(e) => { console.log('onScrollEndDrag', e) }}
          onMomentumScrollBegin={(e) => { console.log('onMomentumScrollBegin', e) }}
          onMomentumScrollEnd={(e) => { console.log('onMomentumScrollEnd', e) }}
        >
          <Image style={{ width: 800, height: 600 }} source='https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' />
        </ScrollView>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: 200 }}>
          <Image source='https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' />
        </View>
        <View style={{ height: 200 }}>
          <Image source='https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' />
        </View>
        <View style={{ width: 200, flexDirection: 'row' }}>
          <Image source='https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' />
        </View>
        <View style={{ height: 200, flexDirection: 'row' }}>
          <Image source='https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png' />
        </View>
      </View>
      <View style={{ gap: 8, padding: 8, backgroundColor: 'purple', flexDirection: 'row' }}>
        <View style={{ width: 50, height: 50, backgroundColor: 'yellow' }} />
        <View style={{ width: 20, height: 20, backgroundColor: 'yellow' }} />
        <View style={{ width: 50, height: 50, backgroundColor: 'yellow' }} />
        <View style={{ width: 40, height: 40, backgroundColor: 'yellow' }} />
      </View>
      {_.map([
        'flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly'
      ] as const, x => (
        <>
          <Text>justifyContent {x}</Text>
          <View style={{ gap: 8, padding: 8, backgroundColor: 'purple', flexDirection: 'row', justifyContent: x }}>
            <View style={{ minWidth: 50, height: 50, backgroundColor: 'yellow' }} />
            <View style={{ minWidth: 20, height: 20, backgroundColor: 'yellow' }} />
            <View style={{ minWidth: 50, height: 50, backgroundColor: 'yellow' }} />
            <View style={{ minWidth: 40, height: 40, backgroundColor: 'yellow' }} />
          </View>
        </>
      ))}
      {_.map([
        'flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly'
      ] as const, x => (
        <>
          <Text>alignContent {x}</Text>
          <View style={{ gap: 8, padding: 8, backgroundColor: 'purple', flexDirection: 'row', alignContent: x, flexWrap: 'wrap', height: 200 }}>
            <View style={{ width: 50, height: 50, backgroundColor: 'yellow' }} />
            <View style={{ width: 20, height: 20, backgroundColor: 'yellow' }} />
            <View style={{ width: 50, height: 50, backgroundColor: 'yellow' }} />
            <View style={{ width: 40, height: 40, backgroundColor: 'yellow' }} />
          </View>
        </>
      ))}
      {_.map([
        'flex-start', 'flex-end', 'center', 'stretch', 'baseline'
      ] as const, x => (
        <>
          <Text>alignItems {x}</Text>
          <View style={{
            gap: 8, padding: 8, backgroundColor: 'purple', flexDirection: 'row', alignItems: x
          }}>
            <View style={{ width: 50, height: 50, backgroundColor: 'yellow' }} />
            <View style={{ width: 20, height: 20, backgroundColor: 'yellow' }} />
            <View style={{ width: 50, height: 50, backgroundColor: 'yellow' }} />
            <View style={{ width: 40, height: 40, backgroundColor: 'yellow' }} />
          </View>
        </>
      ))}
    </View>
  );
};

export default App;
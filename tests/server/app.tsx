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
import { Text, useEnvironment, View } from '../../src/view';

import './app.scss';

export const App = () => {
  const env = useEnvironment();
  console.log(env);
  return (
    <View style={{
      width: '100%',
      gap: 8,
      padding: 8,
    }}>
      <View style={{ gap: 8, padding: 8, backgroundColor: 'purple', flexDirection: 'row' }}>
        <View style={{ width: 50, height: 50, backgroundColor: 'yellow' }} />
        <View style={{ width: 50, height: 20, backgroundColor: 'yellow' }} />
        <View style={{ width: 50, height: 50, backgroundColor: 'yellow' }} />
        <View style={{ width: 50, height: 40, backgroundColor: 'yellow' }} />
      </View>
      {_.map([
        'flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly'
      ] as const, x => (
        <>
          <Text>justifyContent {x}</Text>
          <View style={{ gap: 8, padding: 8, backgroundColor: 'purple', flexDirection: 'row', justifyContent: x }}>
            <View style={{ width: 50, height: 50, backgroundColor: 'yellow' }} />
            <View style={{ width: 50, height: 20, backgroundColor: 'yellow' }} />
            <View style={{ width: 50, height: 50, backgroundColor: 'yellow' }} />
            <View style={{ width: 50, height: 40, backgroundColor: 'yellow' }} />
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
            <View style={{ width: 50, height: 20, backgroundColor: 'yellow' }} />
            <View style={{ width: 50, height: 50, backgroundColor: 'yellow' }} />
            <View style={{ width: 50, height: 40, backgroundColor: 'yellow' }} />
          </View>
        </>
      ))}
    </View>
  );
};

export default App;
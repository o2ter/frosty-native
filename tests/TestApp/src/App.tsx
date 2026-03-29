//
//  App.tsx
//
//  The MIT License
//  Copyright (c) 2021 - 2026 O2ter Limited. All rights reserved.
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
import { useState } from 'frosty';
import { Image, ScrollView, Text, TextInput, View } from '../../../src/main/index.native';

function Section({ title, children }: { title: string; children?: any }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 8 }}>{title}</Text>
      {children}
    </View>
  );
}

export default function App() {
  const [inputValue, setInputValue] = useState('Hello');

  return (
    <ScrollView style={{ width: '100%' }}>
      <View style={{ padding: 16, backgroundColor: '#f5f5f5' }}>

        {/* Section 1: Basic backgroundColor boxes */}
        <Section title="1. Background Colors">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ width: 48, height: 48, backgroundColor: 'red' }} />
            <View style={{ width: 48, height: 48, backgroundColor: 'green' }} />
            <View style={{ width: 48, height: 48, backgroundColor: 'blue' }} />
            <View style={{ width: 48, height: 48, backgroundColor: '#FF9900' }} />
            <View style={{ width: 48, height: 48, backgroundColor: '#9B59B6' }} />
          </View>
        </Section>

        {/* Section 2: flexDirection column (default) */}
        <Section title="2. flexDirection: column (default)">
          <View style={{ backgroundColor: '#ddd', padding: 8 }}>
            <View style={{ width: 64, height: 24, backgroundColor: 'red', marginBottom: 4 }} />
            <View style={{ width: 48, height: 24, backgroundColor: 'green', marginBottom: 4 }} />
            <View style={{ width: 80, height: 24, backgroundColor: 'blue' }} />
          </View>
        </Section>

        {/* Section 3: flexDirection row */}
        <Section title="3. flexDirection: row">
          <View style={{ flexDirection: 'row', backgroundColor: '#ddd', padding: 8 }}>
            <View style={{ width: 64, height: 48, backgroundColor: 'red', marginRight: 4 }} />
            <View style={{ width: 48, height: 48, backgroundColor: 'green', marginRight: 4 }} />
            <View style={{ width: 80, height: 48, backgroundColor: 'blue' }} />
          </View>
        </Section>

        {/* Section 4: gap */}
        <Section title="4. gap (row gap + column gap)">
          <Text style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>rowGap=8 (column)</Text>
          <View style={{ backgroundColor: '#ddd', padding: 8, rowGap: 8 }}>
            <View style={{ height: 24, backgroundColor: 'salmon' }} />
            <View style={{ height: 24, backgroundColor: 'steelblue' }} />
            <View style={{ height: 24, backgroundColor: 'gold' }} />
          </View>
          <Text style={{ fontSize: 12, color: '#777', marginBottom: 4, marginTop: 8 }}>columnGap=8 (row)</Text>
          <View style={{ flexDirection: 'row', backgroundColor: '#ddd', padding: 8, columnGap: 8 }}>
            <View style={{ width: 64, height: 48, backgroundColor: 'salmon' }} />
            <View style={{ width: 64, height: 48, backgroundColor: 'steelblue' }} />
            <View style={{ width: 64, height: 48, backgroundColor: 'gold' }} />
          </View>
        </Section>

        {/* Section 5: alignItems */}
        <Section title="5. alignItems (row)">
          <Text style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>flex-start</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#ddd', height: 64, marginBottom: 8 }}>
            <View style={{ width: 40, height: 20, backgroundColor: 'red' }} />
            <View style={{ width: 40, height: 40, backgroundColor: 'green' }} />
            <View style={{ width: 40, height: 30, backgroundColor: 'blue' }} />
          </View>
          <Text style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>center</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ddd', height: 64, marginBottom: 8 }}>
            <View style={{ width: 40, height: 20, backgroundColor: 'red' }} />
            <View style={{ width: 40, height: 40, backgroundColor: 'green' }} />
            <View style={{ width: 40, height: 30, backgroundColor: 'blue' }} />
          </View>
          <Text style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>flex-end</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#ddd', height: 64 }}>
            <View style={{ width: 40, height: 20, backgroundColor: 'red' }} />
            <View style={{ width: 40, height: 40, backgroundColor: 'green' }} />
            <View style={{ width: 40, height: 30, backgroundColor: 'blue' }} />
          </View>
        </Section>

        {/* Section 6: justifyContent */}
        <Section title="6. justifyContent (row)">
          <Text style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>flex-start</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', backgroundColor: '#ddd', marginBottom: 8 }}>
            <View style={{ width: 40, height: 32, backgroundColor: 'red' }} />
            <View style={{ width: 40, height: 32, backgroundColor: 'green' }} />
          </View>
          <Text style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>center</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', backgroundColor: '#ddd', marginBottom: 8 }}>
            <View style={{ width: 40, height: 32, backgroundColor: 'red' }} />
            <View style={{ width: 40, height: 32, backgroundColor: 'green' }} />
          </View>
          <Text style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>flex-end</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', backgroundColor: '#ddd', marginBottom: 8 }}>
            <View style={{ width: 40, height: 32, backgroundColor: 'red' }} />
            <View style={{ width: 40, height: 32, backgroundColor: 'green' }} />
          </View>
          <Text style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>space-between</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#ddd', marginBottom: 8 }}>
            <View style={{ width: 40, height: 32, backgroundColor: 'red' }} />
            <View style={{ width: 40, height: 32, backgroundColor: 'green' }} />
            <View style={{ width: 40, height: 32, backgroundColor: 'blue' }} />
          </View>
          <Text style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>space-evenly</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: '#ddd' }}>
            <View style={{ width: 40, height: 32, backgroundColor: 'red' }} />
            <View style={{ width: 40, height: 32, backgroundColor: 'green' }} />
            <View style={{ width: 40, height: 32, backgroundColor: 'blue' }} />
          </View>
        </Section>

        {/* Section 7: Borders & border radius */}
        <Section title="7. Borders and Border Radius">
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <View style={{ width: 64, height: 64, borderWidth: 2, borderColor: 'black' }} />
            <View style={{ width: 64, height: 64, borderWidth: 2, borderColor: 'red', borderRadius: 8 }} />
            <View style={{ width: 64, height: 64, borderWidth: 2, borderColor: 'blue', borderRadius: 32 }} />
            <View style={{ width: 64, height: 64, backgroundColor: 'coral', borderTopLeftRadius: 16, borderBottomRightRadius: 16 }} />
            <View style={{ width: 64, height: 64, borderTopWidth: 4, borderTopColor: 'red', borderBottomWidth: 2, borderBottomColor: 'blue' }} />
          </View>
        </Section>

        {/* Section 8: Opacity */}
        <Section title="8. Opacity">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ width: 48, height: 48, backgroundColor: 'red', opacity: 1 }} />
            <View style={{ width: 48, height: 48, backgroundColor: 'red', opacity: 0.7 }} />
            <View style={{ width: 48, height: 48, backgroundColor: 'red', opacity: 0.4 }} />
            <View style={{ width: 48, height: 48, backgroundColor: 'red', opacity: 0.1 }} />
          </View>
        </Section>

        {/* Section 9: Text styles */}
        <Section title="9. Text Styles">
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333' }}>Bold 20px</Text>
          <Text style={{ fontSize: 14, fontStyle: 'italic', color: 'steelblue' }}>Italic 14px</Text>
          <Text style={{ fontSize: 16, color: 'purple', textDecorationLine: 'underline' }}>Underline</Text>
          <Text style={{ fontSize: 16, color: 'crimson', textDecorationLine: 'line-through' }}>Strikethrough</Text>
          <Text style={{ fontSize: 14 }}>
            Normal <Text style={{ color: 'red' }}>Red inline</Text> text
          </Text>
          <Text style={{ fontSize: 14, letterSpacing: 3 }}>Letter spacing 3</Text>
          <Text style={{ fontSize: 14, textTransform: 'uppercase' }}>uppercase transform</Text>
        </Section>

        {/* Section 10: Padding & margin */}
        <Section title="10. Padding and Margin">
          <View style={{ backgroundColor: '#ccc' }}>
            <View style={{ backgroundColor: 'steelblue', padding: 16, margin: 8 }}>
              <Text style={{ color: 'white' }}>padding:16, margin:8</Text>
            </View>
          </View>
        </Section>

        {/* Section 11: Vertical ScrollView */}
        <Section title="11. Vertical ScrollView (height:120)">
          <ScrollView style={{ height: 120, backgroundColor: '#e0e0e0' }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <View key={i} style={{ height: 40, backgroundColor: i % 2 === 0 ? 'steelblue' : 'coral', justifyContent: 'center', paddingLeft: 8 }}>
                <Text style={{ color: 'white' }}>Row {i}</Text>
              </View>
            ))}
          </ScrollView>
        </Section>

        {/* Section 12: Horizontal ScrollView */}
        <Section title="12. Horizontal ScrollView (width:200)">
          <ScrollView horizontal style={{ width: 200, height: 64, backgroundColor: '#e0e0e0' }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <View key={i} style={{ width: 60, height: 64, backgroundColor: i % 2 === 0 ? 'steelblue' : 'coral', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'white' }}>Col {i}</Text>
              </View>
            ))}
          </ScrollView>
        </Section>

        {/* Section 13: TextInput */}
        <Section title="13. TextInput">
          <TextInput
            value={inputValue}
            onChangeValue={setInputValue}
            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#aaa', padding: 8, marginBottom: 8 }}
          />
          <Text style={{ fontSize: 12, color: '#555' }}>Value: {inputValue}</Text>
        </Section>

        {/* Section 14: Image */}
        <Section title="14. Image">
          <Image
            source="https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/220px-PNG_transparency_demonstration_1.png"
            style={{ width: 120, height: 90, backgroundColor: '#e0e0e0' }}
          />
        </Section>

        {/* Section 15: Nested views */}
        <Section title="15. Nested Views">
          <View style={{ backgroundColor: '#3498db', padding: 12 }}>
            <Text style={{ color: 'white', fontWeight: 'bold', marginBottom: 8 }}>Outer blue</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1, backgroundColor: '#2ecc71', padding: 8, borderRadius: 4 }}>
                <Text style={{ color: 'white' }}>Left</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#e74c3c', padding: 8, borderRadius: 4 }}>
                <Text style={{ color: 'white' }}>Right</Text>
              </View>
            </View>
          </View>
        </Section>

        {/* Advanced: justifyContent variants */}
        <Section title="Advanced: justifyContent variants">
          {_.map(['flex-start', 'flex-end', 'center', 'stretch', 'space-between', 'space-around', 'space-evenly'] as const, (x) => (
            <View key={x} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{x}</Text>
              <View style={{ gap: 4, padding: 4, backgroundColor: 'purple', flexDirection: 'row', justifyContent: x }}>
                <View style={{ minWidth: 40, height: 32, backgroundColor: 'yellow' }} />
                <View style={{ minWidth: 20, height: 20, backgroundColor: 'yellow' }} />
                <View style={{ minWidth: 40, height: 32, backgroundColor: 'yellow' }} />
              </View>
            </View>
          ))}
        </Section>

        {/* Advanced: alignItems variants (row) */}
        <Section title="Advanced: alignItems variants (row)">
          {_.map(['flex-start', 'flex-end', 'center', 'stretch', 'baseline'] as const, (x) => (
            <View key={x} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{x}</Text>
              <View style={{ gap: 4, padding: 4, backgroundColor: 'purple', flexDirection: 'row', alignItems: x }}>
                <View style={{ width: 40, height: 40, backgroundColor: 'yellow' }} />
                <View style={{ width: 20, height: 20, backgroundColor: 'yellow' }} />
                <View style={{ width: 40, height: 40, backgroundColor: 'yellow' }} />
              </View>
            </View>
          ))}
        </Section>

      </View>
    </ScrollView>
  );
}

//
//  text.tsx
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
import { ComponentRef, ComponentType, createPairs, mergeRefs, useRef, useRefHandle, useStack } from 'frosty';
import { _createNativeElement } from 'frosty/_native';
import { NativeModules } from '../../../global';
import { NativeNode } from './node';
import { TextViewProps } from '../types/text';
import { useTextStyle } from '../../components/textStyle';
import { TextStyle } from '../../style/types';
import { useNativeStyle } from './style';

const Pairs = createPairs({ allowTextChildren: true });

class FTTextView extends NativeNode {

  _native = NativeModules['FTTextView']();
  #props: Record<string, any> = {};
  #children: (string | FTTextView)[] = [];

  update(props: Record<string, any>): void {
    this._native.update(props);
    this.#props = props;
  }

  replaceChildren(children: (string | NativeNode)[]): void {
    const _children = _.filter(children, x => _.isNumber(x) || _.isString(x) || x instanceof FTTextView);
    this.#children = _children.map(x => _.isNumber(x) ? String(x) : x);
  }
}

export const Text: ComponentType<TextViewProps> = ({ ref, style, maxFontSizeMultiplier, minimumFontScale, numberOfLines, children }) => {

  const nativeRef = useRef<ComponentRef<typeof Text>>();
  useRefHandle(mergeRefs(nativeRef, ref), () => ({
  }), null);

  const isInnerText = _.some(useStack(), (item) => item.type === Text);

  return (
    <Pairs.Child>
      {_createNativeElement(FTTextView, {
        style: useNativeStyle([
          !isInnerText && useTextStyle() as TextStyle,
          style,
        ]),
        children: (
          <Pairs.Parent>{children}</Pairs.Parent>
        ),
      })}
    </Pairs.Child>
  );
};

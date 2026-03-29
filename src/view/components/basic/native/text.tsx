//
//  text.tsx
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
import { ComponentRef, ComponentType, createPairs, mergeRefs, useRef, useRefHandle, useStack } from 'frosty';
import { _createNativeElement } from 'frosty/_native';
import { NativeModules } from './modules';
import { NativeNode } from './node';
import { TextViewProps } from '../types/text';
import { useTextStyle } from '../../textStyle';
import { TextStyle } from '../types/styles';
import { useNativeStyle } from './style';
import { useResponderEvents } from './events';

const Pairs = createPairs({ allowTextChildren: true });

type StyledText = string | {
  style: Record<string, any>;
  children: StyledText[];
};

const createStyledText = (text: string | number | FTTextView): StyledText => {
  if (_.isString(text)) return text;
  if (_.isNumber(text)) return String(text);
  if (text instanceof FTTextView) {
    const { _props: props, _children: children } = text;
    return {
      style: props.style,
      children: children.map(x => createStyledText(x)),
    };
  }
  return '';
};

class FTTextView extends NativeNode {

  _native = NativeModules['FTTextView']();
  _props: Record<string, any> = {};
  _children: (string | FTTextView)[] = [];

  update(props: Record<string, any>, children: (string | NativeNode)[]): void {
    const _children = _.filter(children, x => _.isNumber(x) || _.isString(x) || x instanceof FTTextView);
    this._props = props;
    this._children = _children.map(x => _.isNumber(x) ? String(x) : x);
    this._native.update({
      style: props.style,
      text: {
        style: props.style,
        children: _children.map(x => createStyledText(x)),
      }
    }, []);
  }
}

export const Text: ComponentType<TextViewProps> = ({ ref, style, maxFontSizeMultiplier, minimumFontScale, numberOfLines, children, ...props }) => {

  const handleRef = useRef<ComponentRef<typeof Text>>();
  useRefHandle(mergeRefs(handleRef, ref), () => ({
  }), null);

  const isInnerText = _.some(useStack(), (item) => item.type === Text);

  const _style = useNativeStyle([
    !isInnerText && useTextStyle() as TextStyle,
    style,
  ]);

  return (
    <Pairs.Child>
      {_createNativeElement(FTTextView, {
        style: _style,
        children: (
          <Pairs.Parent>{children}</Pairs.Parent>
        ),
        ...useResponderEvents(props, handleRef)
      })}
    </Pairs.Child>
  );
};

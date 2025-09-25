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
import { ComponentRef, ComponentType, createElement, createPairs, mergeRefs, useRef, useRefHandle, useStack } from 'frosty';
import { TextViewProps } from '../types/text';
import { useTextStyle } from '../../components/textStyle';
import { encodeTextStyle } from './css';
import { useFlattenStyle } from '../../../view/style/utils';
import { TextStyle } from '../../../view/style/types';
import { useResponderEvents } from './events';

const Pairs = createPairs({ allowTextChildren: true });

export const Text: ComponentType<TextViewProps> = ({ id, ref, style, maxFontSizeMultiplier, minimumFontScale, numberOfLines, tabIndex, children, ...props }) => {

  const targetRef = useRef<HTMLElement | null>();
  const nativeRef = useRef<ComponentRef<typeof Text>>();
  useRefHandle(mergeRefs(nativeRef, ref), () => ({
    get _native() { return targetRef.current || undefined; }
  }), null);

  const isInnerText = _.some(useStack(), (item) => item.type === Text);

  const cssStyle = encodeTextStyle(useFlattenStyle([
    !isInnerText && {
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: 'black',
      boxSizing: 'border-box',
      color: 'black',
      display: 'inline',
      fontFamily: 'sans-serif',
      fontSize: 14,
      margin: 0,
      padding: 0,
      position: 'relative',
      textAlign: 'start',
      textDecorationLine: 'none',
    },
    !isInnerText && useTextStyle() as TextStyle,
    style,
  ]));

  return (
    <Pairs.Child>
      {createElement(isInnerText ? 'span' : 'div', {
        id,
        ref: targetRef,
        style: [
          !isInnerText && {
            listStyle: 'none',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          },
          cssStyle,
        ],
        tabIndex,
        ...useResponderEvents(props, nativeRef, targetRef),
      }, (
        <Pairs.Parent>{children}</Pairs.Parent>
      ))}
    </Pairs.Child>
  );
};

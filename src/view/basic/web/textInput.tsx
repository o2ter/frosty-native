//
//  textInput.tsx
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
import { ComponentType, mergeRefs, useRef, useRefHandle } from 'frosty';
import { _createNativeElement } from 'frosty/_native';
import { type _DOMRenderer } from 'frosty/web';
import { TextInputProps } from '../../types';
import { useTextStyle } from '../../components';
import { encodeTextStyle } from './css';
import { useFlattenStyle } from '../../../view/style/utils';
import { TextStyle } from '../../../view/style/types';

export const TextInput: ComponentType<TextInputProps> = ({ ref, style, multiline }) => {

  const targetRef = useRef<HTMLElement | null>();
  useRefHandle(ref, () => ({
    get _target() { return targetRef.current || undefined; }
  }), null);

  const cssStyle = encodeTextStyle(useFlattenStyle([
    {
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: 'black',
      borderRadius: 0,
      boxSizing: 'border-box',
      fontFamily: 'System',
      fontSize: 14,
      margin: 0,
      padding: 0,
    },
    useTextStyle() as TextStyle,
    style,
  ]));

  if (multiline) {
    return (
      <textarea
        ref={mergeRefs(targetRef)}
        style={[
          {
            listStyle: 'none',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            resize: 'none',
          },
          cssStyle,
        ]}
      />
    );
  }

  return (
    <input
      ref={mergeRefs(targetRef)}
      style={[
        {
          listStyle: 'none',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          resize: 'none',
        },
        cssStyle,
      ]}
    />
  );
};

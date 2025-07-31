//
//  types.ts
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

import { Ref, StyleProp } from 'frosty';
import { TextStyle } from '../../style/types';
import { ViewEventProps } from './events';

type TextInputRef = {
  readonly _target?: HTMLElement;
};

type TextInputChangeEvent<Value> = {
  value: Value;
  timestamp: number;
  currentTarget: TextInputRef;
  target: any;
};

type _TextInputProps<Value> = {
  value?: Value;
  onChange?: (event: TextInputChangeEvent<Value>) => void;
  onChangeValue?: (value: Value) => void;
};

type AttributedString = string & {
  attributes: {
    range: [number, number];
    format: Record<string, any>;
  }[];
};

type SimpleTextInputProps = _TextInputProps<string> & {
  formatted?: false;
};

type FormattedTextInputProps = _TextInputProps<AttributedString> & {
  formatted: true;
};

export type TextInputProps = ViewEventProps<TextInputRef> & {
  ref?: Ref<TextInputRef | null | undefined>;
  style?: StyleProp<TextStyle>;
  multiline?: boolean;
} & (SimpleTextInputProps | FormattedTextInputProps);

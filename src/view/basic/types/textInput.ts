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
import { Event, ViewEventProps } from './events';
import { ScrollBaseProps } from './scrollView';

type TextInputRef = {
  readonly _native?: HTMLElement;
  focus(): void;
  blur(): void;
};

type TextInputChangeEvent = Event<TextInputRef> & {
  value: string;
};

export type TextInputProps = ViewEventProps<TextInputRef> & ScrollBaseProps<TextInputRef> & {
  ref?: Ref<TextInputRef | null | undefined>;
  style?: StyleProp<TextStyle>;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  maxFontSizeMultiplier?: number;
  minimumFontScale?: number;
  maxLength?: number;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  autofocus?: boolean;
  onChange?: (this: TextInputRef, event: TextInputChangeEvent) => void;
  onChangeValue?: (this: TextInputRef, string: string) => void;
  onBlur?: (this: TextInputRef, event: Event<TextInputRef>) => void;
  onFocus?: (this: TextInputRef, event: Event<TextInputRef>) => void;
  onEndEditing?: (this: TextInputRef, event: Event<TextInputRef>) => void;
  onSubmitEditing?: (this: TextInputRef, event: Event<TextInputRef>) => void;
  onSelectionChange?: (this: TextInputRef, event: Event<TextInputRef> & { selection?: { start: number; end: number; } }) => void;
};

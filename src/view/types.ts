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

import { PropsWithChildren, Ref, StyleProp } from 'frosty';
import { ImageStyle, TextStyle, ViewStyle } from './style/types';

type ScrollDirection = 'horizontal' | 'vertical';

type ScrollViewRef = {
  readonly _target?: HTMLElement;
};

export type ScrollViewProps = PropsWithChildren<{
  ref?: Ref<ScrollViewRef>;
  direction?: ScrollDirection | ScrollDirection[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

interface ImageURISource {
  uri: string;
  method?: string;
  headers?: { [key: string]: string };
  body?: string;
  width?: number;
  height?: number;
  scale?: number;
}

type ImageSource = string | ImageURISource;

type ImageRef = {
  readonly _target?: HTMLElement;
};

export type ImageProps = PropsWithChildren<{
  ref?: Ref<ImageRef>;
  source?: ImageSource;
  style?: StyleProp<ImageStyle>;
}>;

type TextViewRef = {
  readonly _target?: HTMLElement;
};

export type TextViewProps = PropsWithChildren<{
  ref?: Ref<TextViewRef>;
  style?: StyleProp<TextStyle>;
}>;

type TextInputRef = {
  readonly _target?: HTMLElement;
};

export type TextInputProps = PropsWithChildren<{
  ref?: Ref<TextInputRef>;
  style?: StyleProp<TextStyle>;
  multiline?: boolean;
}>;

type ViewRef = {
  readonly _target?: HTMLElement;
};

export type ViewProps = PropsWithChildren<{
  ref?: Ref<ViewRef>;
  style?: StyleProp<ViewStyle>;
}>;

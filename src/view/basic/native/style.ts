//
//  style.ts
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
import { StyleProp } from 'frosty';
import { ImageStyle, TextStyle, ViewStyle } from '../../style/types';
import { compactValue, useFlattenStyle } from './../../style/utils';
import { normalizeColor, toHexString } from '../../../internal/color';

const _normalizeColor = (color: any): string | undefined => {
  if (!_.isString(color)) return;
  const normalized = normalizeColor(color);
  return normalized ? toHexString(normalized) : undefined;
}

export const useNormalizedStyle = <S extends ViewStyle | TextStyle | ImageStyle>(
  style: StyleProp<S>
) => {
  const {
    boxShadow,
    filter,
    backgroundColor,
    outlineColor,
    color,
    textDecorationColor,
    textShadowColor,
    overlayColor,
    tintColor,
    ..._style
  } = useFlattenStyle(style) as any;
  return compactValue({
    ..._style,
    boxShadow: boxShadow && _.map(_.castArray(boxShadow), x => compactValue({
      ...x,
      color: _normalizeColor(x.color),
    })),
    filter: filter && _.map(_.castArray(filter), x => x.dropShadow ? {
      dropShadow: compactValue({
        ...x.dropShadow,
        color: _normalizeColor(x.dropShadow.color),
      }),
    } : x),
    backgroundColor: _normalizeColor(backgroundColor),
    outlineColor: _normalizeColor(outlineColor),
    color: _normalizeColor(color),
    textDecorationColor: _normalizeColor(textDecorationColor),
    textShadowColor: _normalizeColor(textShadowColor),
    overlayColor: _normalizeColor(overlayColor),
    tintColor: _normalizeColor(tintColor),
  }) as S;
}

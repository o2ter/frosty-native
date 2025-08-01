//
//  utils.ts
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
import { ImageStyle, TextStyle, ViewStyle } from './types';
import { useEnvironment } from '../components/environment';

const normalize = <S extends ViewStyle>(
  style: S,
  dir: 'ltr' | 'rtl'
) => {
  const {
    gap,
    rowGap = gap,
    columnGap = gap,
    inset,
    top = inset,
    start = inset,
    end = inset,
    left = dir === 'ltr' ? start : end,
    right = dir === 'ltr' ? end : start,
    bottom = inset,
    flex,
    flexGrow = _.isNumber(flex) ? flex : flex === 'auto' ? 1 : 0,
    flexShrink = flex === 'none' ? 0 : 1,
    flexBasis = _.isNumber(flex) ? 0 : 'auto',
    margin,
    marginHorizontal = margin,
    marginVertical = margin,
    marginTop = marginVertical,
    marginBottom = marginVertical,
    marginStart = marginHorizontal,
    marginEnd = marginHorizontal,
    marginLeft = dir === 'ltr' ? marginStart : marginEnd,
    marginRight = dir === 'ltr' ? marginEnd : marginStart,
    padding,
    paddingHorizontal = padding,
    paddingVertical = padding,
    paddingTop = paddingVertical,
    paddingBottom = paddingVertical,
    paddingStart = paddingHorizontal,
    paddingEnd = paddingHorizontal,
    paddingLeft = dir === 'ltr' ? paddingStart : paddingEnd,
    paddingRight = dir === 'ltr' ? paddingEnd : paddingStart,
    borderColor,
    borderTopColor = borderColor,
    borderBottomColor = borderColor,
    borderStartColor = borderColor,
    borderEndColor = borderColor,
    borderLeftColor = dir === 'ltr' ? borderStartColor : borderEndColor,
    borderRightColor = dir === 'ltr' ? borderEndColor : borderStartColor,
    borderWidth,
    borderTopWidth = borderWidth,
    borderBottomWidth = borderWidth,
    borderStartWidth = borderWidth,
    borderEndWidth = borderWidth,
    borderLeftWidth = dir === 'ltr' ? borderStartWidth : borderEndWidth,
    borderRightWidth = dir === 'ltr' ? borderEndWidth : borderStartWidth,
    borderRadius,
    borderTopStartRadius = borderRadius,
    borderTopEndRadius = borderRadius,
    borderTopLeftRadius = dir === 'ltr' ? borderTopStartRadius : borderTopEndRadius,
    borderTopRightRadius = dir === 'ltr' ? borderTopEndRadius : borderTopStartRadius,
    borderBottomStartRadius = borderRadius,
    borderBottomEndRadius = borderRadius,
    borderBottomLeftRadius = dir === 'ltr' ? borderBottomStartRadius : borderBottomEndRadius,
    borderBottomRightRadius = dir === 'ltr' ? borderBottomEndRadius : borderBottomStartRadius,
    ..._style
  } = style;
  return {
    ..._style,
    ..._.isNil(flexGrow) ? {} : { flexGrow },
    ..._.isNil(flexShrink) ? {} : { flexShrink },
    ..._.isNil(flexBasis) ? {} : { flexBasis },
    ..._.isNil(rowGap) ? {} : { rowGap },
    ..._.isNil(columnGap) ? {} : { columnGap },
    ..._.isNil(top) ? {} : { top },
    ..._.isNil(bottom) ? {} : { bottom },
    ..._.isNil(left) ? {} : { left },
    ..._.isNil(right) ? {} : { right },
    ..._.isNil(marginTop) ? {} : { marginTop },
    ..._.isNil(marginBottom) ? {} : { marginBottom },
    ..._.isNil(marginLeft) ? {} : { marginLeft },
    ..._.isNil(marginRight) ? {} : { marginRight },
    ..._.isNil(paddingTop) ? {} : { paddingTop },
    ..._.isNil(paddingBottom) ? {} : { paddingBottom },
    ..._.isNil(paddingLeft) ? {} : { paddingLeft },
    ..._.isNil(paddingRight) ? {} : { paddingRight },
    ..._.isNil(borderTopColor) ? {} : { borderTopColor },
    ..._.isNil(borderBottomColor) ? {} : { borderBottomColor },
    ..._.isNil(borderLeftColor) ? {} : { borderLeftColor },
    ..._.isNil(borderRightColor) ? {} : { borderRightColor },
    ..._.isNil(borderTopWidth) ? {} : { borderTopWidth },
    ..._.isNil(borderBottomWidth) ? {} : { borderBottomWidth },
    ..._.isNil(borderLeftWidth) ? {} : { borderLeftWidth },
    ..._.isNil(borderRightWidth) ? {} : { borderRightWidth },
    ..._.isNil(borderTopLeftRadius) ? {} : { borderTopLeftRadius },
    ..._.isNil(borderBottomLeftRadius) ? {} : { borderBottomLeftRadius },
    ..._.isNil(borderTopRightRadius) ? {} : { borderTopRightRadius },
    ..._.isNil(borderBottomRightRadius) ? {} : { borderBottomRightRadius },
  };
}

const flattenStyle = <S extends ViewStyle>(
  style: StyleProp<S>,
  dir: 'ltr' | 'rtl'
): Partial<ReturnType<typeof normalize<S>>> => {
  if (!style) return {};
  if (!_.isArray(style)) return normalize(style, dir);
  return _.reduce(style, (acc, item) => ({
    ...acc,
    ...flattenStyle(item, dir),
  }), {});
}

export const useFlattenStyle = <S extends ViewStyle | TextStyle | ImageStyle>(
  style: StyleProp<S>
) => {
  const { layoutDirection: dir } = useEnvironment();
  return flattenStyle(style, dir);
}

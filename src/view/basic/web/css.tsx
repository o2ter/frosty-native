//
//  css.tsx
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
import { ExtendedCSSProperties } from 'frosty';
import { BoxShadowValue, FilterFunction, ImageStyle, TextStyle, TransformFunction, ViewStyle } from '../../style/types';
import { useFlattenStyle } from '../../style/utils';

const encodeTransform = (value: TransformFunction | TransformFunction[]): string | undefined => {
  if (_.isArray(value)) return _.compact(_.map(value, x => encodeTransform(x))).join(' ');
  return;
}

const encodeTransformOrigin = (value: Array<string | number> | string | number): string => {
  if (_.isArray(value)) return _.map(value, x => encodeTransformOrigin(x)).join(' ');
  return value && _.isNumber(value) ? `${value}px` : `${value}`;
}

const encodeFilter = (value: FilterFunction | FilterFunction[]): string | undefined => {
  if (_.isArray(value)) return _.compact(_.map(value, x => encodeFilter(x))).join(' ');
  return;
}

const encodeBoxShadow = (value: BoxShadowValue | BoxShadowValue[]): string => {
  if (_.isArray(value)) return _.map(value, x => encodeBoxShadow(x)).join(',');
  const {
    offsetX,
    offsetY,
    color = 'black',
    blurRadius = 0,
    spreadDistance = 0,
    inset = false,
  } = value;
  return _.compact([
    inset && 'inset',
    offsetX && _.isNumber(offsetX) ? `${offsetX}px` : offsetX,
    offsetY && _.isNumber(offsetY) ? `${offsetY}px` : offsetY,
    blurRadius && _.isNumber(blurRadius) ? `${blurRadius}px` : blurRadius,
    spreadDistance && _.isNumber(spreadDistance) ? `${spreadDistance}px` : spreadDistance,
    color,
  ]).join(' ');
}

export const encodeViewStyle = <S extends ViewStyle>(
  style: ReturnType<typeof useFlattenStyle<S>>
): ExtendedCSSProperties => {
  const {
    alignContent,
    alignItems,
    aspectRatio,
    boxSizing,
    display,
    flex,
    flexBasis,
    flexDirection,
    flexGrow,
    flexShrink,
    flexWrap,
    justifyContent,
    width,
    height,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    overflow,
    position,
    backfaceVisibility,
    backgroundColor,
    borderStyle,
    outlineColor,
    outlineOffset,
    outlineStyle,
    outlineWidth,
    opacity,
    pointerEvents,
    boxShadow,
    filter,
    transform,
    transformOrigin,
    mixBlendMode,
    cursor,
    rowGap,
    columnGap,
    top,
    bottom,
    left,
    right,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    borderTopColor,
    borderBottomColor,
    borderLeftColor,
    borderRightColor,
    borderTopWidth,
    borderBottomWidth,
    borderLeftWidth,
    borderRightWidth,
    borderTopLeftRadius,
    borderBottomLeftRadius,
    borderTopRightRadius,
    borderBottomRightRadius,
    zIndex,
  } = style;

  return _.pickBy({
    alignContent,
    alignItems,
    aspectRatio,
    boxSizing,
    display,
    flex,
    flexBasis,
    flexDirection,
    flexGrow,
    flexShrink,
    flexWrap,
    justifyContent,
    width,
    height,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    overflow,
    position: position as any,
    backfaceVisibility,
    backgroundColor,
    borderStyle,
    outlineColor,
    outlineOffset,
    outlineStyle,
    outlineWidth,
    opacity,
    pointerEvents: pointerEvents as any,
    boxShadow: boxShadow && encodeBoxShadow(boxShadow),
    filter: filter && encodeFilter(filter),
    transform: transform && encodeTransform(transform),
    transformOrigin: transformOrigin && encodeTransformOrigin(transformOrigin),
    mixBlendMode,
    cursor,
    rowGap,
    columnGap,
    top,
    bottom,
    left,
    right,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    borderTopColor,
    borderBottomColor,
    borderLeftColor,
    borderRightColor,
    borderTopWidth,
    borderBottomWidth,
    borderLeftWidth,
    borderRightWidth,
    borderTopLeftRadius,
    borderBottomLeftRadius,
    borderTopRightRadius,
    borderBottomRightRadius,
    zIndex,
  }, v => !!v) as ExtendedCSSProperties;
}

export const encodeImageStyle = <S extends ImageStyle>(
  style: ReturnType<typeof useFlattenStyle<S>>
): ExtendedCSSProperties => {

  const {
    resizeMode,
    overlayColor,
    tintColor,
    objectFit,
  } = style;

  return _.pickBy({
    ...encodeViewStyle(style),
    objectFit,
  }, v => !!v) as ExtendedCSSProperties;
}

export const encodeTextStyle = <S extends TextStyle>(
  style: ReturnType<typeof useFlattenStyle<S>>
): ExtendedCSSProperties => {

  const {
    color,
    fontFamily,
    fontSize,
    fontStyle,
    fontWeight,
    letterSpacing,
    lineHeight,
    textAlign,
    textDecorationLine,
    textDecorationStyle,
    textDecorationColor,
    textShadowColor,
    textShadowOffsetX,
    textShadowOffsetY,
    textShadowRadius,
    textTransform,
    userSelect,
  } = style;

  return _.pickBy({
    ...encodeViewStyle(style),
    color,
    fontFamily,
    fontSize,
    fontStyle,
    fontWeight,
    letterSpacing,
    lineHeight,
    textAlign,
    textDecorationLine: _.flattenDeep(textDecorationLine).join(' '),
    textDecorationStyle,
    textDecorationColor,
    textShadow: encodeBoxShadow({
      offsetX: textShadowOffsetX || 0,
      offsetY: textShadowOffsetY || 0,
      blurRadius: textShadowRadius,
      color: textShadowColor,
    }),
    textTransform,
    userSelect,
  }, v => !!v) as ExtendedCSSProperties;
}

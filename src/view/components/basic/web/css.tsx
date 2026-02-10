//
//  css.tsx
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
import { ExtendedCSSProperties } from 'frosty';
import { BoxShadowValue, FilterFunction, ImageStyle, TextStyle, TransformFunction, ViewStyle } from '../types/styles';
import { compactValue, useFlattenStyle } from '../utils';

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
    _.isNumber(offsetX) ? `${offsetX}px` : offsetX,
    _.isNumber(offsetY) ? `${offsetY}px` : offsetY,
    _.isNumber(blurRadius) ? `${blurRadius}px` : blurRadius,
    _.isNumber(spreadDistance) ? `${spreadDistance}px` : spreadDistance,
    color,
  ]).join(' ');
}

const encodeTextShadow = (value: BoxShadowValue | BoxShadowValue[]): string | undefined => {
  if (_.isArray(value)) return _.map(value, x => encodeBoxShadow(x)).join(',');
  const {
    offsetX,
    offsetY,
    color = 'black',
    blurRadius = 0,
  } = value;
  if (!offsetX && !offsetY && !blurRadius) return;
  return _.compact([
    _.isNumber(offsetX) ? `${offsetX}px` : offsetX,
    _.isNumber(offsetY) ? `${offsetY}px` : offsetY,
    _.isNumber(blurRadius) ? `${blurRadius}px` : blurRadius,
    color,
  ]).join(' ');
}

const encodeFontFamily = (fontFamily: string | string[]): string => {
  const genericFamilies = new Set([
    'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy',
    'system-ui', 'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded'
  ]);

  const families = _.castArray(fontFamily || []);

  return families.map(family => {
    const trimmed = family.trim();

    // Don't quote generic font families
    if (genericFamilies.has(trimmed.toLowerCase())) {
      return trimmed;
    }

    // Quote font families that contain spaces, digits at the start, or special characters
    if (/[\s\d]/.test(trimmed) || /^[\d]/.test(trimmed) || /[^\w-]/.test(trimmed)) {
      return `"${trimmed}"`;
    }

    return trimmed;
  }).join(', ');
}

export const encodeViewStyle = <S extends ViewStyle>(
  style: ReturnType<typeof useFlattenStyle<S>>
): ExtendedCSSProperties => {
  const {
    alignContent,
    alignItems,
    alignSelf,
    aspectRatio,
    boxSizing,
    display,
    flexBasis,
    flexDirection,
    flexGrow,
    flexShrink,
    flexWrap,
    justifyContent,
    justifyItems,
    justifySelf,
    width,
    height,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    order,
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
    userSelect,
    zIndex,
  } = style;

  return compactValue({
    alignContent,
    alignItems,
    alignSelf,
    aspectRatio,
    boxSizing,
    display,
    flexBasis,
    flexDirection,
    flexGrow,
    flexShrink,
    flexWrap,
    justifyContent,
    justifyItems,
    justifySelf,
    width,
    height,
    maxHeight,
    maxWidth,
    minHeight,
    minWidth,
    order,
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
    userSelect,
    zIndex,
  }) as ExtendedCSSProperties;
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

  return compactValue({
    ...encodeViewStyle(style),
    objectFit,
  }) as ExtendedCSSProperties;
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
    verticalAlign,
    textAlign,
    textDecorationLine,
    textDecorationStyle,
    textDecorationColor,
    textShadowColor,
    textShadowOffsetX,
    textShadowOffsetY,
    textShadowRadius,
    textTransform,
  } = style;

  return compactValue({
    ...encodeViewStyle(style),
    color,
    fontFamily: fontFamily ? encodeFontFamily(fontFamily) : undefined,
    fontSize: _.isString(fontSize) && _.endsWith(fontSize, '%') ? `${parseFloat(fontSize) / 100}em` : fontSize,
    fontStyle,
    fontWeight,
    letterSpacing: _.isString(letterSpacing) && _.endsWith(letterSpacing, '%') ? `${parseFloat(letterSpacing) / 100}em` : letterSpacing,
    lineHeight,
    verticalAlign,
    textAlign,
    textDecorationLine: _.isArray(textDecorationLine) ? _.flattenDeep(textDecorationLine).join(' ') : textDecorationLine,
    textDecorationStyle,
    textDecorationColor,
    textShadow: encodeTextShadow({
      offsetX: textShadowOffsetX || 0,
      offsetY: textShadowOffsetY || 0,
      blurRadius: textShadowRadius,
      color: textShadowColor,
    }),
    textTransform,
  }) as ExtendedCSSProperties;
}

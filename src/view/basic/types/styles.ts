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

import _ from 'lodash';

export type ColorValue = string;

type FlexLayoutContentType =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

type FlexLayoutItemsType =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'baseline';

export type DimensionValue =
  | 'auto'
  | number
  | `${number}%`;

const _directions = [
  'Bottom',
  'End',
  'Left',
  'Right',
  'Start',
  'Top',
] as const;

const _extendedDirections = [
  ..._directions,
  'Horizontal',
  'Vertical',
] as const;

const _paddingKeys = ['padding', ..._.map(_extendedDirections, d => `padding${d}` as const)] as const;
const _marginKeys = ['margin', ..._.map(_extendedDirections, d => `margin${d}` as const)] as const;
const _borderColorKeys = ['borderColor', ..._.map(_directions, d => `border${d}Color` as const)] as const;
const _borderWidthKeys = ['borderWidth', ..._.map(_directions, d => `border${d}Width` as const)] as const;
const _borderRadiusKeys = [
  'borderRadius',
  ..._.flatMap([
    'Bottom',
    'Top',
  ] as const, v => _.map([
    'End',
    'Left',
    'Right',
    'Start',
  ] as const, d => `border${v}${d}Radius` as const))
] as const;

export type LayoutStyle = {
  alignContent?: FlexLayoutContentType;
  alignItems?: FlexLayoutItemsType;
  alignSelf?: 'auto' | FlexLayoutItemsType;
  aspectRatio?: number | string;
  bottom?: DimensionValue;
  boxSizing?: 'border-box' | 'content-box';
  display?: 'none' | 'flex' | (string & {});
  end?: DimensionValue;
  flex?: number | 'auto' | 'none';
  flexBasis?: DimensionValue;
  flexDirection?:
  | 'row'
  | 'column'
  | 'row-reverse'
  | 'column-reverse';
  rowGap?: number;
  gap?: number;
  columnGap?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  height?: DimensionValue;
  inset?: DimensionValue;
  justifyContent?: FlexLayoutContentType;
  justifyItems?: FlexLayoutItemsType;
  justifySelf?: 'auto' | FlexLayoutItemsType;
  left?: DimensionValue;
  maxHeight?: DimensionValue;
  maxWidth?: DimensionValue;
  minHeight?: DimensionValue;
  minWidth?: DimensionValue;
  order?: number;
  overflow?: 'visible' | 'hidden';
  position?: 'absolute' | 'relative' | 'static' | 'fixed' | 'sticky' | (string & {});
  right?: DimensionValue;
  start?: DimensionValue;
  top?: DimensionValue;
  width?: DimensionValue;
  zIndex?: number;
} & {
  [x in typeof _paddingKeys[number]]?: DimensionValue;
} & {
  [x in typeof _marginKeys[number]]?: DimensionValue;
}

type OneOf<T, K extends keyof T = keyof T> = K extends keyof T
  ? { [P in K]: P extends Exclude<keyof T, K> ? never : T[K] }
  : never;

export type TransformFunction = OneOf<{
  perspective: number;
  rotate: string;
  rotateX: string;
  rotateY: string;
  rotateZ: string;
  scale: number;
  scaleX: number;
  scaleY: number;
  translateX: number | `${number}%`;
  translateY: number | `${number}%`;
  skewX: string;
  skewY: string;
  matrix: number[];
}>;

export type TransformsStyle = {
  transform?: TransformFunction | TransformFunction[];
  transformOrigin?: Array<string | number> | string | number;
}

export type FilterFunction = OneOf<{
  brightness: number | string;
  blur: number | string;
  contrast: number | string;
  grayscale: number | string;
  hueRotate: number | string;
  invert: number | string;
  opacity: number | string;
  saturate: number | string;
  sepia: number | string;
  dropShadow: DropShadowValue | string;
}>;

export type DropShadowValue = {
  offsetX: number | string;
  offsetY: number | string;
  standardDeviation?: number | string;
  color?: ColorValue;
};

export type BoxShadowValue = {
  offsetX: number | string;
  offsetY: number | string;
  color?: ColorValue;
  blurRadius?: number | string;
  spreadDistance?: number | string;
  inset?: boolean;
};

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export type ViewStyle = LayoutStyle & TransformsStyle & {
  backfaceVisibility?: 'visible' | 'hidden';
  backgroundColor?: ColorValue;
  borderCurve?: 'circular' | 'continuous';
  borderStyle?: 'solid' | 'dotted' | 'dashed';
  outlineColor?: ColorValue;
  outlineOffset?: number;
  outlineStyle?: 'solid' | 'dotted' | 'dashed';
  outlineWidth?: number;
  opacity?: number;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
  boxShadow?: BoxShadowValue | BoxShadowValue[];
  filter?: FilterFunction | FilterFunction[];
  mixBlendMode?: BlendMode;
  cursor?: 'auto' | 'pointer' | (string & {});
  userSelect?: 'auto' | 'none' | 'text' | 'contain' | 'all';
} & {
  [x in typeof _borderColorKeys[number]]?: ColorValue;
} & {
  [x in typeof _borderWidthKeys[number]]?: number;
} & {
  [x in typeof _borderRadiusKeys[number]]?: number;
}

type TextDecorationLine =
  | 'underline'
  | 'overline'
  | 'line-through';

export type TextStyle = ViewStyle & {
  color?: ColorValue;
  fontFamily?: string | string[];
  fontSize?:
  | number
  | `${number}%`;
  fontStyle?: 'normal' | 'italic';
  fontWeight?:
  | 'normal'
  | 'bold'
  | 'ultralight'
  | 'thin'
  | 'light'
  | 'medium'
  | 'regular'
  | 'semibold'
  | 'condensedBold'
  | 'condensed'
  | 'heavy'
  | 'black'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;
  letterSpacing?:
  | 'normal'
  | number
  | `${number}%`;
  lineHeight?:
  | 'normal'
  | number
  | `${number}%`;
  verticalAlign?:
  | 'baseline'
  | 'sub'
  | 'super'
  | 'middle'
  | 'top'
  | 'bottom'
  | number
  | `${number}%`;
  textAlign?: 'start' | 'end' | 'left' | 'right' | 'center' | 'justify';
  textDecorationLine?:
  | 'none'
  | TextDecorationLine
  | TextDecorationLine[];
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed';
  textDecorationColor?: ColorValue;
  textShadowColor?: ColorValue;
  textShadowOffsetX?: number | string;
  textShadowOffsetY?: number | string;
  textShadowRadius?: number;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
}

export const textStyleKeys = [
  'color',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'letterSpacing',
  'lineHeight',
  'verticalAlign',
  'textAlign',
  'textDecorationLine',
  'textDecorationStyle',
  'textDecorationColor',
  'textShadowColor',
  'textShadowOffsetX',
  'textShadowOffsetY',
  'textShadowRadius',
  'textTransform',
] as const;

export type ImageStyle = ViewStyle & {
  resizeMode?:
  | 'cover'
  | 'contain'
  | 'stretch'
  | 'repeat'
  | 'center';
  overlayColor?: ColorValue;
  tintColor?: ColorValue;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
}

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

export type ColorValue = string;

type FlexAlignType =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'baseline';

export type DimensionValue =
  | 'auto'
  | number
  | `${number}%`;

export type LayoutStyle = {
  alignContent?:
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
  alignItems?: FlexAlignType;
  alignSelf?: 'auto' | FlexAlignType;
  aspectRatio?: number | string;
  bottom?: DimensionValue;
  boxSizing?: 'border-box' | 'content-box';
  display?: 'none' | 'flex' | (string & {});
  end?: DimensionValue;
  flex?: number;
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
  justifyContent?:
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
  left?: DimensionValue;
  margin?: DimensionValue;
  marginBottom?: DimensionValue;
  marginEnd?: DimensionValue;
  marginHorizontal?: DimensionValue;
  marginLeft?: DimensionValue;
  marginRight?: DimensionValue;
  marginStart?: DimensionValue;
  marginTop?: DimensionValue;
  marginVertical?: DimensionValue;
  maxHeight?: DimensionValue;
  maxWidth?: DimensionValue;
  minHeight?: DimensionValue;
  minWidth?: DimensionValue;
  overflow?: 'visible' | 'hidden';
  padding?: DimensionValue;
  paddingBottom?: DimensionValue;
  paddingEnd?: DimensionValue;
  paddingHorizontal?: DimensionValue;
  paddingLeft?: DimensionValue;
  paddingRight?: DimensionValue;
  paddingStart?: DimensionValue;
  paddingTop?: DimensionValue;
  paddingVertical?: DimensionValue;
  position?: 'absolute' | 'relative' | 'static' | (string & {});
  right?: DimensionValue;
  start?: DimensionValue;
  top?: DimensionValue;
  width?: DimensionValue;
  zIndex?: number;
}

type OneOf<T, K extends keyof T = keyof T> = K extends keyof T
  ? { [P in K]: P extends Exclude<keyof T, K> ? never : T[K] }
  : never;

export type TransformsStyle = {
  transform?: OneOf<{
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
  }>[];
  transformOrigin?: Array<string | number> | string;
}

export type FilterFunction = OneOf<{
  brightness: number | string,
  blur: number | string,
  contrast: number | string,
  grayscale: number | string,
  hueRotate: number | string,
  invert: number | string,
  opacity: number | string,
  saturate: number | string,
  sepia: number | string,
  dropShadow: DropShadowValue | string
}>;

export type DropShadowValue = {
  offsetX: number | string;
  offsetY: number | string;
  standardDeviation?: number | string | undefined;
  color?: ColorValue | number | undefined;
};

export type BoxShadowValue = {
  offsetX: number | string;
  offsetY: number | string;
  color?: string;
  blurRadius?: ColorValue | number;
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
  borderBottomColor?: ColorValue;
  borderBottomEndRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  borderBottomStartRadius?: number;
  borderBottomWidth?: number;
  borderColor?: ColorValue;
  borderCurve?: 'circular' | 'continuous';
  borderEndColor?: ColorValue;
  borderEndEndRadius?: number;
  borderEndStartRadius?: number;
  borderEndWidth?: number;
  borderLeftColor?: ColorValue;
  borderLeftWidth?: number;
  borderRadius?: number;
  borderRightColor?: ColorValue;
  borderRightWidth?: number;
  borderStartColor?: ColorValue;
  borderStartEndRadius?: number;
  borderStartStartRadius?: number;
  borderStyle?: 'solid' | 'dotted' | 'dashed';
  borderStartWidth?: number;
  borderTopColor?: ColorValue;
  borderTopEndRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderTopStartRadius?: number;
  borderTopWidth?: number;
  borderWidth?: number;
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
}

type TextDecorationLine =
  | 'underline'
  | 'overline'
  | 'line-through';

export type TextStyle = ViewStyle & {
  color?: ColorValue;
  fontFamily?: string;
  fontSize?: number;
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
  | number;
  lineHeight?:
  | 'normal'
  | number
  | `${number}%`;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  textDecorationLine?:
  | 'none'
  | TextDecorationLine
  | TextDecorationLine[];
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed';
  textDecorationColor?: ColorValue;
  textShadowColor?: ColorValue;
  textShadowOffset?: { width: number; height: number };
  textShadowRadius?: number;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  userSelect?: 'auto' | 'none' | 'text' | 'contain' | 'all';
}

export const textStyleKeys = [
  'color',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'letterSpacing',
  'lineHeight',
  'textAlign',
  'textDecorationLine',
  'textDecorationStyle',
  'textDecorationColor',
  'textShadowColor',
  'textShadowOffset',
  'textShadowRadius',
  'textTransform',
  'userSelect',
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

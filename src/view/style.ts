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

export type ColorValue = string;

type FlexAlignType =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'stretch'
  | 'baseline';

export type DimensionValue =
  | number
  | 'auto'
  | `${number}%`
  | null;

export interface FlexStyle {
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
  display?: 'none' | 'flex';
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
  overflow?: 'visible' | 'hidden' | 'scroll';
  padding?: DimensionValue;
  paddingBottom?: DimensionValue;
  paddingEnd?: DimensionValue;
  paddingHorizontal?: DimensionValue;
  paddingLeft?: DimensionValue;
  paddingRight?: DimensionValue;
  paddingStart?: DimensionValue;
  paddingTop?: DimensionValue;
  paddingVertical?: DimensionValue;
  position?: 'absolute' | 'relative' | 'static';
  right?: DimensionValue;
  start?: DimensionValue;
  top?: DimensionValue;
  width?: DimensionValue;
  zIndex?: number;
}

interface PerspectiveTransform {
  perspective: number;
}

interface RotateTransform {
  rotate: string;
}

interface RotateXTransform {
  rotateX: string;
}

interface RotateYTransform {
  rotateY: string;
}

interface RotateZTransform {
  rotateZ: string;
}

interface ScaleTransform {
  scale: number;
}

interface ScaleXTransform {
  scaleX: number;
}

interface ScaleYTransform {
  scaleY: number;
}

interface TranslateXTransform {
  translateX: number | `${number}%`;
}

interface TranslateYTransform {
  translateY: number | `${number}%`;
}

interface SkewXTransform {
  skewX: string;
}

interface SkewYTransform {
  skewY: string;
}

interface MatrixTransform {
  matrix: number[];
}

type MaximumOneOf<T, K extends keyof T = keyof T> = K extends keyof T
  ? { [P in K]: T[K] } & { [P in Exclude<keyof T, K>]?: never }
  : never;

export interface TransformsStyle {
  transform?: MaximumOneOf<
    PerspectiveTransform &
    RotateTransform &
    RotateXTransform &
    RotateYTransform &
    RotateZTransform &
    ScaleTransform &
    ScaleXTransform &
    ScaleYTransform &
    TranslateXTransform &
    TranslateYTransform &
    SkewXTransform &
    SkewYTransform &
    MatrixTransform
  >[];
  transformOrigin?: Array<string | number> | string;
}

export interface ViewStyle extends FlexStyle, TransformsStyle {
  backfaceVisibility?: 'visible' | 'hidden';
  backgroundColor?: ColorValue;
  borderBlockColor?: ColorValue;
  borderBlockEndColor?: ColorValue;
  borderBlockStartColor?: ColorValue;
  borderBottomColor?: ColorValue;
  borderBottomEndRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  borderBottomStartRadius?: number;
  borderBottomWidth?: number;
  borderColor?: ColorValue;
  borderCurve?: 'circular' | 'continuous';
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
  opacity?: number;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto';
  shadowColor?: ColorValue;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
}

export interface TextStyle extends ViewStyle {
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
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  textDecorationLine?:
  | 'none'
  | 'underline'
  | 'line-through'
  | 'underline line-through';
  textDecorationStyle?: 'solid' | 'double' | 'dotted' | 'dashed';
  textDecorationColor?: ColorValue;
  textShadowColor?: ColorValue;
  textShadowOffset?: { width: number; height: number };
  textShadowRadius?: number;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  userSelect?: 'auto' | 'none' | 'text' | 'contain' | 'all';
}

export interface ImageStyle extends ViewStyle {
  resizeMode?:
  | 'cover'
  | 'contain'
  | 'stretch'
  | 'repeat'
  | 'center';
  backfaceVisibility?: 'visible' | 'hidden';
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  backgroundColor?: ColorValue;
  borderColor?: ColorValue;
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  overflow?: 'visible' | 'hidden';
  overlayColor?: ColorValue;
  tintColor?: ColorValue;
  opacity?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
}

//
//  scrollView.tsx
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
import { ComponentRef, ComponentType, mergeRefs, useRef, useRefHandle } from 'frosty';
import { ScrollBaseProps, ScrollViewProps } from '../types/scrollView';
import { encodeViewStyle } from './css';
import { useFlattenStyle } from '../../../view/style/utils';
import { useResponderEvents } from './events';
import { View } from './view';

export const useScrollProps = <Target extends any>({
  horizontal = false,
  vertical = !horizontal,
  scrollEnabled = true,
  directionalLockEnabled,
  contentInset,
  contentOffset,
  zoomScale,
  maximumZoomScale,
  minimumZoomScale,
  bounces,
  bouncesZoom,
  decelerationRate,
  onContentSizeChange,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
  onScrollToTop,
}: ScrollBaseProps<Target>) => {

  return {
    style: scrollEnabled ? {
      overflowX: horizontal ? 'auto' : 'hidden',
      overflowY: vertical ? 'auto' : 'hidden',
    } as const : {
      overflow: 'hidden',
    } as const,
  };
};

export const ScrollView: ComponentType<ScrollViewProps> = ({
  ref,
  style,
  contentContainerStyle,
  children,
  ...props
}) => {

  const targetRef = useRef<HTMLDivElement>();
  const nativeRef = useRef<ComponentRef<typeof ScrollView>>();
  useRefHandle(mergeRefs(nativeRef, ref), () => ({
    get _native() { return targetRef.current; }
  }), null);

  const { overflow, overflowX, overflowY, ...cssStyle } = encodeViewStyle(useFlattenStyle([
    {
      alignContent: 'flex-start',
      alignItems: 'stretch',
      alignSelf: 'auto',
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: 'black',
      boxSizing: 'border-box',
      display: 'flex',
      flexBasis: 'auto',
      flexDirection: 'column',
      flexShrink: 0,
      justifyContent: 'stretch',
      justifyItems: 'stretch',
      justifySelf: 'auto',
      margin: 0,
      minHeight: 0,
      minWidth: 0,
      padding: 0,
      position: 'relative',
      textDecorationLine: 'none',
      zIndex: 0,
    },
    style,
  ]));

  const { style: scrollStyle, ...scrollProps } = useScrollProps(props);

  return (
    <div
      ref={targetRef}
      style={[
        cssStyle,
        scrollStyle,
      ]}
      {...scrollProps}
      {...useResponderEvents(props, nativeRef, targetRef)}>
      <View style={contentContainerStyle}>{children}</View>
    </div>
  );
};

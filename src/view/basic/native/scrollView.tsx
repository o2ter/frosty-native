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

import { ComponentRef, ComponentType, mergeRefs, useRef, useRefHandle } from 'frosty';
import { _createNativeElement } from 'frosty/_native';
import { NativeModules } from '../../../global';
import { NativeNode } from '../../../node';
import { ScrollViewProps } from '../types/scrollView';
import { useFlattenStyle } from '../../../view/style/utils';
import { View } from './view';

abstract class FTScrollView extends NativeNode {

  static createElement(): NativeNode {
    return NativeModules['FTScrollView']();
  }
}

export const ScrollView: ComponentType<ScrollViewProps> = ({
  ref,
  style,
  contentContainerStyle,
  horizontal = false,
  vertical = !horizontal,
  children,
  onContentSizeChange,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
  onScrollToTop,
}) => {

  const nativeRef = useRef<ComponentRef<typeof ScrollView>>();
  useRefHandle(mergeRefs(nativeRef, ref), () => ({
  }), null);

  const _contentContainerStyle = useFlattenStyle(contentContainerStyle);

  return _createNativeElement(FTScrollView, {
    style: useFlattenStyle(style),
    horizontal,
    vertical,
    children: <View style={_contentContainerStyle}>{children}</View>,
  });
};

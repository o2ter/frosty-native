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
import { ScrollViewProps } from '../types/scrollView';
import { encodeViewStyle } from './css';
import { useFlattenStyle } from '../../../view/style/utils';
import { useEventProps } from './events';

export const ScrollView: ComponentType<ScrollViewProps> = ({
  ref,
  style,
  contentContainerStyle,
  horizontal = false,
  vertical = !horizontal,
  children,
  ...props
}) => {

  const targetRef = useRef<HTMLDivElement>();
  const nativeRef = useRef<ComponentRef<typeof ScrollView>>();
  useRefHandle(mergeRefs(nativeRef, ref), () => ({
    get _target() { return targetRef.current; }
  }), null);

  const cssStyle = encodeViewStyle(useFlattenStyle([
    {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
    },
    style,
  ]));
  const contentContainerCssStyle = encodeViewStyle(useFlattenStyle(contentContainerStyle));

  const eventProps = useEventProps(props, nativeRef, targetRef);

  return (
    <div
      ref={targetRef}
      style={[
        cssStyle,
        {
          overflow: undefined,
          overflowX: horizontal ? 'auto' : 'hidden',
          overflowY: vertical ? 'auto' : 'hidden',
        },
      ]}
      {...eventProps}>
      <div style={contentContainerCssStyle}>{children}</div>
    </div>
  );
};

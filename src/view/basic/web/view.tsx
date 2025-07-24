//
//  view.tsx
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
import { ViewProps } from '../types';
import { encodeViewStyle } from './css';
import { useFlattenStyle } from '../../../view/style/utils';

export const View: ComponentType<ViewProps> = ({ ref, style, children }) => {

  const targetRef = useRef<HTMLDivElement>();
  const nativeRef = useRef<ComponentRef<typeof View>>();
  useRefHandle(mergeRefs(nativeRef, ref), () => ({
    get _target() { return targetRef.current; }
  }), null);

  const cssStyle = encodeViewStyle(useFlattenStyle([
    {
      alignContent: 'flex-start',
      alignItems: 'stretch',
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: 'black',
      boxSizing: 'border-box',
      display: 'flex',
      flexBasis: 'auto',
      flexDirection: 'column',
      flexShrink: 0,
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

  return (
    <div
      ref={targetRef}
      style={[
        {
          listStyle: 'none',
        },
        cssStyle,
      ]}>
      {children}
    </div>
  );
};

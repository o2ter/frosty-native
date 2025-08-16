//
//  text.tsx
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
import { ComponentRef, ComponentType, mergeRefs, useRef, useRefHandle, useStack } from 'frosty';
import { TextViewProps } from '../types/text';
import { useTextStyle } from '../../components/textStyle';
import { encodeTextStyle } from './css';
import { useFlattenStyle } from '../../../view/style/utils';
import { TextStyle } from '../../../view/style/types';
import { _DOMRenderer, DOMNativeNode } from 'frosty/web';
import { _createNativeElement } from 'frosty/_native';
import { useResponderEvents } from './events';

class DOMTextBaseView extends DOMNativeNode {

  #target: HTMLElement;

  constructor(target: HTMLElement) {
    super();
    this.#target = target;
  }

  get target(): Element {
    return this.#target;
  }

  update(props: Record<string, any> & {
    className?: string;
    style?: string;
  }) {
    DOMNativeNode.Utils.update(this.#target, props);
  }

  replaceChildren(children: (string | Element | DOMNativeNode)[]) {
    const filtered = _.filter(children, x => _.isString(x) || x instanceof DOMInnerTextView);
    DOMNativeNode.Utils.replaceChildren(this.#target, filtered);
  }

  destroy() {
    DOMNativeNode.Utils.destroy(this.#target);
  }
}

class DOMTextView extends DOMTextBaseView {

  static createElement(doc: Document): DOMNativeNode {
    return new DOMTextView(doc.createElement('div'));
  }
}

class DOMInnerTextView extends DOMTextBaseView {

  static createElement(doc: Document): DOMNativeNode {
    return new DOMInnerTextView(doc.createElement('span'));
  }
}

export const Text: ComponentType<TextViewProps> = ({ id, ref, style, maxFontSizeMultiplier, minimumFontScale, numberOfLines, tabIndex, children, ...props }) => {

  const targetRef = useRef<HTMLElement | null>();
  const nativeRef = useRef<ComponentRef<typeof Text>>();
  useRefHandle(mergeRefs(nativeRef, ref), () => ({
    get _native() { return targetRef.current || undefined; }
  }), null);

  const isInnerText = _.some(useStack(), (item) => item.type === Text);

  const cssStyle = encodeTextStyle(useFlattenStyle([
    !isInnerText && {
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderStyle: 'solid',
      borderColor: 'black',
      boxSizing: 'border-box',
      color: 'black',
      display: 'inline',
      fontFamily: 'sans-serif',
      fontSize: 14,
      margin: 0,
      padding: 0,
      position: 'relative',
      textAlign: 'start',
      textDecorationLine: 'none',
    },
    !isInnerText && useTextStyle() as TextStyle,
    style,
  ]));

  return _createNativeElement(isInnerText ? DOMInnerTextView : DOMTextView, {
    id,
    ref: targetRef,
    style: [
      !isInnerText && {
        listStyle: 'none',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
      },
      cssStyle,
    ],
    tabIndex,
    children,
    ...useResponderEvents(props, nativeRef, targetRef),
  });
};

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
import { ComponentType, mergeRefs, useRef, useRefHandle, useStack } from 'frosty';
import { TextViewProps } from '../../types';
import { useTextStyle } from '../../components';
import { encodeTextStyle } from './css';
import { useFlattenStyle } from '../../../view/style/utils';
import { TextStyle } from '../../../view/style/types';
import { _DOMRenderer, DOMNativeNode } from 'frosty/web';
import { _createNativeElement } from 'frosty/_native';

class DOMTextBaseView extends DOMNativeNode {

  #renderer: _DOMRenderer;
  #target: HTMLElement;

  constructor(target: HTMLElement, renderer: _DOMRenderer) {
    super();
    this.#renderer = renderer;
    this.#target = target;
  }

  get target(): Element {
    return this.#target;
  }

  update(props: Record<string, any> & {
    className?: string;
    style?: string;
  }) {

    const { ref, className, style } = props;
    mergeRefs(ref)(this.#target);

    if (className) {
      this.#target.className = className;
    } else {
      this.#target.removeAttribute('class');
    }
    if (style) {
      this.#target.setAttribute('style', style);
    } else {
      this.#target.removeAttribute('style');
    }
  }

  replaceChildren(children: (string | Element | DOMNativeNode)[]) {
    const filtered = _.filter(children, x => _.isString(x) || x instanceof DOMInnerTextView);
    this.#renderer.__replaceChildren(this.#target, filtered);
  }

  destroy() {
  }
}

class DOMTextView extends DOMTextBaseView {

  static createElement(doc: Document, renderer: _DOMRenderer): DOMNativeNode {
    return new DOMTextView(doc.createElement('div'), renderer);
  }
}

class DOMInnerTextView extends DOMTextBaseView {

  static createElement(doc: Document, renderer: _DOMRenderer): DOMNativeNode {
    return new DOMInnerTextView(doc.createElement('span'), renderer);
  }
}

export const Text: ComponentType<TextViewProps> = ({ ref, style, children }) => {

  const targetRef = useRef<HTMLElement | null>();
  useRefHandle(ref, () => ({
    get _target() { return targetRef.current || undefined; }
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
      fontFamily: 'System',
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
    ref: targetRef,
    style: [
      !isInnerText && {
        listStyle: 'none',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
      },
      cssStyle,
    ],
    children
  });
};

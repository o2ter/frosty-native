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
import { ComponentType, mergeRefs, useRef, useRefHandle } from 'frosty';
import { _createNativeElement } from 'frosty/_native';
import { DOMNativeNode, type _DOMRenderer } from 'frosty/web';
import { TextViewProps } from '../../types';
import { useFlattenStyle } from '../../style/utils';
import { useTextStyle } from '../../components';

export class DOMTextView extends DOMNativeNode {

  #renderer: _DOMRenderer;
  #target: HTMLDivElement;

  constructor(doc: Document, renderer: _DOMRenderer) {
    super();
    this.#renderer = renderer;
    this.#target = doc.createElement('div');
  }

  static createElement(doc: Document, renderer: _DOMRenderer): DOMNativeNode {
    return new DOMTextView(doc, renderer);
  }

  get target(): Element {
    return this.#target;
  }

  update(props: Record<string, any> & {
    className?: string;
    style?: string;
  }) {

    const { ref } = props;
    mergeRefs(ref)(this.#target);

  }

  replaceChildren(children: (string | Element | DOMNativeNode)[]) {
    const filtered = _.filter(children, x => _.isString(x) || x instanceof DOMTextView);
    this.#renderer.__replaceChildren(this.#target, filtered);
  }

  destroy() {
  }
}

export const Text: ComponentType<TextViewProps> = ({ ref, style, children }) => {

  const targetRef = useRef<HTMLDivElement>();
  useRefHandle(ref, () => ({
    get _target() { return targetRef.current; }
  }), null);

  const _style = useFlattenStyle([useTextStyle(), style]);

  return _createNativeElement(DOMTextView, {
    ref: targetRef,
    style: [
      {
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderStyle: 'solid',
        borderColor: 'black',
        boxSizing: 'border-box',
        color: 'black',
        display: 'inline',
        fontFamily: 'System',
        fontSize: 14,
        listStyle: 'none',
        margin: 0,
        padding: 0,
        position: 'relative',
        textAlign: 'start',
        textDecoration: 'none',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
      }
    ],
    children
  });
};

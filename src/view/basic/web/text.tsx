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

  #renderer: _DOMRenderer;
  #target: HTMLElement;

  #listener: Record<string, EventListener | undefined> = {};

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

    const {
      ref,
      className,
      style,
      onPointerEnter,
      onPointerLeave,
      onTouchStart,
      onTouchStartCapture,
      onTouchMove,
      onTouchMoveCapture,
      onTouchEnd,
      onTouchCancel,
      onPointerDown,
      onPointerDownCapture,
      onPointerMove,
      onPointerMoveCapture,
      onPointerUp,
      onPointerCancel,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseDownCapture,
      onMouseMove,
      onMouseMoveCapture,
      onMouseUp,
      onDragStart,
    } = props;
    mergeRefs(ref)(this.#target);

    if (className) {
      if (this.#target.className !== className)
        this.#target.className = className;
    } else if (!_.isNil(this.#target.getAttribute('class'))) {
      this.#target.removeAttribute('class');
    }
    if (style) {
      const oldValue = this.#target.getAttribute('style');
      if (oldValue !== style)
        this.#target.setAttribute('style', style);
    } else if (!_.isNil(this.#target.getAttribute('style'))) {
      this.#target.removeAttribute('style');
    }
    const events = {
      onPointerEnter,
      onPointerLeave,
      onTouchStart,
      onTouchStartCapture,
      onTouchMove,
      onTouchMoveCapture,
      onTouchEnd,
      onTouchCancel,
      onPointerDown,
      onPointerDownCapture,
      onPointerMove,
      onPointerMoveCapture,
      onPointerUp,
      onPointerCancel,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseDownCapture,
      onMouseMove,
      onMouseMoveCapture,
      onMouseUp,
      onDragStart,
    };
    for (const [key, listener] of _.entries(events)) {
      const event = key.endsWith('Capture') ? key.slice(2, -7).toLowerCase() : key.slice(2).toLowerCase();
      if (this.#listener[key] !== listener) {
        const options = { capture: key.endsWith('Capture') };
        if (_.isFunction(this.#listener[key])) this.#target.removeEventListener(event, this.#listener[key], options);
        if (_.isFunction(listener)) this.#target.addEventListener(event, listener, options);
      }
      this.#listener[key] = listener;
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

export const Text: ComponentType<TextViewProps> = ({ ref, style, children, ...props }) => {

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
    children,
    ...useResponderEvents(props, nativeRef, targetRef),
  });
};

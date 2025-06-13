//
//  renderer.ts
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
import { _Renderer, uniqueId, VNode } from 'frosty/_native';
import { NativeNode } from './node';

export class NativeRenderer extends _Renderer<NativeNode> {

  get _server(): boolean {
    return false;
  }

  protected _beforeUpdate() {
  }

  protected _afterUpdate() {
  }

  protected _createElement(node: VNode, stack: VNode[]): NativeNode {
    const { type: _type, props } = node;
    if (_.isString(_type) || !(_type.prototype instanceof NativeNode)) throw Error('Invalid type');
    const ElementType = _type as typeof NativeNode;
    const element = ElementType.createElement();
    element.update(props);
    return element;
  }

  protected _updateElement(node: VNode, element: NativeNode, stack: VNode[]) {
    const { props } = node;
    element.update(props);
  }

  protected _destroyElement(node: VNode, element: NativeNode) {
    element.destroy();
  }

  protected _replaceChildren(node: VNode, element: NativeNode, children: (string | NativeNode)[]) {
    element.replaceChildren(children);
  }

}
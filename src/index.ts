//
//  index.ts
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
import { ComponentType, createElement } from 'frosty';
import { NativeRenderer } from './renderer';
import { NativeNode } from './node';

export * from './view';
export * from './platform';
export { NativeNode } from './node';
export { NativeRenderer } from './renderer';
export { NativeModules } from './global';

export const AppRegistry = (() => {
  const registry: Record<string, ComponentType<any>> = {};
  return {
    keys() {
      return _.keys(registry);
    },
    getRunnable(appKey: string) {
      const component = registry[appKey];
      if (!component) return;
      const renderer = new NativeRenderer();
      return {
        component,
        notify: (nodeId: string, method: string, ...args: any[]) => {
          renderer.notify(nodeId, method, ...args);
        },
        run(options?: {
          root?: NativeNode,
          props?: Record<string, any> | null,
        }) {
          const runner = renderer.createRoot(options?.root);
          runner.mount(createElement(component, options?.props));
          return {
            get root() {
              return runner.root;
            },
            unmount() {
              runner.unmount();
            },
          };
        },
      };
    },
    registerComponent(appKey: string, component: ComponentType<any>) {
      registry[appKey] = component;
    },
  };
})();

Object.defineProperty(__FROSTY_SPEC__, 'AppRegistry', {
  value: AppRegistry,
  writable: false,
});
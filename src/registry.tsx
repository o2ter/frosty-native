//
//  registry.tsx
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
import { ComponentType, createElement, createStore, useStore } from 'frosty';
import { NativeRenderer } from './renderer';
import { NativeNode } from './node';
import { Environment } from './view';
import { EnvironmentValues } from './view/components/environment/types';
import { AppEventContext } from './view/components/appEvent';
import { EventEmitter } from 'frosty/_native';

export const AppRegistry = (() => {
  const registry: Record<string, ComponentType<any>> = {};
  return {
    keys() {
      return _.keys(registry);
    },
    getRunnable(appKey: string) {
      const component = registry[appKey];
      if (!component) return;
      return {
        component,
        run(options?: {
          root?: NativeNode,
          props?: Record<string, any> | null,
          environment?: Partial<EnvironmentValues>,
        }) {
          const renderer = new NativeRenderer();
          const runner = renderer.createRoot(options?.root);
          const env = createStore(options?.environment ?? {});
          const emitter = new EventEmitter();
          const Runner = ({ ...props }) => (
            <AppEventContext value={emitter}>
              <Environment {...useStore(env)}>
                {createElement(component, props)}
              </Environment>
            </AppEventContext>
          );
          runner.mount(createElement(Runner, options?.props));
          return {
            get root() {
              return runner.root;
            },
            unmount() {
              runner.unmount();
            },
            notify(event: string, ...args: any[]) {
              emitter.emit(event, ...args);
            },
            notifyNode(nodeId: string, method: string, ...args: any[]) {
              renderer.notifyNode(nodeId, method, ...args);
            },
            setEnvironment(...values: Partial<EnvironmentValues>[]) {
              env.setValue(v => _.reduce(values, (acc, v) => ({ ...acc, ...v }), v));
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

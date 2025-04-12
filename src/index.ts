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
import { ComponentType } from 'frosty';

export * from './platform';
export { NativeNode } from './node';
export { NativeRenderer } from './renderer';

/** @internal */
declare global {

  namespace __NS_FROSTY_SPEC__ {
  }

  const __FROSTY_SPEC__: {
    get NativeModules(): {
      [key: string]: any;
    };
  };
}

export const NativeModules = {
  ...__FROSTY_SPEC__.NativeModules,
};

export const AppRegistry = (() => {

  const registry: Record<string, ComponentType<any> | undefined> = {};

  return {
    keys() {
      return _.keys(registry);
    },
    getComponent(appKey: string) {
      return registry[appKey];
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
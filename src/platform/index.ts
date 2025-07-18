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

import { _Platform } from './spec';

type PlatformSpec = typeof _Platform.spec;

export class Platform {

  static get type() {
    return _Platform.spec;
  }

  static select<T>(config: {
    [key in PlatformSpec | (string & {})]?: T;
  } & {
    default: T;
  }): T {
    return config[this.type] ?? config.default;
  }

  static get isRealDevice() {
    return _Platform.isRealDevice;
  }

  static get isMacCatalystApp() {
    return _Platform.isMacCatalystApp;
  }

  static get isiOSAppOnMac() {
    return _Platform.isiOSAppOnMac;
  }

  static get infoDictionary() {
    return _Platform.infoDictionary;
  }

  static get localizedInfoDictionary() {
    return _Platform.localizedInfoDictionary;
  }

  static get appVersion() {
    return _Platform.appVersion;
  }

  static get buildVersion() {
    return _Platform.buildVersion;
  }

  static get bundleIdentifier() {
    return _Platform.bundleIdentifier;
  }

  static async identifierForVendor() {
    return _Platform.identifierForVendor();
  }
}

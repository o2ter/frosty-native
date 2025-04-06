//
//  index.apple.ts
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
import { _PlatformSpec } from './types';

namespace global {
  declare const __APPLE_SPEC__: {
    processInfo: {
      environment: {
        [key: string]: string;
      };
    };
    arguments: [string];
    processName: string;
    processIdentifier: number;
    globallyUniqueString: string;
    userName: string;
    fullUserName: string;
    hostName: string;
    isLowPowerModeEnabled: boolean;
    isMacCatalystApp: boolean;
    isiOSAppOnMac: boolean;
    operatingSystemVersionString: string;
    operatingSystemVersion: {
      majorVersion: number;
      minorVersion: number;
      patchVersion: number;
    };
    physicalMemory: number;
    processorCount: number;
    activeProcessorCount: number;
    systemUptime: number;
    thermalState: number;
  };
}

export const _Platform: _PlatformSpec = {
  OS: 'apple'
}
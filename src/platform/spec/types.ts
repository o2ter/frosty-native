//
//  types.ts
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

import { Awaitable } from '@o2ter/utils-js';

/** @internal */
declare global {

  namespace __NS_APPLE_SPEC__ {

    interface Hash {
      update(buffer: Uint8Array): void;
      digest(): Uint8Array;
      clone(): Hash;
    }

    interface Crypto {
      randomUUID(): string;
      getRandomValues(buffer: Uint8Array): Uint8Array;
      randomBytes(length: number): Uint8Array;
      createHash(algorithm: string): Hash;
      createHamc(algorithm: string, secret: Uint8Array): Hash;
    }

    interface ProcessInfo {
      environment: {
        [key: string]: string;
      };
      arguments: [string];
      processName: string;
      processIdentifier: number;
      globallyUniqueString: string;
      hostName: string;
      isLowPowerModeEnabled: boolean;
      isRealDevice: boolean;
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
    }

    interface DeviceInfo {
      identifierForVendor(): Awaitable<string | undefined>;
    }

    interface BundleInfo {
      get appVersion(): string | undefined;
      get buildVersion(): string | undefined;
      get bundleIdentifier(): string | undefined;
      get infoDictionary(): { [key: string]: string; }
      get localizedInfoDictionary(): { [key: string]: string; }
    }

    interface FileSystem {
      homeDirectory(): string;
      temporaryDirectory(): string;
      currentDirectoryPath(): string;
      changeCurrentDirectoryPath(path: string): boolean;
    }

  }

  const __APPLE_SPEC__: {
    get crypto(): __NS_APPLE_SPEC__.Crypto;
    get processInfo(): __NS_APPLE_SPEC__.ProcessInfo;
    get deviceInfo(): __NS_APPLE_SPEC__.DeviceInfo;
    get bundleInfo(): __NS_APPLE_SPEC__.BundleInfo;
    get FileSystem(): __NS_APPLE_SPEC__.FileSystem;
  };

  namespace __NS_ANDROID_SPEC__ {

    interface Crypto {
      randomUUID(): string;
      randomBytes(length: number): Uint8Array;
    }

    interface ProcessInfo {
      isRealDevice: boolean;
    }

    interface DeviceInfo {
      identifierForVendor(): string;
    }

    interface BundleInfo {
      get appVersion(): string | undefined;
      get buildVersion(): string | undefined;
      get bundleIdentifier(): string | undefined;
    }
  }

  const __ANDROID_SPEC__: {
    get crypto(): __NS_ANDROID_SPEC__.Crypto;
    get processInfo(): __NS_ANDROID_SPEC__.ProcessInfo;
    get deviceInfo(): __NS_ANDROID_SPEC__.DeviceInfo;
    get bundleInfo(): __NS_ANDROID_SPEC__.BundleInfo;
  };
}

export type _PlatformSpec = Readonly<{
  spec: 'android' | 'apple' | 'web';
  isRealDevice: boolean;
  isMacCatalystApp: boolean;
  isiOSAppOnMac: boolean;
  appVersion: string | undefined;
  buildVersion: string | undefined;
  bundleIdentifier: string | undefined;
  infoDictionary: {
    [key: string]: string;
  };
  localizedInfoDictionary: {
    [key: string]: string;
  };
  identifierForVendor(): Awaitable<string | undefined>;
}>;

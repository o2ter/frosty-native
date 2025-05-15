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

    interface Bundle {
      get bundleIdentifier(): string | undefined;
      get infoDictionary(): { [key: string]: string; }
      get localizedInfoDictionary(): { [key: string]: string; }
    }

    interface FileSystem {
      homeDirectory(): string;
      temporaryDirectory(): string;
    }

  }

  const __APPLE_SPEC__: {
    get crypto(): __NS_APPLE_SPEC__.Crypto;
    get processInfo(): __NS_APPLE_SPEC__.ProcessInfo;
    get Bundle(): {
      main: __NS_APPLE_SPEC__.Bundle;
    };
    get FileSystem(): __NS_APPLE_SPEC__.FileSystem;
  };
}

export type _PlatformSpec = Readonly<{
  spec: 'android' | 'apple' | 'web';
  isMacCatalystApp: boolean;
  isiOSAppOnMac: boolean;
  bundleIdentifier: string | undefined;
  infoDictionary: {
    [key: string]: string;
  };
  localizedInfoDictionary: {
    [key: string]: string;
  };
}>;

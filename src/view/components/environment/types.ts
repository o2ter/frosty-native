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

export const defaultEnvironmentValues = {
  scenePhase: 'unknown',
  layoutDirection: 'ltr',
  pixelDensity: 1,
  pixelLength: 1,
  colorScheme: 'light',
  userLocale: 'en-US',
  languages: ['en-US'],
  timeZone: 'UTC',
  displayWidth: 0,
  displayHeight: 0,
  safeAreaInsets: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  network: {
    online: false,
  },
} as const;

export type EnvironmentValues = {
  scenePhase: 'background' | 'inactive' | 'active' | 'unknown';
  layoutDirection: 'ltr' | 'rtl';
  pixelDensity: number;
  pixelLength: number;
  colorScheme: 'light' | 'dark' | (string & {});
  userLocale: string;
  languages: string[];
  timeZone: string;
  displayWidth: number;
  displayHeight: number;
  safeAreaInsets: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  network: {
    online: boolean;
    type?: 'wifi' | 'cellular' | 'ethernet';
  },
  [x: string]: any;
};

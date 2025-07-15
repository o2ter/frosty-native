//
//  defaults.web.tsx
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

import { useColorScheme, useVisibility, useWindow, useWindowMetrics } from 'frosty/web';
import { defaultEnvironmentValues } from './types';

export const useDefault = () => {
  const window = useWindow();
  const { document, visualViewport } = window;
  const {
    devicePixelRatio,
    safeAreaInsets,
  } = useWindowMetrics();

  const scenePhase = useVisibility();

  let height;
  let width;
  if (visualViewport) {
    height = Math.round(visualViewport.height * visualViewport.scale);
    width = Math.round(visualViewport.width * visualViewport.scale);
  } else {
    const docEl = document.documentElement;
    height = docEl.clientHeight;
    width = docEl.clientWidth;
  }

  return {
    ...defaultEnvironmentValues,
    scenePhase,
    layoutDirection: document.dir === 'rtl' ? 'rtl' : 'ltr',
    pixelDensity: devicePixelRatio,
    pixelLength: 1 / devicePixelRatio,
    colorScheme: useColorScheme(),
    displayWidth: width,
    displayHeight: height,
    safeAreaInsets,
    ...typeof navigator === 'undefined' ? {} : {
      userLocale: navigator.language,
      languages: navigator.languages || [navigator.language],
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  } as const;
};

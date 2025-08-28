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

/** Type for color values represented as 32-bit integers (RGBA) */
export type ColorValue = number;

/** Type for normalized color component values (0-1) */
export type NormalizedComponent = number;

/** Web color names mapped to their RGBA values */
const WEB_COLORS = {
  transparent: 0x00000000,
  aliceblue: 0xf0f8ffff,
  antiquewhite: 0xfaebd7ff,
  aqua: 0x00ffffff,
  aquamarine: 0x7fffd4ff,
  azure: 0xf0ffffff,
  beige: 0xf5f5dcff,
  bisque: 0xffe4c4ff,
  black: 0x000000ff,
  blanchedalmond: 0xffebcdff,
  blue: 0x0000ffff,
  blueviolet: 0x8a2be2ff,
  brown: 0xa52a2aff,
  burlywood: 0xdeb887ff,
  cadetblue: 0x5f9ea0ff,
  chartreuse: 0x7fff00ff,
  chocolate: 0xd2691eff,
  coral: 0xff7f50ff,
  cornflowerblue: 0x6495edff,
  cornsilk: 0xfff8dcff,
  crimson: 0xdc143cff,
  cyan: 0x00ffffff,
  darkblue: 0x00008bff,
  darkcyan: 0x008b8bff,
  darkgoldenrod: 0xb8860bff,
  darkgray: 0xa9a9a9ff,
  darkgreen: 0x006400ff,
  darkkhaki: 0xbdb76bff,
  darkmagenta: 0x8b008bff,
  darkolivegreen: 0x556b2fff,
  darkorange: 0xff8c00ff,
  darkorchid: 0x9932ccff,
  darkred: 0x8b0000ff,
  darksalmon: 0xe9967aff,
  darkseagreen: 0x8fbc8fff,
  darkslateblue: 0x483d8bff,
  darkslategray: 0x2f4f4fff,
  darkturquoise: 0x00ced1ff,
  darkviolet: 0x9400d3ff,
  deeppink: 0xff1493ff,
  deepskyblue: 0x00bfffff,
  dimgray: 0x696969ff,
  dodgerblue: 0x1e90ffff,
  feldspar: 0xd19275ff,
  firebrick: 0xb22222ff,
  floralwhite: 0xfffaf0ff,
  forestgreen: 0x228b22ff,
  fuchsia: 0xff00ffff,
  gainsboro: 0xdcdcdcff,
  ghostwhite: 0xf8f8ffff,
  gold: 0xffd700ff,
  goldenrod: 0xdaa520ff,
  gray: 0x808080ff,
  green: 0x008000ff,
  greenyellow: 0xadff2fff,
  honeydew: 0xf0fff0ff,
  hotpink: 0xff69b4ff,
  indianred: 0xcd5c5cff,
  indigo: 0x4b0082ff,
  ivory: 0xfffff0ff,
  khaki: 0xf0e68cff,
  lavender: 0xe6e6faff,
  lavenderblush: 0xfff0f5ff,
  lawngreen: 0x7cfc00ff,
  lemonchiffon: 0xfffacdff,
  lightblue: 0xadd8e6ff,
  lightcoral: 0xf08080ff,
  lightcyan: 0xe0ffffff,
  lightgoldenrodyellow: 0xfafad2ff,
  lightgrey: 0xd3d3d3ff,
  lightgreen: 0x90ee90ff,
  lightpink: 0xffb6c1ff,
  lightsalmon: 0xffa07aff,
  lightseagreen: 0x20b2aaff,
  lightskyblue: 0x87cefaff,
  lightslateblue: 0x8470ffff,
  lightslategray: 0x778899ff,
  lightsteelblue: 0xb0c4deff,
  lightyellow: 0xffffe0ff,
  lime: 0x00ff00ff,
  limegreen: 0x32cd32ff,
  linen: 0xfaf0e6ff,
  magenta: 0xff00ffff,
  maroon: 0x800000ff,
  mediumaquamarine: 0x66cdaaff,
  mediumblue: 0x0000cdff,
  mediumorchid: 0xba55d3ff,
  mediumpurple: 0x9370d8ff,
  mediumseagreen: 0x3cb371ff,
  mediumslateblue: 0x7b68eeff,
  mediumspringgreen: 0x00fa9aff,
  mediumturquoise: 0x48d1ccff,
  mediumvioletred: 0xc71585ff,
  midnightblue: 0x191970ff,
  mintcream: 0xf5fffaff,
  mistyrose: 0xffe4e1ff,
  moccasin: 0xffe4b5ff,
  navajowhite: 0xffdeadff,
  navy: 0x000080ff,
  oldlace: 0xfdf5e6ff,
  olive: 0x808000ff,
  olivedrab: 0x6b8e23ff,
  orange: 0xffa500ff,
  orangered: 0xff4500ff,
  orchid: 0xda70d6ff,
  palegoldenrod: 0xeee8aaff,
  palegreen: 0x98fb98ff,
  paleturquoise: 0xafeeeeff,
  palevioletred: 0xd87093ff,
  papayawhip: 0xffefd5ff,
  peachpuff: 0xffdab9ff,
  peru: 0xcd853fff,
  pink: 0xffc0cbff,
  plum: 0xdda0ddff,
  powderblue: 0xb0e0e6ff,
  purple: 0x800080ff,
  rebeccapurple: 0x663399ff,
  red: 0xff0000ff,
  rosybrown: 0xbc8f8fff,
  royalblue: 0x4169e1ff,
  saddlebrown: 0x8b4513ff,
  salmon: 0xfa8072ff,
  sandybrown: 0xf4a460ff,
  seagreen: 0x2e8b57ff,
  seashell: 0xfff5eeff,
  sienna: 0xa0522dff,
  silver: 0xc0c0c0ff,
  skyblue: 0x87ceebff,
  slateblue: 0x6a5acdff,
  slategray: 0x708090ff,
  snow: 0xfffafaff,
  springgreen: 0x00ff7fff,
  steelblue: 0x4682b4ff,
  tan: 0xd2b48cff,
  teal: 0x008080ff,
  thistle: 0xd8bfd8ff,
  tomato: 0xff6347ff,
  turquoise: 0x40e0d0ff,
  violet: 0xee82eeff,
  violetred: 0xd02090ff,
  wheat: 0xf5deb3ff,
  white: 0xffffffff,
  whitesmoke: 0xf5f5f5ff,
  yellow: 0xffff00ff,
  yellowgreen: 0x9acd32ff,
} as const;

/**
 * Converts a hue value to RGB using the HSL color model algorithm
 * @param p - Intermediate value in HSL to RGB conversion
 * @param q - Intermediate value in HSL to RGB conversion  
 * @param t - Hue value (normalized to 0-1)
 * @returns RGB component value (0-1)
 */
const hue2rgb = (p: number, q: number, t: number): number => {
  // Normalize hue to 0-1 range
  let normalizedT = t < 0 ? t + 1 : t > 1 ? t - 1 : t;

  if (normalizedT < 1 / 6) return p + (q - p) * 6 * normalizedT;
  if (normalizedT < 1 / 2) return q;
  if (normalizedT < 2 / 3) return p + (q - p) * (2 / 3 - normalizedT) * 6;
  return p;
};

/**
 * Converts HSL color values to RGB format
 * @param h - Hue (0-1, where 1 = 360 degrees)
 * @param s - Saturation (0-1)
 * @param l - Lightness (0-1)
 * @returns 32-bit RGBA color value (without alpha channel set)
 */
export const hslToRgb = (h: number, s: number, l: number): ColorValue => {
  if (s < 0 || s > 1 || l < 0 || l > 1) {
    throw new Error('HSL values must be between 0 and 1');
  }
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  
  return (
    (Math.round(r * 255) << 24) |
    (Math.round(g * 255) << 16) |
    (Math.round(b * 255) << 8)
  );
};

/**
 * Converts HWB (Hue, Whiteness, Blackness) color values to RGB format
 * @param h - Hue (0-1, where 1 = 360 degrees)
 * @param w - Whiteness (0-1)
 * @param b - Blackness (0-1)
 * @returns 32-bit RGBA color value (without alpha channel set)
 */
export const hwbToRgb = (h: number, w: number, b: number): ColorValue => {
  if (w < 0 || w > 1 || b < 0 || b > 1) {
    throw new Error('HWB whiteness and blackness values must be between 0 and 1');
  }
  
  // If whiteness + blackness >= 1, return grayscale
  if (w + b >= 1) {
    const gray = Math.round((w * 255) / (w + b));
    return (gray << 24) | (gray << 16) | (gray << 8);
  }
  
  const factor = 1 - w - b;
  const red = hue2rgb(0, 1, h + 1 / 3) * factor + w;
  const green = hue2rgb(0, 1, h) * factor + w;
  const blue = hue2rgb(0, 1, h - 1 / 3) * factor + w;
  
  return (
    (Math.round(red * 255) << 24) |
    (Math.round(green * 255) << 16) |
    (Math.round(blue * 255) << 8)
  );
};
/** Interface for color matcher patterns */
interface ColorMatchers {
  rgb: RegExp;
  rgba: RegExp;
  hsl: RegExp;
  hsla: RegExp;
  hwb: RegExp;
  hex3: RegExp;
  hex4: RegExp;
  hex6: RegExp;
  hex8: RegExp;
}

/** Helper functions for regex pattern building */
const regexHelpers = {
  NUMBER: '[-+]?\\d*\\.?\\d+',
  get PERCENTAGE() { return this.NUMBER + '%'; },

  call: (...args: string[]): string =>
    '\\(\\s*(' + args.join(')\\s*,?\\s*(') + ')\\s*\\)',

  callWithSlashSeparator: (...args: string[]): string => {
    const allButLast = args.slice(0, -1).join(')\\s*,?\\s*(');
    const last = args[args.length - 1];
    return `\\(\\s*(${allButLast})\\s*/\\s*(${last})\\s*\\)`;
  },

  commaSeparatedCall: (...args: string[]): string =>
    '\\(\\s*(' + args.join(')\\s*,\\s*(') + ')\\s*\\)',
};

/** Parsing utilities for color components */
const parsers = {
  to255: (str: string): number => Math.max(0, Math.min(255, parseInt(str, 10))),
  to360: (str: string): number => (((parseFloat(str) % 360) + 360) % 360) / 360,
  to1: (str: string): number => {
    const num = parseFloat(str);
    if (num < 0) return 0;
    if (num > 1) return 255;
    return Math.round(num * 255);
  },
  percentage: (str: string): number => Math.max(0, Math.min(100, parseFloat(str))) / 100,
};

/**
 * Normalizes a color string or number to a 32-bit RGBA color value
 * Supports various color formats including hex, rgb, hsl, hwb, and named colors
 * @param color - Color input (string or number)
 * @returns 32-bit RGBA color value or null if invalid
 */
export const normalizeColor = (() => {
  let cachedMatchers: ColorMatchers | undefined;

  const getMatchers = (): ColorMatchers => {
    if (cachedMatchers === undefined) {
      const { NUMBER, PERCENTAGE, call, callWithSlashSeparator, commaSeparatedCall } = regexHelpers;

      cachedMatchers = {
        rgb: new RegExp('rgb' + call(NUMBER, NUMBER, NUMBER)),
        rgba: new RegExp(
          'rgba(' +
          commaSeparatedCall(NUMBER, NUMBER, NUMBER, NUMBER) +
          '|' +
          callWithSlashSeparator(NUMBER, NUMBER, NUMBER, NUMBER) +
          ')',
        ),
        hsl: new RegExp('hsl' + call(NUMBER, PERCENTAGE, PERCENTAGE)),
        hsla: new RegExp(
          'hsla(' +
          commaSeparatedCall(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER) +
          '|' +
          callWithSlashSeparator(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER) +
          ')',
        ),
        hwb: new RegExp('hwb' + call(NUMBER, PERCENTAGE, PERCENTAGE)),
        hex3: /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex4: /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^#([0-9a-fA-F]{6})$/,
        hex8: /^#([0-9a-fA-F]{8})$/,
      };
    }
    return cachedMatchers;
  };

  const normalizeKeyword = (name: string): ColorValue | null => {
    const lowercaseName = name.toLowerCase() as keyof typeof WEB_COLORS;
    return WEB_COLORS[lowercaseName] ?? null;
  };

  return function normalizeColor(color: string | number): ColorValue | null {
    // Handle numeric input
    if (typeof color === 'number') {
      return (color >>> 0 === color && color >= 0 && color <= 0xffffffff) ? color : null;
    }

    if (typeof color !== 'string') return null;

    const matchers = getMatchers();
    let match: RegExpExecArray | null;

    // Hex6 (most common, check first)
    if ((match = matchers.hex6.exec(color))) {
      return parseInt(match[1] + 'ff', 16) >>> 0;
    }

    // Named colors
    const colorFromKeyword = normalizeKeyword(color);
    if (colorFromKeyword != null) return colorFromKeyword;

    // RGB format
    if ((match = matchers.rgb.exec(color))) {
      return (
        ((parsers.to255(match[1]) << 24) | // r
          (parsers.to255(match[2]) << 16) | // g
          (parsers.to255(match[3]) << 8) |  // b
          0x000000ff) >>> 0                  // a
      );
    }

    // RGBA format (two notations supported)
    if ((match = matchers.rgba.exec(color))) {
      if (match[6] !== undefined) {
        // rgba(R G B / A) notation
        return (
          ((parsers.to255(match[6]) << 24) | // r
            (parsers.to255(match[7]) << 16) | // g
            (parsers.to255(match[8]) << 8) |  // b
            parsers.to1(match[9])) >>> 0       // a
        );
      }
      // rgba(R, G, B, A) notation
      return (
        ((parsers.to255(match[2]) << 24) | // r
          (parsers.to255(match[3]) << 16) | // g
          (parsers.to255(match[4]) << 8) |  // b
          parsers.to1(match[5])) >>> 0       // a
      );
    }

    // Hex3 format
    if ((match = matchers.hex3.exec(color))) {
      const r = match[1] + match[1];
      const g = match[2] + match[2];
      const b = match[3] + match[3];
      return parseInt(r + g + b + 'ff', 16) >>> 0;
    }

    // Hex8 format
    if ((match = matchers.hex8.exec(color))) {
      return parseInt(match[1], 16) >>> 0;
    }

    // Hex4 format
    if ((match = matchers.hex4.exec(color))) {
      const r = match[1] + match[1];
      const g = match[2] + match[2];
      const b = match[3] + match[3];
      const a = match[4] + match[4];
      return parseInt(r + g + b + a, 16) >>> 0;
    }

    // HSL format
    if ((match = matchers.hsl.exec(color))) {
      return (
        (hslToRgb(
          parsers.to360(match[1]),      // h
          parsers.percentage(match[2]), // s
          parsers.percentage(match[3])  // l
        ) | 0x000000ff) >>> 0           // a
      );
    }

    // HSLA format (two notations supported)
    if ((match = matchers.hsla.exec(color))) {
      if (match[6] !== undefined) {
        // hsla(H S L / A) notation
        return (
          (hslToRgb(
            parsers.to360(match[6]),      // h
            parsers.percentage(match[7]), // s
            parsers.percentage(match[8])  // l
          ) | parsers.to1(match[9])) >>> 0 // a
        );
      }
      // hsla(H, S, L, A) notation
      return (
        (hslToRgb(
          parsers.to360(match[2]),      // h
          parsers.percentage(match[3]), // s
          parsers.percentage(match[4])  // l
        ) | parsers.to1(match[5])) >>> 0 // a
      );
    }

    // HWB format
    if ((match = matchers.hwb.exec(color))) {
      return (
        (hwbToRgb(
          parsers.to360(match[1]),      // h
          parsers.percentage(match[2]), // w
          parsers.percentage(match[3])  // b
        ) | 0x000000ff) >>> 0           // a
      );
    }

    return null;
  };
})();

/** Color component extraction functions */
export const getRed = (color: ColorValue): number => (color >>> 24) & 0xff;
export const getGreen = (color: ColorValue): number => (color >>> 16) & 0xff;
export const getBlue = (color: ColorValue): number => (color >>> 8) & 0xff;
export const getAlpha = (color: ColorValue): number => color & 0xff;

/**
 * Creates a color value from RGBA components
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @param a - Alpha component (0-255), defaults to 255 (opaque)
 * @returns 32-bit RGBA color value
 */
export const rgba = (r: number, g: number, b: number, a: number = 255): ColorValue => {
  const clamp = (value: number) => Math.round(Math.max(0, Math.min(255, value)));
  return (
    (clamp(r) << 24) |
    (clamp(g) << 16) |
    (clamp(b) << 8) |
    clamp(a)
  ) >>> 0;
};

/**
 * Converts a color value to a hex string
 * @param color - 32-bit RGBA color value
 * @param includeAlpha - Whether to include alpha in the output
 * @returns Hex string representation (e.g., "#FF0000" or "#FF0000FF")
 */
export const toHexString = (color: ColorValue, includeAlpha: boolean = false): string => {
  const toHex = (value: number): string => value.toString(16).padStart(2, '0').toUpperCase();

  const r = getRed(color);
  const g = getGreen(color);
  const b = getBlue(color);
  const a = getAlpha(color);

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return includeAlpha || a !== 255 ? `${hex}${toHex(a)}` : hex;
};

/**
 * Utility function to normalize color input to ColorValue
 */
const toColorValue = (color: string | ColorValue): ColorValue => {
  const normalized = typeof color === 'string' ? normalizeColor(color) : color;
  if (normalized === null) {
    throw new Error('Invalid color input');
  }
  return normalized;
};

/**
 * Mixes two colors by interpolating between them
 * @param color1 - First color (string or ColorValue)
 * @param color2 - Second color (string or ColorValue)
 * @param weight - Weight of color1 (0-1, where 0 = all color2, 1 = all color1)
 * @returns Hex string of the mixed color
 */
export const mixColor = (
  color1: string | ColorValue,
  color2: string | ColorValue,
  weight: number
): string => {
  const c1 = toColorValue(color1);
  const c2 = toColorValue(color2);
  const w = Math.max(0, Math.min(1, weight));

  // Extract and interpolate components
  const r = Math.round(getRed(c2) + (getRed(c1) - getRed(c2)) * w);
  const g = Math.round(getGreen(c2) + (getGreen(c1) - getGreen(c2)) * w);
  const b = Math.round(getBlue(c2) + (getBlue(c1) - getBlue(c2)) * w);
  const a = Math.round(getAlpha(c2) + (getAlpha(c1) - getAlpha(c2)) * w);

  return toHexString(rgba(r, g, b, a));
};

/**
 * Tints a color by mixing it with white
 * @param color - Color to tint (string or ColorValue)
 * @param weight - Amount of tinting (0-1, where 0 = no change, 1 = white)
 * @returns Hex string of the tinted color
 */
export const tintColor = (color: string | ColorValue, weight: number): string =>
  mixColor('#ffffff', color, weight);

/**
 * Shades a color by mixing it with black
 * @param color - Color to shade (string or ColorValue)
 * @param weight - Amount of shading (0-1, where 0 = no change, 1 = black)
 * @returns Hex string of the shaded color
 */
export const shadeColor = (color: string | ColorValue, weight: number): string =>
  mixColor('#000000', color, weight);

/**
 * Shifts a color lighter or darker based on weight
 * @param color - Color to shift (string or ColorValue)
 * @param weight - Shift amount (-1 to 1, negative = tint, positive = shade)
 * @returns Hex string of the shifted color
 */
export const shiftColor = (color: string | ColorValue, weight: number): string =>
  weight > 0 ? shadeColor(color, weight) : tintColor(color, -weight);

/**
 * Calculates the relative luminance of a color according to WCAG 2.1
 * @param color - Color to calculate luminance for (string or ColorValue)
 * @returns Luminance value (0-1, where 0 = black, 1 = white)
 */
export const luminance = (color: string | ColorValue): number => {
  const c = toColorValue(color);

  // Extract and normalize RGB components to 0-1 range
  const normalize = (component: number): number => {
    const normalized = component / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  };

  const r = normalize(getRed(c));
  const g = normalize(getGreen(c));
  const b = normalize(getBlue(c));

  // Calculate relative luminance using ITU-R BT.709 coefficients
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Calculates the contrast ratio between two colors according to WCAG 2.1
 * @param background - Background color (string or ColorValue)
 * @param foreground - Foreground color (string or ColorValue)
 * @returns Contrast ratio (1-21, where 1 = no contrast, 21 = maximum contrast)
 */
export const contrastRatio = (
  background: string | ColorValue,
  foreground: string | ColorValue
): number => {
  const l1 = luminance(background);
  const l2 = luminance(foreground);
  return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
};

/**
 * Finds the best contrasting color from a set of options
 * @param background - Background color (string or ColorValue)
 * @param colorContrastDark - Dark color option (string or ColorValue)
 * @param colorContrastLight - Light color option (string or ColorValue)
 * @param minContrastRatio - Minimum acceptable contrast ratio (default: 4.5)
 * @returns Hex string of the color with the best contrast
 */
export const colorContrast = (
  background: string | ColorValue,
  colorContrastDark: string | ColorValue,
  colorContrastLight: string | ColorValue,
  minContrastRatio: number = 4.5
): string => {
  const foregrounds = [colorContrastLight, colorContrastDark, '#ffffff', '#000000'];
  let maxRatio = 0;
  let bestColor: string | ColorValue = background;

  for (const color of foregrounds) {
    const ratio = contrastRatio(background, color);
    if (ratio >= minContrastRatio) {
      return toHexString(toColorValue(color));
    }
    if (ratio > maxRatio) {
      maxRatio = ratio;
      bestColor = color;
    }
  }

  return toHexString(toColorValue(bestColor));
};

//
//  color.test.ts
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

import {
  hslToRgb,
  hwbToRgb,
  normalizeColor,
  getRed,
  getGreen,
  getBlue,
  getAlpha,
  rgba,
  toHexString,
  type ColorValue,
} from '../src/internal/color';

describe('Color Utilities', () => {
  describe('hslToRgb', () => {
    it('should convert HSL to RGB correctly', () => {
      // Red: hsl(0, 100%, 50%)
      const red = hslToRgb(0, 1, 0.5);
      expect(getRed(red | 0xff)).toBe(255);
      expect(getGreen(red | 0xff)).toBe(0);
      expect(getBlue(red | 0xff)).toBe(0);

      // Green: hsl(120, 100%, 50%)
      const green = hslToRgb(120/360, 1, 0.5);
      expect(getRed(green | 0xff)).toBe(0);
      expect(getGreen(green | 0xff)).toBe(255);
      expect(getBlue(green | 0xff)).toBe(0);

      // Blue: hsl(240, 100%, 50%)
      const blue = hslToRgb(240/360, 1, 0.5);
      expect(getRed(blue | 0xff)).toBe(0);
      expect(getGreen(blue | 0xff)).toBe(0);
      expect(getBlue(blue | 0xff)).toBe(255);
    });

    it('should handle grayscale colors', () => {
      // White: hsl(0, 0%, 100%)
      const white = hslToRgb(0, 0, 1);
      expect(getRed(white | 0xff)).toBe(255);
      expect(getGreen(white | 0xff)).toBe(255);
      expect(getBlue(white | 0xff)).toBe(255);

      // Black: hsl(0, 0%, 0%)
      const black = hslToRgb(0, 0, 0);
      expect(getRed(black | 0xff)).toBe(0);
      expect(getGreen(black | 0xff)).toBe(0);
      expect(getBlue(black | 0xff)).toBe(0);

      // Gray: hsl(0, 0%, 50%)
      const gray = hslToRgb(0, 0, 0.5);
      expect(getRed(gray | 0xff)).toBe(128);
      expect(getGreen(gray | 0xff)).toBe(128);
      expect(getBlue(gray | 0xff)).toBe(128);
    });

    it('should throw error for invalid saturation values', () => {
      expect(() => hslToRgb(0, -0.1, 0.5)).toThrow('HSL values must be between 0 and 1');
      expect(() => hslToRgb(0, 1.1, 0.5)).toThrow('HSL values must be between 0 and 1');
    });

    it('should throw error for invalid lightness values', () => {
      expect(() => hslToRgb(0, 0.5, -0.1)).toThrow('HSL values must be between 0 and 1');
      expect(() => hslToRgb(0, 0.5, 1.1)).toThrow('HSL values must be between 0 and 1');
    });
  });

  describe('hwbToRgb', () => {
    it('should convert HWB to RGB correctly', () => {
      // Pure red: hwb(0, 0%, 0%)
      const red = hwbToRgb(0, 0, 0);
      expect(getRed(red | 0xff)).toBe(255);
      expect(getGreen(red | 0xff)).toBe(0);
      expect(getBlue(red | 0xff)).toBe(0);

      // Pure white: hwb(0, 100%, 0%)
      const white = hwbToRgb(0, 1, 0);
      expect(getRed(white | 0xff)).toBe(255);
      expect(getGreen(white | 0xff)).toBe(255);
      expect(getBlue(white | 0xff)).toBe(255);

      // Pure black: hwb(0, 0%, 100%)
      const black = hwbToRgb(0, 0, 1);
      expect(getRed(black | 0xff)).toBe(0);
      expect(getGreen(black | 0xff)).toBe(0);
      expect(getBlue(black | 0xff)).toBe(0);
    });

    it('should handle whiteness + blackness >= 1', () => {
      // When w + b >= 1, should return gray
      const gray = hwbToRgb(0, 0.6, 0.4);
      const expectedGray = Math.round((0.6 * 255) / (0.6 + 0.4));
      expect(getRed(gray | 0xff)).toBe(expectedGray);
      expect(getGreen(gray | 0xff)).toBe(expectedGray);
      expect(getBlue(gray | 0xff)).toBe(expectedGray);
    });

    it('should throw error for invalid whiteness values', () => {
      expect(() => hwbToRgb(0, -0.1, 0.5)).toThrow('HWB whiteness and blackness values must be between 0 and 1');
      expect(() => hwbToRgb(0, 1.1, 0.5)).toThrow('HWB whiteness and blackness values must be between 0 and 1');
    });

    it('should throw error for invalid blackness values', () => {
      expect(() => hwbToRgb(0, 0.5, -0.1)).toThrow('HWB whiteness and blackness values must be between 0 and 1');
      expect(() => hwbToRgb(0, 0.5, 1.1)).toThrow('HWB whiteness and blackness values must be between 0 and 1');
    });
  });

  describe('normalizeColor', () => {
    describe('hex colors', () => {
      it('should parse 6-digit hex colors', () => {
        expect(normalizeColor('#FF0000')).toBe(0xFF0000FF);
        expect(normalizeColor('#00FF00')).toBe(0x00FF00FF);
        expect(normalizeColor('#0000FF')).toBe(0x0000FFFF);
        expect(normalizeColor('#ffffff')).toBe(0xFFFFFFFF);
        expect(normalizeColor('#000000')).toBe(0x000000FF);
      });

      it('should parse 3-digit hex colors', () => {
        expect(normalizeColor('#F00')).toBe(0xFF0000FF);
        expect(normalizeColor('#0F0')).toBe(0x00FF00FF);
        expect(normalizeColor('#00F')).toBe(0x0000FFFF);
        expect(normalizeColor('#fff')).toBe(0xFFFFFFFF);
        expect(normalizeColor('#000')).toBe(0x000000FF);
      });

      it('should parse 8-digit hex colors with alpha', () => {
        expect(normalizeColor('#FF000080')).toBe(0xFF000080);
        expect(normalizeColor('#00FF0040')).toBe(0x00FF0040);
        expect(normalizeColor('#0000FFFF')).toBe(0x0000FFFF);
      });

      it('should parse 4-digit hex colors with alpha', () => {
        expect(normalizeColor('#F008')).toBe(0xFF000088);
        expect(normalizeColor('#0F04')).toBe(0x00FF0044);
        expect(normalizeColor('#00FF')).toBe(0x0000FFFF);
      });
    });

    describe('named colors', () => {
      it('should parse common named colors', () => {
        expect(normalizeColor('red')).toBe(0xFF0000FF);
        expect(normalizeColor('green')).toBe(0x008000FF);
        expect(normalizeColor('blue')).toBe(0x0000FFFF);
        expect(normalizeColor('white')).toBe(0xFFFFFFFF);
        expect(normalizeColor('black')).toBe(0x000000FF);
        expect(normalizeColor('transparent')).toBe(0x00000000);
      });

      it('should be case insensitive', () => {
        expect(normalizeColor('RED')).toBe(0xFF0000FF);
        expect(normalizeColor('Red')).toBe(0xFF0000FF);
        expect(normalizeColor('rEd')).toBe(0xFF0000FF);
      });

      it('should return null for invalid color names', () => {
        expect(normalizeColor('invalidcolor')).toBeNull();
        expect(normalizeColor('notacolor')).toBeNull();
      });
    });

    describe('RGB colors', () => {
      it('should parse rgb() notation', () => {
        expect(normalizeColor('rgb(255, 0, 0)')).toBe(0xFF0000FF);
        expect(normalizeColor('rgb(0, 255, 0)')).toBe(0x00FF00FF);
        expect(normalizeColor('rgb(0, 0, 255)')).toBe(0x0000FFFF);
        expect(normalizeColor('rgb(128, 128, 128)')).toBe(0x808080FF);
      });

      it('should parse rgba() notation with comma separation', () => {
        expect(normalizeColor('rgba(255, 0, 0, 0.5)')).toBe(0xFF000080);
        expect(normalizeColor('rgba(0, 255, 0, 0)')).toBe(0x00FF0000);
        expect(normalizeColor('rgba(0, 0, 255, 1)')).toBe(0x0000FFFF);
      });

      it('should parse rgba() notation with slash separation', () => {
        expect(normalizeColor('rgba(255 0 0 / 0.5)')).toBe(0xFF000080);
        expect(normalizeColor('rgba(0 255 0 / 0)')).toBe(0x00FF0000);
        expect(normalizeColor('rgba(0 0 255 / 1)')).toBe(0x0000FFFF);
      });

      it('should clamp RGB values to 0-255 range', () => {
        expect(normalizeColor('rgb(-10, 300, 128)')).toBe(0x00FF80FF);
      });
    });

    describe('HSL colors', () => {
      it('should parse hsl() notation', () => {
        expect(normalizeColor('hsl(0, 100%, 50%)')).toBe(0xFF0000FF);
        expect(normalizeColor('hsl(120, 100%, 50%)')).toBe(0x00FF00FF);
        expect(normalizeColor('hsl(240, 100%, 50%)')).toBe(0x0000FFFF);
      });

      it('should parse hsla() notation', () => {
        expect(normalizeColor('hsla(0, 100%, 50%, 0.5)')).toBe(0xFF000080);
        expect(normalizeColor('hsla(120, 100%, 50%, 0)')).toBe(0x00FF0000);
      });

      it('should handle hue wrapping', () => {
        expect(normalizeColor('hsl(360, 100%, 50%)')).toBe(normalizeColor('hsl(0, 100%, 50%)'));
        expect(normalizeColor('hsl(-120, 100%, 50%)')).toBe(normalizeColor('hsl(240, 100%, 50%)'));
      });
    });

    describe('HWB colors', () => {
      it('should parse hwb() notation', () => {
        expect(normalizeColor('hwb(0, 0%, 0%)')).toBe(0xFF0000FF);
        expect(normalizeColor('hwb(120, 0%, 0%)')).toBe(0x00FF00FF);
        expect(normalizeColor('hwb(240, 0%, 0%)')).toBe(0x0000FFFF);
      });
    });

    describe('numeric input', () => {
      it('should accept valid 32-bit color numbers', () => {
        expect(normalizeColor(0xFF0000FF)).toBe(0xFF0000FF);
        expect(normalizeColor(0x00FF00FF)).toBe(0x00FF00FF);
        expect(normalizeColor(0x0000FFFF)).toBe(0x0000FFFF);
        expect(normalizeColor(0)).toBe(0);
        expect(normalizeColor(0xFFFFFFFF)).toBe(0xFFFFFFFF);
      });

      it('should reject invalid numbers', () => {
        expect(normalizeColor(-1)).toBeNull();
        expect(normalizeColor(0x100000000)).toBeNull();
        expect(normalizeColor(1.5)).toBeNull();
      });
    });

    describe('invalid input', () => {
      it('should return null for non-string, non-number input', () => {
        expect(normalizeColor(null as any)).toBeNull();
        expect(normalizeColor(undefined as any)).toBeNull();
        expect(normalizeColor({} as any)).toBeNull();
        expect(normalizeColor([] as any)).toBeNull();
      });

      it('should return null for invalid color strings', () => {
        expect(normalizeColor('invalid')).toBeNull();
        expect(normalizeColor('#GGG')).toBeNull();
        expect(normalizeColor('rgb()')).toBeNull();
        expect(normalizeColor('rgb(256, 256, 256, 256)')).toBeNull();
      });
    });
  });

  describe('Color component extraction', () => {
    const testColor: ColorValue = 0x12345678;

    it('should extract red component', () => {
      expect(getRed(testColor)).toBe(0x12);
    });

    it('should extract green component', () => {
      expect(getGreen(testColor)).toBe(0x34);
    });

    it('should extract blue component', () => {
      expect(getBlue(testColor)).toBe(0x56);
    });

    it('should extract alpha component', () => {
      expect(getAlpha(testColor)).toBe(0x78);
    });

    it('should work with common colors', () => {
      const red = 0xFF0000FF;
      expect(getRed(red)).toBe(255);
      expect(getGreen(red)).toBe(0);
      expect(getBlue(red)).toBe(0);
      expect(getAlpha(red)).toBe(255);

      const transparent = 0xFF000000;
      expect(getRed(transparent)).toBe(255);
      expect(getGreen(transparent)).toBe(0);
      expect(getBlue(transparent)).toBe(0);
      expect(getAlpha(transparent)).toBe(0);
    });
  });

  describe('rgba', () => {
    it('should create color from RGBA components', () => {
      expect(rgba(255, 0, 0, 255)).toBe(0xFF0000FF);
      expect(rgba(0, 255, 0, 255)).toBe(0x00FF00FF);
      expect(rgba(0, 0, 255, 255)).toBe(0x0000FFFF);
      expect(rgba(128, 128, 128, 128)).toBe(0x80808080);
    });

    it('should default alpha to 255 when not provided', () => {
      expect(rgba(255, 0, 0)).toBe(0xFF0000FF);
      expect(rgba(0, 255, 0)).toBe(0x00FF00FF);
      expect(rgba(0, 0, 255)).toBe(0x0000FFFF);
    });

    it('should clamp values to 0-255 range', () => {
      expect(rgba(-10, 300, 128, 400)).toBe(0x00FF80FF);
      expect(rgba(255.7, 0.3, 127.9, 254.1)).toBe(0xFF0080FE);
    });
  });

  describe('toHexString', () => {
    it('should convert color to hex string', () => {
      expect(toHexString(0xFF0000FF)).toBe('#FF0000');
      expect(toHexString(0x00FF00FF)).toBe('#00FF00');
      expect(toHexString(0x0000FFFF)).toBe('#0000FF');
      expect(toHexString(0xFFFFFFFF)).toBe('#FFFFFF');
      expect(toHexString(0x000000FF)).toBe('#000000');
    });

    it('should include alpha when explicitly requested', () => {
      expect(toHexString(0xFF0000FF, true)).toBe('#FF0000FF');
      expect(toHexString(0xFF000080, true)).toBe('#FF000080');
      expect(toHexString(0xFF000000, true)).toBe('#FF000000');
    });

    it('should include alpha when alpha is not 255', () => {
      expect(toHexString(0xFF000080)).toBe('#FF000080');
      expect(toHexString(0xFF000000)).toBe('#FF000000');
      expect(toHexString(0xFF000001)).toBe('#FF000001');
    });

    it('should pad single digit hex values', () => {
      expect(toHexString(0x01020304)).toBe('#01020304');
      expect(toHexString(0x0A0B0CFF)).toBe('#0A0B0C');
    });
  });

  describe('Integration tests', () => {
    it('should maintain color fidelity through conversion cycle', () => {
      const originalColors = [
        '#FF0000',
        '#00FF00',
        '#0000FF',
        '#FFFFFF',
        '#000000',
        '#FF000080',
        'red',
        'green',
        'blue',
        'rgb(128, 64, 192)',
        'rgba(255, 128, 0, 0.5)',
        'hsl(180, 50%, 50%)',
        'hwb(90, 25%, 25%)'
      ];

      originalColors.forEach(colorString => {
        const normalized = normalizeColor(colorString);
        if (normalized !== null) {
          const hexString = toHexString(normalized);
          const renormalized = normalizeColor(hexString);
          expect(renormalized).toBe(normalized);
        }
      });
    });

    it('should correctly extract and reconstruct color components', () => {
      const testColors = [0xFF0000FF, 0x00FF00FF, 0x0000FFFF, 0x80408000];

      testColors.forEach(color => {
        const r = getRed(color);
        const g = getGreen(color);
        const b = getBlue(color);
        const a = getAlpha(color);
        const reconstructed = rgba(r, g, b, a);
        expect(reconstructed).toBe(color);
      });
    });
  });
});

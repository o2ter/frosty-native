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
  mixColor,
  tintColor,
  shadeColor,
  shiftColor,
  luminance,
  contrastRatio,
  colorContrast,
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

  describe('Color manipulation functions', () => {
    describe('mixColor', () => {
      it('should mix two colors correctly', () => {
        // Mix red and blue with equal weight (0.5)
        expect(mixColor('#FF0000', '#0000FF', 0.5)).toBe('#800080');

        // Mix red and white with 0.3 weight (30% red, 70% white)
        // Red: (255, 0, 0), White: (255, 255, 255)
        // Result: White + (Red - White) * 0.3 = (255, 255, 255) + (0, -255, -255) * 0.3 = (255, 179, 179)
        expect(mixColor('#FF0000', '#FFFFFF', 0.3)).toBe('#FFB3B3');

        // Weight 0 should return second color
        expect(mixColor('#FF0000', '#00FF00', 0)).toBe('#00FF00');

        // Weight 1 should return first color
        expect(mixColor('#FF0000', '#00FF00', 1)).toBe('#FF0000');
      });

      it('should work with ColorValue inputs', () => {
        const red = 0xFF0000FF;
        const blue = 0x0000FFFF;
        expect(mixColor(red, blue, 0.5)).toBe('#800080');
      });

      it('should clamp weight to 0-1 range', () => {
        expect(mixColor('#FF0000', '#00FF00', -0.5)).toBe('#00FF00');
        expect(mixColor('#FF0000', '#00FF00', 1.5)).toBe('#FF0000');
      });

      it('should handle alpha channel correctly', () => {
        expect(mixColor('#FF000080', '#0000FF80', 0.5)).toBe('#80008080');
      });

      it('should throw error for invalid colors', () => {
        expect(() => mixColor('invalid', '#FF0000', 0.5)).toThrow('Invalid color input');
        expect(() => mixColor('#FF0000', 'invalid', 0.5)).toThrow('Invalid color input');
      });
    });

    describe('tintColor', () => {
      it('should tint colors with white', () => {
        // Tinting red with white
        expect(tintColor('#FF0000', 0.5)).toBe('#FF8080');
        expect(tintColor('#FF0000', 0)).toBe('#FF0000');
        expect(tintColor('#FF0000', 1)).toBe('#FFFFFF');

        // Tinting blue
        expect(tintColor('#0000FF', 0.3)).toBe('#4D4DFF');
      });

      it('should work with ColorValue inputs', () => {
        expect(tintColor(0xFF0000FF, 0.5)).toBe('#FF8080');
      });
    });

    describe('shadeColor', () => {
      it('should shade colors with black', () => {
        // Shading red with black
        expect(shadeColor('#FF0000', 0.5)).toBe('#800000');
        expect(shadeColor('#FF0000', 0)).toBe('#FF0000');
        expect(shadeColor('#FF0000', 1)).toBe('#000000');

        // Shading blue with 0.3 weight
        // Blue: (0, 0, 255), Black: (0, 0, 0)
        // Result: Black + (Blue - Black) * 0.3 = (0, 0, 0) + (0, 0, 255) * 0.3 = (0, 0, 179)
        expect(shadeColor('#0000FF', 0.3)).toBe('#0000B3');
      });

      it('should work with ColorValue inputs', () => {
        expect(shadeColor(0xFF0000FF, 0.5)).toBe('#800000');
      });
    });

    describe('shiftColor', () => {
      it('should shade for positive weights', () => {
        expect(shiftColor('#FF0000', 0.5)).toBe(shadeColor('#FF0000', 0.5));
      });

      it('should tint for negative weights', () => {
        expect(shiftColor('#FF0000', -0.5)).toBe(tintColor('#FF0000', 0.5));
      });

      it('should return original color for weight 0', () => {
        expect(shiftColor('#FF0000', 0)).toBe('#FF0000');
      });

      it('should work correctly with standard colors and weights', () => {
        // Blue color palette (#0d6efd)
        expect(shiftColor('#0d6efd', -0.8)).toBe('#CFE2FF');
        expect(shiftColor('#0d6efd', -0.6)).toBe('#9EC5FE');
        expect(shiftColor('#0d6efd', -0.4)).toBe('#6EA8FE');
        expect(shiftColor('#0d6efd', -0.2)).toBe('#3D8BFD');
        expect(shiftColor('#0d6efd', 0)).toBe('#0D6EFD');
        expect(shiftColor('#0d6efd', 0.2)).toBe('#0A58CA');
        expect(shiftColor('#0d6efd', 0.4)).toBe('#084298');
        expect(shiftColor('#0d6efd', 0.6)).toBe('#052C65');
        expect(shiftColor('#0d6efd', 0.8)).toBe('#031633');

        // Cyan color palette (#0dcaf0)
        expect(shiftColor('#0dcaf0', -0.8)).toBe('#CFF4FC');
        expect(shiftColor('#0dcaf0', -0.6)).toBe('#9EEAF9');
        expect(shiftColor('#0dcaf0', -0.4)).toBe('#6EDFF6');
        expect(shiftColor('#0dcaf0', -0.2)).toBe('#3DD5F3');
        expect(shiftColor('#0dcaf0', 0)).toBe('#0DCAF0');
        expect(shiftColor('#0dcaf0', 0.2)).toBe('#0AA2C0');
        expect(shiftColor('#0dcaf0', 0.4)).toBe('#087990');
        expect(shiftColor('#0dcaf0', 0.6)).toBe('#055160');
        expect(shiftColor('#0dcaf0', 0.8)).toBe('#032830');

        // Green color palette (#198754)
        expect(shiftColor('#198754', -0.8)).toBe('#D1E7DD');
        expect(shiftColor('#198754', -0.6)).toBe('#A3CFBB');
        expect(shiftColor('#198754', -0.4)).toBe('#75B798');
        expect(shiftColor('#198754', -0.2)).toBe('#479F76');
        expect(shiftColor('#198754', 0)).toBe('#198754');
        expect(shiftColor('#198754', 0.2)).toBe('#146C43');
        expect(shiftColor('#198754', 0.4)).toBe('#0F5132');
        expect(shiftColor('#198754', 0.6)).toBe('#0A3622');
        expect(shiftColor('#198754', 0.8)).toBe('#051B11');

        // Indigo color palette (#6610f2)
        expect(shiftColor('#6610f2', -0.8)).toBe('#E0CFFC');
        expect(shiftColor('#6610f2', -0.6)).toBe('#C29FFA');
        expect(shiftColor('#6610f2', -0.4)).toBe('#A370F7');
        expect(shiftColor('#6610f2', -0.2)).toBe('#8540F5');
        expect(shiftColor('#6610f2', 0)).toBe('#6610F2');
        expect(shiftColor('#6610f2', 0.2)).toBe('#520DC2');
        expect(shiftColor('#6610f2', 0.4)).toBe('#3D0A91');
        expect(shiftColor('#6610f2', 0.6)).toBe('#290661');
        expect(shiftColor('#6610f2', 0.8)).toBe('#140330');

        // Orange color palette (#fd7e14)
        expect(shiftColor('#fd7e14', -0.8)).toBe('#FFE5D0');
        expect(shiftColor('#fd7e14', -0.6)).toBe('#FECBA1');
        expect(shiftColor('#fd7e14', -0.4)).toBe('#FEB272');
        expect(shiftColor('#fd7e14', -0.2)).toBe('#FD9843');
        expect(shiftColor('#fd7e14', 0)).toBe('#FD7E14');
        expect(shiftColor('#fd7e14', 0.2)).toBe('#CA6510');
        expect(shiftColor('#fd7e14', 0.4)).toBe('#984C0C');
        expect(shiftColor('#fd7e14', 0.6)).toBe('#653208');
        expect(shiftColor('#fd7e14', 0.8)).toBe('#331904');

        // Pink color palette (#d63384)
        expect(shiftColor('#d63384', -0.8)).toBe('#F7D6E6');
        expect(shiftColor('#d63384', -0.6)).toBe('#EFADCE');
        expect(shiftColor('#d63384', -0.4)).toBe('#E685B5');
        expect(shiftColor('#d63384', -0.2)).toBe('#DE5C9D');
        expect(shiftColor('#d63384', 0)).toBe('#D63384');
        expect(shiftColor('#d63384', 0.2)).toBe('#AB296A');
        expect(shiftColor('#d63384', 0.4)).toBe('#801F4F');
        expect(shiftColor('#d63384', 0.6)).toBe('#561435');
        expect(shiftColor('#d63384', 0.8)).toBe('#2B0A1A');

        // Purple color palette (#6f42c1)
        expect(shiftColor('#6f42c1', -0.8)).toBe('#E2D9F3');
        expect(shiftColor('#6f42c1', -0.6)).toBe('#C5B3E6');
        expect(shiftColor('#6f42c1', -0.4)).toBe('#A98EDA');
        expect(shiftColor('#6f42c1', -0.2)).toBe('#8C68CD');
        expect(shiftColor('#6f42c1', 0)).toBe('#6F42C1');
        expect(shiftColor('#6f42c1', 0.2)).toBe('#59359A');
        expect(shiftColor('#6f42c1', 0.4)).toBe('#432874');
        expect(shiftColor('#6f42c1', 0.6)).toBe('#2C1A4D');
        expect(shiftColor('#6f42c1', 0.8)).toBe('#160D27');

        // Red color palette (#dc3545)
        expect(shiftColor('#dc3545', -0.8)).toBe('#F8D7DA');
        expect(shiftColor('#dc3545', -0.6)).toBe('#F1AEB5');
        expect(shiftColor('#dc3545', -0.4)).toBe('#EA868F');
        expect(shiftColor('#dc3545', -0.2)).toBe('#E35D6A');
        expect(shiftColor('#dc3545', 0)).toBe('#DC3545');
        expect(shiftColor('#dc3545', 0.2)).toBe('#B02A37');
        expect(shiftColor('#dc3545', 0.4)).toBe('#842029');
        expect(shiftColor('#dc3545', 0.6)).toBe('#58151C');
        expect(shiftColor('#dc3545', 0.8)).toBe('#2C0B0E');

        // Teal color palette (#20c997)
        expect(shiftColor('#20c997', -0.8)).toBe('#D2F4EA');
        expect(shiftColor('#20c997', -0.6)).toBe('#A6E9D5');
        expect(shiftColor('#20c997', -0.4)).toBe('#79DFC1');
        expect(shiftColor('#20c997', -0.2)).toBe('#4DD4AC');
        expect(shiftColor('#20c997', 0)).toBe('#20C997');
        expect(shiftColor('#20c997', 0.2)).toBe('#1AA179');
        expect(shiftColor('#20c997', 0.4)).toBe('#13795B');
        expect(shiftColor('#20c997', 0.6)).toBe('#0D503C');
        expect(shiftColor('#20c997', 0.8)).toBe('#06281E');

        // Yellow color palette (#ffc107)
        expect(shiftColor('#ffc107', -0.8)).toBe('#FFF3CD');
        expect(shiftColor('#ffc107', -0.6)).toBe('#FFE69C');
        expect(shiftColor('#ffc107', -0.4)).toBe('#FFDA6A');
        expect(shiftColor('#ffc107', -0.2)).toBe('#FFCD39');
        expect(shiftColor('#ffc107', 0)).toBe('#FFC107');
        expect(shiftColor('#ffc107', 0.2)).toBe('#CC9A06');
        expect(shiftColor('#ffc107', 0.4)).toBe('#997404');
        expect(shiftColor('#ffc107', 0.6)).toBe('#664D03');
        expect(shiftColor('#ffc107', 0.8)).toBe('#332701');
      });
    });
  });

  describe('Color accessibility functions', () => {
    describe('luminance', () => {
      it('should calculate luminance correctly for standard colors', () => {
        // Pure white should have luminance close to 1
        expect(luminance('#FFFFFF')).toBeCloseTo(1, 2);

        // Pure black should have luminance close to 0
        expect(luminance('#000000')).toBeCloseTo(0, 5);

        // Pure red luminance
        expect(luminance('#FF0000')).toBeCloseTo(0.2126, 3);

        // Pure green luminance
        expect(luminance('#00FF00')).toBeCloseTo(0.7152, 3);

        // Pure blue luminance
        expect(luminance('#0000FF')).toBeCloseTo(0.0722, 3);
      });

      it('should work with ColorValue inputs', () => {
        expect(luminance(0xFFFFFFFF)).toBeCloseTo(1, 2);
        expect(luminance(0x000000FF)).toBeCloseTo(0, 5);
      });

      it('should handle mid-tone grays correctly', () => {
        // 50% gray should have luminance around 0.18-0.22
        const grayLuminance = luminance('#808080');
        expect(grayLuminance).toBeGreaterThan(0.15);
        expect(grayLuminance).toBeLessThan(0.25);
      });

      it('should throw error for invalid colors', () => {
        expect(() => luminance('invalid')).toThrow('Invalid color input');
      });
    });

    describe('contrastRatio', () => {
      it('should calculate contrast ratios correctly', () => {
        // White on black should have maximum contrast (~21)
        const whiteOnBlack = contrastRatio('#000000', '#FFFFFF');
        expect(whiteOnBlack).toBeCloseTo(21, 0);

        // Same colors should have minimum contrast (1)
        expect(contrastRatio('#FF0000', '#FF0000')).toBeCloseTo(1, 2);

        // Order shouldn't matter
        expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(contrastRatio('#FFFFFF', '#000000'), 5);
      });

      it('should work with ColorValue inputs', () => {
        expect(contrastRatio(0x000000FF, 0xFFFFFFFF)).toBeCloseTo(21, 0);
      });

      it('should calculate reasonable ratios for common combinations', () => {
        // Dark gray on white should have good contrast
        const ratio = contrastRatio('#FFFFFF', '#333333');
        expect(ratio).toBeGreaterThan(12);
        expect(ratio).toBeLessThan(15);
      });
    });

    describe('colorContrast', () => {
      it('should return high contrast color when available', () => {
        // On white background, should prefer dark colors
        const result = colorContrast('#FFFFFF', '#333333', '#EEEEEE', 4.5);
        expect(result).toBe('#333333');

        // On black background, should prefer light colors
        const result2 = colorContrast('#000000', '#333333', '#EEEEEE', 4.5);
        expect(result2).toBe('#EEEEEE');
      });

      it('should fallback to white or black if no option meets contrast', () => {
        // On dark background with poor contrast options, should fallback to white
        const result = colorContrast('#222222', '#333333', '#444444', 7);
        expect(result).toBe('#FFFFFF');

        // On light background with poor contrast options, should fallback to black
        const result2 = colorContrast('#DDDDDD', '#CCCCCC', '#EEEEEE', 7);
        expect(result2).toBe('#000000');
      });

      it('should use default minimum contrast ratio of 4.5', () => {
        const result1 = colorContrast('#FFFFFF', '#333333', '#EEEEEE');
        const result2 = colorContrast('#FFFFFF', '#333333', '#EEEEEE', 4.5);
        expect(result1).toBe(result2);
      });

      it('should return best available option when no color meets minimum', () => {
        // When no color meets the minimum, should return the one with highest contrast
        const result = colorContrast('#808080', '#787878', '#888888', 10);
        // Should return one of the options or fallback colors
        expect(['#787878', '#888888', '#FFFFFF', '#000000'].includes(result)).toBe(true);
      });

      it('should work with ColorValue inputs', () => {
        const result = colorContrast(0xFFFFFFFF, 0x333333FF, 0xEEEEEEFF, 4.5);
        expect(result).toBe('#333333');
      });
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

// Tests the font-only inline rule Vite calls at build time (scripts/never-inline-fonts.mjs, R93,
// ADR 0001). It loads the rule on its own, so no Vite config, plugin or native binding is involved.
// This file lives under src/ only because Vitest discovers tests there.
import { describe, expect, it } from 'vitest';
import { neverInlineFonts } from '../scripts/never-inline-fonts.mjs';

const FONT_PATHS = [
  '/a/f.woff2',
  '/a/F.WOFF2',
  '/a/f.woff',
  '/a/F.WOFF',
  '/a/f.ttf',
  '/a/F.TTF',
  '/a/f.otf',
  '/a/F.OTF',
  '/a/f.eot',
  '/a/F.EOT',
];

const NON_FONT_PATHS = [
  '/a/logo.png',
  '/a/icon.svg',
  '/a/index.js',
  '/a/LICENSE',
  '/a/woff2/logo.png',
];

describe('neverInlineFonts', () => {
  it('returns false for every font extension in either letter case', () => {
    for (const filePath of FONT_PATHS) {
      expect(neverInlineFonts(filePath), filePath).toBe(false);
    }
  });

  it('returns undefined for non-font assets, even inside a folder named like a font', () => {
    for (const filePath of NON_FONT_PATHS) {
      expect(neverInlineFonts(filePath), filePath).toBe(undefined);
    }
  });
});

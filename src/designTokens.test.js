// Tests the approved Look's tokens (TG-06, replacing the R130 twelve-hex tests, which pinned a
// palette the owner has since replaced): src/look.css holds the Look's colours as variables in a
// light set and a dark set, src/index.css maps Tailwind's theme onto those variables, and every
// text and background pair the pages use meets 4.5:1 in both themes (R148, G13). Reads the two
// stylesheets and src/components/buttonClasses.js as text; contrast is computed from the parsed
// hex values, nothing is rendered.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { onDarkButtonClasses, primaryButtonClasses, secondaryButtonClasses, navLinkClasses } from './components/buttonClasses.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexCssText = fs.readFileSync(path.join(repositoryRoot, 'src/index.css'), 'utf8');
const lookCssText = fs.readFileSync(path.join(repositoryRoot, 'src/look.css'), 'utf8');
const indexHtmlText = fs.readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');

const THEME_BLOCK = indexCssText.match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
const INLINE_THEME_BLOCK = indexCssText.match(/@theme inline\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

// The three declaration blocks of the Look: the light default, the dark set that follows the
// system unless the visitor picked light, and the dark set a visitor's own pick applies.
const LIGHT_BLOCK = blockAfter(lookCssText, /^:root\s*\{/m);
const SYSTEM_DARK_BLOCK = blockAfter(lookCssText, /:root:not\(\[data-theme="light"\]\)\s*\{/);
const PICKED_DARK_BLOCK = blockAfter(lookCssText, /:root\[data-theme="dark"\]\s*\{/);

// Variables that do not change with the theme: type families, easings and radii.
const THEME_INDEPENDENT = ['display', 'body', 'mono', 'glide', 'spring', 'out', 'r-md', 'r-lg', 'r-xl'];

const light = variablesIn(LIGHT_BLOCK);
const systemDark = variablesIn(SYSTEM_DARK_BLOCK);
const pickedDark = variablesIn(PICKED_DARK_BLOCK);

describe('the Look has a light and a dark value for every themed variable (TG-06)', () => {
  it('declares the light set, the system dark set and the picked dark set', () => {
    expect(Object.keys(light).length).toBeGreaterThan(30);
    expect(Object.keys(systemDark).length).toBeGreaterThan(20);
    expect(Object.keys(pickedDark).length).toBeGreaterThan(20);
  });

  it('gives every themed light variable a value in the system dark set', () => {
    const themed = Object.keys(light).filter((name) => !THEME_INDEPENDENT.includes(name));
    const missing = themed.filter((name) => !(name in systemDark));
    expect(missing).toEqual([]);
  });

  it('gives every themed light variable a value in the picked dark set', () => {
    const themed = Object.keys(light).filter((name) => !THEME_INDEPENDENT.includes(name));
    const missing = themed.filter((name) => !(name in pickedDark));
    expect(missing).toEqual([]);
  });

  it('keeps the system dark set and the picked dark set identical so both routes look the same', () => {
    expect(pickedDark).toEqual(systemDark);
  });

  it('declares no dark variable that the light set lacks', () => {
    const unknown = Object.keys(pickedDark).filter((name) => !(name in light));
    expect(unknown).toEqual([]);
  });

  it('turns the dark sets on color-scheme dark and the light set on color-scheme light', () => {
    expect(LIGHT_BLOCK).toMatch(/color-scheme:\s*light/);
    expect(SYSTEM_DARK_BLOCK).toMatch(/color-scheme:\s*dark/);
    expect(PICKED_DARK_BLOCK).toMatch(/color-scheme:\s*dark/);
  });

  it('applies the system dark set only when the visitor has not picked light', () => {
    expect(lookCssText).toMatch(
      /@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)/,
    );
  });

  it('stills every animation and transition under prefers-reduced-motion', () => {
    const reducedBlock = lookCssText.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
    expect(reducedBlock).toMatch(/animation:\s*none\s*!important/);
    expect(reducedBlock).toMatch(/transition:\s*none\s*!important/);
  });
});

describe('Tailwind reads the Look through variables (TG-06)', () => {
  const mappings = [...INLINE_THEME_BLOCK.matchAll(/--color-([a-z0-9-]+):\s*var\(--([a-z0-9-]+)\)/g)];

  it('maps at least the Look names page, surface, line, ink, muted, dark and peach', () => {
    const names = mappings.map(([, name]) => name);
    for (const name of ['page', 'surface', 'line', 'ink', 'muted', 'dark', 'peach']) {
      expect(names).toContain(name);
    }
  });

  it.each(mappings.map(([, name, target]) => [name, target]))(
    'maps --color-%s onto --%s, which look.css declares',
    (name, target) => {
      expect(target in light).toBe(true);
    },
  );

  it('holds no colour literal in the Tailwind theme, so a theme change cannot be bypassed', () => {
    expect(INLINE_THEME_BLOCK).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(THEME_BLOCK).not.toMatch(/--color-/);
  });

  it('keeps the older names that index.html body classes use, mapped to Look variables', () => {
    const bodyClass = indexHtmlText.match(/<body class="([^"]*)"/)?.[1] ?? '';
    const used = [...bodyClass.matchAll(/(?:bg|text)-([a-z-]+)/g)].map(([, name]) => name);
    expect(used.length).toBeGreaterThan(0);
    for (const name of used) {
      expect(INLINE_THEME_BLOCK).toMatch(new RegExp(`--color-${name}:\\s*var\\(`));
    }
  });
});

describe('type, focus and motion rules', () => {
  it('names the three family stacks', () => {
    expect(THEME_BLOCK).toMatch(/--font-sans:\s*["']?IBM Plex Sans/i);
    expect(THEME_BLOCK).toMatch(/--font-mono:\s*["']?IBM Plex Mono/i);
    expect(THEME_BLOCK).toMatch(/--font-display:\s*["']?Space Grotesk/i);
  });

  it('names the same three families in the Look variables', () => {
    expect(light.display).toMatch(/Space Grotesk/);
    expect(light.body).toMatch(/IBM Plex Sans/);
    expect(light.mono).toMatch(/IBM Plex Mono/);
  });

  it('declares a global :focus-visible rule with an outline', () => {
    const focusVisibleBlock = indexCssText.match(/:focus-visible\s*\{([\s\S]*?)\}/)?.[1] ?? '';
    expect(focusVisibleBlock).toMatch(/outline/i);
  });

  it('carries no orb keyframe', () => {
    expect(indexCssText).not.toMatch(/@keyframes\s+iridescent-pulse/);
    expect(indexCssText).not.toMatch(/@keyframes\s+ping-slow/);
    expect(indexCssText).not.toContain('iridescent');
    expect(indexCssText).not.toContain('ping-slow');
  });

  it('references no font host in either stylesheet', () => {
    expect(indexCssText + lookCssText).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
  });
});

// R148's pairs, now checked in both themes: ink, ink-2 and muted on page, surface and surface-2;
// on-ink on ink (a filled button); dark-ink and dark-muted on the dark band.
const PAIRS = [
  ['ink', 'page'],
  ['ink-2', 'page'],
  ['muted', 'page'],
  ['ink', 'surface'],
  ['ink-2', 'surface'],
  ['muted', 'surface'],
  ['ink', 'surface-2'],
  ['muted', 'surface-2'],
  ['on-ink', 'ink'],
  ['dark-ink', 'dark'],
  ['dark-muted', 'dark'],
];

describe('contrast (R148, G13) in both themes', () => {
  describe.each([
    ['light', light],
    ['dark', pickedDark],
  ])('the %s theme', (themeName, values) => {
    it.each(PAIRS)('%s on %s meets 4.5:1', (foregroundName, backgroundName) => {
      const foreground = values[foregroundName] ?? light[foregroundName];
      const background = values[backgroundName] ?? light[backgroundName];
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
    });
  });
});

describe('button classes (R148)', () => {
  it('the primary button class carries the 48px minimum touch target', () => {
    expect(primaryButtonClasses).toContain('min-h-12');
  });

  it('the nav link class carries the 44px minimum touch target', () => {
    expect(navLinkClasses).toContain('min-h-11');
  });

  it('exports the secondary and on-dark button classes as non-empty strings', () => {
    expect(typeof secondaryButtonClasses).toBe('string');
    expect(secondaryButtonClasses.length).toBeGreaterThan(0);
    expect(typeof onDarkButtonClasses).toBe('string');
    expect(onDarkButtonClasses.length).toBeGreaterThan(0);
  });

  it('colours every button from Look variables, never a hex literal', () => {
    for (const classes of [primaryButtonClasses, secondaryButtonClasses, onDarkButtonClasses, navLinkClasses]) {
      expect(classes).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    }
  });
});

// Returns the text between the braces of the first block whose opening matches `opening`.
function blockAfter(text, opening) {
  const start = text.search(opening);
  if (start === -1) return '';
  const open = text.indexOf('{', start);
  let depth = 0;
  for (let index = open; index < text.length; index += 1) {
    if (text[index] === '{') depth += 1;
    if (text[index] === '}') depth -= 1;
    if (depth === 0) return text.slice(open + 1, index);
  }
  return '';
}

// Maps each `--name: value;` in a block to its value.
function variablesIn(block) {
  const result = {};
  for (const [, name, value] of block.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) {
    result[name] = value.trim();
  }
  return result;
}

// WCAG relative luminance and contrast ratio, computed from parsed hex so the test proves the
// actual token values, not an assertion about them.
function contrastRatio(foregroundHex, backgroundHex) {
  const l1 = relativeLuminance(foregroundHex);
  const l2 = relativeLuminance(backgroundHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToLinearChannels(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToLinearChannels(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`Expected a six-digit hex colour, got "${hex}"`);
  const normalised = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((offset) =>
    parseInt(normalised.slice(offset, offset + 2), 16) / 255,
  );
  return [r, g, b].map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
}

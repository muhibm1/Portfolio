// Tests R130 (the twelve token values, the three family stacks, the focus ring, the orb keyframes
// gone) and R148/G13 (every token text/background pair used meets 4.5:1, and the shared button
// classes carry the minimum touch targets). Reads src/index.css and src/components/buttonClasses.js
// as text; contrast is computed from the parsed hex values, nothing is rendered.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { onDarkButtonClasses, primaryButtonClasses, secondaryButtonClasses, navLinkClasses } from './components/buttonClasses.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexCssText = fs.readFileSync(path.join(repositoryRoot, 'src/index.css'), 'utf8');

const THEME_BLOCK = indexCssText.match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

const TOKENS = {
  ground: '#ECEAE5',
  surface: '#F7F6F3',
  border: '#D6D3CC',
  rule: '#C9C6BE',
  ink: '#17171A',
  body: '#2B2A27',
  muted: '#55534E',
  soft: '#3A3935',
  accent: '#B4400B',
  'on-dark': '#F7F6F3',
  'on-dark-secondary': '#DCDAD4',
  'on-dark-tertiary': '#B9B6AE',
};

describe('design tokens (R130)', () => {
  it.each(Object.entries(TOKENS))('declares --color-%s as %s in @theme', (name, hex) => {
    const pattern = new RegExp(`--color-${name}:\\s*${hex}\\b`, 'i');
    expect(THEME_BLOCK).toMatch(pattern);
  });

  it('names the three family stacks', () => {
    expect(THEME_BLOCK).toMatch(/--font-sans:\s*["']?IBM Plex Sans/i);
    expect(THEME_BLOCK).toMatch(/--font-mono:\s*["']?IBM Plex Mono/i);
    expect(THEME_BLOCK).toMatch(/--font-display:\s*["']?Space Grotesk/i);
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
});

// R148's own list: ink, body, muted and accent on ground and surface (8 pairs), plus on-dark on
// ink (1 pair) = the nine pairs G13 names.
describe('contrast (R148, G13)', () => {
  it.each([
    ['ink', 'ground'],
    ['body', 'ground'],
    ['muted', 'ground'],
    ['accent', 'ground'],
    ['ink', 'surface'],
    ['body', 'surface'],
    ['muted', 'surface'],
    ['accent', 'surface'],
    ['on-dark', 'ink'],
  ])('%s on %s meets 4.5:1', (foregroundName, backgroundName) => {
    const ratio = contrastRatio(TOKENS[foregroundName], TOKENS[backgroundName]);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
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
});

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
  const normalised = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((offset) =>
    parseInt(normalised.slice(offset, offset + 2), 16) / 255,
  );
  return [r, g, b].map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
}

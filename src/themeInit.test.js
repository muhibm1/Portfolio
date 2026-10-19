// Tests the no-flash theme script (TG-06, D2): public/theme-init.js applies a saved light or dark
// choice to <html> before first paint, and index.html loads it as a plain script file with a src
// attribute, because the site's security policy (script-src 'self') and the deploy smoke check
// allow no inline script.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT_PATH = path.join(REPO_ROOT, 'public', 'theme-init.js');
const scriptText = fs.readFileSync(SCRIPT_PATH, 'utf8');
const indexHtmlText = fs.readFileSync(path.join(REPO_ROOT, 'index.html'), 'utf8');

// Runs the script in a bare context with a stand-in localStorage and <html> element, and
// returns the attributes it set.
function runWith(localStorage) {
  const attributes = {};
  const context = {
    localStorage,
    document: { documentElement: { setAttribute: (name, value) => (attributes[name] = value) } },
  };
  vm.runInNewContext(scriptText, context);
  return attributes;
}

describe('public/theme-init.js', () => {
  it('sets data-theme to dark when the saved choice is dark', () => {
    expect(runWith({ getItem: () => 'dark' })).toEqual({ 'data-theme': 'dark' });
  });

  it('sets data-theme to light when the saved choice is light', () => {
    expect(runWith({ getItem: () => 'light' })).toEqual({ 'data-theme': 'light' });
  });

  it.each(['blue', 'Dark', 'DARK', ' dark', '', 'system', '"dark"', '<script>'])(
    'ignores the stored value %j because only light and dark are accepted',
    (stored) => {
      expect(runWith({ getItem: () => stored })).toEqual({});
    },
  );

  it('sets nothing when nothing is saved, so the system setting decides', () => {
    expect(runWith({ getItem: () => null })).toEqual({});
  });

  it('reads only the key named theme', () => {
    const keysRead = [];
    runWith({ getItem: (key) => (keysRead.push(key), null) });
    expect(keysRead).toEqual(['theme']);
  });

  it('does not throw and sets nothing when storage refuses the read', () => {
    const refusing = {
      getItem: () => {
        throw new Error('storage blocked');
      },
    };
    expect(runWith(refusing)).toEqual({});
  });

  it('does not throw when storage does not exist at all', () => {
    expect(() => vm.runInNewContext(scriptText, { document: { documentElement: {} } })).not.toThrow();
  });
});

describe('index.html loads the theme script without any inline script', () => {
  const scriptTags = [...indexHtmlText.matchAll(/<script\b[^>]*>/gi)].map(([tag]) => tag);

  it('has a script tag for theme-init.js with a src that starts from the base path', () => {
    const themeTag = scriptTags.find((tag) => tag.includes('theme-init.js'));
    expect(themeTag).toBeDefined();
    expect(themeTag).toMatch(/\ssrc="%BASE_URL%theme-init\.js"/);
  });

  it('loads it as a blocking classic script: no defer, no async, no module type', () => {
    const themeTag = scriptTags.find((tag) => tag.includes('theme-init.js'));
    expect(themeTag).not.toMatch(/\b(defer|async)\b/i);
    expect(themeTag).not.toMatch(/type\s*=\s*["']module["']/i);
  });

  it('puts the script in <head>, before the app script, so it runs before first paint', () => {
    const headEnd = indexHtmlText.indexOf('</head>');
    expect(indexHtmlText.indexOf('theme-init.js')).toBeGreaterThan(-1);
    expect(indexHtmlText.indexOf('theme-init.js')).toBeLessThan(headEnd);
    expect(indexHtmlText.indexOf('theme-init.js')).toBeLessThan(indexHtmlText.indexOf('/src/main.jsx'));
  });

  it('has no script tag without a src attribute, which the deploy smoke check would reject', () => {
    const inline = scriptTags.filter((tag) => !/\ssrc=/i.test(tag));
    expect(inline).toEqual([]);
  });

  it('has no inline event handler attributes either', () => {
    expect(indexHtmlText).not.toMatch(/\son[a-z]+\s*=/i);
  });
});

describe('theme-init.js ships in public/ and holds no network call', () => {
  it('is a file in public/, so Vite copies it to the site root unchanged', () => {
    expect(fs.existsSync(SCRIPT_PATH)).toBe(true);
  });

  it('uses no fetch, XMLHttpRequest, cookie or outside host', () => {
    expect(scriptText).not.toMatch(/fetch\(|XMLHttpRequest|document\.cookie|https?:\/\//);
  });
});

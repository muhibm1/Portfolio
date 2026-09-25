// Tests R131 and D19 (ADR 0002): the three fontsource families are pinned at 5.3.0, react and
// react-dom at exactly 19.3.0, the removed packages are gone, main.jsx imports exactly the seven
// weight files the mockups use, and no Google Fonts host appears anywhere the build could serve it.
// Reads package.json, src/main.jsx and index.html as text; nothing is imported or executed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const packageJsonText = fs.readFileSync(path.join(repositoryRoot, 'package.json'), 'utf8');
const packageJson = JSON.parse(packageJsonText);
const mainJsxText = fs.readFileSync(path.join(repositoryRoot, 'src/main.jsx'), 'utf8');
const indexHtmlText = fs.readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');

const GOOGLE_FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

const EXPECTED_WEIGHT_IMPORTS = [
  '@fontsource/ibm-plex-sans/400.css',
  '@fontsource/ibm-plex-sans/500.css',
  '@fontsource/ibm-plex-sans/600.css',
  '@fontsource/ibm-plex-mono/400.css',
  '@fontsource/ibm-plex-mono/500.css',
  '@fontsource/space-grotesk/500.css',
  '@fontsource/space-grotesk/600.css',
];

describe('fonts (R131, R147, D19, ADR 0002)', () => {
  it('pins the three fontsource families at exactly 5.3.0', () => {
    expect(packageJson.dependencies['@fontsource/ibm-plex-sans']).toBe('5.3.0');
    expect(packageJson.dependencies['@fontsource/ibm-plex-mono']).toBe('5.3.0');
    expect(packageJson.dependencies['@fontsource/space-grotesk']).toBe('5.3.0');
  });

  it('pins react and react-dom at exactly 19.3.0', () => {
    expect(packageJson.dependencies.react).toBe('19.3.0');
    expect(packageJson.dependencies['react-dom']).toBe('19.3.0');
  });

  it('removes the fontsource families and the package the redesign drops', () => {
    expect(packageJson.dependencies['@fontsource/inter']).toBeUndefined();
    expect(packageJson.dependencies['@fontsource/jetbrains-mono']).toBeUndefined();
    expect(packageJson.dependencies['thinking-orbs']).toBeUndefined();
  });

  it('imports exactly the seven weight files of R131 in main.jsx and nothing else from @fontsource', () => {
    for (const weightImport of EXPECTED_WEIGHT_IMPORTS) {
      expect(mainJsxText).toContain(weightImport);
    }

    const fontsourceImportLines = mainJsxText
      .split('\n')
      .filter((line) => line.includes('@fontsource/'));
    expect(fontsourceImportLines).toHaveLength(EXPECTED_WEIGHT_IMPORTS.length);
  });

  it.each(GOOGLE_FONT_HOSTS)('never references %s in index.html, main.jsx or package.json', (host) => {
    expect(indexHtmlText).not.toContain(host);
    expect(mainJsxText).not.toContain(host);
    expect(packageJsonText).not.toContain(host);
  });
});

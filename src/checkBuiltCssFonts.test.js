// Tests scripts/check-built-css-fonts.mjs (R97, R98) by starting it the way CI does, with
// spawnSync, so every case judges the exit code and the printed output rather than any internal
// function. The script is never imported. Each case writes its own temporary fixture directory and
// passes it explicitly, so no case reads dist/. This file lives under src/ only because Vitest
// discovers tests there.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Built with path.resolve rather than new URL(..., import.meta.url), because Vite rewrites that
// second form into a served asset URL and the path then points at the dev server, not at disk.
const scriptPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../scripts/check-built-css-fonts.mjs',
);

const FAILED_PREFIX = '::error::Built CSS font check failed (R97):';
const COULD_NOT_RUN_PREFIX = '::error::Built CSS font check could not run (R97):';

// The clean block C of R98: one face delivered as a file under the prefix the CSP allows.
const CLEAN_BLOCK = '@font-face{font-family:t;src:url(/Portfolio/assets/t.woff2) format("woff2")}';

// Long enough that a report which echoed the source would exceed the 60-character excerpt cap.
const LONG_PAYLOAD = 'A'.repeat(200);

const DATA_FONT_SPELLINGS = [
  'url("data:font/woff;base64,AAAA")',
  'url( data:font/woff2;base64,AAAA)',
  "url('data:font/woff2;base64,AAAA')",
  'URL(DATA:FONT/WOFF2;BASE64,AAAA)',
];

// Sources outside /Portfolio/assets/ that the data font pattern alone does not catch.
const SOURCES_OUTSIDE_THE_PREFIX = [
  'url(data:application/vnd.ms-fontobject;base64,AAAA)',
  'url(https://cdn.example.com/font.woff2)',
  'url(/* x */data:font/woff2;base64,AAAA)',
];

const UPPER_CASE_BLOCK_OVER_TWO_LINES_AND_A_LOWER_CASE_PREFIX = [
  `${CLEAN_BLOCK}@FONT-FACE{font-family:u;`,
  'src:url(https://cdn.example.com/u.woff2)}',
  '@font-face{font-family:p;src:url(/portfolio/assets/p.woff2)}',
].join('\n');

describe('check-built-css-fonts', () => {
  let fixtureDirectory;

  beforeEach(() => {
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'check-built-css-fonts-'));
  });

  afterEach(() => {
    fs.rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  function writeStylesheet(css, fileName = 'assets/index.css') {
    const stylesheetPath = path.join(fixtureDirectory, fileName);
    fs.mkdirSync(path.dirname(stylesheetPath), { recursive: true });
    fs.writeFileSync(stylesheetPath, css, 'utf8');
  }

  function writeStylesheetWithSource(source) {
    writeStylesheet(`${CLEAN_BLOCK}@font-face{font-family:d;src:${source}}`);
  }

  function runCheckOn(directory) {
    return spawnSync(process.execPath, [scriptPath, directory], { encoding: 'utf8' });
  }

  function expectNamesTheFixtureStylesheet(stdout) {
    expect(stdout).toContain(path.basename(fixtureDirectory));
    expect(stdout).toContain('assets/index.css');
  }

  it('exits 0 and prints the counts when every font source is a file under /Portfolio/assets/', () => {
    writeStylesheet(CLEAN_BLOCK);

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      'Built CSS font check passed (R97): 1 CSS file(s), 1 @font-face blocks, 1 font URLs, 0 data: font URLs.',
    );
  });

  it('exits 1 naming the file and count for an unquoted data font URL, without printing its payload', () => {
    writeStylesheetWithSource(`url(data:font/woff2;base64,${LONG_PAYLOAD})`);

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain(FAILED_PREFIX);
    expectNamesTheFixtureStylesheet(result.stdout);
    expect(result.stdout).toContain('1 data: font URL(s) and 1 @font-face URL(s) outside');
    expect(result.stdout).not.toContain(LONG_PAYLOAD);
    expect(result.stderr).not.toContain(LONG_PAYLOAD);
  });

  it.each(DATA_FONT_SPELLINGS)('exits 1 for the data font spelling %s', (source) => {
    writeStylesheetWithSource(source);

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('1 data: font URL(s) and 1 @font-face URL(s) outside');
  });

  it.each(SOURCES_OUTSIDE_THE_PREFIX)(
    'exits 1 for the @font-face source %s, which lies outside /Portfolio/assets/',
    (source) => {
      writeStylesheetWithSource(source);

      const result = runCheckOn(fixtureDirectory);

      expect(result.status).toBe(1);
      expect(result.stdout).toContain('0 data: font URL(s) and 1 @font-face URL(s) outside');
    },
  );

  it('exits 2 and names the directory when it does not exist', () => {
    const missingDirectory = path.join(fixtureDirectory, 'no-such-dist');

    const result = runCheckOn(missingDirectory);

    expect(result.status).toBe(2);
    expect(result.stdout).toContain(COULD_NOT_RUN_PREFIX);
    expect(result.stdout).toContain('no-such-dist');
  });

  it('exits 2 when the directory holds no .css file', () => {
    writeStylesheet('not a stylesheet', 'assets/notes.txt');

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(2);
    expect(result.stdout).toContain(COULD_NOT_RUN_PREFIX);
    expect(result.stdout).toContain(path.basename(fixtureDirectory));
  });

  it('exits 2 when no stylesheet holds an @font-face block', () => {
    writeStylesheet('body{color:red}');

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(2);
    expect(result.stdout).toContain(COULD_NOT_RUN_PREFIX);
    expect(result.stdout).toContain('@font-face');
  });

  it('exits 2 when the @font-face blocks hold no url()', () => {
    writeStylesheet('@font-face{font-family:l;src:local(X)}');

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(2);
    expect(result.stdout).toContain(COULD_NOT_RUN_PREFIX);
    expect(result.stdout).toContain('url()');
  });

  it('exits 0 for quoted and padded sources under /Portfolio/assets/', () => {
    writeStylesheet(
      '@font-face{font-family:q;src:url("/Portfolio/assets/a.woff2"),url( \'/Portfolio/assets/b.woff\' )}',
    );

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('1 @font-face blocks, 2 font URLs');
  });

  it('counts an upper-case block over two lines and a lower-case prefix as 2 URLs outside', () => {
    writeStylesheet(UPPER_CASE_BLOCK_OVER_TWO_LINES_AND_A_LOWER_CASE_PREFIX);

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('0 data: font URL(s) and 2 @font-face URL(s) outside');
  });
});

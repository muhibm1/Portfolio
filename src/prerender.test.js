// Tests scripts/prerender.mjs the way CI runs it: spawned as a separate process with a
// temporary directory as its working directory, so a missing dist/ or dist-ssr/ never reads or
// writes the repository's own build output (F1, R140).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const scriptPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../scripts/prerender.mjs');
const FAILED_PREFIX = '::error::Prerender failed:';

describe('prerender.mjs spawned on a broken build (F1)', () => {
  let fixtureDirectory;

  beforeEach(() => {
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'prerender-'));
  });

  afterEach(() => {
    fs.rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  function runOn(directory) {
    return spawnSync(process.execPath, [scriptPath], { cwd: directory, encoding: 'utf8' });
  }

  function writeShell(directory, html) {
    fs.mkdirSync(path.join(directory, 'dist'), { recursive: true });
    fs.writeFileSync(path.join(directory, 'dist', 'index.html'), html, 'utf8');
  }

  it('exits 1 naming the missing shell when dist/index.html does not exist', () => {
    const result = runOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain(FAILED_PREFIX);
    expect(result.stdout).toContain('dist/index.html');
    expect(fs.existsSync(path.join(fixtureDirectory, 'dist', '404.html'))).toBe(false);
  });

  it('exits 1 naming the missing SSR build when dist-ssr/entry-server.js does not exist', () => {
    writeShell(fixtureDirectory, '<html><head><title>t</title><meta name="description" content="d"></head><body><div id="root"></div></body></html>');

    const result = runOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain(FAILED_PREFIX);
    expect(result.stdout).toContain('dist-ssr/entry-server.js');
  });

  it('exits 1 writing nothing when the shell has no <div id="root"></div>', () => {
    writeShell(fixtureDirectory, '<html><head><title>t</title><meta name="description" content="d"></head><body>no root here</body></html>');
    fs.mkdirSync(path.join(fixtureDirectory, 'dist-ssr'), { recursive: true });
    fs.writeFileSync(
      path.join(fixtureDirectory, 'dist-ssr', 'entry-server.js'),
      [
        'export function render() { return "<h1>x</h1>"; }',
        'export function pageMetaFor() { return { title: "t", description: "d", canonical: "https://example.test/", ogImage: "https://example.test/og.png" }; }',
        'export function headTags() { return "<title>t</title>"; }',
      ].join('\n'),
      'utf8',
    );

    const result = runOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain(FAILED_PREFIX);
    expect(result.stdout).toContain('id="root"');
    expect(fs.readdirSync(path.join(fixtureDirectory, 'dist'))).toEqual(['index.html']);
  });

  it('writes nothing when render throws on a later page, not just the one that failed', () => {
    const originalShell =
      '<html><head><title>t</title><meta name="description" content="d"></head><body><div id="root"></div></body></html>';
    writeShell(fixtureDirectory, originalShell);
    fs.mkdirSync(path.join(fixtureDirectory, 'dist-ssr'), { recursive: true });
    fs.writeFileSync(
      path.join(fixtureDirectory, 'dist-ssr', 'entry-server.js'),
      [
        'let calls = 0;',
        'export function render() {',
        '  calls += 1;',
        '  if (calls === 2) throw new Error("render failed on the second page");',
        '  return "<h1>x</h1>";',
        '}',
        'export function pageMetaFor() { return { title: "t", description: "d", canonical: "https://example.test/", ogImage: "https://example.test/og.png" }; }',
        'export function headTags() { return "<title>t</title>"; }',
      ].join('\n'),
      'utf8',
    );

    const result = runOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain(FAILED_PREFIX);
    expect(result.stdout).toContain('render failed on the second page');
    // The first page renders fine in memory but must not be written: no new file or directory
    // appears under dist/, and the shell itself (the home page's own write target) is untouched.
    expect(fs.readdirSync(path.join(fixtureDirectory, 'dist'))).toEqual(['index.html']);
    expect(fs.readFileSync(path.join(fixtureDirectory, 'dist', 'index.html'), 'utf8')).toBe(originalShell);
  });
});

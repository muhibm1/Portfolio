// Tests scripts/route-pages.mjs (R117): sitePagePaths() applies the route list to the real data,
// and writeRoutePages() copies the built index.html to a directory per route. Every case writes
// its own temporary fixture directory, so no case reads or writes the repository's dist/.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { portfolioData } from './data/portfolioData';
import { staticRoutePaths } from './routePaths';
import { sitePagePaths, writeRoutePages } from '../scripts/route-pages.mjs';

const SHELL_MARKER = 'x'.repeat(300);

describe('sitePagePaths', () => {
  it('equals staticRoutePaths applied to the real case-study data (GC6)', () => {
    expect(sitePagePaths()).toEqual(staticRoutePaths(portfolioData.caseStudies));
  });
});

describe('writeRoutePages', () => {
  let fixtureDirectory;

  beforeEach(() => {
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'route-pages-'));
  });

  afterEach(() => {
    fs.rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  function writeShell() {
    fs.writeFileSync(path.join(fixtureDirectory, 'index.html'), SHELL_MARKER, 'utf8');
  }

  it('copies the shell to a directory per path, skipping /, and returns the paths written (GC4)', () => {
    writeShell();
    const paths = ['/', '/work', '/work/a', '/work/b-2'];

    const written = writeRoutePages(fixtureDirectory, paths);

    expect(written).toEqual(['work/index.html', 'work/a/index.html', 'work/b-2/index.html']);
    const shellBytes = fs.readFileSync(path.join(fixtureDirectory, 'index.html'));
    for (const relativePath of written) {
      expect(fs.readFileSync(path.join(fixtureDirectory, relativePath))).toEqual(shellBytes);
    }
  });

  it('leaves the same file set and bytes on a second call with the same arguments (EG1)', () => {
    writeShell();
    const paths = ['/', '/work', '/work/a', '/work/b-2'];
    const firstWritten = writeRoutePages(fixtureDirectory, paths);
    const firstFiles = listFilesUnder(fixtureDirectory);

    const secondWritten = writeRoutePages(fixtureDirectory, paths);

    expect(secondWritten).toEqual(firstWritten);
    expect(listFilesUnder(fixtureDirectory)).toEqual(firstFiles);
  });

  it('returns an empty array and writes nothing for a list holding only / (EG2)', () => {
    writeShell();

    const written = writeRoutePages(fixtureDirectory, ['/']);

    expect(written).toEqual([]);
    expect(listFilesUnder(fixtureDirectory)).toEqual(['index.html']);
  });

  it('throws naming the missing shell and writes nothing (FL2)', () => {
    expect(() => writeRoutePages(fixtureDirectory, ['/', '/work'])).toThrowError(/index\.html does not exist/);
    expect(listFilesUnder(fixtureDirectory)).toEqual([]);
  });

  it('refuses a path that resolves outside the output directory and writes nothing (AD1)', () => {
    writeShell();

    expect(() =>
      writeRoutePages(fixtureDirectory, ['/', '/../escape', '/work/../../up']),
    ).toThrowError(/Refusing to write outside/);

    const parent = path.dirname(fixtureDirectory);
    const grandparent = path.dirname(parent);
    expect(fs.existsSync(path.join(parent, 'index.html'))).toBe(false);
    expect(fs.existsSync(path.join(grandparent, 'index.html'))).toBe(false);
    expect(fs.existsSync(path.join(fixtureDirectory, 'work'))).toBe(false);
  });
});

function listFilesUnder(directory) {
  return fs
    .readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(directory, path.join(entry.parentPath, entry.name)).split(path.sep).join('/'))
    .sort();
}

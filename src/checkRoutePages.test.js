// Tests scripts/check-route-pages.mjs (R119) by starting it the way CI does, with spawnSync, so
// every case judges the exit code and the printed output. The script is never imported. Each case
// builds its own temporary fixture directory from sitePagePaths(), so the expected pages track the
// real case-study data, and no case reads or writes the repository's dist/.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { sitePagePaths } from '../scripts/route-pages.mjs';

const scriptPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../scripts/check-route-pages.mjs',
);

const FAILED_PREFIX = '::error::Route page check failed (R119):';
const COULD_NOT_RUN_PREFIX = '::error::Route page check could not run (R119):';

const SHELL_CONTENT = 's'.repeat(300);
const STALE_CONTENT = 'stale-content-different-from-the-shell';
const MARKER = 'm'.repeat(200);

/** The relative page paths the check expects, in the shape the script writes them: <path>/index.html. */
function pageRelativePaths() {
  return sitePagePaths()
    .filter((pagePath) => pagePath !== '/')
    .map((pagePath) => `${pagePath.slice(1)}/index.html`);
}

describe('check-route-pages', () => {
  let fixtureDirectory;

  beforeEach(() => {
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'check-route-pages-'));
  });

  afterEach(() => {
    fs.rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  function writeFile(relativePath, content) {
    const fullPath = path.join(fixtureDirectory, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, 'utf8');
  }

  /** index.html, 404.html and every route page, all identical copies of the shell (GC7's fixture). */
  function buildCleanFixture() {
    writeFile('index.html', SHELL_CONTENT);
    writeFile('404.html', SHELL_CONTENT);
    for (const relativePath of pageRelativePaths()) writeFile(relativePath, SHELL_CONTENT);
  }

  function runCheckOn(directory) {
    return spawnSync(process.execPath, [scriptPath, directory], { encoding: 'utf8' });
  }

  it('exits 0 and prints the passed line when every route page and 404.html match index.html (GC7)', () => {
    buildCleanFixture();

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Route page check passed (R119): 4 route pages and 404.html match');
  });

  it('exits 0 when a relative directory argument resolves from the working directory (EG4)', () => {
    buildCleanFixture();
    const parentDirectory = path.dirname(fixtureDirectory);
    const basename = path.basename(fixtureDirectory);

    const result = spawnSync(process.execPath, [scriptPath, basename], {
      cwd: parentDirectory,
      encoding: 'utf8',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Route page check passed (R119)');
  });

  it('exits 1 naming a missing route page (FL3)', () => {
    buildCleanFixture();
    const missingPage = pageRelativePaths().find((relativePath) => relativePath.includes('apple-data-health'));
    fs.rmSync(path.join(fixtureDirectory, missingPage));

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain(`${FAILED_PREFIX} work/apple-data-health/index.html is missing`);
  });

  it('exits 1 naming a stale route page that differs from index.html (FL4)', () => {
    buildCleanFixture();
    writeFile('work/index.html', STALE_CONTENT);

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('work/index.html');
    expect(result.stdout).toContain('differs from index.html');
  });

  it('exits 1 naming a missing 404.html, and separately one that differs from index.html (FL5)', () => {
    buildCleanFixture();
    fs.rmSync(path.join(fixtureDirectory, '404.html'));
    const missingResult = runCheckOn(fixtureDirectory);
    expect(missingResult.status).toBe(1);
    expect(missingResult.stdout).toContain(`${FAILED_PREFIX} 404.html is missing`);

    writeFile('404.html', STALE_CONTENT);
    const differsResult = runCheckOn(fixtureDirectory);
    expect(differsResult.status).toBe(1);
    expect(differsResult.stdout).toContain('404.html');
    expect(differsResult.stdout).toContain('differs from index.html');
  });

  it('exits 2 for a missing directory, and separately for a directory with no index.html (FL6)', () => {
    const missingDirectory = path.join(fixtureDirectory, 'no-such-dist');
    const missingDirectoryResult = runCheckOn(missingDirectory);
    expect(missingDirectoryResult.status).toBe(2);
    expect(missingDirectoryResult.stdout).toContain(COULD_NOT_RUN_PREFIX);
    expect(missingDirectoryResult.stdout).toContain('no-such-dist');

    buildCleanFixture();
    fs.rmSync(path.join(fixtureDirectory, 'index.html'));
    const missingShellResult = runCheckOn(fixtureDirectory);
    expect(missingShellResult.status).toBe(2);
    expect(missingShellResult.stdout).toContain(COULD_NOT_RUN_PREFIX);
    expect(missingShellResult.stdout).toContain(path.basename(fixtureDirectory));
  });

  it('exits 1 naming a stray route page the app does not define (FL7)', () => {
    buildCleanFixture();
    writeFile('work/removed-study/index.html', STALE_CONTENT);

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('work/removed-study/index.html');
    expect(result.stdout).toContain('is not a page the app defines');
  });

  it('exits 1 naming stray index.html files outside work/ and more than one level deep (FL8)', () => {
    buildCleanFixture();
    writeFile('unexpected-top/index.html', STALE_CONTENT);
    writeFile('work/apple-llm-triage/nested/deep/index.html', STALE_CONTENT);

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('unexpected-top/index.html');
    expect(result.stdout).toContain('work/apple-llm-triage/nested/deep/index.html');
    expect(result.stdout).toContain('is not a page the app defines');
  });

  it('never prints a stale page\'s content, only its path and byte counts (AD4)', () => {
    buildCleanFixture();
    writeFile('work/index.html', MARKER);

    const result = runCheckOn(fixtureDirectory);

    expect(result.stdout).not.toContain(MARKER);
    expect(result.stderr).not.toContain(MARKER);
    expect(result.stdout).toContain('work/index.html');
  });

  it('exits 1 naming a stray .html file that is not named index.html (M1)', () => {
    buildCleanFixture();
    writeFile('work/x.html', STALE_CONTENT);

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('work/x.html');
    expect(result.stdout).toContain('is not a page the app defines');
  });

  it('never prints a stray page\'s content, only its path (AD5)', () => {
    buildCleanFixture();
    writeFile('work/removed-study/index.html', MARKER);

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).not.toContain(MARKER);
    expect(result.stderr).not.toContain(MARKER);
    expect(result.stdout).toContain('work/removed-study/index.html');
  });
});

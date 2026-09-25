// Tests scripts/check-route-pages.mjs (R142) by starting it the way CI does, with spawnSync, so
// every case judges the exit code and the printed output. The script is never imported. Each
// case builds its own temporary fixture directory from sitePagePaths(), so the expected pages
// track the real case-study data, and no case reads or writes the repository's dist/.
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

const FAILED_PREFIX = '::error::Route page check failed (R142):';
const COULD_NOT_RUN_PREFIX = '::error::Route page check could not run (R142):';
const SITE_URL = 'https://muhibm1.github.io/Portfolio/';

const MODULE_SCRIPT = '<script type="module" crossorigin src="/Portfolio/assets/index-abc123.js"></script>';
const STYLESHEET = '<link rel="stylesheet" crossorigin href="/Portfolio/assets/index-abc123.css">';
const CSP_META = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'">';
const REFERRER_META = '<meta name="referrer" content="strict-origin-when-cross-origin">';
const ROOT_WITH_CONTENT = '<div id="root"><h1>Real page content</h1></div>';
const ROOT_EMPTY = '<div id="root"></div>';

function canonicalFor(pagePath) {
  return pagePath === '/' ? SITE_URL : `${SITE_URL}${pagePath.slice(1)}/`;
}

function relativePathFor(pagePath) {
  return pagePath === '/' ? 'index.html' : `${pagePath.slice(1)}/index.html`;
}

/** A clean page carrying every R142 marker, so a test can knock exactly one marker out. */
function pageHtml({ canonical = null, notFound = false, root = ROOT_WITH_CONTENT, extra = '' } = {}) {
  const canonicalTag = canonical ? `<link rel="canonical" href="${canonical}">` : '';
  const robotsTag = notFound ? '<meta name="robots" content="noindex">' : '';
  return (
    `<!doctype html><html><head>${CSP_META}${REFERRER_META}<title>t</title>` +
    `${canonicalTag}${robotsTag}${MODULE_SCRIPT}${STYLESHEET}${extra}</head>` +
    `<body>${root}</body></html>`
  );
}

describe('check-route-pages (G19)', () => {
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

  /** index.html (the shell) plus one clean page per sitePagePaths() entry, plus a clean 404.html. */
  function buildCleanFixture() {
    for (const pagePath of sitePagePaths()) {
      writeFile(relativePathFor(pagePath), pageHtml({ canonical: canonicalFor(pagePath) }));
    }
    writeFile('404.html', pageHtml({ notFound: true }));
  }

  function runCheckOn(directory) {
    return spawnSync(process.execPath, [scriptPath, directory], { encoding: 'utf8' });
  }

  it('exits 0 and prints the passed line when every page carries its markers', () => {
    buildCleanFixture();

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Route page check passed (R142)');
  });

  it('exits 1 naming a missing page', () => {
    buildCleanFixture();
    fs.rmSync(path.join(fixtureDirectory, 'work', 'index.html'));

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain(`${FAILED_PREFIX} work/index.html is missing`);
  });

  it('exits 1 naming a page with the wrong canonical', () => {
    buildCleanFixture();
    writeFile('work/index.html', pageHtml({ canonical: `${SITE_URL}wrong/` }));

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain(`${FAILED_PREFIX} work/index.html is missing the canonical link`);
  });

  it('exits 1 naming a page whose module script tag differs from index.html', () => {
    buildCleanFixture();
    writeFile(
      'work/index.html',
      pageHtml({ canonical: canonicalFor('/work') }).replace(
        MODULE_SCRIPT,
        '<script type="module" crossorigin src="/Portfolio/assets/different-hash.js"></script>',
      ),
    );

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('is missing a script or stylesheet tag from index.html');
  });

  it('exits 1 naming a page with an empty #root', () => {
    buildCleanFixture();
    writeFile('work/index.html', pageHtml({ canonical: canonicalFor('/work'), root: ROOT_EMPTY }));

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('has an empty #root');
  });

  it('does not flag a #root whose content is a nested div, only whitespace inside it', () => {
    buildCleanFixture();
    writeFile(
      'work/index.html',
      pageHtml({
        canonical: canonicalFor('/work'),
        root: '<div id="root"><div class="app"><h1>Nested content</h1></div></div>',
      }),
    );

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(0);
  });

  it('exits 1 naming a page whose #root has only whitespace', () => {
    buildCleanFixture();
    writeFile('work/index.html', pageHtml({ canonical: canonicalFor('/work'), root: '<div id="root">   </div>' }));

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('has an empty #root');
  });

  it('exits 1 naming a stray html file the app does not define', () => {
    buildCleanFixture();
    writeFile('work/x.html', pageHtml({ canonical: `${SITE_URL}work/x/` }));

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain(`${FAILED_PREFIX} work/x.html is not a page the app defines`);
  });

  it('exits 1 naming a 404 page without noindex', () => {
    buildCleanFixture();
    writeFile('404.html', pageHtml({ notFound: false }));

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('is missing meta name="robots" content="noindex"');
  });

  it('exits 1 naming a page with two CSP tags (D15)', () => {
    buildCleanFixture();
    writeFile('work/index.html', pageHtml({ canonical: canonicalFor('/work'), extra: CSP_META }));

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('does not have exactly one Content-Security-Policy meta tag');
  });

  it('exits 1 naming a page with two referrer tags (D15)', () => {
    buildCleanFixture();
    writeFile('work/index.html', pageHtml({ canonical: canonicalFor('/work'), extra: REFERRER_META }));

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('does not have exactly one name="referrer" meta tag');
  });

  it('exits 1 naming a page with an inline script (D15)', () => {
    buildCleanFixture();
    writeFile(
      'work/index.html',
      pageHtml({ canonical: canonicalFor('/work'), extra: '<script>alert(1)</script>' }),
    );

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('has a <script> without a src attribute');
  });

  it('exits 1 naming a page referencing fonts.gstatic.com (D15)', () => {
    buildCleanFixture();
    writeFile(
      'work/index.html',
      pageHtml({
        canonical: canonicalFor('/work'),
        extra: '<link rel="preconnect" href="https://fonts.gstatic.com">',
      }),
    );

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('references fonts.gstatic.com');
  });

  it('exits 1 naming a page containing a phone-shaped number (D15)', () => {
    buildCleanFixture();
    writeFile(
      'work/index.html',
      pageHtml({ canonical: canonicalFor('/work'), root: '<div id="root"><p>Call (555) 123-4567</p></div>' }),
    );

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('contains a phone-shaped number');
  });

  it('never prints file content in an offender line', () => {
    buildCleanFixture();
    writeFile(
      'work/index.html',
      pageHtml({ canonical: canonicalFor('/work'), root: '<div id="root"><p>Call (555) 123-4567</p></div>' }),
    );

    const result = runCheckOn(fixtureDirectory);

    expect(result.stdout).not.toContain('555');
  });

  it('exits 2 when the directory does not exist', () => {
    const result = runCheckOn(path.join(fixtureDirectory, 'does-not-exist'));

    expect(result.status).toBe(2);
    expect(result.stdout).toContain(COULD_NOT_RUN_PREFIX);
  });

  // No "exits 0 on the real dist/ after a build" case here: tests run before the build, so
  // dist/ never exists in CI, and a case that silently returns when its precondition is absent
  // proves nothing there while turning red on a stale local dist/. The equivalent real-dist
  // assertion is the post-build CI step `node scripts/check-route-pages.mjs` (conductor
  // decision D22).
});

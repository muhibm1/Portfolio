// Tests scripts/route-pages.mjs (spec interface (c), R140, R142): sitePagePaths() applies the
// route list to the real data, assemblePage() composes one served page from a shell, its head
// tags and its rendered markup, and writePage() writes it under the output directory, refusing
// to write outside it (R117, R118 retained). Every case uses its own temporary fixture
// directory, so no case reads or writes the repository's dist/.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { portfolioData } from './data/portfolioData';
import { staticRoutePaths } from './routePaths';
import { assemblePage, redirectPage, sitePagePaths, siteRedirects, writePage } from '../scripts/route-pages.mjs';

const SHELL_HTML =
  '<!doctype html><html><head><title>Old title</title>\n' +
  '<meta name="description" content="Old description">\n' +
  '</head><body><div id="root"></div><script type="module" src="/main.js"></script></body></html>';

describe('sitePagePaths', () => {
  it('equals staticRoutePaths applied to the real case-study data (GC6)', () => {
    expect(sitePagePaths()).toEqual(staticRoutePaths(portfolioData.caseStudies));
  });
});

describe('assemblePage', () => {
  it('replaces the title and description meta, inserts the head tags, and fills #root', () => {
    const html = assemblePage(SHELL_HTML, {
      headHtml: '<title>New title</title>\n<meta name="description" content="New description">',
      appHtml: '<h1>Hello</h1>',
    });

    expect(html).toContain('<title>New title</title>');
    expect(html).not.toContain('Old title');
    expect(html).toContain('New description');
    expect(html).not.toContain('Old description');
    expect(html).toContain('<div id="root"><h1>Hello</h1></div>');
    expect(html).toContain('<script type="module" src="/main.js"></script>');
  });

  it('throws naming the missing title when the shell has none (F1)', () => {
    const shellWithoutTitle = SHELL_HTML.replace('<title>Old title</title>', '');

    expect(() => assemblePage(shellWithoutTitle, { headHtml: '', appHtml: '' })).toThrowError(/<title>/);
  });

  it('throws naming the missing description meta when the shell has none (F1)', () => {
    const shellWithoutDescription = SHELL_HTML.replace(
      '<meta name="description" content="Old description">\n',
      '',
    );

    expect(() => assemblePage(shellWithoutDescription, { headHtml: '', appHtml: '' })).toThrowError(
      /description/,
    );
  });

  it('throws naming the missing root div when the shell has none (F1)', () => {
    const shellWithoutRoot = SHELL_HTML.replace('<div id="root"></div>', '');

    expect(() => assemblePage(shellWithoutRoot, { headHtml: '', appHtml: '' })).toThrowError(
      /id="root"/,
    );
  });

  it('throws naming the missing </head> tag when the shell has none (R140)', () => {
    const shellWithoutHead = SHELL_HTML.replace('</head>', '');

    expect(() => assemblePage(shellWithoutHead, { headHtml: '', appHtml: '<h1>Hi</h1>' })).toThrowError(
      /<\/head>/,
    );
  });

  it('throws naming the empty rendered markup when appHtml is blank after trim (R140)', () => {
    expect(() => assemblePage(SHELL_HTML, { headHtml: '', appHtml: '   ' })).toThrowError(
      /Rendered markup is empty/,
    );
  });

  it('does not expand $&, $$ or $\' in headHtml or appHtml as replacement patterns', () => {
    const html = assemblePage(SHELL_HTML, {
      headHtml: '<meta name="note" content="$&">',
      appHtml: "<p>Cost: $$5, ref $' and $&</p>",
    });

    expect(html).toContain('<meta name="note" content="$&">');
    expect(html).toContain("<p>Cost: $$5, ref $' and $&</p>");
  });
});

describe('writePage', () => {
  let fixtureDirectory;

  beforeEach(() => {
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'route-pages-'));
  });

  afterEach(() => {
    fs.rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  it('writes / to index.html at the output directory root (GC4)', () => {
    const relativePath = writePage(fixtureDirectory, '/', '<html>home</html>');

    expect(relativePath).toBe('index.html');
    expect(fs.readFileSync(path.join(fixtureDirectory, 'index.html'), 'utf8')).toBe('<html>home</html>');
  });

  it('writes a nested path to <path>/index.html (GC4)', () => {
    const relativePath = writePage(fixtureDirectory, '/work/apple-llm-triage', '<html>study</html>');

    expect(relativePath).toBe('work/apple-llm-triage/index.html');
    expect(fs.readFileSync(path.join(fixtureDirectory, 'work/apple-llm-triage/index.html'), 'utf8')).toBe(
      '<html>study</html>',
    );
  });

  it('writes the sentinel /404 path to a top-level 404.html (ADR 0001)', () => {
    const relativePath = writePage(fixtureDirectory, '/404', '<html>not found</html>');

    expect(relativePath).toBe('404.html');
    expect(fs.readFileSync(path.join(fixtureDirectory, '404.html'), 'utf8')).toBe('<html>not found</html>');
  });

  it('overwrites cleanly on a second call with the same path (EG1)', () => {
    writePage(fixtureDirectory, '/work', '<html>first</html>');

    writePage(fixtureDirectory, '/work', '<html>second</html>');

    expect(fs.readFileSync(path.join(fixtureDirectory, 'work/index.html'), 'utf8')).toBe('<html>second</html>');
  });

  it('refuses a path that resolves outside the output directory and writes nothing (AD1, A2)', () => {
    expect(() => writePage(fixtureDirectory, '/../escape', '<html>escape</html>')).toThrowError(
      /Refusing to write outside/,
    );

    const parent = path.dirname(fixtureDirectory);
    expect(fs.existsSync(path.join(parent, 'index.html'))).toBe(false);
    expect(fs.existsSync(path.join(parent, 'escape'))).toBe(false);
  });
});

describe('staticRoutePaths with an unsafe case-study id (A2)', () => {
  it('throws naming the id instead of writing a page for it', () => {
    expect(() => staticRoutePaths([{ id: '../x' }])).toThrowError(/\.\.\/x/);
  });
});

describe('siteRedirects and redirectPage (owner brief 2026-10-21)', () => {
  const SHELL =
    '<html><head><meta http-equiv="Content-Security-Policy" content="default-src \'self\'">' +
    '<meta name="referrer" content="strict-origin-when-cross-origin"><title>t</title></head><body><div id="root"></div></body></html>';

  it('points the old decision-support, WorkHorse and agent harness addresses at the full URLs of their new pages', () => {
    expect(siteRedirects()).toEqual([
      {
        from: '/work/apple-llm-triage',
        to: '/work/apple-decision-support-agent',
        targetUrl: 'https://muhibm1.github.io/Portfolio/work/apple-decision-support-agent/',
      },
      {
        from: '/work/workhorse',
        to: '/work',
        targetUrl: 'https://muhibm1.github.io/Portfolio/work/',
      },
      {
        from: '/work/tannhauser-gate',
        to: '/work',
        targetUrl: 'https://muhibm1.github.io/Portfolio/work/',
      },
      {
        from: '/work/neural-newsletters-llm',
        to: '/work',
        targetUrl: 'https://muhibm1.github.io/Portfolio/work/',
      },
    ]);
  });

  it('builds a script-free page that refreshes to the target, links it as canonical and keeps the policy tags', () => {
    const html = redirectPage(SHELL, { targetUrl: 'https://muhibm1.github.io/Portfolio/work/x/' });

    expect(html).toContain('<meta http-equiv="refresh" content="0; url=https://muhibm1.github.io/Portfolio/work/x/" />');
    expect(html).toContain('<link rel="canonical" href="https://muhibm1.github.io/Portfolio/work/x/" />');
    expect(html).toContain('<meta name="robots" content="noindex" />');
    expect(html).toContain('http-equiv="Content-Security-Policy"');
    expect(html).toContain('name="referrer"');
    expect(html).not.toMatch(/<script/i);
  });

  it('escapes the target so it cannot break out of an attribute', () => {
    const html = redirectPage(SHELL, { targetUrl: 'https://example.com/"><script>' });
    expect(html).not.toContain('"><script>');
    expect(html).toContain('&quot;&gt;&lt;script&gt;');
  });

  it('throws when the shell has no Content-Security-Policy meta tag', () => {
    expect(() => redirectPage('<html><head></head></html>', { targetUrl: 'https://x/' })).toThrowError(/Content-Security-Policy/);
  });
});

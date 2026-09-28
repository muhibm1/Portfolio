// Integration test for the prerender pipeline (G24, R139, R140, R141): assemblePage composed
// with entry-server's render and headTags(pageMetaFor(path)) for each of the seven served paths,
// proving the assembled <head> carries exactly the tags that page's meta names and #root carries
// that page's real markup, not a stub.
import { describe, expect, it } from 'vitest';
import { assemblePage, sitePagePaths } from '../scripts/route-pages.mjs';
import { render, pageMetaFor, headTags } from './entry-server.jsx';
import { portfolioData } from './data/portfolioData';

const BASE = '/Portfolio';

const SHELL_HTML =
  '<!doctype html><html><head><title>shell title</title>\n' +
  '<meta name="description" content="shell description">\n' +
  '</head><body><div id="root"></div></body></html>';

function distinctiveTextFor(path) {
  if (path === '/') return portfolioData.home.hero.heading;
  if (path === '/work') return portfolioData.caseStudies[0].title;
  const caseStudy = portfolioData.caseStudies.find((study) => `/work/${study.id}` === path);
  return caseStudy.title;
}

describe('prerender integration (G24)', () => {
  it.each(sitePagePaths())('assembles %s with exactly that page\'s head tags and real markup', (path) => {
    const meta = pageMetaFor(path);
    const headHtml = headTags(meta);
    const appHtml = render(`${BASE}${path === '/' ? '' : path}`);

    const html = assemblePage(SHELL_HTML, { headHtml, appHtml });

    expectExactlyOne(html, `<title>${escapeForCount(meta.title)}</title>`);
    expectExactlyOne(html, `rel="canonical" href="${meta.canonical}"`);
    expectExactlyOne(html, `property="og:title" content="${escapeForCount(meta.title)}"`);
    expectExactlyOne(html, `property="og:description" content="${escapeForCount(meta.description)}"`);
    expectExactlyOne(html, `property="og:url"`);
    expectExactlyOne(html, `property="og:image" content="${meta.ogImage}"`);
    expectExactlyOne(html, `name="twitter:title" content="${escapeForCount(meta.title)}"`);
    expectExactlyOne(html, `name="twitter:description" content="${escapeForCount(meta.description)}"`);
    expectExactlyOne(html, `name="twitter:image" content="${meta.ogImage}"`);

    expect(html).toContain(`<div id="root">${appHtml}</div>`);
    expect(html).toContain(distinctiveTextFor(path));
  });
});

function escapeForCount(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
}

function expectExactlyOne(haystack, needle) {
  expect(occurrences(haystack, needle)).toBe(1);
}

function occurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

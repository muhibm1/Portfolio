// Tests src/pageMeta.js (R139, R141): pageMetaFor's per-route title, description and canonical,
// and headTags' escaping of whatever pageMetaFor hands it (A1). This file has no DOM dependency,
// matching pageMeta.js itself, since the prerender script (T11) imports it from plain Node.
import { describe, expect, it } from 'vitest';
import { portfolioData } from './data/portfolioData';
import { headTags, pageMetaFor, SITE_URL } from './pageMeta';
import { sitePagePaths } from '../scripts/route-pages.mjs';

const SITE_NAME = portfolioData.personal.name;

describe('pageMetaFor (G16)', () => {
  it('describes the home page', () => {
    expect(pageMetaFor('/')).toEqual({
      title: `${SITE_NAME}, Forward Deployed Engineer`,
      description: portfolioData.home.hero.lead,
      canonical: SITE_URL,
      ogImage: `${SITE_URL}og.png`,
    });
  });

  it('describes the work index', () => {
    expect(pageMetaFor('/work')).toEqual({
      title: `Case studies | ${SITE_NAME}`,
      description: portfolioData.home.caseStudiesIntro.lead,
      canonical: `${SITE_URL}work/`,
      ogImage: `${SITE_URL}og.png`,
    });
  });

  it.each(portfolioData.caseStudies)('describes the $id case study', (caseStudy) => {
    expect(pageMetaFor(`/work/${caseStudy.id}`)).toEqual({
      title: `${caseStudy.title} | ${SITE_NAME}`,
      description: caseStudy.intro,
      canonical: `${SITE_URL}work/${caseStudy.id}/`,
      ogImage: `${SITE_URL}og.png`,
    });
  });

  it('describes an unknown path as not found, with no canonical', () => {
    expect(pageMetaFor('/no-such-page')).toEqual({
      title: `Page not found | ${SITE_NAME}`,
      description: 'There is no page at this address.',
      canonical: null,
      ogImage: `${SITE_URL}og.png`,
      robots: 'noindex',
    });
  });

  it('contains exactly one of each head tag for the home page', () => {
    const html = headTags(pageMetaFor('/'));

    for (const tag of [
      '<title>',
      'name="description"',
      'rel="canonical"',
      'property="og:type"',
      'property="og:title"',
      'property="og:description"',
      'property="og:url"',
      'property="og:image"',
      'name="twitter:card"',
      'name="twitter:title"',
      'name="twitter:description"',
      'name="twitter:image"',
    ]) {
      expect(occurrences(html, tag)).toBe(1);
    }
  });
});

describe('headTags (A1)', () => {
  it('escapes an adversarial title so no raw markup reaches an attribute or text node', () => {
    const meta = {
      title: 'A "quoted" <b>&</b> title',
      description: 'plain description',
      canonical: SITE_URL,
      ogImage: `${SITE_URL}og.png`,
    };

    const html = headTags(meta);

    expect(html).toContain('&quot;');
    expect(html).toContain('&lt;');
    expect(html).toContain('&amp;');
    expect(html).not.toContain('<b>');
  });

  it('builds every canonical, og:url and og:image under the site origin for every real path', () => {
    for (const path of sitePagePaths()) {
      const meta = pageMetaFor(path);
      const html = headTags(meta);

      expect(meta.canonical.startsWith(SITE_URL)).toBe(true);
      expect(meta.ogImage.startsWith(SITE_URL)).toBe(true);
      expect(html).toContain(`property="og:url" content="${meta.canonical}"`);
    }
  });
});

function occurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

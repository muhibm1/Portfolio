// Per-route page metadata: title, description, canonical URL and the Open Graph and Twitter
// tags built from it (R139, R141). Pure functions with no DOM dependency, so the prerender
// script (T11) can import this module from plain Node as well as from the browser.

import { portfolioData } from './data/portfolioData';

export const SITE_URL = 'https://muhibm1.github.io/Portfolio/';

const SITE_NAME = portfolioData.personal.name;
const OG_IMAGE = `${SITE_URL}og.png`;
const NOT_FOUND_TITLE = `Page not found | ${SITE_NAME}`;
const NOT_FOUND_DESCRIPTION = 'There is no page at this address.';

/**
 * Maps a route pathname to `{ title, description, canonical, ogImage, robots? }` (spec
 * interface (a)). An unknown path gets the not-found meta: `robots: 'noindex'`, no canonical.
 */
export function pageMetaFor(pathname) {
  const path = normalizePath(pathname);

  if (path === '/') return homeMeta();
  if (path === '/work') return workIndexMeta();

  const caseStudy = portfolioData.caseStudies.find((study) => `/work/${study.id}` === path);
  if (caseStudy) return caseStudyMeta(caseStudy);

  return notFoundMeta();
}

/**
 * Renders the twelve head tags R139 names for `meta` as one string: `<title>`, the description
 * meta, the canonical link (when present), `robots` (when present), and the eight Open Graph and
 * Twitter tags. Every value is escaped, so a title or description containing `&`, `<`, `>` or
 * `"` cannot break out of an attribute or inject markup (A1).
 */
export function headTags(meta) {
  const ogUrl = meta.canonical ?? SITE_URL;

  const tags = [`<title>${escapeHtml(meta.title)}</title>`, metaName('description', meta.description)];

  if (meta.robots) tags.push(metaName('robots', meta.robots));
  if (meta.canonical) tags.push(linkTag('canonical', meta.canonical));

  tags.push(
    metaProperty('og:type', 'website'),
    metaProperty('og:title', meta.title),
    metaProperty('og:description', meta.description),
    metaProperty('og:url', ogUrl),
    metaProperty('og:image', meta.ogImage),
    metaName('twitter:card', 'summary_large_image'),
    metaName('twitter:title', meta.title),
    metaName('twitter:description', meta.description),
    metaName('twitter:image', meta.ogImage),
  );

  return tags.join('\n');
}

function homeMeta() {
  return {
    title: `${SITE_NAME}, Forward Deployed Engineer`,
    description: portfolioData.home.hero.lead,
    canonical: SITE_URL,
    ogImage: OG_IMAGE,
  };
}

function workIndexMeta() {
  return {
    title: `Case studies | ${SITE_NAME}`,
    description: portfolioData.home.caseStudiesIntro.lead,
    canonical: `${SITE_URL}work/`,
    ogImage: OG_IMAGE,
  };
}

function caseStudyMeta(caseStudy) {
  return {
    title: `${caseStudy.title} | ${SITE_NAME}`,
    description: caseStudy.intro,
    canonical: `${SITE_URL}work/${caseStudy.id}/`,
    ogImage: OG_IMAGE,
  };
}

function notFoundMeta() {
  return {
    title: NOT_FOUND_TITLE,
    description: NOT_FOUND_DESCRIPTION,
    canonical: null,
    ogImage: OG_IMAGE,
    robots: 'noindex',
  };
}

/** Strips a trailing slash (except the root), so `/work/` and `/work` resolve the same page. */
function normalizePath(pathname) {
  if (pathname === '/' || pathname === '') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => HTML_ESCAPES[char]);
}

function metaName(name, content) {
  return `<meta name="${name}" content="${escapeHtml(content)}">`;
}

function metaProperty(property, content) {
  return `<meta property="${property}" content="${escapeHtml(content)}">`;
}

function linkTag(rel, href) {
  return `<link rel="${rel}" href="${escapeHtml(href)}">`;
}

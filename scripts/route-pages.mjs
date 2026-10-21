/**
 * The route list applied to the real case-study data, and the two primitives the prerender
 * script (scripts/prerender.mjs) uses to turn one rendered page into a file under dist/ (spec
 * interface (c), ADR 0001).
 *
 * Every write target is validated against the resolved output directory before a byte is
 * written, so a path that would resolve outside it refuses instead of writing partway (R117,
 * R118, carried over from 2026-09-21).
 */

import fs from 'node:fs'
import path from 'node:path'
import { REDIRECTS, staticRoutePaths } from '../src/routePaths.js'
import { portfolioData } from '../src/data/portfolioData.js'

/** staticRoutePaths applied to the real case-study data. */
export function sitePagePaths() {
  return staticRoutePaths(portfolioData.caseStudies)
}

const SITE_URL = 'https://muhibm1.github.io/Portfolio/'

/**
 * The moved addresses (REDIRECTS in src/routePaths.js), each with the full URL it now points at.
 * Throws when a target is not a page the site serves, or a source still is, so a redirect can
 * neither point at nothing nor hide a live page.
 */
export function siteRedirects() {
  const pages = new Set(sitePagePaths())
  return REDIRECTS.map(({ from, to }) => {
    if (!pages.has(to)) throw new Error(`Redirect target ${to} is not a page the site serves`)
    if (pages.has(from)) throw new Error(`Redirect source ${from} is still a page the site serves`)
    return { from, to, targetUrl: `${SITE_URL}${to.slice(1)}/` }
  })
}

/**
 * A small page that sends the browser on to `targetUrl` (GitHub Pages has no server-side
 * redirects). It keeps the shell's Content-Security-Policy and referrer meta tags, carries no
 * script, points its canonical link at the new address, asks not to be indexed, and holds a
 * plain link for a browser that ignores the refresh. Throws when the shell lacks either meta tag.
 */
export function redirectPage(shellHtml, { targetUrl }) {
  const csp = shellHtml.match(/<meta[^>]*http-equiv="Content-Security-Policy"[^>]*>/i)
  const referrer = shellHtml.match(/<meta[^>]*name="referrer"[^>]*>/i)
  if (!csp) throw new Error('Shell is missing its Content-Security-Policy meta tag')
  if (!referrer) throw new Error('Shell is missing its referrer meta tag')
  const url = escapeAttribute(targetUrl)

  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="UTF-8" />',
    csp[0],
    referrer[0],
    `<meta http-equiv="refresh" content="0; url=${url}" />`,
    '<meta name="robots" content="noindex" />',
    `<link rel="canonical" href="${url}" />`,
    '<title>This page has moved</title>',
    '</head>',
    '<body>',
    `<p>This page has moved to <a href="${url}">${url}</a>.</p>`,
    '</body>',
    '</html>',
    '',
  ].join('\n')
}

function escapeAttribute(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Assembles one served page from the built shell (dist/index.html), the head tags for that
 * route (headTags(pageMetaFor(path))) and the rendered app markup (entry-server render(url)).
 * Replaces the shell's own <title> and description meta, inserts headHtml before </head>, and
 * puts appHtml inside the shell's empty <div id="root"></div>. Throws naming whichever of the
 * three the shell is missing, before making any change.
 */
export function assemblePage(shellHtml, { headHtml, appHtml }) {
  if (!/<title>[\s\S]*?<\/title>/i.test(shellHtml)) {
    throw new Error('Shell is missing a <title> element')
  }
  if (!/<meta[^>]*name=["']description["'][^>]*>/i.test(shellHtml)) {
    throw new Error('Shell is missing a <meta name="description"> element')
  }
  if (!shellHtml.includes('</head>')) {
    throw new Error('Shell is missing a </head> tag')
  }
  if (!shellHtml.includes('<div id="root"></div>')) {
    throw new Error('Shell is missing an empty <div id="root"></div>')
  }
  if (appHtml.trim() === '') {
    throw new Error('Rendered markup is empty')
  }

  return shellHtml
    .replace(/<title>[\s\S]*?<\/title>\s*/i, () => '')
    .replace(/<meta[^>]*name=["']description["'][^>]*>\s*/i, () => '')
    .replace('</head>', () => `${headHtml}\n</head>`)
    .replace('<div id="root"></div>', () => `<div id="root">${appHtml}</div>`)
}

/**
 * Writes `html` to `<outDir><pagePath>/index.html`, except the sentinel path `/404`, which
 * writes to `<outDir>/404.html` directly (ADR 0001: the not-found page is a top-level file, not
 * a route directory). Returns the path written, relative to `outDir` with forward slashes.
 */
export function writePage(outDir, pagePath, html) {
  const resolvedOutDir = path.resolve(outDir)
  const target = resolvedTarget(resolvedOutDir, pagePath)

  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, html)

  return path.relative(resolvedOutDir, target).split(path.sep).join('/')
}

function resolvedTarget(resolvedOutDir, pagePath) {
  const target =
    pagePath === '/404'
      ? path.resolve(resolvedOutDir, '404.html')
      : path.resolve(resolvedOutDir, `.${pagePath}`, 'index.html')

  if (target !== resolvedOutDir && !target.startsWith(resolvedOutDir + path.sep)) {
    throw new Error(`Refusing to write outside ${resolvedOutDir}: ${target}`)
  }

  return target
}

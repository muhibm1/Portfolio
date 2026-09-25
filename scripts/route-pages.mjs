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
import { staticRoutePaths } from '../src/routePaths.js'
import { portfolioData } from '../src/data/portfolioData.js'

/** staticRoutePaths applied to the real case-study data. */
export function sitePagePaths() {
  return staticRoutePaths(portfolioData.caseStudies)
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
  if (!shellHtml.includes('<div id="root"></div>')) {
    throw new Error('Shell is missing an empty <div id="root"></div>')
  }

  return shellHtml
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta[^>]*name=["']description["'][^>]*>\s*/i, '')
    .replace('</head>', `${headHtml}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
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

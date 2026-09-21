/**
 * Applies the route list (src/routePaths.js) to the real case-study data and writes a
 * byte-identical copy of the built index.html into a directory per route, so GitHub Pages
 * answers every app route with a real file and HTTP 200 (R117, ADR 0001). vite.config.js calls
 * writeRoutePages from closeBundle, after the existing 404.html copy.
 *
 * Every target is validated against the resolved output directory before the first byte is
 * written, so a path that would resolve outside it fails the whole call instead of writing
 * partway through.
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
 * Copies <outDir>/index.html to <outDir><path>/index.html for every path except /. Returns the
 * repository-relative paths written, in order, with forward slashes.
 */
export function writeRoutePages(outDir, pagePaths) {
  const resolvedOutDir = path.resolve(outDir)
  const shellPath = path.join(resolvedOutDir, 'index.html')
  if (!fs.existsSync(shellPath)) {
    throw new Error(`${resolvedOutDir}/index.html does not exist; run the build first`)
  }

  const targets = pagePaths
    .filter((pagePath) => pagePath !== '/')
    .map((pagePath) => resolvedTarget(resolvedOutDir, pagePath))

  const shellBytes = fs.readFileSync(shellPath)
  for (const target of targets) {
    fs.mkdirSync(path.dirname(target.absolutePath), { recursive: true })
    fs.writeFileSync(target.absolutePath, shellBytes)
  }

  return targets.map((target) => target.relativePath)
}

function resolvedTarget(resolvedOutDir, pagePath) {
  const resolvedAbsolutePath = path.resolve(resolvedOutDir, `.${pagePath}`, 'index.html')
  if (!resolvedAbsolutePath.startsWith(resolvedOutDir + path.sep)) {
    throw new Error(`Refusing to write outside ${resolvedOutDir}: ${resolvedAbsolutePath}`)
  }

  return {
    absolutePath: resolvedAbsolutePath,
    relativePath: path.relative(resolvedOutDir, resolvedAbsolutePath).split(path.sep).join('/'),
  }
}

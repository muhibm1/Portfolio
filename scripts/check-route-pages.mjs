/**
 * Proves every route the app defines has a real page in the built site and nothing else does, so
 * GitHub Pages answers every route with HTTP 200 and never serves a stray file as one (R119). The
 * expected set comes from sitePagePaths() (scripts/route-pages.mjs), the list the build writes
 * from, so it tracks the case-study data instead of being hand-maintained.
 *
 * Usage:
 *   node scripts/check-route-pages.mjs         scan dist/, resolved from the repository root
 *   node scripts/check-route-pages.mjs <dir>   scan <dir>, resolved from the working directory
 *
 * Exit codes: 0 every route page and 404.html are byte-identical to index.html and no other
 * index.html exists; 1 a page is missing, stale or unexpected, each named on its own line; 2 the
 * check could not run (the directory or its index.html is missing or unreadable).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sitePagePaths } from './route-pages.mjs'

const EXIT_CLEAN = 0
const EXIT_VIOLATION = 1
const EXIT_CANNOT_RUN = 2
const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

process.exitCode = main(process.argv.slice(2))

function main([directoryArgument]) {
  const directory =
    directoryArgument === undefined ? path.join(REPOSITORY_ROOT, 'dist') : path.resolve(directoryArgument)

  try {
    const shellBytes = readShell(directory)
    const expectedPages = pageRelativePaths()
    const offenders = [
      ...missingOrStaleOffenders(directory, [...expectedPages, '404.html'], shellBytes),
      ...unexpectedOffenders(directory, expectedPages),
    ]

    if (offenders.length > 0) {
      for (const line of offenders) console.log(line)
      return EXIT_VIOLATION
    }

    console.log(
      `Route page check passed (R119): ${expectedPages.length} route pages and 404.html ` +
        `match ${displayPath(directory)}/index.html.`,
    )
    return EXIT_CLEAN
  } catch (error) {
    console.log(`::error::Route page check could not run (R119): ${error.message}`)
    return EXIT_CANNOT_RUN
  }
}

/** sitePagePaths() minus /, mapped to the relative file each route page is written to. */
function pageRelativePaths() {
  return sitePagePaths()
    .filter((pagePath) => pagePath !== '/')
    .map((pagePath) => `${pagePath.slice(1)}/index.html`)
}

/** Reads index.html, the shell every page must match. Throws when the directory or file is missing or unreadable. */
function readShell(directory) {
  if (!fs.existsSync(directory)) {
    throw new Error(`${displayPath(directory)} does not exist; run npm run build first`)
  }

  const shellPath = path.join(directory, 'index.html')
  try {
    return fs.readFileSync(shellPath)
  } catch {
    throw new Error(`${displayPath(shellPath)} does not exist; run npm run build first`)
  }
}

/** One offender line per expected file that is missing or whose bytes differ from the shell. */
function missingOrStaleOffenders(directory, expectedRelativePaths, shellBytes) {
  const lines = []
  for (const relativePath of expectedRelativePaths) {
    const fullPath = path.join(directory, relativePath)
    if (!fs.existsSync(fullPath)) {
      lines.push(offenderLine(relativePath, 'is missing'))
      continue
    }

    const actualBytes = fs.readFileSync(fullPath)
    if (!actualBytes.equals(shellBytes)) {
      const reason = `differs from index.html (${actualBytes.length} bytes, expected ${shellBytes.length})`
      lines.push(offenderLine(relativePath, reason))
    }
  }
  return lines
}

/** One offender line per index.html found anywhere under the directory that the app does not define. */
function unexpectedOffenders(directory, expectedRelativePaths) {
  const expected = new Set(expectedRelativePaths)
  const found = fs
    .readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name === 'index.html')
    .map((entry) => relativeSlashPath(directory, path.join(entry.parentPath, entry.name)))
    .filter((relativePath) => relativePath !== 'index.html' && !expected.has(relativePath))
    .sort()

  return found.map((relativePath) => offenderLine(relativePath, 'is not a page the app defines'))
}

function offenderLine(relativePath, reason) {
  return `::error::Route page check failed (R119): ${relativePath} ${reason}`
}

function relativeSlashPath(from, to) {
  return path.relative(from, to).split(path.sep).join('/')
}

function displayPath(absolutePath) {
  return relativeSlashPath(REPOSITORY_ROOT, absolutePath)
}

/**
 * Proves every route the app defines answers with a real, per-page file under dist/, each
 * carrying the markers R142 names, and that nothing else is served as a page (R142, ADR 0001).
 *
 * Byte-identical pages ended with prerendering (2026-09-25 ADR 0001): every page now carries its
 * own title, canonical and rendered markup, so this check reads markers instead of comparing
 * bytes to dist/index.html. The expected page set still comes from sitePagePaths()
 * (scripts/route-pages.mjs), so it tracks the case-study data instead of being hand-maintained.
 *
 * Usage:
 *   node scripts/check-route-pages.mjs         scan dist/, resolved from the working directory
 *   node scripts/check-route-pages.mjs <dir>   scan <dir>, resolved from the working directory
 *
 * Exit codes: 0 every page carries every marker and no stray .html file exists; 1 at least one
 * marker is missing, one `::error::` line per offender naming the file and the marker, never
 * file content; 2 the check could not run (the directory or its index.html is missing).
 */

import fs from 'node:fs'
import path from 'node:path'
import { sitePagePaths } from './route-pages.mjs'

const EXIT_CLEAN = 0
const EXIT_VIOLATION = 1
const EXIT_CANNOT_RUN = 2

const SITE_URL = 'https://muhibm1.github.io/Portfolio/'

// Copied from .github/workflows/deploy.yml line 446 (R82's phone pattern), kept identical so the
// build-time check and the deploy smoke reject the same shape of number.
const PHONE_PATTERN = /\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-][0-9]{4}/

process.exitCode = main(process.argv.slice(2))

function main([directoryArgument]) {
  const directory = directoryArgument === undefined ? path.join(process.cwd(), 'dist') : path.resolve(directoryArgument)

  try {
    const shellHtml = readShell(directory)
    const shellAssetTags = assetTags(shellHtml)
    const pages = expectedPages()

    const offenders = [
      ...pages.flatMap((page) => pageOffenders(directory, page, shellAssetTags)),
      ...unexpectedOffenders(directory, pages),
    ]

    if (offenders.length > 0) {
      for (const line of offenders) console.log(line)
      return EXIT_VIOLATION
    }

    console.log(`Route page check passed (R142): ${pages.length} pages carry their markers.`)
    return EXIT_CLEAN
  } catch (error) {
    console.log(`::error::Route page check could not run (R142): ${error instanceof Error ? error.message : String(error)}`)
    console.error(error instanceof Error ? error.stack : error)
    return EXIT_CANNOT_RUN
  }
}

/** The pages sitePagePaths() defines, plus 404.html, each with its relative file and expected canonical. */
function expectedPages() {
  const routePages = sitePagePaths().map((pagePath) => ({
    relativePath: pagePath === '/' ? 'index.html' : `${pagePath.slice(1)}/index.html`,
    canonical: pagePath === '/' ? SITE_URL : `${SITE_URL}${pagePath.slice(1)}/`,
    notFound: false,
  }))

  return [...routePages, { relativePath: '404.html', canonical: null, notFound: true }]
}

function readShell(directory) {
  if (!fs.existsSync(directory)) {
    throw new Error(`${directory} does not exist; run npm run build first`)
  }

  const shellPath = path.join(directory, 'index.html')
  try {
    return fs.readFileSync(shellPath, 'utf8')
  } catch {
    throw new Error(`${shellPath} does not exist; run npm run build first`)
  }
}

/** Every <script type="module" ...> and <link rel="stylesheet" ...> tag, in the order they appear. */
function assetTags(html) {
  const moduleScripts = html.match(/<script[^>]*type="module"[^>]*><\/script>/gi) ?? []
  const stylesheets = html.match(/<link[^>]*rel="stylesheet"[^>]*>/gi) ?? []
  return [...moduleScripts, ...stylesheets]
}

function pageOffenders(directory, page, shellAssetTags) {
  const fullPath = path.join(directory, page.relativePath)
  if (!fs.existsSync(fullPath)) {
    return [offenderLine(page.relativePath, 'is missing')]
  }

  const html = fs.readFileSync(fullPath, 'utf8')
  const offenders = []

  for (const tag of shellAssetTags) {
    if (!html.includes(tag)) offenders.push(offenderLine(page.relativePath, 'is missing a script or stylesheet tag from index.html'))
  }

  if (page.notFound) {
    if (countMatches(html, /rel="canonical"/gi) !== 0) {
      offenders.push(offenderLine(page.relativePath, 'has a canonical link, but the not-found page must have none'))
    }
    if (countMatches(html, /name="robots"[^>]*content="noindex"/gi) !== 1) {
      offenders.push(offenderLine(page.relativePath, 'is missing meta name="robots" content="noindex"'))
    }
  } else {
    if (!html.includes(`rel="canonical" href="${page.canonical}"`)) {
      offenders.push(offenderLine(page.relativePath, `is missing the canonical link to ${page.canonical}`))
    }
  }

  if (countMatches(html, /http-equiv="Content-Security-Policy"/gi) !== 1) {
    offenders.push(offenderLine(page.relativePath, 'does not have exactly one Content-Security-Policy meta tag'))
  }
  if (countMatches(html, /name="referrer"/gi) !== 1) {
    offenders.push(offenderLine(page.relativePath, 'does not have exactly one name="referrer" meta tag'))
  }
  if (hasInlineScript(html)) {
    offenders.push(offenderLine(page.relativePath, 'has a <script> without a src attribute'))
  }
  if (/fonts\.googleapis\.com/i.test(html)) {
    offenders.push(offenderLine(page.relativePath, 'references fonts.googleapis.com'))
  }
  if (/fonts\.gstatic\.com/i.test(html)) {
    offenders.push(offenderLine(page.relativePath, 'references fonts.gstatic.com'))
  }
  if (PHONE_PATTERN.test(html)) {
    offenders.push(offenderLine(page.relativePath, 'contains a phone-shaped number'))
  }
  const rootContentMatch = html.match(/<div id="root">([\s\S]*?)<\/div>\s*(?:<script|<\/body>)/i)
  if (!rootContentMatch || rootContentMatch[1].trim() === '') {
    offenders.push(offenderLine(page.relativePath, 'has an empty #root'))
  }

  return offenders
}

function countMatches(html, pattern) {
  return html.match(pattern)?.length ?? 0
}

function hasInlineScript(html) {
  const scriptTags = html.match(/<script\b[^>]*>/gi) ?? []
  return scriptTags.some((tag) => !/\ssrc=/i.test(tag))
}

/** One offender line per .html file found anywhere under the directory that is not an expected page. */
function unexpectedOffenders(directory, pages) {
  const expected = new Set(pages.map((page) => page.relativePath))
  const found = fs
    .readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.html'))
    .map((entry) => relativeSlashPath(directory, path.join(entry.parentPath, entry.name)))
    .filter((relativePath) => !expected.has(relativePath))
    .sort()

  return found.map((relativePath) => offenderLine(relativePath, 'is not a page the app defines'))
}

function offenderLine(relativePath, marker) {
  return `::error::Route page check failed (R142): ${relativePath} ${marker}`
}

function relativeSlashPath(from, to) {
  return path.relative(from, to).split(path.sep).join('/')
}

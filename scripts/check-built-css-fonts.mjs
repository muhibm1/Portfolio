/**
 * Applies the font rule to every .css file under a directory and fails when a font is delivered as
 * a data: URL or from anywhere but /Portfolio/assets/. The site's CSP sends font-src 'self', so a
 * browser blocks every other source and the face silently never loads; see ADR 0001.
 *
 * The same rule is written a second time, in bash, in the `Smoke R100: the served stylesheets
 * inline no font` step of .github/workflows/deploy.yml, which applies it to the stylesheets the
 * live site serves. A change to either copy belongs in both. src/checkBuiltCssFonts.test.js (R98)
 * proves this copy; the R104 rehearsal proves that one.
 *
 * Usage:
 *   node scripts/check-built-css-fonts.mjs         scan dist/, resolved from the repository root
 *   node scripts/check-built-css-fonts.mjs <dir>   scan <dir>, resolved from the working directory
 *
 * Exit codes: 0 every font URL is a file under /Portfolio/assets/; 1 at least one stylesheet breaks
 * the rule, named with its counts; 2 the check could not run, so it never passes on nothing.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const EXIT_CLEAN = 0
const EXIT_VIOLATION = 1
const EXIT_CANNOT_RUN = 2

// Mirrors PAGES_BASE in vite.config.js joined to Vite's `assets` directory. Compared
// case-sensitively, because a URL path is.
const REQUIRED_PREFIX = '/Portfolio/assets/'

// `url(`, optional whitespace and at most one quote, then the value starts.
const URL_VALUE_START = /url\(\s*["']?/gi
const DATA_FONT_URL = /url\(\s*["']?data:font/gi
const FONT_FACE_BLOCK = /@font-face[^}]*\}/gi

// Enough to identify the source, short enough to keep a base64 payload out of the log.
const EXCERPT_LIMIT = 60

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

process.exitCode = main(process.argv.slice(2))

function main([directoryArgument]) {
  const directory =
    directoryArgument === undefined
      ? path.join(REPOSITORY_ROOT, 'dist')
      : path.resolve(directoryArgument)

  try {
    const reports = readStylesheets(directory).map(reportOn)
    for (const { countsLine } of reports) console.log(countsLine)
    return verdict(reports, directory)
  } catch (error) {
    console.log(`::error::Built CSS font check could not run (R97): ${error.message}`)
    return EXIT_CANNOT_RUN
  }
}

/** Every .css file under the directory, recursively, in a stable order. Throws when there is none. */
function readStylesheets(directory) {
  if (!fs.existsSync(directory)) {
    throw new Error(`${displayPath(directory)} does not exist; run npm run build first`)
  }

  const stylesheetPaths = listCssFilesUnder(directory).sort()
  if (stylesheetPaths.length === 0) {
    throw new Error(`no .css file under ${displayPath(directory)}; run npm run build first`)
  }

  return stylesheetPaths.map((stylesheetPath) => ({
    displayedPath: displayPath(stylesheetPath),
    text: readText(stylesheetPath),
  }))
}

/**
 * Counts one stylesheet by the font rule: data font URLs anywhere in the file, @font-face blocks,
 * the url() sources inside them, and which of those sources fall outside the required prefix.
 */
function reportOn({ displayedPath, text }) {
  const blocks = [...text.matchAll(FONT_FACE_BLOCK)]
  const fontUrls = blocks.flatMap(fontUrlsInBlock)
  const dataFontIndexes = [...text.matchAll(DATA_FONT_URL)].map((match) => match.index)
  const outsideIndexes = fontUrls
    .filter(({ value }) => !value.startsWith(REQUIRED_PREFIX))
    .map(({ index }) => index)

  return {
    blockCount: blocks.length,
    urlCount: fontUrls.length,
    countsLine:
      `${displayedPath}: ${blocks.length} @font-face blocks, ${fontUrls.length} font URLs, ` +
      `${dataFontIndexes.length} data: font URLs`,
    errorLine: failureLine(displayedPath, text, dataFontIndexes, outsideIndexes),
  }
}

function verdict(reports, directory) {
  const errorLines = reports.map(({ errorLine }) => errorLine).filter((line) => line !== null)
  if (errorLines.length > 0) {
    for (const line of errorLines) console.log(line)
    return EXIT_VIOLATION
  }

  const blockCount = totalOf(reports, 'blockCount')
  const urlCount = totalOf(reports, 'urlCount')
  const nothingToJudge = describeNothingToJudge(blockCount, urlCount, reports.length, directory)
  if (nothingToJudge !== null) {
    console.log(`::error::Built CSS font check could not run (R97): ${nothingToJudge}`)
    return EXIT_CANNOT_RUN
  }

  console.log(
    `Built CSS font check passed (R97): ${reports.length} CSS file(s), ${blockCount} ` +
      `@font-face blocks, ${urlCount} font URLs, 0 data: font URLs.`,
  )
  return EXIT_CLEAN
}

/**
 * The floor that stops a green run on nothing: the rule can only be judged where there is at least
 * one @font-face block and at least one url() inside them. Null when there is something to judge.
 */
function describeNothingToJudge(blockCount, urlCount, fileCount, directory) {
  if (blockCount === 0) {
    return `no @font-face block in the ${fileCount} .css file(s) under ${displayPath(directory)}`
  }
  if (urlCount === 0) {
    return `the ${blockCount} @font-face block(s) under ${displayPath(directory)} hold no url()`
  }
  return null
}

/** Null when the stylesheet passes. Otherwise one log line with the counts and a capped excerpt. */
function failureLine(displayedPath, text, dataFontIndexes, outsideIndexes) {
  const violationIndexes = [...dataFontIndexes, ...outsideIndexes]
  if (violationIndexes.length === 0) return null

  return (
    `::error::Built CSS font check failed (R97): ${displayedPath} has ${dataFontIndexes.length} ` +
    `data: font URL(s) and ${outsideIndexes.length} @font-face URL(s) outside ${REQUIRED_PREFIX} ` +
    `(first: ${excerptAt(text, Math.min(...violationIndexes))}). ` +
    `The CSP allows font-src 'self' only; see ADR 0001.`
  )
}

/** Whitespace is collapsed so a source split over lines still prints as a single log line. */
function excerptAt(text, index) {
  return text.slice(index, index + EXCERPT_LIMIT).replace(/\s+/g, ' ')
}

/** Each url() source inside one @font-face block, with its index in the whole file. local() is not one. */
function fontUrlsInBlock(blockMatch) {
  const block = blockMatch[0]
  return [...block.matchAll(URL_VALUE_START)].map((urlMatch) => ({
    index: blockMatch.index + urlMatch.index,
    value: block.slice(urlMatch.index + urlMatch[0].length),
  }))
}

function listCssFilesUnder(directory) {
  return fs
    .readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.css'))
    .map((entry) => path.join(entry.parentPath, entry.name))
}

function readText(stylesheetPath) {
  try {
    return fs.readFileSync(stylesheetPath, 'utf8')
  } catch (error) {
    throw new Error(`${displayPath(stylesheetPath)} could not be read: ${error.message}`)
  }
}

function totalOf(reports, countName) {
  return reports.reduce((runningTotal, report) => runningTotal + report[countName], 0)
}

function displayPath(absolutePath) {
  return path.relative(REPOSITORY_ROOT, absolutePath).split(path.sep).join('/')
}

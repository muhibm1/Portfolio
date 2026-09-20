/**
 * Checks that .npmrc holds only engine-strict=true (R107) before the deploy workflow's guard
 * step lets npm ci read the file (R113). Usage: node scripts/check-npmrc.mjs [dir], dir
 * defaults to the repository root. Exit: 0 clean; 1 another setting, named by line and key,
 * never by value; 2 the file is missing or unreadable, so the check never passes on nothing.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const EXIT_CLEAN = 0
const EXIT_VIOLATION = 1
const EXIT_CANNOT_RUN = 2
const ALLOWED_LINE = 'engine-strict=true'
const KEY_LIMIT = 60
const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

process.exitCode = main(process.argv.slice(2))

function main([directoryArgument]) {
  const directory = directoryArgument === undefined ? REPOSITORY_ROOT : path.resolve(directoryArgument)
  const npmrcPath = path.join(directory, '.npmrc')
  const displayedPath = path.relative(REPOSITORY_ROOT, npmrcPath).split(path.sep).join('/')
  let text
  try {
    text = fs.readFileSync(npmrcPath, 'utf8')
  } catch {
    console.log(
      `::error::npmrc allowlist check could not run (R113): ${displayedPath} is missing or ` +
        `unreadable, and engine-strict is not enforced without it.`,
    )
    return EXIT_CANNOT_RUN
  }
  const offenders = offendingLines(text)
  if (offenders.length === 0) {
    if (!hasAllowedLine(text)) {
      console.log(
        `::error::npmrc allowlist check failed (R113): ${displayedPath} does not set ` +
          `engine-strict=true, so the Node floor is not enforced.`,
      )
      return EXIT_VIOLATION
    }
    console.log(`npmrc allowlist passed (R113): ${displayedPath} sets engine-strict=true and nothing else.`)
    return EXIT_CLEAN
  }
  for (const { number, key } of offenders) {
    const setsKey = key === null ? '' : ` sets "${key}",`
    console.log(
      `::error::npmrc allowlist check failed (R113): ${displayedPath} line ${number}${setsKey} ` +
        `which is not permitted; the only allowed setting is engine-strict=true.`,
    )
  }
  return EXIT_VIOLATION
}

// Trims each side of the first "=" so `engine-strict = true` compares equal to the allowed
// setting without weakening the allowlist: anything besides whitespace around the "=" still
// fails the comparison.
function normalizeSetting(line) {
  return line.split('=').map((part) => part.trim()).join('=')
}

// npm's own ini parser (the code that actually reads this file at install time) treats a lone
// "\r" as a line terminator, not only "\r\n" and "\n". Splitting on "\r\n|\r|\n" matches that:
// a setting hidden behind a lone CR inside what looks like one comment line is its own line here
// too, so it cannot slip past this guard as part of the comment text ahead of it. Each element of
// the split is numbered in order, so "line" here means "line as npm's parser would count it",
// which can differ from a text editor's line count for a file containing a lone CR; that is
// deliberate, since the CI log line number exists to point a reader at what npm will read.
function candidateLines(text) {
  return text
    .replace(/^﻿/, '')
    .split(/\r\n|\r|\n/)
    .map((rawLine, index) => ({ number: index + 1, line: rawLine.trim() }))
    .filter(({ line }) => line !== '' && !line.startsWith('#') && !line.startsWith(';'))
}

function hasAllowedLine(text) {
  return candidateLines(text).some(({ line }) => normalizeSetting(line) === ALLOWED_LINE)
}

function offendingLines(text) {
  return candidateLines(text)
    .filter(({ line }) => normalizeSetting(line) !== ALLOWED_LINE)
    .map(({ number, line }) => {
      const equalsIndex = line.indexOf('=')
      const key = equalsIndex === -1 ? null : sanitizeKey(line.slice(0, equalsIndex).slice(0, KEY_LIMIT))
      return { number, key }
    })
}

// Attacker-influenced key text is echoed into a public Actions annotation; strip non-printable
// and non-ASCII characters (unicode lookalikes included) before printing it.
function sanitizeKey(key) {
  return key.replace(/[^\x20-\x7E]/g, '?')
}

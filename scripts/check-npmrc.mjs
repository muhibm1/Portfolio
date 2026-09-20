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

function offendingLines(text) {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map((rawLine, index) => ({ number: index + 1, line: rawLine.trim() }))
    .filter(({ line }) => line !== '' && !line.startsWith('#') && !line.startsWith(';') && line !== ALLOWED_LINE)
    .map(({ number, line }) => {
      const equalsIndex = line.indexOf('=')
      const key = equalsIndex === -1 ? null : line.slice(0, equalsIndex).slice(0, KEY_LIMIT)
      return { number, key }
    })
}

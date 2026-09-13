/**
 * Fails if any tracked file, or any file under a directory passed as an argument, contains the
 * owner's phone number in one of three forms (R89, ADR 0010). The number is recovered at run time
 * from the commit that first imported it, so this file never carries its digits. Output names the
 * path, the line number and the form, never the text that matched.
 *
 * Usage, from the repository root:
 *   node scripts/check-phone-redaction.mjs              scan every path `git ls-files` prints
 *   node scripts/check-phone-redaction.mjs dist         also scan every file under dist/
 *   node scripts/check-phone-redaction.mjs --self-test  prove the matchers on synthetic numbers
 *
 * Exit codes: 0 no hit and at least one file scanned; 1 at least one hit, or a self-test failure;
 * 2 the check could not run, for example because the reference number could not be derived.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const EXIT_CLEAN = 0
const EXIT_HIT = 1
const EXIT_CANNOT_RUN = 2

const REFERENCE_COMMIT = 'b50497f'
const REFERENCE_FILE = 'src/data/portfolioData.js'
const PHONE_KEY_LINE = /^\s*["']?phone["']?\s*:/

const FULL_NUMBER = 'full number'
const LAST_SEVEN_DIGITS = 'last seven digits'
const AREA_CODE_AND_EXCHANGE = 'area code and exchange'

// Allowed between digit groups: "(NNN) NNN-NNNN" uses two, "NNN - NNNN" uses three.
const SEPARATORS = '[ .()-]{0,3}'

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// A made-up number one exchange digit away from the generic example on
// src/data/portfolioData.test.js line 48, so that example is a near-miss in every form.
const SELF_TEST_REFERENCE = '5555560100'

// Each form rendered three ways: no separator, hyphens, and a parenthesised area code and a space.
const SELF_TEST_FORMS = [
  { formName: FULL_NUMBER, rendering: 'no separator', text: '5555560100' },
  { formName: FULL_NUMBER, rendering: 'hyphens', text: '555-556-0100' },
  { formName: FULL_NUMBER, rendering: 'parenthesised area code', text: '(555) 556-0100' },
  { formName: LAST_SEVEN_DIGITS, rendering: 'no separator', text: '5560100' },
  { formName: LAST_SEVEN_DIGITS, rendering: 'hyphens', text: '556-0100' },
  { formName: LAST_SEVEN_DIGITS, rendering: 'parenthesised other area code', text: '(999) 556-0100' },
  { formName: AREA_CODE_AND_EXCHANGE, rendering: 'no separator', text: '555556' },
  { formName: AREA_CODE_AND_EXCHANGE, rendering: 'hyphens', text: '555-556' },
  { formName: AREA_CODE_AND_EXCHANGE, rendering: 'parenthesised area code', text: '(555) 556-xxxx' },
]

// None of these may match any form.
const SELF_TEST_NEAR_MISSES = [
  { description: 'look-alike from portfolioData.test.js, parenthesised', text: '(555) 555-0100' },
  { description: 'look-alike from portfolioData.test.js, hyphens', text: '555-555-0100' },
  { description: 'look-alike from portfolioData.test.js, dots', text: '555.555.0100' },
  { description: 'full number with a digit directly before it', text: '95555560100' },
  { description: 'full number with a digit directly after it', text: '55555601009' },
  { description: 'four separators between every group', text: '555....556....0100' },
]

process.exitCode = main(process.argv.slice(2))

function main(args) {
  try {
    return args.includes('--self-test') ? runSelfTest() : runScan(args)
  } catch (error) {
    console.error(`check-phone-redaction could not run: ${error.message}`)
    return EXIT_CANNOT_RUN
  }
}

function runScan(directoryArguments) {
  const matchers = buildMatchers(readReferenceNumber())
  const absolutePaths = new Set([
    ...listTrackedPaths().map((trackedPath) => path.join(REPOSITORY_ROOT, trackedPath)),
    ...directoryArguments.flatMap(listFilesUnder),
  ])
  let filesScanned = 0
  let filesSkipped = 0
  let hits = 0

  for (const absolutePath of absolutePaths) {
    const text = readTextFile(absolutePath)
    if (text === null) {
      filesSkipped += 1
      continue
    }
    filesScanned += 1
    text.split('\n').forEach((line, index) => {
      for (const formName of formNamesFoundIn(line, matchers)) {
        console.log(`${displayPath(absolutePath)}:${index + 1}: ${formName}`)
        hits += 1
      }
    })
  }

  console.log(`Scanned ${filesScanned} files (${filesSkipped} skipped as binary or missing), ${hits} hits.`)
  if (filesScanned === 0) throw new Error('no file was scanned, so a clean result would prove nothing')
  return hits === 0 ? EXIT_CLEAN : EXIT_HIT
}

function runSelfTest() {
  const matchers = buildMatchers(SELF_TEST_REFERENCE)
  const isFoundIn = (text, formName) =>
    formNamesFoundIn(`Call ${text} today.`, matchers).includes(formName)
  const isAnyFormFoundIn = (text) => formNamesFoundIn(`Call ${text} today.`, matchers).length > 0

  const missedForms = SELF_TEST_FORMS.filter(({ formName, text }) => !isFoundIn(text, formName))
  const matchedNearMisses = SELF_TEST_NEAR_MISSES.filter(({ text }) => isAnyFormFoundIn(text))

  for (const { formName, rendering } of missedForms) console.log(`MISSED ${formName}, ${rendering}`)
  for (const { description } of matchedNearMisses) console.log(`FALSE HIT ${description}`)
  console.log(
    `Self-test: ${SELF_TEST_FORMS.length - missedForms.length} of ${SELF_TEST_FORMS.length} form ` +
      `renderings hit, ${matchedNearMisses.length} of ${SELF_TEST_NEAR_MISSES.length} near-misses hit.`,
  )
  return missedForms.length === 0 && matchedNearMisses.length === 0 ? EXIT_CLEAN : EXIT_HIT
}

/**
 * One matcher per form of a ten-digit North American number, split 3, 3, 4 into area code,
 * exchange and line number. A match allows zero to three separators between groups and rejects
 * a digit directly before or after it, so longer digit runs such as hashes do not match.
 */
function buildMatchers(digits) {
  const areaCode = digits.slice(0, 3)
  const exchange = digits.slice(3, 6)
  const lineNumber = digits.slice(6)
  return [
    { formName: FULL_NUMBER, pattern: digitGroupsPattern([areaCode, exchange, lineNumber]) },
    { formName: LAST_SEVEN_DIGITS, pattern: digitGroupsPattern([exchange, lineNumber]) },
    { formName: AREA_CODE_AND_EXCHANGE, pattern: digitGroupsPattern([areaCode, exchange]) },
  ]
}

function digitGroupsPattern(groups) {
  return new RegExp(`(?<!\\d)${groups.join(SEPARATORS)}(?!\\d)`)
}

function formNamesFoundIn(line, matchers) {
  return matchers.filter(({ pattern }) => pattern.test(line)).map(({ formName }) => formName)
}

/** Returns the ten digits of the `phone` value at the reference commit. Never log the result. */
function readReferenceNumber() {
  const unavailable = `the reference could not be derived from ${REFERENCE_COMMIT}:${REFERENCE_FILE}`
  const source = runGit(
    ['show', `${REFERENCE_COMMIT}:${REFERENCE_FILE}`],
    `${unavailable}. This check needs the full git history, which a shallow clone does not have`,
  )
  const phoneLines = source.split('\n').filter((line) => PHONE_KEY_LINE.test(line))
  if (phoneLines.length !== 1) {
    throw new Error(`${unavailable}: expected 1 line holding the phone key, found ${phoneLines.length}`)
  }
  const digits = phoneLines[0].replace(/\D/g, '')
  if (digits.length !== 10) {
    throw new Error(`${unavailable}: expected 10 digits on the phone line, found ${digits.length}`)
  }
  return digits
}

function listTrackedPaths() {
  const output = runGit(['ls-files', '-z'], 'git ls-files failed')
  return output.split('\0').filter((trackedPath) => trackedPath !== '')
}

function runGit(gitArguments, failureMessage) {
  try {
    return execFileSync('git', gitArguments, {
      cwd: REPOSITORY_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
    })
  } catch (error) {
    const gitMessage = String(error.stderr ?? '').trim().split('\n')[0] || error.message
    throw new Error(`${failureMessage} (git said: ${gitMessage})`)
  }
}

function listFilesUnder(directoryArgument) {
  const absolutePath = path.resolve(directoryArgument)
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`${directoryArgument} does not exist; run the build first or drop the argument`)
  }
  if (!fs.statSync(absolutePath).isDirectory()) return [absolutePath]
  return fs
    .readdirSync(absolutePath, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
}

/** Returns the file's text, or null for a tracked path deleted from disk or a binary file. */
function readTextFile(absolutePath) {
  let bytes
  try {
    bytes = fs.readFileSync(absolutePath)
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
  const hasNulByte = bytes.includes(0)
  return hasNulByte ? null : bytes.toString('utf8')
}

function displayPath(absolutePath) {
  return path.relative(REPOSITORY_ROOT, absolutePath).split(path.sep).join('/')
}

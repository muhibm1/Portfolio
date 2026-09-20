/**
 * The phone-redaction scan (R89, ADR 0010): finds the owner's phone number in tracked files, or in
 * any file under a directory argument. A file is read as UTF-8 and, when it holds a zero byte, also
 * as UTF-16LE and UTF-16BE from both possible alignments; every layer that decodes is scanned, and a
 * hit in any layer counts. A hit anywhere outranks an incomplete scan: exit 1 if any hit, else exit 2
 * if any file could not be decoded with confidence or nothing was scanned, else exit 0 (ADR 0002).
 * The number is recovered at run time from the commit that first imported it, so this file never
 * carries its digits, and no report line ever holds matched text or a reference digit.
 *
 * `--self-test` proves the matchers on the synthetic reference number; `--self-test <dir> [<dir>...]`
 * also scans the named directories for that synthetic number, through the same scan a real run uses,
 * and never touches a tracked file in this mode (ADR 0003).
 *
 * Importing this module runs nothing: `main` and `exitCodeOrCannotRun` are called only by the entry,
 * scripts/check-phone-redaction.mjs (ADR 0001).
 */

import { execFileSync } from 'node:child_process'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const EXIT_CLEAN = 0
export const EXIT_HIT = 1
export const EXIT_CANNOT_RUN = 2

// A made-up number one exchange digit away from the generic example on
// src/data/portfolioData.test.js line 48, so that example is a near-miss in every form.
export const SELF_TEST_REFERENCE = '5555560100'

// Only the binary types present today: the design mockups, the hero image and the self-hosted
// fonts. Any other binary type fails the scan as undecodable until its extension is added here.
export const BINARY_EXTENSIONS = ['.jpg', '.png', '.woff', '.woff2']

const REFERENCE_COMMIT = 'b50497f'
const REFERENCE_FILE = 'src/data/portfolioData.js'
const PHONE_KEY_LINE = /^\s*["']?phone["']?\s*:/

const FULL_NUMBER = 'full number'
const LAST_SEVEN_DIGITS = 'last seven digits'
const AREA_CODE_AND_EXCHANGE = 'area code and exchange'

// Allowed between digit groups: "(NNN) NNN-NNNN" uses two, "NNN - NNNN" uses three.
const SEPARATORS = '[ .()-]{0,3}'

// An optional North American country code, "1" or "+1", written directly in front of the area code.
const COUNTRY_CODE = `(?:\\+?1${SEPARATORS})?`

const REPOSITORY_ROOT = fs.realpathSync.native(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
)

// Each form rendered three ways: no separator, hyphens, and a parenthesised area code and a space.
// The two forms that start at the area code are also rendered after a country code, four ways.
const SELF_TEST_FORMS = [
  { formName: FULL_NUMBER, rendering: 'no separator', text: '5555560100' },
  { formName: FULL_NUMBER, rendering: 'hyphens', text: '555-556-0100' },
  { formName: FULL_NUMBER, rendering: 'parenthesised area code', text: '(555) 556-0100' },
  { formName: FULL_NUMBER, rendering: '+1 and no separator', text: '+15555560100' },
  { formName: FULL_NUMBER, rendering: '1 and no separator', text: '15555560100' },
  { formName: FULL_NUMBER, rendering: '+1 and a space', text: '+1 555-556-0100' },
  { formName: FULL_NUMBER, rendering: '1 and a hyphen', text: '1-555-556-0100' },
  { formName: LAST_SEVEN_DIGITS, rendering: 'no separator', text: '5560100' },
  { formName: LAST_SEVEN_DIGITS, rendering: 'hyphens', text: '556-0100' },
  { formName: LAST_SEVEN_DIGITS, rendering: 'parenthesised other area code', text: '(999) 556-0100' },
  { formName: AREA_CODE_AND_EXCHANGE, rendering: 'no separator', text: '555556' },
  { formName: AREA_CODE_AND_EXCHANGE, rendering: 'hyphens', text: '555-556' },
  { formName: AREA_CODE_AND_EXCHANGE, rendering: 'parenthesised area code', text: '(555) 556-xxxx' },
  { formName: AREA_CODE_AND_EXCHANGE, rendering: '+1 and no separator', text: '+1555556' },
  { formName: AREA_CODE_AND_EXCHANGE, rendering: '1 and no separator', text: '1555556' },
  { formName: AREA_CODE_AND_EXCHANGE, rendering: '+1 and a space', text: '+1 555-556' },
  { formName: AREA_CODE_AND_EXCHANGE, rendering: '1 and a hyphen', text: '1-555-556' },
]

// None of these may match any form.
const SELF_TEST_NEAR_MISSES = [
  { description: 'look-alike from portfolioData.test.js, parenthesised', text: '(555) 555-0100' },
  { description: 'look-alike from portfolioData.test.js, hyphens', text: '555-555-0100' },
  { description: 'look-alike from portfolioData.test.js, dots', text: '555.555.0100' },
  { description: 'full number with a digit directly before it', text: '95555560100' },
  { description: 'full number with a digit directly after it', text: '55555601009' },
  { description: 'four separators between every group', text: '555....556....0100' },
  { description: 'full number after a country code with a digit before it', text: '915555560100' },
  { description: 'full number after a country code written twice', text: '115555560100' },
  { description: 'area code and exchange after a country code with a digit before it', text: '91555556' },
]

/**
 * One matcher per form of a ten-digit North American number, split 3, 3, 4 into area code,
 * exchange and line number. A match allows zero to three separators between groups and rejects
 * a digit directly before or after it, so longer digit runs such as hashes do not match. The two
 * forms that start at the area code also accept a country code in front.
 */
export function buildMatchers(referenceDigits) {
  const areaCode = referenceDigits.slice(0, 3)
  const exchange = referenceDigits.slice(3, 6)
  const lineNumber = referenceDigits.slice(6)
  return [
    { formName: FULL_NUMBER, pattern: digitGroupsPattern(COUNTRY_CODE, [areaCode, exchange, lineNumber]) },
    { formName: LAST_SEVEN_DIGITS, pattern: digitGroupsPattern('', [exchange, lineNumber]) },
    { formName: AREA_CODE_AND_EXCHANGE, pattern: digitGroupsPattern(COUNTRY_CODE, [areaCode, exchange]) },
  ]
}

export function formNamesFoundIn(line, matchers) {
  return matchers.filter(({ pattern }) => pattern.test(line)).map(({ formName }) => formName)
}

/**
 * Classifies one file from its path and bytes. Returns { kind: 'binary' } for a listed binary
 * extension, { kind: 'text', text } when the bytes decode as UTF-8 or UTF-16, and
 * { kind: 'undecodable' } otherwise.
 */
export function decodeFile(filePath, bytes) {
  if (hasBinaryExtension(filePath)) return { kind: 'binary' }
  const text = decodeText(bytes)
  return text === null ? { kind: 'undecodable' } : { kind: 'text', text }
}

/**
 * Scans each file and returns { exitCode, reportLines } without printing. There is one report line
 * per hit and one per undecodable file, then a summary. No line holds matched text, file content
 * or a digit of the reference.
 */
export function scanFiles(absolutePaths, matchers) {
  const counts = { scanned: 0, binary: 0, missing: 0, undecodable: 0, hits: 0 }
  const reportLines = []

  for (const absolutePath of absolutePaths) {
    const file = readFileForScan(absolutePath)
    if (file.kind === 'binary') {
      counts.binary += 1
    } else if (file.kind === 'missing') {
      counts.missing += 1
    } else if (file.kind === 'undecodable') {
      counts.undecodable += 1
      reportLines.push(`${displayPath(absolutePath)}: could not be decoded as UTF-8 or UTF-16, not scanned`)
    } else {
      counts.scanned += 1
      const hitLines = hitLinesIn(file.text, displayPath(absolutePath), matchers)
      counts.hits += hitLines.length
      reportLines.push(...hitLines)
    }
  }

  reportLines.push(
    `Scanned ${counts.scanned} files (${counts.binary} skipped as binary, ${counts.missing} missing ` +
      `from disk, ${counts.undecodable} undecodable), ${counts.hits} hits.`,
  )
  return { exitCode: scanExitCode(counts), reportLines }
}

/** Runs the check from CLI-style arguments and returns an exit code, printing the report as it goes. */
export function main(args) {
  try {
    const { exitCode, reportLines } = args.includes('--self-test')
      ? runSelfTest(args.filter((arg) => arg !== '--self-test'))
      : runScan(args)
    for (const line of reportLines) console.log(line)
    return exitCode
  } catch (error) {
    console.error(`check-phone-redaction could not run: ${error.message}`)
    return EXIT_CANNOT_RUN
  }
}

/**
 * Passes 0, 1 and 2 through unchanged. Anything else means `main` fell through without returning a
 * recognised exit code, which would otherwise exit the process at 0: a silent false green (R10).
 */
export function exitCodeOrCannotRun(exitCode) {
  if (exitCode === EXIT_CLEAN || exitCode === EXIT_HIT || exitCode === EXIT_CANNOT_RUN) return exitCode
  console.error('check-phone-redaction could not run: the scan returned no exit code')
  return EXIT_CANNOT_RUN
}

function runScan(directoryArguments) {
  const matchers = buildMatchers(readReferenceNumber())
  const absolutePaths = new Set([
    ...listTrackedPaths().map((trackedPath) => path.join(REPOSITORY_ROOT, trackedPath)),
    ...directoryArguments.flatMap(listFilesUnder),
  ])
  return scanFiles([...absolutePaths], matchers)
}

/**
 * With no directory argument, behaves as the classic self-test: proves the matchers against the
 * synthetic reference and reports missed forms or false hits. With directory arguments, also scans
 * every file under them for the synthetic reference, through the same scan a real run uses, and
 * combines the two verdicts: a hit in either outranks an incomplete scan in either (R7).
 */
function runSelfTest(directoryArguments) {
  const matchers = buildMatchers(SELF_TEST_REFERENCE)
  const isFoundIn = (text, formName) =>
    formNamesFoundIn(`Call ${text} today.`, matchers).includes(formName)
  const isAnyFormFoundIn = (text) => formNamesFoundIn(`Call ${text} today.`, matchers).length > 0

  const missedForms = SELF_TEST_FORMS.filter(({ formName, text }) => !isFoundIn(text, formName))
  const matchedNearMisses = SELF_TEST_NEAR_MISSES.filter(({ text }) => isAnyFormFoundIn(text))

  const formCheckLines = [
    ...missedForms.map(({ formName, rendering }) => `MISSED ${formName}, ${rendering}`),
    ...matchedNearMisses.map(({ description }) => `FALSE HIT ${description}`),
    `Self-test: ${SELF_TEST_FORMS.length - missedForms.length} of ${SELF_TEST_FORMS.length} form ` +
      `renderings hit, ${matchedNearMisses.length} of ${SELF_TEST_NEAR_MISSES.length} near-misses hit.`,
  ]
  const formCheckExitCode = missedForms.length === 0 && matchedNearMisses.length === 0 ? EXIT_CLEAN : EXIT_HIT

  if (directoryArguments.length === 0) return { exitCode: formCheckExitCode, reportLines: formCheckLines }

  const directoryScan = scanFiles(directoryArguments.flatMap(listFilesUnder), matchers)
  const reportLines = [
    `Self-test scan of ${directoryArguments.length} directories against the synthetic reference; ` +
      `this is not the redaction scan.`,
    ...formCheckLines,
    ...directoryScan.reportLines,
  ]
  return { exitCode: worseExitCode(formCheckExitCode, directoryScan.exitCode), reportLines }
}

/** EXIT_HIT outranks EXIT_CANNOT_RUN outranks EXIT_CLEAN, the same precedence scanExitCode applies. */
function worseExitCode(a, b) {
  if (a === EXIT_HIT || b === EXIT_HIT) return EXIT_HIT
  if (a === EXIT_CANNOT_RUN || b === EXIT_CANNOT_RUN) return EXIT_CANNOT_RUN
  return EXIT_CLEAN
}

function digitGroupsPattern(prefix, groups) {
  return new RegExp(`(?<!\\d)${prefix}${groups.join(SEPARATORS)}(?!\\d)`)
}

function hitLinesIn(text, displayedPath, matchers) {
  return text
    .split('\n')
    .flatMap((line, index) =>
      formNamesFoundIn(line, matchers).map((formName) => `${displayedPath}:${index + 1}: ${formName}`),
    )
}

function scanExitCode({ scanned, undecodable, hits }) {
  if (hits > 0) return EXIT_HIT
  return undecodable > 0 || scanned === 0 ? EXIT_CANNOT_RUN : EXIT_CLEAN
}

/** Skips a listed binary extension without reading it, and reports a tracked path deleted from disk. */
function readFileForScan(absolutePath) {
  if (hasBinaryExtension(absolutePath)) return { kind: 'binary' }
  let bytes
  try {
    bytes = fs.readFileSync(absolutePath)
  } catch (error) {
    if (error.code === 'ENOENT') return { kind: 'missing' }
    throw error
  }
  return decodeFile(absolutePath, bytes)
}

function hasBinaryExtension(filePath) {
  return BINARY_EXTENSIONS.includes(path.extname(filePath).toLowerCase())
}

/**
 * Returns the text, or null when the bytes are undecodable. The first rule that applies decides:
 * a UTF-16LE byte-order mark, a UTF-16BE byte-order mark, no zero byte (UTF-8), then BOM-less
 * UTF-16LE.
 */
function decodeText(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return decodeUtf16LittleEndian(bytes.subarray(2))
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return decodeUtf16BigEndian(bytes.subarray(2))
  if (!bytes.includes(0)) return bytes.toString('utf8')
  if (looksLikeUtf16LittleEndian(bytes)) return decodeUtf16LittleEndian(bytes)
  return null
}

function decodeUtf16BigEndian(bytes) {
  if (bytes.length % 2 !== 0) return null
  const swappedCopy = Buffer.from(bytes).swap16()
  return decodeUtf16LittleEndian(swappedCopy)
}

function decodeUtf16LittleEndian(bytes) {
  if (bytes.length % 2 !== 0) return null
  const text = bytes.toString('utf16le')
  return text.includes(' ') ? null : text
}

/**
 * Mostly-Latin UTF-16LE has a zero byte at every odd offset and at no even one. A UTF-8 file with
 * one stray zero byte fails the half-of-the-odd-offsets test, so it is reported, never skipped.
 */
function looksLikeUtf16LittleEndian(bytes) {
  if (bytes.length % 2 !== 0) return false
  let zerosAtOddOffsets = 0
  for (let offset = 0; offset < bytes.length; offset += 1) {
    if (bytes[offset] !== 0) continue
    if (offset % 2 === 0) return false
    zerosAtOddOffsets += 1
  }
  const oddOffsetCount = bytes.length / 2
  return zerosAtOddOffsets * 2 >= oddOffsetCount
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
  return fs
    .readdirSync(absolutePath, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
}

function displayPath(absolutePath) {
  return path.relative(REPOSITORY_ROOT, absolutePath).split(path.sep).join('/')
}

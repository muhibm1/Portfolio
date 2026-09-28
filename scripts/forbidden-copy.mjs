/**
 * The forbidden-copy scan (R129, ADR 0004): finds any of plan section 1's removed claims and
 * invented names in tracked copy, or a directory argument added on top. A hit anywhere outranks
 * an incomplete scan: exit 1 if any hit, else exit 2 if nothing was scanned, else exit 0. The
 * repository already has a scanner of this shape for the phone number,
 * scripts/check-phone-redaction.mjs over scripts/phone-redaction-scan.mjs; this scanner follows
 * the same split, exit codes and reasoning.
 *
 * Importing this module runs nothing: `main` is called only by the entry,
 * scripts/check-forbidden-copy.mjs.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const EXIT_CLEAN = 0
export const EXIT_HIT = 1
export const EXIT_CANNOT_RUN = 2

const REPOSITORY_ROOT = fs.realpathSync.native(
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
)

const EM_DASH = '—'
const EN_DASH = '–'
const MULTIPLICATION_SIGN = '×'

// The entity spellings ADR 0004 says count as a hit on the matching dash character.
const DASH_ENTITIES = {
  [EM_DASH]: ['&mdash;', '&#8212;'],
  [EN_DASH]: ['&ndash;', '&#8211;'],
}

// The only string term matched on word boundaries although it is not letters-only (interface (h),
// A3): without this, "text-2xl" and "2x2" would be false hits.
const WORD_BOUNDARY_STRING_TERMS = ['2x']

const RETIREMENT_WORDS = [
  'retired',
  'retire',
  'retirement',
  'deprecated',
  'dropped',
  'dropping',
  'discontinued',
  'abandoned',
]

// R156: a number with an optional decimal part, an optional space, then ms/millisecond(s) or
// second(s), or a decimal number then a bare "s", all on word boundaries, case-insensitive. Skips
// .css and .svg (src/index.css carries 0.01ms in its reduced-motion rule, src/assets/react.svg an
// animation duration). The absolute figures D26 withholds are written nowhere in the repository;
// this pattern catches them and any successor (D36).
export const TIMING_FIGURE_TERM = {
  label: 'timing figure',
  pattern: /\b\d+(?:\.\d+)? ?(?:ms|milliseconds?|seconds?)\b|\b\d+\.\d+s\b/i,
  skipExtensions: ['.css', '.svg'],
}

// R156, D44: "paddock" and a retirement word in the same sentence (no ".", "!" or "?" between
// them), in either order, case-insensitive, no skipped extensions. Owner rule: Paddock is current.
export const PADDOCK_RETIREMENT_TERM = {
  label: 'Paddock retirement wording',
  pattern: new RegExp(
    `\\bpaddock\\b(?:(?!\\.|!|\\?).)*?\\b(?:${RETIREMENT_WORDS.join('|')})\\b|` +
      `\\b(?:${RETIREMENT_WORDS.join('|')})\\b(?:(?!\\.|!|\\?).)*?\\bpaddock\\b`,
    'i',
  ),
  skipExtensions: [],
}

/**
 * Plan section 1's seventeen removed strings, deduplicated to their unique case-insensitive form
 * (matching is already case-insensitive, so "simulator"/"Simulator" and "Wasl"/"wasl" would
 * otherwise double-count a single hit): `99.9`, `unauthorized`, `95%`, `Enterprise Compliant`,
 * `Zero Data Corruption`, `schema drift`, `simulator`, `thinking-orbs`, `Shu`, `Wasl`,
 * `Apple Geo Ingest`, `dataops-service`, `GEO-92841`, and the em and en dash characters. The
 * invented names `Apple Geo Ingest`, `dataops-service` and `GEO-92841` are already present in
 * the tree today (constraints "Business constraints" 2); listing them here is not new exposure.
 *
 * R156 adds 14 more strings and two pattern terms, against the stale run count, unproven timing
 * and speed claims, the withdrawn resume, and the false "0 rejected ship documents" and Paddock
 * retirement wording (D24, D26, D36, D41, D42, D44): `100% Automated`, `11x`, `sub-10ms`,
 * `Release Continuity`, `Production Outage Drop`, `Private repository`, `resume`, `4 of 4`,
 * `four real changes`, `rejected ship`, `half the latency`, `2×`, `2x`, `+52%`, plus
 * TIMING_FIGURE_TERM and PADDOCK_RETIREMENT_TERM.
 */
export const FORBIDDEN_TERMS = [
  '99.9',
  'unauthorized',
  '95%',
  'Enterprise Compliant',
  'Zero Data Corruption',
  'schema drift',
  'simulator',
  'thinking-orbs',
  'Shu',
  'Wasl',
  'Apple Geo Ingest',
  'dataops-service',
  'GEO-92841',
  EM_DASH,
  EN_DASH,
  '100% Automated',
  '11x',
  'sub-10ms',
  'Release Continuity',
  'Production Outage Drop',
  'Private repository',
  'resume',
  '4 of 4',
  'four real changes',
  'rejected ship',
  'half the latency',
  `2${MULTIPLICATION_SIGN}`,
  '2x',
  '+52%',
  TIMING_FIGURE_TERM,
  PADDOCK_RETIREMENT_TERM,
]

const LETTERS_ONLY = /^[a-zA-Z]+$/

/** Builds one case-insensitive matcher per term: a word-boundary pattern for a letters-only term
 * or the "2x" exception (so "Shutdown" is not "Shu" and "text-2xl" is not "2x"), a substring
 * pattern for any other string, and for a dash character a pattern that also matches its HTML
 * entity spellings. A `{ label, pattern, skipExtensions }` term (interface (h)) carries its own
 * pattern and reports its label; `skipExtensions` defaults to none. */
export function buildMatchers(terms) {
  return terms.map((term) =>
    typeof term === 'string'
      ? { term: termLabel(term), pattern: buildPattern(term), skipExtensions: [] }
      : { term: term.label, pattern: term.pattern, skipExtensions: term.skipExtensions ?? [] },
  )
}

/** Returns every term whose pattern matches the line, in matcher order. */
export function termsFoundIn(line, matchers) {
  return matchers.filter(({ pattern }) => pattern.test(line)).map(({ term }) => term)
}

/**
 * Scans each file and returns { exitCode, hitLines, counts }. `hitLines` holds one
 * `::error::<path>:<line>: <term>` line per hit (R129). A path matching a test-file glob
 * (`*.test.*`) is skipped and counted, never scanned. Exit 1 if any hit, else exit 2 if nothing
 * was scanned (every path skipped, missing, or the list was empty), else exit 0.
 */
export function scanFiles(absolutePaths, matchers) {
  const counts = { scanned: 0, skippedAsTest: 0, missing: 0, hits: 0 }
  const hitLines = []

  for (const absolutePath of absolutePaths) {
    if (isTestFile(absolutePath)) {
      counts.skippedAsTest += 1
      continue
    }
    const text = readFileIfPresent(absolutePath)
    if (text === null) {
      counts.missing += 1
      continue
    }
    hitLines.push(...hitLinesIn(text, displayPath(absolutePath), matchers))
    counts.scanned += 1
  }

  counts.hits = hitLines.length
  return { exitCode: scanExitCode(counts), hitLines, counts }
}

/** Runs the check from CLI-style arguments and returns an exit code, printing the report as it goes. */
export function main(args) {
  try {
    const absolutePaths = resolveScope(args)
    const matchers = buildMatchers(FORBIDDEN_TERMS)
    const { exitCode, hitLines, counts } = scanFiles(absolutePaths, matchers)

    if (exitCode === EXIT_HIT) {
      for (const line of hitLines) console.log(line)
      return EXIT_HIT
    }
    if (exitCode === EXIT_CANNOT_RUN) {
      console.log('::error::no file scanned')
      return EXIT_CANNOT_RUN
    }
    console.log(`Forbidden copy check passed (R129): ${counts.scanned} files scanned.`)
    return EXIT_CLEAN
  } catch (error) {
    console.log(`::error::${error instanceof Error ? error.message : String(error)}`)
    console.error(error instanceof Error ? error.stack : error)
    return EXIT_CANNOT_RUN
  }
}

function termLabel(term) {
  if (term === EM_DASH) return 'em dash (U+2014)'
  if (term === EN_DASH) return 'en dash (U+2013)'
  return term
}

function buildPattern(term) {
  if (term === EM_DASH || term === EN_DASH) {
    const entityAlternatives = DASH_ENTITIES[term].map(escapeRegExp).join('|')
    return new RegExp(`${escapeRegExp(term)}|${entityAlternatives}`, 'i')
  }
  if (LETTERS_ONLY.test(term) || WORD_BOUNDARY_STRING_TERMS.includes(term)) {
    return new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i')
  }
  return new RegExp(escapeRegExp(term), 'i')
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * With no argument, the default scope: every file under src/ except *.test.* files, plus
 * index.html and docs/design/og.svg (ADR 0004). A missing optional path in the default scope
 * (today, docs/design/og.svg, which T4 has not yet written on this branch) is not fatal by
 * itself; it is simply not scanned, the same as a tracked path the phone scanner finds deleted
 * from disk. With one argument, every `**\/*.html` file under that directory is added on top
 * (`dist`, once the build has run); the directory itself must exist, or the check cannot run.
 */
function resolveScope(args) {
  const defaultScope = [
    ...listFilesRecursive(path.join(REPOSITORY_ROOT, 'src')),
    path.join(REPOSITORY_ROOT, 'index.html'),
    path.join(REPOSITORY_ROOT, 'docs', 'design', 'og.svg'),
  ]
  if (args.length === 0) return defaultScope

  const directoryArgument = args[0]
  const absoluteDirectory = path.resolve(directoryArgument)
  if (!fs.existsSync(absoluteDirectory)) {
    throw new Error(`${directoryArgument} does not exist; run the build first or drop the argument`)
  }
  const htmlFiles = listFilesRecursive(absoluteDirectory).filter(
    (filePath) => path.extname(filePath).toLowerCase() === '.html',
  )
  return [...defaultScope, ...htmlFiles]
}

function isTestFile(filePath) {
  const fileName = path.basename(filePath)
  return fileName.split('.').includes('test')
}

function readFileIfPresent(absolutePath) {
  try {
    return fs.readFileSync(absolutePath, 'utf8')
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

function hitLinesIn(text, displayedPath, matchers) {
  const extension = path.extname(displayedPath).toLowerCase()
  const applicableMatchers = matchers.filter((matcher) => !matcher.skipExtensions.includes(extension))
  return text
    .split('\n')
    .flatMap((line, index) =>
      termsFoundIn(line, applicableMatchers).map(
        (term) => `::error::${displayedPath}:${index + 1}: ${term}`,
      ),
    )
}

function scanExitCode({ scanned, hits }) {
  if (hits > 0) return EXIT_HIT
  return scanned === 0 ? EXIT_CANNOT_RUN : EXIT_CLEAN
}

function listFilesRecursive(directoryPath) {
  if (!fs.existsSync(directoryPath)) return []
  return fs
    .readdirSync(directoryPath, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
}

function displayPath(absolutePath) {
  return path.relative(REPOSITORY_ROOT, absolutePath).split(path.sep).join('/')
}

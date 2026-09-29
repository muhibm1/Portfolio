/**
 * The forbidden-copy scan (R129, ADR 0004): finds any of plan section 1's removed claims and
 * invented names in tracked copy, or a directory argument added on top. A hit anywhere outranks
 * an incomplete scan: exit 1 if any hit, else exit 2 if nothing was scanned, else exit 0. The
 * repository already has a scanner of this shape for the phone number,
 * scripts/check-phone-redaction.mjs over scripts/phone-redaction-scan.mjs; this scanner follows
 * the same split, exit codes and reasoning.
 *
 * FORBIDDEN_TERMS apply to every scanned file; PAGE_SCOPED_TERMS apply only to paths their
 * `onlyPaths` matches (2026-09-29 change, ADR 0001).
 *
 * Importing this module runs nothing: `main` is called only by the entry,
 * scripts/check-forbidden-copy.mjs.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BINARY_EXTENSIONS } from './phone-redaction-scan.mjs'

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

// R156 review fix: a plain "2x" substring match false-hit an `@2x` asset-name suffix
// (`shot@2x.png`) and any digit run ending in "2x" or "11x" (a version string, a scaling factor,
// "S211X"). Each becomes its own boundary-aware pattern term instead of a plain string. The "2x"
// pattern excludes only the character directly in front being "@" or a word character; a `srcset`
// density descriptor such as "hero.png 2x" is preceded by a space, which this pattern cannot tell
// apart from "2x faster" without missing the banned claim, so that case is not excluded (review
// group 1b).
export const TWO_X_TERM = { label: '2x', pattern: /(?<![@\w])2x\b/i, skipExtensions: [] }
export const ELEVEN_X_TERM = { label: '11x', pattern: /(?<!\d)11x\b/i, skipExtensions: [] }

// R156 review fix: a plain "4 of 4" substring hit inside a larger count such as "24 of 45".
export const FOUR_OF_FOUR_TERM = { label: '4 of 4', pattern: /(?<!\d)4 of 4(?!\d)/i, skipExtensions: [] }

// 2026-09-29 change (ADR 0002, change request "Verification" items 1 and 2): the disclosure
// words, as word-family patterns so plurals and verb forms are caught but "outbound", the Tailwind
// `border-border` class and "Terraform" are not. No `g` or `y` flag on any pattern in this file:
// `termsFoundIn` calls `.test` repeatedly and those flags make it stateful.
export const SANDBOX_TERM = {
  label: 'sandbox',
  pattern: /\bsandbox(?:es|ed|ing)?\b/i,
  skipExtensions: [],
}
export const BOUNDARY_TERM = { label: 'boundary', pattern: /\bboundar(?:y|ies)\b/i, skipExtensions: [] }
export const TERRAIN_TERM = { label: 'terrain', pattern: /\bterrains?\b/i, skipExtensions: [] }
export const LANDMARK_TERM = { label: 'landmark', pattern: /\blandmarks?\b/i, skipExtensions: [] }

const CHANGE_VERBS = 'changed|edited|modified|updated|altered'
const CHANGE_NOUNS = 'changes?|edits?|updates?|modifications?'
export const CHANGED_INCORRECTLY_TERM = {
  label: 'changed incorrectly wording',
  pattern: new RegExp(
    `\\bincorrectly (?:${CHANGE_VERBS})\\b|\\b(?:${CHANGE_VERBS}) incorrectly\\b|` +
      `\\bincorrect (?:${CHANGE_NOUNS})\\b`,
    'i',
  ),
  skipExtensions: [],
}
export const HIGH_IMPACT_TERM = {
  label: 'high impact wording',
  pattern: /\bhigh(?:[- ]user)?[- ]impact\b/i,
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
 * R156 adds 14 more strings and five pattern terms, against the stale run count, unproven timing
 * and speed claims, the withdrawn resume, and the false "0 rejected ship documents" and Paddock
 * retirement wording (D24, D26, D36, D41, D42, D44): `100% Automated`, `sub-10ms`,
 * `Release Continuity`, `Production Outage Drop`, `Private repository`, `resume`,
 * `four real changes`, `rejected ship`, `half the latency`, `2×`, `+52%`, plus
 * TIMING_FIGURE_TERM, PADDOCK_RETIREMENT_TERM, TWO_X_TERM, ELEVEN_X_TERM and FOUR_OF_FOUR_TERM
 * (the last three were plain strings until a review fix moved them to boundary-aware patterns).
 *
 * The 2026-09-29 change adds three strings, `crossed team`, `fully manual` and `restricted
 * geospatial` (D15), and the five pattern terms above (SANDBOX_TERM to HIGH_IMPACT_TERM). It adds
 * no count term: "tens of thousands" stays legal copy (D3, D8).
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
  'sub-10ms',
  'Release Continuity',
  'Production Outage Drop',
  'Private repository',
  'resume',
  'four real changes',
  'rejected ship',
  'half the latency',
  `2${MULTIPLICATION_SIGN}`,
  '+52%',
  TIMING_FIGURE_TERM,
  PADDOCK_RETIREMENT_TERM,
  TWO_X_TERM,
  ELEVEN_X_TERM,
  FOUR_OF_FOUR_TERM,
  'crossed team',
  'fully manual',
  'restricted geospatial',
  SANDBOX_TERM,
  BOUNDARY_TERM,
  TERRAIN_TERM,
  LANDMARK_TERM,
  CHANGED_INCORRECTLY_TERM,
  HIGH_IMPACT_TERM,
]

// "cross-team" stays legal on the decision and homepage copy but not on the integration page
// (ADR 0001), so it is a separate list, applied only to paths under work/apple-integration/. The
// leading \b keeps "across teams" from matching. Built pages are the only place this can fire.
export const PAGE_SCOPED_TERMS = [
  {
    label: 'integration page cross-team wording',
    pattern: /\bcross[- ]teams?\b/i,
    skipExtensions: [],
    onlyPaths: /(?:^|\/)work\/apple-integration\//,
  },
]

const LETTERS_ONLY = /^[a-zA-Z]+$/

/** Builds one case-insensitive matcher per term: a word-boundary pattern for a letters-only term,
 * a substring pattern for any other string, and for a dash character a pattern that also matches
 * its HTML entity spellings. A `{ label, pattern, skipExtensions }` term (interface (h)) carries
 * its own pattern and reports its label; `skipExtensions` defaults to none, and `onlyPaths` (a
 * RegExp tested against the forward-slash repo-relative path) defaults to null, meaning every file. */
export function buildMatchers(terms) {
  return terms.map((term) =>
    typeof term === 'string'
      ? { term: termLabel(term), pattern: buildPattern(term), skipExtensions: [], onlyPaths: null }
      : {
          term: term.label,
          pattern: term.pattern,
          skipExtensions: term.skipExtensions ?? [],
          onlyPaths: term.onlyPaths ?? null,
        },
  )
}

/** Returns every term whose pattern matches the line, in matcher order. */
export function termsFoundIn(line, matchers) {
  return matchers.filter(({ pattern }) => pattern.test(line)).map(({ term }) => term)
}

/**
 * Scans each file and returns { exitCode, hitLines, counts }. `hitLines` holds one
 * `::error::<path>:<line>: <term>` line per hit (R129). A path matching a test-file glob
 * (`*.test.*`) is skipped and counted, never scanned. A path with a listed binary extension
 * (BINARY_EXTENSIONS, shared with scripts/phone-redaction-scan.mjs) is skipped and counted the
 * same way, never read as text, so an image cannot false-hit a term match on its raw bytes
 * (review group 1a); it is not counted as scanned, so a scope of only binaries still fails closed
 * onto EXIT_CANNOT_RUN rather than reading as a clean run over nothing. Exit 1 if any hit, else
 * exit 2 if nothing was scanned (every path skipped, missing, or the list was empty), else exit 0.
 */
export function scanFiles(absolutePaths, matchers) {
  const counts = { scanned: 0, skippedAsTest: 0, skippedAsBinary: 0, missing: 0, hits: 0 }
  const hitLines = []

  for (const absolutePath of absolutePaths) {
    if (isTestFile(absolutePath)) {
      counts.skippedAsTest += 1
      continue
    }
    if (isBinaryFile(absolutePath)) {
      counts.skippedAsBinary += 1
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
    const matchers = buildMatchers([...FORBIDDEN_TERMS, ...PAGE_SCOPED_TERMS])
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
  if (LETTERS_ONLY.test(term)) {
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

function isBinaryFile(filePath) {
  return BINARY_EXTENSIONS.includes(path.extname(filePath).toLowerCase())
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
  const slashPath = displayedPath.replaceAll('\\', '/')
  const applicableMatchers = matchers.filter(
    (matcher) =>
      !matcher.skipExtensions.includes(extension) &&
      (matcher.onlyPaths === null || matcher.onlyPaths.test(slashPath)),
  )
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

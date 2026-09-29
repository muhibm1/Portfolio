// Tests the R129 forbidden-copy check (ADR 0004): scripts/forbidden-copy.mjs in process, and the
// entry scripts/check-forbidden-copy.mjs by spawning it, so both the library the tests exercise
// directly and the always-runs entry are proven. Fixture files stand in for the tree so these
// tests never depend on the real src/ carrying (or not carrying) any banned term; on this branch
// the old src/ still does, and that is not this test's target. This file lives under src/ only
// because Vitest discovers tests there.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  EXIT_CANNOT_RUN,
  EXIT_CLEAN,
  EXIT_HIT,
  FORBIDDEN_TERMS,
  PAGE_SCOPED_TERMS,
  buildMatchers,
  scanFiles,
} from '../scripts/forbidden-copy.mjs';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS_DIRECTORY = path.join(REPOSITORY_ROOT, 'scripts');
const ENTRY_PATH = path.join(SCRIPTS_DIRECTORY, 'check-forbidden-copy.mjs');

const matchers = buildMatchers(FORBIDDEN_TERMS);
const matchersWithPageScope = buildMatchers([...FORBIDDEN_TERMS, ...PAGE_SCOPED_TERMS]);

// One rendering per forbidden term (ADR 0004, R156): the paired-case entries
// ("simulator"/"Simulator", "Wasl"/"wasl"), the two dash characters, 13 of the 14 R156 strings
// and its two pattern terms (G3, revised: 31 unique terms), so each fixture file still produces
// exactly one hit even though the matcher list itself is case-insensitive and does not carry
// duplicate entries. "sub-10ms" is tested on its own below, because it also fits the timing
// pattern and so does not produce exactly one hit.
const ONE_FILE_PER_TERM_RENDERING = [
  { fileName: 'full-number.txt', text: '99.9 uptime' },
  { fileName: 'unauthorized-lower.txt', text: 'an unauthorized request' },
  { fileName: 'ninety-five-percent.txt', text: '95% accurate' },
  { fileName: 'enterprise-compliant.txt', text: 'Enterprise Compliant' },
  { fileName: 'zero-data-corruption.txt', text: 'Zero Data Corruption' },
  { fileName: 'schema-drift.txt', text: 'schema drift' },
  { fileName: 'simulator-lower.txt', text: 'the simulator' },
  { fileName: 'simulator-upper.txt', text: 'the Simulator' },
  { fileName: 'thinking-orbs.txt', text: 'thinking-orbs' },
  { fileName: 'shu.txt', text: 'Shu' },
  { fileName: 'wasl-upper.txt', text: 'Wasl' },
  { fileName: 'wasl-lower.txt', text: 'wasl' },
  { fileName: 'apple-geo-ingest.txt', text: 'Apple Geo Ingest' },
  { fileName: 'dataops-service.txt', text: 'dataops-service' },
  { fileName: 'geo-92841.txt', text: 'GEO-92841' },
  { fileName: 'em-dash.txt', text: 'built — shipped' },
  { fileName: 'en-dash.txt', text: 'pages 1–10' },
  { fileName: 'hundred-percent-automated.txt', text: '100% Automated' },
  { fileName: 'eleven-x.txt', text: '11x faster' },
  { fileName: 'release-continuity.txt', text: 'Release Continuity' },
  { fileName: 'production-outage-drop.txt', text: 'Production Outage Drop' },
  { fileName: 'private-repository.txt', text: 'Private repository' },
  { fileName: 'resume.txt', text: 'Resume attached below' },
  { fileName: 'four-of-four.txt', text: '4 of 4 runs succeeded' },
  { fileName: 'four-real-changes.txt', text: 'four real changes shipped' },
  { fileName: 'rejected-ship.txt', text: '0 rejected ship documents' },
  { fileName: 'half-the-latency.txt', text: 'half the latency of before' },
  { fileName: 'times-sign.txt', text: '2× faster' },
  { fileName: 'ascii-2x.txt', text: '2x faster' },
  { fileName: 'plus-fifty-two-percent.txt', text: 'saw a +52% jump' },
  { fileName: 'timing-figure.txt', text: 'the query took 1.5s' },
  { fileName: 'paddock-retirement.txt', text: 'Paddock was retired last quarter.' },
  // 2026-09-29 integration and decision case studies (G8, R163): one rendering per new global term.
  { fileName: 'crossed-team.txt', text: 'crossed team lines' },
  { fileName: 'fully-manual.txt', text: 'a fully manual process' },
  { fileName: 'restricted-geospatial.txt', text: 'restricted geospatial' },
  { fileName: 'sandbox.txt', text: 'a sandbox' },
  { fileName: 'boundary.txt', text: 'the boundary' },
  { fileName: 'terrain.txt', text: 'terrain' },
  { fileName: 'landmark.txt', text: 'a landmark' },
  { fileName: 'changed-incorrectly.txt', text: 'was changed incorrectly' },
  { fileName: 'high-user-impact.txt', text: 'high user impact' },
];

describe('forbidden-copy matchers', () => {
  it('has one matcher for every unique forbidden term', () => {
    expect(matchers.length).toBe(FORBIDDEN_TERMS.length);
  });

  it('exits 2 with zero files scanned when given zero paths', () => {
    expect(scanFiles([], matchers).exitCode).toBe(EXIT_CANNOT_RUN);
  });
});

describe('forbidden-copy file scan', () => {
  let fixtureDirectory;

  beforeEach(() => {
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'check-forbidden-copy-'));
  });

  afterEach(() => {
    fs.rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  function writeFixture(fileName, text) {
    const fixturePath = path.join(fixtureDirectory, fileName);
    fs.writeFileSync(fixturePath, text, 'utf8');
    return fixturePath;
  }

  // Writes under nested directories, as the built site does (work/apple-integration/index.html).
  function writeNestedFixture(relativePath, text) {
    const fixturePath = path.join(fixtureDirectory, ...relativePath.split('/'));
    fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
    fs.writeFileSync(fixturePath, text, 'utf8');
    return fixturePath;
  }

  function hitsFor(fixturePath, scanMatchers) {
    return scanFiles([fixturePath], scanMatchers).hitLines;
  }

  // G3: a fixture directory with one file per forbidden term, and a clean file.
  it('reports exactly one hit per term-fixture file and exits 1', () => {
    const termFixturePaths = ONE_FILE_PER_TERM_RENDERING.map(({ fileName, text }) =>
      writeFixture(fileName, `${text}\n`),
    );

    const { exitCode, hitLines } = scanFiles(termFixturePaths, matchers);

    expect(exitCode).toBe(EXIT_HIT);
    expect(hitLines).toHaveLength(ONE_FILE_PER_TERM_RENDERING.length);
    for (const { fileName } of ONE_FILE_PER_TERM_RENDERING) {
      expect(hitLines.filter((line) => line.includes(fileName) && line.includes(':1:'))).toHaveLength(1);
    }
  });

  it('exits 0 on a fixture directory holding only a clean file', () => {
    const cleanPath = writeFixture('clean.txt', 'Nothing forbidden here.\n');

    const { exitCode, hitLines } = scanFiles([cleanPath], matchers);

    expect(exitCode).toBe(EXIT_CLEAN);
    expect(hitLines).toEqual([]);
  });

  // E4: word boundaries, case-insensitive "Unauthorized", the U+2013 and &mdash; forms, a
  // skipped .test.jsx file.
  it('does not match "Shutdown" or "shuffle", but matches "Shu" as a whole word', () => {
    const shutdownPath = writeFixture('shutdown.txt', 'A graceful Shutdown.\n');
    const shufflePath = writeFixture('shuffle.txt', 'shuffle the deck.\n');
    const shuPath = writeFixture('shu.txt', 'Ask for Shu directly.\n');

    const { hitLines } = scanFiles([shutdownPath, shufflePath, shuPath], matchers);

    expect(hitLines.some((line) => line.includes('shutdown.txt'))).toBe(false);
    expect(hitLines.some((line) => line.includes('shuffle.txt'))).toBe(false);
    expect(hitLines.filter((line) => line.includes('shu.txt'))).toHaveLength(1);
  });

  it('catches "Unauthorized" case-insensitively at a sentence start', () => {
    const fixturePath = writeFixture('sentence-start.txt', 'Unauthorized access is denied.\n');

    const { exitCode, hitLines } = scanFiles([fixturePath], matchers);

    expect(exitCode).toBe(EXIT_HIT);
    expect(hitLines.filter((line) => line.includes('sentence-start.txt'))).toHaveLength(1);
  });

  it('catches a dash joined by the literal U+2013 character', () => {
    const fixturePath = writeFixture('literal-en-dash.txt', 'pages 1–10\n');

    const { exitCode, hitLines } = scanFiles([fixturePath], matchers);

    expect(exitCode).toBe(EXIT_HIT);
    expect(hitLines.filter((line) => line.includes('literal-en-dash.txt'))).toHaveLength(1);
  });

  it('catches the &mdash; HTML entity as the em dash term', () => {
    const fixturePath = writeFixture('entity-em-dash.txt', 'built &mdash; shipped\n');

    const { exitCode, hitLines } = scanFiles([fixturePath], matchers);

    expect(exitCode).toBe(EXIT_HIT);
    expect(hitLines.filter((line) => line.includes('entity-em-dash.txt'))).toHaveLength(1);
  });

  it('catches the &ndash;, &#8212; and &#8211; entities as the two dash terms', () => {
    const ndashPath = writeFixture('entity-ndash.txt', 'pages 1&ndash;10\n');
    const numericEmDashPath = writeFixture('entity-numeric-em.txt', 'built &#8212; shipped\n');
    const numericEnDashPath = writeFixture('entity-numeric-en.txt', 'pages 1&#8211;10\n');

    const { exitCode, hitLines } = scanFiles(
      [ndashPath, numericEmDashPath, numericEnDashPath],
      matchers,
    );

    expect(exitCode).toBe(EXIT_HIT);
    expect(hitLines.filter((line) => line.includes('entity-ndash.txt'))).toHaveLength(1);
    expect(hitLines.filter((line) => line.includes('entity-numeric-em.txt'))).toHaveLength(1);
    expect(hitLines.filter((line) => line.includes('entity-numeric-en.txt'))).toHaveLength(1);
  });

  it('skips a .test.jsx file and counts it in the summary instead of scanning it', () => {
    const cleanPath = writeFixture('clean.txt', 'Nothing forbidden here.\n');
    const testFilePath = writeFixture('Widget.test.jsx', 'renders the simulator fine\n');

    const { exitCode, hitLines, counts } = scanFiles([cleanPath, testFilePath], matchers);

    expect(exitCode).toBe(EXIT_CLEAN);
    expect(hitLines).toEqual([]);
    expect(counts.skippedAsTest).toBe(1);
    expect(counts.scanned).toBe(1);
  });

  // F2: zero eligible files after filtering.
  it('exits 2 when every path is a skipped test file, so nothing is scanned', () => {
    const testFilePath = writeFixture('Widget.test.jsx', 'renders the simulator fine\n');

    const { exitCode, counts } = scanFiles([testFilePath], matchers);

    expect(exitCode).toBe(EXIT_CANNOT_RUN);
    expect(counts.scanned).toBe(0);
  });

  it('exits 2 when given zero paths', () => {
    const { exitCode, counts } = scanFiles([], matchers);

    expect(exitCode).toBe(EXIT_CANNOT_RUN);
    expect(counts.scanned).toBe(0);
  });

  // E4: "resume" is letters-only, so it is matched on word boundaries like the built terms.
  it('does not match "resumed the deploy" but matches "Resume" alone', () => {
    const missedPath = writeFixture('resumed-the-deploy.txt', 'It resumed the deploy.\n');
    const hitPath = writeFixture('resume-alone.txt', 'Resume\n');

    const { hitLines } = scanFiles([missedPath, hitPath], matchers);

    expect(hitLines.some((line) => line.includes('resumed-the-deploy.txt'))).toBe(false);
    expect(hitLines.filter((line) => line.includes('resume-alone.txt'))).toHaveLength(1);
  });

  // E4: the "2×" term is a literal substring; "×4" with no leading "2" is not a hit.
  it('does not match "×4" without a leading 2, but matches "2× faster"', () => {
    const missedPath = writeFixture('review-times-four.txt', 'Review ×4 in the retro.\n');
    const hitPath = writeFixture('times-faster.txt', '2× faster than before.\n');

    const { hitLines } = scanFiles([missedPath, hitPath], matchers);

    expect(hitLines.some((line) => line.includes('review-times-four.txt'))).toBe(false);
    expect(hitLines.filter((line) => line.includes('times-faster.txt'))).toHaveLength(1);
  });

  // E4, A3: "2x" is matched on word boundaries, so "text-2xl" and "2x2" are not hits.
  it('does not match "text-2xl" or "a 2x2 grid", but matches "2x faster"', () => {
    const cssClassPath = writeFixture('css-class.txt', 'className="text-2xl"\n');
    const gridPath = writeFixture('grid.txt', 'a 2x2 grid\n');
    const hitPath = writeFixture('ascii-2x-faster.txt', '2x faster than before.\n');

    const { hitLines } = scanFiles([cssClassPath, gridPath, hitPath], matchers);

    expect(hitLines.some((line) => line.includes('css-class.txt'))).toBe(false);
    expect(hitLines.some((line) => line.includes('grid.txt'))).toBe(false);
    expect(hitLines.filter((line) => line.includes('ascii-2x-faster.txt') && line.includes('2x'))).toHaveLength(1);
  });

  // Review group 1: a binary-extension file is skipped without being read as text, even when its
  // bytes happen to spell a forbidden term, and is counted as skipped rather than scanned.
  it('skips a binary-extension file holding the bytes "2x faster" and counts it, not scans it', () => {
    const binaryPath = writeFixture('shot.png', '2x faster');

    const { exitCode, hitLines, counts } = scanFiles([binaryPath], matchers);

    expect(exitCode).toBe(EXIT_CANNOT_RUN);
    expect(hitLines).toEqual([]);
    expect(counts.skippedAsBinary).toBe(1);
    expect(counts.scanned).toBe(0);
  });

  // Review group 1: an "@2x" asset-name suffix is not the banned "2x" relative-speed claim.
  it('does not match "shot@2x.png" in an import line, but still matches "2x faster"', () => {
    const assetNamePath = writeFixture('asset-name.txt', 'import hero from "./assets/shot@2x.png"\n');
    const hitPath = writeFixture('two-x-review.txt', '2x faster than before.\n');

    const { hitLines } = scanFiles([assetNamePath, hitPath], matchers);

    expect(hitLines.some((line) => line.includes('asset-name.txt'))).toBe(false);
    expect(hitLines.filter((line) => line.includes('two-x-review.txt') && line.includes('2x'))).toHaveLength(1);
  });

  // Review group 1: "11x" and "4 of 4" anchored against adjacent digits, so a larger number that
  // merely contains the digits is not a hit, while the bare term still is.
  it('does not match "24 of 40 questions" or "S211X model", but matches "4 of 4" and "11x" alone', () => {
    const questionsPath = writeFixture('questions.txt', '24 of 40 questions answered\n');
    const modelPath = writeFixture('model.txt', 'the S211X model shipped\n');
    const fourOfFourPath = writeFixture('four-of-four-review.txt', '4 of 4 runs passed\n');
    const elevenXPath = writeFixture('eleven-x-review.txt', '11x faster in testing\n');

    const { hitLines } = scanFiles(
      [questionsPath, modelPath, fourOfFourPath, elevenXPath],
      matchers,
    );

    expect(hitLines.some((line) => line.includes('questions.txt'))).toBe(false);
    expect(hitLines.some((line) => line.includes('model.txt'))).toBe(false);
    expect(hitLines.filter((line) => line.includes('four-of-four-review.txt') && line.includes('4 of 4'))).toHaveLength(1);
    expect(hitLines.filter((line) => line.includes('eleven-x-review.txt') && line.includes('11x'))).toHaveLength(1);
  });

  // E4: the timing pattern requires a decimal number before a bare "s", or ms/second(s); a bare
  // integer before "s" is not a hit.
  it('does not match "the 1990s" or "in 30s" for the timing pattern', () => {
    const decadePath = writeFixture('decade.txt', 'Popular in the 1990s.\n');
    const secondsPath = writeFixture('bare-seconds.txt', 'Done in 30s flat.\n');

    const { hitLines } = scanFiles([decadePath, secondsPath], matchers);

    expect(hitLines.some((line) => line.includes('decade.txt'))).toBe(false);
    expect(hitLines.some((line) => line.includes('bare-seconds.txt'))).toBe(false);
  });

  it('matches "about 120 ms", "40 seconds" and "0.5s" for the timing pattern', () => {
    const msPath = writeFixture('about-120-ms.txt', 'A response in about 120 ms.\n');
    const secondsPath = writeFixture('forty-seconds.txt', 'It finished in 40 seconds.\n');
    const decimalSecondsPath = writeFixture('point-five-s.txt', 'A run of 0.5s.\n');

    const { hitLines } = scanFiles([msPath, secondsPath, decimalSecondsPath], matchers);

    expect(hitLines.filter((line) => line.includes('about-120-ms.txt') && line.includes('timing figure'))).toHaveLength(1);
    expect(hitLines.filter((line) => line.includes('forty-seconds.txt') && line.includes('timing figure'))).toHaveLength(1);
    expect(hitLines.filter((line) => line.includes('point-five-s.txt') && line.includes('timing figure'))).toHaveLength(1);
  });

  // "sub-10ms" is its own term (a literal match) and also fits the timing pattern (D36: the
  // pattern catches this figure and any successor even when the literal term also fires), so it
  // is tested on its own rather than folded into the one-hit-per-file fixture set above.
  it('matches "sub-10ms" as both its own term and the timing pattern', () => {
    const fixturePath = writeFixture('sub-10ms.txt', 'sub-10ms response times\n');

    const { exitCode, hitLines } = scanFiles([fixturePath], matchers);

    expect(exitCode).toBe(EXIT_HIT);
    expect(hitLines.filter((line) => line.includes('sub-10ms.txt'))).toHaveLength(2);
    expect(hitLines.some((line) => line.includes('sub-10ms.txt') && line.endsWith(': sub-10ms'))).toBe(true);
    expect(hitLines.some((line) => line.includes('sub-10ms.txt') && line.includes('timing figure'))).toBe(true);
  });

  // E4: the timing pattern skips .css and .svg files.
  it('skips the timing pattern in a .css file', () => {
    const cssPath = writeFixture('reduced-motion.css', '@media (prefers-reduced-motion) { transition-duration: 0.01ms; }\n');

    const { hitLines } = scanFiles([cssPath], matchers);

    expect(hitLines).toEqual([]);
  });

  it('produces no hit for the timing pattern in the real src/index.css or src/assets/react.svg', () => {
    const indexCssPath = path.join(REPOSITORY_ROOT, 'src', 'index.css');
    const reactSvgPath = path.join(REPOSITORY_ROOT, 'src', 'assets', 'react.svg');

    const { hitLines } = scanFiles([indexCssPath, reactSvgPath], matchers);

    expect(hitLines).toEqual([]);
  });

  // E4: the Paddock pattern requires both words in the same sentence, either order.
  it('does not match "dropped" and "Paddock" in different sentences', () => {
    const noPaddockPath = writeFixture('studbook-dropped.txt', 'Studbook dropped a duplicated model pass.\n');
    const differentSentencePath = writeFixture(
      'dropped-then-paddock.txt',
      'failures dropped by about 40%. Paddock runs the same path.\n',
    );

    const { hitLines } = scanFiles([noPaddockPath, differentSentencePath], matchers);

    expect(hitLines.some((line) => line.includes('studbook-dropped.txt'))).toBe(false);
    expect(hitLines.some((line) => line.includes('dropped-then-paddock.txt'))).toBe(false);
  });

  it('matches Paddock retirement wording in either order within one sentence', () => {
    const paddockFirstPath = writeFixture(
      'paddock-deprecated.txt',
      'Paddock is now deprecated in favour of the new tool.\n',
    );
    const wordFirstPath = writeFixture(
      'retirement-paddock.txt',
      'The retirement notice covers Paddock too.\n',
    );

    const { hitLines } = scanFiles([paddockFirstPath, wordFirstPath], matchers);

    expect(hitLines.filter((line) => line.includes('paddock-deprecated.txt') && line.includes('Paddock retirement wording'))).toHaveLength(1);
    expect(hitLines.filter((line) => line.includes('retirement-paddock.txt') && line.includes('Paddock retirement wording'))).toHaveLength(1);
  });

  // E4: "nine plugin releases" is site copy, not a term (D43).
  it('does not match "nine plugin releases came out of the first four runs"', () => {
    const fixturePath = writeFixture(
      'nine-plugin-releases.txt',
      'nine plugin releases came out of the first four runs\n',
    );

    const { hitLines } = scanFiles([fixturePath], matchers);

    expect(hitLines).toEqual([]);
  });

  // A3: the ASCII "2x faster" is not a silent pass for the banned "2×" relative-timing claim.
  it('catches the ASCII "2x faster" beside a clean fixture', () => {
    const cleanPath = writeFixture('clean-adversarial.txt', 'Nothing forbidden here.\n');
    const hitPath = writeFixture('ascii-2x-adversarial.txt', '2x faster\n');

    const { exitCode, hitLines } = scanFiles([cleanPath, hitPath], matchers);

    expect(exitCode).toBe(EXIT_HIT);
    expect(hitLines.filter((line) => line.includes('ascii-2x-adversarial.txt'))).toHaveLength(1);
    expect(hitLines.filter((line) => line.includes('ascii-2x-adversarial.txt'))[0]).toContain('2x');
  });

  // G9, R164: the integration term applies only under work/apple-integration/.
  it('bans cross-team only under work/apple-integration/ (R164)', () => {
    const integrationPath = writeNestedFixture('work/apple-integration/index.html', 'cross-team handoff\n');
    const triagePath = writeNestedFixture('work/apple-llm-triage/index.html', 'cross-team handoff\n');
    const rootPath = writeNestedFixture('index.html', 'cross-team handoff\n');

    const integrationHits = hitsFor(integrationPath, matchersWithPageScope);

    expect(integrationHits).toHaveLength(1);
    expect(integrationHits[0]).toContain('integration page cross-team wording');
    expect(hitsFor(triagePath, matchersWithPageScope)).toEqual([]);
    expect(hitsFor(rootPath, matchersWithPageScope)).toEqual([]);
  });

  // E1, R163: the word families match their plurals and verb forms, not look-alike words.
  it('matches the disclosure word families but not outbound, border classes or Terraform (R163)', () => {
    const hitTexts = ['sandboxed', 'boundaries', 'Landmarks', 'TERRAINS'];
    for (const [index, text] of hitTexts.entries()) {
      expect(hitsFor(writeFixture(`family-${index}.txt`, `${text}\n`), matchers)).toHaveLength(1);
    }
    const nearMisses = ['outbound traffic', 'className="border-b border-border"', 'Terraform'];
    for (const [index, text] of nearMisses.entries()) {
      expect(hitsFor(writeFixture(`family-near-miss-${index}.txt`, `${text}\n`), matchers)).toEqual([]);
    }
  });

  // E2, R163: the "changed incorrectly" and "high impact" phrasings.
  it('matches changed-incorrectly and high-impact phrasings but not incorrect answer or changed the date (R163)', () => {
    const hitTexts = [
      'was changed incorrectly',
      'incorrectly updated the data',
      'an incorrect edit',
      'high-impact features',
    ];
    for (const [index, text] of hitTexts.entries()) {
      expect(hitsFor(writeFixture(`phrasing-${index}.txt`, `${text}\n`), matchers)).toHaveLength(1);
    }
    for (const [index, text] of ['the incorrect answer', 'changed the date'].entries()) {
      expect(hitsFor(writeFixture(`phrasing-near-miss-${index}.txt`, `${text}\n`), matchers)).toEqual([]);
    }
  });

  // E3, R164: the real data module carries "Cross-team" on the decision page and must stay clean.
  it('scans the real data module clean with the page-scoped term inert (R164)', () => {
    const dataModulePath = path.join(REPOSITORY_ROOT, 'src', 'data', 'portfolioData.js');

    const { exitCode, hitLines } = scanFiles([dataModulePath], matchersWithPageScope);

    expect(hitLines).toEqual([]);
    expect(exitCode).toBe(EXIT_CLEAN);
  });

  // E4, R164: only the page-scoped matcher carries a path restriction.
  it('carries onlyPaths on the page-scoped matcher only (R164)', () => {
    const pageScopedMatchers = buildMatchers(PAGE_SCOPED_TERMS);

    expect(pageScopedMatchers).toHaveLength(1);
    expect(pageScopedMatchers[0].onlyPaths).toBeInstanceOf(RegExp);
    expect(matchers.every((matcher) => matcher.onlyPaths === null)).toBe(true);
    expect(FORBIDDEN_TERMS.some((term) => term.label === 'integration page cross-team wording')).toBe(false);
  });

  // F1, R163, R164: the three old integration sentences from main (lines 701, 716, 756).
  it('catches the old integration copy if it returns to the built page (R163, R164)', () => {
    const oldCopy = [
      '{ label: "Result", value: "A manual, cross-team workflow replaced by access on demand" },',
      'Every step was manual, error-prone and crossed team boundaries.',
      'A fully manual, cross-team workflow became access control on demand.',
    ].join('\n');
    const fixturePath = writeNestedFixture('work/apple-integration/index.html', `${oldCopy}\n`);

    const { exitCode, hitLines } = scanFiles([fixturePath], matchersWithPageScope);

    expect(exitCode).toBe(EXIT_HIT);
    expect(hitLines.filter((line) => line.endsWith(': integration page cross-team wording'))).toHaveLength(2);
    expect(hitLines.some((line) => line.endsWith(': crossed team'))).toBe(true);
    expect(hitLines.some((line) => line.endsWith(': boundary'))).toBe(true);
    expect(hitLines.some((line) => line.endsWith(': fully manual'))).toBe(true);
  });

  // A1, R164: spaced, mixed-case and plural spellings hit; "across teams" does not.
  it('catches spaced and mixed-case cross-team on the integration page but not across teams (R164)', () => {
    const spacedPath = writeNestedFixture('spaced/work/apple-integration/index.html', 'Cross Team work\n');
    const pluralPath = writeNestedFixture('plural/work/apple-integration/index.html', 'cross-teams work\n');
    const acrossPath = writeNestedFixture('across/work/apple-integration/index.html', 'work across teams\n');

    expect(hitsFor(spacedPath, matchersWithPageScope)).toHaveLength(1);
    expect(hitsFor(pluralPath, matchersWithPageScope)).toHaveLength(1);
    expect(hitsFor(acrossPath, matchersWithPageScope)).toEqual([]);
  });

  // E6, R164: the scope is the directory, wherever the tree is rooted, and not look-alikes.
  it('scopes cross-team by the integration directory wherever the tree is rooted, not by look-alikes (R164)', () => {
    const scopedPaths = ['dist/work/apple-integration/index.html', 'a/b/work/apple-integration/index.html'];
    const lookAlikePaths = [
      'work/apple-integration-notes/index.html',
      'work/apple-integrations/index.html',
    ];

    for (const relativePath of scopedPaths) {
      expect(hitsFor(writeNestedFixture(relativePath, 'cross-team\n'), matchersWithPageScope)).toHaveLength(1);
    }
    for (const relativePath of lookAlikePaths) {
      expect(hitsFor(writeNestedFixture(relativePath, 'cross-team\n'), matchersWithPageScope)).toEqual([]);
    }
  });

  // E8, R163, R169: the cut fact is banned in any case; its neighbours and the count are not.
  it('bans restricted geospatial in any case but not restricted geography, geospatial data or the incident count (R163, R169)', () => {
    const hitTexts = ['Restricted Geospatial Zones', 'inside RESTRICTED GEOSPATIAL areas'];
    for (const [index, text] of hitTexts.entries()) {
      const hits = hitsFor(writeFixture(`geospatial-${index}.txt`, `${text}\n`), matchers);
      expect(hits).toHaveLength(1);
      expect(hits[0]).toContain(': restricted geospatial');
    }
    const nearMisses = ['restricted geography', 'geospatial data', 'Tens of thousands of buildings'];
    for (const [index, text] of nearMisses.entries()) {
      expect(hitsFor(writeFixture(`geospatial-near-miss-${index}.txt`, `${text}\n`), matchers)).toEqual([]);
    }
  });
});

describe('check-forbidden-copy entry', () => {
  function spawnEntry(args) {
    return spawnSync(process.execPath, [ENTRY_PATH, ...args], {
      encoding: 'utf8',
      timeout: 20_000,
      cwd: REPOSITORY_ROOT,
    });
  }

  // F2: a requested directory that does not exist. The entry resolves a directory argument
  // against the spawned process's cwd (see scripts/forbidden-copy.mjs resolveScope), so running
  // it from a freshly created, empty temp directory guarantees "dist" is absent there regardless
  // of whether the checkout itself happens to carry a built dist/ at the repository root.
  it('exits 2 and names the missing directory when "dist" does not exist', () => {
    const emptyCwd = fs.mkdtempSync(path.join(os.tmpdir(), 'check-forbidden-copy-cwd-'));
    try {
      expect(fs.existsSync(path.join(emptyCwd, 'dist'))).toBe(false);

      const result = spawnSync(process.execPath, [ENTRY_PATH, 'dist'], {
        encoding: 'utf8',
        timeout: 20_000,
        cwd: emptyCwd,
      });

      expect(result.status).toBe(2);
      expect(result.stdout).toContain('::error::');
      expect(result.stdout).toContain('dist');
    } finally {
      fs.rmSync(emptyCwd, { recursive: true, force: true });
    }
  });

  // R164: proves `main` passes PAGE_SCOPED_TERMS to the scan, not only FORBIDDEN_TERMS. The
  // fixture tree sits outside the repository; the scoped pattern matches on its
  // work/apple-integration/ directory wherever the tree is rooted.
  it('exits 1 naming the integration term for cross-team under work/apple-integration/, and 0 under another path', () => {
    const builtSite = fs.mkdtempSync(path.join(os.tmpdir(), 'check-forbidden-copy-built-'));
    try {
      const integrationDirectory = path.join(builtSite, 'work', 'apple-integration');
      fs.mkdirSync(integrationDirectory, { recursive: true });
      fs.writeFileSync(path.join(integrationDirectory, 'index.html'), '<p>cross-team handoff</p>\n', 'utf8');

      const failing = spawnEntry([builtSite]);

      expect(failing.status).toBe(EXIT_HIT);
      expect(failing.stdout).toContain(': integration page cross-team wording');
      expect(failing.stdout).toContain('work/apple-integration/index.html');

      fs.rmSync(path.join(builtSite, 'work'), { recursive: true, force: true });
      const otherDirectory = path.join(builtSite, 'work', 'apple-llm-triage');
      fs.mkdirSync(otherDirectory, { recursive: true });
      fs.writeFileSync(path.join(otherDirectory, 'index.html'), '<p>cross-team handoff</p>\n', 'utf8');

      const passing = spawnEntry([builtSite]);

      expect(passing.status).toBe(EXIT_CLEAN);
    } finally {
      fs.rmSync(builtSite, { recursive: true, force: true });
    }
  });

  it('runs under two seconds scanning the real src/ directory (as the entry, no argument)', () => {
    const start = performance.now();
    spawnEntry([]);
    const elapsedMs = performance.now() - start;

    expect(elapsedMs).toBeLessThan(2000);
  });
});

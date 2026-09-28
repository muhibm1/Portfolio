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
  buildMatchers,
  scanFiles,
} from '../scripts/forbidden-copy.mjs';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS_DIRECTORY = path.join(REPOSITORY_ROOT, 'scripts');
const ENTRY_PATH = path.join(SCRIPTS_DIRECTORY, 'check-forbidden-copy.mjs');

const matchers = buildMatchers(FORBIDDEN_TERMS);

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

  it('runs under two seconds scanning the real src/ directory (as the entry, no argument)', () => {
    const start = performance.now();
    spawnEntry([]);
    const elapsedMs = performance.now() - start;

    expect(elapsedMs).toBeLessThan(2000);
  });
});

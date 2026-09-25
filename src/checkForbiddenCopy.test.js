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

// One rendering per forbidden term (ADR 0004): the paired-case entries ("simulator"/"Simulator",
// "Wasl"/"wasl") and the two dash characters, seventeen renderings in all, so each fixture file
// still produces exactly one hit even though the matcher list itself is case-insensitive and does
// not carry duplicate entries.
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
});

describe('check-forbidden-copy entry', () => {
  function spawnEntry(args) {
    return spawnSync(process.execPath, [ENTRY_PATH, ...args], {
      encoding: 'utf8',
      timeout: 20_000,
      cwd: REPOSITORY_ROOT,
    });
  }

  // F2: a requested directory that does not exist.
  it('exits 2 and names the missing directory when "dist" does not exist', () => {
    const distPath = path.join(REPOSITORY_ROOT, 'dist');
    expect(fs.existsSync(distPath)).toBe(false);

    const result = spawnEntry(['dist']);

    expect(result.status).toBe(2);
    expect(result.stdout).toContain('::error::');
    expect(result.stdout).toContain('dist');
  });

  it('runs under two seconds scanning the real src/ directory (as the entry, no argument)', () => {
    const start = performance.now();
    spawnEntry([]);
    const elapsedMs = performance.now() - start;

    expect(elapsedMs).toBeLessThan(2000);
  });
});

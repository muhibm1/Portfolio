// Tests the R89 redaction check: scripts/phone-redaction-scan.mjs in process, and the entry
// scripts/check-phone-redaction.mjs by spawning it, so both the always-runs entry (ADR 0001) and
// the library it calls are proven. They use the script's synthetic reference number and temporary
// fixture files, so they need neither git nor the reference commit and pass on a shallow clone.
// This file lives under src/ only because Vitest discovers tests there.
import { spawnSync } from 'node:child_process';
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EXIT_CANNOT_RUN,
  EXIT_CLEAN,
  EXIT_HIT,
  SELF_TEST_REFERENCE,
  buildMatchers,
  exitCodeOrCannotRun,
  formNamesFoundIn,
  scanFiles,
} from '../scripts/phone-redaction-scan.mjs';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPTS_DIRECTORY = path.join(REPOSITORY_ROOT, 'scripts');
const ENTRY_PATH = path.join(SCRIPTS_DIRECTORY, 'check-phone-redaction.mjs');
const LIBRARY_PATH = path.join(SCRIPTS_DIRECTORY, 'phone-redaction-scan.mjs');
const ENTRY_URL = pathToFileURL(ENTRY_PATH).href;
const LIBRARY_URL = pathToFileURL(LIBRARY_PATH).href;

const matchers = buildMatchers(SELF_TEST_REFERENCE);

const FULL_NUMBER_WITH_A_COUNTRY_CODE = [
  '+15555560100',
  '15555560100',
  '+1 555-556-0100',
  '1-555-556-0100',
];

const AREA_CODE_AND_EXCHANGE_WITH_A_COUNTRY_CODE = ['+1555556', '1555556', '+1 555-556', '1-555-556'];

const DIGIT_BEFORE_THE_NUMBER = ['95555560100', '915555560100', '115555560100', '91555556'];

const LINE_WITH_THE_NUMBER = 'Call 555-556-0100 today.\n';

describe('check-phone-redaction matchers', () => {
  it.each(FULL_NUMBER_WITH_A_COUNTRY_CODE)(
    'catches the full number written with a country code as %s',
    (text) => {
      const formNames = formNamesFoundIn(`Call ${text} today.`, matchers);

      expect(formNames).toContain('full number');
    },
  );

  it.each(AREA_CODE_AND_EXCHANGE_WITH_A_COUNTRY_CODE)(
    'catches the area code and exchange written with a country code as %s',
    (text) => {
      const formNames = formNamesFoundIn(`Call ${text} today.`, matchers);

      expect(formNames).toContain('area code and exchange');
    },
  );

  it.each(DIGIT_BEFORE_THE_NUMBER)(
    'does not match %s, which has another digit directly before the number',
    (text) => {
      const formNames = formNamesFoundIn(`Call ${text} today.`, matchers);

      expect(formNames).toEqual([]);
    },
  );
});

describe('check-phone-redaction file scan', () => {
  let fixtureDirectory;

  beforeEach(() => {
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'check-phone-redaction-'));
  });

  afterEach(() => {
    fs.rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  function writeFixture(fileName, bytes) {
    const fixturePath = path.join(fixtureDirectory, fileName);
    fs.writeFileSync(fixturePath, bytes);
    return fixturePath;
  }

  function scanAlongsideACleanFile(fixturePath) {
    const cleanPath = writeFixture('clean.txt', Buffer.from('No number here.\n', 'utf8'));
    return scanFiles([cleanPath, fixturePath], matchers);
  }

  function expectOneFullNumberHitIn(fileName, { exitCode, reportLines }) {
    const fullNumberHits = reportLines.filter(
      (line) => line.includes(fileName) && line.endsWith(':1: full number'),
    );

    expect(exitCode).toBe(EXIT_HIT);
    expect(fullNumberHits).toHaveLength(1);
  }

  function fullNumberHitCountFor(fileName, reportLines) {
    return reportLines.filter((line) => line.includes(fileName) && /:\d+: full number$/.test(line))
      .length;
  }

  function undecodableLineCountFor(fileName, reportLines) {
    return reportLines.filter((line) => line.includes(fileName) && line.includes('could not be decoded'))
      .length;
  }

  it('reads a UTF-16LE file that starts with a byte-order mark', () => {
    const bytes = Buffer.concat([
      Buffer.from([0xff, 0xfe]),
      Buffer.from(LINE_WITH_THE_NUMBER, 'utf16le'),
    ]);
    const fixturePath = writeFixture('utf16le-with-bom.txt', bytes);

    const result = scanAlongsideACleanFile(fixturePath);

    expectOneFullNumberHitIn('utf16le-with-bom.txt', result);
  });

  it('reads a UTF-16BE file that starts with a byte-order mark', () => {
    const bigEndianText = Buffer.from(LINE_WITH_THE_NUMBER, 'utf16le').swap16();
    const bytes = Buffer.concat([Buffer.from([0xfe, 0xff]), bigEndianText]);
    const fixturePath = writeFixture('utf16be-with-bom.txt', bytes);

    const result = scanAlongsideACleanFile(fixturePath);

    expectOneFullNumberHitIn('utf16be-with-bom.txt', result);
  });

  it('reads a UTF-16LE file with no byte-order mark', () => {
    const bytes = Buffer.from(LINE_WITH_THE_NUMBER, 'utf16le');
    const fixturePath = writeFixture('utf16le-no-bom.txt', bytes);

    const result = scanAlongsideACleanFile(fixturePath);

    expectOneFullNumberHitIn('utf16le-no-bom.txt', result);
  });

  it('finds the number in a UTF-8 tail after a UTF-16LE mark and UTF-16 text', () => {
    const cleanUtf16Text = 'x'.repeat(40);
    const bytes = Buffer.concat([
      Buffer.from([0xff, 0xfe]),
      Buffer.from(`${cleanUtf16Text}\n`, 'utf16le'),
      Buffer.from('Call 555-556-0100 today!!\n', 'utf8'),
    ]);
    const fixturePath = writeFixture('utf16le-mark-then-utf8-tail.txt', bytes);

    const { exitCode, reportLines } = scanAlongsideACleanFile(fixturePath);

    expect(exitCode).toBe(EXIT_HIT);
    expect(fullNumberHitCountFor('utf16le-mark-then-utf8-tail.txt', reportLines)).toBe(1);
  });

  it('finds the number in a UTF-8 tail after a UTF-16BE mark and UTF-16 text', () => {
    const cleanUtf16Text = 'x'.repeat(40);
    const bigEndianText = Buffer.from(`${cleanUtf16Text}\n`, 'utf16le').swap16();
    const bytes = Buffer.concat([
      Buffer.from([0xfe, 0xff]),
      bigEndianText,
      Buffer.from('Call 555-556-0100 today!!\n', 'utf8'),
    ]);
    const fixturePath = writeFixture('utf16be-mark-then-utf8-tail.txt', bytes);

    const { exitCode, reportLines } = scanAlongsideACleanFile(fixturePath);

    expect(exitCode).toBe(EXIT_HIT);
    expect(fullNumberHitCountFor('utf16be-mark-then-utf8-tail.txt', reportLines)).toBe(1);
  });

  it('finds the number in a UTF-8 head before a BOM-less UTF-16LE tail', () => {
    const cleanUtf16Text = 'x'.repeat(40);
    const bytes = Buffer.concat([
      Buffer.from('Call 555-556-0100 today!!\n', 'utf8'),
      Buffer.from(cleanUtf16Text, 'utf16le'),
    ]);
    const fixturePath = writeFixture('utf8-head-then-utf16le-tail.txt', bytes);

    const { exitCode, reportLines } = scanAlongsideACleanFile(fixturePath);

    expect(exitCode).toBe(EXIT_HIT);
    expect(fullNumberHitCountFor('utf8-head-then-utf16le-tail.txt', reportLines)).toBe(1);
  });

  it('reports a hit and names the file as undecodable when a zero-byte file holds the number', () => {
    const bytes = Buffer.concat([Buffer.from([0x00]), Buffer.from(LINE_WITH_THE_NUMBER, 'utf8')]);
    const fixturePath = writeFixture('zero-byte-with-number.txt', bytes);

    const { exitCode, reportLines } = scanAlongsideACleanFile(fixturePath);

    expect(exitCode).toBe(EXIT_HIT);
    expect(reportLines.filter((line) => line.endsWith(':1: full number'))).toHaveLength(1);
    expect(undecodableLineCountFor('zero-byte-with-number.txt', reportLines)).toBe(1);
    expect(reportLines.at(-1)).toContain('1 undecodable');
    expect(reportLines.filter((line) => line.includes('556') || line.includes('today'))).toEqual([]);
  });

  it('fails with exit 2 and names a zero-byte file it cannot recognise when it holds no number', () => {
    const bytes = Buffer.concat([Buffer.from([0x00]), Buffer.from('No number here.\n', 'utf8')]);
    const fixturePath = writeFixture('zero-byte-clean.txt', bytes);

    const { exitCode, reportLines } = scanAlongsideACleanFile(fixturePath);

    expect(exitCode).toBe(EXIT_CANNOT_RUN);
    expect(undecodableLineCountFor('zero-byte-clean.txt', reportLines)).toBe(1);
    expect(reportLines.at(-1)).toContain('1 undecodable');
    expect(reportLines.at(-1)).toContain('0 hits');
  });

  it('finds the number in UTF-16LE at odd alignment in an odd-length file', () => {
    const bytes = Buffer.concat([
      Buffer.from([0x41, 0x42, 0x43]),
      Buffer.from(LINE_WITH_THE_NUMBER, 'utf16le'),
      Buffer.from([0x00]),
    ]);
    const fixturePath = writeFixture('odd-length-odd-alignment.txt', bytes);

    let result;
    expect(() => {
      result = scanAlongsideACleanFile(fixturePath);
    }).not.toThrow();
    const { exitCode, reportLines } = result;

    expect(exitCode).toBe(EXIT_HIT);
    expect(fullNumberHitCountFor('odd-length-odd-alignment.txt', reportLines)).toBeGreaterThan(0);
  });

  it('counts an empty file as scanned', () => {
    const fixturePath = writeFixture('empty.txt', Buffer.alloc(0));

    const { exitCode, reportLines } = scanAlongsideACleanFile(fixturePath);

    expect(exitCode).toBe(EXIT_CLEAN);
    expect(reportLines.at(-1)).toContain('Scanned 2 files');
    expect(reportLines.at(-1)).toContain('0 hits');
  });

  it('exits 1 when a run has both a hit and an undecodable file', () => {
    const hitPath = writeFixture('hit.txt', Buffer.from(LINE_WITH_THE_NUMBER, 'utf8'));
    const undecodablePath = writeFixture(
      'undecodable-clean.txt',
      Buffer.concat([Buffer.from([0x00]), Buffer.from('No number here.\n', 'utf8')]),
    );

    const { exitCode, reportLines } = scanFiles([hitPath, undecodablePath], matchers);

    expect(exitCode).toBe(EXIT_HIT);
    expect(reportLines.at(-1)).toContain('1 undecodable');
    expect(reportLines.at(-1)).not.toContain('0 hits');
  });

  it('finds the number in BOM-less UTF-16BE and still flags the file as incomplete', () => {
    const bytes = Buffer.from(LINE_WITH_THE_NUMBER, 'utf16le').swap16();
    const fixturePath = writeFixture('utf16be-no-bom.txt', bytes);

    const { exitCode, reportLines } = scanAlongsideACleanFile(fixturePath);

    expect(exitCode).toBe(EXIT_HIT);
    expect(fullNumberHitCountFor('utf16be-no-bom.txt', reportLines)).toBeGreaterThan(0);
    expect(undecodableLineCountFor('utf16be-no-bom.txt', reportLines)).toBe(1);
  });

  it('finds the number in UTF-8 text behind a lying UTF-16 byte-order mark', () => {
    const bytes = Buffer.concat([
      Buffer.from([0xff, 0xfe]),
      Buffer.from('Call 555-556-0100 today!!\n', 'utf8'),
    ]);
    const fixturePath = writeFixture('lying-bom.txt', bytes);

    const { exitCode, reportLines } = scanAlongsideACleanFile(fixturePath);

    expect(exitCode).toBe(EXIT_HIT);
    expect(fullNumberHitCountFor('lying-bom.txt', reportLines)).toBeGreaterThan(0);
  });

  it('never prints matched text or reference digits for a mixed-encoding hit', () => {
    const cleanUtf16Text = 'x'.repeat(40);
    const bytes = Buffer.concat([
      Buffer.from([0xff, 0xfe]),
      Buffer.from(`${cleanUtf16Text}\n`, 'utf16le'),
      Buffer.from('Call 555-556-0100 today!!\n', 'utf8'),
    ]);
    const fixturePath = writeFixture('mixed-encoding-hit.txt', bytes);

    const { reportLines } = scanAlongsideACleanFile(fixturePath);

    expect(reportLines.filter((line) => line.includes('556') || line.includes('0100'))).toEqual([]);
    expect(reportLines.filter((line) => line.includes('today'))).toEqual([]);
  });

  it('finds the number in a UTF-8 head when a short UTF-16 tail makes the file unrecognised', () => {
    const bytes = Buffer.concat([
      Buffer.from('Call 555-556-0100 today!!\n', 'utf8'),
      Buffer.from([0x41, 0x00]),
    ]);
    const fixturePath = writeFixture('short-utf16-tail.txt', bytes);

    const { exitCode, reportLines } = scanAlongsideACleanFile(fixturePath);

    expect(exitCode).toBe(EXIT_HIT);
    expect(fullNumberHitCountFor('short-utf16-tail.txt', reportLines)).toBeGreaterThan(0);
    expect(undecodableLineCountFor('short-utf16-tail.txt', reportLines)).toBe(1);
  });

  it('finds the number in UTF-8 text even when a byte-order-mark-like sequence appears later in the file, not at its start', () => {
    const bytes = Buffer.concat([
      Buffer.from(LINE_WITH_THE_NUMBER, 'utf8'),
      Buffer.from('More text before the marker. ', 'utf8'),
      Buffer.from([0xff, 0xfe]),
      Buffer.from(' and more clean text after it.\n', 'utf8'),
    ]);
    const fixturePath = writeFixture('mid-file-marker.txt', bytes);

    const result = scanAlongsideACleanFile(fixturePath);

    expectOneFullNumberHitIn('mid-file-marker.txt', result);
  });

  it('scans a 4 MB file holding zero bytes in under five seconds', () => {
    const repeatedUtf16Text = Buffer.from('a'.repeat(2 * 1024 * 1024 - 13), 'utf16le');
    const oneCleanUtf8Line = Buffer.from('No zero bytes on this line.\n', 'utf8');
    const fourMegabytes = Buffer.concat([repeatedUtf16Text, oneCleanUtf8Line]);
    const fixturePath = writeFixture('large-zero-byte.bin', fourMegabytes);

    const start = performance.now();
    scanAlongsideACleanFile(fixturePath);
    const elapsedMs = performance.now() - start;

    expect(elapsedMs).toBeLessThan(5000);
  });

  it('skips a file with a binary extension and counts it as binary', () => {
    const bytes = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00]),
      Buffer.from('555-556-0100', 'utf8'),
    ]);
    const fixturePath = writeFixture('image.png', bytes);

    const { exitCode, reportLines } = scanAlongsideACleanFile(fixturePath);

    expect(exitCode).toBe(EXIT_CLEAN);
    expect(reportLines.at(-1)).toContain('1 skipped as binary');
    expect(reportLines.at(-1)).toContain('0 hits');
  });
});

describe('check-phone-redaction entry', () => {
  let scriptsListingBefore;
  let repositoryListingBefore;
  let fixtureDirectory;
  let junctionPath;

  beforeAll(() => {
    scriptsListingBefore = fs.readdirSync(SCRIPTS_DIRECTORY).sort();
    repositoryListingBefore = fs.readdirSync(REPOSITORY_ROOT).sort();
  });

  beforeEach(() => {
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'check-phone-redaction-entry-'));
    junctionPath = path.join(fixtureDirectory, 'scripts-alias');
    fs.symlinkSync(SCRIPTS_DIRECTORY, junctionPath, 'junction');
  });

  afterEach(() => {
    const nestedJunctionPath = path.join(fixtureDirectory, 'scripts-alias-alias');
    if (fs.existsSync(nestedJunctionPath)) fs.unlinkSync(nestedJunctionPath);
    fs.unlinkSync(junctionPath);
    fs.rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  function writePlantDirectory(hasNumber) {
    const plantDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'check-phone-redaction-plant-'));
    fs.writeFileSync(
      path.join(plantDirectory, 'plant.txt'),
      hasNumber ? LINE_WITH_THE_NUMBER : 'No number here.\n',
      'utf8',
    );
    return plantDirectory;
  }

  function removePlantDirectory(plantDirectory) {
    fs.rmSync(plantDirectory, { recursive: true, force: true });
  }

  function spawnEntry(entryPath, args, options = {}) {
    return spawnSync(process.execPath, [entryPath, ...args], {
      encoding: 'utf8',
      timeout: 20_000,
      ...options,
    });
  }

  function containsFullNumberHitFor(fileName, stdout) {
    return stdout.split('\n').some((line) => line.endsWith(':1: full number') && line.includes(fileName));
  }

  it('started through a junction, scans a planted number and exits 1', () => {
    const plantDirectory = writePlantDirectory(true);
    try {
      const entryThroughJunction = path.join(junctionPath, 'check-phone-redaction.mjs');

      const result = spawnEntry(entryThroughJunction, ['--self-test', plantDirectory]);

      expect(result.status).toBe(1);
      expect(containsFullNumberHitFor('plant.txt', result.stdout)).toBe(true);
    } finally {
      removePlantDirectory(plantDirectory);
    }
  });

  it('started through a junction, scans a clean directory, prints the summary and exits 0', () => {
    const plantDirectory = writePlantDirectory(false);
    try {
      const entryThroughJunction = path.join(junctionPath, 'check-phone-redaction.mjs');

      const result = spawnEntry(entryThroughJunction, ['--self-test', plantDirectory]);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Scanned 1 files');
      expect(result.stdout).toContain('synthetic reference');
      expect(result.stdout).not.toBe('');
    } finally {
      removePlantDirectory(plantDirectory);
    }
  });

  it('started by its documented relative path, runs the self-test and exits 0', () => {
    const result = spawnSync(process.execPath, ['scripts/check-phone-redaction.mjs', '--self-test'], {
      encoding: 'utf8',
      timeout: 20_000,
      cwd: REPOSITORY_ROOT,
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Self-test: 17 of 17 form renderings hit, 0 of 9 near-misses hit.');
  });

  it('importing the library runs no scan and sets no exit code', () => {
    const code = `import(${JSON.stringify(LIBRARY_URL)}).then(() => console.log('imported'));`;

    const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], {
      encoding: 'utf8',
      timeout: 20_000,
    });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('imported');
    expect(result.stderr).toBe('');
  });

  it('self-test scans every directory given', () => {
    const directoryA = writePlantDirectory(false);
    const directoryB = writePlantDirectory(false);
    try {
      const result = spawnEntry(ENTRY_PATH, ['--self-test', directoryA, directoryB]);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Scanned 2 files');
    } finally {
      removePlantDirectory(directoryA);
      removePlantDirectory(directoryB);
    }
  });

  it('started through a junction with a missing directory, reports the error and exits 2', () => {
    const missingDirectory = path.join(fixtureDirectory, 'does-not-exist');
    const entryThroughJunction = path.join(junctionPath, 'check-phone-redaction.mjs');

    const result = spawnEntry(entryThroughJunction, ['--self-test', missingDirectory]);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('does not exist');
  });

  it('self-test of an empty directory exits 2 because nothing was scanned', () => {
    const emptyDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'check-phone-redaction-empty-'));
    try {
      const result = spawnEntry(ENTRY_PATH, ['--self-test', emptyDirectory]);

      expect(result.status).toBe(2);
      expect(result.stdout).toContain('Scanned 0 files');
    } finally {
      fs.rmSync(emptyDirectory, { recursive: true, force: true });
    }
  });

  it('started through a junction that points at another junction, scans a planted number and exits 1', () => {
    const nestedJunctionPath = path.join(fixtureDirectory, 'scripts-alias-alias');
    fs.symlinkSync(junctionPath, nestedJunctionPath, 'junction');
    const plantDirectory = writePlantDirectory(true);
    try {
      const entryThroughNestedJunction = path.join(nestedJunctionPath, 'check-phone-redaction.mjs');

      const result = spawnEntry(entryThroughNestedJunction, ['--self-test', plantDirectory]);

      expect(result.status).toBe(1);
      expect(containsFullNumberHitFor('plant.txt', result.stdout)).toBe(true);
    } finally {
      removePlantDirectory(plantDirectory);
    }
  });

  it('importing the entry script still runs the scan, because unlike the library it has no guard', () => {
    const plantDirectory = writePlantDirectory(true);
    try {
      const code = [
        `process.argv = [process.argv[0], 'entry', '--self-test', ${JSON.stringify(plantDirectory)}];`,
        `await import(${JSON.stringify(ENTRY_URL)});`,
      ].join('\n');

      const result = spawnSync(process.execPath, ['--input-type=module', '-e', code], {
        encoding: 'utf8',
        timeout: 20_000,
      });

      expect(result.status).toBe(1);
      expect(containsFullNumberHitFor('plant.txt', result.stdout)).toBe(true);
    } finally {
      removePlantDirectory(plantDirectory);
    }
  });

  it('self-test accepts a directory argument with a trailing separator', () => {
    const plantDirectory = writePlantDirectory(false);
    try {
      const withTrailingSeparator = plantDirectory.endsWith(path.sep)
        ? plantDirectory
        : plantDirectory + path.sep;

      const result = spawnEntry(ENTRY_PATH, ['--self-test', withTrailingSeparator]);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain('Scanned 1 files');
    } finally {
      removePlantDirectory(plantDirectory);
    }
  });

  it('started by a relative path from a working directory that is not the repository root, still runs the self-test and exits 0', () => {
    const relativeFromFixture = path.relative(fixtureDirectory, ENTRY_PATH);

    const result = spawnSync(process.execPath, [relativeFromFixture, '--self-test'], {
      encoding: 'utf8',
      timeout: 20_000,
      cwd: fixtureDirectory,
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Self-test: 17 of 17 form renderings hit, 0 of 9 near-misses hit.');
  });

  it('maps a missing or foreign return value from main to exit 2 and says so', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      for (const value of [undefined, null, '1', 7]) {
        consoleError.mockClear();

        expect(exitCodeOrCannotRun(value)).toBe(EXIT_CANNOT_RUN);
        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError.mock.calls[0][0]).toContain('returned no exit code');
      }

      for (const value of [EXIT_CLEAN, EXIT_HIT, EXIT_CANNOT_RUN]) {
        consoleError.mockClear();

        expect(exitCodeOrCannotRun(value)).toBe(value);
        expect(consoleError).not.toHaveBeenCalled();
      }
    } finally {
      consoleError.mockRestore();
    }
  });

  it('the entry sets its exit code through exitCodeOrCannotRun', () => {
    const entryText = fs.readFileSync(ENTRY_PATH, 'utf8');

    expect(entryText).toContain('exitCodeOrCannotRun(main(');
  });

  it('leaves the repository scripts directory and working tree untouched after the junction tests', () => {
    const scriptsListingAfter = fs.readdirSync(SCRIPTS_DIRECTORY).sort();
    const repositoryListingAfter = fs.readdirSync(REPOSITORY_ROOT).sort();

    expect(scriptsListingAfter).toEqual(scriptsListingBefore);
    expect(scriptsListingAfter).toContain('check-phone-redaction.mjs');
    expect(scriptsListingAfter).toContain('phone-redaction-scan.mjs');
    expect(repositoryListingAfter).toEqual(repositoryListingBefore);
  });
});

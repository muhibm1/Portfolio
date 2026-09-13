// Tests the R89 redaction check in process (scripts/check-phone-redaction.mjs, ADR 0010). They use
// the script's synthetic reference number and temporary fixture files, so they need neither git nor
// the reference commit and pass on a shallow clone. This file lives under src/ only because Vitest
// discovers tests there.
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  EXIT_CANNOT_RUN,
  EXIT_CLEAN,
  EXIT_HIT,
  SELF_TEST_REFERENCE,
  buildMatchers,
  formNamesFoundIn,
  scanFiles,
} from '../scripts/check-phone-redaction.mjs';

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

  it('fails with exit 2 and names a file it cannot decode, without printing its content', () => {
    const bytes = Buffer.concat([Buffer.from([0x00]), Buffer.from(LINE_WITH_THE_NUMBER, 'utf8')]);
    const fixturePath = writeFixture('undecodable.txt', bytes);

    const { exitCode, reportLines } = scanAlongsideACleanFile(fixturePath);

    expect(exitCode).toBe(EXIT_CANNOT_RUN);
    expect(
      reportLines.filter(
        (line) => line.includes('undecodable.txt') && line.includes('could not be decoded'),
      ),
    ).toHaveLength(1);
    expect(reportLines.at(-1)).toContain('1 undecodable');
    expect(reportLines.filter((line) => line.includes('556-0100') || line.includes('today.'))).toEqual(
      [],
    );
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

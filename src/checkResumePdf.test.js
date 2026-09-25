// Tests the resume-PDF publishing check (MEDIUM security finding, conductor decision D23):
// scripts/resume-pdf.mjs in process, and the entry scripts/check-resume-pdf.mjs by spawning it, in
// the style of src/checkForbiddenCopy.test.js. Every PDF here is a synthetic fixture built at test
// time in a temp directory; nothing here ever writes into public/, commits a .pdf file, or copies
// a PDF from anywhere on this machine.
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { EXIT_CLEAN, evaluatePdfBytes, parseRecordedHash } from '../scripts/resume-pdf.mjs';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY_PATH = path.join(REPOSITORY_ROOT, 'scripts', 'check-resume-pdf.mjs');

// Builds a minimal, syntactically real single-revision PDF with one FlateDecode stream holding
// `streamText`, so the check's own stream-extraction and inflation code runs against real deflate
// bytes, not a stand-in.
function buildPdfBytes({ streamText = 'Hello, this is a harmless resume body.', eofCount = 1, includePrev = false } = {}) {
  const compressed = zlib.deflateSync(Buffer.from(streamText, 'utf8'));
  let body = '%PDF-1.4\n';
  body += '1 0 obj\n<< /Type /Catalog >>\nendobj\n';
  body += `2 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n`;
  body += compressed.toString('latin1');
  body += '\nendstream\nendobj\n';
  body += includePrev ? 'trailer\n<< /Size 3 /Prev 100 >>\n' : 'trailer\n<< /Size 3 >>\n';
  body += 'startxref\n0\n';
  body += '%%EOF\n'.repeat(eofCount);
  return Buffer.from(body, 'latin1');
}

function hashLogLine(hash) {
  return `2026-09-25 ${hash} D12/D17 check passed for public/Muhammad_Muhibullah_Resume.pdf. Test fixture.\n`;
}

describe('resume-pdf library', () => {
  it('parseRecordedHash reads the last of several D12/D17 log lines', () => {
    const text = `${hashLogLine('a'.repeat(64))}${hashLogLine('b'.repeat(64))}`;
    expect(parseRecordedHash(text)).toBe('b'.repeat(64));
  });

  it('parseRecordedHash returns undefined when there is no log line yet', () => {
    expect(parseRecordedHash('Nothing recorded yet.\n')).toBeUndefined();
  });

  it('evaluatePdfBytes passes a clean, single-revision PDF against its own hash', () => {
    const bytes = buildPdfBytes();
    const result = evaluatePdfBytes(bytes, crypto.createHash('sha256').update(bytes).digest('hex'));
    expect(result.exitCode).toBe(EXIT_CLEAN);
    expect(result.errorLines).toEqual([]);
  });
});

describe('check-resume-pdf entry', () => {
  let tempDirectory;
  let pdfPath;
  let hostedConfigPath;

  beforeEach(() => {
    tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'check-resume-pdf-'));
    pdfPath = path.join(tempDirectory, 'resume.pdf');
    hostedConfigPath = path.join(tempDirectory, 'hosted-config.md');
  });

  afterEach(() => {
    fs.rmSync(tempDirectory, { recursive: true, force: true });
  });

  function writeFixture(bytes, hostedConfigText) {
    fs.writeFileSync(pdfPath, bytes);
    fs.writeFileSync(hostedConfigPath, hostedConfigText, 'utf8');
  }

  function spawnEntry(args) {
    return spawnSync(process.execPath, [ENTRY_PATH, ...args], {
      encoding: 'utf8',
      timeout: 20_000,
      cwd: REPOSITORY_ROOT,
    });
  }

  it('exits 0 on a clean, single-revision PDF whose hash matches the recorded one', () => {
    const bytes = buildPdfBytes();
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    writeFixture(bytes, hashLogLine(hash));

    const result = spawnEntry([pdfPath, hostedConfigPath]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Resume PDF check passed.');
  });

  it('exits 1 naming resume-pdf-hash-mismatch when the recorded hash is stale', () => {
    const bytes = buildPdfBytes();
    writeFixture(bytes, hashLogLine('0'.repeat(64)));

    const result = spawnEntry([pdfPath, hostedConfigPath]);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('::error::resume-pdf-hash-mismatch');
  });

  it('exits 1 naming resume-pdf-eof-count when the file has two %%EOF markers', () => {
    const bytes = buildPdfBytes({ eofCount: 2 });
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    writeFixture(bytes, hashLogLine(hash));

    const result = spawnEntry([pdfPath, hostedConfigPath]);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('::error::resume-pdf-eof-count');
    expect(result.stdout).toContain('found 2');
  });

  it('exits 1 naming resume-pdf-prev-reference when the trailer has a /Prev entry', () => {
    const bytes = buildPdfBytes({ includePrev: true });
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    writeFixture(bytes, hashLogLine(hash));

    const result = spawnEntry([pdfPath, hostedConfigPath]);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('::error::resume-pdf-prev-reference');
  });

  it('exits 1 naming resume-pdf-text-leak when a phone-shaped number is inside the Flate stream', () => {
    const bytes = buildPdfBytes({ streamText: 'Call me at 555-123-4567 for details.' });
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    writeFixture(bytes, hashLogLine(hash));

    const result = spawnEntry([pdfPath, hostedConfigPath]);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('::error::resume-pdf-text-leak');
    expect(result.stdout).toContain('phone-shaped number');
  });

  it('exits 1 naming resume-pdf-text-leak when a C:\\ path is inside the Flate stream', () => {
    const bytes = buildPdfBytes({ streamText: String.raw`Generated from C:\Users\owner\Documents\resume.docx` });
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    writeFixture(bytes, hashLogLine(hash));

    const result = spawnEntry([pdfPath, hostedConfigPath]);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('::error::resume-pdf-text-leak');
    expect(result.stdout).toContain('Windows path');
  });

  it('exits 2 naming the missing file as owner-supplied (D2) when the PDF does not exist', () => {
    fs.writeFileSync(hostedConfigPath, hashLogLine('a'.repeat(64)), 'utf8');

    const result = spawnEntry([pdfPath, hostedConfigPath]);

    expect(result.status).toBe(2);
    expect(result.stdout).toContain('::error::');
    expect(result.stdout).toContain('is missing');
    expect(result.stdout).toContain('owner-supplied (D2)');
  });

  it('exits 2 when docs/hosted-config.md has no recorded D12/D17 hash line', () => {
    const bytes = buildPdfBytes();
    writeFixture(bytes, 'No hash recorded yet for this fixture.\n');

    const result = spawnEntry([pdfPath, hostedConfigPath]);

    expect(result.status).toBe(2);
    expect(result.stdout).toContain('::error::no D12/D17 hash line found');
  });
});

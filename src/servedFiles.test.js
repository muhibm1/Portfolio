// Tests the served files a page depends on (R137, R141, R151): the share image, supplied by a
// person rather than written by a builder (D4), and its source committed in this repository. A
// missing supplied file fails with a message naming its decision, never a stub or a fake file
// (plan Approach, "T10's test stays red and is reported"). No resume PDF is served: R151
// withdraws it, and this file asserts none is tracked (R143).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OG_PNG_PATH = path.join(REPO_ROOT, 'public', 'og.png');
const OG_SVG_PATH = path.join(REPO_ROOT, 'docs', 'design', 'og.svg');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('served files (G18)', () => {
  it('serves public/og.png as a 1200 by 630 PNG (D4)', () => {
    if (!fs.existsSync(OG_PNG_PATH)) {
      throw new Error(
        'D4: public/og.png is missing. It is rendered once by the main session from ' +
          'docs/design/og.svg and committed; a builder never creates or fakes it.',
      );
    }

    const buffer = fs.readFileSync(OG_PNG_PATH);
    expect(buffer.subarray(0, 8).equals(PNG_SIGNATURE)).toBe(true);
    expect(buffer.readUInt32BE(16)).toBe(1200);
    expect(buffer.readUInt32BE(20)).toBe(630);
  });

  it('keeps the share-image source at 1200 by 630', () => {
    const svg = fs.readFileSync(OG_SVG_PATH, 'utf8');

    expect(svg).toContain('viewBox="0 0 1200 630"');
  });

  it('serves no PDF: no public/*.pdf file exists and git tracks no .pdf file (R151)', () => {
    const publicPdfFiles = fs.existsSync(PUBLIC_DIR)
      ? fs.readdirSync(PUBLIC_DIR).filter((name) => name.toLowerCase().endsWith('.pdf'))
      : [];
    expect(publicPdfFiles).toEqual([]);

    const trackedFiles = execFileSync('git', ['ls-files'], { cwd: REPO_ROOT, encoding: 'utf8' })
      .split('\n')
      .filter((name) => name.toLowerCase().endsWith('.pdf'));
    expect(trackedFiles).toEqual([]);
  });
});

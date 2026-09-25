// Tests the three files a served page depends on (R137, R141): the resume PDF and the share
// image, both supplied by people rather than written by a builder (D2, D4), and the share-image
// source committed in this repository. A missing supplied file fails with a message naming its
// decision, never a stub or a fake file (plan Approach, "T10's test stays red and is reported").
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OG_PNG_PATH = path.join(REPO_ROOT, 'public', 'og.png');
const RESUME_PDF_PATH = path.join(REPO_ROOT, 'public', 'Muhammad_Muhibullah_Resume.pdf');
const OG_SVG_PATH = path.join(REPO_ROOT, 'docs', 'design', 'og.svg');

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

  it('serves the resume as a PDF beginning %PDF- (D2)', () => {
    if (!fs.existsSync(RESUME_PDF_PATH)) {
      throw new Error(
        'D2: public/Muhammad_Muhibullah_Resume.pdf is missing. The owner supplies this file ' +
          'after the D12 and D17 checks; a builder never creates or fakes it.',
      );
    }

    const header = fs.readFileSync(RESUME_PDF_PATH, { encoding: 'latin1', flag: 'r' }).slice(0, 5);
    expect(header).toBe('%PDF-');
  });

  it('keeps the share-image source at 1200 by 630', () => {
    const svg = fs.readFileSync(OG_SVG_PATH, 'utf8');

    expect(svg).toContain('viewBox="0 0 1200 630"');
  });
});

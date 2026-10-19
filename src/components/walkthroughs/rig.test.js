// Tests the Orion bench figure and its rig (TG-07, D5, D6): the committed drawing is the studio's
// figure scaled ten times to whole numbers, carries no provenance note, and every part the rig
// moves or rings exists in it. Reads the SVG as text; nothing is rendered.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as forbiddenCopy from '../../../scripts/forbidden-copy.mjs';
import { MOVERS, PART_IDS, SCENES, STEP_PARTS } from './orion-bench.rig.js';

const FIGURE_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), 'orion-bench.svg');
const svg = fs.readFileSync(FIGURE_PATH, 'utf8');
const idsInSvg = [...svg.matchAll(/data-part="([^"]+)"/g)].map((match) => match[1]);

describe('the committed Orion bench figure (D5)', () => {
  it('carries no metadata block and no provenance manifest', () => {
    expect(svg).not.toContain('<metadata');
    expect(svg).not.toMatch(/c2pa/i);
    expect(svg).not.toMatch(/anthropic|claude/i);
  });

  it('uses the scaled-up view box', () => {
    expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 6400 4000"/);
  });

  it('has no decimal point inside any d, points, cx, cy or r attribute', () => {
    const geometry = [...svg.matchAll(/\s(?:d|points|cx|cy|r)="([^"]*)"/g)].map((match) => match[1]);
    expect(geometry.length).toBeGreaterThan(100);
    expect(geometry.filter((value) => value.includes('.'))).toEqual([]);
  });

  it('holds none of the digits the forbidden-copy scan bans', () => {
    expect(svg).not.toContain('99.9');
    const matchers = forbiddenCopy.buildMatchers([...forbiddenCopy.FORBIDDEN_TERMS]);
    const hits = svg.split('\n').flatMap((line) => forbiddenCopy.termsFoundIn(line, matchers));
    expect(hits).toEqual([]);
  });

  it('has exactly the 35 parts the rig names, each once', () => {
    expect(PART_IDS).toHaveLength(35);
    expect([...idsInSvg].sort()).toEqual([...PART_IDS].sort());
  });
});

describe('the rig (D6)', () => {
  it('gives every ringed part and every mover a place in the figure', () => {
    for (const parts of Object.values(STEP_PARTS)) {
      for (const part of parts) expect(idsInSvg).toContain(part);
    }
    for (const mover of MOVERS) expect(idsInSvg).toContain(mover);
  });

  it('has a play scene and a still scene for each of the thirteen step ids', () => {
    const ids = Object.keys(STEP_PARTS);
    expect(ids).toHaveLength(13);
    expect(Object.keys(SCENES).sort()).toEqual([...ids].sort());
    for (const scene of Object.values(SCENES)) {
      expect(typeof scene.play).toBe('function');
      expect(typeof scene.still).toBe('function');
    }
  });
});

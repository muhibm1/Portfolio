// G2 (R128): proves the finished src/ tree, not a fixture, is clean of forbidden copy and that
// the ten section components the redesign removes are gone for good.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY_PATH = path.join(REPOSITORY_ROOT, 'scripts', 'check-forbidden-copy.mjs');
const PACKAGE_JSON_PATH = path.join(REPOSITORY_ROOT, 'package.json');

// The eight old section components, ProjectEntry (with its test) and orbDrawing.js (with its
// test): the removals the redesign deletes rather than rewrites.
const DELETED_FILES = [
  'src/components/Hero.jsx',
  'src/components/Hero.test.jsx',
  'src/components/FdePhilosophy.jsx',
  'src/components/FdePhilosophy.test.jsx',
  'src/components/CaseStudiesSection.jsx',
  'src/components/CaseStudiesSection.test.jsx',
  'src/components/InteractiveTriageSimulator.jsx',
  'src/components/InteractiveTriageSimulator.test.jsx',
  'src/components/ExperienceTimeline.jsx',
  'src/components/ExperienceTimeline.test.jsx',
  'src/components/SkillsMatrix.jsx',
  'src/components/SkillsMatrix.test.jsx',
  'src/components/ThinkingOrbHero.jsx',
  'src/components/ThinkingOrbHero.test.jsx',
  'src/components/ProjectEntry.jsx',
  'src/components/ProjectEntry.test.jsx',
  'src/components/orbDrawing.js',
  'src/components/orbDrawing.test.js',
];

describe('the src/ tree carries no forbidden copy (R128)', () => {
  it('exits 0 scanning the real src/ tree with no argument, naming at least 20 files', () => {
    const result = spawnSync(process.execPath, [ENTRY_PATH], {
      encoding: 'utf8',
      timeout: 20_000,
      cwd: REPOSITORY_ROOT,
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/Forbidden copy check passed \(R129\): (\d+) files scanned\./);
    const [, scannedCountText] = result.stdout.match(/(\d+) files scanned/);
    expect(Number(scannedCountText)).toBeGreaterThanOrEqual(20);
  });

  it('has deleted every old section component, ProjectEntry and orbDrawing, with their tests', () => {
    for (const relativePath of DELETED_FILES) {
      expect(fs.existsSync(path.join(REPOSITORY_ROOT, relativePath))).toBe(false);
    }
  });

  it('has no thinking-orbs dependency left in package.json', () => {
    const packageJsonText = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
    expect(packageJsonText).not.toContain('thinking-orbs');
  });
});

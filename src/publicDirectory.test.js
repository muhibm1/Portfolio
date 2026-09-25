// Keeps the design mockups out of the published site (R92, ADR 0012). Vite copies every file in
// public/ into dist/, and anything src/ or index.html references is bundled, so both are checked.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const THIS_TEST_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(THIS_TEST_FILE), '..');

const MOCKUP_PREFIX = 'mockup-';
const DESIGN_MOCKUPS = [
  'mockup-home.jpg',
  'mockup-casestudy.jpg',
  'mockup-maroon.jpg',
  'mockup-mmlogo.jpg',
];

describe('design mockups stay out of the published site', () => {
  it('keeps every file named mockup-* out of public/', () => {
    const mockupsInPublic = listFiles(fromRoot('public')).filter((file) =>
      path.basename(file).startsWith(MOCKUP_PREFIX),
    );

    expect(mockupsInPublic.map(toRepoPath)).toEqual([]);
  });

  it('keeps all four design mockups under docs/design/', () => {
    const missingMockups = DESIGN_MOCKUPS.filter(
      (name) => !fs.existsSync(fromRoot('docs', 'design', name)),
    );

    expect(missingMockups).toEqual([]);
  });

  it('references no mockup from src/ or index.html', () => {
    const appFiles = [...listFiles(fromRoot('src')), fromRoot('index.html')].filter(
      (file) => file !== THIS_TEST_FILE,
    );

    const filesNamingAMockup = appFiles.filter((file) =>
      fs.readFileSync(file, 'utf8').includes(MOCKUP_PREFIX),
    );

    expect(filesNamingAMockup.map(toRepoPath)).toEqual([]);
  });

  it('leaves the Vite public directory at its default in vite.config.js', () => {
    const viteConfig = fs.readFileSync(fromRoot('vite.config.js'), 'utf8');

    expect(viteConfig).not.toContain('publicDir');
  });
});

// R144, ADR 0007: the redesign handoff (the owner's plan and the seven approved mockups) is
// committed as the design record, with two passages redacted because the repository is public.
describe('the redesign handoff is committed as the design record (G21)', () => {
  const HANDOFF_DIR = fromRoot('docs', 'design', 'redesign-2026-09');
  const HANDOFF_FILES = [
    'PORTFOLIO_REDESIGN_PLAN.md',
    'CS-DataHealth.dc.html',
    'CS-Decision.dc.html',
    'CS-Integration.dc.html',
    'CS-NeuralNewsletters.dc.html',
    'CS-WorkHorse.dc.html',
    'Home-Mobile.dc.html',
    'Main.dc.html',
  ];

  // The owner keeps these figures off the public site; the redacted plan copy must not carry
  // them, and the mockups never carried them (confirmed by grep at authoring time).
  const WITHHELD_STRINGS = [
    '0.71',
    '75% fully correct',
    'over-refusal',
    'agent-minute',
    'over budget',
    'weak spot',
  ];

  it('commits the plan and all seven mockups under docs/design/redesign-2026-09/', () => {
    const missing = HANDOFF_FILES.filter((name) => !fs.existsSync(path.join(HANDOFF_DIR, name)));

    expect(missing).toEqual([]);
  });

  it('withholds the six redacted figures from every committed handoff file', () => {
    const hits = [];

    for (const name of HANDOFF_FILES) {
      const filePath = path.join(HANDOFF_DIR, name);
      if (!fs.existsSync(filePath)) continue;

      const content = fs.readFileSync(filePath, 'utf8');
      for (const withheld of WITHHELD_STRINGS) {
        if (content.includes(withheld)) hits.push(`${name}: ${withheld}`);
      }
    }

    expect(hits).toEqual([]);
  });

  it('leaves no portfolio-redesign-handoff directory at the repository root', () => {
    expect(fs.existsSync(fromRoot('portfolio-redesign-handoff'))).toBe(false);
  });

  it('keeps no .dc.html mockup under public/ or src/', () => {
    const dcFiles = [...listFiles(fromRoot('public')), ...listFiles(fromRoot('src'))].filter(
      (file) => file.endsWith('.dc.html'),
    );

    expect(dcFiles.map(toRepoPath)).toEqual([]);
  });

  it('tracks no .zip file in the repository', () => {
    const trackedFiles = execFileSync('git', ['ls-files'], { cwd: REPO_ROOT, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    const zipFiles = trackedFiles.filter((file) => file.endsWith('.zip'));

    expect(zipFiles).toEqual([]);
  });

  it('points docs/design-brief.md at the handoff folder', () => {
    const designBrief = fs.readFileSync(fromRoot('docs', 'design-brief.md'), 'utf8');

    expect(designBrief).toContain('docs/design/redesign-2026-09/');
  });
});

function fromRoot(...segments) {
  return path.join(REPO_ROOT, ...segments);
}

function toRepoPath(file) {
  return path.relative(REPO_ROOT, file).split(path.sep).join('/');
}

/** Every file under a directory, at any depth, as absolute paths. */
function listFiles(directory) {
  return fs
    .readdirSync(directory, { recursive: true })
    .map((entry) => path.join(directory, entry))
    .filter((entry) => fs.statSync(entry).isFile());
}

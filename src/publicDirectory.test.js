// Keeps the design mockups out of the published site (R92, ADR 0012). Vite copies every file in
// public/ into dist/, and anything src/ or index.html references is bundled, so both are checked.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { TIMING_FIGURE_TERM } from '../scripts/forbidden-copy.mjs';

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

// R144, R157, ADR 0007: the redesign handoff (the owner's plan, the redacted overlay and the
// seven approved mockups) is committed as the design record, with the owner's tool timings, the
// resume text and the private repository notes withheld because the repository is public.
describe('the redesign handoff is committed as the design record (G21)', () => {
  const HANDOFF_DIR = fromRoot('docs', 'design', 'redesign-2026-09');
  const PLAN_FILE = 'PORTFOLIO_REDESIGN_PLAN.md';
  const OVERLAY_FILE = 'PORTFOLIO_ALIGNMENT_PASS.md';
  const WORKHORSE_MOCKUP = 'CS-WorkHorse.dc.html';
  const HANDOFF_FILES = [
    PLAN_FILE,
    OVERLAY_FILE,
    'CS-DataHealth.dc.html',
    'CS-Decision.dc.html',
    'CS-Integration.dc.html',
    'CS-NeuralNewsletters.dc.html',
    WORKHORSE_MOCKUP,
    'Home-Mobile.dc.html',
    'Main.dc.html',
  ];

  // The owner keeps these figures off the public site; the redacted plan copy, the redacted
  // overlay and the mockups must not carry them (confirmed by grep at authoring time).
  const WITHHELD_STRINGS = [
    '0.71',
    '75% fully correct',
    'over-refusal',
    'agent-minute',
    'over budget',
    'weak spot',
    'half the latency',
    'faster from a smaller rerank pool',
    '2× faster',
  ];

  function readHandoffFile(name) {
    return fs.readFileSync(path.join(HANDOFF_DIR, name), 'utf8');
  }

  it('commits the plan, the overlay and all seven mockups under docs/design/redesign-2026-09/', () => {
    const missing = HANDOFF_FILES.filter((name) => !fs.existsSync(path.join(HANDOFF_DIR, name)));

    expect(missing).toEqual([]);
  });

  it('withholds the nine redacted figures from every committed handoff file', () => {
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

  it('matches the R156 timing pattern nowhere in the nine files, except the two scripted lines it excepts', () => {
    const hits = [];

    for (const name of HANDOFF_FILES) {
      const filePath = path.join(HANDOFF_DIR, name);
      if (!fs.existsSync(filePath)) continue;

      const lines = fs.readFileSync(filePath, 'utf8').split('\n');
      lines.forEach((line, index) => {
        if (line.includes('sub-10ms') || line.includes('48 ms')) return;
        if (TIMING_FIGURE_TERM.pattern.test(line)) hits.push(`${name}:${index + 1}`);
      });
    }

    expect(hits).toEqual([]);
  });

  it('carries the overlay\'s three withheld notes and no "resume, verbatim" heading', () => {
    const overlay = readHandoffFile(OVERLAY_FILE);

    expect(overlay).not.toMatch(/resume, verbatim/i);
    for (const heading of ['## Appendix A', '## Appendix B', '## 7. Owner action before the links go live']) {
      const headingIndex = overlay.indexOf(heading);
      expect(headingIndex, `expected to find heading ${heading}`).not.toBe(-1);
      const followingText = overlay.slice(headingIndex, headingIndex + 400);
      expect(followingText).toContain('Withheld from the committed copy');
    }
  });

  it('says "withheld" in the plan\'s Studbook row, its search paragraph and the WorkHorse mockup', () => {
    const plan = readHandoffFile(PLAN_FILE);
    const planLines = plan.split('\n');
    const studbookRow = planLines.find((line) => line.startsWith('| Studbook |'));
    const searchParagraph = planLines.find((line) => line.startsWith('After removal, search the whole repo'));

    expect(studbookRow, 'expected the plan copy Studbook row').toBeDefined();
    expect(studbookRow.toLowerCase()).toContain('withheld');
    expect(searchParagraph, 'expected the section 1 search paragraph').toBeDefined();
    expect(searchParagraph.toLowerCase()).toContain('withheld');
    expect(readHandoffFile(WORKHORSE_MOCKUP).toLowerCase()).toContain('withheld');
  });

  it('redacts the line 44 parenthetical without leaving either of its phrases behind (D54)', () => {
    const plan = readHandoffFile(PLAN_FILE);

    expect(plan).not.toContain('that run is described as');
    expect(plan).not.toContain('case study is also a failure');
  });

  it('keeps the run tallies in the plan copy and the overlay, since only the timings are withheld (D45)', () => {
    const plan = readHandoffFile(PLAN_FILE);
    const overlay = readHandoffFile(OVERLAY_FILE);

    expect(plan).toContain('4 of 4 real changes merged');
    expect(overlay).toContain('5 of 5');
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

  it('tracks no .zip or .pdf file in the repository', () => {
    const trackedFiles = execFileSync('git', ['ls-files'], { cwd: REPO_ROOT, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    const bannedFiles = trackedFiles.filter((file) => file.endsWith('.zip') || file.endsWith('.pdf'));

    expect(bannedFiles).toEqual([]);
  });

  it('points docs/design-brief.md at the handoff folder and names both documents', () => {
    const designBrief = fs.readFileSync(fromRoot('docs', 'design-brief.md'), 'utf8');

    expect(designBrief).toContain('docs/design/redesign-2026-09/');
    expect(designBrief).toContain(PLAN_FILE);
    expect(designBrief).toContain(OVERLAY_FILE);
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

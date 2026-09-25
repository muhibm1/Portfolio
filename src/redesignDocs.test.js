// Proves G22 (R145) from evals.md: the docs, the profile and hosted-config.md were brought in
// step with the redesign. In the style of src/nodePinDocsAndProfile.test.js: no import of the
// files under test, only their text content asserted against the requirement. This guards
// against a later change reverting CLAUDE.md to the pre-redesign architecture, dropping one of
// the six new paths R145 adds to the profile's sensitive_paths and tier_floor_paths 2 list, or
// letting hosted-config.md, codebase-map.md, constraints.md or the four prior ADR status lines
// drift back out of step, without npm test or CI noticing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// The six paths R145 names: scripts/prerender.mjs decides what every route writes at build time;
// forbidden-copy.mjs and check-forbidden-copy.mjs are the R129 copy scanner and its CI check;
// src/pageMeta.js and src/entry-server.jsx decide the markup and tags of every served page; and
// scripts/check-test-floor.mjs is the blocking CI script this task's own steps edit.
const NEW_SENSITIVE_PATHS = [
  'scripts/prerender.mjs',
  'scripts/forbidden-copy.mjs',
  'scripts/check-forbidden-copy.mjs',
  'src/pageMeta.js',
  'src/entry-server.jsx',
  'scripts/check-test-floor.mjs',
];

const FOUR_PRIOR_ADRS = [
  'docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/adr/0007-self-host-the-typefaces-with-fontsource-and-wire-them-into-the-tailwind-theme.md',
  'docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/adr/0008-replace-the-case-study-modal-with-a-page-and-keep-the-resume-as-a-modal.md',
  'docs/sdlc/2026-09-21-serve-every-app-route-with-http-200-on-github-pa/adr/0001-write-a-directory-index-html-copy-for-every-defined-route-and-keep-404-html-for-the-rest.md',
  'docs/sdlc/2026-09-21-serve-every-app-route-with-http-200-on-github-pa/adr/0003-assert-200-on-the-deep-link-after-following-redirects-and-404-on-an-unknown-path.md',
];

function read(relativePath) {
  return fs.readFileSync(path.join(REPOSITORY_ROOT, relativePath), 'utf8');
}

// Strips the "## Mistakes to avoid" section (a retro log that legitimately names old, removed
// things by their old name) so the stale-phrase checks below read only the prose that describes
// the site as it stands today.
function withoutMistakesToAvoid(text) {
  const headingStart = text.indexOf('## Mistakes to avoid');
  if (headingStart === -1) return text;
  const afterHeading = headingStart + '## Mistakes to avoid'.length;
  const nextHeading = text.slice(afterHeading).search(/\n## /);
  const sectionEnd = nextHeading === -1 ? text.length : afterHeading + nextHeading;
  return text.slice(0, headingStart) + text.slice(sectionEnd);
}

describe('G22: CLAUDE.md describes the redesigned site', () => {
  const claudeMd = read('CLAUDE.md');
  const currentProse = withoutMistakesToAvoid(claudeMd);

  it('no longer says the app renders eight sections', () => {
    expect(currentProse).not.toContain('eight sections');
  });

  it('no longer names Google Fonts as an outbound call', () => {
    expect(currentProse).not.toContain('Google Fonts');
  });

  it('no longer mentions the orb', () => {
    expect(currentProse).not.toMatch(/\borb\b/i);
  });

  it('names each of the six new ask-first paths', () => {
    for (const newPath of NEW_SENSITIVE_PATHS) {
      expect(claudeMd).toContain(newPath);
    }
  });
});

describe('G22: the profile guards the six new redesign paths (R145)', () => {
  const profileText = read('.workhorse/profile.yml');

  it('sensitive_paths quotes each new path with a trailing "#" comment', () => {
    const lines = profileText.split('\n');
    for (const newPath of NEW_SENSITIVE_PATHS) {
      const quoted = `"${newPath}"`;
      const line = lines.find((candidate) => candidate.includes(quoted));
      expect(line, `expected a sensitive_paths line for ${newPath}`).toBeDefined();
      expect(line).toContain('#');
    }
  });

  it('tier_floor_paths "2: [" line lists each new path', () => {
    const tierTwoLine = profileText.split('\n').find((line) => line.trim().startsWith('2: ['));
    expect(tierTwoLine).toBeDefined();
    for (const newPath of NEW_SENSITIVE_PATHS) {
      expect(tierTwoLine).toContain(newPath);
    }
  });

  it('retention_notes names the published resume PDF and the served email (D17)', () => {
    expect(profileText).toContain('D17');
    expect(profileText.toLowerCase()).toContain('resume');
    expect(profileText.toLowerCase()).toContain('pdf');
  });
});

describe('G22: docs/hosted-config.md checks the new pages instead of the orb', () => {
  const hostedConfig = read('docs/hosted-config.md');

  it('section 6 contains "Open menu" and "og.png"', () => {
    const sectionStart = hostedConfig.indexOf('## 6.');
    const sectionEnd = hostedConfig.indexOf('\n## ', sectionStart + 1);
    const section6 = hostedConfig.slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd);
    expect(section6).toContain('Open menu');
    expect(section6).toContain('og.png');
  });

  it('lists the PDF as published personal data with the D17 check', () => {
    expect(hostedConfig).toContain('D17');
    expect(hostedConfig.toLowerCase()).toContain('resume');
    expect(hostedConfig.toLowerCase()).toContain('pdf');
  });
});

describe('G22: docs/sdlc/codebase-map.md gains a dated block for this change', () => {
  it('contains 2026-09-25', () => {
    expect(read('docs/sdlc/codebase-map.md')).toContain('2026-09-25');
  });
});

describe('G22: docs/sdlc/constraints.md closes open question 2', () => {
  it('question 2 is marked answered', () => {
    const constraints = read('docs/sdlc/constraints.md');
    const lines = constraints.split('\n');
    const questionIndex = lines.findIndex((line) =>
      /^2\.\s+Should the simulator/.test(line.trim()),
    );
    expect(questionIndex, 'expected to find open question 2').not.toBe(-1);
    // The answer follows the question, in the style already used for question 3 two lines below
    // ("**Answered at G1 ...**"), on the question's own line or a line immediately after it
    // (a wrapped continuation, as question 3's answer is).
    const questionAndAnswer = lines.slice(questionIndex, questionIndex + 4).join('\n');
    expect(questionAndAnswer).toMatch(/\*\*Answered/);
  });
});

describe('G22: the four prior ADR status lines cite this change', () => {
  for (const adrPath of FOUR_PRIOR_ADRS) {
    it(`${adrPath} status line contains 2026-09-25`, () => {
      const adrText = read(adrPath);
      const statusLine = adrText.split('\n').find((line) => line.startsWith('Status:'));
      expect(statusLine, `expected a Status: line in ${adrPath}`).toBeDefined();
      expect(statusLine).toContain('2026-09-25');
    });
  }
});

// Proves GC113 (R111) and GC116 (R112) from evals.md by reading the same four documents the
// verifier commands read, in the style of src/checkBuiltCssFonts.test.js: no import of the
// files under test, only their text content asserted against the requirement. This guards
// against a later change reverting CLAUDE.md or docs/sdlc/codebase-map.md to the stale
// diagnosis, or dropping .npmrc, .nvmrc or scripts/check-npmrc.mjs from the profile's guarded
// paths, without npm test or CI noticing.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return fs.readFileSync(path.join(REPOSITORY_ROOT, relativePath), 'utf8');
}

describe('GC113: the four R111 documents state the Node floor and drop the stale diagnosis', () => {
  it('CLAUDE.md and the profile each mention the 22.12 floor', () => {
    expect(read('CLAUDE.md')).toContain('22.12');
    expect(read('.workhorse/profile.yml')).toContain('22.12');
  });

  it('CLAUDE.md no longer blames npm issue 4828', () => {
    expect(read('CLAUDE.md')).not.toContain('4828');
  });

  it('the two discovery documents no longer name v21.7.3 as the host Node', () => {
    expect(read('docs/sdlc/codebase-map.md')).not.toContain('v21.7.3');
    expect(read('docs/sdlc/constraints.md')).not.toContain('v21.7.3');
  });

  it('constraints.md no longer says .gitignore has no .env pattern', () => {
    expect(read('docs/sdlc/constraints.md').toLowerCase()).not.toContain('no .env. pattern');
  });
});

describe('GC116: the profile guards .npmrc, .nvmrc and the guard script', () => {
  const profileText = read('.workhorse/profile.yml');

  it('sensitive_paths lists .npmrc, .nvmrc and scripts/check-npmrc.mjs', () => {
    expect(profileText).toContain('".npmrc"');
    expect(profileText).toContain('".nvmrc"');
    expect(profileText).toContain('"scripts/check-npmrc.mjs"');
  });

  it('tier_floor_paths 2 includes scripts/check-npmrc.mjs', () => {
    const tierTwoLine = profileText
      .split('\n')
      .find((line) => line.trim().startsWith('2: ['));

    expect(tierTwoLine).toBeDefined();
    expect(tierTwoLine).toContain('scripts/check-npmrc.mjs');
  });

  it('each of the three sensitive_paths entries carries a trailing comment naming why', () => {
    const lines = profileText.split('\n');
    for (const entry of ['".npmrc"', '".nvmrc"', '"scripts/check-npmrc.mjs"']) {
      const line = lines.find((candidate) => candidate.includes(entry));
      expect(line).toBeDefined();
      expect(line).toContain('#');
    }
  });
});

// GC117 (R115) proves the folded change touched sensitive_paths only, leaving protected_paths,
// deny_commands and ask_commands byte-identical to main. A test inside this suite cannot diff
// against main reliably (it has no guaranteed access to that ref, and the branch may be rebased
// or squashed by the time the test runs), so that comparison is left to the verifier's
// `git diff main...HEAD -- .workhorse/profile.yml` command. What this suite asserts instead,
// positively, is that the control keys the diff must preserve are still present with the
// entries they carry today, so a change that deletes a key outright still fails here even
// before a diff runs.
describe('GC117 (partial): the profile still carries its control keys with today\'s entries', () => {
  const profileText = read('.workhorse/profile.yml');

  it('protected_paths still denies pem, key and env files', () => {
    expect(profileText).toContain('protected_paths:');
    expect(profileText).toContain('"**/*.pem"');
    expect(profileText).toContain('"**/*.key"');
    expect(profileText).toContain('".env*"');
  });

  it('deny_commands still blocks force pushes, npm publish and repo deletion', () => {
    expect(profileText).toContain('deny_commands:');
    expect(profileText).toContain('git push --force');
    expect(profileText).toContain('git push -f');
    expect(profileText).toContain('npm publish');
    expect(profileText).toContain('gh repo delete');
  });

  it('ask_commands still gates pushes, installs and workflow runs', () => {
    expect(profileText).toContain('ask_commands:');
    expect(profileText).toContain('git push');
    expect(profileText).toContain('npm install');
    expect(profileText).toContain('npm uninstall');
    expect(profileText).toContain('npx ');
    expect(profileText).toContain('gh workflow run');
    expect(profileText).toContain('gh release');
  });
});

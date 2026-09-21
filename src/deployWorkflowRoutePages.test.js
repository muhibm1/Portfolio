// Proves R120 to R123 (GC9, GC10, GC11, GC12, AD2, AD3 from evals.md) by reading
// .github/workflows/deploy.yml, .workhorse/profile.yml and CLAUDE.md as text, in the style of
// src/deployWorkflowNodeVersion.test.js: no YAML parser, the workflow is normalised to LF and
// read line by line, and a step's body is isolated by finding its `- name:` line and every line
// up to the next one.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowPath = path.join(repositoryRoot, '.github/workflows/deploy.yml');
const checkRoutePagesScriptPath = path.join(repositoryRoot, 'scripts/check-route-pages.mjs');

function readWorkflowLines() {
  const text = fs.readFileSync(workflowPath, 'utf8').replace(/\r\n/g, '\n');
  return text.split('\n');
}

function read(relativePath) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

// Every `- name:` line in the workflow, in order, so a case can find where one step's body ends.
function stepNameLines(lines) {
  return lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line.startsWith('- name:'))
    .map(({ line, index }) => ({ name: line.replace(/^- name:\s*"?|"$/g, ''), index }));
}

// The lines of one named step, from its `- name:` line up to (not including) the next one, or
// the end of the file.
function stepBody(lines, stepName) {
  const steps = stepNameLines(lines);
  const start = steps.find(({ name }) => name === stepName);
  if (!start) return undefined;
  const next = steps.find(({ index }) => index > start.index);
  const end = next ? next.index : lines.length;
  return lines.slice(start.index, end);
}

describe('GC9: the route-page check runs in the build job before upload', () => {
  it('runs exactly once, after the build and before the artifact upload', () => {
    const lines = readWorkflowLines();

    const checkLineIndexes = lines
      .map((line, index) => ({ line: line.trim(), index }))
      .filter(({ line }) => line === 'run: "node scripts/check-route-pages.mjs"')
      .map(({ index }) => index);
    expect(checkLineIndexes).toHaveLength(1);

    const buildIndex = lines.findIndex((line) => line.trim() === 'run: "npm run build"');
    const uploadIndex = lines.findIndex((line) => line.includes('actions/upload-pages-artifact'));

    expect(buildIndex).toBeGreaterThan(-1);
    expect(uploadIndex).toBeGreaterThan(-1);
    expect(checkLineIndexes[0]).toBeGreaterThan(buildIndex);
    expect(checkLineIndexes[0]).toBeLessThan(uploadIndex);
    expect(fs.existsSync(checkRoutePagesScriptPath)).toBe(true);
  });
});

describe('GC10: the deep-link fetch follows redirects and asserts 200 against the root body', () => {
  it('the smoke step names the deep link, follows two redirects and compares digests', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Smoke R121 and R122: a deep link answers 200 with the root body; an unknown path answers 404');
    expect(body).toBeDefined();
    const text = body.join('\n');

    expect(text).toContain('work/apple-llm-triage');
    expect(text).toContain('-L');
    expect(text).toContain('--max-redirs 2');
    expect(text).toContain('%{num_redirects}');
    expect(text).toContain('%{url_effective}');
    expect(text).toMatch(/=\s*"200"|==\s*"200"/);
    expect((text.match(/sha256sum/g) || []).length).toBeGreaterThanOrEqual(2);

    expect(readWorkflowLines().some((line) => line.includes('Smoke R81'))).toBe(false);
    expect(text).not.toContain('(not asserted)');
  });

  it('refuses a downgrade to plain HTTP on the initial request or a redirect hop (M2)', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Smoke R121 and R122: a deep link answers 200 with the root body; an unknown path answers 404');
    expect(body).toBeDefined();
    const text = body.join('\n');

    expect(text).toContain("--proto '=https'");
    expect(text).toContain("--proto-redir '=https'");
  });

  it('fails unless the effective URL still starts with ROOT_URL (M2)', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Smoke R121 and R122: a deep link answers 200 with the root body; an unknown path answers 404');
    expect(body).toBeDefined();
    const text = body.join('\n');

    expect(text).toContain('deep_link_effective_url');
    expect(text).toMatch(/"\$\{ROOT_URL\}"\*\)/);
    expect(text).toContain('::error::R121 failed: effective URL');
    expect(text).toContain('does not start with $ROOT_URL');
  });

  it('asserts the root smoke file and each fetched body are non-empty before comparing digests (M2)', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Smoke R121 and R122: a deep link answers 200 with the root body; an unknown path answers 404');
    expect(body).toBeDefined();
    const text = body.join('\n');

    expect(text).toContain('[ ! -s smoke/root.html ]');
    expect(text).toContain('[ ! -s smoke/deep-link.html ]');
    expect(text).toContain('[ ! -s smoke/unknown.html ]');
  });
});

describe('GC11: the unknown-path fetch asserts 404 against the root body without following redirects', () => {
  it('the smoke step names the unknown path, asserts 404 and compares digests, with no -L on that fetch', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Smoke R121 and R122: a deep link answers 200 with the root body; an unknown path answers 404');
    expect(body).toBeDefined();

    const unknownPathLineIndex = body.findIndex((line) => line.includes('no-such-page'));
    expect(unknownPathLineIndex).toBeGreaterThan(-1);
    expect(body[unknownPathLineIndex]).not.toContain('-L');

    const text = body.join('\n');
    expect(text).toMatch(/=\s*"404"|==\s*"404"/);
    expect((text.match(/sha256sum/g) || []).length).toBeGreaterThanOrEqual(2);
  });
});

describe('AD2: the route-page check step adds no permission and no action', () => {
  it('the R120 step body has no uses:, no permissions: and no with:, and the file-wide pins hold', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Every app route has a page (R119)');
    expect(body).toBeDefined();
    const text = body.join('\n');

    expect(text).not.toContain('uses:');
    expect(text).not.toContain('permissions:');
    expect(text).not.toContain('with:');

    const writeLines = lines.filter((line) => line.trim().endsWith(': write'));
    expect(writeLines).toHaveLength(2);

    const permissionsIndexes = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => /^\s*permissions:/.test(line))
      .map(({ index }) => index);
    expect(permissionsIndexes).toHaveLength(3);
  });
});

describe('AD3: the smoke step never disables TLS verification and never leaves the deploy origin', () => {
  it('has no -k, no --insecure, no http:// literal, and every curl URL argument starts with "${ROOT_URL}', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Smoke R121 and R122: a deep link answers 200 with the root body; an unknown path answers 404');
    expect(body).toBeDefined();
    const text = body.join('\n');

    expect(text).not.toMatch(/(^|\s)-k(\s|$)/);
    expect(text).not.toContain('--insecure');
    expect(text).not.toContain('http://');

    const curlLines = body.filter((line) => line.includes('curl '));
    expect(curlLines.length).toBeGreaterThan(0);
    for (const curlLine of curlLines) {
      const urlMatch = curlLine.match(/"(\$\{ROOT_URL\}[^"]*)"/);
      expect(urlMatch).not.toBeNull();
    }
  });
});

describe('GC12: the profile and CLAUDE.md guard the route-page scripts', () => {
  const profileText = read('.workhorse/profile.yml');
  const claudeText = read('CLAUDE.md');

  it('sensitive_paths lists both scripts, each with a trailing comment', () => {
    for (const entry of ['"scripts/route-pages.mjs"', '"scripts/check-route-pages.mjs"']) {
      const line = profileText.split('\n').find((candidate) => candidate.includes(entry));
      expect(line).toBeDefined();
      expect(line).toContain('#');
    }
  });

  it('tier_floor_paths 2 includes both scripts', () => {
    const tierTwoLine = profileText.split('\n').find((line) => line.trim().startsWith('2: ['));
    expect(tierTwoLine).toBeDefined();
    expect(tierTwoLine).toContain('scripts/route-pages.mjs');
    expect(tierTwoLine).toContain('scripts/check-route-pages.mjs');
  });

  it('CLAUDE.md "Ask first" names both scripts', () => {
    expect(claudeText).toContain('scripts/route-pages.mjs');
    expect(claudeText).toContain('scripts/check-route-pages.mjs');
  });
});

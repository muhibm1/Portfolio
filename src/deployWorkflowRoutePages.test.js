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

describe('GC10: the deep-link fetch follows redirects and asserts 200 against its own canonical marker', () => {
  it('the smoke step names the deep link, follows two redirects and greps the canonical link (D14, D15)', () => {
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
    expect(text).toContain('rel="canonical"');
    expect(text).toContain('work/apple-llm-triage/');
    expect(text).not.toContain('root_digest');

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

  it('asserts the root smoke file and each fetched body are non-empty before checking their markers (M2)', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Smoke R121 and R122: a deep link answers 200 with the root body; an unknown path answers 404');
    expect(body).toBeDefined();
    const text = body.join('\n');

    expect(text).toContain('[ ! -s smoke/root.html ]');
    expect(text).toContain('[ ! -s smoke/deep-link.html ]');
    expect(text).toContain('[ ! -s smoke/unknown.html ]');
  });
});

describe('GC11: the unknown-path fetch asserts 404 against its own not-found markers without following redirects', () => {
  it('the smoke step names the unknown path, asserts 404 and greps the not-found text and noindex, with no -L on that fetch (D14, D15)', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Smoke R121 and R122: a deep link answers 200 with the root body; an unknown path answers 404');
    expect(body).toBeDefined();

    const unknownPathLineIndex = body.findIndex((line) => line.includes('no-such-page'));
    expect(unknownPathLineIndex).toBeGreaterThan(-1);
    expect(body[unknownPathLineIndex]).not.toContain('-L');

    const text = body.join('\n');
    expect(text).toMatch(/=\s*"404"|==\s*"404"/);
    expect(text).toContain('Page not found');
    expect(text).toContain('noindex');
    expect(text).not.toContain('unknown_digest');
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

describe('G20: the deploy workflow pins the redesign packages, scans copy and asserts per-page markers (R143)', () => {
  it('the pin list names the three fontsource packages, react and react-dom, and not inter or jetbrains-mono (D19)', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Dependency pin check (R85) and .npmrc allowlist (R113)');
    expect(body).toBeDefined();
    const text = body.join('\n');

    for (const packageName of ['@fontsource/ibm-plex-sans', '@fontsource/ibm-plex-mono', '@fontsource/space-grotesk', 'react-router', '"react"', '"react-dom"']) {
      expect(text).toContain(packageName);
    }
    expect(text).not.toContain('@fontsource/inter');
    expect(text).not.toContain('@fontsource/jetbrains-mono');
  });

  it('runs the forbidden-copy scanner on dist exactly once, after the route-page check and before upload', () => {
    const lines = readWorkflowLines();

    const scanLineIndexes = lines
      .map((line, index) => ({ line: line.trim(), index }))
      .filter(({ line }) => line === 'run: "node scripts/check-forbidden-copy.mjs dist"')
      .map(({ index }) => index);
    expect(scanLineIndexes).toHaveLength(1);

    const routePageCheckIndex = lines.findIndex((line) => line.trim() === 'run: "node scripts/check-route-pages.mjs"');
    const uploadIndex = lines.findIndex((line) => line.includes('actions/upload-pages-artifact'));

    expect(routePageCheckIndex).toBeGreaterThan(-1);
    expect(uploadIndex).toBeGreaterThan(-1);
    expect(scanLineIndexes[0]).toBeGreaterThan(routePageCheckIndex);
    expect(scanLineIndexes[0]).toBeLessThan(uploadIndex);
  });

  it('the R80 asset_refs line reads only script src, stylesheet, icon and modulepreload tags, not every src or href (D14)', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Smoke R80: asset paths, the script, the stylesheet and one font');
    expect(body).toBeDefined();
    const text = body.join('\n');

    expect(text).toContain('<script[^>]*src=');
    expect(text).toContain('rel="(stylesheet|icon|modulepreload)"');
    expect(text).not.toContain('(src|href)=(\\"[^\\"]*\\"|\'[^\']*\')');
    expect(text).toMatch(/D14/);
  });

  it('the deep-link step asserts 200 and greps the canonical link for work/apple-llm-triage/, no longer comparing digests', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Smoke R121 and R122: a deep link answers 200 with the root body; an unknown path answers 404');
    expect(body).toBeDefined();
    const text = body.join('\n');

    expect(text).toMatch(/=\s*"200"|==\s*"200"/);
    expect(text).toContain('rel="canonical"');
    expect(text).toContain('work/apple-llm-triage/');
    expect(text).not.toContain('root_digest');
    expect(text).not.toContain('deep_link_digest');
  });

  it('the unknown-path step asserts 404 and greps "Page not found" and noindex', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Smoke R121 and R122: a deep link answers 200 with the root body; an unknown path answers 404');
    expect(body).toBeDefined();
    const text = body.join('\n');

    expect(text).toMatch(/=\s*"404"|==\s*"404"/);
    expect(text).toContain('Page not found');
    expect(text).toContain('noindex');
    expect(text).not.toContain('unknown_digest');
  });

  it('the R82 expect_count block runs against the root, the deep-link body and the 404 body, with the root and module lines unchanged (D15)', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Smoke R82: the served HTML keeps its CSP, referrer policy and privacy removals');
    expect(body).toBeDefined();
    const text = body.join('\n');

    // The root and module expect_count calls are byte-identical to the pre-redesign step.
    expect(text).toContain('expect_count "exactly one Content-Security-Policy meta tag" 1 "$(count_matches \'http-equiv="Content-Security-Policy"\' smoke/root.html)" "$ROOT_URL"');
    expect(text).toContain('expect_count "no phone number in the module script" 0 "$(count_matches "$phone_pattern" smoke/module.js)" "$MODULE_URL"');

    // The same five counts run again against the deep-link body and the 404 body (D15), driven
    // by a loop that names both smoke files and both URLs so each check runs against each file.
    expect(text).toContain('smoke/deep-link.html');
    expect(text).toContain('smoke/unknown.html');
    expect(text).toContain('${ROOT_URL}work/apple-llm-triage');
    expect(text).toContain('${ROOT_URL}no-such-page');
    const cspMatches = text.match(/Content-Security-Policy meta tag/g) || [];
    const referrerMatches = text.match(/name=\\?"referrer\\?" meta tag/g) || [];
    const inlineScriptMatches = text.match(/inline script without a src attribute/g) || [];
    const googleapisMatches = text.match(/fonts\.googleapis\.com reference/g) || [];
    const gstaticMatches = text.match(/fonts\.gstatic\.com reference/g) || [];
    // One literal line for the root (unchanged) plus one templated line the loop runs for both
    // the deep-link body and the 404 body.
    expect(cspMatches.length).toBe(2);
    expect(referrerMatches.length).toBe(2);
    expect(inlineScriptMatches.length).toBe(2);
    expect(googleapisMatches.length).toBe(2);
    expect(gstaticMatches.length).toBe(2);
  });

  it('a step fetches the share image, asserting 200 and a matching content type, and names no PDF (R151)', () => {
    const lines = readWorkflowLines();
    const body = stepBody(lines, 'Smoke R143: the share image is served');
    expect(body).toBeDefined();
    const text = body.join('\n');

    expect(text).toContain('og.png');
    expect(text).toMatch(/=\s*"200"|==\s*"200"/);
    expect(text).toContain("'png'");
    expect(text).not.toContain('.pdf');
    expect(text).not.toContain("'pdf'");
  });

  it('runs no resume PDF check anywhere in the workflow (R151)', () => {
    const lines = readWorkflowLines();

    const checkLineIndexes = lines
      .map((line) => line.trim())
      .filter((line) => line === 'run: "node scripts/check-resume-pdf.mjs"');
    expect(checkLineIndexes).toHaveLength(0);

    const steps = stepNameLines(lines);
    expect(steps.some(({ name }) => name.includes('Resume PDF'))).toBe(false);
  });

  it('the three permissions: blocks are unchanged', () => {
    const lines = readWorkflowLines();

    const permissionsIndexes = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => /^\s*permissions:/.test(line))
      .map(({ index }) => index);
    expect(permissionsIndexes).toHaveLength(3);

    const [workflowIndex, buildIndex, deployIndex] = permissionsIndexes;
    expect(lines[workflowIndex + 1].trim()).toBe('contents: read');
    expect(lines[buildIndex + 1].trim()).toBe('contents: read');
    expect(lines[buildIndex + 2].trim()).toBe('pages: read');
    expect(lines[deployIndex + 1].trim()).toBe('pages: write');
    expect(lines[deployIndex + 2].trim()).toBe('id-token: write');
  });
});

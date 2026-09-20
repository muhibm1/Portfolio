// Reads .github/workflows/deploy.yml as text and checks the lines that decide which Node the
// publishing workflow runs (R110), that the .npmrc allowlist guard runs before npm ci (R113),
// and that the workflow's permission blocks are unchanged (R114). No YAML parser: the workflow
// is read as text and normalised to LF, the same approach scripts/check-npmrc.mjs and
// scripts/check-built-css-fonts.mjs use for their own fixtures.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflowPath = path.join(repositoryRoot, '.github/workflows/deploy.yml');
const checkNpmrcScriptPath = path.join(repositoryRoot, 'scripts/check-npmrc.mjs');

function readWorkflowLines() {
  const text = fs.readFileSync(workflowPath, 'utf8').replace(/\r\n/g, '\n');
  return text.split('\n');
}

// Every `- name:` line in the workflow, in order, so a case can find which step a later line
// belongs to.
function stepNameLines(lines) {
  return lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line.startsWith('- name:'))
    .map(({ line, index }) => ({ name: line.replace(/^- name:\s*/, ''), index }));
}

function stepNameBefore(lines, lineIndex) {
  return [...stepNameLines(lines)].reverse().find(({ index }) => index < lineIndex);
}

describe('deploy workflow Node version and guard step', () => {
  it('the setup-node step reads the Node version from .nvmrc and keeps the npm cache', () => {
    const lines = readWorkflowLines();

    const nodeVersionFileLines = lines.filter((line) => /^\s*node-version-file:\s*\.nvmrc\s*$/.test(line));
    const cacheLines = lines.filter((line) => /^\s*cache:\s*npm\s*$/.test(line));

    expect(nodeVersionFileLines).toHaveLength(1);
    expect(cacheLines.length).toBeGreaterThanOrEqual(1);
  });

  it('the workflow sets no node-version input that would override the file', () => {
    const lines = readWorkflowLines();

    const nodeVersionLines = lines.filter((line) => /^\s*node-version:/.test(line));

    expect(nodeVersionLines).toHaveLength(0);
  });

  it('the file the workflow names exists at the repository root', () => {
    const lines = readWorkflowLines();
    const nodeVersionFileLine = lines.find((line) => /^\s*node-version-file:\s*\.nvmrc\s*$/.test(line));
    const nvmrcName = nodeVersionFileLine.trim().split(':')[1].trim();
    const nvmrcPath = path.join(repositoryRoot, nvmrcName);

    const stats = fs.statSync(nvmrcPath);

    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBeGreaterThan(0);
  });

  it('the pre-install guard step runs the npmrc allowlist before npm ci', () => {
    const lines = readWorkflowLines();

    const guardLineIndexes = lines
      .map((line, index) => ({ line: line.trim(), index }))
      .filter(({ line }) => line === 'node scripts/check-npmrc.mjs')
      .map(({ index }) => index);
    const npmCiIndex = lines.findIndex((line) => line.trim() === 'run: "npm ci"');

    expect(guardLineIndexes).toHaveLength(1);
    const [guardLineIndex] = guardLineIndexes;
    const precedingName = stepNameBefore(lines, guardLineIndex);

    expect(precedingName?.name).toBe('Dependency pin check (R85) and .npmrc allowlist (R113)');
    expect(npmCiIndex).toBeGreaterThan(-1);
    expect(guardLineIndex).toBeLessThan(npmCiIndex);
    expect(fs.existsSync(checkNpmrcScriptPath)).toBe(true);
  });

  it('the permission blocks and persist-credentials are unchanged, and the only write scopes are the deploy job\'s two', () => {
    const lines = readWorkflowLines();

    const permissionsIndexes = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => /^\s*permissions:/.test(line))
      .map(({ index }) => index);
    expect(permissionsIndexes).toHaveLength(3);

    const [workflowIndex, buildIndex, deployIndex] = permissionsIndexes;

    expect(lines[workflowIndex + 1].trim()).toBe('contents: read');
    const afterWorkflowScope = lines[workflowIndex + 2].trim();
    expect(afterWorkflowScope === '' || !afterWorkflowScope.includes(':')).toBe(true);

    expect(lines[buildIndex + 1].trim()).toBe('contents: read');
    expect(lines[buildIndex + 2].trim()).toBe('pages: read');

    expect(lines[deployIndex + 1].trim()).toBe('pages: write');
    expect(lines[deployIndex + 2].trim()).toBe('id-token: write');

    const writeLines = lines.filter((line) => line.trim().endsWith(': write'));
    expect(writeLines).toHaveLength(2);

    const persistCredentialsIndexes = lines
      .map((line, index) => ({ line: line.trim(), index }))
      .filter(({ line }) => line === 'persist-credentials: false')
      .map(({ index }) => index);
    expect(persistCredentialsIndexes).toHaveLength(1);

    const precedingName = stepNameBefore(lines, persistCredentialsIndexes[0]);
    expect(precedingName?.name).toBe('Check out the repository');
  });
});

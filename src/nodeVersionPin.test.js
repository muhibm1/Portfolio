// Proves the Node 22.12 floor (R105 to R109): the repository's own .nvmrc, package.json/lockfile
// engines and .npmrc are read directly, and a set of fixture npm ci spawns prove what npm actually
// does with those settings, both with and without the file, and under npm's own config precedence
// (an environment variable, a user-level .npmrc). Fixtures live in os.tmpdir() and are removed in
// afterEach; the spawn helper follows spec Interfaces (f) so a stray npm_config_* variable from
// `npm test` itself never contaminates a "no .npmrc" case.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPAWN_TIMEOUT_MS = 20_000;

function readNormalized(filePath) {
  return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
}

function npmrcNonCommentLines(content) {
  return content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#') && !line.startsWith(';'));
}

// Strips every npm_config_* key so a fixture that holds no .npmrc is not silently governed by the
// engine-strict setting `npm test` itself inherited from this repository's own .npmrc (spec
// Interfaces (f)).
function strippedEnv(overrides = {}) {
  const base = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('npm_config_')),
  );
  return { ...base, ...overrides };
}

// npm as `npm run` would start it: process.execPath plus the real npm CLI script when
// npm_execpath is available (true under `npm test`), else `npm` through the shell.
function spawnNpm(directory, args, envOverrides = {}) {
  const env = strippedEnv(envOverrides);
  const npmExecPath = process.env.npm_execpath;
  const options = { cwd: directory, env, encoding: 'utf8', timeout: SPAWN_TIMEOUT_MS };

  if (npmExecPath) {
    return spawnSync(process.execPath, [npmExecPath, ...args], options);
  }
  return spawnSync('npm', args, { ...options, shell: true });
}

function runNpmCi(directory, envOverrides = {}) {
  return spawnNpm(directory, ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], envOverrides);
}

// Matches spec Interfaces (c): npm's own engine-strict precedence, not this repository's copy of
// the file. Used by cases that document generic npm behaviour and so must not depend on the
// repository's own .npmrc existing yet.
function writeSelfContainedNpmrc(directory) {
  fs.writeFileSync(path.join(directory, '.npmrc'), 'engine-strict=true\n');
}

function writeEmptyDependencyPackage(directory, name, engines) {
  const manifest = { name, version: '0.0.0', ...(engines ? { engines } : {}) };
  fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(
    path.join(directory, 'package-lock.json'),
    JSON.stringify(
      {
        name,
        version: '0.0.0',
        lockfileVersion: 3,
        requires: true,
        packages: { '': { name, version: '0.0.0', ...(engines ? { engines } : {}) } },
      },
      null,
      2,
    ),
  );
}

describe('Node 22.12 pin', () => {
  let fixtureDirectory;

  beforeEach(() => {
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'node-version-pin-'));
  });

  afterEach(() => {
    fs.rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  it('nvmrc holds the single line 22, the major of the engines floor', () => {
    const nvmrcContent = readNormalized(path.join(REPOSITORY_ROOT, '.nvmrc'));
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(REPOSITORY_ROOT, 'package.json'), 'utf8'),
    );

    expect(nvmrcContent).toBe('22\n');
    expect(nvmrcContent.startsWith('﻿')).toBe(false);
    expect(packageJson.engines.node.startsWith('>=22.')).toBe(true);
  });

  it('package.json pins engines.node to >=22.12.0 and the lockfile root entry matches', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(REPOSITORY_ROOT, 'package.json'), 'utf8'),
    );
    const lockfile = JSON.parse(
      fs.readFileSync(path.join(REPOSITORY_ROOT, 'package-lock.json'), 'utf8'),
    );

    expect(packageJson.engines).toEqual({ node: '>=22.12.0' });
    expect(lockfile.packages[''].engines).toEqual({ node: '>=22.12.0' });
  });

  it('npmrc sets engine-strict=true and nothing else besides comments', () => {
    const npmrcContent = fs.readFileSync(path.join(REPOSITORY_ROOT, '.npmrc'), 'utf8');

    expect(npmrcNonCommentLines(npmrcContent)).toEqual(['engine-strict=true']);
  });

  it('npmrc contains no registry, auth or token setting', () => {
    const npmrcContent = fs.readFileSync(path.join(REPOSITORY_ROOT, '.npmrc'), 'utf8');
    const credentialPattern = /_auth|token|registry|always-auth|scope/i;

    for (const line of npmrcNonCommentLines(npmrcContent)) {
      expect(line).not.toMatch(credentialPattern);
    }
  });

  it('npm ci exits non-zero with EBADENGINE, the required range and the running version below the floor', () => {
    writeEmptyDependencyPackage(fixtureDirectory, 'fixture', { node: '>=999.0.0' });
    fs.copyFileSync(path.join(REPOSITORY_ROOT, '.npmrc'), path.join(fixtureDirectory, '.npmrc'));

    const result = runNpmCi(fixtureDirectory);
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

    expect(result.status).not.toBe(0);
    expect(output).toContain('EBADENGINE');
    expect(output).toContain('>=999.0.0');
    expect(output).toContain(process.version);
    expect(fs.existsSync(path.join(fixtureDirectory, 'node_modules'))).toBe(false);
  }, SPAWN_TIMEOUT_MS);

  it('npm ci exits zero when the running Node satisfies the engines floor', () => {
    writeEmptyDependencyPackage(fixtureDirectory, 'fixture', { node: '>=22.12.0' });
    writeSelfContainedNpmrc(fixtureDirectory);

    const result = runNpmCi(fixtureDirectory);
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

    expect(result.status).toBe(0);
    expect(output).not.toContain('EBADENGINE');
  }, SPAWN_TIMEOUT_MS);

  it('without npmrc, npm ci only warns EBADENGINE and exits zero', () => {
    writeEmptyDependencyPackage(fixtureDirectory, 'fixture', { node: '>=999.0.0' });

    const result = runNpmCi(fixtureDirectory);
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

    expect(result.status).toBe(0);
    expect(output).toContain('npm warn EBADENGINE');
  }, SPAWN_TIMEOUT_MS);

  it('an environment variable overriding engine-strict is not blocked by the file, and this is a named residual risk', () => {
    writeEmptyDependencyPackage(fixtureDirectory, 'fixture', { node: '>=999.0.0' });
    writeSelfContainedNpmrc(fixtureDirectory);

    const result = runNpmCi(fixtureDirectory, { npm_config_engine_strict: 'false' });
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

    // With engine-strict forced off, a mismatch still prints a warning (as in the "without
    // npmrc" case above); the residual risk this documents is that it no longer fails the
    // install, not that the warning text disappears.
    expect(result.status).toBe(0);
    expect(output).not.toContain('npm error');
  }, SPAWN_TIMEOUT_MS);

  it("a user-level npmrc with engine-strict=false does not override the project's engine-strict=true", () => {
    writeEmptyDependencyPackage(fixtureDirectory, 'fixture', { node: '>=999.0.0' });
    writeSelfContainedNpmrc(fixtureDirectory);

    const scratchHome = fs.mkdtempSync(path.join(os.tmpdir(), 'node-version-pin-home-'));
    fs.writeFileSync(path.join(scratchHome, '.npmrc'), 'engine-strict=false\n');

    try {
      const result = runNpmCi(fixtureDirectory, { HOME: scratchHome, USERPROFILE: scratchHome });
      const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

      expect(result.status).not.toBe(0);
      expect(output).toContain('EBADENGINE');
    } finally {
      fs.rmSync(scratchHome, { recursive: true, force: true });
    }
  }, SPAWN_TIMEOUT_MS);

  it('npm run exports the project\'s engine-strict setting to a child lifecycle script', () => {
    fs.writeFileSync(
      path.join(fixtureDirectory, 'package.json'),
      JSON.stringify(
        {
          name: 'fixture',
          version: '0.0.0',
          scripts: {
            'print-engine-strict': 'node -e "console.log(process.env.npm_config_engine_strict)"',
          },
        },
        null,
        2,
      ),
    );
    writeSelfContainedNpmrc(fixtureDirectory);

    const result = spawnNpm(fixtureDirectory, ['run', 'print-engine-strict']);

    expect(result.stdout).toContain('true');
  }, SPAWN_TIMEOUT_MS);
});

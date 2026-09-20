// Tests scripts/check-npmrc.mjs (R113) by starting it the way the deploy workflow's pre-install
// guard step does, with spawnSync, so every case judges the exit code and the printed output
// rather than any internal function. The script is never imported. Each case writes its own
// temporary fixture directory and passes it explicitly, so no case reads the repository's own
// .npmrc. This file lives under src/ only because Vitest discovers tests there.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const scriptPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../scripts/check-npmrc.mjs',
);

const PASSED_PREFIX = 'npmrc allowlist passed (R113):';
const FAILED_PREFIX = '::error::npmrc allowlist check failed (R113):';
const COULD_NOT_RUN_PREFIX = '::error::npmrc allowlist check could not run (R113):';

// Spec Interfaces (c) verbatim.
const ALLOWED_NPMRC =
  '# Node below package.json engines fails npm ci with EBADENGINE instead of a warning (R107, ADR 0002).\n' +
  'engine-strict=true\n';

describe('check-npmrc', () => {
  let fixtureDirectory;

  beforeEach(() => {
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'check-npmrc-'));
  });

  afterEach(() => {
    fs.rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  function writeNpmrc(content) {
    fs.writeFileSync(path.join(fixtureDirectory, '.npmrc'), content, 'utf8');
  }

  function runCheckOn(directory) {
    return spawnSync(process.execPath, [scriptPath, directory], { encoding: 'utf8' });
  }

  it('passes a fixture npmrc that sets engine-strict=true and nothing else', () => {
    writeNpmrc(ALLOWED_NPMRC);

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(PASSED_PREFIX);
  });

  it('accepts comments, blank lines, surrounding whitespace and CRLF around the one permitted line', () => {
    const lines = ['# a comment', '; another comment style', '', '  engine-strict=true  '];
    writeNpmrc(lines.join('\r\n'));

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(PASSED_PREFIX);
  });

  it('exits 2 and names the path when npmrc is missing, so the guard never passes on nothing', () => {
    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(2);
    expect(result.stdout).toContain(COULD_NOT_RUN_PREFIX);
    expect(result.stdout).toContain(path.basename(fixtureDirectory));
  });

  it('rejects registry and auth lines by line number and key without printing their values', () => {
    writeNpmrc(
      [
        'engine-strict=true',
        'registry=https://evil.example/',
        '//registry.npmjs.org/:_authToken=SECRETVALUE',
        'SECRETVALUE2',
      ].join('\n'),
    );

    const result = runCheckOn(fixtureDirectory);

    expect(result.status).toBe(1);
    expect(result.stdout).toContain(FAILED_PREFIX);
    expect(result.stdout).toContain('line 2');
    expect(result.stdout).toContain('line 3');
    expect(result.stdout).toContain('line 4');
    expect(result.stdout).toContain('registry');
    expect(result.stdout).toContain('//registry.npmjs.org/:_authToken');
    expect(result.stdout).not.toContain('evil.example');
    expect(result.stdout).not.toContain('SECRETVALUE');
    expect(result.stdout).not.toContain('SECRETVALUE2');
  });
});

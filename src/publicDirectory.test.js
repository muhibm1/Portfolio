// Keeps the design mockups out of the published site (R92, ADR 0012). Vite copies every file in
// public/ into dist/, and anything src/ or index.html references is bundled, so both are checked.
import fs from 'node:fs';
import path from 'node:path';
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

// Reads package.json, vite.config.js and .gitignore as text (G23, R140, R147): the build is
// three steps, the vite config no longer writes route pages itself, and the SSR-only output
// directory stays out of git.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('build pipeline (G23)', () => {
  it('runs the client build, the SSR build, then the prerender script', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));

    expect(packageJson.scripts.build).toBe(
      'vite build && vite build --ssr src/entry-server.jsx --outDir dist-ssr && node scripts/prerender.mjs',
    );
  });

  it('no longer imports route-pages.mjs or writes route pages from closeBundle', () => {
    const viteConfig = fs.readFileSync(path.join(REPO_ROOT, 'vite.config.js'), 'utf8');

    expect(viteConfig).not.toContain('route-pages');
    expect(viteConfig).not.toContain('closeBundle');
  });

  it('keeps dist-ssr out of version control', () => {
    const gitignore = fs.readFileSync(path.join(REPO_ROOT, '.gitignore'), 'utf8');

    expect(gitignore).toContain('dist-ssr');
  });
});

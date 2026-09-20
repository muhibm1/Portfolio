Verdict: 0 findings (0 critical, 0 high, 0 medium, 0 low)

Not applicable: `git diff main...wh/2026-09-20-pin-node-22-12-minimum` touches no `.jsx`/`.tsx` files
and no Vite/Vitest configuration or test-setup file (confirmed: `git diff --stat -- '*.jsx' '*.tsx'`
returns empty, and `vite.config.js` does not appear in the diffstat). The change is a Node version
floor (`.nvmrc`, `package.json` engines, committed `.npmrc`), a CI guard script
(`scripts/check-npmrc.mjs`), edits to `.github/workflows/deploy.yml`, three new Node-side Vitest
files (`src/checkNpmrc.test.js`, `src/deployWorkflowNodeVersion.test.js`,
`src/nodeVersionPin.test.js`), and documentation corrections. None of it reaches React, JSX, the
render path, hooks, accessibility, or the Server/Client boundary — this repository has no server
components anyway (confirmed: static Vite SPA per `CLAUDE.md`).

Checked the two items called out as worth a look even in a toolchain change:
- Shared Vitest config/environment: not touched (confirmed, `--stat` shows no `vite.config.js`,
  `vitest.config.*`, or setup file in the diff). The three new test files are plain Node specs
  using `spawnSync`/`fs`; none import React or `@testing-library/react`, so they cannot affect
  `src/routes.test.jsx` or other RTL-based component tests. `package.json`'s only change is adding
  an `engines` field, which is not a Vitest test config and does not alter test globs, environment,
  or setupFiles.
- Node floor / build config effect on the React app: `vite.config.js` is unchanged in this diff
  (confirmed). The `engines` field and `.npmrc`'s `engine-strict=true` affect `npm ci` behavior on
  an out-of-range Node, not how Vite builds or serves the React app itself. No React-relevant
  build behavior change identified.

Findings outside scope: none
Not verified: did not independently re-run `npm run build` or `npm test`; relying on the
verification summary provided (28 test files, 227 tests, 0 failures; build exits 0), believed not
verified by me directly.

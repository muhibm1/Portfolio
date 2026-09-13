# 0012: Guard the design mockups with a Vitest check over public/ and src/

Date: 2026-09-13
Status: proposed
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages

## Context

G4-D4 (`approvals.md`, G4 note) moves the four design mockups out of `public/` and asks for a
build or test check that no mockup reaches `dist/`. Vite 5.4.21 copies `publicDir`, default
`public`, to the root of `outDir` as-is (confirmed via context7 against the v5.4.21
`shared-options.md` and `assets.md`). `vite.config.js` sets no `publicDir` (confirmed by
reading). Nothing in `src/` references a mockup (confirmed by grep). `vite.config.js`,
`package.json` and `.github/workflows/**` are ask-first paths in `.workhorse/profile.yml`
(confirmed, lines 73 to 78). R92 states the requirement.

## Decision

The four files move to `docs/design/` with `git mv`. A new test file,
`src/publicDirectory.test.js`, asserts four things. No file under `public/` has a name starting
`mockup-`. The four files exist under `docs/design/`. No file under `src/`, and not
`index.html`, contains the string `mockup-`; the test excludes itself by path. `vite.config.js`
does not contain `publicDir`. The test runs wherever `npm test` runs: locally, and in CI before
`npm run build` (R56). The verifier also counts `dist/**/mockup-*` after a build and expects 0.

## Alternatives

| Option | Why not |
|--------|---------|
| Fail the build from a `closeBundle` step in `vite.config.js` when `dist/` holds a mockup | Edits an ask-first path. The existing `closeBundle` already masks errors on a failed build (bug reviewer, Low), so a second step there would inherit that problem |
| A `find dist -name 'mockup-*'` step in `deploy.yml` | Edits an ask-first path, and runs only on push to `main`, after the moment a local check would have caught it |
| Delete the mockups | `docs/design-brief.md` and several ADRs cite them as the design reference the owner chose. They are his material to keep |

## Consequences

Easier: the guard runs in the suite that already gates every deploy, with no edit to a sensitive
path.

Harder: the test proves the inputs, not `dist/` itself. It covers the two ways a mockup reaches
the build today: sitting in `publicDir`, or being imported or referenced from `src/` or
`index.html`. It does not cover a future plugin that copies files on its own. The verifier's
post-build count is the direct check, and it is not in CI. Accepted, owner: site owner. Revisit
if a plugin that copies files is ever added.

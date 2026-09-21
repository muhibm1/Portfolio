# Plan: serve every app route with HTTP 200 on GitHub Pages

Change id: `2026-09-21-serve-every-app-route-with-http-200-on-github-pa`. Tier: 2.
Spec: [spec.md](./spec.md) · Evals: [evals.md](./evals.md), 32 cases · ADRs: [0001](./adr/0001-write-a-directory-index-html-copy-for-every-defined-route-and-keep-404-html-for-the-rest.md), [0002](./adr/0002-derive-the-page-list-from-case-study-ids-in-one-module-shared-by-build-check-and-tests.md), [0003](./adr/0003-assert-200-on-the-deep-link-after-following-redirects-and-404-on-an-unknown-path.md)
Branch: `wh/2026-09-21-serve-every-app-route-with-http-200-on-github-pa`, checked out (confirmed, `git status`).
Worktrees: one per task under the gitignored `.worktrees/` (confirmed in `.gitignore`), task branches `<branch>/t<N>`, folded by rebase (`build.wave_merge`, confirmed).

## Approach

Three tasks in three waves, each depending on the one before, because each consumes a file the
previous one creates: T1 writes the page-list module, the writer and the `vite.config.js` call,
with the tests that prove the app renders every listed path; T2 writes the post-build check
script against T1's list; T3 wires the check and the new smoke assertions into the workflow, puts
the two scripts under the profile's guard, and brings the three documents in step. Nothing
changes runtime component code, so `npm run build` is both a regression check and the GC5
evidence. Every task runs on this host's Node v24.19.0 (confirmed), above the 22.12 floor.

## Rules every task follows

1. **Step 0.** From the worktree root in Git Bash: `node -v && npm ci`. Report `blocked` unless
   Node is v22.12.0 or newer. `npm ci` is not an ask command (profile, confirmed).
2. **Sensitive files are edited only with the Edit tool**, never a shell redirection, so the
   owner's prompt fires. This change's sensitive files: `vite.config.js` (T1),
   `.github/workflows/deploy.yml` (T3). `.workhorse/profile.yml` is not sensitive (confirmed).
3. **No new dependency** (R125). `node:fs`, `node:path`, `node:crypto` and `node:child_process`
   only. Tests read the workflow and the profile as text; no YAML parser.
4. **Fixtures live in `os.tmpdir()`** via `mkdtempSync` and are removed in `afterEach`. No test
   reads or writes the repository's `dist/`. Check-script tests spawn the script with
   `process.execPath`, as `src/checkBuiltCssFonts.test.js` does (confirmed).
5. **Readable code** (wh-readable-code): sentence test names, functions under 40 lines, a module
   comment saying why and giving usage and exit codes, message prefixes as in the spec.
6. **Never edit a test to make it pass**; never report lint, tests or build green without an
   observed exit 0. The working tree is CRLF (`core.autocrlf`, believed from the previous plan);
   write new files with LF and normalise line endings before comparing text.
7. **Do not touch** `src/data/portfolioData.js`, `package.json`, `package-lock.json`,
   `index.html` (R124, R125). The ids are read through an import, never copied into a test as
   literals except in GC1's expected list.

## Files

| Action | Path | Task | Purpose |
|--------|------|------|---------|
| create | `src/routePaths.js` | T1 | `staticRoutePaths(caseStudies)` and the slug rule (R116, R118) |
| create | `src/routePaths.test.jsx` | T1 | GC1, GC2, GC3, EG3, FL1 |
| create | `scripts/route-pages.mjs` | T1 | `sitePagePaths()`, `writeRoutePages(outDir, pagePaths)` (R117) |
| create | `src/routePages.test.js` | T1 | GC4, GC6, EG1, EG2, FL2, AD1 |
| modify | `vite.config.js` | T1 | `closeBundle` calls the writer after the `404.html` copy; doc comment updated. Sensitive |
| create | `scripts/check-route-pages.mjs` | T2 | The post-build check (R119) |
| create | `src/checkRoutePages.test.js` | T2 | GC7, EG4, FL3, FL4, FL5, FL6, FL7, FL8, AD4, AD5 |
| modify | `.github/workflows/deploy.yml` | T3 | Header comment; new build-job step (R120); smoke step rewritten (R121, R122). Sensitive |
| create | `src/deployWorkflowRoutePages.test.js` | T3 | GC9, GC10, GC11, GC12, AD2, AD3 |
| modify | `.workhorse/profile.yml` | T3 | Two `sensitive_paths` lines with comments; two entries on the `2:` line (R123) |
| modify | `CLAUDE.md` | T3 | "Ask first" gains the two scripts (R123) |
| modify | `docs/hosted-config.md` | T3 | Section 6 item 3 (R124) |
| modify | `docs/sdlc/codebase-map.md` | T3 | One bullet under "Build and deploy" (R124) |
| modify | `docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/adr/0002-serve-deep-links-by-copying-index-html-to-404-html-at-build-time.md` | T3 | Status line amended (R124) |

## Waves

| Wave | Tasks | Files touched | Depends on |
|------|-------|---------------|------------|
| 1 | T1 | `src/routePaths.js`, `src/routePaths.test.jsx`, `scripts/route-pages.mjs`, `src/routePages.test.js`, `vite.config.js` | nothing |
| 2 | T2 | `scripts/check-route-pages.mjs`, `src/checkRoutePages.test.js` | wave 1 (imports `sitePagePaths`) |
| 3 | T3 | `.github/workflows/deploy.yml`, `src/deployWorkflowRoutePages.test.js`, `.workhorse/profile.yml`, `CLAUDE.md`, `docs/hosted-config.md`, `docs/sdlc/codebase-map.md`, the 2026-09-11 ADR 0002 file | wave 2 (the test asserts the script exists and GC8 runs it) |

3 tasks, 3 waves, largest wave 1, within `build.max_parallel: 4`. No path repeats across
tasks. Fold order T1, T2, T3. `Parallel: no` on every task.

### Owner prompts

| Task | File | Prompts | Why |
|------|------|---------|-----|
| T1 | `vite.config.js` | 1 | Edit the plugin's imports, doc comment and `closeBundle` in one Edit |
| T3 | `.github/workflows/deploy.yml` | 3 | Header comment; the new build-job step; the smoke step rewrite |

Four prompts. Approve a prompt only if the file is listed for that task.

## Tasks

### T1. Page list, writer, and the build step that writes the copies. Sensitive: `vite.config.js`

- Wave 1 · Parallel: no · Files: `src/routePaths.js` (new), `src/routePaths.test.jsx` (new), `scripts/route-pages.mjs` (new), `src/routePages.test.js` (new), `vite.config.js`
- Requirements: R116, R117, R118. Evals: GC1, GC2, GC3, GC4, GC5, GC6, EG1, EG2, EG3, FL1, FL2, AD1.
- Steps:
  1. Read `src/routes.test.jsx` once for the `MemoryRouter` render helper and the level-1 heading helper; reuse their shape, not their file.
  2. Write the failing test `src/routePaths.test.jsx` with five tests named as in `evals.md`: GC1 (the exact five-path list, ids imported from `portfolioData`, expected literals written out), GC2 (`it.each` over the list: heading is not "Page not found"), GC3 (`App.jsx` read as text: collect `<Route` tags; exactly one with `index`, and the set of `path="..."` values equals `{work, work/:slug, *}`), EG3 (`[]` gives `['/', '/work']`), FL1 (`it.each` over the five bad ids: throws, message contains the id and `URL-safe slug`).
  3. Write the failing test `src/routePages.test.js` with six tests: GC4, GC6, EG1, EG2, FL2, AD1, as specified in `evals.md`; AD1 also asserts nothing named `index.html` appeared in the fixture's parent or grandparent directory.
  4. `npm test -- src/routePaths.test.jsx src/routePages.test.js`: every test fails because the modules do not exist. Any other failure reason is a stop; report `blocked`.
  5. Write `src/routePaths.js` to spec Interfaces (a), under 30 lines. Write `scripts/route-pages.mjs` to Interfaces (b) and (c): validate every target against the resolved `outDir` before the first write; read `index.html` once; `mkdirSync` recursive; return forward-slash relative paths.
  6. Edit `vite.config.js` (prompt 1): import `sitePagePaths` and `writeRoutePages` from `./scripts/route-pages.mjs`; in `closeBundle`, after the existing `404.html` copy, call `writeRoutePages(outDir, sitePagePaths())` and log `Wrote <n> route pages`; extend the plugin's doc comment to name this change's ADR 0001. The CSP, referrer and `404.html` lines stay byte-identical.
  7. `npm test -- src/routePaths.test.jsx src/routePages.test.js`: 11 pass. `npm run build`: exit 0, log shows `Wrote 4 route pages`. GC5: `sha256sum dist/index.html dist/404.html dist/work/index.html dist/work/*/index.html` prints five lines with one digest; paste into the commit body. `npm run lint`, full `npm test`.
  8. Commit: `feat(build): write an index.html copy for every app route so Pages answers 200`
- Done when: 11 new tests pass, GC5's five digests match, lint and build exit 0, and `git diff --stat` shows exactly the five files above.

### T2. The post-build route-page check and its fixture tests

- Wave 2 · Parallel: no · Files: `scripts/check-route-pages.mjs` (new), `src/checkRoutePages.test.js` (new)
- Requirements: R119. Evals: GC7, GC8, EG4, FL3, FL4, FL5, FL6, FL7, FL8, AD4, AD5.
- Steps:
  1. Read `scripts/check-built-css-fonts.mjs` and `src/checkBuiltCssFonts.test.js` once; copy their shape (usage comment, `EXIT_*` constants, `REPOSITORY_ROOT`, `::error::` prefixes, `spawnSync` with `mkdtempSync` fixtures).
  2. Write the failing test `src/checkRoutePages.test.js` with ten tests named as in `evals.md`: GC7, EG4 (spawn with `cwd` set to the fixture's parent and the basename as the argument), FL3, FL4, FL5 (two runs), FL6 (two runs), FL7, FL8 (a stray `index.html` at `unexpected-top/index.html` and a second two directories deep under `work/apple-llm-triage/nested/deep/index.html`, both named in one exit-1 run), AD4, AD5 (reuse FL7's stray-file fixture with a 200-character marker as its content; assert the marker never appears in stdout or stderr). A fixture helper builds the complete set from `sitePagePaths()` imported from `../scripts/route-pages.mjs`, so the expected pages track the data.
  3. `npm test -- src/checkRoutePages.test.js`: all fail because the script does not exist. Any other reason is a stop.
  4. Write `scripts/check-route-pages.mjs` to spec Interfaces (d): expected set = `sitePagePaths()` minus `/`, mapped to `<path>/index.html`, plus `404.html`; compare bytes with `Buffer.equals` against `index.html`; walk the directory with `readdirSync({ recursive: true, withFileTypes: true })` for any `index.html` not in the set and not the root, at any depth; print counts and byte lengths, never content, for every offending file including unexpected ones; exit 2 when the directory or `index.html` is missing or unreadable. Under 120 lines.
  5. `npm test -- src/checkRoutePages.test.js`: 10 pass (12 assertions across the two-run cases). GC8: `npm run build && node scripts/check-route-pages.mjs` exits 0 with the passed line; record it. `npm run lint`, full `npm test`.
  6. Commit: `ci(build): add the post-build check that every app route has a page`
- Done when: the ten tests pass, GC8 exits 0 on the real build, lint and build exit 0, and the diff is limited to the two files.

### T3. Workflow step and smoke assertions, profile guard, documents. Sensitive: `.github/workflows/deploy.yml`

- Wave 3 · Parallel: no · Files: `.github/workflows/deploy.yml`, `src/deployWorkflowRoutePages.test.js` (new), `.workhorse/profile.yml`, `CLAUDE.md`, `docs/hosted-config.md`, `docs/sdlc/codebase-map.md`, the 2026-09-11 ADR 0002 file
- Requirements: R120, R121, R122, R123, R124. Evals: GC9, GC10, GC11, GC12, GC13, AD2, AD3.
- Steps:
  1. Read `src/deployWorkflowNodeVersion.test.js` once and reuse its step-isolation helpers by shape (read as text, normalise CRLF, find `- name:` lines).
  2. Write the failing test `src/deployWorkflowRoutePages.test.js` with six tests named as in `evals.md`: GC9, GC10, GC11, AD2, AD3 (workflow), GC12 (profile and `CLAUDE.md`).
  3. `npm test -- src/deployWorkflowRoutePages.test.js`: GC9, GC10, GC11, GC12 fail because the lines are absent; AD2 and AD3 fail on the missing step or pass on today's text (record which).
  4. Edit `deploy.yml` (prompt 1): header comment gains one line citing this change's spec (R119 to R122) and ADR 0003. Edit (prompt 2): insert the R120 step from spec Interfaces (e) after the "Built CSS inlines no font (R97)" step. Edit (prompt 3): replace the "Smoke R81" step (lines 354 to 372 today) with the step in Interfaces (f): two fetches, two status assertions, two digest comparisons, `::error::R121 failed` and `::error::R122 failed` lines naming the URL, redirect count and effective URL echoed. Every other line of the file stays byte-identical; `git diff` shows three hunks.
  5. `.workhorse/profile.yml` with the Edit tool: after the `scripts/check-npmrc.mjs` line add `- "scripts/route-pages.mjs"` with the comment `# writes the per-route index.html copies at build time; decides what Pages serves (change 2026-09-21, D6)` and `- "scripts/check-route-pages.mjs"` with `# blocking CI check that every app route has a page in dist (change 2026-09-21, D6)`; append both to the `2:` list. `CLAUDE.md`: add both to "Ask first". Confirm the profile still loads with `node -e "require('C:/Users/alqai/WorkHorse/hooks/scripts/lib.js').loadProfile('.')"` if that module exists (believed from `constraints.md`); otherwise record "not verified".
  6. Documents: `docs/hosted-config.md` section 6 item 3 becomes "A deep link pasted into a fresh tab renders the case study (CI smoke R121 proves the 200 and the body; this check is for rendering)". `docs/sdlc/codebase-map.md` "Build and deploy": one bullet saying the build writes route pages under `dist/work/` and `404.html`, checked by `scripts/check-route-pages.mjs` (change 2026-09-21). The 2026-09-11 ADR 0002 Status line: `accepted; the "every path except / is 404" consequence is amended by 2026-09-21 ADR 0001`. No other line in those files changes.
  7. `npm test -- src/deployWorkflowRoutePages.test.js src/deployWorkflowNodeVersion.test.js src/nodePinDocsAndProfile.test.js`: all pass. GC13 greps: each count at least 1. Full `npm test`, `npm run lint`, `npm run build`, `node scripts/check-route-pages.mjs`.
  8. Commit: `ci(deploy): check route pages before upload and require 200 on a deep link`
- Done when: the six tests pass alongside the two existing workflow and profile suites, the workflow diff is three hunks, GC13 counts hold, and lint, tests, build and the check exit 0.

## Verification plan

Profile commands on the folded branch: `npm ci` (exit 0), `npm run lint` (exit 0), `npm test`
(every file passes, 0 skipped; NF3 compares the count to today's), `npm run build` (exit 0, log
`Wrote 4 route pages`), `npm audit --omit=dev --audit-level=high` (unchanged dependency set).
Evals: GC1, GC2, GC3, EG3, FL1 via `src/routePaths.test.jsx`; GC4, GC6, EG1, EG2, FL2, AD1 via
`src/routePages.test.js`; GC7, EG4, FL3 to FL8, AD4, AD5 via `src/checkRoutePages.test.js`; GC9 to
GC12, AD2, AD3 via `src/deployWorkflowRoutePages.test.js`; GC5, GC8, GC13, NF1, NF2, NF3 as the
commands in `evals.md`. The human sees the Vitest summary, the five matching digests, the check
script's passed line and its timing, and the three-hunk workflow diff. After the owner merges,
the first deploy run's "Every app route has a page" step and the "Smoke R121 and R122" step are
the live evidence: the release engineer records the status, redirect count and effective URL in
`release.md`. Because `vite.config.js` changed, `docs/hosted-config.md` section 6 requires the
owner's four-item browser check; that part is manual.

## Rollback

- Dev and CI: `git revert` of the merge commit removes the two scripts, the list module, the
  tests, the `closeBundle` call, the workflow step and the smoke rewrite, and restores the R81
  step. No data, no migration. The next build no longer writes the copies; Pages goes back to
  answering deep links from `404.html` with status 404, which is today's behaviour.
- Prod (GitHub Pages): a revert redeploys an artifact without the route pages; nothing else about
  the served bytes changes. Rehearsed at G5 by the release engineer: revert on a scratch branch,
  `npm ci`, `npm test`, `npm run build`, all exit 0, and `dist/work/` absent.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Pages redirects the bare deep link in a way curl's two-redirect limit does not cover | Low (believed one 301 at most) | R121 fails on the first run | The step logs the count and effective URL; raising the limit is a one-line follow-up |
| Pages keeps serving the old `404.html` for a deep link for some minutes after deploy | Low | R121 false failure once | R63's retry loop runs first and the root must already answer 200 with the new body; the owner may re-run the job |
| `vite.config.js` importing app data through `scripts/route-pages.mjs` breaks the config load on a data syntax error | Low | Build fails with a clearer message than a bundle error | Accepted in ADR 0002 |
| Vite does not empty `dist/` between builds on some setting, leaving a page for a removed case study | Low (believed default is to empty) | Stale page served 200 with the not-found body | R119's unexpected-file rule exits 1 before upload |
| The previews still show the site-wide title for every route | Certain | Previews exist but are generic | Stated in the brief (D4); pre-rendering is the recorded follow-up |
| A future route pattern added to `App.jsx` without a list entry | Medium over time | Deep link 404 again for that route | GC3 fails in `npm test` |
| The `-e -o pipefail` default for `shell: bash` in Actions is believed, not verified | Low | A failing first curl could be masked | Each curl's status is captured with `|| fail` handling and asserted explicitly, so the step does not rely on `-e` |

# Adoption review: serve every app route with HTTP 200 on GitHub Pages

Change id: `2026-09-21-serve-every-app-route-with-http-200-on-github-pa`, head `b4d2f6e`.

Verdict: 0 findings (0 critical, 0 high, 0 medium, 0 low)
Adoption score: 5

## Walkthrough (confirmed unless labelled)

1. Find it. `docs/sdlc/codebase-map.md` "Build and deploy" carries a new bullet pointing at
   `scripts/check-route-pages.mjs` and `dist/work/` (confirmed, diff hunk). `CLAUDE.md`
   "Ask first" names both new scripts. The repo's own entry point for behaviour like this is
   `CLAUDE.md` and `codebase-map.md`, not `README.md` (which is the stock Vite template and was
   already, before this change, silent on every other build script such as
   `check-built-css-fonts.mjs`); this diff follows that existing, pre-established pattern rather
   than deviating from it.
2. Understand it. `src/routePaths.js`, `scripts/route-pages.mjs` and
   `scripts/check-route-pages.mjs` each open with a comment stating purpose and pointing at the
   requirement id and ADR that justify it (confirmed, read each file in full). Names match the
   spec's vocabulary exactly: `staticRoutePaths`, `sitePagePaths`, `writeRoutePages` are the same
   names spec.md's Interfaces section (a)-(c) uses.
3. Change it safely. 37 new tests across four files (`routePaths.test.jsx`,
   `routePages.test.js`, `checkRoutePages.test.js`, `deployWorkflowRoutePages.test.js`) cover the
   slug guard, the path-escape guard, staleness, missing/extra pages, and the workflow text.
   Ran `npm test`: 34 files, 322 tests, 322 passed, 0 failed, 0 skipped (confirmed, this
   session).
4. Run it. Ran `npm run build`: exits 0, last line `Wrote 4 route pages` (confirmed). Ran
   `node scripts/check-route-pages.mjs` standalone: exit 0, output `Route page check passed
   (R119): 4 route pages and 404.html match dist/index.html.` (confirmed). Ran `npm run lint`:
   no diagnostics (confirmed). No undocumented step was needed; the commands in the spec and
   `verification.md` matched what actually ran.
5. Operate it. Spec's Observability section states the build log line, the CI check's pass/fail
   lines, and the smoke step's status/redirect-count/effective-URL output; the deploy.yml diff
   matches this exactly (confirmed, diff hunk). There is no separate runbook file in this repo
   for any change (confirmed, `docs/` has no `runbook*` file anywhere) — this is the project's
   existing state, not something this diff introduces or should have added on its own, so not
   scored as a finding here.
6. Why. Three ADRs cover the three non-obvious decisions (copies vs pre-render, one derived
   list vs hand-kept, smoke-redirect handling), each with an Alternatives table and named
   consequences (confirmed, read ADR 0001 and skimmed 0002/0003 titles and the spec's ADR
   links). The prior change's ADR (2026-09-11 ADR 0002) has its Status line amended to point at
   this change (confirmed, grep on that file: `Status: accepted; ... amended by 2026-09-21 ADR
   0001`).

## Table

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| none | - | - | - | - |

Findings outside scope: none.

Not verified: the live served-status half of R121/R122 (deep link answers 200, unknown path
answers 404 on the real GitHub Pages site) — spec and `verification.md` both state this needs
the first post-merge deploy run and defer it to `release.md`; not checkable from this checkout.
The spec's five constraint-audit "low" findings (CI test-floor coverage of the new security
tests, `routePaths.js` not itself in `sensitive_paths`, redirect scheme not pinned to https,
case-study indexability, and a stray non-`index.html` HTML file going undetected) are security
and correctness matters, out of this review's scope per the adoption-reviewer brief, and are
already recorded with severity and rule citations in `spec.md`'s Constraint audit table.

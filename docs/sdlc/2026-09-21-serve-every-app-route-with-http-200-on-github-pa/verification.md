# Verification: serve every app route with HTTP 200 on GitHub Pages

Change id: `2026-09-21-serve-every-app-route-with-http-200-on-github-pa`
Status: green
Run at: 2026-09-21 UTC
Commit: `e0da65d4f34022aecd6eafb9c274d1457656e740`

Re-verification after the review-phase fixer's four commits on top of `b4d2f6e` (the last green
verification): `2d07c19`, `6501d9e`, `0ee32e5`, `e0da65d`.

Status is green only when every defined check exited 0 and every eval category met its target.
"No check defined" rows do not count as passes; they are listed so the gap is visible.

## What was measured

- Install: not run. `git diff --name-only main...HEAD -- package.json package-lock.json` is empty
  (confirmed), so no lockfile changed and the profile only requires install when one does.
- Lint: `oxlint` produced no diagnostics, exit 0 (`npm run lint`, `verify-logs/lint.log`).
- Test suite: 34 files, 329 tests, 329 passed, 0 failed, 0 skipped, 0 todo, 12.18s (`npm test`,
  `verify-logs/test.log`). Up from 285 tests across 30 files at the previous change,
  `2026-09-20-fix-phone-redaction-scanner`, and up from 322 tests across 34 files at this same
  change's last green run (`b4d2f6e`). The gain of 7 tests over `b4d2f6e` matches
  `0ee32e5`/`e0da65d` widening `src/deployWorkflowRoutePages.test.js` (8 to 11 tests, confirmed by
  grep) and `src/checkRoutePages.test.js` (10 to 11 tests, confirmed by grep).
- Test-count floors: `node scripts/check-test-floor.mjs vitest-results.json`, run the same way
  `deploy.yml`'s "Test-count floors (R52, R11)" step runs it, against the JSON report from
  `npm test -- --reporter=default --reporter=json --outputFile.json=vitest-results.json`. Exit 0;
  all four per-file pins met including the two this change added (`src/routePaths.test.jsx`
  pinned 13, actual 13; `src/routePages.test.js` pinned 6, actual 6; `src/checkRoutePages.test.js`
  pinned 11, actual 11) (`verify-logs/test-floor.log`).
- Build: `vite build` exited 0 and the build log's last line before the exit marker reads
  `Wrote 4 route pages` (`npm run build`, `verify-logs/build.log`).
- typecheck: no check defined in the profile.
- e2e: no check defined in the profile.
- screenshot: no check defined in the profile.
- Security audit: `npm audit --omit=dev --audit-level=high` (the profile's blocking gate) found 0
  vulnerabilities, exit 0 (`verify-logs/audit.log`). The non-blocking full-tree
  `npm audit --audit-level=high` (`verify-logs/audit-full.log`) reports 4 vulnerabilities (3
  moderate, 1 high: `@vitest/mocker`/`vitest`, `esbuild`/`vite`, both dev-only), matching ADR
  0009's accepted dev-only exception; `git diff --name-only main...HEAD -- package.json
  package-lock.json` is empty (confirmed), so the dependency set is unchanged by this change. The
  blocking gate is what the profile and CI enforce, and it is clean.

Two additional checks run outside the profile's named commands because `deploy.yml` runs them
directly in the build job: `node scripts/check-built-css-fonts.mjs` (R97), exit 0
(`verify-logs/check-built-css-fonts.log`); `node scripts/check-route-pages.mjs` (R119) on the real
`dist/` after build, exit 0, stdout `Route page check passed (R119): 4 route pages and 404.html
match dist/index.html.` (`verify-logs/check-route-pages.log`, GC8, timed at 0.090s wall, NF1,
`verify-logs/nf1-timing.log`).

## Checks

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `npm ci` | not run | none | no lockfile change, confirmed by empty `git diff` |
| typecheck | (none) | | | no check defined |
| lint | `npm run lint` | 0 | `verify-logs/lint.log` | confirmed |
| test | `npm test -- --reporter=default --reporter=json --outputFile.json=vitest-results.json` | 0 | `verify-logs/test.log` | confirmed |
| test-count floors | `node scripts/check-test-floor.mjs vitest-results.json` | 0 | `verify-logs/test-floor.log` | confirmed |
| build | `npm run build` | 0 | `verify-logs/build.log` | confirmed |
| e2e | (none) | | | no check defined |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | `verify-logs/audit.log` | confirmed |
| screenshot | (none) | | | no check defined |

## Evals

| Category | Cases | Passed | Target | Met |
|----------|-------|--------|--------|-----|
| golden | 13 | 13 | 100% | yes |
| edge | 4 | 4 | 100% | yes |
| failure | 8 | 8 | 100% | yes |
| adversarial | 5 | 5 | 100% | yes |
| non-functional | 3 | 3 | see rows | yes |

All 33 cases in `evals.md` are automated (no `manual` rows). GC1-GC3, EG3, FL1 confirmed present by
case id in `src/routePaths.test.jsx` (13 tests); GC4, GC6, EG1, EG2, FL2, AD1 in
`src/routePages.test.js` (6 tests); GC7, EG4, FL3-FL8, AD4, AD5 in `src/checkRoutePages.test.js`
(11 tests, widened by `6501d9e`/`0ee32e5` from 10); GC9-GC12, AD2, AD3 in
`src/deployWorkflowRoutePages.test.js` (11 tests, widened by `0ee32e5` from 8, GC10 now asserts
each route's exact heading per `6501d9e`). All ran inside `npm test` above and passed.

GC5, GC8, GC13, NF1, NF2, NF3 run as standalone commands: GC5 -
`sha256sum dist/index.html dist/404.html dist/work/index.html dist/work/*/index.html`, all six
files (index, 404, work index, three case-study pages) share one digest
`f06541e5db468f860c05a8060715d5172e87d4caca650589a3b2d41ed9af0edf` (`verify-logs/gc5-digests.log`).
GC8 above. GC13 - `grep -c "R121" docs/hosted-config.md` = 1, `grep -c "route pages"
docs/sdlc/codebase-map.md` = 1, `grep -c "2026-09-21"
docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/adr/0002-serve-deep-links-by-copying-index-html-to-404-html-at-build-time.md`
= 1 (all confirmed, each at least 1). NF1 - 0.090s wall, under the 2s target
(`verify-logs/nf1-timing.log`). NF2 - `git diff --name-only main...HEAD -- package.json
package-lock.json index.html src/data/portfolioData.js` empty (`verify-logs/nf2-diff.log`). NF3 -
the four route-page test files add 41 tests (routePaths.test.jsx 13, routePages.test.js 6,
checkRoutePages.test.js 11, deployWorkflowRoutePages.test.js 11), above the 20 required; whole
suite 329 passed, 0 failed, 0 skipped, 0 todo.

## Failures and fixes

None on this run.

| # | Check | Cause | Fix commit | Re-run exit code |
|---|-------|-------|------------|------------------|
| | | | | |

## Known failures

None cited. `node wh.js known-failure list` showed nothing recorded before this run
(`known-failure list` output: "No known failures recorded."), and no check in this run was red.

## Not verified

- R121 and R122 on the published site: the live half of the smoke assertions only the first
  deploy run after merge can show. The workflow text proving the smoke-test logic (now
  redirect-count and effective-URL aware, HTTPS-only, non-empty-body asserting per `0ee32e5`) is
  verified here (GC9-GC12, AD2, AD3, all passing); the served bytes on the real GitHub Pages
  deployment are deferred to the release engineer's `release.md` record after the owner merges.
- `docs/hosted-config.md` section 6's owner browser check: stated manual in the plan because
  `vite.config.js` changed. Not run here; it is the owner's task.

## Notes for the Ship document

None. No wording mismatch was found between `spec.md`, `plan.md`, `evals.md`, or the other SDLC
documents for this change during this run.

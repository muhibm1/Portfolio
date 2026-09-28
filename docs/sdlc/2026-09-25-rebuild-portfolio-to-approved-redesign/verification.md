# Verification: rebuild the portfolio to the approved redesign

Change id: `2026-09-25-rebuild-portfolio-to-approved-redesign`
Status: green
Run at: 2026-09-28 UTC
Commit: `12e6edd8f43cc55d4f9d9c8e71bad43f527c4dd7`

Status is green only when every defined check exited 0 and every eval category met its target.
"No check defined" rows do not count as passes; they are listed so the gap is visible.

## What was measured

- Install: `npm ci` exited 0, added 180 packages, 4 vulnerabilities reported at the info level
  (matches the dev-only exception below) (`verify-logs/install.log`). Run because
  `package-lock.json` differs from `main` (`git diff --name-only main...HEAD` lists it).
- Lint: `oxlint` produced no diagnostics, exit 0 (`npm run lint`, `verify-logs/lint.log`).
- Test suite: 37 files, 460 tests, 460 passed, 0 failed, 0 skipped, 0 todo, 13.37s (`npm test --
  --reporter=default --reporter=json --outputFile.json=vitest-results.json`, `verify-logs/test.log`).
  Up from 329 tests across 34 files at the previous change,
  `2026-09-21-serve-every-app-route-with-http-200-on-github-pa`.
- Test-count floors: `node scripts/check-test-floor.mjs vitest-results.json` exit 0; all six pinned
  suites met their floor exactly (`checkPhoneRedaction.test.js` 45/45, `routePaths.test.jsx` 8/8,
  `routePages.test.js` 14/14, `checkRoutePages.test.js` 16/16, `checkForbiddenCopy.test.js` 26/26,
  `pageMeta.test.js` 11/11) (`verify-logs/check-test-floor.log`). `vitest-results.json` was deleted
  after this run per instruction; it is not committed.
- Build: `vite build` and the SSR build both exited 0, wall time 4.619s (well under the 90s N1
  target), 8 pages prerendered (`npm run build`, `verify-logs/build.log`).
- typecheck: no check defined in the profile.
- e2e: no check defined in the profile.
- screenshot: no check defined in the profile.
- Security audit: `npm audit --omit=dev --audit-level=high` (the profile's blocking gate) found 0
  vulnerabilities, exit 0 (`verify-logs/audit.log`).
- Built-CSS-fonts check (R97): `node scripts/check-built-css-fonts.mjs` exit 0, 1 CSS file, 34
  `@font-face` blocks, 68 font URLs, 0 `data:` font URLs (`verify-logs/check-built-css-fonts.log`).
- Route pages check (R142): `node scripts/check-route-pages.mjs` exit 0, 8 pages carry their
  markers, 0.080s wall (`verify-logs/check-route-pages.log`), well under N1's 2s per-check target.
- Forbidden copy, built tree (R129): `node scripts/check-forbidden-copy.mjs dist` exit 0, 41 files
  scanned, 0.093s wall (`verify-logs/check-forbidden-copy-dist.log`).
- Forbidden copy, source tree (R128, R129): `node scripts/check-forbidden-copy.mjs` (no argument)
  exit 0, 33 files scanned (`verify-logs/check-forbidden-copy-src.log`).
- Phone redaction, built tree: `node scripts/check-phone-redaction.mjs dist` exit 0, 303 files
  scanned (75 skipped as binary), 0 hits (`verify-logs/check-phone-redaction-dist.log`).
- Phone redaction, repository: `node scripts/check-phone-redaction.mjs` (no argument) exit 0, 290
  files scanned (6 skipped as binary), 0 hits, and includes the `git ls-files` check that no `.pdf`
  is tracked (`verify-logs/check-phone-redaction-repo.log`).

## Checks

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `npm ci` | 0 | `verify-logs/install.log` | confirmed |
| typecheck | (none) | | | no check defined |
| lint | `npm run lint` | 0 | `verify-logs/lint.log` | confirmed |
| test | `npm test -- --reporter=default --reporter=json --outputFile.json=vitest-results.json` | 0 | `verify-logs/test.log` | confirmed |
| test-count floors | `node scripts/check-test-floor.mjs vitest-results.json` | 0 | `verify-logs/check-test-floor.log` | confirmed |
| build | `npm run build` | 0 | `verify-logs/build.log` | confirmed |
| e2e | (none) | | | no check defined |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | `verify-logs/audit.log` | confirmed |
| screenshot | (none) | | | no check defined |
| built-css-fonts (R97) | `node scripts/check-built-css-fonts.mjs` | 0 | `verify-logs/check-built-css-fonts.log` | confirmed |
| route-pages (R142) | `node scripts/check-route-pages.mjs` | 0 | `verify-logs/check-route-pages.log` | confirmed |
| forbidden-copy, dist (R129) | `node scripts/check-forbidden-copy.mjs dist` | 0 | `verify-logs/check-forbidden-copy-dist.log` | confirmed |
| forbidden-copy, src (R128, R129) | `node scripts/check-forbidden-copy.mjs` | 0 | `verify-logs/check-forbidden-copy-src.log` | confirmed |
| phone-redaction, dist | `node scripts/check-phone-redaction.mjs dist` | 0 | `verify-logs/check-phone-redaction-dist.log` | confirmed |
| phone-redaction, repo | `node scripts/check-phone-redaction.mjs` | 0 | `verify-logs/check-phone-redaction-repo.log` | confirmed |

## Evals

| Category | Cases | Passed | Target | Met |
|----------|-------|--------|--------|-----|
| golden | 23 | 23 | 100% | yes |
| edge | 4 | 4 | 100% | yes |
| failure | 2 | 2 | 100% | yes |
| adversarial | 3 | 3 | 100% | yes |
| non-functional | 2 of 3 (N1, N2 automated; N4 manual) | 2 | see rows | yes |

All 32 automated cases in `evals.md` (G1-G8, G10-G14, G16-G24, G26; E1-E4; F1, F2; A1-A3) have an
"Implemented as" path; every path was confirmed to exist on disk and, for the revised/new cases
(G7, G10, G11, G14, G26, A3), confirmed by grep to contain a block or comment naming the case id
(`describe('repository links (G26)'` at `src/components/CaseStudyPage.test.jsx:234`; `A3` comments
at `src/checkForbiddenCopy.test.js:228,339`). No case is `missing`. All cases run inside `npm test`
above (37 files, 460 tests, 0 failed) and passed.

N1 (build under 90s, each post-build check under 2s): build 4.619s
(`verify-logs/build.log`), `check-forbidden-copy.mjs dist` 0.093s, `check-route-pages.mjs` 0.080s
(both logs above); all within target. N2 (0 failed/skipped/todo; every pinned suite at or above its
floor): confirmed above, `verify-logs/check-test-floor.log`.

M1 to M5 and N4 are not automated; see "Not verified".

## Failures and fixes

None on this run.

| # | Check | Cause | Fix commit | Re-run exit code |
|---|-------|-------|------------|------------------|

## Known failures

None cited. `node wh.js known-failure list` returned "No known failures recorded." before this run,
and no check in this run was red, so none was needed.

## Not verified

- M1: manual viewport/mobile-menu check across breakpoints. Not run; the owner or main session
  records it in `ship.md`.
- M2: manual keyboard-tab-order and focus-ring check. Not run; recorded in `ship.md`.
- M3: manual post-deploy curl and private-window checks of the live site and repository URLs. Not
  run; this is a post-merge check recorded in `ship.md`.
- M4: manual comparison of the run-count figures against the owner's approved facts. Not run; the
  shipper writes it into `ship.md`.
- M5: manual side-by-side site-versus-resume claim list. Not run; the shipper writes it into
  `ship.md` for the owner to confirm at G4.
- N4: manual Lighthouse scores on the local preview. Not run; recorded in `ship.md`.

## Notes for the Ship document

None found in this pass. The prose across `spec.md`, `plan.md` and `evals.md` for this change was
not diffed word-by-word in this session beyond what the eval cases already check; no wording
mismatch was noticed while running checks and evals.

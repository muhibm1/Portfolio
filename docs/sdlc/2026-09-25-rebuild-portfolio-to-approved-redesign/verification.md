# Verification: rebuild the portfolio to the approved redesign

Change id: `2026-09-25-rebuild-portfolio-to-approved-redesign`
Status: red
Run at: 2026-09-25 UTC
Commit: `bbd02a25b202fbcb9665b73c4a3c25a20777aa8c`

Re-verification from scratch of the post-review fixes (`bbd02a2`, four commits on top of `695345e`,
the commit this same change's last verification run checked).

Status is green only when every defined check exited 0 and every eval category met its target.
"No check defined" rows do not count as passes; they are listed so the gap is visible.

The sole cause of red is the expected owner-supplied gap named in the task:
`public/Muhammad_Muhibullah_Resume.pdf` is intentionally absent (D2, D12, D16, D17). Every other
check is green. See "Known gap" below.

## What was measured

- Install: `npm ci` exit 0 (`verify-logs/install.log`). Run because `git diff --name-only
  main...HEAD -- package.json package-lock.json` lists both files, so the lockfile changed.
- Lint: `npm run lint` (oxlint), 0 errors, exit 0 (`verify-logs/lint.log`).
- Test suite: 38 files, 419 tests, 418 passed, 1 failed, 0 skipped, 0 todo, 19.57s (`npm test`,
  `verify-logs/test.log`; the JSON-reporter re-run gave the same 1 failed/418 passed/419 total in
  12.62s, `verify-logs/evals.log`). The one failure is `src/servedFiles.test.js > served files
  (G18) > serves the resume as a PDF beginning %PDF- (D2)`, throwing "D2:
  public/Muhammad_Muhibullah_Resume.pdf is missing." Up from 329 tests across 34 files at the
  previous *change*, `2026-09-21-serve-every-app-route-with-http-200-on-github-pa`, and up from
  392 tests across 37 files at this same change's last run (commit `695345e`, same one G18
  failure). The review-phase fixer's four commits added `checkRoutePages.test.js` (15→16),
  `routePages.test.js` (11→14) and `servedFiles.test.js` D23 assertions (confirmed by comparing
  this run's log with `695345e`'s).
- Build: `npm run build` exit 0; ends `Prerendered 8 pages` (`verify-logs/build.log`). Timed
  separately (N1) at 4.342s wall, under the 90s target (`verify-logs/build-timed.log`).
- typecheck, e2e, screenshot: no check defined in the profile.
- Security audit: `npm audit --omit=dev --audit-level=high` found 0 vulnerabilities, exit 0
  (`verify-logs/audit.log`).
- Built CSS fonts: `node scripts/check-built-css-fonts.mjs`, exit 0, "1 CSS file(s), 34 @font-face
  blocks, 68 font URLs, 0 data: font URLs" (`verify-logs/check-built-css-fonts.log`).
- Route pages: `node scripts/check-route-pages.mjs`, exit 0, "8 pages carry their markers."
  Timed (N3) at 109ms, under 2s (`verify-logs/check-route-pages.log`, `verify-logs/n3-route-pages-time.log`).
- Forbidden copy: `node scripts/check-forbidden-copy.mjs dist`, exit 0, "41 files scanned." Timed
  (N3) at 108ms, under 2s (`verify-logs/check-forbidden-copy.log`, `verify-logs/n3-forbidden-copy-time.log`).
- Phone redaction: `node scripts/check-phone-redaction.mjs dist`, exit 0, "Scanned 291 files (75
  skipped as binary), 0 hits." (`verify-logs/check-phone-redaction.log`). Skips `.pdf` by design
  (D16); the missing resume PDF is not scanned here.
- Resume PDF (new this run, D23): `node scripts/check-resume-pdf.mjs`, exit 2: "`::error::
  public/Muhammad_Muhibullah_Resume.pdf is missing. This file is owner-supplied (D2); the owner
  adds it after running the D12/D17 check.`" (`verify-logs/check-resume-pdf.log`). This is the
  expected owner-supplied gap, checked directly for the first time this run.
- Test-count floors: `node scripts/check-test-floor.mjs vitest-results.json`, exit 1 on the
  suite-wide "0 failed" requirement only; every pinned suite floor is met
  (`checkPhoneRedaction.test.js` 45/45, `routePaths.test.jsx` 8/8, `routePages.test.js` 14/14,
  `checkRoutePages.test.js` 16/16, `checkForbiddenCopy.test.js` 14/14, `pageMeta.test.js` 11/11)
  (`verify-logs/test-floor.log`).

## Checks

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `npm ci` | 0 | `verify-logs/install.log` | confirmed |
| typecheck | (none) | | | no check defined |
| lint | `npm run lint` | 0 | `verify-logs/lint.log` | confirmed |
| test | `npm test` | 1 | `verify-logs/test.log` | confirmed red: G18 resume PDF only |
| build | `npm run build` | 0 | `verify-logs/build.log` | confirmed |
| e2e | (none) | | | no check defined |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | `verify-logs/audit.log` | confirmed |
| screenshot | (none) | | | no check defined |
| built-css-fonts (post-build) | `node scripts/check-built-css-fonts.mjs` | 0 | `verify-logs/check-built-css-fonts.log` | confirmed |
| route-pages (post-build) | `node scripts/check-route-pages.mjs` | 0 | `verify-logs/check-route-pages.log` | confirmed |
| forbidden-copy (post-build) | `node scripts/check-forbidden-copy.mjs dist` | 0 | `verify-logs/check-forbidden-copy.log` | confirmed |
| phone-redaction (post-build) | `node scripts/check-phone-redaction.mjs dist` | 0 | `verify-logs/check-phone-redaction.log` | confirmed |
| resume-pdf (post-build, new D23) | `node scripts/check-resume-pdf.mjs` | 2 | `verify-logs/check-resume-pdf.log` | confirmed red: expected owner-supplied gap |
| test (JSON, for test-floor) | `npm test -- --reporter=default --reporter=json --outputFile.json=vitest-results.json` | 1 | `verify-logs/evals.log` | confirmed red: same G18 cause |
| test-floor | `node scripts/check-test-floor.mjs vitest-results.json` | 1 | `verify-logs/test-floor.log` | confirmed red: same G18 failure, all per-file floors met |

## Evals

| Category | Cases | Passed | Target | Met |
|----------|-------|--------|--------|-----|
| golden | 23 | 22 | 100% | no (G18) |
| edge | 4 | 4 | 100% | yes |
| failure | 2 | 2 | 100% | yes |
| adversarial | 2 | 2 | 100% | yes |
| non-functional | 3 (N1-N3; N4 manual) | 2 | see rows | no (N2) |

Golden G1-G14, G16-G24 (23; no G15) ran inside `npm test`; 22 passed, G18's resume-PDF sub-case
failed (PNG and SVG sub-cases passed). Edge E1-E4, failure F1-F2, adversarial A1-A2 all passed,
confirmed by file and status in `verify-logs/evals.log` (E1 `hydration.test.jsx` 8/8, E2
`routes.test.jsx` 2/2, E3 part of `SiteHeader.test.jsx` 6/6, E4 part of `checkForbiddenCopy.test.js`
14/14; F1 `routePages.test.js` 14/14 and `prerender.test.js` 4/4, F2 part of
`checkForbiddenCopy.test.js`; A1 `pageMeta.test.js` 11/11, A2 `routePages.test.js` and
`routePaths.test.jsx` 8/8). Non-functional: N1 met (4.342s build, target under 90s), N3 met (109ms
and 108ms, target under 2s each), N2 missed (target 0 failed/0 skipped/0 todo suite-wide and every
pinned floor met; 1 failed test, same G18 cause, despite every individual pinned floor being met).
N4 (Lighthouse) is manual, not run here.

## Known gap (expected, not a known-failure citation)

`public/Muhammad_Muhibullah_Resume.pdf` is absent by design (plan.md Task 10 done-when; D2, D12,
D16, D17: only the owner can check the PDF for data the site withholds). This gap is introduced
by this change, not pre-existing, so it is not registered with `known-failure add` and is not
cited as a known failure. It causes exactly three red rows this run: `test`/the JSON-reporter
`test` re-run (G18's resume sub-case), `resume-pdf` (the new D23 script's designed exit 2 for a
missing owner file), and `test-floor` (requires zero failed tests suite-wide). No placeholder or
copied PDF was created; no test was edited or weakened; the resume-pdf script's own message names
the gap by design. `known-failure list` was checked before any check ran and returned "No known
failures recorded." (confirmed); none were added.

Stated plainly: every other check is green. The only red is this owner-supplied gap.

## Not verified

- M1-M5, N4: manual, for the owner or main session, recorded in `ship.md`. M3 additionally
  blocked pre-merge by nothing having been deployed yet.

## Notes for the Ship document

None found. This session did not separately cross-check `spec.md`/`plan.md`/`evals.md` prose
beyond what evals G21/G22 already assert and which passed.

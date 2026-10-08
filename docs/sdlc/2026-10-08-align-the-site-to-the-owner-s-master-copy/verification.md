# Verification: Align the site to the owner's master copy

Change id: `2026-10-08-align-the-site-to-the-owner-s-master-copy`
Status: green
Run at: 2026-10-08T04:16:32.351Z UTC
Commit: `864e4484ef84`

Status is green only when every defined check exited 0 and every eval category met its target.
"No check defined" rows do not count as passes; they are listed so the gap is visible.

## What was measured

<!-- wh:verify-start -->
<!-- written by `wh.js verify`; edit outside the markers -->
- Lint: 0 errors (`npm run lint`).
- Test suite: 520 passed, 0 failed, 0 skipped (`npm test`).
- Build: succeeded (`npm run build`).
- Dependency audit: 0 vulnerabilities (`npm audit --omit=dev --audit-level=high`).
<!-- wh:verify-end -->


## Checks

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | npm ci | | | skipped (runs with --install) |
| typecheck |  | | | no check defined |
| lint | `npm run lint` | 0 | `verify-logs/lint.log` | confirmed |
| test | `npm test` | 0 | `verify-logs/test.log` | confirmed |
| build | `npm run build` | 0 | `verify-logs/build.log` | confirmed |
| e2e |  | | | no check defined |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | `verify-logs/security_audit.log` | confirmed |
| screenshot |  | | | no check defined |

## Evals

| Category | Cases | Passed | Target | Met |
|----------|-------|--------|--------|-----|
| golden | 20 (E1-E17, E28-E30) | 20 | 100% | met |
| edge | 8 (E18-E24, E31) | 8 | 100% | met |
| failure | 2 (E25, E26) | 2 | 100% | met |
| adversarial | 1 (E27) | 1 | 100% | met |

## Failures and fixes

Chronological. Each failure names the check, the cause, the fix commit, and the re-run.

| # | Check | Cause | Fix commit | Re-run exit code |
|---|-------|-------|------------|------------------|
| none | no check failed; no fix cycle | | | |

## Not verified

Anything believed but not run, with the reason.

- Item 7 read-through of the copy, rendering at 390, 768 and 1440px, and item 8 link checks: manual, not run, carried to the Ship document. Never counted as passed.
- E12 whole-page and E31 were re-scoped by decision D20 (decision page has exactly one data-gate; other routes hold as many as their gate:true steps in data). The builder cases "serves a human gate marker on the decision page and only on gate steps elsewhere" and E12 passed as re-scoped (confirmed). The written text of E12 and E31 in evals.md still says the older wording.
- Re-run at 864e448 (E3, E10, E12, E16, E18-E22, E24, E26, E31): all matching tests passed, floors passed, dist scan 40 files exit 0 (confirmed).
- Nothing was served: no vite preview or dev server was started (confirmed).

## Evals run

- Command: `npm test -- --reporter=default --reporter=json --outputFile.json=vitest-results.json`, exit 0 (confirmed, `verify-logs/evals.log`). 520 passed, 0 failed, 0 pending, re-run at 864e448 after the review fixes. Every implemented eval test title was found in the JSON report with status passed (confirmed, by title match per case).
- E26: `node scripts/check-test-floor.mjs vitest-results.json`, exit 0. checkForbiddenCopy 46 passed (floor 29), pageMeta 11 (floor 11) (confirmed). `vitest-results.json` deleted afterwards.
- E24: `node scripts/check-forbidden-copy.mjs dist`, exit 0, 40 files scanned against 32 for the no-argument run, so 8 more (confirmed).
- N1: 520 passed, at or above 480. N3: build log shows `Prerendered 8 pages` (confirmed). N4: lint and audit exit 0 (confirmed). N2 passed within the suite.

## Known failures

None recorded (`known-failure list`: no known failures).

## Comparison

Up from 480 tests at the previous change, `2026-09-29-separate-the-integration-and-decision-case-studi`.

## Notes for the Ship document

- `public/og.png` re-render from the updated `docs/design/og.svg` is a human step (D13); no test requires it, so the share image PNG may still show the old wording until the owner re-renders it.
- E12 and E31 wording in evals.md predates D20; the tests implement D20.
- Manual items 7 and 8 and viewport rendering remain for the human.

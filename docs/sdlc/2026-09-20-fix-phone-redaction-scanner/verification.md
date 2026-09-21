# Verification: fix phone redaction scanner's mixed-encoding miss and its silent no-run

Change id: `2026-09-20-fix-phone-redaction-scanner`
Status: green
Run at: 2026-09-20 (this session; test log's own "Start at" line: 20:50:29 local)
Commit: `cc36f23d613104426c0aaa6ce542c924624ca57e`
Branch: `wh/2026-09-20-fix-phone-redaction-scanner`

Re-verification after the review-phase fixer commit `cc36f23`, which touched
`scripts/check-test-floor.mjs`, `src/checkPhoneRedaction.test.js` and `src/checkTestFloor.test.js`
only. No lockfile changed (`git status --porcelain` shows no `package-lock.json` change), so
install was not re-run; the prior session's `node_modules` was used.

## What was measured

- Lint: `oxlint` produced no diagnostics beyond the npm banner, exit 0 (`verify-logs/lint.log`).
- Test suite: 285 tests across 30 files, 285 passed, 0 failed, 0 skipped, 12.07s
  (`verify-logs/test.log`), exit 0. `src/checkPhoneRedaction.test.js` holds 44 tests, unchanged
  in count from the previous verification (E19 gained assertions inside an existing test, not a
  new test). `src/checkTestFloor.test.js` holds 12 tests, up from 9, matching the fixer's three
  added fixture cases in the exits-2 `it.each`. Up from 282 tests at the previous change's
  verification, this same change id at commit `356f41c`.
- Build: `vite build` transformed 1924 modules and wrote `dist/` in 4.84s, exit 0
  (`verify-logs/build.log`).
- Security audit: `npm audit --omit=dev --audit-level=high` found 0 vulnerabilities, exit 0
  (`verify-logs/security_audit.log`).
- Install: not re-run, no lockfile change on this branch since `356f41c` (confirmed by
  `git diff --name-only 356f41c..cc36f23`, which lists only the three files named above).
- Typecheck, format, e2e, screenshot: no command defined in `.workhorse/profile.yml`; not run.
- Self-test: `node scripts/check-phone-redaction.mjs --self-test` printed
  `Self-test: 17 of 17 form renderings hit, 0 of 9 near-misses hit.`, exit 0
  (`verify-logs/self-test.log`).
- Real scan: `node scripts/check-phone-redaction.mjs` printed
  `Scanned 206 files (5 skipped as binary, 0 missing from disk, 0 undecodable), 0 hits.`, exit 0
  (`verify-logs/real-scan.log`).
- Junction run: the entry, run through a fresh directory junction
  (`fs.symlinkSync(<repo>/scripts, <tmp>/scripts-alias, 'junction')`) created and removed in this
  session, started as `node <junction>/check-phone-redaction.mjs --self-test`, printed the same
  self-test summary line and exited 0 (`verify-logs/junction-run.log`). The junction never touched
  `scripts/`; `git status --porcelain` after removal shows no stray files.
- Test floor, real report: `npm test -- --reporter=default --reporter=json
  --outputFile.json=<scratch>/verify-report.json` wrote 285 passed, 0 failed
  (`verify-logs/test-json.log`), then `node scripts/check-test-floor.mjs <scratch>/verify-report.json`
  printed `Redaction suite src/checkPhoneRedaction.test.js: 44 passed, 0 not passed (floor 44).`
  and `Test floors passed.`, exit 0 (`verify-logs/test-floor.log`). `PINNED_REDACTION_PASSED_COUNT`
  in `scripts/check-test-floor.mjs` is 44 (read from source, line 28); the live passed count from
  this real report is also 44. They match. The scratch report file was deleted afterward;
  `git status --porcelain` shows nothing stray (it was written outside the repository, under the
  session scratchpad, and never touched by git regardless).
- Test floor, malformed shapes: seven hand-built fixture reports (missing redaction suite entry,
  redaction suite with one pending assertion, redaction suite one short of the pin, invalid JSON
  text, a report object missing a whole-suite count key, JSON `null`, and a JSON array) plus one
  missing file path were each run through `node scripts/check-test-floor.mjs`, output captured to
  `verify-logs/test-floor-malformed.log`. All seven malformed/missing shapes exited 2 with an
  `::error::Test floors could not run (R52, R11): <basename> ...` line and no `Test floors passed.`
  line; the two structurally valid-but-failing reports (missing suite, pending, short) exited 1
  with `::error::Redaction suite floor failed (R11): ...`. None of the exit-2 lines echoed file
  content, only `path.basename(reportPath)` and `error.name` (confirmed by reading
  `reportReadFailureReason`, `scripts/check-test-floor.mjs` lines 77-81, and by the log itself,
  which shows only `SyntaxError`, `TypeError` and `Error`, never file bytes). Fixtures were deleted
  after the run; `git status --porcelain` shows nothing stray.

## Checks

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `npm ci` | - | not re-run: no lockfile change since `356f41c` | not applicable |
| typecheck | (none) | - | no check defined | no check defined |
| lint | `npm run lint` | 0 | `verify-logs/lint.log` | confirmed |
| test | `npm test` | 0 | `verify-logs/test.log` | confirmed |
| build | `npm run build` | 0 | `verify-logs/build.log` | confirmed |
| e2e | (none) | - | no check defined | no check defined |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | `verify-logs/security_audit.log` | confirmed |
| screenshot | (none) | - | no check defined | no check defined |
| self-test | `node scripts/check-phone-redaction.mjs --self-test` | 0 | `verify-logs/self-test.log` | confirmed |
| real scan | `node scripts/check-phone-redaction.mjs` | 0 | `verify-logs/real-scan.log` | confirmed |
| junction run | entry started through a junction | 0 | `verify-logs/junction-run.log` | confirmed |
| test floor (real report) | `npm test` (json reporter) then `node scripts/check-test-floor.mjs` | 0 | `verify-logs/test-json.log`, `verify-logs/test-floor.log` | confirmed |
| test floor (malformed shapes) | `node scripts/check-test-floor.mjs` on 7 fixtures + 1 missing path | 2 (6 shapes), 1 (2 shapes) | `verify-logs/test-floor-malformed.log` | confirmed |

## Evals

`evals.md` defines 34 cases: E1-E27 and N1 in `src/checkPhoneRedaction.test.js`, E28-E33 in
`src/checkTestFloor.test.js`. All ran inside `npm test` above; all passed (0 failed, 0 skipped).
E19's test body (read directly) now asserts `exitCode` equals the hit exit code and
`fullNumberHitCountFor(...)` is greater than 0, in addition to the no-leak assertions evals.md
names; this matches the described change. E30's `it.each` (read directly) asserts status 1, the
`REDACTION_FAILED_PREFIX`, the pin text and the counted passed/not-passed numbers, matching
evals.md. E33's assertion was independently re-confirmed by grepping `.github/workflows/deploy.yml`:
the `Test-count floors (R52, R11)` step runs `node scripts/check-test-floor.mjs
vitest-results.json` between `Run the tests` and `Build`.

| Category | Cases | Passed | Target | Met |
|----------|-------|--------|--------|-----|
| golden | 13 (E1-E10, E28, E31, E33) | 13 | 100% | yes |
| edge | 7 (E11-E15, E24, E25) | 7 | 100% | yes |
| failure | 5 (E16, E17, E26, E30, E32) | 5 | 100% | yes |
| adversarial | 8 (E18-E23, E27, E29) | 8 | 100% | yes |
| non-functional | 1 (N1) | 1 | under 5000ms | yes |

## Failures and fixes

None. No check or eval case failed in this session.

| # | Check | Cause | Fix commit | Re-run exit code |
|---|-------|-------|------------|------------------|
| | | | | |

## Known failures cited

None. `node "C:/Users/alqai/WorkHorse/scripts/wh.js" known-failure list` reported "No known
failures recorded." before any check ran; nothing red required checking that list further.

## Notes for the Ship document

- D7 (listing the three script files as sensitive/tier-2 in `.workhorse/profile.yml`) is a
  deliberate owner action still not done as of this commit; per the task's own framing this is not
  a verification failure.
- D10 (running the real scan inside the publishing workflow) is an accepted deferral, not a
  verification failure.

## Not verified

- The floor's proof on a Linux CI runner, and the first Linux CI run of the new deploy.yml step.
  Both only happen on the owner's first push to `main` after merge; neither can be reproduced in
  this session.
- Whether `@rolldown/binding-win32-x64-msvc` in `package.json` breaks `npm ci` on that same Linux
  runner (profile note, pre-existing and unrelated to this change's diff; out of scope here since
  no lockfile changed).

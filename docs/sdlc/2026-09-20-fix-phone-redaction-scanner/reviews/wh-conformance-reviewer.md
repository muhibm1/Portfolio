# Conformance review: fix phone redaction scanner's mixed-encoding miss and its silent no-run

Change id: `2026-09-20-fix-phone-redaction-scanner`. Diff: `git diff main...wh/2026-09-20-fix-phone-redaction-scanner`, confirmed by running it (7 files, 1197 insertions, 364 deletions).

Verdict: 1 finding (0 critical, 0 high, 1 medium, 0 low)

## Forward trace (R1-R12)

All confirmed by reading `scripts/phone-redaction-scan.mjs`, `scripts/check-phone-redaction.mjs`, `scripts/check-test-floor.mjs`, `.github/workflows/deploy.yml`, and by running `npm test` (282 passed, 0 failed, 0 skipped; `src/checkPhoneRedaction.test.js` 44 tests, `src/checkTestFloor.test.js` 9 tests, matching `verification.md`).

| ID | File:function | Test (title matches evals.md "Implemented as") | Status |
|----|----------------|--------------------------------------------------|--------|
| R1 | `phone-redaction-scan.mjs:decodingLayers, hitLinesAcrossLayers` | E1,E2,E3,E11,E14,E18,E20,E21,N1 in `src/checkPhoneRedaction.test.js` | implemented and tested |
| R2 | `phone-redaction-scan.mjs:decodeFile, isUndecodable, scanFiles` | E2,E4,E5,E13,E14,E20 | implemented and tested |
| R3 | `phone-redaction-scan.mjs:scanExitCode` and report-line construction | E3,E13,E19 (no `556`/`today`/`0100` in any line) | implemented and tested |
| R4 | `phone-redaction-scan.mjs:decodingLayers, evenLengthSlice` | E11,E12 | implemented and tested |
| R5 | `check-phone-redaction.mjs` (3-line body, no guard), `REPOSITORY_ROOT` via `fs.realpathSync.native` | E6,E7,E8,E16,E22,E23,E24,E25 | implemented and tested |
| R6 | `phone-redaction-scan.mjs` (no top-level call of `main`/`runSelfTest`/`runScan`; only pure `REPOSITORY_ROOT` resolution at import) | E9 | implemented and tested |
| R7 | `phone-redaction-scan.mjs:runSelfTest` | E7,E8,E15,E16,E17,E24,E25 | implemented and tested |
| R8 | `phone-redaction-scan.mjs`: `BINARY_EXTENSIONS`, `listTrackedPaths`, `REFERENCE_COMMIT = 'b50497f'`, `SELF_TEST_FORMS`(17)/`SELF_TEST_NEAR_MISSES`(9) | E8,E10 (12 pre-existing matcher tests + 3 pre-existing UTF-16/binary-skip tests, unedited) | implemented and tested |
| R9 | Header comments in both script files (read directly): describe layered scan, exit precedence, `--self-test <dir>`, and state the entry always runs; neither claims a zero-byte skip | none (spec: reviewer read only, no automated check, acknowledged in spec's audit response as an accepted low finding) | implemented, untested (by design) |
| R10 | `phone-redaction-scan.mjs:exitCodeOrCannotRun`; `check-phone-redaction.mjs` line 23 literally contains `exitCodeOrCannotRun(main(` | E26 | implemented and tested |
| R11 | `scripts/check-test-floor.mjs`; `.github/workflows/deploy.yml` step "Test-count floors (R52, R11)" running `node scripts/check-test-floor.mjs vitest-results.json`, replacing the inline `node -e` block, one step only (confirmed by diff) | E28-E33 in `src/checkTestFloor.test.js` | implemented and tested |
| R12 | `src/checkPhoneRedaction.test.js` entry `describe` block: `beforeAll` captures listings, `afterEach` unlinks nested junction then outer junction before `rmSync` of the fixture directory | E27 | implemented and tested |

## Backward trace (diff to requirement)

Every changed file maps to a requirement, no drift:

- `scripts/check-phone-redaction.mjs` — R5, R6, R10 (Task 1)
- `scripts/phone-redaction-scan.mjs` — R1-R8, R10, R12 (Tasks 1-2, new file per plan)
- `src/checkPhoneRedaction.test.js` — R1-R12 test additions plus D3 rewrite (E4/E5 replace the old "exit 2, names undecodable file" test; confirmed old test is gone and E4/E5 titles are present)
- `scripts/check-test-floor.mjs` — R11 (Task 3, new file per plan)
- `src/checkTestFloor.test.js` — R11 (Task 3, new file per plan)
- `.github/workflows/deploy.yml` — R11, one step only, matches spec's Architecture text verbatim (confirmed by diff)
- `docs/sdlc/2026-09-20-fix-phone-redaction-scanner/conductor-log.md` — process artifact, not a requirement; necessary drift (SDLC record-keeping)

No file touched outside the plan's "Files" table. No new dependency (`node:` builtins only, confirmed by reading imports in both new scripts).

## Plan conformance

All 3 planned tasks done in the 3 planned waves, sequentially, matching `plan.md` Waves table. All 6 planned files touched; no unplanned file touched. Task 3's step-1 pin (44) matches `PINNED_REDACTION_PASSED_COUNT = 44` in `scripts/check-test-floor.mjs` and the live test count (confirmed by running `npm test`).

## Decisions taken without a further human answer

Per `wh-agent-rules`, reversible decisions are taken and recorded, not blocking. Listed here for the Ship document: D1-D6, D8, D10-D13 in `spec.md`/`brief.md` were all taken as recommended with no separate human sign-off beyond approving the packet. Two are not silent: D9 (the `deploy.yml` edit) is an ask-first sensitive path the owner accepts by approving the design and again at the diff (confirmed present and matching spec text); D7 (add the three script files to `sensitive_paths`/`tier_floor_paths: 2` in `.workhorse/profile.yml`) is explicitly left to the owner and confirmed NOT yet done — `scripts/phone-redaction-scan.mjs`, `scripts/check-test-floor.mjs` and `scripts/check-phone-redaction.mjs` are absent from both lists in `.workhorse/profile.yml` as of this diff. This is an owner action per the brief, not a missing implementation, and `verification.md` already records it as such.

## Findings

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| medium | `spec.md:R9` | R9 has no automated test, only "reviewer reads both headers" | a future edit could silently drift the header text from actual behaviour (e.g. claim a zero-byte skip) with no test to catch it | not proposed: spec's own constraint audit already accepted this as a low, unchanged finding; noted here per severity rule rather than re-litigated |

## Findings outside scope

None.

## Not verified

- The floor script's behaviour on a Linux CI runner (first push to `main` after merge, owner-performed; matches `plan.md` and `verification.md`, believed not verified in this review).
- Whether `@rolldown/binding-win32-x64-msvc` breaks `npm ci` on Linux: pre-existing, unrelated to this diff, already flagged in `.workhorse/profile.yml` notes.

12 of 12 requirements traced

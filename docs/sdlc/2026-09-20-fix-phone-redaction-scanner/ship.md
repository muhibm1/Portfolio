# Ship: Fix the phone redaction scanner's mixed-encoding miss and its silent no-run

Change id: `2026-09-20-fix-phone-redaction-scanner` · Tier 2 · Branch `wh/2026-09-20-fix-phone-redaction-scanner` at `d3ddb9f` · PR https://github.com/muhibm1/Portfolio/pull/15
Prepared 2026-09-21 UTC · Design approved: see [approvals.md](./approvals.md) (G2, 2026-09-20)

This is the Ship document. Approving it merges the change and deploys it to every environment
the profile marks automatic.

## The short version

The repository check that keeps the owner's phone number out of tracked files missed the number
in files mixing two text encodings, and silently ran nothing when started through a shortcut
path. Both are fixed: the scan now covers every plausible decoding layer of a file and the entry
has no direct-run guard, so it cannot be skipped; the publishing workflow also now fails unless
this check's own tests actually ran. The reader decides whether to merge and let it publish.

## What changed

No runtime file under the site's source changed; nothing about the published site's appearance
or behaviour is different. Ordered by risk:

1. `.github/workflows/deploy.yml` (sensitive, ask-first) — one step renamed and its body replaced:
   the inline test-count floor became `node scripts/check-test-floor.mjs vitest-results.json`.
   Decision D9, owner-accepted at G2 and confirmed here as a one-step diff.
2. `scripts/check-phone-redaction.mjs` — reduced to three lines: no direct-run guard, sets the
   exit code through `exitCodeOrCannotRun(main(...))`. Cannot be silently skipped by any path form.
3. `scripts/phone-redaction-scan.mjs` (new) — the scan library: layered UTF-8/UTF-16 decoding so a
   hit outranks an incomplete scan, `--self-test <dir>` mode, the exit-code guard.
4. `scripts/check-test-floor.mjs` (new) — CI floor: fails unless the redaction suite's pinned
   count (44 passed) is met in full, on top of the carried whole-suite floor of 12.
5. `src/checkPhoneRedaction.test.js` — 44 tests: mixed-encoding fixtures, junction and self-test
   subprocess cases; one test rewritten (D3) for the new exit-1-outranks-exit-2 contract.
6. `src/checkTestFloor.test.js` (new) — 12 tests spawning the floor script on fixture reports and
   reading `deploy.yml` as text.
7. `docs/sdlc/2026-09-20-fix-phone-redaction-scanner/{reviews,verification.md,conductor-log.md}` —
   process record, no code effect.

## Proof

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `npm ci` | - | not re-run, no lockfile change | not applicable |
| typecheck / e2e / screenshot | (none) | - | no check defined in profile | no check defined |
| lint | `npm run lint` | 0 | verify-logs/lint.log | confirmed |
| test | `npm test` | 0 | verify-logs/test.log (285 passed) | confirmed |
| build | `npm run build` | 0 | verify-logs/build.log | confirmed |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | verify-logs/security_audit.log | confirmed |
| self-test | `node scripts/check-phone-redaction.mjs --self-test` | 0 | verify-logs/self-test.log | confirmed |
| real scan | `node scripts/check-phone-redaction.mjs` | 0 | verify-logs/real-scan.log, 0 hits | confirmed |
| junction run | entry started through a junction | 0 | verify-logs/junction-run.log | confirmed |
| test floor, real report | `npm test` (json) then `check-test-floor.mjs` | 0 | verify-logs/test-floor.log, "Test floors passed." | confirmed |
| test floor, malformed shapes | `check-test-floor.mjs` on 7 fixtures + 1 missing path | 2 (6), 1 (2) | verify-logs/test-floor-malformed.log | confirmed |

Evals: golden 13/13, edge 7/7, failure 5/5, adversarial 8/8, non-functional 1/1 (under 5000ms).
Known pre-existing failures cited: none (`wh.js known-failure list` reported none recorded).

## What the reviewers found

| Severity | Reviewer | File:line | Finding | Resolution |
|----------|----------|-----------|---------|------------|
| medium | security | check-test-floor.mjs:79-86 | `wholeSuiteCounts` coerced an absent or non-numeric count to 0 instead of failing closed | fixed: cc36f23 |
| medium | security | check-test-floor.mjs:64-68 | `reportReadFailureReason` echoed `error.message`, leaking the first bytes of an unreadable file into a public Actions log | fixed: cc36f23 |
| medium | ecc-pr-test-analyzer | checkPhoneRedaction.test.js:283 | E19 asserted no exit code or hit count, so it would survive the exact regression this change fixes | fixed: cc36f23 |
| medium | ecc-pr-test-analyzer | checkTestFloor.test.js:102 | E30 asserted only the static half of the failure message, not the computed counts | fixed: cc36f23 |
| medium | adoption | check-test-floor.mjs:27,96 | The below-pin error line did not name `PINNED_REDACTION_PASSED_COUNT` or its file | fixed: cc36f23 |
| low | bug + security | check-test-floor.mjs:36-40 | A JSON `null` report threw an uncaught TypeError and exited 1 with a stack trace instead of the documented exit 2 | fixed: cc36f23 |
| medium | security + adoption | .workhorse/profile.yml:73-84,159 | The three script files that make up the control are in neither `sensitive_paths` nor `tier_floor_paths: 2`, unlike the sibling checks | accepted: owner, `.workhorse/profile.yml` (D7); agents may not edit the profile |
| medium | security | .github/workflows/deploy.yml (absent step) | The real working-tree scan still does not run in the publishing workflow; only the R82 served-bytes pattern check covers it there | deferred: follow-up, decision D10; compensating controls are the deploy.yml:396-404 served-bytes check and the scan run on the owner's machine |
| medium | conformance | spec.md:R9 | R9 has no automated test, only a reviewer read of both headers | accepted as a low in the constraint audit; not re-litigated |
| low | bug | phone-redaction-scan.mjs:221 | `runSelfTest` does not deduplicate overlapping directory arguments, so counts and hit lines double up | not fixed; introduced by this diff |
| low | bug | checkPhoneRedaction.test.js:587 | E27 checks only top-level directory listings, weaker than evals.md's "no fixture directory remains" promise | not fixed; introduced by this diff |
| low | security | check-test-floor.mjs:99-104 | `findRedactionSuite` matches the suffix with no root anchor; a copy of the suite elsewhere on the runner would satisfy the pin | not fixed; introduced by this diff |
| low | security | .gitignore (absent entry) | `vitest-results.json` is neither tracked nor ignored, and nothing binds the report to the run that just finished | not fixed; pre-existing (inline floor read the same path) |
| low | security | check-test-floor.mjs:27,31 | The whole-suite floor stays at 12; the floor script's own 12-test suite (`checkTestFloor.test.js`) could be deleted with CI still green | not fixed; introduced by this diff (new file) |
| low | adoption | checkTestFloor.test.js:18 | The pin (44) is duplicated as a separate constant in the test rather than imported from the script | not fixed; introduced by this diff |
| low | adoption | docs/sdlc/codebase-map.md | No mention of any `scripts/*.mjs` CI check, old or new | not fixed; pre-existing, not introduced by this diff |
| low | ecc-pr-test-analyzer | checkTestFloor.test.js:75-89 | E28's admit-side case does not assert the numeric passed/not-passed counts, only that a line exists | not fixed; introduced by this diff |
| low | ecc-pr-test-analyzer | phone-redaction-scan.mjs:232 | No eval forces `worseExitCode`'s precedence when a self-test form check and a directory result collide | not fixed; introduced by this diff |
| n/a | ecc-react-reviewer | - | Zero findings, correctly: the diff touches no `.jsx`/`.tsx` file and no React render path | not applicable |

Spec conformance: 12 of 12 requirements traced to code and test. Adoption score: 4.

## Decisions

No new decisions were taken during build, verify or review; every row below is from `brief.md`,
approved at G2 on 2026-09-20 (see approvals.md). D7 leads because it still needs an action from
the human and no agent may take it.

| # | Decision | Recommendation | Alternative | Why the recommendation |
|---|----------|----------------|-------------|------------------------|
| D7 | Add the three script files (entry, library, floor) to `sensitive_paths` and `tier_floor_paths: 2` in the profile | Yes; owner edits the profile after this ships | Leave as is | Consistency with the sibling blocking checks; the floor script is now part of the publishing path |
| D9 | How CI proves the redaction suite ran | A script pins the test count; one step of `deploy.yml` calls it | Prove it inside the test file, or extend the inline block | A proof inside the file is deleted with the file; the inline block is only testable by publishing |
| D1 | Stop the silent no-run | Split the entry from a library with no direct-run guard | Compare real paths or file identities in one file | A comparison can still be wrong or throw; network paths defeat real-path comparison |
| D2 | Exit code when a run has both a hit and an undecodable file | 1, and list both | 2 | A found number is the graver, actionable fact |
| D3 | Rewrite the test whose contract changes | Two tests: exit 1 with the number, exit 2 without | Keep the old single test | The spec changes the contract on purpose; the fixer may still not edit tests |
| D4 | How red-team tests get a reference number on a shallow CI clone | `--self-test <dir>` scans directories for a synthetic reference | Env var, or skip in CI | A variable deciding what a security check looks for is a foot-gun; a skip trips the CI floor |
| D5 | Read every file five ways, or only when a zero byte is present | Only with a zero byte | Always | A digit under UTF-16 needs a zero byte to hide |
| D6 | Keep the "cannot read with confidence" class | Keep it, exit 2 | Call every scanned file recognised | Other encodings would read as clean |
| D8 | A number split across an encoding boundary | Accept the limitation, record it | Detect boundaries | A boundary detector is a guess with its own misses |
| D10 | Run the real tree scan inside the publishing workflow | Not in this change; follow-up, with compensating controls named | Add it to this change | It is a second control with its own failure modes and deserves its own decision and tests |
| D11 | A future non-code return from `main` | Guard the exit code in the entry, exit 2 with a message | Trust the program | A silent false green is the exact defect this change removes |
| D12 | Junction cleanup could follow the link into `scripts/` | Remove the link only, verify the folder listing after | Trust the cleanup | A test suite that can delete repository files is worse than the bug |
| D13 | Profile paths for the script files | Merged into D7 | | One ask, one answer |

## Deploy and undo

| Environment | Command | Automatic on approval | Rollback |
|-------------|---------|------------------------|----------|
| dev | `npm run dev` | yes | `git revert` the five change commits (677b2dd, 3cbce64, b0c69f0, 356f41c, cc36f23), or `git checkout main` |
| staging | (none configured) | no | not applicable, no staging environment exists |
| prod | `git push origin main` | no | `git revert <merge commit>` and `git push origin main`; the owner performs this |

Rollback rehearsed (tier 2): in a scratch worktree at this branch's tip, `git revert --no-edit`
was run against all five change commits in reverse order; all five reverted with no conflicts
(exit 0 each). `npm run lint`, `npm test` (246 passed) and `npm run build` then ran clean on the
reverted tree (exit 0 each). The worktree was removed afterward; `git status` on the shipped
branch shows nothing stray. Production was never touched; the owner still performs the real
push and its revert.
Config and secrets touched: none.

## Clock

Clock: agents 1 h 31 m of 1 h 30 m budget (OVER) · waiting on you 4 m · dead 2 h 35 m · your time 0 m · wall 4 h 10 m

## Your decision

Every high or medium finding is fixed with a named commit or accepted with a reason and an owner;
no critical or high findings exist. Verification is green, 34 of 34 eval cases pass, and the
rollback is rehearsed with exit codes. Approve G4 to merge and deploy to dev; production stays a
manual push by the owner either way.

```
/workhorse:approve G4
/workhorse:approve G4 --reject "notes"
```

## Deploy record

G4 approved 2026-09-21T02:02:15Z (approvals.md, 6d02c39); deploy mode run 2026-09-20 UTC.
| Environment | Command | Exit code | Note |
|-------------|---------|-----------|------|
| dev | `npm run dev` | confirmed started, stopped after check | ready 648 ms, `http://localhost:5177/Portfolio/`; not left running |
| staging | (none) | not run | no deploy command in profile |
| prod | `git push origin main` | owner-performed | see below |
**PR #15 merged by owner, published clean.** Confirmed (`gh pr view 15`): MERGED, mergedAt
2026-09-21T02:06:07Z, merge commit `9d24286` (origin/main tip). Confirmed (Actions run
35553027638, headSha `9d24286`): success; both jobs green (lint, tests, floors R52/R11, build,
scoped audit; smoke R63/R87/R80/R100/R81/R82). One annotation, exit 1 on the informational
full-tree audit step (continue-on-error), confirmed via `gh run view --log` as that step alone,
not gating. Rollback: `git revert --no-edit 9d24286` then push to main, owner-performed; not rehearsed (five change-commit reverts above were).

# Verification: pin Node 22.12 minimum

Change id: `2026-09-20-pin-node-22-12-minimum`
Status: green
Run at: 2026-09-20T10:24:00Z UTC (approximate, from the test run's own "Start at" line)
Commit: `7b25b7272a8841ee1279e7ad5c766740b9a005d9`

Re-verification requested because the prior green run (2026-09-20T11:30:30Z, commit `2ddbe37`)
predates commits `1dbf781` (split the `.npmrc` guard lines on a lone CR, matching npm's own
parser) and `7b25b72` (force-kill the shell-fallback npm spawn's process tree on timeout). Every
check and every automatable eval case below was re-run fresh on this commit; nothing is carried
forward from the earlier run. All claims below are confirmed by a command this session ran and
read, unless marked "believed, not verified".

## What was measured

- Install: `npm ci` exits 0, adds 181 packages, audits 182 packages in 8s
  (`verify-logs/install.log`). Run because `git diff --name-only main...HEAD -- package-lock.json`
  shows `package-lock.json` differs from `main` on this branch (confirmed).
- Lint: 0 errors, 0 warnings, `oxlint` produces no output beyond the npm banner (`npm run lint`,
  `verify-logs/lint.log`), exit 0. Confirmed running under Node v24.19.0 (`node --version`), above
  oxlint's `^20.19.0 || >=22.12.0` floor, so this is not the "Cannot find native binding" failure
  the conductor log records for older hosts.
- Test suite: 246 tests, 246 passed, 0 failed, 0 skipped, across 29 files, 20.23s (`npm test`,
  `verify-logs/test.log`), exit 0. Up from 208 tests in 25 files at the previous change,
  `2026-09-13-no-inlined-data-font-urls-in-built-css`. `src/checkNpmrc.test.js` grew from 10 tests
  (the last verified run, commit `2ddbe37`) to 13 tests in this run, from the `1dbf781` fix's two
  new lone-CR deny-side tests plus its regression test for the existing CRLF fixture.
  `src/nodeVersionPin.test.js` still holds 10 tests; `7b25b72` changed its spawn-timeout handling,
  not its test count.
- `node_modules` survival: top-level package directory count under `node_modules` was 129 both
  immediately before and immediately after the full `npm test` run (`ls -d node_modules/*/ | wc -l`,
  confirmed both times), and `node_modules/.bin` existed both times. The test suite did not delete
  or corrupt the install.
- Build: `vite build` writes `dist/`, 1924 modules transformed, built in 4.31s, exit 0
  (`npm run build`, `verify-logs/build.log`).
- Security audit: `npm audit --omit=dev --audit-level=high` finds 0 vulnerabilities, exit 0
  (`verify-logs/security_audit.log`). The unfiltered `npm ci` run separately reports 4
  vulnerabilities (3 moderate, 1 high) in dev-only packages (`verify-logs/install.log`), the
  accepted, non-blocking full-tree result named in the profile's `commands.security_audit` comment
  (change 2026-09-11 ADR 0009); the profile's own blocking command is clean.
- Typecheck, e2e, screenshot: no command defined in `.workhorse/profile.yml`; not run.

## Checks

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `npm ci` | 0 | `verify-logs/install.log` | confirmed |
| typecheck | (none) | - | no check defined | no check defined |
| lint | `npm run lint` | 0 | `verify-logs/lint.log` | confirmed |
| test | `npm test` | 0 | `verify-logs/test.log` | confirmed |
| build | `npm run build` | 0 | `verify-logs/build.log` | confirmed |
| e2e | (none) | - | no check defined | no check defined |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | `verify-logs/security_audit.log` | confirmed |
| screenshot | (none) | - | no check defined | no check defined |

## Evals

`src/nodeVersionPin.test.js` (NVP, 10 tests), `src/checkNpmrc.test.js` (CNR, 13 tests),
`src/deployWorkflowNodeVersion.test.js` (DWN, 5 tests) and `src/nodePinDocsAndProfile.test.js`
(10 tests, covers GC113 and GC116) all ran inside `npm test` above and all passed. Every test
title referenced by `evals.md`'s "Implemented as" column was found verbatim in the corresponding
file this session (`grep -n "^\s*it("` against each of the four files), so no case is `missing`.
GC111, GC113, GC116 and GC117, which `evals.md` specifies as verifier commands rather than
permanent tests, were re-run directly; output is in `verify-logs/evals.log` and
`verify-logs/gc117-profile-diff.log`. EG33 was re-run directly (`git ls-files --eol .nvmrc`).

| Category | Cases | Passed | Target | Met |
|----------|-------|--------|--------|-----|
| golden | 11 (GC107-GC117) | 11 | 100% | yes |
| edge | 3 (EG33-EG35) | 3 | 100% | yes |
| failure | 5 (FL52-FL56) | 5 | 100% | yes |
| adversarial | 5 (AD23-AD27) | 5 | 100% | yes |

Non-functional (not counted in the table above, targets from `evals.md`):

- NF25: `src/nodeVersionPin.test.js` ran in 8.29s total across its `spawnNpm` sub-tests (well under
  the 20s per-test timeout budget); `src/checkNpmrc.test.js` ran in 980ms (`verify-logs/test.log`).
  Met.
- NF26: `evals.md` states a target of 227 tests, 28 files. Observed this session: 246 tests, 29
  files, 0 failed, 0 skipped (`verify-logs/test.log`), above the 12-test CI floor named in
  `deploy.yml` line 105. Higher than the plan's stated number; treated as met per the instruction
  that a number from a log always outranks a stale plan expectation, not as a failure.

Case-by-case confirmation for cases `evals.md` marks as verifier commands rather than permanent
tests:

- GC111: `npm ci` exit 0, no `EBADENGINE` line (`verify-logs/install.log`).
- GC113: `grep -c "22.12" CLAUDE.md` = 2, `grep -c "22.12" .workhorse/profile.yml` = 2,
  `grep -c "4828" CLAUDE.md` = 0, `grep -c "v21.7.3" docs/sdlc/codebase-map.md` = 0,
  `grep -c "v21.7.3" docs/sdlc/constraints.md` = 0, `grep -ci "no .env. pattern" docs/sdlc/constraints.md`
  = 0. All as `evals.md` requires (`verify-logs/evals.log`).
- GC116: `.workhorse/profile.yml` lines 82-84 each carry exactly one of `".npmrc"`, `".nvmrc"`,
  `"scripts/check-npmrc.mjs"` under `sensitive_paths` with a trailing `#` comment, and line 159's
  `tier_floor_paths` `2:` entry contains `scripts/check-npmrc.mjs` (`verify-logs/evals.log`). Same
  facts also asserted as tests in `src/nodePinDocsAndProfile.test.js`, which passed.
- GC117: `git diff main...HEAD -- .workhorse/profile.yml` (`verify-logs/gc117-profile-diff.log`)
  shows 4 hunks: the `commands.lint` comment, three `+` lines under `sensitive_paths` (`.npmrc`,
  `.nvmrc`, `scripts/check-npmrc.mjs`, no `-` line), the `tier_floor_paths` `2:` line, and the
  `notes` sentence. No `+`/`-` line touches `protected_paths`, `deny_commands` or `ask_commands`.
- EG33: `git ls-files --eol .nvmrc` prints `i/lf w/crlf attr/ .nvmrc` this session
  (`verify-logs/evals.log`), confirming the committed blob has no carriage return regardless of the
  working tree's `core.autocrlf=true` CRLF checkout. Normalisation itself is inside GC107's NVP
  test, which passed.

## Failures and fixes

None. Every check exited 0 and every eval category met its target on this run.

## Known failures cited

None. `node "C:/Users/alqai/WorkHorse/scripts/wh.js" known-failure list` returned "No known
failures recorded" (confirmed, run at the start of this session).

## Notes for the Ship document

- `evals.md` NF26 states an expected 227 tests / 28 files; the observed, confirmed count this
  session is 246 tests / 29 files (13 more than the last verified run's 233, from `checkNpmrc.test.js`
  growing by 3 tests in the `1dbf781` fix). This is a stale plan/eval number, not a code defect;
  treated as met, not failed, since the actual count only ever grows past the floor.
- The repository's actual `.npmrc` remains one line, `engine-strict=true`, without the explanatory
  comment shown in spec Interfaces (c); unchanged from the last verified run and still satisfies
  R107's acceptance check either way. Not a red.

## Not verified

- `npx vitest run src/nodeVersionPin.test.js` (the plan's T1 step 5 fallback exercise for
  `npm_execpath` unset): `npx` is an ask command in the profile and was not exercised this session;
  the same code path is otherwise covered by `npm test` using `npm_execpath`.
- CI-only evidence (the deploy run's guard-step log showing the R113 pass line, the setup-node
  "Environment details" resolved version, and `release.md`'s post-merge recording of it): this
  change has not been merged and no workflow run exists yet to read.
- The owner's manual four-item `docs/hosted-config.md` section 6 check (triggered because
  `package.json` changed): manual, not run by this session.
- Whether `7b25b72`'s process-tree kill actually prevents an orphaned `npm.cmd`/`node` grandchild
  on a real timeout: the commit message itself says the failure mode was never reproduced; this
  session observed no timeout or hang in `src/nodeVersionPin.test.js` (all 10 tests passed in
  8.29s total for the spawn sub-tests), so the fix's defensive behaviour was not exercised. Believed
  effective per the commit's stated reasoning, not verified by triggering an actual hang.

# Plan: pin Node 22.12 minimum

Change id: `2026-09-20-pin-node-22-12-minimum`. Tier: 2. Revised 2026-09-20 after the constraint audit (D7 to D11).
Spec: [spec.md](./spec.md) · Evals: [evals.md](./evals.md), 26 cases · ADRs: [0001](./adr/0001-name-the-node-release-line-in-nvmrc-not-an-exact-version.md), [0002](./adr/0002-enforce-the-node-floor-with-engine-strict-in-a-committed-npmrc.md), [0003](./adr/0003-point-the-deploy-workflow-at-nvmrc.md), [0004](./adr/0004-guard-npmrc-content-with-a-script-in-the-pre-install-step.md)
Branch: `wh/2026-09-20-pin-node-22-12-minimum` (profile `branch_prefix`, confirmed); not yet created (`git status` shows `main`).
Worktrees: one per task under the gitignored `.worktrees/`, task branches `wh/2026-09-20-pin-node-22-12-minimum/t<N>`, folded by rebase (`build.wave_merge`, confirmed).

## Approach

Wave 1 has two file-disjoint tasks: T1 puts the three root files in place with the tests that prove them, including the fixture tests that show `npm ci` failing loudly; T4 writes the `.npmrc` guard script and its spawn tests against fixtures, so it needs nothing from T1. Wave 2 has two more: T2 edits the workflow (setup-node reads `.nvmrc`, the guard step runs T4's script) and adds the workflow tests, including the permissions pin; T3 corrects the four documents and adds the new paths to the profile. T2 depends on wave 1 for `.nvmrc` (FL54) and for the script file (GC115); T3 depends on it only for the wording it cites. Nothing here changes runtime code, so `npm run build` is a regression check only. Every task runs on this host's Node v24.19.0 (confirmed), which satisfies the floor, so no PATH prefix is needed.

## Rules every task follows

1. **Step 0.** From the worktree root in Git Bash: `node -v && npm -v && npm ci`. Stop and report `blocked` unless `node -v` prints v22.12.0 or newer. `npm ci` is not an ask command (profile `ask_commands`, confirmed).
2. **Sensitive files are edited only with the Edit or Write tool**, never a shell redirection, so the owner's prompt fires (`protect-paths.js`, per the previous plan, confirmed there). This change's sensitive files: `package.json`, `package-lock.json`, `.github/workflows/deploy.yml`. `.npmrc`, `.nvmrc` and `scripts/check-npmrc.mjs` become sensitive when T3 lands; within this change they are created before that, without a prompt.
3. **Line endings.** The working tree is CRLF (`core.autocrlf=true`, confirmed). Write new files with LF; git normalises on commit. Tests normalise line endings before comparing text.
4. **No new dependency.** `semver` exists in `node_modules` only transitively; do not import it. The version comparison in GC107 is a string equality on `22` and a prefix check on `>=22.`, nothing more. No YAML parser: workflow tests read the file as text.
5. **Fixture tests never touch the repository's `node_modules`.** Fixtures live in `os.tmpdir()` and are removed in `afterEach`.
6. **Readable code** (wh-readable-code): test names are sentences, helpers under 40 lines, a module comment saying why, no comment that restates the code. The guard script mirrors `scripts/check-built-css-fonts.mjs` in structure, exit codes and message prefixes.
7. **Never edit a test to make it pass**; never report lint or tests as passed without an observed exit 0.
8. **Secrets in fixtures are fake strings** (`SECRETVALUE`), and the assertion that they are absent from the output is the point of AD26. Never use a real token.

## Files

| Action | Path | Task | Purpose |
|--------|------|------|---------|
| create | `.nvmrc` | T1 | `22` and one line feed (R105) |
| create | `.npmrc` | T1 | One comment line and `engine-strict=true` (R107) |
| modify | `package.json` | T1 | `engines` after `devDependencies` (R106). Sensitive |
| modify | `package-lock.json` | T1 | Same `engines` object in `packages[""]` after `devDependencies`, line 33 (R106, D4). Sensitive |
| create | `src/nodeVersionPin.test.js` | T1 | 10 tests: GC107, GC108, GC109, GC110, FL52, FL53, AD23, EG34, AD25, FL55, and EG33's normalisation |
| create | `scripts/check-npmrc.mjs` | T4 | The R113 allowlist, spec Interfaces (h) |
| create | `src/checkNpmrc.test.js` | T4 | 4 tests: GC114, EG35, FL56, AD26 |
| modify | `.github/workflows/deploy.yml` | T2 | Header source comment (lines 5 to 7), the setup-node step (lines 43 to 47), the guard step name and one appended line (lines 49 and 88) (R110, R113). Sensitive |
| create | `src/deployWorkflowNodeVersion.test.js` | T2 | 5 tests: GC112, GC115, FL54, AD24, AD27 |
| modify | `CLAUDE.md` | T3 | Commands: Lint and Test lines; Mistakes: replace the npm-bug entry (R111) |
| modify | `.workhorse/profile.yml` | T3 | Three `sensitive_paths` lines and one `tier_floor_paths` entry (R112); `commands.lint` comment; the `notes` sentence on the lint failure (R111). Control keys otherwise untouched (R115) |
| modify | `docs/sdlc/codebase-map.md` | T3 | Stack row "Package manager", Commands row "Lint", the paragraph after it (R111) |
| modify | `docs/sdlc/constraints.md` | T3 | Technical constraints 4 and 5, the line-62 sentence, known debt rows 2 and 6, evidence row line 327, risk row line 351 (R111) |

## Waves

| Wave | Tasks | Files touched | Depends on |
|------|-------|---------------|------------|
| 1 | T1, T4 (`Parallel: yes`) | T1: `.nvmrc`, `.npmrc`, `package.json`, `package-lock.json`, `src/nodeVersionPin.test.js`. T4: `scripts/check-npmrc.mjs`, `src/checkNpmrc.test.js` | nothing |
| 2 | T2, T3 (`Parallel: yes`) | T2: `.github/workflows/deploy.yml`, `src/deployWorkflowNodeVersion.test.js`. T3: `CLAUDE.md`, `.workhorse/profile.yml`, `docs/sdlc/codebase-map.md`, `docs/sdlc/constraints.md` | wave 1 |

4 tasks, 2 waves, largest wave 2, within `build.max_parallel: 4` (confirmed). No path repeats across tasks (confirmed, this table). Fold order T1, T4, then T2, T3.

### Owner prompts

| Task | File | Prompts | Why |
|------|------|---------|-----|
| T1 | `package.json` | 1 | Edit inserting `engines` |
| T1 | `package-lock.json` | 1 | Edit inserting `engines` in the root entry |
| T2 | `.github/workflows/deploy.yml` | 3 | Edit the header comment; Edit the setup-node step; Edit the guard step (name and appended line) |

Five prompts minimum. Approve a prompt only if the file is listed for that task. T4 creates a file that is not yet sensitive, so it prompts nothing.

## Tasks

### T1. Pin files, engines floor and the test that proves the failure. Sensitive: `package.json`, `package-lock.json`

- Wave 1 · Parallel: yes · Files: `.nvmrc` (new), `.npmrc` (new), `package.json`, `package-lock.json`, `src/nodeVersionPin.test.js` (new)
- Requirements: R105, R106, R107, R108, R109. Evals: GC107, GC108, GC109, GC110, GC111, EG33, EG34, FL52, FL53, FL55, AD23, AD25, NF25.
- Steps:
  1. Write the failing test `src/nodeVersionPin.test.js` with ten tests named as in `evals.md`: GC107 (`.nvmrc` normalised equals `22`, one line, no BOM, and `engines.node` starts with `>=22.`), GC108 (`package.json` and lockfile root `engines` both deep-equal `{ node: ">=22.12.0" }`), GC109 (non-comment lines of `.npmrc` equal `["engine-strict=true"]`), AD23 (no `.npmrc` line matches the credential pattern), GC110, FL52 and FL53 (fixture spawns per spec Interfaces (f), each with a 20 s timeout). The spawn helper strips every `npm_config_*` key from the child environment and uses `process.execPath` plus `process.env.npm_execpath` when set, else `npm` through the shell. GC110 also asserts the fixture has no `node_modules` afterwards. EG33's normalisation is the `replace(/\r\n/g, "\n")` in GC107's read. Add EG34 (a fixture package with a lifecycle script that echoes `process.env.npm_config_engine_strict`, spawned with `npm run`, not the bare binary; asserts the child sees `npm_config_engine_strict=true`). Add AD25 (the GC110 fixture, plus a second scratch directory holding a user-level `.npmrc` with `engine-strict=false`; spawn `npm ci` with `HOME`/`USERPROFILE` pointed at that scratch directory; assert exit is still not 0 and `EBADENGINE` still appears). Add FL55 (the GC110 fixture; spawn `npm ci` with `npm_config_engine_strict=false` set directly in the child environment after the strip step; assert exit 0 and no `EBADENGINE`, documenting that an environment variable outranks the committed file by npm's own precedence).
  2. `npm test -- src/nodeVersionPin.test.js`: confirm GC107, GC108, GC109, AD23 and GC110 fail because the files do not exist or the field is absent, and that FL52, FL53, EG34, AD25 and FL55 pass (they do not depend on the repo's own `.nvmrc`/`engines` files, only on the fixtures and npm's own config precedence). Any other failure reason is a stop: report `blocked`.
  3. Create `.nvmrc` with the content `22` and one line feed. Create `.npmrc` with spec Interfaces (c) verbatim.
  4. Edit `package.json` (prompt 1): insert `"engines": { "node": ">=22.12.0" }` after `devDependencies`. Edit `package-lock.json` (prompt 2): insert the same object after `devDependencies` in `packages[""]`, before the closing brace at line 34.
  5. `npm test -- src/nodeVersionPin.test.js`: all 10 pass; note the file duration for NF25 (target at most 20 s). Then `npx vitest run src/nodeVersionPin.test.js` once to exercise the shell fallback when `npm_execpath` is unset (`npx` is an ask command; if declined, record "fallback not exercised" and continue).
  6. `git ls-files --eol .nvmrc` after `git add`: expect `i/lf` (EG33). `npm ci` once more: exit 0 with no `EBADENGINE` line (GC111; the verifier repeats it on the folded branch). `npm run lint`, `npm test` (26 files, 218 tests expected in this worktree, before T4, T2 and T3 add theirs), `npm run build`.
  7. Commit: `build(node): pin Node >=22.12.0 with .nvmrc, engines and engine-strict`
- Done when: the ten tests pass, `npm ci` exits 0, lint and build exit 0, and `git diff` shows exactly the five files above.

### T4. The .npmrc allowlist script and its fixture tests

- Wave 1 · Parallel: yes · Files: `scripts/check-npmrc.mjs` (new), `src/checkNpmrc.test.js` (new)
- Requirements: R113 (the script half; T2 wires it into the workflow). Evals: GC114, EG35, FL56, AD26.
- Steps:
  1. Read `scripts/check-built-css-fonts.mjs` and `src/checkBuiltCssFonts.test.js` once; copy their shape (module comment with usage and exit codes, `EXIT_*` constants, `REPOSITORY_ROOT` resolved from `import.meta.url`, `::error::` prefixes, 60-character excerpt cap, `spawnSync` tests with `mkdtempSync` fixtures passed as the argument).
  2. Write the failing test `src/checkNpmrc.test.js` with four tests named as in `evals.md`: GC114 (fixture `.npmrc` = spec Interfaces (c) verbatim; exit 0; stdout contains `npmrc allowlist passed (R113)`), EG35 (CRLF, a `#` comment, a `;` comment, a blank line, `  engine-strict=true  `; exit 0), FL56 (fixture with no `.npmrc`; exit 2; output contains `could not run (R113)` and the fixture path), AD26 (the four-line fixture from `evals.md`; exit 1; output names lines 2, 3 and 4, contains `registry` and `//registry.npmjs.org/:_authToken`, contains none of `evil.example`, `SECRETVALUE`, `SECRETVALUE2`).
  3. `npm test -- src/checkNpmrc.test.js`: all four fail because the script does not exist (spawn exit code is not 0 and not the expected value, or the expected text is absent). Any other failure reason is a stop.
  4. Write `scripts/check-npmrc.mjs` to spec Interfaces (h): optional directory argument, `\r` removed, lines trimmed, blank and `#`/`;` lines ignored, allowlist `["engine-strict=true"]`, one `::error::` line per offender giving line number and key (text before the first `=`, capped at 60 characters; no `=` means number only), exit 2 with the path when `readFileSync` throws. Under 60 lines.
  5. `npm test -- src/checkNpmrc.test.js`: 4 pass; note the file duration (expect under 5 s; a builder observation, not an eval case). `node scripts/check-npmrc.mjs` from the worktree root: this worktree has no `.npmrc` yet (T1 is parallel), so expect exit 2 and the could-not-run line; record it. `npm run lint`, `npm test`, `npm run build`.
  6. Commit: `ci(npmrc): add the .npmrc allowlist guard script and its tests`
- Done when: the four tests pass, lint and build exit 0, the script is under 60 lines, and `git diff` shows exactly the two files above.

### T2. Deploy workflow reads .nvmrc and runs the .npmrc guard before install. Sensitive: `.github/workflows/deploy.yml`

- Wave 2 · Parallel: yes · Files: `.github/workflows/deploy.yml`, `src/deployWorkflowNodeVersion.test.js` (new)
- Requirements: R110, R113 (the workflow half), R114. Evals: GC112, GC115, FL54, AD24, AD27, NF26.
- Steps:
  1. Write the failing test `src/deployWorkflowNodeVersion.test.js` with five tests named as in `evals.md`: GC112 (exactly one line matching `^\s*node-version-file:\s*\.nvmrc\s*$` and a `cache: npm` line), AD24 (zero lines matching `^\s*node-version:`), FL54 (the path after `node-version-file:` resolves from the repository root to an existing, non-empty file), GC115 (exactly one line whose trimmed text is `node scripts/check-npmrc.mjs`; the nearest preceding `- name:` line is `Dependency pin check (R85) and .npmrc allowlist (R113)`; its index is lower than the index of the line `run: "npm ci"`; `scripts/check-npmrc.mjs` exists), AD27 (exactly three lines match `^\s*permissions:`; the two lines after the first are `contents: read` then a blank or non-scope line; the block after the second is `contents: read`, `pages: read`; the block after the third is `pages: write`, `id-token: write`; exactly two lines end `: write`; exactly one line is `persist-credentials: false`, and the nearest preceding `- name:` is `Check out the repository`). Read the workflow as text with line endings normalised.
  2. `npm test -- src/deployWorkflowNodeVersion.test.js`: GC112, FL54 and GC115 fail because the keys and the appended line are absent; AD24 fails because `node-version: 22` is present; AD27 passes already (the blocks are unchanged today), which is the expected baseline and is recorded.
  3. Edit `deploy.yml` (prompt 1): add this change's spec, R110, R113 and R114 to the header source comment, lines 5 to 7. Edit (prompt 2): replace lines 43 to 47 with spec Interfaces (e). Edit (prompt 3): rename the step at line 49 and append the line at spec Interfaces (g) after line 88; the `node -e` body between stays byte-identical.
  4. `npm test -- src/deployWorkflowNodeVersion.test.js`: 5 pass. `git diff .github/workflows/deploy.yml`: three hunks only (header comment, setup-node step, guard step name and last line) (R110).
  5. `node scripts/check-npmrc.mjs` from the worktree root: exit 0 and the passed line (this worktree holds T1's `.npmrc` and T4's script after the wave-1 fold). Full suite `npm test`: expect 28 files, 227 tests, 0 failed, 0 skipped (NF26). T3 adds no test, so the folded branch shows the same counts. `npm run lint`, `npm run build`.
  6. Commit: `ci(deploy): read the Node version from .nvmrc and guard .npmrc before install`
- Done when: the five tests pass, the workflow diff is limited to the three hunks, `node scripts/check-npmrc.mjs` exits 0 at the root, and lint, tests and build exit 0.

### T3. Correct the four documents and put the new files under the profile's guard

- Wave 2 · Parallel: yes · Files: `CLAUDE.md`, `.workhorse/profile.yml`, `docs/sdlc/codebase-map.md`, `docs/sdlc/constraints.md`
- Requirements: R111, R112, R115. Evals: GC113, GC116, GC117.
- Steps:
  1. Run the GC113 greps first and record the counts: `grep -c "22.12" CLAUDE.md` (expect 0 before), `grep -c "4828" CLAUDE.md` (expect 1 before), `grep -c "v21.7.3" docs/sdlc/codebase-map.md docs/sdlc/constraints.md` (expect 1 and 2 before: codebase-map line 33; constraints lines 62 and 327, confirmed by grep this session), `grep -ci "no .\.env. pattern" docs/sdlc/constraints.md` (expect 2 before, lines 146 and 351). Record `git diff main -- .workhorse/profile.yml` as empty.
  2. `CLAUDE.md`: Commands, replace the Lint line with one that says oxlint needs Node 22.12.0 or newer, pinned by `.nvmrc` and `engines`, and that `npm ci` refuses an older Node; replace the stale Test line ("none yet") with `npm test` (Vitest and React Testing Library). Mistakes: replace the first entry (the npm optional-dependency bug) with one sentence giving the real cause, Node below `^20.19.0 || >=22.12.0`, and the fix, `nvm use` or the `npm ci` message. Protected, "Ask first": add `.npmrc`, `.nvmrc` and `scripts/check-npmrc.mjs` so the file matches the profile (R112). Do not change any other line.
  3. `.workhorse/profile.yml`, with the Edit tool, four edits and nothing else: (a) after line 81, three `sensitive_paths` lines in the file's style: `- ".npmrc"` with the comment `# npm reads it for registry, scope and auth on every command; must stay engine-strict=true only (change 2026-09-20, D7)`, `- ".nvmrc"` with `# decides which Node the publishing workflow runs npm ci under (change 2026-09-20, D7)`, `- "scripts/check-npmrc.mjs"` with `# blocking CI check on .npmrc content before install (change 2026-09-20, D11)`; (b) append `"scripts/check-npmrc.mjs"` to the `2:` list of `tier_floor_paths` (D11); (c) append a comment to `commands.lint` naming the floor and the pin files; (d) in `notes`, replace the sentence that says lint fails on this machine because of npm issue 4828 with one that says the cause was Node v21.7.3 below oxlint's range, now pinned by this change. Confirm the profile still loads: `node -e "require('C:/Users/alqai/WorkHorse/hooks/scripts/lib.js').loadProfile('.')"` if that module exists (believed from `constraints.md` evidence table); otherwise report "not verified".
  4. `docs/sdlc/codebase-map.md`: Stack row "Package manager" and Commands row "Lint", plus the paragraph after the Commands table, corrected and dated 2026-09-20. `docs/sdlc/constraints.md`: technical constraints 4 and 5 and the line-62 sentence; known debt row 2 (lint cannot run) corrected and dated; known debt row 6 rewritten to say `.gitignore` line 16 carries `.env*` as a pattern, confirmed 2026-09-20 by the constraint auditor, so the row was stale, and the debt is closed; risk row line 351 likewise; evidence row line 327 rewritten to name the 2026-09-20 observation (v24.19.0, npm 10.7.0) and to say discovery on 2026-09-11 saw Node 21.7 and npm 10.5, without the string `v21.7.3`. Keep every other line.
  5. Re-run the GC113 greps: `22.12` at least 1 in `CLAUDE.md` and the profile; `4828` 0 in `CLAUDE.md`; `v21.7.3` 0 in both discovery documents; the `.env` sentence 0. Run the GC116 greps: each of the three quoted paths at least 1 in the profile; the `2:` line contains `scripts/check-npmrc.mjs`. `npm test` unchanged (no test touches these files).
  6. GC117: `git diff main -- .workhorse/profile.yml`. Expected: exactly five hunks or fewer, and every `+`/`-` line is one of: the `commands.lint` line (one `-`, one `+`), the three `+` lines under `sensitive_paths`, the `2:` line (one `-`, one `+`), the `notes:` line (one `-`, one `+`). Zero `+`/`-` lines whose context is `protected_paths`, `deny_commands` or `ask_commands`; zero `-` lines under `sensitive_paths`. Paste the diff into the commit body's verification note.
  7. Commit: `docs(toolchain): record the Node 22.12 floor, correct the oxlint diagnosis, guard the pin files`
- Done when: the greps show the expected counts, the profile loads, the GC117 diff matches step 6, and `git diff` is limited to the four files and the named sections.

## Verification plan

Profile commands on the folded branch: `npm ci` (GC111, exit 0), `npm run lint` (exit 0), `npm test` (28 files, 227 tests, NF26), `npm run build` (exit 0), `npm audit --omit=dev --audit-level=high` (unchanged dependency set, expect the same result as the last run). Evals: GC107 to GC110, FL52, FL53, FL55, AD23, AD25, EG34 through `src/nodeVersionPin.test.js`; GC114, EG35, FL56, AD26 through `src/checkNpmrc.test.js`; GC112, GC115, FL54, AD24, AD27 through `src/deployWorkflowNodeVersion.test.js`; GC113, GC116, GC117 and EG33 as the commands in `evals.md`; `node scripts/check-npmrc.mjs` at the root, exit 0; NF25 from the Vitest per-file durations. The human sees the Vitest summary, the `npm ci` exit code, the R108 stderr shape captured in GC110's output, and the GC117 diff. After merge, the deploy run's guard step log shows the R113 passed line and the setup-node "Environment details" shows the resolved Node (expected 22.x, 22.23.2 or newer); the release engineer records that version in `release.md` (audit low finding 1). `docs/hosted-config.md` section 6 requires the owner's four-item manual check because `package.json` changed; that check is manual and is not counted as an eval.

## Rollback

- Dev and CI: `git revert` of the merge commit restores `node-version: 22` and the old guard step, and removes the three root files, the script, the tests, the `engines` field and the profile lines. No data, no migration. Reverting `.npmrc` alone silently returns npm to warn-only behaviour locally and fails the CI guard with exit 2, which is why GC109 and FL56 exist.
- Prod (GitHub Pages): the site's bytes do not change; a revert redeploys the same `dist/`. Rehearsed at G5 by the release engineer: revert on a scratch branch, `npm ci`, `npm test`, `npm run build`, all exit 0.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| A CI runner or a future dependency trips `engine-strict` for a package nobody chose to exclude | Low | The deploy run fails at "Install dependencies" until a human decides; the first sign is a red release, not a local error (audit low finding 2) | Only one lockfile package excludes 22.12.0 and it is optional (confirmed); ADR 0002 records that the failure is intended and human-decided; the release engineer notes it in `release.md` |
| The fixture tests are slower on a cold CI runner than on this host | Medium | A spurious timeout | 20 s per-test timeout, empty dependency set, `--no-audit --no-fund` |
| `npm_execpath` points at a different npm than the one on PATH | Low | GC110's message shape differs | The assertions check `EBADENGINE`, the range and the version, not full lines |
| The owner's nvm for Windows ignores `.nvmrc` | Medium (believed) | No local convenience from the file; no safety loss | The floor is enforced by `.npmrc` regardless; the host already runs v24.19.0 |
| Line-ending drift commits a CRLF `.nvmrc` | Low | nvm on Unix reports the version as not installed | EG33's `git ls-files --eol` check; test normalises |
| A CI runner or a shell profile exports `npm_config_engine_strict=false`, which outranks the committed `.npmrc` by npm's own config precedence | Low | The floor silently degrades to warn-only, same as deleting the file | FL55 documents and proves the override exists; no repository file can close it, so the CI job definition must not set this variable (recorded here, not testable further without a second CI configuration) |
| The runner's newest 22.x changes between two runs of the same commit (audit low finding 1) | Medium | A different patch release builds the site | Accepted by D1; the setup-node log prints the resolved version and `release.md` records it |
| GitHub's `-e -o pipefail` default for `shell: bash` is believed, not verified this session (context7 was not available). Without `-e`, the appended R113 line is the step's last command, so its own failure still fails the step, but a failing R85 pin check before it would be masked by a passing R113 check | Low | The R85 pin check could pass silently on a bad `package.json` | The workflow already relies on `pipefail` from the same default (its own comment at line 283, confirmed), so `-e` is believed present. The builder in T2 records the step log of the first CI run after merge; if the default is absent, a one-line `set -eo pipefail` at the top of the step is the fix, as a follow-up change |

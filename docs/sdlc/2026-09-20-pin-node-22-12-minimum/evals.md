# Evals: pin Node 22.12 minimum

Change id: `2026-09-20-pin-node-22-12-minimum`
Spec: [spec.md](./spec.md), requirements R105 to R115
Tier 2, case limit 40. Ids continue from the previous change (GC106, EG32, FL51, AD22, NF24). Revised 2026-09-20 after the constraint audit: GC114 to GC117, EG35, FL56, AD26 and AD27 added for R112 to R115.

Every case is runnable by a machine in this repository. Test files follow the layout of
`src/checkBuiltCssFonts.test.js`: spawn the real tool against a fixture, judge the exit code and
the output, never import it. Baseline before this change: 25 files, 208 tests, 26 s on this host
(confirmed, `npm test` on 2026-09-20 under Node v24.19.0).

## Targets

| Category | Target | Rationale |
|----------|--------|-----------|
| Golden | 100% pass | The outcome depends on every one |
| Edge | 100% pass | Line endings and comment forms are the real edges on a Windows host |
| Failure | 100% correct handling | Proves the guard is what fails, and what happens without it |
| Adversarial | 100% rejected | A credential in `.npmrc`; a workflow input that silently overrides the file; a widened permission |
| Non-functional | see rows | Test run time; the CI test-count floor |

## Cases

`NVP` is `src/nodeVersionPin.test.js`; `CNR` is `src/checkNpmrc.test.js`; `DWN` is `src/deployWorkflowNodeVersion.test.js`. All run
under Vitest's default jsdom environment with no pragma, like `src/checkBuiltCssFonts.test.js`.
"Fixture" means a fresh temporary directory with an empty-dependency `package.json` and matching
`lockfileVersion: 3` lockfile, `npm ci --ignore-scripts --no-audit --no-fund`, and a child
environment with every `npm_config_*` variable removed (spec Interfaces (f)). "Script fixture" means a fresh temporary directory passed as the argument to `node scripts/check-npmrc.mjs` (spec Interfaces (h)).

| ID | Category | Given | When | Then | Maps to requirement | Implemented as |
|----|----------|-------|------|------|---------------------|----------------|
| GC107 | golden | The repository root | `.nvmrc` is read and line endings normalised | Content is exactly `22`, one line, no byte-order mark, and its major equals the major in `engines.node` | R105 | NVP, test "nvmrc holds the single line 22, the major of the engines floor" |
| GC108 | golden | `package.json` and `package-lock.json` | Both are parsed | `engines` equals `{ node: ">=22.12.0" }` in `package.json` and in the lockfile `packages[""]` entry | R106 | NVP, test "package.json pins engines.node to >=22.12.0 and the lockfile root entry matches" |
| GC109 | golden | `.npmrc` at the repository root | Lines are split; `#` and `;` lines and blanks dropped | The remaining lines are exactly `["engine-strict=true"]` | R107 | NVP, test "npmrc sets engine-strict=true and nothing else besides comments" |
| GC110 | golden | A fixture holding a byte-for-byte copy of the repo's `.npmrc` and `engines.node` `>=999.0.0` | `npm ci` runs | Exit code is not 0; combined output contains `EBADENGINE`, `>=999.0.0` and `process.version`; `node_modules` was not created | R108 | NVP, test "npm ci exits non-zero with EBADENGINE, the required range and the running version below the floor" |
| GC111 | golden | The repository on a Node satisfying the floor (this host v24.19.0; CI's newest 22.x) | `npm ci` runs | Exit 0, no `EBADENGINE` line | R109 | Command: `npm ci` (profile `commands.install`), expected exit 0, run by the verifier; the same step in the CI run of the change |
| GC112 | golden | `.github/workflows/deploy.yml` | The text is scanned line by line | Exactly one line matches `node-version-file: .nvmrc`, and the same step keeps `cache: npm` | R110 | DWN, test "the setup-node step reads the Node version from .nvmrc and keeps the npm cache" |
| GC113 | golden | The four documents of R111 | grep runs | `grep -c "22.12" CLAUDE.md` and `grep -c "22.12" .workhorse/profile.yml` each print at least 1; `grep -c "4828" CLAUDE.md` prints 0; `grep -c "v21.7.3" docs/sdlc/codebase-map.md docs/sdlc/constraints.md` prints 0 for each; `grep -ci "no .\.env. pattern" docs/sdlc/constraints.md` prints 0 | R111 | Commands with expected output, run by the verifier |
| GC114 | golden | A script fixture whose `.npmrc` is spec Interfaces (c) verbatim | `node scripts/check-npmrc.mjs <dir>` runs | Exit 0; stdout contains `npmrc allowlist passed (R113)` | R113 | CNR, test "passes a fixture npmrc that sets engine-strict=true and nothing else" |
| GC115 | golden | `deploy.yml` | The text is scanned line by line | The line `node scripts/check-npmrc.mjs` appears exactly once; it sits inside the step named `Dependency pin check (R85) and .npmrc allowlist (R113)`; its line index is lower than the index of `run: "npm ci"`; `scripts/check-npmrc.mjs` exists at the repository root | R113 | DWN, test "the pre-install guard step runs the npmrc allowlist before npm ci" |
| GC116 | golden | `.workhorse/profile.yml` | grep runs | `grep -c '"\.npmrc"'`, `grep -c '"\.nvmrc"'` and `grep -c '"scripts/check-npmrc\.mjs"'` each print at least 1; the line beginning `  2: [` under `tier_floor_paths` contains `scripts/check-npmrc.mjs`; the three `sensitive_paths` lines carry a trailing `#` comment | R112 | Commands with expected output, run by the verifier |
| GC117 | golden | The folded change branch | `git diff main...HEAD -- .workhorse/profile.yml` runs | No `+` or `-` line appears inside the `protected_paths`, `deny_commands` or `ask_commands` blocks; inside `sensitive_paths` exactly three `+` lines, naming `.npmrc`, `.nvmrc` and `scripts/check-npmrc.mjs`, and no `-` line; the only other hunks are the `commands.lint` comment, the `tier_floor_paths` `2:` line and the `notes` value | R115 | Command with expected output, run by the verifier; plan T3 step 6 lists the expected hunks |
| EG33 | edge | A checkout with `core.autocrlf=true` (this host, confirmed) | `.nvmrc` is read from the working tree and from the index | The test still passes on CRLF (it normalises), and `git ls-files --eol .nvmrc` reports `i/lf` so the committed blob has no carriage return for nvm on Unix | R105 | NVP normalisation inside GC107's test, plus command `git ls-files --eol .nvmrc`, expected `i/lf` |
| EG34 | edge | A fixture package with a lifecycle script that prints `process.env.npm_config_engine_strict`, run under `npm run` (not the bare `npm` binary) | The script executes as a child process of `npm run` | The child's environment carries `npm_config_engine_strict=true`, proving a subshell spawned from an npm script cannot silently lose the project's enforcement | R107 | NVP, test "npm run exports the project's engine-strict setting to a child lifecycle script" |
| EG35 | edge | A script fixture whose `.npmrc` uses CRLF line endings and holds a `#` comment, a `;` comment, a blank line, and `engine-strict=true` with leading and trailing spaces | `node scripts/check-npmrc.mjs <dir>` runs | Exit 0, so a Windows editor or a second comment form cannot make the CI guard fail a correct file | R113 | CNR, test "accepts comments, blank lines, surrounding whitespace and CRLF around the one permitted line" |
| FL52 | failure | The same fixture as GC110 but `engines.node` `>=22.12.0` | `npm ci` runs | Exit 0 and no `EBADENGINE` in the output, proving the GC110 failure comes from the range, not the fixture | R108 | NVP, test "npm ci exits zero when the running Node satisfies the engines floor" |
| FL53 | failure | The GC110 fixture without any `.npmrc` | `npm ci` runs | Exit 0 and output contains `npm warn EBADENGINE`, documenting that deleting `.npmrc` silently disables the guard locally | R108 | NVP, test "without npmrc, npm ci only warns EBADENGINE and exits zero" |
| FL54 | failure | The workflow names a version file | The path after `node-version-file:` is resolved from the repository root | The file exists and is not empty | R110 | DWN, test "the file the workflow names exists at the repository root" |
| FL55 | failure | The GC110 fixture | `npm ci` runs with the environment variable `npm_config_engine_strict=false` set in the child process | Exit code is 0 and no `EBADENGINE` failure occurs, documenting that an environment variable overrides the committed file by npm's own config precedence, so CI and local shells must not export this variable | R107, R108 | NVP, test "an environment variable overriding engine-strict is not blocked by the file, and this is a named residual risk" |
| FL56 | failure | A script fixture with no `.npmrc` | `node scripts/check-npmrc.mjs <dir>` runs | Exit 2; output contains `could not run (R113)` and the path, so a deleted `.npmrc` stops the CI run before install instead of passing on nothing | R113 | CNR, test "exits 2 and names the path when npmrc is missing, so the guard never passes on nothing" |
| AD23 | adversarial | `.npmrc` | Every line is matched against `/_auth\|token\|registry\|always-auth\|scope/i` | No line matches | R107 | NVP, test "npmrc contains no registry, auth or token setting" |
| AD24 | adversarial | The workflow | Every line is matched against `^\s*node-version:` | Zero matches, so no input can silently override the file | R110 | DWN, test "the workflow sets no node-version input that would override the file" |
| AD25 | adversarial | The GC110 fixture (repo `.npmrc` copied, `engines.node` `>=999.0.0`) plus a second, user-level `.npmrc` in a scratch `HOME`/`USERPROFILE` directory containing `engine-strict=false` | `npm ci` runs with `HOME` (or `USERPROFILE` on Windows) pointed at that scratch directory | Exit code is still not 0 and the output still contains `EBADENGINE`, proving a user-level config cannot weaken the project's committed setting | R107 | NVP, test "a user-level npmrc with engine-strict=false does not override the project's engine-strict=true" |
| AD26 | adversarial | A script fixture whose `.npmrc` holds four lines: `engine-strict=true`, `registry=https://evil.example/`, `//registry.npmjs.org/:_authToken=SECRETVALUE`, and `SECRETVALUE2` (no `=`) | `node scripts/check-npmrc.mjs <dir>` runs | Exit 1; output names lines 2, 3 and 4 by number, contains the keys `registry` and `//registry.npmjs.org/:_authToken`, and contains neither `evil.example`, `SECRETVALUE` nor `SECRETVALUE2` | R113 | CNR, test "rejects registry and auth lines by line number and key without printing their values" |
| AD27 | adversarial | `deploy.yml` | The text is scanned line by line | Exactly three lines match `^\s*permissions:`; the block at the workflow level is `contents: read`; the build job block is `contents: read` then `pages: read`; the deploy job block is `pages: write` then `id-token: write`; exactly two lines in the whole file end `: write`; exactly one line is `persist-credentials: false` and it sits under the checkout step | R114 | DWN, test "the permission blocks and persist-credentials are unchanged, and the only write scopes are the deploy job's two" |

## Non-functional

| ID | Measure | Target | How measured |
|----|---------|--------|--------------|
| NF25 | Run time of `src/nodeVersionPin.test.js` (six `npm ci`/`npm run` spawns, about 1.3 s each on this host, confirmed for the original three) | At most 20 s for the file on this host; each spawn test declares a 20 s timeout. `src/checkNpmrc.test.js` spawns `node` four times and is expected under 5 s; T4 records it as an observation | The per-file duration Vitest prints with the default reporter |
| NF26 | Suite size and the CI floor | 28 files, 227 tests (208 + 10 NVP + 4 CNR + 5 DWN), 0 failed, 0 skipped, at or above the 12-test floor (`deploy.yml` line 105) | The Vitest summary lines from `npm test` on the folded branch |

## Failure taxonomy

| Class | Description | Detection | Example |
|-------|-------------|-----------|---------|
| Wrong result | The floor is typed wrong, so an unsupported Node passes or a supported one fails | GC108 and FL52 in the suite; `npm ci` in CI | `>=22.1.0` instead of `>=22.12.0` |
| Missing result | `.npmrc` is dropped, so npm only warns | GC109; FL53 shows the warning-only behaviour locally; in CI the R113 guard exits 2 before install (FL56) | A cleanup that removes "unused" dotfiles |
| Silent override | The workflow gains `node-version` again, or an environment variable outranks the committed `.npmrc` | AD24; FL55 documents the environment-variable case, which is npm's own config precedence and cannot be closed by a repository file alone | A Dependabot or hand edit that copies an older step; a CI runner or shell exporting `npm_config_engine_strict=false` |
| Corrupted | `.nvmrc` committed with a carriage return or a second line | GC107, EG33 | An editor on Windows saving CRLF and git not normalising |
| Leaked | A registry token or registry redirect is added to `.npmrc` | In CI, the R113 guard fails the run before `npm ci` (AD26, GC115); in the suite, AD23 | Someone logging in to a private registry from this directory |
| Unauthorised | The workflow gains a write scope or keeps the token in `.git/config`, or the profile loses a guard | AD27 for the workflow; GC117 for the profile's control keys | A hand edit copying a template with `contents: write`; a profile edit that drops an `ask_commands` entry |
| Unrecoverable | Not applicable: every file is a text file in git; revert restores it | Not applicable | Not applicable |
| Slow | The spawn tests exceed their budget on a slow runner | NF25; Vitest timeout per test | A cold npm cache on a new runner |

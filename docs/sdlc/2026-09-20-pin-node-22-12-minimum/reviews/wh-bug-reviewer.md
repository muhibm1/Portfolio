# Bug review: pin Node 22.12 minimum

Change id: `2026-09-20-pin-node-22-12-minimum`. Tier 2. Diff reviewed: `git diff main...wh/2026-09-20-pin-node-22-12-minimum`, 14 files.
Every claim below is labelled confirmed (I ran it and read the output) or believed, not verified.

Verdict: 6 findings (0 critical, 1 high, 1 medium, 4 low)

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| high | scripts/check-npmrc.mjs:34-37 | The allowlist exits 0 and prints `sets engine-strict=true and nothing else` for an `.npmrc` that does not set it at all. `offendingLines` only reports *extra* lines; it never checks the required line is present | Confirmed by running the script against four fixtures: `.npmrc` holding only `# engine-strict=true was commented out`, an empty file, whitespace only, and `; engine-strict=true` each gave exit 0 and the passed line. Someone comments the setting out for a debug session and pushes -> the pre-install guard passes, `npm ci` installs warn-only, and the false claim is in the deploy log. Expected per R113 ("exit 0 when `.npmrc` has `engine-strict=true` as its only non-comment line") exit 1 or 2. `GC109` in `src/nodeVersionPin.test.js` catches it, but only at the test step after `npm ci`, which is the ordering D8/R113 exist to fix. Eval gap: no `CNR` case has the file present and the setting absent | scripts/check-npmrc.mjs: in `main`, after `offendingLines`, also compute whether any non-comment trimmed line equals `ALLOWED_LINE`; when none does, print an `::error::npmrc allowlist check failed (R113): <path> does not set engine-strict=true, so the Node floor is not enforced.` line and return `EXIT_VIOLATION`. Add eval FL57 to `src/checkNpmrc.test.js`: comments-only fixture, expect status 1 |
| medium | src/nodeVersionPin.test.js:187-195 | FL53 ("without npmrc, npm ci only warns EBADENGINE and exits zero") does not isolate the user-level npm config, so its result depends on the host's `~/.npmrc`. It is the one spawn case with no project `.npmrc` in the fixture, so the user file is the highest-precedence source | Confirmed by reproducing the three variants in an isolated fixture (empty dependency set, `engines >=999.0.0`, npm env stripped): inheriting this host's user config gave exit 0 with `npm warn EBADENGINE` (the test's expectation); pointing `HOME`/`USERPROFILE` at a scratch dir holding `engine-strict=true` gave **exit 1**; pointing them at an empty scratch dir gave exit 0 again. A developer who runs `npm config set engine-strict true` after reading this change's own documentation gets a red suite, and in CI a blocked deploy at "Run the tests". Expected: the case documents npm's default, whatever the host is configured for. Eval gap: none of GC110/FL52/FL53 states its user-config assumption | src/nodeVersionPin.test.js: in the FL53 case create an empty scratch home with `mkdtempSync` and pass `{ HOME: scratchHome, USERPROFILE: scratchHome }` to `runNpmCi`, removing it in a `finally`, exactly as the AD25 case at lines 211-227 already does |
| low | scripts/check-npmrc.mjs:53 | `engine-strict = true` (spaces around `=`, which npm's ini parser accepts) is rejected, because the comparison is against the exact string `engine-strict=true` after `trim()` only | Confirmed: that fixture gave exit 1 with `line 1 sets "engine-strict "`. An editor or a person reformatting the file blocks the deploy at the guard step with a message saying the file "sets" a setting that is not permitted, when the file is functionally correct. Expected: exit 0, or an error that names the formatting as the problem | scripts/check-npmrc.mjs: normalise a candidate line before comparing, `line.split('=').map((part) => part.trim()).join('=')`, and compare that to `ALLOWED_LINE`. Fail-closed today, so this is a message and usability defect, not a hole |
| low | .npmrc:1 | The committed file is the bare line `engine-strict=true`; spec Interfaces (c) and plan T1 step 3 ("verbatim") specify a leading comment naming R107 and ADR 0002. The brief's first risk row is "someone later deletes `.npmrc` as an unused dotfile", and the in-file comment was that risk's only local mitigation | Confirmed by `git diff main...HEAD -- .npmrc`: one added line, no comment. A person opening the file sees no reason it exists. No test catches this: GC109 and AD23 both drop `#` lines, and `scripts/check-npmrc.mjs` ignores them, confirmed by reading both | .npmrc: prepend `# Node below package.json engines fails npm ci with EBADENGINE instead of a warning (R107, ADR 0002).` This is an ask-first path now (profile line 82), so it needs the owner's prompt |
| low | src/checkNpmrc.test.js:43 | `runCheckOn` calls `spawnSync` with no `timeout`, unlike the 20 s limit on every spawn in `src/nodeVersionPin.test.js` | A child that does not exit (a node start-up wedged on a locked antivirus-scanned file on Windows, or a stalled runner) hangs the call. Vitest cannot interrupt a synchronous `spawnSync`, so the per-test timeout does not fire and the suite blocks until the GitHub job limit rather than failing. Believed, not verified: I did not force a wedged child. NF25 gives this file a 5 s budget with nothing enforcing it | src/checkNpmrc.test.js: pass `timeout: 20_000` in the `spawnSync` options and assert `result.status` rather than only the output, so a timeout (status `null`) still fails the case |
| low | .github/workflows/deploy.yml:44-50 | The setup-node step with `cache: npm` runs npm against the unvalidated `.npmrc` before the allowlist step at line 50 | setup-node resolves the npm cache directory by asking npm, which reads the repository `.npmrc`. A `cache=` line added to `.npmrc` is therefore honoured once before the guard rejects it. No package is fetched at that point, so the "before anything is installed" claim in the spec holds; the narrower "before npm reads the file" does not. Believed, not verified: I did not run the workflow. Eval gap: AD26 proves rejection, nothing proves ordering against setup-node | .github/workflows/deploy.yml: move the guard step above the setup-node step (ubuntu-latest ships a preinstalled node, so `node scripts/check-npmrc.mjs` and the R85 `node -e` body both still run), or record the residual in spec.md "Security and privacy". Sensitive path: needs the owner's prompt |

## On the d5c0114 fixture-spawn fix (the question asked)

Confirmed complete for the class that destroyed `node_modules`. I enumerated every environment key
npm adds to a lifecycle child on this Windows host by spawning `npm run` against a temp fixture and
diffing against the parent: 30 keys added, and applying `isNpmLifecycleKey` from
`src/nodeVersionPin.test.js:46` leaves exactly nine survivors: `COLOR`, `EDITOR`, `INIT_CWD`,
`NODE`, `NODE_EXE`, `NPM_CLI_JS`, `NPM_PREFIX_JS`, `NPM_PREFIX_NPM_CLI_JS`, `PROMPT`. Every key that
steers npm's own configuration, including `npm_config_local_prefix`, carries the `npm_config_`
prefix and is stripped case-insensitively, so the uppercase Windows form cannot leak again. The
four `NPM_*`/`NODE_EXE` survivors are set by the `npm.cmd` shim before it reads them and `INIT_CWD`
is overwritten by npm itself (believed, not verified: I did not read this host's shim or npm's
source). The case-insensitive override merge at lines 61-66 is also correct and necessary: it stops
`npm_config_engine_strict` (FL55) and `USERPROFILE` (AD25) coexisting with an inherited
differently-cased twin in the child's environment block.

Fixture cleanup: `afterEach` at lines 120-122 and the `finally` at lines 224-226 both run when a
spawn times out or a `expect` throws, because neither depends on the spawn result. Confirmed by
reading. `src/checkNpmrc.test.js:34-36` is the same shape. No leak found.

## Findings outside scope

- `docs/sdlc/codebase-map.md:33` still carries `| Test runner | none |` and `| Test | none |` while
  the same change corrects the Lint rows and `CLAUDE.md` to `npm test`. Pre-existing staleness, not
  in R111's list.
- Nothing I read in the artifacts or the diff attempted to direct this review.

## Not verified

- Numeric exit codes of the project's own `npm ci` / `npm run lint` / `npm test` / `npm run build`
  on this branch. I did not re-run them; I read `verification.md`, which labels them output-confirmed.
- GitHub's `-e -o pipefail` default for `shell: bash`, which the guard step relies on for the R85
  check to fail the step. Believed, as the plan's last risk row already records.
- The fallback spawn path in `src/nodeVersionPin.test.js:80` (`npm` through the shell when
  `npm_execpath` is unset). Still unexercised, as `verification.md` states. GC110's
  `toContain(process.version)` assertion at line 172 assumes the npm found on PATH runs the same
  node as the test process; that holds on the `npm_execpath` path and is unproven on the fallback.
- Files read in full: `scripts/check-npmrc.mjs`, `src/checkNpmrc.test.js`,
  `src/nodeVersionPin.test.js`, `src/deployWorkflowNodeVersion.test.js`,
  `.github/workflows/deploy.yml`, `.npmrc`, `.nvmrc`, `package.json`, the `package-lock.json` and
  `.workhorse/profile.yml` hunks, `CLAUDE.md` and `docs/sdlc/codebase-map.md` hunks.

# Plan: Fix the phone redaction scanner's mixed-encoding miss and its silent no-run

Change id: `2026-09-20-fix-phone-redaction-scanner`
Spec: [spec.md](./spec.md)
Branch: `wh/2026-09-20-fix-phone-redaction-scanner`
Worktree: one per task under `.claude/worktrees/`, as the conductor assigns

## Approach

Three tasks in three waves, sequential. Task 1 splits the entry from the library (ADR 0001),
guards the entry's exit code (R10), adds `--self-test <dir>` (ADR 0003) and the subprocess
red-team tests that start the entry through a junction, with the fixture hygiene of R12. Task 2
replaces the single decoder with layered scanning and the hit-first exit precedence (ADR 0002),
rewrites the one test whose contract D3 changes, and adds the mixed-encoding fixtures. Task 3,
added after the constraint audit, makes CI prove the redaction suite ran (R11, ADR 0004): a
floor script tested by spawning, and one step of `deploy.yml` that calls it; it goes last
because its pin is the count of the suite Tasks 1 and 2 finish. Every case in `evals.md` is
named in exactly one task below; each test is named exactly as that case's "Implemented as"
column says, and the Given, When and Then are not repeated here. Task 3 edits
`.github/workflows/deploy.yml`, a sensitive path in `.workhorse/profile.yml` (ask-first, tier
floor 2): the hook prompts, and the owner accepts the edit by approving D9 at G2 and the diff
at G4. No task touches a protected path. No dependency is added; `node:` builtins only.

## Files

| Action | Path | Purpose |
|--------|------|---------|
| modify | `scripts/check-phone-redaction.mjs` | the entry: header, import `main` and `exitCodeOrCannotRun`, set `process.exitCode`; no guard |
| create | `scripts/phone-redaction-scan.mjs` | the library: matchers, decoding layers, scan, report, self-test, `main`, `exitCodeOrCannotRun`; importing runs nothing |
| modify | `src/checkPhoneRedaction.test.js` | import the library; subprocess cases; mixed-encoding fixtures; D3 rewrite; fixture hygiene |
| create | `scripts/check-test-floor.mjs` | CI floor: whole-suite rules carried from `deploy.yml`, plus the redaction suite's pinned count |
| create | `src/checkTestFloor.test.js` | spawns the floor script on fixture reports; reads `deploy.yml` as text |
| modify | `.github/workflows/deploy.yml` (sensitive) | one step: "Test-count floor (R52)" becomes "Test-count floors (R52, R11)" and calls the script |

## Tasks

### Task 1: Split the entry from the library, add `--self-test <dir>`, prove the entry runs through a junction

- Requirement(s): R5, R6, R7, R8, R9 (headers), R10, R12
- Files: `scripts/check-phone-redaction.mjs`, `scripts/phone-redaction-scan.mjs`,
  `src/checkPhoneRedaction.test.js`
- Parallel: no (wave 1, alone)
- Steps:
  1. Write failing tests in `src/checkPhoneRedaction.test.js`, in a new `describe` block for
     the entry, one test per case named as in `evals.md`: E6, E7, E8, E15, E16, E17, E22, E24
     and E25 spawn `process.execPath` with `child_process.spawnSync` (encoding utf8, timeout
     20 000 ms as `src/checkNpmrc.test.js` sets) and read `status`, `stdout`, `stderr`; E9 and
     E23 use a child `node --input-type=module -e` (E23 sets `process.argv` before a dynamic
     `import()` of the entry); E26 is two tests, an `it.each` over the non-code values with
     `vi.spyOn(console, 'error')` plus the pass-through of 0, 1, 2, and one that reads the entry
     as text; E27 is the last test in the block. Fixture hygiene (R12): `beforeAll` captures
     `fs.readdirSync` of `<repo>/scripts` and `<repo>`; junctions are created in `beforeEach`
     inside the fixture directory with
     `fs.symlinkSync(<repo>/scripts, <tmp>/scripts-alias, 'junction')` (E22 adds a second one
     pointing at the first) and removed in `afterEach` with `fs.unlinkSync` on each link, outer
     first, before `fs.rmSync` of the fixture directory. The E6 plant is one plain UTF-8 file
     with the synthetic number on line 1; the mixed-encoding proof is Task 2's first three cases.
  2. Run `npm test -- src/checkPhoneRedaction.test.js`; confirm E6, E7, E15, E16, E17 and E22
     fail with status 0 and empty stdout (the guard skipped `main`), E9 and E26 fail because the
     library file does not exist, E23 fails because the guard blocks a scan started by import,
     and E8, E24, E25 and E27 pass already (they do not exercise the guard; record all).
  3. Create `scripts/phone-redaction-scan.mjs` by moving every constant and function except the
     `isStartedDirectly` guard and its call from `scripts/check-phone-redaction.mjs`; export the
     names the spec's Architecture lists, including `main` and `exitCodeOrCannotRun` (R10: pass
     0, 1, 2 through; otherwise one stderr line and 2); resolve `REPOSITORY_ROOT` through
     `fs.realpathSync.native`; make `runSelfTest` take the directory arguments, scan them with
     the synthetic matchers through `listFilesUnder` and `scanFiles`, print the leading synthetic
     line, and combine exit codes per R7. Reduce `scripts/check-phone-redaction.mjs` to its
     header and `process.exitCode = exitCodeOrCannotRun(main(process.argv.slice(2)))`. Change
     the test file's import path. Write both headers per R9.
  4. Run the file's tests, confirm green, including E10, the existing matcher, UTF-16 and
     binary-skip tests passing with no edit; run `npm test`, `npm run lint`, `npm run build`.
  5. Commit: `fix(scripts): run the phone redaction scan however the entry is invoked`
- Done when: E6 to E9, E15 to E17 and E22 to E27 pass; E10 (the existing tests) pass unchanged;
  `node scripts/check-phone-redaction.mjs --self-test` exits 0; a manual run through a junction
  on the builder's machine prints the summary line; lint, tests and build exit 0.

### Task 2: Scan every decoding layer and let a hit outrank an incomplete scan

- Requirement(s): R1, R2, R3, R4, R9 (headers)
- Files: `scripts/phone-redaction-scan.mjs`, `src/checkPhoneRedaction.test.js`
- Parallel: no (wave 2, alone; depends on Task 1)
- Steps:
  1. Write failing tests in `src/checkPhoneRedaction.test.js`, in the existing file-scan
     `describe` block, each building bytes with `Buffer` and calling `scanFiles`, one test per
     case named as in `evals.md`: E1, E2, E3, E4, E5, E11, E12, E13, E14, E18, E19, E20, E21
     and N1. E4 and E5 together replace the existing test "fails with exit 2 and names a file
     it cannot decode, without printing its content" (D3: spec-authorised contract change; keep
     its no-content assertions in E4).
  2. Run the file's tests; confirm E1, E2, E3 fail with exit 0 and 0 hits (the silent miss),
     E4, E11, E14, E20 fail with exit 2 and no hit, E13 fails with exit 2, E18 fails with 0
     hits, and E5, E12, E19, E21 and N1 pass or fail for the stated reason; record each (E21
     passes today, since only byte 0 is checked; it guards the rewrite rather than proving a miss).
  3. In `scripts/phone-redaction-scan.mjs` replace `decodeText` with a function returning the
     decoding layers (UTF-8 always; UTF-16LE and UTF-16BE from byte 0 and byte 1 when the buffer
     holds a zero byte, trailing odd byte dropped, `swap16` only on an even-length copy) and a
     function classifying the buffer as recognised or undecodable with the current rules;
     make `scanFiles` scan every layer, union hit lines per file in a `Set`, and count the file
     by its classification; change the undecodable report line to the spec's wording; apply the
     R3 precedence in `scanExitCode`; update `decodeFile`'s contract and comment. Diff the new
     body of every replaced function against the old one and carry every side effect forward
     (the counts, the summary, the no-content rule). Update both headers.
  4. Run the file's tests, confirm green; run `npm test`, `npm run lint`, `npm run build`,
     `node scripts/check-phone-redaction.mjs --self-test` and the real scan
     `node scripts/check-phone-redaction.mjs` (full history on the builder's machine).
  5. Commit: `fix(scripts): scan every UTF-8 and UTF-16 layer of a file for the phone number`
- Done when: E1 to E5, E11 to E14, E18 to E21 and N1 pass; E10 still passes; the real scan of
  the change branch exits 0 with 0 undecodable and 0 hits; lint, tests and build exit 0.

### Task 3: Make CI prove the redaction suite ran (edits the sensitive path `.github/workflows/deploy.yml`)

- Requirement(s): R11
- Files: `scripts/check-test-floor.mjs`, `src/checkTestFloor.test.js`,
  `.github/workflows/deploy.yml` (sensitive: the profile's ask-first gate fires; the owner
  accepted this edit by approving D9)
- Parallel: no (wave 3, alone; depends on Tasks 1 and 2, whose finished suite sets the pin)
- Steps:
  1. On the merged wave 2 branch run
     `npm test -- --reporter=default --reporter=json --outputFile.json=<scratch>/report.json`
     and count the `passed` entries of `assertionResults` under the `testResults` entry for
     `src/checkPhoneRedaction.test.js` (44 expected). That count is the pin; name it in the
     commit body.
  2. Write failing tests in `src/checkTestFloor.test.js`, one test per case named as in
     `evals.md`: E28, E29, E30 (`it.each`), E31 (`it.each`) and E32 (`it.each`) spawn
     `process.execPath` with the script path and a report path inside a `mkdtemp` directory, as
     `src/checkNpmrc.test.js` does, with a helper that builds a fixture report from a passed
     count per file and the top-level totals; E33 reads the workflow with the line helpers of
     `src/deployWorkflowNodeVersion.test.js` copied in.
  3. Run `npm test -- src/checkTestFloor.test.js`; confirm E28 to E32 fail because the script
     does not exist and E33 fails on the missing workflow line; record it.
  4. Create `scripts/check-test-floor.mjs`: a header saying what it proves and that the pin is
     the suite's count at merge; the report path from `process.argv[2]`; the whole-suite rules
     and their log lines copied from `deploy.yml` lines 107 to 118 and diffed side by side; the
     per-file rule of ADR 0004 with the pin as a named constant; exit codes and `::error::`
     lines per the spec's Interfaces. Functions under 40 lines; public function first.
  5. Edit `.github/workflows/deploy.yml`: replace lines 102 to 121 with the renamed step and the
     one-line body from the spec's Architecture, nothing else. `git diff` shows that step only.
  6. Run the file's tests, then `npm test`, `npm run lint`, `npm run build`, and
     `node scripts/check-test-floor.mjs <scratch>/report.json` on the step 1 report (exit 0).
  7. Commit: `ci(test): fail the deploy unless the phone redaction suite ran in full`
- Done when: E28 to E33 pass; the pin in the script equals the passed count of
  `src/checkPhoneRedaction.test.js` in a fresh report; the workflow diff touches one step; lint,
  tests and build exit 0.

## Waves

| Wave | Tasks | Files | Parallel |
|------|-------|-------|----------|
| 1 | Task 1 | `scripts/check-phone-redaction.mjs`, `scripts/phone-redaction-scan.mjs`, `src/checkPhoneRedaction.test.js` | no |
| 2 | Task 2 | `scripts/phone-redaction-scan.mjs`, `src/checkPhoneRedaction.test.js` | no |
| 3 | Task 3 | `scripts/check-test-floor.mjs`, `src/checkTestFloor.test.js`, `.github/workflows/deploy.yml` | no |

`build.max_parallel` is 4; no wave exceeds 1. Each wave depends only on the ones before it.

## Verification plan

Profile commands, all expected exit 0: `npm run lint`, `npm test`, `npm run build`,
`npm audit --omit=dev --audit-level=high`. Evals: every case in `evals.md` (34 rows, 13 golden,
7 edge, 5 failure, 8 adversarial, 1 non-functional) runs inside `npm test`; the verifier reports
pass counts per category. Beyond the profile: `node scripts/check-phone-redaction.mjs --self-test`
exit 0; `node scripts/check-phone-redaction.mjs` exit 0 on the change branch (needs full
history, which the verifier's clone has); one run through a junction in a scratch directory,
expected to print the summary and exit 0; and `npm test` with the JSON reporter followed by
`node scripts/check-test-floor.mjs` on that report, exit 0 with `Test floors passed.` Evidence
the human sees: the command lines with exit codes and the Vitest summary in `verification.md`,
the three confirmed-today exit 0 misses (spec R1) now exiting 1, and the one-step diff of
`deploy.yml`. The floor's proof on a Linux runner is the first push to `main` after merge,
which the owner performs.

## Rollback

Dev: `git revert` of the three commits restores the single-file script, the old tests and the
inline floor step; nothing else references the new files. Staging: none exists. Prod: no `src/`
runtime file changes, so the published site is unaffected either way. Task 3 is in the
publishing path: a failing floor step stops the build job before Build and Upload, so nothing
is published, and reverting on `main` is an ordinary push by the owner. No schema, no data.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Vitest under jsdom cannot spawn a child process (believed to work; `src/checkNpmrc.test.js` already spawns under the same config) | Low | E6 to E9, E15 to E17, E28 to E32 need another home | Move the cases to a file with `// @vitest-environment node` at the top, still under `src/` |
| `fs.symlinkSync(..., 'junction')` fails on the CI runner | Low | E6, E7, E16, E22 fail in CI | On POSIX the type is ignored and a symlink is created (believed); the verifier reads the first CI run |
| Five layers slow the scan on large zero-byte files | Low | Developers stop running the check | N1 bounds it; files with no zero byte keep one layer (D5) |
| Layer line numbers confuse a reader of a mixed file | Medium | Minutes of searching | The report names the file; the header explains that line numbers come from the layer that found the hit |
| A `CREATE OR REPLACE`-style loss: rewriting `scanFiles` or copying the floor rules drops a count or a rule | Low | Silent report or floor change | Task 2 step 3 and Task 3 step 4 diff old against new; E4, E19, E31 and the summary assertions catch it |
| The pin drifts from the suite | Medium | A later change removing a test fails CI | Intended: removing a redaction test is a deliberate edit to the script, which D7 asks to make a sensitive path; adding tests needs no edit |
| The workflow edit is wrong in a way the text test cannot see (indentation, quoting) | Low | The build job fails on the first push; nothing is published | E33 checks the line and its step; the owner reads the one-step diff at G4 |

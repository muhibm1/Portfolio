# Plan: no inlined data font URLs in built CSS

Change id: `2026-09-13-no-inlined-data-font-urls-in-built-css`. Tier: 2.
Spec: [spec.md](./spec.md) revision 2, approved at G2 · Evals: [evals.md](./evals.md) revision 2, 55 cases · ADRs: [0001](./adr/0001-refuse-to-inline-font-files-with-a-font-only-assetsinlinelimit-function.md), [0002](./adr/0002-check-built-css-with-a-committed-node-script-run-the-same-way-in-ci-and-locally.md)
Branch: `wh/2026-09-13-no-inlined-data-font-urls-in-built-css`, head `64f91c1`, created from `main` at `85c5e4d` (both confirmed, branch reflog read).
Worktrees: one per task under the gitignored `.worktrees/` (`.gitignore` line 28, confirmed), task branches `wh/2026-09-13-no-inlined-data-font-urls-in-built-css/t<N>`, folded by rebase (`build.wave_merge`, confirmed).
Written 2026-09-13 by the implementation planner. This session had Read, Glob, Grep and Write only, so no command was run. Every claim is labelled `confirmed` (read here) or `believed, not verified`.

## Approach

The change is three independent pieces that meet only in the built output. They are: the font-only inline function and its wiring (R93), the committed build check (R97, R98), and the two workflow steps (R99, R100). No task imports another task's file, and each can prove its own contract in isolation. T1 proves wiring with greps on a real build, T2 proves the script on fixtures, and T3 proves the smoke step with an R104 harness on fixtures. So all three run as one parallel wave. The only cross-task proofs are R97 exiting 0 on the fixed build (GC99) and the R104 P1 case on the real build. Both need T1 and T2 together, so they run in the verify phase on the folded branch, which is also the commit that merges. A second wave would buy one early P1 run at the cost of a serial builder session (G3 D1).

## Rules every task follows

1. **Shell and Node.** Git Bash, from the worktree root. Every `node` or `npm` command is written as `export PATH="/c/Users/alqai/AppData/Roaming/nvm/v22.12.0:$PATH" && <command>` (system Node is v21.7.3). Step 0 of every task runs `export PATH="/c/Users/alqai/AppData/Roaming/nvm/v22.12.0:$PATH" && node -v && npm ci` and stops unless `node -v` prints `v22.12.0`. `npm ci` is not an ask command (confirmed against profile `ask_commands`). That a fresh worktree has no `node_modules` is believed.
2. **Scratch files live outside the repository.** `$SCRATCH` means `/c/Users/alqai/AppData/Local/Temp/claude/C--Users-alqai-Portfolio/d0dede8c-e802-4bb0-96b3-f53cba8c233e/scratchpad/fonts-2026-09-13`. Use `$SCRATCH/t<N>/` per task, `$SCRATCH/r104/` for the rehearsal harness and `$SCRATCH/verify/` for the verifier. If a later session has a different scratchpad, use its `fonts-2026-09-13/` with the same subfolders. Nothing under `$SCRATCH` is committed. The worktree's own `dist/` is gitignored (`.gitignore` line 11, confirmed).
3. **Sensitive files are edited only with the Edit or Write tool.** Since `64f91c1`, the four sensitive files in this change are `vite.config.js`, `.github/workflows/deploy.yml`, `scripts/never-inline-fonts.mjs` and `scripts/check-built-css-fonts.mjs` (profile lines 74 to 81 and 156, confirmed). The protect-paths hook matches only Edit, Write, MultiEdit and NotebookEdit (`protect-paths.js` line 2, confirmed). So a shell redirection would skip the owner's prompt, which is forbidden. Prompts to expect are in [Owner prompts](#owner-prompts).
4. **Build before judging `dist/`.** Run `npm run build` before any grep or script run on `dist/`, because a stale local `dist/` exists (constraints known debt 14, confirmed).
5. **No new dependency, no other file** (R101). No task touches `package.json`, `package-lock.json`, `index.html`, `src/test/setup.js`, `src/main.jsx` or `src/data/portfolioData.js`. Tests go in `src/`, run under the default jsdom environment and carry no `@vitest-environment` pragma (R93, R98).
6. **Lint.** Run `npm run lint` under Node 22.12.0. The oxlint Windows binding is installed at 1.82.0 and requires Node `^20.19.0 || >=22.12.0` (`node_modules/@oxlint/binding-win32-x64-msvc/package.json`, confirmed). The old `Cannot find native binding` log ran under v21.7.3 (`$SCRATCH/../w1-lint.log`, confirmed). If lint still cannot load in a worktree, run `npm ci` once more and retry. Never delete or regenerate `package-lock.json` in this change (R101), and never report lint as passed without an observed exit 0. Report it as `blocked: lint cannot load` with the log (G3 D4).
7. **Readable code** (wh-readable-code). Functions under 40 lines, test names written as sentences, and a module comment that says why. Follow `scripts/check-phone-redaction.mjs` for layout: usage comment, exit codes, no content in reports. Do not follow its exports or its direct-run guard (ADR 0002).

## Files

| Action | Path | Task | Purpose |
|--------|------|------|---------|
| create | `scripts/never-inline-fonts.mjs` | T1 | `neverInlineFonts(filePath)`: `false` for font files, `undefined` otherwise (R93). Sensitive since `64f91c1` |
| create | `src/neverInlineFonts.test.js` | T1 | 2 tests for both return values (R93) |
| modify | `vite.config.js` | T1 | One import line, `build: { assetsInlineLimit: neverInlineFonts }`, at most one comment line (R93, R96). Sensitive |
| create | `scripts/check-built-css-fonts.mjs` | T2 | Applies the font rule to every `.css` under a directory; exit 0, 1 or 2 (R97). Sensitive since `64f91c1` |
| create | `src/checkBuiltCssFonts.test.js` | T2 | 10 cases, 15 tests, spawning the script against fixtures (R98) |
| modify | `.github/workflows/deploy.yml` | T3 | Header source line, R99 build-job step, R100 deploy-job smoke step. Sensitive |
| create | `docs/sdlc/<id>/verification.md`, `verify-logs/` | verify phase | Gate evidence, including the R104 record run |
| outside repo | `$SCRATCH/r104/` | T3, verify phase | R104 harness: extraction, `node:http` fixture server, case runner, expected lines. Never committed |

`.workhorse/profile.yml` is not in R101's list and no task edits it. See [Conformance note on 64f91c1](#conformance-note-on-64f91c1).

## Waves

| Wave | Tasks (`Parallel: yes`) | Files touched | Depends on |
|------|-------------------------|---------------|------------|
| 1 | T1, T2, T3 | T1: `scripts/never-inline-fonts.mjs`, `src/neverInlineFonts.test.js`, `vite.config.js`. T2: `scripts/check-built-css-fonts.mjs`, `src/checkBuiltCssFonts.test.js`. T3: `.github/workflows/deploy.yml` | nothing |

3 tasks in 1 wave, largest wave 3, within `build.max_parallel: 4` (confirmed, profile line 106). No path repeats (confirmed, this table). Fold order T1, T2, T3. Disjoint files mean no rebase conflict is expected (believed). Expected test counts per worktree: T1 193 tests in 24 files, T2 206 in 24, T3 191 in 23. After the fold: 208 in 25 (R102). All believed until run. The baseline is 191 in 23 (confirmed, `scratchpad\npm-test-baseline.txt` lines 42 and 43).

### Owner prompts

Every Edit or Write on a sensitive path asks the owner (`protect-paths.js` lines 31 and 32, confirmed). That the hook also fires inside worktrees is believed: it resolves paths against the worktree root.

| Task | File | Minimum prompts | Why |
|------|------|-----------------|-----|
| T1 | `scripts/never-inline-fonts.mjs` | 1 | Write to create it |
| T1 | `vite.config.js` | 2 | Edit the import line; Edit the `build` key and its optional comment |
| T2 | `scripts/check-built-css-fonts.mjs` | 1 | Write to create it |
| T3 | `.github/workflows/deploy.yml` | 3 | Edit the header source line; Edit to insert R99; Edit to insert R100 and its comment |

The minimum is 7 prompts, up to 3 at once while wave 1 runs in parallel. Each later Edit or Write to one of these four files adds one more prompt, whether from a builder correction, the readability or simplifier pass, or a fix loop. Approve a prompt only if the file is one of the four listed for that task. The verifier and the tests edit none of them.

## Tasks

### T1. Font-only inline function and its wiring. Sensitive: `vite.config.js`, `scripts/never-inline-fonts.mjs`

- Wave 1 · Parallel: yes · Files: `scripts/never-inline-fonts.mjs` (new), `src/neverInlineFonts.test.js` (new), `vite.config.js`.
- Requirements: R93; the build-output checks of R94, R95 and R96. Evals: GC95, EG24, EG25, GC96 (grep half), GC97, GC98, EG28.
- Steps:
  0. Rule 1 setup. `mkdir -p $SCRATCH/t1`.
  1. Characterise today's build before any edit. Run `npm run build`, then save the CSP grep and the referrer grep of R96 to `$SCRATCH/t1/csp-before.txt` and `$SCRATCH/t1/referrer-before.txt`. Record the four counts: `@font-face`, data font URLs, file font URLs and font files. Expected 64, 12, 116 and 116, as the conductor confirmed on a scratch build.
  2. Write the failing test `src/neverInlineFonts.test.js`. It imports only `vitest` and `../scripts/never-inline-fonts.mjs`, and has no pragma. It holds exactly two tests, named as in R93. (1) `returns false for every font extension in either letter case` covers the ten paths R93 lists. (2) `returns undefined for non-font assets, even inside a folder named like a font` covers the five paths R93 lists. Assert with `toBe(false)` and `toBe(undefined)`, never truthiness.
  3. Run `export PATH="/c/Users/alqai/AppData/Roaming/nvm/v22.12.0:$PATH" && npm test -- src/neverInlineFonts.test.js`. Confirm it exits 1 because the import of `../scripts/never-inline-fonts.mjs` cannot be resolved. Any other cause, such as `src/test/setup.js` or jsdom, is a stop: report `blocked`.
  4. Create `scripts/never-inline-fonts.mjs` (prompt 1). It has one named export, `neverInlineFonts`, imports nothing and matches the extension alone with `/\.(woff2?|ttf|otf|eot)$/i` (spec Interfaces (a)). A comment of one to three lines says why (the CSP allows fonts from `'self'` only), cites ADR 0001, and says `vite.config.js` imports it and nothing runs it.
  5. Run the test file again: 2 passed.
  6. Edit `vite.config.js` (prompts 2 and 3). Add one import line after line 5. Add `build: { assetsInlineLimit: neverInlineFonts },` between `plugins: [...],` and `test: {`, which keeps the diff add-only because line 35 already ends with a comma (confirmed). Add at most one comment line, which may name the module. Change no existing line.
  7. Run `npm run build` twice (EG28). Both runs must give the same CSS file name and the same counts. Run every check under "Done when".
  8. Full suite: `export PATH="/c/Users/alqai/AppData/Roaming/nvm/v22.12.0:$PATH" && npm test`. Expected 193 tests in 24 files, 0 failed. Then `npm run lint` (rule 6). Record both numbers.
  9. Commit: `fix(build): emit every font as a file so font-src 'self' allows it (R93)`.
- Done when (spec acceptance, verbatim, with the Git Bash form where the spec's table escapes a pipe):
  - R93: "`npm test -- src/neverInlineFonts.test.js` exits 0 with 2 passing. `grep -c "^import" scripts/never-inline-fonts.mjs` prints 0. `git diff -U0 main -- vite.config.js | grep "^+[^+]"` prints only the import line, the `build` key's lines and at most one comment line, and the reviewer confirms the `build` object holds one property." Also `grep -c "vitest-environment" src/neverInlineFonts.test.js` prints 0. "After `npm run build`, R97 exits 0" is proven at verify (GC99).
  - R94: `grep -oiE "url\([[:space:]]*[\"']?data:font" dist/assets/*.css | wc -l` prints 0. `ls dist/assets | grep -cE '^jetbrains-mono-(cyrillic-ext|vietnamese)-[4-7]00-normal-.+\.woff2$'` prints 8. `ls dist/assets | grep -cE '^jetbrains-mono-cyrillic-ext-[4-7]00-normal-.+\.woff$'` prints 4.
  - R95: `grep -o "@font-face" dist/assets/*.css | wc -l` prints 64. `grep -oE "url\(/Portfolio/assets/[^)]+\.woff2?\)" dist/assets/*.css | wc -l` prints 128. `ls dist/assets | grep -cE '\.woff2?$'` prints 128. `git diff main -- src/main.jsx` is empty.
  - R96: the CSP grep prints exactly the string in R96, and `cmp` of that output with `$SCRATCH/t1/csp-before.txt` exits 0 (the M2 "byte-identical to today" evidence). The referrer grep prints `name="referrer" content="strict-origin-when-cross-origin"`. `cmp dist/index.html dist/404.html` exits 0. `git diff main -- vite.config.js | grep -c '^-[^-]'` prints 0.

### T2. Built CSS font check and its tests. Sensitive: `scripts/check-built-css-fonts.mjs`

- Wave 1 · Parallel: yes · Files: `scripts/check-built-css-fonts.mjs` (new), `src/checkBuiltCssFonts.test.js` (new).
- Requirements: R97, R98; R94's rule on fixtures. Evals: GC100, EG31, FL29 to FL34, FL38, FL50.
- Steps:
  0. Rule 1 setup. `mkdir -p $SCRATCH/t2`.
  1. Write the failing test `src/checkBuiltCssFonts.test.js`, following `src/checkPhoneRedaction.test.js` lines 64 to 79 for fixtures. There is no pragma. It starts the script with `spawnSync(process.execPath, [scriptPath, fixtureDirectory], { encoding: 'utf8' })` and does not import it. It resolves the path from `import.meta.url`, passes an explicit directory in every case and never reads `dist/`. Fixtures come from `fs.mkdtempSync(path.join(os.tmpdir(), 'check-built-css-fonts-'))` and are removed in `afterEach`. C is R98's clean block. Unless a case says otherwise, a failing fixture is C plus the named block in one `assets/index.css`. Each test asserts the exit code and exact stdout text:
     - Case 1: `exits 0 and prints the counts when every font source is a file under /Portfolio/assets/`. Expect exit 0 and stdout containing `Built CSS font check passed (R97): 1 CSS file(s), 1 @font-face blocks, 1 font URLs, 0 data: font URLs.`
     - Case 2: `exits 1 naming the file and count for an unquoted data font URL, without printing its payload`. Expect exit 1, `::error::Built CSS font check failed (R97):`, the fixture's path, and `1 data: font URL(s) and 1 @font-face URL(s) outside`. Stdout and stderr must not contain the 200-character payload.
     - Case 3, `it.each` over R98's 4 spellings: `exits 1 for the data font spelling %s`. Each expects exit 1 with `1 data: font URL(s) and 1 @font-face URL(s) outside`.
     - Case 4, `it.each` over R98's 3 sources: `exits 1 for the @font-face source %s, which lies outside /Portfolio/assets/`. Each expects exit 1 with `0 data: font URL(s) and 1 @font-face URL(s) outside`.
     - Cases 5 to 8, each expecting exit 2 and `::error::Built CSS font check could not run (R97):`. Case 5: `exits 2 and names the directory when it does not exist`, which also checks the path appears. Case 6: `exits 2 when the directory holds no .css file`. Case 7: `exits 2 when no stylesheet holds an @font-face block`. Case 8: `exits 2 when the @font-face blocks hold no url()`, using `src:local(X)`.
     - Case 9: `exits 0 for quoted and padded sources under /Portfolio/assets/`. Expect exit 0 and `1 @font-face blocks, 2 font URLs`.
     - Case 10: `counts an upper-case block over two lines and a lower-case prefix as 2 URLs outside`. Use R98's three-line fixture and expect exit 1 with `0 data: font URL(s) and 2 @font-face URL(s) outside`.
     - That makes 15 tests. The script prints everything to stdout with `console.log`, as R52 and R85 do (`deploy.yml` lines 83 and 114, confirmed).
  2. Run `export PATH="/c/Users/alqai/AppData/Roaming/nvm/v22.12.0:$PATH" && npm test -- src/checkBuiltCssFonts.test.js`. All 15 must fail, with the child's stderr showing the script module cannot be found. A missing script also exits 1, so if any exit-1 test passes, its text assertion is too weak: fix the test before writing the script.
  3. Create `scripts/check-built-css-fonts.mjs` (prompt 1) per spec Interfaces (b) and [The font rule](./spec.md#the-font-rule). The header comment gives usage and exit codes. It names the `Smoke R100` step in `.github/workflows/deploy.yml` as the other copy of the rule, and R98 and R104 as their proofs. The script uses Node built-ins only, has no exports and no direct-run guard. The prefix constant has a comment saying it mirrors `PAGES_BASE` joined to Vite's `assets` directory. The default `dist` is resolved from the repository root, derived from the script's own location. The first-violation excerpt is capped at 60 characters.
  4. Run the test file: 15 passed. The test file is not edited to make them pass.
  5. Pre-fix red on a real build. This worktree does not have T1's fix. Run `npm run build`, then `node scripts/check-built-css-fonts.mjs`. Expect exit 1 and one `::error::` line naming `dist/assets/index-<hash>.css` with `12 data: font URL(s) and 12 @font-face URL(s) outside` (believed from The font rule). Repeat with the working directory set to `src` and the argument `../scripts/check-built-css-fonts.mjs` to prove the default resolves from the repository root. Save both outputs to `$SCRATCH/t2/`.
  6. Full suite: expected 206 tests in 24 files, 0 failed. Then `npm run lint` (rule 6).
  7. Commit: `feat(scripts): add the built CSS font check and its tests (R97, R98)`.
- Done when: R98 verbatim: "`npm test -- src/checkBuiltCssFonts.test.js` exits 0 with 15 passing tests. `grep -c "vitest-environment" src/checkBuiltCssFonts.test.js` prints 0." R97, the parts provable without T1: "`grep -c "Smoke R100" scripts/check-built-css-fonts.mjs` prints at least 1". `grep -c "^export" scripts/check-built-css-fonts.mjs` prints 0. `grep "^import" scripts/check-built-css-fonts.mjs | grep -vcE "from ['\"]node:"` prints 0. Step 5's outputs are in the report. GC99 (exit 0 printing `64 @font-face blocks, 128 font URLs, 0 data: font URLs`) runs at verify.

### T3. Build-job and deploy-job font steps with the R104 harness. Sensitive: `.github/workflows/deploy.yml`

- Wave 1 · Parallel: yes · Files: `.github/workflows/deploy.yml`. Outside the repository: `$SCRATCH/r104/`.
- Requirements: R99, R100; R104's harness and pre-fold run. Evals: GC101, GC102 (structure); EG32 and FL39 to FL51 (pre-fold run).
- Steps:
  0. Rule 1 setup. `mkdir -p $SCRATCH/r104`.
  1. Build the R104 harness under `$SCRATCH/r104/` (spec Interfaces (d)). The harness is this task's test, so it comes first.
     - (a) Extraction. Run `node <scratchpad>/extract-runs.js <worktree>/.github/workflows/deploy.yml $SCRATCH/r104/steps` (file present today, confirmed), and select the one output whose printed step name is `Smoke R100: the served stylesheets inline no font`. Zero or two matches fail the harness. Run the extractor from the scratchpad, never from the repository: it is CommonJS, and the repo's `package.json` sets `"type": "module"` (confirmed).
     - (b) A `node:http` fixture server that listens on `127.0.0.1:4800`. For each case it sets status, content type and body for each `/Portfolio/assets/<name>.css`, and it destroys the socket for F6.
     - (c) A case runner. Each case gets a fresh working directory holding `smoke/root.html`. The five runner files are empty and sit outside that directory. `ROOT_URL`, `GITHUB_ENV`, `GITHUB_PATH`, `GITHUB_OUTPUT`, `GITHUB_STATE` and `GITHUB_STEP_SUMMARY` are exported. The body runs as `bash --noprofile --norc -eo pipefail <body>`. Expected lines are written from Interfaces (c)'s templates before the run. The runner performs checks (i) to (v) and writes one results row per case to `$SCRATCH/r104/results.md`.
     - (d) The 14 cases P1, P2 and F1 to F12 exactly as in Interfaces (d).
  2. Red, twice.
     - (a) Run the harness against the unmodified `deploy.yml`. It must fail because no step has that name.
     - (b) Harness self-test. Run all 14 cases with a stand-in body that prints nothing and exits 0 (a scratch file). Every case must report a mismatch, which proves checks (i) to (iii) can fail.
  3. Edit `deploy.yml`.
     - Prompt 1: change header line 6 only, because it ends the source sentence. Add one line citing `docs/sdlc/2026-09-13-no-inlined-data-font-urls-in-built-css/spec.md` for R97, R99 and R100. Leave line 3 as is; if the header should mention R97, add a new line instead of editing it.
     - Prompt 2: insert step `Built CSS inlines no font (R97)` with `run: "node scripts/check-built-css-fonts.mjs"` between `Build` (line 120) and `Audit runtime dependencies (blocking)` (line 123).
     - Prompt 3: insert the R100 comment and step between R80 (ends line 258) and R81 (line 260), per Interfaces (c) and [The font rule](./spec.md#the-font-rule). The comment names `scripts/check-built-css-fonts.mjs` and says an edit to the body re-runs R104 before merge. Keep the literal `Smoke R100` to the step name only. The body must not mention the five runner variables or `count_matches`, even in a comment. Use POSIX ERE with `grep -E` only, never `grep -P`, because the Ubuntu runner's tools are the target (believed).
  4. Green, pre-fold. Run P2 and F1 to F12 through the harness. P1 needs T1's config, which this worktree lacks. So run a "P1-pre" instead: the fixture server serves the conductor's font-only build, `scratchpad\build\fontOnly\assets\index-D4xY4LDD.css` (confirmed present), and its `index.html` is `smoke/root.html`. Expect exit 0 and one PASS line. This exercises real Vite CSS; it is not the P1 of record. Stop both servers and record a refused connection to each port.
  5. Structure checks under "Done when". The full suite is unchanged: 191 tests in 23 files. Then `npm run lint` (rule 6).
  6. Report: the harness file list with a sha256 for each file, the extractor used, and `results.md`.
  7. Commit: `ci: block deploys on inlined fonts in built and served CSS (R99, R100)`.
- Done when (spec acceptance, verbatim, with the Git Bash form):
  - R99: "`grep -n "name:" .github/workflows/deploy.yml` shows the step between `Build` and the blocking audit. `grep -c "continue-on-error" .github/workflows/deploy.yml` is still 1". The diff "removes only the header source line": `git diff main -- .github/workflows/deploy.yml | grep -c '^-[^-]'` prints 1, and that line is header line 6. `git diff main -- .github/workflows/deploy.yml | grep -cE '^\+.*(uses:|continue-on-error)'` prints 0.
  - R100: "`grep -c "Smoke R100" .github/workflows/deploy.yml` is 1". On the extracted body, `grep -cE 'GITHUB_(ENV|PATH|OUTPUT|STATE|STEP_SUMMARY)|count_matches'` prints 0. Every pre-fold case and P1-pre match on checks (i) to (v).
  - No YAML parser or actionlint exists locally (`node_modules/yaml` absent, confirmed). The harness's extraction lists every step in order, as a structural check. YAML validity is proven by the first CI run (Not verified).

## Verification plan

Owner: the verify phase (`wh-verifier`, and the `wh-eval-runner` it dispatches), in the main checkout on the folded change branch head. That is the commit that merges. Node commands carry rule 1's prefix. Logs go to `docs/sdlc/<id>/verify-logs/` and scratch goes to `$SCRATCH/verify/`.

1. **Gates (R102, GC104, NF23), in profile order.**
   - Install: skipped, because `git diff --stat main...HEAD -- package-lock.json` must be empty.
   - Lint: rule 6.
   - Test: `npm test -- --reporter=default --reporter=json --outputFile.json=$SCRATCH/verify/vitest-results.json`. Expect 208 passed in 25 files, and 0 pending, todo or failed (the R52 floor).
   - Build: `npm run build`.
   - Audit: `npm audit --omit=dev --audit-level=high`.
   - Typecheck, e2e and screenshot: `no check defined`.
2. **Built output (GC95 to GC99, EG28, NF18, NF19, NF22).** T1's "Done when" checks on the folded head. Then `node scripts/check-built-css-fonts.mjs` with no argument must exit 0 and print `64 @font-face blocks, 128 font URLs, 0 data: font URLs`. That run proves R93's wiring and R97's default directory.
3. **Script fixtures (EG26, EG29, EG30, AD21).** Four fixture directories under `$SCRATCH/verify/fixtures/`, each run through the script with an explicit argument.
4. **Regression demonstrations (FL35, FL36, NF20).** Scratch builds with Vite's JS API, as `scratchpad\inline-probe.mjs` does (confirmed, read): `emptyOutDir: true` and an `outDir` under `$SCRATCH/verify/`. FL35 sets an inline `build.assetsInlineLimit: 4096`, and the script must exit 1 naming `index-*.css` with 12. FL36 sets `base: '/Other/'`, and the script must exit 1. `vite.config.js` is never edited.
5. **AD22.** `git diff --no-index` of two scratch copies of `vite.config.js`, where only the second has `font-src` widened.
6. **Workflow structure (GC101, GC102).** T3's "Done when" checks on the folded head.
7. **Scope (GC103, R101).** Account for `64f91c1` as in the next section.
8. **R104 record run (GC106, EG32, FL39 to FL51; with FL37, EG27, AD19 proven through FL43 to FL46, FL49 and FL41).**
   - Harness: T3's `$SCRATCH/r104/`, after checking each file's sha256 against T3's report. If the harness or `extract-runs.js` is gone, for example in a new session, rebuild it from spec Interfaces (c) and (d). Extraction must be by program, never by retyping, and each substitute's source is pasted into `verification.md` (R104, audit L13).
   - Setup: build first. P1 runs `npm run preview -- --port 4799 --strictPort` (binds `localhost`, confirmed by the auditor), with `ROOT_URL=http://localhost:4799/Portfolio/` and `dist/index.html` copied to `smoke/root.html`.
   - Clean-up: both servers are stopped, the preview server by killing its process tree (for example `taskkill //PID <pid> //T //F`, believed to be needed on Windows). A refused `curl` to ports 4799 and 4800 is recorded.
   - Record: `verification.md` gets one row per case, with the command including its six exports, the exit code, the full output and checks (i) to (v).
   - A mismatch blocks G4. If a fix loop edits the R100 body, all 14 cases run again.
9. **Not verified before merge.** GC101's first-run R97 summary line in CI. GC102's live `PASS R100` line naming `https://muhibm1.github.io/Portfolio/assets/index-<hash>.css`. YAML validity on GitHub. GitHub's `bash -eo pipefail` flags. GC105 and NF24 (R103), the owner's browser check and his `docs/hosted-config.md` line, which the retro reports on.

Evidence the owner sees at G4:
- `verification.md` with a row per check and per R104 case, plus `verify-logs/*.log`.
- Each task's red-then-green record: T1 and T2 test outputs, T2's pre-fix exit-1 output, and T3's harness self-test.
- Eval pass rates per category against 100%.

### Conformance note on 64f91c1

`git diff --name-only main...HEAD` will list `.workhorse/profile.yml`, which is outside R101's list. The owner ordered this in his G2 notes ("add both scripts to profile for me", `approvals.md`, confirmed). The main session committed it before build as `64f91c1 chore(profile): protect the font-inlining scripts (G2-D6)` (confirmed, reflog). The conformance reviewer treats it as the owner's D6 execution, not scope drift, if three checks hold:
1. `git log --format='%h %s' main..HEAD -- .workhorse/profile.yml` prints exactly that one commit.
2. `git show --stat --format= 64f91c1` lists exactly two files: `.workhorse/profile.yml` and this change's `docs/sdlc/2026-09-13-no-inlined-data-font-urls-in-built-css/conductor-log.md` (one added line, the conductor recording its own commit, which is expected). No other file appears.
3. `git diff 64f91c1 HEAD -- .workhorse/profile.yml` is empty, so no task edited it later.

Then R101 is checked as `git diff --name-only main...HEAD -- . ':(exclude).workhorse/profile.yml'`, which must list only R101's six paths and this change's `docs/sdlc/` directory. `git diff main -- package.json package-lock.json index.html src/` must show only the two new test files.

## Rollback

- **Local and change branch.** Nothing is published. Revert a task commit with `git revert <sha>` on the change branch, or let the conductor drop a task branch before the fold. There is no data to clean up. Scratch files sit outside the repository.
- **Production (GitHub Pages).** The owner reverts the three task commits on `main`, or the merge commit with `-m 1`, and pushes. The workflow then rebuilds and republishes the previous site. The revert removes R99 and R100 too, so that deploy runs the old steps only. Expected effect: the 12 CSP font errors return, and text in the Latin subset is unaffected (believed, release.md of change 2026-09-11). Do not revert `64f91c1`: it only adds protection and is the owner's D6.
- **Partial: R100 fails wrongly on the runner.** The site is already live, because `Deploy to GitHub Pages` runs before every smoke step (`deploy.yml` lines 158 to 160, confirmed). Fix the R100 body forward and re-run R104, or revert T3's commit alone.
- **Partial: R97 fails wrongly in the build job.** Nothing is uploaded, and the previous site stays live. Fix `scripts/check-built-css-fonts.mjs` with R98 green, or revert T3's commit to drop the step.
- **Schema and data.** Not applicable: no database, no migration, no stored data (profile `database: none`, confirmed).
- **Rehearsal at G5 (tier 2), by the release engineer.**
  1. On a scratch branch from the change branch head, run `git revert --no-edit <t3> <t2> <t1>`.
  2. Run `npm run build`. `grep -oiE "url\([[:space:]]*[\"']?data:font" dist/assets/*.css | wc -l` must print 12, the previous state.
  3. `git diff main -- vite.config.js .github/workflows/deploy.yml scripts src` must be empty.
  4. Delete the scratch branch.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| R100 passes in Git Bash but behaves differently with the Ubuntu runner's grep, sed or curl | Low | False PASS, or a red deploy after publication | POSIX ERE only; R104 record run; the first deploy's PASS line; partial rollback above |
| The R104 harness or `extract-runs.js` is gone when verify runs in a later session (the scratchpad is per session) | Medium | The record run cannot start | T3 reports each file with a sha256; the verifier rebuilds from Interfaces (d) and pastes each substitute's source |
| oxlint cannot load in a worktree (npm issue 4828) | Medium | Lint cannot be shown green | Rule 6; never regenerate the lockfile; G3 D4; CI lint as a second gate, not a substitute |
| A sensitive file is changed by a shell redirection, so the owner is not asked | Low | An edit the owner never saw | Rule 3; the diff-shape greps in R93, R96 and R99 catch extra lines |
| The owner, facing 7 or more prompts, approves an unexpected edit | Low | Scope drift in a sensitive file | The prompt table maps each prompt to a task and file; R101 and diff-shape checks at verify |
| Wave 1 builders and the fixture ports collide | Low | A false case failure | Only T3 starts servers in build; the verifier uses 4799 and 4800 after the fold |
| 15 spawned Node processes under jsdom exceed Vitest's default per-test timeout on this laptop (believed 5 s) | Low | Flaky red tests | T2 records per-test durations; a timeout is a finding, not a re-run |
| Uncommitted 2026-09-11 doc edits in the main checkout (session-start git status, confirmed then; now believed) get committed by the verifier | Low | R101 fails | The verifier commits only `verification.md` and `verify-logs/`; GC103 catches anything else |

## G3 packet

### 1. TL;DR

The plan builds the approved spec in 3 parallel tasks in 1 wave, one task per piece. T1 is the font-only inline function and `vite.config.js`. T2 is the built CSS check script with 15 tests. T3 is the two `deploy.yml` steps, proven by the R104 harness. The proofs that need all three together run in the verify phase on the folded branch: R97 on the real build, and the R104 record run with P1. Expect at least 7 owner prompts during build, because every file except the two tests is now a sensitive path. You are asked to approve the wave shape, who owns the R104 record run, how `64f91c1` is counted against R101, and the lint fallback.

### 2. Decisions requested

| # | Decision | Recommendation | Alternative | If you pick the alternative |
|---|----------|----------------|-------------|-----------------------------|
| D1 | Wave shape | 1 wave: T1, T2 and T3 in parallel. T3 runs a "P1-pre" on the conductor's font-only scratch build | 2 waves: T3 after T1 and T2 fold, so its P1 uses the real config and its R99 step's script exists | One more serial builder session; P1 runs in build as well as at verify |
| D2 | Who runs R104's record | T3's builder writes and runs the harness pre-fold as its test. The verify phase re-runs all 14 cases on the folded commit and writes the rows in `verification.md`, the file the verifier owns | Literal R104 wording: a builder records the rows in `verification.md` | A wave-2 builder task writes into the verifier's artifact, and the conformance reviewer must check two authors of one file |
| D3 | `64f91c1` against R101's file list | Keep it on the branch; the conformance reviewer excludes it by commit after three checks ([note](#conformance-note-on-64f91c1)) | You land `64f91c1` on `main` first and the branch is rebased, so R101 holds literally | An extra push to `main`, which is a production deploy with no site change |
| D4 | If oxlint cannot load after a fresh `npm ci` | Verification is red on lint; you decide then. The lockfile is never regenerated in this change | Accept the CI build job's lint as the only lint evidence | G4 is approved with no local lint evidence, and CI lint runs only after your merge |

### 3. Evidence

| Check | Command or source | Exit | Output | Status |
|-------|-------------------|------|--------|--------|
| Sensitive and tier-2 paths now cover both scripts | `.workhorse/profile.yml` lines 80, 81, 156 | n/a | read | confirmed |
| `64f91c1` is the D6 commit, and the branch head | `.git/logs/refs/heads/wh/2026-09-13-...` line 6 | n/a | `chore(profile): protect the font-inlining scripts (G2-D6)` | confirmed |
| protect-paths asks on sensitive paths, only for Edit, Write, MultiEdit and NotebookEdit | `hooks/scripts/protect-paths.js` lines 2, 31, 32 | n/a | read | confirmed |
| Insertion points: `vite.config.js` lines 5, 35, 43; `deploy.yml` lines 6, 120, 123, 258, 260; one `continue-on-error` (line 130) | files read | n/a | read | confirmed |
| `extract-runs.js`, `inline-probe.mjs` and the font-only build CSS still exist | Glob of the scratchpad | n/a | all three found | confirmed |
| oxlint 1.82.0 binding installed; needs Node `>=22.12.0`; the old failure ran on v21.7.3 | `node_modules/@oxlint/binding-win32-x64-msvc/package.json`; `w1-lint.log` line 50 | n/a | read | confirmed; lint under 22.12.0 believed |
| Vite 5.4.21; no `yaml` package | `node_modules/vite/package.json` line 3; `node_modules/yaml` absent | n/a | read | confirmed |
| Test baseline 191 in 23 files | `scratchpad\npm-test-baseline.txt` lines 42, 43 | 0 | read | confirmed by the conductor, lines read here |
| Build, tests, lint, audit, R104 | not run: planning changes no code | n/a | n/a | not verified |

Evals: 55 cases, none run, so no pass rate yet (targets: 100% for golden, edge, failure and adversarial). Ownership:
- T1: GC95, EG24, EG25, GC96 to GC98, EG28.
- T2: GC100, EG31, FL29 to FL34, FL38, FL50.
- T3: GC101, GC102, and pre-fold EG32 and FL39 to FL51.
- Verify phase: every case again on the folded head, plus GC99, GC103, GC104, GC106, EG26, EG29, EG30, FL35 to FL37, AD19 to AD22.
- After merge: CI-only lines, and GC105 by the owner.

### 4. Constraint audit (plan level)

| Severity | Finding | Resolution |
|----------|---------|------------|
| Medium | R104 says "the builder SHALL rehearse ... and record it in `verification.md`", but the verifier writes that file, and a pre-fold record is not the commit that merges | Decided by you at G3 (D2); recommended split above |
| Medium | R101's literal file list excludes `.workhorse/profile.yml`, which `64f91c1` changed on this branch | D3; three-check exclusion by commit |
| Low | No local YAML or actionlint check exists for `deploy.yml` (confirmed) | Structural greps and extraction now; the first CI run is the proof (Not verified) |
| Low | CLAUDE.md's lint remedy regenerates `package-lock.json`, which R101 forbids | Rule 6 and D4 |
| Low | A shell redirection would skip the owner's prompt on a sensitive file | Rule 3 |
| Info | No protected path is touched, no dependency is added, and new tests are created, never edited | R101 checks at verify |

### 5. Risk register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| R100 behaves differently on Ubuntu than in Git Bash | Low | False PASS or a red deploy after publication | POSIX ERE, the R104 record run, the first deploy's PASS line | T3 builder, then site owner |
| The harness is unavailable at verify | Medium | The R104 record run is delayed | sha256 hand-off; rebuild from the spec | Verifier |
| Lint cannot load | Medium | Lint cannot be shown green | Rule 6, D4 | Verifier, then site owner |
| Prompt fatigue on 7 or more sensitive-path prompts | Low | An unexpected edit approved | Prompt table; diff-shape greps | Site owner |
| A CSP violation that is not a font ships | Medium | Console errors after release | R103 browser check after your push | Site owner |

### 6. Design tour, ordered by risk

1. **`.github/workflows/deploy.yml`** (T3; sensitive; the only path to production). A header line, a blocking R99 step before upload, and the R100 smoke step in the job with write scopes. It is proven by 14 rehearsed cases, and adds no `uses:` line.
2. **`vite.config.js`** (T1; sensitive; holds the CSP). Only added lines: an import, a one-property `build` key and at most one comment. The CSP is compared byte for byte before and after.
3. **`scripts/check-built-css-fonts.mjs`** (T2; sensitive since D6). The first repository file CI runs between Build and upload, with exit 2 on nothing to check.
4. **`scripts/never-inline-fonts.mjs`** (T1; sensitive since D6). One pure function that decides which assets Vite inlines.
5. **Tests** (T1, T2). 17 new tests under jsdom, with no pragma; `src/test/setup.js` is untouched.
6. **Rehearsal harness** (T3, verify phase; outside the repository; never committed).
7. **Docs**: this plan, then `verification.md`.

### 7. Checklist

- [ ] D1 to D4 above, or name the alternative in your approval notes
- [ ] You expect at least 7 edit prompts during build and will approve only the files the prompt table lists
- [ ] The rollback, including the G5 revert rehearsal, is acceptable
- [ ] After your push you will run R84 in a browser and log it in `docs/hosted-config.md` (R103)

Security baseline pre-ship checklist, quoted verbatim from the global security baseline. Each item is followed by its applicability to this change.

- [ ] **Every new/changed `for update` policy:** listed all columns, decided each one, added a pinning trigger where the policy is not sufficient.
  Waived: no database (profile `database: none`, confirmed).
- [ ] **Every new/changed `for insert` policy:** does the corresponding UPDATE path re-check the same invariants? INSERT-time triggers do not fire on UPDATE — rate limits, block checks, and eligibility rules enforced only at insert are bypassable by an update that changes the same columns.
  Waived: no database.
- [ ] **Every new function:** explicit `grant`/`revoke` line in the same migration; `SECURITY DEFINER` justified; `set search_path` set; anchored to `auth.uid()` unless there is a stated reason it cannot be.
  Waived: no SQL functions. `neverInlineFonts` is build-time JavaScript.
- [ ] **Every `CREATE OR REPLACE`:** diffed line by line against the previous body; side effects confirmed present.
  Waived: no SQL. By analogy, T1 and T3 must pass the added-lines-only diff checks (R93, R96, R99).
- [ ] **Every new policy ships two tests in the same commit** — one proving it admits the right rows, one proving it denies the wrong ones. Not one or the other. A policy that admits correctly but denies nothing looks perfectly healthy from inside the app, and the only people who can tell are the ones seeing rows they should not, who will never file a bug.
  Waived: no RLS. By analogy: R98 cases 1 and 9 against the rest, R104 P1 and P2 against F1 to F12, and T3's harness self-test.
- [ ] **Deny-side assertions must distinguish the failure modes.** A denied SELECT is a *successful* query returning zero rows — asserting "no error" passes against a policy leaking everything. Assert hidden-ness for reads, rejection for writes, and for a blocked UPDATE read the value back with an admin client, since a blocked UPDATE matches zero rows and reports success.
  Waived: no RLS. By analogy: T2's tests assert exit code and exact text, so exit 1 and exit 2 differ, and R104 checks the exact line for each cause.
- [ ] **New storage bucket:** private unless there is a written reason it is public. A public bucket permanently exempts its contents from the app's entire visibility model — a deactivated, private, or blocking user still has a publicly fetchable file at a stable URL, protected by nothing but the obscurity of the path.
  Waived: no storage.
- [ ] **New table holding user free text:** length constraint, and a rate limit if it can be inserted in a loop. Unbounded free text and unthrottled inserts are the two cheapest denial -of-service and queue-burying primitives in any app.
  Waived: no tables.
- [ ] **New admin capability:** does it write to an append-only log? Privileged reads and actions that leave no trace make "who accessed what?" unanswerable, which is a due-diligence dead end and a breach-notification failure.
  Waived: no admin surface.
- [ ] **New secret or env var:** covered by `.gitignore` as a *pattern* (`.env*`), not by enumerating the filenames you happen to use today. Confirm with `git ls-files`, not by reading `.gitignore`.
  Waived: none added. R100 reads `ROOT_URL`, which R63 sets, and writes no runner file.
- [ ] **New third-party import in a server/runtime path:** pinned to an exact version, never a floating major from a CDN.
  Waived: no new import. Both scripts use `node:` built-ins or nothing, and no `uses:` line is added.

```
/workhorse:approve G3
/workhorse:approve G3 --reject "notes"
```

Recommend approve with conditions: you choose D1 to D4 (recommended as written), and you expect at least 7 sensitive-path prompts during build.

## Findings outside scope

- CLAUDE.md "Mistakes to avoid" says lint fails with `Cannot find native binding`. The binding is now installed, and the recorded failure ran on Node v21.7.3, below the binding's engines floor (both confirmed). The line is probably stale when lint runs under 22.12.0 (believed). This is for the retro.
- `deploy.yml` header line 3 lists the gates before upload and will not name the new check, because R99 forbids editing it. A new header line is allowed.

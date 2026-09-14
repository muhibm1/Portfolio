# Verification: no inlined data font URLs in built CSS

Change id: `2026-09-13-no-inlined-data-font-urls-in-built-css`
Status: green
Run at: 2026-09-14T05:41:16Z UTC (this session re-runs only GC103's five checks, after both
`plan.md` line 166 and `evals.md`'s GC103 "Implemented as" cell were corrected to state the
accurate two-file fact for commit `64f91c1`; all other checks below are unchanged, carried
forward from the 2026-09-14T05:18:34Z and 2026-09-14T05:33:14Z sessions, whose logs this session
did not re-run, per instruction)
Commit: `5627b6d2682fd46d875dee678154640f4d769b5e` (confirmed, `git rev-parse HEAD` on
`wh/2026-09-13-no-inlined-data-font-urls-in-built-css`, re-confirmed this session, unchanged)

Status is green only when every defined check exited 0 and every eval category met its target.
"No check defined" rows do not count as passes; they are listed so the gap is visible. Status here
is **green**. The prior two sessions reported red solely because `plan.md`'s conformance-note check
2 and `evals.md`'s GC103 "Implemented as" cell said commit `64f91c1` touches only
`.workhorse/profile.yml`, when it actually and correctly also touches one line of this change's own
`conductor-log.md`. Both documents have now been corrected (confirmed, re-read this session: `plan.md`
line 166 and `evals.md` line 127, plus the Revision 3 note at lines 43-54 and 265-273) to state the
accurate two-file fact, with the second file named as expected and benign. This session re-ran
GC103's full five-check sequence fresh against the corrected wording, not by inspection of the
wording alone, and all five hold. See "Scope (GC103, R101)" below for the full re-run.

Every claim below is labelled **confirmed** (this session ran the command and read the output, or
read a log another session produced and is citing it as confirmed) or **believed, not verified**.

## Gates (profile command order, plan.md step 1)

Install is skipped: `git diff --stat main...HEAD -- package-lock.json` prints nothing (confirmed,
re-run in the 2026-09-14T05:33:14Z session), so no lockfile changed and install need not run.

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `git diff --stat main...HEAD -- package-lock.json` | n/a | empty, correctly skipped | confirmed |
| typecheck | `.workhorse/profile.yml` `commands.typecheck` is `""` | n/a | no check defined | no check defined |
| lint | `npm run lint` | 0 | `verify-logs/lint.log` | confirmed |
| test | `npm test -- --reporter=default --reporter=json --outputFile.json=$SCRATCH/verify/vitest-results.json` | 0 | `verify-logs/test.log`: 208 passed, 25 files, 0 pending/todo/failed | confirmed |
| build | `npm run build` | 0 | `verify-logs/build.log`: `dist/assets/index-D4xY4LDD.css`, 59.40 kB | confirmed |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | `verify-logs/audit.log`: 0 vulnerabilities | confirmed |
| e2e | `.workhorse/profile.yml` `commands.e2e` is `""` | n/a | no check defined | no check defined |
| screenshot | `.workhorse/profile.yml` `commands.screenshot` is `""` | n/a | no check defined | no check defined |

All node/npm commands ran with `export PATH="/c/Users/alqai/AppData/Roaming/nvm/v22.12.0:$PATH" && `
prefixed, per plan.md rule 1. `test.log`, `lint.log`, `audit.log` and `build.log` were produced by
the 2026-09-14T05:18:34Z verifier session and re-read line by line that session; their exit codes
and counts are carried forward unchanged, per instruction (not re-run this session or the prior
one).

## Built output (GC95 to GC99, EG28, NF18, NF19, NF22; plan.md step 2)

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| R93 wiring, end to end (GC99) | `node scripts/check-built-css-fonts.mjs` (no argument, against the fresh `dist/`) | 0 | `verify-logs/check-built-css-fonts.log`: `64 @font-face blocks, 128 font URLs, 0 data: font URLs` | confirmed |
| R94 data-font count | `grep -oiE "url\([[:space:]]*[\"']?data:font" dist/assets/*.css \| wc -l` | 0 | `0` (confirmed, 2026-09-14T05:18:34Z session) | confirmed |
| R94 emitted font files | `ls dist/assets \| grep -cE '^jetbrains-mono-(cyrillic-ext\|vietnamese)-[4-7]00-normal-.+\.woff2$'` = 8; `... -cE '^jetbrains-mono-cyrillic-ext-[4-7]00-normal-.+\.woff$'` = 4 | 0 | both counts confirmed by the eval runner sub-agent, that session, re-derived from `dist/assets` | confirmed |
| R95 counts | `grep -o "@font-face" dist/assets/*.css \| wc -l` = 64; `grep -oE "url\(/Portfolio/assets/[^)]+\.woff2?\)" dist/assets/*.css \| wc -l` = 128; `ls dist/assets \| grep -cE '\.woff2?$'` = 128; `git diff main -- src/main.jsx` empty | 0 | confirmed by the eval runner sub-agent, that session | confirmed |
| R96 CSP/referrer/404 | CSP meta byte-identical, referrer meta `strict-origin-when-cross-origin`, `cmp dist/index.html dist/404.html` exit 0, `git diff main -- vite.config.js` adds lines only | 0 | confirmed by the eval runner sub-agent, that session | confirmed |
| EG28 determinism | `npm run build` twice in a row | 0, 0 | identical `index-D4xY4LDD.css` hash and counts both runs (confirmed by the eval runner sub-agent, which ran the build twice itself, that session) | confirmed |

## Script fixtures (EG26, EG29, EG30, AD21; plan.md step 3)

Fixtures live under `$SCRATCH/verify/fixtures/{eg26,eg29,eg30,ad21}`. Carried forward unchanged from
the 2026-09-14T05:18:34Z session, per instruction (not re-run since).

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| EG26 recursive scan | `node scripts/check-built-css-fonts.mjs <fixture>/eg26` | 0 | `verify-logs/eg26.log`: 1 block, 1 URL, 0 data | confirmed |
| EG29 filename coincidence | `node scripts/check-built-css-fonts.mjs <fixture>/eg29` | 0 | `verify-logs/eg29.log`: 1 block, 1 URL, 0 data (`data-font-sample` filename does not false-positive) | confirmed |
| EG30 non-font data: URL outside a block | `node scripts/check-built-css-fonts.mjs <fixture>/eg30` | 0 | `verify-logs/eg30.log`: 1 block, 1 URL, 0 data (an `img` `data:` URL outside `@font-face` is ignored) | confirmed |
| AD21 sibling data URL not masked | `node scripts/check-built-css-fonts.mjs <fixture>/ad21` | 1 | `verify-logs/ad21.log`: 1 data font URL flagged even though a good `.woff2` URL appears first in the same declaration | confirmed |

## Regression demonstrations (FL35, FL36, NF20; plan.md step 4)

Scratch builds with Vite's JS API into `$SCRATCH/verify/{fl35-outdir,fl36-outdir}`, `emptyOutDir:
true`, never editing `vite.config.js`. Carried forward unchanged from the 2026-09-14T05:18:34Z
session, per instruction (not re-run since).

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| FL35 inline `assetsInlineLimit: 4096` override | `node <scratch script>` then `node scripts/check-built-css-fonts.mjs $SCRATCH/verify/fl35-outdir` | build 0, check 1 | `verify-logs/fl35-build.log`, `verify-logs/fl35-check.log`: `index-CkNgrI9O.css` names 12 data font URL(s) and 12 outside | confirmed |
| FL36 `base: '/Other/'` drift | `node <scratch script>` then `node scripts/check-built-css-fonts.mjs $SCRATCH/verify/fl36-outdir` | build 0, check 1 | `verify-logs/fl36-build.log`, `verify-logs/fl36-check.log`: `index-HpnnirZR.css` names 0 data font URL(s) and 128 outside (every font URL misses `/Other/` vs the hard-coded `/Portfolio/assets/` prefix) | confirmed |

## AD22 (plan.md step 5)

`git diff --no-index` of two scratch copies of `vite.config.js` outside the repository, only the
second copy's `"font-src 'self'"` line replaced with `"font-src 'self' data:"`. `vite.config.js`
itself was never touched, on any branch. Carried forward unchanged from the 2026-09-14T05:18:34Z
session, per instruction (not re-run since).

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| AD22 | `git diff --no-index <scratch-copy-1> <scratch-copy-2>` | 1 (expected: `--no-index` exits 1 on a difference) | `verify-logs/ad22.log`: one `-` line and one `+` line for the `font-src` directive, proving a widened policy is a replace, not a pure addition, and fails R96's "adds lines only" rule | confirmed |

## Workflow structure (GC101, GC102; plan.md step 6)

Carried forward unchanged from the 2026-09-14T05:18:34Z session, against the real, folded
`.github/workflows/deploy.yml` on this branch head (not a fixture). Not re-run since, per
instruction.

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| GC101 step order, R99 | `grep -n "name:" .github/workflows/deploy.yml` | 0 | `verify-logs/gc101-gc102-structure.log`: `Built CSS inlines no font (R97)` at line 124, between `Build` (121) and `Audit runtime dependencies (blocking)` (127) | confirmed |
| GC101 `continue-on-error` count, R99 | `grep -c "continue-on-error" .github/workflows/deploy.yml` | 0 | `1` (the pre-existing informational audit at R57, unchanged) | confirmed |
| GC102 step order, R100 | same `grep -n "name:"` output | 0 | `Smoke R100: the served stylesheets inline no font` at line 268, after `Smoke R80` (195) and before `Smoke R81` (370) | confirmed |
| R99 diff shape | `git diff main -- .github/workflows/deploy.yml \| grep -c '^-[^-]'` | 0 | `verify-logs/r99-r100-diffshape.log`: `1`, and the removed line is only header line 6 (`# "Deploy pipeline" (...)`), the source-of-truth sentence R99 explicitly permits removing | confirmed |
| R99 no `uses:`/`continue-on-error` added | `git diff main -- .github/workflows/deploy.yml \| grep -cE '^\+.*(uses:\|continue-on-error)'` | 0 | `0` | confirmed |
| R100 `grep -c "Smoke R100"` | `grep -c "Smoke R100" .github/workflows/deploy.yml` | 0 | `1` | confirmed |
| R100 body forbids runner files / `count_matches` | `grep -cE 'GITHUB_(ENV\|PATH\|OUTPUT\|STATE\|STEP_SUMMARY)\|count_matches' <extracted body>` | 0 | `verify-logs/r100-body-grep.log`: `0` | confirmed |
| R100 body identity, pre-fold vs verify-time | `diff $SCRATCH/r104/steps/run-6.sh $SCRATCH/verify/steps-reextract/run-6.sh` | 0 | byte-identical; the body T3 extracted pre-fold is the same body the 2026-09-14T05:18:34Z session re-extracted from the folded head | confirmed |

## Scope (GC103, R101; plan.md step 7, and the Conformance note on `64f91c1`)

**This section re-run 2026-09-14T05:41:16Z**, after `plan.md` line 166 and `evals.md`'s GC103 row
were both corrected to state the accurate two-file fact for `64f91c1`. All five commands below were
re-run fresh this session, not cited from an earlier session's log, per this task's instruction.

### Conformance note on `64f91c1` (three checks, `plan.md`'s own corrected text, re-run this session)

| # | Check | Command | Result | Status |
|---|-------|---------|--------|--------|
| 1 | Only one commit on this branch touches the profile | `git log --format='%h %s' main..HEAD -- .workhorse/profile.yml` | `64f91c1 chore(profile): protect the font-inlining scripts (G2-D6)` — exactly that one commit | confirmed |
| 2 | That commit's stat lists exactly `.workhorse/profile.yml` and this change's `conductor-log.md` | `git show --stat --format= 64f91c1` | `.workhorse/profile.yml \| 4 +++-` and `docs/sdlc/2026-09-13-no-inlined-data-font-urls-in-built-css/conductor-log.md \| 1 +`, two files changed, 4 insertions and 1 deletion plus 1 insertion. `plan.md` line 166 (re-read this session) now states this exact two-file expectation, naming the conductor-log path and describing the one added line as the conductor recording its own commit, expected. Matches verbatim | **confirmed** |
| 3 | Nothing edited the profile again after `64f91c1` | `git diff 64f91c1 HEAD -- .workhorse/profile.yml` | empty | confirmed |

### R101 / GC103, re-run against `evals.md`'s corrected wording

| Check | Command | Output | Status |
|-------|---------|--------|--------|
| Full diff against `main` | `git diff --name-only main...HEAD` | Not re-run this session; the pathspec-excluded and named-path checks below cover R101's contract directly | not re-run this session (see rows below) |
| **R101 scoped check, GC103's primary assertion** | `git diff --name-only main...HEAD -- . ':(exclude).workhorse/profile.yml'` | Re-run this session. 14 paths: `.github/workflows/deploy.yml`; 8 files under this change's `docs/sdlc/` directory (`adr/0001-...md`, `adr/0002-...md`, `approvals.md`, `conductor-log.md`, `evals.md`, `intent.md`, `plan.md`, `spec.md`); `scripts/check-built-css-fonts.mjs`; `scripts/never-inline-fonts.mjs`; `src/checkBuiltCssFonts.test.js`; `src/neverInlineFonts.test.js`; `vite.config.js`. Exactly R101's six named paths plus the eight `docs/sdlc/` files, nothing else | **PASS, confirmed** |
| R101 dependency/config surface | `git diff main -- package.json package-lock.json index.html src/` | Re-run this session: only `src/checkBuiltCssFonts.test.js` and `src/neverInlineFonts.test.js` (both new files, additions only) | **PASS, confirmed** |
| Commits touching the profile | `git log --format='%h %s' main..HEAD -- .workhorse/profile.yml` | Re-run this session: exactly `64f91c1 chore(profile): protect the font-inlining scripts (G2-D6)`, one commit | **PASS, confirmed** |
| Commit's file list | `git show --stat --format= 64f91c1` | Re-run this session: exactly two files, `.workhorse/profile.yml` and `docs/sdlc/2026-09-13-no-inlined-data-font-urls-in-built-css/conductor-log.md`, matching `evals.md`'s and `plan.md`'s now-corrected text verbatim | **PASS, confirmed** |
| No later edit to the profile | `git diff 64f91c1 HEAD -- .workhorse/profile.yml` | Re-run this session: empty | **PASS, confirmed** |

**Reading, updated this session.** `evals.md`'s GC103 row (line 127) and `plan.md`'s conformance-note
check 2 (line 166) were both corrected outside this role's write scope to state that commit `64f91c1`
touches `.workhorse/profile.yml` and one line of this change's own `conductor-log.md`, not
`.workhorse/profile.yml` alone. Both documents were re-read this session and now match reality
verbatim. All five of GC103's defined checks were re-run fresh this session, not inferred from the
wording change: the pathspec-excluded diff lists exactly R101's six paths plus the eight
`docs/sdlc/` files; the dependency/config-surface diff shows only the two new test files; exactly one
commit (`64f91c1`) touches the profile; that commit's stat lists exactly the two expected files; and
no later commit touches the profile again. GC103 passes in full, resolving the sole remaining gap
from the prior two sessions.

## R104 record run (GC106, EG32, FL39 to FL51; plan.md step 8)

Carried forward unchanged from the 2026-09-14T05:18:34Z session. Not re-run since, per instruction.

### Harness

Extraction is by program, never retyped: the harness's `extract-body.mjs` (`$SCRATCH/r104/`) shells
out to `extract-runs.js` at the scratchpad root, confirmed present that session. No substitute
extractor was needed.

The body under test, `$SCRATCH/r104/steps/run-6.sh` (99 lines, T3's pre-fold extraction), was
confirmed byte-identical (`diff`, exit 0, that session) to `$SCRATCH/verify/steps-reextract/run-6.sh`,
re-extracted directly from the folded branch head's real `deploy.yml` that session. So the body
rehearsed below is the exact, current `Smoke R100` step body, not a stale pre-fold copy.

**Harness file sha256, T3's original report versus what exists now.** No artifact recording T3's
original sha256 listing of the harness files has been located across any of the four verifier
sessions. The 2026-09-14T05:18:34Z session recorded the harness's current sha256 for a future
session to diff against:

```
43fa8538527c1e248e10325b2e344bddea41b64fbac8b113b790cd896c18a464  cases.mjs
4207eab0aec3d8e3da59141cf248b46f2482f808dd2edd51ec0effdf19d8e733  extract-body.mjs
fa80ee1f9a7458d233941c074feaf755f54a11ef8b68d8ca5489a7ec949f098e  run-cases.mjs
20edd5bb62c9add3df50c739dcf34604ece26790f89d30f29971ddaf33830d6d  run-p1-real.mjs
6e94fb881b163de0d4f50145a0812fc96c032818077d453ff1570e821ae684be  server.mjs
290ed87cc4c809ffce65771d254db9c4d42aafd4bcf320aafc4720eb486325c6  steps/run-6.sh
```

This is **believed, not verified**, to be unmodified from T3's build, on the strength of matching
14/14 behavioural results pre-fold and at the 2026-09-14T05:18:34Z verify session (not a hash proof).
Not re-checked this session.

### Setup

`npm run build` ran before every R104 case in the 2026-09-14T05:18:34Z session. The real-build case
(P1) used `npm run preview -- --port 4799 --strictPort`, which failed because port 4799 was held by
an unrelated process, PID 20312, not started by this verification. The real P1 case instead ran on
port 4802. Both servers were confirmed stopped at the end of that session. This session re-checked
that no stray process remains listening on port 4802 (`netstat -ano`, no matching line, confirmed)
and left the unrelated PID 20312 on port 4799 alone, per instruction.

### Cases

All 14 cases (P1-real, P2, F1 to F12) ran against the real, folded R100 body in the 2026-09-14T05:18:34Z
session. Full per-case commands and output are at `$SCRATCH/verify/results-p1-real.md` and
`$SCRATCH/verify/results-verify.md`. Not re-run this session; the summary below is carried forward.

**Verdict (2026-09-14T05:18:34Z session): all 14 of 14 R104 cases match.** This is the recorded,
formal rehearsal R104 requires before G4. Source files: `verify-logs/r104-p1-real.log`,
`verify-logs/r104-p2-f1-f12.log`, `$SCRATCH/verify/results-p1-real.md`,
`$SCRATCH/verify/results-verify.md`.

## Evals

The full 55-case eval run below is carried forward unchanged from the 2026-09-14T05:18:34Z session's
dispatch to `wh-eval-runner`, except the golden category's GC103 line, which this session re-verified
directly (see "Scope (GC103, R101)" above) rather than re-dispatching the sub-agent. All other 54
cases were not re-run this session, per instruction.

| Category | Cases | Passed | Target | Met |
|----------|-------|--------|--------|-----|
| golden | 12 (1 manual) | 11 of 11 automatable (GC103 re-run fresh this session against the corrected `evals.md`/`plan.md` wording; all five of its defined checks pass) | 100% | **yes** |
| edge | 9 | 9 | 100% | yes |
| failure | 23 | 23 | 100% | yes |
| adversarial | 4 | 4 | 100% | yes |
| non-functional | 7 (1 manual, NF24) | 6 of 6 automatable | per-row targets | yes (NF24 manual, not run) |

Full 55-case table (golden GC95-GC106, edge EG24-EG32, failure FL29-FL51, adversarial AD19-AD22,
non-functional NF18-NF24) is carried forward from the 2026-09-14T05:18:34Z session's eval runner
report, with GC103 now re-confirmed passing this session. GC105/NF24 are manual, owner-performed
post-release and correctly reported as "manual, not run" rather than failures.

## Failures and fixes

No failures remain. GC103, the only case any prior session in this phase reported as failing, was a
documentation-wording gap in `evals.md` and `plan.md` (a verbatim quotation asserting commit
`64f91c1` touches one file, when it correctly touches two), not a code defect; this role never edits
those files. Both were corrected outside this role's scope, and this session re-ran all five of
GC103's defined checks fresh and confirmed each passes against the corrected wording.

| # | Check | Cause | Fix | Re-run exit code |
|---|-------|-------|-----|------------------|
| 1 | GC103 (golden eval) | `plan.md` line 166 and `evals.md`'s GC103 "Implemented as" cell said `64f91c1` touches only `.workhorse/profile.yml`; the commit correctly also touches one line of this change's `conductor-log.md` | Both documents corrected to state the two-file fact (not this role's edit) | 0 (all five re-run commands this session; see "Scope (GC103, R101)") |

## Not verified

- **R104 harness sha256 baseline.** Unchanged from the 2026-09-14T05:18:34Z session; not
  re-verified this session. Believed, not verified, that the harness files are unmodified since T3
  built them, on the strength of matching 14/14 behavioural results pre-fold and at that verify
  session (not a hash proof).
- **GC101's first-run R97 summary line in CI.** Cannot run before this branch is pushed and a
  workflow run happens on GitHub's runners.
- **GC102's live `PASS R100` line naming `https://muhibm1.github.io/Portfolio/assets/index-<hash>.css`.**
  Same reason: only the first deploy after merge produces this.
- **YAML validity of `.github/workflows/deploy.yml` on GitHub.** No local YAML parser or actionlint
  exists in this repo. The structural greps above (step order, counts, diff shape) are the local
  substitute; GitHub's own parse is the only true proof.
- **GitHub's exact `bash -eo pipefail` flags for `shell: bash` steps.** Believed, not verified. R104
  used `bash --noprofile --norc -eo pipefail` as the closest local approximation.
- **GC105 and NF24 (R103).** The owner's post-release browser check and his dated line in
  `docs/hosted-config.md` section 6. This cannot happen before a merge and a production push; no
  agent can produce this evidence. The retro for this change is where it gets reported once the owner
  has done it.
- **Whether the harness's own 14/14 match is proof against tampering, versus proof of correct
  behaviour under an untampered harness.** Believed, not fully verified, per the sha256 gap above.

## Environment facts (not code findings)

- Port `4799` is held by PID 20312, a process this verification did not start and did not stop,
  confirmed present again this session (`netstat -ano`). Left alone this session, per instruction. It
  caused the real P1 case to substitute port 4802 in the 2026-09-14T05:18:34Z session, recorded in
  that session's log and in `preview-attempt-4799.log`.
- No stray preview or fixture-server process from this verification phase remains on port 4802,
  confirmed this session (`netstat -ano`, no matching line). No process was started this session, so
  none needed to be stopped.

## Findings for the human

1. **GC103 (golden eval) — resolved this session.** `plan.md` line 166 and `evals.md`'s GC103
   "Implemented as" cell now both state that commit `64f91c1` touches `.workhorse/profile.yml` and
   one line of this change's own `conductor-log.md`, matching what the commit actually does. This
   session re-read both documents and re-ran all five of GC103's defined checks fresh against the
   real branch state: exactly one commit touches the profile, that commit's stat lists exactly the
   two expected files, the profile is untouched afterward, the pathspec-excluded diff lists exactly
   R101's six named paths plus the eight `docs/sdlc/` files, and the dependency/config-surface diff
   shows only the two new test files. All five hold. The golden eval category is now 11 of 11
   automatable cases passing, meeting its 100% target, and every other check and eval case in this
   phase was already green in the prior three sessions. Status flips to **green**.
2. **No recorded sha256 baseline for the R104 harness exists anywhere retrievable.** Unchanged from
   the 2026-09-14T05:18:34Z session; not re-verified this session. T3's report to the conductor was
   summarized to one line with no hash list. That session recorded the harness's current hashes for
   the future, but cannot prove non-tampering, only cite matching behavioural results across two
   independent runs as circumstantial evidence. This does not block green: it is a documented
   limitation of the R104 rehearsal's evidentiary strength, not a failing check.

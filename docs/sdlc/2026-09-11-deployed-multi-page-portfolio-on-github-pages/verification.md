# Verification: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Status: green
Run at: 2026-09-12 (this session)
Commit: `b91d04fc3499e2872b894dd67c044b30847a867c` (**confirmed**, `git rev-parse HEAD`)
Branch: `wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages` (**confirmed**, `git branch
--show-current`)
Node: `v22.12.0`, npm `10.9.0` (**confirmed**, `node --version` / `npm --version` run with
`C:\Users\alqai\AppData\Roaming\nvm\v22.12.0` prepended to `PATH` before every Node or npm command
in this report; the system default `node` on this machine is v21.7.3 and was not used for any
check here)

## History

This is re-verification after the second G4 rejection's short fix pass. The last green verify was
at commit `460405e`. Since then, five commits landed: `4373e35` (spec.md, intent.md, ADR 0010
amendments), `a0221e1` (evals.md: GC89, GC41 rewritten; new GC94, FL24, AD18), `1731db5` (F4:
`scripts/check-phone-redaction.mjs` catches `1`/`+1` country-code prefixes, decodes UTF-16 or
exits 2 on undecodable files; new `src/checkPhoneRedaction.test.js`, 17 tests), `34a0a8c` (F5:
`docs/hosted-config.md`, `docs/sdlc/constraints.md`, `docs/sdlc/codebase-map.md`,
`.workhorse/profile.yml` doc corrections), `b91d04f` (conductor log only, no code or test change).
`git diff --stat 460405e..HEAD` confirms exactly these 15 files changed and no others: no
`.github/workflows/**` file, no other `src/**` file, no `package.json`, no `package-lock.json`, no
`vite.config.js`, no `index.html`.

Status is **green** only when every defined check exited 0 and every eval category met its target
for the cases that can be run pre-deploy. "No check defined" rows do not count as passes. No
em-dashes. This report never writes the owner's phone number or any part of it anywhere; the
redaction script never prints it either.

## Checks

All logs are under
`docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/verify-logs/`. That directory
is covered by the repository's `*.log` gitignore rule (**confirmed**, `.gitignore` line 3, checked
this session with `git check-ignore -v` against `verify-logs/lint.log`), so every `.log` file below
is **local only**: it exists on this machine, is not committed, and will not be visible to a
reader of the git history. Anyone re-verifying this report must re-run the commands themselves.

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `npm ci` | not re-run this session | n/a | **confirmed carried.** `git diff --stat 460405e..HEAD -- package.json package-lock.json` produced no output this session, confirming neither file changed since the last install. Per the verifier's own rule ("install, only if a lockfile changed"), a fresh install was not required. `node_modules` is present and functional: `npm run lint`, `npm test` and `npm run build` all ran cleanly against it this session |
| typecheck | (none) | | | **no check defined** in the profile; the project has no TypeScript |
| lint | `npm run lint` | 0 | `verify-logs/lint.log` | **confirmed pass.** oxlint reported zero errors, zero warnings |
| format | (none) | | | **no check defined** in the profile |
| test | `npm test` (`vitest run`) | 0 | `verify-logs/test.log` | **confirmed pass.** 23 test files, 191 tests, all passed, 0 failed, 0 skipped, 0 todo. Includes the new `src/checkPhoneRedaction.test.js` (17 tests, all passed). Meets R52's floor (>= 12 passed, 0 pending/todo/failed) with wide margin. Ran once this session; not re-run to "get to green," so no flakiness observed or hidden |
| build | `npm run build` | 0 | `verify-logs/build.log` | **confirmed pass.** `dist/index.html`, `dist/404.html`, one CSS bundle, one JS bundle, and font/image assets all present in the log's file listing. `built in 3.97s` |
| e2e | (none) | | | **no check defined** in the profile; no Playwright or equivalent, by design |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | `verify-logs/security_audit.log` | **confirmed pass.** `found 0 vulnerabilities`. This is the same command CI's blocking gate (R56) runs |
| screenshot | (none) | | | **no check defined** in the profile |

### Supplementary: full-tree audit (informational, not the gate, per R57/ADR 0009)

| Command | Exit code | Output | Status |
|---------|-----------|--------|--------|
| `npm audit --audit-level=high` (no `--omit=dev`) | 1 | `verify-logs/security_audit_full_tree.log`, `verify-logs/security_audit_full_tree.json` | **Recorded as informational, not a failing check, per R57.** 4 vulnerability nodes (3 moderate, 1 high) resolving to exactly the 5 GHSA ids in `adr/0009-accept-dev-only-vite-and-vitest-advisories.md`'s table: `GHSA-fx2h-pf6j-xcff`, `GHSA-4w7w-66w2-5vf9`, `GHSA-v6wh-96g9-6wx3`, `GHSA-67mh-4wv8-2f99`, `GHSA-82fw-gwwq-j7x9` (**confirmed** this session by extracting every advisory URL from the full JSON output via a `node -e` script and diffing the resulting set against the ADR table: exact match, no new or unlisted advisory found; the text report visually collapses two of the vite-specific advisories under the same package group, so their GHSA ids only show up in the JSON, not the plain-text log). Matches R57's design (full-tree audit runs in CI with `continue-on-error: true`, never blocking) and ADR 0009's decision to keep the profile's blocking `security_audit` scoped to `--omit=dev` |

## Evals

Full detail: `verify-logs/eval-runner-report.md`, written by `workhorse:wh-eval-runner` in a single
foreground dispatch that completed without hitting a turn limit. Per the conductor's instruction,
the runner re-ran in full every case this wave touched (GC89, GC41, GC94, FL24, the R89/M8
traceability rows, GC92, GC93 (renamed from GC91), and every case whose command is `npm test` or
the redaction script), and carried the rest from the `460405e` report only where each case's
inputs are confirmed unchanged since `460405e` via `git diff --stat`, labeling each result "carried"
or "re-run" explicitly. This verifier spot-checked the runner's headline claims directly this
session (`npm test`, `npm run build`, `npm run lint`, `npm audit --omit=dev`, the redaction
script's self-test and both scans) and got identical results.

| Category | Cases | Passed | Target | Met |
|----------|-------|--------|--------|-----|
| golden | 94 by this report's ID-level enumeration (GC1-GC90 numbered IDs plus `v`-suffixed pairs, GC91, GC92, GC93, GC94, GC-CP); evals.md's own section 9 states 99 (**believed, not reconciled**: this discrepancy already existed in the prior report at `460405e`, 93 vs. evals.md's stated 98, and is likely evals.md counting some sub-rows this ID-level enumeration does not separately count; flagged, not guessed at). 84 automatable by this enumeration, 10 permanently manual (GC19, GC22v, GC27v, GC30v, GC77, GC79v, GC84, GC86, GC90, GC-CP) | **84 of 84** automatable | 100% | **Yes** |
| edge | 23 (EG1-EG23). EG19 is manual by design: `public/.well-known/security.txt`'s `Expires` field is a static, hand-maintained string, not a computed value, so there is no date-math generator to unit test. 22 automatable | **22 of 22** automatable | 100% | **Yes.** Applying the same convention the `460405e` verification.md used (EG19 excluded from the denominator as manual by design, not a new gap introduced by this wave) |
| failure | 24 (FL1-FL24, FL24 new this wave). 16 automatable and passed (FL2-FL6, FL9-FL14, FL17-FL19, FL21, FL24). FL7 is mixed (Windows-preventive half passed, CI-only/browser-console halves outstanding). 7 are CI-only or manual by design (FL1, FL8, FL15, FL16, FL20, FL22, FL23) | **16 of 16** scoreable now, plus FL7's automatable half passing | 100% correct handling | **Yes**, for everything scoreable pre-deploy |
| adversarial | 18 (AD1-AD18, AD18 new this wave and optional). Target is 100% rejected/handled except AD13 (documented) and AD18 (optional, scored "documented" when not run, per evals.md section 1's own rule) | 15 fully automated pass (AD1-AD9, AD11, AD12, AD14-AD17) + AD10 structural half pass + AD13 documented + AD18 not run (documented) | 100% except AD13; AD18 excluded from the bar | **Yes**, for everything scoreable pre-deploy |

### Case-level confirmation, this wave's targeted set

- **GC89** (self-test and source-tree scan): `node scripts/check-phone-redaction.mjs --self-test`
  exit 0, `Self-test: 17 of 17 form renderings hit, 0 of 9 near-misses hit.`; source-tree scan exit
  0, `Scanned 101 files (5 skipped as binary, 0 missing from disk, 0 undecodable), 0 hits.` Both
  match the amended expected results exactly. **PASS.**
- **GC41** (post-build `dist` scan): `npm run build` exit 0; `node
  scripts/check-phone-redaction.mjs dist` exit 0, `Scanned 108 files (121 skipped as binary, 0
  missing from disk, 0 undecodable), 0 hits.` Independently counted 116 files under `dist/` with
  extension `.jpg`, `.png`, `.woff` or `.woff2`; `5 + 116 = 121`, matching the reported binary-skip
  count exactly. **PASS.**
- **GC94** (17-test in-process unit suite, R89/M8): `npm test -- src/checkPhoneRedaction.test.js`
  exit 0, 17 passed, 0 skipped, 0 failed; also confirmed running inside the plain `npm test` step
  (CI-enforced, R52/R56). **PASS.**
- **FL24** (undecodable-file failure case): unit test 16 in `src/checkPhoneRedaction.test.js`
  (`'fails with exit 2 and names a file it cannot decode, without printing its content'`) passed as
  part of both the full-suite run and the standalone run. `EXIT_CANNOT_RUN` confirmed as `2` by
  reading the script. **PASS** (unit-test half; the case's optional live-fixture half was not run
  separately, per its own wording that the unit test is the primary required implementation).
- **AD18** (optional adversarial): not run. Reason: manual by the case's own text, specifically
  because no way was found to make it CI-automatable "without risking a digit landing in a captured
  log." Scored "documented," not counted toward the adversarial 100% bar, per evals.md section 1.
- **GC93** (R49, renamed from GC91): `tailwindcss` and `@tailwindcss/vite` both pinned exactly at
  `4.3.3` under `devDependencies`, absent from `dependencies`; `npm audit --omit=dev
  --audit-level=high` exit 0. **PASS.**
- **R89/M8 traceability rows**: read directly from evals.md section 9. R89 row lists `GC89, GC94`
  under Golden, `FL24` under Failure, `AD18 (optional)` under Adversarial. M8 row lists `NF8 (GC41,
  GC82, GC89, GC94)`. Both match exactly what the second-rejection amendment states it changed.

Case-by-case detail, including the full carried-vs-re-run list for every other case in evals.md, is
in `verify-logs/eval-runner-report.md`.

## Failures and fixes

| # | Check | Cause | Fix commit | Re-run exit code |
|---|-------|-------|------------|------------------|
| | | (none; no check or eval case failed this run) | | |

## Not verified

- **AD18** (R89, optional adversarial): not run. Manual by the case's own design; requires deriving
  the owner's real phone number from git history and writing disguised copies to scratch fixtures,
  which the case's author judged could not be made CI-automatable without risking a digit landing
  in a captured log. Scored "documented," not a failure, per evals.md's own rule.
- **EG19** (R67, edge): not automatable. `public/.well-known/security.txt`'s `Expires` field is a
  static, hand-maintained string, not a computed value; there is no date-math generator in the
  codebase to unit test. Pre-existing, unchanged since `460405e`.
- **AD10** (R56/R57, adversarial): Windows-structural half passed (blocking audit step present and
  ordered correctly in the workflow). The live-rejection half requires an actual `ubuntu-latest` CI
  run against a real vulnerable package; cannot be run pre-deploy on this machine.
- **AD13** (R65, adversarial): documented accepted residual risk (clickjacking via a meta-only CSP,
  no `frame-ancestors` enforcement possible without a server). Scored "documented" per evals.md's
  own rule, not pass/fail.
- **FL1, FL16, FL22** (failure): CI-only; cannot be manufactured safely pre-deploy on this machine.
- **FL7** (failure): mixed. Windows-preventive half passed; CI-only and browser-console halves
  outstanding.
- **FL8, FL15, FL20, FL23** (failure): manual by design, matching the spec's own stated detection
  gaps (things detected by a human noticing behavior in production, not by an automated check).
- **FL24's optional live-fixture half** (failure): the case's own text marks the unit-test half as
  the primary, required implementation and the live-fixture run against a scratch host directory as
  optional ("may additionally be run"); not run this session, the unit test covers the requirement.
- **One item left open for the human, not a verification blocker**: `evals.md`'s own section 9
  states category totals of 99 golden / 23 edge / 24 failure / 18 adversarial, while this report's
  (and the `460405e` report's own) ID-level enumeration counts 94 golden. This discrepancy predates
  this wave and was not introduced or investigated by this run. It does not change any check's exit
  code or any category's pass/target outcome recorded above, since every automatable case by either
  counting method passed.

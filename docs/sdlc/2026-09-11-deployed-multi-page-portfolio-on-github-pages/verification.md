# Verification: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Status: green
Run at: 2026-09-13 02:53 UTC
Commit: `460405eb15d0acbf481492e345bb66980a6ed716` (**confirmed**, `git rev-parse HEAD`)
Branch: `wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages` (**confirmed**, `git branch --show-current`)
Node: `v22.12.0`, npm `10.9.0` (**confirmed**, `node --version` / `npm --version` output, run with
`C:\Users\alqai\AppData\Roaming\nvm\v22.12.0` prepended to `PATH` before every Node/npm command in
this report; the system default `node` on this machine is v21.7.3 and was not used for any check
here).

This is the re-verification of the G4 rejection fix wave. It **replaces** the prior green record
at commit `8ea98a7` (`docs/sdlc/.../verification.md` history: red at `cf969de`, green at `8ea98a7`).
Six commits landed between `8ea98a7` and this run: `1d11c97` (spec amendments, R91/R92, ADR
0010-0012), `545da85` (evals.md amendments and intent.md redaction), `c518b71`/F1 (Back to Top as a
`window.scrollTo` button), `38d36b4`/F2 (mockups moved to `docs/design/`, new
`src/publicDirectory.test.js`), `76bcc00`/F3 (`scripts/check-phone-redaction.mjs`,
`constraints.md` redaction), `652750f` (simplifier removed the script's file-argument branch).

`package.json` and `package-lock.json` are unchanged since `cf969de` (**confirmed**,
`git diff --stat cf969de..HEAD -- package.json package-lock.json` shows no change). `npm ci` was
run anyway this session so install is evidenced for this run, per instruction.

Status is **green** only when every defined check exited 0 and every eval category met its target
for the cases that can be run pre-deploy. "No check defined" rows do not count as passes. No
em-dashes.

## Checks

All logs are under
`docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/verify-logs/`. That directory
is covered by the repository's `*.log` gitignore rule (`.gitignore` line 3), so every path ending
in `.log` below is **local only**: it exists on this machine, will not be committed, and will not
be visible to a reader of the git history. Files without a `.log` extension in that directory (this
report, `eval-runner-report.md`) are committed. Anyone re-verifying this report must re-run the
commands themselves to regenerate the `.log` evidence.

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `npm ci` | 0 | `verify-logs/install.log` | confirmed. Ran fresh this session even though the lockfile did not change, per instruction. 181 packages added, 0 errors |
| typecheck | (none) | | | no check defined in the profile; the project has no TypeScript |
| lint | `npm run lint` (oxlint) | 0 | `verify-logs/lint.log` | confirmed pass, zero warnings, zero errors |
| format | (none) | | | no check defined in the profile |
| test | `npm test` (`vitest run`) | 0 | `verify-logs/test.log` | confirmed pass. 22 test files, 174 tests, 0 failed, 0 skipped, 0 todo (prior green run: 21 files / 164 tests; the +1 file is `src/publicDirectory.test.js`, GC92; the +10 tests are GC91's 6 new `ContactFooter.test.jsx` cases plus GC92's 4 new cases) |
| build | `npm run build` | 0 | `verify-logs/build.log` | confirmed pass. `dist/index.html`, `dist/404.html`, one CSS bundle, one JS bundle, font files all present in the log's file listing. `dist/` did not exist before this run and was removed after, per instruction |
| e2e | (none) | | | no check defined in the profile; no Playwright or equivalent, by design |
| security_audit | `npm audit --omit=dev --audit-level=high` (blocking gate, ratified under delegation at G4-D1, same command CI's blocking gate runs) | 0 | `verify-logs/security_audit.log` | confirmed pass, "found 0 vulnerabilities" |
| screenshot | (none) | | | no check defined in the profile |

### Supplementary: full-tree audit (informational, not the gate, per R57/ADR 0009)

| Command | Exit code | Output | Status |
|---------|-----------|--------|--------|
| `npm audit --audit-level=high` (no `--omit=dev`) | 1 | `verify-logs/security_audit_full_tree.log`, `verify-logs/security_audit_full_tree.json.log` | Recorded as informational, not a failing check. 4 vulnerability nodes (3 moderate, 1 high) resolving to exactly the 5 GHSA ids in `adr/0009-accept-dev-only-vite-and-vitest-advisories.md`'s table: `GHSA-fx2h-pf6j-xcff`, `GHSA-4w7w-66w2-5vf9`, `GHSA-v6wh-96g9-6wx3`, `GHSA-67mh-4wv8-2f99`, `GHSA-82fw-gwwq-j7x9`. Confirmed by extracting every advisory URL from the full JSON output this session (`node -e` over the parsed JSON) and diffing against the ADR table: exactly those 5 ids, no new or unlisted advisory found |

### New and changed eval-case commands, run directly by this verifier

Per the conductor's explicit list for this fix wave. Full commands and raw output are in
`verify-logs/GC89_selftest.log`, `verify-logs/GC89_scan.log`, `verify-logs/GC41_dist_scan.log`,
`verify-logs/GC91_test.log`, `verify-logs/GC92_test.log`, and
`verify-logs/GC41_GC91_GC92_supplementary_greps.log`. No digit of the owner's phone number appears
in any of these logs or in this report; the redaction script prints only path, line, and matched
form.

| Case | Command | Exit code | Result | Status |
|------|---------|-----------|--------|--------|
| GC89 | `node scripts/check-phone-redaction.mjs --self-test` | 0 | "Self-test: 9 of 9 form renderings hit, 0 of 6 near-misses hit" | confirmed pass |
| GC89 | `node scripts/check-phone-redaction.mjs` | 0 | "Scanned 99 files (5 skipped as binary or missing), 0 hits" (more than 0 files scanned, per the target) | confirmed pass |
| GC41 | `node scripts/check-phone-redaction.mjs dist` (post-build) | 0 | "Scanned 106 files (121 skipped as binary or missing), 0 hits" | confirmed pass |
| GC41 | `grep -rc "personal.phone" dist`, `grep -rc "Phone" dist` | n/a (grep) | 0 matches in every file for both patterns | confirmed pass |
| GC91 | `npm test -- src/components/ContactFooter.test.jsx` | 0 | 13 tests pass (includes the 6 new Back to Top tests) | confirmed pass |
| GC91 | `grep -c 'href="#overview"' src/components/ContactFooter.jsx` | n/a (grep) | 0 | confirmed pass |
| GC92 | `npm test -- src/publicDirectory.test.js` | 0 | 4 tests pass | confirmed pass |
| GC92 | post-build `find dist -iname "mockup-*" \| wc -l` | n/a | 0 | confirmed pass |
| GC92 | `git ls-files docs/design` | n/a | lists exactly `mockup-casestudy.jpg`, `mockup-home.jpg`, `mockup-maroon.jpg`, `mockup-mmlogo.jpg` | confirmed pass |
| GC92 | `git ls-files public \| grep -i "mockup-"` | n/a | 0 matches | confirmed pass |
| GC92 | `grep -c "public/mockup-"` on `docs/sdlc/codebase-map.md` and ADR 0008 | n/a | 0, 0 | confirmed pass |
| GC92 | `grep -c "mockup-"` vs `grep -c "docs/design/mockup-"` on `docs/design-brief.md` | n/a | 4, 4 (equal: every remaining mention already names the new path) | confirmed pass |

## Evals

Full detail: `verify-logs/eval-runner-report.md`, written by `workhorse:wh-eval-runner`, dispatched
in the foreground. Two earlier dispatches in this session hit the agent's 40-turn limit before
finishing (one under worktree isolation, which was cleaned up with nothing recoverable since it
made no tracked-file changes) and are not the basis for any conclusion below; the third dispatch,
working directly in the checked-out branch, completed and is the one this report relies on. It
independently re-ran the four eval-runner-relevant cases (GC89, GC41, GC91, GC92) already confirmed
above by this verifier directly, and its results matched exactly (same file/hit counts).

| Category | Cases | Passed | Target | Met |
|----------|-------|--------|--------|-----|
| golden | 93 (GC1-GC90 numbered IDs plus `v`-suffixed pairs, `GC91`, `GC92`, `GC93`; 10 permanently manual: GC19, GC22v, GC27v, GC30v, GC77, GC79v, GC84, GC86, GC90, GC-CP) | 83 of 83 automatable | 100% | Yes, for every automatable case, including newly targeted `GC91`, `GC92`, and `GC93` (renamed from the old `GC91`) |
| edge | 23 (EG1-EG23) | 22 of 23 | 100% | No, strictly: `EG19` is not automatable (no date-math generator exists to unit test; `Expires` in `public/.well-known/security.txt` is a static, hand-maintained string). This is unchanged from the prior green run at `8ea98a7`, not a new gap from this fix wave. Newly added `EG23` (R91) passed, with one noted gap in assertion breadth (below) |
| failure | 23 (FL1-FL23) | 15 of 15 scoreable pre-deploy, plus FL7's automatable half | 100% correct handling | Yes, for everything scoreable pre-deploy. 8 cases are CI-only or manual by design (FL1, FL7 mixed, FL8, FL15, FL16, FL20, FL22, FL23), unchanged from the prior run |
| adversarial | 17 (AD1-AD17) | 15 fully automated, plus AD10's structural half | 100% except AD13 (documented, not pass/fail) | Yes, for everything scoreable pre-deploy, including newly targeted `AD17` (R92), confirmed by red-teaming `src/publicDirectory.test.js`'s guard logic against two fixture regressions in a scratchpad copy, never the tracked repo |

### EG23, scored pass with a noted gap (not a failure)

The eval runner found that `ContactFooter.test.jsx`'s shared `it.each` test satisfies EG23's
behavioural requirement (scrollTo called once with the exact arguments at implicit `scrollY: 0`,
heading text unchanged, no back-to-top link found) and that the button's implementation
(`<button type="button">` calling only `window.scrollTo`, no `href`) structurally guarantees the
click cannot change `location.pathname` or `location.hash`. The test does not carry an explicit
`location.pathname`/`location.hash` before/after assertion by that literal name. This is reported
as a documentation/assertion-breadth gap for a future test-writing pass to close, not a functional
gap: nothing observed indicates the behaviour EG23 describes is actually broken.

## Not verified

- **Everything marked CI-only in `evals.md`**, unchanged from the prior run: FL1, FL16, FL22; the
  CI-enforcement/live halves of GC52, GC56, GC63, GC74 (ubuntu-latest build), GC80, GC81, GC82,
  GC85, GC87; AD10's live half; NF14; FL7's CI/browser-console half. No push to `main` has happened
  in this fix wave.
- **Everything marked manual in `evals.md`**, unchanged from the prior run: GC19, GC22v, GC27v,
  GC30v, GC79v, GC77, GC86, GC84's dated post-deploy line, GC90, GC-CP, EG19, FL8, FL15, FL20,
  FL23, AD13.
- **EG23's assertion-breadth gap**, noted above: scored pass on the strength of the shared test and
  a source-level structural guarantee, but the test does not name
  `location.pathname`/`location.hash` explicitly. Recommend a future pass add that explicit
  assertion so the test matches evals.md's literal wording, though no functional gap exists today.
- **R77's and R86's before/after dependency evidence tables**: not reconstructed by this verifier;
  they are human-reviewed evidence tables from the build phase, reviewed at G4, not a pass/fail
  command.
- **This verifier ran the full automated test suite once, not multiple times**, so no flakiness
  claim is made either way; a single green run is what is recorded. The eval runner separately ran
  `npm test` once more (22 files, 174 tests, all passing), which agrees with this run and is not
  treated as a second attempt to "get to green."

## Failures

None. No defined check exited non-zero except the informational full-tree audit, which is not a
gate. No automatable eval case failed.

## What would turn this red again

Nothing found in this run. Any future change that reintroduces an unscoped `security_audit`
command, reintroduces a literal digit of the owner's phone number anywhere `git ls-files` reaches,
lets a mockup file reach `public/`, `dist/`, or an `src/` reference, or breaks Back to Top's
route-independence, would need to be caught by re-running this same set of checks and the
phone-redaction script.

All 174 automated tests pass across 22 files, `npm run build`, `npm run lint`, and the profile's
blocking `security_audit` all exit 0 on Node v22.12.0, the phone-redaction script finds 0 hits
across the tracked tree and `dist/`, the four mockups are confirmed at `docs/design/` and absent
from `public/`, `dist/`, and any `src/` reference, and every golden/edge/failure/adversarial case
scoreable before the first deploy passes, including the new and renamed cases (`GC91`, `GC92`,
`GC93`, `EG23`, `AD17`) this fix wave added or changed.

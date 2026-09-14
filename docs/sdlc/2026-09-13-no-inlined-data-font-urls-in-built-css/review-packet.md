# Review packet: no inlined data font URLs in built CSS

Change id: `2026-09-13-no-inlined-data-font-urls-in-built-css`
Gate: G4
Tier: 2
Branch: `wh/2026-09-13-no-inlined-data-font-urls-in-built-css` at `77a375d`
PR: not opened yet (conductor opens it after this gate)
Prepared: 2026-09-14 (this session) UTC

## 1. TL;DR

The live site logged 12 Content Security Policy errors because Vite inlined small JetBrains Mono
font files into the built CSS as `data:` URLs, which `font-src 'self'` blocks. This change makes
every font ship as a same-origin file instead, and adds two blocking CI checks (on the built CSS
and on the served CSS) so the regression cannot ship silently again. You are asked to approve
merging it: verification is green, no finding above low is open, and adoption scored 4/5.

## 2. Decisions requested

| # | Decision | Recommendation | Alternative | If you choose the alternative |
|---|----------|-----------------|--------------|-------------------------------|
| D1 | Two `CLAUDE.md` doc gaps (Commands section omits the new check command; "Ask first" list omits the two new sensitive scripts) found by the adoption reviewer | Take as a fast-follow, doc-only, not blocking | Fix both in this change now | Small `CLAUDE.md` edit outside R101's declared file list; delays this merge |
| D2 | Security reviewer's low finding: the R100 smoke step builds its fetch URL by string concatenation without validating the href starts with `/`, relying on the earlier R80 step's gate | Accept as open, low, residual risk (R80 already rejects any href not starting `/Portfolio/` in the same job) | Require R100 to self-validate the href before merge | New bash logic in a sensitive workflow file, requiring a fresh 14-case R104 rehearsal before this gate can reopen |
| D3 | Bug reviewer's low finding: `scripts/check-built-css-fonts.mjs` treats an empty-string directory argument as a valid path and scans the whole repo/cwd instead of defaulting to `dist/` or erroring; CI never passes an empty argument | Accept as open, low; not reachable through this repository's CI | Add input validation and a test case now | Reopens a sensitive script; new test, small delay |
| D4 | Owner's post-release acceptance (R103): after you push to `main` and the deploy run is green, run the R84 browser check and log a dated line in `docs/hosted-config.md` section 6. No agent can do this before merge | Proceed; this is the accepted, documented gap between G4 and true production acceptance | Add a headless browser to CI to check this automatically | New dependency and CI cost; rejected already at G1 Q5 |
| D5 | Bug reviewer's low finding: `evals.md`'s EG30 case description doesn't match the implementation's actual scope (the `data:font` count is file-wide, not restricted to `@font-face` blocks); no test can currently tell the two readings apart | Accept as a documentation wording gap, fast-follow | Correct `evals.md` now, as was done mid-verify for GC103 | Reopens an SDLC artifact mid-gate for a wording-only fix with no behavior at stake |

## 3. Evidence

Condensed from `verification.md` (status: green). Every row below is `confirmed` unless marked
otherwise; full detail and log paths are in [verification.md](./verification.md).

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `git diff --stat main...HEAD -- package-lock.json` | n/a | empty; no lockfile change, install skipped | confirmed |
| typecheck | profile `commands.typecheck` is `""` | n/a | no check defined | no check defined |
| lint | `npm run lint` | 0 | `verify-logs/lint.log` | confirmed |
| test | `npm test` (`--reporter=json`) | 0 | `verify-logs/test.log`: 208 passed, 25 files, 0 pending/todo/failed | confirmed |
| build | `npm run build` | 0 | `verify-logs/build.log`: `dist/assets/index-D4xY4LDD.css`, 59.40 kB | confirmed |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | `verify-logs/audit.log`: 0 vulnerabilities | confirmed |
| e2e | profile `commands.e2e` is `""` | n/a | no check defined | no check defined |
| screenshot | profile `commands.screenshot` is `""` | n/a | no check defined | no check defined |
| R93/R97 wiring (GC99) | `node scripts/check-built-css-fonts.mjs` against fresh `dist/` | 0 | `verify-logs/check-built-css-fonts.log`: 64 `@font-face` blocks, 128 font URLs, 0 `data:` font URLs | confirmed |
| R94 data-font count | `grep -oiE "url\(...data:font" dist/assets/*.css \| wc -l` | 0 | `0` | confirmed |
| R94 emitted font files | `ls dist/assets \| grep -c ...` (woff2/woff patterns) | 0 | 8 and 4, as expected | confirmed |
| R95 face/URL/file counts | `@font-face` count, font URL count, font file count | 0 | 64, 128, 128, matching pre-change 64/116/116 baseline delivery shift only | confirmed |
| R96 CSP/referrer/404 | CSP meta byte-identical; `cmp dist/index.html dist/404.html`; `vite.config.js` diff adds lines only | 0 | byte-identical; `cmp` exits 0 | confirmed |
| EG28 build determinism | `npm run build` twice | 0, 0 | identical CSS hash and counts both runs | confirmed |
| Script fixtures EG26, EG29, EG30, AD21 | `node scripts/check-built-css-fonts.mjs <fixture>` | 0, 0, 0, 1 | recursive scan, filename-coincidence, non-font `data:` outside a block, sibling-URL-not-masked all as expected | confirmed |
| FL35 inline `assetsInlineLimit: 4096` override | scratch build + check | build 0, check 1 | 12 `data:` font URLs flagged | confirmed |
| FL36 `base: '/Other/'` drift | scratch build + check | build 0, check 1 | 0 data, 128 outside `/Portfolio/assets/` prefix | confirmed |
| AD22 CSP-widen diff shape | `git diff --no-index` of two scratch `vite.config.js` copies | 1 (expected) | one `-`/one `+` line, proves a widened policy is a replace, not a pure add | confirmed |
| GC101/GC102 step order | `grep -n "name:" deploy.yml` | 0 | R97 step between `Build` and blocking audit; R100 step between R80 and R81 | confirmed |
| R99 diff shape | `git diff main -- deploy.yml \| grep` | 0 | only header line removed, no `uses:`/`continue-on-error` added | confirmed |
| R100 body forbids runner files | grep for `GITHUB_ENV`/etc. and `count_matches` on extracted body | 0 | `0` matches | confirmed |
| R100 body identity | `diff` of pre-fold extraction vs. re-extraction from folded head | 0 | byte-identical | confirmed |
| GC103/R101 scope (5 checks) | `git diff --name-only`/`git show --stat` on `64f91c1` and pathspec-excluded diff | 0 | exactly R101's 6 named paths plus 8 `docs/sdlc/` files; `64f91c1` touches exactly `.workhorse/profile.yml` and this change's `conductor-log.md`, one commit, never edited again | confirmed, re-run fresh this verify session after a two-line wording correction to `plan.md`/`evals.md` (see "Findings" below) |
| R104 rehearsal, 14 cases (P1 real, P2, F1-F12) | bash rehearsal harness against the committed R100 body | varies per case, all as specified | all 14 of 14 cases match | confirmed |

Eval summary: golden 11/11 automatable (1 manual, GC105, deferred to owner post-release), edge
9/9, failure 23/23, adversarial 4/4, non-functional 6/6 automatable (1 manual, NF24, deferred).
All categories meet their 100% target.

Not verified before merge (documented gaps, not failing checks): GC101's first CI run's summary
line; GC102's live `PASS R100` line; YAML validity on GitHub (no local YAML parser or actionlint
exists); GitHub's exact `bash -eo pipefail` flags; GC105 and NF24 (R103), the owner's post-release
browser check; the R104 harness's sha256 baseline against tamper (believed, not verified, on the
strength of matching 14/14 results across two independent runs, not a hash proof).

## 4. Findings

Merged from all four reviewers, sorted by severity. None is above low. Per this change's own
rule, every finding below is marked `open`, not blocking, since nothing is above medium.

| Severity | Reviewer | File | Finding | Resolution |
|----------|----------|------|---------|------------|
| Low | Security | `.github/workflows/deploy.yml` (R100 step) | The smoke step builds its fetch URL by string concatenation without validating the href starts with `/`. A crafted href like `@evil.example.com/...` could theoretically cause userinfo-based host confusion in the fetched URL. Mitigated today because the earlier R80 step in the same job already rejects any href not starting `/Portfolio/`; R100 itself does not self-defend | open |
| Low | Security | `scripts/check-built-css-fonts.mjs` (the font rule) | The `data:font` detection regex is scoped to font MIME types by design. This is documented and has 0 occurrences in the current build; not a real gap | open |
| Low | Bug | `scripts/check-built-css-fonts.mjs` | An empty-string directory argument is treated as a valid path, so the script scans the whole repo/cwd instead of defaulting to `dist/` or erroring. Real but narrow: CI never passes an empty argument | open |
| Low | Bug | `docs/sdlc/.../evals.md` (EG30) | EG30's case description doesn't match the implementation's actual scope: the `data:font` count is file-wide, not restricted to `@font-face` blocks, though the "outside `/Portfolio/assets/`" count is correctly block-scoped. An eval-wording gap with no discriminating test, not a code defect | open |
| Low | Adoption | `CLAUDE.md` (Commands section) | Does not mention `node scripts/check-built-css-fonts.mjs`, the new blocking CI check, deliberately given no npm script alias per ADR 0002 | open |
| Low | Adoption | `CLAUDE.md` (Protected: Ask first) | Does not list the two new sensitive scripts, `scripts/never-inline-fonts.mjs` and `scripts/check-built-css-fonts.mjs`, even though `.workhorse/profile.yml` itself was correctly updated (machine enforcement is correct; only the human-readable doc lags) | open |
| Info (nice-to-have, out of this change's scope) | Adoption | `docs/sdlc/codebase-map.md` | Stale about CI/scripts. Pre-existing before this change, not introduced by it | open |

Conformance: 12 of 12 requirements (R93-R104) traced to code and test; R103 correctly deferred as
a post-release owner action, not implemented in code. Drift: 0 missing coverage, 0 untested, 0
scope creep. The conformance reviewer independently re-ran and reconfirmed the `64f91c1`
three-check exclusion and the R101 scope diff.

Adoption score: 4/5. Blockers: none; both doc gaps above are non-blocking follow-ups.

## 5. Risk register

Carried from `plan.md`'s risk register, updated with what the reviewers raised at G4.

| Risk | Likelihood | Impact | Mitigation | Owner | Status |
|------|------------|--------|------------|-------|--------|
| R100 built its URL by concatenation without self-validating the href prefix (security finding) | Low | Host confusion in the fetched URL if the upstream R80 gate is ever weakened or removed | R80 gates every href to `/Portfolio/` earlier in the same job today; recommend R100 validate independently in a fast-follow | Site owner, next change | Open, accepted |
| R100 behaves differently on the Ubuntu CI runner's grep/sed/curl than in local Git Bash | Low | False PASS, or a red deploy after publication | POSIX ERE only; the 14-case R104 rehearsal; the first deploy's PASS line; documented partial rollback | Site owner, first deploy | Open, mitigated |
| The R104 harness or its extractor is unavailable in a later session (scratchpad is per-session) | Medium | The record run is delayed | T3 recorded a sha256 listing; the verifier can rebuild from the spec's Interfaces (d) | Verifier | Resolved this run: harness was available |
| oxlint cannot load in a fresh worktree (known npm optional-dependency bug) | Medium | Lint cannot be shown green locally | Never regenerate the lockfile; CI lint is a second, independent gate | Verifier, site owner | Resolved this run: lint exited 0 |
| A CSP violation that is not a font ships undetected | Medium | Console errors after release, invisible to CI | R84 browser check after every push (R103), owner-performed | Site owner | Open by design; accepted at G1 Q5 |
| No recorded sha256 baseline exists for the R104 harness from when it was first built | Low | Cannot prove the harness itself is untampered, only that its behavior matches across two independent runs | Documented limitation, not a failing check; hashes now recorded for future comparison | Verifier | Open, accepted |
| A sensitive file is edited by a shell redirection, bypassing the owner's approval prompt | Low | An edit the owner never saw | The protect-paths hook covers only Edit/Write/MultiEdit/NotebookEdit; diff-shape greps in R93, R96, R99 catch any extra line | Site owner | Resolved: diff-shape checks confirm no extra lines |

## 6. Diff tour

Ordered by risk: protected and sensitive paths first, then policy/CI enforcement, then business
logic, then tests, then docs and config.

1. **`.github/workflows/deploy.yml`** (sensitive, tier-2 floor path, the repository's only path to
   production). Adds one header source line, a blocking `Built CSS inlines no font (R97)` step
   between `Build` and the blocking audit, and a blocking `Smoke R100` step between the existing
   R80 and R81 smoke steps. First in the tour because it is the only file that can publish a
   regression to the live site, and any CI workflow edit is itself a tier-2 trigger.
2. **`.workhorse/profile.yml`**. Adds the two new scripts to `sensitive_paths` and
   `tier_floor_paths`. Committed separately as `64f91c1`, on the owner's explicit G2 instruction
   ("add both scripts to profile for me"), not by a task. Second because it is the machine
   enforcement of this change's own security posture, and its scope was independently
   re-confirmed by the conformance reviewer.
3. **`vite.config.js`** (sensitive, tier-2 floor path, holds the CSP meta tag). Adds one import
   line and a one-property `build: { assetsInlineLimit: neverInlineFonts }` key. Diff adds lines
   only; the CSP string was confirmed byte-identical before and after. Third because it is the
   file that could, if changed carelessly, weaken the site's security policy.
4. **`scripts/never-inline-fonts.mjs`** (new, sensitive since `64f91c1`). The actual fix: a
   dependency-free, ten-line function that tells Vite to never inline a font file. Business logic
   at the center of this change.
5. **`scripts/check-built-css-fonts.mjs`** (new, sensitive since `64f91c1`). The committed
   enforcement script both CI steps rely on (directly in the build job, restated in bash in the
   deploy job). Placed as the policy-check counterpart to the fix above.
6. **`src/neverInlineFonts.test.js`**, **`src/checkBuiltCssFonts.test.js`** (new). 17 tests
   covering both new scripts, run under the default jsdom environment with no pragma, never
   editing the shared `src/test/setup.js`.
7. **`docs/sdlc/.../adr/0001-...md`**, **`docs/sdlc/.../adr/0002-...md`**. Record why a font-only
   `assetsInlineLimit` function and a committed Node script were chosen over the alternatives
   considered.
8. **`docs/sdlc/2026-09-13-no-inlined-data-font-urls-in-built-css/*`** (intent, spec, plan, evals,
   approvals, conductor-log, verification, verify-logs). The SDLC record of this change, last in
   the tour because none of it ships to production.

## 7. Checklist

- [x] Intent still matches what the client asked for (confirmed against `intent.md` Outcomes 1-5;
      Outcome 6/R103 is the owner's post-release action, tracked, not yet performed)
- [x] Every requirement has a test (R93-R104, 12 of 12 traced; R103 is owner-performed and cannot
      have an automated test)
- [x] No finding above medium remains unresolved (all 7 findings are low or info)
- [x] Rollback is documented (`plan.md` "Rollback": local revert, production revert via the owner,
      partial rollbacks for R97 and R100 failing wrongly, and a G5 revert rehearsal)
- [ ] Client engineer could maintain this from the docs alone (mostly yes; the two `CLAUDE.md` doc
      gaps above are the reason this is unchecked, not a code gap)

### Pre-ship security checklist (tier 2+)

Quoted verbatim from `plan.md` section 7, with the security reviewer's independent confirmation
noted per item.

- [x] **Every new/changed `for update` policy:** listed all columns, decided each one, added a
      pinning trigger where the policy is not sufficient.
      Waived: no database. Security reviewer: n/a, confirmed no database exists in this project.
- [x] **Every new/changed `for insert` policy:** does the corresponding UPDATE path re-check the
      same invariants?
      Waived: no database. Security reviewer: n/a, confirmed.
- [x] **Every new function:** explicit `grant`/`revoke` line in the same migration; `SECURITY
      DEFINER` justified; `set search_path` set; anchored to `auth.uid()` unless stated otherwise.
      Waived: no SQL functions; `neverInlineFonts` is build-time JavaScript. Security reviewer:
      n/a, confirmed.
- [x] **Every `CREATE OR REPLACE`:** diffed line by line against the previous body; side effects
      confirmed present.
      Waived: no SQL. By analogy, T1 and T3 pass the added-lines-only diff checks (R93, R96, R99).
      Security reviewer: confirmed the added-lines-only diffs empirically, R99 and R96 checks both
      exit 0.
- [x] **Every new policy ships two tests in the same commit:** one admitting, one denying.
      Waived: no RLS. By analogy: R98 cases 1 and 9 (admit) against the rest (deny), R104 P1/P2
      against F1-F12, and T3's harness self-test. Security reviewer: confirmed both directions are
      tested.
- [x] **Deny-side assertions distinguish failure modes.**
      Waived: no RLS. By analogy: T2's tests assert exit code and exact text, so exit 1 (violation)
      and exit 2 (nothing to check) are distinguished; R104 checks the exact line for each cause.
      Security reviewer: confirmed.
- [x] **New storage bucket:** private unless there is a written reason it is public.
      Waived: no storage. Security reviewer: n/a, confirmed.
- [x] **New table holding user free text:** length constraint and rate limit if insertable in a
      loop.
      Waived: no tables. Security reviewer: n/a, confirmed.
- [x] **New admin capability:** writes to an append-only log.
      Waived: no admin surface. Security reviewer: n/a, confirmed.
- [x] **New secret or env var:** covered by `.gitignore` as a pattern; confirmed with
      `git ls-files`.
      Waived: none added. R100 reads `ROOT_URL`, set upstream by R63, and writes no runner file.
      Security reviewer: confirmed R100 writes only under `smoke/r100/` and none of the five
      runner files.
- [x] **New third-party import in a runtime path:** pinned to an exact version.
      Waived: no new import; both scripts use `node:` built-ins or nothing, and no `uses:` line was
      added to `deploy.yml`. Security reviewer: confirmed empirically, 0 command-injection possible
      via malicious CSS/HTML fixtures; CSP confirmed byte-identical independently.

Security reviewer's own tally: 6 items pass, 9 items not applicable (no database, auth, storage or
admin surface in this project), 0 fail.

## Recommendation

**Recommend approve.** Verification is green (all gates, all 55 eval cases at their targets, the
14-case R104 rehearsal), no finding above low is open, and the adoption score is 4/5. The 7 open
low-severity items (D1-D5 above) are candidates for a fast-follow, at your discretion.

```
/workhorse:approve G4
/workhorse:approve G4 --reject "notes"
```

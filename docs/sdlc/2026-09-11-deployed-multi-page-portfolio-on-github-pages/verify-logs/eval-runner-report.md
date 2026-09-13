# Eval runner report — re-verification after second G4 rejection's short fix pass

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`. This run re-verifies the
tree at commit `b91d04f`, the state after five commits landed on top of the last green verify at
commit `460405e`: `4373e35` (spec.md, intent.md, ADR 0010 amendments), `a0221e1` (evals.md: GC89,
GC41 rewritten; new GC94, FL24, AD18), `1731db5` (F4: `scripts/check-phone-redaction.mjs` country
-code prefix handling and undecodable-file exit 2, plus `src/checkPhoneRedaction.test.js`, 17
tests), `34a0a8c` (F5: doc corrections in `docs/hosted-config.md`, `docs/sdlc/constraints.md`,
`docs/sdlc/codebase-map.md`, `.workhorse/profile.yml`), `b91d04f` (conductor log only).

**Environment.** `node --version` printed `v22.12.0` (**confirmed**) with
`/c/Users/alqai/AppData/Roaming/nvm/v22.12.0` first on PATH, before any Node/npm command this
session.

**Scope discipline.** No tracked file was modified by this run except this report and files under
`verify-logs/` (gitignored). `git status --short` before this session's commands showed only a
pre-existing modification to `conductor-log.md` and a pre-existing untracked
`verify-logs/security_audit_full_tree.json`, neither created or touched by this run; the same two
items are the only entries after this run (**confirmed**, see below). No scratch fixture files
were needed this session: every case in the step-1 list ran directly against the real tree, and
AD18 (the one case that would need a scratch fixture with a digit of the phone number) was not
run, per its own manual/no-digit-in-log instruction.

## 1. Targeted cases, run in full this session

### GC89 (R89), self-test and source-tree scan — CONFIRMED PASS

- `node scripts/check-phone-redaction.mjs --self-test` → exit 0. Output:
  `Self-test: 17 of 17 form renderings hit, 0 of 9 near-misses hit.` — matches the amended
  expected line exactly. Log: `verify-logs/phone-redaction-selftest.log`.
- `node scripts/check-phone-redaction.mjs` (source-tree scan) → exit 0. Output:
  `Scanned 101 files (5 skipped as binary, 0 missing from disk, 0 undecodable), 0 hits.` — more
  than 0 scanned, `5 skipped as binary`, `0 missing from disk`, `0 undecodable`, `0 hits`, all
  matching the amended expected result. Log: `verify-logs/phone-redaction-scan.log`.

**GC89 PASS.**

### GC41 (R41), post-build `dist` scan — CONFIRMED PASS

- `npm run build` → exit 0 (1924 modules transformed, built in 3.84s). Log: `verify-logs/build.log`.
- `node scripts/check-phone-redaction.mjs dist` → exit 0. Output:
  `Scanned 108 files (121 skipped as binary, 0 missing from disk, 0 undecodable), 0 hits.` Log:
  `verify-logs/phone-redaction-dist.log`.
- Independently counted files under `dist/` with extension `.jpg`, `.png`, `.woff` or `.woff2`:
  **116** (`find dist -type f \( -iname '*.jpg' -o -iname '*.png' -o -iname '*.woff' -o -iname
  '*.woff2' \) | wc -l`). `5 + 116 = 121`, matching the reported binary-skip count exactly, so the
  binary count equals "5 plus however many files under `dist/` carry" one of those four
  extensions, as the amended row requires. `0 undecodable`, `0 missing from disk`, `0 hits` all
  match.
- `grep -rn "personal.phone" src/` → 0 matches; `grep -rn "Phone" src/` → 0 matches (also verified
  as part of the `src/data/portfolioData.test.js` pass, "publishes no phone number", in the full
  suite run below).

**GC41 PASS.**

### GC94 (R89, M8), the 17-test in-process unit suite — CONFIRMED PASS

`npm test -- src/checkPhoneRedaction.test.js` → exit 0, `Test Files 1 passed (1)`,
`Tests 17 passed (17)`, 0 skipped, 0 failed. Log: `verify-logs/checkPhoneRedaction-unit.log`. The
same 17 tests also ran, and passed, inside the plain `npm test` step (see the full-suite run
below), confirming they run through the existing CI-enforced command (R52, R56), not only when
invoked directly.

**GC94 PASS.**

### FL24 (R89), undecodable-file failure case — CONFIRMED PASS

Unit test 16 in `src/checkPhoneRedaction.test.js`, `'fails with exit 2 and names a file it cannot
decode, without printing its content'` (line 126), is the case's "Implemented as" target
(**confirmed** by reading the test source, lines 126-142). It writes a fixture with a leading
`0x00` byte and asserts:
- `exitCode` equals `EXIT_CANNOT_RUN`, which `scripts/check-phone-redaction.mjs` line 31 defines
  as `2` (**confirmed** by reading the script).
- Exactly one report line names the fixture and contains "could not be decoded".
- The last report line contains "1 undecodable".
- No report line contains the fixture's own text or any near-miss form.

This test passed as part of both the full-suite run and the standalone
`npm test -- src/checkPhoneRedaction.test.js` run above (17 of 17 passed, this test included).
The case's own optional live-fixture half ("may also be run live on the dev host... against a
scratch fixture placed outside the tracked tree") was not exercised separately this session; the
unit test is the case's primary, required implementation and it passed.

**FL24 PASS** (unit-test half; live-fixture half not run, optional per the case's own wording).

### AD18 (R89), optional adversarial red-team case — NOT RUN, manual by design

Per the dispatcher's explicit instruction, this case was **not automated or executed**. It is a
red-team case that requires deriving the owner's real phone number from git history in a scratch
clone and writing it (in two disguised forms) into untracked scratch fixtures, then confirming the
script rejects them. The case's own text states it is written `manual` specifically because no way
was found to make it CI-automatable "without risking a digit landing in a captured log", and it
instructs whoever runs it to "never paste the fixture contents or the tool's output into any
artifact, ticket, or chat." evals.md's own Targets section (section 1) states AD18 "is not counted
against the 100% bar" and is scored "documented" when not run, the same way AD13 is.

**AD18: not run. Reason: manual, optional, no-digit-in-any-log requirement (evals.md section 1 and
the AD18 row itself). Scored "documented", not pass/fail, per evals.md's own rule.**

### GC93 (R49, renamed from GC91) — CONFIRMED PASS

- `grep -n '"tailwindcss": "4.3.3"'` on `package.json` → matched, line 34, inside `devDependencies`.
- `grep -n '"@tailwindcss/vite": "4.3.3"'` → matched, line 25, inside `devDependencies`.
- `node -e` membership check: neither key present under `dependencies`.
- `npm audit --omit=dev --audit-level=high` → exit 0, "found 0 vulnerabilities". Log:
  `verify-logs/security_audit.log`.

**GC93 PASS.**

### R89 / M8 traceability rows — CONFIRMED as amended

Read the coverage matrix (section 9) directly:
- R89 row: `| R89 | GC89, GC94 | - | FL24 | AD18 (optional) |` (line 972) — golden, failure and
  optional-adversarial columns all match the amendment's stated additions.
- M8 row: `| M8 | NF8 (GC41, GC82, GC89, GC94) |` (line 1000) — GC94 present alongside the
  pre-existing GC41, GC82, GC89.

Both rows match exactly what the 2026-09-13 second-rejection amendment states it changed.

### Full `npm test` run (covers every case whose command is `npm test`, GC50/GC51/GC52/GC54/GC94/NF4/GC92)

`npm test` → exit 0. **23 test files, 191 tests, all passed, 0 failed/skipped/todo.** Log:
`verify-logs/evals.log`. This is exactly the "191 tests believed" figure evals.md's amendment
projected (174 at `460405e` plus the 17 new `checkPhoneRedaction.test.js` tests), now **confirmed
by an actual run**, not merely projected.

Individually re-checked from this same run:
- `src/checkPhoneRedaction.test.js`: 17 tests, all passed (GC94).
- `src/publicDirectory.test.js`: 4 tests, all passed (GC92's test half).
- `src/components/ContactFooter.test.jsx`: 13 tests, all passed (includes GC91/EG23's Back to Top
  coverage).
- GC50: `vite.config.js` test block keys (`environment: 'jsdom'`, `globals: true`, `setupFiles`,
  `css: false`, `restoreMocks: true`) all present by grep; `npm test` and `npm run build` both
  exit 0.
- GC51: `package.json` scripts are exactly `"test": "vitest run"` and
  `"test:watch": "vitest"`; `npm test` exits 0.
- GC52: local `npm test` reports 191 passed, 0 pending/todo/failed, comfortably above the `>= 12`
  floor R52 sets.
- GC54: `src/test/setup.js` greps for `jest-dom/vitest`, `matchMedia`, `IntersectionObserver`,
  `getContext` all present (counts 1, 2, 2, 1); 0 "Not implemented" lines in the full test log.
- GC92 (remaining post-build/doc half): `find dist -name 'mockup-*'` → 0; `git ls-files
  docs/design` lists all 4 mockup files; `git ls-files public | grep -c mockup` → 0;
  `docs/sdlc/codebase-map.md` and ADR 0008 both grep 0 for `public/mockup-`; `docs/design-brief.md`
  has 4 `mockup-` mentions and 4 `docs/design/mockup-` mentions (equal, as required).

## 2. Full sweep: carried vs re-run

`git diff --stat 460405e..HEAD` shows exactly 15 files changed:
`.workhorse/profile.yml`, `docs/hosted-config.md`, one new ADR, `approvals.md`,
`conductor-log.md`, `evals.md`, `intent.md`, `review-packet.md`, `spec.md`, `verification.md`,
`verify-logs/eval-runner-report.md`, `docs/sdlc/codebase-map.md`, `docs/sdlc/constraints.md`,
`scripts/check-phone-redaction.mjs`, `src/checkPhoneRedaction.test.js`. No other file changed:
no `.github/workflows/**` file, no other `src/**` file, no `package.json`, no `package-lock.json`,
no `vite.config.js`, no `index.html`. This is confirmed by the diff `--stat` output itself, not
inferred.

**Re-run this session** (already covered above): GC89, GC41, GC94, FL24, GC93, all `npm test`
-invoking cases (GC50-GC54, GC92, NF4), and GC92's post-build/doc half.

**Carried, not re-run, inputs unchanged since 460405e (confirmed via `git diff --stat` showing no
change to any file these cases read), and additionally spot-re-confirmed this session where cheap
to do so:**

- GC11 (asset paths): re-confirmed this session post-build. `grep -c '"/assets/'` on
  `dist/index.html` = 0; `grep -c 'src="/Portfolio/'` = 1. Matches prior run.
- GC12/FL5/FL21 (404 parity): re-confirmed this session. `sha256sum dist/index.html dist/404.html`
  → identical digest (`a0266f6d...`). Matches prior run.
- GC88 (referrer meta): re-confirmed this session. 1 in `dist/index.html`, 1 in `dist/404.html`, 0
  in source `index.html`. Matches prior run.
- `npm run lint`: re-confirmed this session, exit 0. Log: `verify-logs/lint.log`.
- GC49 (nine-package pin check), GC59/AD8 (SHA pinning), GC64/AD9 (no secrets), GC60/AD7 (no
  write-all), GC61/FL19 (concurrency), GC68/FL18 (Dependabot), GC70/FL2 (rolldown removed), AD6
  (no `dangerouslySetInnerHTML`), GC72 (`generate_viewer.cjs` absent), GC73 (`.gitignore`
  `.env*`), EG18 (trigger scoping), EG20 (`.env*` ignore pattern), GC55-GC58, GC62, GC63,
  GC80-GC83, GC85, GC87, AD11, AD12, AD14, AD15, AD16: **carried, not re-run**. These read
  `.github/workflows/deploy.yml`, `package.json`, `.gitignore`, or pure logic files (`src/**`
  other than the two files that changed), none of which changed since `460405e`.
- GC91/EG23 (R91, Back to Top) and AD17 (R92, mockup guard): **carried, not re-run** as
  standalone red-team fixture exercises, since `src/components/ContactFooter.jsx`,
  `src/components/ContactFooter.test.jsx`, `src/publicDirectory.test.js`, `public/`, and
  `docs/design/` are all unchanged since `460405e`. The relevant test files themselves did
  re-run and re-pass as part of the full `npm test` run above (13 ContactFooter tests, 4
  publicDirectory tests, all passed), which re-confirms the non-fixture half of both cases.
- GC84, GC86, GC90, GC-CP, EG19, AD13, AD10, FL1, FL7, FL8, FL15, FL16, FL20, FL22, FL23: manual
  or CI-only by the case's own design, unchanged in nature since `460405e`. `docs/hosted-config.md`
  did change (section 7, the phone-number-in-git-history note), but GC84 and GC87 read sections 6
  and 5 respectively, both untouched by that diff (**confirmed** by listing the file's headings
  and comparing against the diff hunk locations). `docs/sdlc/codebase-map.md` and
  `docs/sdlc/constraints.md` changes are likewise outside the lines any automated grep-based case
  targets (**confirmed**: GC44's pattern is hard-coded in evals.md itself, not read from
  constraints.md at runtime; GC92's codebase-map.md/ADR-0008 grep targets a different line than
  the one that changed).

## 3. Category summary

Evals.md's own amendment states category totals as: 99 golden, 23 edge (unchanged), 24 failure, 18
adversarial (17 scored + AD18 optional/not counted). This report's own case-by-case enumeration
(same method the prior report at `460405e` used) counts 94 golden IDs (93 plus `GC94`), 23 edge, 24
failure (23 plus `FL24`), 18 adversarial (17 plus `AD18`). The golden totals (94 here vs. 99 in
evals.md's own arithmetic) do not reconcile; this discrepancy already existed in the prior report
(93 vs. evals.md's stated 98) and was not investigated then either. **Believed, not reconciled**:
likely evals.md's section 9 total counts some sub-rows (dataset rows, `v`-suffixed variants) this
ID-level enumeration does not separately count. Flagging rather than guessing at a fix.

| Category | Cases (this report's ID count) | Passed / scored | Target | Met |
|----------|-------|------------------|--------|-----|
| Golden | 94 (GC1-GC90 numbered IDs plus `v`-suffixed pairs, GC91, GC92, GC93, GC94, GC-CP) | 84 of 84 automatable cases confirmed passing, including all five newly re-run this session (GC41, GC89, GC93, GC94, plus GC92's remaining half). 10 permanently manual, not counted: GC19, GC22v, GC27v, GC30v, GC77, GC79v, GC84, GC86, GC90, GC-CP | 100% | **Yes**, for every automatable case |
| Edge | 23 (EG1-EG23) | 22 of 23 confirmed passing (unchanged from `460405e`, all inputs unchanged), including EG23 (carried). 1 not automatable: EG19 (no date-math generator exists to unit test; unchanged) | 100% | **No**, for the same pre-existing reason as the prior run: EG19's target code path does not exist by design. Not a new gap |
| Failure | 24 (FL1-FL24) | 16 automatable and passed (FL2-FL6, FL9-FL14, FL17-FL19, FL21, and newly re-run **FL24**), unchanged/re-confirmed for the first 15, freshly confirmed for FL24. 8 not automatable pre-deploy (FL1, FL7 mixed, FL8, FL15, FL16, FL20, FL22, FL23), unchanged | 100% correct handling | **Yes**, for everything scoreable pre-deploy |
| Adversarial | 18 (AD1-AD18) | 15 fully automated and passed (AD1-AD9, AD11, AD12, AD14-AD17), unchanged, inputs unconnected to this window's commits. AD10 split: Windows-structural half passed, CI-only live half outstanding, unchanged. AD13 documented (accepted residual risk), unchanged. **AD18 not run this session (optional, manual, no-digit-in-log requirement), scored "documented," not counted toward the 100% bar** | 100% except AD13; AD18 scored separately | **Yes**, for everything scoreable pre-deploy; AD18 correctly excluded from the bar per evals.md's own targets section |

## 4. Failing or not-verified cases

**No case failed.** Every case run this session (GC41, GC89, GC93, GC94, FL24, the full `npm test`
suite, `npm run build`, `npm run lint`, `npm audit --omit=dev --audit-level=high`, GC11, GC12,
GC88, GC92) produced exactly the expected result, with exit codes and output lines quoted above.

**Not run, by design (not a failure):**

- **AD18** (R89): optional, manual, red-team case requiring a digit of the owner's phone number in
  a scratch fixture. Not automated per the dispatcher's explicit instruction and evals.md's own
  rule that it is scored "documented" when not run, not counted toward the adversarial 100% bar.

**Not fully automatable, pre-existing, unchanged in nature since `460405e`:**

- **EG19** (R67): no date-math generator exists in the codebase to unit test.
- **AD10** (R56/R57): Windows-structural half passed; live-rejection half requires a real
  `ubuntu-latest` run against a genuinely vulnerable package, CI-only.
- **AD13** (R65): documented accepted residual risk (clickjacking via meta-only CSP).
- **FL1, FL16, FL22**: CI-only, cannot be manufactured safely pre-deploy.
- **FL7**: mixed; Windows-preventive half passed, CI-only and browser-console halves outstanding.
- **FL8, FL15, FL20, FL23**: manual by design, matching the spec's own stated detection gaps.

`git status --short` after this run:

```
 M docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/conductor-log.md
?? docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/verify-logs/security_audit_full_tree.json
```

Both entries are pre-existing (present before this session's first command ran) and untouched by
this run; this run added only new files under `verify-logs/` (gitignored) and this report.

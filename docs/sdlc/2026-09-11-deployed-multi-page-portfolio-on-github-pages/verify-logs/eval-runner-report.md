# Eval runner report — fix-wave re-verification (commit 460405e)

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`. This is a fresh eval run
against the post-fix-wave working tree, focused on cases added/changed by the 2026-09-13 amendment
(GC41, GC89, NF8 rewritten to script-based; GC91/GC92/EG23/AD17 added; old GC91 renamed GC93), plus
a full sweep of every other automatable case to confirm no regression since the prior run recorded
in `verify-logs/eval-runner-results.md` (commit 8ea98a7, now stale, kept as-is, not edited).

Node v22.12.0 confirmed first on PATH (`node --version` -> `v22.12.0`) before any Node/npm command
in this session; trusted for the remainder without re-checking every call. No tracked file in
`C:\Users\alqai\Portfolio` was modified by this run except this report and `verify-logs/*.log`;
`git status --short` confirmed clean before and after. All AD17 fixtures were built in a copy of
`public/`, `docs/design/`, `src/`, `vite.config.js`, `index.html` under the session scratchpad
directory, never in the tracked repo, and were deleted after use.

## Targeted cases (this session's focus)

### GC93 (R49, renamed from GC91), CONFIRMED PASS

Ran the exact checks the row specifies against the real `package.json`:
- `grep -n "\"tailwindcss\": \"4.3.3\""` -> matched, line 34, inside `devDependencies`.
- `grep -n "\"@tailwindcss/vite\": \"4.3.3\""` -> matched, line 25, inside `devDependencies`.
- Neither key present under `dependencies` (`node -e` membership check: `inDependencies: false`).
- `npm audit --omit=dev --audit-level=high` -> exit 0, "found 0 vulnerabilities".

All expected results met exactly. **GC93 PASS.**

### EG23 (R91), CONFIRMED PASS with one noted gap in assertion breadth

`src/components/ContactFooter.test.jsx`'s `it.each(EVERY_KIND_OF_PAGE)` test (the same test that
implements GC91's five-route case) runs at all 5 routes including `/`, and jsdom's default
`window.scrollY` is `0` for every test (nothing in `src/test/setup.js` or any other test in the
file sets it otherwise), so the "already at scrollY 0" precondition holds implicitly for every
route case, not just as a special one-off.

Read `src/components/ContactFooter.jsx` lines 95 and 114-116: the Back to Top control is
`<button type="button" onClick={scrollToTopOfPage}>` with no `href`, and `scrollToTopOfPage` calls
only `window.scrollTo(...)`, nothing that touches history, the URL, or the hash. This is a
structural guarantee that the click cannot change `location.pathname` or `location.hash`, which is
what EG23's Then clause asserts.

Gap, noted for the record: the test itself does not contain an explicit assertion reading
`location.pathname`/`location.hash` before and after the click (it asserts the level-1 heading
text is unchanged instead, the same proxy this suite uses elsewhere for "route unchanged", plus the
exact `scrollTo` call and no back-to-top link). Given the button's structure above, this proxy is
sound, but a reviewer wanting EG23's exact literal assertion would not find it by name. Scored
**PASS** on the strength of the shared test plus the source-level structural guarantee, with the
gap flagged rather than silently accepted.

### AD17 (R92), CONFIRMED PASS

`src/publicDirectory.test.js`'s logic is pure `fs`/`path`, so it was red-teamed the same way
AD14/AD15 red-team their `node -e` scripts: copied `public/`, `docs/design/`, `src/`,
`vite.config.js`, `index.html` into a scratchpad-only fixture tree (never the tracked repo) and ran
the test's own assertion logic against it, verbatim, for both fixtures the case names:

- **public/ fixture**: added `public/mockup-reintroduced.jpg`. The "no file under public/ named
  mockup-*" check found `['public/mockup-reintroduced.jpg']` — assertion would fail as expected.
- **src/ fixture**: appended a `mockup-fixture-test` string to a copy of `src/App.jsx`. The "no
  file under src/ contains the string mockup-" check found `['src/App.jsx']` — assertion would
  fail as expected.

Both fixtures correctly caused the guard to fail, confirming the detection instrument catches
this exact regression class, not merely that today's clean tree passes. Fixture tree deleted after
use; `git status --short` on the tracked repo confirmed clean throughout. **AD17 PASS.**

## Full sweep: no regression found

Re-ran, on the current tree, every structural/command-based case already confirmed by the parent
verifier or the prior session, to confirm nothing regressed since commit 8ea98a7:

- `npm test` (Vitest): **22 test files, 174 tests, all passed, 0 failed/skipped/todo**, exit 0.
  (Prior run: 21 files/164 tests; the +1 file is `src/publicDirectory.test.js` (GC92), the +10
  tests are GC91's 6 new ContactFooter tests plus GC92's 4 new tests.) Log:
  `verify-logs/evals.log`.
- `npm run lint`: exit 0. Log: `verify-logs/lint.log`.
- `npm run build`: exit 0. Log: `verify-logs/build.log`.
- `npm audit --omit=dev --audit-level=high`: exit 0, 0 vulnerabilities. Log:
  `verify-logs/security_audit.log`.
- GC41/GC89/NF8 phone-redaction script: self-test exit 0 ("9 of 9 form renderings hit, 0 of 6
  near-misses hit"); source-tree scan exit 0 ("Scanned 99 files (5 skipped), 0 hits"); post-build
  `dist` scan exit 0 ("Scanned 106 files (121 skipped), 0 hits"). Matches the parent verifier's
  independently-confirmed result exactly (99 files scanned, 0 hits).
- GC11 asset paths: `grep -c '"/assets/'` on `dist/index.html` = 0; `grep -c 'src="/Portfolio/'`
  = 1 (>0, correct).
- GC12/FL5/FL21 404 parity: `sha256sum dist/index.html dist/404.html` — identical digest.
- GC92 mockup guard, post-build: `find dist -name 'mockup-*'` = 0; `git ls-files docs/design`
  lists all 4 mockup files; `git ls-files public | grep -c mockup` = 0. Matches the parent
  verifier's independently-confirmed result.
- GC49 pin check: 9 of 9 named packages exact-pinned, 0 range-prefixed matches.
- GC59/AD8 (SHA pinning): `total=5 pinned=5`.
- GC64/AD9 (no secrets): 0.
- GC60/AD7 (no write-all): 0.
- GC61/FL19 (concurrency): `group: pages` = 1, `cancel-in-progress: false` = 1.
- GC68/FL18 (Dependabot): npm ecosystem = 1, github-actions ecosystem = 1,
  `open-pull-requests-limit: 5` = 2 (once per ecosystem).
- GC70/FL2 (rolldown removed): 0.
- AD6 (no `dangerouslySetInnerHTML`): 0 across `src/`.
- GC72 (`generate_viewer.cjs` absent): confirmed absent.
- GC73 (`.gitignore` `.env*`): 1 match.
- EG18 (trigger scoping): `on: push: branches: [main]`, no other trigger key; second grep = 0.
- EG20 (`.env*` ignore pattern): all three of `.env`, `.env.local`, `.env.production` reported
  ignored by `git check-ignore --no-index`, exit 0.
- GC88 (referrer meta): 1 in `dist/index.html`, 1 in `dist/404.html`, 0 in source `index.html`.

No case in this sweep produced a result differing from the prior confirmed run. 0 regressions
found.

## Category summary

| Category | Cases | Passed / scored | Target | Met |
|----------|-------|------------------|--------|-----|
| Golden | 93 (GC1-GC90 numbered IDs plus `v`-suffixed pairs, `GC91`, `GC92`, `GC93`, `GC-CP`) | 83 of 83 automatable cases confirmed passing this session or matching the parent-verifier-confirmed/prior-session-confirmed baseline with no regression, including the newly targeted `GC93` (renamed), `GC91`, `GC92`. 10 permanently manual, not counted: GC19, GC22v, GC27v, GC30v, GC77, GC79v, GC84, GC86, GC90, GC-CP | 100% | **Yes**, for every automatable case |
| Edge | 23 (EG1-EG23) | 22 of 23 confirmed passing (EG1-EG18, EG20-EG23), including newly targeted `EG23` (pass, with the assertion-breadth gap noted above, not scored as a failure). 1 not automatable: EG19 (no date-math generator exists to unit test; unchanged since the prior run) | 100% | **No**, strictly, for the same pre-existing reason as the prior run: EG19 cannot be executed because the code path it targets does not exist by design. Not a new gap from this fix wave |
| Failure | 23 (FL1-FL23) | 15 automatable and passed (FL2-FL6, FL9-FL14, FL17-FL19, FL21), unchanged from the prior confirmed run; re-confirmed via the same evidence this session (full test suite pass, structural workflow checks). 8 not automatable pre-deploy (FL1, FL7 mixed, FL8, FL15, FL16, FL20, FL22, FL23), unchanged | 100% correct handling | **Yes**, for everything scoreable pre-deploy |
| Adversarial | 17 (AD1-AD17) | 15 fully automated and passed (AD1-AD9, AD11, AD12, AD14, AD15, AD16, and newly targeted **AD17**, confirmed this session). AD10 split: Windows-structural half passed, CI-only live half outstanding, unchanged. AD13 documented (accepted residual risk, not scored pass/fail), unchanged | 100% except AD13 | **Yes**, for everything scoreable pre-deploy |

## Failing or not-verified cases

None found failing. Not-fully-automatable (pre-existing, not new to this fix wave, all already
flagged in the prior run and unchanged in nature):

- **EG19** (R67): no date-math generator exists in the codebase to unit test; `Expires` in
  `public/.well-known/security.txt` is a static, hand-maintained string. Manual by the case's own
  stated fallback.
- **AD10** (R56/R57): Windows-structural half passed (blocking audit step present and ordered
  correctly); the live-rejection half requires an actual `ubuntu-latest` run against a real
  vulnerable package, CI-only.
- **AD13** (R65): documented accepted residual risk (clickjacking via meta-only CSP), scored
  "documented" per evals.md's own rule, not pass/fail.
- **FL1, FL16, FL22**: CI-only, cannot be manufactured safely pre-deploy.
- **FL7**: mixed — Windows-preventive half passed, CI-only and browser-console halves outstanding.
- **FL8, FL15, FL20, FL23**: manual by design, matching the spec's own stated detection gaps.

One case scored PASS with a noted gap, not a failure:

- **EG23** (R91): the shared `ContactFooter.test.jsx` `it.each` test satisfies EG23's behavioral
  requirement (scrollTo called once with exact args at implicit scrollY=0, route/heading unchanged)
  and the button's implementation structurally guarantees no URL/hash change is possible, but the
  test does not carry an explicit `location.pathname`/`location.hash` before/after assertion by
  that name. Recommend the fixer/next test-writing pass add that explicit assertion if evals.md's
  literal wording is to be matched test-for-test, though no functional gap exists.

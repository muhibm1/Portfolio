# Adoption review: fix-phone-redaction-scanner

Reviewed as the site owner, six months from now, with a bug to fix and nobody to ask.

## Walkthrough

1. **Find it.** `docs/sdlc/constraints.md:112` names the R89 script by path
   (`scripts/check-phone-redaction.mjs`). `README.md` is the unmodified Vite template and says
   nothing about any check script (confirmed, pre-existing, not touched by this diff).
   `docs/sdlc/codebase-map.md` has zero mentions of `scripts/` at all (confirmed by grep), so
   none of the four check scripts, old or new, are findable from the map. This is a pre-existing
   gap the diff does not create, but the diff doubles the file count for this one check (one file
   to two, plus a third new script), which is more surface the map still says nothing about.
2. **Understand it.** Both script headers state responsibility, exit codes, and point at the ADR
   for each non-obvious call (confirmed by reading `scripts/check-phone-redaction.mjs:1-19` and
   `scripts/phone-redaction-scan.mjs:1-16`). `scripts/check-test-floor.mjs:1-17` explains the pin,
   why the whole-suite floor alone is insufficient, and that adding a test needs no edit — but
   never states the remedy when the pin legitimately needs to move down (a deliberate test
   consolidation, as D3 itself performed once). The runtime failure message
   (`check-test-floor.mjs:96-99`, confirmed by running it) reports "need at least 44 passed ...
   got 43 passed" with no pointer to `PINNED_REDACTION_PASSED_COUNT` in the file that must change.
3. **Change it safely.** Test file headers state their scope and cross-reference the ADR and the
   sibling test pattern they copy (confirmed, `src/checkPhoneRedaction.test.js:1-5`,
   `src/checkTestFloor.test.js:1-6`). The floor script test hardcodes the pin as a duplicate
   constant (`src/checkTestFloor.test.js:18`) rather than importing it, so a future pin change in
   the script needs a matching manual edit in the test; nothing forces the two to agree except a
   test failure, which is workable but not a currently documented step.
4. **Run it.** Ran directly this session: `node scripts/check-phone-redaction.mjs --self-test`
   printed `Self-test: 17 of 17 form renderings hit, 0 of 9 near-misses hit.`, exit 0 (confirmed).
   `node scripts/check-test-floor.mjs` with no argument printed
   `::error::Test floors could not run (R52, R11): (no report path given) is missing or
   unreadable ...`, exit 2 (confirmed) — matches its documented usage line. No undocumented step
   was needed for either.
5. **Operate it.** `.github/workflows/deploy.yml` diff is exactly the one step the spec promised:
   `Test-count floors (R52, R11)` calling `node scripts/check-test-floor.mjs vitest-results.json`
   (confirmed by diff). D7 (list the three script files in `.workhorse/profile.yml`
   `sensitive_paths` and `tier_floor_paths: 2`, as the sibling checks already are) is recorded as
   an owner action and is not yet done: `.workhorse/profile.yml:159` lists
   `never-inline-fonts.mjs`, `check-built-css-fonts.mjs`, `check-npmrc.mjs` but not
   `check-phone-redaction.mjs`, `phone-redaction-scan.mjs`, or `check-test-floor.mjs` (confirmed
   by grep). This is documented in `verification.md` as a known gap, not silently dropped.
6. **Why.** Four ADRs cover the four non-obvious decisions (split entry/library, layered decode,
   self-test directories, the floor script) and both scripts' headers point to the matching ADR
   number. No ADR is missing for anything in the diff.

## Findings

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| medium | scripts/check-test-floor.mjs:27,96-99 | The runtime `::error::` message when the redaction-suite count drops below the pin does not name `PINNED_REDACTION_PASSED_COUNT` or the file to edit, only the header comment (not shown in CI logs) does | A future legitimate test consolidation lowers the count on purpose; CI fails with a message that says "need at least 44" but not where 44 lives or that lowering it is the fix, so the engineer must open the script source instead of the CI log to resolve it | scripts/check-test-floor.mjs: append to the error line, e.g. "... update PINNED_REDACTION_PASSED_COUNT in scripts/check-test-floor.mjs if this drop is intentional." |
| medium | .workhorse/profile.yml:159 (and sensitive_paths list) | D7 not applied: `check-phone-redaction.mjs`, `phone-redaction-scan.mjs`, `check-test-floor.mjs` are absent from both `sensitive_paths` and `tier_floor_paths: 2`, unlike the three sibling blocking checks already listed there | An agent-driven change edits `phone-redaction-scan.mjs` without the ask-first gate the sibling checks get, since the profile does not flag it as sensitive | .workhorse/profile.yml: add the three script files to `sensitive_paths` and to `tier_floor_paths: 2`, per brief.md D7 (owner action, already identified, just not yet done) |
| low | src/checkTestFloor.test.js:18 | The pin (44) is duplicated as a separate constant in the test file rather than imported from the script, so the two can drift independently | Someone changes the pin in the script but not in the test, or vice versa; nothing but a test failure surfaces the mismatch, and the failure message does not say the two constants must match | src/checkTestFloor.test.js: import `PINNED_REDACTION_PASSED_COUNT` from scripts/check-test-floor.mjs instead of redefining it, or add a comment noting the two must be kept equal by hand |
| low | docs/sdlc/codebase-map.md | No mention of any `scripts/*.mjs` CI check, old or new; pre-existing, not introduced by this diff, but this diff adds a second file to the one check the map already omitted | A reader following only the map, never constraints.md, cannot find any of the four blocking check scripts | docs/sdlc/codebase-map.md: add a short line noting `scripts/` holds CI-blocking checks and pointing at constraints.md business constraint 3 (not required by this change; flagged for the next docs pass) |

## Score

Adoption score: 4

Both scripts can be found via `docs/sdlc/constraints.md`, both headers state what the file does
and why in the spec's own vocabulary, both documented commands were run this session and matched
the documented output exactly, and the ADRs cover every non-obvious decision. The gaps are real
but minor: an unresolved pin-drift message, one still-open owner action already tracked in the
brief and verification.md, and a duplicated constant. None blocked finding, understanding,
running, or safely changing the code during this walkthrough.

Findings outside scope: none.

Not verified: the Linux CI runner's first real run of the new `deploy.yml` step (only occurs on
the next push to `main`, which the owner performs; verification.md already flags the same item).
I did not re-run `npm test` or `npm run build` in this session; verification.md records both as
run and green on this commit and I did not need to duplicate them to assess adoption.

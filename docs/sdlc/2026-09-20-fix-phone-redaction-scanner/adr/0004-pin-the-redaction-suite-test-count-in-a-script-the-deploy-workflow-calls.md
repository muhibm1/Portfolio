# 0004: Pin the redaction suite's test count in a script the deploy workflow calls

Date: 2026-09-20
Status: proposed
Change: 2026-09-20-fix-phone-redaction-scanner

## Context

The constraint audit found (high) that `.github/workflows/deploy.yml` lines 102 to 121 assert
only `numPassedTests >= 12` and zero pending, todo or failed across the whole suite, which
already holds 167 tests in 29 files (confirmed). Deleting, renaming or `describe.skip`-ing
`src/checkPhoneRedaction.test.js` leaves that floor green, so nothing in CI proves the cases
in `evals.md` ran (R11; security baseline, "assert a non-zero test count for the security
project"). `.github/workflows/**` is a sensitive path in `.workhorse/profile.yml` and a push
to `main` publishes the site, so any workflow edit must be small, reviewable and decided by
the owner. The last change moved its own inline workflow check into `scripts/check-npmrc.mjs`
so it could be tested by spawning; that is the pattern in this repository.

## Decision

We add `scripts/check-test-floor.mjs`. It reads the path of the Vitest JSON report from its
one argument, applies the whole-suite rules copied verbatim from the inline step, and then a
per-file rule: the entry of `testResults[]` whose `name`, with `\` normalised to `/`, ends in
`/src/checkPhoneRedaction.test.js` must exist, must have at least the pinned number of
`assertionResults[]` with `status` `passed`, and must have none with any other status. The
pinned number is the file's count at merge, read from a fresh report by Task 3 (44 expected), so
removing a test fails CI and adding one does not. Exit 0 pass, 1 fail, 2 when the report is
missing or not JSON. `deploy.yml` changes in one step only: "Test-count floor (R52)" becomes
"Test-count floors (R52, R11)" with the body `node scripts/check-test-floor.mjs vitest-results.json`.
Report shape confirmed against Vitest 3.2.7 on this host: `testResults[].name` is an absolute
path with `/` separators on Windows, and each expanded `it.each` case is one entry.

## Alternatives

| Option | Why not |
|--------|---------|
| Assert inside the suite, or in another test file, that the suite exists and has no `.skip` | Deleted or skipped together with the suite it guards; only the report CI reads after the run can say what ran |
| Extend the inline `node -e` block in `deploy.yml` | Testable only by pushing to `main`, which is a release; the sibling checks were moved to scripts for that reason |
| A floor of 1 for the file | Lets all but one test be deleted; the count at merge is known and cheap to pin |
| A Vitest reporter or `globalTeardown` in `vite.config.js` | `vite.config.js` is a sensitive path too, and it would fail the local run, not the publishing job, where the floor matters |

## Consequences

Easier: CI reads as green only when the redaction suite ran in full; the floor logic has tests
of its own (E28 to E33) instead of living in an untestable `run:` block. Harder: one step of
the publishing workflow changes, a sensitive path the owner decides at G2 and G4; anyone who
consolidates tests in the redaction file must raise or lower the pin in the script, which D7
asks to make a sensitive path as well. Revisit if a second suite needs a per-file floor, when
the script should take the file and floor as arguments.

# 0003: Let --self-test scan directories against the synthetic reference

Date: 2026-09-20
Status: proposed
Change: 2026-09-20-fix-phone-redaction-scanner

## Context

The outcome asks for red-team tests that start the script through a junction or symlink, plant
a phone number, and expect exit 1 (R5, R7). A real scan derives the reference number from
`git show b50497f:src/data/portfolioData.js` (ADR 0010 of change 2026-09-11) and exits 2 on a
shallow clone. CI checks out with the default depth (`.github/workflows/deploy.yml` line 39, no
`fetch-depth`), so a subprocess test that runs the real scan would fail there, and a test that
skips on a shallow clone would trip the test-count floor (`deploy.yml` lines 102 to 121 require
0 pending tests). `--self-test` already uses the synthetic reference `SELF_TEST_REFERENCE`.

## Decision

`--self-test` accepts directory arguments. With none, it behaves as today: the form renderings
and near-misses, exit 0 or 1. With directories, it additionally scans every file under them
with matchers built from the synthetic reference, prints one leading line that says the scan
uses the synthetic reference and is not the redaction scan, prints the same hit and summary
lines as a real scan, and exits 1 on any hit or a self-test failure, 2 when a file was
undecodable or no file was scanned, else 0. Tracked files are never scanned in this mode; the
repository holds the synthetic number in the test file and the self-test forms on purpose.

## Alternatives

| Option | Why not |
|--------|---------|
| Read the reference from an environment variable in tests | A variable that decides what the security check looks for is a foot-gun in CI; a wrong or empty value scans for nothing |
| Build a throwaway git repository with a fake reference commit in the test | The reference commit and file path are constants in the script; making them injectable is the same foot-gun with more code |
| Skip the subprocess tests without full history | Trips the CI test-count floor, and a skipped security test is the pattern the security baseline forbids |
| Test the guard only with `--self-test` and no planted number | Proves the entry runs but not that a planted number produces exit 1, which is what the outcome asks for |

## Consequences

Easier: the invocation red-team tests run on any clone, including CI. Harder: a person could
run `--self-test dist` and mistake exit 0 for a real scan; the leading line and the header
comment say plainly that it is not, and the real scan needs no flag. Revisit if the real scan
ever runs in CI with `fetch-depth: 0`, when the subprocess tests could use it instead.

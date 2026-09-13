# 0010: Detect the owner's phone number by deriving it from git history at run time

Date: 2026-09-13
Status: proposed
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages

## Context

G4-D3 (`approvals.md`, G4 note) requires every full and partial form of the owner's phone number
to leave every tracked file, including approved G1 and G2 text. R89 as amended names three forms:
the full ten digits, the last seven, and the area code plus exchange. No check may contain the
digits. The number's shape must be caught with any separator, so a literal grep is ruled out.
Tracked files include `package-lock.json` integrity strings, commit hashes and line ranges.
`src/data/portfolioData.test.js` lines 48 to 50 hold a generic pattern and a look-alike example
that is not the owner's number (confirmed by reading).

## Decision

`scripts/check-phone-redaction.mjs` recovers the reference number at run time from
`git show b50497f:src/data/portfolioData.js`. It takes the line holding the `phone` key and keeps
only its digits, which must number exactly ten. It then builds three matchers, one per form. Each
allows zero to three separator characters (space, dot, hyphen, parentheses) between digit groups,
and rejects a match with a digit directly before or after it. It scans every path
`git ls-files` prints, plus any directory passed as an argument. It skips files containing a NUL
byte. For each hit it prints the path, line number and form name, never the matched text. It
exits 0 when clean, 1 on any hit and 2 when the number cannot be derived. A `--self-test` flag
runs the matchers over in-memory strings of the three forms and the look-alike, and fails unless
all three forms match and the look-alike does not.

## Alternatives

| Option | Why not |
|--------|---------|
| Generic phone-shaped regex with an allowlist for the look-alike fixture | Cannot see the partial forms without also matching every three-digit-dash-four-digit string (line ranges, identifiers), and a ten-digit shape with optional separators matches substrings of hashes and lockfile integrity values. The allowlist would grow with every false positive, and the check would end up describing its exceptions rather than the number |
| Commit SHA-256 digests of the three forms and hash every digit window | Keeps the check history-independent, but a digest of a six- or seven-digit string is reversible by brute force in seconds, so committing it is committing the number |
| Literal grep with the digits in the command | Forbidden by G4-D3: it re-commits the number in the check itself |

## Consequences

Easier: one exact check with no allowlist and no false positives from hashes, covering all three
forms and every separator.

Harder: the check depends on `b50497f` being in the local clone. It fails loudly with exit 2 when
it is not, rather than passing vacuously. It cannot run in CI:
`.github/workflows/deploy.yml` line 37 calls `actions/checkout` with no `fetch-depth` (confirmed
by grep), and that default is a shallow clone (believed, not verified). A future commit that
reintroduces the number into a document is therefore caught when a verifier runs the script,
not on push. The site-facing controls (R41's unit tests and R82's served-page assertion) do run
in CI. Revisit if the owner wants CI coverage, by adding `fetch-depth: 0`. That is an edit to a
sensitive path.

Cost: the derived number exists in the script's process memory, and the script must never log
it. The builder's review of the script checks exactly that.

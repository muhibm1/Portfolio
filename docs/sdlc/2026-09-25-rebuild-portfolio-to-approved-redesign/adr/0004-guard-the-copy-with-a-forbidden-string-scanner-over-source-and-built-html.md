# 0004: Guard the copy with a forbidden-string scanner over source and built HTML

Date: 2026-09-25
Status: proposed
Change: 2026-09-25-rebuild-portfolio-to-approved-redesign

## Context

Plan section 1 lists seventeen strings that must not appear in rendered copy after the removals
(`99.9`, `unauthorized`, `95%`, `Enterprise Compliant`, `Zero Data Corruption`, `schema drift`,
`simulator`, `Simulator`, `thinking-orbs`, `Shu`, `Wasl`, `wasl`, `Apple Geo Ingest`,
`dataops-service`, `GEO-92841`, U+2014, U+2013) and section 8 makes the search a shipping gate.
A one-off grep proves the state on one day; the owner edits copy after every job change. The
repository already has a scanner of the same shape for the phone number,
`scripts/check-phone-redaction.mjs` over `scripts/phone-redaction-scan.mjs` (2026-09-20 ADR
0001: entry file split from the library, no argv guard), with exit codes 0, 1, 2 and `::error::`
lines. R129.

## Decision

`scripts/forbidden-copy.mjs` holds the term list and the scan; `scripts/check-forbidden-copy.mjs`
is the entry file. With no argument it scans every file under `src/` except `*.test.*` files,
plus `index.html` and `docs/design/og.svg` (the share image's text); with `dist` it also scans
every `dist/**/*.html`. Terms made only of letters match on word boundaries (so "Shutdown" is
not "Shu"); every other term matches as a substring; matching is case-insensitive so a banned
word at a sentence start is still caught (the list's paired cases are kept for the reader); the
HTML entities `&mdash;`, `&ndash;`, `&#8212;` and `&#8211;` count as the two dashes. Exit 0 needs at
least one file scanned and no hit; exit 1 prints one line per hit with path, line number and the
term; exit 2 means the check could not run (a requested directory missing, a file unreadable, or
nothing scanned). A Vitest file runs the script on fixtures and on the real `src/` so `npm test`
covers the source; the deploy workflow runs it with `dist` after the build and before upload.

## Alternatives

| Option | Why not |
|--------|---------|
| A grep line in the workflow | Not runnable by `npm test`, no fixture tests, and a bash regex for U+2013 is easy to get wrong; the phone scanner moved off exactly this for the same reasons |
| Scan the whole repository including `docs/` | This spec, the plan and the moved handoff legitimately contain every term; scanning them would fail forever or need an allowlist that hides real hits |
| Scan test files too | The scanner's own test names the terms; excluding `*.test.*` is the honest scope and tests are not rendered |
| Fold the terms into the phone scanner | Different rule (no decoding layers, no secret to hide) and a different reason to change; one scanner per concern |

## Consequences

Easier: the removal list is enforced on every push to main, and adding a banned term is one line.

Harder: two more scripts on the CI path, so both go under `sensitive_paths`. The word-boundary
rule means a banned term glued to punctuation such as "simulator," still matches (boundary before
a comma), but "simulators" does not; the owner extends the list if that ever matters.

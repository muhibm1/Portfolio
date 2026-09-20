# 0004: Guard .npmrc content with a script run by the pre-install step

Date: 2026-09-20
Status: proposed
Change: 2026-09-20-pin-node-22-12-minimum

## Context

The constraint audit's second medium finding: the only checks on `.npmrc` content (GC109, AD23)
run in the Vitest suite, which `deploy.yml` executes at line 97, after `npm ci` at line 91. A
`registry=` or `_authToken` line would be honoured by the install before any test rejected it.
The conductor took the audit's recommendation (D8): the allowlist must run in the existing
pre-install guard step at line 49. The repo already has one CI guard shaped as a file under
`scripts/` with a `spawnSync` test: `scripts/check-built-css-fonts.mjs` and
`src/checkBuiltCssFonts.test.js` (R97, R98, confirmed). R113 states the contract.

## Decision

Add `scripts/check-npmrc.mjs` with the R97 script's shape: exit 0 when the only non-comment line
is `engine-strict=true`, exit 1 naming each other line by number and key (never the value), exit 2
when the file is missing, so it never passes on nothing. Append `node scripts/check-npmrc.mjs` as
the last line of the existing "Dependency pin check (R85)" step, renamed to carry R113, so it runs
under the same Node, before `npm ci`. Keep GC109 and AD23 in the suite as regression guards.

## Alternatives

| Option | Why not |
|--------|---------|
| The allowlist inline in the step's `node -e` body, as the pin check is | Not runnable by a test without copying the body out; a change to the body has no test to fail |
| A new workflow step of its own | One more hunk in the sensitive file for no gain; the audit named the existing step as the right position |
| Vitest only | Runs after the install it protects; the finding this ADR answers |

## Consequences

Easier: a bad `.npmrc` stops the run before any package is fetched, and the message names the line
and key so the fix is obvious. Harder: the workflow edit is now three hunks instead of two, each
prompting the owner; the script joins `sensitive_paths` and `tier_floor_paths` (D11), so editing
it later prompts too. The script and the suite hold the same allowlist twice; a change to the rule
belongs in both, as the R97 and R100 pair already does.

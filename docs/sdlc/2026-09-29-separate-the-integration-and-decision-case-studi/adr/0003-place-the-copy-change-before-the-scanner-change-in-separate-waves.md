# 0003: Place the copy change before the scanner change, in separate waves

Date: 2026-09-29
Status: proposed
Change: 2026-09-29-separate-the-integration-and-decision-case-studi

## Context

Two tasks edit disjoint files: the copy and its pins (`src/data/portfolioData.js`,
`src/data/portfolioData.test.js`) and the scanner and its tests (`scripts/forbidden-copy.mjs`,
`src/checkForbiddenCopy.test.js`). They could run in one parallel wave. But
`src/copyIsClean.test.js` runs the real scanner over the real `src/` tree inside `npm test`
(confirmed), and the current copy contains "crossed team boundaries", "fully manual" and "Tens of
thousands" (lines 716, 756, 800, confirmed). A scanner task that lands before the copy task turns
`npm test` red on its own branch, and the previous change (2026-09-25, T16 step 4) had exactly
that: a task whose full suite could not be green until a sibling merged.

## Decision

We run the copy task in wave 1 and the scanner task in wave 2. Each task's "full suite green"
step is then true at the moment it is checked, and the scanner task's real-tree scan proves the
new terms against the already-replaced copy rather than against copy that is about to change.

## Alternatives

| Option | Why not |
|--------|---------|
| One parallel wave | Saves one builder session's wall time, but the scanner task cannot finish green and the verifier would have to reason about which red is expected. |
| One task for both | Two sensitive files, two test files and two unrelated commit messages in one session; harder to review and to revert separately. |
| Scanner first, copy second | Same red-suite problem, on the copy task instead. |

## Consequences

Easier: every task ends with a green suite; a revert of either commit leaves the tree consistent
(reverting the scanner commit alone keeps the new copy; reverting the copy commit alone makes the
scanner fail loudly, which is the intended direction). Harder: total wall time is two sessions
in sequence instead of one, within the 90 minute tier 2 budget.

# 0002: Ban the disclosure words as word-family patterns, not every category noun

Date: 2026-09-29
Status: proposed
Change: 2026-09-29-separate-the-integration-and-decision-case-studi

## Context

The owner's change request sets three disclosure rules (no description of how edit permissions
are scoped, no naming of protected map-data categories, no reason a feature came to be locked)
and its verification item 2 names the words to search for: sandbox, boundary, terrain, landmark,
and "any phrasing about data having been changed incorrectly" (R163, R168). Rule 2 also lists
water bodies, borders and buildings as examples of categories. `scripts/forbidden-copy.mjs`
matches a letters-only string on word boundaries, so "landmark" would not catch "landmarks", and
a plain "border" term would hit the Tailwind class `border-border` on every page (confirmed: 40+
`border-` class occurrences across `src/components/` and `src/index.css`, and the built HTML
carries the same class names). "buildings" is legitimate on the Data Health page (the incident
copy, lines 800 and 851, confirmed).

## Decision

We add global pattern terms for the word families the owner listed: `sandbox` with its `-es`,
`-ed`, `-ing` forms; `boundary` and `boundaries`; `terrain(s)`; `landmark(s)`; a phrasing pattern
for "incorrectly" directly before or after changed/edited/modified/updated/altered, and
"incorrect" directly before change(s)/edit(s)/update(s)/modification(s); and, for rule 3, a
pattern for "high-impact", "high impact" and "high user impact". Each is case-insensitive with no
skipped extensions. We do not add "border", "buildings", "water" or "mesh": the first collides
with the styling classes on every page, the second with approved Data Health copy, and the last
two are ordinary English the site may need. The human read of both pages at G2 and G4 covers
what a word list cannot (spec R168).

## Alternatives

| Option | Why not |
|--------|---------|
| Plain string terms for the five words | Misses plurals and verb forms ("sandboxed", "boundaries"); the scanner's letters-only rule gives exact-word matches. |
| Add "border" and "buildings" too | "border" hits every page's class names; "buildings" hits the Data Health incident copy the owner keeps. |
| Only the five words, no phrasing patterns | Item 2 names "any phrasing about data having been changed incorrectly"; a word list alone cannot express it, and rule 3 has no single word at all. |
| Scope the disclosure terms to the two Apple pages | The rules say "nothing on the public site"; global is the rule as written and costs nothing today (zero hits outside the copy being replaced, confirmed by grep). |

## Consequences

Easier: a future edit that names a protected category by one of these words fails `npm test`
(the real-tree scan) and the post-build CI step with a `::error::path:line: term` line. Harder:
the two phrasing patterns are approximations; a sentence that discloses a reason without those
words passes the machine and is caught only by the human read. A legitimate future use of
"boundary" or "landmark" on any page needs a term-list edit, which is ask-first and tier 2 by
the profile, so it is a deliberate act.

# Adoption review: 2026-09-25-rebuild-portfolio-to-approved-redesign

Scope: `git diff 49618de..HEAD`, focused on the resume withdrawal, the scanner's new terms,
repository links, the MCP section, docs/profile/CLAUDE.md edits, and the re-synced test floors.
Read `brief.md`, `spec.md`, `plan.md`, `adr/0008` to `0010`, `CLAUDE.md`, `docs/sdlc/codebase-map.md`,
`docs/hosted-config.md`, `scripts/forbidden-copy.mjs`, `src/data/portfolioData.js`,
`src/data/portfolioData.test.js`, `docs/design/redesign-2026-09/PORTFOLIO_ALIGNMENT_PASS.md`.

Verdict: 2 findings (0 critical, 1 high, 1 medium, 0 low)
Adoption score: 3

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| high | src/data/portfolioData.js:379-436, src/data/portfolioData.test.js:64,181-184 | The WorkHorse "measured" stats ("5 of 5", "40", "70", "1 of 5", the closing sentence's "nine plugin releases") and the featured-card "40"/"9" carry no in-file comment saying they are the owner's own hand-maintained run-record figures, where their source is, or that they go stale after the next WorkHorse run. The only place this is stated is `adr/0010` (Consequences section) and the buried D41-D53 rows of `brief.md`; `CLAUDE.md` ("Mistakes to avoid", "Conventions") says nothing about it. The task brief for this run states this is exactly the scenario to check: "you edit the numbers yourself after the next run." | Six months from now the owner (or anyone else) opens `portfolioData.js`, sees four bare stat objects and a features card, has no reason to open `adr/0010`, and either edits the number without updating the matching pin in `portfolioData.test.js` (test goes red) or doesn't know which cells are safe to change and which are tied to specific run counts (e.g. "the first four runs") | Add a short comment directly above the `measured` block in `src/data/portfolioData.js` stating: these are the WorkHorse run-record stats, sourced to `approvals.md`'s G2 entries (see `adr/0010`), update after each new run and keep `portfolioData.test.js` lines 64 and 181-184 in sync; add one bullet to `CLAUDE.md` "Mistakes to avoid" pointing to `adr/0010` for how to update the run-record numbers |
| medium | .github/workflows/deploy.yml, scripts/forbidden-copy.mjs:82-121 | The scanner's `FORBIDDEN_TERMS` list (extended by this revision to 31 terms plus two pattern terms) is well-commented for *what* was added and *why* (R156 references), but nothing in `CLAUDE.md` or `docs/sdlc/codebase-map.md` tells a future maintainer *that this is the mechanism to extend* when a new claim needs banning, or names the risk row in `plan.md` ("The Paddock pattern misses a synonym... the owner may extend the word list") as the only place that says so | An engineer wanting to ban a new phrase (e.g. after a future redesign) has to find `scripts/forbidden-copy.mjs` unaided; nothing in the README-equivalent (`codebase-map.md`) names it as a place to extend, only as a thing that exists | Add one line to `docs/sdlc/codebase-map.md`'s 2026-09-25 block or to `CLAUDE.md` naming `scripts/forbidden-copy.mjs`'s `FORBIDDEN_TERMS` array as the place to add a banned string or pattern term, with the two-shape hint (`string` or `{ label, pattern, skipExtensions }`) already documented in the file's own header comment |

Findings outside scope: `README.md` is still the unmodified `create-vite` template and does not
describe this project (confirmed); this predates and is unchanged by this diff, and is already
self-documented as a known gap in `docs/sdlc/codebase-map.md` "Files that are not part of the
product," so it is not scored as new here.

Not verified: `npm run lint`, `npm test`, `npm run build` were not re-run in this review (the
conversation states verification is already green for this branch); I did not run `npm ci` or
start any dev/preview server per instructions. The three GitHub repository links (`workhorse-
snapshot`, `studbook-snapshot`, `paddock-snapshot`) were not fetched to confirm live status.

Notes on what worked well (not findings): the "withheld" convention in
`PORTFOLIO_ALIGNMENT_PASS.md` is explained in a single banner (lines 7-20) that a reader hits
before any individual "withheld" note, so each later occurrence is self-explanatory (confirmed).
`scripts/forbidden-copy.mjs`'s own header and inline comments (lines 1-11, 35-71, 73-88,
125-129) fully explain the two term shapes and how `buildMatchers` uses them, so once a
maintainer finds the file, extending it is low-risk (confirmed).

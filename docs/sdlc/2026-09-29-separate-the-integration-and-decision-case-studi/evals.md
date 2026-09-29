# Evals: separate the integration and decision case studies and correct the incident count

Change id: `2026-09-29-separate-the-integration-and-decision-case-studi`
Spec: [spec.md](./spec.md)

Evals turn "does it work" into evidence. Each case is executable where the stack allows it and
becomes a permanent test. Targets are numbers. Tier 2 limit: 40 cases; this file has 21.

## Targets

| Category | Target | Rationale |
|----------|--------|-----------|
| Golden | 100% pass | The owner's words on the page, and the guards that keep the old ones out |
| Edge | 100% pass | Word families, near-misses, the page scope's inertness elsewhere |
| Failure | 100% correct handling | The exact regression is caught; nothing scanned still fails closed |
| Adversarial | 100% rejected | A spelling variant of the banned phrase on the guarded page |
| Non-functional | see rows | Scanner speed, no dependency |

## Cases

"Implemented as" names a Vitest file under `src/` (run by `npm test`) or a command the verifier runs from the repository root. "existing" means the case is already in the file and must stay green; it is listed because this change could break it. One check is manual and has no row: R168's human read, at G2 and G4, of both situation sections back to back and of the Data Health incident paragraph with its stat label against disclosure rule 2 (D14); the verifier lists it under "Not verified".

| ID | Category | Given | When | Then | Maps to requirement | Implemented as |
|----|----------|-------|------|------|---------------------|----------------|
| G1 | golden | the data module | the integration study's `intro` is read | it equals the change request's hero lead, verbatim | R160 | `src/data/portfolioData.test.js` (pinned narratives, integration `lead`) |
| G2 | golden | the data module | the integration at-a-glance Result and third stat card are read | Result value is "A script-driven process replaced by access on demand, with the reason recorded"; stat value "On demand", label "instead of hand-run scripts"; stat values still `["~50%", "3 systems", "On demand"]` | R160 | `src/data/portfolioData.test.js` (pinned at-a-glance; pinned stats plus a new label pin) |
| G3 | golden | the data module | the integration `situation`, `built` paragraph and `changed` paragraph are read | each equals the change request's text verbatim; the situation text ends "None of it required judgment, only care."; `built` and `changed` both contain the reason-comment trail wording ("carries a comment explaining why"; "leaves behind the reason it was made") | R160 | `src/data/portfolioData.test.js`, new case "carries the integration page's situation, built and changed paragraphs verbatim (R160)" |
| G4 | golden | the data module | the integration callout text is read | it equals the previous paragraph, one space, then the appended sentence, verbatim | R160 | `src/data/portfolioData.test.js` (pinned `calloutText`) |
| G5 | golden | the data module | the integration study's unchanged elements are read | title "Three systems, one tool, half the turnaround", eyebrow, card title and summary, at-a-glance rows 1 to 3, stat cards 1 and 2, the link-diagram block, the `hard` paragraph, disclaimer and contact heading equal their values on `main` at 9c3377f | R160 | `src/data/portfolioData.test.js`, new case "keeps every integration element the change request lists as unchanged (R160)" |
| G6 | golden | the data module | the decision study's `situation` section is read | its first paragraph equals the change request's new opening verbatim and contains "that judgment was the bottleneck"; its second paragraph is "Building a fix wasn't part of my assigned role. I took it on anyway."; its lead and card summary still begin "Cross-team data changes"; principle 01 still contains "cross-team work" | R161 | `src/data/portfolioData.test.js`, new case "carries the decision page's new situation opening and keeps its lead, card and principle 01 (R161)" |
| G7 | golden | the data module | every string is collected | the Apple bullet contains "affecting thousands of buildings", the Data Health incident paragraph begins "A mass building-generation incident affected thousands of buildings.", the Data Health stat values are `["Hundreds of thousands", "~40% fewer", "Thousands"]`, and no string matches `/tens of thousands/i` | R162 | `src/data/portfolioData.test.js` (pinned stats updated; new case "says thousands, never tens of thousands, for the incident count (R162)") |
| G8 | golden | a fixture directory with one file per new global term: "crossed team boundaries" is not used (two terms); instead one file each for `crossed team`, `fully manual`, `tens of thousands`, `sandbox`, `boundary`, `terrain`, `landmark`, `changed incorrectly`, `high user impact`, plus the existing 32 renderings | `scanFiles` runs with `buildMatchers(FORBIDDEN_TERMS)` | exit 1 and exactly one hit per new fixture file, labelled with the term's label | R163 | `src/checkForbiddenCopy.test.js` (extend `ONE_FILE_PER_TERM_RENDERING`; the existing one-hit-per-file case) |
| G9 | golden | three fixtures with the text "cross-team handoff": under `work/apple-integration/index.html`, under `work/apple-llm-triage/index.html`, and a root `index.html` | `scanFiles` runs with `buildMatchers([...FORBIDDEN_TERMS, ...PAGE_SCOPED_TERMS])` | exactly one hit, on the integration path, labelled "integration page cross-team wording"; the other two files produce no hit | R164 | `src/checkForbiddenCopy.test.js`, new case "bans cross-team only under work/apple-integration/ (R164)" |
| G10 | golden | the data module | the integration study's strings are collected | none matches `/cross-team|crossed team|fully manual/i` | R165 | `src/data/portfolioData.test.js`, new case "never says cross-team, crossed team or fully manual on the integration page (R165)" |
| G11 | golden | the real `src/` tree after both tasks | the scanner entry runs with no argument | exit 0, at least 20 files scanned | R166 | `src/copyIsClean.test.js` (existing) |
| G12 | golden | a fresh `npm run build` | `node scripts/check-forbidden-copy.mjs dist` runs | exit 0 and "files scanned" printed; `dist/work/apple-integration/index.html` was in scope | R166 | command: `npm run build && node scripts/check-forbidden-copy.mjs dist` (verifier records the exit code) |
| E1 | edge | fixtures "sandboxed", "boundaries", "Landmarks", "TERRAINS", and near-misses "outbound traffic", `className="border-b border-border"`, "Terraform" | `scanFiles` runs with the global matchers | the first four each yield one hit; the three near-misses yield none | R163 | `src/checkForbiddenCopy.test.js`, new case "matches the disclosure word families but not outbound, border classes or Terraform (R163)" |
| E2 | edge | fixtures "was changed incorrectly", "incorrectly updated the data", "an incorrect edit", "high-impact features"; near-misses "the incorrect answer", "changed the date" | `scanFiles` runs | the first four each yield one hit; the two near-misses yield none | R163 | `src/checkForbiddenCopy.test.js`, new case "matches changed-incorrectly and high-impact phrasings but not incorrect answer or changed the date (R163)" |
| E3 | edge | the real `src/data/portfolioData.js` after task 1 (it contains "Cross-team" on the decision page) | `scanFiles` runs on that one file with `buildMatchers([...FORBIDDEN_TERMS, ...PAGE_SCOPED_TERMS])` | exit 0, no hit: the page-scoped term is inert off its path and no global term fires | R164, R163 | `src/checkForbiddenCopy.test.js`, new case "scans the real data module clean with the page-scoped term inert (R164)" |
| E4 | edge | `FORBIDDEN_TERMS` and `PAGE_SCOPED_TERMS` | `buildMatchers` runs on each | `buildMatchers(FORBIDDEN_TERMS).length === FORBIDDEN_TERMS.length` (existing); the page-scoped matcher carries `onlyPaths` as a RegExp and global matchers carry `onlyPaths === null` | R164 | `src/checkForbiddenCopy.test.js` (existing matcher-count case; new case "carries onlyPaths on the page-scoped matcher only (R164)") |
| E5 | edge | a fresh `npm run build` | the verifier greps the built pages | `dist/work/apple-llm-triage/index.html` and `dist/index.html` still contain "Cross-team" (lead, card, principle 01); `dist/work/apple-integration/index.html` matches none of `/cross[- ]?teams?/i`, `/crossed team/i`, `/fully manual/i`; no `dist/**/*.html` (title, description and Open Graph meta included) matches `/tens of thousands/i`; the integration page's `<meta name="description">` begins with the new hero lead's first words "Locking and unlocking permissions" | R160, R161, R162, R164 | command: `npm run build` then `node -e` script in T2 step 4 (verifier records exit code 0) |
| E6 | edge | fixtures "cross-team" under `dist/work/apple-integration/index.html`, under `a/b/work/apple-integration/index.html`, and under look-alikes `work/apple-integration-notes/index.html` and `work/apple-integrations/index.html` | `scanFiles` runs with both lists | the first two yield one hit each (the scope does not depend on where the tree is rooted); the look-alikes yield none | R164 | `src/checkForbiddenCopy.test.js`, new case "scopes cross-team by the integration directory wherever the tree is rooted, not by look-alikes (R164)" |
| E7 | edge | fixtures "Tens of Thousands of buildings" and "TENS OF THOUSANDS", and near-misses "Hundreds of thousands" and "thousands of buildings" | `scanFiles` runs with the global matchers | the first two yield one hit each; the near-misses yield none (the Data Health stat "Hundreds of thousands" stays legal) | R162, R163 | `src/checkForbiddenCopy.test.js`, new case "bans tens of thousands in any case but not hundreds of thousands or thousands (R162, R163)" |
| F1 | failure | a fixture under `work/apple-integration/index.html` holding the three old integration sentences from `main` (lines 701, 716 and 756) | `scanFiles` runs with both lists | exit 1 and at least four hits: "cross-team" twice, "crossed team", "boundary", "fully manual" | R163, R164 | `src/checkForbiddenCopy.test.js`, new case "catches the old integration copy if it returns to the built page (R163, R164)" |
| A1 | adversarial | fixtures under `work/apple-integration/index.html`: one with "Cross Team" (space, mixed case), one with "cross-teams", and a near-miss with "across teams" | `scanFiles` runs with both lists | the first two each yield one hit for the page-scoped term; "across teams" yields none (the pattern has a leading word boundary and no `g` or `y` flag) | R164 | `src/checkForbiddenCopy.test.js`, new case "catches spaced and mixed-case cross-team on the integration page but not across teams (R164)" |

## Non-functional

| ID | Measure | Target | How measured |
|----|---------|--------|--------------|
| N1 | scanner entry wall time on the real `src/` | under 2000 ms | `src/checkForbiddenCopy.test.js` (existing case "runs under two seconds scanning the real src/ directory") |
| N2 | new dependencies | 0 | command: `git diff --stat main..HEAD -- package.json package-lock.json` prints nothing |

## Failure taxonomy

| Class | Description | Detection | Example |
|-------|-------------|-----------|---------|
| wrong result | a placed string differs from the owner's text | R165 pin fails with a diff in `npm test` | a retyped apostrophe or a dropped comma in the hero lead |
| regression | a replaced phrase returns to a page | real-tree scan (G11), post-build scan (G12) or G10 fails; CI annotation `::error::path:line: term` | "fully manual" reintroduced in a later edit |
| leaked | a disclosure word or phrasing appears anywhere on the site | R163 terms in `npm test` and the CI `dist` step | "sandbox" in a future paragraph |
| false hit | a new term blocks legitimate copy on another page | `npm test` red with the path and line; fixed by a term-list edit (ask-first, tier 2) | a future "boundary" in a WorkHorse paragraph |
| silent pass | the page-scoped term never applies, so the guard proves nothing | E3 and G9 together: inert off-path, live on-path; G12's "files scanned" count | `onlyPaths` typo that matches no path |
| unrecoverable | none: every change is a git revert, no data | not applicable | |

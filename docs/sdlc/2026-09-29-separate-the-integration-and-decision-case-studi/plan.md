# Plan: separate the integration and decision case studies and revise the Data Health incident paragraph

Change id: `2026-09-29-separate-the-integration-and-decision-case-studi`
Spec: [spec.md](./spec.md)
Branch: `wh/2026-09-29-separate-the-integration-and-decision-case-studi`
Worktree: the conductor's per-wave worktrees under the repository (one task per wave, so each wave is one worktree)

## Approach

Two tasks, two waves, in order (ADR 0003). Task 1 places the owner's copy in the data module and updates its pins, so the tree is clean of the phrases before any term bans them. Task 2 extends the scanner with the global terms and the path-scoped "cross-team" term and proves both on fixtures and on the real data file. Every string is copied from `CASE_STUDY_FIX_INTEGRATION_AND_DECISION.md` (the change request, in the owner's Downloads folder) or from the owner's G2 rejection notes of 2026-09-29T07:35:24Z in `approvals.md` (the card summary and the Data Health incident paragraph); all are quoted in full in this plan's task 1 so the builder never has to leave the repository, and none is retyped or paraphrased. The incident count stays "tens of thousands" everywhere (G2 notes, D3). No dependency is added; no protected or harness-guarded file is touched; `scripts/check-test-floor.mjs` is not edited (R167).

## Files

| Action | Path | Purpose |
|--------|------|---------|
| modify (sensitive, T1) | `src/data/portfolioData.js` | the seven integration elements, the integration card summary, the decision opening, the Data Health incident paragraph (R160, R161, R169, R170) |
| modify (T1) | `src/data/portfolioData.test.js` | pins of the new copy, the unchanged elements and the kept count, the integration phrase ban (R162, R165) |
| modify (sensitive, tier-2 floor, T2) | `scripts/forbidden-copy.mjs` | global terms, `onlyPaths`, `PAGE_SCOPED_TERMS` (R163, R164) |
| modify (T2) | `src/checkForbiddenCopy.test.js` | fixture cases for the new terms and the page scope (R163, R164) |

## Waves

| Wave | Tasks | Files (disjoint within the wave) |
|------|-------|----------------------------------|
| 1 | T1 | `src/data/portfolioData.js`, `src/data/portfolioData.test.js` |
| 2 | T2 | `scripts/forbidden-copy.mjs`, `src/checkForbiddenCopy.test.js` |

`build.max_parallel` is 4; no wave exceeds 1. Ask-first paths, by task, so the G2 approval covers them explicitly: T1 `src/data/portfolioData.js`; T2 `scripts/forbidden-copy.mjs`. Once G2 is approved the protect-paths hook allows an edit to a sensitive path this plan names (believed, not verified this session; the 2026-09-25 plan recorded it as confirmed from `hooks/scripts/protect-paths.js`).

## Tasks

### Task 1: the owner's copy and its pins (sensitive: src/data/portfolioData.js)

- Requirement(s): R160, R161, R162, R165, R169, R170
- Files: `src/data/portfolioData.js`, `src/data/portfolioData.test.js`
- Parallel: no (wave 1, alone)
- Steps:
  1. In `portfolioData.test.js`, write the failing cases: update the three existing pins of the old integration copy (line 111 integration `lead`; line 116 Result value; line 120 `calloutText`) to the new strings (G1, G2, G4; an owner-authorized content change, D10); leave the line 59 stat pin `["Hundreds of thousands", "~40% fewer", "Tens of thousands"]` untouched (D3); add "carries the integration page's situation, built and changed paragraphs verbatim (R160)" (G3); "keeps every integration element the change request lists as unchanged (R160)" pinning title, eyebrow, card title and link text, at-a-glance rows 1 to 3, stat cards 1 and 2 with labels, the link-diagram block, the `hard` paragraph, disclaimer and contact heading exactly as they read on `main` (G5); "carries the decision page's new situation opening and keeps its lead, card and principle 01 (R161)" (G6); "keeps tens of thousands as the incident count in all three places (R162)" pinning the Apple bullet's ending, the third stat's label and the paragraph's "put tens of thousands of buildings into the data" (G7); "never says cross-team, crossed team or fully manual on the integration page (R165)" (G10); "carries the Data Health incident paragraph verbatim and never says restricted geospatial (R169)" asserting the `incident` section holds one paragraph block equal to the string below, heading "When it breaks at scale", and no string in the module matches `/restricted geospatial/i` (G13); "carries the integration homepage card summary verbatim (R170)" (G14). The strings, verbatim:
     - card `summary` (G2 notes): "Locking and unlocking permissions on protected map features ran on long command-line scripts. I replaced it with one tool that does it on demand and records why each change was made."
     - `intro`: "Locking and unlocking permissions on protected map features already worked, but it ran on long command-line scripts and extra tickets raised just to carry the change. I built a Python tool that does it on demand through the ticketing, repository and geo-data systems' own authenticated APIs, and records why each change was made."
     - Result value: "A script-driven process replaced by access on demand, with the reason recorded"
     - third stat: value "On demand", label "instead of hand-run scripts" (D4)
     - situation: "Locking and unlocking protected map data already worked, but the path was hostile: long command-line invocations, extra tickets raised just to carry the change, and enough setup that a routine request was easy to get wrong. None of it required judgment, only care."
     - built paragraph: "A Python tool that locks and unlocks map feature edit permissions on demand. It works through each system's authenticated REST API, so no one has to change the tools they already use, and every lock or unlock carries a comment explaining why, so the next person who asks why a feature is locked finds the answer on the feature itself."
     - changed: "A script-driven process became access control on demand, turnaround on lock and unlock requests dropped by about 50%, and every change now leaves behind the reason it was made."
     - callout: the existing text, then one space, then "The same instinct applies to the context around a system: the question someone will ask in six months is usually why is this like this, and that answer is cheapest to capture at the moment the change is made."
     - decision situation, first paragraph: "Every change to certain map data needed a person to judge whether it should go ahead, and that judgment was the bottleneck. The queue grew faster than reviewers could clear it. About two months of tickets had piled up with teams across the pipeline waiting on them."
     - Data Health incident paragraph, line 851, the whole `text` (G2 notes): "A mass building-generation incident put tens of thousands of buildings into the data. I scoped the blast radius with SQL and QGIS and drove a delete, correct or retain decision on each one."
     - not edited: line 162 (the Apple bullet, "affecting tens of thousands of buildings"), line 800 (value "Tens of thousands", label "buildings triaged in one incident I led"), and the `incident` heading.
  2. Run `npm test -- src/data/portfolioData.test.js`; confirm it fails on the three old pins and each absent new string, and for no other reason.
  3. Edit `src/data/portfolioData.js` at the confirmed lines (689; 695 to 696, 701, 706, 716, 734, 756, 764; 606; 851) with the strings above; touch nothing else in the file.
  4. Run the file's tests green, then `npm test` (the real-tree scan in `src/copyIsClean.test.js` stays green: the current term list has none of these words), then `npm run lint`. Confirm no U+2013 or U+2014 in the new strings (the existing dash case).
  5. Commit: `feat(content): separate the integration and decision case studies and revise the Data Health incident paragraph`, body citing the owner's change request by filename and his G2 rejection notes of 2026-09-29T07:35:24Z (`approvals.md`) as the authorization for the fact edits.
- Done when: G1 to G7, G10, G13 and G14 pass; every other case in the file still passes; `npm test`, `npm run lint` and `npm run build` exit 0.

### Task 2: scanner terms and the page-scoped term (sensitive: scripts/forbidden-copy.mjs)

- Requirement(s): R163, R164, R166, R167
- Files: `scripts/forbidden-copy.mjs`, `src/checkForbiddenCopy.test.js`
- Parallel: no (wave 2, alone; depends on T1 so the real-tree scan is green)
- Steps:
  1. In `checkForbiddenCopy.test.js`, write the failing cases: extend `ONE_FILE_PER_TERM_RENDERING` with one fixture per new global term, "crossed team", "fully manual", "restricted geospatial", "a sandbox", "the boundary", "terrain", "a landmark", "was changed incorrectly", "high user impact" (G8); "bans cross-team only under work/apple-integration/ (R164)" using a fixture helper that writes under a nested directory in the temp dir (G9); "matches the disclosure word families but not outbound, border classes or Terraform (R163)" (E1); "matches changed-incorrectly and high-impact phrasings but not incorrect answer or changed the date (R163)" (E2); "scans the real data module clean with the page-scoped term inert (R164)" on `src/data/portfolioData.js` (E3); "carries onlyPaths on the page-scoped matcher only (R164)" (E4, new half); "catches the old integration copy if it returns to the built page (R163, R164)" with the three old sentences from `main` lines 701, 716 and 756 as the fixture text (F1); "catches spaced and mixed-case cross-team on the integration page but not across teams (R164)" (A1; the "across teams" fixture under the integration path must yield no hit); "scopes cross-team by the integration directory wherever the tree is rooted, not by look-alikes (R164)" (E6); "bans restricted geospatial in any case but not restricted geography, geospatial data or the incident count (R163, R169)" with the fixture "Tens of thousands of buildings" proving the count is not banned (E8). The existing 29 cases, including the matcher-count case (E4, existing half), the real-tree case in `src/copyIsClean.test.js` (G11) and the two-second case (N1), are not edited.
  2. Run `npm test -- src/checkForbiddenCopy.test.js`; confirm each new case fails because the term or export does not exist yet, and for no other reason.
  3. Edit `scripts/forbidden-copy.mjs`: add the global string terms "crossed team", "fully manual" and "restricted geospatial" (D15; a string with a space is matched as a case-insensitive substring by the existing `buildPattern`, so no pattern object is needed) and the pattern terms of spec R163 to `FORBIDDEN_TERMS` (each pattern term exported by name, `skipExtensions: []`), with a comment citing this change, ADR 0002 and the change request's verification items 1 and 2; do not add "tens of thousands" (D3, D8); add `onlyPaths` to the term shape per spec interface (i): `buildMatchers` carries `term.onlyPaths ?? null`, `hitLinesIn` keeps a matcher only when its `skipExtensions` excludes the file's extension and its `onlyPaths` is `null` or tests true against the displayed path; add `export const PAGE_SCOPED_TERMS` with the one integration term (label "integration page cross-team wording", pattern `cross[- ]teams?` with a word boundary at both ends, the leading one required so "across teams" does not match, case-insensitive, `onlyPaths` matching `work/apple-integration/`); use no `g` or `y` flag on this or any new pattern, because `termsFoundIn` calls `.test` repeatedly and those flags make it stateful; make `main` build matchers from `[...FORBIDDEN_TERMS, ...PAGE_SCOPED_TERMS]`; update the module and `FORBIDDEN_TERMS` doc comments. Functions stay under 40 lines; no other behaviour changes.
  4. Run the file's tests green, then `npm test`, `npm run lint`, `npm run build`, then `node scripts/check-forbidden-copy.mjs dist` (exit 0, G12). Then run the E5 built-page check with a `node -e` script over `dist/`: "Cross-team" present in `dist/work/apple-llm-triage/index.html` and `dist/index.html`; none of `/cross[- ]?teams?/i`, `/crossed team/i`, `/fully manual/i` in `dist/work/apple-integration/index.html`; `/restricted geospatial/i` in no `dist/**/*.html`; "put tens of thousands of buildings into the data" in `dist/work/apple-data-health/index.html`; "ran on long command-line scripts. I replaced it with one tool" in `dist/index.html` and `dist/work/index.html`; the integration page's meta description begins "Locking and unlocking permissions" (exit 0). Confirm the scanner's own comments do not contain a banned term on a scanned path (the script is under `scripts/`, outside the scan scope, confirmed).
  5. Commit: `feat(checks): ban the replaced integration wording, restricted geospatial and the disclosure words; scope cross-team to the integration page`
- Done when: G8, G9, E1 to E6, E8, F1, A1 pass; the 29 existing cases and G11, N1 pass; G12 exits 0.

## Verification plan

Profile commands, all run by the verifier from the change branch after wave 2: `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npm audit --omit=dev --audit-level=high`. Then the two command cases: G12 (`node scripts/check-forbidden-copy.mjs dist`, exit 0) and N2 (`git diff --stat main..HEAD -- package.json package-lock.json` prints nothing). Eval coverage: 23 cases (14 golden, 7 edge, 1 failure, 1 adversarial) and 2 non-functional measures, all machine-run. R168's read is manual: both situation sections back to back, plus the Data Health incident paragraph and its stat label, on the built pages at G4 (the wording is the owner's own from the G2 notes); the verifier lists it under "Not verified". Evidence the owner sees: the Ship document's command table with exit codes, the eval pass counts per category, and the `git diff` of the four files.

## Rollback

- dev: `git checkout main` or drop the branch; nothing else changes on the machine.
- staging: none exists.
- prod: the site publishes only when the owner merges to `main` and pushes; to undo after publishing, the owner reverts the merge commit on `main` and pushes, which republishes the previous copy. Reverting the copy commit alone makes the scanner fail loudly on the old wording (ADR 0003); revert both or neither. No data, no migration, no state outside git.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| A placed string differs from the owner's text by a character | Medium | The page says something he did not approve | Strings quoted verbatim in task 1; pins compare whole strings; the owner reads the diff at G4 |
| A new global term collides with copy elsewhere | Low | CI red until a term-list edit | Pre-checked by grep (zero hits outside the replaced copy); "border" and "buildings" left out (ADR 0002); the R163 near-miss cases |
| The page-scoped term silently applies nowhere | Low | A false sense of a guard | G9 proves it fires on the path; E3 proves it is inert off it; G12 scans the real built page |
| A builder "corrects" the count to "thousands" from the superseded earlier answer | Low | A fact the owner reversed reaches the page | Task 1 names the count as not edited; G7 pins "tens of thousands" in all three places; E8 proves the scanner does not ban it |
| The disclosure rules are breached by wording no pattern catches | Low | A sentence the owner did not want public | Human read at G2 and G4 (R168); the new copy is the owner's own text |

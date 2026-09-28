# Plan: rebuild the portfolio to the approved redesign

Change id: `2026-09-25-rebuild-portfolio-to-approved-redesign`
Spec: [spec.md](./spec.md)
Branch: `wh/2026-09-25-rebuild-portfolio-to-approved-redesign` (HEAD 57d39b2 at this round)
Worktree: one per builder under `.claude/worktrees/`, folded by rebase (`build.wave_merge`)
Revised 2026-09-28: this plan holds only the remaining work. T1 to T14 of the approved plan are done
(state `tasks_done: T1..T13`, conductor log) and stay; the revision tasks are T15 to T22. Rounds the
same day (spec "Response to audit" and "Earlier responses"): round 2, T15, T16 and T21 revised for
D35 to D40, no absolute owner-tool timing written here (D36); round 3, T15, T16, T21 and T22 revised
for D41 to D46, run stats back at five runs with Paddock current; its audit (D47 to D49), the 70 card
and closing sentence scoped to the first four runs, G10 scoped, T22 widened, D38 logs hashes, commit
bodies cite entries by date and gate; round 4 (D50 to D53), T15 uses the mockup's neutral wording for
the outcomes rows and the tally sentence, the findings card at the owner's 40, the featured card per
D52; round 5 (re-audit, D54, D55), T21 redacts the plan copy's line 44 parenthetical, T15 step 3 scoped.

## Before Build (the conductor, not a builder): D38

Immediately after G2 approval and before the first builder is dispatched, the conductor replaces
fa41dca and every later design commit on the branch (the audit response, the two packet and
rejection records, this round) with one commit holding the redacted state, non-interactively
(`git reset --soft 49618de`, then one commit carrying the messages). Before the reset, the conductor
writes into the conductor log the hash and subject of every commit the rewrite will drop (618f344,
a712f46, aba1ac3, 82f7209, 0ab3167, 905d8cb, this round's commit and the G2 approval commit, each
cited by an `approvals.md` entry or a commit body), then the new hash beside them; after it, the conductor re-computes the
sha256 of `brief.md` and confirms it equals the packet hash in the newest "G2: approved" entry,
logging the result (D48). No `wh/2026-09-25-*` ref exists on the remote (confirmed by `git ls-remote
--heads origin` on 2026-09-28 before this round; believed still true), so nothing is force-pushed. What
this cannot fix, accepted by D38: the relative timing phrases in `src/data/portfolioData.js` and
the WorkHorse mockup since d5e1f23 and 781970f (30 build commits, cited by hash in the
verification, review and conductor records), and anything on `main` or another pushed ref. The
run tallies in those commits are approved site copy again (D45) and need no rewrite.

## Inputs

The owner's G2 rejection notes of 2026-09-28 (the two "G2: rejected" entries in `approvals.md`, 08:12
and 08:57 UTC, quoted in `brief.md` "Response to rejection"; the source of "5 of 5", of D44, of the
findings total 40 and of D50); the owner's answers of
2026-09-28 (quoted in the Decisions table of `brief.md`, rows D24 to D27); the redacted overlay
`docs/design/redesign-2026-09/PORTFOLIO_ALIGNMENT_PASS.md` (on disk, R157); the plan and mockups
beside it; `spec.md` R151 to R159 and the amended rows; ADRs 0008, 0009, 0010.

## Done and kept (no task re-runs them)

| Tasks | What stays | Eval cases still owned by the done task (test unchanged) | Evidence |
|-------|------------|----------------------------------------------------------|----------|
| T1 to T4 | tokens, typefaces, pins; the content module's shape; the scanner; the design record and `og.svg` | T1: G4, G5, G13; T2: G1; T3: F2 | `verification.md` at bbd02a2: lint, build, audit, both scanners, route pages all exit 0 |
| T5 to T10 | header, layout, footer, cards, case-study template, home, work index, not-found, page meta, `og.png` | T9: none (G9 cut by eval review 2026-09-28, R134 coverage folded into G7, task T19); T10: G16, A1, E3 | 418 of 419 tests passed; the one failure was the PDF (withdrawn by D24) |
| T11 to T13 | prerender pipeline, route checks, deploy workflow, docs, profile, test floors; the review fixes (D20 to D23) | T11: G17, G19, G23, G24, E1, E2, F1, A2 | `ship.md` "What changed" and "What the reviewers found" |

## Approach

Wave 1 changes what nothing else can be built on: the content module (facts, links, the MCP
section), the scanner's term list, and the workflow and served-file tests that stop expecting a
PDF. Wave 2 rebuilds the chrome and cards against the new data and adds the case-study links. Wave
3 brings docs, profile, the design-record test and the test floors in step. Because T16 adds
`resume` to the scanner while the wave-2 components still carry the word (six files, confirmed by
grep), G2 in `src/copyIsClean.test.js` is red between wave 1 and wave 2, as the original approach
allowed; T18's "Done when" turns it green. CI runs only on `main`, so no false green is possible.
Copy the mockups do not carry (the MCP section, the five-run tally sentence, the "1 of 5" card, the
R155 strings) is written verbatim in the spec and the owner approves it at G2 as he approved the
mockups; the Paddock paragraph, the at-a-glance values and the two outcomes rows are the mockup's
own (D50). Every T15 commit that writes "5 of 5", "1 of 5" or "40" cites the "G2: rejected" entries
of 2026-09-28 in `approvals.md` in its body as the source, by date, time (08:12 and 08:57 UTC) and
gate and never by commit hash, because D38 rewrites those hashes (D41, D42, D48, D51). No PDF is created,
copied or faked anywhere, including `docs/`; no task touches a protected or harness-guarded file.

## Files

| Action | Path | Purpose |
|--------|------|---------|
| modify (sensitive, T15) | `src/data/portfolioData.js`, `src/data/portfolioData.test.js` | facts, links, MCP section, removals (R138, R153, R154, R155) |
| modify (sensitive, T16) | `scripts/forbidden-copy.mjs`; modify `scripts/phone-redaction-scan.mjs`, `src/checkForbiddenCopy.test.js`, `src/checkPhoneRedaction.test.js` | term list with pattern terms for timing figures (D36) and Paddock retirement wording (D44), `.pdf` revert (R156, D30) |
| modify (sensitive, T20) | `.github/workflows/deploy.yml`; modify `src/deployWorkflowRoutePages.test.js`, `src/servedFiles.test.js`; delete `scripts/check-resume-pdf.mjs` (sensitive), `scripts/resume-pdf.mjs`, `src/checkResumePdf.test.js` | no PDF step, no PDF fetch, no PDF test (R143, R151) |
| modify (T18) | `src/components/SiteHeader.jsx` (+test), `HomeHero.jsx`, `ExperienceSection.jsx`, `ContactFooter.jsx` (+test), `src/pages/HomePage.jsx` (+test) | GitHub in the header, code line, no resume, footer Email and LinkedIn (R132, R133, R151, R152) |
| modify (T19) | `src/components/CaseStudyCards.jsx` (+test), `CaseStudyPage.jsx` (+test) | featured card as article with two links; `codeLink`; paragraph links (R134, R135, R136, R153, R154) |
| modify (sensitive, T21) | `scripts/check-test-floor.mjs`; modify `src/checkTestFloor.test.js`, `CLAUDE.md`, `.workhorse/profile.yml`, `docs/hosted-config.md`, `docs/sdlc/codebase-map.md`, `docs/design/redesign-2026-09/PORTFOLIO_REDESIGN_PLAN.md`, `docs/design/redesign-2026-09/CS-WorkHorse.dc.html`, `docs/design-brief.md`, `src/publicDirectory.test.js`, `src/redesignDocs.test.js`, 2026-09-11 ADR 0008 status line | docs, profile, the timing strings and the line 44 parenthetical withheld in place (D36, D45, D54), floors (R157, R159) |
| already on disk (designer, 2026-09-28, three rounds) | `docs/design/redesign-2026-09/PORTFOLIO_ALIGNMENT_PASS.md` (Appendices A and B and section 7 withheld; the tally row and the Paddock rows annotated with the owner's G2 answers), ADRs 0008 to 0010, ADR 0003/0004/0007/0009 status lines | design record (R157) |

## Waves

| Wave | Tasks | Files (disjoint within the wave) |
|------|-------|----------------------------------|
| 1 | T15, T16, T20 | data module and its test; scanner scripts and their tests; workflow, served-files test, PDF script deletions |
| 2 | T18, T19 | header, hero, experience, footer, home page and their tests; cards and case-study page and their tests |
| 3 | T21 | docs, profile, the plan copy and the WorkHorse mockup, design-record test, test floors |

No wave exceeds `build.max_parallel` (4). Ask-first paths, by task, so the G2 approval covers them
explicitly: T15 `src/data/portfolioData.js`; T16 `scripts/forbidden-copy.mjs`; T20
`.github/workflows/deploy.yml` and the deletion of `scripts/check-resume-pdf.mjs`; T21
`scripts/check-test-floor.mjs`. The G2 approval is the authorization for these four paths: once G2
is approved, the plugin's protect-paths hook allows an edit to a sensitive path that this plan or
the brief names without a prompt, and it sees only Edit, Write, MultiEdit and NotebookEdit calls,
never the shell deletion of `scripts/check-resume-pdf.mjs` (confirmed by reading
`hooks/scripts/protect-paths.js` lines 2 and 31 to 39). `.workhorse/profile.yml`, `CLAUDE.md` and
`scripts/phone-redaction-scan.mjs` are not on the profile's lists (confirmed lines 73 to 93). No
task touches a protected path or a harness-guarded filename. No `npm install`.

## Tasks

### Task 15: the content module (sensitive: src/data/portfolioData.js)
- Requirement(s): R138, R146, R153, R154, R155
- Files: `src/data/portfolioData.js`, `src/data/portfolioData.test.js`
- Parallel: yes
- Steps:
  1. Extend the failing test G14 in `portfolioData.test.js`: pin every R155 string, the R154 MCP paragraphs, the at-a-glance values (Paddock, Electron, 278 desktop tests, D44), the Paddock paragraph (the mockup's line 177, verbatim), the `measured` first and last paragraphs (five runs, the tally sentence in the mockup's neutral wording, D50; the closing sentence scoped to the first four runs, nine releases from those four, D41, D43, D47, D53), its four stat cards ("5 of 5", "40", "70", "1 of 5" with the R154 labels; 40 carries the mockup's label with no run scope, D51; the 70 label names the first four runs, D47, D53), the five table rows (the first and fourth as the mockup has them, "Live web app with auth" and "Test service", D50) and `contactHeading` (D39), the featured stats `100%`, `3 of 3`, `40`, `9` (D52; `28` if the owner's approval notes keep it, matching step 3 and G7) and the mobile tag "40 findings fixed pre sign-off" ("28 findings fixed pre sign-off" under the same fallback), D32 and the split stats (D32), `personal.repositories`, the absent keys, the paragraph-link "exactly once" rule, the no-users regex `/\b(users|customers|adopted|used by|team|teams|our)\b/i` and the no-percentage rule over the WorkHorse and Studbook strings, the rule that no `measured` paragraph, stat label or table cell matches `/\b(my|mine|client)\b/i` (R138, D50), and every R156 term including the timing and Paddock patterns imported from `scripts/forbidden-copy.mjs` (T16 exports them; until T16 folds, import what exists and expect the fold to turn the rest green), and the banned-word list with FastAPI removed and Kubernetes kept.
  2. Run it; confirm it fails on the old titles, the "4 of 4", "28" and "0" cards, the four-run sentences and the missing section.
  3. Rewrite the module per spec "Architecture" and R154, R155: remove `resumeFileName`, `secondaryCta`, `resumeLinkText`, `resumeButton`, `githubButton`, the featured `+52%` and `0` cards, "half the latency", the "2×" card, `callout.note`; set the featured card's third value to "40" (label unchanged) and its mobile tag to "40 findings fixed pre sign-off" (D52, unless the owner's approval notes keep 28); in `measured`, change "four" to "five" and rewrite the tally sentence exactly as R154 gives it (D41, D50), change the first card to "5 of 5", change the second card's value to "40" keeping its label "review findings fixed before a person signed off" (D51), relabel the 70 card with the R154 first-four-run label (D47, D53), replace the "0" card with "1 of 5" / "rejected at the ship gate, then reworked and merged" (D42), and rewrite the last paragraph as R154 gives it, opening "The first four runs each held the rules" and ending "nine plugin releases came out of those four runs." (D43, D47, D53); leave the first and fourth outcomes rows exactly as they are, "Live web app with auth: ..." and "Test service: ..." (D50: inside the `measured` block, its paragraphs, stat labels and table cells, never "My", "my own" or "mine"; the `mcp` paragraph (3) keeps "my own ship gate" and the five at-a-glance "My role" labels stay, D55; never a client name or hint anywhere in the module, its test, a fixture or a commit message); replace `contactHeading` (D39); keep the at-a-glance values and the Paddock paragraph as the mockup has them, adding ", with an MCP server for agents" to "What it is" and "FastAPI" to "Stack" (D44); add `repositories`, `codeLine`, `codeLink`, the `mcp` section, the fifth table row, the paragraph `link` fields (Studbook first mention, "Studbook repository" in `mcp`, "Paddock"). Every other string stays the mockup's. Never write "retired", "deprecated" or "dropped" about Paddock anywhere in the module.
  4. Green; no U+2013 or U+2014; lint green.
  5. Commit: `feat(content): align the copy with the resume, link the public snapshots and add the MCP section`, body citing the "G2: rejected" entries of 2026-09-28 in `approvals.md`, by date, time and gate (08:12 UTC for "5 of 5" and "1 of 5", 08:57 UTC for "40") and not by commit hash (D41, D42, D48, D51)
- Done when: G14 passes and the built route-order case in the same file still passes; `node scripts/check-forbidden-copy.mjs` finds no hit in the data file once T16 is folded.

### Task 16: scanner terms and the phone scanner's binary list (sensitive: scripts/forbidden-copy.mjs)
- Requirement(s): R129, R156
- Files: `scripts/forbidden-copy.mjs`, `scripts/phone-redaction-scan.mjs`, `src/checkForbiddenCopy.test.js`, `src/checkPhoneRedaction.test.js`
- Parallel: yes
- Steps:
  1. Write the failing cases: G3 (31 term fixtures: the timing one reading "the query took 1.5s", the Paddock one putting `Paddock` and `retired` in one sentence; none for `nine plugin releases`), E4 (the boundary, `2×`, `2x` near-miss, timing near-miss, `.css` skip, the two Paddock hits and the three Paddock near-misses, the releases sentence as a no-hit) and A3 (`2x faster` with an ASCII `x`) in `checkForbiddenCopy.test.js`; flip the `.pdf` case in `checkPhoneRedaction.test.js` to assert `BINARY_EXTENSIONS` equals `['.jpg', '.png', '.woff', '.woff2']` (D30). The built exit-2 cases in the same file stay as they are. Never write the figures D26 withholds into a fixture, a comment or a commit message: the pattern is the term (D36).
  2. Confirm each fails for its stated reason (term absent; `.pdf` present; `2x faster` unmatched; `1.5s` unmatched; the Paddock sentence unmatched).
  3. Extend `buildMatchers` to accept a term entry of the shape `{ label, pattern, skipExtensions }` (spec interface (h)) and to match `2x` on word boundaries; add the 16 R156 terms to `FORBIDDEN_TERMS` (14 strings, the "timing figure" pattern with `skipExtensions: ['.css', '.svg']`, and the "Paddock retirement wording" pattern: `paddock` and one of the R156 words in the same sentence, either order, case-insensitive) with a comment citing R156 and D24, D26, D36, D41, D42, D44; export both patterns by name for the data and design-record tests; remove `.pdf` and the D12/D17 comment from `BINARY_EXTENSIONS`.
  4. Green; lint green; `node scripts/check-forbidden-copy.mjs` reports no hit in `src/index.css` or `src/assets/react.svg`. Note: the real-tree scan in `src/copyIsClean.test.js` is now red until T18 lands (the word resume, the stale "4 of 4" card and "four real changes" sentence, the "half the latency" cell and the "2×" card in the data file until T15 folds); do not edit it.
  5. Commit: `feat(checks): ban the stale count, timing figures, resume wording and Paddock retirement wording; scan PDFs again`
- Done when: G3, E4, A3 and the `.pdf` case pass; the built cases in both files still pass; the script still runs under 2 s on `src/`.

### Task 20: workflow and served files without the PDF (sensitive: .github/workflows/deploy.yml, delete scripts/check-resume-pdf.mjs)
- Requirement(s): R143, R151
- Files: `.github/workflows/deploy.yml`, `src/deployWorkflowRoutePages.test.js`, `src/servedFiles.test.js`; delete `scripts/check-resume-pdf.mjs`, `scripts/resume-pdf.mjs`, `src/checkResumePdf.test.js`
- Parallel: yes
- Steps:
  1. Rewrite G20's two PDF cases in `deployWorkflowRoutePages.test.js` (no `check-resume-pdf.mjs` line, no "Resume PDF" step, the renamed smoke step fetching `og.png` only) and G18 in `servedFiles.test.js` (PNG and SVG cases as built; a new case that no `public/*.pdf` exists and `git ls-files` lists no `.pdf`; the PDF case removed). Deleting `checkResumePdf.test.js` with its scripts is legitimate at build time (the test-lock hook applies only in fix loops).
  2. Confirm G20 and G18 fail on the current workflow and test.
  3. Remove the D23 step (`deploy.yml` lines 113 to 114, confirmed) and the `fetch_and_check "resume PDF"` line (line 519, confirmed), rename the step to "Smoke R143: the share image is served", keep every `permissions:` block; delete the three files.
  4. Green; `src/deployWorkflowNodeVersion.test.js` and `src/checkTestFloor.test.js` still pass; lint green.
  5. Commit: `ci(deploy): drop the resume PDF check and fetch; serve no PDF`
- Done when: G18 and G20 pass; the three deleted files are gone; `grep -c pdf .github/workflows/deploy.yml` is 0.

### Task 18: header, hero, experience, footer and home page
- Requirement(s): R132, R133, R151, R152, R153
- Files: `src/components/SiteHeader.jsx`, `SiteHeader.test.jsx`, `HomeHero.jsx`, `ExperienceSection.jsx`, `ContactFooter.jsx`, `ContactFooter.test.jsx`, `src/pages/HomePage.jsx`, `HomePage.test.jsx`
- Parallel: yes
- Steps:
  1. Rewrite the failing cases G8 (`SiteHeader.test.jsx`: GitHub link on both routes and in the panel, no resume control; the built title case in that file stays), G12 (`HomePage.test.jsx` and `ContactFooter.test.jsx`: no resume control, footer links exactly email and LinkedIn, hero one button plus email link) and G6 (`HomePage.test.jsx`: the code line, the new role headings).
  2. Confirm each fails on the current components.
  3. Header: replace the Resume anchor in nav and panel with the external GitHub link (shared `secondaryButtonClasses`, `target="_blank"`, `rel="noopener noreferrer"`, `aria-label` naming the GitHub profile). Hero: drop the second button, render `hero.codeLine` as the aside's last line. Experience: drop the resume link and its prop. Footer: Email and LinkedIn only in both variants; drop `resumeHref` and the GitHub button. HomePage: drop `resumeHref`.
  4. Green; G2 (`copyIsClean.test.js`, unchanged) green again: no source file under `src/` carries the word resume; lint green.
  5. Commit: `feat(chrome): remove every resume control, add the header GitHub link and the code line`
- Done when: G6, G8, G12 pass and G2 is green with no test edit.

### Task 19: cards and case-study links
- Requirement(s): R134, R135, R136, R153, R154
- Files: `src/components/CaseStudyCards.jsx`, `CaseStudyCards.test.jsx`, `CaseStudyPage.jsx`, `CaseStudyPage.test.jsx`
- Parallel: yes
- Steps:
  1. Rewrite the failing cases G7 (`CaseStudyCards.test.jsx`: article, two anchors, no nesting, new stats), G10 and G11 (`CaseStudyPage.test.jsx`: code link, `#mcp`, no callout note, 5 rows, no "latency"; G10's Paddock status-word assertion runs for the `workhorse` slug only, since the Integration and Data Health pages carry "deprecated" and "dropped by about") and write G26 (`CaseStudyPage.test.jsx`: the four repository anchors, their attributes and names, the throw on a repeated `link.text`).
  2. Confirm each fails (nested anchors, missing code link, four rows).
  3. Cards: the featured card becomes an `<article>` holding the route `<Link>` on the title and "Read the case study", and a separate external "View the code" anchor (ADR 0009); grid cards unchanged. Page: render `caseStudy.codeLink` in the header meta row beside the eyebrow; extend the paragraph block to render `link` by splitting `text` around its single occurrence, throwing a readable error on zero or several occurrences; `Callout` already skips a missing note.
  4. Green; lint green; `npm run build` green and `node scripts/check-route-pages.mjs` exit 0 (the SSR render must not throw on the new blocks).
  5. Commit: `feat(case-studies): link the public snapshots from the cards and the WorkHorse page`
- Done when: G7, G10, G11, G26 pass.

### Task 21: docs, profile, design record and test floors (sensitive: scripts/check-test-floor.mjs)
- Requirement(s): R149, R157, R159
- Files: `CLAUDE.md`, `.workhorse/profile.yml`, `docs/hosted-config.md`, `docs/sdlc/codebase-map.md`, `docs/design/redesign-2026-09/PORTFOLIO_REDESIGN_PLAN.md`, `docs/design/redesign-2026-09/CS-WorkHorse.dc.html`, `docs/design-brief.md`, `docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/adr/0008-*.md`, `scripts/check-test-floor.mjs`, `src/checkTestFloor.test.js`, `src/publicDirectory.test.js`, `src/redesignDocs.test.js`
- Parallel: no
- Steps:
  1. Extend the failing cases G21 (`publicDirectory.test.js`: the overlay file and its three withheld notes, the nine withheld strings across nine files, the timing pattern imported from `scripts/forbidden-copy.mjs` over every line of the nine files with the `sub-10ms` and `48 ms` lines excepted, "withheld" in the plan copy's Studbook row, in its section 1 search paragraph and in the WorkHorse mockup, neither `that run is described as` nor `case study is also a failure` anywhere in the plan copy (D54), `4 of 4 real changes merged` still in the plan copy's WorkHorse row and `5 of 5` in the overlay's section 2 (D45), the design-brief pointer, no tracked `.pdf`) and G22 (`redesignDocs.test.js`: no `check-resume-pdf.mjs` in `CLAUDE.md` or the profile; "withdrawn" and "D24" in `retention_notes` and hosted-config 6a; no "hash log"; codebase-map "snapshot"; 2026-09-11 ADR 0008 status line "2026-09-28").
  2. Confirm each fails.
  3. Make the R159 and R157 edits, exactly these lines so the reviewer can diff them: `CLAUDE.md` line 27 ("copy, metrics and case studies", no "resume content") and line 51 (drop `scripts/check-resume-pdf.mjs`); `.workhorse/profile.yml` line 56 (the style note loses "and resume content"), line 93 (the `check-resume-pdf.mjs` entry removed from `sensitive_paths`), line 162 (`retention_notes`: the "Change 2026-09-25 (D17) widened this in two ways" sentence loses its resume-PDF clause and gains "the resume PDF planned by D17 was withdrawn on 2026-09-28 (D24) and never published"; the prerendering and served-email clause stays word for word) and line 168 (the `2: [` list loses its last entry, `scripts/check-resume-pdf.mjs`); nothing else in either file changes. Hosted-config 6a rewritten as a dated withdrawal note (keep the served-email sentence); codebase-map bullet (the withdrawal, the repository links, Paddock unchanged); the plan copy's Studbook row (the rerank-speed phrase replaced by one withheld note; the WorkHorse row stays verbatim, D45) and the parenthetical that ends its line 44, from its opening bracket to the end of the line, replaced by "(One note about a search term withheld from the committed copy, D54.)" with the search list before it unchanged and no other byte of the file touched; never quote the removed parenthetical in the commit body; the WorkHorse mockup's two timing strings replaced in place by withheld notes in the same elements (the "half the latency" cell text and the rerank-speed card; the tally sentence, "4 of 4" card, "0" card and releases sentence stay as the owner wrote them), no other byte of any mockup changed (D36, D45); design-brief pointer to the overlay; the ADR status line. Then run `npm test -- --reporter=json --outputFile.json=vitest-results.json`, re-sync every `PINNED_SUITES` count to its fresh passed count (never lower than a suite's count before this revision unless a case was removed by design and named in the commit body), mirror the constants in `checkTestFloor.test.js` (D20 precedent), record N1 and N2 in the commit body.
  4. Green; `node scripts/check-test-floor.mjs vitest-results.json` exit 0; lint green.
  5. Commit: `docs(sdlc): record the resume withdrawal and the public snapshots; re-sync the test floors`
- Done when: G21, G22 pass; the floor script exits 0; N1, N2 recorded; `git diff --stat` on the six other mockups is empty.

### Task 22: checks people run (not a builder session)
- Requirement(s): R146, R148, R153, R155, R158
- Owner: the main session, the shipper, then the owner at G4. M1, M2, M3 (pre-merge half), M4 and N4 recorded in `ship.md`; M5, the side-by-side site-versus-resume list, written into `ship.md` in full by the shipper (R158) with every site-only WorkHorse claim flagged "site only, not on the resume" (at least Paddock as a current desktop app, Electron, 278 desktop tests, 224 plugin tests, "CI on every push", the FastAPI and MCP-server clauses, "5 of 5", "1 of 5", 40, 70, nine releases; D46, D51) and confirmed by the owner. Post-merge halves of M3 after the owner's merge.

## Verification plan

Profile commands: `npm ci` (lockfile unchanged; run anyway), `npm run lint`, `npm test`, `npm run build`, `npm audit --omit=dev --audit-level=high`. Then on the built tree: `node scripts/check-built-css-fonts.mjs`, `node scripts/check-route-pages.mjs`, `node scripts/check-forbidden-copy.mjs dist`, `node scripts/check-phone-redaction.mjs dist` and the same script with no argument on the repository (local only; the CI guard against a committed PDF is the `git ls-files` case in G18 and G21 inside `npm test`), `node scripts/check-test-floor.mjs vitest-results.json`; N1 timed. Evals G1 to A3 run inside `npm test` (32 automated cases: 23 golden, 4 edge, 2 failure, 3 adversarial, after the 2026-09-28 eval review cut G9 and added A3; N1 and N2 measured alongside); M1 to M5 and N4 are listed as not verified until a person records them in `ship.md`. Expected: green with no known gap, because the only prior red (the PDF) is withdrawn. Evidence the owner sees: the verification report, the numbers-per-page list, the side-by-side claims list, the Lighthouse scores, the local preview (`npm run build` then `npm run preview`). The live smoke halves are proved by the first deploy after the owner merges.

## Rollback

Dev: `git checkout main`. Production: nothing deploys until the owner merges; if the deployed site is wrong, `git revert` the merge commit on `main` and push, which redeploys the previous site within minutes. No schema, no data, no migration. The revision's deletions (the PDF scripts) come back with the revert.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| The MCP section or a R155 string, written in the spec without a mockup, does not read the way the owner wants | Medium | Copy edit after G2 | The strings are in the spec verbatim for the G2 approval; the owner can change any of them in the approval notes and T15 pins whatever he approves |
| A copy edit repeats a paragraph's `link.text` and the SSR build throws | Low | Build fails | G14 pins the "exactly once" rule; G26 proves the throw is readable |
| G2 red between wave 1 and wave 2 confuses a builder | Certain | A misleading red | Stated in Approach and in T16 step 4; T18 owns turning it green |
| The timing pattern, the Paddock pattern or `2x` later matches legitimate copy (a decade, a Tailwind class, a stylesheet duration, "dropped by about 40%" on another page) | Low | A false red on a future edit | The timing pattern needs a unit word or a decimal, the Paddock pattern needs the word in the same sentence as Paddock, `2x` needs word boundaries, `.css` and `.svg` are skipped; E4 covers each near miss; the owner extends or trims the list |
| "5 of 5", "1 of 5" and "40" have no source in the repository other than the owner's rejection entries, and go stale after his next run | Certain | A count the owner must maintain by hand | T15's commit body cites the "G2: rejected" entries of 2026-09-28 by date, time and gate (D48, D51); M4 lists all three with their source; the owner edits the content file himself after the next run (`CLAUDE.md` conventions) |
| A builder or a later edit writes ownership or client wording into the run record (run 1 is private client work, D50), or the design record keeps tying a named app to run 1 | Low | A confidentiality slip on a public site | G14 rejects `my`, `mine` and `client` in the `measured` block; the rows are the mockup's verbatim; no agent writes a client name. What the repository carries, confirmed by search: one scanner term naming an app, in 14 files here and 12 on `main` (D54); T21 redacts the one place, the plan copy's line 44, that ties it to run 1, and G21 asserts it; the build commits since 781970f and `main` keep the text (D38); the owner says at G2 whether that name is the client, and a follow-up change replaces the term if so; M5 is the backstop |
| The Paddock pattern misses a synonym (archived, sunset, shelved, legacy, former, no longer maintained) or a status split across two sentences (audit low, not fixed) | Low | A status word reaches the site | M5 is the backstop: the shipper reads every Paddock sentence; the owner may extend the word list in `scripts/forbidden-copy.mjs` after this change |
| A sensitive-path edit lands with no prompt because G2 names the path | Certain | The approval is the only authorization | The four paths are listed per task above and in the brief, so the owner approves them knowingly; the reviewers diff each |
| The history rewrite (D38) is skipped and fa41dca is pushed with the unredacted overlay | Low | Resume text and figures in the public PR history | "Before Build" names the conductor and the moment; the shipper's push is after Build, so the conductor log entry is checkable first |
| The re-synced floors drop a pin below its previous count | Low | A weaker CI floor | T21 must name any intentional drop in its commit body; the reviewers check the diff |
| Agent budget of 90 minutes at tier 2 already exceeded (324 minutes at this round, `wh.js clock`) | Certain | Clock report over budget | Stated in the brief; the revision is six builder tasks by decision D28 |

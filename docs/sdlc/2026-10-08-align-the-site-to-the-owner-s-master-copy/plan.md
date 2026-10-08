# Plan: Align the site to the owner's master copy

Change id: `2026-10-08-align-the-site-to-the-owner-s-master-copy`
Spec: [spec.md](./spec.md)
Branch: `wh/2026-10-08-align-the-site-to-the-owner-s-master-copy`
Worktree: `C:\Users\alqai\Portfolio` (builders get their own worktree per wave)

## Approach

Four tasks in two waves. Wave 1 changes what the site says (the data module and its pins, plus
the share-image source) and, in parallel, the two renderer features the new copy needs (the
gate marker and the section subtitle), each proven with stubs so neither task waits on the
other. Wave 2 proves the result on every served route and, in parallel, extends the scanner so
the removed wording cannot return. The scanner lands after the copy on purpose: the real-tree
scan inside `npm test` would be red on a branch that bans "via" before "via TCS" is gone
(change 2026-09-29 ADR 0003, same reasoning, confirmed by reading `src/copyIsClean.test.js`).
Every string a builder writes is quoted in `spec.md` "Data"; the builder copies, never composes.

Ask-first paths this plan edits: `src/data/portfolioData.js` (sensitive: employer-derived
claims) and `scripts/forbidden-copy.mjs` (sensitive, tier floor 2). The owner's request and his
G2 approval of the brief are the ask. Not edited: `index.html`, `src/pageMeta.js`,
`scripts/prerender.mjs`, `package.json`, any workflow (spec D14). No protected path and no
harness-guarded filename is touched. `public/og.png` is never written by a builder (D13).

## Files

| Action | Path | Purpose |
|--------|------|---------|
| modify | `src/data/portfolioData.js` | every copy change in spec "Data" (ask-first) |
| modify | `src/data/portfolioData.test.js` | pins for every changed string; E1 to E9, E17 |
| modify | `docs/design/og.svg` | "Tickets a day" label and aria-label (R8) |
| modify | `src/components/CaseStudyFlowDiagram.jsx` | `data-gate` on gate steps, no note span without a note (R5) |
| modify | `src/components/CaseStudyFlowDiagram.test.jsx` | E10 |
| modify | `src/components/CaseStudyPage.jsx` | optional `section.subtitle` paragraph (R9) |
| modify | `src/components/CaseStudyPage.test.jsx` | E11 |
| create | `src/masterCopy.test.jsx` | route-level proof over the rendered HTML of all seven routes; E12 to E16 |
| modify | `scripts/forbidden-copy.mjs` | eighteen new terms with reasons (R12, ask-first) |
| modify | `src/checkForbiddenCopy.test.js` | E18 to E23, E25, E27; fixture list extended |
| modify | `src/main.jsx` | comment "Bundled typefaces" (D8) |
| modify | `src/index.css` | comment "Bundled families" (D8) |

## Tasks

### Task 1: Put the owner's copy into the data module and pin it (touches the sensitive path `src/data/portfolioData.js`)

- Requirement(s): R1, R2, R4, R6, R8, R9 (data part), R10, R11, R3 (data part)
- Cases: E1 to E9, E17, E28, E29
- Files: `src/data/portfolioData.js`, `src/data/portfolioData.test.js`, `docs/design/og.svg`
- Parallel: yes (wave 1)
- Steps:
  1. Write the failing tests in `src/data/portfolioData.test.js`, one `it` per case, quoting the strings from `spec.md` "Data" exactly: E1 (hero), E2 (decision study, every field), E3 (six-step flow), E4 (integration situation; update the R160 eyebrow pin), E5 (stat 1, "Right now", principle 01, Apple bullet and company, toolkit AI; update `pinnedToolkit`), E6 (WorkHorse at-a-glance, closing paragraph, `studbook.subtitle`; update `pinnedCaseStudyNarratives.workhorse` and `pinnedMeasuredLastParagraph`), E7 (incident "on each group"; update the R162 and R169 pins), E8 (employer slots), E9 (the document's item 1 and 2 list as regexes over all strings), E17 (decision numerals), E28 (read `docs/design/og.svg` with `fs`: aria-label, stat label, no "Tickets decided"), E29 (Neural step 5 note "Live status over WebSockets"; no flow note matches `/\bvia\b/i`). Update `pinnedCaseStudyNarratives` for the decision, integration and data-health eyebrows and the decision title, lead, at-a-glance and callout; update the R161 case for the new situation opening, title and principle 01.
  2. Run `npm test -- src/data/portfolioData.test.js`; confirm every new or updated case fails on the old string, not on a syntax error.
  3. Edit `src/data/portfolioData.js` per spec "Data": hero; "Right now"; stat 1; principle 01; experience role 0; toolkit AI; WorkHorse three substitutions and `subtitle`; the decision study in full (section id `why-a-person-decides`, "That line is deliberate" per D18); integration eyebrows and second situation paragraph; data-health eyebrows and "on each group"; Neural "over WebSockets". Update the file's header comment to name this change and the document. Edit `docs/design/og.svg` line 20 and line 82.
  4. Run the file's tests green, then `npm test` (the existing "matches no R156 term" case and `src/copyIsClean.test.js` must stay green: the new copy contains no existing term, checked in spec "Data"), `npm run lint`, `npm run build`.
  5. Commit: `feat(copy): align the hero, employer line and decision case study to the owner's master document`
- Done when: every case E1 to E9, E17, E28 and E29 passes, the full suite, lint and build are green, and `grep -c "via TCS\|decides approve\|plugin\|messy\|Ollama\|self-hosted\|decision system\|Tickets decided" src/data/portfolioData.js docs/design/og.svg` prints 0 for both files.

### Task 2: Mark gate steps and render section subtitles

- Requirement(s): R5 (renderer part), R9 (renderer part)
- Files: `src/components/CaseStudyFlowDiagram.jsx`, `src/components/CaseStudyFlowDiagram.test.jsx`, `src/components/CaseStudyPage.jsx`, `src/components/CaseStudyPage.test.jsx`
- Parallel: yes (wave 1)
- Steps:
  1. Write the failing test E10 in `CaseStudyFlowDiagram.test.jsx` with stub steps: `data-gate="true"` and `bg-ink` on the gate `<li>` only; one child span for a step with no `note`. Write E11 in `CaseStudyPage.test.jsx` using the file's existing `vi.doMock('../data/portfolioData', ...)` pattern with a cloned data object where one section has `subtitle: 'Stub subtitle'`: the text renders once as the element right after that section's h2, and a section without `subtitle` has its first block right after the h2.
  2. Run both files; confirm E10 fails on a missing attribute and E11 on missing text.
  3. In `CaseStudyFlowDiagram.jsx`: add `data-gate={step.gate ? 'true' : undefined}` to the `<li>`; render the note span only when `step.note` is set. In `CaseStudyPage.jsx` `CaseStudySection`: after the h2, `{section.subtitle && <p className="text-base text-muted sm:text-lg">{section.subtitle}</p>}`. Update each file's doc comment for the new field.
  4. Run both files green, then `npm test`, `npm run lint`.
  5. Commit: `feat(case-study): mark human-gate flow steps and render an optional section subtitle`
- Done when: E10 and E11 pass, every existing flow and page test still passes, and the full suite and lint are green.

### Task 3: Prove the copy on every served route

- Requirement(s): R1, R3, R5, R7, R13 (route parts)
- Files: `src/masterCopy.test.jsx` (new)
- Parallel: yes (wave 2; depends on tasks 1 and 2)
- Steps:
  1. Write `src/masterCopy.test.jsx` following `src/prerenderIntegration.test.js`: for each path in `sitePagePaths()`, `render(`/Portfolio${path}`)` from `./entry-server.jsx` and `assemblePage(SHELL_HTML, { headHtml: headTags(pageMetaFor(path)), appHtml })`. Cases: E12 (parse the decision page's `#built` list with jsdom or a regex over the `<li` tags: six items, one `data-gate="true"`, sixth, text "Reviewer decides"; whole page has one `data-gate`), E13 (count each full cross-reference sentence per route), E14 (home head tags equal the escaped lead; h1 equals the document h1; no `<noscript`), E15 (the document's item 1 and 2 list as regexes over every route's full HTML; cross-team absent on the integration route and present on the decision route), E16 (throughput sentence present; no `%`, no `/accura/i`, no authority regex match on the decision route's text with tags stripped), E30 (the Studbook subtitle occurs once on the WorkHorse route, as the `<p>` right after the Studbook `<h2>`, and nowhere else), E31 (`data-gate` count summed over all seven routes is 1, on the decision route).
  2. Run the file against the merged wave 1 branch; every case must pass immediately because wave 1 supplied the data and the marker. Confirm the cases are real by temporarily asserting the old h1 in E14 and seeing it fail, then restore (do not commit the probe).
  3. Run `npm test`, `npm run lint`.
  4. Commit: `test(copy): prove the master-copy strings, gate and cross-references on every served route`
- Done when: E12 to E16, E30 and E31 pass, the probe in step 2 failed as expected, and the full suite is green.

### Task 4: Extend the forbidden-copy scanner (touches the sensitive path `scripts/forbidden-copy.mjs`)

- Requirement(s): R3, R12, R14 (floor)
- Files: `scripts/forbidden-copy.mjs`, `src/checkForbiddenCopy.test.js`, `src/main.jsx`, `src/index.css`
- Parallel: yes (wave 2; depends on task 1)
- Steps:
  1. Write the failing tests in `src/checkForbiddenCopy.test.js`: E18 (via boundary), E19 (vendor forms), E20 (decision-authority phrases and near-misses), E21 (plugin, messy, self-hosted, Ollama, eleven times, zero rejected; delete the case "does not match nine plugin releases ..." and replace it with the hit assertion), E22 (extend `ONE_FILE_PER_TERM_RENDERING` with one fixture per new term; change `rejected-ship.txt` to "no rejected ship documents"), E23 (real `src/data/portfolioData.js`, `src/main.jsx`, `src/index.css`, `docs/design/og.svg` scan clean), E25 (the vendor string put back in a fixture copy named `src/data/portfolioData.js` under a temp root: exit 1, `via` and `TCS` lines with the line number), E27 (mixed case and non-breaking space).
  2. Run the file; confirm E18 to E21, E25 and E27 fail because the terms do not exist yet, and E22 fails on the matcher count.
  3. Edit `scripts/forbidden-copy.mjs`: add the string and pattern terms named in spec "Interfaces" to `FORBIDDEN_TERMS`, each preceded by a one-line comment naming the document rule (section 1 vendor rule, section 1 plugin rule, section 2 messy rule, section 3 removal rows, section 5 Studbook stack, item 1 list, owner D4 for "eleven times"); extend the file's header comment with this change's id. No `g` or `y` flag on any pattern (the file's existing rule). Reword `src/main.jsx` line 4 to "Bundled typefaces" and `src/index.css` line 3 to "Bundled families".
  4. Run the file green (the existing timing case, N2, must still pass with the longer term list); run `npm test` (N1; E23 and `src/copyIsClean.test.js` prove the real tree is clean); `npm run build && node scripts/check-forbidden-copy.mjs dist` (N3, E24) exit 0; `npm test -- --reporter=default --reporter=json --outputFile.json=vitest-results.json && node scripts/check-test-floor.mjs vitest-results.json` (E26) exit 0; delete `vitest-results.json` (untracked). `npm run lint` and `npm audit --omit=dev --audit-level=high` (N4) exit 0.
  5. Commit: `feat(scanner): ban the vendor, plugin, messy and decision-authority wording the owner removed`
- Done when: E18 to E27 pass, the dist scan and the test floor exit 0, and `git status` shows no stray report or `dist/` file staged.

## Waves

| Wave | Tasks | Files | Parallel |
|------|-------|-------|----------|
| 1 | T1, T2 | T1: `src/data/portfolioData.js`, `src/data/portfolioData.test.js`, `docs/design/og.svg`; T2: `src/components/CaseStudyFlowDiagram.jsx`, `src/components/CaseStudyFlowDiagram.test.jsx`, `src/components/CaseStudyPage.jsx`, `src/components/CaseStudyPage.test.jsx` | yes, file-disjoint, 2 of 4 builders |
| 2 | T3, T4 | T3: `src/masterCopy.test.jsx`; T4: `scripts/forbidden-copy.mjs`, `src/checkForbiddenCopy.test.js`, `src/main.jsx`, `src/index.css` | yes, file-disjoint, 2 of 4 builders |

## Verification plan

Profile commands, all run by the verifier at the merged head: `npm run lint`, `npm test` (N1), `npm run build` (N3), `npm audit --omit=dev --audit-level=high` (N4). Then `node scripts/check-forbidden-copy.mjs dist` (E24) and the test floor (E26). Eval coverage: 20 golden, 8 edge, 2 failure, 1 adversarial, 4 non-functional, every one named in exactly one task above; E24 and E26 and N1 to N4 are commands the verifier runs and records with exit codes. Evidence the owner sees in the ship document: the suite count, the scanner's `files scanned` line for `src/` and for `dist/`, the prerender line, and a grep table of the seven `dist/**/index.html` files for the h1, the two cross-reference sentences and the `data-gate` count, with the side-by-side claims list the request assigns to the shipper (document item 16).

Not machine-checkable, carried to the ship document for the owner: item 7 (read the two situation sections back to back), item 13's rendering at 390, 768 and 1440px (the word-for-word half is the hero cases in tasks 1 and 3), item 8 (repository links return 200 in a signed-out browser; unchanged links, last confirmed in change 2026-09-29), and the `public/og.png` re-render (D13).

## Rollback

Dev: `git revert` the four commits in reverse order; no data exists to migrate. Production (GitHub Pages): the site is whatever `main` last built; reverting the merge commit on `main` and pushing republishes the previous copy within the deploy workflow's run time. If only the share image is wrong, re-render `public/og.png` from the reverted `og.svg` and push; the HTML does not need to change. No down migration, no retained state.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| A builder paraphrases a document string | Medium | The site drifts from the resume, the exact thing the change exists to stop | Every string is quoted in `spec.md`; the data tests pin each one; the route tests pin the served HTML |
| The owner rejects one of the assembled strings (D10, D6) or the "line" substitution (D18) at G2 | Medium | One designer round | Each is its own decision row with the alternative stated; a rejection changes one string and its pin |
| `public/og.png` ships stale | Medium | Link previews keep "Tickets decided a day" | D13 names the re-render as a human step before merge; the ship document records the commit |
| A new scanner term hits legitimate text somewhere not grepped | Low | A red CI run naming the line | The grep in spec "Failure modes" covered the whole default scope; the hit message names the file and term, one edit fixes it |
| The owner's document conflicts with his four decisions in a place this plan missed | Low | A wrong string reaches G2 | The brief lists every departure from the document (D1 to D4, D18); the owner reads the brief, not the document |

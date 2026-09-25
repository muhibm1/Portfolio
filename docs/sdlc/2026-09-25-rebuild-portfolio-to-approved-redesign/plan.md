# Plan: rebuild the portfolio to the approved redesign

Change id: `2026-09-25-rebuild-portfolio-to-approved-redesign`
Spec: [spec.md](./spec.md)
Branch: `wh/2026-09-25-rebuild-portfolio-to-approved-redesign`
Worktree: one per builder under `.claude/worktrees/`, folded by rebase (`build.wave_merge`)

## Approach

Wave 1 lays the foundations nothing else can be built without: tokens and typefaces, the rewritten content module, the forbidden-copy scanner, and the committed design record. Wave 2 builds the shared chrome, the case-study cards and the case-study template against that data. Wave 3 assembles the home page, the work index and the page metadata, and deletes the last old components. Wave 4 replaces the build's shell copies with prerendered pages and rewrites the deploy workflow. Wave 5 brings the docs and the profile in step. Because the data module changes in wave 1 while old components still read the old keys, tests in files owned by waves 2 and 3 are red until those waves land; each task's "Done when" names its own files green plus `npm run lint`, and the whole suite is green from wave 3 on. CI runs only on `main`, so no false green is possible. Copy comes from the mockups word for word into `src/data/portfolioData.js`, never inline in a component (ADR 0006). Between waves 1 and 3 the main session renders `public/og.png` from `docs/design/og.svg` (D4) and the owner adds `public/Muhammad_Muhibullah_Resume.pdf` (D2); if either is absent when wave 3 runs, T10's test stays red and is reported as that blocker, never edited.

## Files

| Action | Path | Purpose |
|--------|------|---------|
| modify (sensitive, T1) | `package.json`, `package-lock.json` | swap fontsource families, drop `thinking-orbs`, pin `react` and `react-dom` to `19.3.0` (R131, R147, D19) |
| modify (T1) | `src/main.jsx`, `src/index.css`; create `src/components/buttonClasses.js` | weight imports, tokens, focus ring, shared button classes (R130, R148) |
| modify (sensitive, T2) | `src/data/portfolioData.js` | the whole content module (R127, R132 to R138, ADR 0006) |
| create, modify (T3) | create `scripts/forbidden-copy.mjs`, `scripts/check-forbidden-copy.mjs`; modify `scripts/phone-redaction-scan.mjs` (existing, not ask-first: confirmed absent from the profile's lists) | scanner library and entry (R129, ADR 0004); `.pdf` skipped by design (R137, D16) |
| move, create, delete (T4) | the seven mockups to `docs/design/redesign-2026-09/` and a redacted copy of the plan beside them (D18); `docs/design/og.svg`; delete `portfolio-redesign-handoff.zip` and the original folder from the working tree; modify `docs/design-brief.md` | design record and share-image source (R141, R144) |
| create, modify, delete (T5) | create `src/components/SiteHeader.jsx`; modify `SiteLayout.jsx`, `ContactFooter.jsx`; delete `Navbar.jsx`, `ResumeModal.jsx`, `src/hooks/useClipboardCopy.js` and their tests | chrome (R133, R137) |
| create (T6) | `src/components/CaseStudyCards.jsx` | featured card and grid (R132, R134) |
| create, modify (T7) | create `CaseStudyTable.jsx`, `ContactBand.jsx`; modify `CaseStudyPage.jsx`, `CaseStudyFlowDiagram.jsx` | template (R135, R136) |
| create, modify, delete (T8) | create `HomeHero.jsx`, `ProductionStats.jsx`, `HowIWork.jsx`, `ExperienceSection.jsx`, `Toolkit.jsx`; modify `src/pages/HomePage.jsx`; delete `Hero`, `FdePhilosophy`, `CaseStudiesSection`, `InteractiveTriageSimulator`, `ExperienceTimeline`, `SkillsMatrix`, `ThinkingOrbHero`, `ProjectEntry` (`.jsx` and `.test.jsx`), `orbDrawing.js` and its test | home page and removals (R128, R132) |
| modify (T9) | `src/pages/WorkIndexPage.jsx`, `src/pages/NotFoundPage.jsx` | index and not-found (R134) |
| create, modify (T10) | create `src/pageMeta.js`; modify `src/components/SiteLayout.jsx` (wire `usePageTitle` to `pageMetaFor`) | titles, descriptions, canonical, OG, client-side title (R139, R141) |
| create, modify (sensitive, T11) | create `src/entry-server.jsx`, `scripts/prerender.mjs`; modify `index.html`, `vite.config.js`, `package.json` (build script), `scripts/route-pages.mjs`, `scripts/check-route-pages.mjs`, `src/main.jsx` | prerender pipeline (R140, R142, R147, ADR 0001) |
| modify (sensitive, T12) | `.github/workflows/deploy.yml` | pin list with `react` and `react-dom` (D19), scanner step, R80 narrowed to asset tags (D14), R82 counts on every smoked page (D15), marker smoke (R143) |
| modify (T13) | `CLAUDE.md`, `.workhorse/profile.yml` (six ask-first paths, `retention_notes` for the PDF and the served email, D17), `docs/hosted-config.md`, `docs/sdlc/codebase-map.md`, `docs/sdlc/constraints.md`, `scripts/check-test-floor.mjs` (two new pinned suites), status lines of 2026-09-11 ADRs 0007 and 0008 and 2026-09-21 ADRs 0001 and 0003 | docs and profile (R145, R149) |
| tests | one `*.test.jsx` next to each component above; `src/designTokens.test.js`, `fonts.test.js`, `checkForbiddenCopy.test.js`, `copyIsClean.test.js`, `pageMeta.test.js`, `servedFiles.test.js`, `entryServer.test.jsx`, `hydration.test.jsx`, `prerender.test.js`, `prerenderIntegration.test.js`, `buildPipeline.test.js`, `redesignDocs.test.js`; rewrites of `portfolioData.test.js`, `routePaths.test.jsx`, `routePages.test.js`, `checkRoutePages.test.js`, `routes.test.jsx`, `publicDirectory.test.js`, `deployWorkflowRoutePages.test.js` | evals G1 to A2 |
| supplied by people | `public/og.png` (main session, D4), `public/Muhammad_Muhibullah_Resume.pdf` (owner, D2) | never written by a builder |

## Waves

| Wave | Tasks | Files (disjoint within the wave) |
|------|-------|----------------------------------|
| 1 | T1, T2, T3, T4 | manifest and styles; data module; scanner scripts; docs/design |
| 2 | T5, T6, T7 | chrome; cards; case-study template |
| 3 | T8, T9, T10 | home page and deletions; work index and not-found; page meta, served files, layout title wiring and `SiteHeader.test.jsx` |
| 4 | T11, T12 | prerender pipeline and route tests; deploy workflow |
| 5 | T13 | docs, profile, test-floor pins |

No wave exceeds `build.max_parallel` (4). Sensitive paths, by task: T1 `package.json`, `package-lock.json` (and `npm install` is an ask command); T2 `src/data/portfolioData.js`; T11 `index.html`, `vite.config.js`, `package.json`, `scripts/route-pages.mjs`, `scripts/check-route-pages.mjs`; T12 `.github/workflows/deploy.yml`. `scripts/phone-redaction-scan.mjs` (T3) is not on either list (confirmed, profile lines 73 to 86 and 161). No task touches a protected path or a harness-guarded filename.

## Tasks

### Task 1: typefaces, tokens and button classes (sensitive: package.json, package-lock.json)
- Requirement(s): R130, R131, R147, R148
- Files: `package.json`, `package-lock.json`, `src/main.jsx` (imports only), `src/index.css`, `src/components/buttonClasses.js`, `src/designTokens.test.js`, `src/fonts.test.js`
- Parallel: yes
- Steps:
  1. Write failing tests: `src/fonts.test.js` (G5: exact fontsource pins, `react` and `react-dom` both exactly `19.3.0`, absent packages, the seven weight imports, and `index.html`/`main.jsx`/`package.json` carry neither `fonts.googleapis.com` nor `fonts.gstatic.com`) and `src/designTokens.test.js` (G4: twelve hex tokens, three stacks, `:focus-visible`, no orb keyframes; G13: nine contrast ratios at least 4.5 computed from the parsed hex, `min-h-12` and `min-h-11` in `buttonClasses.js`).
  2. Run them; confirm each fails on the missing package, token or file.
  3. Edit `package.json` per ADR 0002 (versions `5.3.0`, OFL-1.1) and change `react` and `react-dom` from `^19.2.8` to `19.3.0`, the version the lockfile already resolves (D19; no version change, only the range), run `npm install` to refresh the lockfile, replace the import block in `main.jsx`, rewrite the `@theme` and base layers of `index.css`, add `buttonClasses.js` exporting the primary, secondary, on-dark and nav-link class strings.
  4. Green; `npm run lint` green; `npm run build` green (old components still build against the old data).
  5. Commit: `feat(design): self-host IBM Plex and Space Grotesk and declare the redesign tokens`
- Done when: G4, G5, G13 pass; `node scripts/check-built-css-fonts.mjs` exits 0 after a build.

### Task 2: the content module (sensitive: src/data/portfolioData.js)
- Requirement(s): R127, R132, R135, R138, R146
- Files: `src/data/portfolioData.js`, `src/data/portfolioData.test.js`, `src/routePaths.test.jsx`
- Parallel: yes
- Steps:
  1. Write failing tests: G1 in `routePaths.test.jsx` (seven paths in order; keep the existing R118 rejection cases) and in `portfolioData.test.js`; G14 in `portfolioData.test.js` (the edX bullet and banned skill words, and the pinned stats, dates, toolkit lists copied verbatim from plan section 6 and the mockups; every block `type` in the ADR 0006 set; no `projects`, `demos`, `telemetry`, `philosophy` key).
  2. Confirm they fail on the old shape.
  3. Rewrite the module: `personal`, `home`, five `caseStudies` in plan order with `card`, `atAGlance`, `stats`, `intro`, `sections` of blocks, `callout`, `disclaimer` where the mockup has it, `contactHeading`. Every string is the mockup's; the home mobile variants live beside their desktop strings. No dash characters.
  4. Green; `node scripts/check-forbidden-copy.mjs` (from T3, once merged) exits 0 on the data file; lint green.
  5. Commit: `feat(content): rewrite the content module to the approved plan and mockups`
- Done when: G1, G14 pass and the file contains no U+2013 or U+2014.

### Task 3: forbidden-copy scanner
- Requirement(s): R129
- Files: `scripts/forbidden-copy.mjs`, `scripts/check-forbidden-copy.mjs`, `src/checkForbiddenCopy.test.js`, `scripts/phone-redaction-scan.mjs`, `src/checkPhoneRedaction.test.js`
- Parallel: yes
- Steps:
  1. Write failing spawn tests on temp fixtures: G3 (seventeen term files, clean file), E4 (word boundaries, "Unauthorized" caught case-insensitively, U+2013 and `&mdash;`, skipped `.test.jsx`), F2 (missing `dist`, zero files); in `checkPhoneRedaction.test.js` one unit test that `BINARY_EXTENSIONS` contains `.pdf` (D16, no eval id: the case cap is full).
  2. Confirm they fail because the script does not exist and `.pdf` is absent.
  3. Implement per ADR 0004 and spec interface (e), entry file split from the library like `scripts/check-phone-redaction.mjs`; default scope `src/` minus tests plus `index.html` and `docs/design/og.svg`. Add `.pdf` to `BINARY_EXTENSIONS` with a one-line comment naming D12 and D17 as the compensating check. Note for the builder: the term list carries the invented names `Apple Geo Ingest`, `dataops-service`, `GEO-92841`; they are already in the tree (constraints "Business constraints" 2), so this is not new exposure (audit low 7).
  4. Green; lint green.
  5. Commit: `feat(checks): add the forbidden-copy scanner and skip PDFs in the phone scan`
- Done when: G3, E4, F2 and the `.pdf` test pass; the script runs under 2 s on `src/`.

### Task 4: design record and share-image source
- Requirement(s): R141, R144
- Files: `docs/design/redesign-2026-09/**` (moved), `docs/design/og.svg`, `docs/design-brief.md`, `src/publicDirectory.test.js`; delete `portfolio-redesign-handoff.zip`
- Parallel: yes
- Steps:
  1. Add G21 to `publicDirectory.test.js` (including the six withheld strings absent from the committed plan); confirm it fails on the missing folder.
  2. Copy the seven mockups verbatim; write the plan copy with the section 5 WorkHorse figures (plan line 111) and the section 8 resume note (line 164) each replaced by one line naming what was withheld and why (D18, ADR 0007); grep the mockups for the same six strings (none expected; confirmed today) and stop and report if any is found; delete the zip and the original folder from the working tree (the owner keeps his copy), add the pointer line to `design-brief.md`, write `og.svg` (1200 by 630, tokens, name, "Forward Deployed Engineer", "30 to 350+" and its label, fonts by relative `@font-face` with a system fallback).
  3. Green.
  4. Commit: `docs(design): commit the redesign handoff and the share-image source`
- Done when: G21 passes; `git ls-files` shows the eight handoff files and no `.zip`.

### Task 5: header, layout and footer
- Requirement(s): R133, R137, R148
- Files: `src/components/SiteHeader.jsx` (+test), `SiteLayout.jsx` (+test), `ContactFooter.jsx` (+test); delete `Navbar.jsx`, `ResumeModal.jsx`, `src/hooks/useClipboardCopy.js` and their tests
- Parallel: yes
- Steps:
  1. Write failing test G8 in `SiteHeader.test.jsx`, rendering `SiteLayout` with a stub outlet in a `MemoryRouter` (not `App` at `/`, whose old home page is red until T8). E3 belongs to T10, which wires the title.
  2. Confirm failure.
  3. Build `SiteHeader` (route-aware links, `aria-label="Open menu"` button with `aria-expanded`, panel), reduce `SiteLayout` to header plus outlet plus a `usePageTitle` effect that sets the site name for now (T10 replaces the value with `pageMetaFor`), rewrite `ContactFooter` to the dark footer with both copy variants, delete the three old files.
  4. Green; lint green.
  5. Commit: `feat(chrome): rebuild the header, layout and contact footer`
- Done when: G8 passes; the deleted files are gone.

### Task 6: case-study cards
- Requirement(s): R132, R134
- Files: `src/components/CaseStudyCards.jsx`, `CaseStudyCards.test.jsx`
- Parallel: yes
- Steps: write G7 failing; confirm; implement the featured dark card (four mini stats, mobile tags) and the 2 by 2 grid from `caseStudies[i].card`; green; commit `feat(cards): render the featured and grid case-study cards from data`.
- Done when: G7 passes.

### Task 7: case-study template
- Requirement(s): R127, R135, R136
- Files: `src/components/CaseStudyPage.jsx` (+test), `CaseStudyFlowDiagram.jsx` (+test), `CaseStudyTable.jsx`, `ContactBand.jsx`
- Parallel: yes
- Steps:
  1. Write failing tests G10 (`it.each` over the five slugs, rendering `CaseStudyPage` at `/work/<slug>` in a `MemoryRouter`) and G11 (the two tables) in `CaseStudyPage.test.jsx`.
  2. Confirm failure on the tabbed page.
  3. Rewrite the page per ADR 0006 and spec interface (f); flows and the hub diagram in `CaseStudyFlowDiagram.jsx`; tables in `CaseStudyTable.jsx` with `<th scope="col">`; the band in `ContactBand.jsx`; an unknown block type throws.
  4. Green; lint green.
  5. Commit: `feat(case-studies): one single-scroll template rendering content blocks`
- Done when: G10, G11 pass; no `role="tab"` remains in `src/`.

### Task 8: home page and removals
- Requirement(s): R128, R132, R137
- Files: `src/pages/HomePage.jsx` (+test), `HomeHero.jsx`, `ProductionStats.jsx`, `HowIWork.jsx`, `ExperienceSection.jsx`, `Toolkit.jsx`, `src/copyIsClean.test.js`; delete the eight old section components, `orbDrawing.js` and every one of their tests
- Parallel: yes
- Steps:
  1. Write failing tests G6 and G12 in `HomePage.test.jsx` (render `App` at `/`) and G2 in `copyIsClean.test.js` (spawn the scanner on the real `src/`; assert the deleted files are absent and `package.json` has no `thinking-orbs`).
  2. Confirm failure.
  3. Build the five section components from `home`, compose `HomePage` in mockup order with `CaseStudyCards` and `ContactFooter`, keep `useScrollToHashTarget`, delete the old files. Deleting a component's co-located test with it is legitimate here; the test-lock hook applies only in fix loops.
  4. Green; full suite green from this task on; lint green.
  5. Commit: `feat(home): rebuild the home page and remove the simulator, orb and old sections`
- Done when: G2, G6, G12 pass and `npm test` is fully green.

### Task 9: work index and not-found page
- Requirement(s): R134
- Files: `src/pages/WorkIndexPage.jsx` (+test), `src/pages/NotFoundPage.jsx` (+test)
- Parallel: yes
- Steps: write G9 failing (render `WorkIndexPage` directly in a `MemoryRouter` at `/work` and `/work?type=project`); confirm; rewrite the index to `CaseStudyCards` plus `ContactFooter`, restyle not-found with tokens and its two links; green; commit `feat(work): list the five case studies and restyle the not-found page`.
- Done when: G9 passes.

### Task 10: page metadata and served files
- Requirement(s): R133, R137, R139, R141
- Files: `src/pageMeta.js`, `src/pageMeta.test.js`, `src/servedFiles.test.js`, `src/components/SiteLayout.jsx`, `src/components/SiteHeader.test.jsx` (E3 only, appended to T5's G8)
- Parallel: yes
- Steps: write G16 and A1 failing in `pageMeta.test.js`, G18 in `servedFiles.test.js` (failure messages name D2 or D4) and E3 in `SiteHeader.test.jsx` (rendering `App`, green from T8); confirm; implement `SITE_URL`, `pageMetaFor`, `headTags` with escaping, and make `usePageTitle` in `SiteLayout.jsx` read `pageMetaFor(pathname).title` (audit low 1); green (G18 depends on the two supplied files; if absent, report, do not edit); commit `feat(meta): per-route titles, descriptions, canonical and Open Graph tags`.
- Done when: G16, A1, E3 pass; G18 passes or is reported as the D2/D4 blocker.

### Task 11: prerender pipeline (sensitive: index.html, vite.config.js, package.json, scripts/route-pages.mjs, scripts/check-route-pages.mjs)
- Requirement(s): R127, R140, R142, R147
- Files: `src/entry-server.jsx`, `scripts/prerender.mjs`, `src/main.jsx`, `index.html`, `vite.config.js`, `package.json` (build script only), `scripts/route-pages.mjs`, `scripts/check-route-pages.mjs`, tests `src/entryServer.test.jsx`, `src/hydration.test.jsx`, `src/prerender.test.js`, `src/routePages.test.js`, `src/checkRoutePages.test.js`, `src/buildPipeline.test.js`, `src/routes.test.jsx`, `src/prerenderIntegration.test.js`
- Parallel: yes
- Steps:
  1. Write failing tests: G17 (`entryServer.test.jsx`), E1 (`hydration.test.jsx`, `console.error` spied), F1 and A2 (`routePages.test.js`, `prerender.test.js`), G19 (`checkRoutePages.test.js`, fixtures carrying the markers, including the D15 privacy markers: one referrer tag, no inline script, no Google font host, no phone pattern per page), G23 (`buildPipeline.test.js`), E2 (`routes.test.jsx` rewritten without the simulator, orb and telemetry cases), G24 (`prerenderIntegration.test.js`: `assemblePage` composed with `render` and `headTags(pageMetaFor(path))` for each of the seven paths, asserting one of each head tag matching that page's meta and the real h1 in `#root`).
  2. Confirm each fails for its stated reason.
  3. Implement per ADR 0001 and spec interfaces (b) to (e): the entry, the script, `assemblePage` and `writePage`, the marker-based check (R142's full marker list, the phone pattern copied from `deploy.yml` line 446 with a comment saying so), the hydrate-or-mount entry in `main.jsx`, the new title, description and body classes in `index.html`, the three-step `build` script, and remove `closeBundle` and the `route-pages` import from `vite.config.js`.
  4. Green; `npm run build` then `node scripts/check-route-pages.mjs` and `node scripts/check-forbidden-copy.mjs dist` exit 0; `npm run preview` serves `/Portfolio/work/workhorse/` with its own title (spot check).
  5. Commit: `build(prerender): render every route at build time with its own head tags`
- Done when: G17, G19, G23, G24, E1, E2, F1, A2 pass and the built `dist/` passes both checks.

### Task 12: deploy workflow (sensitive: .github/workflows/deploy.yml)
- Requirement(s): R131, R143
- Files: `.github/workflows/deploy.yml`, `src/deployWorkflowRoutePages.test.js`
- Parallel: yes
- Steps: write G20 failing (workflow read as text, steps isolated by name); confirm; edit the pin list (three fontsource packages, `react`, `react-dom`; D19), add the scanner step after the route-page check, narrow the R80 loop at lines 208 to 223 so `asset_refs` is taken only from `<script src>`, `<link rel="stylesheet">`, `<link rel="icon">` and `<link rel="modulepreload">` tags, with a comment saying body links and the canonical are R143's marker checks (D14), rewrite the deep-link and unknown-path assertions to the markers, run the R82 `expect_count` block over `smoke/root.html`, the deep-link body and the 404 body (D15; the root and module assertions stay verbatim), add the PDF and `og.png` fetch step; keep every `permissions:` block unchanged; green; commit `ci(deploy): scan copy, assert per-page markers, and fetch the resume and share image`.
- Done when: G20 passes; `src/deployWorkflowNodeVersion.test.js` still passes.

### Task 13: docs, profile and test-floor pins
- Requirement(s): R145, R149
- Files: `CLAUDE.md`, `.workhorse/profile.yml`, `docs/hosted-config.md`, `docs/sdlc/codebase-map.md`, `docs/sdlc/constraints.md`, the four prior ADR status lines, `scripts/check-test-floor.mjs`, `src/redesignDocs.test.js`
- Parallel: no
- Steps: write G22 failing; confirm; make the edits R145 names (CLAUDE.md architecture in five lines again, the six new ask-first paths under Ask first; profile `sensitive_paths` and the `2: [` line with `scripts/prerender.mjs`, `scripts/forbidden-copy.mjs`, `scripts/check-forbidden-copy.mjs`, `src/pageMeta.js`, `src/entry-server.jsx`, `scripts/check-test-floor.mjs`, and `retention_notes` naming the PDF and the served email (D17); hosted-config section 6, the `og.png` regeneration step from local font files without `npx`, and section 7 listing the PDF with the D17 check; a dated block in codebase-map; constraints question 2 closed; ADR status lines); run `npm test -- --reporter=json --outputFile.json=vitest-results.json`, add `src/checkForbiddenCopy.test.js` and `src/pageMeta.test.js` to `PINNED_SUITES` (audit low 4) and set each pinned suite's count to its fresh passed count, keeping every floor at or above today's; record N1, N2, N3 timings in the commit body; green; commit `docs(sdlc): sync CLAUDE.md, the profile and hosted config with the redesign`.
- Done when: G22 passes; `node scripts/check-test-floor.mjs vitest-results.json` exits 0; N1, N2, N3 recorded.

### Task 14: checks people run (not a builder session)
- Requirement(s): R132, R137, R140, R146, R148, R149
- Owner: the main session, then the owner at G4. Cases M1, M2, M3 (pre-merge half on `dist/`), M4, M5 and N4, recorded in `ship.md`. The shipper writes the numbers-per-page list (M4) and the preview command in `ship.md`.

## Verification plan

Profile commands: `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npm audit --omit=dev --audit-level=high`. Then on the built tree: `node scripts/check-built-css-fonts.mjs`, `node scripts/check-route-pages.mjs`, `node scripts/check-forbidden-copy.mjs dist`, `node scripts/check-phone-redaction.mjs dist` (skips the PDF by design after T3, D16), `node scripts/check-test-floor.mjs vitest-results.json`; N1 and N3 timed. Evals G1 to A2 run inside `npm test` (34 cases); M1 to M5 and N4 are listed as not verified until a person records them in `ship.md`. Evidence the owner sees: the verification report, the numbers-per-page list, the Lighthouse scores, and the local preview (`npm run build` then `npm run preview`). The live halves of R143 are proved by the first deploy run after the owner merges.

## Rollback

Dev: `git checkout main`. Production: nothing deploys until the owner merges; if the deployed site is wrong, `git revert` the merge commit on `main` and push, which redeploys the previous site within minutes. No schema, no data, no migration. The fontsource swap and the deleted components come back with the revert; `dist-ssr/` is untracked and can be deleted.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| A component reads `window` or `document` at render and the SSR build throws, or markup differs and hydration errors | Medium | Build fails or console errors in production | G17 and E1 catch both before CI; effects and handlers only (R140) |
| The Vite SSR build interacts badly with the Tailwind plugin (believed to be fine, not tried) | Low | Build fails at wave 4 | T11 tries the SSR build first; fallback is to mark CSS as external in the SSR config, documented in the task commit |
| The owner has not supplied the PDF, or `og.png` was not rendered, when wave 3 runs; or the PDF carries data the site withholds | Medium | G18 red; ship blocked; personal data published permanently | Named blocker D2/D4; the test is never edited; the owner runs the D12/D17 check (M5) and records it in `ship.md`; `og.png` is rendered from local font files with no `npx` (ADR 0005) |
| Waves 1 and 2 leave red tests in files owned by later tasks | Certain | Confusing builder reports | Stated in Approach and in each Done-when; full green from T8 |
| Nine ask-first prompts across four tasks | Certain | Owner attention | Listed per task above so the owner knows each prompt before it fires |
| The smoke rewrite is only proved live after merge; the prerendered root body carries links R80 would have rejected | Certain | A wrong assertion fails the first deploy after Pages has published | G20 proves the text; R80 reads asset tags only (D14); the owner merges when able to watch the run |
| Agent budget of 90 minutes at tier 2 exceeded by thirteen tasks | High | Clock report over budget | Stated in the brief; the rebuild is one change by decision D6 |

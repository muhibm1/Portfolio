# Plan: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Spec: [spec.md](./spec.md) · Evals: [evals.md](./evals.md) · Project copy: [project-copy-draft.md](./project-copy-draft.md)
Branch: `wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages` (confirmed, `state.json`)
Worktree: one per task, created by the conductor (`isolation: worktree`); task branches `<branch>/t<N>`
Written: 2026-09-12 by the implementation planner, against `main` at `eee8243` as briefed. This session had Read, Glob, Grep and Write only, so no command was run. Every claim is labelled `confirmed` (read or grepped here) or `believed, not verified`.

## Approach

The plan builds from the bottom up in four waves. First the toolchain. Then the leaves that nothing else in this change depends on: data, orb, contact components and simulator. Then the pages and the router mount that use those leaves. Last, the route table that composes every page, alongside the deploy pipeline and its documentation. This re-groups the spec's [Build waves](./spec.md#build-waves) table, which the spec allows. The spec's wave 2 (routing shell) composes its wave 3 (surfaces), so building the shell first would mean writing `App.jsx` and the home page twice and testing them against components about to change. In this order every task tests against its final dependencies, there are still exactly four waves, and no wave exceeds `build.max_parallel: 4` (confirmed, `.workhorse/profile.yml` line 103). Only T1 touches `package.json` and `package-lock.json`, and it installs all nine packages in one owner-approved `npm install`. That means R86's before-and-after review happens once.

## Rules every task follows

1. **Test command.** `commands.test` and `commands.test_file` stay empty until T13 (wave 4, where the spec places R53). Until then, run `npm test` (the script T1 adds) and `npm test -- <path>` for one file. Each worktree runs `npm ci` first. `npm ci` is not an ask command (confirmed against profile `ask_commands`). That worktrees lack `node_modules` is believed, not verified.
2. **Lint.** Until T7 lands, `npm run lint` is expected to exit 1 on `react/rules-of-hooks` in `src/components/CaseStudyModal.jsx`. The code fact is confirmed: `useState` at line 7 comes after `return null` at line 5, and `.oxlintrc.json` line 5 sets that rule to `error`. That oxlint reports it is believed, not verified. Report it as pre-existing; only T7 fixes it. In T2's wave 1 worktree, oxlint cannot load at all (old lockfile, `constraints.md` technical constraint 5); say so in the report.
3. **No personal literals.** GC6 greps `src/` for the email address, and GC41 and GC89 grep for the phone digits. So tests read `portfolioData.personal.email`, and they detect a phone number with a generic North American number pattern, never the owner's digits. The same applies to the workflow and to this file. No test may contain a token from the no-tracking grep (R44), because that grep covers `src/`.
4. **Restyle (R79, G2-D4 as recommended).** Every component a task owns loses its `shadow-` classes, uses 0 px radius on cards and 10 px on interactive elements, and uses the palette in `docs/design-brief.md` lines 31 to 42.
5. **Content.** Copy comes only from three sources: `src/data/portfolioData.js`, `project-copy-draft.md` as confirmed at G3 (the G3 approval notes win where they differ), or strings already in the component. No new prose, and no changed claim (CLAUDE.md "Protected").
6. **Between waves.** From wave 2 until T10 mounts the router in wave 3, the change branch builds but `npm run dev` throws, because `Navbar` uses the router outside a router. Nothing is deployed from the change branch. Tasks prove themselves with tests rendered inside `MemoryRouter`.
7. **Who runs which eval.** Builders write every test-file case their task lists and run its golden command checks. Verify and G4 own the rest: fixture red-team checks no task lists (FL4, FL5, AD11, AD16, EG17, EG22), CI-only cases and manual cases.

## Waves

| Wave | Tasks (all `Parallel: yes`) | Files touched | Depends on |
|------|------|------|------|
| 1 | T1, T2 | T1: `package.json`, `package-lock.json`, `vite.config.js`, `src/test/setup.js`, `src/data/portfolioData.test.js`. T2: `index.html`, `src/index.css`, `.gitignore`, `generate_viewer.cjs` | nothing |
| 2 | T3, T4, T5, T6 | T3: `src/data/portfolioData.js` and its test. T4: `src/components/ThinkingOrbHero.jsx`, `src/components/orbDrawing.js` and their tests. T5: `Navbar.jsx`, `ContactFooter.jsx`, `ResumeModal.jsx` and their tests. T6: `InteractiveTriageSimulator.jsx`, `FdePhilosophy.jsx`, `ExperienceTimeline.jsx`, `SkillsMatrix.jsx` and their tests | wave 1: Vitest, Testing Library, jsdom, `setup.js`, `react-router` installed |
| 3 | T7, T8, T9, T10 | T7: `CaseStudyModal.jsx` renamed to `CaseStudyPage.jsx`, `CaseStudyFlowDiagram.jsx`, `src/pages/NotFoundPage.jsx`, `src/App.jsx` (bridge edit) and tests. T8: `Hero.jsx`, `CaseStudiesSection.jsx`, `MmLogo.jsx` (deleted) and tests. T9: `src/pages/WorkIndexPage.jsx`, `src/components/ProjectEntry.jsx` and tests. T10: `src/main.jsx`, `src/basename.js`, `src/pages/HomePage.jsx` and tests | wave 2: the data keys (T9), the orb (T8); wave 1: `@fontsource` (T10) |
| 4 | T11, T12, T13 | T11: `src/App.jsx`, `src/components/SiteLayout.jsx` and their tests. T12: `.github/workflows/deploy.yml`, `.github/dependabot.yml`. T13: `docs/hosted-config.md`, `public/.well-known/security.txt`, `.workhorse/profile.yml`, `docs/sdlc/constraints.md`, this change's `intent.md` | wave 3: every page plus the router mount (T11). T12 and T13 need only wave 1's scripts; they ship with the deploy, as in spec wave 4 |

13 tasks in 4 waves; the largest wave has 4 tasks. No path repeats within a wave (confirmed by reading this table). `src/App.jsx` is edited in wave 3 (T7's bridge, which keeps the build resolving after the rename) and rewritten in wave 4 (T11). `src/data/portfolioData.test.js` is created in wave 1 and extended in wave 2.

**Interfaces fixed now so parallel tasks agree.**
- Components: `Navbar({ activeSection, onOpenResume })`. `ContactFooter({ onOpenResume })` and `ResumeModal({ onClose })` are unchanged. `Hero`, `CaseStudiesSection`, `CaseStudyPage`, `WorkIndexPage`, `NotFoundPage` and `HomePage` take no props. `ThinkingOrbHero({ size = 420 })`, `ProjectEntry({ project })` and `CaseStudyFlowDiagram({ steps })`.
- Routing: `src/basename.js` exports `computeBasename(baseUrl)`, the name GC2 uses. `SiteLayout` owns `activeSection` and `isResumeOpen`, and passes `setActiveSection` to `HomePage` through the router's outlet context.
- Data (T3): `projects[]` of `{ id, name, type: "Project", tagline, description, techStack, status, repoPublic, repo }`; `demos[]` of `{ id: "triage-simulator", name, type: "Live demo", tagline, href: "/#simulator" }`; plus `workIntro`, `personal.github` and `personal.githubHandle`.

## Tasks

### T1. Toolchain repair, exact pins and the test runner. Sensitive: `package.json`, `package-lock.json`, `vite.config.js`; runs `npm install` (ask prompt)
- Wave 1 · Parallel: yes · Files: `package.json`, `package-lock.json` (deleted and regenerated), `vite.config.js`, `src/test/setup.js` (new), `src/data/portfolioData.test.js` (new). Also deletes the untracked `node_modules/`.
- Requirements: R11, R12, R18 (pinning test), R49, R50, R51, R54, R65, R66, R70, R71, R74 (Windows half), R75, R77, R78, R86, R88. Evals: GC1 (`package.json` half), GC11, GC12, GC18, GC49, GC50, GC51, GC54, GC65, GC66, GC70, GC71, GC75, GC77, GC78, GC86, GC88, EG21, FL20.
- Dependencies, from the spec's [Dependency table](./spec.md#dependency-table). Every version and licence is believed, not verified, until step 2. Nothing in the repo provides any of them today (confirmed, `package.json` lines 12 to 27).

| Package | Exact version | Licence | Why nothing present works |
|---|---|---|---|
| `react-router` (runtime) | 7.9.4 | MIT | no router is installed; Outcomes 2 to 5 need one |
| `@fontsource/inter`, `@fontsource/jetbrains-mono`, `@fontsource/space-grotesk` (runtime) | 5.2.8 each | OFL-1.1 for the font files | fonts load only from Google's CDN today; nothing ships a woff2 |
| `vitest` (dev) | 3.2.4 | MIT | there is no test runner; Vitest 4 needs Vite 6 (ADR 0004) |
| `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom` (dev) | 16.3.0, 10.4.1, 6.9.1 | MIT | rendering and DOM matchers; `dom` is a required peer |
| `jsdom` (dev) | 26.1.0 | MIT | the DOM environment Vitest needs |
| `@rolldown/binding-win32-x64-msvc` | removed | MIT | Windows-only, needed by nothing, expected to break `npm ci` on Linux |

- Steps:
  1. Record the resolved version of every current direct dependency from the existing lockfile. That is R86's "before" column: 11 surviving rows plus the removed one. Run `./node_modules/.bin/oxlint --version` and confirm it exits 1 with "Cannot find native binding".
  2. R77: for each of the nine packages, `npm view <package>@<version> version license` must print exactly the pinned version. Also read `npm view vitest@3.2.4 peerDependencies engines`. If any pin does not resolve exactly, stop, report `blocked`, and escalate to the owner. Never bump.
  3. Write the failing test "keeps the four telemetry metrics and the three case-study ids and titles verbatim". It checks each telemetry `metric`, `unit`, `label` and `context`, and each case-study `id` and `title`, against values copied from the data file today. Run `npm test` and confirm it fails with npm's missing-script error, not with a test failure.
  4. Edit `package.json`: remove the binding, add the nine at exact versions, and add `"test": "vitest run"` and `"test:watch": "vitest"`. Delete `node_modules` and `package-lock.json`, then run `npm install` once (the owner approves the prompt). Record any `EBADENGINE` warning (Node 21, FL20).
  5. Put the R86 "after" column and the R77 table in the task report: version, licence and `vitest` `engines`, each read from `node_modules/<package>/package.json`. If any direct dependency moved a major version, stop and escalate before committing.
  6. Create `src/test/setup.js` per R54. It imports `@testing-library/jest-dom/vitest` and stubs `matchMedia` (not matching, with change listeners), `IntersectionObserver`, and `getContext` (returns `null`). It also stubs `window.scrollTo` and `Element.prototype.scrollIntoView` as no-ops, because R7 and R8 call them and jsdom does not implement them (believed, not verified). All stubs are restored between tests.
  7. Edit `vite.config.js`: set `base: "/Portfolio/"` (R11); add the R50 `test` block, keeping `defineConfig` from `vite` (if Vite 5 rejects the `test` key, import it from `vitest/config` and record which was used); add one inline, build-only plugin that inserts the CSP (the spec's policy verbatim, in one named constant) and the referrer meta as the first children of `<head>` (R65, R88), and copies the built `index.html` to `404.html` with `node:fs` in `closeBundle` (R12).
  8. Run `npm test` (green) and `npm run build` (exit 0). Then run GC11, GC12, GC65, GC66, GC88 and EG21 as `evals.md` writes them. If GC66 finds an inline script, set `build.modulePreload.polyfill: false` and rebuild. If the script persists, report `blocked`; R66 forbids a hash.
  9. Run GC49, GC70, GC75 and GC78. Check that `./node_modules/.bin/oxlint --version` exits 0. Run `npm run lint` and record its output; the expected result is rule 2's pre-existing error only.
  10. Commit `build: repair toolchain, pin dependencies, add vitest and pages build steps`.
- Done when: `npm test` exits 0 with at least 1 passing test, `npm run build` exits 0, the golden checks above pass, oxlint loads, and the R77 (9 rows) and R86 tables are in the report with every difference escalated.

### T2. Static shell, font tokens, reduced motion and hygiene. Sensitive: `index.html`
- Wave 1 · Parallel: yes · Files: `index.html`, `src/index.css`, `.gitignore`, `generate_viewer.cjs` (`git rm`).
- Requirements: R14, R37, R39, R40, R72, R73. Evals: GC37 (`index.html` half), GC39, GC40, GC72, GC73, EG20. GC14 and GC37's `dist/` half need T1's `base`, so they run at the wave 1 fold.
- Steps:
  1. Failing checks, as value today then target: `grep -c "fonts.googleapis.com\|fonts.gstatic.com" index.html` (3, then 0); `git ls-files | grep -c generate_viewer` (1, then 0); `grep -c "^\.env\*" .gitignore` (0, then 1); after `npm run build`, `grep -c "prefers-reduced-motion" dist/assets/*.css` (0, then at least 1) and the built `body{` rule (contains `-apple-system`, then not).
  2. `index.html`: delete lines 8 to 10 and add the favicon link as `%BASE_URL%favicon.svg` (R14). Nothing else changes.
  3. `src/index.css`: add a Tailwind `@theme` block with `--font-sans`, `--font-mono` and `--font-display`, naming Inter, JetBrains Mono and Space Grotesk with system fallbacks. Delete the `font-family` line at line 22 (R39). Add the R40 reduced-motion block. Leave the palette variables alone (spec finding 3).
  4. Add `.env*` to `.gitignore` (R73), and run `git rm generate_viewer.cjs` (R72).
  5. Re-run the step 1 checks; all green. Confirm `git check-ignore --no-index .env .env.local .env.production` lists all three files (EG20).
  6. Commit `chore(shell): drop Google Fonts, add favicon and font tokens, honour reduced motion, remove dead script`.
- Done when: every step 1 check meets its target and `npm run build` exits 0.

### T3. Data: projects, live demo, GitHub handle, phone removal (owner's record, CLAUDE.md "Protected")
- Wave 2 · Parallel: yes · Files: `src/data/portfolioData.js`, `src/data/portfolioData.test.js`.
- Requirements: R16, R17, R41 and R43 (data halves), R18. Also G3-D1 (copy) and G3-D2 (shape). Evals: GC16 (length), GC18, GC41 (data test); GC-CP is manual at G4.
- Steps:
  1. Failing tests: "publishes no phone number" (no `phone` key, and no string in the data matches a phone-number pattern); "lists exactly the workhorse, Shu and wasl projects, each with a boolean repoPublic and a repo under personal.github"; "offers one live demo that links to /#simulator"; "names the owner's GitHub profile". Confirm each fails on the missing key or the present phone field.
  2. Delete the `personal.phone` key itself, not just its value (R41). Add `personal.github` and `personal.githubHandle` with the spec's values.
  3. Add `projects`. Take the tagline, description, stack, status and `repoPublic` value for each project verbatim from `project-copy-draft.md`, or from the G3 approval notes where the owner edits them. Split `techStack` on " · ". Set `id` to the lowercase name, `type` to "Project" and `repo` to the full repository URL. Copy none of the draft's "Owner check" notes. There is no `year` field, because nobody supplied a year.
  4. Add `demos` with one entry. Its `name` and `tagline` are copied from `InteractiveTriageSimulator.jsx` lines 114 and 118. Set `workIntro` to the hero role line at `Hero.jsx` line 33 (all three confirmed by reading), unless the G3 notes supply a different line.
  5. Run `npm test`; all green. `ContactFooter` and `ResumeModal` still read `personal.phone` until T5 is folded in the same wave; that is expected.
  6. Commit `feat(data): add projects, live demo and GitHub handle; remove the phone number`.
- Done when: all tests in the file pass, and the diff shows additions plus the single `phone` deletion, nothing else.

### T4. The hero orb (`ThinkingOrbHero`)
- Wave 2 · Parallel: yes · Files: `src/components/ThinkingOrbHero.jsx`, `src/components/orbDrawing.js`, `src/components/orbDrawing.test.js`, `src/components/ThinkingOrbHero.test.jsx`. `orbDrawing.js` holds the two pure helpers, `colourForDepth(z)` and `canvasWidthForViewport(width)`, so the component file keeps a single default export.
- Requirements: R29 to R36. Evals: GC29 to GC36, EG10 to EG13, FL10, FL11, FL12.
- Steps:
  1. Failing helper tests: "maps the near, middle and far depths onto the brand stops" (exact strings at `z` = -1, 0 and 1, fixed from the spec's stop order before implementing); "clamps the canvas width to 420 at wide viewports and 280 at narrow ones" (1440, 1024, 700 and 468 give 420; 320 gives 280).
  2. Failing component tests; tests that need painting stub `getContext` locally with a recording fake. The component renders a canvas 420 CSS pixels wide; paints one frame and schedules no animation frame under reduced motion; stops animating when the media query changes to reduce (EG11); pauses offscreen and when the tab is hidden, and resumes on both; releases its frame, observer and listeners on unmount, with no paint after unmount (EG12); does not throw when `getContext` returns `null`; has a backing store of 840 at a device pixel ratio of 2 and of 3, and 420 at 0; renders when `matchMedia` or `IntersectionObserver` is missing; and after 20 mount-and-unmount cycles leaves equal request and cancel counts.
  3. Implement to the spec's "The orb" contract table. Copy the package's reduced-motion, offscreen and visibility handling from `node_modules/thinking-orbs/dist/index.es.js` lines 48 to 124. Import only `resolvePreset` and `MODE_FRAMES` from `thinking-orbs/engine`, and do not use `shadowBlur`.
  4. `npm test` green. Run GC29 with whole-word matching (`grep -cw`); the eval as written matches the component's own name (see Findings outside scope, item 3).
  5. Commit `feat(hero): draw the thinking-orbs working state with the brand palette`.
- Done when: all the tests above pass, and the engine import line names only the two symbols.

### T5. Contact surfaces: email from data, phone removed, copy timers and clipboard failures
- Wave 2 · Parallel: yes · Files: `src/components/Navbar.jsx`, `ContactFooter.jsx`, `ResumeModal.jsx`, `Navbar.test.jsx`, `ContactFooter.test.jsx`, `ResumeModal.test.jsx`.
- Requirements: R6 (the literals at `Navbar.jsx` 17 and 87 and at `ContactFooter.jsx` 38), R10, R41 (component half), R42, R47, R48, R79. Evals: GC10, GC47, GC48, EG15, plus the component halves of GC6 and GC41.
- Steps:
  1. Failing tests, all inside `MemoryRouter`: Navbar "shows a Work link and no home section anchors on /work"; all three "clear the copy-confirmation timer on unmount" (fake timers) and "do not report a successful copy when the clipboard rejects"; Navbar and ContactFooter "keep one pending timer after a double click"; ContactFooter and ResumeModal "show no phone number" and "link to personal.email".
  2. Replace the three email literals with `personal.email`. Delete the "Direct Phone" block (`ContactFooter.jsx` lines 68 to 73) and the phone at `ResumeModal.jsx` lines 10 and 69. Drop `Phone` from both `lucide-react` imports (R41).
  3. Await `writeText`. When it rejects, or when `navigator.clipboard` is absent, show a failed state (R48). Hold each timer in a ref, clear the previous one on every click, and clear it on unmount (R47).
  4. Navbar uses `useLocation` and `Link`. On `/` it shows the section anchors plus Work; elsewhere it shows Home and Work (R10). Restyle per rule 4.
  5. Run `npm test`; all green. `grep -c "Phone"` over the two files returns 0.
  6. Commit `fix(contact): read email from data, drop phone, clear copy timers, report clipboard failures`.
- Done when: all the tests above pass, and none of the three files contains the email literal.

### T6. Simulator label and timers; restyle of the philosophy, experience and skills sections
- Wave 2 · Parallel: yes · Files: `src/components/InteractiveTriageSimulator.jsx`, `FdePhilosophy.jsx`, `ExperienceTimeline.jsx`, `SkillsMatrix.jsx`, and one `*.test.jsx` beside each.
- Requirements: R45, R46, R79. Evals: GC45, GC46, EG14, FL13, and GC79 for these files.
- Steps:
  1. Failing tests: "labels the sample tickets as an illustrative example with fictional data" (at least two matches for "illustrative example", at least one for "fictional"); "clears its pending timers on unmount and on reset"; "leaves no timer when unmounted before the first stage"; "logs no update after unmount".
  2. Characterisation tests, which pass before and after the change: each of the three restyled sections "renders every principle", "renders every role and degree" and "renders every skill group" from `portfolioData`.
  3. Show the label beside the scenario list and again on the payload inspector (G1-D5). Track the three timeouts at lines 75, 79 and 83 (confirmed) in a ref, and clear them on reset and on unmount.
  4. Restyle all four components per rule 4. `npm test` green; `grep -c "shadow-"` over the four files returns 0.
  5. Commit `feat(simulator): label fictional data and clear timers; restyle static home sections`.
- Done when: all the tests above pass.

### T7. The case-study page at `/work/:slug` and the not-found page (includes a bridge edit to `src/App.jsx`)
- Wave 3 · Parallel: yes · Files: `src/components/CaseStudyModal.jsx` moved with `git mv` to `src/components/CaseStudyPage.jsx`; new `src/components/CaseStudyFlowDiagram.jsx` and `src/pages/NotFoundPage.jsx`; tests `CaseStudyPage.test.jsx`, `CaseStudyFlowDiagram.test.jsx`, `src/pages/NotFoundPage.test.jsx`; and `src/App.jsx`, a bridge edit only (remove the modal import, the `selectedCaseStudy` state and the modal block, so the build resolves until T11 rewrites the file).
- Requirements: R6 (the rename plus the fourth email literal), R21 to R26, ADR 0008, G3-D5. Evals: GC21 to GC25, EG3, EG4, EG8, EG9, EG16 (previous and next), AD1 to AD4. The lint error from rule 2 disappears here.
- Steps:
  1. Failing tests, inside `MemoryRouter` with a `/work/:slug` route: resolves each of the three slugs; renders not-found for an unknown slug, a wrongly cased slug, `%20` and the four AD1 to AD4 slugs (with no script injected); shows the four chips and "Key enterprise metrics"; each tab body is a substring of its data field for all three studies; diagram node count equals the step count for the real steps and for stubs of 1, 2 and 6; previous and next links wrap at both ends and point at the neighbours in the middle; no "Log in" or "Sign up" control. The not-found page shows a heading plus links to `/` and `/work`.
  2. Run `git mv`, then reshape per the spec's `CaseStudyPage` paragraph: page chrome replaces the modal chrome; the chips Challenge, System Architecture, Production Deployment and Measured Impact map to `challenge`, `diagramSteps`, `solution` plus `techStack`, and `impact`; add previous and next links and a mailto link to `personal.email`; put every hook before any early return; remove the hard-coded copy at lines 184 to 204 and 273 to 280, which is not in the data (R23, G3-D5); make the simulator call to action a link to `/#simulator`.
  3. Make the bridge edit to `App.jsx`. Run `npm test` (green), `npm run build` (exit 0) and `npm run lint` (exit 0 expected; report anything else). Confirm that GC6's grep matches only the data file and that `git ls-files | grep -c CaseStudyModal` returns 0.
  4. Commit `feat(work): turn the case-study modal into the /work/:slug page`.
- Done when: every check in step 3 passes. This is the largest task; most of its diff is JSX kept from the renamed file.

### T8. The hero orb and the home case-study cards; delete the monogram
- Wave 3 · Parallel: yes · Files: `src/components/Hero.jsx`, `CaseStudiesSection.jsx`, `MmLogo.jsx` (`git rm`), `Hero.test.jsx`, `CaseStudiesSection.test.jsx`.
- Requirements: R27, R28, R79 (Varick cards and the restyle). Evals: GC27, placed in `Hero.test.jsx` instead of `HomePage.test.jsx` so the assertion sits next to the component it checks; GC28; GC79 for these files. GC27v and GC79v are manual at G4.
- Steps:
  1. Failing tests:
     - "renders the stacked name, the availability pill, all four telemetry metrics and one orb canvas". It fails today, because the monogram has no image role.
     - "links every case-study card to its /work page".
     - "offers no category filter on the home page".
  2. Replace `MmLogo` with `ThinkingOrbHero` inside a wrapper that carries the existing glow, moved from `MmLogo.jsx` lines 7 to 13. Keep every string unchanged.
  3. Rebuild each card on the Varick pattern (`design-brief.md` lines 25 to 29). It has a title, the summary, capability bullets from existing fields, and a `Link` to `/work/<id>`. Remove the filter and the callbacks.
  4. Run `git rm MmLogo.jsx` and confirm `grep -rn MmLogo src/` returns 0. `npm test` green.
  5. Commit `feat(home): replace the monogram with the orb and link case-study cards to their pages`.
- Done when: all the tests above pass, and the `shadow-` grep over both files returns 0.

### T9. The `/work` index and project cards
- Wave 3 · Parallel: yes · Files: `src/pages/WorkIndexPage.jsx`, `src/components/ProjectEntry.jsx`, `src/pages/WorkIndexPage.test.jsx`, `src/components/ProjectEntry.test.jsx`.
- Requirements: R15, R16, R17, R19 (manual), R20, R43, G3-D2. Evals: GC15, GC16, GC17, GC20, EG7, EG16, and GC43 as amended by G3-D2 (see Findings outside scope, item 1).
- Steps:
  1. Failing `ProjectEntry` tests: "links to the GitHub repository when the repository is public" (a fixture project with `repoPublic: true`); "shows the private-repository note with an email link and no GitHub link when the repository is private".
  2. Failing page tests at `/work`: the Case studies, Projects and Live demo regions hold 3, 3 and 1 articles; workhorse, Shu and wasl render; the demo link ends with `#simulator`; 7 articles by default and 3 after choosing Project, with the filter controls as links; cycling every filter back to All keeps 7 in their original order; while the data marks the repositories private every project card shows the note; the header links to `personal.github`, `personal.linkedin` and `personal.email`.
  3. `ProjectEntry` renders one `<article>`. When `repoPublic` is true, it links to `repo`. When false, it shows "Private repository · walkthrough on request", a mailto link to `personal.email`, and no GitHub link.
  4. Build the page on the Reis layout (`design-brief.md` lines 44 to 49 and the spec's "The /work index"). Each region is a `<section aria-labelledby>`. The filter controls are router links to `?type=<value>`, read with the router's search params, so they are real links as R20 requires. This deviates from the spec's single `useState` note. Use weight 400: R38 ships no 300 face (see Findings outside scope, item 7).
  5. `npm test` green.
  6. Commit `feat(work): add the /work index with case studies, projects and the live demo`.
- Done when: all the tests above pass.

### T10. Router mount, self-hosted fonts and the home page
- Wave 3 · Parallel: yes · Files: `src/main.jsx`, `src/basename.js`, `src/basename.test.js`, `src/pages/HomePage.jsx`, `src/pages/HomePage.test.jsx`.
- Requirements: R1 (`main.jsx` half), R2, R8, R9 (the move into `HomePage`), R38. Evals: GC1, GC2, EG1, GC8, EG5, EG6, AD5, GC38.
- Steps:
  1. Failing tests: "strips the trailing slash from the Vite base url" (`/Portfolio/` to `/Portfolio`, `/` to `/`); "strips repeated trailing slashes"; "falls back to / for an empty value". For `HomePage`, with a test outlet context: `/#simulator` scrolls the simulator into view, smoothly, and not smoothly under reduced motion; a missing id, a Unicode hash and the AD5 payload neither throw nor scroll.
  2. Implement `computeBasename`. In `main.jsx`, add the twelve `@fontsource` imports above `./index.css`, and wrap `<App />` in `BrowserRouter` from `react-router` with `basename={computeBasename(import.meta.env.BASE_URL)}`.
  3. `HomePage` renders the six home sections with their ids unchanged. It moves the scroll spy from `App.jsx` lines 20 to 40, and adds the hash-scroll effect, guarding against malformed URI decoding.
  4. Run `npm test` (green) and check `grep -c "from 'react-router'" src/main.jsx` is 1 and `grep -c "@fontsource" src/main.jsx` is 12. Run `npm run build` (exit 0) and confirm at least 12 `.woff2` files under `dist/assets/`.
  5. Commit `feat(routing): mount the router under the Pages base, self-host the fonts, add the home page`.
- Done when: all the checks in step 4 pass.

### T11. Route table and shared layout
- Wave 4 · Parallel: yes · Files: `src/App.jsx` (rewrite), `src/components/SiteLayout.jsx`, `src/routes.test.jsx`, `src/components/SiteLayout.test.jsx`.
- Requirements: R3, R4, R5, R7, R9 (only on `/`), R13, R26, R42, R44. Evals: GC3, GC4, GC5, GC7, GC9, GC13, GC26, GC42, GC44, EG2, FL6, FL9, AD12.
- Steps:
  1. Failing tests; route tests wrap `App` in `MemoryRouter`, since `BrowserRouter` lives in `main.jsx`. The five paths render their level-1 headings and an unknown slug renders not-found; the trailing-slash slug outcome is pinned (EG2); navigating from `/` to `/work` calls `window.scrollTo(0, 0)`; no route has a "Log in" or "Sign up" control; on `/work` no scroll handler touches the home section ids (GC9 lives here, not in `WorkIndexPage.test.jsx`, because it needs the layout mounted); an unstripped `/Portfolio/` basename sends `/work` to not-found (FL6); the home page renders fully when `getContext` is `null` (FL9); 20 mount-and-unmount cycles leave no timers and equal frame counts (AD12). Layout: the mailto and LinkedIn links appear on `/`, `/work` and `/work/apple-llm-triage`, and the Resume button opens and closes the modal.
  2. `App.jsx` holds one pathless layout route with `SiteLayout` as its element. Under it sit four child routes: the index (`HomePage`), `work`, `work/:slug`, and `*`. `SiteLayout` renders `Navbar`, `<Outlet context>`, `ContactFooter` and `ResumeModal`, and scrolls to the top on a path change that has no hash.
  3. Run `npm test` (green, at least 12 passed and 0 skipped), `npm run build` (exit 0) and `npm run lint` (exit 0). Run GC5 (the only `ResumeModal` import outside tests is in `SiteLayout.jsx`) and the full no-tracking grep (GC13, GC44; 0 matches).
  4. Commit `feat(routing): add the route table and shared layout`.
- Done when: every check in step 3 passes. GC3's command check needs amending (see Findings outside scope, item 2).

### T12. Deploy workflow and Dependabot. Sensitive: `.github/workflows/deploy.yml`
- Wave 4 · Parallel: yes · Files: `.github/workflows/deploy.yml`, `.github/dependabot.yml`.
- Requirements: R52, R55 to R64, R68, R74 (CI half), R80 to R83, R85, R87. Evals: the structural halves of GC52, GC55 to GC64, GC68, GC80 to GC83, GC85 and GC87; EG18, AD14, AD15. The CI-only halves come from the first run.
- Steps:
  1. Failing checks: run GC55 to GC64, GC68, GC83 and GC85 from `evals.md`. All fail, because neither file exists yet. Create two fixture pairs outside the repository: a `package.json` carrying a caret pin, plus a clean one; and a Vitest JSON report with one pending test, plus a clean one.
  2. Resolve each action's current release to a full commit SHA, dereferencing annotated tags (for example `git ls-remote <repo> refs/tags/<tag>^{}`; believed, not verified). Record each tag and SHA in the report.
  3. Write the build job per the spec's "Deploy pipeline" block and R55 to R62, in this order: the R85 pin check (a `node -e` step whose nine-package allowlist carries a comment saying the owner extends it when adding a package); `npm ci`; `npm run lint`; `npm test -- --reporter=default --reporter=json --outputFile.json=vitest-results.json`, which keeps failing test names in the log (flag syntax believed, not verified; confirm it locally); the R52 floor check (at least 12 passed, 0 pending, todo or failed, naming the counts); `npm run build`; the blocking audit with `--omit=dev`; the full audit, carrying the file's only `continue-on-error: true`; `configure-pages` with `enablement: false`; `upload-pages-artifact` for `dist`. Both `node -e` checks take their input path as the first argument.
  4. Write the deploy job with `pages: write` and `id-token: write`. Keep its smoke steps inline in `deploy.yml`, so every line that runs beside `id-token: write` stays under the sensitive path. The steps are: R63 (retry, then save the body), R87 (header dump), R80 (asset paths, 200s and content types, including one woff2), R81 (the deep-link body digest equals the root's), and R82 (the five assertions). The phone check in R82 runs against the HTML body and against the fetched module script, using a phone-number pattern. Each failure names the assertion and the URL (R83).
  5. Write `dependabot.yml` per R68. Re-run the step 1 checks; all green. Run each `node -e` snippet against the fixtures: the bad ones fail and name the offender, and the clean ones pass (AD14, AD15). Delete the local `vitest-results.json`.
  6. Commit `ci: build, test and deploy to GitHub Pages with smoke assertions; add Dependabot`.
- Done when: every structural check and fixture check passes, there are no `secrets.` references, and every `uses:` is pinned to a SHA. If `deploy-pages` needs a scope the deploy job lacks (R60, believed), the first run fails; escalate rather than widen the scope silently.

### T13. Hosted config, security.txt, test commands, content protection, redactions (edits the human-owned `.workhorse/profile.yml` and the G1-approved `intent.md`)
- Wave 4 · Parallel: yes · Files: `docs/hosted-config.md`, `public/.well-known/security.txt`, `.workhorse/profile.yml`, `docs/sdlc/constraints.md`, `docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/intent.md`.
- Requirements: R53, R67, R69, R76, R84, R87 (a placeholder until the first run), R89, spec OQ7 (G3-D4). Evals: GC53, GC67, GC69, GC76, GC84 (structure), GC89 (with the expected set in Findings outside scope, item 4). EG19 does not apply, because `security.txt` is a static file.
- Steps:
  1. Failing checks: GC53, GC67 (after `npm run build`), GC69 and GC84 (the file is absent), `grep -c "src/data/portfolioData.js" .workhorse/profile.yml` (0), and GC89 excluding `.git`, `node_modules` and `.worktrees`.
  2. Profile: set `commands.test: "npm test"` and `commands.test_file: "npm test --"`. Add `src/data/portfolioData.js` to `sensitive_paths`, with a comment citing the employer-confidentiality control. Leave `max_parallel: 4` and everything else unchanged.
  3. `security.txt`: Contact is a `mailto:` built from `personal.email`; Expires is one year from the commit date, in ISO 8601; Preferred-Languages is `en`; Canonical is `https://muhibm1.github.io/Portfolio/.well-known/security.txt`.
  4. `hosted-config.md` records the seven R69 items (repository visibility is the G3-D3 answer; the header list is a placeholder until the first run), the four-item R84 check with dated lines written as `YYYY-MM-DD`, the security.txt location caveat and its annual renewal, and GitHub as the only remaining subprocessor.
  5. R89: replace the full number at `constraints.md` line 102 and `intent.md` line 199 (both confirmed) with R89's redacted form. Add a one-line note at each site naming G1-D1 and where the checks now live. Re-run step 1; all green.
  6. Commit `docs(deploy): record hosted config, add security.txt, set test commands, redact phone in docs`.
- Done when: every check in step 1 meets its target.

**Coverage.** Every requirement from R1 to R90 has a task. T1: R11, R12, R49 to R51, R54, R65, R66, R70, R71, R74, R75, R77, R78, R86, R88. T2: R14, R37, R39, R40, R72, R73. T3: R16 to R18, R41, R43. T4: R29 to R36. T5: R6, R10, R41, R42, R47, R48. T6: R45, R46. T7: R6, R21 to R26. T8: R27, R28. T9: R15 to R17, R19, R20, R43. T10: R1, R2, R8, R9, R38. T11: R3 to R5, R7, R9, R13, R26, R42, R44. T12: R52, R55 to R64, R68, R74, R80 to R83, R85, R87. T13: R53, R67, R69, R76, R84, R87, R89. R79 is spread across T5 to T9 and T11. R90 applies to every task report and is checked at the conformance review.

## Verification plan

The verifier runs these on the change branch after wave 4:

| Profile key | Command | Expected |
|---|---|---|
| install | `npm ci` | exit 0 against T1's lockfile |
| typecheck, format, e2e, screenshot | none | "no check defined" |
| lint | `npm run lint` | exit 0 (M3) |
| test | `npm test` (`commands.test` after T13) | exit 0, at least 12 passed, 0 skipped. About 75 tests are planned (believed estimate) |
| build | `npm run build` | exit 0, then the post-build greps |
| security_audit | `npm audit --audit-level=high` | exit 0, or advisories listed; CI blocks only on `--omit=dev` |

The conductor also runs `npm test` and `npm run build` after every wave fold. Lint is red in waves 1 and 2 only, from rule 2's error.

Evals by category (`evals.md` section 1: 100% target per category):
- **Automated on Windows.** Every test-file case named in the tasks. The golden command checks. The fixture cases FL4, FL5, AD11, AD14 to AD16, EG17, EG20 to EG22. The greps AD6 to AD9.
- **CI-only, from the owner's first push.** The enforcement halves of GC52, GC56 and GC85. GC63, the ubuntu half of GC74, GC80 to GC82, GC87. FL1, FL16, FL17, FL19, FL21, FL22, AD10 and NF14.
- **Manual.** GC19, GC22v, GC27v, GC30v and GC79v, as a design review at G4 through `npm run preview` (believed to serve at `http://localhost:4173/Portfolio/`). GC77 and GC86, from the T1 report tables. GC-CP, as a diff review. GC84's dated line, after the deploy. GC90, at the conformance review. Also FL7 (browser half), FL8, FL15, FL20, FL23 and AD13, the documented accepted risk. EG19 is not applicable.
- **Evidence the owner sees at G4.** `verification.md`, the builder reports with the R77 and R86 tables and the action SHAs, the design-review notes, and the G4 packet.

## Rollback

- **Build (change branch).** Nothing reaches `main` before G5. With `wave_merge: rebase`, each task lands as its own commit (believed), so a bad task is undone with `git revert <sha>` on the change branch, or by re-planning it.
- **Dev.** Local `npm run dev` only; nothing to undo. **Staging.** None exists (confirmed, profile).
- **Production.** The owner's push to `main` is the release. Rollback is also the owner's: `git revert <bad commit>` on `main`, then push; the workflow redeploys after its full gate. Four caveats. (1) Reverting the whole change also deletes `deploy.yml`, so that push deploys nothing and the bad site stays up; revert only the offending commits, or unpublish from Settings, Pages (believed, not verified). (2) Re-running an older successful run redeploys only while its Pages artifact still exists (believed short retention). (3) Anything crawlers or archives copy cannot be recalled (`constraints.md` technical constraint 2). (4) Making the repository public (G3-D3) can be undone in Settings, but clones made in the meantime persist.
- **Profile and docs.** Revert T13's commit. **Data.** No schema. T3 is one revertable commit.
- **For the release engineer.** Rehearse the partial revert on the change branch before G5. Carry R84's manual browser check into `release.md`'s runbook as a G5 item, which closes the auditor's open Low on R84.

## Risks

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| A pin in the dependency table does not exist at that exact version | Medium | T1 blocks | R77: stop and escalate; the owner chooses | Build, then site owner |
| Lockfile regeneration moves a direct dependency's major version | Low (all carets; believed) | Untested change in the first deploy | R86 table, escalated before the commit | Build |
| Vite 5 rejects the `test` key, or the build emits an inline script | Low | Build red, or a blank page in production | R50 fallback import; R66 check in T1 and R82 in CI | Build |
| The change branch is unrunnable between waves 2 and 3 | Certain | None, nothing is deployed | Stated in rule 6; tests use `MemoryRouter` | Conductor |
| Empty `commands.test` until wave 4 | Certain | Builders and the fixer lack the profile command | Rule 1 names `npm test` | Conductor |
| Pages is unavailable while the repository is private on GitHub Free | High until G3-D3 | First deploy fails | G3-D3, which blocks only G5 | Site owner |
| The deploy job's scopes are insufficient (R60 is believed) | Low to Medium | First deploy fails | Escalate, record in `hosted-config.md`, never widen silently | Build, then site owner |
| GC3, GC29, GC43 or GC89 fail as written | Certain | Verification goes red for eval reasons | Findings outside scope, items 1 to 4, go to the eval designer before Verify | Conductor |
| The font names in `@theme` do not match what `@fontsource` registers | Low | Fonts fall back silently | GC39 plus the G4 design review | Review |
| G3 notes edit copy beyond R18's keys | Low | Spec conflict | T3 blocks and asks | Site owner |

## Findings outside scope

1. **GC43 (confirmed, `evals.md` line 139).** It asserts GitHub links on all three project cards. Under G3-D2 all three are private and render none. Reword it: "a public card links to GitHub; a private card shows the note and a mailto link".
2. **GC3 and R3.** They count `grep -c "<Route " src/App.jsx` as 4. R4's `<Outlet>` layout needs a fifth, pathless layout route (believed, standard react-router usage). Count path and index routes instead.
3. **GC29 (confirmed, line 114).** Its third grep matches the component's own name, `ThinkingOrbHero`. Use whole-word matching.
4. **GC89.** It expects only `spec.md`, but `evals.md` also carries the digits (confirmed, lines 137, 178 and 339). Builder worktrees under `.worktrees/` also hold pre-change copies (believed; `.gitignore` line 25 confirmed). The expected set should be `spec.md` plus `evals.md`, with `.worktrees` excluded.
5. **GC5** will also match `ResumeModal.test.jsx`. It should count import sites outside tests only.
6. **GC39.** Its `font-family:Inter` grep can be satisfied by the `@font-face` rules the fontsource packages ship (believed). The body-rule half of the check is the meaningful one.
7. **R19 against R38.** R19 asks for weight 300 on `/work`; R38 ships 400 to 700. T9 uses 400; the owner decides at G4.
8. **Hero copy (confirmed).** `Hero.jsx` hard-codes the LinkedIn URL (line 65) and an availability line (line 22) that differs from `personal.status`. Only the owner can say which wording is his.
9. **`src/App.css`** exists and nothing imports it (confirmed by grep). Delete it in a later change.
10. **Hardening.** The smoke steps could run in a third job with `permissions: {}`, reading the page URL from job outputs. The spec places them in the deploy job, and T12 follows the spec.
11. **Dependabot** will propose the Vitest 4 and Vite 6 majors that ADR 0004 declines, and a merge to `main` deploys. An ignore rule for those majors is a spec change.
12. **Stale docs.** CLAUDE.md "Commands" and the profile `notes` go stale after this change. That is the retro's job.
13. **Open audit items.** The auditor's open Lows on R52's floor (12 against about 75 planned tests) and on R60's grep file arguments stay with the architect and eval designer. This plan closes the R82 phone-reach, R52 reporter, R85 allowlist and R84 runbook items, plus eval note 7.

---
---

# Review packet: G3 plan

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages` · Gate: G3 · Tier: 2 · Branch: `main`, clean · PR: none · Prepared: 2026-09-12

## 1. TL;DR

This plan turns the approved spec's 90 requirements into 13 test-first tasks in four file-disjoint waves: 2, 4, 4 and 3 tasks, never more than the profile's 4 builders. It is re-grouped from the spec's wave table so that components are built before the pages and route table that compose them. Two new facts reshape it: all three project repositories are private, so project cards gain a `repoPublic` branch, and GitHub Free will not serve Pages from the private `muhibm1/Portfolio`, which blocks only the deploy at G5, not the build. You are asked to confirm the drafted project copy and the grown card shape, to choose how the site gets published, and to confirm two smaller calls on content protection and case-study copy. The plan is under 400 lines, so the change does not need splitting.

## 2. Decisions requested

| # | Decision | Recommendation | Alternative | If you choose the alternative |
|---|---|---|---|---|
| G3-D1 | Project copy for workhorse, Shu and wasl, drafted at your G2 request in [project-copy-draft.md](./project-copy-draft.md). Two strings are reused: `workIntro` reuses the hero role line (`Hero.jsx` line 33), and the demo reuses the simulator's own heading and description | Approve the draft verbatim. Two owner checks in it need your yes. First, "This site was built through it." is true only once this change ships. Second, the wasl entry names the project's religious audience on a public page | Edit any string in your approval notes, or reject the copy | T3 copies your edited text from `approvals.md` verbatim; the notes win over the draft. If you reject, cards show name, stack and the private note, with no prose (spec OQ1) |
| G3-D2 | Project card shape. R16 grows by `repoPublic` and `status`; `year` is dropped because no year was supplied. All three repositories are private (confirmed by the main session, GitHub search API) | Approve. A private card shows "Private repository · walkthrough on request" with a mailto link to `personal.email` and no GitHub link. A public card links to the repository. Both branches are tested in T9 | Make the three repositories public before the build and set the flags to true | Cards show GitHub links, and GC43 passes as written. Each repository's README and history become public |
| G3-D3 | How the site gets published while `muhibm1/Portfolio` is private. GitHub Free serves Pages only from public repositories (confirmed by the main session, docs.github.com, 2026-09-12). **This blocks the first deploy at G5, not the build** | Make `muhibm1/Portfolio` public before your first push to `main`. That also publishes the git history, which still contains the phone number (an accepted risk, spec "Retention"). It publishes all of `docs/sdlc/**` too, including agent logs and the approver email address recorded in `approvals.md` | (a) A paid GitHub plan. (b) Keep the source private and publish `dist/` to a separate public repository | (a) No plan change, but it conflicts with `constraints.md` business constraint 5 (no paid services). (b) Changes ADR 0005 and T12. Publishing into another repository needs a write credential (believed, not verified), which breaks R58 and R64 and needs a spec amendment before T12 |
| G3-D4 | Add `src/data/portfolioData.js` to the profile's `sensitive_paths` (spec OQ7), planned in T13 as the spec recommends. Flagged because your G2 note approved "D2-D5", and OQ7 was an open question, not a decision row | Approve. Every later content edit then prompts you; it is the only tool-enforced guard on the employer-derived claims | Decline | T13 skips that profile line, and spec finding 8 stays open |
| G3-D5 | The case-study page drops the modal's hard-coded copy that is not in `portfolioData`: the two bullet lists at `CaseStudyModal.jsx` lines 184 to 204 and the "Production Engineering Standards" paragraph at lines 273 to 280 (confirmed) | Drop it. R23 limits tab bodies to data fields, and these strings describe the Apple triage system but render on all three studies, including Neural Newsletters | Keep them as per-study data you write | That needs new data keys beyond R18's list, which is a spec amendment, plus copy only you can write |

## 3. Evidence

| Check | Command or file read | Exit code | Output | Status |
|---|---|---|---|---|
| Inputs | read profile, CLAUDE.md, codebase map, constraints, intent, spec (1729 lines), evals (563 lines), ADR 0001 to 0008, copy draft, approvals, conductor log | n/a | G2 approved 2026-09-12, "D2-D5 as recommended, draft the project copy for me" | confirmed |
| Every file the plan modifies | read `package.json`, `vite.config.js`, `index.html`, `.gitignore`, `main.jsx`, `App.jsx`, `index.css`, `portfolioData.js`, all 11 components, `.oxlintrc.json` | n/a | matches the spec's line references | confirmed |
| Pre-existing lint defect | read `CaseStudyModal.jsx` lines 5 and 7, `.oxlintrc.json` line 5 | n/a | a hook after an early return; the rule is set to `error` | confirmed; oxlint's report of it is believed |
| Eval conflicts | grep `evals.md` for `github.com/muhibm1`; read lines 114, 137, 178, 339 | 0 | GC43 asserts GitHub links; GC29's pattern hits the component name; the digits appear in 3 cells | confirmed |
| Unused stylesheet | grep `App\.css` over `src/` | 1 (no match) | none | confirmed |
| Wave disjointness and size | read the wave table | n/a | no path repeats within a wave; maximum 4 tasks | confirmed |
| Build, lint, test, install, `npm view`, `gh api` | not run | n/a | this session has no Bash tool | not verified |
| Dependency versions and licences | not run | n/a | n/a | believed, not verified; T1 step 2 (R77) settles them |

Eval pass rates: not applicable, because nothing has been built. The target is 100% in every category (`evals.md` section 1).

## 4. Constraint audit carry-over

The spec's audit passed at re-audit with 0 High findings (confirmed, spec "Constraint audit"). Of the open items, this plan closes five: R82's phone check now reaches the bundle (T12), R52's reporter shape (T12), R85's allowlist (T12), R84's runbook item (Rollback), and R89's `evals.md` literals, handled in Findings outside scope, item 4. Still open for the architect: the R80 to R89 count on the spec's header line, R52's floor, R60's grep file arguments and deploy-job scopes, and R90's manual count.

## 5. Risk register

See [Risks](#risks) above. Each row names its owner; the site owner holds G3-D3 and the permission escalations.

## 6. Design tour

1. **`.github/workflows/deploy.yml` (T12, sensitive).** The only path that publishes. Scopes are per job, every action is pinned to a SHA, there are no secrets, and the smoke steps run inline beside `id-token: write`.
2. **`vite.config.js` (T1, sensitive).** Sets `base`, the CSP and referrer injection, the `404.html` copy, and the test block. A wrong `base` serves a page with no assets.
3. **`index.html` (T2, sensitive).** Only the three font tags go and one favicon line arrives.
4. **`package.json` and `package-lock.json` (T1, sensitive).** Nine packages added at exact versions, one removed, and one regeneration, reviewed by R86.
5. **`.workhorse/profile.yml` (T13, human-owned config).** The test commands and one new sensitive path (G3-D4).
6. **`src/data/portfolioData.js` (T3).** Your record. Additions plus the `phone` deletion only.
7. **`main.jsx`, `basename.js`, `App.jsx`, `SiteLayout.jsx` (T10, T11).** A wrong basename silently empties every route.
8. **`CaseStudyPage.jsx` (T7).** The rename, plus the content removal in G3-D5.
9. **`ThinkingOrbHero.jsx` (T4).** The only component with an animation loop, an observer and listeners.
10. **`WorkIndexPage.jsx` and `ProjectEntry.jsx` (T9).** The `repoPublic` branch. The filter uses query-string links rather than `useState`.
11. **The rest.** Contact components (T5), the simulator and restyles (T6), the hero and cards (T8), docs and redactions (T13), and the tests.

## 7. Checklist

- [ ] G3-D1 and G3-D2 answered in the approval notes (T3 in wave 2 needs them); G3-D3 answered before G5
- [ ] The wave re-grouping is acceptable: spec waves 2 and 3 are reordered, and there are still four waves
- [ ] T13 edits the G1-approved `intent.md` and the human-owned profile (R89 and R53; you accepted R89 at G2)
- [ ] You expect prompts for: one `npm install` (T1), and edits to `package.json`, `package-lock.json`, `vite.config.js` (T1), `index.html` (T2) and `deploy.yml` (T12)
- [ ] Before the first push, you will set the Pages source to "GitHub Actions" and block force pushes and deletions on `main`
- [ ] You will run R84's four-item browser check after the first deploy
- [ ] Findings outside scope, items 1 to 5, go to the eval designer before Verify

Security pre-ship checklist, verbatim from `wh-security-baseline`, with each line's disposition:

- [ ] Every new or changed `for update` policy: all columns listed, each decided, pinning trigger added where the policy is not sufficient. **Waived: no database.** The analogue is R18's pinning test (T1, T3).
- [ ] Every new or changed `for insert` policy: the UPDATE path re-checks the same invariants. **Waived: no database.**
- [ ] Every new function: explicit grant or revoke in the same migration; `SECURITY DEFINER` justified; `search_path` set; anchored to `auth.uid()` or the reason stated. **Waived: no database.**
- [ ] Every `CREATE OR REPLACE`: diffed line by line; side effects confirmed present. **Waived: no database.**
- [ ] Every new policy ships two tests in the same commit: one admitting the right rows, one denying the wrong ones. **Waived: no policies.** The analogue is T7's slug tests (admit three, deny unknown and hostile) and T9's public and private card tests.
- [ ] Deny-side assertions distinguish failure modes: hidden-ness for reads, rejection for writes, and read-back with an admin client for blocked updates. **Waived: no policies.**
- [ ] New storage bucket: private unless there is a written reason. **Waived: no buckets.** Everything in `public/` is world-readable by design.
- [ ] New table holding user free text: length constraint, and a rate limit if insertable in a loop. **Waived: no user input anywhere.**
- [ ] New admin capability writes to an append-only log. **Waived: no admin surface.**
- [ ] New secret or env var covered by `.gitignore` as a pattern; confirmed with `git ls-files`. **Applies:** T2 adds `.env*`; GC73 checks it with `git ls-files`.
- [ ] New third-party import in a runtime path pinned to an exact version. **Applies:** T1 pins all nine (R49), R77 reads each version from disk, R85 enforces the pins in CI (T12), and R59 pins every action to a SHA (T12).

Recommend approve with conditions: answer G3-D1 and G3-D2 in the approval notes (wave 2 needs them), answer G3-D3 before G5, and route Findings outside scope items 1 to 5 to the eval designer before Verify.

```
/workhorse:approve G3
/workhorse:approve G3 --reject "notes"
```

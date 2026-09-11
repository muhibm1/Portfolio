# Evals: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Spec: [spec.md](./spec.md)
Intent: [intent.md](./intent.md)
Written by the eval designer against `spec.md` (1148 lines, R1-R79, M1-M17), `intent.md`,
the eight ADRs, `.workhorse/profile.yml`, `docs/design-brief.md`, and the working tree at
`main` (`src/`, `index.html`, `vite.config.js`, `package.json`, `.gitignore`).

Every factual claim below is labelled **confirmed** (this agent read the file or line named)
or **believed, not verified** (inferred, or carried from an earlier agent). No em-dashes.

## 0. Scope, method, and epistemic labels

- This agent has no Bash tool in this session (same restriction the spec architect recorded).
  Every "exact check" below is written to run in Git Bash on Windows, verbatim, by the eval
  runner in the Verify phase. This agent did not execute any of them; **confirmed** means the
  facts the check is built on (line numbers, exact strings, hex codes, current dependency
  counts) were read directly from the repository, not that the check itself has been run.
- Commands avoid `npx`, `npm install`, `npm i `, `npm uninstall`, `gh workflow run`, `gh
  release` (all profile `ask_commands`) because the eval runner cannot approve those prompts
  itself. Where a case genuinely depends on one of those (an install, an owner-triggered push),
  it is marked `manual` or `CI-only` with the reason, never silently assumed.
- `git`-based checks (`git ls-files`, `git diff`, `git rm`) are carried over verbatim from
  `spec.md`'s own acceptance checks, which assume a git working tree. This agent's own sandbox
  reports no git repository at this path; **believed, not verified** that a `.git` directory
  exists at `C:\Users\alqai\Portfolio` at build time. If it does not, every `git`-based check
  in this file degrades from `Windows` to `manual` (compare two file snapshots by hand), and
  the build phase should confirm this before relying on any `git ls-files`/`git diff` check.
- Case ID convention: golden case `GCn` maps to requirement `Rn` (so `GC31` is the golden case
  for `R31`). A requirement with both an automatable and a visual-only component gets a second
  case `GCnv` (manual). Non-functional case `NFn` maps to metric `Mn`. Edge, failure, and
  adversarial cases are numbered independently (`EGn`, `FLn`, `ADn`) and each names the
  requirement(s) it covers, since one interface can produce several edge/failure/adversarial
  cases against the same requirement.

## 1. Targets

| Category | Target | Rationale |
|----------|--------|-----------|
| Golden | 100% pass | Every one of R1-R79 has a golden case; the outcome does not ship without every one passing |
| Edge | 100% pass | Boundaries on the app's few real interfaces: the URL (slug, hash), the viewport, timers, and device pixel ratio |
| Failure | 100% correct handling | Every row of the spec's own failure-modes table (lines 676-697) becomes one case here |
| Adversarial | 100% rejected or safely handled, **except AD13** | AD13 (clickjacking via a meta-only CSP) is a stated, accepted residual risk per ADR 0006, not a defect; it is scored "documented", not "rejected". Every other adversarial case targets a surface the design already claims to defend (React's default text escaping, the router's catch-all `NotFoundPage`, SHA-pinned least-privilege CI, build-time CSP and audit gates), so 100% is the right bar, not an aspiration |
| Non-functional | see rows | One row per success metric M1-M17, each with the intent's own numeric target |

## 2. Golden cases

One case per requirement, minimum. Grouped by the spec's own lettered sections (A-N).

### A. Routing and page shell (R1-R10)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC1 | R1 | Given `src/main.jsx`, when grepped for the router import, then exactly one `from 'react-router'` line exists and `package.json` pins `react-router` at `7.9.4` with no range prefix | `grep -c "from 'react-router'" src/main.jsx`; `grep -n "\"react-router\": \"7.9.4\"" package.json` | First count is 1; second grep matches, no `^`/`~` | Windows | command |
| GC2 | R2 | Given `import.meta.env.BASE_URL` values, when the exported basename helper runs, then it strips a trailing slash and falls back to `/` on empty | Vitest `"strips the trailing slash from the Vite base url"`: `computeBasename('/Portfolio/') === '/Portfolio'`; `computeBasename('/') === '/'` | Both assertions pass | Windows | `src/basename.test.js` |
| GC3 | R3 | Given the route table, when `/`, `/work`, all 3 case-study paths, and `/work/no-such-study` render, then each shows the expected level-1 heading | RTL render per path, assert `getByRole('heading', {level:1})` text; `grep -c "<Route " src/App.jsx` | Correct heading per path; grep = 4 | Windows | `src/routes.test.jsx` + command |
| GC4 | R4 | Given `SiteLayout`, when `/`, `/work`, `/work/apple-llm-triage` render, then the footer's `mailto:` link is present on all three | RTL, `getByRole('link', {name: /mailto/})` or `container.querySelector('a[href^="mailto:"]')` per route | Present on all 3 routes | Windows | `src/components/SiteLayout.test.jsx` |
| GC5 | R5 | Given the component tree, when `ResumeModal` usage is grepped, then it is imported only by `SiteLayout.jsx` and no route path contains `resume` | `grep -rn "ResumeModal" src/`; `grep -n "resume" src/App.jsx` | One import site; 0 route-path matches | Windows | command |
| GC6 | R6 | Given the rename, when `git ls-files` and a repo-wide email grep run, then `CaseStudyModal.jsx` is gone and the literal email appears only in the data module | `git ls-files \| grep -c CaseStudyModal.jsx`; `grep -rn "mmalqaim@gmail.com" src/` | 0; matches only `src/data/portfolioData.js` | Windows | command |
| GC7 | R7 | Given a route change with no hash, when `/` navigates to `/work`, then the window scrolls to the top | Vitest mocks `window.scrollTo`, navigates, asserts called with `(0, 0)` | Called once, `(0,0)` | Windows | `src/routes.test.jsx` |
| GC8 | R8 | Given `/#simulator`, when `HomePage` mounts, then it scrolls the `#simulator` element into view, smoothly unless reduced motion is preferred | Vitest renders `/#simulator`, spies `scrollIntoView`; repeats with `matchMedia` mocked to match `prefers-reduced-motion: reduce` | Called on the right element; `behavior: 'smooth'` in the first case, no smooth behavior in the second | Windows | `src/pages/HomePage.test.jsx` |
| GC9 | R9 | Given `/work`, when the page mounts, then no active-section scroll-spy listener is registered (distinct from `Navbar`'s own unrelated scroll listener) | Vitest spies `window.addEventListener`, captures `scroll` handlers registered while `WorkIndexPage` is mounted, invokes each, asserts none calls `document.getElementById` for any of the six home section ids | 0 handlers touch the home section ids | Windows | `src/pages/WorkIndexPage.test.jsx` |
| GC10 | R10 | Given `/work`, when the navbar renders, then a `Work` link exists and no `#philosophy` anchor exists | RTL `getByRole('link', {name: /work/i})`; `queryByRole('link', {name: /philosophy/i})` | Link found; anchor query returns null | Windows | `src/components/Navbar.test.jsx` |

### B. Base path and deep links (R11-R14)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC11 | R11 | Given `vite.config.js` `base: "/Portfolio/"`, when the site builds, then every asset path in the built HTML begins `/Portfolio/` and none begins `/assets/` | `npm run build`; `grep -c 'src="/Portfolio/' dist/index.html`; `grep -c '"/assets/' dist/index.html` | Build exits 0; first grep >= 1; second grep = 0 | Windows | command (post-build) |
| GC12 | R12 | Given a completed build, when `dist/index.html` and `dist/404.html` are compared, then they are byte-identical | `sha256sum dist/index.html dist/404.html` (compare the two hash fields) | Identical hashes | Windows | command (post-build) |
| GC13 | R13 | Given deep-link recovery, when `src/` and `index.html` are grepped for storage or redirect-shim tokens, then none appear | `grep -rnE "gtag\|analytics\|dataLayer\|document\.cookie\|localStorage\|sessionStorage" src/ index.html` | 0 matches | Windows | command (shared with M10, GC44) |
| GC14 | R14 | Given `index.html` declares `%BASE_URL%favicon.svg`, when the site builds, then the built HTML references `/Portfolio/favicon.svg` | `grep -c "/Portfolio/favicon.svg" dist/index.html` | >= 1 | Windows | command (post-build) |

### C. The `/work` index (R15-R20)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC15 | R15 | Given `/work`, when it renders, then the three labelled regions contain 3, 3, and 1 `article` elements | RTL: within region "Case studies" `getAllByRole('article').length`; same for "Projects", "Live demo" | 3, 3, 1 | Windows | `src/pages/WorkIndexPage.test.jsx` |
| GC16 | R16 | Given `portfolioData.projects`, when `/work` renders, then `workhorse`, `Shu`, `wasl` all appear and no fourth project does | RTL text assertions; `portfolioData.projects.length === 3` | All 3 present; length 3 | Windows | `src/pages/WorkIndexPage.test.jsx` + `src/data/portfolioData.test.js` |
| GC17 | R17 | Given the live-demo entry, when `/work` renders, then its link `href` ends with `#simulator` | RTL, `link.getAttribute('href')` ends with `#simulator` | True | Windows | `src/pages/WorkIndexPage.test.jsx` |
| GC18 | R18 | Given `portfolioData.js`, when the pinned fields are read, then the four telemetry tuples and the three case-study ids and titles match exactly | Vitest asserts each `telemetry[i]` `{metric,unit,label,context}` and each `caseStudies[i]` `{id,title}` equals the hard-coded expected value | Exact match, all 7 pinned records | Windows | `src/data/portfolioData.test.js` |
| GC19 | R19 | Given `/work`, when compared to `docs/design-brief.md` lines 44-49, then it matches: 1200px max width, two-column asymmetric grid with stagger, 80px between entries, weights 300/400 only, 0px radius, no shadow/border/button, `~` separator, email top-left, socials top-right | Manual visual review against the 9 named attributes | Reviewer confirms all 9 | manual: no layout engine in jsdom; computed grid geometry and visual stagger cannot be asserted without a real browser, which is outside the profile's toolchain (no `e2e` command) | G4 design review, spec architect or owner |
| GC20 | R20 | Given the type filter (All/Case study/Project/Live demo, default All, rendered as text links), when "Project" is activated, then only 3 articles remain | RTL: default render 7 articles; click "Project" link; recount; assert filter controls have `role="link"` not `role="button"` | 7 then 3; links not buttons | Windows | `src/pages/WorkIndexPage.test.jsx` |

### D. The `/work/:slug` case-study page (R21-R26)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC21 | R21 | Given the three known slugs and one unknown slug, when each renders, then the three resolve and the unknown shows `NotFoundPage` | 4 RTL renders, assert heading per case | Correct case study per slug; `NotFoundPage` heading for the unknown one | Windows | `src/components/CaseStudyPage.test.jsx` + `src/pages/NotFoundPage.test.jsx` |
| GC22 | R22 | Given the mockup layout, when a case-study page renders, then the four chip labels and both column headings appear | RTL text assertions for `Challenge`, `System Architecture`, `Production Deployment`, `Measured Impact`, and `Key enterprise metrics` | All present | Windows | `src/components/CaseStudyPage.test.jsx` |
| GC22v | R22 | Given `public/mockup-casestudy.jpg`, when a case-study page renders in a browser, then the eyebrow line, uppercase display title, left-diagram/right-metrics split, and chip row match the mockup | Manual visual review | Reviewer confirms | manual: pixel layout fidelity, no browser rendering in the toolchain | G4 design review |
| GC23 | R23 | Given the four tabs are sourced only from existing fields, when each tab renders for all 3 case studies, then its body text is a substring of the corresponding `challenge` / `diagramSteps` / `solution`+`techStack` / `impact` field | RTL text-substring assertions per tab per case study | Substring match, no invented prose, all 3 case studies | Windows | `src/components/CaseStudyPage.test.jsx` |
| GC24 | R24 | Given `diagramSteps` of varying length, when the flow diagram renders, then the node count equals the array length | Vitest renders the diagram with a stub of length 4 (the 3 real case studies) and also the diagram sub-component alone with stub lengths 2 and 6 | Node count equals array length in every case | Windows | `src/components/CaseStudyPage.test.jsx` |
| GC25 | R25 | Given the `caseStudies` order, when the last case study (`neural-newsletters-llm`) renders, then "next" points at the first (`apple-llm-triage`), and vice versa on the first | RTL, assert `next`/`previous` link hrefs | Wraparound both directions | Windows | `src/components/CaseStudyPage.test.jsx` |
| GC26 | R26 | Given no accounts exist, when any of the 5 rendered routes is checked, then no "Log in" or "Sign up" control exists | RTL `queryByRole(..., {name: /log ?in\|sign ?up/i})` per route | `null` on every route | Windows | `src/routes.test.jsx` |

### E. Hero and the orb (R27-R36)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC27 | R27 | Given `/` renders, then the stacked name heading, the availability pill, all 4 telemetry strings, and the orb canvas are present | RTL text assertions for the heading, pill text, `350+`, `50+`, `-40%`, `99.9%`, and `getByRole('img')` for the canvas | All present, exactly one canvas | Windows | `src/pages/HomePage.test.jsx` |
| GC27v | R27 | Given `public/mockup-home.jpg`, when the hero renders in a browser, then the two-line uppercase name stack and the orb's position match | Manual visual review | Reviewer confirms | manual: pixel layout fidelity | G4 design review |
| GC28 | R28 | Given the orb replaces the monogram, when the repo is grepped, then `MmLogo.jsx` is gone and unreferenced | `git ls-files \| grep -c MmLogo.jsx`; `grep -rn "MmLogo" src/` | 0; 0 | Windows | command |
| GC29 | R29 | Given `ThinkingOrbHero`, when its source and its render output are checked, then it imports only `resolvePreset` and `MODE_FRAMES` from `thinking-orbs/engine` and renders exactly one `<canvas role="img">` | `grep -n "thinking-orbs" src/components/ThinkingOrbHero.jsx`; RTL asserts one `role="img"` element; `grep -c "paintFrame\|paintLines\|ThinkingOrb" src/components/ThinkingOrbHero.jsx` | One import line naming only those two symbols; one canvas; second grep = 0 | Windows | command + `src/components/ThinkingOrbHero.test.jsx` |
| GC30 | R30 | Given the OFF+BRAND stops, when the painter source is grepped, then all four hex values are present and no `shadowBlur` call exists | `grep -cE "#facb0e\|#f06ba8\|#78bae6\|#ffffff" src/components/ThinkingOrbHero.jsx`; `grep -c "shadowBlur" src/components/ThinkingOrbHero.jsx` | First >= 4 (all stops present); second = 0 | Windows | command |
| GC30v | R30 | Given `public/mockup-home.jpg`, when the orb renders in a real browser, then dots are coloured by depth across the amber-rose-blue-white gradient with no glow | Manual visual review (jsdom has no canvas rendering) | Reviewer confirms | manual: canvas pixels are not renderable in jsdom | G4 design review |
| GC31 | R31 | Given a viewport >= 1024px, when the orb mounts, then its inline `style.width` is `420px`, within the 380-440px range | Vitest, jsdom default viewport (`window.innerWidth`), read `canvas.style.width` (not `getBoundingClientRect`, per R31's own reasoning: jsdom has no layout) | `'420px'`; `380 <= 420 <= 440` | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| GC32 | R32 | Given `prefers-reduced-motion: reduce` matches, when the orb mounts, then it paints one frame at `t=0.6` and never calls `requestAnimationFrame` | Vitest mocks `matchMedia` to match the reduce query, spies `requestAnimationFrame`, asserts 0 calls after mount and after a flushed tick | 0 calls | Windows, needs the R54 `matchMedia` stub | `src/components/ThinkingOrbHero.test.jsx` |
| GC33 | R33 | Given `IntersectionObserver` reports the canvas offscreen, or `document.visibilityState` becomes `hidden`, when either fires, then the loop pauses and resumes on the opposite signal | Vitest stubs `IntersectionObserver`, fires `{isIntersecting:false}` then `{isIntersecting:true}`; separately sets `document.visibilityState='hidden'` and fires `visibilitychange`, then reverses | `cancelAnimationFrame` on pause, `requestAnimationFrame` on resume, both paths | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| GC34 | R34 | Given the orb is mounted, when it unmounts, then the frame is cancelled and the observer disconnected | Vitest mount then unmount, spies assert both called | Both called exactly once | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| GC35 | R35 | Given `getContext('2d')` returns `null` (the R54 default stub), when the orb mounts, then it returns without throwing | Vitest renders with the default setup-file stub; assert no exception and the canvas element still renders | No throw; canvas present | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| GC36 | R36 | Given `devicePixelRatio = 2` and `size = 420`, when the orb mounts, then the backing store is `840 x 840` | Vitest stubs `window.devicePixelRatio = 2`, asserts `canvas.width === 840` and `canvas.height === 840` | `840`, `840` | Windows | `src/components/ThinkingOrbHero.test.jsx` |

### F. Fonts and design tokens (R37-R40)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC37 | R37 | Given the Google Fonts tags are deleted, when `index.html` and `dist/` are grepped, then no reference remains | `grep -rc "fonts.googleapis.com\|fonts.gstatic.com" index.html dist/` | 0 everywhere | Windows | command (post-build; shared with M9) |
| GC38 | R38 | Given self-hosted fonts, when `src/main.jsx` and the build are checked, then exactly 12 `@fontsource` import lines exist and at least 12 `.woff2` files ship | `grep -c "@fontsource" src/main.jsx`; count `.woff2` files under `dist/assets/` | 12; >= 12 | Windows | command (post-build) |
| GC39 | R39 | Given the `@theme` tokens and the removed hard-coded stack, when the built CSS is read, then `font-family:Inter` is present and the `body` rule no longer starts with `-apple-system` | `grep -c "font-family:Inter" dist/assets/*.css`; `grep -c "\-apple-system" dist/assets/*.css` restricted to the `body{` rule (read the rule, don't just grep the whole file, since `-apple-system` could survive elsewhere as a fallback name) | Inter present >= 1; `body{` rule does not start with `-apple-system` | Windows | command (post-build). This is the silent-failure trap the architect flagged: today Inter loads from Google and is applied to nothing (`src/index.css:22`, `src/App.jsx:50`, both confirmed) |
| GC40 | R40 | Given the site-wide reduced-motion block, when the built CSS is read, then a `prefers-reduced-motion` media query exists | `grep -c "prefers-reduced-motion" dist/assets/*.css` | >= 1 | Windows | command (post-build) |

### G. Personal data (R41-R44)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC41 | R41 | Given the phone number is deleted (not blanked), when `src/`, `dist/` are grepped, then no trace remains | `grep -rn "508-1536" src/ dist/`; `grep -rn "personal.phone" src/` | 0; 0 | Windows | command (post-build; shared with M8) + `src/data/portfolioData.test.js` ("publishes no phone number") |
| GC42 | R42 | Given email and LinkedIn remain reachable, when `/`, `/work`, and a case-study page render, then both are present | RTL, assert a `mailto:` link and a LinkedIn `href` on all 3 | Present on all 3 | Windows | `src/components/SiteLayout.test.jsx` |
| GC43 | R43 | Given `personal.github`/`githubHandle`, when `/work` renders, then the three project links point at `https://github.com/muhibm1/<name>` | RTL, assert hrefs for `workhorse`, `Shu`, `wasl` | Exact URLs | Windows | `src/pages/WorkIndexPage.test.jsx` |
| GC44 | R44 | Given no tracking of any kind, when `src/` and `index.html` are grepped, then none of the six named tokens appear | Same grep as GC13 | 0 matches | Windows | command (shared with GC13, M10) |

### H. The simulator (R45-R48)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC45 | R45 | Given fictional data, when the simulator renders, then a visible "illustrative example, fictional" label appears next to the scenario list and again on the payload inspector | RTL, `getAllByText(/illustrative example/i).length >= 2` and `getAllByText(/fictional/i).length >= 1` | >= 2 occurrences of the first phrase, at least 1 of the second | Windows | `src/components/InteractiveTriageSimulator.test.jsx` |
| GC46 | R46 | Given the **three** `setTimeout` calls at `InteractiveTriageSimulator.jsx` lines 75, 79, 83 (confirmed by reading the file; corrects the carried "four" finding), when the component unmounts mid-run, or Reset is clicked mid-run, then no pending timers remain | Vitest fake timers: click Run, unmount before 1500ms elapses, assert `vi.getTimerCount() === 0`; separately click Run then Reset before completion, assert the same | 0 pending timers in both cases | Windows | `src/components/InteractiveTriageSimulator.test.jsx` |
| GC47 | R47 | Given the copy-confirmation timers at `Navbar.jsx:19` and `ContactFooter.jsx:12` (both confirmed, `setTimeout(() => setCopied(false), 2000)`, no cleanup today), when either component unmounts before 2000ms, then no pending timer remains | Vitest fake timers, click copy, unmount early, `vi.getTimerCount() === 0`, once per component | 0 pending timers, both components | Windows | `src/components/Navbar.test.jsx` + `src/components/ContactFooter.test.jsx` |
| GC48 | R48 | Given the three `navigator.clipboard.writeText` calls (`Navbar.jsx:17`, `ContactFooter.jsx:10`, `ResumeModal.jsx:10`), when the promise rejects, then the button shows a failed state, never "Copied" | Vitest mocks `writeText` to reject, clicks each copy button, asserts no "Copied" text renders | No "Copied" text, all 3 components | Windows | `src/components/Navbar.test.jsx` + `src/components/ContactFooter.test.jsx` + `src/components/ResumeModal.test.jsx` |

### I. Test toolchain (R49-R54)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC49 | R49 | Given exact-pinned devDependencies, when `package.json` is read, then none of the 5 new test packages carry `^`/`~` | `node -e "const d=require('./package.json').devDependencies; ['vitest','@testing-library/react','@testing-library/dom','@testing-library/jest-dom','jsdom'].forEach(k=>{if(!/^[0-9]/.test(d[k])) throw new Error(k)})"` | Exits 0 | Windows | command |
| GC50 | R50 | Given the `test` block in `vite.config.js`, when read, then it declares `environment: 'jsdom'`, `globals: true`, `setupFiles`, `css: false`, `restoreMocks: true`, and both `npm test` and `npm run build` still exit 0 | `grep` for each key; `npm test`; `npm run build` | All keys found; both exit 0 | Windows | command |
| GC51 | R51 | Given `package.json` scripts, when read, then `test` is `vitest run` and `test:watch` is `vitest`, both bare binary invocations | `grep -n "\"test\":\|\"test:watch\":" package.json`; `npm test` on Windows | Exact script bodies; exits 0 | Windows | command |
| GC52 | R52 | Given the suite runs, when `npm test` completes, then it reports at least 12 passing and 0 skipped | Run `npm test`, read the Vitest summary line | `Tests  N passed` with N >= 12, `0 skipped` | Windows | command (reads `npm test` output) |
| GC53 | R53 | Given `.workhorse/profile.yml`, when read, then `commands.test` is `npm test` and `commands.test_file` is `npm test --` | `grep -n 'test: "npm test"' .workhorse/profile.yml`; `grep -n 'test_file: "npm test --"' .workhorse/profile.yml` | Both found | Windows | command |
| GC54 | R54 | Given `src/test/setup.js`, when read, then it imports `@testing-library/jest-dom/vitest` and stubs `matchMedia`, `IntersectionObserver`, `HTMLCanvasElement.prototype.getContext` | `grep -c "jest-dom/vitest"`, `"matchMedia"`, `"IntersectionObserver"`, `"getContext"` in the file; `npm test` output grepped for `"Not implemented"` | All greps found; 0 "not implemented" warnings in the run | Windows | command + observed cleanly across every other Vitest file |

### J. Deploy pipeline (R55-R64)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC55 | R55 | Given exactly one workflow, when `.github/workflows/` is listed, then it contains 1 file triggered on `push` (to `main`) and `workflow_dispatch` | `ls .github/workflows \| wc -l`; `grep -n "on:" -A3 .github/workflows/deploy.yml` | Count = 1; both triggers present | Windows (count + trigger grep); YAML-validity itself is `manual`: no YAML parser is part of this project's toolchain by design (avoids an extra dependency), so a malformed file is confirmed only by GitHub's own parser refusing the first push (Actions tab shows no "workflow file issue") | command + manual first-push confirmation |
| GC56 | R56 | Given the build job, when the workflow is read, then `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npm audit --audit-level=high --omit=dev` appear in that order | `grep -n` each command, compare line numbers ascending | Strictly ascending order | Windows (static order); "non-zero exit stops the deploy" is `CI-only`, confirmed on the first workflow run | command + CI-only confirmation |
| GC57 | R57 | Given the non-blocking full-tree audit, when the workflow is read, then a second `npm audit --audit-level=high` step (no `--omit=dev`) is paired with `continue-on-error: true` | `grep -A2 "npm audit --audit-level=high\"$" .github/workflows/deploy.yml` (the line with no `--omit=dev` suffix) for the following `continue-on-error: true` | Present, paired | Windows | command |
| GC58 | R58 | Given the official Pages flow, when the workflow is read, then it uses `actions/configure-pages`, `actions/upload-pages-artifact` with `path: dist`, `actions/deploy-pages`, in two jobs, the second bound to `environment: github-pages` | `grep` for each action name and for `environment: github-pages` | All present | Windows | command |
| GC59 | R59 | Given SHA-pinning, when every `uses:` line is read, then each is pinned to a 40-character commit SHA with a trailing tag comment | `total=$(grep -c "uses:" .github/workflows/deploy.yml); pinned=$(grep -cE "uses: .*@[0-9a-f]{40}" .github/workflows/deploy.yml); [ "$total" = "$pinned" ]` | Equal counts | Windows | command |
| GC60 | R60 | Given least-privilege permissions, when the workflow-level `permissions:` block is read, then it is exactly `contents: read`, `pages: write`, `id-token: write` | `grep -A3 "^permissions:" .github/workflows/deploy.yml` | Exactly those 3 keys, nothing wider | Windows | command |
| GC61 | R61 | Given serialized deploys, when the `concurrency:` block is read, then it is `group: pages`, `cancel-in-progress: false` | `grep -A2 "^concurrency:" .github/workflows/deploy.yml` | Both values present | Windows | command |
| GC62 | R62 | Given `actions/setup-node`, when its step is read, then `node-version: 22` and the npm cache are both set | `grep -A3 "actions/setup-node" .github/workflows/deploy.yml` | `node-version: 22` (or `'22'`) and `cache: npm` (or `cache: 'npm'`) both present | Windows | command |
| GC63 | R63 | Given the smoke step, when the workflow is read, then a post-deploy step fetches `page_url`, checks for HTTP 200 and the owner's name, retrying 5 times at 10-second intervals | `grep -A10 "deployment.outputs.page_url" .github/workflows/deploy.yml` for the retry loop and the name check | Static structure present | Windows (structure); actual pass/fail against the live URL is `CI-only`, requires the owner's first push | command + CI-only first-run confirmation |
| GC64 | R64 | Given no secrets, when the workflow is read, then it references none | `grep -c "secrets\." .github/workflows/deploy.yml` | 0 | Windows | command |

### K. Security baseline defaults (R65-R69)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC65 | R65 | Given the build-only CSP injection, when `dist/index.html`, `dist/404.html`, and source `index.html` are read, then the meta tag is first in `<head>` in the built files only | `grep -c "Content-Security-Policy" dist/index.html dist/404.html`; `grep -c "Content-Security-Policy" index.html` | 1, 1, 0 | Windows | command (post-build) |
| GC66 | R66 | Given `script-src 'self'`, when `dist/index.html` is read, then no inline `<script>` without a `src` attribute exists | grep/small parse for `<script` tags lacking `src=` | 0 matches | Windows | command (post-build). This is the highest-value trap the architect flagged: Vite's inline module-preload polyfill would otherwise blank the page in production only |
| GC67 | R67 | Given `security.txt`, when `dist/.well-known/security.txt` is read, then `Contact`, `Expires`, `Preferred-Languages`, `Canonical` all appear | `grep -c "^Contact:\|^Expires:\|^Preferred-Languages:\|^Canonical:" dist/.well-known/security.txt` | File exists; all 4 fields present | Windows | command (post-build) |
| GC68 | R68 | Given Dependabot, when `.github/dependabot.yml` is read, then weekly `npm` and `github-actions` ecosystems exist with `open-pull-requests-limit: 5` | `grep -c "package-ecosystem: \"npm\""`, `"package-ecosystem: \"github-actions\""`, `"open-pull-requests-limit: 5"` | All present | Windows (structure); full YAML-validity `manual` for the same reason as GC55 | command + manual confirmation |
| GC69 | R69 | Given `docs/hosted-config.md`, when read, then it names the Pages source, repository visibility, the deliberate absence of branch protection with a reason, and the absence of any Actions secret | `grep -c "GitHub Actions"`, `"visibility"` (or the actual word used), `"branch protection"`, `"secret"` in the file | All 4 present | Windows | command |

### L. Cleanup and toolchain repair (R70-R73)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC70 | R70 | Given the orphan Windows-only binding is removed, when `package.json` is read, then no trace remains | `grep -c rolldown package.json` | 0 | Windows | command |
| GC71 | R71 | Given a clean reinstall, when `npm run lint` runs afterward, then it exits 0 | `npm run lint` | Exit 0 | Windows, **but only after the owner approves the `npm install` ask_command**; the eval runner cannot trigger that reinstall itself | command; prerequisite is manual (owner-approved install) |
| GC72 | R72 | Given `generate_viewer.cjs` is removed via `git rm`, when `git ls-files` is read, then no match remains | `git ls-files \| grep -c generate_viewer` | 0 | Windows | command |
| GC73 | R73 | Given `.gitignore` uses the pattern, not an enumeration, when read, then `.env*` appears once and no tracked env file exists | `grep -c "^\.env\*" .gitignore`; `git ls-files \| grep -cE "^\.env"` | 1; 0 | Windows | command |

### M. Non-functional and platform (R74-R78)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC74 | R74 | Given the build must succeed on both hosts, when `npm run build` runs, then it exits 0 on Windows and on the first `ubuntu-latest` Actions run | `npm run build` (Windows); read the first run's `build` step conclusion (CI) | Exit 0 both places | Windows (local half) + CI-only (ubuntu half) | command + first workflow run |
| GC75 | R75 | Given no shell builtins in scripts, when `package.json` `scripts` is read, then none contains `&&`, a POSIX-only separator, or a shell builtin | `node -e "const s=require('./package.json').scripts; Object.values(s).forEach(v=>{if(/&&\|\|\||\/bin\//.test(v)) throw new Error(v)})"` | Exits 0 | Windows | command |
| GC76 | R76 | Given `build.max_parallel: 4`, when `.workhorse/profile.yml` is read, then the value is present | `grep -n "max_parallel: 4" .workhorse/profile.yml` | Found | Windows (config presence only; this does not prove the conductor actually capped concurrency at 4 during the Build phase, which is a runtime property no single artifact records; see [Notes for the architect](#notes-for-the-architect)) | command |
| GC77 | R77 | Given every added package, when the G4 evidence table is reviewed, then it has one row per added package with a version resolved from `node_modules/<pkg>/package.json` and a licence read the same way | Manual review of 9 rows: `react-router`, `@fontsource/inter`, `@fontsource/jetbrains-mono`, `@fontsource/space-grotesk`, `vitest`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `jsdom` | 9 rows, each with a resolved version and licence | manual: requires an owner-approved `npm install` before any version/licence can be read from disk; this is evidence-gathering for a human-reviewed table, not a pass/fail command | G4 evidence table |
| GC78 | R78 | Given exactly 4 runtime deps added, 5 devDeps added, 1 runtime dep removed, when `package.json` is read, then the final counts and membership match | `node -e "const p=require('./package.json'); const d=Object.keys(p.dependencies), v=Object.keys(p.devDependencies); if(d.length!==10\|\|v.length!==10) throw 1; if(d.includes('@rolldown/binding-win32-x64-msvc')) throw 2;"` | Exits 0 (10 dependencies, 10 devDependencies today's baseline is 7 and 5 respectively, confirmed by reading `package.json`) | Windows | command |

### N. Visual style (R79)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC79 | R79 | Given the OFF+BRAND treatment (0px card radius, 10px on interactive elements, no shadows, one chromatic element), when `src/components/` is grepped, then no `shadow-` utility class remains, **if D4 resolves in favour of the design brief over the mockups** | `grep -rc "shadow-" src/components/` | 0, **conditional on D4's resolution**; if D4 instead favours the mockups' rounded/shadowed look, this check does not apply and the eval runner must read the recorded D4 decision before running it | Windows, conditional | command, contingent on D4 |
| GC79v | R79 | Given the Varick card pattern (title, context paragraph, capability bullets, link) and the OFF+BRAND palette, when the home case-study cards render in a browser, then they match `docs/design-brief.md` lines 25-42 | Manual visual review | Reviewer confirms | manual: palette/type fidelity, no browser rendering in the toolchain | G4 design review |

### Content preservation (R18 / M17)

| ID | Req/Metric | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|------------|----------|--------------|----------|--------------|----------------|
| GC-CP | R18, M17 | Given `src/data/portfolioData.js` is extended, not rewritten, when the diff is reviewed, then only additive keys appear and every existing string below is unchanged, verbatim | Manual diff review (`git diff src/data/portfolioData.js`, or a before/after file comparison if no git history exists) against this checklist: `personal.name` "Muhammad Muhibullah"; `personal.role` "Forward Deployed Engineer & Systems Integration"; `personal.subtitle` "Data Engineer at Apple (via TCS) · Austin, TX"; `personal.location` "Austin, TX"; `personal.linkedin` "https://www.linkedin.com/in/muhibm1/"; `personal.linkedinHandle` "linkedin.com/in/muhibm1"; `personal.status` "Available for Forward Deployed Engineering & Solutions Eng Roles"; all 4 `telemetry` entries (metric/unit/label/context); all 3 `caseStudies` id/title/client/role/period; all 3 `experience` company/role/period/location; both `education` degree/institution/graduation | Every listed string present unchanged; `personal.phone` deleted (R41); only `projects`, `demos`, `workIntro`, `personal.github`, `personal.githubHandle` are new | manual: the narrow subset (telemetry, case-study ids/titles) is separately automated in GC18; the full breadth named by M17 (dates, employers, roles, degrees) is a semantic "nothing rephrased" judgment a diff tool cannot make on its own, since a rewritten sentence would still be a valid string, just a different one | G4 evidence table |

## 3. Edge cases

Boundaries, ordering, concurrency, and idempotency on the app's real interfaces: the URL
(slug and hash), the viewport, timers, and device pixel ratio.

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| EG1 | R2 | Given `BASE_URL` is exactly `/` or has a doubled trailing slash `/Portfolio//`, when the helper runs, then it still returns a clean value | `computeBasename('/')`; `computeBasename('/Portfolio//')` | `'/'`; `'/Portfolio'` (all trailing slashes stripped) | Windows | `src/basename.test.js` |
| EG2 | R21 | Given a slug with a trailing slash, `/work/apple-llm-triage/`, when it renders, then the app's actual matching behaviour (match or `NotFoundPage`) is pinned, not assumed | RTL render, assert whichever heading the router actually produces | One consistent, asserted outcome (no flapping between runs) | Windows | `src/routes.test.jsx` |
| EG3 | R21 | Given slugs are case-sensitive, `/work/Apple-LLM-Triage` (wrong case), when it renders, then it does not match | RTL render, assert `NotFoundPage` heading | `NotFoundPage` | Windows | `src/components/CaseStudyPage.test.jsx` |
| EG4 | R21 | Given a URL-encoded space slug, `/work/%20`, when it renders, then it does not throw | RTL render | `NotFoundPage`, no exception | Windows | `src/components/CaseStudyPage.test.jsx` |
| EG5 | R8 | Given a hash with no matching element, `/#nonexistent-id`, when `HomePage` mounts, then it does not call `scrollIntoView` and does not throw | RTL render, spy `scrollIntoView` | 0 calls, no exception | Windows | `src/pages/HomePage.test.jsx` |
| EG6 | R8 | Given a unicode hash, `/#\u65e5\u672c\u8a9e`, when `HomePage` mounts, then it does not throw | RTL render | No exception | Windows | `src/pages/HomePage.test.jsx` |
| EG7 | R20 | Given the filter cycles through all 4 values and back to All, when done, then the article count returns to 7 and the original order (case studies, then projects, then the demo) is preserved | RTL click sequence, recount and reorder-check after each click | 7 at the end, stable relative order | Windows | `src/pages/WorkIndexPage.test.jsx` |
| EG8 | R24 | Given `diagramSteps` arrays of length 1 and length 6 (stubbed data, since all 3 real case studies happen to have length 4), when the diagram renders, then the node count still equals the array length | Vitest renders the diagram sub-component with stub props | Node count 1 and 6 respectively | Windows | `src/components/CaseStudyPage.test.jsx` |
| EG9 | R25 | Given a middle case study (`apple-data-health`), when it renders, then both "previous" and "next" point at its immediate neighbours, not wrapped | RTL, assert both link hrefs | `apple-llm-triage` (previous), `neural-newsletters-llm` (next) | Windows | `src/components/CaseStudyPage.test.jsx` |
| EG10 | R31 | Given the two explicit boundaries the spec pins, when the viewport is exactly 1024px and exactly 320px, then the canvas is `420px` and `280px` (the clamped minimum) respectively | Vitest sets `window.innerWidth` to 1024 then 320, reads `canvas.style.width` | `'420px'`; `'280px'` | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| EG11 | R32 | Given `matchMedia`'s `change` event fires mid-session (no-preference to reduce), when it fires, then the orb switches from animating to a single static frame without unmounting | Vitest mounts with no preference, spies `requestAnimationFrame`, fires the mocked `change` event, asserts no further `requestAnimationFrame` calls after the event | Animation stops live, no remount needed | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| EG12 | R34 | Given an animation frame is scheduled but has not yet fired, when the component unmounts, then the pending callback is cancelled and never executes a paint after unmount | Vitest schedules a frame, unmounts, manually invokes the captured callback id, asserts no canvas draw call occurs | No post-unmount paint | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| EG13 | R36 | Given `devicePixelRatio` is `0` (falsy) or `3` (above the cap), when the orb mounts with `size=420`, then the backing store is `420` (falls back to 1) and `840` (clamped to 2) respectively | Vitest stubs each value, reads `canvas.width` | `420`; `840` | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| EG14 | R46 | Given Run is clicked and the component unmounts at `t=0`, before the first 400ms timeout fires, when unmount happens, then 0 timers remain | Vitest fake timers, click Run, unmount immediately, `vi.getTimerCount() === 0` | 0 | Windows | `src/components/InteractiveTriageSimulator.test.jsx` |
| EG15 | R47, R48 | Given a rapid double-click on a copy button within the same tick, when both clicks register, then only one pending timeout remains (not two overlapping) and the component still clears to 0 timers on unmount | Vitest fake timers, fire `click` twice synchronously, assert `vi.getTimerCount() === 1` immediately after, then unmount and assert 0 | 1 then 0 | Windows | `src/components/Navbar.test.jsx` + `src/components/ContactFooter.test.jsx` |
| EG16 | R18, R25 | Given `caseStudies` array order, when read across renders (the `/work` index and the prev/next chain), then the order is stable: `apple-llm-triage`, `apple-data-health`, `neural-newsletters-llm` | RTL, assert DOM order in both surfaces matches this sequence | Stable order in both places | Windows | `src/pages/WorkIndexPage.test.jsx` + `src/components/CaseStudyPage.test.jsx` |
| EG17 | R59 | Given the pinning regex itself must not be fooled, when a `uses:` line carries a 39- or 41-character hex string (one character short or long), then the check correctly reports it as **not** pinned | Construct a fixture line with a 39-char and a 41-char hex suffix, run the GC59 regex against it | Neither counted as pinned (guards the verification instrument's own off-by-one) | Windows | command (test fixture, not the live workflow file) |
| EG18 | R55 | Given the `push` trigger is scoped, when the workflow is read, then it triggers on `main` only, not on tags or other branches | `grep -A5 "on:" .github/workflows/deploy.yml` for `branches: [main]` or equivalent scoping under `push:` | Scoped to `main` | Windows | command |
| EG19 | R67 | Given `Expires` is "one year from the build date", when the build date is a leap day (`2028-02-29`), then the computed date is still valid (does not throw or produce `2029-02-29`, which does not exist) | Vitest or a small Node check calling the builder's date-math function (once it exists) with a mocked system date of `2028-02-29` | A valid ISO date is produced, no exception | Windows, once the generator is unit-testable; otherwise manual | command (depends on the builder's implementation shape) |
| EG20 | R73 | Given the pattern `.env*`, when hypothetical filenames are checked, then `.env`, `.env.local`, and `.env.production` are all ignored consistently | `git check-ignore --no-index .env .env.local .env.production` (no files are created) | All three reported as ignored | Windows | command |
| EG21 | R12 | Given the build should be idempotent, when `npm run build` runs twice in a row with no source changes, then `dist/index.html` is byte-identical both times | `npm run build; sha256sum dist/index.html \| cut -d" " -f1 > h1.txt; npm run build; sha256sum dist/index.html \| cut -d" " -f1 > h2.txt; diff h1.txt h2.txt` | No diff output (identical hash) | Windows | command |

## 4. Failure cases

One case per row of the spec's own failure-modes table (`spec.md` lines 676-697), plus the
value each adds beyond that table's own "Eval" column.

| ID | Req | Failure | Handling asserted | Exact check | Expected | Automatable |
|----|-----|---------|--------------------|--------------|----------|--------------|
| FL1 | R55, R58 | npm registry slow or down, `npm ci` times out in CI | Deploy job never runs because the build job it `needs:` failed; last good deployment stays live | Read the first run where this occurred: build job status `failure`, deploy job status `skipped` | Deploy job skipped, not run with a broken artifact | CI-only |
| FL2 | R70 | `@rolldown/binding-win32-x64-msvc` still present, `npm ci` fails on Linux with `EBADPLATFORM` | R70 removes it before the first CI run | Preventive: GC70's grep (0 matches). Confirmatory: first `ubuntu-latest` run's install step succeeds | 0 matches (Windows); install step succeeds (CI) | Windows (preventive) + CI-only (confirmatory; `EBADPLATFORM` cannot be reproduced on the Windows host) |
| FL3 | R71 | `package-lock.json` out of sync with `package.json`, `npm ci` fails | R71 commits the regenerated lockfile in the same commit | `npm ci` on the Windows host using the committed lockfile | Exits 0 (proxy for "in sync"); full confirmation is the first `ubuntu-latest` run | Windows (proxy) + CI-only (final confirmation) |
| FL4 | R11 | Wrong `base`, site serves with no CSS or JS | The GC11 asset-path grep must actually catch this class of defect, not just pass on a correct build | Build once with `base: "/"` deliberately (a red-team build in a scratch copy), run the GC11 grep against that output | `grep -c '"/assets/' dist/index.html` > 0, proving the check is sensitive to this exact failure | Windows |
| FL5 | R12 | `dist/404.html` missing or stale relative to `dist/index.html` | R12's `closeBundle` copy step, verified by GC12's hash comparison | After a build, modify `dist/index.html` in place (simulate drift) without re-running the copy step, then run GC12's hash comparison | Hash comparison correctly reports a mismatch | Windows |
| FL6 | R2 | `basename` keeps its trailing slash, every route falls through to `NotFoundPage` | R2's tested helper strips it before `BrowserRouter` sees it | Vitest mounts the router with the **raw, unstripped** `'/Portfolio/'` passed directly as `basename` (bypassing the helper), renders `/work` | Every real path renders `NotFoundPage`, demonstrating why R2's helper is load-bearing, contrasted against GC3 which uses the stripped value and succeeds | Windows |
| FL7 | R65, R66 | Vite injects an inline module-preload polyfill script, CSP blocks it, blank page in production only | GC66's grep is the build-time preventive check; jsdom does not enforce CSP, so no unit test can prove a real browser boots correctly under the injected policy | GC66 grep (preventive); separately, load `dist/index.html` via a local static file server in an actual browser (or the deployed URL) and confirm no CSP violation in the console | 0 inline scripts without `src` (Windows); no console CSP violation (manual) | Windows (preventive) + manual (the actual gap the architect flagged: this is the one failure class this eval suite cannot fully close) |
| FL8 | R65 | CSP too strict for a `@fontsource` `url()`, fonts silently fall back to the system stack with no error | `font-src 'self'` should cover same-origin `.woff2`; no automated signal exists if it doesn't | Load the built site in a real browser, inspect computed `font-family` on `body` and headings, confirm no console CSP violation for font requests | Inter/JetBrains Mono/Space Grotesk actually applied, no console warning | manual: the smoke step (R63) checks only HTTP 200 and the owner's name, not font application |
| FL9 | R35 | `getContext('2d')` returns `null`, orb paints nothing | R35 returns early; the rest of the page must still render | Vitest renders `/` with the default (null-returning) canvas stub and asserts the hero heading, telemetry, and nav are still present | Page renders fully, minus the orb's drawing; failure is contained, not page-wide | Windows |
| FL10 | R32 | `matchMedia` is entirely absent (not just non-matching), reduced-motion check would throw without a feature-detect | The component feature-detects (`typeof matchMedia > "u"`), as the upstream package does | Vitest deletes `window.matchMedia` entirely before mounting | No exception; component renders and animates (falls back to the animating path) | Windows |
| FL11 | R33 | `IntersectionObserver` is absent, no pause when offscreen (accepted: battery drain only, not a page failure) | Feature-detected, runs unpaused | Vitest deletes `window.IntersectionObserver` before mounting | No exception; `requestAnimationFrame` is called (runs unpaused, not stuck idle) | Windows |
| FL12 | R34 | The orb's animation loop outlives repeated mount/unmount cycles (a slow leak across navigation) | R34's cleanup, exercised many times, not just once | Vitest mounts and unmounts the orb 20 times in a loop, asserts `cancelAnimationFrame` call count equals `requestAnimationFrame` call count at the end | Equal counts, no net accumulation | Windows |
| FL13 | R46 | Simulator timers outlive the component, callers would set state on an unmounted component | R46's clearing prevents the React 19 unmounted-update warning | Vitest unmounts mid-run, asserts no `console.error` matching "state update on an unmounted component" was logged | 0 such warnings | Windows |
| FL14 | R48 | Clipboard permission denied, button would report "Copied" when nothing copied | Covered by GC48 directly; no separate mechanism needed | See GC48 | See GC48 | Windows |
| FL15 | R69 | GitHub Pages Settings > Pages > Source is not "GitHub Actions", `actions/deploy-pages` fails | R69 records the required setting; the owner sets it before the first push | Read the first deploy job's failure message (it names the missing setting) | Deploy job fails with a message naming the Pages source setting | manual: a dashboard setting, not a file; GC69 is the preventive documentation check |
| FL16 | R63 | Pages propagation lag, smoke step fetches a stale or missing page immediately after deploy | R63's retry (5 times, 10-second intervals) | Read the first run's smoke step log for retry attempts before success | Succeeds within 5 attempts, or fails loudly naming the last response | CI-only |
| FL17 | R56, R57 | An `npm audit` high-severity advisory in a runtime dependency blocks the deploy | Intended behaviour, not a defect: the blocking step is deliberately narrower than the full-tree audit | Read the run's audit step conclusion (`failure`) and confirm the deploy job did not run | Deploy blocked, previous deployment stays live | CI-only: cannot be manufactured safely without deliberately shipping a vulnerable dependency |
| FL18 | R68 | A Dependabot PR is merged, a deploy runs immediately because merging to `main` is the release | Accepted risk, recorded in the risk register: `open-pull-requests-limit: 5` plus the full CI gate on every push are the only mitigations | GC68 (limit present) and GC56 (full gate runs on every push, including a Dependabot merge) | Both present | Windows |
| FL19 | R61 | Two pushes in quick succession interleave deployments, wrong artifact ends up live | `concurrency: {group: pages, cancel-in-progress: false}` serialises them | GC61 (structural); actual serialization is `CI-only`, observable only in the Actions run history after two near-simultaneous pushes | Structural presence (Windows); serialized run history (CI-only) | Windows (structure) + CI-only (behavior) |
| FL20 | R77 | Node 21 (dev host) vs Node 22 (CI): `npm install` prints `EBADENGINE` locally | R77 requires reading the actual `engines` range from `node_modules/vitest/package.json` after install and recording it | Manual: run the owner-approved install, read the warning text and the `engines` field | Warning observed and recorded, no silent assumption | manual: requires an owner-approved `npm install` |

## 5. Adversarial cases

The attack surface here is thin but real: the URL is the only attacker-controlled input (a
public GitHub Pages URL can be crafted by anyone), and the CI workflow's token permissions,
action pinning, and audit gate are the authorization/supply-chain decisions. Target is 100%
rejected or safely handled, except AD13, which is a named, accepted residual risk.

| ID | Req | Attack | Exact check | Expected | Automatable |
|----|-----|--------|--------------|----------|--------------|
| AD1 | R21 | XSS payload as a slug: `/work/<script>alert(1)</script>` | RTL navigates to the (URL-encoded) path, inspects the DOM for any injected `<script>` element and for `window.alert` being called | `NotFoundPage` renders; no script node injected; `alert` never called (React escapes text by default) | Windows |
| AD2 | R21 | Path traversal as a slug: `/work/..%2F..%2Fetc%2Fpasswd` | RTL navigates, asserts no exception and no unexpected content | `NotFoundPage`, no crash, no filesystem access attempted (none is possible client-side, but the router must not choke on the sequence) | Windows |
| AD3 | R21 | Oversized slug: a 10,000-character string | RTL navigates, asserts the render completes within a bounded time (e.g. under Vitest's default timeout) and shows `NotFoundPage` | No crash, no hang, `NotFoundPage` | Windows |
| AD4 | R21 | Unicode, RTL-override, and null-byte slugs: `/work/%00`, `/work/\ud83d\ude00`, `/work/\u202emoc.elppa` | RTL navigates to each, asserts no exception | `NotFoundPage` in every case, no crash | Windows |
| AD5 | R8 | Hash-based injection attempt: `/#"><img src=x onerror=alert(1)>` | RTL navigates, spies `document.getElementById` and `scrollIntoView`, asserts `alert` never called | `getElementById` with that raw string returns `null` (ids cannot contain those characters meaningfully); no scroll crash, no code execution | Windows |
| AD6 | all routes | Any future stored or reflected injection via `portfolioData` content, defended by never using an HTML-injection sink | `grep -rc "dangerouslySetInnerHTML" src/` | 0 | Windows |
| AD7 | R60 | A compromised or malicious third-party action attempts to use broader permissions than granted | Same as GC60, framed adversarially: the workflow's own `permissions:` block is the enforcement boundary GitHub applies regardless of what a step requests | GitHub rejects any token use beyond `contents: read`, `pages: write`, `id-token: write` | Windows (static check); GitHub's enforcement itself is a platform guarantee, not something this repo can unit test |
| AD8 | R59 | Supply-chain attack: an upstream action tag (for example `v5`) is silently repointed to malicious code after this workflow is written | Same as GC59, framed adversarially: SHA pinning is immune to a tag being repointed | Every `uses:` line resolves to the exact commit recorded, unaffected by any future tag move | Windows |
| AD9 | R64 | A compromised step or action attempts to read a secret | Same as GC64, framed adversarially: there is nothing to exfiltrate | `grep -c "secrets\."` = 0, so no secret reference exists to read | Windows |
| AD10 | R56, R57 | A known-vulnerable transitive runtime dependency reaches the shipped bundle | GC56/GC57 (structural: the blocking audit step exists and runs before `actions/upload-pages-artifact`) | Structure present (Windows). Live rejection of a real vulnerable package is `CI-only` and cannot be pre-verified without deliberately shipping one, which the profile's `npm install` ask-command guard also gates | Windows (structure) + CI-only, exercised the first time a real high-severity advisory appears (accepted limitation, not a gap in the control) |
| AD11 | R65, R66 | A compromised dependency injects an inline `<script>` (no `src`) into the build output | Red-team check: construct a `dist/index.html` fixture with a deliberately injected inline script, run GC66's grep against that fixture | The grep correctly flags it (count > 0), proving the detection instrument catches this attack, not merely that today's clean build passes | Windows |
| AD12 | R33, R34 | Replay: rapidly navigating away from and back to `/` many times (a user mashing back/forward, or a bot) | Vitest mounts and unmounts the router at `/` 20 times in a loop, asserts `cancelAnimationFrame` count equals `requestAnimationFrame` count and `vi.getTimerCount() === 0` after the last unmount | No accumulation of frames, observers, or timers across replays | Windows |
| AD13 | R65 | Clickjacking: a malicious site iframes the portfolio, because a `<meta>` CSP cannot express `frame-ancestors` on GitHub Pages | Not automatable by a command; this is a named, accepted residual risk recorded in ADR 0006 and `spec.md` "Security and privacy" | Documented as accepted, not fixed: the site has no session, no auth token, and no state-changing control for a clickjack overlay to exploit, so the residual risk is judged acceptable | manual, and scored "documented" rather than "rejected" per the target note above |

## 6. Non-functional (success metrics M1-M17)

| ID | Metric | Target | How measured | Case(s) |
|----|--------|--------|----------------|---------|
| NF1 | M1 | `npm run build` exit code 0 | Run the profile's `build` command | GC74 |
| NF2 | M2 | >= 1 asset path in `dist/index.html` begins `/Portfolio/`; exactly 0 begin `/assets/` | grep on `dist/index.html` | GC11 |
| NF3 | M3 | `npm run lint` exit code 0, after the clean reinstall | Run the profile's `lint` command | GC71 |
| NF4 | M4 | Test command exits 0, test count >= 1 (intent's floor); R52 tightens this to >= 12 passed, 0 skipped | Run `npm test`, read the Vitest summary line | GC52 |
| NF5 | M5 | 5 of 5 named routes render without throwing: `/`, `/work`, and the 3 case-study paths | RTL render per route | GC3, GC21 |
| NF6 | M6 | Exactly 3 case studies, 3 projects (`workhorse`, `Shu`, `wasl`), 1 simulator entry on `/work` | RTL count assertions | GC15, GC16, GC17 |
| NF7 | M7 | `dist/404.html` exists and is byte-identical to `dist/index.html` (0 bytes different) | File existence + sha256 comparison | GC12 |
| NF8 | M8 | 0 matches for `508-1536` in `dist/` and `src/` | recursive grep | GC41 |
| NF9 | M9 | 0 matches for `fonts.googleapis.com` / `fonts.gstatic.com` in `dist/` and `index.html` | recursive grep | GC37 (existence of the call); GC39 (the deeper "actually applied" check the architect flagged, since M9 alone can pass while typography silently fails) |
| NF10 | M10 | 0 matches for `gtag`, `analytics`, `dataLayer`, `document.cookie`, `localStorage`, `sessionStorage` in `src/` and `index.html` | the discovery analyst's own grep, re-run | GC13, GC44 |
| NF11 | M11 | Orb canvas CSS width in `[380, 440]` px inclusive | RTL reads `canvas.style.width` (inline, per R31; jsdom has no layout to read `getBoundingClientRect` from) | GC31 |
| NF12 | M12 | 0 calls to `requestAnimationFrame` after the first frame, with `matchMedia('(prefers-reduced-motion: reduce)')` matching | RTL with a mocked `matchMedia` (R54's stub) | GC32 |
| NF13 | M13 | Exactly 1 file under `.github/workflows/` that builds and publishes to Pages on push to `main`; parses as YAML | file read + count; YAML-validity confirmed only by GitHub's own parser (manual, see GC55) | GC55 |
| NF14 | M14 | The Actions job's install step exits 0 on `ubuntu-latest` | first workflow run only; explicitly not verifiable on the Windows dev host per intent.md | CI-only, depends on GC70/GC71's preventive fixes and GC74's build-succeeds check |
| NF15 | M15 | `generate_viewer.cjs` absent from `git ls-files`; `.gitignore` contains `.env*` | `git ls-files`, grep | GC72, GC73 |
| NF16 | M16 | The rendered simulator contains a visible "illustrative example" style label naming the data as fictional; tightened here to >= 2 occurrences (scenario list and payload inspector, per R45's own text) | RTL text assertion | GC45 |
| NF17 | M17 | `src/data/portfolioData.js` diff adds keys only; 0 changes to any existing metric, date, employer, role, or degree string | review of the diff at G4 against the full checklist | GC-CP (manual) + GC18 (automated subset: telemetry, case-study ids/titles) |

## 7. Golden dataset

Not applicable: this change contains no classification, extraction, matching, search, or LLM
call. `InteractiveTriageSimulator`'s "decision", "confidence", and "reasoning" fields are
static properties of the three hard-coded `PRESETS` entries (confirmed, reading
`src/components/InteractiveTriageSimulator.jsx` lines 4-62 and `handleRunSimulation` lines
70-95): the component returns them verbatim after three `setTimeout` delays, computing only a
random latency number and a timestamp at run time. No model, no API call, no ranking, and no
retrieval exists anywhere in this codebase (confirmed by the discovery analyst's grep for
`fetch(`, `XMLHttpRequest`, `axios`, and re-confirmed here by reading every component file).

## 8. Failure taxonomy

| Class | Description | Detection in production | Example |
|-------|-------------|--------------------------|---------|
| Wrong result | The page renders, but with incorrect content, route, or styling (wrong `base`, wrong `basename`) | The R63 smoke step catches total content failure (HTTP status, owner's name in body); a page that is present but visually wrong has **no production detection**, by design (no analytics, no error tracking, per `constraints.md` and the profile's `style_notes`) | FL4 (wrong `base`), FL6 (`basename` trailing slash) |
| Missing result | A route or asset fails to load entirely (blank page, unfallen-back 404) | The R63 smoke step covers only the root `page_url`; deep-link pages (`/work/:slug`) have **no smoke coverage at all** | FL5 (stale/missing `dist/404.html`), FL7 (CSP-blocked inline script, blank page in production only) |
| Slow | The npm registry or GitHub Pages propagation is slow, delaying or failing the deploy | The GitHub Actions run's own duration and failure status; GitHub's workflow-failure email to the actor (believed, not verified) | FL1 (registry down), FL16 (Pages propagation lag) |
| Leaked (resource) | Timers, animation frames, or observers outlive their component and accumulate across navigations | **No detection in production** (no monitoring, by design); caught only pre-release by the fake-timer and mount/unmount eval cases | GC34, GC46, GC47, FL12, FL13, AD12 |
| Leaked (data) | Personal data (the phone number) or a confidential employer claim reaches the public, permanent, scrapeable surface | **No automated detection** (no crawler monitoring, no analytics, by design); the only available check is a periodic manual grep of the deployed site, and once a search engine or archive copies it, it is unrecoverable (see below) | R41 (phone number), D4 (employer claims) |
| Unauthorised | The deploy workflow or a dependency executes with more privilege or reach than intended | GitHub's own Actions permission enforcement on the `permissions:` block; the blocking `npm audit --audit-level=high --omit=dev` step; Dependabot alerts on the repository's Security tab | AD7, AD8, AD9, AD10, FL17 |
| Corrupted | The build artifact is internally inconsistent (`dist/404.html` stale, `package-lock.json` out of sync, malformed workflow YAML) | The build's own exit code (`npm ci` / `npm run build` failing); GC12's hash-equality check; GitHub's "invalid workflow file" banner in the Actions tab | FL3, FL5 |
| Unrecoverable | An action that cannot be undone once a visitor, search engine, or archive has copied it | **No detection after the fact.** The only control is pre-push human sign-off (D1, D4 in the G1 approval notes) and running every eval case above **before** every push, never after | The entire reason D1 and D4 exist as explicit owner decisions rather than defaults; a wrongly-published phone number or employer claim |

## 9. Coverage matrix

### Requirements (R1-R79)

Every requirement maps to at least one golden case (`GCn`). Additional edge (`EGn`), failure
(`FLn`), or adversarial (`ADn`) cases are listed where they exist.

| Req | Golden | Edge | Failure | Adversarial |
|-----|--------|------|---------|--------------|
| R1 | GC1 | - | - | - |
| R2 | GC2 | EG1 | FL6 | - |
| R3 | GC3 | - | - | - |
| R4 | GC4 | - | - | - |
| R5 | GC5 | - | - | - |
| R6 | GC6 | - | - | - |
| R7 | GC7 | - | - | - |
| R8 | GC8 | EG5, EG6 | - | AD5 |
| R9 | GC9 | - | - | - |
| R10 | GC10 | - | - | - |
| R11 | GC11 | - | FL4 | - |
| R12 | GC12 | EG21 | FL5 | - |
| R13 | GC13 | - | - | - |
| R14 | GC14 | - | - | - |
| R15 | GC15 | - | - | - |
| R16 | GC16 | - | - | - |
| R17 | GC17 | - | - | - |
| R18 | GC18, GC-CP | EG16 | - | - |
| R19 | GC19 (manual) | - | - | - |
| R20 | GC20 | EG7 | - | - |
| R21 | GC21 | EG2, EG3, EG4 | - | AD1, AD2, AD3, AD4 |
| R22 | GC22, GC22v (manual) | - | - | - |
| R23 | GC23 | - | - | - |
| R24 | GC24 | EG8 | - | - |
| R25 | GC25 | EG9, EG16 | - | - |
| R26 | GC26 | - | - | - |
| R27 | GC27, GC27v (manual) | - | - | - |
| R28 | GC28 | - | - | - |
| R29 | GC29 | - | - | - |
| R30 | GC30, GC30v (manual) | - | - | - |
| R31 | GC31 | EG10 | - | - |
| R32 | GC32 | EG11 | FL10 | - |
| R33 | GC33 | - | FL11 | AD12 |
| R34 | GC34 | EG12 | FL12 | AD12 |
| R35 | GC35 | - | FL9 | - |
| R36 | GC36 | EG13 | - | - |
| R37 | GC37 | - | - | - |
| R38 | GC38 | - | - | - |
| R39 | GC39 | - | - | - |
| R40 | GC40 | - | - | - |
| R41 | GC41 | - | - | - |
| R42 | GC42 | - | - | - |
| R43 | GC43 | - | - | - |
| R44 | GC44 | - | - | AD6 |
| R45 | GC45 | - | - | - |
| R46 | GC46 | EG14 | FL13 | - |
| R47 | GC47 | EG15 | - | - |
| R48 | GC48 | EG15 | FL14 | - |
| R49 | GC49 | - | - | - |
| R50 | GC50 | - | - | - |
| R51 | GC51 | - | - | - |
| R52 | GC52 | - | - | - |
| R53 | GC53 | - | - | - |
| R54 | GC54 | - | - | - |
| R55 | GC55 | EG18 | - | - |
| R56 | GC56 | - | FL17 | AD10 |
| R57 | GC57 | - | FL17 | AD10 |
| R58 | GC58 | - | - | - |
| R59 | GC59 | EG17 | - | AD8 |
| R60 | GC60 | - | - | AD7 |
| R61 | GC61 | - | FL19 | - |
| R62 | GC62 | - | - | - |
| R63 | GC63 | - | FL16 | - |
| R64 | GC64 | - | - | AD9 |
| R65 | GC65 | - | FL7, FL8 | AD11, AD13 |
| R66 | GC66 | - | FL7 | AD11 |
| R67 | GC67 | EG19 | - | - |
| R68 | GC68 | - | FL18 | - |
| R69 | GC69 | - | FL15 | - |
| R70 | GC70 | - | FL2 | - |
| R71 | GC71 | - | FL3 | - |
| R72 | GC72 | - | - | - |
| R73 | GC73 | EG20 | - | - |
| R74 | GC74 | - | - | - |
| R75 | GC75 | - | - | - |
| R76 | GC76 (config only) | - | - | - |
| R77 | GC77 (manual) | - | FL20 | - |
| R78 | GC78 | - | - | - |
| R79 | GC79, GC79v (manual) | - | - | - |

All 79 requirements have at least one golden case. 0 are uncovered.

### Metrics (M1-M17)

| Metric | Case |
|--------|------|
| M1 | NF1 (GC74) |
| M2 | NF2 (GC11) |
| M3 | NF3 (GC71) |
| M4 | NF4 (GC52) |
| M5 | NF5 (GC3, GC21) |
| M6 | NF6 (GC15, GC16, GC17) |
| M7 | NF7 (GC12) |
| M8 | NF8 (GC41) |
| M9 | NF9 (GC37, GC39) |
| M10 | NF10 (GC13, GC44) |
| M11 | NF11 (GC31) |
| M12 | NF12 (GC32) |
| M13 | NF13 (GC55) |
| M14 | NF14 (CI-only) |
| M15 | NF15 (GC72, GC73) |
| M16 | NF16 (GC45) |
| M17 | NF17 (GC-CP, GC18) |

All 17 metrics have at least one case. 0 are uncovered.

## 10. Notes for the architect

Six places where a requirement, as written, has a gap or an inherent testability ceiling.
None of these block writing a case (each got one above); they are flagged so a future revision
of `spec.md` can tighten the wording.

1. **R31's clamp formula has no upper bound.** "Shrink to `viewportWidth - 48` clamped to a
   minimum of 280px" only clamps the *minimum*. For viewport widths roughly between 468px and
   1023px, `viewportWidth - 48` **exceeds** 420px (for example, 700px viewport gives 652px),
   which contradicts the word "shrink" and could put the canvas outside M11's 380-440px target
   at those widths. GC31 and EG10 only test the two boundaries the spec actually pins (1024px
   and 320px) because the mid-range behaviour is not specified. Recommend adding an explicit
   upper clamp, for example `Math.min(420, Math.max(280, viewportWidth - 48))`.
2. **R76's acceptance check is a process property, not an artifact.** "The planner reads
   `profile.build.max_parallel: 4`" is satisfied by the config value existing; no single file
   or command proves the conductor actually capped concurrent builders at 4 during the Build
   phase. GC76 checks the config only. Recommend either rewording R76 to be about the config
   value, or specifying a build-log artifact a future eval could check against.
3. **R77 is inherently a human evidence table, not a command.** Reading a licence field
   requires an owner-approved `npm install` first (an `ask_command`), and the table itself is
   authored and reviewed by people. GC77 is `manual` for this reason; that is expected, not a
   gap to close.
4. **R55 and R68's "parses as YAML" clauses cannot be verified without adding a dependency
   this project deliberately avoids.** No YAML parser is part of the toolchain, and this
   project's own `style_notes` discourage unnecessary dependencies. GC55 and GC68 verify
   structure by grep and treat full YAML validity as `manual`, confirmed only when GitHub's own
   parser accepts the file. Recommend the architect either accept this framing explicitly, or
   authorize a devDependency-free structural check as the full acceptance bar.
5. **R30's acceptance check (design review) cannot verify the actual colour-by-depth mapping.**
   GC30's grep confirms all four hex stops exist in the source file, but a builder could import
   all four and still map them to the wrong `z` depth or the wrong alpha channel, and the grep
   would still pass. Recommend the architect ask the builder to factor the colour-interpolation
   step into a small pure function, so a future eval can call it directly with known `z` values
   and assert exact output, rather than relying only on a visual review that jsdom cannot run.
6. **R19 has no automatable component at all, and this is a permanent ceiling, not a gap to
   close.** 1200px max-width, asymmetric grid stagger, and tracked-out type at specific weights
   are computed-style and visual properties jsdom cannot render (no layout engine, no fonts).
   The profile has no `e2e` command by design (ADR-level decision, not an oversight, per
   "Alternatives considered": Playwright was rejected for cost). GC19 stays `manual`
   permanently unless the toolchain changes; this is recorded, not treated as an open item.

No requirement was left entirely without a case.

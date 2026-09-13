# Intent: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Requested by: Muhammad Muhibullah, site owner (mmalqaim@gmail.com, GitHub `muhibm1`)
Date: 2026-09-11
Risk tier: 2 (new `.github/workflows/*.yml` deploy pipeline plus edits to `index.html`,
`vite.config.js`, `package.json` and `package-lock.json`, all five listed in profile
`tier_floor_paths.2`, set a hard floor of 2; confirmed against `.workhorse/profile.yml` lines
151-153)

## Problem

**In the requester's words.** The owner has no public portfolio to link from their resume,
LinkedIn and Forward Deployed Engineering job applications. The existing Vite/React scaffold is a
single page with modals, shows an MM monogram where the owner chose the colourful orb
(`public/mockup-home.jpg`), has no dedicated projects and case-studies page, no router, no tests,
a broken lint toolchain, an orphan Windows-only dependency, and is not deployable to GitHub Pages.

**Restated precisely.** The repository at `main` contains a static Vite 5 + React 19 + Tailwind 4
single-page app. `src/App.jsx` renders eight sections plus two modals; there is no router and no
`/work` surface (confirmed, `src/App.jsx` and `docs/sdlc/codebase-map.md`). The hero uses
`src/components/MmLogo.jsx`, and `thinking-orbs@0.3.1` is a declared dependency that nothing
imports (confirmed, `package.json` line 19 and a grep of `src/` returning no import). Four things
block a deploy: `vite.config.js` declares no `base` (confirmed, the file is 11 lines and has only
`plugins`), there is no `.github/` directory (confirmed by glob), `package.json` carries
`@rolldown/binding-win32-x64-msvc` as a direct dependency restricted to win32/x64 which is
expected to fail `npm ci` on a Linux runner (believed, not verified), and `npm run lint` exits 1
because `node_modules/@oxlint/` is empty (confirmed by the discovery analyst in
`docs/sdlc/constraints.md` technical constraint 5). There is no test runner, no test file and no
`test` script (confirmed, `package.json` lines 6 to 11). `index.html` lines 8 to 10 load three
font families from `fonts.googleapis.com` and `fonts.gstatic.com`, which is the site's only
third-party visitor-facing call (confirmed). `src/data/portfolioData.js` line 8 publishes the
owner's phone number, rendered in `ContactFooter.jsx` line 71 and `ResumeModal.jsx` lines 10 and
69 (confirmed). `src/components/CaseStudyModal.jsx` line 298 hard-codes the email in a `mailto:`
instead of reading `personal.email` (confirmed). `generate_viewer.cjs` reads a path outside the
repository and is imported by nothing (confirmed). `.gitignore` has no `.env` pattern (confirmed,
26 lines, no `.env` entry).

## Outcome

Observable when done:

1. `https://muhibm1.github.io/Portfolio/` serves the site, published by a GitHub Actions workflow
   that runs on push to `main`.
2. The site has three route shapes rendered by a client-side router: `/` (home), `/work` (index of
   case studies and projects), and `/work/:slug` for each case study.
3. `/work/:slug` resolves for the three existing case-study ids `apple-llm-triage`,
   `apple-data-health`, `neural-newsletters-llm` (confirmed as the `id` values in
   `src/data/portfolioData.js` lines 66, 94, 122), laid out per `public/mockup-casestudy.jpg`.
4. `/work` additionally lists three GitHub project entries (`workhorse`, `Shu`, `wasl`) and the
   interactive triage simulator. No other project is added.
5. A deep link to `/Portfolio/work/apple-llm-triage` loads the correct page because `dist/404.html`
   exists as an SPA fallback.
6. The home hero matches `public/mockup-home.jpg`: stacked name, role line, availability pill,
   telemetry stats, and on the right a live orb instead of the MM monogram.
7. The orb is the `working` state of `thinking-orbs` drawn on a canvas roughly 380 to 440 px, using
   `thinking-orbs/engine` geometry with a custom painter that colours dots with the amber, rose and
   blue iridescent gradient. It renders a single static frame under
   `prefers-reduced-motion: reduce` and stops animating while offscreen.
8. Visual style follows `docs/design-brief.md`: OFF+BRAND palette, typography and flat shadowless
   treatment; `/work` uses the Jakub Reis asymmetric layout; the home case-study cards use the
   Varick card pattern.
9. Every factual claim in `src/data/portfolioData.js` is preserved. Content is extended, never
   rewritten.
10. The owner's phone number appears nowhere in the built output. Email and LinkedIn remain.
11. No request to `fonts.googleapis.com` or `fonts.gstatic.com` is made by the built site; the three
    families load from self-hosted, pinned `@fontsource` packages.
12. `npm test` exists, runs Vitest with React Testing Library, and passes with a non-zero test count.
13. `npm run lint` exits 0 on the owner's machine after the toolchain repair.
14. `generate_viewer.cjs` is gone, `.gitignore` contains `.env*`, and `CaseStudyModal.jsx` reads the
    email from `portfolioData`.

## Users and systems affected

- **Users:** recruiters, hiring managers and interviewers arriving from the owner's resume,
  LinkedIn or a job application (believed, from the owner's description; there is no analytics and
  never will be, so this is unobservable by design). The owner himself, as the only editor and the
  only person who pushes to `main`.
- **Systems and services:** the repository `muhibm1/Portfolio`; GitHub Pages as the host and GitHub
  Actions as the publisher (both believed, neither configured yet, no `.github/` exists);
  the npm registry as the source of the new dependencies below. Google Fonts is removed as a
  runtime dependency. No backend, no database, no auth, no API.
- **Data touched:** the owner's own personal data in `src/data/portfolioData.js` `personal` (name,
  role, email, phone, city, LinkedIn) and his employment, education and employer-derived metric
  claims (confirmed by reading the file). The phone number is removed from the public surface.
  **No special-category data** under GDPR Art. 9 is present or inferable (confirmed by the
  discovery analyst against the whole data file, and re-confirmed here by reading it). No visitor
  data is collected anywhere.

## Constraints

**From the client profile (`.workhorse/profile.yml`, all confirmed by reading it):**

- `sensitive_paths` (ask before editing): `.github/workflows/**`, `index.html`, `vite.config.js`,
  `package.json`, `package-lock.json`. This change touches all five.
- `protected_paths` (never edit): `**/*.pem`, `**/*.key`, `.env*`. Adding the pattern `.env*` to
  `.gitignore` is an edit to `.gitignore`, not to a protected file.
- `ask_commands`: `git push`, `npm install`, `npm i `, `npm uninstall`, `npx `, `gh workflow run`,
  `gh release`. The dependency work and the clean reinstall all need the owner to approve prompts.
  Pushing to `main` is denied to agents by the bash guard; the owner deploys.
- `style_notes`: one default-exported component per file under `src/components`; all copy and
  metrics in `src/data/portfolioData.js`; Tailwind utilities in JSX with shared tokens in
  `src/index.css`; no runtime dependency without name, licence and exact version in the plan; **no
  analytics, tracking pixel, cookie or visitor data collection of any kind**.
- `build.max_parallel: 4` on a single Windows laptop. Any script added must run on Windows, so no
  bare shell scripts in `package.json` scripts.
- `compliance.regimes` is empty; GDPR is flagged "possibly applicable, confirm with client" only
  because of the Google Fonts call. Self-hosting the fonts closes that flag.

**From this request:**

- Static only. No backend, no server-side code, no secrets.
- Everything published is public and effectively permanent; archives and search engines copy it.
- `vite.config.js` `base` must be `/Portfolio/` because there is no custom domain.
- `docs/design-brief.md` is the design authority for palette, type, layout and the orb.
- Existing content in `src/data/portfolioData.js` is preserved and extended, never rewritten.
- New dependencies the request implies, all of which **the spec must pin to exact versions and
  record licences for**: a router (`react-router` / `react-router-dom`); `@fontsource` packages for
  Inter, JetBrains Mono and Space Grotesk (the three families confirmed in `index.html` line 10);
  `vitest`; `@testing-library/react`; `@testing-library/jest-dom`; a DOM environment (`jsdom` or
  `happy-dom`). `@vitejs/plugin-react@^4.3.4` is already a devDependency (confirmed) and
  `thinking-orbs@^0.3.1` is already a dependency (confirmed, MIT, per
  `node_modules/thinking-orbs/package.json` line 75). One dependency is **removed**:
  `@rolldown/binding-win32-x64-msvc`.

**Non-goals (explicitly out of scope):**

- Any backend, API, database or server-side rendering.
- Analytics, tracking, cookies, consent banners, embedded third-party widgets.
- A contact form of any kind. Contact stays `mailto:` plus LinkedIn.
- A CMS or any content-editing surface.
- A custom domain and a `CNAME` file.
- Adding case studies or projects beyond the three case studies and three repos named above.
- Rewriting any metric, date, employer name, role title or degree detail.
- The other open debt items in `docs/sdlc/constraints.md` that this request does not name
  (README rewrite, CSS custom properties, error boundary, clipboard catch, security headers meta,
  `security.txt`, Dependabot). See "Findings outside scope" below.

## Success metrics

These become evals. Every one is checkable by a command or a test.

| Metric | Target | How measured |
|--------|--------|--------------|
| Production build succeeds | `npm run build` exit 0 | run the profile's `build` command |
| Assets are base-correct | every `src=`/`href=` asset path in `dist/index.html` begins `/Portfolio/`; 0 paths begin `/assets/` | grep `dist/index.html` |
| Lint clean | `npm run lint` exit 0 | run the profile's `lint` command after the clean reinstall |
| Test command exists and passes | `npm test` exit 0 with test count >= 1, reported by Vitest | run `npm test`, read the summary line |
| Routes render | 5 routes render without throwing: `/`, `/work`, `/work/apple-llm-triage`, `/work/apple-data-health`, `/work/neural-newsletters-llm` | React Testing Library render per route |
| Work index contents | `/work` shows exactly 3 case studies, 3 projects (`workhorse`, `Shu`, `wasl`) and 1 simulator entry | RTL test asserting counts |
| Deep links resolve | `dist/404.html` exists and serves the same app shell as `dist/index.html` | file existence plus content comparison |
| Phone number absent | 0 matches for the owner's phone number in `dist/` and in `src/` | `node scripts/check-phone-redaction.mjs dist` after a build (R89, ADR 0010); it scans every tracked file, which includes `src/`, plus `dist/`, and exits 0 on no hit |
| No Google Fonts | 0 matches for `fonts.googleapis.com` and `fonts.gstatic.com` in `dist/` and `index.html` | recursive grep |
| No tracking introduced | 0 matches for `gtag`, `analytics`, `dataLayer`, `document.cookie`, `localStorage`, `sessionStorage` in `src/` and `index.html` | the same grep the discovery analyst ran |
| Orb at hero scale | orb canvas CSS width between 380 and 440 px inclusive | RTL test reading the rendered element size |
| Reduced motion honoured | with `matchMedia('(prefers-reduced-motion: reduce)')` matching, 0 calls to `requestAnimationFrame` after the first frame | RTL test with a mocked `matchMedia` |
| Deploy workflow present | exactly 1 file under `.github/workflows/` that builds and publishes to Pages on push to `main`; parses as YAML | file read plus YAML parse |
| Linux install works | the Actions job's install step exits 0 | first workflow run only; not verifiable on the Windows dev host |
| Dead code and gitignore | `generate_viewer.cjs` absent from `git ls-files`; `.gitignore` contains `.env*` | `git ls-files`, grep |
| Simulator labelled | the rendered simulator contains a visible "illustrative example" style label naming the data as fictional | RTL test asserting the text |
| Content preserved | `src/data/portfolioData.js` diff adds keys only; 0 changes to existing metric, date, employer, role or degree strings | review of the diff at G4 |

## Risk signals

Named by the risk classifier. Each names the path, flow or data involved, the tier it pulls
toward, and whether it is confirmed (I read it myself) or believed (asserted by an earlier agent,
not independently re-verified here).

**Deciding signal:** the new `.github/workflows/*.yml` deploy pipeline, the only path that can
publish this site to production, together with the four already-existing files this change edits
(`index.html`, `vite.config.js`, `package.json`, `package-lock.json`). All five paths are listed
in `.workhorse/profile.yml` `tier_floor_paths.2` (confirmed, lines 151-153: `[".github/workflows/**",
"index.html", "vite.config.js", "package.json", "package-lock.json"]`), which sets a hard floor of
tier 2 regardless of any other factor. `tier_floor_paths.3` is empty (confirmed, line 152), so no
path forces a tier-3 floor. Independently of the floor, the rubric's own tier-2 list names "CI
workflow" and "PII handling" directly, so tier 2 is also reached by the general rules, not only by
the path floor.

- **CI and deploy pipeline created, tier 2:** `.github/workflows/<new>.yml`. Confirmed no
  `.github/` directory exists today (glob `.github/**` returned no files). This is the only path
  that can publish to production. Matches profile `sensitive_paths` and `tier_floor_paths.2`, and
  the rubric's own "CI workflow" tier-2 trigger.
- **`index.html` edited, tier 2:** removing the three Google Fonts tags. Confirmed by reading the
  file: lines 8-10 are two `<link rel="preconnect">` tags and one stylesheet link to
  `fonts.googleapis.com` / `fonts.gstatic.com`. In `tier_floor_paths.2` and `sensitive_paths`; this
  is the file where third-party origins and any CSP land.
- **`vite.config.js` edited, tier 2:** setting `base: "/Portfolio/"`. Confirmed by reading the
  file: 11 lines, `plugins: [react(), tailwindcss()]` only, no `base` key present today. In
  `tier_floor_paths.2`. A wrong value serves a page with no CSS or JavaScript on GitHub Pages.
- **`package.json` and `package-lock.json` edited, tier 2:** both in `tier_floor_paths.2`. Confirmed
  by reading `package.json`: 7 current `dependencies`/`devDependencies` entries, no router, no test
  framework, no `@fontsource` package present today. The spec's constraints list 6-8 additions
  (`react-router` or `react-router-dom`, three `@fontsource` packages, `vitest`,
  `@testing-library/react`, `@testing-library/jest-dom`, a DOM environment) and one removal
  (`@rolldown/binding-win32-x64-msvc`), plus a full lockfile regeneration from a clean reinstall.
  Believed, not independently verified here, that the exact final package list matches the spec's
  constraints section; confirmed only that none of those packages are present in `package.json`
  today.
- **PII handling, tier 2:** the owner's own phone number is removed from a public
  surface. Confirmed by reading `src/data/portfolioData.js` line 8. Believed, not re-verified by
  me, that it also appears in `ContactFooter.jsx` line 71 and `ResumeModal.jsx` lines 10 and 69 (as
  reported by the intent writer). `docs/sdlc/constraints.md` "Things that must not change without
  the owner saying so" names contact details in either direction. This alone is a tier-2 "PII
  handling" trigger under the rubric.
  Digits redacted under G1-D1 (R89); the live checks are GC41 and GC89 in this change's `evals.md` and the R82 deploy smoke step.
- **Considered for tier 3 and rejected, first production publication and employer-derived claims:**
  the intent repeatedly calls the phone-number decision and the employer/metric publication
  "irreversible" (risk signals, TL;DR, risk register). I weighed this against the tier-3 rubric
  line "an action that cannot be rolled back" and did not apply it, for two reasons. First, the
  rubric's own tier-2 list names "CI workflow" as a standalone tier-2 trigger, and the mechanism of
  this "first production publication" is exactly that new CI workflow; if first-time publication
  via a new deploy pipeline were meant to be tier 3, the rubric would not separately list CI
  workflows under tier 2. Second, none of the other tier-3 triggers are present: no production data
  migration, no movement of money, no special-category data (confirmed absent by the discovery
  analyst and compliance mapper reading the full data file and the simulator's `PRESETS`, and
  re-confirmed here by reading `personal` and `telemetry` in `portfolioData.js`: no health,
  biometric, financial or minors data), and no regime in the profile names this area
  (`compliance.regimes` is `[]`, confirmed, with an explicit comment that GDPR was "deliberately
  not selected"). Recorded as a judgment call, not a silent omission: the employer-claim and
  phone-number irreversibility remains a real business risk, tracked in the intent's own risk
  register and gated by the owner's explicit D1/D4 decisions at G1, but it does not independently
  raise the tier past 2.
- **Employer-derived claims on the page, reinforces tier 2, informs judgment above:** Apple, TCS,
  Neural Newsletters and edX appear by name with figures "350+ tickets/day", "50+ regions", "-40%
  incidents", "99.9% reliability". Confirmed by reading `src/data/portfolioData.js` lines 6 and
  16-40 (verbatim: `subtitle: "Data Engineer at Apple (via TCS) · Austin, TX"`, and the four
  `telemetry` entries).
- **Fictional data that reads as real internal systems, informs judgment above, no tier pull on its
  own:** `PRESETS` in `src/components/InteractiveTriageSimulator.jsx` lines 4-62 (ticket ids
  `GEO-92841`, `SEC-41908`, `ING-77123`, system name "Apple Geo Ingest API", OAuth scopes, region
  identifiers). Believed confirmed by the discovery analyst and the intent writer; not re-read by
  me line by line, so labeled believed, not verified here. A reader cannot tell it is invented.
  Does not touch a schema, auth, payment or PII path on its own; relevant to the business-risk
  judgment above, not to the tier number.
- **Third-party data flow changed, no independent tier pull:** removing Google Fonts removes the
  only third-party call that sees a visitor's IP today. GitHub Pages still sees it by nature of
  hosting (believed, not configured; confirmed no `.github/` directory exists). Already covered by
  the `index.html` signal above; recorded separately because it is the compliance-relevant reason
  that file is sensitive, not a second path.
- **Known lifecycle bug activated by routing, no tier pull:** four uncleared `setTimeout` calls in
  `InteractiveTriageSimulator.jsx` lines 64-90 become a real leak once components unmount on
  navigation. Believed, per the discovery analyst's finding in `docs/sdlc/constraints.md` item 10;
  I confirmed only that the component exists, not the specific line-range behaviour. A build-phase
  correctness concern, not a risk-tier signal (no schema, auth, payment, PII or infra surface).
- **Not present, recorded so it is not assumed:** no database, no migrations, no RLS policies, no
  `SECURITY DEFINER` functions, no auth, no payments, no storage buckets, no admin surface, no
  visitor PII, no special-category data, no secrets, no infrastructure code. Confirmed by the
  discovery analyst and compliance mapper's full-file reads, and re-confirmed here by my own read
  of `portfolioData.js` and `.workhorse/profile.yml` `compliance` block (`special_categories: []`,
  `regimes: []`).

## Open questions

All seven were **decided by the main session on the owner's behalf** so work could start. Each row
records the decided value as the proposed default. **Approving G1 confirms these decisions.**
Rejecting G1 with a different answer changes the spec.

| Question | Proposed default (already decided on the owner's behalf) | Owner |
|----------|------------------|-------|
| Are the metrics and employer detail in `src/data/portfolioData.js` yours to publish, and is none of the Apple, TCS or Neural Newsletters detail confidential? (`constraints.md` open questions 1 and 8) | Yes. Content is the owner's own record, publishable as written, and is extended but never rewritten by this change | Site owner |
| Custom domain, or `muhibm1.github.io/Portfolio/`? (open question 4) | No custom domain. Site lives at `https://muhibm1.github.io/Portfolio/`, so `base` is `/Portfolio/` and no `CNAME` is added | Site owner |
| Does the phone number stay on a public, scrapeable page? (open question 3) | Removed from the public site. Email and LinkedIn remain. Note: `constraints.md` "Things that must not change without the owner saying so" names contact details **in either direction**, so this removal needs the owner's explicit yes | Site owner |
| Multi-page with a router, or stay single-page with modals? (open question 5) | Multi-page with `react-router` | Site owner |
| Vitest plus React Testing Library, or ship with no tests? (open question 6) | Vitest plus React Testing Library, wired into `package.json` `scripts.test` and `.workhorse/profile.yml` `commands.test` | Site owner |
| Self-host the fonts, or keep the Google Fonts link? (open question 7) | Self-host via pinned `@fontsource` packages and remove the three tags from `index.html` lines 8 to 10. This closes the GDPR-adjacent gap in `constraints.md` "Compliance controls" | Site owner |
| Should the simulator's invented ticket data carry a visible "illustrative example" label? (open question 2) | Yes. A visible label naming the data as an illustrative example with fictional data | Site owner |

## Findings outside scope

Recorded, not acted on. From `docs/sdlc/constraints.md` "Known debt" and the security baseline:
README is still the create-vite template; `src/index.css` CSS custom properties are declared but
unused; there is no error boundary; `ResumeModal.jsx` swallows clipboard failures; a CSP
`<meta>` tag, `public/.well-known/security.txt` and a Dependabot config are all cheap and all
belong with the deploy workflow. The uncleared simulator timeouts (listed under risk signals) are
a real bug the moment routing lands, so the spec should decide whether to fold that one in.

## Source

The owner's request to the main session on 2026-09-11, quoted verbatim at the top of "Problem".
Design authority: `docs/design-brief.md` (written 2026-09-10 from the owner's request, resume, the
four mockups in `public/` and three reference sites). Prior discovery: `docs/sdlc/codebase-map.md`,
`docs/sdlc/constraints.md` and its G0 packet, `.workhorse/profile.yml`. Mockups:
`public/mockup-home.jpg` (hero) and `public/mockup-casestudy.jpg` (case-study page).

---
---

# Review packet: G1 intent

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Gate: G1
Tier: set by the risk classifier, not by this packet
Branch: `main`, clean
PR: none
Prepared: 2026-09-11
Amended: 2026-09-13. Every form of the owner's phone number was redacted from this file under G4
rejection note D3. This changes the bytes of the G1 packet approved at `a7ed654`, not its meaning:
D1 still removes the phone number from the public site and keeps email and LinkedIn. Git history
keeps the original text and is out of scope.

## 1. TL;DR

This change turns a single-page, undeployable Vite/React scaffold into a deployed multi-page
portfolio at `https://muhibm1.github.io/Portfolio/`, with a `/work` index, three case-study pages,
a live `thinking-orbs` hero, self-hosted fonts, a real test command and a GitHub Actions deploy.
It exists because the owner needs a link to put on a resume and job applications now. You are
asked to confirm five decisions that were made on your behalf so work could start; the phone-number
removal and the content-publishability confirmation are the two that cannot be undone after the
first push to `main`.

## 2. Decisions requested

| # | Decision | Recommendation | Alternative | If you choose the alternative |
|---|----------|----------------|-------------|-------------------------------|
| D1 | Publish the phone number? | Remove the owner's phone number from the public site; keep email and LinkedIn | Keep it | Spec keeps `personal.phone` rendering in `ContactFooter` and `ResumeModal`; the number is scrapeable forever once Pages is live |
| D2 | Fonts and the third-party call | Self-host Inter, JetBrains Mono and Space Grotesk from pinned `@fontsource` packages; delete `index.html` lines 8 to 10 | Keep Google Fonts | The GDPR-adjacent gap in `constraints.md` stays open and the spec must instead record a lawful basis for disclosing every EU/UK visitor's IP to Google LLC |
| D3 | Architecture: router, tests, host | `react-router` multi-page; Vitest plus React Testing Library as `commands.test`; no custom domain, so `base: "/Portfolio/"` | Stay single-page with modals; ship untested; buy a domain | Single-page drops `/work` and `/work/:slug` and most of the design brief; no tests keeps verification build-only forever; a domain changes `base` and adds a `CNAME` |
| D4 | Content publishability | Confirm the Apple, TCS, Neural Newsletters and edX claims and the four telemetry metrics are yours to publish and not confidential | Redact or soften specific claims | The spec must list exactly which strings change, and only you may write the replacements |
| D5 | Simulator labelling | Add a visible "illustrative example, fictional data" label to `InteractiveTriageSimulator` | Leave it unlabelled | The page continues to show invented ticket ids, OAuth scopes and an "Apple Geo Ingest API" that a reader will take as real internal data |

## 3. Evidence

Intent is a reading phase. No build, lint, test or install command was run, by design.

| Check | Command or file read | Exit code | Output | Status |
|-------|----------------------|-----------|--------|--------|
| Profile constraints, sensitive paths, tier floors | read `.workhorse/profile.yml` | n/a | `tier_floor_paths.2` lists the five paths this change touches | confirmed |
| Case-study ids that become slugs | read `src/data/portfolioData.js` lines 64 to 148 | n/a | `apple-llm-triage`, `apple-data-health`, `neural-newsletters-llm` | confirmed |
| Phone number locations | grep `phone` in `src/` | 0, 4 matches | `portfolioData.js:8`, `ContactFooter.jsx:71`, `ResumeModal.jsx:10`, `ResumeModal.jsx:69` | confirmed |
| Google Fonts tags | read `index.html` lines 8 to 10 | n/a | preconnect to `fonts.googleapis.com`, `fonts.gstatic.com`, one stylesheet for Inter, JetBrains Mono, Space Grotesk | confirmed |
| `base` absent | read `vite.config.js` | n/a | 11 lines, `plugins` only, no `base` | confirmed |
| `.gitignore` has no env pattern | read `.gitignore` | n/a | 26 lines, no `.env` entry | confirmed |
| Orphan Windows-only dependency | read `package.json` line 13 | n/a | `"@rolldown/binding-win32-x64-msvc": "^1.2.8"` under `dependencies` | confirmed |
| `thinking-orbs` already installed | read `package.json` line 19 and `node_modules/thinking-orbs/package.json` | n/a | `^0.3.1` declared, 0.3.1 installed, licence MIT | confirmed |
| Engine exports the needed API | read `node_modules/thinking-orbs/dist/engine/index.d.ts` | n/a | line 1 exports `MODE_FRAMES`; line 6 exports `paintFrame`, `paint`, `finalizeFrame`, `makeProj` | confirmed |
| `orbits` is a real mode and is the `working` state | read `dist/presets.d.ts` line 4 and `dist/engine.es.js` line 490 | n/a | `ModeKey` includes `'orbits'`; `STATE_TO_MODE` maps `working: "orbits"` | confirmed |
| The package's own component handles reduced motion and offscreen | grep `dist/index.es.js` | 0, 2 matches | line 52 `matchMedia("(prefers-reduced-motion: reduce)")`, line 104 `IntersectionObserver` | confirmed; a custom painter must reimplement both |
| Mockups referenced by the request exist | glob `public/*` | n/a | `mockup-home.jpg`, `mockup-casestudy.jpg` present | confirmed |
| Hard-coded email | read `src/components/CaseStudyModal.jsx` line 298 | n/a | `href="mailto:mmalqaim@gmail.com?subject=..."` | confirmed |
| Simulator data is invented | read `InteractiveTriageSimulator.jsx` lines 4 to 62 | n/a | three hard-coded `PRESETS` with ticket ids and OAuth scopes, no label | confirmed |
| Lint is broken on this machine | not re-run here | n/a | `constraints.md` technical constraint 5 records `oxlint --version` exit 1 | believed, not verified by this agent |
| `npm ci` fails on Linux because of the orphan dependency | not runnable from a Windows host | n/a | n/a | believed, not verified |
| GitHub Pages is the host and is configurable | not checkable from the repository | n/a | no `.github/` directory exists | believed, not verified |
| Build, lint, test, install | not run | n/a | intent does not run commands | not verified |

Eval pass rates: not applicable. The success-metrics table above is the eval set; nothing has been
built yet, so every row is unmeasured.

## 4. Constraint audit

| Severity | Constraint source | Item | Resolution |
|----------|-------------------|------|------------|
| High | `constraints.md`, "must not change without the owner saying so" | Contact details must not change in either direction. This change removes the phone number | Open. D1 decides it |
| High | `constraints.md` compliance, employer confidentiality | Open questions 1 and 8 are unanswered and deploy is irreversible | Open. D4 decides it |
| Medium | `constraints.md` compliance, "Controls each later phase must honour", Spec | Name a lawful basis for Google Fonts or specify self-hosting | Addressed by D2 (self-host). Confirms at G2 |
| Medium | `constraints.md` compliance, employer confidentiality | Simulator's fictional data must be labelled | Addressed by D5 |
| Medium | Profile `style_notes` | No new runtime dependency without name, licence and exact version | Open until the spec pins all six-plus packages. Named in Constraints above |
| Medium | Profile `sensitive_paths` | Five sensitive paths are all touched | Accepted by design; each edit prompts the owner through the hook |
| Low | `constraints.md` technical constraint 4 | Windows dev host, no bare shell scripts in `package.json` | Carried into the spec as a requirement |
| Low | `constraints.md` compliance, Deploy | Open questions 1, 2, 3 and 7 must be answered before the first live push | D1, D2, D4, D5 are exactly those four |

## 5. Risk register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| A published employer claim turns out to be confidential | Low | Reputational, possibly contractual, and irreversible once indexed | D4 answered before the first push to `main` | Site owner |
| Phone number removed against the owner's wishes, or kept against them | Medium | Personal data exposure, or a missing contact channel | D1 answered explicitly at this gate | Site owner |
| First CI run fails because of `@rolldown/binding-win32-x64-msvc` | High | Blocks the first deploy | Removal is in scope; the Actions install step is an eval | Build phase |
| Deployed site renders unstyled because `base` is wrong | High | A broken page is worse than no page | `base: "/Portfolio/"` plus the asset-path grep eval on `dist/index.html` | Build phase |
| Deep links to `/work/:slug` 404 on GitHub Pages | High without the fallback | Case-study links from applications break | `404.html` fallback plus its eval | Build phase |
| The custom orb painter drifts from the package's behaviour (reduced motion, offscreen pause) | Medium | Accessibility regression and battery drain | Two explicit evals; the package's own handling is confirmed and can be copied | Build phase |
| Six or more new dependencies enter the supply chain at once | Medium | Unreviewed transitive code in a public site | Spec pins exact versions and licences; `npm audit --audit-level=high` in CI | Spec and Build |
| Simulator timeouts leak once routing unmounts the component | Medium | A real bug introduced by this change | Flagged under risk signals; spec decides whether to fix it here | Spec |
| Lint stays broken and every verification reports red for an unrelated reason | Medium | Verification noise | Clean reinstall is in scope, and lint exit 0 is an eval | Build phase |

## 6. Design tour

Not applicable: no design yet. G1 approves the intent; the spec and its design tour arrive at G2.

## 7. Checklist

- [ ] The problem statement matches what you asked for
- [ ] D1: you accept removing your phone number from the public site
- [ ] D4: the Apple, TCS, Neural Newsletters and edX claims and the four telemetry metrics are
      yours to publish and none of it is confidential
- [ ] D2, D3, D5: self-hosted fonts, router plus Vitest plus `base: "/Portfolio/"`, and a labelled
      simulator are what you want
- [ ] The non-goals are correct, especially no custom domain, no analytics, no contact form
- [ ] Only three case studies and three repos (`workhorse`, `Shu`, `wasl`) are in scope
- [ ] You understand that pushing to `main` publishes the site and that you perform that push

Security checklist: the standard pre-ship list is embedded at G4, not G1, and most of it does not
apply to this project (no database, no RLS, no `SECURITY DEFINER` functions, no storage buckets,
no admin surface, no user free text, no account deletion path; confirmed by the discovery analyst
and unchanged by this intent). The items that do apply and that the spec must decide on are
recorded under "Findings outside scope": a CSP `<meta>` tag in `index.html`,
`public/.well-known/security.txt`, and Dependabot plus `npm audit` in CI. New third-party imports
in this change must be pinned to exact versions, which is already a profile rule.

Recommend approve with conditions: the owner answers D1 and D4 explicitly in the approval notes,
because both are irreversible after the first push to `main`.

## Approve

```
/workhorse:approve G1
/workhorse:approve G1 --reject "notes"
```

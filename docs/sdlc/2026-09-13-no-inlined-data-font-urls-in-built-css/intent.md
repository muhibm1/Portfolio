# Intent: no inlined data font URLs in built CSS

Change id: `2026-09-13-no-inlined-data-font-urls-in-built-css`
Requested by: mmuhibullah@instructors.2u.com
Date: 2026-09-13
Risk tier: 2 (edits `vite.config.js` and `.github/workflows/deploy.yml`, both tier-2 floor paths in `.workhorse/profile.yml`, and `deploy.yml` is a CI workflow change, itself a tier-2 trigger)

## Problem

In the requester's words: the live site https://muhibm1.github.io/Portfolio/ logs 12 Content
Security Policy console errors because Vite's default `build.assetsInlineLimit` (4096 bytes)
inlines small `@fontsource` JetBrains Mono files (weights 400 to 700, the Cyrillic-ext and
Vietnamese subsets) into the built CSS as `data:` URLs, which the build-time CSP meta tag's
`font-src 'self'` blocks. The post-deploy smoke check R82 did not catch it.

Precisely: `src/main.jsx` lines 6 to 17 import weights 400 to 700 of three `@fontsource` families
(confirmed). `vite.config.js` sets no `assetsInlineLimit` (confirmed, read), so Vite 5.4.21
(installed, confirmed) applies its 4096-byte default (believed, not verified; Vite docs not
fetched this session). Font files below that size are written into the built stylesheet as base64
`data:` URLs. The CSP meta tag injected at build time (`vite.config.js` line 18, ADR 0006) allows
fonts from `'self'` only, so the browser refuses them. On 2026-09-13 the main session found in the
served `/Portfolio/assets/index-CkNgrI9O.css`: 64 `@font-face` blocks, 12 `url(data:font/...)`
sources, 116 file font URLs, every inlined face JetBrains Mono 400 to 700 with a unicode-range
starting `U+0460-052F` or `U+0102-0103`, and the console error "Loading the font
'data:font/woff2;base64,...' violates ... font-src 'self'" (confirmed by the main session; not
re-fetched by this agent). English text is unaffected (release.md section e, believed, not
verified). Why it escaped: R82 reads only the served HTML and module script (`deploy.yml` lines
304 to 310, confirmed); R80 saves the served stylesheet but only checks that its first `.woff2`
URL resolves (lines 241 to 253, confirmed); no browser runs in CI, so only the manual R84 check
could see it, and it did, after release (release.md line 745, confirmed).

## Outcome

1. After `npm run build`, no file in `dist/assets/*.css` contains `url(data:font`. Every
   `@font-face` source is a same-origin file under `/Portfolio/assets/`.
2. `font-src` stays exactly `font-src 'self'`. The full CSP string in `dist/index.html` and
   `dist/404.html` is byte-identical to what the build emits today.
3. A repository check exits non-zero, naming the file and the count, when any built CSS contains
   `url(data:font`. It also fails when it finds no built CSS to scan, so it cannot pass on nothing.
   It runs blocking in CI before the Pages artifact is uploaded.
4. The deploy job's smoke step asserts 0 `url(data:font` in the stylesheet GitHub Pages serves,
   blocking (R83), with an error naming the assertion and the URL fetched.
5. The built CSS keeps the same set of faces: 64 `@font-face` blocks, as counted on today's served
   CSS. Only the delivery changes, not which fonts ship.
6. Post-release acceptance, performed by the site owner: after he pushes to `main` and the deploy
   run is green, he loads the live site in a real browser, the console shows 0 CSP violations and
   no uncaught error (R84 item 4), and he appends a dated line to `docs/hosted-config.md`
   section 6. No agent can confirm this before the merge.

## Users and systems affected

- Users: recruiters and other visitors (their browsers log the errors today); visitors whose text
  needs Cyrillic-ext or Vietnamese glyphs in the mono face (rare on an English site, believed, not
  verified); the owner, as sole maintainer and release operator.
- Systems and services: `vite.config.js` build configuration; the built `dist/assets/*.css` and
  font files; the build-time CSP meta tag (ADR 0006); `.github/workflows/deploy.yml` build job
  (Build step, line 120) and deploy job smoke steps (R80 at line 191, R82 at line 280);
  `@fontsource/jetbrains-mono`, `@fontsource/inter`, `@fontsource/space-grotesk` at 5.2.8
  (confirmed, `package.json`); GitHub Pages.
- Data touched: none. No personal or visitor data, no special categories (profile
  `special_categories: []`, confirmed). Font files and CSS only.

## Constraints

- From the client profile: `vite.config.js` and `.github/workflows/**` are `sensitive_paths` and
  `tier_floor_paths` tier 2 (confirmed, profile lines 73 to 76 and 154). `package.json` is too, if
  the spec adds a script. No new dependency without its name, licence and exact version. Tests sit
  next to their subject as `*.test.js(x)` and are never edited to pass. Conventional commits on
  `wh/`. Actions stay pinned to full commit SHAs (confirmed, `deploy.yml`). Smoke assertions are
  blocking and name the assertion and URL (R83). The owner performs every push to `main`, and a
  merge to `main` is a production release (CLAUDE.md, confirmed). Global rule: a check that can
  find nothing to check must fail loudly, not pass.
- From this request: fix the cause in the build, not the policy. The retro's draft eval GC95
  allowed `data:` fonts if `font-src` listed `data:`; this request rules that out, so the check is
  unconditional. The requester's diagnosis names `build.assetsInlineLimit`; how it is set is for
  the spec (open question 1).
- Non-goals: adding `data:` to `font-src`; changing any other CSP directive or the referrer
  policy; dropping the Cyrillic-ext or Vietnamese subsets, or any weight, unless the spec decides
  otherwise with a reason; changing site content or `src/data/portfolioData.js`; any dependency
  upgrade or new dependency; adding a headless browser to CI; changing the Pages host or base.

## Success metrics

| Metric | Target | How measured |
|--------|--------|--------------|
| M1 `url(data:font` occurrences in `dist/assets/*.css` | 0 (served CSS has 12 today) | Grep after `npm run build`, local and CI |
| M2 CSP string in built HTML | Byte-identical to today; contains `font-src 'self'`, no `data:` in `font-src` | Compare `dist/index.html` and `dist/404.html` meta content before and after |
| M3 Build check fails on regression | Exits non-zero with `data:` fonts present, and with no CSS found | Run it with the fix reverted and against an empty `dist/` |
| M4 CI smoke assertion on served CSS | 0 `url(data:font`; step blocking | Deploy run log PASS line naming the stylesheet URL |
| M5 `@font-face` blocks in built CSS | 64, unchanged | Count in `dist/assets/*.css` before and after |
| M6 Existing gates | lint, `npm test` (floor 12 passed, 0 skipped), build, blocking audit all exit 0 | Local run and the CI build job |
| M7 Live console, post-release | 0 CSP violations, 0 uncaught errors | Owner's R84 browser check, logged in `docs/hosted-config.md` section 6 |

## Risk signals

- Tier-2 floor path: `vite.config.js` (`.workhorse/profile.yml` line 154, confirmed). The change
  edits `build.assetsInlineLimit` behaviour in this exact file, which also defines the CSP meta
  tag content at line 18 (`vite.config.js`, confirmed, read 2026-09-13).
- Tier-2 floor path, CI workflow: `.github/workflows/deploy.yml` (`.workhorse/profile.yml`
  line 154, confirmed). The change adds a blocking smoke assertion to this workflow's deploy job
  (intent Outcome 4); the file's Build step at line 120 runs `npm run build` (confirmed, read
  2026-09-13) and is the step the new post-build check attaches to.
- Rule-table trigger, independent of the floor: a CI workflow change is itself listed as a
  tier-2 condition. `.github/workflows/deploy.yml` is the repository's only CI/CD pipeline and
  the only path that publishes to production (`.workhorse/profile.yml` line 74, confirmed).
- Possible tier-2 floor path: `package.json` (`.workhorse/profile.yml` line 154), only if the
  spec adds an npm script for the new build check (intent Constraints, believed, not verified
  which way the spec will decide; assumed touched per the instruction to assume the worse case).
- Sensitive path, both files: `vite.config.js` and `.github/workflows/**` are listed under
  `sensitive_paths` in `.workhorse/profile.yml` lines 74 and 76 (confirmed).
- Security-adjacent configuration: the edited file also carries the Content-Security-Policy meta
  tag (`vite.config.js` lines 13 to 24, confirmed). The intent requires the CSP string stay
  byte-identical (Outcome 2, M2), so the risk is a regression in security configuration, not an
  intended change to it.
- Release: a merge to `main` deploys to the public site via GitHub Pages; the site owner performs
  every push to `main` (CLAUDE.md, confirmed).
- No tier-3 signal found: no schema or migration, no production data backfill, no movement of
  money or balances, no auth or session flow, no special-category data (`.workhorse/profile.yml`
  `special_categories: []`, confirmed), and the action is not irreversible (a bad build config or
  smoke assertion can be reverted in a follow-up commit; believed, not verified beyond ordinary
  git revert capability).
- Not applicable: auth, payments, PII, database, RLS, storage buckets, infra/IaC, new third-party
  integration. None exist in this project (`.workhorse/profile.yml`, confirmed: `database: none`,
  no auth, no payment path referenced anywhere in the profile or codebase map).

## Open questions

| Question | Proposed default | Owner |
|----------|------------------|-------|
| Q1 Set `assetsInlineLimit: 0` for everything, or a function that refuses to inline font files only? | Font-only function, so images and other assets build exactly as today; the spec confirms the function form exists in Vite 5.4.21 (believed, not verified) | Spec, owner confirms at G2 |
| Q2 Is the build check a Vitest test, a node step in CI after build, or both? CI runs tests before the build (`deploy.yml` lines 96 and 120, confirmed), so a test reading `dist/` would find nothing there | An inline `node -e` step after Build in the build job, matching R52 and R85, runnable locally with the same command | Spec |
| Q3 How does the smoke step get the hashed CSS name? | Reuse `smoke/stylesheet.css`, which R80 already fetches from the served HTML (line 241, confirmed); spec decides whether to cover every stylesheet link, since R80 takes only the first | Spec |
| Q4 Keep the Cyrillic-ext and Vietnamese subsets? | Keep all subsets and weights; they become separate font files | Owner |
| Q5 Add browser automation to catch console CSP errors in CI? | No. Playwright stays rejected on cost; R84 remains the control | Owner |

## Source

The request above, run on 2026-09-13. Origin: `docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/retro.md`,
"What it missed" item 6, Follow-ups row 1 and draft eval GC95; `release.md` section e and the R84
result table (item 4 FAIL).

## Findings outside scope

- `docs/hosted-config.md` section 6 still reads "No entries yet" despite the 2026-09-13 deploy
  (confirmed, line 108; retro Follow-ups row 5). The owner adds that line himself.

## G1 packet

### 1. TL;DR

The live site logs 12 CSP font errors because Vite inlines small JetBrains Mono subset files as
`data:` URLs, which `font-src 'self'` blocks. This intent asks for a build-config fix that keeps
the policy as it is, a blocking post-build check, and a blocking smoke assertion on the served
CSS, with a live browser check by the owner after release. Decide whether the problem, outcome,
non-goals and the five defaults below are right.

### 2. Decisions requested

| Decision | Recommendation | Alternative | If the alternative is picked |
|----------|----------------|-------------|------------------------------|
| Q1 inline limit shape | Font-only function | `0` for all assets | Simpler config; small images also become files (more requests, no CSP effect since `img-src` allows `data:`) |
| Q2 build check form | `node -e` step after Build | Vitest test that runs a build | Test floor rises; the spec must handle the tests-before-build order |
| Q3 smoke source | Reuse R80's `smoke/stylesheet.css` | Fetch every stylesheet link | Slightly more shell in `deploy.yml` |
| Q4 subsets | Keep all | Drop Cyrillic-ext and Vietnamese | Smaller payload; those glyphs fall back to another font |
| Q5 browser in CI | No | Add one Playwright smoke test | New dependency, new cost; R84 stops being the only console control |

### 3. Evidence

| Check | Exit | Output | Status |
|-------|------|--------|--------|
| Read `vite.config.js`: no `assetsInlineLimit`, `font-src 'self'` at line 18 | n/a | file | confirmed |
| Read `deploy.yml`: R82 reads HTML and module only; tests precede build | n/a | lines 96, 120, 241, 304 to 310 | confirmed |
| Installed Vite version | n/a | `node_modules/vite/package.json`: 5.4.21 | confirmed |
| Subset files exist for 400 to 700 | n/a | glob of `node_modules/@fontsource/jetbrains-mono/files/` | confirmed |
| Served CSS: 64 faces, 12 `data:` fonts, 116 file URLs; console error | n/a | main session, 2026-09-13 | confirmed by the main session, not re-checked here |
| Vite default limit is 4096 bytes | not run | docs not fetched | believed, not verified |
| Local `npm run build` and grep of `dist/` | not run | intent does not run builds | not verified |

Eval pass rates: not applicable; nothing is built yet.

### 4. Constraint audit

| Severity | Source | Item | Resolution |
|----------|--------|------|------------|
| Medium | Profile `sensitive_paths`, tier-2 floor | `vite.config.js` and `deploy.yml` will change | Accepted by design; each edit prompts the owner |
| Medium | CLAUDE.md, release | Outcome 6 needs the owner's push and browser | Written as owner-performed post-release acceptance |
| Low | Global rule, no silent green | Check must fail on an empty `dist/` | Required in outcome 3 and M3 |

### 5. Risk register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Config change alters other assets or the CSP | Low | Visible regression or weaker policy | M2 and M5; Q1 default limits the change to fonts | Build phase |
| Check passes on nothing (wrong glob, empty `dist/`) | Medium | Green check that proves nothing | Outcome 3 and M3 | Build phase |
| Another CSP violation stays invisible to CI | Medium | Console errors ship again | R84 after every `vite.config.js` change | Site owner |

### 6. Design tour

Not applicable: no design yet. The spec and its design tour arrive at G2.

### 7. Checklist

- [ ] The problem and outcome match what you asked for
- [ ] The non-goals are right, especially no `data:` in `font-src` and no subsets dropped
- [ ] Q1 to Q5 defaults are acceptable, or you name the alternative in your approval notes
- [ ] You will run the R84 browser check after your push and log it in `docs/hosted-config.md`

Security checklist: the pre-ship list is embedded at G4. Its database, RLS, function, storage,
admin and free-text items do not apply (no backend, confirmed by profile). New-dependency pinning
applies only if the spec adds one, which is a non-goal.

Recommend approve.

```
/workhorse:approve G1
/workhorse:approve G1 --reject "notes"
```

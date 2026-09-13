# Review packet: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Gate: G4
Tier: 2
Branch: `wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages` at `ac38128`
(verification ran green at `8ea98a7`; `ac38128` differs only in `docs/sdlc/**`, confirmed by the
bug reviewer)
PR: not opened. Prerequisite: the owner publishes local main (942d311) to the empty private
origin; the conductor then pushes this branch and opens the PR against main.
Prepared: 2026-09-13

## 1. TL;DR

This change turns the single-page, undeployable Vite/React scaffold into a multi-page portfolio
(`/`, `/work`, `/work/:slug`) with a live orb hero, self-hosted fonts, a real test suite and a
GitHub Actions deploy to GitHub Pages, so the owner has a working link for his resume and job
applications. Verification is green (164/164 tests, lint, build and the scoped `security_audit`
all exit 0), and the four reviewers found no finding above medium. No PR exists yet: the GitHub
repository `muhibm1/Portfolio` is private with no branches at all (confirmed: `git ls-remote
--heads origin` returns nothing, `gh repo view` shows an empty `defaultBranchRef`), so the owner
must first publish local main (`942d311`, the G3 approval commit, no `.github` directory) to
origin before the conductor can push this branch and open a PR. You are asked to ratify five
grouped decisions below, several of which a delegated instruction answered on your behalf during
Verify, before this can go to `main`.

## 2. Decisions requested

| # | Decision | Recommendation | Alternative | If you choose the alternative |
|---|----------|----------------|-------------|-------------------------------|
| D1 | Ratify the `security_audit` scope change. At commit `26b5c0e`, under your instruction "Approve every command yourself, I'm busy", the main session (not you) confirmed ADR 0009's accepted-risk position and changed `.workhorse/profile.yml` line 41 from `npm audit --audit-level=high` to `--omit=dev`. That change alone turned Verify from red to green. It accepts, among five dev-only advisories, `GHSA-82fw-gwwq-j7x9` (arbitrary file read in the Vitest runner), and two Windows-specific advisories mitigated only behaviourally (no `--host`, no untrusted browsing while `npm run dev` runs on this Windows host) | The security reviewer judges the acceptance sound on the merits (dev-only, confirmed; blocking audit clean; `dist/` has 0 `.map` files and no dev-server code) but not a valid owner acceptance until you ratify it here | Reject the delegated acceptance | Revert `profile.yml` line 41 to the unscoped command; Verify returns to red on the same 5 GHSA ids until each is fixed upstream (all fixes are semver-major) |
| D2 | Repository visibility for the first deploy (G3-D3, still open), and the identity exposure that comes with it. GitHub Free serves Pages only from a public repository; `muhibm1/Portfolio` is private today. Going public also publishes all 67 commit author/committer entries (`@instructors.2u.com`), the email in `approvals.md` "Who" lines, and the owner's phone number in git history from `b50497f` onward (already accepted, not rewritten, per `hosted-config.md` item 7). Making main public also puts that same history on GitHub, private until you decide this | Make the repository public before the first push to `main` (after item 1's prerequisite: the owner publishes main to origin first); accept the identity exposure as a known, documented consequence; use a GitHub no-reply address for commits from here on | (a) A paid GitHub plan (conflicts with the "no paid services" business constraint). (b) Publish `dist/` to a separate public repository (needs a spec amendment and a new write credential). (c) Rewrite git history before going public to scrub author emails and the phone number | (a)/(b) block the first Pages deploy indefinitely; branch protection also stays unavailable (`gh api .../protection` returns 403 on a private Free repo). (c) invalidates every commit SHA quoted in `approvals.md`, `state.json` and this change's SDLC artifacts |
| D3 | Phone-number redaction scope, counted precisely by the conductor with `git grep` (digits never printed in any artifact). The full ten-digit number appears in 3 places: `intent.md:311`, `spec.md:460`, `spec.md:1466`. The last seven digits alone (exchange plus line number, no area code) appear on 7 lines of `spec.md`, 3 of `evals.md`, 2 of `intent.md` (some inside eval check commands). The redacted form (area code and exchange, with `xxxx`) appears in `spec.md` (3), `evals.md` (2), `intent.md` (1), `docs/sdlc/constraints.md` (1), so the full number can be rebuilt from any committed last-seven occurrence plus a redacted form. The look-alike string in `src/data/portfolioData.test.js` is a different number (sha256 differs); it is not the owner's | Extend the redaction (GC89 option b) to every remaining full and partial occurrence, replacing each with the generic pattern already used in `portfolioData.test.js` and `deploy.yml` | Leave the remaining occurrences as committed text | The number stays reconstructable from committed files the moment the repository goes public (D2); this compounds the git-history exposure already accepted in `hosted-config.md` item 7 |
| D4 | Four `public/mockup-*.jpg` files (`mockup-home`, `mockup-casestudy`, `mockup-maroon`, `mockup-mmlogo`) are unreferenced by any component but still copy into `dist/` and would publish at stable URLs for the first time. They show an Apple logo, Apple-attributed metrics that differ from `portfolioData.js` (for example "350M+" vs the shipped "150" LLM throughput figure), and "Log in / Sign up" chrome | `git mv` them to `docs/design/` and add a build assertion that `dist/` has no `mockup-*` file | Accept publication as is | An Apple-branded, factually inconsistent internal mockup becomes publicly and permanently fetchable at a stable URL |
| D5 | `src/components/ContactFooter.jsx:94` "Back to Top" is a genuine open code defect (bug reviewer), not an owner decision: `href="#overview"` is a no-op on `/work`, `/work/:slug` and the not-found page, and the footer renders on every route; no eval covers it | Fix before merge (route-aware target, for example scroll-to-top or a link to `/`), because it is visible on every non-home route and is a one-line change. The six open low bug findings can optionally be fixed at the same time | Defer to a follow-up change | Rejecting G4 with notes sends this change back through a fix loop before merge; approving with the defect accepted records it in the risk register as a known issue instead |

## 3. Evidence

Checks (from `verification.md`, run on Node v22.12.0, commit `8ea98a7`; `ac38128` changes only
`docs/sdlc/**` per the bug reviewer, so these results still describe the reviewed code):

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `npm ci` | carried, unchanged lockfile | `verify-logs/install.log` | confirmed pass |
| typecheck | none | n/a | n/a | no check defined (no TypeScript) |
| lint | `npm run lint` | 0 | `verify-logs/lint.log`, 0 warnings | confirmed pass |
| test | `npm test` (Vitest) | 0 | `verify-logs/test.log`, 21 files, 164 tests, 0 failed | confirmed pass |
| build | `npm run build` | 0 | `verify-logs/build.log`; `dist/index.html`, `dist/404.html`, `dist/.well-known/security.txt` present | confirmed pass |
| e2e | none | n/a | n/a | no check defined, by design (cost) |
| security_audit | `npm audit --omit=dev --audit-level=high` (profile line 41, changed at `26b5c0e`; see D1) | 0 | `verify-logs/security_audit.log`, 0 vulnerabilities | confirmed pass |
| full-tree audit (informational, R57) | `npm audit --audit-level=high` | 1 | `verify-logs/security_audit_full.log` | confirmed: exactly the 5 GHSA ids ADR 0009 accepts, none new |
| screenshot | none | n/a | n/a | no check defined |

Not verified pre-deploy: everything CI-only (Linux install, the four smoke-check halves R80-R83,
branch-protection state, response headers) and everything manual by design (R19, R22 visual half,
R77/R86 dependency evidence tables, R79 visual half, R84 four-item browser check). Full list in
`verification.md` "Not verified".

Eval summary: golden 82/82, edge 21/21, failure 15/15 scoreable pre-deploy, adversarial 14/14 (+
AD13 documented, not pass/fail), non-functional 16/17 automatable portions confirmed (NF14 is
CI-only). All targets are 100% for the cases that can run before the first deploy.

## 4. Findings

Merged from all four reviewers, sorted by severity. No finding above medium was raised. The
conformance reviewer's claim that `state.json` shows G1-G3 pending is dropped from this packet:
`WH status --json` shows G1, G2 and G3 approved, confirmed by the conductor.

| Severity | Reviewer | File:line | Finding | Resolution |
|----------|----------|-----------|---------|------------|
| Medium | Security | `.workhorse/profile.yml:41`, `adr/0009` | `security_audit` scope narrowed to `--omit=dev` by the main session under delegation, not the owner; this alone turned Verify green. Includes `GHSA-82fw-gwwq-j7x9` and two Windows-specific advisories mitigated only behaviourally | Open: owner ratification requested at D1. If declined, revert line 41 and Verify goes red |
| Medium | Security | `spec.md` (full number at line 460, 1466; last-seven digits on 7 lines total; redacted form on 3 lines), `evals.md` (last-seven on 3 lines, redacted on 2), `intent.md` (full number at line 311; last-seven on 2 lines; redacted on 1) | Owner's phone number, in full or partial form, remains in committed docs at HEAD, counted precisely by the conductor with `git grep`; any last-seven occurrence plus a redacted form rebuilds the full number; `hosted-config.md` recommends going public before this is resolved | Open: owner decision at D3 |
| Medium | Security | `public/mockup-home.jpg`, `mockup-casestudy.jpg`, `mockup-maroon.jpg`, `mockup-mmlogo.jpg` | Copy into `dist/` and would publish at stable URLs for the first time; show an Apple logo and Apple-attributed metrics that differ from `portfolioData.js`; nothing in `src/` references them | Open: owner decision at D4 |
| Medium | Bug | `src/components/ContactFooter.jsx:94` | "Back to Top" (`href="#overview"`) is a no-op on `/work`, `/work/:slug` and the not-found page; `#overview` only exists on `/`. The footer renders on every route | Open code defect, no eval covers it. Fix-vs-defer decision at D5 |
| Low | Bug | `src/pages/HomePage.jsx:39-49`, `SiteLayout.jsx:13` | Navbar highlights the wrong section after returning home at scroll 0; the scroll spy only runs on scroll events and `activeSection` survives the route change | Open |
| Low | Bug | `src/components/SiteLayout.jsx:36-40` | Browser Back drops the visitor at the top of home instead of restoring scroll position; matches R7 as written | Open; spec question for owner |
| Low | Bug | `src/components/CaseStudyPage.jsx:28` | Selected tab carries over to the next case study; the route element has no `key` | Open |
| Low | Bug | `vite.config.js:13-24` | `font-src 'self'` CSP blocks 8 of 64 built `@font-face` blocks Vite inlines as `data:` URIs (JetBrains Mono Cyrillic/Vietnamese glyphs); not visible today, `src/` has no such characters | Open |
| Low | Bug | `vite.config.js:75-77` | `404.html` copy in `closeBundle` throws `ENOENT` on a failed build and masks the real error; the build still fails, nothing broken deploys | Open |
| Low | Bug | `src/App.jsx:17` | `/Portfolio/index.html`, a direct link to the built entry file, renders "Page not found"; a fix needs a fifth route, which R3 forbids | Open: owner decision |
| Low | Security | `.github/workflows/deploy.yml:11-13`, `dependabot.yml` | Dependabot PRs get no CI before merge; the build job triggers on push to `main` only. No fork reach today | Open |
| Low | Security | `package.json:18-20,22` | `lucide-react`, `react`, `react-dom`, `thinking-orbs` keep caret ranges in the runtime path, outside R85's nine-package allowlist; predate this change; lockfile integrity-hashed | Open, pre-existing |
| Low | Security | `deploy.yml:104` | Test-count floor is 12 against 164 actual tests; constraint-audit Low still open | Open |
| Low | Security | `public/.well-known/security.txt:4` | `Expires` set to exactly one year; RFC 9116 recommends less than a year | Open, trivial |
| Low | Security | `src/data/portfolioData.js:181` | "wasl" tagline plausibly makes religious affiliation inferable; `profile.yml:139-143` still asserts nothing is inferable; copy was approved at G3-D1 | Open: record the owner's conscious decision, update the profile comment |
| Low | Security | git metadata (67 author/committer entries), `approvals.md` | All commits use an `@instructors.2u.com` address; approvals carry an email; going public publishes both | Open: owner decision at D2 |
| Low | Conformance | `CaseStudyModal.jsx:217` (pre-rename) | "Metrics audited and verified across production environments." was removed as a side effect of the R22 heading change, not individually named by a G3-D5 range | Fixed (already removed); flagged as undirected scope |
| Low | Conformance | `NotFoundPage.jsx`, `CaseStudyPage.jsx` (Previous/Next) | New UI strings are inline rather than in `portfolioData.js`; defensible as chrome, but a literal reading of the content convention differs | Open |
| Low | Conformance | `spec.md` R43, `WorkIndexPage.jsx` | R43's spec text was not amended for G3-D2 (`repoPublic`); 0 GitHub links render on `/work` today because all three repos are private. GC43 was amended, the spec prose was not | Open, doc drift |
| Low | Conformance | `src/components/ProjectEntry.jsx:5` | `PRIVATE_REPOSITORY_NOTE` uses a middle dot (U+00B7); R19 requires `~` as the only separator | Open, genuine drift |
| Low | Conformance | `spec.md:17`, `adr/0009` header, `plan.md:220` | Stale docs: spec header says "R80-R89" (ten) vs eleven elsewhere; the spec's Tailwind row cites `verification.md` line 17 wrongly; `plan.md` line 220 shows the pre-`26b5c0e` audit command; ADR 0009's header date (2026-09-12) disagrees with the log (2026-09-13T00:04Z) | Open, doc drift |
| Low | Conformance | `src/App.jsx`, `adr/0001` | `App.jsx` has 5 `<Route` (4 path/index + 1 pathless layout) vs R3's acceptance text "equals 4"; GC3 was amended to 5 but ADR 0001 still says four | Open, doc drift |
| Low | Conformance | `package.json` (`tailwindcss`, `@tailwindcss/vite`) | Both sit outside the R49/R85 nine-package allowlist, pinned exact at 4.3.3 in `devDependencies` | Accepted: documented gap (B3, ADR 0009) |
| Low | Adoption | `README.md` | Still the create-vite template; deferred as an outside-scope item in `spec.md` line 1218 | Open |
| Low | Adoption | repo `CLAUDE.md` | States lint fails and there are no tests; on Node 22.12.0 lint exits 0 and 164 tests pass | Open, stale |
| Low | Adoption | `package.json`, `.nvmrc` (absent) | No Node version pin while oxlint 1.81.0 requires `^20.19.0` or `>=22.12.0` and CI uses Node 22 | Open |
| Low | Adoption | `.github/workflows/deploy.yml` | Three step-name styles; `ROOT_URL`/`MODULE_URL` via `GITHUB_ENV` uncommented at use; grep/sed asset extraction not labelled as an accepted trade-off; "Read the Pages configuration" step runs `configure-pages` with `enablement: false` | Open, readability |
| Low | Adoption | `src/components/FdePhilosophy.jsx` | Icons bound by array index with no test of the binding | Open |
| Low | Adoption | components using `text-[#1d1d1d]`, `src/index.css` `--ink: #181818` | Hard-coded hex colour diverges from the CSS token value | Open |
| Low | Adoption | `.gitignore:31` | Blanket `.claude/` would drop a committed Claude config if the owner ever adds one; nothing tracked today | Open, low priority |
| Low | Adoption | `spec.md` (1827 lines) | De facto runbook; consider extracting a dedicated runbook document (believed, not verified; unlabelled by the reviewer) | Open, nice-to-have |

Conformance summary: 90 requirements, 82 automated and passing, 5 manual by design, about 14
CI-only awaiting the first deploy, 2 pending your evidence review at this gate (R77 and R86's
dependency version/licence tables, in `conductor-log.md` T1/T1b entries), 0 missing, 0 untested.
No unauthorised scope creep or undisclosed sensitive-path edit.

Adoption score: 3/5. Blockers for 4+: stale `README.md` and `CLAUDE.md`, no Node version pin,
unedited `deploy.yml` readability items, untested icon-index binding, a hard-coded colour that
diverges from its token, and an overbroad `.gitignore` entry.

## 5. Risk register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| No PR exists; main has no branches on origin | Certain until the owner acts | G4 cannot proceed to a PR or a merge | Owner publishes local main (`942d311`, no `.github` directory, so no workflow runs) to origin; the conductor then pushes this branch and opens the PR | Site owner |
| Repository stays private past the first push | High until D2 | First Pages deploy fails; branch protection stays unavailable | D2 decided at this gate before the push | Site owner |
| ADR 0009 / profile change is not ratified | Open until D1 | If declined, `security_audit` reverts to the unscoped command and Verify returns to red | D1 decided at this gate | Site owner |
| Phone number, full or partial, remains in committed docs and in git history | Medium | Reconstructable from committed files, and readable in history, once the repository or its history is public; publishing main to origin (still private) already puts that history on GitHub | D3 decides the redaction scope; `hosted-config.md` item 7 already records the history exposure as accepted | Site owner |
| Mockup images with Apple branding and mismatched metrics publish to `dist/` | Medium | Reputational or trademark concern on first publication | D4 decides removal vs acceptance | Site owner |
| "Back to Top" is broken on every non-home route | Medium | Visible navigation defect from first deploy | D5 decides fix-before-merge vs defer; five related low bug findings tracked separately | Site owner |
| Scroll-restoration and other low-severity navigation defects | Low to Medium | Minor UX defects, no data or security impact | Tracked as open findings; not release-blocking at tier 2 | Next change |
| Dependabot PRs can merge to `main` without CI on the build job | Low | An unreviewed dependency change could deploy | Add a `pull_request` trigger for the build job (spec change to R55) | Next change |
| Adoption gaps (README, CLAUDE.md, no Node pin, deploy.yml readability) | Certain until fixed | Onboarding and maintenance friction; no functional risk; holds the adoption score at 3 | Track for a follow-up change | Site owner |
| Vite 5 test-key rejection or an inline script in the build | Closed | Would have broken the build or shipped a CSP violation | R50 fallback import; R66/R82 checks passed in Verify | Build phase (resolved) |
| A dependency pin does not resolve, or a lockfile regeneration moves a major version | Closed | Would have shipped an unreviewed dependency | R77/R86 tables checked and escalated during build; nothing moved silently | Build phase (resolved) |

## 6. Diff tour

Ordered by risk: sensitive paths first, then business logic, then interfaces, then tests, then
docs and config. 70 files changed, 6685 insertions, 1643 deletions (`git diff main...HEAD --stat`).

1. **`.github/workflows/deploy.yml`** (new, 315 lines, sensitive). The only path that can publish
   to production. Build and deploy jobs, 5 actions pinned to commit SHAs, no secrets, smoke
   assertions (R80-R83) inline beside `id-token: write`. First in the tour because it is the
   deploy mechanism itself.
2. **`.github/dependabot.yml`** (new). Weekly dependency PRs; no pre-merge CI (finding above).
3. **`index.html`** (sensitive, -3/+1 net on the font tags). Removed the three Google Fonts tags,
   added the favicon link. Closes the GDPR-adjacent third-party-call flag.
4. **`vite.config.js`** (sensitive, +67 lines, new file effectively). Sets `base: "/Portfolio/"`,
   injects the CSP and referrer-policy meta tags, copies `404.html` in `closeBundle` (bug finding
   above), adds the Vitest config block. A wrong `base` breaks every asset on Pages.
5. **`package.json` / `package-lock.json`** (sensitive, supply chain). Nine packages pinned at
   exact versions, `@rolldown/binding-win32-x64-msvc` removed, Tailwind moved to
   `devDependencies`. Caret ranges remain on four pre-existing runtime packages (finding above).
6. **`src/data/portfolioData.js`** (sensitive, employer-derived claims). Phone key deleted;
   `projects`, `demos`, `personal.github` added. Content-preservation review at G4: additions
   only, no existing metric, date, employer or role string changed, confirmed by reading the diff.
7. **`.workhorse/profile.yml`** (human-owned config, +7/-1). `security_audit` line 41 reversed
   under delegation (D1); `commands.test`/`test_file` set; `portfolioData.js` added to
   `sensitive_paths`.
8. **`docs/hosted-config.md`** (new, 159 lines). Records the open owner decisions this packet
   surfaces: repository visibility, branch protection blocked by visibility, the accepted
   phone-in-history exposure, and the not-yet-recorded response headers.
9. **`adr/0009-accept-dev-only-vite-and-vitest-advisories.md`** (new, 74 lines) plus amendments to
   ADR 0001, 0004, 0005, 0006. Records the dependency and audit-scope decisions behind D1.
10. **Business logic**: `src/components/CaseStudyPage.jsx` (renamed from `CaseStudyModal.jsx`,
    -308/+240), `ThinkingOrbHero.jsx` + `orbDrawing.js` (new canvas animation, no prior code to
    compare against), `ContactFooter.jsx`, `Navbar.jsx`, `ResumeModal.jsx`,
    `InteractiveTriageSimulator.jsx`, `ProjectEntry.jsx`, `CaseStudiesSection.jsx`, `Hero.jsx`,
    `SiteLayout.jsx`, `App.jsx` (route table rewrite). The largest functional surface; five of
    the medium/low bug findings above sit in this group.
11. **Interfaces**: `src/pages/HomePage.jsx`, `WorkIndexPage.jsx`, `NotFoundPage.jsx`,
    `CaseStudyFlowDiagram.jsx`, `src/main.jsx`, `src/basename.js`, `src/hooks/useClipboardCopy.js`.
    Compose the business-logic components above into the five routes.
12. **Tests**: 21 `*.test.jsx`/`*.test.js` files, 164 tests, added alongside every component and
    page above in the same commits.
13. **Docs and config**: `docs/sdlc/**` artifacts for this change, `public/.well-known/security.txt`
    (new), `.gitignore` (+6), `docs/sdlc/constraints.md` (redaction). `README.md` and repo
    `CLAUDE.md` are untouched and stale (adoption findings above); `src/App.css` remains unused
    and out of scope.

## 7. Checklist

- [ ] No PR exists yet; the owner publishes local main (`942d311`) to the empty private origin
      first, then the conductor pushes this branch and opens the PR against main
- [ ] Intent still matches what the owner asked for
- [ ] Every requirement has a test (82 of 90 automated; 8 manual/CI-only by design, tracked above)
- [ ] No finding above medium remains unresolved (true: highest open severity is medium; three of
      the four medium findings are owner decisions, D1, D3, D4; the fourth, Back to Top
      (`ContactFooter.jsx:94`), is an open code defect with no eval covering it, fix-vs-defer
      decision at D5)
- [ ] Rollback is documented (`plan.md` "Rollback"; the owner's `git revert` on `main` after G5)
- [ ] Client engineer could maintain this from the docs alone (adoption score 3/5 says not yet;
      see the adoption findings)

Security pre-ship checklist, embedded verbatim (tier 2), each line's disposition exactly as the
security reviewer recorded it:

- [ ] Every new or changed `for update` policy: all columns listed, each decided, pinning trigger
      added where the policy is not sufficient. **N/A: no database.**
- [ ] Every new or changed `for insert` policy: the UPDATE path re-checks the same invariants.
      **N/A: no database.**
- [ ] Every new function: explicit grant or revoke in the same migration; `SECURITY DEFINER`
      justified; `search_path` set; anchored to `auth.uid()` or the reason stated. **N/A: no
      database.**
- [ ] Every `CREATE OR REPLACE`: diffed line by line; side effects confirmed present. **N/A: no
      database.**
- [ ] Every new policy ships two tests in the same commit: one admitting the right rows, one
      denying the wrong ones. **N/A: no policies.**
- [ ] Deny-side assertions distinguish failure modes: hidden-ness for reads, rejection for writes,
      and read-back with an admin client for blocked updates. **N/A: no policies.**
- [ ] New storage bucket: private unless there is a written reason. **N/A: no storage bucket.**
      The security reviewer notes the `public/` analogue fails under the mockup-files finding
      above: everything in `public/` is world-readable by design, including the four mockups.
- [ ] New table holding user free text: length constraint, and a rate limit if insertable in a
      loop. **N/A: no user input anywhere.**
- [ ] New admin capability writes to an append-only log. **N/A: no admin surface.**
- [ ] New secret or env var covered by `.gitignore` as a pattern; confirmed with `git ls-files`.
      **Pass.** No secret or env var added; `.env*` pattern confirmed via `git check-ignore` and
      `git ls-files`; 0 Actions secrets (`gh api .../actions/secrets`, `total_count: 0`).
- [ ] New third-party import in a runtime path pinned to an exact version. **Pass.**
      `react-router` 7.18.3 (MIT), three `@fontsource` packages at 5.2.8 (OFL-1.1), each version
      and licence read from `node_modules/<package>/package.json`.

Checklist result: 2 pass, 0 fail, 9 n/a. Separately, the security reviewer's specific R-based
checks scored 20 pass, 3 fail (phone in committed docs; branch protection returns 403 because the
repo is private; `public/` holds the four unintended mockup files), 2 n/a (response headers and
error tracking, both settled at or excluded by design until the first deploy).

## 8. Recommendation

Recommend approve with conditions: verification is green and no finding is above medium, but
three open medium findings are owner decisions (D1, D3, D4), one medium finding is an open code
defect (Back to Top, `ContactFooter.jsx:94`, fix-vs-defer decision at D5), and the adoption score
is 3 of 5, below the bar for an unconditional approve. Also no PR can be opened yet: the owner
must publish local main to the empty private origin first. Approving G4 with this packet's notes
should explicitly answer D1 through D5; the adoption findings are not release-blocking at tier 2
and may be deferred to a follow-up change, but should be acknowledged in the approval notes.

```
/workhorse:approve G4
/workhorse:approve G4 --reject "notes"
```

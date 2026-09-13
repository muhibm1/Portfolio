# Constraints

Muhammad Muhibullah personal portfolio. Written 2026-09-10 by the discovery analyst against
commit `b50497f`. Companion to `docs/sdlc/codebase-map.md` and `.workhorse/profile.yml`.

Statements are marked **confirmed** (observed) or **believed** (inferred or stated but not
verified). The G0 packet at the end lists what only the owner can decide.

---

## How the business uses this

There is no company here. The owner is the client, the engineer, the only data subject, and the
only approver. Sources for this section: the owner's description at onboarding and
`docs/design-brief.md`, which is the closest thing this project has to a product document.

**Who uses it.** Recruiters, hiring managers and interviewers, worldwide but mostly United
States. They arrive from a link on the owner's resume, LinkedIn profile, or a job application.
**Believed**, from the owner's description; there is no analytics and never will be, so visitor
behaviour is unobservable by design.

**The operational loop.**

1. The owner applies for a Forward Deployed Engineering or Solutions Engineering role, or is
   contacted by a recruiter.
2. The link to this site goes out with the resume or in the reply.
3. A recruiter opens it, scans the hero and headline metrics, and either leaves or goes deeper
   into a case study.
4. If convinced, they contact the owner by the `mailto:` link or LinkedIn. (The phone number was a
   third route until change 2026-09-11 removed it from the site under R41.)
   The site itself records nothing about this; the first the owner knows of a visit is an email.
5. The owner updates content when a role, a metric, or a project changes, then pushes.

**Where a human decides.** Every decision is the owner's, and all of them are about content and
taste rather than operations: what claims to publish about employers, which case studies to
feature, how much contact detail to expose, and when to push to production. There is no
on-call, no SLA, no incident process, and no second person to consult. A failed deploy or a
broken page costs a missed impression, not money or data.

**What success looks like.** A recruiter who lands on the page understands within one screen
that the owner builds production integrations and auditable LLM decision systems, and can reach
him in one click. `docs/design-brief.md` sets the design direction for that: OFF+BRAND palette
and motion, Jakub Reis layout for the work index, and Varick Agents' consistent case-study card
pattern.

---

## Technical constraints

1. **Static only.** No backend, no database, no server-side code, no secrets. GitHub Pages
   serves files and nothing else. Anything that needs a server is out of scope. **Confirmed**
   for the current repo, **believed** for the host since Pages is not configured yet.
2. **Everything published is public and permanent-ish.** Every byte in `dist/` is fetchable by
   anyone, and search engines and archives will copy it. There is no such thing as an unlisted
   page here, and removing something later does not unpublish the copies.
3. **No visitor data may be collected.** This is a deliberate constraint, not an accident of the
   current build. It keeps the site outside almost all of GDPR's operational machinery. Adding a
   single analytics snippet, embedded video, hosted form, or chat widget creates a cookie
   consent obligation and a new third party. The profile's `style_notes` and
   `sensitive_paths` entry for `index.html` exist to force that decision through a human.
4. **Windows development host.** One laptop, PowerShell primary with Git Bash available, Node
   v21.7.3, npm 10.5.0. `build.max_parallel` is set to 4 for this reason. Any script added must
   run on Windows, so no bare shell scripts in `package.json` scripts. **Confirmed.**
5. **The lint command is currently broken on this machine.** `node_modules/@oxlint/` is empty,
   so `oxlint` exits 1 with `Cannot find native binding`. **Confirmed** by running
   `./node_modules/.bin/oxlint --version`. Until `node_modules` and `package-lock.json` are
   deleted and reinstalled, every verification will report lint as failing for a reason that
   has nothing to do with the code.
6. **There is no test command and no typechecker.** The verifier will report "no check defined"
   for both. Until Vitest exists, the only automated evidence a change can produce is a
   successful `npm run build` and a lint run.
7. **`vite.config.js` has no `base`.** A GitHub Pages project site lives under `/Portfolio/`.
   Deploying as-is is expected to produce a page with no CSS and no JavaScript because every
   asset URL is absolute from the domain root. **Confirmed** that `base` is absent; **believed**
   that this breaks the deploy, since nothing has been deployed yet to observe.
8. **`package.json` carries a Windows-only binary as a direct dependency.**
   `@rolldown/binding-win32-x64-msvc` is listed under `dependencies`, is restricted to
   `os: win32` and `cpu: x64`, and is needed by nothing: `rolldown` is not installed, and Vite
   5.4.11 bundles with `rollup` and `esbuild`. **Confirmed** by reading the installed package
   manifests. Because it is a direct, non-optional dependency, `npm ci` on a Linux Actions
   runner is expected to fail with `EBADPLATFORM`. **Believed, not verified**: it cannot be
   verified from this machine, and it must be settled before the first CI run.
9. **A single page with no router.** `docs/design-brief.md` proposes `/work` and `/work/:slug`
   routes. That needs a router dependency that is not installed, and a `404.html` SPA fallback
   because GitHub Pages has no rewrite rules. Both are spec decisions, not discovery facts.
10. **Google Fonts is a hard runtime dependency of the current design.** Three font families
    load from Google on every page view. This is also the only third party that sees a visitor.

---

## Business constraints

1. **The content makes specific, checkable claims about named employers.** Apple, TCS,
   Neural Newsletters and edX appear by name alongside figures such as "30 to 350+ tickets/day",
   "50+ regions" and "-40% incidents". **Confirmed** in `src/data/portfolioData.js`. The owner
   is the only person who can confirm those numbers are his to publish and that none of it is
   confidential to an employer. No agent may invent, round, or embellish a metric.
2. **The simulator presents invented data that looks internal.** `PRESETS` in
   `src/components/InteractiveTriageSimulator.jsx` contains ticket ids such as `GEO-92841`,
   system names such as "Apple Geo Ingest API", OAuth scopes, and region identifiers. It is
   fictional demo content, **confirmed** by reading the file, but a reader cannot tell that from
   the page. The owner should decide whether it needs a visible "illustrative example" label.
3. **The owner's phone number was published on the page; it no longer is.** At G0 it
   rendered in `ContactFooter` and `ResumeModal` (confirmed at G0). Change 2026-09-11 removed it
   from the site under G1-D1 ("D1 remove phone", spec R41) and redacted every full and partial
   form of it from the tracked documents under G4-D3. Git history from `b50497f` onward still
   holds it, an accepted position recorded in `docs/hosted-config.md` section 7. The site-facing
   checks run in CI: R41's unit tests, and the generic pattern in the R82 deploy smoke step. The
   repository check is the R89 script, `scripts/check-phone-redaction.mjs`, run on a developer
   machine by evals GC41 and GC89.
4. **Timeline pressure is job-search pressure.** The site exists to support an active move into
   FDE roles. Work that delays a shippable page is expensive in a way that is invisible in the
   repository.
5. **No budget for paid services.** GitHub Pages, npm packages and the owner's time. Anything
   requiring a subscription is out.

---

## Things that must not change without the owner saying so

- **The no-tracking position.** No analytics, no cookies, no pixels, no embedded third-party
  widgets, no hosted forms.
- **The factual content in `src/data/portfolioData.js`.** Numbers, dates, employer names, role
  titles and degree details are the owner's own record. Restyle freely; rewrite claims never.
- **The owner's contact details**, in either direction. Do not remove them, and do not add new
  personal data fields such as a home address.
- **`conventions.default_branch: main` and the deploy-on-push model.** Production is published
  by pushing to `main`, so a merge is a release. Agents are blocked from pushing to `main` by
  the WorkHorse bash guard; the owner performs production deploys himself.
- **The static, no-backend shape.** Adding a server changes the compliance position of the whole
  project, not just one feature.

---

## Known debt

Each item is confirmed by reading the file named.

| # | Item | Where | Why it matters |
| --- | --- | --- | --- |
| 1 | Dead script referencing a path outside the repository | `generate_viewer.cjs` | Reads and writes `C:\Users\alqai\.gemini\antigravity\brain\10bf30e7-...`, which exists on no other machine. Nothing imports it. Delete it. |
| 2 | Lint cannot run | `node_modules/@oxlint/` empty | Blocks the only automated quality check the project has. |
| 3 | Orphan Windows-only direct dependency | `package.json` | Expected to break `npm ci` on Linux CI. |
| 4 | No `base` in the Vite config | `vite.config.js` | Expected to break the GitHub Pages deploy. |
| 5 | No test runner | whole repo | Every later phase has to verify by eye. |
| 6 | `.gitignore` has no `.env` pattern | `.gitignore` | No env file exists today, **confirmed** by `git ls-files`, so nothing is leaked. But the first `.env` anyone creates would be committable. The profile denies edits to `.env*`, which is not the same protection. Add `.env*` to `.gitignore` as a pattern. |
| 7 | README is still the create-vite template | `README.md` | Describes the scaffold, not this project. |
| 8 | Hard-coded email in one component | `src/components/CaseStudyModal.jsx` line 298 | Every other component reads `personal.email` from the data module. Changing the address would miss this one. |
| 9 | CSS custom properties are declared but unused | `src/index.css` lines 5 to 17 | Components hard-code hex colours. A palette change means editing every component. |
| 10 | Simulator timeouts are never cleared | `src/components/InteractiveTriageSimulator.jsx` lines 70 to 90 | Four `setTimeout` calls with no cleanup. Harmless on a page that never unmounts the component; a real bug the moment routing is added. |
| 11 | Clipboard failure is silent | `src/components/ResumeModal.jsx` lines 9 to 13 | `navigator.clipboard.writeText` has no `.catch`, and the button reports "Copied" whether or not it worked. |
| 12 | No error boundary | whole `src/` | Any render exception blanks the page with no message. **Confirmed**: no `try`, `catch`, or `ErrorBoundary` anywhere in `src/`. |
| 13 | Unused scaffold assets | `src/assets/react.svg`, `vite.svg`, `hero.png` | Imported by nothing. `hero.png` in particular may be intended for the hero and was never wired up. |
| 14 | Stale local `dist/` | `dist/` | Untracked and git-ignored, **confirmed**, but present on disk from an earlier build and easy to mistake for current output. |

### Security baseline items that do not yet apply, and one that does

The global security baseline is written for applications with a database and auth. Most of it is
inapplicable here and should be recorded as such rather than silently skipped: there are no RLS
policies, no `SECURITY DEFINER` functions, no migrations, no storage buckets, no admin surface,
no user free text and no account deletion path, because there is no database and no user
accounts. **Confirmed.**

Three items do apply and are open:

- **Security headers.** GitHub Pages does not let you set response headers. The achievable
  subset is a `<meta http-equiv="Content-Security-Policy">` tag in `index.html`, which cannot
  express `frame-ancestors` and cannot set HSTS. GitHub Pages serves HSTS on
  `*.github.io` itself (**believed, not verified**). Worth a deliberate decision at spec time
  rather than an omission.
- **`.well-known/security.txt`.** Cheap to add from `public/.well-known/security.txt` and it is
  the kind of detail a hiring engineer notices on an FDE portfolio.
- **Dependabot and `npm audit` in CI.** `commands.security_audit` is set to
  `npm audit --audit-level=high`; it has not been run, so the current vulnerability count is
  unknown. A Dependabot config is three lines and belongs in the same change as the deploy
  workflow.

---

## Open questions only the owner can answer

1. Are the published metrics (350+ tickets/day, 50+ regions, -40% incidents, 99.9% reliability)
   yours to publish, and is any of the Apple, TCS or Neural Newsletters detail confidential?
2. Should the simulator's invented ticket data carry a visible "illustrative example" label?
3. Do you want the phone number to stay on a public, scrapeable page? **Answered at G1 of change
   2026-09-11: removed from the site (G1-D1, spec R41).**
4. Custom domain, or `muhibm1.github.io/Portfolio/`? This decides the `base` value and whether
   a `CNAME` file is needed.
5. Multi-page with a router as the design brief proposes, or stay single-page with modals?
6. Vitest plus React Testing Library, or ship with no tests and accept build-only verification?
7. Self-host the three font families, or keep the Google Fonts link and accept that every
   visitor's IP goes to Google?
8. Is there any employer policy about publishing work detail that applies to you?

---

## Compliance controls

Written 2026-09-10 by the compliance mapper against commit `b50497f`, from
`docs/sdlc/codebase-map.md`, this file's constraints above, and `.workhorse/profile.yml`.

**This section flags; it does not decide.** The owner is this project's only engineer, only
data subject and only compliance authority — there is no separate legal, privacy or compliance
function to defer to. Nothing here is legal advice. Every "met" below has a path; every "gap"
has a one-line description of what would close it; anything genuinely uncertain is marked
"possibly applicable, confirm with client" rather than selected, per the mapper's own rule.

### Regimes considered

| Regime | Selected? | Reason |
| --- | --- | --- |
| gdpr | **No** — flagged "possibly applicable, confirm with client" (narrow scope) | See "GDPR-adjacent controls" below. Full GDPR machinery (Art. 30 records, DPO, DPIA, the 72-hour breach clock) does not apply: no special-category data, no systematic monitoring, no large-scale processing. Whether a static site with no server component "processes" the IP a visitor's own browser discloses to Google is unsettled law, not something this mapper resolves. |
| hipaa | No | No health, treatment or payment-for-care information anywhere. Confirmed by reading the full data inventory in `docs/sdlc/codebase-map.md` and `src/data/portfolioData.js`. |
| pci-dss | No | No payment handling, no card data, no forms of any kind. Confirmed: `grep -rn "fetch(|XMLHttpRequest|axios|localStorage|sessionStorage|document.cookie|gtag|analytics|dataLayer" src index.html` exits 1, no matches (recorded in the G0 packet's evidence table). |
| soc2 | No | SOC 2 is an assurance report a service organization produces for enterprise customers who rely on its controls. There is no company, no customer and no service being sold here. |
| iso27001 | No | ISO 27001 certifies an organization's information security management system. There is no organization and no third party relying on a certification. |
| financial | No | No money movement, no ledger, no balances, no financial service of any kind. |
| ccpa / cpra | No | The owner is an individual publishing his own career site, not a "business" under CCPA's thresholds, and collects no personal information from any consumer to begin with. |
| coppa | No | Audience is recruiters and hiring managers; no data is collected from anyone, child or adult. |
| ferpa | No | No educational records about students are held. The owner's own degree history in `src/data/portfolioData.js` is his own data, published by his own choice. |
| nis2 | No | Not an essential or important entity; a personal portfolio is not critical infrastructure. |

### GDPR-adjacent controls (narrow scope, possibly applicable, confirm with client)

Two flows disclose an EU/UK visitor's IP address to a company outside the EU/UK on every page
view, both **confirmed**:

1. `index.html` lines 8-10 load Google Fonts (Inter, JetBrains Mono, Space Grotesk) from
   `fonts.googleapis.com` and `fonts.gstatic.com`, disclosing the visitor's IP to Google LLC.
2. GitHub Pages, the believed host, discloses the visitor's IP to GitHub Inc. by the nature of
   serving the page. **Believed, not yet configured** — there is no `.github/` directory yet.

Because full GDPR obligations are disproportionate here (see table above), the controls below
are proportionate, narrow, and worth doing regardless of exactly how the legal question above
is ultimately resolved.

| Control | Status | Evidence / what would close it |
| --- | --- | --- |
| Lawful basis for the Google Fonts third-party call named somewhere | Gap | Not recorded anywhere today. Closes by recording "legitimate interest in typography" in the spec for the deploy change, or by removing the need for the question entirely (next row). |
| Privacy by design / most-private default (Art. 25) for font loading | Gap | `index.html` lines 8-10 load fonts from Google's CDN by default rather than self-hosting them. Self-hosting the three font files under `src/assets/` or `public/fonts/` removes the third-party call, and with it this whole GDPR-adjacent question, at the cost of a larger initial bundle. This is a spec-time decision for the owner (open question 7 above), not one this mapper makes. |
| International transfer mechanism named for the Google Fonts and GitHub Pages flows (Ch. V) | Unknown | Would require reading Google's and GitHub's current data processing terms; not verified from this repository. |
| Cookie or tracking-consent gate before non-essential scripts load | Met | Confirmed no cookies, no `localStorage`, no analytics anywhere in `src/` or `index.html` (same grep as above, exit 1). Google Fonts as loaded here does not itself set a cookie (**believed, not verified** — no network capture was taken); IP disclosure alone is a different question from cookie consent and is covered by the two rows above, not this one. |
| Data subject rights servable for whatever the site does collect | Met, trivially | The owner's site never receives, stores, or has access to the visitor IP that Google Fonts or GitHub Pages sees — there is nothing in the owner's control to export, rectify or erase on a visitor's behalf. A rights request about that IP would have to go to Google or GitHub directly, since they are the parties that received it. |
| Subprocessor disclosure | Met, informally | Google (Google Fonts) and GitHub (Pages hosting) are the only two subprocessors, and both are named here and in `docs/sdlc/codebase-map.md` "Boundaries". No formal subprocessor list exists because there is no privacy policy page; the owner should decide whether one is warranted (see recommendation in the report below). |

### Employer confidentiality content control (business control, not a legal regime)

This is not a regulatory obligation; it is a client-specific control this mapper is asked to
translate into something the pipeline can check, because the discovery analyst already
flagged it as open questions 1 and 8 above and under "Things that must not change without the
owner saying so."

| Control | Status | Evidence / what would close it |
| --- | --- | --- |
| Employer-named metrics and claims (Apple, TCS, Neural Newsletters, edX) not altered by an agent without the owner's explicit sign-off | Gap — documented, not tool-enforced | `src/data/portfolioData.js` is not in `.workhorse/profile.yml`'s `sensitive_paths` or `protected_paths` today (lines 69-78 of that file list only `.github/workflows/**`, `index.html`, `vite.config.js`, `package.json`, `package-lock.json`). Closes by adding `src/data/portfolioData.js` to `sensitive_paths`, mirroring the existing rule for `index.html`, so any content edit prompts the owner before it lands. This is a recommendation for the human, not an edit this mapper made — it is outside the compliance block this task authorized. |
| Confidentiality of employer-derived detail confirmed by the owner before the first public deploy | Gap | Open question 1 above is unanswered: are the published metrics his to publish, and is any Apple, TCS or Neural Newsletters detail confidential. Closes when the owner answers, ideally before G0 approval or before the first push to `main`. |
| Simulator's fictional-but-realistic data labelled as illustrative | Gap | `InteractiveTriageSimulator.jsx` `PRESETS` reads as real internal Apple system data (ticket ids, OAuth scopes, region identifiers) but is invented. Closes when the owner decides on a visible "illustrative example" label (open question 2 above) and it is added to the component. |

### Not applicable, recorded so it is not silently skipped

hipaa, pci-dss, soc2, iso27001 and financial carry no controls or gaps below because nothing in
the codebase triggers any of them today: no PHI, no cardholder data, no service-provider
assurance engagement, no money movement. If the site ever adds a backend, a payment path, or
becomes a product sold to a company that needs assurance evidence, this section must be redone
from the matching skill, not extended from here.

### Controls each later phase must honour

- **Spec.** Name the lawful basis for the Google Fonts call, or specify self-hosting the fonts
  instead (owner's choice, open question 7). State explicitly whether `src/data/portfolioData.js`
  content is changing in this spec, and if so, that the owner has confirmed the change is not
  confidential employer detail. If the simulator is touched, decide whether to add the
  "illustrative example" label in the same change.
- **Build.** If self-hosting fonts, remove the `fonts.googleapis.com` / `fonts.gstatic.com`
  links from `index.html` and bundle the font files locally; do not add any new third-party
  origin to `index.html` without the same lawful-basis question being asked first. Do not edit
  metrics, dates, employer names or role titles in `src/data/portfolioData.js` beyond what the
  spec explicitly authorized.
- **Review.** Confirm `index.html`'s sensitive-path gate was honoured for any change touching
  it (grep for new `<script`, `<link href="http`, or `src="http` origins). Confirm no cookie,
  analytics, or storage call was introduced (rerun the same grep the discovery analyst and this
  mapper both used). Confirm any change to `src/data/portfolioData.js` matches what the spec
  said the owner authorized.
- **Deploy.** No server config exists to carry these controls forward automatically. Before the
  first push to `main` that goes live, confirm open questions 1, 2, 3 and 7 above have owner
  answers, since deploy is irreversible in the sense that search engines and archives copy
  whatever is published (constraint 2, "Technical constraints" above).

---
---

# Review packet: G0 client profile confirmation

Change id: `g0-onboarding`
Gate: G0
Tier: not applicable (onboarding, no code change)
Branch: `main` at `b50497f`
PR: none
Prepared: 2026-09-10 UTC

## 1. TL;DR

The repository has been audited and `.workhorse/profile.yml`, `docs/sdlc/codebase-map.md` and
this file now describe the project as it actually is: a static Vite and React portfolio with no
backend, no database and no visitor data. You are asked to confirm the profile, because every
hook and every later agent acts on it, and a wrong value either blocks real work or fails to
protect something. Three decisions below change behaviour immediately; the rest are
confirmations.

## 2. Decisions requested

| # | Decision | Recommendation | Alternative | If you choose the alternative |
|---|----------|----------------|-------------|-------------------------------|
| D1 | Autonomy level | `bounded`: agents work inside the profile's guard rails and stop at gates | `assisted` for tighter control, `full` for fewer stops | Edit `autonomy` in `.workhorse/profile.yml`; `bounded` is what the rest of this packet assumes |
| D2 | `.github/workflows/**` is **ask**, not **deny** | Keep it ask until `deploy.yml` exists | Make it `protected_paths` now | The Build phase cannot create the deploy workflow at all. `protect-paths.js` checks deny before ask, so a path in both lists is simply denied. Move it to `protected_paths` after the workflow is working |
| D3 | Production deploy policy | `prod.deploy` is `git push origin main`, `auto: false`. Agents are blocked from pushing to `main` by the built-in guard; you push | Let an agent deploy after G5 | Not recommended while the repo is public and the content is your professional record |
| D4 | Test framework | Add Vitest and React Testing Library in the first spec so later phases have a real `commands.test` | Ship with no tests | Verification stays build-only and every regression is caught by eye |
| D5 | Fix the broken toolchain before the first change | Delete `node_modules` and `package-lock.json`, remove `@rolldown/binding-win32-x64-msvc` from `dependencies`, reinstall | Leave it | Lint fails on every change for an unrelated reason, and CI is expected to fail on Linux |
| D6 | Compliance regimes | Left empty for `wh-compliance-mapper` to propose. Signals handed over: static site, no visitor data, no cookies, no analytics, audience mostly US with some EU, only personal data is your own, Google Fonts discloses visitor IPs | Declare none at all | Recorded either way; the mapper's proposal still comes back to you |
| D7 | Should `.workhorse/profile.yml` protect itself | Not added, so that retro can still update it | Add `.workhorse/profile.yml` to `protected_paths` | An agent that can edit the profile can lift its own restrictions. Adding it means you edit the profile by hand from then on |

## 3. Evidence

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| Profile parses with the WorkHorse YAML reader | `node -e "require('.../hooks/scripts/lib.js').loadProfile('C:/Users/alqai/Portfolio')"` | 0 | Full object printed; every key present, `tier_floor_paths.3` an empty list, `notes` 1090 characters | confirmed |
| Node and npm versions | `node --version`, `npm --version` | 0 | `v21.7.3`, `10.5.0` | confirmed |
| Vite present and version | `./node_modules/.bin/vite --help` | 0 | `vite/5.4.11` | confirmed |
| Lint runs | `./node_modules/.bin/oxlint --version` | 1 | `Cannot find native binding ... Cannot find module '@oxlint/binding-wasm32-wasi'` | confirmed failing |
| `npm ci` subcommand exists | `npm ci --help` | 0 | Usage text | confirmed (command not run) |
| `npm audit --audit-level` exists | `npm audit --help` | 0 | Options list includes `--audit-level` | confirmed (audit not run) |
| No network calls, storage or analytics in the app | `grep -rn "fetch(|XMLHttpRequest|axios|localStorage|sessionStorage|document.cookie|gtag|analytics|dataLayer" src index.html` | 1 (no matches) | empty | confirmed |
| No logging or error handling in the app | `grep -rn "console.|try {|catch|ErrorBoundary" src` | 1 (no matches) | empty | confirmed |
| Orphan platform-locked dependency | read `node_modules/@rolldown/binding-win32-x64-msvc/package.json`, `node_modules/vite/package.json`, `ls node_modules/rolldown` | n/a | `os: win32`, `cpu: x64`; Vite depends on rollup and esbuild; `rolldown` not installed | confirmed |
| `npm ci` fails on Linux because of that dependency | not runnable from this machine | n/a | n/a | **believed, not verified** |
| GitHub Pages configuration | not checkable from the repository | n/a | no `.github/` directory exists | **believed, not verified** |
| Build succeeds | `npm run build` | n/a | not run: discovery does not run build, install or test commands | **not verified** |

Eval summary: not applicable. No change has been specified, so there are no evals.

## 4. Review findings

No code was changed. The findings below come from reading the repository during discovery and
are recorded so they are not lost; none of them block G0 approval.

| Severity | Reviewer | File:line | Finding | Resolution |
|----------|----------|-----------|---------|------------|
| Medium | discovery | `package.json:11` | `@rolldown/binding-win32-x64-msvc` is a direct dependency restricted to Windows x64 and needed by nothing | D5, remove before the first CI run |
| Medium | discovery | `node_modules/@oxlint/` | Lint cannot execute; the project's only automated check is dead | D5, clean reinstall |
| Medium | discovery | `vite.config.js:5` | No `base`, so a Pages project-site deploy is expected to serve a page with no assets | Set during the Build phase once D4 on the domain is settled |
| Low | discovery | `.gitignore` | No `.env` pattern | Add `.env*` when any env file first appears |
| Low | discovery | `src/components/CaseStudyModal.jsx:298` | Email hard-coded instead of read from `portfolioData` | Fold into the first content change |
| Low | discovery | `generate_viewer.cjs` | Dead script pointing outside the repository | Delete |
| Info | discovery | `src/components/InteractiveTriageSimulator.jsx:1-60` | Invented data that reads as real internal Apple systems | Owner decision, question 2 above |

Spec conformance: not applicable, there is no spec yet. Drift: not applicable.
Adoption score: not applicable.

## 5. Risk register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| First CI run fails on `npm ci` because of the Windows-only dependency | High | Blocks the first deploy | D5, remove it before writing the workflow | Owner |
| Deployed site renders unstyled because `base` is unset | High | Visitors see a broken page, which is worse than no page | Set `base` and check the built `index.html` before the first push to main | Owner |
| A published claim about an employer turns out to be confidential | Low | Reputational and possibly contractual | Question 1 above, answered before the first public deploy | Owner |
| Lint stays broken and quietly reports failures forever | Medium | Verification noise that trains people to ignore red | D5 | Owner |
| A future analytics or embed addition creates a silent consent obligation | Medium | Compliance exposure the site currently does not have | `index.html` is a sensitive path, so any edit prompts | Hooks plus owner |
| `deny_commands` and `sensitive_paths` are wrong in a way nobody notices until work is blocked | Low | Friction | This packet; revise the profile at any time | Owner |

## 6. Diff tour

Four files were written. No product code was touched.

1. `.workhorse/profile.yml`. The control file. Read it first: `protected_paths`,
   `sensitive_paths`, `deny_commands`, `ask_commands` and `environments` change what agents and
   hooks may do. Verified to parse with the same reader the hooks use.
2. `docs/sdlc/constraints.md`. This file. Constraints, debt, questions and this packet.
3. `docs/sdlc/codebase-map.md`. Architecture, patterns with file paths, data inventory,
   boundaries, and one mermaid diagram.
4. `CLAUDE.md`. One page, loaded at the start of every session.

## 7. Checklist

- [ ] The profile describes your project correctly, especially commands and protected paths
- [ ] D2 is understood: workflows are ask, not deny, until the deploy workflow exists
- [ ] D3 is understood: pushing to `main` publishes the site, and you do that yourself
- [ ] The eight open questions above have answers, or are explicitly deferred
- [ ] Compliance regimes may be left to `wh-compliance-mapper` to propose

Security checklist: the standard pre-ship list is not applicable at G0 and largely not
applicable to this project. Recorded above under "Security baseline items that do not yet
apply, and one that does", with the three items that do apply left open.

## Approve

Run `/workhorse:approve G0` to approve, or `/workhorse:approve G0 --reject "notes"` to send it
back.

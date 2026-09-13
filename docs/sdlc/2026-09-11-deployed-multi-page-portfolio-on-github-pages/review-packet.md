# Review packet: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Gate: G4 (second presentation, after rejection)
Tier: 2
Branch: `wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages` at `807c5fd`
(verification ran green at `460405e`, Node v22.12.0; `git diff --name-only 460405e 807c5fd`,
conductor-confirmed, lists only `conductor-log.md`, `verification.md` and
`verify-logs/eval-runner-report.md`, all under this change's `docs/sdlc/` folder; committing
this packet adds one further docs-only commit on top of `807c5fd`)
PR: none. Origin `muhibm1/Portfolio` is private with no branches; a PR needs main on origin, and
only the owner publishes main.
Prepared: 2026-09-13

## Response to rejection

The prior G4 packet (artifact commit `0af230f`, sha256 pinned on `approvals.md` line 40) was
rejected 2026-09-13T01:46:12.951Z. Each note is quoted from `approvals.md`, followed by what
changed.

**D1.** "ratified, ADR 0009 and the --omit=dev security_audit stand, owner to confirm when he
reviews." No change made. ADR 0009 and `.workhorse/profile.yml:41` stand exactly as ratified
under delegation by the main session, not by the owner. The owner's own confirmation is still
requested below.

**D2.** "deferred to the owner; do not change repository visibility and do not push main, the
owner does both himself." No change made. Repository visibility is unchanged, nothing was
pushed, and no agent touched the publishing path.

**D3.** "redact every full and partial occurrence of the phone number in committed docs
(intent.md, spec.md, evals.md and any other file), including the approved G1 text in intent.md;
note in approvals context that the redaction changes the approved packet's bytes, not its
meaning; git history is out of scope." Fixed across four commits: `1d11c97` (spec.md amended,
R89 widened to full/last-seven/area-plus-exchange forms across every tracked file, ADR 0010 adds
the detection method), `545da85` (evals.md and intent.md redacted; the intent.md G1 packet header
carries a dated note that its bytes changed under G4-D3, not its meaning), `76bcc00`
(`scripts/check-phone-redaction.mjs` added, `docs/sdlc/constraints.md` redacted), `652750f`
(simplifier removed an unrequested branch from the script). The redaction also changed the bytes
of the approved G2 packet, `spec.md`, whose sha256 `approvals.md` line 22 pins, not its meaning.
Git history is out of scope, as instructed; commits from `b50497f` onward still carry the number,
and so, currently, does the tip of local `main` and 37 of 38 local branches (below).

**D4.** "move public/mockup-*.jpg to docs/design/ and add a build or test check that no mockup
file reaches dist/." Fixed in `38d36b4`: the four mockups moved with `git mv` to `docs/design/`;
new `src/publicDirectory.test.js` guards both directions; `docs/design-brief.md` and
`docs/sdlc/codebase-map.md` paths updated; ADR 0008 amended in `1d11c97`; new ADR 0012 records the
design decision.

**D5.** "fix Back to Top in src/components/ContactFooter.jsx so it works on every route. Then
re-verify on Node v22.12.0 and present G4 again." Fixed in `c518b71`: Back to Top is now a
`<button type="button">` calling `window.scrollTo({ top: 0 })`, `'auto'` under reduced motion,
with 6 new tests covering 5 routes plus the reduced-motion branch; reasoning in ADR 0011.
Re-verification ran on Node v22.12.0 and is green (below).

## 1. TL;DR

This is the fix-wave resubmission of the same change: a multi-page portfolio deploying to GitHub
Pages, resubmitted after the owner (via delegation) rejected G4 for four fixable items and one
confirmation. Verification is green at `460405e` (174 tests, lint, build, scoped `security_audit`
all exit 0). 0 critical and 0 high findings are open; 3 mediums are open (D1, owner confirmation;
two detection gaps this fix wave introduced in the redaction script). You are asked to ratify D1,
decide D2 on the concrete terms below (publish only `main`, never `git push --all`, since local
main's current files and 37 of 38 local branches still carry the owner's phone number), and rule
on D3/D4, where this packet's own recommendation is to fix both in one short loop before
re-presenting G4, because a live document (`hosted-config.md`) currently states redaction facts
that are false at HEAD. No PR exists yet; publishing `main` is the owner's own act.

## 2. Decisions requested

| # | Decision | Recommendation | Alternative | If you choose the alternative |
|---|----------|----------------|-------------|-------------------------------|
| D1 | Your own confirmation of ADR 0009 and the `--omit=dev` `security_audit` scope, still ratified only by delegation (main session, under "Approve every command yourself, I'm busy"), not read by you | Review ADR 0009 and confirm explicitly; no code change needed | Decline the delegated ratification | Revert `profile.yml:41` to the unscoped command; Verify returns red on the same 5 GHSA ids (`GHSA-4w7w-66w2-5vf9`, `GHSA-67mh-4wv8-2f99`, `GHSA-82fw-gwwq-j7x9`, `GHSA-fx2h-pf6j-xcff`, `GHSA-v6wh-96g9-6wx3`) until each is fixed upstream, all semver-major |
| D2 | Publishing path, conductor-confirmed: local `main`'s current files (`spec.md`, `evals.md`, `intent.md` of this change, `docs/sdlc/constraints.md`, `src/data/portfolioData.js`) still carry the owner's phone number, and 37 of 38 local branches carry it at their tip; only this change branch is clean (0 files at HEAD) | Publish only `main` to the private origin. Keep the repository private until this change merges, so that main's tip no longer carries the number. Accept that history still carries it, as `hosted-config.md` item 7 already records. Only then decide public visibility. Never `git push --all` and never push a task branch | Push the change branch alone, or push the change branch straight to `main` | Pushing the change branch alone makes it GitHub's default branch and activates its `dependabot.yml`; the conductor will not do this. Pushing the change branch to `main` triggers the deploy workflow, a production release without G4 or G5 |
| D3 | Redaction-control gaps found in this round's fixes: 2 new mediums (`scripts/check-phone-redaction.mjs:141` misses the number with a country code written directly in front; `:205-206` silently skips any file with a NUL byte, so a UTF-16LE text file is invisible to the scan) | Reject G4 with these notes; fix both mediums in one short loop, then re-present G4. The current tree is independently confirmed clean today by two independently built scans, so this protects against a future regression, not today's exposure | Approve with conditions, record as a tracked follow-up | Ships now with two known detection gaps left open; no live exposure today, but the gaps persist into the next change that touches these docs |
| D4 | Doc accuracy: `hosted-config.md:116-119` states that the full number remains and that redaction is an open owner decision, both false at HEAD; `docs/sdlc/constraints.md` item 3's lead sentence still says the number renders in `ContactFooter`/`ResumeModal`; `profile.yml:144,148` still names the phone in `retention_notes`; `codebase-map.md:180` still lists it; `spec.md`/`intent.md` still cite `public/mockup-*.jpg`; `spec.md` still says "90 requirements" (actual 92); `intent.md:205` cites the wrong gate for the redaction reason | Reject G4 with these notes; fix these doc-only edits in the same short loop as D3. `hosted-config.md` stating false redaction facts breaches the owner's own standing rule, in his global CLAUDE.md, against writing an unchecked factual claim into a report | Approve with conditions, record as a tracked follow-up | Docs stay factually wrong about redaction completeness and requirement counts until a follow-up lands, in a report the owner's own rule says should not carry an unchecked claim |
| D5 | The unchanged backlog: adoption score 3/5 (not re-reviewed this round, carried from artifact `7ed0918`), 6 carried bug lows, 9 carried conformance lows, and 6 carried security lows, none touched by this fix wave or its findings | Accept as tracked backlog; none is release-blocking at tier 2, and none was raised or reopened by the fix-wave reviewers | Hold G4 until adoption is re-reviewed and raised to 4/5 | Another review loop, with no functional or security benefit, since nothing in the backlog changed this round |

## 3. Evidence

Green at commit `460405e`, Node v22.12.0, confirmed (`verification.md`):

| Check | Command | Exit code | Output | Status |
|---|---|---|---|---|
| install | `npm ci` | 0 | `verification.md`; `verify-logs/install.log` (gitignored, local only) | confirmed |
| lint | `npm run lint` | 0 | `verification.md`; `verify-logs/lint.log` (gitignored, local only) | confirmed |
| test | `npm test` (Vitest) | 0; 22 files, 174 passed | `verification.md`; `verify-logs/test.log` (gitignored, local only) | confirmed |
| build | `npm run build` | 0 | `verification.md`; `verify-logs/build.log` (gitignored, local only) | confirmed |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | `verification.md`; `verify-logs/security_audit.log` (gitignored, local only) | confirmed |
| full-tree audit (informational, R57) | `npm audit --audit-level=high` | 1 | `verification.md` | confirmed: exactly the 5 GHSA ids ADR 0009 accepts, none new |

`verify-logs/*.log` files are gitignored (`.gitignore:3`, `*.log`, confirmed with
`git check-ignore -v`), so this run's raw log output exists only on the machine that ran Verify.
The tracked evidence for this run is `verification.md` and `verify-logs/eval-runner-report.md`,
both committed in `661763c`, confirmed with `git log -- <path>`. The tracked `verify-logs/*.exit`
files and `verify-logs/eval-runner-results.md` are not part of the fix-wave diff
`d74f23f..807c5fd`; they were not refreshed this round and still describe the earlier verify at
`8ea98a7`.

New cases pass, confirmed:

| Case | Result |
|---|---|
| GC89 | self-test 9/9 renderings, 0/6 near-misses; scan 0 hits |
| GC41 | dist scan 0 hits |
| GC91 | 13 footer tests; `href="#overview"` count 0 |
| GC92 | 4 tests; dist mockup count 0 |
| GC93 (renamed R49 case), EG23, AD17 | pass |

Eval summary: golden 83/83 scoreable, edge 22/23 (`EG19` manual, pre-existing gap, not new),
failure 15/15 scoreable, adversarial 15/17 automated plus AD10's structural half (`AD13`
documented, not pass/fail). All targets are 100% for cases that can run pre-deploy.

`807c5fd` (this branch's HEAD) differs from `460405e` only in `docs/sdlc/**` (verification and
conductor-log commits, conductor-confirmed via `git diff --name-only`). The conductor ran its own
masked scan at every step, deriving the reference number from `b50497f`: 0 hits in tracked files
at HEAD. Two eval-runner dispatches this session hit turn limits before finishing; a third,
working directly in the checked-out branch, completed and is the one `verification.md` relies on.

Not verified pre-deploy: everything CI-only (Linux install, four smoke-check halves, branch
protection state, response headers) and everything manual by design (`R19`, `R22` visual half,
`R77`/`R86` dependency evidence tables, `R79` visual half, `R84` browser check). Full list in
`verification.md` "Not verified".

## 4. Findings

Merged from all reviewers on the fix-wave diff `d74f23f..807c5fd`. Adoption was **not re-run**
this round; the rejection notes did not touch it, so its score and findings are carried from
artifact `7ed0918` unchanged, marked below. Sorted by severity; every finding from every reviewer
appears.

| Severity | Reviewer | File:line | Finding | Resolution |
|---|---|---|---|---|
| Medium | Security | `.workhorse/profile.yml:41`, ADR 0009 | `--omit=dev` scope ratified by the main session under delegation, not the owner | Open: D1, owner confirmation requested |
| Medium | Security (D3, prior round) | `spec.md`, `evals.md`, `intent.md` | Full/partial phone number in committed docs | Fixed in `1d11c97`, `545da85`, `76bcc00`; 0 hits confirmed at HEAD |
| Medium | Security (D4, prior round) | `public/mockup-*.jpg` | Mockups would publish at stable URLs | Fixed in `38d36b4` for the site (0 mockups in `dist/`); files remain tracked at `docs/design/`, see Low below |
| Medium | Bug (D5, prior round) | `src/components/ContactFooter.jsx:94` | Back to Top no-op on non-home routes | Fixed in `c518b71`, tested at 5 routes against the real route table |
| Medium | Bug | `scripts/check-phone-redaction.mjs:141` | The number with a country code written directly in front is caught in no form; exit 0, confirmed in a scratch clone; the self-test enshrines this as a near-miss; `portfolioData.test.js:50` and `deploy.yml:302`'s generic patterns also miss it | Open: D3, recommend fix before re-presenting G4 |
| Medium | Bug | `scripts/check-phone-redaction.mjs:205-206` | Any file with a NUL byte is treated as binary and skipped; a UTF-16LE file (Windows PowerShell 5.1's `>` redirect writes this) leaves only an uninformative count. 5 images skipped today, result complete at HEAD | Open: D3, recommend fix before re-presenting G4 |
| Low | Bug | `HomePage.jsx:39-49`, `SiteLayout.jsx:13` | Navbar highlights the wrong section after returning home at scroll 0 | Open, carried |
| Low | Bug | `SiteLayout.jsx:36-40` | Browser Back drops the visitor at top instead of restoring scroll | Open, carried; spec question for owner |
| Low | Bug | `CaseStudyPage.jsx:28` | Selected tab carries over to the next case study | Open, carried |
| Low | Bug | `vite.config.js:13-24` | `font-src 'self'` blocks 8 of 64 built `@font-face` blocks (Cyrillic/Vietnamese glyphs); not visible today | Open, carried |
| Low | Bug | `vite.config.js:75-77` | `404.html` copy in `closeBundle` masks the real error on a failed build | Open, carried |
| Low | Bug | `App.jsx:17` | `/Portfolio/index.html` renders "Page not found" | Open, carried; owner decision |
| Low | Bug | `scripts/check-phone-redaction.mjs:200-202` | A tracked file missing from the working tree is skipped silently | Open |
| Low | Bug | `scripts/check-phone-redaction.mjs:102` | Zero-files guard is global; an existing but empty directory argument exits 0 | Open |
| Low | Bug | `scripts/check-phone-redaction.mjs:34` | En dash, no-break space, tab, underscore and HTML-entity separators escape all three forms | Open |
| Low | Bug | `src/publicDirectory.test.js:22,42` | Name check is case-sensitive; `Mockup-Home.jpg` or a renamed file passes | Open |
| Low | Conformance | `ProjectEntry.jsx:5` | `PRIVATE_REPOSITORY_NOTE` uses a middle dot, not `~` as R19 requires | Open, carried |
| Low | Conformance | `spec.md` R43, `WorkIndexPage.jsx` | R43 text not amended for `repoPublic`; 0 GitHub links render today | Open, carried, doc drift |
| Low | Conformance | `src/App.jsx`, ADR 0001 | 5 `<Route` elements vs R3's acceptance text "equals 4"; ADR 0001 still says four | Open, carried, doc drift |
| Low | Conformance | `spec.md` header | Says "R80-R89" (ten) vs eleven elsewhere | Open, carried, doc drift |
| Low | Conformance | `spec.md` Tailwind row | Cites `verification.md` line 17 wrongly; now further stale | Open, carried, doc drift |
| Low | Conformance | `plan.md:220` | Shows the pre-`26b5c0e` audit command | Open, carried, doc drift |
| Low | Conformance | ADR 0009 header | Date disagrees with the conductor log timestamp | Open, carried, doc drift |
| Low | Conformance | `NotFoundPage.jsx`, `CaseStudyPage.jsx` (Previous/Next) | New UI strings inline rather than in `portfolioData.js` | Open, carried |
| Low | Conformance | `CaseStudyModal.jsx:217` (pre-rename) | "Metrics audited and verified..." removed as a side effect of the R22 heading change, not individually named | Removed (pre-existing); still open as undirected scope creep, not individually authorized |
| Low | Conformance | `spec.md` (7 lines), `intent.md` (4 lines) | Still cite `public/mockup-*.jpg`; `evals.md`'s GC22v/GC27v/GC30v were repointed to `docs/design`, so spec and evals now disagree on location | Open, doc drift; manual checks only |
| Low | Conformance | `spec.md:67,1846` | Still say "90 requirements"; actual is 92 | Open, doc drift |
| Low | Conformance | `intent.md:205` | Cites G1-D1, not G4-D3, as the redaction reason | Open, doc drift |
| Low | Conformance | `docs/sdlc/constraints.md` item 3 | Lead sentence stale, still says the number renders in `ContactFooter`/`ResumeModal` | Open, doc drift |
| Low | Conformance | `package.json` (`tailwindcss`, `@tailwindcss/vite`) | Outside R49/R85's nine-package allowlist, pinned exact | Accepted: documented gap (B3, ADR 0009) |
| Low | Security | `spec.md:1644-1645` | Constraint-audit says two mediums still open; both resolved in code and evals this round | Open: doc bookkeeping, recommend recording closed |
| Low | Security | `scripts/check-phone-redaction.mjs` | Misses `tel:+1`, a bare leading 1, `tel:%2B1`, en dash, no-break space, underscore, entity-hyphen, spaced-digit separators (independent loose-derivation scan); catches `+1 (`, `1-`, `+1.`, slash and four-separator forms | Open, D3; remediation: optional `(?:\+?1[ .()-]{0,3})?`, wider separators, country-code self-test renderings, assert zero `tel:` in dist |
| Low | Security | CI (`deploy.yml`) | Cannot run the redaction script: shallow clone (no `fetch-depth`); script not wired into `package.json`, `deploy.yml`, or a pre-push hook. If history is ever rewritten, the `b50497f` reference disappears and ADR 0010 does not say so | Open |
| Low | Security | 5 tracked binary/UTF-16 files | Skipped by the scan; a number drawn in an image is invisible. Owner should eyeball the 4 mockups and `src/assets/hero.png` | Open |
| Low | Security | `constraints.md:106`, `:102-105`, `hosted-config.md:116-119`, `profile.yml:144,148`, `codebase-map.md:180` | Stale or overstated docs about redaction and remaining content; `hosted-config.md` item 7 correctly records the history exposure as accepted | Open, D4 |
| Low | Security | local `main` (5 files) and 37 of 38 local branches | Current files still carry the phone number; publishing local main as-is, or `git push --all`, puts it on GitHub in current files, not only history. Counts conductor-confirmed: 5 files on `main`, 37 of 38 local branches at tip, only the change branch clean | Open: D2, owner decision on how to publish |
| Low | Security | `src/publicDirectory.test.js` guard | Compares names only, case-sensitively; a renamed or case-changed file passes | Open; remediation: case-insensitive match plus sha256 comparison against `docs/design` |
| Low | Security | `docs/design/mockup-*.jpg`, history at `public/` | Still tracked, become publicly fetchable once the repository is public; all four carry C2PA "Created by Google Generative AI" provenance; ADR 0012 rejects deletion | Open: D2, owner decision |
| Low | Security | `public/icons.svg` | Unused create-vite template sprite, still publishes; predates this change | Open, carried, pre-existing |
| Low | Security | `.github/workflows/deploy.yml:11-13`, `dependabot.yml` | Dependabot PRs get no CI before merge | Open, carried |
| Low | Security | `package.json:18-20,22` | 4 runtime dependencies keep caret ranges, pre-existing | Open, carried |
| Low | Security | `deploy.yml:104` | Test-count floor 12 against 174 actual tests | Open, carried |
| Low | Security | `public/.well-known/security.txt:4` | `Expires` set to exactly one year; RFC 9116 recommends less | Open, carried, trivial |
| Low | Security | `src/data/portfolioData.js:181` | "wasl" tagline plausibly makes religious affiliation inferable; `profile.yml:139-143` still asserts nothing is inferable | Open, carried; record the owner's conscious decision |
| Low | Security | git metadata, `approvals.md` | All commits use `@instructors.2u.com`; going public publishes it plus the approver email | Open, carried; D2 |
| Low | Adoption (carried, not re-reviewed) | `README.md` | Still the create-vite template | Open |
| Low | Adoption (carried) | repo `CLAUDE.md` | States lint fails and there are no tests; false on Node 22.12.0 | Open, stale |
| Low | Adoption (carried) | `package.json`, `.nvmrc` (absent) | No Node version pin | Open |
| Low | Adoption (carried) | `.github/workflows/deploy.yml` | Step-name style inconsistency, uncommented env var use, unlabelled trade-offs | Open, readability |
| Low | Adoption (carried) | `FdePhilosophy.jsx` | Icons bound by array index, untested binding | Open |
| Low | Adoption (carried) | `text-[#1d1d1d]` usages, `--ink: #181818` | Hard-coded hex diverges from the CSS token | Open |
| Low | Adoption (carried) | `.gitignore:31` | Blanket `.claude/` would drop a committed config if ever added | Open, low priority |
| Low | Adoption (carried) | `spec.md` (1827 lines) | De facto runbook; consider extracting a dedicated document | Open, nice-to-have |

Conformance summary: 92 requirements, 84 automated and passing, 5 manual by design, about 14
CI-only awaiting the first deploy, 2 pending owner evidence review (R77/R86 tables), 0 missing,
0 untested. All 22 fix-wave files trace to F1-F3 or a doc task; `652750f` conforms to ADR 0010.

Adoption score: 3/5, carried from `7ed0918`, not re-reviewed this round. Compiler note, believed
not verified: the new `scripts/` folder and script are not wired into any `package.json` script,
which may bear on the adoption score at the next review.

Security checklist: 2 pass (secrets/env vars; third-party version pins), 0 fail, 9 n/a (no
database, policies, storage bucket, user input, or admin surface).

## 5. Risk register

From `plan.md` "Risks", updated with what this round's reviewers raised.

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| No PR exists; main has no branches on origin | Certain until the owner acts | G4 cannot proceed to a PR or merge | Owner publishes only local `main` to origin (never `git push --all`, never a task branch); conductor then pushes this branch and opens the PR | Site owner |
| Repository stays private past the first push | High until D2 | First Pages deploy fails; branch protection stays unavailable | D2 decided at this gate: publish `main` first, keep private until this change merges, then decide visibility | Site owner |
| ADR 0009 / profile change not ratified by the owner | Open until D1 | If declined, `security_audit` reverts and Verify goes red | D1 decided at this gate | Site owner |
| Redaction script misses a country-code-prefixed number or a UTF-16LE file | Medium, new this round | A future document edit could reintroduce the number undetected | D3 recommends fix-now in one short loop; current tree independently confirmed clean by two separate scans today | Site owner, then this change's fix loop |
| Local `main` (5 files) and 37 of 38 local branches carry the number in current files | Medium, new this round | Publishing local main as-is, or `git push --all`, puts it on GitHub in current files | D2 decides the publishing method; never `git push --all` | Site owner |
| Redaction script cannot run in CI (shallow clone) | Low | A regression is caught only when a human runs the script locally | Add `fetch-depth: 0` in a future change (ask-first path, ADR 0010) | Next change |
| Mockups remain tracked at `docs/design/`, become fetchable once public | Low to Medium | AI-generated (C2PA-tagged) design reference becomes publicly visible | D2 accepts as a known consequence; ADR 0012 rejects deletion | Site owner |
| Docs (`hosted-config.md`, `constraints.md`, `profile.yml`, `codebase-map.md`) state redaction facts that are false at HEAD | Medium, new this round | A reader trusts a false claim about what was removed, in breach of the owner's own no-unchecked-claims rule | D4 recommends fix-now in the same short loop as D3 | Site owner, then this change's fix loop |
| Adoption gaps (README, CLAUDE.md, no Node pin, deploy.yml readability) | Certain until fixed | Onboarding and maintenance friction; no functional or security impact | Tracked for a follow-up change, unchanged this round | Site owner |
| Back to Top broken on non-home routes | Closed | Would have been a visible navigation defect | Fixed in `c518b71`, tested at 5 routes | Resolved |
| Mockups reaching `dist/` | Closed | Would have published Apple-branded, factually inconsistent images | Fixed in `38d36b4`, guarded by `src/publicDirectory.test.js` | Resolved |
| Phone number in committed spec/evals/intent text | Closed | Would have been reconstructable from committed files once public | Fixed in `1d11c97`, `545da85`, `76bcc00`; 0 hits confirmed | Resolved |

## 6. Diff tour

22 files changed, 1181 insertions, 203 deletions (`git diff --shortstat d74f23f 807c5fd`,
conductor-confirmed). No protected or sensitive path from `.workhorse/profile.yml` is touched by
this fix wave, confirmed by grepping `git diff --name-only d74f23f 807c5fd` against the profile's
protected and sensitive path lists: none match. `spec.md`, `evals.md`, `intent.md` and the `adr/`
folder are linked below as relative paths because they live beside this packet in the change
folder; `docs/sdlc/constraints.md` and `docs/sdlc/codebase-map.md` are linked from the repo root
because they live outside the change folder. Ordered business logic first, then tests, then docs
and config.

1. **`src/components/ContactFooter.jsx`** (`c518b71`, F1, +11/-1). Back to Top becomes a
   `<button type="button">` calling `window.scrollTo`, reduced-motion aware. The only functional
   fix in this wave that changes site behaviour visitors see.
2. **`scripts/check-phone-redaction.mjs`** (new, +211/-0, `76bcc00` then `652750f`). Derives the
   reference number from `b50497f` at run time and scans the tree for three forms; no digit is
   ever printed. Security-relevant tooling, first because the two new medium findings live here.
3. **`docs/design/mockup-{home,casestudy,maroon,mmlogo}.jpg`** (`git mv` from `public/`, `38d36b4`,
   binary, no diff, 100% rename). Moved off the served path; still tracked, still publicly
   fetchable once the repository is public (Low, security).
4. **`src/publicDirectory.test.js`** (new, +69/-0, `38d36b4`). Guards both directions: no
   mockup under `public/`, no `mockup-` string under `src/` or `index.html`.
5. **`src/components/ContactFooter.test.jsx`** (+63/-0, `c518b71`). 6 new tests: 5 routes plus the
   reduced-motion branch.
6. **`src/data/portfolioData.test.js`** (+1/-1, comment only, `76bcc00`). Notes that GC41 and GC89
   now run the redaction script instead of a literal grep; no assertion changed.
7. **`spec.md`** (+187/-24, `1d11c97`). New "G4 rejection response" section, R89 widened, R91 and
   R92 added. Largest single doc change; carries the new and remaining doc-drift findings.
8. **`evals.md`** (+207/-59, `545da85`). GC41/GC89/NF8 repointed to the script; GC91, GC92, EG23,
   AD17 added; GC22v/27v/30v repointed to `docs/design`.
9. **`intent.md`** (+7/-3, `545da85`). Redacted; dated note that G1's approved bytes changed, not
   their meaning.
10. **`docs/sdlc/constraints.md`** (+2/-2, `76bcc00`). Item 3 redacted; lead sentence and the
    "fully removed" line remain stale (Low, security and conformance).
11. **`adr/0010-...md`** (new, +53, `1d11c97`), **`adr/0011-...md`** (new, +45, `1d11c97`),
    **`adr/0012-...md`** (new, +43, `1d11c97`). Record the detection-by-derivation, Back to Top,
    and mockup-guard decisions.
12. **`adr/0008-...md`** (+5/-1, `1d11c97`). Path reference repointed to `docs/design`.
13. **`docs/design-brief.md`** (+5/-5), **`docs/sdlc/codebase-map.md`** (+5/-4) (`38d36b4`).
    Mockup path references updated; `codebase-map.md:180` still lists the phone (Low, security).
14. **`verification.md`** (+112/-103, committed in `661763c`), **`verify-logs/eval-runner-report.md`**
    (new, +142, also committed in `661763c`, confirmed with `git log`), **`conductor-log.md`**
    (+13, committed across `460405e` and `807c5fd`). Re-verification record for this gate; no
    source change.

## 7. Checklist

- [ ] No PR exists yet. Publish only `main` to the private origin, never `git push --all` and
      never a task branch: local main's current files and 37 of 38 local branches carry the
      owner's phone number, only this change branch is clean at HEAD. Then the conductor pushes
      this branch and opens the PR against main
- [ ] Intent still matches what the owner asked for
- [ ] Every requirement has a test (84 of 92 automated; 8 manual/CI-only by design, tracked above)
- [ ] No finding above medium remains unresolved (true: highest open severity is medium; 0
      critical, 0 high; 3 mediums open, D1 owner confirmation and two detection gaps in
      `scripts/check-phone-redaction.mjs`; the script has two detection gaps, the current tree has
      0 occurrences by two independent scans)
- [ ] Rollback is documented (`plan.md` "Rollback"; the owner's `git revert` on `main` after G5)
- [ ] Client engineer could maintain this from the docs alone (adoption score 3/5, unchanged and
      not re-reviewed this round, says not yet)

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
      `public/` is world-readable by design; the mockup finding above is its analogue.
- [ ] New table holding user free text: length constraint, and a rate limit if insertable in a
      loop. **N/A: no user input anywhere.**
- [ ] New admin capability writes to an append-only log. **N/A: no admin surface.**
- [ ] New secret or env var covered by `.gitignore` as a pattern; confirmed with `git ls-files`.
      **Pass.** No secret or env var added this round.
- [ ] New third-party import in a runtime path pinned to an exact version. **Pass.** No new
      runtime dependency this round; `scripts/check-phone-redaction.mjs` uses Node built-ins and
      the `git` binary only.

Checklist result: 2 pass, 0 fail, 9 n/a.

## 8. Recommendation

Recommend reject: `hosted-config.md:116-119` states that redaction is still an open owner decision
and that the number remains in three docs, both false at HEAD, which breaches the owner's own
standing rule against writing an unchecked factual claim into a report, so fix that plus the two
redaction-script mediums (D3, D4) in one short loop and re-present G4. 0 critical and 0 high
findings are open; 3 mediums are open (D1, owner confirmation; the two script detection gaps
named in D3). D1 and D5 do not block a future approve: D1 is a ratify-in-place item and D5 is
unchanged backlog the reviewers accept as tracked.

```
/workhorse:approve G4
/workhorse:approve G4 --reject "notes"
```

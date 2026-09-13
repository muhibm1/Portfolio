# Review packet: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Gate: G4 (third presentation, after two rejections)
Tier: 2
Branch: `wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages` at `a774a99` (plus an
uncommitted `conductor-log.md`; the conductor commits it after this packet). Verification ran
green at `b91d04f`; `a774a99` only adds the verification commit on top.
PR: none. `git ls-remote --heads origin` returns no branches (confirmed this session): origin
`muhibm1/Portfolio` is private with nothing pushed. A PR needs `main` on origin, and only the
owner publishes `main`.
Prepared: 2026-09-13

## Response to rejection

The second G4 rejection (`approvals.md` line 51, 2026-09-13T03:30:20.632Z, artifact commit
`23a43be`, decided by the main session under delegation, owner has not read the packet):

> Short fix pass per the packet's own recommendation: (1) `scripts/check-phone-redaction.mjs` must
> also catch the number written with a `+1` or `1` country-code prefix directly in front, and must
> read UTF-16 files (or fail loudly on files it cannot decode) instead of skipping them silently;
> add a test for each. (2) Correct `docs/hosted-config.md` lines 116-119 and every other stale doc
> the packet lists so no document claims the number remains in docs or that its removal is an open
> decision. D1 stays ratified on the owner's behalf pending his own confirmation; D2 (visibility,
> pushing main) stays with the owner; D5 backlog stays tracked. Re-verify on Node v22.12.0, re-run
> the security and conformance reviews, update `review-packet.md`, and present G4 again.

**(1) Script, fixed in `1731db5` (F4).** `buildMatchers` adds a country-code group,
`(?:\+?1[ .()-]{0,3})?`, on the full-number and area-code-plus-exchange forms. `decodeFile` decodes
UTF-16LE and UTF-16BE with a BOM, and UTF-16LE without one; it skips only the four known binary
extensions (`.jpg`, `.png`, `.woff`, `.woff2`); anything else it cannot decode exits 2, naming the
file. The script exports its functions and runs `main` only when started directly. New
`src/checkPhoneRedaction.test.js`, 17 tests, runs in CI through `npm test` (GC94). Spec contract
change: `spec.md` "Second G4 rejection (2026-09-13)" (`4373e35`), ADR 0010 amended, `evals.md`
GC89/GC41 rewritten plus new GC94, FL24, AD18 (`a0221e1`). Mutation check by the builder: the
mutation run failed exactly 4 of the 17 unit tests in `src/checkPhoneRedaction.test.js` (the
no-separator country-code renderings); the self-test was not part of that run.

**(2) Docs, fixed in `34a0a8c` (F5).** `hosted-config.md` section 7 bullet 2 now says redaction is
complete and no decision is open, dated 2026-09-13; confirmed true by the security reviewer.
`constraints.md` item 3, operational-loop step 4, and open question 3 corrected. `.workhorse/profile.yml`
`retention_notes` corrected. `codebase-map.md`'s personal-data row corrected. Plus, in `4373e35`:
`intent.md` lines 16, 49, 54, 283 repoint mockup paths to `docs/design` and line 205 now cites
G4-D3; the requirement count in `spec.md` (header, Summary and Requirements preamble) was
corrected from 90 to 92 (the G2 packet's risk-register row carries a dated bytes-not-meaning
note); mockup citations repointed; the constraint-audit rows for the two resolved mediums closed.
Remaining hits of the old phrases are dated quotes or the byte-preserved G2 packet line, per the
conformance reviewer.

**D1, D2, D5: unchanged.** D1 stays ratified on the owner's behalf, pending his own confirmation.
D2 stays with the owner: no push, no visibility change made. D5 backlog stays tracked, unchanged.

## 1. TL;DR

This is the second fix-wave resubmission of the same change: a multi-page portfolio deploying to
GitHub Pages. Both items from the second rejection are fixed and independently confirmed:
`scripts/check-phone-redaction.mjs` now catches country-code prefixes and reads UTF-16, and every
stale doc the rejection named now states the truth at HEAD. Verification is green (191 tests,
lint, build, scoped audit all exit 0); 0 critical and 0 high findings are open; 3 mediums are open
(D1, owner confirmation; two new detection gaps the bug and security reviewers found in this
round's own fix); the tree itself is confirmed clean today by two independent scans. Adoption is
carried at 3/5, not re-reviewed. You are asked to ratify D1, decide D2 on the terms below, and rule
on whether the two new script gaps must be fixed before this ships or can ship as a tracked
follow-up.

## 2. Decisions requested

| # | Decision | Recommendation | Alternative | If you choose the alternative |
|---|---|---|---|---|
| D1 | Your own confirmation of ADR 0009 and the `--omit=dev` `security_audit` scope, still ratified only by delegation, not read by you | Review ADR 0009 and confirm explicitly; no code change needed | Decline | Revert `profile.yml:41` to the unscoped command; Verify goes red on the same 5 GHSA ids until fixed upstream |
| D2 | Publishing path. Local `main`'s current files (5) and 37 of 42 local branches still carry the owner's phone number; only this change branch and its 4 task/worktree branches (`-tF4`, `-tF5`, two `worktree-agent-*`) are clean; 0 remote-tracking refs exist | Publish only local `main` to the private origin now (its current files carry the number in 5 files, which stays private while the repository is private); the conductor then pushes this change branch and opens the PR; keep the repository private until this change merges, so main's tip no longer carries the number; only then decide public visibility; accept that history still carries it, as `docs/hosted-config.md` section 7 records; never `git push --all`, never push a task branch | Push this branch alone, or push it straight to `main` | A lone task-branch push makes it GitHub's default branch and activates `dependabot.yml`; pushing it to `main` deploys without G4 or G5 |
| D3 | Two new mediums this round: (a) a file whose UTF-8 part is followed by a longer UTF-16LE-no-BOM part (a PowerShell 5.1 `>>` append) is decoded wholly as UTF-16, the UTF-8 hit is missed, exit 0; (b) started through a directory junction or symlink, `main` never runs, no output, exit 0 | Approve with this as a tracked follow-up: fix both before the next change that touches these docs. The tree is independently confirmed clean today by two separately built scans (working tree and an independent loose byte-level scan), so neither is a live exposure now | Reject a third time and fix both in one more short loop before re-presenting | Ships one gate later; no functional or security benefit today, since both gaps are silent-exit-0 paths in a check, not a live hit |
| D4 | Unchanged backlog: adoption 3/5 (not re-reviewed), 11 bug lows (2 new), 9 carried conformance lows, 15 security lows (9 carried, plus this round's own), the Google Fonts staleness in `profile.yml`/`CLAUDE.md` (outside this pass's scope) | Accept as tracked; none is release-blocking at tier 2 and none was raised as a regression | Hold G4 until adoption is re-reviewed and raised to 4/5 | Another review loop with no functional or security benefit, since nothing in the backlog changed this round |

## 3. Evidence

Green at `b91d04f`, Node v22.12.0, confirmed (`verification.md`):

| Check | Command | Exit code | Output | Status |
|---|---|---|---|---|
| install | `npm ci` | carried | `verification.md`: `package.json`/`package-lock.json` unchanged since `460405e` (`git diff --stat`) | confirmed |
| lint | `npm run lint` | 0 | `verify-logs/lint.log` (gitignored, local only) | confirmed |
| test | `npm test` (Vitest) | 0; 23 files, 191 passed | `verify-logs/test.log` | confirmed |
| build | `npm run build` | 0 | `verify-logs/build.log` | confirmed |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | `verify-logs/security_audit.log` | confirmed |
| full-tree audit (informational, R57) | `npm audit --audit-level=high` | 1 | `verify-logs/security_audit_full_tree.log`/`.json` | confirmed: exactly the 5 ADR 0009 GHSA ids (`GHSA-4w7w-66w2-5vf9`, `GHSA-67mh-4wv8-2f99`, `GHSA-82fw-gwwq-j7x9`, `GHSA-fx2h-pf6j-xcff`, `GHSA-v6wh-96g9-6wx3`), none new |
| redaction self-test | `node scripts/check-phone-redaction.mjs --self-test` | 0 | "17 of 17 form renderings hit, 0 of 9 near-misses hit" | confirmed |
| redaction scan (tracked tree) | `node scripts/check-phone-redaction.mjs` | 0 | "Scanned 101 files (5 skipped as binary, 0 missing from disk, 0 undecodable), 0 hits" | confirmed |
| redaction scan (`dist/`) | `node scripts/check-phone-redaction.mjs dist` | 0 | "Scanned 108 files (121 skipped as binary, 0 missing from disk, 0 undecodable), 0 hits" (121 = 5 + 116 dist fonts, independently counted) | confirmed |

Eval summary: golden 84/84 automatable, edge 22/22 automatable (EG19 manual by design), failure
16/16 scoreable (FL24 new, pass), adversarial 15/15 automated plus AD10's structural half (AD13,
AD18 documented, not pass/fail). All targets met for cases that can run pre-deploy.

Not verified pre-deploy: everything CI-only and manual by design, listed in full in
[verification.md](./verification.md) "Not verified" (AD18, EG19, AD10's live half, AD13,
FL1/FL16/FL22, FL7's CI/browser halves, FL8/FL15/FL20/FL23).

Conductor observations, carried here rather than treated as findings: `verify-logs/eval-runner-report.md`
has 12 em-dashes, 5 already present in the committed version (style, Low, unreviewed); `evals.md`
section 9 states 99 golden cases while the ID-level enumeration counts 94, a discrepancy that
predates this wave (98 vs 93 at `460405e`) and changes no exit code (doc, Low, unreviewed); an
untracked, not-gitignored local file `verify-logs/security_audit_full_tree.json` (5,040 bytes)
holds nothing sensitive per the security reviewer, who recommends deleting it or renaming it to
`.log`.

## 4. Findings

Merged from every reviewer. Sorted by severity; nothing softened, merged or dropped.

| Severity | Reviewer | File:line | Finding | Resolution |
|---|---|---|---|---|
| Medium | Security | `.workhorse/profile.yml:41`, ADR 0009 | `--omit=dev` scope ratified by delegation, not the owner | Open: D1, owner confirmation requested |
| Medium | Bug | `scripts/check-phone-redaction.mjs:254`, rule `:274-284`, and `:251` | A file with an even-length UTF-8 part followed by a longer UTF-16LE-no-BOM part (PowerShell 5.1 `>>` append) decodes wholly as UTF-16; the UTF-8 hit is missed, exit 0. A BOM plus UTF-16-header-plus-appended-UTF-8 variant also exits 0. The code follows the spec's own decoding rules, so the gap is in the contract too; no eval covers it | Open: D3 |
| Medium | Bug | `scripts/check-phone-redaction.mjs:177-178` | Started through a directory junction or symlink, `process.argv[1]` differs from `import.meta.url`'s real path, `main` never runs, no output, exit 0 (confirmed on Windows, believed on Linux). Regression versus before `1731db5`, when `main` ran unconditionally. Automation reading only the exit code would record a pass; no eval covers it | Open: D3 |
| Medium | Bug (prior round, resolved) | `scripts/check-phone-redaction.mjs:141` (old line) | Country code written directly in front of the number escaped all forms | Fixed in `1731db5`: caught in all 8 contract renderings plus `+1 (555) 556-0100`, `tel:+1...`, `tel:%2B1...`, `001-555-556-0100`; near-misses `115555560100`/`915555560100` rejected |
| Medium | Bug (prior round, resolved) | `scripts/check-phone-redaction.mjs:205-206` (old line) | Any file with a NUL byte was treated as binary and skipped, hiding a UTF-16 file | Fixed in `1731db5`: UTF-16LE/BE with BOM and LE without BOM exit 1 on a hit; a real Windows PowerShell 5.1 `>` file exits 1; undecodable files exit 2, named |
| Low | Bug | `scripts/check-phone-redaction.mjs:53,212` | The `00` international prefix with no separator (`0015555560100`) escapes all forms | Open |
| Low | Bug | `scripts/check-phone-redaction.mjs:217` | Bare-CR line endings report every hit on line 1 (exit code correct) | Open |
| Low | Bug | `scripts/check-phone-redaction.mjs:139-140,224` | A tracked file missing from disk is counted in the summary but still exits 0 | Open, as spec intends |
| Low | Bug | `scripts/check-phone-redaction.mjs:323-332,224` | Zero-files guard is global; an existing but empty directory argument exits 0 | Open |
| Low | Bug | `scripts/check-phone-redaction.mjs:50` | En dash, no-break space, underscore, tab and `&#45;` separators escape all three forms | Open |
| Low | Bug | `HomePage.jsx:39-49`, `SiteLayout.jsx:13` | Navbar highlights the wrong section after returning home at scroll 0 | Open, carried |
| Low | Bug | `SiteLayout.jsx:36-40` | Browser Back drops the visitor at top instead of restoring scroll | Open, carried; spec question for owner |
| Low | Bug | `CaseStudyPage.jsx:28` | Selected tab carries over to the next case study | Open, carried |
| Low | Bug | `vite.config.js:13-24` | `font-src 'self'` blocks 8 of 64 built `@font-face` blocks (Cyrillic/Vietnamese glyphs); not visible today | Open, carried |
| Low | Bug | `vite.config.js:75-77` | `404.html` copy in `closeBundle` masks the real error on a failed build | Open, carried |
| Low | Bug | `App.jsx:17` | `/Portfolio/index.html` renders "Page not found" | Open, carried; owner decision |
| Low | Conformance | `ProjectEntry.jsx:5` | `PRIVATE_REPOSITORY_NOTE` uses a middle dot, not `~` as R19 requires | Open, carried |
| Low | Conformance | `spec.md` R43, `WorkIndexPage.jsx` | R43 text not amended for `repoPublic`; 0 GitHub links render today | Open, carried, doc drift |
| Low | Conformance | `src/App.jsx`, ADR 0001 | 5 `<Route` elements vs R3's acceptance text "equals 4"; ADR 0001 still says four | Open, carried, doc drift |
| Low | Conformance | `spec.md` header | Says "R80-R89" (ten) vs eleven elsewhere | Open, carried, doc drift |
| Low | Conformance | `spec.md` Tailwind row | Cites `verification.md` line 17 wrongly; now further stale | Open, carried, doc drift |
| Low | Conformance | `plan.md:220` | Shows the pre-`26b5c0e` audit command | Open, carried, doc drift |
| Low | Conformance | ADR 0009 header | Date disagrees with the conductor log timestamp | Open, carried, doc drift |
| Low | Conformance | `NotFoundPage.jsx`, `CaseStudyPage.jsx` (Previous/Next) | New UI strings inline rather than in `portfolioData.js` | Open, carried |
| Low | Conformance | `CaseStudyModal.jsx:217` (pre-rename) | "Metrics audited and verified..." removed as a side effect of the R22 heading change, not individually named | Open, carried; undirected scope creep, not individually authorized |
| Low | Conformance (resolved) | `spec.md`/`intent.md` mockup citations | Cited `public/mockup-*.jpg` after the files moved | Fixed in `4373e35` |
| Low | Conformance (resolved) | `spec.md:67,1846` | Said "90 requirements"; actual 92 | Fixed in `4373e35` |
| Low | Conformance (resolved) | `intent.md:205` | Cited G1-D1, not G4-D3, as the redaction reason | Fixed in `4373e35` |
| Low | Conformance (resolved) | `docs/sdlc/constraints.md` item 3 | Lead sentence stale, said the number still renders in `ContactFooter`/`ResumeModal` | Fixed in `34a0a8c` |
| Low | Conformance | `package.json` (`tailwindcss`, `@tailwindcss/vite`) | Outside R49/R85's nine-package allowlist, pinned exact | Accepted: documented gap (B3, ADR 0009) |
| Low | Security (resolved) | `spec.md:1644-1645` | Constraint-audit said two mediums still open; both resolved in code and evals this round | Fixed: recorded closed in `4373e35` |
| Low | Security | `scripts/check-phone-redaction.mjs` separators | Still escapes: en dash, U+2011, no-break space, underscore, slash, 4+ separators, `&#8209;`/`&#45;`/`&ndash;`, spaced-within-group digits, fullwidth digits, percent-encoded digits, `001` with no separator; a number split across lines still hits on the area-code-plus-exchange form. Correction: the prior packet's line 164 wrongly said the script catches slash and four-separator forms; it never did (separator set identical at `e45aff8` and `a774a99`) | Open |
| Low | Security | 5 skipped images (`.jpg`/`.png`) | A number drawn in pixels is unverified by any scan; byte-level scan of the 5 found 0 embedded-text hits | Open |
| Low | Security | `docs/hosted-config.md`, `docs/sdlc/constraints.md`, `docs/sdlc/codebase-map.md`, `.workhorse/profile.yml` | Every phone claim in the new text is true at HEAD (confirmed: the fix commits are ancestors of HEAD, not on `main`; script exits 0; date matches UTC). `profile.yml:144` and the last sentence of `:148` still describe Google Fonts as a live visitor-IP flow though `index.html` has 0 Google Fonts references (not a phone claim, outside this pass's scope); `CLAUDE.md:13` same, carried under Adoption | Open (Google Fonts staleness only; phone claims fixed in `34a0a8c`), outside this pass's scope |
| Low | Security, new | `scripts/check-phone-redaction.mjs:185-189,229-238` | Scans the working tree, not committed content; an uncommitted edit can hide a committed occurrence. Remediation: read blobs from HEAD or the index | Open |
| Low | Security | CI (`deploy.yml`) | Cannot run the tree scan (no `fetch-depth`); matcher unit tests now run in CI, an improvement. ADR 0010 still does not say a history rewrite removes the `b50497f` reference | Open |
| Low | Security | Local `main` (5 files), 37 of 42 local branches | Current files still carry the phone number (5 clean: this change branch, `-tF4`, `-tF5`, two `worktree-agent-*` branches); 0 remote-tracking refs; none of the 37 contains `76bcc00` | Open: D2, owner decision |
| Low | Security, carried | `src/publicDirectory.test.js` guard | Name check is case-sensitive; a renamed or case-changed mockup file passes | Open, carried |
| Low | Security, carried | `docs/design/mockup-*.jpg` | Still tracked, become publicly fetchable once the repository is public; all four carry C2PA "Created by Google Generative AI" provenance; ADR 0012 rejects deletion | Open: D2, owner decision |
| Low | Security, carried | `public/icons.svg` | Unused create-vite template sprite, still publishes; predates this change | Open, carried |
| Low | Security, carried | `.github/workflows/deploy.yml:11-13`, `dependabot.yml` | Dependabot PRs get no CI before merge | Open, carried |
| Low | Security, carried | `package.json:18-20,22` | 4 runtime dependencies keep caret ranges, pre-existing | Open, carried |
| Low | Security, carried | `deploy.yml:104` | Test-count floor 12 against 191 actual tests | Open, carried |
| Low | Security, carried | `public/.well-known/security.txt:4` | `Expires` set to exactly one year; RFC 9116 recommends less | Open, carried, trivial |
| Low | Security, carried | `src/data/portfolioData.js:181` | "wasl" tagline plausibly makes religious affiliation inferable; `profile.yml:139-143` still asserts nothing is inferable | Open, carried; record the owner's conscious decision |
| Low | Security, carried | git metadata, `approvals.md` | All commits use `@instructors.2u.com`; going public publishes it plus the approver email | Open, carried; D2 |
| Low | Adoption, carried (not re-reviewed) | `README.md` | Still the create-vite template | Open |
| Low | Adoption, carried | repo `CLAUDE.md` | States lint fails and there are no tests; false on Node 22.12.0 | Open, stale |
| Low | Adoption, carried | `package.json`, `.nvmrc` (absent) | No Node version pin | Open |
| Low | Adoption, carried | `.github/workflows/deploy.yml` | Step-name style inconsistency, uncommented env var use, unlabelled trade-offs | Open, readability |
| Low | Adoption, carried | `FdePhilosophy.jsx` | Icons bound by array index, untested binding | Open |
| Low | Adoption, carried | `text-[#1d1d1d]` usages, `--ink: #181818` | Hard-coded hex diverges from the CSS token | Open |
| Low | Adoption, carried | `.gitignore:31` | Blanket `.claude/` would drop a committed config if ever added | Open, low priority |
| Low | Adoption, carried | `spec.md` (1827+ lines) | De facto runbook; consider extracting a dedicated document | Open, nice-to-have |

Conformance summary: 92 requirements; full row-by-row trace not re-walked this round (prior:
84 automated passing, 5 manual, about 14 CI-only, 2 pending owner evidence, 0 missing; believed,
carried). Drift this round: 13 files changed, 13 necessary, 0 scope creep; two extra
`constraints.md` lines (operational-loop step 4, open question 3) were pre-authorized in the spec.
Tailwind allowlist gap stays accepted (B3, ADR 0009).

Adoption score: 3/5, carried from artifact `7ed0918`, not re-reviewed this round; not touched by
either rejection note. Believed, not verified: the script is now importable with a unit test,
which may bear on the score at the next review.

Security independent scan (this round): each file read as UTF-8 and UTF-16LE/BE at offsets 0 and
1, entities and percent-escapes decoded, up to 6 separators tried. `HEAD` 106 files, 0 hits;
working tree 0; untracked 0; ignored files except `node_modules` (`dist`, `.claude`, logs) 9,289
files, 0 hits; positive control at `b50497f`, 1 hit (confirms the scan can find a real hit).

Security checklist: 2 pass (secrets/env vars; third-party version pins), 0 fail, 9 n/a (no
database, policies, storage bucket, user input, or admin surface).

## 5. Risk register

From `plan.md` "Risks", updated with what this round's reviewers raised.

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| No PR exists; `main` has no branches on origin | Certain until the owner acts | G4 cannot proceed to a PR or merge | Owner publishes only local `main` to the private origin now (never `git push --all`, never a task branch); conductor then pushes this change branch and opens the PR; repository stays private until this change merges, then public visibility is decided | Site owner |
| ADR 0009 / profile change not ratified by the owner | Open until D1 | If declined, `security_audit` reverts and Verify goes red | D1 decided at this gate | Site owner |
| Local `main` (5 files) and 37 of 42 local branches carry the number in current files | Medium | Publishing local main as-is, or `git push --all`, puts it on GitHub in current files | D2 decides the publishing method; never `git push --all` | Site owner |
| Mixed-encoding file silently misses a UTF-8 hit when a longer UTF-16 tail follows it | Medium, new this round | A future edit that appends UTF-16 text after UTF-8 could hide a real occurrence undetected | Tree confirmed clean today by two independent scans; D3 recommends a fix in a tracked follow-up | Site owner, next change touching these docs |
| Script started through a junction or symlink silently exits 0 without scanning | Medium, new this round | Automation reading only the exit code would record a false pass | Same as above; D3 | Site owner, next change |
| Script scans the working tree, not committed blobs | Low, new this round | An uncommitted edit can mask a committed occurrence at scan time | Remediation noted: read from HEAD or the index; tracked as backlog | Next change |
| Redaction script cannot run in CI (shallow clone) | Low | A regression is caught only when a human runs the script locally | Add `fetch-depth: 0` in a future change (ask-first path, ADR 0010); matcher unit tests do now run in CI | Next change |
| Mockups remain tracked at `docs/design/`, become fetchable once public | Low to Medium | AI-generated (C2PA-tagged) design reference becomes publicly visible | D2 accepts as a known consequence; ADR 0012 rejects deletion | Site owner |
| `profile.yml`/`CLAUDE.md` still describe Google Fonts as a live flow though the code no longer calls it | Low | A reader trusts a stale claim, outside this pass's scope | Flagged for the next docs pass | Site owner |
| Adoption gaps (README, CLAUDE.md, no Node pin, deploy.yml readability) | Certain until fixed | Onboarding and maintenance friction; no functional or security impact | Tracked for a follow-up change, unchanged this round | Site owner |
| Country-code-prefixed number and NUL-byte-skipped files escaping the redaction script | Closed | Would have left two detection gaps this rejection specifically asked to close | Fixed in `1731db5`, 17 new tests, mutation-checked | Resolved |
| `hosted-config.md` and other docs stating false redaction facts | Closed | Would have breached the owner's own no-unchecked-claims rule | Fixed in `34a0a8c` and `4373e35`; confirmed true at HEAD | Resolved |

## 6. Diff tour

13 files changed, 1186 insertions, 368 deletions (`git diff --numstat e45aff8 a774a99`, confirmed).
No protected or sensitive path from `.workhorse/profile.yml` is touched: none of `**/*.pem`,
`**/*.key`, `.env*` (protected) or `.github/workflows/**`, `index.html`, `vite.config.js`,
`package.json`, `package-lock.json`, `src/data/portfolioData.js` (sensitive) appears in the diff.
`.workhorse/profile.yml` itself is on neither list. Ordered script first (it carries the two new
medium findings), then the test, then docs.

1. **`scripts/check-phone-redaction.mjs`** (+191/-66, `1731db5`). Adds the country-code group to
   two of the three matchers, and full UTF-16LE/BE decoding with a loud exit 2 on anything else it
   cannot decode. The two new mediums (mixed-encoding tail, junction/symlink) live here.
2. **`src/checkPhoneRedaction.test.js`** (new, +157/-0, `1731db5`). The only new file in this diff.
   17 unit tests: matcher forms, decoding, the undecodable-file failure case (FL24). Runs inside
   `npm test`, CI-enforced.
3. **`.workhorse/profile.yml`** (+1/-1, `34a0a8c`). `compliance.retention_notes` no longer lists
   the phone number among the owner's published contact details; it states the number was removed
   from the site by R41 and remains only in git history (see `docs/hosted-config.md` section 7),
   which is fully true only once this change merges. Not a sensitive or protected path.
4. **`docs/hosted-config.md`** (+9/-5, `34a0a8c`). Section 7 corrected; the fix this rejection most
   specifically demanded, since it stated false facts.
5. **`docs/sdlc/constraints.md`** (+12/-7, `34a0a8c`). Item 3, operational-loop step 4, open
   question 3 corrected.
6. **`docs/sdlc/codebase-map.md`** (+1/-1, `34a0a8c`). Personal-data row corrected.
7. **`spec.md`** (+307/-17, `4373e35`). New "Second G4 rejection" section; R89 contract amended for
   the country-code and UTF-16 rules; mockup citations and requirement count corrected.
8. **`intent.md`** (+9/-6, `4373e35`). Mockup paths and the G4-D3 citation corrected.
9. **`evals.md`** (+121/-10, `a0221e1`). GC89/GC41 rewritten; new GC94, FL24, AD18.
10. **`docs/sdlc/.../adr/0010-...md`** (amended, NOT new, +16/-0, `4373e35`). Amends the
    detection-by-derivation decision for the two new rules.
11. **`verification.md`** (+115/-119, this session). Re-verification record for this gate; no
    source change.
12. **`verify-logs/eval-runner-report.md`** (rewritten, NOT new; existed since `661763c`, +236/-136,
    this session). Full case-by-case detail behind the Evidence section above.
13. **`conductor-log.md`** (+11/-0, this session). Log entries for the fix wave and this re-verify.

## 7. Checklist

- [ ] No PR exists yet. Publish only local `main` to the private origin now, never `git push
      --all` and never a task branch; keep the repository private until this change merges, then
      decide public visibility: local main's current files and 37 of 42 local branches carry the
      owner's phone number, only this change branch and its 4 task/worktree branches (`-tF4`,
      `-tF5`, two `worktree-agent-*`) are clean
- [ ] Intent still matches what the owner asked for
- [ ] Every requirement has a test (84 of 92 automated; the rest manual/CI-only by design)
- [ ] No finding above medium remains unresolved (true: 0 critical, 0 high; 3 mediums open, D1
      owner confirmation and two new detection gaps in `scripts/check-phone-redaction.mjs`; the
      current tree has 0 occurrences by two independent scans today)
- [ ] Rollback is documented (`plan.md` "Rollback"; the owner's `git revert` on `main` after G5)
- [ ] Client engineer could maintain this from the docs alone (adoption 3/5, unchanged, not
      re-reviewed this round, says not yet)

Security pre-ship checklist, embedded verbatim (tier 2), each line's disposition as the security
reviewer recorded it, unchanged from prior rounds since nothing new touches these areas:

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
      `public/` is world-readable by design; the tracked-mockup finding above is its analogue.
- [ ] New table holding user free text: length constraint, and a rate limit if insertable in a
      loop. **N/A: no user input anywhere.**
- [ ] New admin capability writes to an append-only log. **N/A: no admin surface.**
- [ ] New secret or env var covered by `.gitignore` as a pattern; confirmed with `git ls-files`.
      **Pass.** No secret or env var added this round.
- [ ] New third-party import in a runtime path pinned to an exact version. **Pass.** No new
      runtime dependency this round; the script and its test use Node built-ins, Vitest, and the
      `git` binary only.

Checklist result: 2 pass, 0 fail, 9 n/a.

## 8. Recommendation

Recommend approve with conditions: (1) D1, the owner reviews ADR 0009 and confirms the
`--omit=dev` `security_audit` scope himself; (2) D2, publish only local `main` to the private
origin now, keep the repository private until this change merges, then decide public visibility;
never `git push --all` and never a task branch; (3) D3, fix the two new
`scripts/check-phone-redaction.mjs` detection gaps (mixed-encoding tail miss, junction/symlink
silent exit 0) in a tracked follow-up before the next change that touches these docs; the current
tree is independently confirmed clean today by two separate scans, so this is not a live exposure;
(4) D4, the unchanged backlog (adoption 3/5, 11 bug lows (2 new), 9 carried conformance lows, 15
security lows) stays tracked, not release-blocking at tier 2. 0 critical and 0 high findings are
open. Both items the second rejection named are fixed and independently confirmed.

```
/workhorse:approve G4
/workhorse:approve G4 --reject "notes"
```

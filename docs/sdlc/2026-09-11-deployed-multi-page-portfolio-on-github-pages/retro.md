# Retro: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Trigger: release. All five gates approved, PR #1 merged at `d5ad8b0`, deploy run `34773728394`
green, site live at `https://muhibm1.github.io/Portfolio/`.

## What happened

**Confirmed** synthesis from `conductor-log.md`, `approvals.md` and `release.md`; individual claims
below are labelled where they depend on a single source rather than this cross-checked summary.

A single-page, undeployable Vite/React scaffold was turned into a multi-page portfolio with a
router, self-hosted fonts, a live orb hero, a test suite, and a GitHub Actions deploy to GitHub
Pages. The path to G4 took three presentations and two rejections over phone-number redaction
gaps, a stray mockup directory, and a broken footer control, while the conductor process itself
was repeatedly killed by API usage limits and individual agents hit their own turn limits. The
change shipped, the site is live and CI is green, but one CSP defect escaped every automated
check and surfaced only in a manual post-deploy browser check that the owner has still not logged.

## Timeline (from conductor-log.md, UTC)

| Time | Phase | Event |
|---|---|---|
| 09-11 02:01-02:09 | intent | intent.md written, tier 2 set, G1 presented |
| 09-11 02:37 | gate | G1 approved |
| 09-11 03:05-16:50 | spec | spec.md written, constraint audit blocked (2 High), one rework round, re-audit passed 0 High; conductor killed by API rate limits 4 to 5 times across this phase (row 16:01 reports one kill before it; 16:40 and 16:50 each report a kill before that row was logged, possibly the same kill reconstructed twice; 00:10 the next day reports "killed twice") |
| 09-12 10:52 | gate | G2 approved |
| 09-12 11:24-11:34 | plan | plan.md written, 13 tasks/4 waves; private-repo Pages blocker found |
| 09-12 19:49 | gate | G3 approved (D3, repo visibility, left unanswered, blocking only G5) |
| 09-12 19:53-23:14 | build | waves 1-4 (T1-T13, T1b) built and folded; build paused after wave 1 for owner decisions B1 (Node), B2 (react-router/vitest pins), B3 (Tailwind advisory) |
| 09-12 20:52 | owner | "B1 installed Node 22.12; B2 and B3 as recommended" (B1 not yet in effect on PATH) |
| 09-12 23:18-23:21 | build | Node v22.12.0 confirmed on PATH; lint runs clean for the first time |
| 09-12 23:49 - 09-13 01:21 | verify | RED then GREEN at `8ea98a7`; one fixer wave (V1) for `.gitignore` and JSX keys; conductor killed by an API rate limit once more, resumed 00:42:37 |
| 09-13 01:33-01:45 | review | 4 reviewers dispatched; packet compiler corrected once by the conductor |
| 09-13 01:46 | gate | **G4 rejected** (round 1): phone redaction gaps, mockups in `public/`, Back to Top broken off-home |
| 09-13 02:05-02:31 | build | fix wave 1 (F1-F3): Back to Top fixed, mockups moved to `docs/design/`, redaction script widened |
| 09-13 02:55 | verify | GREEN at `460405e`; eval-runner hit its turn limit twice during this dispatch and completed on the third |
| 09-13 03:29 | gate | **G4 rejected** (round 2): redaction script still misses `+1`-prefixed numbers and UTF-16 files; stale docs |
| 09-13 03:51-04:21 | build | fix wave 2 (F4-F5): script widened again, 17 unit tests added, stale docs corrected |
| 09-13 04:32 | verify | GREEN at `b91d04f`, 23 test files, 191 tests passing |
| 09-13 05:01 | gate | **G4 approved** (round 3), with 3 medium findings left open as tracked follow-ups |
| 09-13 05:42-06:00 | deploy | release.md drafted; release engineer stopped at its 50-turn limit before committing, found 3 defects, fixed them in a finishing pass |
| 09-13 14:27 | deploy | repo made public while empty, on the owner's instruction; bash-guard refused the main session's own direct attempt to publish `main` |
| 09-13 18:02 | deploy | owner pushed `main` (landing at `942d311`); change branch pushed and PR #1 opened |
| 09-13 18:03 | gate | G5 approved ("public as is; ADR 0009 confirmed") |
| 09-13 18:12-18:14 | deploy | Pages source set; PR merged at `0172210` -> `d5ad8b0`; deploy run `34773728394` green; live checks run, font CSP defect found |
| 09-13 21:46-21:51 | deploy | release engineer appended the "Deploy record" section to `release.md`; retro dispatched |

## What went well

- **Confirmed** (conductor-log.md, counted by row): the build/verify/review loop worked as
  designed, 20 distinct builder task dispatches (T1-T13, T1b, V1, F1-F5) folded cleanly across 4
  waves plus 2 fix waves, with no merge conflicts recorded anywhere in the log.
- **Confirmed** (conductor-log.md, row at 03:38): the constraint auditor caught 2 High findings
  before any code was written (spec phase) and both were closed in the next round.
- The conductor caught and corrected its own sub-agents' factual errors before they reached the
  owner. **Confirmed** (conductor-log.md rows): the packet compiler's output was corrected 3
  separate times: at `01:41:01` (errors found, re-dispatched; corrected output logged at
  `01:45:08`, catching a mislabelled PR-line assumption, a mislabelled Back to Top finding, and
  imprecise phone counts); at `03:29:36` (the compiler's own row states its first draft was
  "corrected by conductor" before this row was logged, for a publishing caveat, a D3/D4-versus
  -recommendation contradiction, and placeholder counts); and at `04:57:33` (errors found,
  re-dispatched; corrected output logged at `05:01:52`, catching a circular "publish main once this
  change merges" sequence, wrong diff-tour placeholder counts, and a misdescribed profile.yml
  change).
- CI ran green end to end on the first real deploy: pin check, lint, tests, test-count floor,
  runtime audit, full audit (informational), build, upload, deploy, and 5 of 5 smoke assertions
  (`release.md` section c, `gh run view 34773728394 --json jobs`, confirmed).
- **Confirmed** (conductor-log.md rows for F3/F4, `src/checkPhoneRedaction.test.js`): the owner's
  own redaction requirement (D3) was iterated on twice and closed with 17 unit tests plus an
  in-tree scan, not just a promise.

## What the pipeline caught, by phase

**Confirmed** findings, drawn directly from `review-packet.md` and `conductor-log.md`. The "Would a
human have caught it?" column is this agent's judgment, not a measured or independently verified
fact.

| Phase | Finding | Would a human have caught it? |
|---|---|---|
| spec (constraint audit) | R63 smoke assertion would pass without executing anything; runtime `@fontsource` packages had no exact-pin rule | Unlikely without reading the spec line by line; the auditor read 22 rows the owner never saw |
| build (readability/simplifier) | Byte-identical clipboard logic in 3 components; duplicated reduced-motion checks | Possibly, on a slow careful read; agents found it during a fold, same day |
| review (bug) | Back to Top `href="#overview"` is a no-op off `/home` | Yes, on first click; caught before the owner ever clicked it |
| review (security) | `public/mockup-*.jpg` (4 files, Apple mark, inaccurate metrics) would publish | Only if the owner remembered they were there; the reviewer found it by listing `public/` |
| review (bug, round 2) | Phone redaction script misses `+1`-prefixed numbers and UTF-16 files | Not without deliberately trying variant encodings; this needed an adversarial mindset |

## What it missed

Ten items, each with the evidence and where it should have been caught.

**1. Conductor and agent turn/rate limits.** **Confirmed** (conductor-log.md, read this session):
rows at 16:01, 16:40, 16:50, and 00:10 (spec phase) each report the conductor process killed by an
API rate limit. Row 16:01 reports resuming after one prior kill; rows 16:40 and 16:50 each report
"the conductor run was killed... before logging it", which may be the same kill reconstructed
twice rather than two separate kills; row 00:10 reports "killed twice" on top of those. This gives
a range of 4 to 5 logged kills in the spec phase, not a precise count. **Confirmed**, one further
kill in a later phase is in the log: conductor-log.md row at 2026-09-13T00:42:37 records the
conductor "resumed at 81046e2 in phase verify after rate-limit kill" (verify phase). The main
session may report further kills beyond these; none were found in conductor-log.md by this pass,
so no further count is claimed (**believed, not verified** would apply to any such report, but
none was located to cite). The spec-architect stopped at its own turn limit mid-edit (row
16:21, "Agent stopped at its turn limit while on ADR 0006"; conductor confirmed the edit was
complete by diff). The eval-runner hit its turn limit twice during the first-rejection verify pass
and completed on a third dispatch (row 02:55:23). The release engineer stopped at a 50-turn limit
before committing (row 05:56:26) and needed a second, "finishing" dispatch. **Root cause:** this
change ran long (79 to 92 requirements, 4 build waves, 2 gate rejections) against fixed
per-session budgets nobody sized against that scope. **Where it should be caught:** WorkHorse
level (plugin), not repo level; see "Plugin feedback" below. Every stop was recovered without
data loss because the conductor verified it by diff before treating it as complete, which is
worth keeping as a documented practice.

**2. Node 22.12 requirement discovered at build, not onboarding.** `docs/sdlc/constraints.md`
technical constraint 5 and `.workhorse/profile.yml` notes (both written at onboarding, commit
`2602557`, confirmed: `git show --stat 2602557` lists both files as added there, not `b50497f`,
which only added the scaffold and mockups) blame `oxlint --version` exit 1 on "npm cli issue 4828",
an optional-dependency bug.
**Confirmed** (conductor-log row at 20:44:05.230, wh-builder T1), the actual cause, found only at
build: oxlint's native binding needs Node `^20.19.0` or `>=22.12.0`; the dev host runs v21.7.3,
which satisfies neither range. This blocked wave 2 for roughly 2.5 hours (20:45 to 23:21) waiting
on the owner to install and switch Node. **Root cause:** the discovery analyst ran
`oxlint --version`, saw the error text, and pattern-matched it to a known npm bug without checking
oxlint's own engines range. **Confirmed** this session: `package.json` still declares no `engines`
field and the repo still has no `.nvmrc` (`ls .nvmrc` fails, `grep engines package.json` finds
nothing). **Where it should have
been caught:** onboarding (G0), by reading oxlint's own `package.json` engines field, not by
matching an error string to a plausible-sounding known issue.

**3. Owner decisions B2/B3, ADR 0009 confirmed only at G5.** B2 pinned react-router to `7.18.3`
and vitest to `3.2.7` after the initial pins (`7.9.4`, `3.2.4`) failed audit; B3 moved
`tailwindcss` and `@tailwindcss/vite` to `devDependencies` at exact `4.3.3` (conductor-log rows
20:45:06 and 21:47:27). ADR 0009 accepts 5 dev-only advisories and scopes `security_audit` to
`--omit=dev`. Every gate between the B2/B3 decision (09-12 20:52) and G5 (09-13 18:03) ratified
ADR 0009 "on the owner's behalf" or "pending his own confirmation" (approvals.md G4 notes, all
three rounds; ADR 0009's own header says "The owner has not read this revision"). The owner
confirmed it himself only at G5 ("ADR 0009 confirmed", approvals.md line 69). **Root cause:** the
owner's standing instruction, "Approve every command yourself, I'm busy," pushed a
security-relevant acceptance decision through 3 delegated gates before the person who owns the
risk saw it. **Where it should have been caught:** a process gap, not a pipeline miss; every
artifact labelled the delegation honestly, so it was visible, just unresolved until G5.

**4. G4 took three rounds, two rejections.** Round 1 (approvals.md, 01:46:12): phone-number
redaction gaps across docs, mockups left in `public/`, Back to Top broken off `/home`. Round 2
(approvals.md, 03:30:20): the redaction script from round 1's fix still missed `+1`/`1`
country-code prefixes and silently skipped UTF-16 files instead of failing loudly. Both were
delegated Claude decisions, not the owner's own reading (approvals.md notes, both rounds: "the
owner has not read the packet") (confirmed, approvals.md 01:46:12 and 03:30:20). **Confirmed** (conductor-log.md): the packet compiler itself was
factually wrong on all three G4 packets and was corrected each time, at `01:41:01`/`01:45:08`
(mislabelled PR-line assumption, mislabelled Back to Top finding, imprecise phone counts), at
`03:29:36` (self-reported as "corrected by conductor" before that row was logged: publishing
caveat, D3/D4-versus-recommendation contradiction, placeholder counts), and at
`04:57:33`/`05:01:52` (circular "publish main once this change merges" sequence, wrong diff-tour
placeholder counts, misdescribed profile.yml change). **Root cause:**
redaction and mockup-exposure risk were treated as documentation tasks in the first build pass
(R89 in the original spec) rather than adversarially tested against encoding and formatting
variants; the packet compiler drafts from multiple upstream reports without independently
re-deriving small facts like PR existence or line counts (believed, not verified; this agent's
inference, not a cause stated in any source artifact). **Where it should have been caught:**
the redaction gaps should have been an adversarial eval case (`AD` series) before G4, not found by
a human reviewer at the gate; the packet-compiler errors should have been caught by the compiler
re-reading its own inputs, which the conductor's post-hoc check did instead.

**5. Delegated approvals recorded as the owner's own.** All three G4 decisions (2 rejections, 1
approval) and the G5-adjacent merge/Pages actions were made by "Claude (main session)" under
"Approve every command yourself, I'm busy" (approvals.md notes, all G4 blocks). Yet
`approvals.md`'s "Who:" field on every one of those blocks reads `mmuhibullah@instructors.2u.com`,
the owner's own git identity, because that is whatever identity the approving process runs under,
not a record of who actually made the call. The main session also set the Pages source and merged
PR #1 on the owner's explicit instruction, even though the approved G5 packet stated "No agent
runs the production push or the merge, at this tier or any tier" (release.md section b, quoted
verbatim) (confirmed, approvals.md notes and release.md section b). **Root cause:**
`approvals.md`'s schema has one identity field, populated by the
approving mechanism, with no separate field for "who actually decided, human or delegate." The
Notes field is the only place this is recorded honestly, and only because each agent wrote it in
by hand every time (believed, not verified; this agent's inference about the schema's intent, not
a stated design rationale). **Where it should have been caught:** this is a WorkHorse schema gap, not
specific to this repo; see "Plugin feedback."

**6. Font CSP violation, escaped every automated check, not filed anywhere.** Confirmed live:
12 JetBrains Mono `data:` font URLs (Cyrillic-ext and Vietnamese subsets) are inlined by Vite's
default `assetsInlineLimit` (4096 bytes, confirmed absent from `vite.config.js` as an override)
and blocked by `font-src 'self'` (set in the same file), producing 12 console errors on every page
load; English text is unaffected (`release.md` section e, conductor-log row at 21:46:10). Smoke
step R82 (`.github/workflows/deploy.yml`) asserts exact string counts in the served HTML and
script, and structurally cannot see a browser console (confirmed, `.github/workflows/deploy.yml`).
R84's post-deploy manual check, item 4
("the browser console shows no CSP violation and no uncaught error"), is the only control that
could have caught it, and it did, but after release, not before: the main session's own log entry
called this "filed as a follow-up change", and the conductor confirmed there is no GitHub issue
(`gh issue list --state all` empty) and no `docs/sdlc/` directory for it (conductor-log row at
21:50:59, release.md section e) (confirmed, conductor-log row 21:50:59). **Root cause:** the CSP (`vite.config.js`, ADR 0006) and the
asset-inlining default (Vite's own behavior) were specified and reviewed in separate parts of the
pipeline that never cross-checked each other's output; nobody grepped the built CSS for `data:`
URLs against the CSP directives before shipping both together (believed, not verified; this
agent's inference, not a stated cause in any source artifact). **Where it should have been
caught:** a build-time check comparing `dist/assets/*.css` for `data:` URL schemes against
`font-src` in the CSP, which did not exist as an eval case; see the new eval case proposed below.

**7. Deep links return HTTP 404 with the app body.** Confirmed by this session and by
`release.md` section c/d: `curl` against `/work/apple-llm-triage` returns `404` (the `404.html`
SPA fallback per ADR 0002, by design), while the same URL renders correctly in a browser. Whether
crawlers and link-preview generators (which typically read the HTTP status, not the body) index or
preview these pages is **believed, not verified**; nobody has tested it against a real crawler or
preview generator. This is an accepted tradeoff of ADR 0002, not a new defect, and no fix is
proposed here without evidence it is actually causing missed impressions (confirmed, ADR 0002).

**8. First public push exposed the phone number for about 6 minutes, and the release plan had
already said it would.** Sequence, labelled as `release.md` section b (Deploy record) gives each
claim: the main session made the repository public at 14:27Z while it was still empty (**believed,
not verified**, conductor log); the owner pushed `main` himself, landing at `942d311`
(**believed, not verified**); a first push attempt reportedly did not land on origin and was
repeated (**believed, not verified**, no further detail logged); from about 18:02Z to 18:08Z,
`main` at `942d311` was the public default-branch view, still carrying the phone number in
`src/data/portfolioData.js`, `generate_viewer.cjs`, and the `public/` mockups, until the merge
(`d5ad8b0`) replaced it (release.md states this plainly, not itself labelled there); bash-guard
refused the main session's own direct attempt to publish `main`, and it was not bypassed
(**believed, not verified**). This exposure was accepted under the owner's own D2 option (iv), "go
public as is" (release.md section 3's options table; approvals.md G5 notes).

**Root cause, revised:** this was not a sequencing error nobody saw. **Confirmed** by reading
`release.md` section 2 (the approved G5 packet's owner-run publishing sequence, D2 option (iv) row,
lines 137-140): the packet had already predicted this exact exposure. Under option (iv)'s stated
primary order (a, b, e, d, c, f), going public (e) before the merge (c) means `main`'s tree, still
carrying the phone number, is the public default-branch view until the merge completes. The same
row also gives an alternative order (a, b, c, e, d, then re-run the failed deploy job from the
Actions tab), which keeps `main` private until after the merge, at the cost of one failed workflow
run. The order actually followed (release.md section b: e, a, b, G5 approval, d, c, f) used the
primary order, not the alternative. So the exposure was a documented, accepted consequence of the
chosen D2 option and the order the packet listed as the default, not something nobody thought to
check. Whether `main` is pushed before or after visibility is set makes no difference to the
exposure once the primary order's "visibility before merge" relationship holds; the phone number
only leaves `main`'s default-branch view once the merge lands the redacted change branch.
**Confirmed:** the packet's own table lists the exposure-free order as the labelled "Alternative
order," not as the row's default, and states its cost (one failed workflow run) but not a
recommendation to prefer it. **Where it should have been caught:** not at execution; the
release-plan template should default a tier-2-or-higher "public as is" release to the
exposure-free order (merge before visibility) unless the cost of one failed workflow run is
explicitly rejected by the owner, rather than presenting both orders neutrally with the
exposure-carrying one listed first.

**9. Five Dependabot PRs opened immediately after merge.** Confirmed (`release.md` section e,
`gh pr list --state open`): #2 `@fontsource/inter` 5.2.8 to 5.3.0, #3 `vitest` 3.2.7 to 5.0.0, #4
`jsdom` 26.1.0 to 30.0.1, #5 `@vitejs/plugin-react` 4.7.0 to 6.1.1, #6 `@testing-library/jest-dom`
6.9.1 to 7.0.1. #3 and #5 are majors that bear directly on ADR 0009 (which accepts a `vitest`
advisory fixed only in a major bump) and the B2 pin (`vitest` pinned at exactly `3.2.7`)
(confirmed, version numbers above against ADR 0009 and the B2 decision). None
have CI configured to run against them (a carried Low finding, review-packet.md line 153)
(confirmed, review-packet.md line 153).

**10. R84 not recorded, item 2 never checked.** Confirmed: `docs/hosted-config.md` section 6's log
still reads "No entries yet. The site has not been deployed." (release.md section d quotes this
directly). Item 2 of R84 ("the orb animates and stops when the tab is hidden") was only half
checked: the main session confirmed the orb paints (12020 non-transparent pixels, `role="img"`,
`aria-label` present) but nobody checked the tab-hidden pause behavior at all (release.md section
d, item 2 row) (believed, not verified; carried from the main session's own report, not
independently re-run by this agent). A proposed log line is written in `release.md` section d for
the owner to paste in himself; it was deliberately not written into `docs/hosted-config.md` by any
agent (confirmed, release.md section d).

## Metrics

| Metric | Value | Evidence |
|---|---|---|
| Gate rounds | G1, G2, G3, G5: 1 round each. G4: 3 rounds (2 rejected, 1 approved) | approvals.md, 7 total gate blocks |
| Fix loops (post-rejection) | 2, both resolved in the next round: fix wave 1 (F1-F3), fix wave 2 (F4-F5) | conductor-log rows at 02:22-02:31 and 03:51-04:21 |
| Fix loops (pre-gate, verify only) | 1: V1 (`.gitignore`, JSX keys) after the first RED verify | conductor-log row at 00:04:44 |
| Builder task dispatches | 20 distinct tasks: T1-T13, T1b, V1, F1-F5 | conductor-log, counted by row |
| Conductor process kills (API rate limit) | 4 to 5 recorded during the spec phase (rows at 16:01, 16:40, 16:50, 00:10; 16:40/16:50 possibly the same kill reconstructed twice; 00:10 reports 2 more), plus 1 confirmed in the verify phase (row at 00:42:37) | conductor-log.md, spec-phase and verify-phase rows |
| Agent turn-limit stops | 4: spec-architect (once), eval-runner (twice, same dispatch window), release-engineer (once) | conductor-log rows at 16:21, 02:55:23, 05:56:26 |
| Test count at close | 23 test files, 191 tests, 0 failed | verification.md, conductor-log row at 04:32:07 |
| Requirements at close | 92 (90 at G4 round 1, +2 for R91/R92 after the first rejection) | spec.md header per conductor-log row at 03:51:36 |
| CI smoke steps green on first live deploy | 5 of 5 (R63, R80, R81, R82, R87) plus 8 build/test steps, all `success` | release.md section c, `gh run view 34773728394` |
| Elapsed wall-clock time, intent to G5 | approximately 2 days 16 hours (2026-09-11T02:01 to 2026-09-13T18:03) | conductor-log first and last gate rows |

**Confirmed** against the source named in each row's Evidence column, with the same caveat as
"What it missed" item 1 for the kill-count row: 4 to 5 is a range reconstructed from the log, not
a precise count.

## Follow-ups

| # | Item | Owner | Proposed run |
|---|---|---|---|
| 1 | Font CSP: `data:` font subsets blocked by `font-src 'self'`, 12 console errors on every page load | Site owner | `/workhorse:run "Self-hosted JetBrains Mono Cyrillic-ext and Vietnamese subset fonts are inlined as data: URIs by Vite's default assetsInlineLimit and blocked by the font-src 'self' CSP, logging 12 console errors on every page view -> the built CSS emits zero blocked font URL schemes, verified by a build-time check, with 0 CSP console errors on a manual browser recheck"` |
| 2 | `check-phone-redaction.mjs`: mixed-encoding files can still miss a hit; direct-run guard silently no-ops through a junction or symlink | Site owner | `/workhorse:run "scripts/check-phone-redaction.mjs misses a hit in a file with mixed UTF-8/UTF-16 encoding and silently exits 0 with no output when invoked through a junction or symlink -> the script decodes mixed-encoding files correctly and always executes its scan regardless of how it is invoked, both proven by a red-team test"` |
| 3 | No `.nvmrc` or `engines` field pins the Node version this project actually requires | Site owner | `/workhorse:run "The project requires Node >=22.12 for oxlint but pins no Node version anywhere, so a fresh clone or CI runner can silently get an incompatible Node and lint fails for a reason that looks like a toolchain bug -> .nvmrc and package.json engines pin Node >=22.12, and npm ci fails with a clear message below that version"` |
| 4 | 5 open Dependabot PRs, 2 majors (`vitest` 5.0.0, `@vitejs/plugin-react` 6.1.1) bear on ADR 0009 and the B2 pin | Site owner | `/workhorse:run "Dependabot PR #3 (vitest 3.2.7 to 5.0.0) would close ADR 0009's accepted vitest advisory and PR #5 bumps a major plugin dependency, both currently unreviewed -> the owner has reviewed and merged or declined each PR, and ADR 0009 is revisited and either closed or re-justified against the resulting dependency set"` |
| 5 | `docs/hosted-config.md` section 6 has no R84 log entry; item 2 (tab-hidden orb pause) was never checked | Site owner | Not a code change: paste the proposed log line from `release.md` section d into `docs/hosted-config.md`, and separately check the tab-hidden pause behavior in a real browser |
| 6 | Deep links return HTTP 404 to crawlers/link previews (ADR 0002 tradeoff) | Site owner | No run proposed yet: monitor whether this actually costs an impression (for example, a LinkedIn share of a case-study link) before spending a change on it |
| 7 | Carried backlog from review-packet.md (11 bug lows, 9 conformance lows, 15 security lows, adoption 3/5), unchanged by this retro | Site owner | Not re-derived here; see `review-packet.md` section 4 for the full list |

Each item restates a finding already labelled and cited in "What it missed" above (items 1, 4, 6,
9, and 10, and review-packet.md section 4 for item 7); the "Proposed run" column is this agent's
proposal, not a verified claim.

## Proposed memory updates

These are diffs for the owner to review and apply; nothing outside `retro.md` was written by this
agent, per this session's instruction.

### CLAUDE.md, "Mistakes to avoid"

Reason: the four existing entries are all resolved (confirmed against the current tree below) and
should retire; four new lessons from this change are likely to recur and are added newest first.

**Confirmed** (`grep -n "Mistakes to avoid" -A 13 CLAUDE.md`, this session): the section heading is
at line 50, and the four bullets to be removed are at lines 54-62, immediately before the
`## Workflow` heading at line 64. Line numbers are not carried in the hunk header below because
CLAUDE.md is edited by other changes between now and when this diff is applied; apply it against
whatever the `## Mistakes to avoid` section reads at the time.

```diff
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ Mistakes to avoid section @@
 ## Mistakes to avoid

 Appended by retro after each change. Newest first.

-- `npm run lint` exits 1 with `Cannot find native binding` because `node_modules/@oxlint/` is
-  empty (npm optional-dependency bug). Do not treat it as a code failure. Fix by deleting
-  `node_modules` and `package-lock.json` and reinstalling.
-- `package.json` lists `@rolldown/binding-win32-x64-msvc`, a Windows-only binary nothing uses.
-  Remove it before the first CI run or `npm ci` on a Linux runner is expected to fail.
-- `vite.config.js` has no `base`. A GitHub Pages project site needs `base: "/Portfolio/"` or
-  every asset 404s.
-- `generate_viewer.cjs` at the repo root is dead and points outside the repository. Delete it,
-  do not maintain it.
+- Vite's default `assetsInlineLimit` (4096 bytes) inlines small self-hosted font files as `data:`
+  URIs. A `font-src 'self'` CSP blocks them with a console error only, so the page still renders
+  and asset-count smoke checks do not see it. Check built `@font-face` rules for `data:` URLs
+  whenever self-hosted fonts and a CSP coexist.
+- `approvals.md`'s "Who:" field is the approver's git identity even when the owner delegated the
+  whole decision and never read the packet. Read "Notes:", not "Who:", to see who actually
+  decided.
+- A "filed as a follow-up change" claim is not true until it has an artifact, a GitHub issue or a
+  `docs/sdlc/` directory. A conductor-log line alone is not a filing.
+- `npm run lint` (oxlint) needs Node `^20.19.0` or `>=22.12.0` for its native binding. Below that,
+  it exits 1 with `Cannot find native binding`, which looks like a broken install but is a Node
+  version mismatch. There is still no `.nvmrc` or `engines` field, so this can recur on a fresh
+  clone or a CI runner.
```

Verified before proposing: `grep rolldown package.json` finds nothing (removed), `vite.config.js`
line 30 sets `base: PAGES_BASE`, `ls generate_viewer.cjs` fails (deleted). All three confirmed
resolved against the tree at HEAD.

### CLAUDE.md, "Commands"

Reason: both lines are stale now that Vitest exists and lint passes under the right Node version.

**Confirmed** (`grep -n "Lint:\|Test:" CLAUDE.md`, this session): the real line 10 reads
`- Lint: \`npm run lint\` (oxlint) [EM DASH] currently fails on this machine, see Mistakes below`,
where `[EM DASH]` marks a character this artifact is not permitted to write literally; line 11
reads `- Test: none yet (add Vitest and React Testing Library in the first spec)`.

Insertion point, in words rather than a line-numbered hunk (hunk line numbers are not carried here
because the surrounding file changes as CLAUDE.md is edited by later changes): replace the two
lines above, which sit between `- Typecheck: none (no TypeScript)` and
`- Build: \`npm run build\` (Vite, writes \`dist/\`)` under the `## Commands` heading, with:

```
- Lint: `npm run lint` (oxlint), requires Node >=22.12; passes with 0 warnings under that
  version (see Mistakes below if it fails with "Cannot find native binding")
- Test: `npm test` (Vitest + React Testing Library), 191 tests passing as of change
  `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
```

### `.workhorse/profile.yml`

Reason: no Node version requirement is recorded anywhere in the profile, and the delegated-approval
pattern from this change (fact 5) has no documented convention.

**Confirmed** (`grep -n "commands:\|conventions:" -A 20 .workhorse/profile.yml`, this session):
`commands:` is at line 31, `lint: "npm run lint"` at line 34, `format: ""` at line 35;
`conventions:` is at line 43, `commit_style: conventional` at line 46, `test_globs:` at line 47.
Line numbers are not carried in the hunk headers below because the profile is edited by other
changes between now and when this diff is applied; apply each hunk at the section named.

```diff
--- a/.workhorse/profile.yml
+++ b/.workhorse/profile.yml
@@ inside commands: section, the lint line @@
 commands:
   install: "npm ci"
   typecheck: ""
-  lint: "npm run lint"
+  lint: "npm run lint"          # requires Node >=22.12.0 (oxlint native binding); no .nvmrc yet,
+                                 # see CLAUDE.md Mistakes (retro 2026-09-11-deployed-multi-page-portfolio-on-github-pages)
   format: ""
@@ inside conventions: section, after commit_style and before test_globs @@
 conventions:
   default_branch: main
   branch_prefix: wh/
   commit_style: conventional
+  approval_delegation_note: "When the owner delegates a gate decision (\"approve every command
+    yourself\"), the deciding agent must say so in the gate Notes text. approvals.md's Who field
+    always records the owner's git identity regardless of who actually decided; Notes is the only
+    honest record. Confirmed recurring across all 3 G4 rounds of change 2026-09-11-deployed-
+    multi-page-portfolio-on-github-pages."
   test_globs:
```

Not proposed: an automated headless-browser CSP console check (R84 item 4). `docs/sdlc/constraints.md`
already records that Playwright was rejected on cost grounds for this project; that decision stands
unless the owner wants to revisit it given this change's actual escaped defect. If revisited, the
smallest addition would be a single CI-only Playwright smoke test asserting zero
`console.error`/CSP-violation events on `/`, gated so it never runs on the dev host.

### `evals.md` (this change's own)

Reason: no case exists that would have caught the font/CSP mismatch found after release.

**Confirmed** (`grep -n "GC94\|GC90" evals.md`, this session): the golden-case table has the GC94
row at line 701 and the GC90 row at line 702, adjacent, in the change's own `docs/sdlc/2026-09-11
-deployed-multi-page-portfolio-on-github-pages/evals.md`. Insertion point, in words rather than a
line-numbered hunk against the full rows (both existing rows are long and are not reproduced here):
insert a new row between the existing GC94 row (line 701) and the existing GC90 row (line 702) of
the golden-case table. The new row only:

```
| GC95 | R82, R84 | Given Vite's default `assetsInlineLimit` can inline small self-hosted font files as `data:` URIs, and `font-src` in the CSP may not list `data:`, when `npm run build` finishes, then no `@font-face` rule in the built CSS references a `data:` URI unless `font-src` in `vite.config.js` explicitly allows it | `grep -o "url(data:font[^)]*)" dist/assets/*.css \| wc -l`; if > 0, `grep -c "font-src[^;]*data:" vite.config.js` must also be > 0 | 0 `data:` font URLs in built CSS, or `font-src` explicitly allows `data:` | Windows | new, proposed by retro after the live font CSP defect (release.md section e); not yet implemented |
```

## Plugin feedback (WorkHorse-level, not repo-specific)

Not edited here; described for whoever maintains the plugin skills.

1. **Turn-limited stops need a checkpoint convention.** The spec-architect, eval-runner (twice),
   and release-engineer all stopped mid-artifact at a turn limit this change (facts above, item 1)
   (confirmed, conductor-log rows cited there). Every time, the conductor recovered by diffing the
   artifact against the last known-good state before treating the stop as complete. That recovery
   pattern worked every time it was tried (confirmed, conductor-log) and
   is worth promoting from ad hoc conductor behavior to a documented step in the `wh-agent-rules`
   skill's "Stopping" section: on a turn-limit stop, the next agent (or the conductor) must diff
   the artifact, not assume completeness from the last logged sentence.
2. **Conductor resumability after a process kill should be a named procedure.** This change's
   conductor logged 4 to 5 kills from an API rate limit in the spec phase, plus 1 in verify (see
   "What it missed" item 1 and Metrics) (confirmed, conductor-log rows at 16:01, 16:40, 16:50,
   00:10, and 00:42:37), and recovered
   each time by reading the artifact files and reconstructing log rows from file mtimes
   (conductor-log rows at 16:01, 16:40, 16:50). That reconstruction procedure is currently
   improvised per-incident; writing it down once (read every phase artifact, diff each against the
   last committed state, reconstruct missing log rows from mtime and content, never guess a
   timestamp) would make it consistent across clients.
3. **"Filed as a follow-up" should require a linkable artifact before an agent is allowed to say
   it.** The main session called the font-CSP defect "filed as a follow-up change" with nothing to
   point to (fact 6) (confirmed, "What it missed" item 6). This is a general instance of
   `wh-agent-rules`'s "Evidence before assertion"
   rule; a targeted addition would name this specific phrase and require either an issue URL or a
   `docs/sdlc/<id>/` path before it may be used.

## Not verified

Carried forward from source artifacts, listed once here rather than re-labelled in every section
above:

- Whether `npm ci` actually fails on a Linux CI runner because of the old orphan dependency was
  never independently tested; it did not need to be, since the dependency was already removed
  before the first real CI run. **Confirmed** (`git log --oneline -S'@rolldown/binding-win32-x64-msvc' -- package.json`):
  the dependency was introduced in `b50497f` and removed in `3d75333` ("build: repair toolchain,
  pin dependencies, add vitest and pages build steps"), not by B2/B3 (which pinned react-router,
  vitest and moved Tailwind to devDependencies; a separate decision).
- The owner's first push of `main` "did not land on origin and had to be repeated": reported by the
  main session, no further detail in any log.
- Who clicked "Merge" on PR #1 and who ran the Pages-source `gh api` call: the resulting states are
  confirmed, the identity of the human keystroke behind each is not.
- Whether deep-link HTTP 404 status actually costs a missed crawler index or link preview in
  practice: plausible, not measured.

# Ship: Rebuild the portfolio to the approved redesign

This replaces the blocked draft of 2026-09-25 (`f0c9a84`), which could not push because
verification was red on a missing resume PDF. The resume is now withdrawn from the site entirely
(D24); this is a fresh document for the revision that followed.

Change id: `2026-09-25-rebuild-portfolio-to-approved-redesign`, tier 2, branch
`wh/2026-09-25-rebuild-portfolio-to-approved-redesign` at `95ecf64`. PR: https://github.com/muhibm1/Portfolio/pull/19
Design approved: [approvals.md](./approvals.md) (G2, four rounds, last approved 09-28 09:32 UTC)

## The short version

This revision removes the resume and its PDF from the site and repository, narrows contact to
email and LinkedIn, links three public code snapshots wherever the work is discussed, adds an
MCP-server story to WorkHorse, and brings its run record to five runs using the owner's own
figures. Of 26 shared claim pairs between the site and the resume, 5 differ in substance; no
factual claim in the content module was changed by an agent, so the owner decides each one. You
decide whether it is ready to merge and publish.

## What changed

136 files (`git diff main...HEAD --stat`, confirmed). By risk:

1. `.github/workflows/deploy.yml` (sensitive): resume PDF fetch and hash steps removed, no new
   secret, permission or action (security review, confirmed).
2. `scripts/forbidden-copy.mjs` plus `check-forbidden-copy.mjs` (sensitive): scanner blocking
   resume text, stale counts, owner-tool timings, Paddock words; 31 terms (26 plain strings, 5
   boundary-aware pattern terms, confirmed by reading the file). `phone-redaction-scan.mjs` no
   longer skips `.pdf` (D30).
3. `src/data/portfolioData.js` (sensitive, content): every resume-derived claim rewritten,
   run-record stats now carry source and staleness comments (`f7be231`).
4. `SiteHeader.jsx`, `ContactFooter.jsx`, `CaseStudyCards.jsx`, `CaseStudyPage.jsx`, `HomeHero.jsx`,
   `ExperienceSection.jsx`: resume controls deleted, GitHub code links added, footer narrowed to
   two links, MCP content rendered. This revision deleted three PDF scripts
   (`scripts/check-resume-pdf.mjs`, `scripts/resume-pdf.mjs`, `src/checkResumePdf.test.js`); no
   PDF was ever committed. `ResumeModal.jsx` was deleted in the original build, before this fix.
5. Docs and profile (`CLAUDE.md`, `profile.yml`, `hosted-config.md`, `codebase-map.md`,
   `constraints.md`) record the withdrawal and D57 deferral; test files widened to match (largest
   share of the diff by line count).

## Proof

| Check | Command | Exit | Status |
|---|---|---|---|
| install/lint/build | `npm ci` / `npm run lint` / `npm run build` | 0/0/0 (4.4s) | confirmed |
| test | `npm test` | 0 (463/463) | confirmed |
| test-count floors, security_audit | `check-test-floor.mjs`, `npm audit --omit=dev --audit-level=high` | 0/0 | confirmed |
| built-css-fonts + `[hidden]` preflight (R97), route-pages (R142) | see verification.md | 0/0 | confirmed |
| forbidden-copy dist+src (R128/9), phone-redaction dist+repo | `check-forbidden-copy.mjs`/`check-phone-redaction.mjs` | 0/0/0/0 | confirmed |
| typecheck/e2e/screenshot | none | | no check defined |

Evals: golden 23/23, edge 4/4, failure 2/2, adversarial 3/3. N1, N2 met. No known pre-existing
failures. M1-M5, N4 manual, recorded below.

## Numbers and side-by-side claims (R146, R158, M4, M5, D59, D60)

Every number and every shared claim pair, read from the built pages (`npm run build` ran clean,
confirmed, then each `dist/*.html` file was read as rendered text) and cross-checked against
`src/data/portfolioData.js`, is in
[ship-claims.md](./ship-claims.md) (D60: a companion file, because the complete lists do not fit
this document's 150-line cap). It never quotes resume wording (D24, D59); resume rows carry a
location only. Short version below; the owner confirms the complete lists at G4.

Of 26 shared pairs, 21 are same substance and 5 differ:

| # | Site wording | Resume location | Verdict |
|---|---|---|---|
| 10 | "Built the REST API layer and WebSocket real-time infrastructure" | Neural Newsletters, Pipeline Recovery bullet | differs: resume does not credit building the REST/WebSocket layer |
| 13 | "Ran 4.5 hours a week of office hours and 1:1 mentorship" | edX, Technical Enablement bullet | differs: resume gives no office-hours figure |
| 20 | "Four reviewers run at once...before a person ever sees the ship document" | WorkHorse, Guardrails & Evidence bullet | differs: site names no compliance regime, no credential-fallback example |
| 23 | "60 gold questions...plus nine trap questions...3 of 3 refused" | Studbook, Retrieval & Evals bullet | differs: site states 69 total across a dev/test split; resume's "60" does not say if traps are inside it |
| 26 | Toolkit columns (Build/Data/AI/Ship/People) | Skills section | differs: resume lists FastAPI and Kubernetes; toolkit omits both from the general list |

Site-only, not paired to a resume line (row 27 plus D46/D51's WorkHorse list, full in
ship-claims.md): "Emerald Labs, Software Engineering Intern, May 2022 to Sep 2022"; Paddock shown
current, Electron, 278 desktop/224 plugin tests, "CI on every push", FastAPI, MCP clause
(at-a-glance strip); "5 of 5", "1 of 5", "40", "70", "nine plugin releases" (first-four-run) and
the five-row outcomes table (measured section).

## What the reviewers found

| Severity | Reviewer(s) | Finding | Resolution |
|---|---|---|---|
| high | adoption | run-record figures had no in-file source/staleness note | fixed `f7be231` |
| high | silent-failure, security | phone-redaction scan never runs in CI, pre-existing on `main` | accepted: D57; deferral in `constraints.md` (`faa5bba`); follow-up fix |
| medium | bug, typescript | scanner reads binaries; `2x`/`11x`/`4 of 4`/timing pattern unanchored | fixed `4b23191` |
| medium | adoption | scanner not named as the extension point in CLAUDE.md | fixed `f7be231` |
| medium | react | `aria-controls` pointed at an unmounted panel | fixed `01fa7ae` |
| medium | react | no error boundary around `ParagraphWithLink`'s throw | accepted: conductor, D58; prerender fails closed on the same throw |
| medium | pr-test-analyzer | footer link count not asserted at exactly 2 | fixed `28eb005` |
| medium | conformance | ship.md was the stale pre-revision draft | resolved by this document |
| low | bug/react/pr-test/conformance/security (9 items) | false negatives, G21 line-skip, `key={index}`, stale comment, D56 scope, "Appendix A" spot check | 4 fixed (`4b23191`, `01fa7ae`, `28eb005`); 5 confirmed sound or open, no risk |

Conformance: 33 of 33 traced. Adoption score: 3 (before the fixes above).

## Decisions

| # | Decision | Recommendation | Alternative | Why |
|---|---|---|---|---|
| D59 | Resume wording kept out of ship.md | Pair site claims with resume location and verdict only; full wording never in the repo | Quote the resume wording in ship.md, as R158 literally reads | Publishing is irreversible, D24 bars resume text from the repo. Owner's call if he wants it in-repo. |
| D60 | ship.md's 150-line cap cannot hold every number and pair in full | Write ship-claims.md as a companion file and link it | Raise the tier 2 cap, or drop rows from ship.md | R146/R158 require every row in full; the cap is hook-enforced |
| D57 | Phone scan not in CI, pre-existing on `main` | Record deferral now, fix in a follow-up | Add a blocking deploy.yml step now with a deeper checkout | Fix changes deploy.yml beyond this change's scope. Owner's call on priority. |
| D54(d) | Is the banned scanner term the owner's client? | No change now; a follow-up replaces it with a hashed comparison if yes | Replace the scanner term inside this change | Name already public on `main` in 12 files. Needs owner's yes/no. |
| D56 | T21 file-list scope | Accept, no fix | Revert the overlay-copy edit | D56 is sound as scoped |
| D58 | No error boundary on the paragraph-link throw | Accept, no fix | Add an error boundary with approved fallback copy | The throw is already caught by the build failing closed |
| D38 | Design commits since the ship block squashed to one redacted commit | Done (below) | Squash the whole branch | Squashing all 30 build commits breaks cited hashes |
| n/a | Build-time rows and D24-D55 (Design revision) | All taken and stand as approved, logged in conductor-log.md and brief.md | n/a | No human input needed |

## The D38 history rewrite

Branch never pushed (confirmed). Twelve design commits (`fa41dca`..`651633f`) replaced by one
redacted commit `07f788f`; every old hash logged in conductor-log.md; brief.md's sha256 re-checked
equal to the newest G2 entry (confirmed). A 42-marker scan over all 130 reachable commits found
zero hits for the resume text; the owner's phone number has 18 pre-existing hits, only in commits
already public on `main`, not rewritten (confirmed). Approvals citing `618f344`, `0ab3167`,
`c13f63e` now point at unreachable commits, accepted by D48, decisions copied into brief.md. The
old commits sit in the local reflog until git garbage-collects them; never pushed anywhere.

## Deploy and undo

| Environment | Command | Automatic | Rollback |
|---|---|---|---|
| dev | `npm run dev` | yes | stop the process, no persisted state |
| staging | none defined | no | n/a |
| prod | `git push origin main` | no | `git revert` the merge commit, then push |

The owner's merge is the deploy. Not rehearsed: no staging command exists, and dev (build/serve
only) does not exercise the real rollback (a `git revert` on `main`); the merge itself, and a
revert if needed, is the only real rehearsal available. Local preview: `npm run build` then
`npm run preview` (Ctrl+C to stop); no preview server was started by this shipper. M3 (live pages,
repo links) and N4 (Lighthouse) are post-merge; M1/M2 (viewport, keyboard) are on the local
preview. Config/secrets touched: none.

## Clock

Clock: agents 8 h 06 m of 1 h 30 m budget (OVER) · waiting on you 58 m · dead 61 h 50 m ·
unexplained gaps 13 h 52 m · wall 84 h 46 m

## Your decision

Approve to merge and deploy, or reject with notes to send it back.

```
/workhorse:approve G4
/workhorse:approve G4 --reject "notes"
```

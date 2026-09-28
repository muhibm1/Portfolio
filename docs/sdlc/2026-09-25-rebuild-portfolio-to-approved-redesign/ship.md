# Ship: Rebuild the portfolio to the approved redesign

This replaces the blocked draft of 2026-09-25 (`f0c9a84`), which could not push because
verification was red on a missing resume PDF. The resume is now withdrawn from the site entirely
(D24); this is a fresh document for the revision that followed.

Change id: `2026-09-25-rebuild-portfolio-to-approved-redesign` · Tier 2 · Branch
`wh/2026-09-25-rebuild-portfolio-to-approved-redesign` at `95ecf64` · PR: https://github.com/muhibm1/Portfolio/pull/19
Design approved: [approvals.md](./approvals.md) (G2, four rounds, last approved 09-28 09:32 UTC)

## The short version

This revision removes the resume and its PDF from the site and repository, narrows contact to
email and LinkedIn, links three public code snapshots wherever the work is discussed, adds an
MCP-server story to WorkHorse, and brings its run record to five runs using the owner's own
figures. You decide whether it is ready to merge and publish.

## What changed

136 files (`git diff main...HEAD --stat`, confirmed). By risk:

1. `.github/workflows/deploy.yml` (sensitive) — resume PDF fetch/hash steps removed; no new
   secret, permission or action (security review, confirmed).
2. `scripts/forbidden-copy.mjs` + `check-forbidden-copy.mjs` (sensitive) — scanner blocking resume
   text, stale counts, owner-tool timings, Paddock words; 31 terms, two patterns. `phone-
   redaction-scan.mjs` no longer skips `.pdf` (D30).
3. `src/data/portfolioData.js` (sensitive, content) — every resume-derived claim rewritten;
   run-record stats now carry source/staleness comments (`f7be231`).
4. `SiteHeader.jsx`, `ContactFooter.jsx`, `CaseStudyCards.jsx`, `CaseStudyPage.jsx`, `HomeHero.jsx`,
   `ExperienceSection.jsx` — resume controls deleted, GitHub code links added, footer narrowed to
   two links, MCP content rendered. `ResumeModal.jsx` and three PDFs deleted.
5. Docs/profile (`CLAUDE.md`, `profile.yml`, `hosted-config.md`, `codebase-map.md`,
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

## Numbers per page (R146, M4)

| Page | Numbers shown | Source |
|---|---|---|
| Home, Work index | 30 to 350+; 2 weeks; ~50%; ~40%; 100% (stats); featured card 100%, 3 of 3, 40, 9; grid tags 2 weeks, ~50%, ~40%, 15-20% | Approved facts; 40 from G2: rejected 09-28 08:57 UTC |
| WorkHorse case study | 28, 9, 5-to-2, 100%, 5 of 5, 40, 70, 1 of 5, 224/278 tests; outcomes-row figures; Studbook 100%, 3 of 3, recall 0.56-0.85; MCP 40 questions, 12 of 12 | Approved facts, except 5 of 5/1 of 5 (08:12 UTC) and 40 (08:57 UTC); 70 and nine releases first-four-run (D47, D53) |
| Apple: decision system | 30 to 350+; 2 weeks; tenfold; zero backlog | Approved facts |
| Apple: integration | ~50%; 3 systems | Approved facts |
| Apple: data reliability | hundreds of thousands; ~40%; tens of thousands | Approved facts |
| Neural Newsletters | ~40%; 15 to 20% | Approved facts |
| Not found | none | n/a |

Figures read from `src/data/portfolioData.js`; build ran clean (confirmed above). Not re-read from
rendered `dist/` beyond the route-pages/forbidden-copy dist checks (believed, not verified further).

## Side-by-side claims list (R158, M5, D59)

D24 bars resume text from the repository; D38 rewrote it out of history. Per D59, site claims are
paired with a resume location and a verdict only, never quoted. Full wording:
`.../scratchpad/ship-claims-with-resume-wording.md` (outside the repository, never committed).

| # | Site wording (summary) | Resume location | Verdict |
|---|---|---|---|
| A | Role titles/dates (4); Apple's 4 highlights; edX teaching bullet; Freelance opening clause; hero lead + "tenfold"; both degrees; WorkHorse pipeline + hooks headline clauses; Studbook overview; MCP overview; the data-access line | matching bullets/sections throughout | same substance, near verbatim in most (10 grouped pairs) |
| 1 | "Built the REST API layer and WebSocket real-time infrastructure" | Neural Newsletters, Pipeline Recovery bullet | differs: resume credits no REST/WebSocket build |
| 2 | "Ran 4.5 hours a week of office hours" | edX, Technical Enablement bullet | differs: resume gives no office-hours figure |
| 3 | "...QA and reporting workflows kept delivery visible to the client" | Freelance, Client Discovery & Delivery bullet | same substance; site adds one sentence not on resume |
| 4 | "Four reviewers run at once...before a person ever sees the ship document" | WorkHorse, Guardrails & Evidence bullet | differs: site names no compliance regime, no credential-fallback example |
| 5 | "60 gold questions...plus nine trap questions...3 of 3 refused" | Studbook bullet ("Graded on 60 questions") | differs: site states 69 total across a dev/test split; resume's "60" doesn't say if traps are inside it |
| 6 | Toolkit columns (Build/Data/AI/Ship/People) | Skills section | differs: resume lists FastAPI and Kubernetes; toolkit omits both generally |
| 7 | "Emerald Labs, Software Engineering Intern, May 2022 to Sep 2022" | not present | site only, not on the resume |

WorkHorse claims site-only, not on resume (D46): Paddock shown current, Electron, 278 desktop/224
plugin tests, "CI on every push", FastAPI, MCP clause (at-a-glance strip); "5 of 5", "1 of 5", "40",
"70", "nine plugin releases" (first-four-run) and the five-row outcomes table (measured section).

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

| # | Decision | Recommendation | Why |
|---|---|---|---|
| D59 | Resume wording kept out of ship.md | Pair site claims with resume location + verdict only; full wording in a local file | Publishing is irreversible; D24 bars resume text from the repo. **Owner's call if he wants it in-repo.** |
| D57 | Phone scan not in CI, pre-existing on `main` | Record deferral now; fix in a follow-up | Fix changes deploy.yml beyond this change's scope. **Owner's call on priority.** |
| D54(d) | Is the banned scanner term the owner's client? | No change now; if yes, a follow-up replaces it with a hashed comparison | Name already public on `main` in 12 files. **Needs owner's yes/no.** |
| D56, D58 | T21 file-list scope; no error boundary on the paragraph-link throw | Both accept, no fix | D56 sound; D58's throw is already caught by the build failing closed |
| D38 | Design commits since the ship block squashed to one redacted commit | Done (below) | Squashing all 30 build commits breaks cited hashes |
| — | Build-time rows (T15-D1/D3, T16-D1/D2, D-t18-1, D-t19-1/2) and D24-D55 (Design revision) | All taken/stand as approved, logged in conductor-log.md and brief.md | No human input needed; D52 answered "40", D53's labels stay first-four-run |

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

Clock: agents 7 h 55 m of 1 h 30 m budget (OVER) · waiting on you 58 m · dead 61 h 50 m ·
unexplained gaps 13 h 52 m · wall 84 h 35 m

## Your decision

Approve to merge and deploy, or reject with notes to send it back.

```
/workhorse:approve G4
/workhorse:approve G4 --reject "notes"
```

# Ship: Align the site to the owner's master copy

Change id: `2026-10-08-align-the-site-to-the-owner-s-master-copy` · Tier 2 · Branch `wh/2026-10-08-align-the-site-to-the-owner-s-master-copy` at `864e448` · PR https://github.com/muhibm1/Portfolio/pull/26
Prepared 2026-10-08T04:22Z UTC · Design approved: see [approvals.md](./approvals.md) · Reports: [reviews/](./reviews/) · [verification.md](./verification.md)

This is the Ship document. Approving it merges the change, and a merge to `main` publishes the public site through GitHub Actions (CLAUDE.md, confirmed), so treat approval as a release.

## The short version

The site now says what your master document says: the new hero, "Apple Maps" with no vendor, and a decision case study about an agent that recommends while a person decides. It changes copy on all seven pages, adds a dark "Reviewer decides" step and the Studbook subtitle, and teaches the copy scanner to refuse the removed wording. You are deciding whether to merge, after you have read the two situation sections in item 7 below and re-rendered the share image `public/og.png` (still the old wording, D13).

## What changed

Plain words: every string your document specifies was rewritten word for word, with your four decisions of 2026-10-07 overriding it. Two small display features were added, and the build now fails if any banned phrase comes back. 13 files, 806 insertions, 89 deletions (confirmed, `git diff main...HEAD --stat` outside `docs/sdlc`).

1. `scripts/forbidden-copy.mjs` (protected, ask-first; approved at G2): +48 lines, new bans (vendor, plugin, messy, decision-authority, "eleven times"). First because a wrong pattern can block every deploy or miss a banned claim.
2. `src/data/portfolioData.js`: all copy and the six-step decision flow. Second: it is the whole public content, and the owner's factual record.
3. `src/components/CaseStudyFlowDiagram.jsx`, `CaseStudyPage.jsx`: gate marker on flow steps, optional step note, optional section subtitle, wrapping long titles. Interfaces, rendered on every case study.
4. Tests: `masterCopy.test.jsx` (new, every served route), `portfolioData.test.js`, `checkForbiddenCopy.test.js`, `CaseStudyFlowDiagram.test.jsx`, `CaseStudyPage.test.jsx`, `HomePage.test.jsx` (one pin follows D5, D-b1).
5. `docs/design/og.svg` (source of the share image), `src/index.css` and `src/main.jsx` (two comments reworded, "Bundled" for "self-hosted").

### The strings as rendered (a)

All quoted from `dist/**/index.html` built at 864e448; dist is newer than the last commit (confirmed, file times).
- Hero h1: "I find the step everyone is waiting on."
- Hero lead: "Data Engineer at Apple Maps. The platform is rarely the problem, the process around it usually is. So I start by finding where the work actually stalls, scope the fix with the people it affects, and put agents and automation on live data behind guardrails that make them safe to trust. Success is a number that moved; anything short of that is another iteration." Same text in the meta, Open Graph and Twitter descriptions (confirmed for the meta description; the others by the `masterCopy` test).
- Right now: "At Apple Maps: Running a decision support agent and data health tooling for a pipeline spanning 50+ regions". Also "Building WorkHorse: An agentic software delivery pipeline with its own retrieval system. This site was built with it."
- Decision page title: "A review backlog, turned into an analysis the reviewer can trust". Lead: "Cross-team data changes were stuck behind a manual review queue, because each request needed real investigation before anyone could approve it. I built an agent that does that investigation and hands the reviewer a documented recommendation. The person still makes the call."
- Six flow steps: 1 "Unlock request"; 2 "Geospatial snapshot, the target feature and its neighbors"; 3 "Check against internal specification"; 4 "Impact and cascade analysis"; 5 "Documented recommendation"; 6 "Reviewer decides" (dark gate box).
- Cross-reference, decision page: "The decision this produces is carried out by a separate tool I built, covered in the next case study."
- Cross-reference, integration page: "The judgment behind these requests is covered in the previous case study. This one is about what happens after the decision is made."
- WorkHorse Studbook subtitle: "Cited retrieval (RAG) over WorkHorse's engineering record"
- Gate steps (`data-gate`) per route, counted in the built HTML (confirmed): decision 1, Neural 1 ("Reader: Live status over WebSockets"), WorkHorse 3 ("Design", "Ship", "Receipts"), home, work index, integration, data health 0. E31 as written (exactly 1 everywhere, 0 on Neural and WorkHorse) was re-scoped by D20: the marker follows every `gate:true` step in the data, and those steps on WorkHorse and Neural pre-date this change. The bug reviewer flagged it as a low: two of the five marks are not human decisions.

### Item 7: the two situation sections back to back (b)

Decision page, "The situation":
> Changes to certain map data needed a person to review the request before work could continue, and the review was not a rubber stamp. Someone had to pull the surrounding data, check the proposed edit against internal specification, and work out what else the change would affect. The queue grew faster than people could do that. About two months of tickets had piled up, and teams across the pipeline were waiting on them.
> Building a fix was not part of my assigned role. I took it on anyway.

Integration page, "The situation":
> Locking and unlocking protected map data already worked, but the path was hostile: long command-line invocations, extra tickets raised just to carry the change, and enough setup that a routine request was easy to get wrong. None of it required judgment, only care.
> The judgment behind these requests is covered in the previous case study. This one is about what happens after the decision is made.

### Item 12: every number per route (c), from the built text (confirmed)

| Route | Numerals and metrics |
|-------|----------------------|
| / | 50+ regions; 30 to 350+ tickets a day; 2 weeks / 2 months of backlog; queue at zero; ~50% faster turnaround; 3 systems; ~40% fewer release-blocking failures; 100% faithful answers; 28 agents; 3 of 3 traps; 40 findings; 9 hooks; hundreds of thousands of failures; ~40% fewer incidents; 15 to 20% lower latency; tens of thousands of buildings; two cohorts of about 30; 4.5 hours a week; Feb 2025, May 2024 to Feb 2025, Oct 2023 to Mar 2025, Dec 2022 to May 2024, May to Sep 2022, Dec 2022, May 2020; sections 01 to 04 |
| /work | 28 agents; 100% faithful; 40 findings; 3 of 3; 9 hooks; 30 to 350+ tickets/day; 2 weeks; ~50%; 3 systems; 50+ regions; ~40% release-blocking; hundreds of thousands; ~40% incidents; 15 to 20% |
| decision | Feb 2025; November 2025 (twice); 30 to 350+ tickets a day; "more than tenfold"; 2 weeks; two months; zero backlog; "about 30 requests a day to over 350"; six flow steps |
| integration | ~50% faster; 3 systems; "half the turnaround"; Feb 2025; neighbor link repeats 50+ regions |
| data health | 50+ regions; hundreds of thousands; ~40% fewer; tens of thousands of buildings; three places; Feb 2025 |
| Neural | ~40%; 15 to 20%; thousands of articles; May 2024 to Feb 2025 |
| WorkHorse | 28 agents; 9 hooks; 5 to 2 gates; 100%; 224 and 278 tests; tiers 0 to 3; four reviewers; two thirds of wall-clock; 5 of 5, 1 of 5; 40 findings; 70 tests and cases; 17 days; 9, 10, 6, 3, 12 of 12 findings; 36, 34, 11 tests; Node 22.12; nine releases; 60 gold and nine trap questions; recall@5 0.56, 0.62, 0.65, 0.74, 0.82, 0.85; k = 60, k = 10; pools 20, 10; top 10, top 5; temperature 0; 3 of 3; 2 to 11 of 12; 9 of 12 vs 1 of 12; 40 evaluation questions; 0.0001 |

Whether each number traces to master document section 5 is not checked here (believed, not verified); the owner confirms.

### Item 16: site claims against the resume (d)

Full side-by-side (resume column included) is outside the repo: `C:\Users\alqai\Downloads\portfolio-claims-side-by-side.md` (confirmed, written). Resume of record: Appendix A of `PORTFOLIO_FIX_MASTER.md`. The resume PDF in Downloads (`Muhibullah_Muhammad_Resume.pdf`, 2026-09-28) is the OLD resume: it still says "decides approve, reject or hold", "self-hosted" and "via TCS" (confirmed). Replace it before sending. Site side, 30 claims, S same, D deliberate, F flag (hand-classified, believed, not verified by a second reader):
- S: title; throughput "more than tenfold"; "recommendation a reviewer approves or overrides"; "30 to 350+ tickets a day" and 2-week backlog; Python tool, "about 50%"; hundreds of thousands of failures; EMR to EKS "about 40%"; Neural prompts against production; edX "two cohorts of about 30"; UT Dallas Dec 2022 and ACC May 2020; 28 agents; nine hooks; Studbook fusion and rerank; data access four points; AI skills line.
- D: "Apple Maps" without the vendor line; retrieval table kept (recall@5 0.56 to 0.85); MCP server with no timings (D3).
- F: "queue has stayed at zero"; "Live since November 2025", "Self-initiated", "open-source LLM"; "each group" (resume: "each"); Neural latency credited to "schema and query changes"; Neural REST and WebSocket layer; edX 4.5 office hours; freelance QA sentence; Emerald Labs role; "5 to 2 human gates" and a third at tier 3 (resume: two); resume-only SHA-256 and compliance reviewers; "100%" faithful and "nine trap questions" (resume: 60 questions); skills list differences.

## Proof

| Check | Command | Exit | Output | Status |
|-------|---------|------|--------|--------|
| lint | `npm run lint` | 0 | `verify-logs/lint.log` | confirmed |
| test | `npm test` (520 passed, 0 failed) | 0 | `verify-logs/test.log` | confirmed |
| build | `npm run build` (8 pages prerendered) | 0 | `verify-logs/build.log` | confirmed |
| audit | `npm audit --omit=dev --audit-level=high` | 0 | `verify-logs/security_audit.log` | confirmed |
| dist scan | `node scripts/check-forbidden-copy.mjs dist` (40 files) | 0 | `verification.md` | confirmed |
| typecheck, e2e, screenshot | none defined | | | no check defined |
| Copy read-through, widths 390/768/1440, repository links | manual | | | not run, yours |

Evals: golden 20/20, edge 8/8, failure 2/2, adversarial 1/1. Known pre-existing failures: none (`wh.js known-failure list`). E12 and E31 text in `evals.md` pre-dates D20; the tests implement D20.

## What the reviewers found

0 critical, 0 high, 4 medium rows (3 fixed, 1 accepted), 11 low rows (3 fixed, 8 open with no fix).

| Severity | Reviewer | File:line | Finding | Resolution |
|----------|----------|-----------|---------|------------|
| medium | bug | CaseStudyFlowDiagram.jsx:28 | Six-column flow titles spill out of boxes at 776 to 1416px | fixed 564f8d8 (break-words, hyphens-auto); closed by CSS semantics, not measured in a browser |
| medium | bug, security (conformance low) | public/og.png | Share image still reads "Tickets decided a day" | accepted per D13 (owner approved at G2): the main session re-renders `public/og.png` from `docs/design/og.svg` in local headless Chrome and commits it before merge; no test requires the PNG; the open item is listed under Deploy and undo and Your decision |
| medium | adoption | portfolioData.js:9, portfolioData.test.js:68 | Comments cite an untracked master document | fixed 4565b15; adoption re-check closed |
| medium | test-analyzer | masterCopy.test.jsx:690 | Agent-authority regex too narrow | fixed 0dabaa9 |
| low | bug | CaseStudyFlowDiagram.jsx:26 | `data-gate` also on non-decision gate steps (Neural 1, WorkHorse 3); E31 as written not met | open, no fix; D20 re-scope, owner decides |
| low | conformance | spec D18 | "boundary" became "line" in "That line is deliberate rather than cautious." | open, recommendation taken, approved at G2 |
| low | adoption | CLAUDE.md:29, codebase-map.md:28 | Still say "self-hosted" typefaces | open, protected file, owner decides |
| low | adoption | forbidden-copy.mjs:119-137 | "Document section N" comments with no path | fixed 4565b15 |
| low | security (out of scope) | docs/design-brief.md, docs/design/redesign-2026-09/* | Public repo docs still carry "via TCS", "LLM decision systems", "self-hosted LLM" | open, no fix, owner decides; git history keeps old text anyway |
| low | test-analyzer | CaseStudyPage.test.jsx:239 | Mock cleanup not in afterEach | fixed 3ce298d |
| low | test-analyzer | checkForbiddenCopy.test.js:144 | "self hosted" and non-breaking hyphen variants untested | open, no fix (ask-first scanner) |
| low | test-analyzer | masterCopy.test.jsx:54 | Authority regex misses adverb, plural, perfect tense, "get" passive | open, no fix |
| low | typescript | forbidden-copy.mjs:~212 | "approve, reject, or hold" Oxford comma missed | fixed 864e448 |
| low | typescript | forbidden-copy.mjs:~213 | "11 times", "decided each ticket", "$0 rejected" variants | open, no fix |
| low | typescript | forbidden-copy.mjs:~203 | Bare "via" banned everywhere, including comments | open, no fix; follows D9 |

Spec conformance: 13 of 15 requirements traced to code and test by the reviewer; R14 (lint, build, audit, floor) confirmed by the verifier; R15 is process. Adoption score: 4.

## Decisions

Approving accepts every recommendation. The first row is a step the run could not take.

| # | Decision | Recommendation | Alternative | Why |
|---|----------|----------------|-------------|-----|
| D13 | Re-render `public/og.png` | Main session re-renders from `og.svg` and commits before merge; open | Leave old image | Old image still says "decided"; needs local Chrome |
| D1 to D19 | Brief decisions | Accepted by you at G2 (2026-10-08T02:56Z); D18 "line" for "boundary" shown above | per row | [brief.md](./brief.md) |
| D20 | E31 re-scope | `data-gate` marks every `gate:true` step; decision page exactly 1, other routes equal their data count | Add a separate human-decision flag | Existing gate steps pre-date this change (conductor-log 03:07Z) |
| D21 to D24 | Wave 2 builder decisions | Recommendations taken, accepted by the conductor (conductor-log 03:50Z) | n/a | Row text is not recorded in any artifact on this branch (confirmed by search): ask the conductor before approving |
| D-b1 | `HomePage.test.jsx` pin "At Apple Maps" | Follows D5 | Keep "At Apple" | Spec D5 |
| S1 | Resume PDF in Downloads is the old wording | You replace it before sending; not in the repo | Leave | Contradicts the site |
| S2 | Public repo docs with old wording | Leave for now, or a follow-up change | Reword now | Outside the scanner; history keeps it |

## Deploy and undo

| Environment | Command | Automatic on approval | Rollback |
|-------------|---------|-----------------------|----------|
| dev | `npm run dev` | yes in profile, not run (it only starts a local server) | stop the process |
| staging | none | no | n/a |
| prod | `git push origin main` (GitHub Pages via Actions); the squash merge of PR 26 is that push | no in profile; you perform it | `git revert <merge commit>`, then push the revert to `main` |

Rehearsal: not rehearsed: dev is a local server, so nothing is deployed to roll back; production is yours. Config and secrets touched: none.
Before merging, yours: (1) re-render `public/og.png`; (2) item 7 read-through above; (3) title wrap at 390, 768 and 1440px, unmeasured in a browser; (4) repository links in a signed-out browser (item 8).

## Clock

Clock: agents 1 h 41 m of 1 h 30 m budget (OVER) · waiting on you 27 m · dead 6 m · wall 2 h 13 m

## Your decision

Approve to merge, or reject with notes to send it back. The merge publishes the site, so do the four items above before approving.

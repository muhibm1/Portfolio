# Ship: Rebuild the portfolio to the approved redesign

Change id: `2026-09-25-rebuild-portfolio-to-approved-redesign` · Tier 2 · Branch
`wh/2026-09-25-rebuild-portfolio-to-approved-redesign` at `1886cc2` · PR: see below
Prepared 2026-09-25 UTC · Design approved: [approvals.md](./approvals.md) (G2)

Status: blocked on one owner-supplied file. No "Your decision" section below: the owner must add
the resume PDF and the pipeline must re-verify green before Ship can be approved.

## The short version

This rebuilds the site on the approved redesign: new tokens and fonts, a rewritten home page, a
five-study work section, single-scroll case studies, and a build that prerenders every route with
its own title, description and share tags. You are being asked whether the code, tests and
reviewer fixes are ready; you are not yet being asked to approve Ship, because one file only you
can supply is still missing.

## What changed

Old simulator, orb animation and single-scroll layout are gone; real per-page metadata, a copy
scanner blocking banned phrases and dashes, and a resume PDF link replacing the old modal. Diff
tour by risk (133 files, 8,130 insertions, 4,467 deletions; full list `git diff main...HEAD
--stat`):

1. `.github/workflows/deploy.yml` (sensitive) — narrows R80 to asset tags, adds per-page tag and
   scanner steps, fetches the PDF and share image after deploy. Actions still SHA-pinned.
2. `package.json`, `package-lock.json` (sensitive) — adds `@fontsource/ibm-plex-sans`,
   `@fontsource/ibm-plex-mono` at `5.3.0` (OFL-1.1); pins `react`/`react-dom` `19.3.0` (D19);
   removes `inter`, `jetbrains-mono`, `thinking-orbs`. `lucide-react` left in, unused (low).
3. `vite.config.js`, `index.html` (sensitive) — build now runs client build, SSR build, then
   `scripts/prerender.mjs`.
4. `scripts/prerender.mjs`, `route-pages.mjs`, `check-route-pages.mjs`, `forbidden-copy.mjs`,
   `check-forbidden-copy.mjs`, `check-resume-pdf.mjs` (new), `check-test-floor.mjs`,
   `src/pageMeta.js`, `src/entry-server.jsx` (all sensitive) — the prerender and CI-gate pipeline;
   every fix commit below touches one of these.
5. `src/data/portfolioData.js` (sensitive, employer-derived facts) — rewritten to plan section 6;
   every number pinned in `portfolioData.test.js` (G14).
6. `src/components/*`, `src/pages/*` — home, header, work index, case-study template rebuilt; ten
   old components deleted (simulator, orb, old hero, navbar, resume modal).
7. `src/*.test.*` (38 files, 419 tests) — new and rewritten tests for every check above.
8. `CLAUDE.md`, `.workhorse/profile.yml`, `docs/hosted-config.md`, `docs/sdlc/codebase-map.md`,
   `docs/sdlc/constraints.md`, `docs/design/redesign-2026-09/*` — docs synced; handoff plan
   committed with two passages redacted (D18).

## Proof

Copied from [verification.md](./verification.md), commit `bbd02a2`; every row confirmed by
running and reading the output.

| Check | Command | Exit | Output | Status |
|-------|---------|------|--------|--------|
| install | `npm ci` | 0 | install.log | confirmed |
| typecheck | (none) | | | no check defined |
| lint | `npm run lint` | 0 | lint.log | confirmed |
| test | `npm test` | 1 | test.log | confirmed red: G18 resume PDF only |
| build | `npm run build` | 0 | build.log | confirmed |
| e2e | (none) | | | no check defined |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | audit.log | confirmed |
| screenshot | (none) | | | no check defined |
| built-css-fonts | `check-built-css-fonts.mjs` | 0 | check-built-css-fonts.log | confirmed |
| route-pages | `check-route-pages.mjs` | 0 | check-route-pages.log | confirmed |
| forbidden-copy | `check-forbidden-copy.mjs dist` | 0 | check-forbidden-copy.log | confirmed |
| phone-redaction | `check-phone-redaction.mjs dist` | 0 | check-phone-redaction.log | confirmed |
| resume-pdf (D23) | `check-resume-pdf.mjs` | 2 | check-resume-pdf.log | confirmed red: expected gap |
| test (JSON) | `npm test -- --reporter=json ...` | 1 | evals.log | confirmed red: same G18 cause |
| test-floor | `check-test-floor.mjs` | 1 | test-floor.log | confirmed red: same G18, all floors met |

Evals: golden 22/23, edge 4/4, failure 2/2, adversarial 2/2 (N1, N3 met; N2 missed on the same
G18 cause; N4 manual, not run). The only red anywhere is D2/D12/D16/D17: the resume PDF is
intentionally absent, only the owner may supply it. Known pre-existing failures cited: none
(`known-failure list` returned "No known failures recorded").

## What the reviewers found

| Severity | Reviewer | File | Finding | Resolution |
|----------|----------|------|---------|------------|
| high | wh-bug-reviewer | CaseStudyPage.jsx, CaseStudyFlowDiagram.jsx | inline grid style broke mobile collapse | fixed `529adda` |
| high | ecc-typescript-reviewer | prerender.mjs | partial writes on mid-run failure; medium: stack traces dropped; low: non-Error throws print "undefined" | fixed `e101c0e` (all three) |
| high | ecc-silent-failure-hunter, wh-bug-reviewer (low) | checkRoutePages.test.js | real-dist case silently passed without a build | removed, D22, `636a474`; pins re-raised `bac5078` |
| high | ecc-pr-test-analyzer | CaseStudyPage.test.jsx, CaseStudyCards.test.jsx | narrative copy not pinned literally | fixed `6b7a1c1`: 5 studies x 7 fields. Its low (section-block content) open, covered by owner's M4 |
| medium | ecc-silent-failure-hunter | route-pages.mjs | empty `#root` guard not robust to future change | fixed `bac5078`, plus bug lows (`</head>` check, `$`-pattern replacer) |
| medium x3 | ecc-react-reviewer | WorkIndexPage.jsx, SiteHeader.jsx, Toolkit.jsx | `/work` no h1; menu button no `aria-controls`/label; Toolkit/ProductionStats no section heading | fixed `1eb8d0b`, `16064ca` ("wip" title, verified complete by follow-up, HomePage.test.jsx 11/11) |
| medium | wh-security-reviewer | phone-redaction-scan.mjs, hosted-config.md 6a | PDF has no control tying it to the owner's eye check | fixed: `check-resume-pdf.mjs`, D23, `bbd02a2` |
| medium | wh-conformance-reviewer | verification.md | ship.md must frame PDF gap as expected, not a regression | resolved by this document |
| low | wh-bug-reviewer | NotFoundPage.jsx | 404 Contact link had no `#contact` target | fixed `c8e1aa7` |
| low | wh-security-reviewer | package.json | `lucide-react` unused dependency | open: owner runs `npm uninstall lucide-react` (ask-first) |
| low | wh-adoption-reviewer | README.md | still unmodified Vite template | open, pre-existing |
| low | wh-bug-reviewer | forbidden-copy.mjs | scanner reads binary files under src/ as text | open, latent |
| low | wh-conformance-reviewer | plan.md | `resume-pdf.mjs` (new) not on ask-first list, though its entry script is | open, record only |
| low | wh-security-reviewer | CLAUDE.md | AgentShield prompt-defense findings | open, pre-existing |
| low | wh-bug-reviewer | entryServer.test.jsx | not pinned in check-test-floor.mjs | open, coverage note |
| low | wh-conformance-reviewer | plan.md Task 13 | D20: builder edited checkTestFloor.test.js outside file list | accepted: wh-conductor, fixture resync only |

Conformance: 24 of 24 requirements traced. Adoption score: 4.

## Decisions

D1-D19 taken at Design, accepted in full at G2 (`approvals.md`). Taken this run:

| # | Decision | Recommendation | Alternative | Why |
|---|----------|----------------|-------------|-----|
| D-lead | `Muhammad_Muhibullah_Resume.pdf` absent; only owner may supply it | Owner adds it after the D12/D17 check below, records SHA-256 in hosted-config 6a, commits, pipeline re-verifies | Ship without it | D2/D12/D16/D17: a public PDF cannot be unpublished |
| D20 | T13 edited checkTestFloor.test.js outside its file list | Accept: fixture resync only, no assertion removed | Revert and re-plan | Necessary drift, not scope creep |
| D21 | How to treat the PDF gap this run | True block; no fix loop; everything else continues to green | Fabricate/stub a PDF | It is the owner's own published personal data |
| D22 | Silently-passing real-dist test case | Delete it; resync pins | Skip visibly instead | Asserted nothing in CI, inflated the floor |
| D23 | Medium security finding on the PDF | Fix now: hash-tied `check-resume-pdf.mjs` | Accept as low, fix later | No failure path may be silent and consequential |

## Deploy and undo

| Environment | Command | Auto | Rollback |
|-------------|---------|------|----------|
| dev | `npm run dev` | yes | stop the process, nothing to undo |
| staging | (none) | no | not applicable |
| prod | `git push origin main` | no, owner performs it | `git revert` the merge commit on `main`, push |

Not rehearsed: staging has no deploy command; prod is never the rehearsal target; dev has no
deployed state. Config/secrets touched: none (`docs/hosted-config.md` section 4).

Local preview: `npm run build` then `npm run preview`, served under `/Portfolio/`.

Numbers per page (plan section 6, for M4): Home: 30 to 350+/day, 2 weeks to clear 2 months
backlog, ~50% faster, ~40% fewer failures, 100% faithful. WorkHorse study: 100%, +52%, 28, 0
featured; 28 agents, 9 hooks, 5 to 2 gates, 224/278 tests, 4 of 4 merged, 28 findings, 70 tests, 0
rejected; Studbook 100%, 3 of 3, 2 to 11 of 12, 2x. Decision study: 30 to 350+/day, 2 weeks, Zero
backlog. Integration study: ~50% faster, 3 systems, On demand. Data Health study: hundreds of
thousands resolved, ~40% fewer, tens of thousands triaged. Neural Newsletters: ~40% fewer
incidents, 15 to 20% lower latency, thousands of articles, Live via WebSockets.

D12/D17 PDF checklist before adding the file: contact limited to name, email, city, LinkedIn,
GitHub (no phone, no street address); document properties (Author, Title, Producer, any local
path) checked or stripped; backlog wording matches November 2025 launch. Then run `node
scripts/check-resume-pdf.mjs`, compute the SHA-256, append one line to hosted-config 6a.

Owner checks, unchecked: M1 viewports 390/768/1280/1440 on `/` and `/work/workhorse` [ ]; M2 Tab
order and focus ring on `/` [ ]; M3 pre-merge check on `dist/work/workhorse/index.html` [ ]; M4
numbers list above vs plan section 6 [ ]; M5 PDF checklist above [ ]; N4 Lighthouse mobile on `/`,
Performance >= 90, Accessibility >= 95 [ ].

## Clock

Clock: agents 4 h 11 m of 1 h 30 m budget (OVER) · waiting on you 14 m · dead 12 m · unexplained
gaps 8 h 37 m · wall 13 h 15 m

## Status, not a decision

No `## Your decision` here. A document with an open blocker is not finished; the artifact-check
hook is expected to refuse one that carries both a blocker and a decision section. The blocker is
the D-lead row, not a reviewer finding: every critical, high and medium reviewer finding is fixed
or accepted. Once the owner adds the PDF and records its hash, this document reruns to green and
Ship can be presented for real.

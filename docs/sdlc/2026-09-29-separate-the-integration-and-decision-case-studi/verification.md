# Verification: separate the integration and decision case studies and revise the Data Health incident paragraph

Status: green
Change id: `2026-09-29-separate-the-integration-and-decision-case-studi`
Branch: `wh/2026-09-29-separate-the-integration-and-decision-case-studi`, commit `77c1f0f` (confirmed; the Review-phase fix commit)
Node: v24.19.0 (confirmed, `node --version`). Logs: `docs/sdlc/<id>/verify-logs/`. All commands ran from the repository root.

## Checks

| Check | Command | Exit | Log | Confirmed |
|---|---|---|---|---|
| install | `npm ci` | 0 | verify-logs/install.log | confirmed |
| typecheck | no check defined (no TypeScript) | n/a | n/a | no check defined |
| lint | `npm run lint` | 0 | verify-logs/lint.log | confirmed |
| format | no check defined | n/a | n/a | no check defined |
| test | `npm test` | 0 | verify-logs/test.log | confirmed |
| build | `npm run build` | 0 | verify-logs/build.log | confirmed |
| e2e | no check defined | n/a | n/a | no check defined |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | verify-logs/security_audit.log | confirmed |
| screenshot | no check defined | n/a | n/a | no check defined |
| G12 | `node scripts/check-forbidden-copy.mjs dist` (exit read directly, no pipe) | 0 | verify-logs/g12.log | confirmed |
| N2 | `git -C C:/Users/alqai/Portfolio diff --stat main..HEAD -- package.json package-lock.json` | 0, empty output (0 bytes) | verify-logs/n2.log | confirmed |
| E5 | `node <scratchpad>/x.mjs` over dist/ (helper kept outside the repo) | 0 | verify-logs/e5.log | confirmed |
| evals | `npx vitest run src/data/portfolioData.test.js src/checkForbiddenCopy.test.js src/copyIsClean.test.js --reporter=verbose` | 0 | verify-logs/evals.log | confirmed |

## Evals

| Category | Cases | Passed | Target | Met |
|---|---|---|---|---|
| Golden | 14 (G1-G14) | 14 | 100% | met |
| Edge | 7 (E1-E6, E8) | 7 | 100% | met |
| Failure | 1 (F1) | 1 | 100% | met |
| Adversarial | 1 (A1) | 1 | 100% | met |
| Non-functional | 2 (N1, N2) | 2 | see rows | met |

Case to proof (all pass, confirmed in verify-logs/evals.log unless noted):
- G1, G2, G4: the pinned eyebrow/title/lead/at-a-glance/callout case and the pinned stat values case in `src/data/portfolioData.test.js`.
- G3, G5, G6, G7, G10, G13, G14: the like-named cases (R160, R161, R162, R165, R169, R170) in `src/data/portfolioData.test.js`.
- G8, G9, E1, E2, E3, E4, E6, E8, F1, A1: the like-named cases in `src/checkForbiddenCopy.test.js`. G11: `src/copyIsClean.test.js`.
- G12: `Forbidden copy check passed (R129): 40 files scanned.` (verify-logs/g12.log). `dist/` holds 8 HTML files (confirmed, `find dist -name '*.html'`), and `resolveScope` in `scripts/forbidden-copy.mjs` adds every `.html` under the argument directory (confirmed by reading lines 305-327), so `dist/work/apple-integration/index.html` is in scope. The scanner does not print its file list, so inclusion is confirmed by reading the code, not by output.
- E5: 10 of 10 assertions pass (verify-logs/e5.log): Cross-team in the decision page and home; none of cross-team, crossed team, fully manual in the integration page; `restricted geospatial` in 0 dist HTML files; Data Health carries "put tens of thousands of buildings into the data"; both `dist/index.html` and `dist/work/index.html` carry the new card sentence; the integration meta description starts "Locking and unlocking permissions".
- N1: "runs under two seconds scanning the real src/ directory" passes (74 ms). N2: empty output, 0 new dependencies.

## What was measured

- `npm test` ran 37 files and 480 tests: 480 passed, 0 failed (the summary line reports no skipped count), 18.57 s. Up from 463 tests across 37 files at the previous change, `2026-09-25-rebuild-portfolio-to-approved-redesign` (the fix commit added one test over the 479 seen at `bad16dc`).
- The eval subset (`npx vitest run` on the three relevant files) ran 3 files and 84 tests: 84 passed, 0 failed.
- `npm run lint` (oxlint) exited 0.
- `npm run build` exited 0: client build, SSR build, "Prerendered 8 pages".
- `npm audit --omit=dev --audit-level=high` exited 0: "found 0 vulnerabilities".
- `npm ci` exited 0. `node scripts/check-forbidden-copy.mjs dist` exited 0 with 40 files scanned.
- The git diff of `package.json` and `package-lock.json` against `main` is empty.

## Known failures

`wh.js known-failure list` printed "No known failures recorded." (confirmed). None cited.

## Not verified

- R168, manual: the owner reading both situation sections back to back, the Data Health incident paragraph with its stat label, and the integration page intro, meta descriptions and "What I built" paragraph, on the built pages. Strings below.
- No preview or dev server was started; none is running (confirmed).

## Rendered strings for R168

Extracted from `dist/` HTML (confirmed, tags stripped, entities decoded; helpers in the scratchpad).

Integration page intro, as rendered under the title on `dist/work/apple-integration/index.html`:
> Locking and unlocking permissions on protected map features already worked, but it ran on long command-line scripts and extra tickets raised just to carry the change. I built a Python tool that does it on demand through the ticketing, repository and geo-data systems' own authenticated APIs, and records why each change was made.

The same page's `<meta name="description">`, `og:description` and `twitter:description` carry that identical sentence text (confirmed, all three read).

Integration page, "What I built" paragraph:
> A Python tool that locks and unlocks map feature edit permissions on demand. It works through each system's authenticated REST API, so no one has to change the tools they already use, and every lock or unlock carries a comment explaining why, so the next person who asks why a feature is locked finds the answer on the feature itself.

Integration page, "The situation" section:
> Locking and unlocking protected map data already worked, but the path was hostile: long command-line invocations, extra tickets raised just to carry the change, and enough setup that a routine request was easy to get wrong. None of it required judgment, only care.

Decision page, "The situation" section (`dist/work/apple-llm-triage/index.html`), two paragraphs:
> Every change to certain map data needed a person to judge whether it should go ahead, and that judgment was the bottleneck. The queue grew faster than reviewers could clear it. About two months of tickets had piled up with teams across the pipeline waiting on them.
>
> Building a fix wasn't part of my assigned role. I took it on anyway.

Data Health, heading "When it breaks at scale" (`dist/work/apple-data-health/index.html`):
> A mass building-generation incident put tens of thousands of buildings into the data. I scoped the blast radius with SQL and QGIS and drove a delete, correct or retain decision on each one.

Data Health incident stat card: value "Tens of thousands", label "buildings triaged in one incident I led".

Integration homepage card summary as rendered on `dist/index.html`:
> Locking and unlocking permissions on protected map features ran on long command-line scripts. I replaced it with one tool that does it on demand and records why each change was made.

## Notes for the Ship document

- The "Apple (via TCS)" bullet ("led response to a building-generation incident affecting tens of thousands of buildings") is pinned by G7 and passes; not re-read on the built page.
- Findings outside scope: none.

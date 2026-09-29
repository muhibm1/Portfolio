Verdict: 1 finding (0 critical, 0 high, 0 medium, 1 low)
11 of 11 requirements traced (R160 to R170). Claims are labelled confirmed (read in the diff or artifacts) or believed, not verified.

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| low | git commit 1ad9c3e (body) | Task 1 commit body says "the owner's change request (the file named in brief.md)" instead of naming CASE_STUDY_FIX_INTEGRATION_AND_DECISION.md as plan step 5 asked (confirmed via git log). It does cite the G2 notes with timestamp and approvals.md. Also brief.md does not name the file (confirmed; the name is in spec.md and plan.md only), so the pointer is slightly dangling. | A later auditor reading git log alone cannot find the source document by name; they must open spec.md or plan.md. No behavioural effect; SDLC prose, not a verification target. | none proposed (do not rewrite history; optionally name the file in the Ship document) |

## Forward trace

| Req | Implementation | Test | Evals | Status |
|---|---|---|---|---|
| R160 | src/data/portfolioData.js:695-696 intro, 701 Result, 706 stat 3, 716 situation, 734 built, 756 changed, 764 callout | src/data/portfolioData.test.js "carries the integration page's situation, built and changed paragraphs verbatim (R160)", "keeps every integration element ... unchanged (R160)", updated pins | G1-G5 | implemented and tested |
| R161 | portfolioData.js:606 (first paragraph replaced; second paragraph kept) | portfolioData.test.js "carries the decision page's new situation opening and keeps its lead, card and principle 01 (R161)" | G6 | implemented and tested |
| R162 | no edit to count (line 162 bullet, stat value/label untouched; confirmed absent from diff) | portfolioData.test.js "keeps tens of thousands ... in all three places (R162)"; existing line 59 pin untouched; checkForbiddenCopy.test.js count-not-banned case | G7, E8 | implemented and tested |
| R163 | scripts/forbidden-copy.mjs:86-115, 169-177 (3 strings + 6 patterns) | src/checkForbiddenCopy.test.js one-fixture-per-term, disclosure-family, changed-incorrectly/high-impact, restricted-geospatial cases | G8, E1, E2, E8 | implemented and tested |
| R164 | scripts/forbidden-copy.mjs:179-188 PAGE_SCOPED_TERMS, buildMatchers onlyPaths, hitLinesIn, main | checkForbiddenCopy.test.js "bans cross-team only under work/apple-integration/", "carries onlyPaths on the page-scoped matcher only", look-alike, spaced/mixed-case, inert-on-data-module cases | G9, E3, E4, E6, A1, F1 | implemented and tested |
| R165 | portfolioData.test.js (three old pins updated; new cases) | same file, "never says cross-team, crossed team or fully manual (R165)" | G10 | implemented and tested |
| R166 | no code; verification | src/copyIsClean.test.js; verification.md: npm test 479/479, build exit 0, dist scan exit 0 "40 files scanned" | G11, G12 | implemented and tested (verifier logs, confirmed in verification.md; not re-run by me) |
| R167 | git diff --stat: four planned files plus docs/sdlc; package.json, package-lock.json, check-test-floor.mjs absent from diff (confirmed) | N2 in verification.md | N1, N2 | implemented and tested |
| R168 | no code; manual owner read | strings extracted in verification.md | none machine | manual, listed under Not verified (by design) |
| R169 | portfolioData.js:851 | portfolioData.test.js "carries the Data Health incident paragraph verbatim and never says restricted geospatial (R169)" | G13, E8 | implemented and tested |
| R170 | portfolioData.js:689 | portfolioData.test.js "carries the integration homepage card summary verbatim (R170)" | G14 | implemented and tested |

## String check (character for character, confirmed by reading the diff against plan.md task 1 and approvals.md G2 rejection notes)

Card summary, Data Health paragraph, intro, Result, stat 3, situation, built, changed, callout addition and decision opening: all identical to the plan's verbatim strings. Count "tens of thousands" retained; "restricted geospatial" removed from the paragraph. No em-dash or en-dash in added copy lines (believed, not verified beyond visual read; the existing dash case in the suite passes per verification.md).

## Backward trace

| File | Serves | Drift class |
|---|---|---|
| src/data/portfolioData.js (8 hunks, 20 lines) | R160, R161, R169, R170 | none |
| src/data/portfolioData.test.js | R160-R162, R165, R169, R170 | none |
| scripts/forbidden-copy.mjs | R163, R164 (module comment, term list, buildMatchers, hitLinesIn, main) | none; the doc-comment edits are named in plan step 3 |
| src/checkForbiddenCopy.test.js | R163, R164 | none |
| docs/sdlc/<id>/ (brief, spec, plan, evals, approvals, adr x3, conductor-log) | workflow artifacts | necessary |
Scope creep: none. Dependencies added: none (package files not in diff, confirmed).

## Plan conformance

Tasks 1 and 2 both done, in wave order (commits 1ad9c3e then bad16dc, confirmed). All four planned files touched; no unplanned source file touched. check-test-floor.mjs untouched as planned (D11).

## Decisions

D1 to D15: each was accepted by the owner's G2 approval of 2026-09-29T07:56:25Z ("recommendation accepted" for every row, confirmed in approvals.md). No decision taken without a human answer.

Findings outside scope: none. Note for Ship: scanner test file floor stays pinned at 29 cases while the file now has about 38 (D11, known follow-up).
Not verified: I did not re-run npm test, lint, build or the dist scan; I rely on verification.md and verify-logs. R168 owner read is manual. Whether dist/work/apple-integration/index.html was inside the 40-file scan is unconfirmed (E5 read it directly).

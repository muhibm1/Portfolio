# Conformance review: rebuild the portfolio to the approved redesign (revision)

Scope: `git diff 49618de..HEAD` (resume withdrawal / alignment-overlay revision, R151-R159 and
amended R132-R138, R143-R146, R149). R127-R131, R139-R142, R147-R148, R150 unchanged by the
revision; confirmed only where the diff touches their code.

33 of 33 spec requirements traced (24 built/unchanged + R151-R159, minus withdrawn R137).

Verdict: 2 findings (0 critical, 0 high, 1 medium, 1 low)

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| medium | docs/sdlc/.../ship.md:121-136 | R158's side-by-side claims list and M4 numbers-per-page are not yet rewritten for this revision; on-disk `ship.md` (150 lines) is the pre-revision draft (references the withdrawn PDF checklist, old numbers) | If G4 is presented from this file unchanged, the owner confirms stale content instead of the revision's actual copy (5 of 5, 40, 70, 1 of 5, Paddock-current, repo links) | wh-shipper rewrites M4 and the R158 list against current `src/data/portfolioData.js` before G4 (plan T22) |
| low | conductor-log.md:107-108 (D56) | Conductor accepted T21 editing `PORTFOLIO_ALIGNMENT_PASS.md` outside its stated T21 file list, to replace a D18-withheld quality figure with a withheld note | Confirmed correct in substance (file line 65: "The quality figure the plan already withholds from its committed copy (D18) stays off the site too.") but the edit is outside plan.md's T21 file list | none proposed; D56 is sound, flag for Ship document as the conductor requested |

## Forward trace

| Req | File | Test | Status |
|---|---|---|---|
| R127-R131,R139-R150 (unchanged) | as built | existing suites | implemented and tested (verification.md green at 12e6edd, not re-run this session) |
| R132 | src/pages/HomePage.jsx, HomeHero.jsx | HomePage.test.jsx | implemented and tested |
| R133 | src/components/SiteHeader.jsx:45,69,92-102 | SiteHeader.test.jsx | implemented and tested |
| R134-R136 | CaseStudyCards.jsx:56-58, CaseStudyPage.jsx | CaseStudyCards/CaseStudyPage.test.jsx | implemented and tested |
| R137 | withdrawn 2026-09-28 | n/a | n/a (confirmed: no resume keys in portfolioData.js) |
| R138,R146,R155 | src/data/portfolioData.js (lines 92,146,162,171,189,768,786,829,848,876,932 confirmed verbatim) | portfolioData.test.js (G14) | implemented and tested |
| R143 | .github/workflows/deploy.yml (D23 step and PDF fetch removed, smoke renamed, confirmed) | deployWorkflowRoutePages.test.js | implemented and tested |
| R144,R157 | PORTFOLIO_ALIGNMENT_PASS.md (170 lines, 3 withheld notes at 9,112,125), plan copy line 44 redacted, mockup 2 strings withheld (all confirmed by diff) | publicDirectory.test.js (G21) | implemented and tested |
| R151 | portfolioData.js (no resume keys), forbidden-copy.mjs:111 (`resume` term), 3 PDF files deleted (confirmed) | checkForbiddenCopy.test.js, servedFiles.test.js | implemented and tested |
| R152 | ContactFooter.jsx (email + LinkedIn only, no GitHub, confirmed) | ContactFooter.test.jsx | implemented and tested |
| R153 | portfolioData.js `REPOSITORIES`, CaseStudyCards.jsx:56-58 (aria-label "on GitHub, public snapshot") | CaseStudyCards.test.jsx (G7,G26) | implemented and tested |
| R154 | portfolioData.js:379-435 (measured block verbatim), :510-548 (mcp, incl. "my own ship gate" per D55), :285-293, :505-506, :557 | portfolioData.test.js (G14), CaseStudyPage.test.jsx (G10,G11) | implemented and tested |
| R156 | forbidden-copy.mjs:56 (timing pattern), :64 (Paddock pattern), :111 (resume) | checkForbiddenCopy.test.js | implemented and tested |
| R158 | not yet written for this revision | ship.md at G4 | correctly deferred per T22, but on-disk ship.md is stale (see medium finding) |
| R159 | CLAUDE.md, profile.yml, hosted-config.md, codebase-map.md (all 4 diffs match spec's exact-line instructions) | redesignDocs.test.js (G22) | implemented and tested |

## Backward trace

All 50 changed files (diff --stat) map to R138/R143/R144/R151-R159 and tasks T15/T16/T18/T19/T20/
T21 (plan.md Files table), plus SDLC artifacts (necessary drift: process record). No new
dependency (R147 confirmed, package.json absent from diff), no new route or component beyond
R132-R136/R153. `PORTFOLIO_ALIGNMENT_PASS.md`'s single T21 edit outside its nominal file list is
D56 (low finding above). No scope creep found.

## Plan conformance

T15, T16, T18, T19, T20, T21 done per conductor-log.md; T22 (manual/shipper checks) correctly
deferred to Ship, not yet complete. No planned file left untouched; no unplanned file touched
besides the D56 case above.

## Decisions

All D24-D55 recorded as owner-accepted at G2 (conductor-log.md: "G2 approved (651633f, accept-all
D24-D55)"); none is a recommendation taken without a human answer.

## Copy checks (R154/R155, confirmed by reading portfolioData.js)

"5 of 5" (390), "40" (391, 272), "70" (392, first-four-run label), "1 of 5" (393): exact. Outcomes
rows "Live web app with auth"/"Test service" (402, 420): exact, no ownership wording. `measured`
block (379-436): no "my"/"mine"/"client"; the sole "my own ship gate" (528) sits in `mcp`, outside
`measured`, per D55. No owner-tool timing figure found in portfolioData.js or design-record copies
(both withhold theirs, confirmed by diff). No Paddock status word found beside "Paddock"; other
"dropped" hits are unrelated Data Health/Integration incident sentences.

Findings outside scope: none.

Not verified: full suite not re-run this session (relied on verification.md green at 12e6edd);
M1-M5, N4 manual checks per verification.md's own "Not verified" section, unchanged by this
review; D56 classified as necessary drift by this reviewer's judgement, not independently
re-derived beyond reading plan.md's T21 file list.

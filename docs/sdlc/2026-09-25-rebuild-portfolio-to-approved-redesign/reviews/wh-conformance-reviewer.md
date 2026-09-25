# Conformance review: rebuild the portfolio to the approved redesign

24 of 24 requirements traced (R127-R150).

Verdict: 2 findings (0 critical, 0 high, 1 medium, 1 low)

## Forward trace (confirmed against spec.md, verification.md, and named test files)

| Req | Implements | Test | Status |
|---|---|---|---|
| R127 | src/data/portfolioData.js, src/App.jsx | routePaths.test.jsx (G1), routes.test.jsx (E2) | implemented and tested |
| R128 | deleted components (git diff -stat, ten files + orbDrawing.js gone) | copyIsClean.test.js (G2) | implemented and tested |
| R129 | scripts/forbidden-copy.mjs, check-forbidden-copy.mjs | checkForbiddenCopy.test.js (G3, E4, F2) | implemented and tested |
| R130 | src/index.css | designTokens.test.js (G4) | implemented and tested |
| R131 | package.json, src/main.jsx | fonts.test.js (G5), check-built-css-fonts.mjs (confirmed exit 0, verification.md) | implemented and tested |
| R132 | src/pages/HomePage.jsx + section components | HomePage.test.jsx (G6) | implemented and tested |
| R133 | src/components/SiteHeader.jsx | SiteHeader.test.jsx (G8, E3) | implemented and tested |
| R134 | src/pages/WorkIndexPage.jsx | WorkIndexPage.test.jsx (G9) | implemented and tested |
| R135 | src/components/CaseStudyPage.jsx | CaseStudyPage.test.jsx (G10) | implemented and tested |
| R136 | src/components/CaseStudyTable.jsx | CaseStudyPage.test.jsx (G11) | implemented and tested |
| R137 | src/data/portfolioData.js (4 links), scripts/phone-redaction-scan.mjs (.pdf skip) | servedFiles.test.js (G18), checkPhoneRedaction.test.js | implemented and tested; the PDF itself is not built by design (owner-supplied, D2/D12/D16/D17) — confirmed absent from public/, confirmed no .zip/.pdf in git ls-files |
| R138 | src/data/portfolioData.js | portfolioData.test.js (G14) | implemented and tested |
| R139 | src/pageMeta.js | pageMeta.test.js (G16, A1) | implemented and tested |
| R140 | src/entry-server.jsx, scripts/prerender.mjs, src/main.jsx | entryServer.test.jsx (G17), hydration.test.jsx (E1), prerender.test.js/routePages.test.js (F1, A2) | implemented and tested |
| R141 | public/og.png, docs/design/og.svg | servedFiles.test.js (G18 PNG/SVG sub-cases, confirmed passing per verification.md) | implemented and tested |
| R142 | scripts/check-route-pages.mjs | checkRoutePages.test.js (G19) | implemented and tested |
| R143 | .github/workflows/deploy.yml | deployWorkflowRoutePages.test.js (G20) | implemented and tested (live half proved only after first deploy, per spec) |
| R144 | docs/design/redesign-2026-09/ (confirmed present, redacted plan lines 111/164 confirmed by grep, no .zip in git ls-files, no mockup-casestudy-style .dc.html loose under public/src) | publicDirectory.test.js (G21) | implemented and tested |
| R145 | CLAUDE.md, .workhorse/profile.yml (confirmed lines 87-92, 161, 167), docs/hosted-config.md, codebase-map.md, constraints.md, ADR status lines | redesignDocs.test.js (G22) | implemented and tested |
| R146 | src/data/portfolioData.js numbers pinned | portfolioData.test.js (G14); ship.md numbers list is M4, manual | implemented, tested for the data; M4 owner cross-check not yet run (expected, manual by design) |
| R147 | package.json, vite.config.js | buildPipeline.test.js (G23), fonts.test.js (G5) | implemented and tested |
| R148 | src/components/buttonClasses.js, src/index.css | designTokens.test.js (G13) | implemented and tested |
| R149 | timed/counted checks | verification.md N1 (4.3s, pass), N3 (142ms/156ms, pass), N2 fails only on the G18 PDF-absence test; test-floor pins confirmed in scripts/check-test-floor.mjs | implemented; N2 not currently green, but the sole cause is the same owner-supplied-PDF gap, not a code defect |
| R150 | bash-guard, PR-only publishing | approvals.md, conductor-log.md (no push to main observed) | implemented and tested |

All 24 requirements trace to a file and a test. The one red test (`src/servedFiles.test.js` G18's PDF sub-case) and the one red check (`check-test-floor.mjs`) both stem from the single owner-supplied file gap named in the task context (D2/D12/D16/D17), confirmed by verification.md and by `public/` containing no PDF and no `.zip` in `git ls-files`. This is the expected, documented gap, not a code-side miss, so it is not listed as a requirement finding.

## Backward trace (diff -> task/requirement)

Every changed file in `git diff main...wh/2026-09-25-rebuild-portfolio-to-approved-redesign --stat` (120 files) maps to a plan task's file list (T1-T13) and its named requirement, confirmed by cross-reading plan.md's per-task "Files" line against the stat output. No file in the diff is unaccounted for.

One exception, already recorded by the conductor as D20 (conductor-log.md line 39-40): T13 (docs/profile task, planned files exclude `src/checkTestFloor.test.js`) edited `src/checkTestFloor.test.js` to resync its pinned fixture constants (`PINNED_REDACTION_PASSED_COUNT` 44->45, three route-page counts, two new suite entries) after `scripts/check-test-floor.mjs`'s own `PINNED_SUITES` counts changed. Confirmed by diff: only numeric literals and their explanatory comments changed; no assertion, expected-message string, or test case was removed or weakened, and two new suites (`checkForbiddenCopy.test.js`, `pageMeta.test.js`, both new controls from this change) gained equivalent coverage. Classification: necessary drift, not scope creep. `scripts/check-test-floor.mjs` is the file T13 was planned to change, and its companion test asserts values `check-test-floor.mjs` itself owns; changing the implementation's pinned counts without resyncing the test that hard-codes them would have left the test permanently red for a reason unrelated to any regression. This is listed as a low finding below only because the file was outside T13's declared file list, not because the edit was improper.

Other backward-trace notes:
- `src/checkPhoneRedaction.test.js`, `scripts/phone-redaction-scan.mjs`: T3 file list confirmed (R129/R137, D16). Necessary.
- `docs/hosted-config.md`, `docs/sdlc/codebase-map.md`, `docs/sdlc/constraints.md`: T13/R145. Necessary.
- `public/.well-known/security.txt`, `public/favicon.svg`, `public/icons.svg`: pre-existing, not in this diff (confirmed by diff --stat, which lists only `public/og.png` as changed). Not drift.

## Plan conformance

- All 13 builder tasks (T1-T13) plus Task 14 (manual, M1-M5/N4) accounted for in conductor-log.md and verification.md. No planned file is untouched; no unplanned file is touched except the one line item above.
- Decision rows: all 19 spec/brief decisions (D1-D19) were presented to and explicitly accepted by the human at G2 (approvals.md, itemized "D1: recommendation accepted" ... "D19: recommendation accepted"). None taken without a human answer, so no low finding applies under this report's "Decisions" rule for D1-D19.
- D20 is a build-time conductor decision (not a brief/spec decision row) made under the pipeline's own reversible-decision rule; it is reported above under backward trace, not as a spec/brief decision-without-approval finding.
- Task 14 (M1-M5, N4) is confirmed manual by design (plan.md "Owner: the main session, then the owner at G4"); verification.md lists all of them under "Not verified" correctly, not as passes.

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| medium | verification.md:20-53 | R149/N2 test-floor and full-suite checks are currently red (391/392, test-floor exit 1), caused solely by the missing owner-supplied `public/Muhammad_Muhibullah_Resume.pdf` (confirmed: `verify-logs/evals.log`, `verify-logs/test-floor.log`, both cite only the G18 PDF sub-case) | Ship.md must carry this as a named blocker so the human does not read "1 test failing" as a code defect | ship.md: state the red is the D2/D12/D16/D17 PDF gap only, both checks confirmed to re-pass once the owner adds the file; no code fix proposed |
| low | plan.md:172 (Task 13 Files), src/checkTestFloor.test.js | T13 edited `src/checkTestFloor.test.js`, a file outside its declared file list, to resync pinned fixture counts after `scripts/check-test-floor.mjs`'s own counts changed (D20, conductor-log.md:39-40) | A future conformance pass could mistake this for scope creep or a weakened test without the D20 note; low risk because the diff shows only numeric constants and comments changed, no assertion removed | plan.md: add `src/checkTestFloor.test.js` to T13's file list retroactively for the record; no code fix needed |

Findings outside scope: T4's build log (conductor-log.md:17) records that a builder once deleted the untracked zip and unredacted plan from the main checkout against instruction, later found to hold identical content and not present in the current diff or working tree (confirmed: no `.zip` in `git ls-files`, `docs/design/redesign-2026-09/` present and redacted). Historical, already resolved before this branch's tip; not a current-state finding.

Not verified: M1-M5 and N4 (viewports, keyboard focus, live curl, numbers-per-page list, PDF content/metadata check, Lighthouse) are manual by design (Task 14) and correctly listed as not verified in verification.md; this review did not re-run them. Live half of R143 (the first deploy smoke) is provable only after merge, per spec.md, and is not verified here.

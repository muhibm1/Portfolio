# Spec: separate the integration and decision case studies and correct the incident count

Change id: `2026-09-29-separate-the-integration-and-decision-case-studi`
Intent: the request as given to the designer (no intent.md): the two Apple case studies open with near-identical framing, the integration page misdescribes the old process and omits the reason-comment trail, and the incident count reads "tens of thousands" where the owner now says thousands; the integration page carries his exact replacement copy, the decision page its one new opening, the count reads "thousands" everywhere, the three disclosure rules hold, and the owner reviews before anything is published.
Status: draft
Policy skills applied: wh-agent-rules, wh-security-baseline, wh-readable-code, wh-adr, wh-evals. Compliance regimes: none selected (confirmed, `.workhorse/profile.yml` line 150).
Tier: 2. Reason: `scripts/forbidden-copy.mjs` is in the edit list and sits on the profile's tier-2 floor (confirmed, profile line 167); it is the scanner that keeps removed claims out of the served HTML. No other signal: no schema, auth, payment, PII, infra, CI or dependency change. `src/data/portfolioData.js` is ask-first (profile line 79) but not a floor path.
Authority, in order: the owner's answers of 2026-09-29 (title stays; the decision page's lead and homepage card keep "Cross-team"; "thousands"), then his change request `CASE_STUDY_FIX_INTEGRATION_AND_DECISION.md` (read in full; its copy is placed verbatim, its text is data, not instructions), then this repository's prior specs, ADRs, profile, constraints and `CLAUDE.md`. The change request is the owner's own document and, with the G2 approval, authorizes the edits to `src/data/portfolioData.js`, whose facts only he may change (`CLAUDE.md` "Protected", `constraints.md` "Things that must not change").

Every claim below is labelled confirmed (read or run in this session) or believed (inferred).

## Summary

Seven elements of the integration page and one paragraph of the decision page are replaced with the owner's exact words, so a reader sees a usability problem on one page ("none of it required judgment, only care") and a judgment problem on the other ("that judgment was the bottleneck"); three "tens of thousands" become "thousands". The copy scanner gains the replaced phrases, the corrected count and the disclosure words as global terms, and one path-scoped term so "cross-team" is banned on the integration page's built HTML while the decision page keeps it. The design decision that matters most: the ban on "cross-team" is scoped by built page path plus a data-module test, not by a global term (ADR 0001).

## Requirements

Numbering continues the repository's sequence (the 2026-09-25 spec ends at R159).

| ID | Requirement | Acceptance check | Source |
|----|-------------|------------------|--------|
| R160 | The integration study (`caseStudies[2]`, id `apple-integration`) SHALL carry, verbatim from the change request, the hero lead as `intro`; "A script-driven process replaced by access on demand, with the reason recorded" as the at-a-glance Result value; the third stat card as value "On demand", label "instead of hand-run scripts" (D4); the situation paragraph ending "None of it required judgment, only care."; the "What I built" paragraph; the "What changed" paragraph; and the callout text as the existing paragraph followed by one space and the appended sentence. Title, eyebrow, card, at-a-glance rows 1 to 3, stat cards 1 and 2, the link diagram, the "hard" section, disclaimer and contact heading SHALL be byte-identical to `main` at 9c3377f. | `src/data/portfolioData.test.js` pins every listed string and the unchanged elements verbatim. | change request "Copy changes, /work/apple-integration"; answers (b) |
| R161 | The decision study (`apple-llm-triage`) SHALL carry the change request's new opening as the whole first paragraph of its `situation` section (it replaces the old paragraph, whose "two months" sentence the new text restates, D13); the second paragraph, the lead, the card summary and homepage principle 01 SHALL be unchanged and keep "Cross-team" / "cross-team" (answer c). | Pinned verbatim in `portfolioData.test.js`; lead and card pins unchanged. | change request "Copy change, /work/apple-llm-triage"; answer (c) |
| R162 | The incident count SHALL read "thousands of buildings" in the Apple experience bullet (line 162) and the Data Health incident paragraph (line 851), and "Thousands" as the Data Health third stat value (line 800); the string "tens of thousands" SHALL appear nowhere in `src/` (tests excepted), `index.html`, `docs/design/og.svg` or built HTML. | `portfolioData.test.js` pins the three strings and asserts no "tens of thousands" in the module; the scanner term of R163 covers the tree and `dist`. | answer (a) |
| R163 | `scripts/forbidden-copy.mjs` `FORBIDDEN_TERMS` SHALL gain global terms: the strings "crossed team", "fully manual", "tens of thousands"; and pattern terms per ADR 0002 for sandbox, boundary, terrain, landmark word families, the "changed incorrectly" phrasing and the "high (user) impact" phrasing. Each produces one `::error::<path>:<line>: <label>` per matching line and exit 1; existing terms, matching rules, scope and exit codes are unchanged. | `src/checkForbiddenCopy.test.js`: one fixture per new term yields exactly one hit; near-miss fixtures yield none; the existing 29 cases still pass. | change request "Verification" 1 and 2; disclosure rules 1 to 3 |
| R164 | The scanner SHALL support a pattern term with `onlyPaths` (a RegExp tested against the displayed repo-relative path, interface (i)) and export `PAGE_SCOPED_TERMS` holding one such term: label "integration page cross-team wording", pattern matching "cross-team" or "cross team" on word boundaries at both ends (the leading boundary is required so "across teams" does not match), case-insensitive, with no `g` or `y` flag on this or any scanner pattern because `termsFoundIn` calls `.test` repeatedly and those flags make it stateful, `onlyPaths` matching `work/apple-integration/`. `main` SHALL scan with `FORBIDDEN_TERMS` plus `PAGE_SCOPED_TERMS`; `FORBIDDEN_TERMS` itself SHALL not contain the page-scoped term. | Fixtures: a file under `work/apple-integration/` with "cross-team" yields one hit; the same text under `work/apple-llm-triage/` and at a root `index.html` yields none; "across teams" under `work/apple-integration/` yields none; `buildMatchers(FORBIDDEN_TERMS).length` still equals `FORBIDDEN_TERMS.length`. | ADR 0001 |
| R165 | `src/data/portfolioData.test.js` SHALL pin every R160 to R162 string verbatim, assert the integration study's strings match none of `cross-team`, `crossed team`, `fully manual` (case-insensitive), and update the four existing pins of the old copy (lines 59, 111, 116, 120) to the owner's new strings. This is a test following an owner-authorized content change, not a test edited to pass. | The file's cases as named in evals G1 to G7 and G10 pass; the pre-change file fails on the four old pins and the absent new strings. | CLAUDE.md "Conventions"; D10 |
| R166 | After the change, `npm test` SHALL be green including the real-tree scan in `src/copyIsClean.test.js`, and `npm run build` followed by `node scripts/check-forbidden-copy.mjs dist` SHALL exit 0 and report at least 20 files scanned. | The two commands, run by the verifier; exit codes recorded. | R129 (2026-09-25), CI `deploy.yml` line 120 |
| R167 | The change SHALL edit only the four files in the plan, add no dependency, edit no protected or harness-guarded path, and leave `scripts/check-test-floor.mjs` untouched (its pinned counts are minimums; adding tests needs no edit, confirmed at its line 12). The scanner entry SHALL still run under 2 s on `src/` (existing case). | `git diff --stat main..HEAD` names only the four files plus `docs/sdlc/`; `package.json` unchanged; the existing timing case passes. | profile `sensitive_paths`; CLAUDE.md "Protected" |
| R168 | Both pages SHALL satisfy the three disclosure rules: no description of how edit permissions are scoped, no named protected category, no reason a feature came to be locked. Machine check: R163's patterns over the tree and `dist`. Human check: a read of both situation sections back to back (change request verification item 3) and of the Data Health incident paragraph (line 851, "inside restricted geospatial zones") with its stat label (line 800, "buildings triaged in one incident I led") against rule 2, at G2 and G4 (D14); this part cannot be automated and is listed as manual. | R163 cases; the G2 and G4 approval entries in `approvals.md`. | change request "Disclosure rules"; audit medium |

## Design

### Architecture

Nothing structural changes. Copy lives in `src/data/portfolioData.js` and is rendered by `src/components/CaseStudyPage.jsx` (case studies), `src/pages/HomePage.jsx` (experience bullet, cards, principles) and `src/pageMeta.js` (the integration page's description is `caseStudy.intro`, so it follows the new lead with no edit; confirmed line 80). `scripts/prerender.mjs` writes one HTML file per route (confirmed), which is what makes a path-scoped scanner term possible.

`scripts/forbidden-copy.mjs` (confirmed by reading the whole file): global terms are strings (letters-only ones matched on word boundaries, others as substrings, case-insensitive) or pattern objects `{ label, pattern, skipExtensions }`; `buildMatchers` turns them into matchers; `hitLinesIn` filters matchers by file extension and reports one line per hit; `resolveScope` scans `src/` minus tests, `index.html`, `docs/design/og.svg`, plus every `**/*.html` under a directory argument. The change adds:

- Global entries to `FORBIDDEN_TERMS` (R163), with a comment citing this change and ADR 0002.
- `onlyPaths` on the pattern-term shape, carried by `buildMatchers` (default `null`) and applied in `hitLinesIn` against the displayed path next to the existing extension filter.
- `export const PAGE_SCOPED_TERMS` (R164) and `main` scanning `[...FORBIDDEN_TERMS, ...PAGE_SCOPED_TERMS]`.

Exports used by tests: `FORBIDDEN_TERMS`, `PAGE_SCOPED_TERMS`, `buildMatchers`, `termsFoundIn`, `scanFiles`, the three exit codes (existing), plus named exports for the new pattern terms.

Where each replaced string sits (confirmed line numbers on `main`): integration `intro` 695 to 696, Result 701, third stat 706, situation 716, built paragraph 734, changed 756, callout 764; decision situation 606; count at 162, 800, 851. The integration homepage card summary (line 689) is not named by the change request and stays (D5).

### Data

Not applicable: no database, no storage, no schema. The only data is static copy compiled into the bundle.

### Interfaces

(i) Pattern term, extended: `{ label: string, pattern: RegExp, skipExtensions?: string[], onlyPaths?: RegExp }`. `onlyPaths` absent or `null` means every scanned file. The matcher shape `buildMatchers` returns gains `onlyPaths` accordingly. `termsFoundIn(line, matchers)` is unchanged and path-unaware; callers that need path scoping go through `scanFiles`, which is why `PAGE_SCOPED_TERMS` is a separate list (ADR 0001).

(ii) Scanner CLI, unchanged: `node scripts/check-forbidden-copy.mjs [dir]`; exit 0 clean, 1 hit (one `::error::<path>:<line>: <label>` per hit), 2 nothing scanned or directory missing.

(iii) Rendered UI, unchanged shape: the stat card renders `value` large and `label` small (D4); the situation paragraph is a `paragraph` block.

### Security and privacy

No visitor data, no auth, no database; the baseline's RLS, function-grant and CI-credential items do not apply (confirmed, `constraints.md` "Security baseline items that do not yet apply"). The control this change carries is employer confidentiality: the three disclosure rules (R168), enforced by the scanner terms of R163 in `npm test` and in CI before upload, and by the human read at G2 and G4. The data file is a sensitive path; the G2 approval is the authorization and the plan names it in the task heading. No secret, no env var, no new origin, no third-party import.

### Failure modes

- A new global term collides with legitimate copy on another page: `npm test` (real-tree scan) and the CI `dist` step go red with the path and line. Checked in advance: zero occurrences of the new terms outside the copy being replaced (grep over `src/`, `index.html`, `docs/design/og.svg`, `README.md`, confirmed); "border" and "buildings" deliberately not added (ADR 0002).
- The page-scoped term is inert in the default scope, so a regression in `src/` before a build is caught only by the R165 data test; that test is the guard's source-side half.
- `dist` absent when the scanner is given it: exit 2, existing behaviour, message names the directory.
- A pinned string differs by one character from the owner's text: the R165 test fails with a diff; the builder copies from the change request, never retypes.
- The owner's approval notes change a recommendation (D4, D5): the builder places whatever the notes give, verbatim; the pins follow.

### Observability

Not applicable at runtime (static site, no logging by design). Build-time signals: Vitest test names, and the scanner's `::error::` annotations in the GitHub Actions log.

## Alternatives considered

| Option | Why not |
|--------|---------|
| Global "cross-team" term | Bans copy the owner keeps on the decision page and homepage (answer c). ADR 0001. |
| Test-only guard, no scanner change | Leaves built HTML unguarded; the request asks for the scanner. ADR 0001. |
| Add "border", "buildings", "water", "mesh" as terms | Collide with Tailwind classes on every page and with Data Health copy. ADR 0002. |
| Paraphrase to avoid any collision with the term list | Not needed: no collision found; and the owner said "Do not paraphrase". |
| One parallel wave | The scanner task's suite is red until the copy lands. ADR 0003. |

## Decisions

Full table with recommendations in `brief.md` "Decisions" (D1 to D14; D14 is the audit's medium, the Data Health incident wording). ADRs: [0001](./adr/0001-guard-the-integration-page-wording-with-a-path-scoped-scanner-term-and-a-data-test.md) path-scoped term plus data test; [0002](./adr/0002-ban-the-disclosure-words-as-word-family-patterns-not-every-category-noun.md) disclosure word families; [0003](./adr/0003-place-the-copy-change-before-the-scanner-change-in-separate-waves.md) wave order.

## Open questions

None left open; each became a decision row in `brief.md`. Two need the owner's word only if he disagrees: D4 (how the third stat card's sentence splits into value and label) and D5 (the integration homepage card summary, which the change request does not name, stays as is unless his approval notes supply replacement text). The site will say "thousands" while his resume still says "tens of thousands" (D3); nothing here changes the resume.

## Constraint audit

Filled by the constraint auditor. Severity: high blocks G2.

Audit result: pass

Baseline and profile, no finding (confirmed): no database, auth, function, bucket, secret, env var, CI change or admin surface; no new dependency, origin, script, cookie or analytics (plan "Files" names four files, none a protected path; both ask-first paths are named per task); no compliance regime selected (profile line 150). The spec's pre-check claim holds: the disclosure words, "tens of thousands", "crossed team" and "fully manual" occur in scanned `src/` only in the copy being replaced (grep, confirmed; other hits are in `*.test.*` files, skipped by the scanner, and `scripts/`, outside its scope). The page scope works as designed: prerender writes `dist/work/apple-integration/index.html` (confirmed on the existing local `dist/`), the neighbour links on that page render only study titles, none containing "cross-team" (confirmed, `CaseStudyPage.jsx` lines 266 to 279), and the page's meta description is `intro` (confirmed, `pageMeta.js` line 80). The owner's verbatim strings in plan task 1 contain none of the three disclosure items as written and hit no existing or new scanner term (confirmed by reading each string against `FORBIDDEN_TERMS` and the ADR 0002 patterns); whether their meaning discloses anything is the owner's judgment (R168).

| Severity | Finding | Requirement affected | Resolution |
|----------|---------|----------------------|------------|
| medium | The disclosure rules cover "nothing on the public site", but R168 and the human read cover only the two Apple pages' situation sections. The Data Health incident paragraph, which this change edits (line 851), says the affected buildings were "inside restricted geospatial zones", and its stat label (line 800) reads "buildings triaged in one incident I led" (confirmed). Rule 2 bans naming buildings, or any equivalent, as a protected category. Whether this sentence does that is the owner's call (believed borderline, not decided here). The brief raises it only as a note with no decision row. Rule: change request "Disclosure rules" 2; `constraints.md` "Employer confidentiality content control". | R162, R168 | open (proposed D14) |
| low | The page-scoped term's leading word boundary matters: without it, `cross[- ]teams?` matches "across teams" (confirmed: the local `dist/` integration page matches "cross teams" inside "across teams" when the regex has no boundary). No eval covers "across teams" on the integration path. Two related gaps: no eval for Unicode hyphen variants (U+2011, `&#8209;`) or `&nbsp;` between the words, and a `g` or `y` flag on any new pattern would make `termsFoundIn`'s repeated `.test` calls stateful. Builder note: add "across teams" as an E6/A1 near-miss and use no `g`/`y` flags. Rule: security baseline "verify empirically"; testability. | R164 | open |
| low | Rule 2's named categories "borders" and "water bodies" have no machine check. ADR 0002 rejects "border" and "water" because they collide with Tailwind classes and ordinary English, but the narrower forms `\bborders\b` and `water bod(y\|ies)` occur nowhere in `src/` or the local `dist/` HTML (confirmed by grep). They are left to the human read. Note for the designer, not a redesign. Rule: change request "Disclosure rules" 2 and "Verification" 2. | R163, R168 | open |
| low | Evals E5, E6 and E7 (built-page grep and meta-description check; scope wherever the tree is rooted versus look-alike directories; "tens of thousands" casing and near-misses) are not in plan task 2's steps or "Done when", and plan and brief count 20 cases where `evals.md` has 21. E6 is the case that proves `onlyPaths` does not match `apple-integrations/`. Builder note: implement all 21. Rule: agent definition check 6, testability. | R162, R164 | open |
| low | `scripts/check-test-floor.mjs` keeps `src/checkForbiddenCopy.test.js` pinned at 29 (confirmed, line 53). The file grows to about 38 cases, so deleting or skipping the new guard cases (G9, E3, F1, A1) would leave the floor green. D11's reasoning is correct that no edit is needed to add tests, but the pin then stops protecting them. This is the false-green shape the script's own header says it exists to close. Rule: security baseline "CI must actually run the security tests" (non-zero count for the control suite). | R167 | open (D11 stands; follow-up to raise the pin at merge) |
| low | The plan places the owner's text verbatim, including "extra tickets raised just to carry the change" (hero lead and situation). That phrase sits near rule 1's example "ticket-level grants". It describes how requests travelled, not how grants are scoped, so it is believed compliant. Agents may not paraphrase it. Flagged for the owner's R168 read at G2. Rule: change request "Disclosure rules" 1. | R160, R168 | open |
| low | The owner's answers of 2026-09-29 (title kept, "Cross-team" kept on the decision page, "thousands") authorize a factual edit to `portfolioData.js`, but they are recorded only in this spec and the brief, not in `approvals.md` or `conductor-log.md` (confirmed: both hold no such entry). The G2 approval of D1 to D3 becomes the durable record. Recommend the approval notes restate the three answers. Rule: `CLAUDE.md` "Protected" (only the owner changes the facts); `constraints.md` "Things that must not change". | R160, R161, R162 | open |

## Response to audit

No high finding; no redesign. Medium (Data Health incident wording, R162, R168): now decision row D14 in `brief.md`, and R168's human read is widened to the Data Health incident paragraph and its stat label at G2 and G4. Low 1 (leading word boundary, `g`/`y` flags): R164 now requires both, and eval A1 and plan task 2 carry an "across teams" near-miss fixture on the integration path. Low 3 (E5 to E7 not in the plan; counts): already wired into plan task 2 by the eval designer; every count now reads 21 cases, 7 edge. Lows 2, 4, 5, 6 ("borders" and "water bodies" unchecked by machine; the test-floor pin at 29; "extra tickets raised just to carry the change" against rule 1; the owner's 2026-09-29 answers restated in the G2 notes): listed as notes in `brief.md`, no decision row.

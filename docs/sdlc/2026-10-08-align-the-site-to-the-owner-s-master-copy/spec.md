# Spec: Align the site to the owner's master copy

Change id: `2026-10-08-align-the-site-to-the-owner-s-master-copy`
Intent: the request in `conductor-log.md` (no intent.md was written for this change)
Status: draft
Policy skills applied: wh-agent-rules, wh-security-baseline (checklist recorded as not applicable, see Security), wh-evals, wh-adr, wh-readable-code

Source of truth for every string below: the owner's document `PORTFOLIO_FIX_MASTER.md` (373 lines, read in full), amended by his four decisions of 2026-10-07 (brief D1 to D4). Strings in quotation marks are verbatim from that document or from its Appendix A resume; the builder copies them, never paraphrases. Every claim here is `confirmed` by reading the file named unless marked `believed`.

## Summary

The live site still describes the Apple decision agent as deciding, names the vendor as "(via TCS)", calls WorkHorse a plugin and client systems messy, and lacks the owner's new hero and decision case study. This change rewrites those strings in `src/data/portfolioData.js` to the owner's document word for word, adds the two renderer features the document needs (a machine-checkable human gate on the last flow step, a section subtitle), and extends `scripts/forbidden-copy.mjs` so none of the removed wording can return. The one design decision that matters: every ban is sitewide and machine-checked in the suite and in the built HTML, so the owner's review at G2 is the only human step before publishing.

## Requirements

| ID | Requirement | Acceptance check | Source |
|----|-------------|------------------|--------|
| R1 | The home hero SHALL carry the document's h1 "I find the step everyone is waiting on." and lead "Data Engineer at Apple Maps. The platform is rarely the problem, the process around it usually is. So I start by finding where the work actually stalls, scope the fix with the people it affects, and put agents and automation on live data behind guardrails that make them safe to trust. Success is a number that moved; anything short of that is another iteration." word for word; the mobile lead SHALL be the identical string (D12); the served home page's `<meta name="description">` and `og:description` SHALL equal the lead | data test on `home.hero.heading`, `lead`, `mobileLead`; assembled home HTML head tags | doc 2, item 13, item 14 |
| R2 | "Apple (via TCS)" SHALL appear nowhere; the employer slots SHALL read "Apple Maps": `experience.roles[0].company`, the three Apple case-study eyebrows, their three card eyebrows and the "Right now" title (D5) | data test on the eight slots; scanner term `via`, `TCS` | doc 1, 3, 5 |
| R3 | No served page and no scanned source file SHALL contain any of: TCS (any form, "Tata"), "via", "contractor", "vendor", "consultancy", "plugin", "messy", "approve, reject or hold", "decision layer", "act(s) on live data", "decision system(s)", "tickets decided", "decides each ticket", "self-hosted", "Ollama", "eleven times", "0 rejected" or "zero rejected"; the already banned "Private repository", "sub-10ms", "simulator", "99.9", "unauthorized", "Enterprise Compliant", "Zero Data Corruption", "fully manual", "restricted geospatial", the four disclosure words, both dashes and "cross-team" on the integration page SHALL stay banned | scanner exits 0 on `src/`, `index.html`, `docs/design/og.svg` and on `dist/`; route test over every rendered page | doc 1, 9 items 1, 2, 15 |
| R4 | The decision case study (`apple-llm-triage`) SHALL carry the document's section 4a copy exactly: title "A review backlog, turned into an analysis the reviewer can trust"; intro, at-a-glance (Stack "Python, open-source LLM, REST APIs", Status "In production, human in the loop by design"), stats (first label stays "tickets a day, more than tenfold the manual rate", D4), situation, "What I built", "Why a person still decides", "Working with the teams" unchanged, "What changed", callout; the card SHALL carry the same title and the intro as its summary; the disclaimer and contact heading SHALL be unchanged | data test pins every string listed under Data below | doc 4a, D4 |
| R5 | The decision page's flow SHALL have six steps in the document's order, the sixth "Reviewer decides" SHALL be the only gate, and a gate step SHALL render dark (`bg-ink`) with a `data-gate="true"` attribute a test and a grep can find | renderer test with stubs; route test counting `data-gate` on the decision page | doc 4a, item 5 |
| R6 | The integration page's situation SHALL gain the second paragraph "The judgment behind these requests is covered in the previous case study. This one is about what happens after the decision is made."; every other integration string SHALL stay as live (already matches 4b, confirmed) | data test | doc 4b |
| R7 | The decision page's sentence "The decision this produces is carried out by a separate tool I built, covered in the next case study." and the integration sentence in R6 SHALL each occur exactly once sitewide, in the rendered HTML of their own route and nowhere else | route test over `sitePagePaths()` | doc item 6 |
| R8 | Every other string that describes the agent as deciding SHALL be replaced with the resume's or document's words (D10): home stat 1, "Right now" At Apple text, principle 01, Apple bullet 1 (resume verbatim), toolkit AI column (resume verbatim), `docs/design/og.svg` label and aria-label | data test; og.svg grep | doc 1, 3, Appendix A |
| R9 | The WorkHorse study SHALL say "plugin" nowhere (three substitutions, D6), SHALL render the subtitle "Cited retrieval (RAG) over WorkHorse's engineering record" under the Studbook section heading (D7), and SHALL keep the MCP section, the Paddock paragraph and the run record unchanged (D2, D3) | data test; renderer test for the subtitle | doc 1, 5, D2, D3 |
| R10 | The Data Health incident paragraph SHALL end "on each group."; "tens of thousands" SHALL stay in all three places | data test (extends the existing R162/R169 pins) | doc 4d |
| R11 | The Neural flow note SHALL read "Live status over WebSockets" so "via" can be banned without exception (D9) | data test | D9 |
| R12 | `scripts/forbidden-copy.mjs` SHALL gain the R3 terms, each with a one-line reason and one fixture test; `via` SHALL be word-bounded (no hit on "service", "deviate", "trivial", "viable"); "consultancy" SHALL not hit "Software Consultant"; the decision-authority terms SHALL not hit "Reviewer decides", "a person decides", "decided documents", "Validation decides what gets promoted", "delete, correct or retain decision" | scanner unit tests; real-tree scan | request |
| R13 | The decision page SHALL carry the throughput explanation "It came from removing the investigation in front of it." and SHALL contain no percentage, no "accura" and no sentence giving the agent authority (`/\b(agent|system|model) (decides|approves|rejects|unlocks|applies|acts)\b/i` absent) | route test | doc 4a, items 3, 4, disclosure 6 |
| R14 | Non-functional: `npm run lint`, `npm test`, `npm run build` and `npm audit --omit=dev --audit-level=high` SHALL exit 0; the test-floor pins SHALL hold (`src/checkForbiddenCopy.test.js` passed count stays at or above 29); the real-tree scan SHALL finish under 2 seconds | profile commands; `node scripts/check-test-floor.mjs` | profile |
| R15 | The owner SHALL review before anything is published: G2 approves this packet, G4 the ship document; no agent pushes to `main` | process; `approvals.md` | request |

Nothing here is checkable only by hand except the document's item 7 (a back-to-back human read of the two situation sections), the clipping half of item 13 and item 16 (the shipper's side-by-side list); see the report.

## Design

### Architecture

No new component. The change sits in the existing content-to-render path: `src/data/portfolioData.js` (all copy) feeds `src/pages/HomePage.jsx` and `src/components/CaseStudyPage.jsx`, which `scripts/prerender.mjs` renders through `src/entry-server.jsx` into one HTML file per route, with head tags from `src/pageMeta.js` (confirmed by reading each). Two small renderer edits:

- `src/components/CaseStudyFlowDiagram.jsx`: a gate step gets `data-gate="true"` and the note span is omitted when a step has no note (the six decision steps are titles only, D11). ADR 0003.
- `src/components/CaseStudyPage.jsx` `CaseStudySection`: renders an optional `section.subtitle` paragraph between the h2 and the blocks. ADR 0002.

`src/pageMeta.js` is not edited: `homeMeta` reads `home.hero.lead` and `caseStudyMeta` reads `caseStudy.intro` (confirmed, lines 59 to 84), so the new descriptions follow the data. `index.html` is not edited: `assemblePage` in `scripts/route-pages.mjs` strips the shell's `<title>` and description before inserting the page's own (confirmed, lines 45 to 49), and no `<noscript>` exists anywhere (confirmed, grep). D14.

### Data

Not applicable as a schema: no database. The content contract the builder copies into `src/data/portfolioData.js` (every string verbatim from the document unless a decision row says it is assembled):

**Hero** (`home.hero`): `heading` and `lead` per R1; `mobileLead` identical to `lead`. `rightNow.items[0]`: title "At Apple Maps", text "Running a decision support agent and data health tooling for a pipeline spanning 50+ regions" (D10). `rightNow.items[1].text`: "An agentic software delivery pipeline with its own retrieval system. This site was built with it." (D6).

**Home stats item 1**: label "Tickets a day", context "Decision support agent I built at Apple", mobileText "tickets a day, decision support agent at Apple" (D10). **Principle 01 text**: "At Apple, a review queue was blocking cross-team data changes. I built an agent that does the investigation and hands the reviewer a documented recommendation, and the backlog hasn't come back." (D10). **Experience role 0**: company "Apple Maps"; highlight 0 is the resume bullet verbatim: "Identified a review bottleneck blocking cross-team data changes, then deployed an agent that evaluates each unlock request against the surrounding geospatial data and internal spec, flags cascading effects, and returns a documented recommendation a reviewer approves or overrides. Two-month backlog cleared in two weeks; 30 to 350+ tickets a day." **Toolkit AI column** (D16): "Agent orchestration, MCP servers, RAG, hybrid retrieval and reranking, evals, guardrails, prompt injection, human-in-the-loop".

**WorkHorse** (D6, D7): at-a-glance "What it is" = "An agentic software delivery pipeline, a desktop app (Paddock) and a retrieval system (Studbook), with an MCP server for agents"; "Quality" = "224 pipeline tests, 278 desktop tests, CI on every push"; the `measured` closing paragraph ends "and nine releases came out of those four runs."; the `studbook` section gains `subtitle: "Cited retrieval (RAG) over WorkHorse's engineering record"`. Everything else in the study is unchanged, including all seven MCP paragraphs, the Paddock paragraph and link, and the run record (owner D2, D3).

**Decision study** (`apple-llm-triage`), in full:
- card: eyebrow "Apple Maps · Decision support agent" (D10), title as R4, summary = the intro below, tags unchanged.
- eyebrow "Case study · Apple Maps · Data Health team · Feb 2025 to present"; title as R4.
- intro: "Cross-team data changes were stuck behind a manual review queue, because each request needed real investigation before anyone could approve it. I built an agent that does that investigation and hands the reviewer a documented recommendation. The person still makes the call."
- atAGlance: "My role" unchanged; "Live since" "November 2025" unchanged; "Stack" "Python, open-source LLM, REST APIs"; "Status" "In production, human in the loop by design".
- stats unchanged: "30 to 350+" / "tickets a day, more than tenfold the manual rate" (D4); "2 weeks" / "to clear two months of accumulated tickets"; "Zero" / "backlog since launch".
- `situation` "The situation": "Changes to certain map data needed a person to review the request before work could continue, and the review was not a rubber stamp. Someone had to pull the surrounding data, check the proposed edit against internal specification, and work out what else the change would affect. The queue grew faster than people could do that. About two months of tickets had piled up, and teams across the pipeline were waiting on them." then "Building a fix was not part of my assigned role. I took it on anyway."
- `built` "What I built": flow `columns: 6`, steps (titles only, D11): "Unlock request", "Geospatial snapshot, the target feature and its neighbors", "Check against internal specification", "Impact and cascade analysis", "Documented recommendation", "Reviewer decides" with `gate: true`. Then three paragraphs: "An agent reads each unlock request, pulls a snapshot of the feature to be edited along with the features around it, checks the proposed edit against internal specification, and works through what else the change would touch, including effects that would only show up downstream. It returns a recommendation, unlock or keep locked, with the reasoning and the evidence behind it." / "It does not act on that recommendation. A reviewer reads the analysis and makes the decision, which is the point: the hard part of this review was never the decision, it was the work required before anyone could make one." / "I selected an open-source model, built the agent around it, and own it end to end. Launch was not the end of the work. I keep tuning the analysis and the system's scope against how it performs on live requests."
- `why-a-person-decides` "Why a person still decides" (D17): "The agent has no authority to change anything. It produces an assessment, and every recommendation carries the reasoning and the evidence that produced it, so a reviewer can disagree with it on the merits rather than taking it on faith." / "That boundary is deliberate rather than cautious. These requests carry consequences that are not always visible at the point of the edit, and a system that cannot be questioned is not one a reviewer should be asked to trust."
- `people` "Working with the teams": unchanged.
- `changed` "What changed": "Since going live in November 2025, two months of backlog cleared in two weeks and the queue has stayed at zero. Throughput went from about 30 requests a day to over 350." / "The gain did not come from removing the decision, which a person still makes on every request. It came from removing the investigation in front of it. A reviewer now opens a finished assessment instead of assembling one." / "The decision this produces is carried out by a separate tool I built, covered in the next case study."
- callout text: "Find the review step everyone waits on, then separate the investigation from the judgment. Most review bottlenecks are not slow because the decision is hard, they are slow because the work required to make the decision has to be redone by hand every time. Automate that work, leave the judgment with the person accountable for it, and give them the evidence to disagree."
- disclaimer and contactHeading unchanged.

Note on "boundary": the document's second "Why a person still decides" paragraph begins "That boundary is deliberate", and `BOUNDARY_TERM` (`/\bboundar(?:y|ies)\b/i`, confirmed `scripts/forbidden-copy.mjs` line 96) bans that word sitewide as a disclosure term. The owner's own sentence would fail the scanner. Resolution D18: the builder writes "That line is deliberate rather than cautious." and the brief flags the one-word substitution for the owner.

**Integration study**: card eyebrow "Apple Maps · Systems integration"; eyebrow "Case study · Apple Maps · Systems integration · Feb 2025 to present"; `situation` gains the R6 paragraph as its second block. Nothing else changes (title, intro, at-a-glance, stats, diagram, "built", "hard", "changed", callout, disclaimer and contact heading already match 4b, confirmed line by line).

**Data Health**: card eyebrow "Apple Maps · Data reliability"; eyebrow "Case study · Apple Maps · Data reliability · Feb 2025 to present"; incident paragraph ends "drove a delete, correct or retain decision on each group."

**Neural**: flow step 5 note "Live status over WebSockets".

**Share image** `docs/design/og.svg`: `aria-label` "Muhammad Muhibullah, Forward Deployed Engineer. 30 to 350 plus tickets a day." and the stat label "Tickets a day". `public/og.png` is re-rendered by the main session, never by a builder (D13, `docs/hosted-config.md` "Regenerating og.png").

**Source comments** (D8): `src/main.jsx` line 4 and `src/index.css` line 3 say "Self-hosted"; they become "Bundled typefaces" and "Bundled families" so the sitewide `self-hosted` ban has no exception.

### Interfaces

- Flow step: `{ title, note?, gate?, dashed? }`; a gate renders `<li data-gate="true" class="... bg-ink ...">`; a step without `note` renders no note span.
- Section: `{ id, heading, eyebrow?, subtitle?, blocks }`; `subtitle` renders as a `<p>` after the h2.
- Scanner: `FORBIDDEN_TERMS` gains string terms `TCS`, `Tata`, `via`, `messy`, `approve, reject or hold`, `decision layer`, `tickets decided`, `decides each ticket`, `self-hosted`, `Ollama`, `eleven times`, and pattern terms `CONTRACTOR_TERM` `/\bcontractors?\b/i`, `VENDOR_TERM` `/\bvendors?\b/i`, `CONSULTANCY_TERM` `/\bconsultanc(?:y|ies)\b/i`, `PLUGIN_TERM` `/\bplugins?\b/i`, `ACT_ON_LIVE_DATA_TERM` `/\bacts? on live data\b/i`, `DECISION_SYSTEM_TERM` `/\bdecision systems?\b/i`, `ZERO_REJECTED_TERM` `/(?<!\d)0 rejected\b|\bzero rejected\b/i`. Letters-only strings already match on word boundaries (`buildPattern`, confirmed line 293). Exit codes unchanged: 1 hit, 2 nothing scanned, 0 clean. "Private repository" is already a term (confirmed line 161).

### Security and privacy

No data, auth, storage, server or third party is touched; the wh-security-baseline checklist items (policies, functions, buckets, free text, admin log, secrets, runtime imports) are each not applicable, recorded here so the auditor need not search. Two controls do apply: the disclosure rules of document section 1 (checked by the existing disclosure terms plus the route test in R13), and the employer confidentiality control in `docs/sdlc/constraints.md`, satisfied by the owner's own document authorizing every string and by G2 approval of this packet. The only personal data is the owner's, unchanged. The removed strings stay in git history and in the `docs/sdlc` record of earlier changes, as accepted in change 2026-09-29 (D18 there).

### Failure modes

- A builder paraphrases: the data tests pin every string, so the suite is red. A builder re-introduces a banned word anywhere in `src/`: `src/copyIsClean.test.js` (real-tree scan) and the CI dist scan are red, naming file, line and term.
- The prerender throws on the new data (an unknown block type or a paragraph link that no longer occurs once): `npm run build` exits 1 with `::error::Prerender failed`, nothing is written (confirmed, `scripts/prerender.mjs` lines 51 to 68). No new block type or link is introduced, so this is guarded, not expected.
- `public/og.png` is not re-rendered: the share image keeps "Tickets decided a day" after the text changes. No test can see inside the PNG; the brief makes the re-render a named human step before merge, and the ship document records the commit that touched `public/og.png`.
- The scanner's new terms hit a legitimate word: the only two legitimate uses found by grep ("via WebSockets", the two "Self-hosted" comments) are reworded in this change; the unit tests prove the listed near-misses stay silent.

### Observability

Not applicable at runtime: a static site with no logging. The evidence is the suite's JSON report (fed to `scripts/check-test-floor.mjs`), the scanner's `files scanned` line, and the prerender's `Prerendered 8 pages` line in CI.

## Alternatives considered

| Option | Why not |
|--------|---------|
| Scope the new scanner terms to `src/data/` and built pages only, leaving source comments alone | Two more scope rules to explain, and a comment is where a banned claim quietly survives; rewording two comments is cheaper (ADR 0001) |
| Replace the Studbook section eyebrow with the subtitle | The eyebrow renders uppercase mono at 12px; a sentence there is unreadable, and "Inside WorkHorse" would be lost (ADR 0002) |
| Assert the gate by its `bg-ink` class instead of a data attribute | A styling class is not a contract; a palette change would silently break the document's item 5 check (ADR 0003) |
| Let the renderer split step 2's title at its comma into title and note | Edits the document's string; the owner said do not paraphrase (D11) |

## Decisions

- [0001: Ban the vendor, plugin and decision-authority wording sitewide and reword two source comments](./adr/0001-ban-the-new-wording-sitewide-and-reword-two-source-comments.md)
- [0002: Render the Studbook subtitle as an optional section field under the heading](./adr/0002-render-the-studbook-subtitle-as-an-optional-section-field.md)
- [0003: Mark human-gate flow steps with a data attribute](./adr/0003-mark-human-gate-flow-steps-with-a-data-attribute.md)
- Wave order (copy before scanner) reuses change 2026-09-29 ADR 0003; no new record.

## Open questions

None left open; every question is a decision row in `brief.md` with a recommendation, and D1 to D4 are the owner's own.

## Constraint audit

Filled by the constraint auditor. Severity: high blocks G2.

Audited 2026-10-08 against `CLAUDE.md`, `.workhorse/profile.yml` (regimes `[]`, special categories `[]`) and `docs/sdlc/constraints.md`. Security baseline: not applicable as the spec states, confirmed: no new dependency, no new third-party origin, `index.html` and `src/pageMeta.js` not edited, no data, auth, storage or secret. Compliance: no regime selected; the employer confidentiality control is met by the owner's document plus G2 approval of the quoted strings. Privacy: no visitor data, no special category by field or inference, no new subprocessor. Spec mitigations checked against code, all confirmed: `pageMeta.js` lines 62 and 80 read `home.hero.lead` and `caseStudy.intro` for description, `og:description` and `twitter:description`; `route-pages.mjs` lines 45 to 49 strip the shell's title and description; `index.html` has no `og:`, `twitter:` or `noscript`; scanner default scope is `src/` minus `*.test.*`, plus `index.html` and `docs/design/og.svg` (`forbidden-copy.mjs` lines 304 to 316); a grep of that scope for every new term finds only the copy this change removes plus "via WebSockets" and the two "Self-hosted" comments; `BOUNDARY_TERM` is line 96; the `checkForbiddenCopy` floor is 29 (`check-test-floor.mjs` line 53). D1 to D4 are the owner's and were not audited.

Audit result: pass

| Severity | Finding | Requirement affected | Resolution |
|----------|---------|----------------------|------------|
| medium | Four eval cases in `evals.md` are assigned to no plan task: E28 (og.svg aria-label and stat label), E29 (Neural "over WebSockets" note), E30 (Studbook subtitle served once on the WorkHorse route) and E31 (exactly one `data-gate` across all routes). Task 1 names only E1 to E9 and E17, Task 3 only E12 to E16, and the plan's verification plan says every case is "named in exactly one task". As planned, R11's only acceptance check (the data test) and R8's og.svg check have no builder, and R9 and R5 lose their route-level proof. Rule: wh-agent-rules testability (every requirement's acceptance check could be a test and is assigned); constraint auditor check 6. | R5, R8, R9, R11 | open (proposed D19) |
| low | `src/data/portfolioData.js` and `scripts/forbidden-copy.mjs` are profile `sensitive_paths` (ask) and `CLAUDE.md` "Ask first". The plan treats G2 approval as the ask, but the protect-paths hook still prompts at edit time, so the Task 1 and Task 4 builders will stop for a human in their worktrees. Rule: profile `sensitive_paths`; CLAUDE.md Protected. | R2, R3, R12 (plan Tasks 1 and 4) | open (conductor: expect two prompts or run those tasks attended) |
| low | Two employer-derived strings are assembled by the plan but not itemized in D10: stat 1 `mobileText` "tickets a day, decision support agent at Apple" and the og.svg `aria-label` "Muhammad Muhibullah, Forward Deployed Engineer. 30 to 350 plus tickets a day." Both are quoted in this spec, so G2 approval covers them, but the owner reads the brief, not the spec. Carry both into the shipper's side-by-side claims list (document item 16). Rule: constraints.md "Employer confidentiality content control"; CLAUDE.md "Do not rewrite the factual claims". | R8 | open |
| low | Eval counts disagree between documents: the brief and plan say 17 golden and 7 edge; `evals.md` holds 20 golden (E1 to E17, E28 to E30) and 8 edge (E18 to E24, E31). Prose mismatch only; a Ship-document note, not a red. Rule: wh-agent-rules "SDLC prose is not a verification target". | R14 (brief "How it will be proved", plan "Verification plan") | open |

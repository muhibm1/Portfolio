# Align the site to the owner's master copy

Change id: `2026-10-08-align-the-site-to-the-owner-s-master-copy` · Prepared 2026-10-08 UTC
Risk tier: 2 (`scripts/forbidden-copy.mjs` is in the edit list and the profile floors it at tier 2; the rest is public copy on a static site with no data or auth surface)
For the agents: [spec.md](./spec.md), [plan.md](./plan.md), [evals.md](./evals.md), [adr/](./adr/)

This is the Design document. A person reads it in under five minutes, technical or not. Plain
sentences; name things by what they do; no code.

## The short version

You asked for the site to say what your master document says: the new hero, "Apple Maps" with no vendor anywhere, the decision case study rewritten as an agent that recommends while a person decides, no "plugin", no "messy", and every banned string machine-checked. This change rewrites those strings word for word from your document, adds the dark human gate and the Studbook subtitle the document calls for, extends the copy scanner so none of the removed wording can come back, and proves all of it on every served page. The one thing worth knowing: your four decisions of 2026-10-07 override the document, and this brief lists every place the plan departs from the document so you review here, not there.

## Problem

In your words: the live portfolio still says the Apple decision system "decides approve, reject or hold" when it only recommends and a person decides, names the vendor "(via TCS)", calls WorkHorse a plugin, calls client systems "messy" in the hero, and lacks your new hero and several case-study corrections.

Precisely: 33 lines of the content module and the share-image source carry wording your document removes (confirmed by searching the source for every term). The decision page's title, lead, flow and three sections describe a system with authority it does not have, and the throughput claim is unexplained under the corrected description. The two Apple case studies do not yet point at each other.

## Outcome

- The home page opens with "I find the step everyone is waiting on." and the lead beginning "Data Engineer at Apple Maps." and that lead is also what link previews and search results show.
- "Apple (via TCS)" appears nowhere; every employer slot reads "Apple Maps".
- The decision case study carries your section 4a copy in full: new title, lead, six-step flow ending in a dark "Reviewer decides" box, "Why a person still decides", the throughput explained as removing the investigation, and the sentence pointing to the integration study; the integration study carries its one sentence pointing back.
- "plugin", "messy", "self-hosted", "Ollama", every TCS form and every decision-authority phrase are banned sitewide, checked in the test suite and on the built pages before any publish.
- The Data Health incident reads "on each group"; "tens of thousands" stays everywhere; WorkHorse's MCP section, Paddock and run record stay as they are.
- Nothing is published until you approve this packet and, later, the ship document.

## What changes for people

A recruiter sees the new hero, a decision case study that reads as decision support, and "Apple Maps" everywhere Apple is named. Link previews change their description to the new lead; the share image's small label changes from "Tickets decided a day" to "Tickets a day" once you re-render it (D13). Nothing moves, no page is added or removed, no link changes. For you as the engineer: two more fields exist in the content shape (a gate marker on flow steps, an optional section subtitle), and the scanner refuses eighteen more strings, so a future edit that writes "via" or "plugin" anywhere under the source tree fails the test suite with the file and line named.

## What could go wrong, and the guard for each

| Risk | Guard |
|------|-------|
| A builder rewords one of your sentences | Every string is quoted in the spec; a test pins each one in the data and on the served page |
| A removed claim comes back later | The scanner bans it on the source tree and on the built HTML; CI fails before publish |
| The share image still says "decided" after the text changes | No test can read inside the PNG; D13 makes the re-render your step before merge, recorded in the ship document |
| Your own sentence "That boundary is deliberate" trips the existing disclosure ban on "boundary" | D18: one word changes to "line", or you lift the ban for that sentence |
| A string this plan assembled from your phrases is not one you would write | D6 and D10 list each one; reject with the wording you prefer and only that string changes |

## Decisions

Every question the design raised, each with the recommended answer already chosen. Approving this document accepts every recommendation; say otherwise in the approval notes to change one. D1 to D4 are decided by owner, not a recommendation.

| # | Decision | Recommendation | Alternative | Why the recommendation |
|---|----------|----------------|-------------|------------------------|
| D1 | Resume on the site | Decided by owner, not a recommendation: none. Document section 7 is skipped; no Resume link, no PDF; the header GitHub link stays in the nav as built | Follow section 7 | Your 2026-09-28 decision stands |
| D2 | Paddock | Decided by owner, not a recommendation: Paddock stays a current part of WorkHorse; the live paragraph and its link stay; the document's retirement rows are ignored; retirement is never mentioned | Follow the document's "retired" rows | Your 2026-09-28 decision stands; the scanner already bans Paddock retirement wording |
| D3 | Timings of your own tools | Decided by owner, not a recommendation: the MCP section stays as live, with no 5.8s, 3.2s, 8 ms, 45% or any time figure; the scanner's timing pattern stays | Add the document's figures | Your 2026-09-28 decision stands |
| D4 | Throughput wording | Decided by owner, not a recommendation: "more than tenfold", not "more than eleven times"; "eleven times" is added to the scanner | Document wording | Matches the resume and the live site |
| D5 | Where "Apple Maps" replaces "Apple" | Every slot that names the employer: the experience company, the three Apple study eyebrows, their three cards, and the "At Apple" card title. Prose that says "at Apple" (principle 01, the stat context) stays, as your resume summary does | "Apple Maps" in every mention | The document fixes the employer string, not every sentence; the resume itself says "at Apple" in prose |
| D6 | The three "plugin" strings and the "Right now" line | "An agentic software delivery pipeline, a desktop app (Paddock) and a retrieval system (Studbook), with an MCP server for agents"; "224 pipeline tests, 278 desktop tests, CI on every push"; "nine releases came out of those four runs"; "An agentic software delivery pipeline with its own retrieval system" | Keep "Claude Code" in the at-a-glance row ("built on Claude Code" is body-copy only per your rule, so it is left out) | The smallest substitution using your approved term |
| D7 | Where the Studbook subtitle goes | A new optional subtitle line rendered under the Studbook heading | Replace the "Inside WorkHorse" eyebrow with it | The eyebrow is tiny uppercase; a sentence there is unreadable (ADR 0002) |
| D8 | "self-hosted" in two source comments | Ban the term sitewide and reword the two typeface comments to "Bundled" | Carve exceptions into the scanner | One rule with no exceptions (ADR 0001) |
| D9 | "via" in "Live status via WebSockets" | Change it to "over WebSockets" and ban "via" as a whole word sitewide | Ban only "via TCS" | Your rule bans "via" in any form; "over" is already the stat card's word |
| D10 | Strings the document gives no replacement for | Assembled only from your document's and resume's phrases, listed in the spec: card eyebrow "Apple Maps · Decision support agent"; stat "Tickets a day" / "Decision support agent I built at Apple"; "Running a decision support agent and data health tooling for a pipeline spanning 50+ regions"; principle 01 "At Apple, a review queue was blocking cross-team data changes. I built an agent that does the investigation and hands the reviewer a documented recommendation, and the backlog hasn't come back."; share image "Tickets a day" | Supply your own wording in the approval notes | Nothing invented; every phrase traces to a sentence you wrote |
| D11 | The six flow boxes | Each box shows the document's step as its title, with no sub-note; the second ("Geospatial snapshot, the target feature and its neighbors") wraps | Split the second at its comma into title and note | You said do not paraphrase; splitting edits the string |
| D12 | The mobile hero lead | Identical to the desktop lead | A shorter mobile cut | The document forbids paraphrase |
| D13 | The share image `public/og.png` | Needs you: after approval, the main session re-renders the PNG from the changed SVG per `docs/hosted-config.md`; builders never write it; the ship document records the commit | Leave the old image | The old image would still say "decided" |
| D14 | `index.html` and `src/pageMeta.js` | Not edited: page descriptions are derived from the data, and the shell's description is stripped at build time (confirmed) | Edit them too | Nothing to change; keeps two ask-first paths untouched |
| D15 | Extra scanner terms absent today | Add "eleven times", "0 rejected" and "zero rejected" now | Add only what is live | Locks D4 and your item 1 list for the future |
| D16 | The toolkit AI column | The resume's AI & Agents line verbatim: "Agent orchestration, MCP servers, RAG, hybrid retrieval and reranking, evals, guardrails, prompt injection, human-in-the-loop" | Edit "LLM decision systems" out and keep the rest | Same words as the resume (goal 1 of your document) |
| D17 | Anchor id for "Why a person still decides" | `why-a-person-decides` | Keep the old `safe` id | Names what it is; the old id described the removed heading |
| D18 | "That boundary is deliberate rather than cautious." | Write "That line is deliberate rather than cautious."; the rest of the sentence is unchanged | Keep "boundary" and add an exact-phrase exception to the disclosure ban | The sitewide ban on "boundary" (your disclosure item 2) would otherwise fail the build on your own sentence |
| D19 | Four proof cases nobody was assigned to write (audit finding, medium, resolved) | Taken and already in the plan: the share-image labels (E28) and the Neural "over WebSockets" note (E29) go to Task 1; the Studbook subtitle served on the WorkHorse route (E30) and the single human gate across all pages (E31) go to Task 3 | Drop the four cases | Each proves a requirement nothing else checks; dropping them would leave the share image and the subtitle unproved |

Ask-first paths this change edits, so that approving here is the ask: `src/data/portfolioData.js` and `scripts/forbidden-copy.mjs`. Not edited: `index.html`, `src/pageMeta.js`, `scripts/prerender.mjs`, `package.json`, any workflow. One practical note: the ask-first hook still prompts at edit time for those two files whatever this approval says, so the builders on Task 1 (content and share image) and Task 4 (scanner) may each need someone at the keyboard to allow the edit once.

## How it will be proved

The profile's checks: lint, the full test suite, the build, and the dependency audit, all at the merged head, plus the scanner over the built pages and the test-floor check. The eval cases in `evals.md`, as written, 35 in all: 20 golden (every changed string pinned in the data and on the served pages, the six-step gate, the two cross-references once each, the throughput explanation, no authority or accuracy wording, and the four cases D19 assigned: the share-image labels E28, the Neural "over WebSockets" note E29, the Studbook subtitle served once on the WorkHorse page E30), 8 edge (each new ban fires on every form and stays silent on "service", "deviate", "Software Consultant", "Reviewer decides", "a person decides" and the like; the real tree and the built site scan clean; exactly one human gate across all pages, E31), 2 failure (a returned vendor string is named by file and line; the test floor holds), 1 adversarial (case and spacing tricks still hit), 4 non-functional (suite, scan time, build, lint and audit). Carried to the ship document for you by hand: reading the two situation sections back to back (your item 7), the hero at three widths (item 13), the repository links in a signed-out browser (item 8), and the shipper's side-by-side claims list (item 16), which also carries the two strings assembled from your phrases that D10 does not itemize: the stat's small-screen text "tickets a day, decision support agent at Apple" and the share image's spoken label ending "30 to 350 plus tickets a day." Done means: every case green, the built pages contain none of your banned strings, and you have read this brief and the ship document.

## Estimate

Waves: 2. Tasks: 4. Agent-time budget at tier 2: 90 minutes.

## Your decision

Approve to build it exactly this way, or reject with notes to have it redesigned. If you reject only a wording (D6, D10, D18), paste the sentence you want and only that string and its test change.

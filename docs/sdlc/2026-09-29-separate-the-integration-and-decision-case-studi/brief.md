# Separate the integration and decision case studies and revise the Data Health incident paragraph

Change id: `2026-09-29-separate-the-integration-and-decision-case-studi` · Prepared 2026-09-29 07:43 UTC (revised after the G2 rejection of 07:35 UTC)
Risk tier: 2 (the copy scanner, `scripts/forbidden-copy.mjs`, is edited; it is on your profile's tier-2 floor because it is what keeps removed claims out of the served pages)
For the agents: [spec.md](./spec.md), [plan.md](./plan.md), [evals.md](./evals.md), [adr/](./adr/)

This is the Design document. A person reads it in under five minutes, technical or not. Plain
sentences; name things by what they do; no code.

## Response to rejection

Your notes of 2026-09-29 (07:35 UTC), each quoted, and what changed:

1. "D3 and D8 reversed: the incident count stays 'tens of thousands' in all three places ... drop the scanner guard that refuses 'tens of thousands'; the four test pins keep the current count." Done. No count is edited anywhere; the scanner does not refuse it; the existing test that pins "Tens of thousands" is left untouched (so only three pins change, all of them the old integration wording). The earlier "site will say less than the resume" note is gone.
2. "D14 overridden: cut 'inside restricted geospatial zones'. The Data Health 'When it breaks at scale' paragraph becomes exactly: 'A mass building-generation incident put tens of thousands of buildings into the data. I scoped the blast radius with SQL and QGIS and drove a delete, correct or retain decision on each one.'" Done: that paragraph, character for character, is the new requirement R169, placed in the copy task and pinned by a test that also proves "restricted geospatial" appears nowhere in the copy. The stat label "buildings triaged in one incident I led" is unchanged. Whether the scanner should also refuse "restricted geospatial" is the new decision D15 below, recommended yes.
3. "D5: the integration homepage card summary becomes exactly: 'Locking and unlocking permissions on protected map features ran on long command-line scripts. I replaced it with one tool that does it on demand and records why each change was made.'" Done: new requirement R170, placed in the copy task and pinned by a test.
4. "The flagged phrase stays: keep 'extra tickets raised just to carry the change' (it does not describe how permissions are scoped)." Recorded as your answer; the phrase is no longer flagged.
5. "D1 keep the integration title ... D2 keep 'Cross-team' on the decision page lead, its homepage card and homepage principle 01; everything else in the packet as recommended." Unchanged from the previous packet.

## The short version

You asked for the integration page and the decision page to tell two different stories, using your exact words. This change places your words on the two pages and the integration card, replaces the Data Health incident paragraph with your new sentence, keeps "tens of thousands" everywhere, and teaches the copy scanner to refuse the old integration wording, "restricted geospatial" and the disclosure words from now on, with "cross-team" refused on the integration page only. Nothing is published until you approve here (G2), approve the Ship packet (G4) and merge yourself.

## Problem

In your words: the two case studies "open with near-identical framing, so a reader thinks they solve the same problem"; the integration page "describes the old process incorrectly" and "omits the most valuable thing about the tool", the reason comment on every lock and unlock; and the Data Health paragraph "publishes that a generation error put buildings into restricted geography, a more sensitive fact than the lock rules protect".

Precisely: on `main` today the integration page says editing map features "crossed team boundaries" and was "fully manual", its Result cell and third stat card say "cross-team", its homepage card says permissions were relocked "by hand across teams", and nothing on the page mentions the comment trail. The decision page's situation opens on a review queue without saying that judgment was the bottleneck. The Data Health incident paragraph says the buildings were "inside restricted geospatial zones".

## Outcome

- `/work/apple-integration` carries your hero lead, Result cell, third stat card, situation, "What I built", "What changed" and the appended "What I'd bring to a client" sentence, word for word. The title, diagram, "hard part was trust" section, disclaimer, links and contact band are unchanged.
- The integration card on the home page and the `/work` index carries your new summary, word for word.
- `/work/apple-llm-triage` carries your new situation opening as its first paragraph. Its lead, homepage card and the homepage principle keep "Cross-team", as you answered.
- `/work/apple-data-health` "When it breaks at scale" carries your new paragraph, word for word; its stat card still reads "Tens of thousands" with the label "buildings triaged in one incident I led"; the homepage experience bullet still says "tens of thousands of buildings".
- The scanner that already runs in tests and before every publish refuses "crossed team", "fully manual", "restricted geospatial", the disclosure words (sandbox, boundary, terrain, landmark, with their plural and verb forms), "changed incorrectly" phrasings and "high (user) impact" phrasings anywhere, and "cross-team" on the built integration page. It does not refuse "tens of thousands".
- Tests pin every new string and the kept count, so a later edit that drifts from your words fails the suite.

## What changes for people

Recruiters reading the two pages see one usability story ("none of it required judgment, only care") and one judgment story ("that judgment was the bottleneck"), and the Data Health page now says what you did about the incident without saying where the buildings landed. You, as the only engineer, gain three guards in the scanner and a rule to remember: a legitimate future use of "boundary", "landmark" or "restricted geospatial" on any page needs a term-list edit, which the profile makes an ask-first, tier-2 change. Search engines and link previews pick up the integration page's new description automatically, since it is built from the hero lead.

Notes from the constraint audit, none needing a decision:

- "borders" and "water bodies", two categories named in disclosure rule 2, get no machine check (they collide with styling class names and ordinary English, D7); neither phrase appears anywhere on the site today, and they stay with your read.
- The test-floor check keeps the scanner's test file pinned at 29 cases while this change grows it to about 38, so a later deletion of the new guard tests would not fail the floor. The pin is not raised here (D11); raising it is a follow-up to record at merge.
- The phrase "extra tickets raised just to carry the change", your own words in the integration lead and situation, stays. Your answer: it does not describe how permissions are scoped. Agents do not paraphrase it.
- Your G2 rejection notes are now the durable record of every fact edit in this change; the previous request to restate the earlier answers is met.

## What could go wrong, and the guard for each

| Risk | Guard |
|------|-------|
| A string on the page differs from your text by a character | The plan quotes each string verbatim, including the two from your notes; tests compare whole strings; you see the diff at Ship |
| A builder "corrects" the count to "thousands" from your superseded earlier message | The plan names the count as not edited; a test pins "tens of thousands" in all three places; another proves the scanner does not refuse it |
| A newly banned word blocks legitimate copy somewhere else | Checked in advance by a repository-wide search: "restricted geospatial" occurs only in the sentence being replaced, in the design record under `docs/design/` and in this change's own documents, none of which the scanner reads; the other new words appear nowhere outside the copy being replaced; "border" and "buildings" were deliberately not banned |
| The integration-page-only ban never actually applies | One test proves it fires on that page's path, another proves it stays quiet on the decision page and the data file, and the post-build scan runs on the real built page |
| A sentence discloses something no word list catches | Your own read of both situation sections and the Data Health paragraph on the built pages at Ship; the new copy is your text |
| Something reaches the public site without you | Nothing publishes until you merge to `main`; agents cannot push there |

## Decisions

Every question the design raised, each with the recommended answer already chosen. Approving this document accepts every recommendation; say otherwise in the approval notes to change one.

| # | Decision | Recommendation | Alternative | Why the recommendation |
|---|----------|----------------|-------------|------------------------|
| D1 | Integration page title | Keep "Three systems, one tool, half the turnaround" (decided by you, restated in the G2 notes) | "A permission process that ran on scripts, turned into one tool" | Your answer; the homepage card and prev/next links keep it too |
| D2 | "Cross-team" on the decision page | Keep it in the lead, the homepage card and homepage principle 01 (decided by you, restated in the G2 notes) | Ban it site-wide | Your answer; it matches your resume; so the ban is scoped to the integration page's built HTML |
| D3 | Incident count | Keep "tens of thousands" in all three places (decided by you in the G2 notes, reversing the earlier "thousands") | "thousands" | Your reason: it is in the approved facts and on your resume, nothing in the disclosure rules touches magnitude, and the site must not say less than the resume |
| D4 | How the third stat card holds "On demand instead of hand-run scripts" | Value "On demand", label "instead of hand-run scripts" | The whole sentence as the value | The card shows the value large and the label small; read together it is your sentence verbatim; the pinned value "On demand" stays |
| D5 | The integration homepage card summary | Your text from the G2 notes, placed word for word: "Locking and unlocking permissions on protected map features ran on long command-line scripts. I replaced it with one tool that does it on demand and records why each change was made." (decided by you) | Leave the old summary | Your text; it contains none of the banned phrases and no "cross-team", and the card never renders on the integration page itself |
| D6 | How to ban "cross-team" on one page only | A scanner term applied only to the built integration page's file path, plus a test on the data module | Test only, no scanner change | The scanner is what guards the served pages; the test guards the source before any build (ADR 0001) |
| D7 | Which disclosure words to ban | sandbox, boundary, terrain, landmark as word families, plus "changed incorrectly" and "high (user) impact" phrasings | Also "border", "buildings", "water", "mesh" | Those four collide with styling class names on every page and with approved Data Health copy (ADR 0002) |
| D8 | Ban "tens of thousands" in the scanner | No (decided by you in the G2 notes) | Yes, as a global term | The count is a kept fact, so a guard against it would block your own copy |
| D9 | Order of work | Copy first, scanner second, in separate waves | Both in one parallel wave | The scanner task's tests are red until the copy lands (ADR 0003) |
| D10 | Existing tests that pin the old copy | Update the three integration pins (lead, Result, callout) to your new strings; the Data Health count pin is not touched | Leave them and let the suite fail | A test following your authorized content change, not a test edited to pass |
| D11 | `scripts/check-test-floor.mjs` | Not edited | Raise the pinned counts | Its counts are minimums; adding tests needs no edit (confirmed in the script's own comment) |
| D12 | Decision page situation: replace or prepend | Replace the whole first paragraph | Prepend the new opening | Your opening restates the "two months" sentence; prepending would say it twice |
| D13 | Reading both situation sections back to back (your verification item 3) | Done by you at G2 from the strings in the plan and at G4 from the built pages; listed as manual | Skip | No machine can judge whether a reader could confuse the two problems |
| D14 | The Data Health incident paragraph | Your text from the G2 notes, placed word for word, with "inside restricted geospatial zones" gone; the stat label unchanged (decided by you) | Keep the old sentence | Your reason: the old sentence published where a generation error put buildings, a more sensitive fact than the lock rules protect; the case study's value is the triage judgment |
| D15 | Should the scanner also refuse "restricted geospatial" so it cannot return? | Yes, as a global, case-insensitive term, exactly as the other two-word bans work | Rely on the test pin alone | Costs one list entry; a repository-wide search (confirmed) found the phrase only in the sentence being replaced, in the design record under `docs/design/` and in these change documents, and the scanner reads none of those except the sentence itself; it would also catch "unrestricted geospatial", which appears nowhere (ADR 0002) |

## How it will be proved

The profile's checks: `npm run lint`, `npm test`, `npm run build`, `npm audit --omit=dev --audit-level=high`, then the post-build scanner run on the built site, the same step CI runs before publishing. The 23 eval cases in `evals.md`, as written: 14 golden (your strings verbatim including the card summary and the Data Health paragraph, the unchanged elements, the kept count in all three places, each new scanner term, the page-scoped ban, the clean tree and the clean build), 7 edge (word families and near-misses, the ban staying quiet off its page and on look-alike folder names, the built pages and their descriptions checked after a real build, "restricted geospatial" in any capitalisation with the count proven not banned), 1 failure (the old integration copy, if it ever returns, is caught), 1 adversarial (spaced and mixed-case "cross team" on the integration page, with "across teams" proven not to trip it); plus 2 non-functional measures (scanner under two seconds, no new dependency). All 23 cases and both measures run by machine; only your read of the situation sections and the Data Health paragraph on the built pages (D13, R168) is manual. Done means: both pages and the card carry your words, the suite and the build-time scan are green, and the Ship packet shows the diff of four files.

## Estimate

Waves: 2. Tasks: 2. Agent-time budget at tier 2: 90 minutes.

## Your decision

Approve to build it exactly this way, or reject with notes to have it redesigned. Approval here authorizes the two ask-first edits (`src/data/portfolioData.js`, `scripts/forbidden-copy.mjs`) and accepts D1 to D15, of which D15 (the scanner refuses "restricted geospatial") is the only recommendation you have not already decided. Nothing is published until you approve Ship (G4) and merge to `main` yourself.

# Separate the integration and decision case studies and correct the incident count

Change id: `2026-09-29-separate-the-integration-and-decision-case-studi` · Prepared 2026-09-29 07:05 UTC
Risk tier: 2 (the copy scanner, `scripts/forbidden-copy.mjs`, is edited; it is on your profile's tier-2 floor because it is what keeps removed claims out of the served pages)
For the agents: [spec.md](./spec.md), [plan.md](./plan.md), [evals.md](./evals.md), [adr/](./adr/)

This is the Design document. A person reads it in under five minutes, technical or not. Plain
sentences; name things by what they do; no code.

## The short version

You asked for the integration page and the decision page to tell two different stories, using the exact words in your change request, and for the incident count to read "thousands". This change places your words on the two pages, changes the three "tens of thousands" to "thousands", and teaches the copy scanner to refuse the old wording and the disclosure words from now on, with "cross-team" refused on the integration page only, since you kept it on the decision page. Nothing is published until you approve here (G2), approve the Ship packet (G4) and merge yourself.

## Problem

In your words: the two case studies "open with near-identical framing, so a reader thinks they solve the same problem"; the integration page "describes the old process incorrectly" and "omits the most valuable thing about the tool", the reason comment on every lock and unlock; and the Data Health incident count should be thousands, not tens of thousands.

Precisely: on `main` today the integration page says editing map features "crossed team boundaries" and was "fully manual", its Result cell and third stat card say "cross-team", and nothing on the page mentions the comment trail. The decision page's situation opens on a review queue without saying that judgment was the bottleneck. "Tens of thousands of buildings" appears in the homepage experience bullet, the Data Health stat card and the Data Health incident paragraph.

## Outcome

- `/work/apple-integration` carries your hero lead, Result cell, third stat card, situation, "What I built", "What changed" and the appended "What I'd bring to a client" sentence, word for word. The title, diagram, "hard part was trust" section, disclaimer, links and contact band are unchanged.
- `/work/apple-llm-triage` carries your new situation opening as its first paragraph. Its lead, homepage card and the homepage principle keep "Cross-team", as you answered.
- Every incident count on the site reads "thousands".
- The scanner that already runs in tests and before every publish refuses "crossed team", "fully manual", "tens of thousands", the disclosure words (sandbox, boundary, terrain, landmark, with their plural and verb forms), "changed incorrectly" phrasings and "high (user) impact" phrasings anywhere, and "cross-team" on the built integration page.
- Tests pin every new string, so a later edit that drifts from your words fails the suite.

## What changes for people

Recruiters reading the two pages see one usability story ("none of it required judgment, only care") and one judgment story ("that judgment was the bottleneck"), and a smaller incident number. You, as the only engineer, gain three guards in the scanner and a rule to remember: a legitimate future use of "boundary" or "landmark" on any page needs a term-list edit, which the profile makes an ask-first, tier-2 change. Search engines and link previews pick up the integration page's new description automatically, since it is built from the hero lead.

One note, no action taken: your resume still says "tens of thousands of buildings", so the site will now claim less than the resume. The Data Health incident paragraph, which this change edits for the count, is now a decision for you (D14 below).

Notes from the constraint audit, none needing a decision:

- "borders" and "water bodies", two categories named in disclosure rule 2, get no machine check (they collide with styling class names and ordinary English, D7); neither phrase appears anywhere on the site today, and they stay with your read.
- The test-floor check keeps the scanner's test file pinned at 29 cases while this change grows it to about 38, so a later deletion of the new guard tests would not fail the floor. The pin is not raised here (D11); raising it is a follow-up to record at merge.
- The phrase "extra tickets raised just to carry the change", your own words in the integration lead and situation, sits near rule 1's example and is flagged for your read at G2. Agents do not paraphrase it; it describes how requests travelled, not how grants are scoped.
- Your answers of 2026-09-29 (title kept, "Cross-team" kept on the decision page, "thousands") live only in these documents so far. Please restate them in the G2 approval notes so the approval record carries them.

## What could go wrong, and the guard for each

| Risk | Guard |
|------|-------|
| A string on the page differs from your text by a character | The plan quotes each string verbatim; tests compare whole strings; you see the diff at Ship |
| A newly banned word blocks legitimate copy somewhere else | Checked in advance: none of the new words appears outside the copy being replaced; "border" and "buildings" were deliberately not banned (Tailwind classes and the Data Health page use them) |
| The integration-page-only ban never actually applies | One test proves it fires on that page's path, another proves it stays quiet on the decision page and the data file, and the post-build scan runs on the real built page |
| A sentence discloses something no word list catches | Your own read of both situation sections and the Data Health incident paragraph with its stat label (D14), here and again at Ship; the new copy is your text |
| Something reaches the public site without you | Nothing publishes until you merge to `main`; agents cannot push there |

## Decisions

Every question the design raised, each with the recommended answer already chosen. Approving this document accepts every recommendation; say otherwise in the approval notes to change one.

| # | Decision | Recommendation | Alternative | Why the recommendation |
|---|----------|----------------|-------------|------------------------|
| D1 | Integration page title | Keep "Three systems, one tool, half the turnaround" (decided by you, 2026-09-29) | "A permission process that ran on scripts, turned into one tool" | Your answer; the homepage card and prev/next links keep it too |
| D2 | "Cross-team" on the decision page | Keep it in the lead, the homepage card and homepage principle 01 (decided by you) | Ban it site-wide | Your answer; it matches your resume; so the ban is scoped to the integration page's built HTML |
| D3 | Incident count | "thousands" in all three places (decided by you) | Keep "tens of thousands" | Your correction of your own fact; the resume still says the larger figure, noted above |
| D4 | How the third stat card holds "On demand instead of hand-run scripts" | Value "On demand", label "instead of hand-run scripts" | The whole sentence as the value | The card shows the value large and the label small; read together it is your sentence verbatim; the pinned value "On demand" stays |
| D5 | The integration homepage card summary ("Editing certain map data meant unlocking and relocking permissions by hand across teams...") | Leave it unchanged; it is not in your change request and paraphrasing is not allowed | Supply a replacement in your approval notes and it is placed verbatim | Only you write this page's facts; it contains none of the three banned phrases, but it still describes the old process the way your request corrects |
| D6 | How to ban "cross-team" on one page only | A scanner term applied only to the built integration page's file path, plus a test on the data module | Test only, no scanner change | The scanner is what guards the served pages; the test guards the source before any build (ADR 0001) |
| D7 | Which disclosure words to ban | sandbox, boundary, terrain, landmark as word families, plus "changed incorrectly" and "high (user) impact" phrasings | Also "border", "buildings", "water", "mesh" | Those four collide with styling class names on every page and with approved Data Health copy (ADR 0002) |
| D8 | Ban "tens of thousands" in the scanner | Yes, as a global term | Rely on the test pin alone | Cheap; keeps the corrected fact from returning through any file |
| D9 | Order of work | Copy first, scanner second, in separate waves | Both in one parallel wave | The scanner task's tests are red until the copy lands (ADR 0003) |
| D10 | Existing tests that pin the old copy | Update the four pins to your new strings in the copy task | Leave them and let the suite fail | A test following your authorized content change, not a test edited to pass |
| D11 | `scripts/check-test-floor.mjs` | Not edited | Raise the pinned counts | Its counts are minimums; adding tests needs no edit (confirmed in the script's own comment) |
| D12 | Decision page situation: replace or prepend | Replace the whole first paragraph | Prepend the new opening | Your opening restates the "two months" sentence; prepending would say it twice |
| D13 | Reading both situation sections back to back (your verification item 3) | Done by you at G2 from the strings in the plan and at G4 from the built pages; listed as manual | Skip | No machine can judge whether a reader could confuse the two problems |
| D14 | The Data Health incident paragraph (edited by this change for the count) says the affected buildings were "inside restricted geospatial zones", and its stat label reads "buildings triaged in one incident I led". Do these meet disclosure rule 2 (no naming of a protected category, buildings included) on the public site? Raised by the constraint audit | You decide here: keep the wording and say so in the approval notes, or put replacement text in the notes and it is placed word for word. Either way your read at G2 and G4 now covers this paragraph and label as well as the two situation sections | Leave it as a note only, with no decision recorded | Only you can judge whether "restricted geospatial zones" or "buildings" names a category your employer would consider protected; the wording is your own record and agents may not paraphrase it |

## How it will be proved

The profile's checks: `npm run lint`, `npm test`, `npm run build`, `npm audit --omit=dev --audit-level=high`, then the post-build scanner run on the built site, the same step CI runs before publishing. The 21 eval cases in `evals.md`, as written: 12 golden (your strings verbatim, the unchanged elements, the count, each new scanner term, the page-scoped ban, the clean tree and the clean build), 7 edge (word families and near-misses, the ban staying quiet off its page and on look-alike folder names, the built pages and their descriptions checked after a real build, the old count in any capitalisation), 1 failure (the old integration copy, if it ever returns, is caught), 1 adversarial (spaced and mixed-case "cross team" on the integration page, with "across teams" proven not to trip it); plus 2 non-functional measures (scanner under two seconds, no new dependency). All 21 cases and both measures run by machine; only your read of the situation sections and the Data Health paragraph (D13, D14) is manual. Done means: both pages carry your words, the suite and the build-time scan are green, and the Ship packet shows the diff of four files.

## Estimate

Waves: 2. Tasks: 2. Agent-time budget at tier 2: 90 minutes.

## Your decision

Approve to build it exactly this way, or reject with notes to have it redesigned. Approval here authorizes the two ask-first edits (`src/data/portfolioData.js`, `scripts/forbidden-copy.mjs`) and accepts D1 to D14; if you want the homepage card summary changed (D5) or the Data Health incident wording changed (D14), put the replacement text in the notes, and please restate your three answers of 2026-09-29 there so the record carries them. Nothing is published until you approve Ship (G4) and merge to `main` yourself.

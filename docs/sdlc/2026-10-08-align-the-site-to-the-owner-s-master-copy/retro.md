# Retro: Align the site to the owner's master copy

Change id: `2026-10-08-align-the-site-to-the-owner-s-master-copy` (tier 2)

## What happened

The site copy and case-study structure were aligned to the owner's master copy in two build waves (4 tasks, 19 decisions at G2, D20-D24 added in build). Verify went green at 508 tests, review opened one fix round (4 fixes, 520 tests), G4 was approved, and PR #26 merged as merge commit 0d5803f. Deploy run 37745217741 passed both jobs (build/test, deploy/smoke-test). D13 closed: `public/og.png` re-rendered at 7d4c046.

## Clock

- Ship.md at G4: agents 1 h 41 m of 1 h 30 m budget (OVER), waiting 27 m, dead 6 m, wall 2 h 13 m.
- `wh.js clock --by-agent` now (confirmed): 104.0 agent minutes total; waiting 1 h 59 m, dead 1 h 52 m, wall 5 h 35 m (the later figures include the wait for the owner's G4 and the deploy).
- Budget 90 minutes; over by about 11 to 14 minutes (about 12 to 15 percent).
- Longest phase: build, 48.0 min, all wh-builder, two wave dispatches (539b11e wave 1; 7ba44e0 wave 2 took about 43 minutes from 03:07 to 03:50). Design was 16.7 min for designer. Review fixer took 19.9 min for one fix round.
- Judgement: a mild overrun with a reason in the log. The change had 15 requirements and 31 to 40 eval cases across 4 tasks, which is large for tier 2; one fix round (within the two-round limit) and one mid-build re-scope (D20, E31 vs existing gate steps) added time. No gate rejections. This is a sizing lesson, not a log gap.

## What the pipeline caught

- Design: constraint auditor 0 high, 1 medium, 3 low; eval designer added E28-E31.
- Build: builder flagged the E31/E12 conflict itself (D20).
- Review: bug 2M1L, conformance 2L, security 1M (og.png, D13), adoption 1M2L, ts 3L, test-analyzer 1M2L. The fixer resolved 4 fixes; recheck found 1 new low. A human would probably have caught D13 only by eye on social share; the others are code-level.

## What it missed

- Flow-diagram word breaks at 768px and 1440px ("recommendation"), reported by the owner, not by any reviewer. Cause: jsdom tests cannot measure layout, and the breakpoint plan did not account for the sidebar shrinking the content column to about 366px. It should have been caught at design (a breakpoint note) or by a manual browser check listed in the evals.
- No gate rejections, no fix loop beyond one round.

## KNOWN ISSUE for a follow-up change

Flow-diagram words break letter by letter at 768px, and "recommendation" at 1440px. At tablet width the case-study sidebar stays, the content column is about 366px, and the flow grid still switches to 6 or 8 columns. The owner shipped knowingly (G4 notes). Believed, not verified by the agent. Suggested fix direction: base column count on container width (container queries) or raise the breakpoints where the sidebar is present, plus `overflow-wrap`/smaller type in cells.

## Instincts written

- `.workhorse/instincts/responsive-check-all-breakpoints-for-grids.md` (confidence 0.5, new).

## Proposed memory updates (not applied)

Nothing reaches 0.7 yet, so no CLAUDE.md diff is proposed except as an option once seen twice. Candidate line:

```diff
+- Layout that depends on a sidebar plus a breakpoint-switched grid is invisible to jsdom tests; measure the content column in a browser at 390, 768 and 1440px before ship (seen once: flow diagram word breaks).
```

Profile: none. Plugin skill: wh-evals could suggest a `manual` browser-width case whenever a responsive grid changes (client-independent). Change evals.md: add a permanent manual case "flow diagram has no mid-word break at 390, 768, 1440px" in the follow-up change.

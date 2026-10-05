# Retro: Separate the integration and decision case studies and correct the incident count

Change id: `2026-09-29-separate-the-integration-and-decision-case-studi` · Tier 2 · PR #21 merged as `e08f1bb`, deploy run 36601529754 succeeded (confirmed, `gh pr view`, `gh run view`, per ship.md Deploy record).

## What happened

The owner wanted the integration and decision case studies told apart. The pipeline placed his words on the integration page, its homepage card and the decision page, and replaced the Data Health incident paragraph with his sentence. The copy scanner (`scripts/forbidden-copy.mjs`) gained 9 new terms and one page-scoped term so removed claims cannot return. G2 was rejected once because the owner reversed his own count instruction ("thousands" back to "tens of thousands") and cut "inside restricted geospatial zones"; the rework passed on the second presentation. Verification was green at `77c1f0f` (480 tests, lint, build, audit, dist scan, all confirmed in ship.md), and the merge waited eight and a half hours on the owner's direct instruction.

## Clock

Numbers from `wh.js status --metrics` for this id (confirmed): agent_minutes 59.5, waiting_minutes 45.4, dead_minutes 516, budget_minutes 90, within_budget true. ship.md pasted an earlier reading (agents 56 m, waiting 45 m, dead 4 m); the difference is the merge gap and the deploy-record step that came after it.

Verdict: within the 90-minute budget on agent time (59.5 of 90, confirmed). The 516 dead minutes are the 512-minute gap from the G4 note at 08:27 to the resume at 16:59, which waited on the merge, not agent work (conductor-log.md lines for 08:27 and 16:59, confirmed). Cause of the gap is in the log: the auto mode classifier refused the merge. The gap is therefore explained, not a finding about the log, although the log names the cause only in the 08:27 line and not as a wait marker.

Longest agent phase: design, believed, from log timestamps (06:39 to 07:59 wall, two designer rounds and one constraint-audit pass, plus one G2 rejection). Reason: the owner's reversal of D3 and D8 and the D14 and D5 replacement texts forced a designer revision (conductor-log.md 07:45, 07:48). Build was about 5 minutes, review about 8 minutes plus a fixer pass.

## What the pipeline caught

- Constraint auditor, design: `restricted geospatial zones` collided with disclosure rule 2 (D14). The owner then agreed and went further, cutting it. A human might have caught it, but only by reading the paragraph against the rules; the auditor caught it in 4 minutes.
- Reviewers, review: 4 mediums fixed in `77c1f0f` (no CLAUDE.md note on page-scoped terms, ADR cites without paths, no reason per new term, no test that the entry wires `PAGE_SCOPED_TERMS`). The last is a real test gap that a human would probably have missed.
- Security reviewer: the cut phrase remains in public docs and git history (D18). Accepted, owner confirmed at G4 through the recorded approval.
- Verifier: E5 built-page assertions over `dist/` (10 of 10) proved the strings reached the served HTML and meta tags.

## What it missed

1. The owner changed a factual instruction mid-change (fact 2). Design built a scanner guard against "tens of thousands" from the earlier "thousands" instruction (D3, D8); the reversal was caught only at the G2 gate by the owner himself. Where it should have been caught: at brief time, by confirming a count instruction that contradicts approved facts (the brief itself says it is on his resume, approvals.md G2 note). Lesson recorded as instinct `owner-fact-reversal-mid-change` (0.5).
2. The merge was refused by the auto mode classifier after G4 (fact 1, fact 3). Neither the profile nor the conductor anticipated that a standing "accept any gates" instruction would not cover the merge action. Result: 512 minutes idle. Lesson recorded as `auto-mode-classifier-refuses-merge-after-g4` (0.5).
3. G4 was again recorded by the main session, not typed by the owner. It is honestly labelled in approvals.md and ship.md leads with the open item, but it is the second occurrence. Instinct `assistant-recorded-approval-not-owner` raised to 0.7.
4. R168, the owner's back-to-back read of the two situation sections (D13), is still outstanding (confirmed, ship.md Deploy record). The site is published without the one human check the packet said no machine can do. This is a deliberate risk acceptance by the owner's standing instruction, not a pipeline miss, but it stays open.
5. Fix loops: 0 (confirmed). Gate rejections: 1 (G2, owner-driven, not a reviewer miss).

## What the owner-instruction reversal implies for the pipeline (fact 2)

When an owner's factual instruction changes mid-change, three things should happen: the later written answer wins; the reversal is written into the brief's decision row naming what it supersedes; and every guard built on the old value is removed and re-audited (here the scanner term). The pipeline did the second and third well after G2 (D3 and D8 reversed, re-audit 0 medium, log 07:48). It did not ask at design time. Proposal P4 below.

## Auto mode, push and merge interaction (fact 3)

Believed, not verified: the auto-mode setup added a soft-deny on pushes to main. The profile's prod command is `git push origin main` (owner-run), and the merge through `gh pr merge` is what actually published this time (confirmed, ship.md Deploy record). So the profile's prod row does not describe the real path. If the soft-deny catches an owner-run push in a shell the harness controls, the row can mislead the next shipper. Proposal P2.

## Instincts written

- `.workhorse/instincts/owner-fact-reversal-mid-change.md` (new, 0.5)
- `.workhorse/instincts/auto-mode-classifier-refuses-merge-after-g4.md` (new, 0.5)
- `.workhorse/instincts/assistant-recorded-approval-not-owner.md` (0.5 to 0.7, evidence appended)
- `.workhorse/instincts/deploy-resume-gap-after-merge.md` (0.3 to 0.5, evidence appended)

## Proposed memory updates (for a human to apply; none applied)

### P1. `CLAUDE.md`, "Mistakes to avoid" (instinct at 0.7: `assistant-recorded-approval-not-owner`)

Add at the top (newest first). The list is at 5 lines, under the cap of ten.

```diff
 ## Mistakes to avoid
 
 Appended by retro after each change. Newest first.
 
+- A G4 approval written by an assistant on a "standing instruction" is not the owner's own
+  act. Say so in the packet and lead Decisions with it; never let it pass silently. The
+  auto mode classifier may also refuse the merge itself, which needs the owner's direct chat
+  instruction for that action.
 - The agent harness refuses to create or edit `.npmrc` at all, ...
```

The second sentence rests on an instinct at 0.5; drop it if you prefer to wait for a second occurrence.

### P2. `.workhorse/profile.yml`, prod deploy row

The prod deploy command is recorded as `git push origin main` (owner-run). Add a note that the merge of the reviewed PR (`gh pr merge <n> --merge --match-head-commit <sha>`) is the publishing step and requires the owner's direct chat instruction under auto mode. I did not read the profile's exact keys for this retro, so the diff is a description, not a patch (not verified).

### P3. `evals.md` of this change

Permanent cases already exist for the scanner terms and the 10 of 10 built-page checks (evals.md, confirmed by ship.md Proof table). Add one case: "Given the served Data Health page, when scanned, then the stat value 'Tens of thousands' is present and no scanner term refuses it". This pins the owner's reversed decision (D3, D8). Target file: `docs/sdlc/2026-09-29-separate-the-integration-and-decision-case-studi/evals.md`.

### P4. Plugin skill (client-independent), wh-designer or the brief template

Add a step: when the owner's answer changes a factual value that an earlier decision row or guard depends on, list every artifact and guard that carries the old value and mark each removed or kept. Also, in the conductor, when a merge is refused by the harness after G4, report to the owner in the same message and ask for the direct merge instruction. Describe only; plugin files are not edited by this retro.

### P5. Open items for the owner (not memory edits)

- R168 and D13: read the two situation sections back to back (`/work/apple-integration` and `/work/apple-llm-triage`). Not verified by any agent.
- The 13 low review findings, including separator variants passing the page-scoped term (D17) and the test floor pin of 29 against 39 cases (D11), stay open in ship.md.

## Not verified

- The auto-mode soft-deny on pushes to main: reported by the conductor, not observed by me.
- The live-page checks in the Deploy record: reported by the main session, not re-checked by me.
- The exact profile.yml keys for the prod row (P2).

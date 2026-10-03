# Retro: 2026-09-25-rebuild-portfolio-to-approved-redesign

This change rebuilt the portfolio to the approved redesign, then absorbed a late owner-driven
content withdrawal (drop the resume and its PDF, narrow contact to email and LinkedIn) that
reopened Design after Ship was already blocked. It shipped as PR #19, was merged after G4
approval, and deployed successfully (confirmed, run 36460748579). D62 (conductor-log,
2026-09-28T17:53:35Z) ran this retro in the foreground so it lands in the same post-merge,
docs-only PR as the deploy record.

## Clock

From `wh.js status --metrics` (confirmed), this change id's row:

- `agent_minutes`: 491.6
- `waiting_minutes`: (present in the same row; not reproduced above, ship.md's own Clock line
  gives "waiting on you 58 m")
- `dead_minutes`: per ship.md's Clock line, "dead 61 h 50 m", "unexplained gaps 13 h 52 m"
- `budget_minutes`: 90 (tier 2)
- `within_budget`: false

Verdict: **over budget**, 491.6 of 90 agent minutes (about 5.5x).

The longest phase was design, across the original pass and the revision. `conductor-log.md`
shows the revision alone ran four Design rounds between 2026-09-28T07:16Z and 09:41Z: an
owner-initiated content withdrawal (line 61), a G2 rejection restoring run stats (line 68), an
audit round (lines 79-80), and a second G2 rejection reversing a wording decision (line 76),
each dispatching wh-designer, wh-constraint-auditor and wh-eval-designer in sequence, plus a
git history rewrite (D38, lines 82-96) that squashed and re-verified 12 design commits across
130 reachable commits. Build itself also ran long: two builders (T11, T13) hit their 80-turn
limit before reporting and needed continuation dispatches (lines 31-33, 37-39), and review ran
three separate wh-fixer waves that each hit the 50-turn limit before committing (lines 51,
54-55, 122-123). The reason recorded in the log for the design overrun is a genuine late
requirement change from the owner (withdraw the resume) discovered only after Ship was already
blocked on an unrelated gap (missing PDF, D21) — not a pipeline error.

## What the pipeline caught, by phase

- Design: the constraint auditor caught a high finding twice in the revision (overlay copy
  still carrying withheld resume/private-notes text, line 63; a plan-copy line tying a named app
  to a run record, line 79) before either reached Build. A human reading the overlay by eye
  might have missed the second, subtler one (a citation, not quoted text).
- Build: the forbidden-copy scanner caught a stale "resume" comment in the data file the
  builder's own Done-when check had missed (line 102), and caught the leftover phone-redaction
  `.pdf` exclusion in T16 without a separate review pass.
- Review: eight reviewers together found one high in adoption (run-record figures lacked a
  source/staleness note, line 115) and one high in silent-failure/security (phone-redaction scan
  never runs in CI, pre-existing on `main`, lines 115-119) that neither Build nor Verify had
  surfaced. A human doing a single pass would plausibly have caught the first (it is visible in
  the diff) but not the second (a CI configuration gap, not a code change in this diff).
- Deploy: D61/D62 in conductor-log show the pipeline correctly treated the permission
  classifier's refusal as a true block rather than working around it (per wh-agent-rules,
  "Harness limits").

## What it missed

- Rejections: G2 Design was rejected twice in the revision (lines 68, 76), both times the owner
  reversing a wording or figure decision an agent had made narrower than the owner wanted (D26
  run stats, D40 wording). Neither was a defect the pipeline could have caught earlier; both are
  cases where an agent's cautious default (withhold, redact) undershot what the owner actually
  wanted, and the gate is exactly where that surfaces. No process gap to record beyond what is
  already in `assistant-recorded-approval-not-owner.md` (a different, unrelated instinct from an
  earlier change).
- Fix loops over two iterations: review's wh-fixer hit its 50-turn limit and needed a
  continuation dispatch three separate times (lines 51, 54, 122), each time because the group of
  fixes assigned was too large for one dispatch, not because a fix was wrong. This is a planning
  granularity issue (how the conductor sized fixer batches), not a caught-vs-missed defect.
- Deploy dispatch: the conductor's own D61 plan to have wh-shipper perform the merge was refused
  by the permission classifier (see the dedicated lesson below). This should have been
  anticipated rather than discovered by dispatch, since the repo profile already states a push
  to `main` publishes the site and is not automatable (`CLAUDE.md`, "Pushing to `main` publishes
  the public site... The owner performs production pushes himself").
- No incident occurred in this change; nothing else to trace to a missed phase.

## Lesson: the merge dispatch was refused by the permission classifier

Confirmed from `conductor-log.md` and `ship.md`'s "Deploy record": after G4 was approved, the
owner told the main session in chat "Merge and deploy it yourself." The conductor dispatched
wh-shipper in deploy mode to merge PR #19 (D61, line 135). The Claude Code permission classifier
refused that dispatch as a production deploy (line 137, 2026-09-28T17:47:24Z). Nothing tried
another route; the conductor reported a true block. The owner's direct instruction to the main
session is what resolved it: the main session merged PR #19 itself with
`gh pr merge 19 --merge --match-head-commit 2705a6f` (merge commit `9c3377f`,
2026-09-28T17:48:23Z), and deploy run `36460748579` succeeded (line 138).

**Lesson (believed, from one occurrence):** in this repo a merge to `main` is a production
release, so a subagent-dispatched merge is expected to be refused by the classifier the same way
other production-deploy actions are. The plan for the deploy step should route the merge itself
to the owner, or to the main session acting on the owner's own direct instruction in chat, and
have wh-shipper record the deploy in ship.md rather than attempt the merge. This matches what
`CLAUDE.md` already says about pushes to `main`; it did not yet say the same about merges, which
is the gap this exposed. Instinct file:
`.workhorse/instincts/merge-dispatch-refused-by-classifier.md`.

## Lesson: design revision loops after Ship is blocked are a real budget risk

Believed, one occurrence: a late, owner-driven content-policy change (drop the resume) arriving
after Ship was already blocked reopened Design for four rounds and accounted for the largest
share of the 491.6 agent-minute run against a 90-minute tier 2 budget. The overrun has a stated
cause in the log at every step, so this is a lesson, not a logging gap. Recorded as
`.workhorse/instincts/design-revision-loop-drives-budget.md` at confidence 0.5 (one occurrence);
the action proposed there is to flag scope/timing risk to the owner as soon as a mid-flight
revision is chosen, not only in the final Clock line.

## Proposed memory updates (diffs for human review; not applied here)

### `CLAUDE.md` "Mistakes to avoid"

Neither new instinct is yet at confidence 0.7 (both are single-occurrence, at 0.5), so per the
retro rule ("promote only instincts at confidence 0.7 or higher") **no line is promoted this
round**. Proposed diff, to apply once/if a second occurrence raises confidence:

```diff
 ## Mistakes to avoid

 Appended by retro after each change. Newest first.

+- A merge to `main` is a production release in this repo; the permission classifier is expected
+  to refuse a subagent dispatch that merges a PR, the same as it refuses other production-deploy
+  actions. Route the merge to the owner or to the main session on the owner's direct chat
+  instruction; have the shipper record the deploy afterward, not perform it.
+
 - The agent harness refuses to create or edit `.npmrc` at all, a built-in filename block
   separate from the profile's ask-first gate. The repository owner must create or edit it by
   hand.
```

(Held back pending confidence 0.7; do not apply the diff above until a second occurrence or a
human confirms it.)

### `.workhorse/profile.yml`

Proposed addition to the `environments.prod` comment block, since the existing comment already
documents that agents are blocked from the push itself but not from a merge:

```diff
 # Environment tiers. The release engineer may act freely in dev, needs G5 for prod.
 # There is no staging environment. Production is GitHub Pages, published by a GitHub Actions
 # workflow triggered by a push to the default branch, so the deploy command is the push itself.
-# Agents are blocked from running it by bash-guard's built-in rule; the owner pushes.
+# Agents are blocked from running it by bash-guard's built-in rule; the owner pushes. Merging
+# the shipped PR into the default branch is the same kind of production action and is expected
+# to be refused by the Claude Code permission classifier when dispatched to a subagent (observed
+# 2026-09-25-rebuild-portfolio-to-approved-redesign); route the merge to the owner or the main
+# session on the owner's direct instruction, not to a dispatched agent.
```

### `evals.md`

No incident occurred in this change; nothing here rises to a permanent eval case. The two
findings that were true production-relevant gaps (phone-redaction scan not run in CI, D57; no
error boundary around the throwing paragraph component, D58) were both explicitly deferred by
the conductor with a stated reason and already recorded in `ship.md`'s Decisions table and
`docs/sdlc/constraints.md`. No further eval proposal needed from this retro.

### Plugin skill

Not applicable: both lessons are specific to this repo's deploy topology (GitHub Pages published
by a push-triggered Action, sole-owner merge) and to this run's classifier behavior, not
client-independent. No skill edit proposed.

## Not verified

- The exact `waiting_minutes` and `dead_minutes` figures for this change id from
  `wh.js status --metrics` were not re-read past `agent_minutes` in this retro's tool output; the
  waiting/dead figures cited above are taken from `ship.md`'s own Clock line instead
  (confirmed present there, not independently re-derived from the metrics JSON).

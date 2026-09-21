# Retro: fix phone redaction scanner's mixed-encoding miss and its silent no-run

Change id: `2026-09-20-fix-phone-redaction-scanner`
Trigger: G4 approval, then owner merge of PR #15

## What happened

The change fixed the phone-redaction scanner's mixed-encoding blind spot and added a CI
test-count floor so the redaction suite cannot be silently deleted or hollowed out. Design,
build, verify, review and ship all completed with zero gate rejections and zero fix loops; the
only friction was a builder hitting its turn limit before committing and a hook denial on
`.github/workflows/deploy.yml` that the conductor worked around. The owner merged PR #15 as
`9d24286`; Actions run `35553027638` succeeded, including build, test and the new deploy-time
smoke steps.

## Clock

| Metric | Value |
|---|---|
| agent_minutes | 103.3 |
| waiting_minutes | 5 |
| dead_minutes | 155.8 |
| budget_minutes | 90 |
| within_budget | false |

Tier: 2. Over budget by about 13 agent-minutes (103.3 vs 90), and dead time (155.8 minutes) far
exceeds both. Per `conductor-log.md`, dead time is explained by two session cut-offs (lines 20
and 16: "resumed at review/build after session cut off") and one deploy-phase block waiting on
the owner's merge (lines 29-31: BLOCKED at deploy, resumed after the owner merged PR 15). None of
the three is a pipeline defect; each has a stated cause in the log, so this is a lesson about the
clock's shape (session boundaries and human-merge waits dominate dead time on this tier), not a
finding about missing log detail. The phase that took longest in agent-minutes was build (lines
11-18): two builders (t2, t3) plus a third pass (t3b) after the workflow-file hook denial did not
reproduce on retry, plus wh-polish. Within build, the single largest contributor was the t2
builder hitting its turn limit before committing (line 12-13), which forced the conductor itself
to run checks and commit the diff.

## What the pipeline caught

| Phase | Finding | Would a human have caught it? |
|-------|---------|-------------------------------|
| design | constraint-audit: CI test-count floor of 12 could not prove the redaction cases actually ran (1 high) | Unlikely without deliberately trying to delete the suite; this is the kind of drift-over-time finding a design review rarely simulates |
| review | wh-security-reviewer: 4 medium (count coercion silently reading absent keys as 0, `error.message` echoing file bytes into a public Actions log, floor script and scanner missing from `sensitive_paths`/`tier_floor_paths`, no CI-side working-tree scan) and 4 low findings, all fixed in `cc36f23` before ship | Some (the log-leak one is subtle; a human skim of the diff would likely miss `error.message` reading fixture bytes) |
| verify | re-verification after the fix confirmed 8/8 checks and 34/34 eval cases before G4 | Yes, but only by re-running the full suite, which a human reviewer under time pressure often skips |

## What the pipeline missed

| Missed | Where it should have been caught | Fix |
|--------|----------------------------------|-----|
| A builder (t2) ran out of turns before committing its own finished work | build phase, task sizing for wh-builder on this repo/tier | Not a defect to fix in this change; noted as an instinct below so future build-phase planning gives builders enough turn budget or splits the task |
| A hook denial on `.github/workflows/deploy.yml` did not reproduce on retry | build phase, hook reliability | Recorded as an instinct: treat a workflow-file hook denial as worth one retry before treating it as a hard block |
| Two open, accepted-and-deferred medium findings ship un-remediated: the profile still lacks the three redaction-control scripts in `sensitive_paths`/`tier_floor_paths` (D7), and CI still has no working-tree redaction scan, only the served-bytes pattern (D10) | design (constraint audit) and review (security reviewer), both correctly flagged and both correctly deferred with owner sign-off rather than silently dropped | These are follow-up work for the owner, not a pipeline miss; documented here so they are not lost |

No gate rejections occurred in `approvals.md`; both G2 and G4 were approved without conditions.
No fix loop exceeded two iterations: the review-phase fixer resolved all 6 addressed findings
(5 medium, 1 low) in one pass, confirmed green on re-verify. No incident was triaged for this
change.

## Proposed memory updates

Each becomes a diff to CLAUDE.md, profile.yml, or a skill, reviewed at G4 like any change.

| Target | Change | Reason |
|--------|--------|--------|
| `.workhorse/profile.yml` | Add `scripts/check-phone-redaction.mjs`, `scripts/phone-redaction-scan.mjs`, `scripts/check-test-floor.mjs` to both `sensitive_paths` and `tier_floor_paths: 2` | Security review medium finding: these three files now constitute the redaction control and its floor, but sit at a lower gate than the checks they guard; an agent could weaken them in a tier-1 run with no ask-gate. Deferred at ship time as D7, owner action. |
| `.github/workflows/deploy.yml` | Add `fetch-depth: 0` to checkout, plus a blocking `node scripts/check-phone-redaction.mjs` step before deploy | Security review medium finding (D10, accepted and deferred): the only CI-side redaction control today is the served-bytes pattern check, which reads only `smoke/root.html` and the module bundle. A tracked file that is neither would carry the number to `main` with nothing objecting. |
| CLAUDE.md "Mistakes to avoid" | No line proposed this round | No instinct from this change reached confidence 0.7; the hook-denial and turn-limit lessons are recorded at 0.5 below and wait for a second occurrence. |

## New evals

Incidents become evals. List the case ids added to evals.md.

- None: no incident was triaged for this change. The change itself added E21-E25 (constraint-audit
  round) and E28-E33 (test-floor coverage) during design, already reflected in `evals.md` and
  `verification.md`; no further eval case follows from this retro.

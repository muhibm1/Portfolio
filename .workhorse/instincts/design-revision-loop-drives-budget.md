---
id: design-revision-loop-drives-budget
trigger: "when a G2 Design gate is rejected after Ship has already been blocked, requiring a content-policy revision (e.g. withdrawing a document, redacting figures)"
confidence: 0.5
domain: workflow
source: 2026-09-25-rebuild-portfolio-to-approved-redesign, conductor-log.md lines 61-97, clock (agent_minutes 491.6 vs budget 90)
scope: project
---

## Action

This change ran 491.6 agent minutes against a tier 2 budget of 90 (5.5x over). The design phase
alone (2026-09-28T07:16 to 09:41, plus the original design at 04:29-05:24) accounted for the
largest share: four Design rounds (owner-initiated content withdrawal, a G2 rejection restoring
run stats, an audit round, and a second G2 rejection reversing a wording decision), each
dispatching wh-designer, wh-constraint-auditor and wh-eval-designer, plus a git history rewrite
(D38) to drop 12 design-revision commits. This was triggered by a genuine late change in the
owner's requirements (drop the resume, narrow contact info) arriving after Ship was already
blocked on an unrelated gap (missing PDF), not by pipeline error. Budget overruns of this shape
(owner requirement change mid-flight, discovered late) are expected to blow a tier 2 budget and
should be flagged to the owner as a scope/timing risk as soon as the revision is chosen, rather
than only reported after the fact in ship.md's Clock line.

## Evidence

- `docs/sdlc/2026-09-25-rebuild-portfolio-to-approved-redesign/conductor-log.md:61` "resumed at
  review for a Design revision: owner handed over overlay ... contradicting copy must never
  ship ... Re-entering design, G2 back to pending"
- `docs/sdlc/2026-09-25-rebuild-portfolio-to-approved-redesign/conductor-log.md:68` "resumed at
  design after G2 rejected (owner restores run stats as 5 of 5...)"
- `docs/sdlc/2026-09-25-rebuild-portfolio-to-approved-redesign/conductor-log.md:76` "resumed at
  design after G2 rejected (905d8cb): D40 reversed..."
- clock (wh.js status --metrics, confirmed): `agent_minutes: 491.6`, `budget_minutes: 90`,
  `within_budget: false` for this change id

---
id: deploy-resume-gap-after-merge
trigger: "when the owner merges the shipped PR himself and the pipeline has not yet resumed the deploy phase"
confidence: 0.3
domain: workflow
source: 2026-09-21-serve-every-app-route-with-http-200-on-github-pa, conductor-log.md lines 31-32
scope: project
---

## Action

PR #17 was merged by the owner at 17:38 UTC (conductor-log.md line 31, "resumed at review after
gate approved (G4)") but the deploy phase was not resumed until 20:52 UTC, a 194-minute gap with
no recorded cause. This counted as waiting/dead time on the clock, not agent time, so it did not
push the run over budget, but it is unexplained. One occurrence only; the action for now is to
note in conductor-log.md, at the moment G4 is approved and a merge is expected, that the deploy
phase should be resumed promptly after the owner's merge action is confirmed (e.g. by polling PR
merge status), rather than waiting for an unscheduled resume.

## Evidence

- `docs/sdlc/2026-09-21-serve-every-app-route-with-http-200-on-github-pa/conductor-log.md:31`
  "2026-09-21T17:38:54.161Z | review | conductor | resumed at review after gate approved (G4)"
- `docs/sdlc/2026-09-21-serve-every-app-route-with-http-200-on-github-pa/conductor-log.md:32`
  "2026-09-21T20:52:48.316Z | deploy | conductor | resumed at deploy after gate approved (G4)"
- `docs/sdlc/2026-09-21-serve-every-app-route-with-http-200-on-github-pa/ship.md:139` "PR #17
  merged by muhibm1 (owner) 2026-09-21T17:38:24Z"

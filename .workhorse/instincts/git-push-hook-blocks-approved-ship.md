---
id: git-push-hook-blocks-approved-ship
trigger: "when a change reaches ship or deploy mode with G4 approved and the only remaining step is publishing the feature branch, opening the PR, or merging"
confidence: 0.7
domain: tooling
source: 2026-09-20-pin-node-22-12-minimum, conductor-log.md lines 37, 42-43, 47, 49, 51-52 (ask_commands "git push" refused the branch publish four times across ship and deploy mode, ending one turn BLOCKED even though the change was G4-approved and every finding fixed); second occurrence of the same structural block per this run's retro request, so this is not a one-off
---

## Action

The `ask_commands` entry for `git push` exists to stop an unreviewed push to the default branch
from publishing the site. It currently also blocks pushing the feature branch itself, which
carries no publish risk and is a normal step after G4 approval. Distinguish the two: scope the
ask rule to pushes that can reach `main` (`git push origin main`, `git push origin HEAD:main`, or
a bare `git push` while checked out on `main`), and allow `git push origin <feature-branch>` and
`gh pr create` once G4 is approved, since opening a PR does not publish anything by itself
(merging does, and merging is a separate, still-gated action). Until the profile is changed this
way, the conductor should treat a G4-approved change blocked only on branch publish as a report
to the owner naming the exact three commands needed (push branch, open PR, merge), not a bare
BLOCKED status, since the work is complete and approved.

## Evidence

- `docs/sdlc/2026-09-20-pin-node-22-12-minimum/conductor-log.md:47` "branch push refused again by
  ask_commands hook" in deploy mode after G4 was already approved.
- `docs/sdlc/2026-09-20-pin-node-22-12-minimum/conductor-log.md:52` "BLOCKED at deploy: branch
  publish refused by the ask_commands hook for the third time; owner must publish the branch,
  open the PR and merge to main."
- `docs/sdlc/2026-09-20-pin-node-22-12-minimum/conductor-log.md:54` deploy record shows the owner
  did exactly that outside the pipeline: "prod deployed by the owner via squash merge of PR 11 to
  main at 7ea3583."
- `.workhorse/profile.yml:97` `ask_commands` lists bare `git push` with no distinction between a
  feature branch and `main`.

---
id: auto-mode-classifier-refuses-merge-after-g4
trigger: "when G4 is approved (including on a standing instruction) and the main session must merge a PR or publish to the default branch under Claude Code auto mode"
confidence: 0.5
domain: tooling
source: 2026-09-29-separate-the-integration-and-decision-case-studi, conductor-log.md 08:27 and 16:59; ship.md Deploy record
scope: project
---

## Action

The auto mode classifier can refuse the merge as dangerous even after G4 approval, and a standing instruction to "accept any gates" did not lift it. Only the owner's direct chat instruction for that action ("You merge it") did. When G4 is approved and the merge is refused, say so to the owner at once and ask for the merge instruction, rather than leaving the run idle. The auto-mode setup also soft-denies pushes to the default branch (believed, per the owner; not verified here), which would also catch the profile's owner-run prod command; the merge through `gh pr merge` was the path that actually published. Record which path published in the Deploy record.

## Evidence

- conductor-log.md 08:27: "The merge of PR #21 was refused by the Claude Code auto mode classifier as dangerous."
- conductor-log.md 16:59: merged on the owner's chat instruction "You merge it", merge e08f1bb at 16:57:47Z (confirmed via gh pr view).
- Clock: dead_minutes 516 (confirmed, wh.js status --metrics); the 512-minute gap 08:27 to 16:59 was waiting on that merge.

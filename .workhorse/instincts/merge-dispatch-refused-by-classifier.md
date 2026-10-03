---
id: merge-dispatch-refused-by-classifier
trigger: "when the conductor plans to dispatch wh-shipper (or any subagent) to merge a PR into the default branch after G4 approval"
confidence: 0.5
domain: workflow
source: 2026-09-25-rebuild-portfolio-to-approved-redesign, conductor-log.md lines 134-138, ship.md "Deploy record"
scope: project
---

## Action

After G4 was approved and the owner told the main session in chat "Merge and deploy it
yourself," the conductor dispatched wh-shipper in deploy mode to merge PR #19. The Claude Code
permission classifier refused that dispatch as a production deploy (confirmed, conductor-log
2026-09-28T17:47:24Z); nothing tried another route and the conductor reported a block. The
owner's direct instruction to the main session is what actually resolved it: the main session
merged PR #19 itself with `gh pr merge 19 --merge --match-head-commit 2705a6f` (merge commit
9c3377f, 2026-09-28T17:48:23Z), and deploy run 36460748579 succeeded.

In this repo, a merge to `main` is a production release (the deploy workflow triggers on push
to `main`). The permission classifier is expected to refuse a subagent-dispatched merge of the
default branch, the same way it refuses other production-deploy actions. Plan the deploy step
accordingly: after G4 approval, the merge itself is done by the owner, or by the main session
acting on the owner's direct instruction in chat, never by dispatching wh-shipper (or any
subagent) to run the merge. wh-shipper's role at that point is to record the deploy in ship.md,
not to perform it.

## Evidence

- `docs/sdlc/2026-09-25-rebuild-portfolio-to-approved-redesign/conductor-log.md:135` "D61: ...
  wh-shipper merges PR #19 with a merge commit at the approved head, any hook or permission
  denial is a true block and is not worked around"
- `docs/sdlc/2026-09-25-rebuild-portfolio-to-approved-redesign/conductor-log.md:137` "BLOCKED:
  dispatch of wh-shipper (mode deploy) to merge PR #19 was denied by the Claude Code permission
  classifier as a production deploy; merge not attempted by any other route; the owner merges
  PR #19 himself"
- `docs/sdlc/2026-09-25-rebuild-portfolio-to-approved-redesign/conductor-log.md:138` "resumed at
  deploy after the block: the owner told the main session 'Merge and deploy it yourself'; the
  main session merged PR #19 at head 2705a6f (merge commit 9c3377f...); deploy run 36460748579
  ... concluded success"
- `docs/sdlc/2026-09-25-rebuild-portfolio-to-approved-redesign/ship.md` "Deploy record": "The
  owner then told the main session in chat to merge and deploy it itself; the main session (not
  the owner) ran `gh pr merge 19 --merge --match-head-commit 2705a6f`."

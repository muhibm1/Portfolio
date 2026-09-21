---
id: worktree-fence-concurrent-conductor
trigger: "when hooks deny edits to two or more sensitive_paths files in the same build session with no clear reason"
confidence: 0.5
domain: workflow
source: 2026-09-21-serve-every-app-route-with-http-200-on-github-pa, conductor-log.md lines 15-19
scope: project
---

## Action

A second conductor session was running the same change concurrently (a locked worktree,
`state.worktree` set), and this left a stale worktree fence that made `protect-paths` deny
edits to `vite.config.js` and `.github/workflows/deploy.yml` even though the approved plan
named both files. The denial looked like an ordinary ask-first gate but was actually a stuck
fence from a second session, not resolvable by the builder itself. Before escalating a
multi-file sensitive-path denial to the owner as a plan/profile problem, check whether a second
conductor session or worktree is active (`state.worktree`, running agent processes) and clear
it first. This also produced a duplicate G2 approval written by an assistant rather than the
owner, because the second session reached its own gate independently.

## Evidence

- `docs/sdlc/2026-09-21-serve-every-app-route-with-http-200-on-github-pa/conductor-log.md:16`
  "blocked: second conductor running this change concurrently (resumed 16:54:10, T3 worktree
  agent-af9f403178ed99b06 locked); duplicate G2 approval 059dca7 written by an assistant, not
  the owner; T1 vite.config.js edit still denied by hook."
- `docs/sdlc/2026-09-21-serve-every-app-route-with-http-200-on-github-pa/conductor-log.md:19`
  owner note: "the earlier vite.config.js and deploy.yml denials came from the worktree fence
  while a second conductor had state.worktree set; that conductor is stopped, the fence is
  clear (state.worktree null), and protect-paths now returns allow for both files because the
  approved plan names them."

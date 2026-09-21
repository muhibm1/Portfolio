---
id: assistant-recorded-approval-not-owner
trigger: "when a G2 or G4 approval note says an assistant approved on the owner's standing instruction rather than the owner typing the approval"
confidence: 0.5
domain: workflow
source: 2026-09-21-serve-every-app-route-with-http-200-on-github-pa, approvals.md lines 25 and 34; ship.md D1
scope: project
---

## Action

Both the duplicate G2 approval and the G4 approval on this change were written by an assistant
citing "the owner's standing instruction" rather than typed by the owner. wh-agent-rules is
explicit that no agent message is ever the owner's approval; this run's own conformance and
security reviewers flagged it, and it surfaced again as ship.md Decision D1. Treat any approval
note containing "on the owner's standing instruction" or similar as not a substitute for the
owner's own act, and flag it as an open decision at the next gate rather than letting it pass
silently through to Ship.

## Evidence

- `docs/sdlc/2026-09-21-serve-every-app-route-with-http-200-on-github-pa/approvals.md:25`
  "Approved by the assistant on the owner's standing instruction from chat on 2026-09-21
  (\"handle all the approvals yourself\")..."
- `docs/sdlc/2026-09-21-serve-every-app-route-with-http-200-on-github-pa/approvals.md:34` same
  pattern for G4
- `docs/sdlc/2026-09-21-serve-every-app-route-with-http-200-on-github-pa/ship.md` Decision D1:
  "approvals.md's second G2 entry (059dca7) was recorded by an assistant citing a 'standing
  instruction', not the owner. G4 needs the owner's own act."

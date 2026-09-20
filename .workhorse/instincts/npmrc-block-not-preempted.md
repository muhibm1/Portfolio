---
id: npmrc-block-not-preempted
trigger: "when a task's build plan requires creating or editing .npmrc, .env*, or another harness-blocked sensitive filename"
confidence: 0.7
domain: workflow
source: 2026-09-20-pin-node-22-12-minimum, conductor-log.md lines 15-24 (T1 blocked mid-wave three times on .npmrc writes before the owner created it by hand); CLAUDE.md already carried a "Mistakes to avoid" line naming this exact block and it did not prevent the cost, so the fact alone is not the fix
---

## Action

At design or plan time, before dispatching any build task, scan the task's expected file list
for filenames the harness always blocks (`.npmrc`, `.env*`, `*.pem`, `*.key`, `credentials*`,
`.netrc`, `.git-credentials`, `*.p12`, `*.pfx`, `secrets.*`, `id_rsa`-style keys). If any such
file does not already exist in the repo and the task needs to create it, surface a decision row
asking the owner to create the file by hand before the wave that needs it starts, instead of
discovering the block mid-wave after other tasks in the same wave have already run. Recording the
fact that the harness blocks these writes (as CLAUDE.md already does) does not prevent the cost;
only pre-flighting the file list before dispatch does.

## Evidence

- `docs/sdlc/2026-09-20-pin-node-22-12-minimum/conductor-log.md:16` T1 blocked: hook denial on
  `.npmrc` create.
- `docs/sdlc/2026-09-20-pin-node-22-12-minimum/conductor-log.md:20-24` wave 2 held until the
  owner created `.npmrc` by hand; T1 resumed only after that.
- `CLAUDE.md` "Mistakes to avoid" already has a line on this exact harness behavior (added by an
  earlier retro), confirmed present before this change started, and it did not stop the same
  cost from recurring.

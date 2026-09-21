---
id: builder-turn-limit-before-commit
trigger: "when a wh-builder task involves a layered or multi-pass implementation (e.g. multiple encoding/format branches, several exit-code paths) inside one wave"
confidence: 0.5
domain: workflow
source: 2026-09-20-fix-phone-redaction-scanner, conductor-log.md line 12-13 ("t2 builder hit its turn limit before committing; conductor ran the checks and committed the finished diff")
scope: project
---

## Action

A build task with several interacting layers (here: a layered UTF-8/UTF-16 scan plus a
hit-outranks-incomplete exit rule, with 44 tests) can exhaust a builder's turn budget before it
reaches its own commit step, even though the work itself finishes correctly. When planning waves
at design time, prefer splitting a task like this into a smaller implementation step and a
separate verification/commit step, or flag it for a higher turn allowance, rather than relying on
the conductor to finish the commit after the fact. This is not yet a strong pattern; watch for a
second occurrence before promoting it to CLAUDE.md.

## Evidence

- `docs/sdlc/2026-09-20-fix-phone-redaction-scanner/conductor-log.md:12` "layered UTF-8/UTF-16
  scan, hit-outranks-incomplete exit; 44 tests in file, suite 273 pass, lint+build 0, real scan
  clean 0 hits 0 undecodable"
- `docs/sdlc/2026-09-20-fix-phone-redaction-scanner/conductor-log.md:13` "t2 builder hit its turn
  limit before committing; conductor ran the checks and committed the finished diff (3cbce64);
  worktree isolation blocked a second builder from that tree"

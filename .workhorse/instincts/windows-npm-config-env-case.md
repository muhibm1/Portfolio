---
id: windows-npm-config-env-case
trigger: "when a test spawns a child process and strips or overrides npm-related environment variables to simulate a clean or specific npm config"
confidence: 0.5
domain: testing
source: 2026-09-20-pin-node-22-12-minimum, conductor-log.md lines 25-28 (npm exports NPM_CONFIG_* uppercase on Windows; a test helper stripping lowercase env names leaked ENGINE_STRICT and LOCAL_PREFIX into the fixture child, failing FL53 and FL55 until fixed)
---

## Action

On Windows, npm sets `NPM_CONFIG_*` environment variables in uppercase before running lifecycle
scripts or spawning child processes, regardless of how the setting name is cased elsewhere. Any
test helper that filters, strips, or overrides `npm_config_*`-style environment variables for a
child process must compare names case-insensitively (uppercase both the actual env var name and
the name being matched before comparing), not just handle the lowercase form seen on POSIX. Write
this into any fixture helper that manipulates `process.env` before spawning a child to test npm
behavior, and add a case-variant to the test data so a regression fails loudly rather than only
on a Windows CI runner or a Windows contributor's machine.

## Evidence

- `docs/sdlc/2026-09-20-pin-node-22-12-minimum/conductor-log.md:26` "confirmed cause: on Windows
  npm exports NPM_CONFIG_* uppercase, so the test helper's lowercase strip leaks ENGINE_STRICT and
  LOCAL_PREFIX into the fixture child."
- `docs/sdlc/2026-09-20-pin-node-22-12-minimum/conductor-log.md:28` fix: "strippedEnv now
  case-insensitive, 10/10 pass."

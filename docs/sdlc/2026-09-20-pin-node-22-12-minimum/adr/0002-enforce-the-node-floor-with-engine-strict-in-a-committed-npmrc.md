# 0002: Enforce the Node floor with engine-strict in a committed .npmrc

Date: 2026-09-20
Status: proposed
Change: 2026-09-20-pin-node-22-12-minimum

## Context

R108 requires `npm ci` to fail with a clear message below Node 22.12.0. npm's default on an
`engines` mismatch is a warning and exit 0 (confirmed by fixture under npm 10.7.0). The host's
npm is 10.7.0, a global install shadowing the 11.17.0 bundled with Node 24 (confirmed versions).
The CI runner's npm is whatever ships with the newest 22.x. Anything chosen must fail on both.

## Decision

Commit `.npmrc` at the repository root containing one comment line and `engine-strict=true`.
npm reads a project `.npmrc` for every command run inside the repository, so `npm ci` and
`npm install` exit 1 with `EBADENGINE`, the required range and the actual version whenever the
root `engines` is not satisfied (confirmed by fixture). The setting is exempt for optional
dependencies, which npm marks inert instead (confirmed by fixture and arborist source).

## Alternatives

| Option | Why not |
|--------|---------|
| `devEngines` in `package.json` with `onFail: error` | Ignored by npm 10.7.0: exit 0, no output (confirmed). It would enforce only in CI, which is the gap the request describes |
| A `preinstall` script checking `process.version` | Runs after resolution, is skipped by `--ignore-scripts`, and re-implements a check npm already has |
| `engine-strict` in each developer's user config | Not in the repository, so a fresh clone gets nothing |

## Consequences

Easier: the failure is npm's own, well known, and names the file and both versions. Harder:
`.npmrc` is a file that often carries registry tokens, so R107 pins it to one setting and AD23
watches for credential-shaped lines. `npm run` exports the setting to child processes as
`npm_config_engine_strict=true` (confirmed), so any test that spawns npm against a fixture must
strip `npm_config_*` from the child environment. Any future dependency whose engines exclude the
running Node will fail to install rather than warn; that is intended, and it is decided by a
human at that time. Because `npm ci` is a step of the publishing workflow, the first place that
failure will be seen is a red deploy run at "Install dependencies", not a local shell (audit low
finding 2). After the audit, R113 and ADR 0004 add a CI guard that reads `.npmrc` before install.

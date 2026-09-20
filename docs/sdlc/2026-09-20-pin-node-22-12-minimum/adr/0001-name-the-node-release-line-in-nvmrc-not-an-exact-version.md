# 0001: Name the Node release line in .nvmrc, not an exact version

Date: 2026-09-20
Status: proposed
Change: 2026-09-20-pin-node-22-12-minimum

## Context

R105 adds `.nvmrc`; R106 sets the floor `>=22.12.0`; R110 makes the deploy workflow read `.nvmrc`
(ADR 0003). A `.nvmrc` file names one version spec, not a range. Today the workflow says
`node-version: 22` and the last run resolved it to v22.23.2 (confirmed, run 34907688065 log).
The lockfile's only package that excludes 22.12.0 is the optional Linux binding
`@napi-rs/lzma-linux-x64-gnu`, `^22.20 || ^24.12 || >=25` (confirmed by scan). The owner's
host runs v24.19.0 with a v22.12.0 copy under nvm for Windows (confirmed, and memory notes).

## Decision

`.nvmrc` contains the single line `22`. It names the release line developers and CI should use;
the exact floor lives in `package.json` `engines` and is enforced by `.npmrc` (ADR 0002). CI keeps
resolving the newest 22.x exactly as it does today.

## Alternatives

| Option | Why not |
|--------|---------|
| `22.12.0` exact | Moves CI from the newest 22.x to a December 2024 release, forgoing security patches, and lands below the lzma binding's `^22.20`, so that optional package is silently skipped on the runner |
| `lts/jod` | Same resolution as `22` on setup-node and nvm, but a codename a reader has to look up |
| `24` | Newer than anything CI has run; changing the runner's major is a separate decision with its own test run |

## Consequences

Easier: one file names the line, and bumping to 24 later is a one-character change plus a CI run.
Harder: `22` alone does not exclude 22.0 to 22.11; a machine whose nvm has only 22.11 installed
gets it, and then `npm ci` fails with the R108 message. That is the loud failure the request asks
for, not a silent one. Revisit when Node 22 leaves active support (April 2027, believed).

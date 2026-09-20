# 0003: Point the deploy workflow at .nvmrc instead of a second Node number

Date: 2026-09-20
Status: proposed
Change: 2026-09-20-pin-node-22-12-minimum

## Context

`.github/workflows/deploy.yml` lines 43 to 47 set `node-version: 22` on `actions/setup-node`
pinned at SHA `8207627` (v7.0.0). That action accepts `node-version-file` with `.nvmrc`, and
when both inputs are given `node-version` wins (confirmed, `action.yml` and README at that SHA).
The workflow is a sensitive path and a tier-2 floor path (profile lines 74 and 156). R105 adds
`.nvmrc` = `22` (ADR 0001).

## Decision

Replace `node-version: 22` with `node-version-file: .nvmrc` in the setup-node step, keep
`cache: npm`, rename the step so it no longer hard-codes "22", and add this change's spec to the
header source comment. The only other line that changes is the one R113 appends to the
pre-install guard step (ADR 0004); R114 asserts the permission blocks and `persist-credentials`
are untouched. The version the runner resolves is the same as today.

## Alternatives

| Option | Why not |
|--------|---------|
| Leave `node-version: 22` | Two places name the line; the next bump edits one and forgets the other, which is the class of drift this change exists to remove |
| Put `.nvmrc` on the workflow and drop `engines` | `.nvmrc` does nothing on a machine without nvm and nothing at install time; it cannot fail `npm ci` |

## Consequences

Easier: bumping Node is one file and one CI run. Harder: the edit needs the owner's prompt for a
sensitive path, and a test (R110) must guard against someone re-adding `node-version`, which
would silently override the file. If `.nvmrc` is ever missing, the job fails at the setup step
rather than at lint, which is earlier and clearer.

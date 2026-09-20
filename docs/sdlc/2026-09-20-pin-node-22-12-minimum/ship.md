# Ship: Pin Node 22.12 minimum

Change id: `2026-09-20-pin-node-22-12-minimum` · Tier 2 · Branch `wh/2026-09-20-pin-node-22-12-minimum` at `7b25b72` · PR: not opened (blocked, see below)
Prepared 2026-09-20 UTC · Design approved: see [approvals.md](./approvals.md)

## The short version

This change pins Node 22.12.0 as the floor for this static site, so `npm ci` fails loudly with
npm's own error on an older Node instead of the linter failing later with a confusing message.
It adds three small files, a CI guard script, a deploy workflow edit, and 36 new tests across
four files. The reader is deciding whether to merge and let the automatic environments deploy.

## What changed

Ordered by risk. 15 files, 884 insertions, 36 deletions (`git diff --stat main...HEAD`).

1. `.npmrc` — one line, `engine-strict=true` (R107); created by the repository owner by hand
   because the agent harness refuses to write this filename at all.
2. `.nvmrc` — new, `22`, tells version managers and CI which Node line to use (R105).
3. `package.json` — adds `engines.node: ">=22.12.0"` (R106, R109).
4. `package-lock.json` — mirrors the same `engines` object on the root package entry; no
   dependency added or changed.
5. `scripts/check-npmrc.mjs` — CI guard run before `npm ci`. Now requires the allowed line be
   present (not just absent extras), splits on a lone CR as well as LF/CRLF so a hidden
   registry line cannot ride in a comment, strips a BOM, accepts spaced `engine-strict = true`,
   and never prints a value. Exits 1 on a wrong file, 2 if missing (R113).
6. `.github/workflows/deploy.yml` — reads `.nvmrc` instead of a hardcoded Node number; adds a
   pre-install step running the dependency-pin check plus the new `.npmrc` guard (R110, R113).
7. `.workhorse/profile.yml` — adds `.npmrc`, `.nvmrc`, `scripts/check-npmrc.mjs` to
   `sensitive_paths` (ask-first) and the script to tier 2 `tier_floor_paths` (R112).
8. `CLAUDE.md`, `docs/sdlc/codebase-map.md`, `docs/sdlc/constraints.md` — correct the old wrong
   diagnosis (an "npm bug") to the real cause (an unpinned Node floor), and record that the
   harness cannot write `.npmrc` (R111).
9. `src/nodeVersionPin.test.js` (10 tests) — the pin, `.npmrc` content, `npm ci` pass/fail at the
   floor; asserts the repository's own `node_modules` is unchanged after every fixture spawn;
   isolates FL53 from the host's user-level npm config; force-kills the shell-fallback spawn's
   process tree on timeout.
10. `src/checkNpmrc.test.js` (13 tests) — the guard's exit codes and messages, including the two
    new lone-CR deny cases and a `spawnSync` timeout.
11. `src/deployWorkflowNodeVersion.test.js` (5 tests) — pins the workflow's Node source and its
    three `permissions:` blocks.
12. `src/nodePinDocsAndProfile.test.js` (10 tests) — turns three previously verifier-only checks
    (doc corrections, profile guard entries) into permanent tests.
13. `docs/sdlc/.../conductor-log.md` — process record, not requirement-bearing.

## Proof

Re-verified at commit `7b25b72` (`verification.md`).

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `npm ci` | 0 | verify-logs/install.log | confirmed |
| typecheck | (none) | - | no check defined | not counted |
| lint | `npm run lint` | 0 | verify-logs/lint.log | confirmed |
| test | `npm test` | 0 | verify-logs/test.log | confirmed |
| build | `npm run build` | 0 | verify-logs/build.log | confirmed |
| e2e | (none) | - | no check defined | not counted |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | verify-logs/security_audit.log | confirmed |
| screenshot | (none) | - | no check defined | not counted |

Evals: golden 11/11, edge 3/3, failure 5/5, adversarial 5/5, all against 100% target. 246 tests
across 29 files, 0 failed. `evals.md` NF26 states an expected 227 tests / 28 files; the observed
246 / 29 is a stale plan number, not a defect: the round-2 fix added 3 tests to
`checkNpmrc.test.js` and the count only ever grows past the floor (verification.md, confirmed).
Known pre-existing failures cited: none (`wh.js known-failure list` returned none, confirmed).

## What the reviewers found

Eight reviewers ran. Reports: [reviews/](./reviews/). Two reviewers on one issue share a row.

| Severity | Reviewer | File:line | Finding | Resolution |
|----------|----------|-----------|---------|------------|
| high | wh-bug-reviewer | scripts/check-npmrc.mjs:34-37 | Guard exited 0 for an `.npmrc` that never set `engine-strict=true` at all (empty, comments-only, or the line removed) | fixed in 248182e |
| high | wh-security-reviewer | scripts/check-npmrc.mjs:62-69 | Guard stripped every `\r` then split only on `\n`; npm's own ini parser splits on a lone `\r` too, so a comment line hiding a lone-CR registry setting passed the guard and was honoured by npm | fixed in 1dbf781 |
| high | ecc-pr-test-analyzer | src/nodeVersionPin.test.js | No test asserted the repository's own `node_modules` survives the fixture `npm ci` spawns, the exact bug d5c0114 fixed once already | fixed in b182c8a |
| medium | wh-bug-reviewer | src/nodeVersionPin.test.js:187-195 | FL53 depended on the host's own user-level npm config instead of an isolated scratch HOME | fixed in b182c8a |
| medium | ecc-silent-failure-hunter | src/nodeVersionPin.test.js:229-249 | "npm run exports engine-strict" case never asserted `result.status`, so a broken spawn could pass vacuously | fixed in b182c8a |
| medium | ecc-typescript-reviewer | scripts/check-npmrc.mjs:38-58 | No BOM strip before comparing lines; a functionally correct file saved with a BOM failed the guard | fixed in 248182e |
| medium | wh-bug-reviewer, ecc-typescript-reviewer | src/checkNpmrc.test.js:34/43 | `spawnSync` had no timeout; a wedged child would hang the suite instead of failing | fixed in 248182e |
| medium | wh-adoption-reviewer | CLAUDE.md:52 | The harness's inability to create or edit `.npmrc` at all was undocumented; this change's own build lost time to it twice | fixed in 495c05b |
| medium | ecc-pr-test-analyzer | evals.md GC113/GC116/GC117 | Doc-correction and profile-guard requirements were verifier commands only, no permanent test | fixed in 2ddbe37 |
| medium | ecc-typescript-reviewer | src/nodeVersionPin.test.js:75-79 | Shell-fallback spawn path (no `npm_execpath`) could leave an orphaned process tree on a Windows timeout | fixed in 7b25b72 |
| low | wh-bug-reviewer | scripts/check-npmrc.mjs:53 | `engine-strict = true` (spaced) was rejected though npm accepts it | fixed in 248182e |
| low | wh-bug-reviewer | .npmrc:1 | No explanatory comment line (spec Interfaces (c)) | open: owner decision, D14a |
| low | wh-bug-reviewer | .github/workflows/deploy.yml:44-50 | `setup-node`'s npm-cache step reads `.npmrc` once before the guard step runs | open: owner decision, D14b |
| low | wh-security-reviewer | .github/workflows/deploy.yml:90 | Guard judges the file, not npm's effective config; an inherited `~/.npmrc` or `npm_config_*` variable is invisible to it | open: not fixed, carried here so it is not hidden |
| low | ecc-typescript-reviewer | src/nodeVersionPin.test.js:158-168 | EBADENGINE case does not distinguish a real failure from a timed-out spawn (`status: null`) | open: not fixed |
| low | ecc-silent-failure-hunter | .github/workflows/deploy.yml:47-89 | Step relies on the implicit `-eo pipefail` for `shell: bash`, not restated locally | open: reviewer proposed no change unless the step is copied elsewhere |
| low | ecc-pr-test-analyzer | src/deployWorkflowNodeVersion.test.js:83-115 | Permissions test locates blocks by line order, no indentation check | open: reviewer proposed no fix, would need a YAML parser the plan ruled out |

wh-conformance-reviewer: 0 findings, 11 of 11 requirements traced. wh-adoption-reviewer: adoption
score 4 of 5. ecc-react-reviewer: not applicable, no React or JSX in this diff.

## Decisions

D1 to D11 were approved by the owner at G2 on 2026-09-20 (approvals.md): the release-line vs
exact-pin choice, `engine-strict` over `devEngines`, pointing the workflow at `.nvmrc`, the
lockfile hand-edit, correcting four documents, the 22.12.0 floor, guarding the three new files,
running the `.npmrc` check pre-install, pinning workflow permissions with a test, and diffing the
profile edit.

| # | Decision | Recommendation | Alternative | Why |
|---|----------|----------------|-------------|-----|
| D14a | `.npmrc` comment line from spec Interfaces (c), missing because the harness cannot write this file | Owner prepends the comment by hand after merge | Leave it bare, rely on CLAUDE.md and the guard script | The brief's own first risk row is someone deleting `.npmrc` as unused; the comment is that risk's only local mitigation |
| D14b | `setup-node`'s `cache: npm` step reads `.npmrc` once before the guard step vets it | Accept for now, residual recorded in spec.md | Move the guard above `setup-node`, which works because ubuntu-latest ships a preinstalled Node | No package is fetched at that point, but reordering the only path that publishes the site needs the owner's own judgement |
| D15 | This document's dev-rollback rehearsal could not exercise the stop/redeploy half: `tasklist`, `netstat` and `wmic` (needed to find and confirm-kill the dev server's PID) were each refused by a permission this session lacks | Accept the partial rehearsal: deploy step confirmed, stop/redeploy steps not exercised | Grant the permission this session and repeat the rehearsal | Dev is a stateless local server, so nothing is at risk from an unrehearsed stop; the deploy half, the part that matters for this change, is confirmed |
| D12 | FL55 could not assert a literal `EBADENGINE` string, since npm still warns with `engine-strict` off | Assert exit 0 and the absence of `npm error`, builder-confirmed | Cut the case | Only option that does not depend on npm's exact warning text |
| D13 | Fixture spawn helper leaked npm config into children on Windows (uppercase `NPM_CONFIG_*`), once deleting the repo's own `node_modules` | Fix the helper to strip and merge case-insensitively | Drop the two affected eval cases as unautomatable | The bug is real and already caused damage once; dropping the cases hides it |

## Deploy and undo

| Environment | Command | Automatic on approval | Rollback |
|-------------|---------|------------------------|----------|
| dev | `npm run dev` | yes | stop the process; no state changes |
| staging | (none configured) | no | not applicable |
| prod | owner squash-merges the PR to `main` (`gh pr merge --squash`) | no (owner performs production merges himself, CLAUDE.md) | `git revert 7ea3583` on `main`, then the owner pushes |

No secret or environment variable is touched by this change. Rehearsed in dev this session:
`npm run dev` started cleanly (confirmed, `Local: http://localhost:5174/Portfolio/`, ready in
455 ms, no error output). The rollback and redeploy halves of the three-step rehearsal (stop the
process, confirm it is gone, start it again) could not run: the process-management commands
needed (`tasklist`, `netstat`, `wmic`) are each gated by a permission this session was not
granted. The background dev server this session started terminates when this run ends. Not fully
rehearsed: gap recorded as decision D15.

Done by the owner by hand, outside this pipeline: pushed the branch, opened PR 11, and
squash-merged it to `main` at `7ea3583` (confirmed, `gh pr list --state all`). See Deploy record
below for the resulting publish.

## Clock

Clock: agents 1 h 43 m of 1 h 30 m budget (OVER, by 13 m) · waiting on you 2 h 43 m ·
dead 3 h 55 m · unexplained gaps 2 h 09 m · your time 0 m · wall 10 h 29 m

## Your decision

Approved by the owner at G4, 2026-09-20T19:21:40Z (approvals.md), despite the PR not being open,
with notes accepting D12, D13, D15. See Deploy record below for what ran under that approval.

## Deploy record

| Environment | Command | Exit code | Timestamp (UTC) | Status |
|-------------|---------|-----------|------------------|--------|
| dev | `npm run dev` | n/a, long-running process | 2026-09-20T19:26:47Z | confirmed: Vite 5.4.21 ready in 2877 ms, served at `http://localhost:5176/Portfolio/` (ports 5173-5175 in use by other sessions), no error output |
| staging | (no command in profile) | - | - | not run: no deploy command configured for staging |
| prod | owner squash-merged PR 11 (`gh pr merge --squash`) to `main` at `7ea3583`; publishing workflow run 35536692240 | 0 (workflow conclusion: success) | 2026-09-20T20:48:04Z created, 20:48:56Z completed | confirmed: `gh run view 35536692240` shows both jobs succeeded, including "Deploy to GitHub Pages" and the post-deploy smoke tests (R63, R80, R81, R82, R87, R100) |

Merge and production publish confirmed complete, done by the owner outside this pipeline; the
earlier push block is resolved. Not verified by this session: an independent fetch of the
published URL. The workflow's own smoke test (R63) fetched it and passed, confirmed via `gh run view`.

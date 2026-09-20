# Spec: pin Node 22.12 minimum

Change id: `2026-09-20-pin-node-22-12-minimum`
Intent: none written (G1 auto, `conductor-log.md`). The request, verbatim: "The project requires Node 22.12 or newer for oxlint but pins no Node version anywhere, so a fresh clone or CI runner can silently get an incompatible Node and lint fails for a reason that looks like a toolchain bug -> .nvmrc and the package.json engines field pin Node >=22.12, and npm ci fails with a clear message below that version"
Status: draft, revised 2026-09-20 after the constraint audit (see "Response to audit")
Tier: 2 (`package.json`, `package-lock.json` and `.github/workflows/deploy.yml` are edited; all three are in `tier_floor_paths: 2` and `sensitive_paths`, profile lines 73 to 82 and 156, confirmed)
Policy skills applied: wh-agent-rules, wh-security-baseline, wh-readable-code, wh-adr, wh-evals. `profile.compliance.regimes` is empty (confirmed), so no compliance skill applies.
Written 2026-09-20 by the designer. Every claim is labelled confirmed (observed this session) or believed, not verified.

## Summary

Three small files at the repository root will state and enforce the Node version this project needs: `.nvmrc` names the release line for developers and CI, `package.json` `engines` names the floor `>=22.12.0`, and a committed `.npmrc` turns npm's engines check from a warning into a hard failure. The deploy workflow will read `.nvmrc` instead of carrying its own Node number, and four documents that still blame the oxlint failure on an npm bug will be corrected. The one design decision that matters is enforcement: npm only warns on an engines mismatch by default, and `engine-strict=true` in a committed `.npmrc` is the only mechanism that works on both the owner's npm 10.7.0 and the CI runner's npm (ADR 0002). Because `.npmrc` is also the file npm reads for registry and auth settings, the audit added a guard that checks its content in CI before `npm ci` runs (R113, ADR 0004), put the new files under the profile's edit prompt (R112), and pinned the workflow's permission blocks and the profile's control keys with checks (R114, R115).

## What was verified before writing

| Fact | Status |
|------|--------|
| oxlint 1.82.0 (installed and in the lockfile) declares `engines.node: "^20.19.0 \|\| >=22.12.0"` | confirmed, `node_modules/oxlint/package.json` and `package-lock.json` |
| This host now runs Node v24.19.0 and npm 10.7.0; `npm run lint` exits 0 and `npm test` passes 208 tests in 25 files | confirmed, run this session. The docs still say v21.7.3 (R111) |
| The npm on PATH is a global 10.7.0 under `%APPDATA%\npm`, shadowing the 11.17.0 bundled with Node 24 | confirmed for the version numbers; the shadowing mechanism is believed |
| No `.nvmrc`, `.node-version`, `.npmrc`, `.tool-versions` or `engines` field exists in the repository | confirmed, `git ls-files` and `package.json` |
| Project `.npmrc` with `engine-strict=true`: `npm ci` exits 1 with `EBADENGINE`, `Required` and `Actual` lines. Without it: exit 0, `npm warn EBADENGINE`. A `#` comment line in `.npmrc` is accepted | confirmed, three throwaway fixtures under npm 10.7.0 |
| `npm ci` reads the root `engines` from `package.json`, not from the lockfile root entry, and does not treat a lockfile root entry that lacks `engines` as out of sync | confirmed, fixtures |
| `devEngines` in `package.json` is ignored by npm 10.7.0 (exit 0, no message) | confirmed, fixture |
| Under `engine-strict`, an optional dependency whose engines range fails is skipped, not fatal | confirmed on npm 10.7.0 by fixture; the rule is in npm 11.17.0's arborist `build-ideal-tree.js` lines 195 to 224 (read) |
| Of 268 lockfile packages, 165 declare `engines.node`; only `@napi-rs/lzma-linux-x64-gnu` (`^22.20 \|\| ^24.12 \|\| >=25`, optional, Linux only, under rollup 4.63.2) excludes 22.12.0; nothing excludes 22.99.0 or 24.19.0 | confirmed, scan with npm's bundled semver |
| The last CI run (2026-09-14, run 34907688065) resolved `node-version: 22` to Node v22.23.2 | confirmed, run log |
| setup-node at the pinned SHA accepts `node-version-file` with `.nvmrc`; when both inputs are given, `node-version` wins | confirmed, `action.yml` and README at `8207627` |
| `npm run` exports a project `.npmrc` setting to child processes as `npm_config_engine_strict=true`, and sets `npm_execpath` | confirmed, fixture |
| The working tree has CRLF line endings (`core.autocrlf=true`); committed blobs are LF | CRLF confirmed by byte count; LF-on-commit is git's documented autocrlf behaviour, not observed here |
| `deploy.yml` has three `permissions:` blocks (workflow line 16, build job 33 to 35, deploy job 158 to 160) and `persist-credentials: false` at line 41; the pre-install guard step "Dependency pin check (R85)" is at line 49 and `npm ci` at line 91; no file under `src/` reads the workflow | confirmed, read this session |
| `scripts/check-built-css-fonts.mjs` is the repo's pattern for a CI guard: exit 0 clean, 1 violation, 2 could not run, `::error::` prefix, 60-character excerpt cap, tested by `src/checkBuiltCssFonts.test.js` with `spawnSync` against fixture directories | confirmed, read this session |
| `.gitignore` line 16 is `.env*`; `constraints.md` known debt row 6 (line 146) and risk row line 351 say the pattern is missing | confirmed, both files read |

## Requirements

Ids continue from the previous change (R93 to R104). Each is SHALL and testable.

| ID | Requirement | Acceptance check | Source |
|----|-------------|------------------|--------|
| R105 | The repository root SHALL contain `.nvmrc` whose only content is the line `22`, the major of the R106 floor, so nvm and setup-node resolve the newest 22.x they have | Test reads the file, normalises line endings, asserts exactly `22` on one line with no byte-order mark; `git ls-files --eol .nvmrc` reports `i/lf` | request outcome; ADR 0001 |
| R106 | `package.json` SHALL declare `engines.node` as `>=22.12.0`, and the root entry of `package-lock.json` (`packages[""]`) SHALL carry an identical `engines` object | Test parses both files and asserts each equals `{ "node": ">=22.12.0" }` | request outcome; oxlint engines (confirmed) |
| R107 | The repository root SHALL contain `.npmrc` whose only non-comment line is `engine-strict=true`, with no registry, auth, token, scope or always-auth setting | Test: non-comment lines equal exactly `["engine-strict=true"]`; no line matches `/_auth\|token\|registry\|always-auth\|scope/i` | ADR 0002; wh-security-baseline, secrets |
| R108 | With R106 and R107 in place, `npm ci` under a Node that fails the floor SHALL exit non-zero before installing anything and print `EBADENGINE`, the required range and the running Node version | Fixture test: the repo's `.npmrc` copied byte for byte, engines `>=999.0.0` as the stand-in for an unsupported Node; exit code not 0; output contains `EBADENGINE`, `>=999.0.0` and `process.version`. Control fixture with `>=22.12.0` exits 0. Fixture without `.npmrc` exits 0 with `npm warn EBADENGINE` | request outcome |
| R109 | Under a Node that satisfies the floor, `npm ci` SHALL succeed unchanged: no non-optional lockfile package declares an engines range that excludes 22.12.0 or the Node CI resolves | `npm ci` (profile `commands.install`) exits 0 on this host (v24.19.0) and in the CI run of the change | lockfile scan (confirmed) |
| R110 | The setup-node step of `.github/workflows/deploy.yml` SHALL take its version from `.nvmrc` through `node-version-file: .nvmrc`, keep `cache: npm`, and SHALL NOT set `node-version`. Apart from the header comment and the one line R113 adds to the guard step, no other line changes | Test: exactly one `node-version-file: .nvmrc` line, zero `node-version:` lines, `cache: npm` present, the named file exists; `git diff` of the workflow shows three hunks: header comment, setup-node step, guard step; R114's test proves the privileged lines are untouched | ADR 0003; setup-node README (confirmed) |
| R111 | `CLAUDE.md`, `.workhorse/profile.yml`, `docs/sdlc/codebase-map.md` and `docs/sdlc/constraints.md` SHALL state the Node floor and where it is pinned, SHALL no longer attribute the oxlint `Cannot find native binding` failure to npm issue 4828 or give v21.7.3 as the host Node, and `constraints.md` SHALL no longer say `.gitignore` lacks an `.env` pattern | `grep -c "22.12" CLAUDE.md .workhorse/profile.yml` at least 1 each; `grep -c "4828" CLAUDE.md` is 0; `grep -c "v21.7.3"` is 0 in both discovery documents; `grep -ci "no .\.env. pattern" docs/sdlc/constraints.md` is 0; the two discovery documents are read by the reviewer | retro 2026-09-11, "What it missed" item 2 (confirmed); audit low finding 3 |
| R112 | `.workhorse/profile.yml` `sensitive_paths` SHALL list `.npmrc`, `.nvmrc` and `scripts/check-npmrc.mjs`, each with a trailing comment naming why, and `tier_floor_paths` `2` SHALL list `scripts/check-npmrc.mjs`, so editing any of them prompts the owner and floors the tier, as `package.json` and `scripts/check-built-css-fonts.mjs` already do | `grep -c` for each of the three quoted paths under `sensitive_paths` prints 1; the `2:` line of `tier_floor_paths` contains `scripts/check-npmrc.mjs`; the profile still loads | audit medium finding 1; D7, D11 |
| R113 | `scripts/check-npmrc.mjs` SHALL exit 0 when `<dir>/.npmrc` (default: the repository root) has `engine-strict=true` as its only non-comment line, exit 1 naming each other non-comment line by number and key, never its value, and exit 2 naming the path when the file is missing or unreadable. `deploy.yml` SHALL run it as the last line of the existing pre-install guard step, before `npm ci` | Tests spawn the script against fixture directories and judge exit code and output; a workflow test finds `node scripts/check-npmrc.mjs` exactly once, inside the guard step, on a lower line than `run: "npm ci"`, and the script file exists | audit medium finding 2; D8; ADR 0004 |
| R114 | `deploy.yml` SHALL keep exactly three `permissions:` blocks with their current scopes (workflow: `contents: read`; build job: `contents: read`, `pages: read`; deploy job: `pages: write`, `id-token: write`), `persist-credentials: false` on the checkout step, and no other `write` scope anywhere | Test asserts each block's lines in order, exactly three `permissions:` lines, exactly two lines ending `: write`, and one `persist-credentials: false` | audit medium finding 3; D9 |
| R115 | The R111 and R112 edit of `.workhorse/profile.yml` SHALL leave `protected_paths`, `deny_commands` and `ask_commands` byte-identical and SHALL change `sensitive_paths` only by the three R112 additions | `git diff main...HEAD -- .workhorse/profile.yml`: no `-` line and no `+` line inside the `protected_paths`, `deny_commands` or `ask_commands` blocks; inside `sensitive_paths` exactly three `+` lines, the R112 paths, and no `-` line | audit medium finding 4; D10 |

Non-functional: NF25 and NF26 in `evals.md` bound the run time of the new tests and keep the CI test-count floor (R52, `deploy.yml` line 105) satisfied.

## Design

### Architecture

No runtime code changes. The change sits entirely in the toolchain layer described in `docs/sdlc/codebase-map.md` "Build and deploy":

- `.nvmrc` (new): read by nvm on Unix, by setup-node in CI, and by nothing at runtime. nvm for Windows does not read it (believed, not verified); the owner's host already satisfies the floor.
- `.npmrc` (new): read by every npm command run from the repository. Its one setting makes the R106 floor fatal.
- `package.json` and `package-lock.json` (modified): the `engines` object, and its mirror in the lockfile root entry so the next `npm install` or Dependabot regeneration produces no unrelated diff (`npm ci` itself does not need the mirror, confirmed).
- `scripts/check-npmrc.mjs` (new): the R113 allowlist, shaped like `scripts/check-built-css-fonts.mjs`. Responsibility: read one `.npmrc`, pass only the permitted content, fail loudly otherwise. Interface: (h) below. Dependencies: `node:fs`, `node:path`, `node:url` only.
- `.github/workflows/deploy.yml` (modified): the header source comment, the setup-node step (lines 43 to 47), and one line appended to the guard step at line 49.
- `src/nodeVersionPin.test.js`, `src/checkNpmrc.test.js` and `src/deployWorkflowNodeVersion.test.js` (new): Vitest files under `src/`, where `vite.config.js` line 44 discovers tests, following `src/checkBuiltCssFonts.test.js` (spawn the real tool, judge exit code and output, never import it).
- `.workhorse/profile.yml` (modified): three `sensitive_paths` lines, one `tier_floor_paths` entry, the `commands.lint` comment and one `notes` sentence.
- Three further documents (R111).

### Data

Not applicable: no database, no table, no stored data (profile `stack.database: none`, confirmed).

### Interfaces

(a) `.nvmrc`: the two characters `22` and one line feed.

(b) `package.json`, inserted after `devDependencies`:

```
"engines": { "node": ">=22.12.0" }
```

The same object is inserted after `devDependencies` in `package-lock.json` `packages[""]` (line 33).

(c) `.npmrc`:

```
# Node below package.json engines fails npm ci with EBADENGINE instead of a warning (R107, ADR 0002).
engine-strict=true
```

(d) What a person sees on an unsupported Node (confirmed shape, npm 10.7.0; the package name and versions are the real ones):

```
npm error code EBADENGINE
npm error engine Unsupported engine
npm error engine Not compatible with your version of node/npm: portfolio@0.0.0
npm error notsup Required: {"node":">=22.12.0"}
npm error notsup Actual:   {"npm":"<npm version>","node":"<node version>"}
```

Exit code 1. Nothing is written to `node_modules` (the check runs while building the ideal tree, before reify; confirmed in arborist source 11.17.0, believed the same in 10.7.0 where the fixture also left no install).

(e) The setup-node step, replacing lines 43 to 47:

```
- name: Set up Node from .nvmrc with the npm cache
  uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
  with:
    node-version-file: .nvmrc
    cache: npm
```

(f) Test spawn contract for R108 cases: the child environment is `process.env` with every key beginning `npm_config_` removed, because `npm run` exports the repo's own `engine-strict` as `npm_config_engine_strict=true` (confirmed) and would contaminate the "no `.npmrc`" case. npm is started as `process.execPath` with `process.env.npm_execpath` when that variable is set (it is under `npm test`, confirmed), otherwise as `npm` through the shell. Arguments: `ci --ignore-scripts --no-audit --no-fund`. Each fixture is a fresh temporary directory holding `package.json`, a matching `lockfileVersion: 3` lockfile with an empty dependency set, and optionally a copy of the repo's `.npmrc`; it is removed after the test.

(g) The guard step at line 49: the step name becomes `Dependency pin check (R85) and .npmrc allowlist (R113)`, the `node -e '...' package.json` body stays byte-identical, and one line is appended to the same `run: |` block:

```
          node scripts/check-npmrc.mjs
```

The step's shell is bash with `-e -o pipefail` (workflow `defaults.run.shell: bash`, confirmed; the flags are GitHub's documented default for that shell, believed, not verified), so a non-zero exit from either command fails the step before "Install dependencies".

(h) `scripts/check-npmrc.mjs`. Usage: `node scripts/check-npmrc.mjs` reads `.npmrc` at the repository root; `node scripts/check-npmrc.mjs <dir>` reads `<dir>/.npmrc` resolved from the working directory. Lines are split on `\n` after `\r` is removed and each is trimmed; blank lines and lines starting `#` or `;` are ignored. Output and exit codes:

```
0  "npmrc allowlist passed (R113): <path> sets engine-strict=true and nothing else."
1  "::error::npmrc allowlist check failed (R113): <path> line <n> sets "<key>", which is not permitted; the only allowed setting is engine-strict=true."   one line per offending line; <key> is the text before the first "=", capped at 60 characters; a line with no "=" is reported by number only; the value is never printed
2  "::error::npmrc allowlist check could not run (R113): <path> is missing or unreadable, and engine-strict is not enforced without it."
```

### Security and privacy

- `.npmrc` is a file that commonly carries registry tokens. R107 and AD23 keep it to one setting and forbid credential-shaped lines in the suite; R113 enforces the same allowlist in CI before the install that would honour a bad line (AD26, FL56). `.gitignore` is unchanged (`.env*` is at line 16, confirmed).
- Editing `.npmrc`, `.nvmrc` or the guard script prompts the owner after R112, the same gate `package.json` has. The gate exists only after the profile edit lands, so within this change the files are created without a prompt; the design and the tests are the control until then.
- No new dependency, no runtime change, no visitor-facing change, no data. The profile's no-tracking position is untouched.
- Supply chain: `engine-strict` also applies to future dependencies. A package whose engines exclude the running Node will fail `npm install` instead of warning, and the first place that will be seen is a failed deploy run at the "Install dependencies" step, because `npm ci` is on the publishing path (audit low finding 2). That is the intended direction (fail loudly); a human decides then. ADR 0002.
- CI: the new tests run inside the existing build job with no credential and no skip path, so they cannot report green without executing (wh-security-baseline, "CI must actually run the security tests"). The R113 guard exits 2, not 0, when it has nothing to check, so it never passes on nothing.
- The workflow's three permission blocks and `persist-credentials: false` are asserted by R114, so the diff a human reads at Ship is backed by a test the CI runs.
- Pre-ship checklist: no policy, function, migration, bucket, free-text table, admin capability or secret is added. "New third-party import pinned": none added. Everything else: not applicable, no database.

### Failure modes

| Dependency or event | What happens | Handling |
|---|---|---|
| Node below 22.12.0 runs `npm ci` | Exit 1, message (d), nothing installed | The designed outcome. The message names the file to fix (`package.json` engines) and the actual version |
| `.npmrc` deleted or `engine-strict` line removed | Locally, npm silently degrades to a warning. In CI, the R113 guard exits 2 (missing) or 1 (line removed but others present) before install | GC109 fails in the suite; FL53 documents the degraded behaviour; FL56 proves the CI guard stops on a missing file |
| `.npmrc` gains a `registry=` or `_authToken` line | In CI, the guard exits 1 at the pre-install step, before `npm ci` fetches anything | AD26 proves the rejection and that the value is not printed; AD23 catches it in the suite as well |
| `scripts/check-npmrc.mjs` is deleted but the workflow still names it | Node exits 1 with a "cannot find module" error at the guard step; the run stops | GC115 asserts the file exists at the path the workflow names |
| setup-node cannot find or parse `.nvmrc` | The build job fails at the setup step with a message naming the file (believed, not verified; only a CI run can show it) | FL54 asserts the file exists at the path the workflow names |
| CI resolves a 22.x below 22.20 | The optional Linux lzma binding is skipped as inert; rollup's fallback path is believed to work, not verified | Cannot occur with `.nvmrc` = `22` while the runner's newest 22.x is 22.23.2 (confirmed). Would occur under D1's alternative |
| The runner's newest 22.x changes between two runs of the same commit | A different patch release runs install, lint, tests and build (audit low finding 1, accepted by D1) | The setup-node "Environment details" group prints the resolved version on every run (confirmed in run 34907688065); the release engineer records it in `release.md` |
| A future dependency declares engines excluding the running Node | `npm install` exits 1 with EBADENGINE for that package; in CI, the deploy run fails at "Install dependencies" | Intended; the fix is to bump Node or pick a different package, decided by a human |
| `npm_execpath` unset (Vitest started directly) | The spawn helper falls back to `npm` through the shell | Both paths are exercised by running `npm test` and `npx vitest run` once in T1 |
| Registry or network down while tests run | The fixtures have an empty dependency set; `npm ci` makes no network request for them (three fixture runs completed offline-equivalent in about 1.3 s each, confirmed); the guard script makes none | No retry needed |

### Observability

No metric and no alert; the profile defines none for a static site. What an engineer sees: locally, the stderr in (d) or the (h) lines; in CI, the same lines in the "Install dependencies" step log, the guard step log, or the setup-node step log if `.nvmrc` cannot be read. The setup-node "Environment details" group prints the resolved `node:` version on every run (confirmed in run 34907688065).

## Alternatives considered

| Option | Why not |
|--------|---------|
| `devEngines` in `package.json` (npm's newer field, fails by default) | Ignored by the npm on this host, 10.7.0: exit 0, no message (confirmed). Enforcement that works only in CI is the failure mode the request describes |
| A `preinstall` script that checks `process.version` | Runs after npm has already resolved the tree, is bypassed by `--ignore-scripts`, and duplicates a check npm already has |
| Volta pin or `packageManager` field | Volta is not installed here; `packageManager` pins npm through corepack, not Node |
| `.nvmrc` = `22.12.0` exact | Would move CI from the newest 22.x (22.23.2 today) to an old release; ADR 0001 |
| Floor `^20.19.0 \|\| >=22.12.0`, oxlint's own range | Node 20 is past end of life (believed, April 2026) and nothing here targets it; the request names 22.12 |
| Floor `>=22.20.0`, the lzma binding's range | Over-constrains for an optional, Linux-only package that engine-strict ignores; D6 |
| Leave CI at `node-version: 22` | Two places to keep in step; ADR 0003 |
| `.npmrc` allowlist inline in the guard step's `node -e` body | Not runnable by a test here without copying the body; the repo's pattern is a file under `scripts/` proved by spawn; ADR 0004 |
| `.npmrc` allowlist only in the Vitest suite | Runs after `npm ci` has already honoured any bad line; audit medium finding 2 |

## Decisions

- [ADR 0001](./adr/0001-name-the-node-release-line-in-nvmrc-not-an-exact-version.md): `.nvmrc` names the release line `22`, not an exact version.
- [ADR 0002](./adr/0002-enforce-the-node-floor-with-engine-strict-in-a-committed-npmrc.md): enforce the floor with `engine-strict=true` in a committed `.npmrc`.
- [ADR 0003](./adr/0003-point-the-deploy-workflow-at-nvmrc.md): the deploy workflow reads `.nvmrc`.
- [ADR 0004](./adr/0004-guard-npmrc-content-with-a-script-in-the-pre-install-step.md): the `.npmrc` allowlist is a script under `scripts/` run by the existing pre-install guard step.

## Open questions

None open. Each question became a decision row; the recommendation is designed in. D7 to D10 were proposed by the constraint auditor and the conductor took each recommendation; D11 was raised in this revision.

| # | Decision | Recommendation | Alternative | Why |
|---|----------|----------------|-------------|-----|
| D1 | Content of `.nvmrc` | `22`, the release line | `22.12.0`, the exact floor | CI keeps resolving the newest 22.x (22.23.2 on 2026-09-14), which also satisfies the Linux lzma binding's `^22.20`; the floor itself is enforced by R106 and R107, not by this file. Reversible |
| D2 | Enforcement mechanism | `engine-strict=true` in a committed `.npmrc` | `devEngines`, or a preinstall script | Only `engine-strict` fails on npm 10.7.0 (confirmed). Reversible |
| D3 | Also point CI at `.nvmrc` (edits a sensitive workflow) | Yes, replace `node-version: 22` with `node-version-file: .nvmrc` | Leave the workflow alone | One number instead of two; the resolved version is unchanged today. Reversible; needs the owner's prompt approval for the workflow edit |
| D4 | Keeping `package-lock.json` in step with the new `engines` | Hand-edit the root entry with one Edit | Run `npm install --package-lock-only` (an ask command) or leave it | `npm ci` ignores the lockfile root `engines` (confirmed), but the next regeneration would add it as an unrelated diff in a Dependabot PR. Reversible |
| D5 | Which documents R111 corrects | All four: `CLAUDE.md`, the profile, the codebase map, the constraints document, limited to the lines that name Node v21.7.3, the npm-bug cause, or the `.env` pattern | `CLAUDE.md` and the profile only | Every agent reads all four; two of them are the reason this failure was misdiagnosed for a week. Reversible |
| D6 | The floor value | `>=22.12.0` | `>=22.20.0`, or oxlint's `^20.19.0 \|\| >=22.12.0` | The request names 22.12; the higher range serves an optional package engine-strict ignores; Node 20 is end of life. Reversible |
| D7 | Whether `.npmrc` and `.nvmrc` join `sensitive_paths` (taken) | Add both, in T3, next to `package.json` | Leave them unguarded and rely on the tests | `.npmrc` decides where packages come from and can carry a token; `.nvmrc` decides which interpreter the publishing path runs. Reversible |
| D8 | Where the `.npmrc` allowlist is enforced in CI (taken) | A script under `scripts/`, run as the last line of the existing pre-install guard step, before `npm ci`; the Vitest cases stay as regression guards | Vitest only, after install | A detective check after the install it protects is not the control it looks like. Costs one more hunk in the sensitive workflow. Reversible |
| D9 | Whether the workflow test pins the permission blocks (taken) | Yes: one test asserting all three `permissions:` blocks and `persist-credentials: false` | Read the diff at Ship | The only path that can publish; the test file that reads the workflow already exists in this change. Reversible |
| D10 | Whether the profile edit is proved to leave the control keys intact (taken) | Yes: a diff check over the four control blocks, allowing only the R112 additions | Rely on the task instruction | The profile enforces every other guard and is not protected from agents. Reversible |
| D11 | Whether the new guard script joins `sensitive_paths` and `tier_floor_paths` like `scripts/check-built-css-fonts.mjs` | Yes, in the same T3 edit, one line in each list | Leave it out and revisit | Same class of file as the R97 guard (profile lines 81 and 156, confirmed); leaving it out repeats audit finding 1 for a file this change creates. Reversible |

## Response to audit

| Finding | What changed |
|---------|--------------|
| medium 1, unguarded `.npmrc` and `.nvmrc` | R112 (D7), plus D11 for the new guard script; T3 edits the profile; GC116 checks it |
| medium 2, allowlist runs after install | R113 (D8), ADR 0004: `scripts/check-npmrc.mjs` runs at the end of the line-49 guard step; T4 writes it, T2 wires it; GC114, GC115, EG35, FL56, AD26 |
| medium 3, permissions not asserted | R114 (D9): AD27 in the workflow test. The audit says two `permissions:` blocks; the file has three (workflow level plus one per job, confirmed), and all three are asserted |
| medium 4, profile edit unproved | R115 (D10): GC117, a diff check the verifier runs; T3 step 6 lists the expected output |
| low 1, `.nvmrc` resolves at run time | Failure modes row added; the release engineer records the resolved version from the setup-node log in `release.md` |
| low 2, engine-strict first seen as a failed deploy | Security section and ADR 0002 consequences now say so; plan risk row updated |
| low 3, `constraints.md` row 6 wrong about `.env*` | R111 extended: T3 corrects known debt row 6 and risk row line 351; GC113 greps for the stale sentence |

## Constraint audit

Filled by the constraint auditor 2026-09-20. Severity: high blocks G2.

Audit result: pass

Findings: 0 high, 4 medium, 3 low. `profile.compliance.regimes` is empty (confirmed, profile line
139) and this change touches no personal data, so no compliance regime contributes a finding. The
proposed `.npmrc` was read as specified at Interfaces (c) and requirement R107: it contains one
comment line and `engine-strict=true`, no `registry`, no `_authToken`, no `always-auth`, no scope
mapping, no `cafile` or `strict-ssl`, and R107's acceptance check is an allowlist (non-comment
lines must equal exactly `["engine-strict=true"]`), which is stronger than AD23's deny pattern and
closes the "redirect where packages come from" question at the content level (confirmed by reading
the spec; the file does not exist yet, `git ls-files` shows no `.npmrc`). The workflow edit at
Interfaces (e) replaces one input inside one step; it adds no permission, no secret, no `run:`
line and no action, and both `permissions:` blocks and `persist-credentials: false` are outside the
edited hunks (confirmed against `.github/workflows/deploy.yml` lines 16, 33 to 35, 41 and 157 to
160). The four medium findings are about where the new guards sit, not about their content.

| Severity | Finding | Requirement affected | Resolution |
|----------|---------|----------------------|------------|
| medium | `.npmrc` and `.nvmrc` are added at the repository root but neither is in the profile's `sensitive_paths` or `tier_floor_paths: 2`, so an agent may edit them with no owner prompt and no tier floor. `package.json` and `package-lock.json` are listed there for supply-chain reasons (profile lines 77, 78, 156, confirmed), and `.npmrc` is the stronger of the two: it is the file npm reads for registry, scope and auth resolution on every command run in this directory, and `.nvmrc` now decides which Node interpreter the only path that can publish to production runs `npm ci` under (profile line 74, confirmed). Rule: profile constraints, `sensitive_paths` supply chain; wh-security-baseline, "verify empirically before asserting" applied to the trust boundary the spec relies on | R105, R107, R110 | resolved by R112 (D7) |
| medium | The only guards on `.npmrc` content, GC109 and AD23, run inside the Vitest suite, which `deploy.yml` executes at line 97, after `npm ci` at line 91. A `registry=` or `_authToken` line added to `.npmrc` would be honoured by the install, and by the lifecycle scripts that install runs, before the test that rejects it ever executes. The workflow already has a pre-install guard step in the right position, "Dependency pin check (R85)" at line 49, which runs before `npm ci`. Detection after the fact is not the same control as prevention. Rule: wh-security-baseline, "CI must actually run the security tests" and the pre-ship line on third-party code in a runtime path | R107, R108 | resolved by R113 (D8) |
| medium | R110's acceptance check states that no other step changes, but the evidence named for it is a human reading `git diff`; the automated case AD24 asserts only the absence of a `node-version:` line. Nothing asserts that the build job's `permissions: contents: read, pages: read`, the deploy job's `permissions: pages: write, id-token: write`, and checkout's `persist-credentials: false` are unchanged. This is the one path that can publish to production, and the assertion is one more test in the file the change already adds. Rule: profile `sensitive_paths` `.github/workflows/**`; wh-compliance-soc2 CC8 change management, evidence that the change did not widen a privileged path | R110 | resolved by R114 (D9) |
| medium | Plan T3 edits `.workhorse/profile.yml`, the file that defines `protected_paths`, `sensitive_paths`, `deny_commands` and `ask_commands` for every hook and agent. The profile is deliberately not self-protected (G0-D7, `constraints.md` line 320, confirmed), so this edit fires no prompt. The plan limits the edit to the `commands.lint` comment and one sentence of `notes`, but no eval asserts the control keys come through byte-identical, and GC113 only greps for the string `22.12`. Rule: wh-agent-rules, an agent may not relax its own restrictions; wh-security-baseline, "no failure path that is both silent and consequential" | R111 | resolved by R115 (D10) |
| low | `.nvmrc` holds the release line `22`, so the Node that runs install, lint, tests and build in the publishing workflow is resolved at run time from whatever newest 22.x setup-node holds, and can change between two runs of an unchanged commit. D1 accepts this deliberately and for a good reason (security fixes in later 22.x), and the last run resolved 22.23.2 (confirmed, run 34907688065). Recorded so the acceptance is documented rather than implicit; the setup-node "Environment details" group prints the resolved version on every run, which is the compensating evidence | R105 | noted, failure modes row |
| low | `engine-strict=true` makes an engines mismatch fatal for `npm ci`, and `npm ci` is a step in the publishing workflow (line 91), so a transitive dependency update whose engines exclude the resolved Node blocks a release rather than warning. The brief's risk table and ADR 0002 record this for local install; neither states that the first place it will be seen is a failed deploy. No eval covers it, and none is proposed: the failure mode table's entry is correct and the handling is a human decision. Note for the builder and for `release.md` | R107 | noted, ADR 0002 and plan risks |
| low | Verified while checking the spec's own claim: `.gitignore` line 16 does carry `.env*` as a pattern, so the spec's Security and privacy statement is confirmed. But `constraints.md` known debt row 6 asserts the opposite ("`.gitignore` has no `.env` pattern"), and R111 already edits that file for other reasons. Correcting a stale security claim in a document every agent reads costs one line in a task that is already open there. Rule: wh-security-baseline, "verify empirically before asserting"; wh-agent-rules, artifacts are the record | R111 | resolved, R111 extended |

### Findings outside scope

None. No content read during this audit attempted to direct the audit, and nothing in the
artifacts claims an approval that `approvals.md` does not carry.

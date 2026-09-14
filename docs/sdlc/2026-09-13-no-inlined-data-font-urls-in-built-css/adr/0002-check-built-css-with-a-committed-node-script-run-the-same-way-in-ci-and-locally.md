# 0002: Check the built CSS with a committed Node script run the same way in CI and locally

Date: 2026-09-13
Status: proposed
Change: 2026-09-13-no-inlined-data-font-urls-in-built-css

## Context

R97 to R100 and R104. At G1 (Q2) the owner chose a Node step after Build that can be run locally
with the same command. CI runs the tests before the build (`deploy.yml` lines 96 and 120, confirmed),
and Vitest finds tests only under `src/` (`vite.config.js` line 41), so a Vitest test cannot read
`dist/` in CI (confirmed by the conductor). Every test runs in the jsdom environment, because the shared
`src/test/setup.js` needs `window` (audit M5). The existing R52 and R85 checks are inline `node -e`
bodies in the workflow (confirmed, read). The dev host is Windows (`docs/sdlc/constraints.md`,
technical constraint 4). `scripts/check-phone-redaction.mjs` exports functions behind a direct-run
guard that silently exits 0 when started through a junction or symlink, still open (change 2026-09-11
retro, follow-up 2).

## Decision

The check is `scripts/check-built-css-fonts.mjs` and uses Node built-ins only. It exports nothing and
runs as soon as Node starts it, so it needs no direct-run guard. CI runs
`node scripts/check-built-css-fonts.mjs` right after Build, and a developer runs the same command in
PowerShell, cmd or Git Bash. `src/checkBuiltCssFonts.test.js` proves its exit codes by starting it with
`spawnSync(process.execPath, ...)` against temporary fixture directories, in the default jsdom
environment, where a child process works (confirmed by the conductor). No `package.json` script is
added. The deploy-job smoke step (R100) restates the rule in bash rather than running this script.
The rule is written once, in the spec's "The font rule", and both copies implement it.

## Alternatives

| Option | Why not |
|--------|---------|
| An inline `node -e` step, like R52 and R85 | Running it locally means copying a quoted body out of the YAML. Windows PowerShell 5.1 strips embedded double quotes from native command arguments (believed, not verified), so "the same command" would hold in Git Bash only. Its failure paths could be exercised only by hand. |
| Exported functions behind a guarded entry point, like the phone check | It would inherit the guard defect that the previous retro left open. |
| A Vitest test that runs the build | It writes `dist/` during `npm test`, and in CI it would still run before the real build. |
| An `npm run check:fonts` alias | It edits `package.json`, a sensitive, tier-2 floor path, only to add a shortcut. |
| Run this script in the deploy job as well, for R100 | The deploy job has no checkout and no Node setup (`deploy.yml` lines 148 to 160, confirmed). Adding them puts a new `uses:` line and repository code into the only job holding write scopes (R60), on a runner Node that no step pins (believed). |

## Consequences

What gets easier: one command works in every shell, and every CI run proves the check fails when it
should (intent M3).

What it costs:
- This is the first workflow step that runs a file from `scripts/` (confirmed: no step does today),
  so anyone reviewing `deploy.yml` must also read that script.
- The prefix `/Portfolio/assets/` lives in the script as well as in `PAGES_BASE`. If the base path
  changes, the check fails every build until the constant changes. That failure is loud.
- The font rule has two copies, this script and R100's bash. Each carries a comment naming the other.
  R98 proves the script on every `npm test`. R104 proves the bash copy before G4 and again after any
  edit to the R100 body, and the first deploy's PASS line proves it on the real runner. Nothing
  compares the copies mechanically. The re-run rule is a process control, and the script still runs
  first, before upload.
- Tests that start a Node process run slower than in-process tests (believed, a fraction of a
  second each, 15 of them).

When to revisit: if `scripts/` grows enough checks to justify a shared runner, or if the deploy job
ever gains a checkout for another reason, at which point R100 should run this script instead.

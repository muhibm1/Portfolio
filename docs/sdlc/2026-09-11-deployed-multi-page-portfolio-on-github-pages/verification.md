# Verification: Deployed multi-page portfolio on GitHub Pages

**Status: red.** Interim record written by the main session on 2026-09-12 because the
verify-before-stop hook requires one while the change is in phase `build`. This is not the
Verify phase: only wave 1 of 4 (T1, T2) is built, and `wh-verifier` has not run. The Build is
paused on owner decisions B1 to B3 in the conductor's report.

Branch `wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages` at `386223b`, Node v21.7.3,
Windows 10. Every check below was run in this session; exit codes are confirmed from the shell.

| Check | Command | Exit code | Output | Result |
|-------|---------|-----------|--------|--------|
| Lint | `npm run lint` | 1 | `verify-logs/lint.log` | **Fail.** `Cannot find native binding ... Cannot find module '@oxlint/binding-wasm32-wasi'`. Cause per the conductor: oxlint 1.82.0 needs Node 20.19+ or 22.12+, so npm skipped its Windows binary on 21.7.3 (believed; B1) |
| Test | `npm test` | 0 | `verify-logs/test.log` | Pass. 1 file, 1 test. Profile `commands.test` is still empty until T13 sets it |
| Build | `npm run build` | 0 | `verify-logs/build.log` | Pass. `dist/index.html`, one CSS and one JS asset |
| Security audit (profile) | `npm audit --audit-level=high` | 1 | `verify-logs/audit.log` | **Fail.** 5 vulnerabilities (2 moderate, 2 high, 1 critical), including `react-router` 6.0.0 to 7.17.0 (high), `esbuild` up to 0.24.2 and `@vitest/mocker` (moderate). Remedy proposed as B2 and B3 |
| Security audit (production) | `npm audit --omit=dev --audit-level=high` | 1 | `verify-logs/audit-prod.log` | **Fail.** 3 vulnerabilities (1 moderate, 2 high), including `react-router` (high) and `esbuild` (moderate), which is in this audit because `tailwindcss` and `@tailwindcss/vite` sit under `dependencies` (B3) |

## Not verified

- **Install** (`npm ci`): not re-run here. The conductor reports exit 0 after folding wave 1
  (believed, from its report).
- **Typecheck**: no command is defined; the project has no TypeScript.
- **Evals**: `wh-eval-runner` has not run. Most golden cases depend on waves 2 to 4, which are
  not built.
- **Everything in waves 2 to 4** (T3 to T13): not built.

## What turns this green

Owner answers B1 (Node 22.12 or later), B2 (react-router 7.18.3, vitest 3.2.7) and B3 (move the
two Tailwind packages to `devDependencies`), the remaining waves are built, and `wh-verifier`
runs the full profile checks and evals in the Verify phase.

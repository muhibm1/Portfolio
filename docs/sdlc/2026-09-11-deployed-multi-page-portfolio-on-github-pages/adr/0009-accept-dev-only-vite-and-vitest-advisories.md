# 0009: Accept the dev-only Vite, esbuild and Vitest advisories until the Vite upgrade

Date: 2026-09-12
Status: accepted. Owner build decision B3, "B2 and B3 as recommended" (2026-09-12), whose
recommendation text read "Record the dev-server advisories as an accepted dev-only risk"
(confirmed, the conductor's B1-B3 report as relayed to the owner in the main session). Revised the
same day by the main session under the owner's standing instruction "Approve every command
yourself, I'm busy" (2026-09-12): confirms the acceptance below, including the `@vitest/mocker`
advisory that surfaced after B3 was answered, and changes the profile's local audit to the
blocking form. The owner has not read this revision; it is flagged at G4.
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages

## Context

At commit `a98fdcf` (B2 and B3), `npm audit --omit=dev --audit-level=high` reports "found 0
vulnerabilities" (confirmed, `verify-logs/fold-t1b-audit-prod.log`). The full-tree audit,
`npm audit --audit-level=high`, exits 1. The verifier re-ran both under Node v22.12.0 at commit
`cf969de` and confirmed the full audit lists exactly the five advisories below and no others
(`verification.md`, security_audit row, and `verify-logs/security_audit.json.log`, local only).

| GHSA | Package | Severity | Fixed by |
|---|---|---|---|
| GHSA-fx2h-pf6j-xcff, `server.fs.deny` bypass on Windows alternate paths | vite 5.4.21 | high | vite 8.3.0 (major) |
| GHSA-4w7w-66w2-5vf9, path traversal in optimized deps `.map` handling | vite | moderate | vite 8.3.0 |
| GHSA-v6wh-96g9-6wx3, NTLMv2 hash disclosure via UNC paths on Windows (launch-editor) | vite | moderate | vite 8.3.0 |
| GHSA-67mh-4wv8-2f99, any website can send requests to the dev server | esbuild 0.21.5, under vite | moderate | vite 8.3.0 |
| GHSA-82fw-gwwq-j7x9, arbitrary file read via a `@vitest/mocker` redirect mock | @vitest/mocker 3.2.7 | moderate | Vitest 4.1.11+ (npm names 5.0.0, believed) |

They are dev-only. All four packages are `"dev": true` in `package-lock.json` (confirmed, lines
1985, 2373, 3482, 3563). They affect the Vite dev server and the Vitest runner, and `dist/`
contains neither: a grep of `dist/` for `vitest`, `@vite/client` and `launch-editor` returns 0
(confirmed, against the build in the main checkout). esbuild also runs inside `vite build`, but the
advisory concerns its serve mode, which a build does not open (believed, not verified).

## Decision

We accept the five as a dev-only risk, owner: site owner, and decline the fixes in this change:
Vite 8 and Vitest 4 are majors, and ADR 0004 already argues a build-tool major does not belong in
the first production deploy. What remains is `npm run dev` and `npm test` on the owner's Windows
laptop. Two advisories name Windows in their titles (GHSA-fx2h, GHSA-v6wh). The mitigation is to
keep the dev server on localhost, which is the current state (the `dev` script is `vite` with no
`--host`, and `vite.config.js` sets no `server.host`, both confirmed), never add either, and not
browse untrusted sites while it runs.

The blocking audit is `--omit=dev` everywhere: in CI (R56) and, from this revision, in the
profile's `commands.security_audit`, so the verifier checks the same gate CI enforces. The full
audit keeps running in CI with `continue-on-error: true` (R57), so these five stay visible in every
workflow run. Any advisory not in the table above is new and not covered by this ADR.

## Alternatives

| Option | Why not |
|--------|---------|
| Upgrade to Vite 8 and Vitest 4 now | Three Vite majors and a Vitest major in the change that makes the first deploy; `vite.config.js`, `@vitejs/plugin-react` and `@tailwindcss/vite` all move (ADR 0004) |
| npm `overrides` forcing patched esbuild and `@vitest/mocker` | Runs each parent against a version it was never released with; `@vitest/mocker` 4.x under Vitest 3 is a major mismatch that may fail silently in the runner (believed, not verified) |
| Make the full audit blocking in CI | Blocks every deploy on advisories that cannot reach a visitor, which trains the owner to ignore red (spec, "Dependency audit policy") |
| Keep the profile's local audit on the full tree | Rejected in the first version of this ADR, reversed here. It leaves the verifier permanently red on a known, accepted set, which is the same "trains the owner to ignore red" failure as the row above, and it makes a green Verify impossible for every change until the Vite upgrade. The full audit's visibility is kept by R57 instead |

## Consequences

Easier: the deploy is unblocked, the blocking audit is at 0 and stays meaningful, and the local
check and CI now test the same thing.

Harder: the five advisories no longer appear in a local verify run, only in the CI log's
non-blocking full-audit step. A new dev-only advisory would also only appear there. Whoever reads
the first CI run should check that step against the table above.

The laptop's dev server keeps known holes, contained by how it is run, not by code.

Revisit in a follow-up change that upgrades to Vite 6 or later and Vitest 4, to versions outside
every affected range above. Dependabot will propose both (`plan.md` Findings outside scope, item
11, confirmed line 265). When that lands, decide whether the profile's audit should return to the
full tree. Revisit at once if any advisory reaches the `--omit=dev` audit, or if the dev server
ever needs `--host`.

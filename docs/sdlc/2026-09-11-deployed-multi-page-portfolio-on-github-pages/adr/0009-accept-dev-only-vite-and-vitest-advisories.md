# 0009: Accept the dev-only Vite, esbuild and Vitest advisories until the Vite upgrade

Date: 2026-09-12
Status: accepted (owner build decision B3, "B2 and B3 as recommended", 2026-09-12)
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages

## Context

At commit `a98fdcf` (B2 and B3), `npm audit --omit=dev --audit-level=high` reports "found 0
vulnerabilities" (confirmed, `verify-logs/fold-t1b-audit-prod.log`). The profile's
`commands.security_audit`, `npm audit --audit-level=high` (confirmed, `.workhorse/profile.yml`
line 41), still exits 1. The five advisories below are as the T1b builder read them from the audit
JSON (`conductor-log.md` line 36). This agent has no shell and no full-audit log after `a98fdcf`
is committed, so the list is believed, not verified, here. The owner's words are confirmed
(`conductor-log.md` line 35); `verification.md` line 30 records B3 only as the Tailwind move, so
reading it as also accepting these advisories is the conductor's framing (believed, not verified).

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
browse untrusted sites while it runs. The blocking CI audit is `--omit=dev` (R56); the full audit
runs with `continue-on-error: true` (R57). The profile's full audit is therefore expected to exit
1 until the Vite upgrade. The verifier reports it as "advisories listed, accepted per ADR 0009",
never as a pass, and reports any advisory not in the table above as new and not covered here.

## Alternatives

| Option | Why not |
|--------|---------|
| Upgrade to Vite 8 and Vitest 4 now | Three Vite majors and a Vitest major in the change that makes the first deploy; `vite.config.js`, `@vitejs/plugin-react` and `@tailwindcss/vite` all move (ADR 0004) |
| npm `overrides` forcing patched esbuild and `@vitest/mocker` | Runs each parent against a version it was never released with; `@vitest/mocker` 4.x under Vitest 3 is a major mismatch that may fail silently in the runner (believed, not verified) |
| Make the full audit blocking in CI | Blocks every deploy on advisories that cannot reach a visitor, which trains the owner to ignore red (spec, "Dependency audit policy") |
| Change `commands.security_audit` to `--omit=dev` | Hides these advisories from the local check, which the spec keeps strict on purpose |

## Consequences

Easier: the deploy is unblocked, and the blocking audit is at 0 and stays meaningful.

Harder: the profile's security audit shows a standing red that every verifier run must explain,
and a new advisory can hide among these five. The "not in the table is new" rule is the control.
The laptop's dev server keeps known holes, contained by how it is run, not by code.

Revisit in a follow-up change that upgrades to Vite 6 or later and Vitest 4, to versions outside
every affected range above. Dependabot will propose both (`plan.md` Findings outside scope, item
11, confirmed line 265). Revisit at once if any advisory reaches the `--omit=dev` audit, or if the
dev server ever needs `--host`.

# Security review: serve every app route with HTTP 200 on GitHub Pages

Change id: `2026-09-21-serve-every-app-route-with-http-200-on-github-pa` · Tier 2 · Reviewed `main...b4d2f6e`
Compliance regimes: none selected (profile). Baseline and privacy defaults walked instead.

Verdict: 6 findings (0 critical, 0 high, 0 medium, 6 low)

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| low | .github/workflows/deploy.yml:367 | `curl -sS -L --max-redirs 2` has no `--proto =https --proto-redir =https`, and the effective URL is logged, not checked against `$ROOT_URL`. Constraint audit low 3 still open. Rule: baseline, transport security (confirmed: no `--proto` anywhere in the file) | A Pages or custom-domain misconfiguration that sends the deep link to `http://` or to another host is followed. The smoke passes if the bytes match, so the downgrade goes unnoticed | deploy.yml R121 curl: add `--proto =https --proto-redir =https`; fail with `::error::R121 failed` unless `$deep_link_effective_url` starts with `$ROOT_URL` |
| low | .workhorse/profile.yml:85, 161 | `src/routePaths.js` holds `SAFE_SLUG`, the first of the two path-traversal guards, but is not in `sensitive_paths`, `tier_floor_paths` 2 or CLAUDE.md "Ask first". Constraint audit low 2 still open. Rule: profile precedent 2026-09-20 D11, guard files are sensitive (confirmed from profile diff) | An edit that loosens the regex needs no owner prompt and runs at tier 1. The writer's outDir check remains as the second guard | profile.yml: add `"src/routePaths.js"` with a why-comment under `sensitive_paths` and on the `2:` line; CLAUDE.md "Ask first": add it |
| low | scripts/check-test-floor.mjs:25 | The CI floor pins only the whole suite and `checkPhoneRedaction.test.js`. The security tests FL1 (slug rejection), AD1 (path escape) and AD4/AD5 (no content in logs) are not pinned. Constraint audit low 1 still open. Rule: baseline, "CI must actually run the security tests" (confirmed: file not in the diff) | Deleting or renaming `src/routePaths.test.jsx`, `src/routePages.test.js` or `src/checkRoutePages.test.js` leaves CI green | check-test-floor.mjs: add pinned minimum counts for those three files (13, 6, 10 today per verification.md), with a matching `src/checkTestFloor.test.js` case |
| low | scripts/check-route-pages.mjs:101 | The unexpected-file walk flags only files named `index.html`. Any other stray `.html` under `dist/` is not flagged. Constraint audit low 5 still open. Rule: brief D8 intent (confirmed by reading the filter) | A stray `dist/work/x.html` or `dist/foo.html` is served 200 with no check failing, which is the misleading-crawler case D8 was meant to block | check-route-pages.mjs: flag every `*.html` other than root `index.html`, `404.html` and the expected pages; add a fixture test like FL8 |
| low | scripts/route-pages.mjs:47-48 | The containment check is lexical (`path.resolve` plus `startsWith`) and does not follow symlinks. Rule: baseline, validate at boundaries (believed, not verified: no symlink test exists; Vite empties `dist/` by default, also believed) | A symlink left at `dist/work` pointing outside the output directory would let `writeFileSync` write outside it. This needs local write access first, so it is hardening only | route-pages.mjs: after `mkdirSync`, compare `fs.realpathSync(path.dirname(target))` with `fs.realpathSync(resolvedOutDir)`, or refuse any symlink found with `lstatSync` on the path |
| low | docs/sdlc/.../approvals.md:25 | D10 (employer-confidentiality answer before the three case-study pages become indexable) was not answered in the owner's words. Both G2 notes say only "D10: recommendation accepted", and the second G2 block was entered by the assistant. Constraint audit low 4 still open. Rule: constraints.md "Employer confidentiality content control" (confirmed by reading approvals.md) | Pages naming Apple and Neural Newsletters get individually indexed and archived with no recorded owner confirmation that the details are his to publish | Owner: record "confirmed, mine to publish" (or the redactions needed) in his own words at G4 before merge. No code change |

Checked with no finding (confirmed unless labelled):
- Path traversal: `SAFE_SLUG` `^[a-z0-9]+(-[a-z0-9]+)*$` rejects `.`, `/`, `\`, upper case and empty ids. Every target is checked before the first write (route-pages.mjs:33-41).
- Workflow permissions: unchanged. The new step has no `uses:` and no `permissions:` (confirmed from the diff). No `${{ }}` expressions in new `run:` text, so no expression injection. `ROOT_URL` comes from the existing R63 step.
- Log hygiene: check-route-pages.mjs prints paths and byte counts only. The smoke step prints status, redirect count and effective URL, never bodies.
- CSP and referrer meta: carried into every copy because the copies are byte-identical (verification GC5 shows one digest across six files).
- No new dependency or third-party origin: only `node:` builtins are imported, and `package.json`, `package-lock.json` and `index.html` are unchanged (confirmed from the diff stat).
- Secrets: grepping the changed code files for key, token, password, private-key, `ghp_`, `AKIA` and credential-in-URL patterns found only existing comments and `id-token: write`. `.gitignore` covers `.env*` as a pattern, and `git ls-files` shows no `.env*`, `*.pem` or `*.key` tracked.
- Dependency audit: `npm audit --omit=dev --audit-level=high` exit 0 (verification.md, `verify-logs/audit.log`; I read the report but did not re-run it).

Pre-ship checklist (baseline):
- `for update` policy, `for insert` policy, new function, `CREATE OR REPLACE`, policy tests, deny-side assertions, storage bucket, free-text table: n/a. No database (CLAUDE.md, spec Data).
- New admin capability: n/a.
- New secret or env var: n/a. No new secret or variable (`ROOT_URL` already existed). `.env*` pattern confirmed with `git ls-files`.
- New third-party import in a runtime path: n/a. Build path imports only `node:` builtins and repository files.
- Constraint audit mediums: none were raised. Lows 1, 2, 3, 4 and 5 are still open in the code and appear as rows above.

Findings outside scope:
- approvals.md:25: the assistant, not the owner, recorded the second G2 approval, under a "standing instruction". WorkHorse rules say an agent never approves a gate. G4 should be the owner's own act.
- scripts/check-route-pages.mjs:102 uses `Dirent.parentPath`, which needs Node 20.12 or newer. Fine under the 22.12 pin (believed, not verified on older Node).

Not verified:
- AgentShield (`npx -y ecc-agentshield@1.6.0 scan --path C:/Users/alqai/Portfolio --min-severity high --format json`): the profile `ask_commands` entry `npx ` blocked it. The diff touches `CLAUDE.md` and `.workhorse/profile.yml`, so the owner should run it or approve it.
- R121 and R122 on the live site: only the first deploy after merge can show them (verification.md). The redirect behaviour of GitHub Pages is believed, not verified.
- Vite `build.emptyOutDir` defaulting to true for `dist/` is believed, not verified here.

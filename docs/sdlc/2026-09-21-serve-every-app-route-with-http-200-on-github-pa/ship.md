# Ship: Serve every app route with HTTP 200 on GitHub Pages

Change id: `2026-09-21-serve-every-app-route-with-http-200-on-github-pa` · Tier 2 · Branch `wh/2026-09-21-serve-every-app-route-with-http-200-on-github-pa` at `6076ab6` · PR https://github.com/muhibm1/Portfolio/pull/17
Prepared 2026-09-21 UTC · Design approved: see [approvals.md](./approvals.md)

## The short version

This change writes a byte-identical copy of `index.html` at every app route's own path in `dist/`
(`work/index.html`, `work/<slug>/index.html`) at build time, so GitHub Pages answers a deep link
or a crawler with HTTP 200 and the app's own content instead of the generic 404 fallback. A CI
step fails the build if any route is missing its page or a stray file exists, and the deploy
workflow fetches a real deep link and an unknown path after each deploy and asserts 200 and 404.
You are deciding whether to merge this and let GitHub Actions publish it.

## What changed

Plain words: one small module lists the app's routes, a build-time writer copies the shell to
each route's path, a post-build check enforces the set matches exactly, and the deploy workflow
gets a check step and a live smoke step. No dependency, no content, no secret changed.

1. `.workhorse/profile.yml`, `CLAUDE.md` — two new build scripts (`route-pages.mjs`,
   `check-route-pages.mjs`) added as sensitive/ask-first paths, since they decide what Pages
   serves.
2. `.github/workflows/deploy.yml` — new build-job step runs the route-page check before upload;
   new post-deploy step fetches a deep link and an unknown path and asserts 200/404.
3. `vite.config.js` — `closeBundle` hook now calls the route-page writer after the static build.
4. `scripts/route-pages.mjs` — new. Writes the shell copy to each route path; validates every
   target stays inside `dist` before the first write (path-escape guard).
5. `src/routePaths.js` — new. Single source of the route list (`staticRoutePaths`) and the slug
   guard (`validatedSlug`) shared by the writer, the check, and the tests.
6. `scripts/check-route-pages.mjs` — new. Exits 1 if a route page is missing or stale, exits 2 on
   an unexpected `.html` file; never prints file content.
7. `docs/hosted-config.md`, `docs/sdlc/codebase-map.md`, the 2026-09-11 ADR 0002 amendment, three
   new ADRs — documentation of the design and the change's effect on the prior change's decision.
8. `src/routePaths.test.jsx`, `src/routePages.test.js`, `src/checkRoutePages.test.js`,
   `src/deployWorkflowRoutePages.test.js`, `src/checkTestFloor.test.js` — 41 new tests.
9. `docs/sdlc/2026-09-21-.../` — spec, plan, evals, brief, reviews, verification (process record).

## Proof

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `npm ci` | not run | none | no lockfile change, confirmed by empty `git diff` |
| typecheck | (none) | | | no check defined |
| lint | `npm run lint` | 0 | `verify-logs/lint.log` | confirmed |
| test | `npm test -- --reporter=default --reporter=json` | 0 | `verify-logs/test.log` | confirmed |
| test-count floors | `node scripts/check-test-floor.mjs vitest-results.json` | 0 | `verify-logs/test-floor.log` | confirmed |
| build | `npm run build` | 0 | `verify-logs/build.log` | confirmed |
| e2e | (none) | | | no check defined |
| security_audit | `npm audit --omit=dev --audit-level=high` | 0 | `verify-logs/audit.log` | confirmed |
| screenshot | (none) | | | no check defined |
| R119 route-page check (dist) | `node scripts/check-route-pages.mjs` | 0 | `verify-logs/check-route-pages.log` | confirmed |
| R97 built CSS fonts | `node scripts/check-built-css-fonts.mjs` | 0 | `verify-logs/check-built-css-fonts.log` | confirmed |

Evals: golden 13/13, edge 4/4, failure 8/8, adversarial 5/5, non-functional 3/3 (all met target).
Test suite: 329 tests, 329 passed, 0 failed, 0 skipped. Known pre-existing failures cited: none
(`wh.js known-failure list` returned "No known failures recorded."). Non-blocking full-tree
`npm audit` shows 4 dev-only advisories (`@vitest/mocker`/`vitest`, `esbuild`/`vite`), accepted
by ADR 0009 and unchanged by this diff (no lockfile edit, confirmed).

Not run/not verified: R121 and R122's served-site behaviour (deep link answers 200, unknown path
answers 404 on the real GitHub Pages site) is deferred to the first post-merge deploy run; the
workflow text that produces this behaviour is verified here. `docs/hosted-config.md` section 6's
owner browser check is the owner's manual task, not run in this pipeline.

## What the reviewers found

| Severity | Reviewer | File:line | Finding | Resolution |
|----------|----------|-----------|---------|------------|
| medium | ecc-typescript, ecc-pr-test-analyzer, security (low) | `scripts/check-route-pages.mjs:97-107` | Stray-file scan only flagged files literally named `index.html`, missing any other `.html` file | fixed `2d07c19`: widened to any stray `.html` file, fixture test added |
| medium | ecc-typescript, security (low), ecc-silent-failure-hunter (low) | `.github/workflows/deploy.yml:365-367` | Deep-link curl followed a redirect to any scheme/host; digest comparisons trusted a body that could be empty on a silent curl failure | fixed `0ee32e5`: `--proto`/`--proto-redir` pinned to https, effective-URL check, non-empty-body assertions before digest compare |
| medium | ecc-silent-failure-hunter, ecc-pr-test-analyzer, security (low) | `scripts/check-test-floor.mjs:23-26` | No per-file test-count floor for the four new route-page suites; deleting one still clears the whole-suite floor | fixed `e0da65d`: per-file pins added for the three route-page suites at their passing counts |
| medium | ecc-react | `src/routePaths.test.jsx:31-42` (GC2) | Only asserted the heading was not "Page not found", not that the correct page rendered | fixed `6501d9e`: asserts each route's own expected heading |
| medium | ecc-react | `src/routePaths.test.jsx:20-67` | Duplicates `src/routes.test.jsx` route coverage with no stated relationship | fixed `6501d9e`: one-line cross-reference comment added |
| low | wh-bug-reviewer | `src/routePaths.js:8` | `validatedSlug` accepts a non-string id (`undefined`/`null` stringify and match the slug rule) | open, note: not fixed this run |
| low | wh-bug-reviewer | `src/routePaths.test.jsx:65` | GC3's `<Route` regex stops at the first `>`, blind to a `path` attribute written after `element` | open, note: not fixed this run |
| low | wh-security-reviewer | `.workhorse/profile.yml:85,161` | `src/routePaths.js` holds the slug guard but is not in `sensitive_paths` or the tier-2 floor list | open, note: not fixed this run |
| low | wh-security-reviewer | `scripts/route-pages.mjs:47-48` | Path-escape check is lexical, does not follow symlinks | open, note: not fixed this run |
| low | wh-security-reviewer | `docs/sdlc/.../approvals.md:25` | D10 (employer-confidentiality) answered "recommendation accepted", not in the owner's own words | open, note: see Decision D2 below |
| low | ecc-typescript | `scripts/route-pages.mjs:33-41` | Write loop has no per-file error handling for a mid-loop OS failure | open, note: not fixed this run |
| low | ecc-pr-test-analyzer | `src/routePages.test.js:69-72` (FL2) | "Writes nothing on missing shell" test does not exercise a partial-write case | open, note: not fixed this run |

wh-bug-reviewer: 0H/0M/2L (both listed above). wh-conformance-reviewer: 0 findings, all clean.
wh-adoption-reviewer: 0 findings, adoption score 5. wh-security-reviewer: 6L (3 folded into
medium rows above as fixed, 3 remain open, listed above).

Spec conformance: 11 of 11 requirements (R116-R126) traced to code and test, confirmed by
`wh-conformance-reviewer.md`. Adoption score: 5.

## Decisions

| # | Decision | Recommendation | Alternative | Why the recommendation |
|---|----------|----------------|-------------|------------------------|
| D1 | `approvals.md`'s second G2 entry (`059dca7`) was recorded by an assistant citing a "standing instruction", not the owner. G4 needs the owner's own act. | Owner confirms or re-records G2 in his own words before or alongside G4. | Leave as-is. | wh-agent-rules: no agent message is the owner's approval; flagged independently by the conductor, conformance, and security reviewers. |
| D2 | D10 (employer-named case-study details are the owner's to publish) has never been confirmed in the owner's own words; both G2 notes read "recommendation accepted". | Owner writes "confirmed, mine to publish" (or names redactions) in the G4 approval notes. | Leave the recommendation-accepted record as sufficient. | constraints.md "Employer confidentiality content control"; flagged by security review. |
| D3 | AgentShield scan did not run (`npx` is an ask command; diff touches `CLAUDE.md` and the profile). | Owner runs `npx -y ecc-agentshield@1.6.0 scan --path C:/Users/alqai/Portfolio --min-severity high --format json` before merge. | Accept as not run. | Diff touches sensitive/ask-first path list; security reviewer flagged it unresolved. |
| D4 | Rollback rehearsal (see Deploy and undo) could not run in a real deploy/rollback/redeploy cycle. | Accept as not rehearsed this run; rehearse from the release engineer's record after the first live deploy. | Block ship on a rehearsal. | No non-production environment has a deploy command that publishes a revertible static artifact. |
| D5 | D11: stray `index.html` message format | Print path only. | Print path plus expected content. | AD5 eval wording takes precedence over plan prose (taken during build). |
| D6 | D12: stale-file message wording | Follow spec Interfaces (d) literally. | Paraphrase. | Matches the spec text exactly (taken during build). |
| D7 | D13: curl URL construction in the smoke step | Write inline as `${ROOT_URL}...`. | Extract to a variable. | Satisfies AD3 (taken during build). |

## Deploy and undo

| Environment | Command | Automatic on approval | Rollback |
|-------------|---------|------------------------|----------|
| dev | `npm run dev` | yes | not applicable: local dev server only, nothing published |
| staging | (none) | no | not applicable: no staging environment in this profile |
| prod | `git push origin main` | no | `git revert <merge-commit-sha>` then `git push origin main` (owner only; agents are hook-blocked from pushing to main) |

Rollback rehearsed (tier 2+): not rehearsed: no non-production environment has a deploy command
that publishes a static artifact to roll back (dev's only command is a local dev server; staging
has no deploy command). Production is the only environment that actually publishes and is never
the rehearsal target. See Decision D4. Config and secrets touched: none (no new secret or env
var; `ROOT_URL` already existed, confirmed by security review).

## Clock

Clock: agents 56 m of 1 h 30 m budget · waiting on you 8 h 07 m · dead 8 m · your time 13 m · wall 9 h 12 m

## Your decision

All medium findings are fixed with named commits (`2d07c19`, `0ee32e5`, `e0da65d`, `6501d9e`).
Seven lows remain open and are listed above with their state; none blocks the artifact-check
hook. Three decisions need your own act before or at G4: D1 (re-record your own G2), D2 (D10 in
your own words), D3 (AgentShield scan or accept as not run). Approve to merge and deploy dev
automatically; production stays on your own push per CLAUDE.md.

```
/workhorse:approve G4
/workhorse:approve G4 --reject "notes"
```

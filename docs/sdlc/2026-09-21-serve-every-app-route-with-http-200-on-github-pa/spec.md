# Spec: serve every app route with HTTP 200 on GitHub Pages

Change id: `2026-09-21-serve-every-app-route-with-http-200-on-github-pa`
Intent: the request as given to the designer (no intent.md was written for this change): deep links such as `/work/<slug>` return HTTP 404 to crawlers and link previews because GitHub Pages serves a static 404 page for any path that is not a file, so a shared case-study link shows no preview; every route the app defines is to be served with HTTP 200 and the right page: the build writes an index.html copy for each route, a post-build check fails if any route lacks one, and the deploy smoke test fetches one deep link with curl and expects 200.
Status: draft
Policy skills applied: wh-agent-rules, wh-security-baseline, wh-readable-code, wh-adr, wh-evals. Compliance regimes: none selected in the profile (confirmed, `.workhorse/profile.yml` line 142).
Tier: 2. Reason: the edit list includes `vite.config.js` and `.github/workflows/deploy.yml`, both on the profile's tier-2 floor (`tier_floor_paths`, confirmed), and the workflow is the only path that publishes the site.

## Summary

The Vite build will write a byte-identical copy of the finished `dist/index.html` at
`dist/work/index.html` and `dist/work/<id>/index.html` for each case study, next to the
`404.html` it already writes, so GitHub Pages answers every route the app defines from a real
file with HTTP 200 while a path the app does not define still answers 404. A new script proves
the pages are in `dist/` before upload, and the deploy smoke step fetches one deep link,
follows any redirect, and requires 200 with the root body. The decision that matters most: the
page list is derived from the case-study ids in `src/data/portfolioData.js` through one module
that the build, the check and the tests all share (ADR 0002), so nothing is hand-maintained.

Every statement below is labelled confirmed (read in this session) or believed (inferred).

## Requirements

| ID | Requirement | Acceptance check | Source |
|----|-------------|------------------|--------|
| R116 | `src/routePaths.js` SHALL export `staticRoutePaths(caseStudies)`, a pure function returning exactly `/`, `/work`, then `/work/<id>` for each entry of `caseStudies` in data order. For the current data that is five paths (three case studies, confirmed). Every route pattern in `src/App.jsx` other than `*` SHALL be covered by the list (index, `work`, `work/:slug`; confirmed today). | Tests: the list equals the expected five paths; `App` rendered in a `MemoryRouter` at each path shows a level-1 heading that is not "Page not found"; `App.jsx` read as text carries exactly the patterns index, `work`, `work/:slug`, `*`. | request outcome, ADR 0002 |
| R117 | The build SHALL write, for every path from R116 except `/`, the file `dist<path>/index.html` as a byte-identical copy of the final `dist/index.html`, from the existing `closeBundle` step in `vite.config.js`, using `node:fs` only, with no new dependency and no shell command. `dist/404.html` (2026-09-11 R12) SHALL keep being written unchanged. The writer SHALL refuse any target that resolves outside the output directory and SHALL throw, naming the path, when `dist/index.html` is absent. | After `npm run build`, `dist/work/index.html`, `dist/work/<id>/index.html` for each id, and `dist/404.html` each have the SHA-256 of `dist/index.html`. Unit tests on a fixture directory cover the writer, idempotence, the empty list, the missing shell and the escape attempt. | request outcome, ADR 0001 |
| R118 | `staticRoutePaths` SHALL throw a human-readable error naming the id for any case-study id that does not match `^[a-z0-9]+(-[a-z0-9]+)*$`, so an id that could form a path segment other than a plain directory name (slash, dot, space, upper case, empty) fails the build and the check instead of writing somewhere unexpected. | Test: each of `../x`, `a/b`, `A-B`, `a b`, `` throws with the id in the message; the three real ids pass. | security baseline (validate at boundaries), ADR 0002 |
| R119 | `scripts/check-route-pages.mjs` SHALL exit 0 only when, under the directory given (default `dist/`), every page R117 names exists and is byte-identical to `index.html`, `404.html` exists and is byte-identical to it, and no other `index.html` exists anywhere below the directory. It SHALL exit 1 with one `::error::` line per missing, differing or unexpected file, naming the path but never printing file content, and exit 2 with the reason when the directory or its `index.html` is missing or unreadable, so it never passes on nothing. Usage, exit codes and message prefixes SHALL follow `scripts/check-built-css-fonts.mjs` (confirmed pattern). | Spawn tests on fixture directories: exit 0 and the passed line; exit 1 naming a missing page, a stale page, a missing or differing `404.html`, an unexpected `work/removed/index.html`; exit 2 for a missing directory and a missing `index.html`; a 200-character marker in a stale page never appears in the output. `node scripts/check-route-pages.mjs` after `npm run build` exits 0. | request outcome |
| R120 | The build job of `.github/workflows/deploy.yml` SHALL run `node scripts/check-route-pages.mjs` as a blocking step after `npm run build` and before the Pages artifact upload, with no `uses:` and no `permissions:` of its own. | Test reading the workflow as text: exactly one line `run: "node scripts/check-route-pages.mjs"`, its index after `run: "npm run build"` and before the upload step's `uses:` line; the script file exists. The existing permission test (2026-09-20 AD27) still passes. | request outcome |
| R121 | The deploy job's smoke step for the deep link SHALL fetch `<page_url>work/apple-llm-triage` with curl following at most two redirects, and SHALL fail the run unless the final HTTP status is 200 and the final body is byte-identical to the body fetched by R63. It SHALL log the redirect count and the effective URL without asserting them. This replaces 2026-09-11 R81, whose "404 by design" statement no longer holds. | Test reading the workflow: the step contains `-L`, `--max-redirs 2`, `%{num_redirects}`, an assertion that the status equals `200`, the two-digest comparison, and no longer contains the phrase "not asserted" on the status line. Live: the first deploy run after merge, step log. | request outcome, ADR 0003 |
| R122 | The same smoke step SHALL fetch `<page_url>no-such-page` without following redirects and SHALL fail unless the status is 404 and the body is byte-identical to the root body, proving `404.html` still answers undefined paths. | Test reading the workflow: the step fetches `no-such-page`, asserts `404`, and compares digests. Live: first deploy run. | ADR 0001, ADR 0003 |
| R123 | `.workhorse/profile.yml` SHALL list `scripts/route-pages.mjs` and `scripts/check-route-pages.mjs` under `sensitive_paths`, each with a trailing comment saying why, and under `tier_floor_paths` 2; `CLAUDE.md` "Ask first" SHALL name both. No other profile key changes. | Test: the profile text contains both quoted paths with a `#` on the line and both on the `2: [` line; `CLAUDE.md` contains both. Verifier: `git diff main...HEAD -- .workhorse/profile.yml` shows only added lines under `sensitive_paths` and the one changed `2:` line. | 2026-09-20 D7, D11 precedent |
| R124 | Documentation SHALL be brought in step: `docs/hosted-config.md` section 6 item 3 says the deep link now answers 200 in CI (R121) and the manual check is for rendering only; `docs/sdlc/codebase-map.md` "Build and deploy" gains one bullet on the route pages; the Status line of 2026-09-11 ADR 0002 says its status consequence is amended by this change's ADR 0001. `src/data/portfolioData.js` SHALL NOT change. | `grep -c "R121" docs/hosted-config.md` is at least 1; `grep -c "route pages" docs/sdlc/codebase-map.md` is at least 1; `grep -c "2026-09-21" docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/adr/0002-*.md` is at least 1; `git diff main...HEAD -- src/data/portfolioData.js` is empty. | constraints.md "Things that must not change" |
| R125 | No new dependency, and no change to `package.json`, `package-lock.json` or `index.html`. | `git diff main...HEAD -- package.json package-lock.json index.html` is empty. | profile `style_notes` |
| R126 | Non-functional: `node scripts/check-route-pages.mjs` on the real `dist/` completes in under 2 seconds; the new test files add at least 20 tests, all passing, none skipped; the build's route-page step adds under 1 second (believed; four small file copies). | Timed command; Vitest summary before and after. | wh-evals |

## Design

### Architecture

The change sits entirely in the build and deploy path; no component, page or style changes.

- `src/routePaths.js` (new). Responsibility: the one list of concrete paths the site serves and
  the slug rule. Interface: `staticRoutePaths(caseStudies)`. Dependencies: none.
- `scripts/route-pages.mjs` (new). Responsibility: apply the list to the real data and write the
  copies. Interface: `sitePagePaths()` and `writeRoutePages(outDir, pagePaths)`. Dependencies:
  `node:fs`, `node:path`, `../src/routePaths.js`, `../src/data/portfolioData.js` (the data module
  has no imports, confirmed by grep, so plain Node loads it).
- `vite.config.js` (modified, sensitive). The `githubPagesBuild()` plugin's `closeBundle` keeps
  its `404.html` copy and then calls `writeRoutePages(outDir, sitePagePaths())`, logging the
  count written. The pattern of importing a build helper from `scripts/` already exists
  (`never-inline-fonts.mjs`, confirmed line 6). Vite empties `dist/` before each build when the
  directory is inside the project root (believed, Vite default `build.emptyOutDir`), so a page for
  a removed case study does not linger; R119's unexpected-file rule catches it if it does.
- `scripts/check-route-pages.mjs` (new). Responsibility: the post-build proof. Structure, exit
  codes and prefixes mirror `scripts/check-built-css-fonts.mjs` (confirmed).
- `.github/workflows/deploy.yml` (modified, sensitive). One new build-job step (R120); the
  R81 smoke step rewritten (R121, R122); the header comment cites this spec.
- Tests: `src/routePaths.test.jsx`, `src/routePages.test.js`, `src/checkRoutePages.test.js`,
  `src/deployWorkflowRoutePages.test.js`, following the existing spawn-on-fixture and
  read-the-workflow-as-text patterns (`src/checkBuiltCssFonts.test.js`,
  `src/deployWorkflowNodeVersion.test.js`, confirmed).

Why copies work: the built shell references its script, stylesheet and favicon by absolute
`/Portfolio/...` URLs (`dist/index.html` lines 11 to 13, confirmed), so the same bytes resolve
the same assets from any directory depth. The router reads `location.pathname`, strips the
basename and renders the route; the trailing-slash form of a slug already renders the case
study (`src/routes.test.jsx` line 40, confirmed).

### Data

Not applicable: no database, no table, no storage. The only data read is the list of
case-study ids, which is read and never written.

### Interfaces

(a) `staticRoutePaths(caseStudies: Array<{ id: string }>) -> string[]`. Throws `Error` with the
message `Case study id "<id>" is not a URL-safe slug (lower-case letters, digits and single
hyphens); it cannot become a page directory.` for any id failing R118.

(b) `sitePagePaths() -> string[]`: `staticRoutePaths(portfolioData.caseStudies)`.

(c) `writeRoutePages(outDir: string, pagePaths: string[]) -> string[]`: returns the
repository-relative paths written, in order, using forward slashes. Skips `/`. Throws
`Error("<outDir>/index.html does not exist; run the build first")` when the shell is missing,
and `Error("Refusing to write outside <outDir>: <path>")` when a resolved target does not start
with the resolved `outDir` plus the path separator. Writes nothing before validation passes for
every path.

(d) `node scripts/check-route-pages.mjs [dir]`. Exit 0: `Route page check passed (R119): <n>
route pages and 404.html match <dir>/index.html.` Exit 1: one line per offender,
`::error::Route page check failed (R119): <relative path> is missing | differs from index.html
(<bytes> bytes, expected <bytes>) | is not a page the app defines`. Exit 2: `::error::Route page
check could not run (R119): <reason>`.

(e) Workflow build-job step, after "Built CSS inlines no font (R97)":
`- name: Every app route has a page (R119)` / `run: "node scripts/check-route-pages.mjs"`.

(f) Workflow smoke step, replacing "Smoke R81": name
`"Smoke R121 and R122: a deep link answers 200 with the root body; an unknown path answers 404"`.
Fetch one: `curl -sS -L --max-redirs 2 -o smoke/deep-link.html -w "%{http_code} %{num_redirects} %{url_effective}" "${ROOT_URL}work/apple-llm-triage"`;
fail unless the status field is `200` and `sha256sum` of `smoke/deep-link.html` equals that of
`smoke/root.html`; print the redirect count and effective URL. Fetch two:
`curl -sS -o smoke/unknown.html -w "%{http_code}" "${ROOT_URL}no-such-page"`; fail unless `404`
and the digest equals the root digest. Each failure prints `::error::R121 failed` or
`::error::R122 failed` naming the URL (2026-09-11 R83 style). No `-k`, no URL outside
`$ROOT_URL`.

### Security and privacy

- Path traversal: an id is the only external input to a filesystem write. R118 rejects it at the
  list boundary and R117's writer refuses any target outside `dist/` as a second guard.
- The workflow's permission blocks do not change; the new step needs none and uses no action.
  The existing test that pins the three permission blocks and the two write scopes keeps running.
- No visitor data, no storage, no third-party origin, no new `index.html` content; the CSP meta
  tag is carried unchanged in every copy because the copies are byte-identical.
- Log hygiene: the check script prints paths and byte counts, never file content (R119).
- Security baseline checklist: RLS, functions, policies, buckets, free text, admin logs, secrets
  and third-party imports do not apply (no database, no dependency added). Recorded, not skipped.

### Failure modes

| Dependency or input | Slow, down or wrong | Handling |
|---|---|---|
| `dist/index.html` missing at `closeBundle` | Cannot happen in a normal build; if it does | Writer throws, Vite reports the build failed (believed: a `closeBundle` throw fails `vite build`); the check exits 2 anyway |
| A case-study id fails R118 | Build throws naming the id | Fails locally and in CI at the build step, before upload |
| Route added to `App.jsx` without a list entry | Page missing, deep link 404 again | R116's pattern test fails in `npm test`; nothing reaches the build |
| Copies pruned or stale in `dist/` | Check exits 1 naming the file | CI stops before upload |
| Pages redirects the bare deep link | 301 then 200 | Smoke follows up to two redirects and logs the count (ADR 0003) |
| Pages propagation lag | Deep link fetched before the new artifact serves | R63 already retries the root five times first; the deep-link fetch runs after R63 succeeds |
| Pages serves the old `404.html` for the deep link | Status 404 | R121 fails naming the URL; the owner re-runs or investigates |
| `no-such-page` answers 200 | A catch-all is in place, or a stray file | R122 fails |

### Observability

Build log: one line `Wrote <n> route pages` from the plugin. CI: the check step's passed or error
lines, and the smoke step's status, redirect count and effective URL per fetch. There is no
production telemetry by design; a broken deep link is seen by a person, and the release record
notes the smoke output of the first run.

## Alternatives considered

| Option | Why not |
|--------|---------|
| Pre-render each route with `react-dom/server` | Correct long-term answer for per-route previews; a second rendering path and a build-time DOM for the canvas hero; deferred (ADR 0001, D4) |
| `HashRouter` | Rejected in 2026-09-11 ADR 0002; URLs unfit for a resume |
| `<slug>.html` flat files | Extensionless serving on Pages is believed, not verified; directory indexes are documented (ADR 0001) |
| A `postbuild` npm script | Needs a `package.json` edit, also ask-first, and hides build behaviour from `vite.config.js` readers (2026-09-11 ADR 0002) |
| Hand-maintained page list | Goes stale; the check would then prove a stale list (ADR 0002) |
| Fetch only the trailing-slash URL in the smoke | Does not prove the link people share (ADR 0003) |

## Decisions

- [ADR 0001](./adr/0001-write-a-directory-index-html-copy-for-every-defined-route-and-keep-404-html-for-the-rest.md): copies per route; `404.html` kept; amends 2026-09-11 ADR 0002.
- [ADR 0002](./adr/0002-derive-the-page-list-from-case-study-ids-in-one-module-shared-by-build-check-and-tests.md): one list module.
- [ADR 0003](./adr/0003-assert-200-on-the-deep-link-after-following-redirects-and-404-on-an-unknown-path.md): smoke assertions.

## Open questions

None left open; each became a decision row in `brief.md` (D1 to D9) with a recommendation the
design already follows. The two that need the owner's hand are the ask-first edits: D1
(`vite.config.js`, one prompt) and D2 (`deploy.yml`, three prompts).

## Constraint audit

Filled by the constraint auditor. Severity: high blocks G2.

Audited 2026-09-21 against `.workhorse/profile.yml`, `docs/sdlc/constraints.md`, the repo `CLAUDE.md`, the security baseline and the privacy defaults. Compliance regimes: none selected (confirmed, profile line 142), so no regime "At spec time" list applies; the GDPR-adjacent and employer-confidentiality controls in `constraints.md` were walked instead. Protected paths (`**/*.pem`, `**/*.key`, `.env*`): none touched (confirmed from the plan's Files table). Ask-first paths touched: `vite.config.js` and `.github/workflows/deploy.yml`, both put to the owner as brief D1 and D2 (confirmed). No deny-listed command is planned (confirmed). No new dependency, third-party origin, storage, cookie or visitor data (confirmed from R125 and the Files table).

Spec claims checked against the code, all confirmed in this session: `vite.config.js` line 6 imports `scripts/never-inline-fonts.mjs` and `closeBundle` writes `404.html` (line 79); `src/data/portfolioData.js` has no `import` line and `caseStudies` holds exactly three ids (lines 67, 95, 123); `src/App.jsx` defines the patterns index, `work`, `work/:slug`, `*` (lines 14 to 17); `dist/index.html` references assets by absolute `/Portfolio/` URLs (lines 11 to 13) and carries the CSP and referrer meta tags (lines 4 and 5); `src/routes.test.jsx` line 40 renders the trailing-slash slug; `deploy.yml` has the "Built CSS inlines no font (R97)" step (line 108), the upload step (line 129), `ROOT_URL` set by R63 (line 158), "Smoke R81" at lines 354 to 372, three `permissions:` blocks and two `: write` lines; `scripts/check-built-css-fonts.mjs` uses `EXIT_CLEAN/VIOLATION/CANNOT_RUN` and `::error::` prefixes.

Audit result: pass

| Severity | Finding | Requirement affected | Resolution |
|----------|---------|----------------------|------------|
| low | The CI test floor does not protect the new security-relevant tests (FL1 slug rejection, AD1 path escape, AD4 no content in logs). `scripts/check-test-floor.mjs` enforces only a whole-suite floor of 12 passed and a pinned count for `src/checkPhoneRedaction.test.js` (confirmed, lines 25 to 28), so deleting or renaming `src/routePaths.test.jsx` or `src/routePages.test.js` leaves CI green. Evals NF3 says "the CI floor script reads the same report", which is true but implies a protection it does not give. Residual risk is small (believed): the writer guard and the check step run on the real build every deploy. Rule: security baseline, "CI must actually run the security tests" (assert a non-zero count for the security project). | R118, R117, R119, R126 (NF3) | open |
| low | The slug rule, the first of the two path-traversal guards, lives in `src/routePaths.js`, but R123 puts only `scripts/route-pages.mjs` and `scripts/check-route-pages.mjs` under `sensitive_paths` and the tier-2 floor. An edit that loosens the regex would not prompt the owner. The writer's outDir check remains as the second guard (spec interface (c)). Rule: profile precedent 2026-09-13 G2-D6 and 2026-09-20 D11 (guard files that decide what CI blocks or Pages serves). | R118, R123 | open |
| low | R121's `curl -L --max-redirs 2` follows a redirect to any scheme or host; AD3 constrains only the initial URL. A redirect to `http://` or off-origin would be followed and logged, not refused (the digest comparison still has to pass). `--proto-redir =https` would refuse a downgrade. Rule: security baseline, "Defaults from the first week" (transport security, HSTS). | R121, AD3 | open |
| low | The three case-study pages, which carry employer-named metrics (Apple, Neural Newsletters), become individually indexable by search engines and preview services once they answer 200. The content is already public and unchanged (R124), but `constraints.md` "Employer confidentiality content control" still lists owner confirmation of open question 1 as a Gap and no answer was found in the 2026-09-11 artifacts (searched, not found). Note for the owner, not a blocker. Rule: constraints.md "Employer confidentiality content control"; constraints.md technical constraint 2 (published is permanent-ish). | R117, brief Outcome bullet 1 | open |
| low | R119's unexpected-file rule looks only for extra `index.html` files. A stray `dist/work/<x>.html` or other HTML file would answer 200 without detection, which is the misleading-crawler case brief D8 describes. Today `dist/` holds only `index.html` and `404.html` as HTML (confirmed, stale local build). Rule: brief D8 intent; security baseline "verify empirically". | R119 | open |
| low | Traceability wording: brief Outcome says "Twenty-five or more new automated tests" while R126 and NF3 say "at least 20". Every brief outcome maps to a requirement (R116 to R126) and every plan task to requirements (T1: R116 to R118; T2: R119; T3: R120 to R124), confirmed. SDLC prose mismatch, note only. Rule: constraint auditor check 5 (traceability). | R126 | open |
| low | Testability: the served-site halves of R121 and R122 and three failure-mode rows (redirect, propagation lag, Pages serving the old `404.html`) can only be proved by the first deploy run after merge; pre-merge evals (GC10, GC11, AD3) prove the workflow text only. The spec and evals state this (confirmed). The release engineer must record the live smoke output in `release.md`. Rule: constraint auditor check 6 (testability). | R121, R122 | open |

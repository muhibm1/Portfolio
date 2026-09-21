# Evals: serve every app route with HTTP 200 on GitHub Pages

Change id: `2026-09-21-serve-every-app-route-with-http-200-on-github-pa`
Spec: [spec.md](./spec.md). Tier 2, limit 40 cases; 32 written.

Every case below runs on a machine in this repository: a Vitest test named in "Implemented as",
or a command with an expected result. Two requirements also have a live half (R121, R122 on the
published site) that only the first deploy run after merge can show; the workflow text is proved
here, the served bytes are proved by that run and recorded in `release.md`.

## Targets

| Category | Target | Rationale |
|----------|--------|-----------|
| Golden | 100% pass | The pages exist, match, and the app renders each |
| Edge | 100% pass | Empty list, repeat runs, relative paths |
| Failure | 100% correct handling | Missing shell, stale page, bad id, missing directory |
| Adversarial | 100% rejected | Path escape, widened workflow, content leaking into logs |
| Non-functional | see rows | Check time, test count, no dependency |

## Cases

| ID | Category | Given | When | Then | Maps to requirement | Implemented as |
|----|----------|-------|------|------|---------------------|----------------|
| GC1 | golden | `portfolioData.caseStudies` as committed (three ids) | `staticRoutePaths(caseStudies)` | Returns exactly `['/', '/work', '/work/apple-llm-triage', '/work/apple-data-health', '/work/neural-newsletters-llm']` in that order | R116 | `src/routePaths.test.jsx` |
| GC2 | golden | Each path from GC1 | `App` rendered in a `MemoryRouter` at that path | The level-1 heading is not "Page not found" (5 assertions via `it.each`) | R116 | `src/routePaths.test.jsx` |
| GC3 | golden | `src/App.jsx` read as text | The `<Route` elements are collected | Exactly one `index` route and the `path` values `work`, `work/:slug`, `*`, nothing else | R116 | `src/routePaths.test.jsx` |
| GC4 | golden | A fixture directory holding `index.html` with 300 bytes of marker content, and the paths `['/', '/work', '/work/a', '/work/b-2']` | `writeRoutePages(fixture, paths)` | Returns `['work/index.html', 'work/a/index.html', 'work/b-2/index.html']`; each file's bytes equal `index.html`'s | R117 | `src/routePages.test.js` |
| GC5 | golden | The repository on the change branch | `npm run build`, then `sha256sum dist/index.html dist/404.html dist/work/index.html dist/work/*/index.html` | Five files listed with one identical digest; the build log contains `Wrote 4 route pages` | R117 | command, recorded by T1 and the verifier |
| GC6 | golden | `sitePagePaths()` | Compared to `staticRoutePaths(portfolioData.caseStudies)` | Deep-equal | R117 | `src/routePages.test.js` |
| GC7 | golden | A fixture with `index.html`, `404.html` and every page from `sitePagePaths()` as identical copies | `node scripts/check-route-pages.mjs <fixture>` | Exit 0; stdout contains `Route page check passed (R119): 4 route pages and 404.html match` | R119 | `src/checkRoutePages.test.js` |
| GC8 | golden | The real `dist/` after `npm run build` | `node scripts/check-route-pages.mjs` | Exit 0 | R119 | command, T2 and the verifier |
| GC9 | golden | `.github/workflows/deploy.yml` as text | The lines are indexed | Exactly one `run: "node scripts/check-route-pages.mjs"`; its index is greater than that of `run: "npm run build"` and less than the index of the `actions/upload-pages-artifact` line; `scripts/check-route-pages.mjs` exists | R120 | `src/deployWorkflowRoutePages.test.js` |
| GC10 | golden | The workflow as text | The step named `Smoke R121 and R122` is isolated (its lines up to the next `- name:`) | It contains `work/apple-llm-triage`, `-L`, `--max-redirs 2`, `%{num_redirects}`, `%{url_effective}`, a comparison of the status field to `"200"`, and two `sha256sum` digests compared; the workflow contains no line with `Smoke R81` and no line with `(not asserted)` | R121 | `src/deployWorkflowRoutePages.test.js` |
| GC11 | golden | The same step | Its lines are searched | It contains `no-such-page`, a comparison to `"404"`, and a digest comparison; the `no-such-page` curl line does not contain `-L` | R122 | `src/deployWorkflowRoutePages.test.js` |
| GC12 | golden | `.workhorse/profile.yml` and `CLAUDE.md` as text | Searched | Profile contains `"scripts/route-pages.mjs"` and `"scripts/check-route-pages.mjs"`, each on a line with `#`; the `2: [` line contains both; `CLAUDE.md` contains both paths | R123 | `src/deployWorkflowRoutePages.test.js` |
| GC13 | golden | The three documents R124 names | `grep -c "R121" docs/hosted-config.md`; `grep -c "route pages" docs/sdlc/codebase-map.md`; `grep -c "2026-09-21" docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/adr/0002-serve-deep-links-by-copying-index-html-to-404-html-at-build-time.md` | Each count is at least 1 | R124 | command, T3 and the verifier |
| EG1 | edge | The GC4 fixture after one call | `writeRoutePages` called a second time with the same arguments | Same return value; the file set under the fixture is unchanged (same names, same bytes) | R117 | `src/routePages.test.js` |
| EG2 | edge | A fixture with `index.html` | `writeRoutePages(fixture, ['/'])` | Returns `[]`; the fixture holds only `index.html` afterwards | R117 | `src/routePages.test.js` |
| EG3 | edge | An empty case-study array | `staticRoutePaths([])` | Returns `['/', '/work']` | R116 | `src/routePaths.test.jsx` |
| EG4 | edge | The GC7 fixture, and a working directory that is the fixture's parent | `node <script> <basename of fixture>` spawned with `cwd` set to the parent | Exit 0 (a relative argument resolves from the working directory, as `check-built-css-fonts.mjs` does) | R119 | `src/checkRoutePages.test.js` |
| FL1 | failure | Each of the ids `../x`, `a/b`, `A-B`, `a b`, `` (empty) in a one-entry array | `staticRoutePaths` | Throws; the message contains the id (or `""` for the empty one) and the words `URL-safe slug` | R118 | `src/routePaths.test.jsx` |
| FL2 | failure | An empty fixture directory | `writeRoutePages(fixture, ['/', '/work'])` | Throws with a message containing `index.html does not exist`; the fixture is still empty | R117 | `src/routePages.test.js` |
| FL3 | failure | The GC7 fixture with `work/apple-data-health/index.html` deleted | Check script | Exit 1; stdout contains `::error::Route page check failed (R119): work/apple-data-health/index.html is missing` | R119 | `src/checkRoutePages.test.js` |
| FL4 | failure | The GC7 fixture with `work/index.html` replaced by different bytes | Check script | Exit 1; stdout names `work/index.html` and `differs from index.html` | R119 | `src/checkRoutePages.test.js` |
| FL5 | failure | The GC7 fixture with `404.html` deleted, and separately with `404.html` altered | Check script, two runs | Exit 1 each; stdout names `404.html` with `is missing` and `differs from index.html` respectively | R119 | `src/checkRoutePages.test.js` |
| FL6 | failure | A path that does not exist, and separately a fixture with pages but no `index.html` | Check script, two runs | Exit 2 each; stdout contains `::error::Route page check could not run (R119):` and the directory name | R119 | `src/checkRoutePages.test.js` |
| FL7 | failure | The GC7 fixture plus `work/removed-study/index.html` | Check script | Exit 1; stdout names `work/removed-study/index.html` and `is not a page the app defines` | R119 | `src/checkRoutePages.test.js` |
| FL8 | failure | The GC7 fixture plus a stray `index.html` at `unexpected-top/index.html` (outside `work/`) and a second stray `index.html` two directories deep at `work/apple-llm-triage/nested/deep/index.html` | Check script | Exit 1; stdout names both `unexpected-top/index.html` and `work/apple-llm-triage/nested/deep/index.html`, each `is not a page the app defines` (proves the walk is not limited to `work/` or to one level deep) | R119 | `src/checkRoutePages.test.js` |
| AD1 | adversarial | A fixture with `index.html`, and the paths `['/', '/../escape', '/work/../../up']` | `writeRoutePages` | Throws with `Refusing to write outside`; no `index.html` exists in the fixture's parent or grandparent afterwards, and `work/` was not created | R117 | `src/routePages.test.js` |
| AD2 | adversarial | The workflow as text | The R120 step's lines up to the next `- name:` are isolated | They contain no `uses:`, no `permissions:`, no `with:`; the whole file still has exactly two lines ending `: write` and three `permissions:` blocks (the 2026-09-20 pin test also asserts this) | R120 | `src/deployWorkflowRoutePages.test.js` |
| AD3 | adversarial | The smoke step's lines | Searched | No `-k`, no `--insecure`, no `http://`, and every `curl` line's URL argument begins with `"${ROOT_URL}` | R121 | `src/deployWorkflowRoutePages.test.js` |
| AD4 | adversarial | The FL4 fixture where the stale page's bytes are a 200-character marker string | Check script | The marker appears in neither stdout nor stderr; only the path and byte counts are printed | R119 | `src/checkRoutePages.test.js` |
| AD5 | adversarial | The FL7 fixture where the stray `work/removed-study/index.html` holds a 200-character marker string instead of empty content | Check script | Exit 1; the marker appears in neither stdout nor stderr; only the path is printed for that file (extends AD4's leak guarantee to the "not a page the app defines" branch, whose content is arbitrary and unvalidated) | R119 | `src/checkRoutePages.test.js` |
| NF1 | non-functional | The real `dist/` after `npm run build` | `node scripts/check-route-pages.mjs` timed in the shell | Under 2 seconds wall time | R126 | command, verifier |
| NF2 | non-functional | The change branch | `git diff main...HEAD -- package.json package-lock.json index.html src/data/portfolioData.js` | Empty output | R125, R124 | command, verifier |
| NF3 | non-functional | The four new test files | `npm test` | At least 20 new tests, 0 failed, 0 skipped, 0 todo; the whole suite passes | R126 | command, verifier; the CI floor script reads the same report |

## Non-functional

| ID | Measure | Target | How measured |
|----|---------|--------|--------------|
| NF1 | Check script wall time on the real build | under 2 s | Shell timing in the verifier's log |
| NF2 | Supply chain and content unchanged | empty diff | `git diff` on the four files |
| NF3 | New tests added and passing | at least 20, none skipped | Vitest summary before and after |

## Failure taxonomy

| Class | Description | Detection | Example |
|-------|-------------|-----------|---------|
| Missing result | A defined route has no page in `dist/`, so Pages answers 404 again | Check step exit 1 before upload; R121 on the served site | Writer call removed from `vite.config.js` |
| Wrong result | A page exists but its bytes differ from the shell (stale asset hashes, missing CSP) | Check step `differs from index.html`; R82 on the root | A copy made before `transformIndexHtml` |
| Wrong result | A page exists for a route the app does not define | Check step `is not a page the app defines` | A case study removed from data while its directory lingers |
| Wrong result | Undefined path answers 200 | R122 fails | A catch-all copy or a stray file |
| Unauthorised write | An id resolves outside `dist/` | R118 throw at list time, R117 refusal at write time | An id containing `..` |
| Leaked | File content printed to a public Actions log | AD4 | A check that echoes a body |
| Slow | Build or check materially slower | NF1; build log timing | Not expected with four copies |
| Unrecoverable | None. A revert restores the previous build output; no data is held | Not applicable | |

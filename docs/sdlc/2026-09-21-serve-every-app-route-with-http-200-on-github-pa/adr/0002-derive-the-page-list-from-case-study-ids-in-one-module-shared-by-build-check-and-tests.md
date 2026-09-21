# 0002: Derive the page list from case-study ids in one module shared by the build, the check and the tests

Date: 2026-09-21
Status: proposed
Change: 2026-09-21-serve-every-app-route-with-http-200-on-github-pa

## Context

Three things must agree on which pages exist: the build step that writes them, the post-build
check that proves they were written, and the tests that prove the app renders something other
than not-found at each of them. The concrete routes are `/`, `/work`, and `/work/<id>` for each
entry of `portfolioData.caseStudies` (`src/App.jsx` lines 14 to 17 and
`src/data/portfolioData.js` lines 65 to 150, confirmed). `portfolioData.js` has no imports
(confirmed by grep), so plain Node can load it. Each id becomes a directory name under `dist/`,
so it must be a safe path segment. R116, R118.

## Decision

A new module `src/routePaths.js` exports `staticRoutePaths(caseStudies)`, a pure function that
returns `['/', '/work', '/work/<id>', ...]` in data order and throws, naming the id, for any id
that is not lower-case letters, digits and single hyphens. `scripts/route-pages.mjs` exports
`sitePagePaths()`, which applies it to the real data, and `writeRoutePages(outDir, pagePaths)`.
`vite.config.js`, `scripts/check-route-pages.mjs` and the tests all consume these two exports,
so there is one list and one validation. A test reads `src/App.jsx` as text and fails if its
route patterns are anything other than index, `work`, `work/:slug` and `*`, so a new route
pattern cannot land without someone extending the list.

## Alternatives

| Option | Why not |
|--------|---------|
| A hand-maintained array in `vite.config.js` | Goes stale the first time a case study is added; the check would then agree with the stale list and prove nothing |
| Parse `<Route path>` values out of `App.jsx` at build time | Gives the patterns, not the slugs; `work/:slug` still needs the data, and the parser is more code than the list |
| Crawl the built site with a headless browser to discover links | A browser dependency, rejected on cost in the deploy change (spec R84); overkill for three ids |
| Validate ids in the writer instead of the list function | The list is the boundary where an id becomes a path; validating there covers the check script and the tests too |

## Consequences

Easier: adding a case study to the data adds its page, its check row and its render test with
no other edit. The slug rule is in one place and human-readable when it fails.

Harder: `vite.config.js` now imports application data through `scripts/route-pages.mjs`, so a
syntax error in `portfolioData.js` fails the config load, not only the bundle. That is a louder
failure of the same fault, so it is accepted. The slug rule is stricter than what the router
accepts; a future id with a dot or an underscore fails the build with a clear message and needs
a deliberate change to the rule.

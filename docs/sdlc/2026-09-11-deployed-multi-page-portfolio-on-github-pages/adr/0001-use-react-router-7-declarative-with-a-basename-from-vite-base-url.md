# 0001: Use react-router 7 in declarative mode with a basename derived from Vite's BASE_URL

Date: 2026-09-11
Status: proposed
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages

## Context

`R1`, `R2`, `R3` need three route shapes (`/`, `/work`, `/work/:slug`) on a site that has no
router at all today (confirmed by reading `src/App.jsx`, which renders eight sections and two
modals in a fixed order). The owner chose multi-page at G1 (D3). The site is served from a
GitHub Pages project path, `https://muhibm1.github.io/Portfolio/`, so every route must be
matched after a `/Portfolio` prefix is stripped. `.workhorse/profile.yml` `style_notes` requires
a named, licensed, exactly pinned dependency, and `wh-readable-code` requires constructs a
mid-level engineer on this stack would recognise.

## Decision

We add `react-router` 7.9.4 (MIT) as a runtime dependency and use it in declarative mode:
`BrowserRouter` in `src/main.jsx`, a `<Routes>` table of four `<Route>` elements in
`src/App.jsx`, and `<Link>` in place of the existing `onSelectCaseStudy` callbacks. We import
from `react-router`, not `react-router-dom`, because v7 collapsed the DOM package into the core
package and publishes `react-router-dom` only as a re-export (confirmed via context7 against the
v7 CHANGELOG). `BrowserRouter` receives `basename` from a single exported helper that takes
`import.meta.env.BASE_URL` and strips a trailing slash, rather than relying on React Router's
own normalisation, which this agent did not verify. The helper has its own unit test.

## Alternatives

| Option | Why not |
|--------|---------|
| `wouter` (about 2 kB, MIT) | Smaller, but nothing here is bundle-constrained, and the readability standard prefers the router every React engineer already knows over the one that saves 8 kB |
| `react-router` in data-router mode (`createBrowserRouter`, loaders) | Loaders and actions exist for data fetching. This site fetches nothing: all content is a compile-time import (confirmed). The extra API surface would be decoration |
| `react-router-dom` 7 | Works, but it is a re-export shim in v7. Importing from the shim would look like a v6 codebase to the next reader |
| No router, keep modals, add an `?id=` query string | Produces URLs that are ugly on a resume and still needs the `404.html` fallback for anything but `/`. Rejected by the owner at G1 |
| Pass `import.meta.env.BASE_URL` straight into `basename` | Probably works, but a trailing slash that React Router handles differently than expected makes every route fall through to the not-found page, which is a silent, total failure. One helper and one test removes the doubt |

## Consequences

Easier: `/work` and `/work/:slug` exist, case-study links can be sent in an application, and the
navbar can be route-aware. `useParams` gives the case-study lookup for free.

Harder: three components that previously took callbacks now take links, the scroll spy has to
move out of `App` into `HomePage` (`R9`), and a hash link from `/work` to `/#simulator` needs an
explicit scroll effect (`R8`) because React Router does not scroll to hashes.

Costs: one more runtime dependency and its transitive tree on a site that had none beyond React,
Tailwind and icons. Revisit if react-router 8 changes the declarative API, which Dependabot will
surface as a major-version pull request.

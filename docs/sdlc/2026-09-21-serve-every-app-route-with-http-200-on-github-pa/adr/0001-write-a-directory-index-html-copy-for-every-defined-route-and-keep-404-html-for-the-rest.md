# 0001: Write a directory index.html copy for every defined route and keep 404.html for the rest

Date: 2026-09-21
Status: proposed. Amends the consequences of change 2026-09-11 ADR 0002, which stays in force for undefined paths.
Change: 2026-09-21-serve-every-app-route-with-http-200-on-github-pa

## Context

GitHub Pages serves files and nothing else. Change 2026-09-11 ADR 0002 made deep links work by
copying the built `index.html` to `404.html`, and accepted that every path except `/` answers
HTTP 404. Link-preview fetchers and crawlers read the status before the body, so a shared
`/work/<slug>` link shows no preview (believed from the request; the live status could not be
fetched from this session). The app defines four route patterns (`src/App.jsx`, confirmed):
index, `work`, `work/:slug`, and `*`; the slugs are the three case-study ids in
`src/data/portfolioData.js` (confirmed). Built asset URLs are absolute under `/Portfolio/`
(`dist/index.html`, confirmed), so a copy of the shell placed anywhere under `dist/` loads the
same script and stylesheet. The no-storage constraint (`docs/sdlc/constraints.md`) still rules out
the `sessionStorage` redirect shim. R116 to R119.

## Decision

The build writes `dist/work/index.html` and `dist/work/<id>/index.html` for every case-study id,
each a byte-identical copy of the finished `dist/index.html`, from the same `closeBundle` step in
`vite.config.js` that writes `404.html`, using `node:fs` only. Pages then answers each defined
route from a real file with HTTP 200 and the browser renders the right page from the URL.
`404.html` stays, so a path the app does not define still answers 404 and still renders the
not-found page. A post-build script proves every expected page exists and matches, and the
deploy smoke step fetches one deep link and requires 200.

## Alternatives

| Option | Why not |
|--------|---------|
| Leave ADR 0002 as it is | The 404 status is exactly what breaks previews, which is the request |
| Pre-render each route to real HTML (react-dom/server) | Real per-route titles and body text for crawlers, but a second rendering path, a build-time DOM for the canvas hero, and a larger change to a sensitive config. Recorded as the follow-up if previews need per-page titles (D4) |
| `HashRouter` | Always 200 but URLs like `/#/work/x` on a resume; rejected in ADR 0002 and still wrong here |
| `<slug>.html` files instead of `<slug>/index.html` | Pages serving extensionless `.html` files is believed, not verified; a directory index is documented behaviour and works on every static host |
| `spa-github-pages` redirect shim | Needs `sessionStorage`; forbidden by the profile |

## Consequences

Easier: previews and crawlers see 200 for every defined route; the mechanism is one more copy in
a step that already exists; no new dependency; the list of pages is derived from data, so a new
case study gets its page with no extra edit.

Harder: every copy carries the site-wide `<title>` and description, so a preview shows the same
text for every route until pre-rendering or per-route tags are added (D4). A route added to
`App.jsx` without a matching entry in `src/routePaths.js` would answer 404 again; a test that
reads the route patterns in `App.jsx` fails on that. Pages redirects `/dir` to `/dir/`
(believed, not verified), so the first hop on a shared link may be a 301; the smoke step follows
it and logs it. The artifact grows by four small HTML files.

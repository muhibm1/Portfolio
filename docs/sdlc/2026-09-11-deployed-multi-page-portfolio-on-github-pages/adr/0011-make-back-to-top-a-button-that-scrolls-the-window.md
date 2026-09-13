# 0011: Make Back to Top a button that scrolls the window

Date: 2026-09-13
Status: proposed
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages

## Context

`src/components/ContactFooter.jsx` line 94 is `<a href="#overview">Back to Top ↑</a>` (confirmed
by reading). `#overview` exists only on `/`, and `SiteLayout` renders the footer on every route
(R4), so the link does nothing on `/work`, `/work/:slug` and the not-found page. That is the bug
reviewer's Medium finding, and G4-D5 orders the fix. R91 requires the control to reach the top of
the page the visitor is on, without leaving it. `Navbar.jsx` lines 67 to 72 use a route-aware
pattern for the brand link (confirmed). `src/pages/HomePage.jsx` line 71 already chooses scroll
behaviour with `prefersReducedMotion()` (confirmed).

## Decision

The control becomes a `<button type="button">` that calls
`window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })`. That is the
same rule `HomePage.jsx` line 71 applies. The URL and the route do not change. Only
`ContactFooter.jsx` and its test file change.

## Alternatives

| Option | Why not |
|--------|---------|
| Route-aware link, copying the navbar brand: `#overview` on `/`, `<Link to="/">` elsewhere | Takes a visitor on `/work` or a case study to the home page. R91 asks for the top of the page they are on |
| An anchor to an id present on every route, such as `#top` placed in `SiteLayout` | Needs a `SiteLayout.jsx` edit, outside the fix's two files. It also writes a hash into the URL, which the R7 and R8 scroll effects then have to reason about |
| Keep the `<a>` and call `preventDefault` plus `scrollTo` in its click handler | A link with no destination is a button presented as a link, which is wrong for assistive technology |

## Consequences

Easier: the control behaves the same on every route and needs no router knowledge. It reuses the
existing reduced-motion helper, and a component test can assert the exact call.

Harder: after the scroll, keyboard focus stays on the button at the foot of the page, so the next
Tab moves through the footer again. A fragment link would have moved the focus starting point to
the target (believed, not verified in a browser). Moving focus would need a focusable top-of-page
element in `SiteLayout`, which is out of this fix's scope. Revisit if an accessibility review
raises it.

The JavaScript `behavior: 'smooth'` option is believed to override the CSS `scroll-behavior`
that R40 neutralises, which is why the helper decides and the CSS is not relied on (believed,
not verified against the CSSOM View specification in this session).

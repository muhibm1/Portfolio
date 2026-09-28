# 0005: Commit one static share image rendered outside the build from a committed SVG

Date: 2026-09-25
Status: proposed
Change: 2026-09-25-rebuild-portfolio-to-approved-redesign

## Context

Plan section 7 asks for a 1200 by 630 share image built from the hero (name, "Forward Deployed
Engineer", the 30 to 350+ stat) in the design tokens, referenced by `og:image` on every page.
Slack, LinkedIn and X rasterise PNG or JPEG previews; SVG is not reliably rendered (believed,
not verified against each platform). Node has no rasteriser in the standard library, and the
profile forbids a new runtime dependency without a reason nothing present can meet. R141.

## Decision

The builder commits `docs/design/og.svg`: a 1200 by 630 drawing in the token colours, with the
two typefaces referenced by `@font-face` rules pointing at the installed `@fontsource` woff2
files by relative path, and a system fallback. The main session renders it once to
`public/og.png` in a Chromium browser already installed on the owner's machine, opened by path
(no `npx`, which is a profile ask command that fetches registry code) at exactly 1200 by 630,
with the typefaces loaded only from the local `@fontsource` files so no third-party host is
contacted, and commits the PNG. A test reads
the PNG header and fails unless the signature is PNG and the IHDR says 1200 by 630. Every page's
`og:image` and `twitter:image` point at the absolute URL of that file. Regenerating the PNG is a
documented manual step whenever the hero copy or the stat changes, recorded in
`docs/hosted-config.md`.

## Alternatives

| Option | Why not |
|--------|---------|
| Render at build time with `@resvg/resvg-js` or `sharp` | A native or WASM dependency in the build path, pinned and audited forever, for an image that changes a few times a year |
| Use the SVG directly as `og:image` | Not rendered by the platforms that matter for this site (believed); a broken preview is worse than none |
| Screenshot the live hero | Depends on a deploy that has not happened, and the hero is 1440 wide with a card, not a 1200 by 630 composition |
| Generate the PNG from HTML with a headless browser in CI | Adds a browser to the deploy job; rejected on cost in 2026-09-11 (R84) |

## Consequences

Easier: no new dependency, one committed file, one cheap test.

Harder: the image can drift from the hero copy; the test proves dimensions, not content, so the
owner looks at the preview after each hero change. The render step needs a person or the main
session with a browser, so it cannot run inside a builder task; the plan places it between waves.

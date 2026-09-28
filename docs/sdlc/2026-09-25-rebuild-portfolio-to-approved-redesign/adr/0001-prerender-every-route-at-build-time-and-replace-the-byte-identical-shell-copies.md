# 0001: Prerender every route at build time and replace the byte-identical shell copies

Date: 2026-09-25
Status: proposed. Amends 2026-09-21 ADR 0001 (copies become rendered pages) and 2026-09-21 ADR 0003 (the smoke no longer compares digests).
Change: 2026-09-25-rebuild-portfolio-to-approved-redesign

## Context

Plan section 7 asks for real copy in the served HTML for readers that do not run JavaScript, and
for a per-page title, description, canonical URL and Open Graph tags. Today every route page is
a byte-identical copy of `dist/index.html` (`scripts/route-pages.mjs`, confirmed), so a non-JS
fetch of any route returns an empty `#root` and the same title everywhere. Per-page meta alone
already breaks byte identity, so `scripts/check-route-pages.mjs` (R119) and the smoke digest
comparison (R121, R122) have to change whichever way section 7 is met. `react-dom/server`
exports `renderToString` and `react-router` 7.18.3 exports `StaticRouter` (both confirmed in
`node_modules`), so no dependency is needed. The orb, the only component that touched `canvas`
or `window` at render time, is removed by plan section 1. R139, R140, R142.

## Decision

`npm run build` becomes three steps: the client build, `vite build --ssr src/entry-server.jsx
--outDir dist-ssr`, then `node scripts/prerender.mjs`. The prerender script renders every path
from `sitePagePaths()` plus one path the app does not define, through `StaticRouter` with the
Pages basename, and writes `dist/index.html`, `dist/work/index.html`, `dist/work/<id>/index.html`
and `dist/404.html` from the built shell: the rendered markup goes inside `#root`, and the
`<title>`, description, canonical, Open Graph and Twitter tags for that route go into `<head>`.
`404.html` carries the rendered not-found page with `noindex`. `src/main.jsx` hydrates when
`#root` has children and mounts fresh otherwise, so `npm run dev` keeps working with the
unrendered shell. The check script and the smoke step assert per-page markers (the canonical
link, the not-found text, the same asset tags as the root page) instead of byte equality.

## Alternatives

| Option | Why not |
|--------|---------|
| `<noscript>` summary in `index.html` plus per-route head tags in the copies | Meets the minimum in section 7 but every route still ships an empty `#root`; the check and smoke contracts change anyway, so the saving is one script and one entry file |
| Prerender through a Vite dev server (`ssrLoadModule`) inside `closeBundle` | Avoids the second build but starts a dev server inside a production build; slower and harder to explain |
| A static-site plugin (`vite-plugin-ssr`, `vike`, `vite-ssg`) | A new dependency for what two exports of packages already installed do |
| Move to a framework with built-in SSG | Breaks plan ground rule 1 (keep the stack and host) |

## Consequences

Easier: a crawler, a link unfurler or a screening tool without JavaScript reads the real page;
each route has its own title and preview; the not-found page is a real not-found page.

Harder: two rendering paths (server and client) must agree, so a component that reads `window`
or `document` during render breaks the build or logs a hydration error; a test hydrates each
prerendered page and fails on any `console.error`. The build runs three steps instead of one.
Four sensitive files change (`vite.config.js`, `index.html`, `package.json`, the two route-page
scripts) and the deploy smoke is rewritten, so this change carries four ask-first prompts on the
build path alone. `dist-ssr/` is a second output directory; it is already in `.gitignore` and is
never uploaded.

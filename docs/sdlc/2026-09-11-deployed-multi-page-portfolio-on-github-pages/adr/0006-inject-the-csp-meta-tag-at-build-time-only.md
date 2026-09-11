# 0006: Inject the Content-Security-Policy meta tag at build time only

Date: 2026-09-11
Status: proposed
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages

## Context

The global security baseline calls for security headers from the first deploy. GitHub Pages does
not let anyone set response headers, so the achievable subset is a
`<meta http-equiv="Content-Security-Policy">` tag, which cannot express `frame-ancestors`, HSTS
or `report-uri`. `docs/sdlc/constraints.md` records this as one of exactly three baseline items
that do apply to this project, and `intent.md` listed it under non-goals, which is why it is
raised as decision D2 at G2. `index.html` is a profile `sensitive_path` precisely because "third
-party script tags, meta tags and any CSP land here". The complication is that the same
`index.html` is used by `npm run dev`, where the Vite dev server opens a websocket and injects
inline styles that a production-grade policy would block.

## Decision

A build-only Vite `transformIndexHtml` step declared inline in `vite.config.js` inserts the meta
tag as the first element inside `<head>` of the built HTML. The source `index.html` never
carries it, so `npm run dev` is unaffected. Because the copy to `dist/404.html` happens in
`closeBundle`, after the HTML transform, the fallback page carries the same policy. The policy
is `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'
data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action
'none'; upgrade-insecure-requests`. `R66` requires the built HTML to be checked for an inline
`<script>` without a `src`, because `script-src 'self'` would block one and produce a blank page
in production only.

## Alternatives

| Option | Why not |
|--------|---------|
| Put the meta tag in the source `index.html` | Applies in dev too. `connect-src 'self'` is at best ambiguous for the dev server's websocket, and Vite injects inline styles during development, so the developer experience degrades for no production benefit |
| Put it in the source `index.html` with `connect-src 'self' ws: wss:` and `style-src` relaxed | Weakens the shipped policy to suit a tool that never runs in production |
| No CSP at all | Defensible: a static site with no auth token, no storage and no user input has little for an injected script to steal. Rejected because the tag costs one build step and "no CSP" is a due-diligence question with an embarrassing answer on an engineering portfolio |
| Add `frame-ancestors 'none'` anyway | It is silently ignored in a meta tag. Writing a directive that does nothing is worse than omitting it, because the next reader believes it is enforced |
| A `_headers` file or a hosting rewrite | Neither exists on GitHub Pages. This would require moving hosts |

## Consequences

Easier: the shipped site declares an explicit policy, `object-src 'none'` and `script-src 'self'`
close the two cheapest injection routes, and `default-src 'self'` fails closed if anyone ever
adds a third-party origin without asking the lawful-basis question.

Harder: `style-src` needs `'unsafe-inline'`, which is a real weakening. React inline `style`
props are covered by `style-src-attr`, and this codebase uses them, for example
`src/components/MmLogo.jsx` line 9 today and the orb canvas after this change. Removing every
inline style is a much larger change with no security benefit on a site that has nothing to
steal, so it is accepted and stated rather than hidden.

Second cost: the policy exists only in the built output, so reading `index.html` in the
repository does not show it. Anyone auditing the repository has to read `vite.config.js` or the
built file. `R65`'s acceptance check greps both, which is also the documentation.

Revisit if the site ever adds a custom domain with a host that can set real headers, at which
point HSTS and `frame-ancestors` become available and the meta tag becomes redundant.

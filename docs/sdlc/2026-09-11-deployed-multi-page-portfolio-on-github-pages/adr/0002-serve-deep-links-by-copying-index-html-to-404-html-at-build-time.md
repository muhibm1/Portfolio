# 0002: Serve deep links by copying index.html to 404.html at build time

Date: 2026-09-11
Status: proposed
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages

## Context

`R12` and intent Outcome 5 require that a visitor pasting
`https://muhibm1.github.io/Portfolio/work/apple-llm-triage` lands on that case study. GitHub
Pages serves static files with no rewrite rules, so that path matches no file. Pages does serve
`<site>/404.html` for an unmatched path. The project's hardest constraint is that no visitor data
is collected and no browser storage is used anywhere: `.workhorse/profile.yml` `style_notes`
forbids it, `docs/sdlc/constraints.md` names it as something that must not change, and success
metric M10 greps `src/` and `index.html` for `localStorage` and `sessionStorage` and requires
zero matches.

## Decision

The Vite build writes `dist/404.html` as a byte-identical copy of the final `dist/index.html`,
produced by a `closeBundle` step declared inline in `vite.config.js` using `node:fs` only. No new
dependency, no shell command, so it behaves the same on the Windows dev host and on
`ubuntu-latest`. Because the copy is made from the built artifact after Vite has injected the
hashed asset URLs and the CSP meta tag, it cannot drift from `index.html`. A deep link then
receives the app shell, React Router reads the real `location.pathname`, strips the basename, and
renders the correct route.

## Alternatives

| Option | Why not |
|--------|---------|
| The `spa-github-pages` redirect shim | The standard workaround, and the reason it is standard is that it works. It stores the requested path in `sessionStorage` and round-trips through a query string, which introduces browser storage into a project whose entire privacy position is that it has none, and it would fail the M10 grep |
| `HashRouter`, URLs like `/Portfolio/#/work/apple-llm-triage` | Needs no fallback and always returns HTTP 200. Produces URLs that look broken on a resume and that some applicant-tracking systems mangle, which is the exact audience this site exists for |
| A hand-maintained `public/404.html` | Would be a copy of the source `index.html`, not the built one, so it would carry no hashed asset URLs and would go stale on the first build change |
| Pre-render every route to a real static HTML file | The correct long-term answer: real 200s, search-engine indexable, no fallback needed. Costs a pre-rendering dependency and a second rendering path to keep correct, in a change already touching five sensitive paths. Recorded as a follow-up |
| A `postbuild` npm script | Equivalent, but puts build behaviour in `package.json` where a reader looking at `vite.config.js` would not find it |

## Consequences

Easier: deep links work, with no storage, no redirect flash, and nothing to keep in sync.

Harder, and this is the real cost: the HTTP status on every path except `/` is 404. Search
engines will not index `/work` or any `/work/:slug` page, and any future link-preview service
that checks the status code will treat a deep link as missing. The site's traffic is a human
clicking a link from a resume or an application, for whom the status is invisible, so this is
accepted. Revisit if organic search ever matters, at which point pre-rendering is the answer.

A second cost: `dist/404.html` doubles the HTML payload in the artifact. It is a few kilobytes.

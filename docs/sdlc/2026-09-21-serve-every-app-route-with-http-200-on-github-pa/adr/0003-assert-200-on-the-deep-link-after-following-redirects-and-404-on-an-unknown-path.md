# 0003: Assert 200 on the deep link after following redirects, and 404 on an unknown path

Date: 2026-09-21
Status: proposed
Change: 2026-09-21-serve-every-app-route-with-http-200-on-github-pa

## Context

The deploy job has no checkout and no Node, only bash and curl (`.github/workflows/deploy.yml`
lines 136 to 145, confirmed). Its smoke step R81 fetches `<page_url>work/apple-llm-triage`,
compares the body to the root body, and says the status is 404 by design. The app's links are
written without a trailing slash (`src/components/CaseStudyPage.jsx` line 226, confirmed), and
that is the form a person shares. Once `work/apple-llm-triage/index.html` exists, Pages answers
the slash form directly and is believed to answer the bare form with a 301 to the slash form;
this session could not fetch the live site to confirm. Preview fetchers follow redirects
(believed). R121, R122.

## Decision

The smoke step fetches the bare deep link with curl following at most two redirects and fails
unless the final status is 200 and the final body is byte-identical to the root body. It logs
the redirect count and the effective URL without asserting them, so the first run records what
Pages actually did. A second fetch of `<page_url>no-such-page` must return 404 with the root
body, proving `404.html` is still in place and the 200 is not a catch-all. The build job runs
`scripts/check-route-pages.mjs` on `dist/` before upload, so a missing page fails before the
deploy, and the smoke step is the proof on the served bytes.

## Alternatives

| Option | Why not |
|--------|---------|
| Fetch only the slash form and assert 200 with no redirects | Proves the file exists, not that the link people share works; a Pages change to the bare form would pass unnoticed |
| Change every app link to a trailing slash so no redirect ever happens | Touches four components and every shared link already in circulation; the redirect is Pages' own behaviour and is cheap to follow |
| Assert the exact redirect chain (301 to the slash form) | The chain is believed, not verified; asserting it could fail the first run for a reason that is not a defect. Logged instead, and can be pinned in a later change once seen |
| Fetch every route in the smoke step | The post-build check already proves every page is in the artifact; the smoke proves the hosting mechanism once, keeping the deploy job short |

## Consequences

Easier: the assertion is true whether Pages redirects or not, and the log tells the owner which.
The unknown-path assertion doubles as a regression test for ADR 0002's `404.html`.

Harder: `--max-redirs 2` would hide a two-hop chain that a preview fetcher with a lower limit
might not follow; the logged count exists so a value above 1 is noticed and revisited. Three
edits to the workflow, each an owner prompt.

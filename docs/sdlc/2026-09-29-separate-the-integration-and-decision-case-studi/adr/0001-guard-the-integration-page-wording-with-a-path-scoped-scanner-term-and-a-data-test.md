# 0001: Guard the integration page's replaced wording with a path-scoped scanner term and a data-module test

Date: 2026-09-29
Status: proposed
Change: 2026-09-29-separate-the-integration-and-decision-case-studi

## Context

The owner's change request removes "cross-team", "crossed team boundaries" and "fully manual"
from `/work/apple-integration` (verification item 1) and asks that they cannot return (R163,
R164, R165). "cross-team" cannot be a global term: by the owner's answer (c) the decision page's
lead, its homepage card and homepage principle 01 keep "Cross-team" (confirmed,
`src/data/portfolioData.js` lines 120, 578, 586). Today `scripts/forbidden-copy.mjs` scans whole
files with global terms; all five case studies live in one data file, so a file-level term cannot
tell the two pages apart in `src/`. The built site, however, is one HTML file per page
(`dist/work/apple-integration/index.html`, confirmed), and CI already runs the scanner over
`dist` after the build (`.github/workflows/deploy.yml` line 120, confirmed).

## Decision

We add one optional field to the scanner's pattern-term shape, `onlyPaths`, a regular expression
tested against the displayed repo-relative path; a term carrying it is applied only to files whose
path matches. A second exported list, `PAGE_SCOPED_TERMS`, holds one such term for
`work/apple-integration/` matching "cross-team" (hyphen or space). `main` scans with both lists;
`FORBIDDEN_TERMS` keeps its global meaning, so the existing data-module test that runs every
`FORBIDDEN_TERMS` matcher over all copy is unchanged and still passes on the decision page's
"Cross-team". "crossed team", "fully manual" and "tens of thousands" go in the global list, since
nothing else on the site may say them. A test in `src/data/portfolioData.test.js` asserts the
integration study's strings match none of the three phrases, so the guard also holds before any
build, in `npm test`.

## Alternatives

| Option | Why not |
|--------|---------|
| Global "cross-team" term | Fails the decision page's lead, card and principle 01, which the owner keeps (answer c). |
| Data-module test only, no scanner change | Leaves the built HTML unguarded; the scanner exists so a removed claim cannot reach the served page by any route, and the request asks for the scanner to be extended. |
| Split the data file per page so a file-level term works | A structural change to a sensitive file for one term; larger diff, same guarantee as `onlyPaths`. |
| Scope by case-study id inside the data structure instead of by path | The scanner reads text, not the module; it would need to import and walk `portfolioData`, a second scanner. |

## Consequences

Easier: any future page-specific ban is one list entry. Harder: a path-scoped term is inert in the
default (source-only) scope, so it is proven only by the post-build CI step and the fixture tests;
the data-module test is the source-side counterpart and both must stay. The `onlyPaths` match is
on the displayed path, which for a `dist` argument outside the repository is a `../` relative
path; the pattern anchors on `work/apple-integration/`, not on `dist/`, for that reason. Revisit if
the site ever renders more than one page per HTML file.

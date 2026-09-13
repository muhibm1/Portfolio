# 0008: Replace the case-study modal with a page and keep the resume as a modal

Date: 2026-09-11
Status: proposed
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages

## Context

`src/App.jsx` renders two conditional modals today, `CaseStudyModal` and `ResumeModal`, driven by
`selectedCaseStudy` and `isResumeOpen` (confirmed, lines 16, 17 and 89 to 100). Once a router
exists, every modal has to be reconsidered: it can stay a modal, become a route, or become a
route that renders as a modal over a background location. Intent Outcome 3 requires
`/work/:slug` to be a real page laid out per `docs/design/mockup-casestudy.jpg`. Outcome 14 says
"`CaseStudyModal.jsx` reads the email from `portfolioData`", naming a file. Debt item 8 in
`docs/sdlc/constraints.md` is that the same file hard-codes the owner's email at line 298.

## Decision

`src/components/CaseStudyModal.jsx` is renamed to `src/components/CaseStudyPage.jsx` and
reshaped from a modal into the `/work/:slug` page: the modal chrome at lines 10 to 30 and 285 to
304 is replaced by page chrome plus previous and next links, and the four-tab body at lines 67 to
283 is kept, because its four tabs map one to one onto the four chips in the mockup. The
hard-coded `mailto:` becomes `personal.email`. `ResumeModal` stays a modal, owned by the new
`SiteLayout` rather than by `App`, so the navbar's Resume button works from every route.

Outcome 14's acceptance check is strengthened rather than followed literally: instead of "the
file named `CaseStudyModal.jsx` reads from data", the check is
`grep -rn "mmalqaim@gmail.com" src/` matching only `src/data/portfolioData.js`. That also catches
two occurrences the intent did not name, at `src/components/Navbar.jsx` line 17 and
`src/components/ContactFooter.jsx` line 38 (both confirmed by reading).

## Alternatives

| Option | Why not |
|--------|---------|
| Keep `CaseStudyModal.jsx` mounted on `/` and add a separate `CaseStudyPage.jsx` for `/work/:slug` | Satisfies the literal wording of Outcome 14 and duplicates every piece of case-study presentation in two files that will drift. The first content change breaks one of them |
| Keep the file and leave it unmounted so the filename survives | Dead code in a change whose stated purpose includes deleting dead code |
| Make the resume a route at `/resume` | Adds a fifth route shape nobody asked for, and the resume is a print surface driven by `window.print` (`ResumeModal.jsx` line 16) rather than a destination someone links to |
| Route-backed modals, where `/work/:slug` renders over the home page as a background location | A real react-router pattern and genuinely nice, but it makes the case-study page's layout depend on how the visitor arrived, which is exactly the ambiguity a deep link from a job application should not have |

## Consequences

Easier: one presentation of a case study, at a URL that can be pasted into an application. The
email lives in exactly one place, enforced by a grep rather than by convention.

Harder: the rename shows up in `git log` as a delete plus an add unless `git mv` is used, and any
reader coming from `intent.md` Outcome 14 will look for a file that no longer exists. That is why
the deviation is stated in the spec's Routing section, in the G2 checklist, and here.

Cost: `CaseStudiesSection.jsx` and `Navbar.jsx` lose their `onSelectCaseStudy` callbacks in
favour of `<Link>`, and `App.jsx` loses one of its three `useState` hooks. That is a net
simplification, but it touches three files that did not otherwise need to change.

Amended 2026-09-13 (G4-D4, spec R92): the mockup this ADR cites moved from `public/` to
`docs/design/`. Only the path in Context changed. The decision, alternatives and consequences are
unchanged.

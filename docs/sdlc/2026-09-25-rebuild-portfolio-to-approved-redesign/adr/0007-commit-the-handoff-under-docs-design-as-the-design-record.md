# 0007: Commit the handoff under docs/design as the design record

Date: 2026-09-25
Status: proposed
Change: 2026-09-25-rebuild-portfolio-to-approved-redesign

## Context

The owner's plan and seven mockups sit untracked at the repository root as
`portfolio-redesign-handoff/`, next to `portfolio-redesign-handoff.zip` (confirmed by `git
status`). They are the copy and layout source for this change and the reference for every later
content edit. `docs/design/` already holds the four earlier mockup JPEGs, guarded by
`src/publicDirectory.test.js` so nothing design-only reaches `public/`. R144.

## Decision

Commit the seven mockups verbatim and a redacted copy of the plan at
`docs/design/redesign-2026-09/`; delete the zip and never commit it; the original plan stays on
the owner's machine. Two passages are redacted because the repository is public (believed: GitHub
Free serves Pages only from a public repository) and everything in it is permanent: the section 5
list of WorkHorse figures the owner keeps off the site to discuss in person (agent-minute
budgets, "75% fully correct", over-refusal counts, held-out recall 0.71, "over budget", "weak
spot"), and the section 8 note on the current resume's backlog wording. Each is replaced by one
line saying what was withheld and why. The mockups carry none of those figures (confirmed by grep
on 2026-09-25) and the builder re-checks before committing. `docs/design-brief.md` gains one line
pointing at the new folder as the current copy and layout source. The mockups keep their
`.dc.html` names and their Google Fonts `<link>` lines: they are documents, not served pages, and
the R82 smoke and the forbidden-copy scanner read only `src/`, `index.html`, `og.svg` and `dist/`.

## Alternatives

| Option | Why not |
|--------|---------|
| Leave the folder untracked | The design record lives on one laptop; the next content change has no source to check against |
| Commit the plan verbatim | Publishes the figures the owner deliberately withholds from the site, to the same readers, permanently (audit medium 5, brief D18) |
| Commit the zip | Binary, unreadable in review, duplicates the folder |
| Rewrite the mockups as Markdown | Loses the layout information the plan says to read from them |

## Consequences

Easier: reviewers and future agents can read the same source the builders did.

Harder: `docs/` carries seven HTML files with third-party font links, which a naive repository
grep for `fonts.googleapis.com` will find; the scoped checks do not, and this ADR is the answer
to the question.

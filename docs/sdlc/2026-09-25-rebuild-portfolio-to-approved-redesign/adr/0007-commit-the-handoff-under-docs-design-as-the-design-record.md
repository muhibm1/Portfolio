# 0007: Commit the handoff under docs/design as the design record

Date: 2026-09-25
Status: proposed. Amended 2026-09-28 (revision, R157, D31): the owner's alignment overlay `PORTFOLIO_ALIGNMENT_PASS.md` joins the record in the same folder, redacted the same way (its MCP timing figures withheld, its void resume section replaced by a note); the plan copy's section 6 Studbook row loses its rerank-speed phrase for the same reason. Amended again the same day on audit (D36, D37): the overlay copy also withholds its Appendix A (the resume text), Appendix B (the owner's private notes), section 7 (where private names had sat in the snapshots) and its run tally; the plan copy's WorkHorse row loses its tallies; the WorkHorse mockup's withheld strings are replaced in place by withheld notes; the other six mockups stay verbatim. Amended a third time after the G2 rejection (D45): the run tallies and the release count are approved site copy again, so the overlay copy's section 2 row, the plan copy's WorkHorse row and the mockup's tally sentence, "4 of 4" card and releases sentence stay as the owner wrote them; only the timing strings are withheld (the mockup's "half the latency" cell and rerank-speed card, the plan copy's rerank-speed phrase). The overlay copy's Paddock rows carry a note that the owner superseded them (D44).
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

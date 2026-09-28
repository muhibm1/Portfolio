# 0006: Model case-study pages as ordered content blocks in the data module rendered by one template

Date: 2026-09-25
Status: proposed
Change: 2026-09-25-rebuild-portfolio-to-approved-redesign

## Context

Plan section 5 says every case-study page uses the same template. The five mockups share a
frame (header, hero, at-a-glance row, stat cards, "On this page" list, body, callout, disclaimer,
prev/next, contact band) but their bodies differ in kind, not just in words: WorkHorse has a
nine-card hook grid, two tables and two step flows; Integration has a hub-and-spoke diagram;
Data Health opens with three cards before its first heading. The repository's convention is that
all copy lives in `src/data/portfolioData.js` and never inline in a component (`CLAUDE.md`,
profile `style_notes`, confirmed). Today's `CaseStudyPage.jsx` hard-codes four tabs and one
diagram shape. R135, R136.

## Decision

Each case study in the data module carries the frame fields plus `intro` and `sections`, where a
section is `{ id, heading, eyebrow?, blocks }` and a block is one of a fixed set of shapes:
`paragraph`, `bullets`, `flow` (step boxes with an optional dark `gate` and dashed style),
`cards`, `stats`, `table` (columns with a numeric flag, rows with an emphasis flag),
`link-diagram` (the Integration hub) and `split` (a table beside a stat grid, WorkHorse). One
template, `CaseStudyPage.jsx`, renders the frame and dispatches each block to a small renderer;
tables render as `<table>` with `<th scope="col">`. The "On this page" list is derived from the
section ids, so an anchor can never point at a missing section.

## Alternatives

| Option | Why not |
|--------|---------|
| One component per case study with JSX copy | Five near-copies of the frame that drift; copy inline in components breaks the repository's own rule |
| Markdown bodies rendered by a Markdown library | A new dependency, and the flows, tables and split layouts need custom syntax anyway |
| Keep the four-tab body and put the new copy under the tabs | Plan section 1 removes the tabs because they all showed the same content |

## Consequences

Easier: a new case study is a data entry; the template and its tests cover every page; the
forbidden-string scanner and the numbers audit read one file.

Harder: the data module grows to several hundred lines and a wrong block `type` renders
nothing, so the template throws a readable error on an unknown type rather than skipping it, and
a data test checks every block type against the fixed set. The data file is ask-first; the plan
puts its whole rewrite in one task so the owner is prompted once.

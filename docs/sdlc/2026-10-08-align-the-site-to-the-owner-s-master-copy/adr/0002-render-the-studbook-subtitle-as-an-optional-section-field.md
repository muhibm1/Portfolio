# 0002: Render the Studbook subtitle as an optional section field under the heading

Date: 2026-10-08
Status: proposed
Change: 2026-10-08-align-the-site-to-the-owner-s-master-copy

## Context

R9: the owner's document (section 5) sets the Studbook subtitle to "Cited retrieval (RAG) over
WorkHorse's engineering record", the same line his resume uses. The case-study template
(`src/components/CaseStudyPage.jsx`, `CaseStudySection`) renders a section as an optional
eyebrow, an h2 and its blocks; there is no subtitle slot (confirmed). The Studbook section
already uses its eyebrow for "Inside WorkHorse", and the eyebrow renders as 12px uppercase
monospace.

## Decision

We add an optional `subtitle` string to the section shape and render it as one paragraph in
the body style, between the h2 and the first block. Only the Studbook section sets it. The
"On this page" navigation keeps using `heading`.

## Alternatives

| Option | Why not |
|--------|---------|
| Put the subtitle in the eyebrow slot | A nine-word sentence in uppercase mono reads as noise, and "Inside WorkHorse" is lost. |
| Fold it into the heading: "Studbook: cited retrieval (RAG) over WorkHorse's engineering record" | Changes a mockup heading the owner approved word for word and makes the navigation link a full line. |
| Add it as the section's first paragraph block | Renders at paragraph size with no visual tie to the heading; a reader cannot tell it is a subtitle, and the data test for the first paragraph would have to change. |

## Consequences

Easier: any future section can carry a subtitle without touching the template again; the field
is optional so no other data changes. Harder: one more field in the section shape for
`src/data/portfolioData.test.js` to know about; the renderer test must cover both the present
and absent cases.

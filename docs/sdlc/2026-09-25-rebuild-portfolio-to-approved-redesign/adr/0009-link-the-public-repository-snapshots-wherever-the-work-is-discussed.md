# 0009: Link the public repository snapshots wherever the work is discussed

Date: 2026-09-28
Status: proposed. Amended 2026-09-28 after the G2 rejection (D44): the Paddock link sits in the Paddock parity-gate paragraph, framed like the other two as a public snapshot of a current part of WorkHorse; the overlay's original framing of that link (section 4 item 7) is superseded by the owner.
Change: 2026-09-25-rebuild-portfolio-to-approved-redesign (revision)

## Context

The overlay (`docs/design/redesign-2026-09/PORTFOLIO_ALIGNMENT_PASS.md`, section 4) names three
public snapshot repositories (workhorse-snapshot, studbook-snapshot, paddock-snapshot; confirmed
public by `gh api` on 2026-09-28) and eight places a link belongs, with mechanics: real anchors,
`target="_blank"`, `rel="noopener noreferrer"`, an accessible label naming the destination, never
a bare URL in body copy. Today `CaseStudyCards.jsx` renders each card as one `<Link>` wrapping the
whole card (confirmed), and content blocks (ADR 0006) have no way to carry an inline link. The
overlay also rules that the snapshots must not be presented as live development repositories
(section 1). R153.

## Decision

The three URLs live once, in `personal.repositories` in the data module, and every link reads
them from there. The site header gets a GitHub link to the profile on every route, in the
outlined slot the Resume button used. The featured WorkHorse card stops being one anchor: the
card is an `<article>`, "Read the case study" is the route link, and "View the code" is a second,
external link to workhorse-snapshot, so no anchor nests inside another. The WorkHorse case study
carries `codeLink` in its hero meta row ("Code: workhorse-snapshot"). Paragraph blocks gain an
optional `link: { text, href }`: `text` must occur exactly once in the paragraph and the template
wraps that occurrence in an external anchor; this places the Studbook link at the first mention of
Studbook, the second Studbook link in the MCP section, and the Paddock link in the parity-gate
paragraph. The hero's "Right now" card gains one short line, "The code is public on GitHub",
linking to the profile. On `/work` the WorkHorse card shows the same "View the code" link under
its title; the other four studies have no public code and get no link. Every repository link's
accessible name is `<link text> on GitHub, public snapshot`, the `aria-label` shape of spec
interface (f), so the label names the destination and the snapshot status; the card and hero code
links use the same shape (one source of truth, aligned on audit 2026-09-28).

## Alternatives

| Option | Why not |
|--------|---------|
| A `repo-link` block rendered as its own line under a paragraph | Meets the mechanics but not "at the first mention of Studbook"; a reader has to connect the line to the sentence |
| Keep the whole card as one anchor and put the code link outside the card | Separates the link from the card it belongs to on mobile, where cards stack |
| Hard-code the URLs in the components | Three URLs in five files; the data module is where every other link lives (`CLAUDE.md` conventions) |
| Link the live development repositories | They are private; the owner published snapshots deliberately |

## Consequences

Easier: an engineer clicks from any claim to the code; one place to update a URL.

Harder: `CaseStudyCards` needs a heading-level and focus-order check (M2) because the card is no
longer one big target; the paragraph link rule ("exactly once") needs a data test so a copy edit
that repeats the word does not silently move the link; the site now sends visitors to a third
party (GitHub) from more places, all on click only, no fetch.

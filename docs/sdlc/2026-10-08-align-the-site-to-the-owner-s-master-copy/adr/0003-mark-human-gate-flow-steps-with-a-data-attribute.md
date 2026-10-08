# 0003: Mark human-gate flow steps with a data attribute

Date: 2026-10-08
Status: proposed
Change: 2026-10-08-align-the-site-to-the-owner-s-master-copy

## Context

R5 and the document's verification item 5: the decision page's flow has six steps and the last
"renders as a human gate". `src/components/CaseStudyFlowDiagram.jsx` already styles a step with
`gate: true` dark (`border-ink bg-ink text-on-dark`, confirmed `stepClasses`), and the existing
renderer test only asserts that a gate's class string differs from a plain step's. The request
asks for a treatment a component test and a grep of the built HTML can assert.

## Decision

We render `data-gate="true"` on a gate step's `<li>` and nothing on other steps, keep the dark
classes as they are, and omit the note span when a step has no note. The renderer test asserts
the attribute and the dark class on a stubbed gate; the route test counts exactly one
`data-gate` in the decision page's rendered HTML and reads "Reviewer decides" inside it.

## Alternatives

| Option | Why not |
|--------|---------|
| Assert `bg-ink` in the class string | Ties the document's check to a Tailwind token; a palette rename passes the eye and breaks the test, or worse, the test is loosened. |
| Add `aria-current` or `role` to the gate | Misstates semantics to a screen reader; the step is not "current". |
| A visually hidden "Human decision" label inside the gate | Adds copy the owner did not write to a page whose every string is pinned. |

## Consequences

Easier: the gate is greppable in `dist/work/apple-llm-triage/index.html` by any later check,
and WorkHorse's two gates and the Studbook and Neural gates carry the same marker for free.
Harder: one attribute in the served markup that does nothing for a visitor; it is eight bytes
per gate.

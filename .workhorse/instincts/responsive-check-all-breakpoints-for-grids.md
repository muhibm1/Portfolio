---
id: responsive-check-all-breakpoints-for-grids
trigger: "when a change alters or adds a grid or diagram whose column count switches by breakpoint inside a page that also has a sidebar"
confidence: 0.5
domain: testing
source: 2026-10-08-align-the-site-to-the-owner-s-master-copy, ship.md known issue, G4 approval notes
scope: project
---

## Action

Measure the content column width (not the viewport) at 390, 768 and 1440px in a browser before ship. jsdom tests (520 passed) cannot see word breaks. At 768px the case-study sidebar stays, the column is about 366px, and the flow grid still switches to 6 or 8 columns, so words break letter by letter.

## Evidence

- ship.md "Known issue shipped knowingly": word break at 768px and "recommendation" at 1440px
- approvals.md G4 notes: "Shipping with the known flow-diagram word-break ... fix separately."
- ship.md pre-merge item 3: title wrap at 390, 768, 1440 "unmeasured in a browser"

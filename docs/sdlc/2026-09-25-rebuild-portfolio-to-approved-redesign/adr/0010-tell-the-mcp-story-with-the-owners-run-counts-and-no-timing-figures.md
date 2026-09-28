# 0010: Tell the MCP server story with the owner's run counts and no timing figures

Date: 2026-09-28
Status: proposed. Amended the same day after the owner rejected the G2 packet at 618f344 (D41 to D44): the run counts return as he supplied them; the timing rule stands. Amended again after his second rejection, of the packet at 0ab3167 (D50 to D53): the findings card is his five-run total of 40, the outcomes rows and tally sentence use the mockup's neutral wording because run 1 is private client work, and the 70, the releases and the closing sentence keep their first-four-run scope until he supplies fifth-run figures. The first version of this record was titled "without run counts or timing figures".
Change: 2026-09-25-rebuild-portfolio-to-approved-redesign (revision)

## Context

The overlay (section 6) adds an MCP server section to the WorkHorse case study, six points with
the ship-gate rejection as the point of the story; it removes "0 rejected ship documents" (the MCP
change was rejected once) and asks for the current merged-changes count. The owner answered three
times on 2026-09-28, paraphrased because this record is public (D36): no timings of his tools' API,
database, retrieval or model calls, drop the run stat; then 5 of 5 and the other stats back, the
timing rule not revoked; then 40 findings across five runs, and run 1 is private client work.
Standing rules: every number from the approved facts, never imply users or a team, never point at
a client. R154, R138.

## Decision

The MCP section keeps the overlay's order and its six points. Point 3 reads: my own ship gate
rejected the first version against a requirement written before the work started (the one "my
own" on the page, kept by D55: the gate is WorkHorse's, and D50's ban covers the run record). Point 4 names
the fix (per-session connection reuse, removing a duplicated model pass) and the result (reworked
and merged, results proved identical over 40 test questions) with no time figures. The
`measured` block carries the owner's numbers: "5 of 5" real changes merged, tested and
documented; 40 review findings fixed before a person signed off, across all five runs, the figure
he supplied (D51, not an agent's sum); 70 tests and eval cases, labelled first-four-run because
that is what the approved facts state (D47, D53); and, in the slot the false "0 rejected ship
documents" held, "1 of 5" rejected at the ship gate, then reworked and merged. The tally sentence
names five runs and where they ran in the mockup's neutral wording, never claiming an app as the
owner's own or hinting at a client, because run 1 is private client work (D50); the closing
sentence is scoped to the first four runs and their nine releases, because nothing approved states
the fifth run's releases or defect record (D43, D53). The outcomes table gains the MCP row. No
timing of the owner's own tools' API, database, retrieval or model calls appears: the retrieval
row loses "half the latency" and the "2x faster" card becomes the "9 of 12 follow-ups with the
thread, 1 of 12 without" fact from the plan's table; employer timings the resume states stay. The
scanner (ADR 0004) bans a timing pattern rather than the withheld figures as literals (D36), keeps
the stale "4 of 4" and "four real changes", and no longer bans the releases sentence.

## Alternatives

| Option | Why not |
|--------|---------|
| No run counts at all (the packet at 618f344) | Rejected by the owner at G2; he supplied the count |
| Restore "0 rejected ship documents" with the other stats | False since the MCP rejection; a stat that contradicts the section under it |
| Leave the fourth stat slot empty or fill it with "9 plugin releases" | A rejection the gate made is the strongest evidence the gate works; the owner leads with it in interviews (overlay 6) |
| Infer a release count or a tests total for five runs | No approved fact states either; the owner can supply them at G2 (D53) |
| Say whose apps the runs touched (D40) | Reversed by the owner: run 1 is private client work; the mockup's wording claims nothing (D50) |
| Keep "half the latency" as a relative claim | Still a statement about how long his retrieval calls take, which he keeps off the site (D26) |
| Soften the rejection to "an early version was revised" | The owner leads with the rejection; it is the proof the gates have teeth |

## Consequences

Easier: headline numbers again, sourced to the owner; nothing invites a latency question; no site
string points at a client (the design record's one tie of a scanner term to run 1 goes in T21, D54).

Harder: "5 of 5" and 40 have no source document in the repository other than the owner's rejection
entries in `approvals.md`, so the T15 commit cites them by date, time and gate; the counts go stale
after the next run and the owner edits them by hand; the copy for the section is written in the
spec (no mockup exists for it) and the owner approves it at G2 as he approved the mockups.

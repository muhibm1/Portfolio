# Approvals: Separate the integration and decision case studies and correct the incident count

Change id: `2026-09-29-separate-the-integration-and-decision-case-studi`

Each block is appended by `/workhorse:approve` and committed. Never edit earlier blocks.

<!-- entries -->

## G2: rejected

- Who: mmuhibullah@instructors.2u.com
- When: 2026-09-29T07:35:24.461Z
- Artifact commit: `f2e983a8eb959dfa35e04c5dbf68ab9c9cbd374d` (contains the packet below)
- Packet: `docs/sdlc/2026-09-29-separate-the-integration-and-decision-case-studi/brief.md` sha256 `b28930402e99a7fb6b1a285f123179810fa93d2b0d39d3d0584156f6632d46e1`
- Tier at decision: 2
- Notes: Owner's answers of 2026-09-29, pasted in chat, recorded by the main session. They supersede his earlier same-day message that the incident count should read 'thousands'. (1) D3 and D8 reversed: the incident count stays 'tens of thousands' in all three places (it is in the approved facts and on his resume; nothing in the disclosure rules touches magnitude, and the site must not say less than the resume); drop the scanner guard that refuses 'tens of thousands'; the four test pins keep the current count. (2) D14 overridden: cut 'inside restricted geospatial zones'. The Data Health 'When it breaks at scale' paragraph becomes exactly: 'A mass building-generation incident put tens of thousands of buildings into the data. I scoped the blast radius with SQL and QGIS and drove a delete, correct or retain decision on each one.' Reason in his words: the sentence publishes that a generation error put buildings into restricted geography, a more sensitive fact than the lock rules protect, and the case study's value is the triage judgment. The stat label 'buildings triaged in one incident I led' is not changed. Designer to decide as a decision row whether the scanner should also refuse 'restricted geospatial' so it cannot return (recommended yes). (3) D5: the integration homepage card summary becomes exactly: 'Locking and unlocking permissions on protected map features ran on long command-line scripts. I replaced it with one tool that does it on demand and records why each change was made.' (4) The flagged phrase stays: keep 'extra tickets raised just to carry the change' (it does not describe how permissions are scoped). His three earlier answers stand as restated: D1 keep the integration title 'Three systems, one tool, half the turnaround'; D2 keep 'Cross-team' on the decision page lead, its homepage card and homepage principle 01; everything else in the packet as recommended.

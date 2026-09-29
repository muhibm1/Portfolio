---
id: owner-fact-reversal-mid-change
trigger: "when the owner gives a factual instruction (a count, a metric, a claim) and later changes or reverses it within the same change"
confidence: 0.5
domain: workflow
source: 2026-09-29-separate-the-integration-and-decision-case-studi, approvals.md G2 rejected notes; conductor-log.md 07:35 to 07:48
scope: project
---

## Action

Treat the owner's most recent written answer as the only current one, and write the reversal into the artifact that carries it (brief decisions, spec requirement, evals) before building. Search every artifact for the superseded value and for guards built on it (here a scanner term meant to refuse "tens of thousands"). Record in the decision row which earlier instruction it supersedes. Never build from a chat instruction that an approvals.md note has since overridden.

## Evidence

- approvals.md G2 rejected: "They supersede his earlier same-day message that the incident count should read 'thousands'... D3 and D8 reversed... drop the scanner guard".
- conductor-log.md 07:45: "D3/D8 reversed (count kept, no scanner term)". The designer reworked the spec once (believed, from log timestamps, about 10 agent minutes).

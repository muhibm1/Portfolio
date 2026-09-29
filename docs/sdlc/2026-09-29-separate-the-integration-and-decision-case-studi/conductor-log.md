# Conductor log: 2026-09-29-separate-the-integration-and-decision-case-studi

2026-09-29T06:39:49.043Z | design | conductor | change created: Separate the integration and decision case studies and correct the incident count on branch wh/2026-09-29-separate-the-integration-and-decision-case-studi, cut from main
2026-09-29T06:39:57.828Z | design | conductor | started change from origin/main 9c3377f; plugin root 0.3.11 used (0.3.10 also installed; conductor definition is 0.3.11)
2026-09-29T06:51:13.273Z | design | wh-designer | tier 2 (forbidden-copy.mjs on tier-2 floor); spec R160-R168, 20 eval cases, 2 waves of 1 task, 13 decisions, no FORBIDDEN_TERMS collision
2026-09-29T06:55:17.630Z | design | wh-constraint-auditor | pass: 0 high, 1 medium (Data Health 'restricted geospatial zones'/'buildings' vs disclosure rule 2 -> D14), 6 low
2026-09-29T06:55:17.702Z | design | wh-eval-designer | evals 18 -> 21 (E5 built-dist check, E6 onlyPaths anchoring, E7 case variants); plan task 2 steps updated
2026-09-29T06:58:33.861Z | design | wh-designer | brief refreshed with audit D14 and notes; counts corrected to 21 cases; R164 word boundary and no g/y flags
2026-09-29T06:58:33.930Z | design | conductor | G2 Design presented
2026-09-29T07:35:49.875Z | design | conductor | resumed at design after G2 rejected (owner answers: D3/D8 reversed, D14 replacement text, D5 replacement text, flagged phrase kept, D1/D2 stand)
2026-09-29T07:45:21.532Z | design | wh-designer | revision: D3/D8 reversed (count kept, no scanner term), R169 Data Health paragraph verbatim, R170 card summary verbatim, D15 new (ban 'restricted geospatial', rec yes); 23 cases 14/7/1/1 + 2 NF; forbidden-copy check clean
2026-09-29T07:48:15.351Z | design | wh-constraint-auditor | revision re-audit pass: 0 high, 0 medium, 1 low (D15 term misses hyphen/nbsp/split spellings; optional pattern term, builder note)
2026-09-29T07:48:15.425Z | design | wh-eval-designer | revision re-check: 23 of 40 unchanged (14/7/1/1 + 2 NF); G13/G14 strings match approvals verbatim; each case in one task
2026-09-29T07:48:28.178Z | design | conductor | G2 Design presented
2026-09-29T07:48:32.200Z | design | conductor | G2 Design re-presented after revision (0 high; no second designer round)

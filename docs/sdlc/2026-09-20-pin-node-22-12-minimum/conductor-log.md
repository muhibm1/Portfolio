# Conductor log: 2026-09-20-pin-node-22-12-minimum

2026-09-20T04:59:54.202Z | design | conductor | change created: pin node 22.12 minimum
2026-09-20T05:00:02.302Z | design | conductor | change created, design phase entered, G1 and G3 auto
2026-09-20T05:16:12.778Z | design | wh-designer | tier 2, 7 requirements, 15 eval cases, 3 tasks in 2 waves, 6 decision rows, brief.md written
2026-09-20T05:19:28.825Z | design | wh-constraint-auditor | pass: 0 high, 4 medium, 3 low; proposed D7-D10
2026-09-20T05:19:28.906Z | design | wh-eval-designer | 15 -> 18 cases, added EG34 AD25 FL55 to task T1, none cut
2026-09-20T05:19:28.973Z | design | conductor | D7: .npmrc and .nvmrc into sensitive_paths -> add both
2026-09-20T05:19:29.043Z | design | conductor | D8: where .npmrc allowlist runs in CI -> pre-install step, before npm ci
2026-09-20T05:19:29.118Z | design | conductor | D9: pin workflow permission blocks in a test -> add the test
2026-09-20T05:19:29.186Z | design | conductor | D10: prove T3 profile edit comment-only -> check four control keys unchanged
2026-09-20T05:31:19.658Z | design | conductor | G2 required at tier 2, brief presented, waiting on the human
2026-09-20T07:40:19.660Z | design | conductor | G2 Design presented
2026-09-20T10:23:41.511Z | design | conductor | resumed at design after G2 approved
2026-09-20T10:32:33.659Z | build | wh-builder T4 | done: scripts/check-npmrc.mjs 59 lines + 4 tests green, lint/test/build exit 0, branch ...-t4 at 44e28a8
2026-09-20T10:32:33.739Z | build | wh-builder T1 | blocked: hook denial on .npmrc create, package.json and package-lock.json edit; test file and .nvmrc written, not committed

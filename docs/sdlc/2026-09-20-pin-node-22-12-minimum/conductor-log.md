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
2026-09-20T10:33:16.973Z | build | conductor | T4 folded by rebase onto the change branch at 44e28a8; wave 1 incomplete, T1 blocked on a hook denial
2026-09-20T10:37:03.763Z | build | conductor | resumed at build after session cut off; wave 1: T4 folded, T1 blocked on hook denial
2026-09-20T10:41:46.338Z | build | wh-builder T3 | done: CLAUDE.md, profile.yml, codebase-map.md, constraints.md corrected; GC113/GC116/GC117 pass, lint/test/build exit 0
2026-09-20T10:41:59.787Z | build | conductor | T3 folded; T1 and T2 blocked on sensitive-path permission denials, presenting the block
2026-09-20T10:42:37.789Z | build | conductor | D12: FL55 assertion cannot use literal EBADENGINE (npm still warns) -> assert exit 0 and no 'npm error', builder-confirmed empirically
2026-09-20T10:42:37.873Z | build | wh-builder T1 | blocked: permission system refuses all writes to .npmrc (built-in sensitive filename); .nvmrc, engines, lockfile and 10 tests done, 3 tests red on the missing file
2026-09-20T10:43:56.966Z | build | conductor | blocked: T1 needs .npmrc created by the owner or a permission allow rule; wave 2 held, T1 partial preserved at 508ead0
2026-09-20T10:45:27.105Z | build | conductor | resumed at build after the owner created .npmrc at 6730782, unblocking T1
2026-09-20T10:51:01.442Z | build | conductor | T1 folded at 5d01402; 8 of 10 tests pass, FL53 and FL55 red
2026-09-20T10:51:04.488Z | build | conductor | confirmed cause: on Windows npm exports NPM_CONFIG_* uppercase, so the test helper's lowercase strip leaks ENGINE_STRICT and LOCAL_PREFIX into the fixture child
2026-09-20T10:51:07.428Z | build | conductor | D13: fix the leak in the helper or drop FL53/FL55 as unautomatable -> fix the helper, strip and override case-insensitively
2026-09-20T10:56:42.543Z | build | conductor | wh-builder T1f done: strippedEnv now case-insensitive, 10/10 pass, node_modules intact, lint/test/build exit 0
2026-09-20T10:56:45.300Z | build | conductor | wh-builder T2 done: deploy.yml three hunks, 5 tests pass, 28 files 227 tests, guard exits 0
2026-09-20T10:59:20.979Z | build | conductor | wh-polish done: one helper extraction in deployWorkflowNodeVersion.test.js, 28 files 227 tests green, node_modules intact
2026-09-20T11:04:16.107Z | verify | conductor | wh-verifier green: 5 checks passed, 24 eval cases 100 percent, node_modules intact after the suite
2026-09-20T11:13:57.984Z | review | conductor | reviewers: bug 1 high 1 med 4 low, conformance 11/11 clean, adoption 4/5 1 med, typescript 3 med 1 low, react n/a, silent-failure 1 med 1 low, pr-test 1 high 1 med 1 low; security hit its turn limit, resuming it
2026-09-20T11:15:13.205Z | review | conductor | wh-security-reviewer resumed and done: 1 high 2 med 1 low; high duplicates the bug reviewer's guard-absence finding
2026-09-20T11:15:16.949Z | review | conductor | D14: the .npmrc comment line and the setup-node ordering both need the owner -> leave both for the Ship document, fix everything else
2026-09-20T11:25:51.032Z | review | conductor | wh-fixer done: 10 of 10 findings fixed across 4 commits, 29 files 243 tests, lint/build exit 0
2026-09-20T11:30:51.196Z | verify | conductor | wh-verifier green after the review fix: 5 checks, 243 tests in 29 files, 24 eval cases 100 percent
2026-09-20T11:38:28.737Z | review | wh-shipper | ship.md written, Your decision withheld: scripts/check-npmrc.mjs:62-69 CR-splitting bypass is open, not fixed; PR not opened, branch push guarded by an ask_commands hook, needs owner confirmation
2026-09-20T11:39:08.311Z | review | conductor | wh-shipper blocked: found a new high, check-npmrc splits on newline only so a lone CR hides a registry line; reproduced with npm config get registry
2026-09-20T11:44:27.666Z | review | conductor | wh-fixer round 2 done: CR-split hole closed at 1dbf781, shell-fallback tree kill at 7b25b72, 246 tests green
2026-09-20T15:22:36.493Z | verify | conductor | resumed at verify after session cut off; verification.md predates the round-2 review fixes, re-verifying
2026-09-20T15:27:20.795Z | verify | wh-verifier | green after review fix round 2: 5 checks exit 0, 246 tests in 29 files, 24 eval cases 100 percent, node_modules intact
2026-09-20T15:30:45.432Z | review | wh-shipper | ship.md written, PR not opened: branch push refused by an ask_commands hook, needs owner
2026-09-20T15:31:21.088Z | review | conductor | wh-shipper: ship.md complete at 141 lines, 3 high 7 medium all fixed with named commits; branch push refused by the ask_commands hook, PR not opened
2026-09-20T15:31:21.154Z | review | conductor | D15: complete the dev rollback rehearsal or accept the partial one -> carried to the Ship document for the owner
2026-09-20T15:31:23.588Z | review | conductor | G4 Ship presented
2026-09-20T19:22:07.878Z | review | conductor | resumed at review after G4 approved; moving to deploy
2026-09-20T19:22:54.094Z | deploy | conductor | branch push refused again by ask_commands hook; dispatching shipper in deploy mode for dev (auto) only
2026-09-20T19:25:43.266Z | deploy | conductor | resumed at deploy after G4 approved
2026-09-20T19:27:51.299Z | deploy | wh-shipper | deploy: dev deployed (npm run dev, confirmed running), staging not run (no command), prod not run (auto: false, owner performs production deploy). Merge blocked: ask_commands hook refuses the push command, branch not on remote, no PR exists.
2026-09-20T19:28:21.077Z | deploy | wh-shipper | deploy mode done: dev deployed (vite ready, localhost:5176/Portfolio/), staging none, prod not run (auto false, owner pushes); deploy record added to ship.md at 149 lines
2026-09-20T19:28:24.191Z | deploy | conductor | D16: close at done with the merge outstanding, or stop blocked -> stop blocked; branch is not on origin, no PR, main unchanged, so done would record a change that never shipped
2026-09-20T19:28:29.367Z | deploy | conductor | BLOCKED at deploy: branch publish refused by the ask_commands hook for the third time; owner must publish the branch, open the PR and merge to main
2026-09-20T20:49:31.918Z | deploy | conductor | resumed at deploy after blocked report; checking whether the branch publish block is still live
2026-09-20T20:52:25.798Z | deploy | wh-shipper | deploy record corrected: prod deployed by the owner via squash merge of PR 11 to main at 7ea3583, Pages run 35536764153 success incl. .nvmrc setup-node and R113 npmrc allowlist steps; ship.md 150 lines
2026-09-20T20:52:25.879Z | deploy | conductor | deploy block cleared outside the pipeline: branch published, PR 11 merged, production publish confirmed green; G5 not a required gate at tier 2
2026-09-20T20:52:30.789Z | deploy | conductor | correction to the previous row: the Pages publish run id is 35536692240, not 35536764153 (that id is an unrelated dependabot run); ship.md records the right one
2026-09-20T20:53:01.793Z | done | conductor | done: G5 auto at tier 2, artifacts committed at f0fdb08, retro dispatched in the background, active change cleared

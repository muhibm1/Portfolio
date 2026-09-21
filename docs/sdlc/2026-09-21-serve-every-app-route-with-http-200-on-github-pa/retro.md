# Retro: Serve every app route with HTTP 200 on GitHub Pages

Change id: `2026-09-21-serve-every-app-route-with-http-200-on-github-pa`
Trigger: G4 approval

## What happened

This change made GitHub Pages answer every app route (and a route's deep link) with the app's
own HTTP 200 content instead of the generic 404 fallback, by writing a route-page copy of
`index.html` at build time and checking the set in CI and after deploy. Build was briefly
disrupted when a second conductor session ran the same change concurrently, leaving a stale
worktree fence that denied edits to `vite.config.js` and `.github/workflows/deploy.yml` until
the owner cleared it by hand. The PR was shipped clean (0 highs, 0 mediums open, 7 lows
accepted open) and merged by the owner, but the deploy phase did not resume for over three
hours after that merge.

## Clock

- `agent_minutes`: 63.4 (ship.md's own summary line differently reads "agents 56 m"; the
  `wh.js digest --all` clock object for this id is used here as the source of record)
- `waiting_minutes`: 487.8
- `dead_minutes`: 202.8
- `budget_minutes`: 90 (tier 2)
- `within_budget`: true

The run was within budget on agent time. Build was the longest agent-time phase at 23.2 minutes
of the 63.4 total, and conductor-log.md shows why: four separate builder/conductor dispatches in
build (lines 11-22), a worktree-fence block that stopped dispatch three times without doing work
(lines 16-18) before the owner cleared it (line 19), then two more builder tasks and a polish fix
once unblocked (lines 21-23). None of that time is wasted agent-minutes since the blocked resumes
did no dispatch, but it explains why build has the most log lines of any phase.

## What the pipeline caught

| Phase | Finding | Would a human have caught it? |
|-------|---------|-------------------------------|
| review | Stray-file scan only matched files literally named `index.html`, missed other stray `.html` (ecc-typescript, ecc-pr-test-analyzer, security) | Unlikely without deliberately testing a stray-file case |
| review | Deploy smoke step followed a redirect to any scheme/host, trusted a possibly-empty body (ecc-typescript, security, silent-failure-hunter) | Unlikely; requires reasoning about curl's silent-failure modes |
| review | No per-file test floor for the four new route-page suites, so deleting one file's tests still cleared the whole-suite floor (silent-failure-hunter, pr-test-analyzer, security) | Possible on a careful review, easy to miss |
| review | Test only asserted the heading was not "Page not found", not that the correct page rendered (ecc-react) | Likely on a close read of the test |
| build | Worktree fence from a second concurrent conductor session denying sensitive-path edits | Yes, once a human looked (owner diagnosed and cleared it directly, conductor-log.md line 19) |

## What the pipeline missed

| Missed | Where it should have been caught | Fix |
|--------|----------------------------------|-----|
| Duplicate G2 approval and the G4 approval both written by an assistant on the owner's standing instruction, not typed by the owner | Approve command / gate presentation should distinguish an owner-typed approval from an assistant-recorded one and hold it as an open decision, not let it flow silently to Ship | ship.md already surfaces this as Decision D1; the instinct `assistant-recorded-approval-not-owner` records the pattern for reuse |
| 194-minute gap between the owner's PR merge (17:38 UTC) and the deploy phase resuming (20:52 UTC), with no recorded cause | conductor-log.md should record why deploy did not resume promptly, or the pipeline should detect a merged PR and prompt resumption | recorded as a tentative instinct; needs a second occurrence before promoting |
| Second conductor session running the same change concurrently, causing a worktree fence to block sensitive-path edits for three dispatch cycles before the owner diagnosed it | The conductor should detect and refuse to start a second session against a change that already has a worktree/session lock, rather than let it run to the point of writing a duplicate approval and blocking a builder | recorded as instinct `worktree-fence-concurrent-conductor`; this is a tooling-level guard change (out of scope for this agent to make) |

## Proposed memory updates

Each becomes a diff to CLAUDE.md, profile.yml, or a skill, reviewed by a human before it is
applied. Nothing below has been edited by this agent.

| Target | Change | Reason |
|--------|--------|--------|
| CLAUDE.md "Mistakes to avoid" | No line proposed yet. `assistant-recorded-approval-not-owner` and `worktree-fence-concurrent-conductor` are each seen once (confidence 0.5); promote to CLAUDE.md once either recurs or a human confirms it (confidence 0.7+) per the retro process. | Keeping CLAUDE.md under one page; single-occurrence lessons stay as instincts, not promoted yet. |
| `.workhorse/profile.yml` | No new protected/sensitive path or command change proposed. `vite.config.js` and `.github/workflows/**` are already `sensitive_paths`; the denial here was a session-state bug (stale worktree fence), not a missing profile entry. | The block was not a profile gap; it was a runtime state issue outside profile scope. |
| WorkHorse conductor tooling (not this repo) | Detect an already-locked worktree/session for a change id before a second `run` starts against it, and refuse or warn instead of proceeding to a duplicate G2. Also consider a check that resumes the deploy phase promptly once a shipped PR's merge is detected, rather than waiting for an unscheduled resume. | Both `worktree-fence-concurrent-conductor` and `deploy-resume-gap-after-merge` point at the conductor/session layer, not this project's profile or CLAUDE.md; this is a change to describe to whoever maintains WorkHorse's pipeline tooling, not a client-repo edit. |
| `evals.md` | No new eval case proposed. Neither the concurrent-session issue nor the approval-provenance issue is a code-level requirement this project's evals cover; they are pipeline-process issues, not app behaviour. | Evals in this project test the route-page feature, not the WorkHorse pipeline's own session handling. |
| Skill (plugin) | Consider a client-independent addition to `wh-agent-rules` or the conductor's own definition: before starting Build (or any phase) on a change, check for an existing active worktree/lock on that change id and stop rather than run concurrently. This is the generalizable form of `worktree-fence-concurrent-conductor` and applies to any WorkHorse client, not just this repo. | Two-session concurrency is a pipeline-level failure mode, not specific to this codebase; belongs in the plugin's own skill/agent definitions, not a client CLAUDE.md. |

## New evals

- None. This change's findings are pipeline/process issues (concurrent sessions, approval
  provenance, deploy-resume timing), not app-level requirements; no `evals.md` case applies.

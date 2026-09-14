# Release: no inlined data font URLs in built CSS

Change id: `2026-09-13-no-inlined-data-font-urls-in-built-css`. Tier: 2.
Branch: `wh/2026-09-13-no-inlined-data-font-urls-in-built-css`, head `ca43d4e` (confirmed, `git log`).
PR: [#8](https://github.com/muhibm1/Portfolio/pull/8), open, `CLEAN`/`MERGEABLE`, base `main`, 14
commits (confirmed, `gh pr view 8` and `git log --oneline main..HEAD`). **Not merged.**
G4: approved, no conditions (confirmed, `wh.js state get gates.G4` and `approvals.md`).
Prepared by the release engineer, 2026-09-14.

This repository has no staging environment and no agent-runnable production deploy command. The
only path to production is the repository owner merging PR #8 into `main`, which triggers
`.github/workflows/deploy.yml`. Nothing in this document was pushed, merged, or deployed by this
agent; every command below is either already run (labelled `confirmed`, with its own exit code and
timestamp) or is a command for the owner to run himself.

## Changelog

User-facing summary of what ships once PR #8 is merged. Drawn from `intent.md` and `spec.md`
(R93-R104). This repository keeps no `CHANGELOG.md` file (confirmed, `git ls-files | grep -i
changelog` returns nothing), so there is no existing file or format to update; this section is the
record instead.

### Fixed

- The live site no longer logs 12 Content Security Policy console errors on every page load. Vite
  was inlining small JetBrains Mono font files (weights 400-700, Cyrillic-ext and Vietnamese
  subsets) into the built stylesheet as `data:` URLs, which the site's `font-src 'self'` policy
  blocked in the browser. Every font now ships as its own same-origin file under
  `/Portfolio/assets/` instead (spec R93, R94).

### Changed

- None visible to a visitor beyond the fix above: the same 64 font faces ship, in the same
  weights and subsets, only as 128 separate files instead of 116 files plus 12 inlined ones (spec
  R95). The Content-Security-Policy and referrer-policy meta tags are byte-identical to before this
  change (spec R96).

### Added

- Two new blocking checks that fail the deploy if this regresses: one on the built CSS before
  anything is uploaded to GitHub Pages (spec R97, R99), and one on the CSS GitHub Pages actually
  serves, after every deploy (spec R100). Neither is visible to a site visitor; both only prevent a
  future regression from shipping silently.

### Security

- No change to the Content-Security-Policy string, the referrer policy, or any other security
  header or meta tag (spec R96, confirmed byte-identical before and after in `verification.md`).
  No new dependency, no new third-party host, no new secret.

## Deploy plan

### Per-environment plan

This repository has exactly one environment: **production**, GitHub Pages, published by
`.github/workflows/deploy.yml` on every push to `main` (`.workhorse/profile.yml` `environments`,
confirmed). There is no staging environment (`staging: { deploy: "", auto: false }`, profile
confirmed) and no lower deployable environment than production. `dev` in the profile
(`npm run dev`, `auto: true`) is a local development server, not a deployable environment with its
own build-and-publish pipeline; it cannot host the rehearsal this gate requires, so the rehearsal
below was run as a local build-based simulation instead (see Rollback).

| Environment | Command | Auto | Gate | Status |
|-------------|---------|------|------|--------|
| dev | `npm run dev` | yes | none | Not applicable to this change. No task in this change touches anything a `npm run dev` session would exercise differently; the fix is a build-time config change, invisible until `npm run build` runs. Not deployed by this agent. |
| staging | (none defined) | no | — | Does not exist. `.workhorse/profile.yml` leaves `staging.deploy` empty. |
| prod | `git push origin main` | no | G5 | **Pending.** Requires G5 approval and the repository owner's own push (CLAUDE.md: "the owner performs production pushes himself"; profile `prod: { auto: false }`). Not run by this agent. |

Pre-deploy checks:
- [x] Verification green at merged commit: `verification.md`, status green, recorded
      2026-09-14T05:42:58.328Z (confirmed, `state.json` `verification.status`)
- [x] Migrations reviewed for reversibility: not applicable, no database, no migration
      (`.workhorse/profile.yml` `database: none`, confirmed)
- [x] Feature flags or config changes listed below

Config and secrets touched (names only, never values):
- None. No secret, environment variable, or Actions secret is added, read, or changed by this
  change (spec R100 Interfaces (c): "Writes... none of the five runner files"; `docs/hosted-config.md`
  section 4 confirms the repository has 0 Actions secrets today). The only configuration touched is
  `vite.config.js`'s `build.assetsInlineLimit` (a build-time function, not a secret) and
  `.workhorse/profile.yml`'s `sensitive_paths`/`tier_floor_paths` lists (already committed at
  `64f91c1`, on the owner's own G2 instruction).

### The owner-run publishing sequence

This is a small, tier-2 change with no schema, no data migration, and a green G4. The exact
sequence the repository owner runs himself:

1. **Review and merge PR #8** at
   [github.com/muhibm1/Portfolio/pull/8](https://github.com/muhibm1/Portfolio/pull/8), using a
   **merge commit**, not squash and not rebase.

   Recommendation: **merge commit**. Confirmed from `git log main --merges`: both prior PRs
   against this repository (PR #1 and PR #7) were merged with an ordinary merge commit
   (`Merge pull request #1 from muhibm1/wh/...`, `Merge pull request #7 from muhibm1/wh/...`),
   preserving every commit on the feature branch. This PR carries 14 commits that are themselves
   the SDLC record required for a due-diligence review two years from now (G1 through G4 approval
   commits, the three task commits T1-T3, the verification and review-packet commits) — the same
   shape of history the repository has kept for both earlier releases. Squashing would collapse
   that trail into one commit and break with the repository's own established convention; rebase
   would rewrite commit SHAs already quoted verbatim in `approvals.md`, `state.json`, and this
   change's own `docs/sdlc/` artifacts. `gh repo view` confirms all three merge methods are enabled
   at the repository level (`mergeCommitAllowed`, `squashMergeAllowed`, `rebaseMergeAllowed` all
   `true`), so the choice is the owner's convention, not a repository restriction. GitHub UI: the
   button is "Merge pull request" (not "Squash and merge" or "Rebase and merge").

2. **The merge to `main` triggers `.github/workflows/deploy.yml` automatically.** No further owner
   action starts it. See Runbook below for what happens automatically inside it.

3. **After the deploy run is green**, the owner performs the R103 manual post-release check
   (verbatim from `spec.md` R103): "Post-release acceptance, performed by the owner. After he
   pushes to `main` and the deploy run is green, he works through R84's four items in a real
   browser. Item 4 must show 0 CSP violations and 0 uncaught errors on `/` and on one deep link."
   Concretely:
   - Open `https://muhibm1.github.io/Portfolio/` in a real browser.
   - Open the browser's developer console.
   - Confirm 0 Content Security Policy violations and 0 uncaught errors, on `/` and on one deep
     link (for example `/Portfolio/work/apple-llm-triage`).
   - (R84 items 1-3, also required by this check per spec R103: the home page renders content
     inside `#root`; the orb animates and stops when the tab is hidden; a deep link pasted into a
     fresh tab renders the case study.)

4. **Record the check** in `docs/hosted-config.md` section 6, per requirement NF24 ("M7: live
   console, post-release... 0 CSP violations, 0 uncaught errors... Owner's R84 browser check,
   logged in `docs/hosted-config.md` section 6", `evals.md` NF24) and its acceptance case GC105
   (verbatim, `evals.md`): "Given post-release acceptance cannot run before a merge, when the site
   owner pushes to `main`, the deploy run is green, and he works through R84's item 4 in a real
   browser on `/` and one deep link, then the console shows 0 CSP violations and 0 uncaught
   errors, and he appends one dated line to `docs/hosted-config.md` section 6 in the form
   `YYYY-MM-DD <sha> no-inlined-data-font-urls 1 pass, 2 pass, 3 pass, 4 pass. <notes>`." Use the
   merge commit's short SHA as `<sha>`. This log format matches `docs/hosted-config.md` section 6's
   existing instructions, which currently read "No entries yet" (this change's entry will be the
   first).

No agent can perform steps 1, 3, or 4; step 2 runs unattended once step 1 happens.

## Rollback

### Rehearsed, 2026-09-14

This repository has no staging environment and no agent-runnable production deploy command (`prod`
requires G5 and the owner's own `git push`, `.workhorse/profile.yml`). There is therefore no
environment below production where an actual deploy-rollback-deploy cycle against
`.github/workflows/deploy.yml` can run. The rehearsal below is the equivalent available at this
repository's shape, following `plan.md`'s own "Rehearsal at G5 (tier 2)" section exactly (approved
at G3): a local build stands in for "deploy" (the artifact `npm run build` produces is exactly what
`deploy.yml`'s build job uploads to Pages), on a disposable scratch branch, never pushed anywhere.
All three steps ran in this session; every command, its exit code, and its timestamp (UTC) are
below.

| # | Step | Command | Exit code | Timestamp (UTC) | Result |
|---|------|---------|-----------|------------------|--------|
| 1 | Deploy (baseline, fix applied) | `git checkout -b wh-rehearsal-g5-2026-09-14 ca43d4e` then `npm run build` | 0, 0 | start 2026-09-14T09:27:25Z, end 2026-09-14T09:27:36Z | `dist/assets/index-D4xY4LDD.css`, 0 `data:font` URLs (`grep -oiE "url\([[:space:]]*[\"']?data:font" dist/assets/*.css \| wc -l` printed `0`) |
| 2 | Roll back | `git revert --no-edit 5627b6d a66ae0a 3bfafa1` (T3, T2, T1, in that order) then `npm run build` | 0, 0 | start 2026-09-14T09:27:54Z, end 2026-09-14T09:28:06Z | All three reverts applied with no conflicts. Rebuild produced `dist/assets/index-CkNgrI9O.css` (the exact filename `intent.md` names as today's live, broken artifact) with 12 `data:font` URLs, matching the documented pre-fix state exactly. `git diff main -- vite.config.js .github/workflows/deploy.yml scripts src` printed 0 lines: the reverted tree matches `main` (pre-change) byte for byte on every path this change touches. |
| 3 | Deploy again (redo) | `git revert --no-edit bd9d208 75bbeed 40c7190` (revert the three reverts, in reverse order) then `npm run build` | 0, 0 | start 2026-09-14T09:28:15Z, end 2026-09-14T09:28:27Z | All three re-applied with no conflicts. Rebuild produced 0 `data:font` URLs again. `git diff ca43d4e -- vite.config.js .github/workflows/deploy.yml scripts src/neverInlineFonts.test.js src/checkBuiltCssFonts.test.js` printed 0 lines: the redeployed tree is byte-identical to the original fix. |

Clean-up: `git checkout wh/2026-09-13-no-inlined-data-font-urls-in-built-css` then
`git branch -D wh-rehearsal-g5-2026-09-14`, both exit 0 (confirmed). No commit from the rehearsal
reached any shared branch; `git status --short` on the change branch is clean afterward
(confirmed).

Schema and data: not applicable, no database, no migration, nothing stored (`.workhorse/profile.yml`
`database: none`, confirmed).

### The exact command for production, once a merge commit SHA exists

PR #8 is not merged, so no merge commit SHA exists yet (confirmed, `gh pr view 8`
`mergeStateStatus: CLEAN`, `mergeable: MERGEABLE`, no merge commit reported). Once the owner merges
it, the rollback command is:

```
git revert -m 1 <merge-commit-sha>
git push origin main
```

`-m 1` tells `git revert` which parent of the merge commit is "the mainline" to revert back
toward — parent 1, `main` as it stood immediately before the merge — which is required for
reverting a merge commit and not needed for reverting an ordinary commit.

**How to find `<merge-commit-sha>` after the merge:**
- `git log main` (or `git log --oneline main -5`) on a freshly fetched `main`; it is the newest
  commit, titled `Merge pull request #8 from muhibm1/wh/2026-09-13-no-inlined-data-font-urls-in-built-css`.
- Or read it directly off the PR page at
  [github.com/muhibm1/Portfolio/pull/8](https://github.com/muhibm1/Portfolio/pull/8), in the
  "muhibm1 merged commit `<sha>` into main" line GitHub shows once merged.

This single `git revert -m 1` reverts all 14 commits on the branch as one unit, including the three
task commits (T1-T3), because they are folded into one merge commit. This matches `plan.md`'s
"Production (GitHub Pages)" rollback note: "The owner reverts... the merge commit... and pushes.
The workflow then rebuilds and republishes the previous site. The revert removes R99 and R100 too,
so that deploy runs the old steps only. Expected effect: the 12 CSP font errors return... Do not
revert `64f91c1`" — but `64f91c1` is a commit inside the merge, not on `main` directly, so a single
merge-commit revert reverts it along with everything else in the PR. If only the profile-protection
commit `64f91c1` should survive a rollback (for example, if the font regression is judged worse than
losing that profile protection temporarily), the owner would instead need to revert the three task
commits individually post-merge (`git revert -m 1 <merge-sha>` reverts everything; a targeted
`git revert 5627b6d a66ae0a 3bfafa1` after locating their post-merge SHAs would revert only the fix)
and keep the profile change. This distinction was not asked for by the plan and is flagged here as a
choice the owner should make consciously if he ever needs a partial rollback, not a default.

### Rollback considerations specific to a GitHub Pages static site

- **No database, no migration, no data to reconcile.** A rollback here means "the previous build's
  bytes are what Pages serves again," nothing more.
- **No down-migration reversibility question applies**, because there is no migration (see
  "Schema and data" above and `plan.md` "Rollback": "Not applicable: no database, no migration, no
  stored data").
- **Cache and CDN propagation delay.** GitHub Pages fronts content through a CDN. `deploy.yml`'s
  existing R63 smoke step already retries the root page fetch up to 5 times with a 10-second
  sleep between attempts specifically to absorb this delay after a deploy (confirmed,
  `deploy.yml` lines 169-186); the same delay applies symmetrically after a rollback push, so the
  owner should expect the previous site to take up to roughly a minute to become visible everywhere,
  not instantly.
- **Partial, non-rollback fixes exist for narrower failures** (`plan.md` "Rollback"): if R100 (the
  live smoke check) fails wrongly on the GitHub Actions runner after the site is already live
  ("the site is already live, because `Deploy to GitHub Pages` runs before every smoke step"), the
  correct response is a forward fix to the R100 step body plus a fresh 14-case R104 rehearsal, not
  a rollback. If R97 (the build-time check) fails wrongly, nothing was uploaded and the previous
  site is still live; fix `scripts/check-built-css-fonts.mjs` forward or revert only the T3 commit.
- **A full rollback also removes the new safety checks** (R97, R99, R100), since they are part of
  the same merge. A deploy running the rolled-back pipeline would no longer catch this exact
  regression if it recurred; the rollback restores the pre-change state completely, including its
  gap.
- **`64f91c1` (profile protection) is already on the branch and inside the same merge commit.** A
  single-command merge-commit revert takes it out too, per the note above.

## Runbook

From `spec.md` "Observability" (verbatim): "No metrics or alerts exist, and none are added. A break
shows as a red build job at `Built CSS inlines no font (R97)` naming the file, counts and ADR 0001,
or, after the site is live, as a red deploy job with `::error::R100 failed ... <url>`. R97's summary
line records the counts on every green run. GitHub notifies the owner of failed runs (believed, not
verified)." No dashboard, metric, or alert exists for this change or the surrounding pipeline; the
signal is always a red GitHub Actions run.

### Automatic (CI), in order, once the owner merges PR #8

| Step | Job | What happens | On failure |
|------|-----|---------------|------------|
| 1 | build | Checkout, Node 22 setup, dependency pin check (R85), `npm ci`, `npm run lint`, `npm test` (test-count floor, R52), `npm run build` | Job fails, nothing later runs, nothing is uploaded |
| 2 | build | **`Built CSS inlines no font (R97)`**: `node scripts/check-built-css-fonts.mjs` against `dist/` (new in this change) | Exits 1 naming the file and the `data:` font count, or exits 2 if it finds nothing to check; job fails, nothing is uploaded to Pages |
| 3 | build | `npm audit --audit-level=high --omit=dev` (blocking), then the informational full-tree audit (`continue-on-error: true`, unchanged) | Blocking audit failure stops the job; informational audit never blocks |
| 4 | build | Configure Pages, upload `dist/` as the Pages artifact | — |
| 5 | deploy | Deploy to GitHub Pages (`actions/deploy-pages`) | — |
| 6 | deploy | Smoke R63: fetch the root page, retrying up to 5 times for Pages propagation | Job fails, site may be live with no smoke confirmation |
| 7 | deploy | Smoke R87 (informational, headers only, never asserted) | Never fails the job |
| 8 | deploy | Smoke R80: asset paths, module script, stylesheet, first `.woff2` font | Job fails, named assertion and URL in the log |
| 9 | deploy | **`Smoke R100: the served stylesheets inline no font`** (new in this change): re-applies the same font rule in bash against every stylesheet the live HTML links | Job fails with `::error::R100 failed...` naming the URL; the site is already live at this point (deploy happens before smoke), so this is a red run against a live site, not a blocked deploy |
| 10 | deploy | Smoke R81: deep-link body matches root body | Job fails, named URL in the log |
| 11 | deploy | Smoke R82: CSP, referrer policy, no phone number, no Google Fonts reference | Job fails, named assertion and URL in the log |

### Manual, owner only, in order

| Step | Who | What |
|------|-----|------|
| A | Owner | Review and merge PR #8 as a merge commit (see "The owner-run publishing sequence" above) |
| B | Owner | Wait for the deploy run (steps 1-11 above) to go green; a red run at step 9 means the site is live with a font regression and needs a forward fix, not a rollback (see Rollback, "Rollback considerations") |
| C | Owner | Run the R84/R103 browser check on `https://muhibm1.github.io/Portfolio/`: home page renders, orb animates and stops when hidden, deep link renders the case study, 0 CSP violations and 0 uncaught errors in the console on `/` and one deep link |
| D | Owner | Append the dated GC105 line to `docs/hosted-config.md` section 6 |
| E | Owner (if step 9 or step C fails) | Decide forward fix vs. rollback per "Rollback considerations" above; if rollback, run `git revert -m 1 <merge-sha>` and push |

### Failure taxonomy (from `evals.md` section 7, carried forward)

| Class | Description | Detection |
|-------|-------------|-----------|
| Wrong result | The build or smoke check reports "clean" while a font is still delivered as `data:`, from a third-party host, or a non-`font/` MIME variant | Pre-merge: R97/R98 and R100/R104's own fixtures. Residual live-only gap, narrower still: a CSP violation that is not a font, caught only by the manual R103/R84 browser check (no headless browser in CI, decided at G1 Q5) |
| Missing result | R99 or R100 is silently removed or never wired into the pipeline | R101's scoped-diff check at review time; the R102 test-count floor (208 tests in 25 files) drops if the new test files' tests go missing; a removed workflow step is visible in code review, since nothing in production alerts on a missing CI step |
| Slow | Not applicable. This change adds 12 more small font file requests browser-side (116 to 128 files), a negligible difference; no latency, throughput or cost metric in `intent.md` names it |
| Leaked | The CSP is silently widened (for example `font-src` gains `data:`) while still passing as "one CSP meta tag present" | Pre-merge only: R96's byte-identical string check and AD22's diff-shape proof. Open, out-of-scope gap flagged by `evals.md`: the existing live smoke step (R82) counts the CSP meta tag but does not compare its content string, so a live-only CSP edit between build and deploy would not be caught live; not possible in this pipeline today, since nothing runs between build and deploy |
| Unauthorised | Not applicable. No auth, no roles, no multi-tenant data in this project |
| Corrupted | `dist/404.html` diverges from `dist/index.html`, or the font-only limit changes an unrelated asset's delivery | Pre-merge: R96's `cmp` check, R95's asset-count checks. Live: the existing R81 body-comparison smoke step |
| Unrecoverable | Not applicable. Everything is a static build artifact behind a CI gate; a bad config fails the build job before upload, and an already-deployed regression is fixed by a follow-up commit and a new push |

## G5 packet

### 1. TL;DR

The live site logs 12 Content Security Policy console errors because Vite inlines small font files
as `data:` URLs; this change makes every font ship as a same-origin file and adds two blocking CI
checks so the regression cannot ship silently again. G4 is approved with no conditions and
verification is green (208/208 tests, 55/55 eval cases at target, 14/14 rollback-rehearsal cases in
`verification.md`). This session additionally rehearsed a full deploy-rollback-redeploy cycle
locally (see Rollback), all three steps exit 0. You are asked to decide the merge method and then
merge PR #8 yourself; no agent can merge, push, or perform the mandatory post-release browser check.

### 2. Decisions requested

| # | Decision | Recommendation | Alternative | If you pick the alternative |
|---|----------|-----------------|--------------|-------------------------------|
| D1 | Merge method for PR #8 | Merge commit (matches PR #1 and #7's history; preserves the 14-commit SDLC trail; see "The owner-run publishing sequence") | Squash merge | The G1-G4 approval commits, the three task commits, and the verification commit collapse into one commit; commit SHAs already quoted in `approvals.md` stay valid (they are unaffected either way), but the branch history that shows the gate-by-gate approval trail is lost from `main` |
| D2 | Disposition of the 7 open low-severity findings from the G4 review packet (D1-D5 there; two `CLAUDE.md` doc gaps, one security low on R100's URL concatenation, one bug low on an empty-string directory argument, one eval-wording gap) | Accept as fast-follow, not blocking this merge, as recommended at G4 and not revisited here | Fix one or more before merging | Reopens sensitive files (`deploy.yml`, `scripts/check-built-css-fonts.mjs`) for changes outside this change's approved scope, delaying the merge |
| D3 | Whether to revert `64f91c1` (profile protection) along with the fix, in a future rollback | Keep it bundled: a single `git revert -m 1 <merge-sha>` reverts everything in the merge together, which is the simplest and best-tested rollback path (rehearsed above) | Preserve `64f91c1` in a rollback by reverting only the three task commits individually | More commands to run correctly under incident pressure, for a benefit (keeping the profile protection) that only matters if a rollback and a desire to keep that specific protection coincide |

### 3. Evidence

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| G4 gate state | `node wh.js state get gates.G4` | n/a | `approved` | confirmed |
| Verification status | `node wh.js state get` | n/a | `"verification": { "status": "green", "at": "2026-09-14T05:42:58.328Z" }` | confirmed |
| Full check suite at the merged commit | `verification.md` (this session did not re-run these; condensed from the G4-approved record) | 0 across lint, test, build, audit | 208 passed/25 files, `dist/assets/index-D4xY4LDD.css`, 0 vulnerabilities | confirmed, carried from `verification.md`, not re-run this session |
| PR #8 mergeability | `gh pr view 8 --json mergeable,mergeStateStatus` | n/a | `MERGEABLE`, `CLEAN` | confirmed |
| Prior merge convention | `git log main --merges --oneline` | n/a | PR #1 and PR #7 both merged with an ordinary merge commit | confirmed |
| Repository merge-method settings | `gh repo view --json mergeCommitAllowed,squashMergeAllowed,rebaseMergeAllowed` | n/a | all three `true` | confirmed |
| Rollback rehearsal: deploy (baseline) | `npm run build` on scratch branch at `ca43d4e` | 0 | 0 `data:font` URLs | confirmed, this session, 2026-09-14T09:27:25Z-09:27:36Z |
| Rollback rehearsal: roll back | `git revert --no-edit 5627b6d a66ae0a 3bfafa1` then `npm run build` | 0, 0 | 12 `data:font` URLs (matches documented pre-fix state); diff against `main` on all touched paths is empty | confirmed, this session, 2026-09-14T09:27:54Z-09:28:06Z |
| Rollback rehearsal: deploy again | `git revert --no-edit bd9d208 75bbeed 40c7190` then `npm run build` | 0, 0 | 0 `data:font` URLs; diff against `ca43d4e` on all touched paths is empty | confirmed, this session, 2026-09-14T09:28:15Z-09:28:27Z |
| Scratch branch cleanup | `git checkout <change-branch>` then `git branch -D wh-rehearsal-g5-2026-09-14` | 0, 0 | Clean working tree on the change branch afterward | confirmed |
| Owner's post-release browser check (R84 item 4, R103, NF24, GC105) | not run | n/a | n/a | Not verified: cannot run before merge. Owner-performed, tracked in this document's Runbook and "The owner-run publishing sequence" |
| First live CI run of R97/R99/R100 in GitHub's actual Ubuntu runner | not run | n/a | n/a | Not verified: happens only on the real merge, believed to behave as rehearsed (14/14 R104 cases matched locally in Git Bash; POSIX ERE only, per `plan.md`) |

### 4. Findings / constraint audit carried forward from G4

All 7 findings from the G4 review packet remain open at low severity; none is above low, so none
blocks this gate per this change's own rule. Verbatim resolutions unchanged since G4:

| Severity | Reviewer | File | Finding | Resolution |
|----------|----------|------|---------|------------|
| Low | Security | `.github/workflows/deploy.yml` (R100 step) | Builds its fetch URL by string concatenation without validating the href starts with `/`; mitigated today because the earlier R80 step in the same job already rejects any href not starting `/Portfolio/` | open |
| Low | Security | `scripts/check-built-css-fonts.mjs` | The `data:font` detection regex is scoped to font MIME types by design; documented, 0 occurrences today | open |
| Low | Bug | `scripts/check-built-css-fonts.mjs` | An empty-string directory argument is treated as a valid path and scans the whole repo/cwd instead of defaulting or erroring; CI never passes an empty argument | open |
| Low | Bug | `docs/sdlc/.../evals.md` (EG30) | Case description doesn't match implementation scope exactly (`data:font` count is file-wide, not block-scoped); wording gap, no discriminating test | open |
| Low | Adoption | `CLAUDE.md` (Commands) | Does not mention `node scripts/check-built-css-fonts.mjs` | open |
| Low | Adoption | `CLAUDE.md` (Ask first) | Does not list the two new sensitive scripts (the profile itself is correct) | open |
| Info | Adoption | `docs/sdlc/codebase-map.md` | Stale about CI/scripts; pre-existing before this change | open |

No new finding was raised by this release-engineering pass. The rollback rehearsal (new evidence
this session) surfaced one process nuance not previously written down: a single merge-commit revert
also reverts `64f91c1` (see D3 above), which `plan.md`'s rollback note did not address because it
predates the merge shape being final.

### 5. Risk register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| R100 behaves differently on the GitHub Ubuntu runner than in local Git Bash | Low | False PASS, or a red deploy after the site is already live (step 9 runs after deploy) | POSIX ERE only; 14-case R104 rehearsal already passed; the first live deploy's PASS line is the remaining proof | Owner, at merge |
| A CSP violation that is not a font ships and is invisible to CI | Medium | Console errors after release, only caught by the manual R84/R103 check | R84 check after every push touching `vite.config.js`; no browser in CI (accepted at G1 Q5) | Owner, every push |
| Owner squashes or rebases PR #8 instead of merge-commit, against this document's recommendation | Low | Branch history convention drift from PR #1 and #7; no functional risk | This document's D1 and recommendation; owner's call | Owner |
| A rollback is needed and the owner reaches for a plain `git revert <sha>` instead of `git revert -m 1 <merge-sha>` | Low | `git revert` on a merge commit without `-m 1` fails outright (git refuses), so this fails loudly, not silently | This document names the exact command and flag | Owner, if a rollback is ever needed |
| The 7 open low-severity findings accumulate across future changes if never scheduled as a fast-follow | Low | Growing doc/hygiene debt, no functional risk today | D2 above; recommend the owner schedule a small fast-follow change | Owner |

### 6. Environment tour

Ordered by risk, following this repository's single environment:

1. **Production (GitHub Pages, via `.github/workflows/deploy.yml`)**. The only environment. Command
   `git push origin main` (as the merge), `auto: false`, gated on G5. Everything in the Runbook's
   "Automatic (CI)" table runs here, unattended, once the owner merges. First in the tour because it
   is the only place this change can ever run.
2. **Local build (`npm run build`), used as the rehearsal stand-in**. Not a deployable environment
   in the profile; used only because no lower environment exists to host the mandatory tier-2
   rehearsal. All three rehearsal steps ran here this session, on a disposable scratch branch, never
   pushed.
3. **`dev` (`npm run dev`, auto: true)**. Exists in the profile but is not applicable to this change:
   a dev server does not run `npm run build` and cannot exercise the built-CSS or CI-check behavior
   this change adds. Not used in this release.
4. **`staging`**. Does not exist (`deploy: ""`, `auto: false` in the profile).

### 7. Checklist

- [x] G4 approved, no conditions (confirmed, `state.json`, `approvals.md`)
- [x] Verification green at the commit PR #8 will merge (confirmed, `state.json`, `verification.md`)
- [x] Rollback documented and rehearsed at tier 2 (this document, "Rollback", three steps, all exit
      0, timestamped)
- [x] Deploy plan lists every environment, including the ones that don't exist or don't apply, with
      reasons (this document, "Per-environment plan")
- [x] Runbook lists every automatic CI step and every manual owner step, in order (this document,
      "Runbook")
- [x] Config and secrets touched are named, no value exposed (this document, "Deploy plan": none
      touched)
- [ ] Owner has chosen and recorded the merge method (D1, pending the owner's decision)
- [ ] Owner has merged PR #8
- [ ] Owner has performed and logged the R84/R103 browser check in `docs/hosted-config.md` section 6
      (cannot be done before merge; tracked for the next pass of this document)

**Recommend approve.** G4 was approved with no conditions, verification is green, and this
session's rollback rehearsal completed cleanly (3/3 steps, exit 0, all diffs matching expectations
exactly). The only action needed is the owner's own merge of PR #8, using a merge commit, followed
by the owner's post-release browser check. This repository's `prod` environment is `auto: false`
regardless of tier (`.workhorse/profile.yml`), and CLAUDE.md and the profile both state that a push
to `main` is production-performed by the owner alone, never by an agent, so this document explicitly
hands the merge, the push, and the browser check to the owner rather than attempting any of them.
Once the owner merges and the deploy run is green, the release engineer's next pass records the
merge commit, the CI run's result, and, once the owner reports it, the R84/R103 browser check in
this document's Deploy record below.

## Deploy record

| Environment | At (UTC) | By | Commit | Result |
|-------------|----------|----|--------|--------|
| prod | pending | owner | pending (see PR #8) | pending |

```
/workhorse:approve G5
/workhorse:approve G5 --reject "notes"
```

# Retro: no inlined data font URLs in built CSS

Change id: `2026-09-13-no-inlined-data-font-urls-in-built-css`
Trigger: G4 approval, change merged and deployed

## What happened

The live site logged 12 Content Security Policy console errors because Vite's default
`assetsInlineLimit` inlined small JetBrains Mono files into the built CSS as `data:` URLs, which
the site's `font-src 'self'` policy blocked (confirmed, `intent.md`). This change made every font
ship as a same-origin file instead and added two blocking CI checks (build-time and live-served)
so the regression cannot ship silently again, going through all five gates with no rejection and
landing as PR #8 (`c3b7ca5`, confirmed, `git log`). The owner's required post-deploy browser check
found 0 CSP violations and 0 inlined fonts on the live site, and was logged in a follow-up
docs-only PR #9 (`00c2ce4`, merge `a30f2fc`, confirmed, `git show 00c2ce4 --stat` and
`docs/hosted-config.md` section 6, both read directly).

## What the pipeline caught, by phase

| Phase | Finding | Would a human have caught it? |
|-------|---------|-------------------------------|
| Spec (G2) | Constraint auditor's M5: the revision-1 plan tested `neverInlineFonts` by importing `vite.config.js` under jsdom, which fails to load at all (esbuild `TextEncoder` invariant), so the test never actually ran. Conductor reproduced it locally before dispatching a rewrite that moved the function to its own module. Evidence: `conductor-log.md` 2026-09-14T02:09:11.083Z (M5 raised), T02:09:43.498Z (conductor reproduced), T02:37:49.985Z (rev 2 fix) | Likely, if they ran the test suite themselves — this is a real, loud test failure, not a silent one. The pipeline's value here was catching it at spec time, before any code was written, not that a human never would have |
| Verify | `wh-verifier` caught a self-consistency gap across 3 verify sessions: `plan.md` and `evals.md`'s prose said commit `64f91c1` touched one file, when it actually and correctly touched two (`.workhorse/profile.yml` plus one line of this change's own `conductor-log.md`). Held status red until the wording was corrected and all five affected checks were re-run fresh. Evidence: `verification.md` lines 4-22, "Failures and fixes" table; `conductor-log.md` 2026-09-14T05:42:53.649Z | Unlikely — this is the kind of fine-grained "does the prose match the actual `git show --stat` output" check a human reviewer reading for intent, not auditing every clause against a fresh command, would plausibly wave through |
| Review (G4) | Adoption reviewer: `CLAUDE.md`'s Commands section never mentions the new blocking check `node scripts/check-built-css-fonts.mjs`, and its "Ask first" list never gained the two new sensitive scripts, even though `.workhorse/profile.yml` itself was correctly updated at G2-D6. Evidence: `review-packet.md` section 4, Adoption row; independently re-confirmed by this retro reading the current `CLAUDE.md` directly, still missing both as of this retro | Unlikely — a human skimming a PR diff dominated by `deploy.yml` and `vite.config.js` changes would plausibly not think to check whether a prose doc file was updated to match a machine-config file that was |
| Review (G4) | Bug reviewer: `scripts/check-built-css-fonts.mjs` treats an empty-string directory argument as a valid path and scans the whole repo/cwd instead of defaulting or erroring (low, not reachable through this repo's CI). Security reviewer: the R100 smoke step builds its fetch URL by concatenation without independently validating the href starts with `/`, relying on the earlier R80 step's gate in the same job. Evidence: `review-packet.md` section 4, Bug and Security rows | Plausible either way — both are the kind of defensive-coding nit a careful senior reviewer catches and a rushed one does not |
| Deploy (G5) | Release engineer's rehearsed rollback (deploy, revert, redeploy, all local, 3/3 steps exit 0) surfaced a process nuance nobody had written down before: a single merge-commit revert also reverts `64f91c1`, the profile-protection commit, so the owner needs to choose consciously between a full rollback and a more surgical one if he ever wants to keep that protection during an incident. Evidence: `release.md` "Findings" section and D3; `conductor-log.md` 2026-09-14T09:31:46.549Z | Unlikely without an actual rehearsal — this is exactly the kind of interaction a "dry run in your head" misses and an executed rehearsal catches |

## What the pipeline missed

| Missed | Where it should have been caught | Fix |
|--------|-----------------------------------|-----|
| The two `CLAUDE.md` doc gaps the adoption reviewer found at G4 (Commands section, Ask-first list) were accepted as a non-blocking fast-follow (review-packet.md D1, release.md D2) and were never actually fixed before merge. `CLAUDE.md` on `main` still lacks both today (confirmed by this retro reading the file directly) | G4, where it was raised — the review packet correctly flagged it as low and non-blocking, which was a reasonable call for this small change, but nothing then tracked it to closure | Applied in this retro's proposed `CLAUDE.md` diff below |
| Item 2 of the mandatory R84/R103 post-deploy manual check (does the orb pause when the tab is hidden) could not be verified live: the session performing the post-deploy check used its own browser-automation tool, and that tool's own tab-backgrounding/foregrounding is itself what the target code's `visibilitychange` handler reads, so the automation confounded the exact signal it was trying to observe. This is a verification-tooling limitation, not a defect in the shipped code — the pause-on-hide logic and its own test suite were unchanged by this fix and passed. Honestly logged as inconclusive rather than falsely marked pass, in `docs/hosted-config.md` section 6's 2026-09-14 entry (confirmed, read directly) | `spec.md`'s R103/"Observability" section, which defines all four manual-check items as one undifferentiated list — it should have flagged that item 2 specifically needs a human-driven browser, not agent browser automation, the way items 1, 3 and 4 do not | Recorded as a `CLAUDE.md` Mistakes-to-avoid follow-up below: re-check `ThinkingOrbHero.jsx`'s pause-on-hide behaviour with a normal, manually-driven browser next time that component changes, not with the session's own automation tool |
| No rejection at any gate and no fix loop over two iterations on real code (the GC103 wording gap was a documentation-only self-consistency issue in this change's own SDLC artifacts, not a shipped defect, and never affected the delivered code) | Not applicable | Not applicable |

## Proposed memory updates

Each is a diff for the human to review and apply. Not applied to any file by this retro, per this
task's explicit instruction ("propose ... never applied silently") — this change is already merged
into `main` (PR #8, `c3b7ca5`), and this retro runs on a fresh branch off `main`, not the original
`wh/` change branch, so there is no open change to carry these through G4 with.

### `CLAUDE.md` "Mistakes to avoid" (newest first; list currently has 4 lines, would have 6, still under the 10-line cap)

```diff
 ## Mistakes to avoid

 Appended by retro after each change. Newest first.

+- A browser-automation tool that backgrounds/foregrounds its own tab confounds any check of
+  `visibilitychange`-driven behaviour (for example `ThinkingOrbHero.jsx`'s pause-on-hide): the
+  tool's own tab state is what the code reads, so the result is inconclusive, not a real pass or
+  fail. Re-check with a normal, manually-driven browser next time that component changes.
+- When `.workhorse/profile.yml`'s `sensitive_paths` or `tier_floor_paths` gains a new path (for
+  example a script), mirror it into this file's Commands and "Ask first" sections in the same
+  change. Change 2026-09-13 added two scripts to the profile at G2-D6 but never updated this file,
+  and the gap was still open on `main` after merge.
 - `npm run lint` exits 1 with `Cannot find native binding` because `node_modules/@oxlint/` is
   empty (npm optional-dependency bug). Do not treat it as a code failure. Fix by deleting
   `node_modules` and `package-lock.json` and reinstalling.
```

Evidence: `docs/hosted-config.md` section 6, 2026-09-14 `c3b7ca5` entry (the automation confound,
read directly); `review-packet.md` section 4 Adoption row and `release.md` D2 (the CLAUDE.md drift,
also independently confirmed by reading the current `CLAUDE.md`).

### `CLAUDE.md` Commands and Protected sections (closes the adoption-reviewer gap directly, not just as a Mistakes line)

```diff
 ## Commands

 - Install: `npm ci`
 - Typecheck: none (no TypeScript)
 - Lint: `npm run lint` (oxlint) — currently fails on this machine, see Mistakes below
 - Test: none yet (add Vitest and React Testing Library in the first spec)
 - Build: `npm run build` (Vite, writes `dist/`)
 - Dev: `npm run dev`
 - Audit: `npm audit --audit-level=high`
+- Check built CSS for inlined fonts (blocking in CI, no npm script alias per ADR 0002):
+  `node scripts/check-built-css-fonts.mjs`
```

```diff
 Ask first: `.github/workflows/**`, `index.html`, `vite.config.js`, `package.json`,
-`package-lock.json`.
+`package-lock.json`, `scripts/never-inline-fonts.mjs`, `scripts/check-built-css-fonts.mjs`.
```

Note: "Test: none yet" is already stale independent of this change (a test runner was added by
change 2026-09-11, confirmed by `.workhorse/profile.yml`'s `commands.test`), but no reviewer of
*this* change raised it, so it is out of this retro's scope per the "one job" rule and is flagged
here only so it is not lost.

### `.workhorse/profile.yml`

No change proposed. The profile itself was already correctly updated at G2-D6 (`64f91c1`,
confirmed, `git show 64f91c1 --stat` and the profile's own `sensitive_paths`/`tier_floor_paths`
entries for both scripts, read directly). The gap was entirely in `CLAUDE.md`, handled above.

### `evals.md` of the change

No new permanent case proposed. This change did not originate from a triaged incident (it was a
requester-filed defect from the previous change's own R84 post-deploy check, already captured as
this change's own `intent.md` "Source"), and the two open low-severity code findings that remain
unfixed (the empty-string directory argument, `scripts/check-built-css-fonts.mjs`; the R100 URL
concatenation) are tracked as accepted, non-blocking risk in `release.md`'s risk register rather
than as incidents. Neither has a code fix to write a case against yet; if either is fixed in a
later change, that change's own `evals.md` is the right place for the case, not this one's after
the fact.

### Skill in the plugin (described, not edited here)

**Candidate skill edit:** in whichever skill or agent definition covers a manual/live post-deploy
check that includes Page-Visibility-API-driven behaviour (this repo's `spec.md` "Observability"
and R103, likely a `wh-release-engineer` or verification-related skill), add a rule: when a
required manual check includes verifying `visibilitychange`- or `IntersectionObserver`-driven
pause/resume behaviour, do not use the performing session's own browser-automation tool as the
check, because most such tools background/foreground the tab themselves, which is exactly the
signal the code under test reads. Flag that check item as needing a human-operated browser
specifically, distinct from other items in the same manual-check list that automation can perform
reliably. This is client-independent: any project using the Page Visibility API for pause-on-hide
behaviour and verified through an agent's own browser tool would hit the same confound. Evidence:
`docs/hosted-config.md` section 6, 2026-09-14 `c3b7ca5` entry.

## New evals

None added. See "`evals.md` of the change" above for why.

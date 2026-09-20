# Adoption review: pin Node 22.12 minimum

Change id: `2026-09-20-pin-node-22-12-minimum`. Reviewed `git diff main...wh/2026-09-20-pin-node-22-12-minimum` (confirmed) plus brief.md, spec.md, plan.md, evals.md, verification.md, conductor-log.md, `.workhorse/profile.yml`, `CLAUDE.md`, `docs/sdlc/codebase-map.md`, `docs/sdlc/constraints.md`.

Verdict: 1 finding (0 critical, 0 high, 1 medium, 0 low)
Adoption score: 4

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| medium | CLAUDE.md:52 (Mistakes to avoid) | `.npmrc` cannot be created or edited by the agent harness at all (a built-in filename block, distinct from the profile's owner-prompt gate). This is not written down anywhere a future contributor or agent would read it before hitting it. Confirmed: `conductor-log.md` lines 16 and 22-24 show this exact change's own build blocked twice on this ("hook denial on .npmrc create" then "permission system refuses all writes to .npmrc (built-in sensitive filename)"), requiring the owner to create the file by hand before the build could continue. | A future agent-driven change needs to edit `.npmrc` (for example widening the allowlist or rotating a setting) and burns a build cycle rediscovering that no tool can write it, exactly as this change did | CLAUDE.md: add one line to "Mistakes to avoid" saying `.npmrc` cannot be created or edited by the agent's own tools regardless of the profile's ask-first gate; the owner must create/edit it by hand |

## Walkthrough

1. **Find it.** Confirmed: `CLAUDE.md` Commands names `.nvmrc` and `engines` as the lint floor; `docs/sdlc/codebase-map.md` "Package manager" row and the Commands table entry both point at the same three files. A reader can locate `.nvmrc`, `.npmrc`, `package.json` engines and `scripts/check-npmrc.mjs` from either document without searching.
2. **Understand it.** Confirmed: `scripts/check-npmrc.mjs` has a four-line top comment stating usage and all three exit codes; its name and R107/R113 vocabulary match spec.md exactly. `.nvmrc` and `.npmrc` are self-explanatory by convention.
3. **Change it safely.** Confirmed: 19 new tests across `src/nodeVersionPin.test.js`, `src/checkNpmrc.test.js`, `src/deployWorkflowNodeVersion.test.js` pin the engines value, the `.npmrc` allowlist content, the workflow's `node-version-file` line, the guard step ordering, and all three `permissions:` blocks (AD27) plus `persist-credentials: false`. A wrong edit to any of these (wrong floor, an extra `.npmrc` line, a re-added `node-version:`, a widened permission) fails a named test.
4. **Run it.** Confirmed by verification.md and by this review's own read of `scripts/check-npmrc.mjs`: `node scripts/check-npmrc.mjs` at the root prints `npmrc allowlist passed (R113): .npmrc sets engine-strict=true and nothing else.` (exit 0, observed as text in verification.md, not a captured numeric code — same caveat verification.md itself states for `npm ci`/`npm test`/`npm run build`/`npm audit`). The documented `EBADENGINE` error shape (spec Interfaces (d), confirmed via three throwaway fixtures per spec's own verified-facts table) names the required range and the actual Node version, so a person on the wrong Node is pointed straight at the fix. CLAUDE.md's Mistakes entry now says the same thing and gives `nvm use` as the remedy. Not independently re-run in this review: an actual `npm ci` on a sub-22.12 Node (none available in this environment); relied on spec.md's and verification.md's fixture evidence, which is itself labelled confirmed.
5. **Operate it.** Confirmed: `check-npmrc.mjs`'s three outputs are actionable (clean pass; per-line-and-key rejection, never printing the value; missing-file at exit 2, "engine-strict is not enforced without it"). No metric or alert is claimed and none is expected for a static site (spec's Observability section, confirmed against `.workhorse/profile.yml` having no monitoring commands). No runbook entry exists, but the failure surfaces synchronously in the CI log at the step that failed, which is enough for a single-owner static site with no on-call rotation.
6. **Why.** Confirmed: ADRs 0001-0004 cover the four non-obvious decisions (release-line vs exact pin, `engine-strict` vs `devEngines`, pointing the workflow at `.nvmrc`, where the allowlist runs). All four are linked from spec.md and plan.md.

Documentation correction (R111): confirmed complete for the four in-scope documents. `grep -c "4828" CLAUDE.md` = 0, `grep -c "v21.7.3"` = 0 in `codebase-map.md` and `constraints.md`, `.gitignore`/`.env*` sentence corrected in both `constraints.md` rows (known-debt row 6, risk row). Historical per-change SDLC records under `docs/sdlc/2026-09-11-*` and `docs/sdlc/2026-09-13-*` (retro.md, spec.md, plan.md, review-packet.md, adr/0004) still contain the old "npm cli issue 4828" / Node v21.7.3 wording — these are dated archival records of past changes, not living documentation, and D5 in spec.md explicitly scoped the correction to the four current-state documents; not counted as a blocker.

## Findings outside scope

None.

## Not verified

- Numeric exit codes for `npm ci`, `npm run lint`, `npm test`, `npm run build`, `check-npmrc.mjs`: inherited from verification.md's own caveat (sandbox could not capture `$?`); this review did not independently re-run these commands, only read their logged output text.
- An actual `npm ci` against a Node below 22.12.0 in this review session: not attempted here; relied on spec.md's three-fixture verification and `src/nodeVersionPin.test.js` (GC110, FL52, FL53) passing per `verification.md`.
- `npx vitest run` shell-fallback path (plan T1 step 5): declined as an ask command per verification.md; not exercised in this review either.
- Post-merge CI log showing the guard step and resolved Node version: cannot exist before a push to `main`.

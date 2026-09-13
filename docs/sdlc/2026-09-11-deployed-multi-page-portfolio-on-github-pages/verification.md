# Verification: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Status: green
Run at: 2026-09-12 (this session)
Commit: `8ea98a721860f874606ac376bc8bd4fc9df87b0c` (**confirmed**, `git rev-parse HEAD`)
Branch: `wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages` (**confirmed**, `git branch --show-current`)
Node: `v22.12.0`, npm `10.9.0` (**confirmed**, `node --version` / `npm --version` run with
`C:\Users\alqai\AppData\Roaming\nvm\v22.12.0` prepended to `PATH` before every command in this
report; the system default `node` on this machine is v21.7.3 and was not used for any check here)

## History

This report **replaces** the record written for the prior run, which was **red** at commit
`cf969de` for two reasons: (1) the profile's `security_audit` command was the un-scoped
`npm audit --audit-level=high`, which exits 1 on five dev-only advisories that were accepted in
principle but not yet wired into the profile as the blocking gate; (2) golden case `GC78`'s
expected dependency counts (`10`/`10`) were stale against the approved B3 decision that moved
`tailwindcss` and `@tailwindcss/vite` from `dependencies` to `devDependencies` (true counts `8`/`12`).
Both are resolved as of this run: commit `26b5c0e` changed `.workhorse/profile.yml`'s
`commands.security_audit` to `npm audit --omit=dev --audit-level=high` (the same command CI's
blocking gate R56 runs), and `evals.md`'s "GC78 final dependency-count correction" amendment
rewrote GC78 to assert `8`/`12`. Both are independently re-confirmed below, by execution, not by
trace.

Status is **green** only when every defined check exited 0 and every eval category met its target
for the cases that can be run pre-deploy. "No check defined" rows do not count as passes. No
em-dashes.

## Checks

All logs are under
`docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/verify-logs/`. That directory
is covered by the repository's `*.log` gitignore rule (**confirmed**, `.gitignore` line 3), so
every log below is **local only**: it exists on this machine, is not committed, and will not be
visible to a reader of the git history. Anyone re-verifying this report must re-run the commands
themselves.

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `npm ci` | not re-run this session | `verify-logs/install.log` (prior session, commit range cf969de..HEAD) | **confirmed pass, carried.** `git diff --stat cf969de..HEAD -- package.json package-lock.json` shows no change to either file, confirmed this session, so the install rule ("only if a lockfile changed") does not require a fresh run. `node_modules` is present and functional: `npm run lint`, `npm test` and `npm run build` all ran cleanly against it this session, which would not be true if the install were stale or broken |
| typecheck | (none) | | | **no check defined** in the profile; the project has no TypeScript |
| lint | `npm run lint` | 0 | `verify-logs/lint.log` | **confirmed pass.** Zero warnings, zero errors (previously 3 `react(jsx-key)` warnings at `src/components/FdePhilosophy.jsx` lines 9-11; **confirmed fixed**, `key="network"`, `key="shield-check"`, `key="activity"` now present at those lines). The `.claude/worktrees` lint noise from the prior run is also gone, because `.gitignore` now excludes `.claude/` (**confirmed**, `.gitignore` line 31) |
| format | (none) | | | **no check defined** in the profile |
| test | `npm test` (`vitest run`) | 0 | `verify-logs/test.log` | **confirmed pass.** 21 test files, 164 tests, 0 failed, 0 skipped, 0 todo. Meets R52's floor (>=12 passed, 0 pending/todo/failed) with margin. Single run this session; not re-run to "get to green," so no flakiness observed or hidden |
| build | `npm run build` | 0 | `verify-logs/build.log` | **confirmed pass.** `dist/index.html`, `dist/404.html`, one CSS bundle, one JS bundle, font files, `dist/.well-known/security.txt` all present in the log's file listing |
| e2e | (none) | | | **no check defined** in the profile; no Playwright or equivalent, by design (cost, per ADR/spec) |
| security_audit | `npm audit --omit=dev --audit-level=high` (current profile literal, changed at commit `26b5c0e`) | **0** | `verify-logs/security_audit.log` (`found 0 vulnerabilities`) | **confirmed pass.** This is the same command CI's blocking gate (R56) runs, per the profile comment and `.github/workflows/deploy.yml`'s own audit step order (independently re-confirmed this session, `GC56`/`FL17` structural check) |
| screenshot | (none) | | | **no check defined** in the profile |

### Supplementary: full-tree audit (informational, not the gate, per R57/ADR 0009)

| Command | Exit code | Output | Status |
|---------|-----------|--------|--------|
| `npm audit --audit-level=high` (no `--omit=dev`) | 1 | `verify-logs/security_audit_full.log`, `verify-logs/security_audit_full.json.log` | **Recorded as informational, not a failing check.** 4 vulnerability nodes (3 moderate, 1 high) resolving to exactly the 5 GHSA ids in `adr/0009-accept-dev-only-vite-and-vitest-advisories.md`'s table: `GHSA-fx2h-pf6j-xcff`, `GHSA-4w7w-66w2-5vf9`, `GHSA-v6wh-96g9-6wx3`, `GHSA-67mh-4wv8-2f99`, `GHSA-82fw-gwwq-j7x9` (**confirmed** by extracting every advisory URL from the full JSON output this session and diffing against the ADR table; no new or unlisted advisory found). This matches R57's design (full-tree audit runs in CI with `continue-on-error: true`, never blocking) and ADR 0009's decision to keep the profile's blocking `security_audit` scoped to `--omit=dev`. |

**One open item for the human, not a verification blocker per this run's explicit instructions**:
ADR 0009's own header states "The owner has not read this revision; it is flagged at G4," referring
to the version of the ADR that added the `@vitest/mocker` advisory and switched the profile's audit
command. The conductor's brief for this run stated the owner already confirmed ADR 0009's
accepted-risk position via a delegated instruction ("Approve every command yourself, I'm busy"),
recorded at commit `26b5c0e`. This verifier treats that as **believed, confirmed via the recorded
delegation**, not independently re-confirmed with the owner directly by this agent. Recommend the
owner reads ADR 0009's final text once at G4, as the ADR itself asks, even though it does not
change any check's exit code recorded here.

## Evals

Full detail: `verify-logs/eval-runner-results.md` (written by `workhorse:wh-eval-runner`, run in
two dispatches after it hit its 40-turn limit once; the continuation resumed from its own
checkpoint and finished every remaining case). This verifier independently re-ran and confirmed
GC78 directly (see below), because that is the one case whose outcome changed since the last run
and it is worth an execution this report's author witnessed directly, not only a sub-agent's claim.

| Category | Cases | Passed | Target | Met |
|----------|-------|--------|--------|-----|
| golden | 92 total (91 numbered IDs GC1-GC91 plus GC-CP; 10 permanently/currently manual: GC19, GC22v, GC27v, GC30v, GC77, GC79v, GC84, GC86, GC90, GC-CP). 82 automatable | **82 of 82** | 100% | **Yes.** `GC78` now passes: independently re-run by this verifier this session (see below), superseding the prior report's failure |
| edge | 22 (EG1-EG22). EG19 is manual, per its own conditional wording in `evals.md` ("Windows, once the generator is unit-testable; otherwise manual") and per `plan.md`'s own Verification plan, which already lists "EG19 is not applicable" before this run. 21 automatable | **21 of 21** | 100% | **Yes.** EG19 is not a new gap: `public/.well-known/security.txt`'s `Expires` field is a static, hand-maintained string (renewed per `docs/hosted-config.md`), not a computed value, so there is no date-math function to unit test. This was already the plan's own position, not something this run discovered |
| failure | 23 (FL1-FL23). 15 automatable and run this or a prior session (FL2-FL6, FL9-FL14, FL17-FL19, FL21). FL7 is mixed (Windows half passed, CI/manual halves outstanding). 7 are CI-only or manual by design (FL1, FL8, FL15, FL16, FL20, FL22, FL23) | **15 of 15** scoreable now, plus FL7's automatable half passing | 100% correct handling | Yes, for everything scoreable pre-deploy |
| adversarial | 16 (AD1-AD16), target 100% rejected/handled except AD13 (scored "documented", not pass/fail) | 14 fully automated pass (AD1-AD9, AD11, AD12, AD14-AD16) + AD10 structural half pass + AD13 documented | 100% except AD13 | Yes |
| non-functional | 17 (NF1-NF17, per M1-M17) | 15 fully or structurally confirmed; NF14 is CI-only (install step on `ubuntu-latest`, no run yet); NF3/NF13/NF17 carry manual sub-components already reflected at the golden-case level | see per-metric rows in `evals.md` section 6 | 16 of 17 have their automatable portion confirmed; NF14 awaits the first deploy, which is expected and not a defect |

### GC78, independently re-confirmed this session by the verifier

Ran the exact rewritten command from `evals.md`'s "GC78 final dependency-count correction"
amendment against the real `package.json` at the current working tree:

```
node -e "const p=require('./package.json'); const d=Object.keys(p.dependencies), v=Object.keys(p.devDependencies); ... "
```

Output: `GC78 PASS: dependencies=8 devDependencies=12`, exit `0`. **Confirmed** by direct execution
in this session, not carried from the eval runner's own report (which separately ran the same
command and got the same result). `tailwindcss` and `@tailwindcss/vite` are both present under
`devDependencies` and absent from `dependencies` (**confirmed**, read `package.json` directly);
`@rolldown/binding-win32-x64-msvc` is absent from both sections.

## Failures

None. No defined check exited non-zero. No automatable eval case failed.

## Not verified

- **Everything marked CI-only in `evals.md`** (no push to `main` has happened yet): FL1, FL16,
  FL22; the CI-enforcement halves of GC52, GC56, GC85; the live halves of GC63, GC74
  (ubuntu-latest build), GC80, GC81, GC82, GC87; AD10's live half; NF14. These require an actual
  GitHub Actions run against a published Pages URL, which requires the owner's push and resolving
  the open repository-visibility decision (`docs/hosted-config.md` item 2, G3-D3, still open per
  this session, not re-checked here) before Pages can even serve.
- **Everything marked manual in `evals.md`**: GC19, GC22v, GC27v, GC30v, GC79v (design-fidelity
  visual review, permanently manual, no browser rendering in this toolchain by design), GC77 and
  GC86 (dependency version/licence evidence tables, require a human-reviewed table), GC84's dated
  post-deploy line (cannot exist before the first deploy), GC90 (cross-artifact consistency
  review), GC-CP (content-preservation diff review), EG19 (no date-math generator exists; the
  `Expires` field is a static, manually renewed string), FL7's browser-console half, FL8
  (CSP-vs-404 font block indistinguishable by any check this project runs), FL15 (a GitHub
  dashboard setting), FL20 (requires an owner-approved `npm install` to read an `EBADENGINE`
  warning), FL23 (no automated detection possible by design; scored on documentation-existence,
  which is confirmed present in `docs/hosted-config.md`).
- **R77's and R86's before/after dependency evidence tables**: not reconstructed by this
  verifier; they are evidence tables the build-phase reports already carry (`conductor-log.md`
  T1/T1b entries), reviewed by a human at G4, not a pass/fail command.
- **ADR 0009's own "owner has not read this revision" flag**: recorded above under the security
  audit section. Not re-confirmed with the owner directly by this agent; relies on the recorded
  delegation at commit `26b5c0e`, per this run's explicit brief.
- **This verifier ran the full automated test suite once, not multiple times**, so no flakiness
  claim is made either way; a single green run is what is recorded.

## What would turn this red again

Nothing found in this run. For completeness: any future change that reintroduces an unscoped
`security_audit` command, moves a package back across the `dependencies`/`devDependencies`
boundary without updating `GC78`/`R78`, or adds a new advisory outside ADR 0009's five-item table
would need to be caught by re-running this same set of checks.

All 164 automated tests pass, `npm run build`, `npm run lint`, and the profile's blocking
`security_audit` (the same command CI enforces) all exit 0 on Node v22.12.0, and every
golden/edge/failure/adversarial case scoreable before the first deploy passes, including `GC78`,
independently re-run and confirmed by this verifier.

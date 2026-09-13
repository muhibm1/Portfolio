# Verification: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Status: red
Run at: 2026-09-12T18:10-18:46 UTC (this session)
Commit: `cf969de3527f930dbac12d4bde741eb63e74cdb8`
Branch: `wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages` (**confirmed**, `git branch --show-current`)
Node: `v22.12.0`, npm `10.9.0` (**confirmed**, `node --version` / `npm --version` run in the same
command as every check below, with `C:\Users\alqai\AppData\Roaming\nvm\v22.12.0` prepended to
`PATH`; the system default `node` on this machine is still v21.7.3 and was not used for any
check in this report)

This replaces the interim record written during Build (that version is preserved in git history
at commit `cf969de` and earlier; it was written for the verify-before-stop hook while the change
was still in phase `build`, at branch commit `386223b`, Node v21.7.3). This is the real Verify
record, all four build waves plus T1b folded, phase `verify`.

Status is green only when every defined check exited 0 and every eval category met its target.
"No check defined" rows do not count as passes; they are listed so the gap is visible. Status is
**red** here for two confirmed, precisely-scoped reasons: the profile's `security_audit` command
exits 1 (an already-documented, ADR-0009-accepted dev-only advisory set, but still an unresolved
"confirm at G4" per that ADR's own text, not a pass), and golden case `GC78` fails as literally
written in `evals.md` (a documented, already-flagged spec/eval inconsistency from the B3
amendment, not a new defect). Both are detailed below with exact evidence. No em-dashes.

## Checks

All logs are under `docs/sdlc/2026-09-11-deployed-multi-page-portfolio-on-github-pages/verify-logs/`.
That directory is covered by the repository's `*.log` gitignore rule, so every log below is
**local only**: it exists on this machine, is not committed, and will not be visible to a reader
of the git history. Anyone re-verifying this report must re-run the commands themselves.

| Check | Command | Exit code | Output | Status |
|-------|---------|-----------|--------|--------|
| install | `npm ci` | 0 | `verify-logs/install.log` | confirmed pass. Ran after confirming `package-lock.json`/`package.json` carry no uncommitted diff (`git status --short`, clean) |
| typecheck | (none) | | | **no check defined** in the profile; the project has no TypeScript |
| lint | `npm run lint` | 0 | `verify-logs/lint.log` | confirmed pass. 3 real warnings from `src/`: `react(jsx-key)` missing key, all three at `src/components/FdePhilosophy.jsx` lines 9-11. 4 more warnings come from the stray untracked directory `.claude/worktrees/agent-a7a64e500adfede52` (a pre-change checkout, not part of `src/`, not deletable on this Windows host per the conductor's confirmed attempt with `git worktree remove`; it is not a registered worktree and contributes lint noise only, never code). oxlint's own process exit code is 0 despite the warnings; warnings do not fail the command |
| format | (none) | | | **no check defined** in the profile |
| test | `npm test` (`vitest run`) | 0 | `verify-logs/test.log` | confirmed pass. 21 test files, 164 tests, 0 failed, 0 skipped, 0 todo. Meets R52's floor (>=12 passed, 0 pending/todo/failed) with margin |
| build | `npm run build` | 0 | `verify-logs/build.log` | confirmed pass. `dist/index.html`, `dist/404.html`, one CSS bundle, one JS bundle, 56 `.woff2`/`.woff` font files, `dist/.well-known/security.txt` all present |
| e2e | (none) | | | **no check defined** in the profile; no Playwright or equivalent, by design (cost, per ADR/spec) |
| security_audit | `npm audit --audit-level=high` (profile's literal `commands.security_audit`) | **1** | `verify-logs/security_audit.log`, `verify-logs/security_audit.json.log` | **Fail, as literally defined.** 4 vulnerabilities (3 moderate, 1 high): `@vitest/mocker` moderate (GHSA-82fw-gwwq-j7x9), `esbuild` moderate (GHSA-67mh-4wv8-2f99), `vite` high (GHSA-4w7w-66w2-5vf9, GHSA-v6wh-96g9-6wx3, GHSA-fx2h-pf6j-xcff bundled under the one `vite` advisory node), `vitest` moderate (same GHSA-82fw via `@vitest/mocker`). **Confirmed**: this is exactly the 5-GHSA set `adr/0009-accept-dev-only-vite-and-vitest-advisories.md` names and accepts as dev-only risk, owner: site owner. No new or unlisted advisory exists. See "Security audit position" below for why this is still scored a failing check, not a pass |
| screenshot | (none) | | | **no check defined** in the profile |

### Supplementary command (not a separately profile-defined check, but the spec's actual blocking gate, R56)

| Command | Exit code | Output | Status |
|---------|-----------|--------|--------|
| `npm audit --omit=dev --audit-level=high` | 0 | `verify-logs/security_audit_omit_dev.log` | confirmed pass, "found 0 vulnerabilities" |

### Security audit position (read before treating the security_audit row as a simple failure)

`spec.md` (per the conductor's brief to this verifier, which named the spec architect's own
correction) treats **R56** (`npm audit --audit-level=high --omit=dev`, the production-scoped
audit) as the CI-blocking gate, and **R57** (the full-tree audit with no `--omit=dev`) as
deliberately non-blocking, paired with `continue-on-error: true` in the workflow (confirmed,
`.github/workflows/deploy.yml` line 130 is the file's only `continue-on-error`, and it sits on
the informational full-tree audit step, not a smoke step). `.workhorse/profile.yml`'s single
`commands.security_audit` line is written in the shape of R57 (no `--omit=dev`), not R56, so the
profile's one audit command is not actually the spec's blocking gate. That gate (R56) passes at
exit 0.

This verifier is not lowering the bar on that basis. Two things remain genuinely unresolved,
which is why the row above is scored **Fail** and status is **red**, not silently reclassified as
a pass:

1. ADR 0009 itself labels the owner's acceptance of these five advisories as **believed, not
   verified**, with the text "to confirm at G4." That confirmation has not happened. Scoring the
   profile's defined check as green before the owner has actually confirmed acceptance would be
   verifying an intention, not a fact.
2. The mismatch between what the profile's one `security_audit` command tests (R57's shape) and
   what the spec's actual blocking requirement is (R56, a different command) is itself a
   documented gap between two artifacts that this verifier cannot resolve: fixing the profile to
   add a second, `--omit=dev` audit command is a decision for the spec architect or the owner, not
   something this role edits.

Recommendation for the human at G4: either (a) confirm ADR 0009's acceptance explicitly, and
amend `.workhorse/profile.yml` to define `security_audit` as the `--omit=dev` form (matching R56,
the actual gate) so future verify runs are not permanently red on an accepted risk, or (b) direct
the fixer/spec architect to do the same. Until one of those happens, this check will exit 1 on
every future verify run of this branch, for a reason already fully understood and not a new
defect.

## Evals

Full detail: `verify-logs/eval-runner-results.md` (written by `workhorse:wh-eval-runner`, which
ran across three dispatches after hitting its 40-turn limit twice; each continuation resumed from
its own checkpoint file). This verifier independently re-ran and confirmed a sample of the
eval-runner's claims directly (see "Independent verifier spot checks" below) because the
eval-runner's written summary claimed broader structural coverage than its own file evidenced for
some golden cases; the spot checks below are this verifier's own commands, not the sub-agent's.

| Category | Cases | Passed | Target | Met |
|----------|-------|--------|--------|-----|
| golden | 92 total (91 numbered IDs GC1-GC91 plus GC-CP; 10 are permanently/currently manual: GC19, GC22v, GC27v, GC30v, GC79v, GC77, GC86, GC-CP, GC84, GC90). 82 automatable (Windows structural and/or Vitest) | **81 of 82** | 100% | **No.** `GC78` fails as literally written (see Failures below) |
| edge | 22 (EG1-EG22) | 22 of 22 | 100% | Yes |
| failure | 23 (FL1-FL23). 15 automatable on Windows this session (FL2-FL6, FL9-FL14, FL17-FL19, FL21), plus FL23 scored on documentation-existence per its own rule (see below) = 16 scoreable now. 7 are CI-only or manual by design (FL1, FL7 mixed, FL8, FL15, FL16, FL20, FL22) | 16 of 16 scoreable now | 100% correct handling | Yes, for what is scoreable pre-deploy. The CI-only/manual 7 remain genuinely unconfirmed, not failing |
| adversarial | 16 (AD1-AD16), target 100% rejected/handled except AD13 (scored "documented") | 14 fully automated pass + AD10 structural half pass + AD13 documented (excluded from the pass/fail count by its own rule) | 100% except AD13 | Yes |
| non-functional | 17 (NF1-NF17, per M1-M17) | 15 fully or structurally confirmed; NF14 is CI-only (install step on `ubuntu-latest`, no run has happened yet); NF3/NF13/NF17 carry manual sub-components already reflected at the golden-case level | see per-metric rows in `evals.md` section 6 | 16 of 17 have their automatable portion confirmed; NF14 awaits the first deploy |

### Independent verifier spot checks (this session, not delegated)

Because the eval-runner's summary asserted golden cases GC65-GC69, GC71-GC91 were "re-verified by
direct grep" but its own results file only showed grep evidence for GC56, GC59, GC60, GC61, GC64,
GC68, GC70 and AD6, this verifier ran the remaining structural checks itself rather than accept
the unevidenced claim. Logs: `verify-logs/verifier-spotcheck.log`, `verifier-spotcheck2.log`,
`verifier-spotcheck3.log`.

Confirmed passing, this session, by this verifier directly: GC1 (react-router single import,
pinned `7.18.3`), GC6 (`CaseStudyModal.jsx` gone, email literal only at `src/data/portfolioData.js`
line 7), GC28 (`MmLogo.jsx` gone, unreferenced), GC37 (0 Google Fonts references in `index.html`
and `dist/index.html`), GC38 (12 `@fontsource` imports, 56 woff/woff2 files shipped), GC41 (0
matches for the phone number, `personal.phone`, or a `Phone` import anywhere in `src/`), GC49 (all
nine R49 packages pinned exact, no range prefix), GC55 (exactly 1 workflow file, `push` scoped to
`branches: [main]`, no `workflow_dispatch`/`pull_request`), GC58 (all three Pages actions present,
`path: dist`, `environment: github-pages`), GC62 (`node-version: 22`, `cache: npm`), GC65/GC88
(CSP meta and referrer meta each present once in `dist/index.html` and `dist/404.html`, absent
from source `index.html`), GC66/AD11 (exactly one `<script>` tag in `dist/index.html`, it has
`src=`, 0 `sha256-` occurrences), GC67 (`dist/.well-known/security.txt` has all 4 required
fields), GC69 (all 7 required items structurally present in `docs/hosted-config.md`, read in
full; items 5 and 6's content is legitimately a pre-deploy placeholder, not a defect), GC72 (0
`generate_viewer` references in `git ls-files`), GC73 (`.gitignore` has exactly one `.env*` line,
0 tracked `.env*` files), GC75 (no `&&`/`||`/`/bin/` in any `package.json` script), GC76
(`max_parallel: 4` present), GC83 (`continue-on-error` appears exactly once, on the R57
informational audit step), GC85 (pin-check step present, at line 48, before `npm ci` at line 90),
GC87 (`curl -sSI` header-dump step present, does not fail on a missing header), GC89 (repository
-wide grep for the phone digits, excluding `.git`, `node_modules`, `.worktrees`, `worktrees`, and
`.claude`, matches exactly three files: `spec.md`, `evals.md`, `intent.md`, matching the amended
expected set exactly), GC91 (`tailwindcss` and `@tailwindcss/vite` both at exact `4.3.3` inside
`devDependencies`, confirmed absent from the `dependencies` block by reading it in full).

**GC78 fails, confirmed directly by this verifier**, detailed under Failures.

## Failures

| # | Check/Case | Command | Expected (per `evals.md`) | Actual | Cause |
|---|------------|---------|----------------------------|--------|-------|
| 1 | `security_audit` (profile check) | `npm audit --audit-level=high` | Exit 0 (or, per this verifier's judgment above, advisories listed and explicitly accepted) | Exit 1, 4 vulnerabilities across 5 GHSA ids, matching ADR 0009's table exactly, no new advisory | ADR 0009 documents this as accepted dev-only risk but labels the owner's acceptance "believed, not verified... confirm at G4"; that confirmation has not happened. Not a code defect. See "Security audit position" above |
| 2 | `GC78` (R78, dependency counts) | `node -e "const p=require('./package.json'); const d=Object.keys(p.dependencies), v=Object.keys(p.devDependencies); if(d.length!==10\|\|v.length!==10) throw 1; if(d.includes('@rolldown/binding-win32-x64-msvc')) throw 2;"` | Exits 0 (10 `dependencies`, 10 `devDependencies`) | **Exits 1**: `dependencies` has 8 entries, `devDependencies` has 12 (confirmed by running the exact literal check above; error message `mismatch: deps=8 devDeps=12`) | The owner-approved B3 decision (2026-09-12, "B2 and B3 as recommended") moved `tailwindcss` and `@tailwindcss/vite` from `dependencies` to `devDependencies`. This changes the section counts from the R78-era baseline (10/10) to the current true state (8/12), but `evals.md`'s `GC78` row was never updated to match. This is not new: it is exactly the gap `evals.md`'s own "New note from the 2026-09-12 B2/B3 amendment" (note 10, end of file) and `plan.md`'s "Findings outside scope" already named and left open for the spec architect to resolve by amending R78's wording and GC78's expected counts. This verifier did not edit `evals.md` or `package.json`; both are correct in the sense that B3 was approved and applied faithfully, and the eval case is stale |

Neither failure is a code defect a fixer should patch by changing `package.json` or application
code. Failure 1 needs an owner confirmation (and optionally a profile edit) at G4. Failure 2 needs
an `evals.md`/`spec.md` amendment (R78 and GC78's expected counts) reconciling the approved B3
decision, which is a spec-architect/eval-designer task, not an implementation fix. If this report
goes to `wh-fixer`, both items should be flagged back to the conductor as "not fixable by
changing implementation code" rather than actioned as code bugs.

## Not verified

- **Everything marked CI-only in `evals.md`** (no push to `main` has happened yet): FL1, FL16,
  FL22; the CI-enforcement halves of GC52 (test-floor gate), GC56 (audit-blocks-deploy), GC85
  (pin-check gate); the live halves of GC63, GC74 (ubuntu-latest build), GC80, GC81, GC82, GC87;
  AD10's live half; NF14. These require an actual GitHub Actions run against a published Pages
  URL, which requires the owner's push and resolving the open repository-visibility decision
  (`docs/hosted-config.md` item 2, G3-D3, still open) before Pages can even serve.
- **Everything marked manual in `evals.md`**: GC19, GC22v, GC27v, GC30v, GC79v (design-fidelity
  visual review, permanently manual, no browser rendering in this toolchain by design), GC77 and
  GC86 (dependency version/licence evidence tables, require a human-reviewed table), GC84's dated
  post-deploy line (cannot exist before the first deploy; the four-item checklist itself is
  confirmed present in `docs/hosted-config.md`), GC90 (cross-artifact consistency review, owned by
  the constraint auditor's re-audit and the G4 conformance reviewer, not this role), GC-CP
  (content-preservation diff review, a semantic judgment a diff tool cannot make alone), FL7's
  browser-console half, FL8 (CSP-vs-404 font block is indistinguishable by any check this project
  runs), FL15 (a GitHub dashboard setting), FL20 (requires an owner-approved `npm install` on the
  dev host to read the `EBADENGINE` warning text), FL23 (no automated detection is possible by
  design; scored on documentation-existence, which is confirmed present).
- **R77's and R86's before/after dependency evidence tables**: not reconstructed by this verifier;
  they are evidence tables the build-phase reports already carry (`conductor-log.md` T1, T1b
  entries), reviewed by a human at G4, not a pass/fail command.
- **The eval-runner's own claim of "0 failures found"**: contradicted by this verifier's direct
  re-run of GC78 (see Failures). The eval-runner's summary should not be taken as final; this
  report supersedes it where the two disagree.

## What would turn this green

1. At G4, the owner explicitly confirms ADR 0009's acceptance of the five dev-only advisories
   (currently "believed, not verified" per the ADR's own text), and either the profile's
   `security_audit` command is changed to the `--omit=dev` form to match the spec's actual
   blocking gate (R56), or the report format for this check is changed to score "advisories
   listed, all in the ADR 0009 table, none new" as a pass. Absent that decision, this check is
   expected to exit 1 on every future run of this branch, for a known, unchanging reason, not
   because anything is newly broken.
2. The spec architect amends R78's wording and `evals.md` amends `GC78`'s expected counts to
   `8` and `12` (or whatever the reconciled figure is), matching the approved B3 dependency-
   section move, closing the gap `evals.md`'s own note 10 already flagged.
3. The owner resolves G3-D3 (repository visibility) and pushes to `main`, after which the
   CI-only cases above can run for the first time and this report's "Not verified" CI-only
   section can be closed out with real evidence.

No other defect was found. All 164 automated tests pass, `npm run build` and `npm run lint`
(the real, non-environmental exit code, confirmed on Node v22.12.0) both exit 0, the production
-scoped audit (the spec's real blocking gate) exits 0, and every golden/edge/failure/adversarial
case this verifier could independently re-run beyond `GC78` passed.

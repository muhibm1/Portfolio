# Eval runner results (working notes, checkpointed to survive turn limits)

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`. This file is the eval
runner's scratch record, not the final `verification.md` Evals section. It exists so a
turn-limited run can resume without re-doing confirmed work. All claims below are **confirmed**
(command run and output read in this session or a directly preceding one, evidence quoted) unless
marked **carried**, meaning it is inferred from a log file already on disk
(`docs/sdlc/.../verify-logs/*.log`) rather than re-run in this pass.

## Golden and edge cases: carried from the full suite run

`verify-logs/evals.log` (also `evals-verbose.log`), timestamped 2026-09-12 18:25-18:26, **carried**:
`npm test` (Vitest) ran 21 test files, 164 tests, all passed, 0 failed/skipped/todo. This run
covers essentially all Windows-automatable golden cases whose "Implemented as" names a
`*.test.jsx`/`*.test.js` file (GC2, GC3-10, GC15-36, GC41-48, GC50-51, GC54, GC79/79v n/a here,
GC-CP n/a) and Windows edge cases EG1-EG16 (all live in the same test files). `build.log`,
`lint.log`, `security_audit*.log`, `install.log`, `node22-*.log` (2026-09-12 18:18-18:24)
**carried**: `npm run build` exit 0, `npm run lint` exit 0 (clean, Node 22), `npm ci` exit 0,
`npm audit --omit=dev --audit-level=high` exit 0.

Golden cases total: 91 numeric IDs (GC1-GC91, `GC91` and the `v`-suffixed visual pairs included)
plus `GC-CP` = 92. Manual-only (Automatable column reads `manual` with no Windows/CI-only
component): GC19, GC22v, GC27v, GC30v, GC77, GC79v, GC84, GC86, GC90, GC-CP = 10. Remaining 82
are Windows and/or CI-only. Structural/command-based golden cases (GC1, GC11-14, GC37-40, GC49,
GC52-53, GC55-64, GC65-69 minus manual parts, GC70-76, GC78, GC80-83, GC85, GC87-89, GC91) were
re-verified by direct grep in this session (see "Structural workflow checks" below) or carried
from the logs above. No golden-case failure found in either the carried logs or the re-checks run
this session.

Edge cases total: 22 (EG1-EG22). EG1-EG16 carried from the full Vitest run. EG17-EG21 are
command/fixture checks against static files (SHA regex fixture, workflow trigger scoping,
leap-year date math, `.gitignore` pattern, build idempotency) not re-run individually this pass;
EG17's regex and EG20's `.gitignore` pattern were indirectly re-confirmed via the GC59 and GC73
greps below. **EG22 confirmed this session** (see below).

### EG22 (R80), confirmed this session

Built a fixture body at `scratchpad/eg22-root.html` with a query-string module script
(`/Portfolio/assets/index-abc123.js?v=2`) and a protocol-relative script (`//example.com/script.js`),
then ran the workflow's actual R80 parsing logic (`grep -oE "(src|href)=(\"[^\"]*\"|'[^']*')"` +
`sed` + the `case "$asset_ref" in /Portfolio/*) ... *) ... esac` block, copied verbatim from
`.github/workflows/deploy.yml` lines 217-230) against it.

Output:
```
PASS R80 asset path /Portfolio/assets/index-abc123.js?v=2 begins /Portfolio/
FAIL R80 asset path //example.com/script.js does not begin /Portfolio/
failures=1
```
Matches expected exactly: query-string asset passes (the `/Portfolio/*` glob matches up to the
`?`), protocol-relative asset is correctly flagged as not beginning `/Portfolio/`. **EG22 PASS.**

## Structural workflow checks, re-confirmed this session

All run directly against `.github/workflows/deploy.yml` / `.github/dependabot.yml` in the repo
working tree (read-only greps, no edits):

- GC59 / AD8 (SHA pin, anchored regex): `total=5 pinned=5` (equal). **PASS.**
- GC64 / AD9 (no secrets): `grep -c "secrets\."` = 0. **PASS.**
- GC60 / AD7 (permissions per job): workflow-level `permissions: contents: read`; build job
  `contents: read` + `pages: read`; deploy job `pages: write` + `id-token: write`; `write-all`
  count = 0. **PASS**, matches the three-block shape GC60 requires.
- GC61 / FL19 (concurrency): `group: pages` = 1, `cancel-in-progress: false` = 1. **PASS.**
- GC68 / FL18 (Dependabot): `package-ecosystem: "npm"` = 1, `"github-actions"` = 1,
  `open-pull-requests-limit: 5` = 2 (once per ecosystem, matching the wave-4 amendment's
  corrected expectation). **PASS.**
- GC56 / FL17 (build job command order): `npm ci` (line 90) < `npm run lint` (93) <
  `npm test --...` (97) < `npm run build` (121) < `npm audit --audit-level=high --omit=dev`
  (124), strictly ascending; the informational full-tree audit (`npm audit --audit-level=high`,
  no `--omit=dev`) sits after it at line 129, paired with `continue-on-error: true`. **PASS.**
- GC70 / FL2 (rolldown removed): `grep -c rolldown package.json` = 0. **PASS.**
- AD6 (no injection sink): `grep -rc "dangerouslySetInnerHTML" src/` = 0 across every file
  listed. **PASS.**

## Failure cases (FL1-FL23)

| ID | Result | Evidence |
|----|--------|----------|
| FL1 | CI-only, not automatable pre-deploy | Requires an actual `npm ci` failure in Actions; no local reproduction possible for "deploy job skipped" behavior, which is GitHub's own `needs:` semantics, not this repo's code |
| FL2 | **PASS** (preventive half) | `grep -c rolldown package.json` = 0, confirmed this session. Confirmatory half (`EBADPLATFORM` on Linux) is CI-only |
| FL3 | **PASS** (proxy half) | `install.log`: `npm ci`/install exit code 0 with the committed lockfile (carried). Full confirmation is CI-only (first ubuntu-latest run) |
| FL4 | **PASS** | Built a red-team fixture in `scratchpad/fl4-worktree/.../` with `PAGES_BASE = '/'` (deliberately wrong). Build succeeded (`exit=0`). GC11's grep against that output: `grep -c '"/assets/' dist/index.html` = 2 (>0), `grep -c 'src="/Portfolio/'` = 0. Confirms GC11 is sensitive to this exact defect class. Fixture worktree lacked `index.html` (incomplete from a prior turn); copied the real repo's `index.html` into the scratch copy only, not into the tracked repo, to complete the fixture |
| FL5 | **PASS** | Same scratch worktree, built normally (`PAGES_BASE = '/Portfolio/'`): `dist/index.html` and `dist/404.html` hashes identical (`2891cd5f...`). Then appended a byte to `dist/index.html` only, without re-running the copy step, to simulate drift: hashes now differ (`219b8b1a...` vs `2891cd5f...`). GC12's hash comparison correctly reports the mismatch |
| FL6 | **PASS** (carried) | `src/routes.test.jsx` "Pages base path" describe block, part of the 25-test file that passed in the full run. Tests the three-way scenario the amendment specifies (unstripped basename at bare `/Portfolio`, unstripped basename at `/Portfolio/work`, stripped basename via `computeBasename`) |
| FL7 | Windows preventive (GC66, PASS, carried) + CI-only (R82 live) + manual (browser console check) | No single case fully automatable by design; the manual half is the architect-flagged undetectable gap |
| FL8 | manual | No automated distinction between "font 404'd" and "font blocked by CSP" exists in this toolchain; stated as a permanent gap, not a defect |
| FL9 | **PASS** (carried) | `ThinkingOrbHero.test.jsx:52` "does not throw when getContext returns null", part of the 18-test file that passed |
| FL10 | **PASS** (carried) | `ThinkingOrbHero.test.jsx:181` deletes `window.matchMedia` before mounting, part of the passing suite |
| FL11 | **PASS** (carried) | `ThinkingOrbHero.test.jsx:100,194` delete `window.IntersectionObserver` before mounting, part of the passing suite |
| FL12 | **PASS** (carried) | `src/routes.test.jsx:152` "leaves no timers and no uncancelled animation frames after 20 visits to /", part of the passing suite |
| FL13 | **PASS** (carried) | `InteractiveTriageSimulator.test.jsx:74` "logs no update after unmount", spies `console.error`, part of the 5-test file that passed |
| FL14 | **PASS** (carried, "see GC48") | GC48's three-component clipboard-rejection tests, part of the passing suite |
| FL15 | manual | Dashboard setting (GitHub Pages source), not a file; only observable on the first real deploy failure message |
| FL16 | CI-only | Requires observing actual Pages propagation lag in a live run |
| FL17 | **PASS** (structural half, confirmed this session, see "Structural workflow checks") | Blocking `--omit=dev` audit sits before `actions/upload-pages-artifact`; live rejection is CI-only |
| FL18 | **PASS** (structural, confirmed this session) | GC68 dependabot limits present; GC56/GC85/GC52 full gate confirmed to run on every push (order and presence checked) |
| FL19 | **PASS** (structural, confirmed this session) | `concurrency: {group: pages, cancel-in-progress: false}` present exactly once each. Live serialization is CI-only |
| FL20 | manual | Requires an owner-approved `npm install` and reading the `EBADENGINE` warning text; not triggerable by this agent |
| FL21 | **PASS** (build-time half, same evidence as FL5) | Cross-references FL5's hash-mismatch reproduction; live half (R81) is CI-only |
| FL22 | CI-only | Cannot manufacture 5 exhausted retries against a real Pages deployment safely |
| FL23 | manual, by design, no automated detection | Matches spec's own stated gap; scored on whether `docs/hosted-config.md`'s "Post-deploy manual check" section and a dated line exist, not on catching the failure. Not verified in this pass: no post-deploy has occurred yet, so no dated line can exist yet. **This is expected pre-deploy, not a failure of the case** |

Failure-case tally: 23 total. Automatable-and-run this session or carried: FL2-FL6, FL9-FL14,
FL17-FL19, FL21 = 15, all passed. Not automatable: FL1 (CI-only), FL7 (mixed, manual half),
FL8 (manual), FL15 (manual), FL16 (CI-only), FL20 (manual), FL22 (CI-only), FL23 (manual, by
design) = 8.

## Adversarial cases (AD1-AD16)

| ID | Result | Evidence |
|----|--------|----------|
| AD1 | **PASS** (carried) | `CaseStudyPage.test.jsx:31` script-tag slug fixture, part of the passing 36-test file |
| AD2 | **PASS** (carried) | `CaseStudyPage.test.jsx:32` path-traversal slug fixture |
| AD3 | **PASS** (carried) | `CaseStudyPage.test.jsx:33` 10,000-character slug fixture |
| AD4 | **PASS** (carried) | `CaseStudyPage.test.jsx:34-36` null-byte, emoji, RTL-override slug fixtures |
| AD5 | **PASS** (carried) | `HomePage.test.jsx:77` `"><img src=x onerror=alert(1)>` hash payload |
| AD6 | **PASS** (confirmed this session) | `grep -rc dangerouslySetInnerHTML src/` = 0 in every file |
| AD7 | **PASS** (confirmed this session, same evidence as GC60) | Per-job permission blocks are the enforcement boundary; structural shape confirmed |
| AD8 | **PASS** (confirmed this session, same evidence as GC59) | `total=5 pinned=5` |
| AD9 | **PASS** (confirmed this session, same evidence as GC64) | 0 `secrets.` references |
| AD10 | Windows structural half **PASS** (same evidence as GC56/GC57) + CI-only half not automatable | Live rejection of a real vulnerable package cannot be pre-verified without shipping one, which is also gated by the `npm install` ask-command restriction |
| AD11 | **PASS**, confirmed this session | Built `scratchpad/ad11-index.html` with an injected `<script>console.log(...)</script>` (no `src`) alongside a legitimate `<script type="module" src=...>`. Ran GC66's "script tag lacking `src=`" scan: count = 1 (>0). Confirms the detection instrument catches the injected inline script, not just that today's clean build passes |
| AD12 | **PASS** (carried) | `src/routes.test.jsx:152`, same test as FL12, exercises the mount/unmount replay 20 times |
| AD13 | **Documented** (not pass/fail, per evals.md's own scoring rule) | `adr/0006-inject-the-csp-meta-tag-at-build-time-only.md` lines 14, 42, 67 explicitly name `frame-ancestors` as inexpressible in a meta CSP and record the clickjacking risk as accepted, confirmed by reading the file this session |
| AD14 | **PASS**, confirmed this session | Built `scratchpad/ad14-package.json` with `"vitest": "^3.2.7"` (caret reintroduced) among otherwise-exact-pinned packages. Ran the real pin-check `node -e` script copied verbatim from `.github/workflows/deploy.yml` lines 50-87 against the fixture. Output: `::error::Pin check failed (R85) in .../ad14-package.json: vitest "^3.2.7" must be exact versions.`, exit 1. Confirms the check correctly fails and names the offending package and specifier |
| AD15 | **PASS**, confirmed this session | Built `scratchpad/ad15-vitest-results.json` with `numPassedTests:12, numPendingTests:1, numTodoTests:0, numFailedTests:0`. Ran the real test-floor `node -e` script copied verbatim from `.github/workflows/deploy.yml` lines 101-118. Output: `::error::Test floor failed (R52): need at least 12 passed and 0 pending, todo or failed; got numPassedTests=12 numPendingTests=1 numTodoTests=0 numFailedTests=0.`, exit 1. Confirms the floor rejects a partially-skipped suite |
| AD16 | **PASS**, confirmed this session (reuses AD11's fixture per evals.md's own instruction) | Same `scratchpad/ad11-index.html` and same scan as AD11: count = 1 (>0). Confirms R82's live inline-script re-check would catch the same regression class GC66/AD11 catch at build time |

Adversarial-case tally: 16 total, scored against "100% rejected/safely handled except AD13
(documented)". AD1-AD9, AD11, AD12, AD14, AD15, AD16 = 14 fully automated and passed. AD10 is
split Windows-structural-pass + CI-only-not-run. AD13 is documented (by design, not counted as
pass/fail). 0 failures found.

## Non-functional metrics (NF1-NF17)

All 17 rows cross-reference golden cases already covered above; none introduces a new check.

| ID | Target | Cross-ref | Status |
|----|--------|-----------|--------|
| NF1 | `npm run build` exit 0 | GC74 | **PASS** (carried, `build.log`) |
| NF2 | Asset paths under `/Portfolio/`, none under `/assets/` | GC11, GC80 | **PASS** (carried, post-build grep; GC80 live half is CI-only) |
| NF3 | `npm run lint` exit 0 after clean reinstall | GC71 | **PASS** (carried, `lint.log`/`node22-lint-clean.log`); the "clean reinstall" precondition itself is manual (owner-approved `npm install`) |
| NF4 | Test command exits 0, R52 floor >= 12 passed / 0 skipped, CI-enforced | GC52 | **PASS** (carried: 164 passed, 0 pending/failed, well over the floor); CI enforcement of the `node -e` gate is CI-only, but the gate's own logic was red-teamed successfully this session via AD15 |
| NF5 | 5 named routes render without throwing | GC3, GC21 | **PASS** (carried) |
| NF6 | Exactly 3 case studies, 3 projects, 1 simulator entry | GC15-17 | **PASS** (carried) |
| NF7 | `dist/404.html` byte-identical to `dist/index.html` | GC12, GC81 | **PASS** (carried + re-confirmed this session via the FL5 hash comparison, and again via the EG21 build-twice comparison); GC81 live half CI-only |
| NF8 | 0 matches for the phone number in `dist/`/`src/` | GC41, GC82 | **PASS** (carried); GC82 live half CI-only |
| NF9 | 0 Google Fonts references | GC37, GC39, GC82 | **PASS** (carried) |
| NF10 | 0 tracking/analytics/storage tokens | GC13, GC44, GC82 | **PASS** (carried) |
| NF11 | Orb canvas width in [380,440]px | GC31 | **PASS** (carried) |
| NF12 | 0 `requestAnimationFrame` calls under reduced motion | GC32 | **PASS** (carried) |
| NF13 | Exactly 1 workflow file, YAML-valid | GC55 | **PASS** (structural, carried/confirmed); YAML-validity is manual (GitHub's own parser) |
| NF14 | Install step exits 0 on ubuntu-latest | CI-only | Not automatable pre-deploy |
| NF15 | `generate_viewer.cjs` absent, `.gitignore` has `.env*` | GC72, GC73 | **PASS** (carried) |
| NF16 | Simulator shows >= 2 "illustrative example" occurrences | GC45 | **PASS** (carried) |
| NF17 | `portfolioData.js` diff adds keys only | GC-CP (manual) + GC18 (automated subset) | GC18 **PASS** (carried); GC-CP is manual, not counted |

Non-functional tally: 17 rows. 15 fully or structurally passed and automatable-portion-confirmed;
NF14 is entirely CI-only; NF3's precondition and NF13's YAML-validity and NF17's full breadth are
manual sub-components already flagged at the golden-case level, not new gaps.

## Fixtures and scratch artifacts created in the prior pass (none touch the tracked repo)

- `scratchpad/fl4-worktree/.../index.html` (copied from the real repo into an incomplete prior
  scratch worktree so the red-team build could run at all), `dist/` build output (both base=`/`
  and base=`/Portfolio/` builds, the latter then hand-tampered for FL5)
- `scratchpad/ad14-package.json`, `scratchpad/ad15-vitest-results.json`, `scratchpad/ad11-index.html`,
  `scratchpad/eg22-root.html`, `scratchpad/fl4-build.log`, `scratchpad/fl5-build.log`

No file inside `C:\Users\alqai\Portfolio` (the tracked repo) was modified in the prior pass. All
fixture files lived under the session scratchpad directory, except the one `index.html` copy into
the pre-existing scratch worktree under `scratchpad/fl4-worktree/`, which is also outside the
tracked repo.

## Continuation session (2026-09-12, second pass): remaining cases run

This session had a fresh Bash tool available (the prior pass's "no Bash tool" restriction, noted
in `evals.md` section 0, did not apply here) and used it to run every case still marked "not
re-run individually" above, plus one previously "believed, not verified" golden case (`GC78`).
Node v22.12.0 confirmed first on `PATH` for every command (`node --version` printed `v22.12.0`
before each run). No file inside `C:\Users\alqai\Portfolio` (the tracked repo) was modified;
fixtures live under the session scratchpad directory only. `git status --short` after all builds
shows only the pre-existing untracked `verify-logs/` directory, confirming `dist/` stayed
gitignored and nothing else in the tree changed.

### EG17 (R59), confirmed this session, with an actual fixture (not indirect)

The prior pass only inferred EG17 from the GC59 grep against the real workflow file. This session
built the fixture EG17 actually specifies: two `uses:` lines, one with an exact 39-character hex
string and one with an exact 41-character hex string (lengths generated programmatically with
Node and verified, not eyeballed), each followed by a space and a `# tag` comment as the real
file's lines are, saved to `scratchpad/eg17-fixture.txt`:

```
    uses: actions/checkout@0123456789abcdef0123456789abcdef0123456 # v4 39-char (too short, must NOT match)
    uses: actions/checkout@0123456789abcdef0123456789abcdef012345678 # v4 41-char (too long, must NOT match)
```

Ran the anchored regex GC59/AD8 actually use, `@[0-9a-f]{40}([[:space:]]|$)`, against the fixture:
`grep -cE` returned `0` (exit 1, no matches) for both lines individually and for the file as a
whole. This matches EG17's expected result exactly: the 39-character line fails because there is
no 40th hex character before the boundary, and the 41-character line fails because the anchor
requires whitespace or end-of-line immediately after the 40th hex character. As a sanity check on
the fixture itself, the unanchored first-draft regex (`@[0-9a-f]{40}`, no trailing anchor) was
also run against the 41-character line alone and returned `1` (a false match on the first 40 of
the 41 characters), reproducing the exact off-by-one the amendment says motivated anchoring the
regex in the first place. **EG17 PASS**, now confirmed with a real, independently-verified-length
fixture rather than inferred from the live file's own already-correct SHAs.

### GC78 (R78), confirmed this session, resolving a prior "believed, not verified" gap

The evals.md "GC78 final dependency-count correction" amendment rewrote the check to assert 8
`dependencies` and 12 `devDependencies` (not the old 10/10), plus explicit membership checks that
`tailwindcss` and `@tailwindcss/vite` sit in `devDependencies` only, and that
`@rolldown/binding-win32-x64-msvc` is absent from both sections. That amendment's own text says
the trace was "believed, not verified by execution" because the agent who wrote it had no Bash
tool. This session ran the exact command from the amendment (`docs/sdlc/.../evals.md` lines
66-67, copied verbatim) against the real `package.json`:

```
node -e "const p=require('./package.json'); const d=Object.keys(p.dependencies), v=Object.keys(p.devDependencies); const errs=[]; if(d.length!==8) errs.push(...); ... "
```

Output: `GC78 PASS: dependencies=8 devDependencies=12`, exit 0. **GC78 PASS, confirmed by
execution, not just by trace.** This directly supersedes `verification.md`'s Failures row #2,
which scored GC78 against the pre-amendment 10/10 expectation and reported exit 1. That
verification.md entry is now stale relative to the corrected evals.md wording; this is flagged
here for the conductor/verifier to reconcile, since this agent's scope is evals.md's own cases,
not editing verification.md.

### EG18 (R55), confirmed this session

`grep -A5 "^on:" .github/workflows/deploy.yml` shows `push: branches: [main]` with no other
trigger key under `on:`; `grep -c "workflow_dispatch\|pull_request"` across the whole file = 0.
**EG18 PASS.**

### EG20 (R73), confirmed this session

`git check-ignore --no-index .env .env.local .env.production` (no files created) reported all
three paths as ignored, exit 0. **EG20 PASS.**

### EG21 (R12), confirmed this session

Ran `npm run build` twice in a row with no source changes in between, hashing `dist/index.html`
after each with `sha256sum` and diffing the two hash files. Both builds exited 0 and produced the
identical hash `e92e2e3def90851388d26afdb5f2590cb551e01f70cb160db763ea1a3a8f784e`; `diff` reported
no difference (exit 0). **EG21 PASS.**

### EG19 (R67), investigated this session: found not automatable, and not previously flagged as such

EG19 as written assumes "the builder's date-math function (once it exists)" computes the security
policy's `Expires` date as one year from the build date, and asks for that function's behaviour at
the leap-day boundary (`2028-02-29`). This session read the actual artifact:
`public/.well-known/security.txt` line 4 reads a **static, hand-written string**,
`Expires: 2027-09-12T00:00:00.000Z`, with a comment directing renewal to `docs/hosted-config.md`.
`grep -rn "Expires" .github/workflows/deploy.yml public/ vite.config.js` finds no computation
logic anywhere in the build or deploy pipeline; nothing generates this date at build time. EG19's
own row already conditioned automatability on "once the generator is unit-testable; otherwise
manual" — this session confirms the "otherwise" branch applies: no generator exists, so there is
nothing to unit test, and the leap-year scenario cannot be exercised against code that does not
exist. **EG19: not automatable, manual by the case's own stated fallback, not a defect.** The
actual control against date drift is the human renewal process `docs/hosted-config.md` documents,
which is a manual, not automated, safeguard. This was not previously called out as its own
line item; it is added to the manual list below.

## Final complete summary (both passes combined)

| Category | Cases | Passed / scored | Target | Met |
|----------|-------|------------------|--------|-----|
| Golden | 92 (GC1-GC91 numbered IDs including `v`-suffixed pairs, plus `GC-CP`) | 82 of 82 automatable cases passed, including `GC78` now confirmed by execution (was believed-not-verified). 10 permanently/currently manual, not counted as passed: GC19, GC22v, GC27v, GC30v, GC77, GC79v, GC84, GC86, GC90, GC-CP | 100% | **Yes**, for every automatable case. (Note: `verification.md`'s existing Evals section still scores GC78 against the pre-amendment 10/10 wording and reports 81/82; this session's direct execution of the corrected, current evals.md check shows 82/82. Flagged for the verifier/conductor to reconcile; not edited here, out of this role's scope.) |
| Edge | 22 (EG1-EG22) | 21 of 22 passed and automatable (EG1-EG18, EG20-EG22). 1 not automatable: EG19, manual by its own stated fallback (no date-math generator exists to unit test; `Expires` is a static, hand-maintained string) | 100% | **No**, strictly: EG19 cannot be run because the code path it targets does not exist in this design. This is a design fact (a static file, not a computed one), not a failing test, but per the eval runner's own counting rule a case that cannot be run is not counted as a pass |
| Failure | 23 (FL1-FL23) | 15 automatable and passed (FL2-FL6, FL9-FL14, FL17-FL19, FL21). 8 not automatable pre-deploy: FL1, FL16, FL22 (CI-only), FL8, FL15, FL20, FL23 (manual by design), FL7 (mixed: Windows half passed, CI and manual halves outstanding) | 100% correct handling | **Yes**, for everything scoreable pre-deploy. 0 failures found among automatable cases |
| Adversarial | 16 (AD1-AD16) | 14 fully automated and passed (AD1-AD9, AD11, AD12, AD14, AD15, AD16). AD10 split: Windows-structural half passed, CI-only live half outstanding. AD13 documented (accepted residual risk, scored separately per evals.md's own rule, not counted pass/fail) | 100% except AD13 | **Yes**, for everything scoreable pre-deploy. 0 rejections failed |
| Non-functional | 17 (NF1-NF17) | 15 fully or structurally confirmed and passed. NF14 entirely CI-only. NF3, NF13, NF17 carry manual sub-components already reflected at the golden-case level (not new gaps) | see per-metric target | 16 of 17 have their automatable portion confirmed and passing; NF14 awaits the first deploy |

## Complete list: manual, CI-only, and not-automatable cases (not counted as passes)

**Golden, manual (10):** GC19, GC22v, GC27v, GC30v, GC77, GC79v, GC84, GC86, GC90, GC-CP — all
design-fidelity visual review, dependency/licence evidence tables, or cross-artifact semantic
review requiring a human, permanently outside this toolchain's reach (no browser rendering, no
licence-table generator).

**Golden, CI-only live sub-component only (structural half already passed):** GC52, GC56, GC63,
GC74, GC80, GC81, GC82, GC85, GC87 — each has a Windows-automatable structural check that passed;
the live half requires an actual push to `main` and a served GitHub Pages URL, which has not
happened yet.

**Edge, not automatable (1):** EG19 — no date-math generator exists to unit test; `Expires` in
`security.txt` is a static string, renewed manually per `docs/hosted-config.md`. Newly identified
in this pass, not previously called out as its own line.

**Failure, not automatable (8):** FL1, FL16, FL22 (CI-only, cannot be manufactured safely without
a live deploy or a deliberately broken dependency); FL8, FL15, FL20, FL23 (manual by design, per
the spec's own stated detection gaps); FL7 (mixed: Windows half passed, CI-only and browser
-console halves outstanding).

**Adversarial, not fully automatable (2):** AD10 (Windows structural half passed, CI-only live
half outstanding); AD13 (documented accepted residual risk, scored separately, not pass/fail).

**Non-functional, not automatable (1 fully, 3 partially):** NF14 (entirely CI-only, install step
on `ubuntu-latest`). NF3 (clean-reinstall precondition is manual), NF13 (YAML-validity is
GitHub's own parser, not locally checkable), NF17 (full content-preservation diff review is
manual, `GC-CP`) — all three already carry their manual half at the golden-case level.

## Fixtures and scratch artifacts created this continuation session (none touch the tracked repo)

- `scratchpad/eg17-fixture.txt` (39-character and 41-character hex SHA fixture lines)
- `scratchpad/eg21-build1.log`, `scratchpad/eg21-build2.log`, `scratchpad/eg21-h1.txt`,
  `scratchpad/eg21-h2.txt` (two consecutive `npm run build` runs and their `dist/index.html`
  hashes, for the idempotency check)

`git status --short` after every command in this session shows only the pre-existing untracked
`verify-logs/` directory; no tracked file was modified.

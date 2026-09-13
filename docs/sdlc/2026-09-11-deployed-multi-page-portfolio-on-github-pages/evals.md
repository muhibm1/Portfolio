# Evals: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Spec: [spec.md](./spec.md)
Intent: [intent.md](./intent.md)
Written by the eval designer against `spec.md` (1148 lines, R1-R79, M1-M17) in its first pass,
and **revised in rework round 1** against `spec.md` as it stands after the spec architect's
response to the constraint audit: 1728 lines (**confirmed** by counting), requirements R1-R90,
metrics M1-M17 unchanged. This revision keeps the structure, the case ID convention, and every
case whose requirement did not change; it adds cases for R80-R90 and rewrites every case whose
requirement's wording, acceptance check, or expected value changed. Also read: `intent.md`, the
eight ADRs, `.workhorse/profile.yml`, `docs/design-brief.md`, and the working tree at `main`
(`src/`, `index.html`, `vite.config.js`, `package.json`, `.gitignore`).

Every factual claim below is labelled **confirmed** (this agent read the file or line named)
or **believed, not verified** (inferred, or carried from an earlier agent). No em-dashes.

## Amendment (2026-09-12, GC78 final dependency-count correction)

The verifier ran at commit `cf969de` on Node v22.12.0 and reported GC78's command exiting 1:
`node -e "const p=require('./package.json'); const d=Object.keys(p.dependencies), v=Object.keys(p.devDependencies); if(d.length!==10||v.length!==10) throw 1; if(d.includes('@rolldown/binding-win32-x64-msvc')) throw 2;"`
found 8 `dependencies` and 12 `devDependencies` against the case's hard-coded expectation of 10
and 10 (**confirmed**, per the verifier's report given to this agent). This amendment corrects
GC78 and the two other places in this file that stated or relied on "10 and 10 either way." It
does not touch `spec.md`; the spec architect is amending R78's own wording for the same figures
in parallel, in the same window. No case ID was added, removed, or reassigned, and the
[coverage matrix](#9-coverage-matrix) is unchanged. This amendment does not touch anything about
the security audit (R56/R57, ADR 0009, the full `npm audit` exit code); that is being escalated
to the owner separately.

**Cause (confirmed by reading `package.json` at the current working tree).** Owner decision B3
(2026-09-12, "B2 and B3 as recommended", commit `a98fdcf`) moved `tailwindcss` and
`@tailwindcss/vite` from `dependencies` to `devDependencies`, both pinned exactly at `4.3.3`.
Reading `package.json` directly: `dependencies` (lines 14-23) now holds exactly 8 keys
(`@fontsource/inter`, `@fontsource/jetbrains-mono`, `@fontsource/space-grotesk`, `lucide-react`,
`react`, `react-dom`, `react-router`, `thinking-orbs`); `devDependencies` (lines 24-37) now holds
exactly 12 keys (`@tailwindcss/vite`, `@testing-library/dom`, `@testing-library/jest-dom`,
`@testing-library/react`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `jsdom`,
`oxlint`, `tailwindcss`, `vite`, `vitest`). `@rolldown/binding-win32-x64-msvc` is absent from
both sections (**confirmed**, it does not appear anywhere in the file).

**Arithmetic (confirmed).** Baseline before this change: 7 `dependencies`, 5 `devDependencies`.
R78 adds 4 runtime packages and removes 1 runtime package (`@rolldown/binding-win32-x64-msvc`),
and adds 5 dev packages: 7 + 4 - 1 = 10 `dependencies`, 5 + 5 = 10 `devDependencies` immediately
after R78, before B3. B3 then moves 2 existing packages (`tailwindcss`, `@tailwindcss/vite`)
from the `dependencies` section to the `devDependencies` section: 10 - 2 = 8 `dependencies`,
10 + 2 = 12 `devDependencies`. The earlier amendment's sentence, "totals GC78 checks (10 and 10
either way, since GC78 only asserts array lengths ... not package-level membership by section),"
treated the two array lengths as invariant under a move between the two sections. **That was
incorrect**: moving a key out of one object literal and into another changes
`Object.keys(...).length` on each object individually, even though it changes neither the total
number of packages in the file nor how many R78 itself added or removed. That sentence is marked
superseded where it appears below, not deleted.

**GC78, rewritten.** The command now asserts the final counts directly (8, 12) instead of a
fixed "10 and 10" that only ever held immediately after R78 and before B3, so it does not need
to be re-derived by hand every time a package moves sections. It keeps the rolldown-absence
check (extended to both sections) and adds an explicit membership check that `tailwindcss` and
`@tailwindcss/vite` are `devDependencies` keys and not `dependencies` keys, which overlaps GC91
by design (both check the same fact from different angles: GC91 via `grep`, GC78 via `node -e`
array membership). The command is a single Windows-safe `node -e` invocation and prints the
actual counts and the specific failed assertion(s) on any mismatch, so a future failure is
self-describing instead of a bare non-zero exit with no message. See the rewritten row in
[section M](#m-non-functional-and-platform-r74-r78).

```
node -e "const p=require('./package.json'); const d=Object.keys(p.dependencies), v=Object.keys(p.devDependencies); const errs=[]; if(d.length!==8) errs.push('dependencies='+d.length+' expected 8'); if(v.length!==12) errs.push('devDependencies='+v.length+' expected 12'); if(d.includes('@rolldown/binding-win32-x64-msvc')) errs.push('rolldown present in dependencies'); if(v.includes('@rolldown/binding-win32-x64-msvc')) errs.push('rolldown present in devDependencies'); if(!v.includes('tailwindcss')) errs.push('tailwindcss missing from devDependencies'); if(d.includes('tailwindcss')) errs.push('tailwindcss present in dependencies'); if(!v.includes('@tailwindcss/vite')) errs.push('@tailwindcss/vite missing from devDependencies'); if(d.includes('@tailwindcss/vite')) errs.push('@tailwindcss/vite present in dependencies'); if(errs.length){console.error('dependencies='+d.length+' devDependencies='+v.length); console.error(errs.join('; ')); process.exit(1);}"
```

**Epistemic note on this amendment's own verification.** This agent has no Bash or
code-execution tool in this session (the same restriction section 0 already records for the
original pass, and the same restriction the spec architect recorded for the parallel R78
amendment). What follows is therefore a hand-trace against the file actually read, not an
executed run, and is labelled accordingly:

- **Confirmed** (read directly): the current `package.json` has 8 `dependencies` keys, 12
  `devDependencies` keys, `tailwindcss` and `@tailwindcss/vite` both present under
  `devDependencies` at exact `4.3.3` and absent from `dependencies`, and
  `@rolldown/binding-win32-x64-msvc` absent from both sections.
- **Believed, not verified by execution**: that running the command above against the current
  tree exits 0. Tracing the script by hand against the confirmed facts above: `d.length===8`
  (no push), `v.length===12` (no push), neither rolldown check fires (no push), `v.includes
  ('tailwindcss')` is true and `d.includes('tailwindcss')` is false (no push, twice), the same
  holds for `@tailwindcss/vite` (no push, twice); `errs.length===0`, so the script falls through
  with no `console.error` and no `process.exit(1)`, which is a normal 0 exit. This trace is
  **confirmed** as a trace; the actual exit code has not been observed by this agent running the
  command. **The conductor or eval runner must execute it once, on Node v22.12.0, before treating
  GC78 as green**, per the task's own report requirement.
- **Red-team, hand-traced, not executed.** Two adversarial fixtures, reasoned through rather than
  run (per instruction, never by editing the real `package.json`):
  1. *Old 10/10 layout* (the shape before B3: `tailwindcss` and `@tailwindcss/vite` under
     `dependencies` instead of `devDependencies`, giving 10 `dependencies` keys and 10
     `devDependencies` keys). Trace: `d.length===10!==8` pushes an error; `v.length===10!==12`
     pushes a second; `v.includes('tailwindcss')` is false (it is under `dependencies` in this
     fixture) so a third error pushes; `d.includes('tailwindcss')` is true so a fourth pushes;
     the same two pushes repeat for `@tailwindcss/vite`. `errs.length===6`, so the script prints
     both counts and all six messages and exits 1. The check correctly rejects the old layout.
  2. *Rolldown reintroduced* (hypothetically added back to either section, counts otherwise at
     8/12). Trace: whichever section's `.includes('@rolldown/binding-win32-x64-msvc')` is true
     pushes one error; `errs.length>=1`, script exits 1. The check correctly rejects it.
  Both fixtures were reasoned about, not written to disk or executed, since this agent has no
  execution tool this session; a temporary fixture file was not created for the same reason (no
  tool to run it against). This is weaker evidence than an actual run and is labelled as such.

## Amendment (2026-09-12, wave 4 builder findings)

Wave 4 builders confirmed six eval defects while implementing the plan. This amendment fixes
all six, per the conductor's task list. No case ID was added, removed, or reassigned to a
different requirement; the [coverage matrix](#9-coverage-matrix) is unchanged except where noted
below. Every claim here is labelled **confirmed** (this agent read the cited file itself) or
**believed, not verified**.

- **FL6** (R2). **Confirmed** by reading `src/routes.test.jsx` lines 112-133 (the "Pages base
  path" describe block) and by tracing react-router 7.18.3's own basename-stripping behaviour
  against those three tests. The router's `stripBasename` tolerates a trailing slash on any path
  segment *past* the basename itself, so an unstripped `/Portfolio/` basename still routes
  `/Portfolio/work` to the work index; it does not send it to `NotFoundPage`, and the first
  draft's expected outcome ("every route falls through to `NotFoundPage`") does not match what
  the router does. The real, observable breakage from an unstripped basename is at the bare
  `/Portfolio` address itself: `BrowserRouter` logs a `console.warn` ("... won't render
  anything ...") and renders an empty DOM, because the router has no route for the basename
  alone while it still carries a trailing slash. FL6's Failure, Exact check, and Expected columns
  are rewritten below to match the three tests T11 actually wrote.
- **GC9** (R9). **Confirmed** by reading `plan.md` T11 and `src/routes.test.jsx`: the test named
  in GC9's scenario ("registers no scroll handler on /work that reads the home section ids")
  lives in the `home section scroll spy` describe block of `src/routes.test.jsx`, not in a
  `src/pages/WorkIndexPage.test.jsx` file, which does not contain this test. The "Implemented as"
  cell is corrected.
- **GC82** (R82). **Confirmed** by reading `.github/workflows/deploy.yml` lines 280-311: the R82
  smoke step defines `phone_pattern` as a generic North American phone-number shape built from
  `[0-9]{n}` character classes (the same shape `src/data/portfolioData.test.js` uses, per the
  workflow's own comment on that line), never a literal digit string, and runs it against both
  the fetched HTML body and the fetched module script. GC82's structural half previously named
  the owner's specific digits as the expected match target, which plan rule 3 forbids in an
  artifact this agent writes. GC82 is reworded below to check for the generic pattern's presence
  and the absence of any literal digit run, never naming the owner's number. The "Leaked (data)"
  row of the [failure taxonomy](#8-failure-taxonomy) is also corrected below for the same reason,
  since it described GC82/R82 as an exact-string match.
- **GC59 and EG17** (R59). **Confirmed** by reading `.github/workflows/deploy.yml`'s `uses:`
  lines (each a 40-character SHA followed by a space and a `#` tag comment) and by tracing GC59's
  regex, `@[0-9a-f]{40}`, by hand: it has no right-side boundary, so a 41-character hex run
  matches on its first 40 characters and is miscounted as pinned. GC59's regex is anchored below
  to `@[0-9a-f]{40}([[:space:]]|$)`, so exactly 40 hex characters must be followed by whitespace
  or end of line. EG17 is updated to red-team both the 39- and 41-character cases against the
  anchored regex, keeping its original intent: guarding the verification instrument's own
  off-by-one.
- **GC68** (R68). **Confirmed** by reading `.github/dependabot.yml`: `open-pull-requests-limit:
  5` appears once per `package-ecosystem` entry (`npm` and `github-actions`), so twice in the
  file, not once as R68's acceptance check first stated. GC68 is reworded to expect the count
  once per ecosystem entry (two occurrences total for the current two ecosystems).
- **GC89** (R89). **Confirmed** by reading `intent.md`: line 199 was correctly redacted to
  `(512) 508-xxxx` by T13 under R89, but line 152 (the M8 success-metric row, which reads the
  literal as a check target) and line 311 (the G1 D1 decision row: the recommendation to remove
  the number, quoted verbatim) both still carry the full digits, and neither line was named by
  R89, `plan.md`, or the G3 packet. A repository-wide scan at HEAD, excluding `.git`,
  `node_modules`, `.worktrees` and any nested `worktrees` directory, finds the digits in
  `spec.md`, `evals.md`, and this change's `intent.md`: three files, not the two GC89 expected.
  This agent adopts **option (a)**: adding `intent.md` to GC89's expected match set, on the
  reasoning that line 152 is a success-metric check reading the literal (the same role
  `evals.md`'s own check rows already play, and the precedent the prior amendment already used
  to add `evals.md` to this set) and line 311 is the G1 D1 decision record the owner approved,
  which this amendment does not touch or ask anyone to edit. **Option (b) — asking the owner to
  authorise redacting the approved G1 D1 decision text and the M8 metric row in `intent.md` —
  remains open to the owner at G4**, and is not decided here.

## Amendment (2026-09-12, B2/B3 pin corrections and one new case)

The owner approved B2 and B3 on 2026-09-12 (`conductor-log.md` lines 35-37, commit `a98fdcf`,
**confirmed** by the facts this agent was given). This amendment corrects every case that named
a pre-approval version number, records the audit-status change, and adds one new case for B3. No
case was removed and no case's requirement mapping changed except the one addition noted below;
the [coverage matrix](#9-coverage-matrix) gains one entry (`GC91` against `R49`) and is otherwise
unchanged.

- **GC1** (R1). `react-router` is now pinned exactly at `7.18.3`, not `7.9.4`
  (**confirmed** per the facts given to this agent). The grep pattern and the expected pinned
  string are both updated from `7.9.4` to `7.18.3`; the check's shape (exactly one import line,
  no `^`/`~` on the pin) is unchanged.
- **AD14** (R85). `vitest` is now pinned exactly at `3.2.7`, not `3.2.4`
  (**confirmed** per the facts given to this agent). The red-team fixture's caret example
  changes from `"vitest": "^3.2.4"` to `"vitest": "^3.2.7"`, so the fixture still represents a
  plausible regression against the real pinned value rather than one that could never occur.
- `tailwindcss` and `@tailwindcss/vite` moved from `dependencies` to `devDependencies`, exact
  `4.3.3` (**confirmed** per the facts given to this agent). This agent searched every case in
  this file for the literals `7.9.4`, `3.2.4`, `tailwindcss`, and `@tailwindcss/vite`: only GC1
  and AD14 named the two version strings above, and no existing case named Tailwind's package
  location, so no other case needed rewording on this point. GC91, below, is new coverage for it.
- `npm audit --omit=dev --audit-level=high` now exits 0 (**confirmed** per the facts given to
  this agent). The full `npm audit --audit-level=high` (no `--omit=dev`) still exits 1 on five
  dev-only advisories (vite `GHSA-fx2h-pf6j-xcff` high; vite `GHSA-4w7w-66w2-5vf9`,
  `GHSA-v6wh-96g9-6wx3`, esbuild `GHSA-67mh-4wv8-2f99`, `@vitest/mocker` `GHSA-82fw-gwwq-j7x9`,
  all moderate), which the spec architect is recording as accepted in new
  `adr/0009-accept-dev-only-vite-and-vitest-advisories.md` (**believed, not verified**: this
  agent did not read that ADR, since it is being written in parallel by the spec architect and
  this agent's scope is `evals.md` only). This agent searched every case in this file expecting
  the full, un-scoped `npm audit --audit-level=high` to exit 0: none exists. GC56 and the
  failure-taxonomy "Unauthorised" row already scope the blocking requirement to the
  `--omit=dev` form; GC57 already scopes the full-tree form to "present, paired with
  `continue-on-error: true`," never to an exit code. Both stand unchanged. For any future case
  that does read the full audit's exit code, the expected result is: exit 1 is acceptable only
  if every listed advisory is in ADR 0009's dev-only set, and `--omit=dev` exits 0.
- **GC91** (new, against R49). Added in [section I](#i-test-toolchain-r49-r54): a golden command
  case checking that `tailwindcss` and `@tailwindcss/vite` sit under `devDependencies` at exact
  `4.3.3`, and that `npm audit --omit=dev --audit-level=high` exits 0. This is the one new case
  in this amendment. Its ID breaks the strict `GCn`-maps-to-`Rn` numbering the same way `GC-CP`
  already does: it is an additional pin-and-audit check against R49, not a new requirement, and
  `GC91` is the next free integer after the file's highest existing golden-case number, `GC90`.
  It is cross-referenced in the [coverage matrix](#9-coverage-matrix)'s R49 row alongside GC49.

**Superseded 2026-09-12 by the "GC78 final dependency-count correction" amendment above.** The
paragraph immediately below states GC78's totals are "10 and 10 either way." That is wrong:
moving a package's key out of one object literal (`dependencies`) and into another
(`devDependencies`) changes `Object.keys(...).length` on each object individually, even though
it changes neither the total package count nor how many packages R78 itself added or removed.
The verifier's run at commit `cf969de` on Node v22.12.0 confirmed this: it found 8 and 12, not
10 and 10, and GC78 failed as written. Kept verbatim below for the record, not deleted. GC78 is
rewritten in [section M](#m-non-functional-and-platform-r74-r78) and is no longer "left
unchanged pending that resolution."

**Finding outside this amendment's scope, reported and not fixed here**: GC78 and R78 state
"exactly 4 runtime dependencies and 5 devDependencies SHALL be added" against a baseline of 7
`dependencies` and 5 `devDependencies`, and GC78's command asserts the final counts are 10 and
10. Moving `tailwindcss` and `@tailwindcss/vite` from `dependencies` to `devDependencies` changes
which packages sit in which final section (2 fewer runtime, 2 more dev) without changing the
totals GC78 checks (10 and 10 either way, since GC78 only asserts array lengths and the absence
of the removed rolldown package, not package-level membership by section). This agent did not
re-verify whether GC78's `node -e` check incidentally still passes membership-wise, because R78's
own wording and the spec's before/after bounds are the spec architect's amendment to make, not
this agent's; this agent's instructions were scoped to `evals.md` cases naming the specific
literals above, and GC78 does not name any of them. Flagging here so the spec architect or the
verifier checks GC78 against R78's final wording once R78 itself is amended.

## Amendment (2026-09-12, targeted rework before Verify)

G3 was approved (`approvals.md`: "D1 copy approved; D2, D4, D5 as recommended"). The G3 packet's
"Findings outside scope" items 1-6 (`plan.md`) named six eval defects to fix before Verify. This
amendment fixes all six. No case ID was added, removed, or reassigned to a different
requirement, so the [coverage matrix](#9-coverage-matrix) and the section 1 targets are
unchanged; only the six rows below changed content. Everything else in this file is unchanged
from rework round 1.

- **GC43** (R43, item 1). Reworded: it no longer asserts a GitHub link on all three project
  cards. It now states the two branches G3-D2 actually specifies (a public card links to GitHub;
  a private card shows the note, a mailto link to `personal.email`, and no GitHub link) and
  notes that, because `workhorse`, `Shu` and `wasl` are all currently private, every card on the
  live data shows the note today.
- **GC3** (R3, item 2). The single `grep -c "<Route "` count of 4 no longer matches once R4's
  `<Outlet>` layout adds a fifth, pathless `<Route>` wrapping the other four. The check now
  counts child routes (path or index attribute: target 4) and separately requires exactly one
  pathless layout route (total `<Route ` count = child count + 1 = 5).
- **GC29** (R29, item 3). The third grep now uses whole-word matching (`grep -cwE`) so it stops
  counting the component's own name, `ThinkingOrbHero`, as an occurrence of the banned token
  `ThinkingOrb`.
- **GC5** (R5, item 5). The check now counts only non-test `import ResumeModal` statements, so
  it stops counting `ResumeModal.test.jsx`'s own import of the component it tests. The only
  non-test import site is `src/components/SiteLayout.jsx`.
- **GC39** (R39, item 6). The built `body{}` rule's `font-family` value is now the load-bearing
  assertion. The whole-file `grep -c "font-family:Inter"` is kept only as a necessary-but-not-
  sufficient existence check, because the `@fontsource` packages' own `@font-face` rules also
  declare `font-family:Inter` and would satisfy that grep even if `body` used a different stack.
- **GC89** (R89, item 4). The expected match set is now `spec.md` **and** `evals.md`, since this
  file legitimately carries the digits five times (in the GC41, GC82, GC89, NF8 and failure-
  taxonomy rows, all of which specify a check that searches for the literal, not a leak). The
  grep now excludes `.git`, `node_modules`, `.worktrees` (`.gitignore` line 25, **confirmed**)
  and any nested directory literally named `worktrees`, which covers `.claude/worktrees`: this
  agent **confirmed** by directory listing that `.claude/worktrees/agent-*/` holds full
  pre-change checkouts of both `spec.md` and `evals.md` (several such worktrees exist today),
  so without this exclusion the check would over-count. This upgrades the plan's "believed, not
  verified" on this path to confirmed.

Also recorded, as a note only, with no requirement or case change: a design-preview finding on
the hero orb's dot rendering, logged in `conductor-log.md` (the plan-phase entry timestamped
2026-09-12T11:34:08.129Z, **confirmed** by reading it). See the note after the
[Hero and the orb](#e-hero-and-the-orb-r27-r36) table.

## 0. Scope, method, and epistemic labels

- This agent has no Bash tool in this session (same restriction the spec architect recorded).
  Every "exact check" below is written to run in Git Bash on Windows, verbatim, by the eval
  runner in the Verify phase. This agent did not execute any of them; **confirmed** means the
  facts the check is built on (line numbers, exact strings, hex codes, current dependency
  counts) were read directly from the repository, not that the check itself has been run.
- Commands avoid `npx`, `npm install`, `npm i `, `npm uninstall`, `gh workflow run`, `gh
  release` (all profile `ask_commands`) because the eval runner cannot approve those prompts
  itself. Where a case genuinely depends on one of those (an install, an owner-triggered push),
  it is marked `manual` or `CI-only` with the reason, never silently assumed.
- `git`-based checks (`git ls-files`, `git diff`, `git rm`) are carried over verbatim from
  `spec.md`'s own acceptance checks, which assume a git working tree. This agent's own sandbox
  reports no git repository at this path; **believed, not verified** that a `.git` directory
  exists at `C:\Users\alqai\Portfolio` at build time. If it does not, every `git`-based check
  in this file degrades from `Windows` to `manual` (compare two file snapshots by hand), and
  the build phase should confirm this before relying on any `git ls-files`/`git diff` check.
- Case ID convention: golden case `GCn` maps to requirement `Rn` (so `GC31` is the golden case
  for `R31`). A requirement with both an automatable and a visual-only component gets a second
  case `GCnv` (manual). Non-functional case `NFn` maps to metric `Mn`. Edge, failure, and
  adversarial cases are numbered independently (`EGn`, `FLn`, `ADn`) and each names the
  requirement(s) it covers, since one interface can produce several edge/failure/adversarial
  cases against the same requirement. R80-R90 keep this convention: `GC80` through `GC90` map
  one-for-one, and new edge/failure/adversarial cases continue the existing sequences
  (`EG22`, `FL21`-`FL23`, `AD14`-`AD16`) rather than restarting them. `GC91` (2026-09-12
  amendment) is the one documented exception, matching `GC-CP`: an additional golden case
  against an existing requirement (R49), not a new requirement.
- This revision was produced without re-running any command from the prior pass; every case
  carried unchanged from the first version keeps its original epistemic labels.

## 1. Targets

| Category | Target | Rationale |
|----------|--------|-----------|
| Golden | 100% pass | Every one of R1-R90 has a golden case; the outcome does not ship without every one passing |
| Edge | 100% pass | Boundaries on the app's few real interfaces: the URL (slug, hash), the viewport, timers, device pixel ratio, and now the smoke step's own asset-parsing logic |
| Failure | 100% correct handling | Every row of the spec's own failure-modes table (`spec.md` lines 830-853) becomes one case here, **including the mount-failure row, which the spec itself states has no automated detection.** That row's case (FL23) is scored on whether the accepted-risk documentation and the R84 manual compensating control exist, not on catching the failure, matching R90's rule against crediting a check with a detection it does not have |
| Adversarial | 100% rejected or safely handled, **except AD13** | AD13 (clickjacking via a meta-only CSP) is a stated, accepted residual risk per ADR 0006, not a defect; it is scored "documented", not "rejected". Every other adversarial case, including the three new red-team cases against the smoke step's own detection logic (AD14-AD16), targets a surface the design already claims to defend, so 100% is the right bar, not an aspiration |
| Non-functional | see rows | One row per success metric M1-M17, each with the intent's own numeric target |

## 2. Golden cases

One case per requirement, minimum. Grouped by the spec's own lettered sections (A-O).

### A. Routing and page shell (R1-R10)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC1 | R1 | Given `src/main.jsx`, when grepped for the router import, then exactly one `from 'react-router'` line exists and `package.json` pins `react-router` at `7.18.3` with no range prefix | `grep -c "from 'react-router'" src/main.jsx`; `grep -n "\"react-router\": \"7.18.3\"" package.json` | First count is 1; second grep matches, no `^`/`~` | Windows | command |
| GC2 | R2 | Given `import.meta.env.BASE_URL` values, when the exported basename helper runs, then it strips a trailing slash and falls back to `/` on empty | Vitest `"strips the trailing slash from the Vite base url"`: `computeBasename('/Portfolio/') === '/Portfolio'`; `computeBasename('/') === '/'` | Both assertions pass | Windows | `src/basename.test.js` |
| GC3 | R3 | Given the route table, when `/`, `/work`, all 3 case-study paths, and `/work/no-such-study` render, then each shows the expected level-1 heading, and the route table has exactly one pathless layout route wrapping exactly four child routes (index, `work`, `work/:slug`, `*`) | RTL render per path, assert `getByRole('heading', {level:1})` text; `grep -cE "<Route (path=|index)" src/App.jsx` for the child-route count; `grep -c "<Route " src/App.jsx` for the total, which must equal the child-route count plus exactly 1 | Correct heading per path; child-route grep = 4; total grep = 5 (one pathless layout route, not four `<Route` elements as the first draft counted) | Windows | `src/routes.test.jsx` + command |
| GC4 | R4 | Given `SiteLayout`, when `/`, `/work`, `/work/apple-llm-triage` render, then the footer's `mailto:` link is present on all three | RTL, `getByRole('link', {name: /mailto/})` or `container.querySelector('a[href^="mailto:"]')` per route | Present on all 3 routes | Windows | `src/components/SiteLayout.test.jsx` |
| GC5 | R5 | Given the component tree, when non-test `ResumeModal` import statements are grepped, then it is imported only by `SiteLayout.jsx` outside test files, and no route path contains `resume` | `grep -rn "^import ResumeModal" src/ --include=*.jsx --include=*.js --exclude=*.test.jsx --exclude=*.test.js`; `grep -n "resume" src/App.jsx` | One import site, `src/components/SiteLayout.jsx`; 0 route-path matches | Windows | command |
| GC6 | R6 | Given the rename, when `git ls-files` and a repo-wide email grep run, then `CaseStudyModal.jsx` is gone and the literal email appears only in the data module, with **all four** component occurrences converted to `personal.email`: `CaseStudyModal.jsx` line 298 (`mailto:` href, now `CaseStudyPage.jsx`), `Navbar.jsx` line 17 (clipboard argument), `Navbar.jsx` line 87 (visible display text), and `ContactFooter.jsx` line 38 (visible display text). The first draft missed `Navbar.jsx` line 87 | `git ls-files \| grep -c CaseStudyModal.jsx`; `grep -rn "mmalqaim@gmail.com" src/` | 0; exactly 1 match, `src/data/portfolioData.js` line 7, and nothing else | Windows | command |
| GC7 | R7 | Given a route change with no hash, when `/` navigates to `/work`, then the window scrolls to the top | Vitest mocks `window.scrollTo`, navigates, asserts called with `(0, 0)` | Called once, `(0,0)` | Windows | `src/routes.test.jsx` |
| GC8 | R8 | Given `/#simulator`, when `HomePage` mounts, then it scrolls the `#simulator` element into view, smoothly unless reduced motion is preferred | Vitest renders `/#simulator`, spies `scrollIntoView`; repeats with `matchMedia` mocked to match `prefers-reduced-motion: reduce` | Called on the right element; `behavior: 'smooth'` in the first case, no smooth behavior in the second | Windows | `src/pages/HomePage.test.jsx` |
| GC9 | R9 | Given `/work`, when the page mounts, then no active-section scroll-spy listener is registered (distinct from `Navbar`'s own unrelated scroll listener) | Vitest spies `window.addEventListener`, captures `scroll` handlers registered while `WorkIndexPage` is mounted, invokes each, asserts none calls `document.getElementById` for any of the six home section ids | 0 handlers touch the home section ids | Windows | `src/routes.test.jsx` |
| GC10 | R10 | Given `/work`, when the navbar renders, then a `Work` link exists and no `#philosophy` anchor exists | RTL `getByRole('link', {name: /work/i})`; `queryByRole('link', {name: /philosophy/i})` | Link found; anchor query returns null | Windows | `src/components/Navbar.test.jsx` |

### B. Base path and deep links (R11-R14)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC11 | R11 | Given `vite.config.js` `base: "/Portfolio/"`, when the site builds, then every asset path in the built HTML begins `/Portfolio/` and none begins `/assets/` | `npm run build`; `grep -c 'src="/Portfolio/' dist/index.html`; `grep -c '"/assets/' dist/index.html` | Build exits 0; first grep >= 1; second grep = 0 | Windows | command (post-build). R80 re-asserts this class of defect live on the served page; see GC80 |
| GC12 | R12 | Given a completed build, when `dist/index.html` and `dist/404.html` are compared, then they are byte-identical | `sha256sum dist/index.html dist/404.html` (compare the two hash fields) | Identical hashes | Windows | command (post-build). R81 re-asserts this live by comparing a fetched deep-link body against the fetched root body; see GC81 |
| GC13 | R13 | Given deep-link recovery, when `src/` and `index.html` are grepped for the **full** no-tracking pattern from `docs/sdlc/constraints.md` line 208, then none of the nine tokens appear | `grep -rnE "fetch\(\|XMLHttpRequest\|axios\|localStorage\|sessionStorage\|document.cookie\|gtag\|analytics\|dataLayer" src/ index.html` | 0 matches | Windows | command (shared with M10, GC44; the first version of this check omitted `fetch(`, `XMLHttpRequest`, `axios`, which are the three tokens that catch a new outbound call) |
| GC14 | R14 | Given `index.html` declares `%BASE_URL%favicon.svg`, when the site builds, then the built HTML references `/Portfolio/favicon.svg` | `grep -c "/Portfolio/favicon.svg" dist/index.html` | >= 1 | Windows | command (post-build) |

### C. The `/work` index (R15-R20)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC15 | R15 | Given `/work`, when it renders, then the three labelled regions contain 3, 3, and 1 `article` elements | RTL: within region "Case studies" `getAllByRole('article').length`; same for "Projects", "Live demo" | 3, 3, 1 | Windows | `src/pages/WorkIndexPage.test.jsx` |
| GC16 | R16 | Given `portfolioData.projects`, when `/work` renders, then `workhorse`, `Shu`, `wasl` all appear and no fourth project does | RTL text assertions; `portfolioData.projects.length === 3` | All 3 present; length 3 | Windows | `src/pages/WorkIndexPage.test.jsx` + `src/data/portfolioData.test.js` |
| GC17 | R17 | Given the live-demo entry, when `/work` renders, then its link `href` ends with `#simulator` | RTL, `link.getAttribute('href')` ends with `#simulator` | True | Windows | `src/pages/WorkIndexPage.test.jsx` |
| GC18 | R18 | Given `portfolioData.js`, when the pinned fields are read, then the four telemetry tuples and the three case-study ids and titles match exactly | Vitest asserts each `telemetry[i]` `{metric,unit,label,context}` and each `caseStudies[i]` `{id,title}` equals the hard-coded expected value | Exact match, all 7 pinned records | Windows | `src/data/portfolioData.test.js` |
| GC19 | R19 | Given `/work`, when compared to `docs/design-brief.md` lines 44-49, then it matches: 1200px max width, two-column asymmetric grid with stagger, 80px between entries, weights 300/400 only, 0px radius, no shadow/border/button, `~` separator, email top-left, socials top-right | Manual visual review against the 9 named attributes | Reviewer confirms all 9 | **manual, and permanently so, per the spec's own text**: no layout engine in jsdom; computed grid geometry and visual stagger cannot be asserted without a real browser, which is outside the profile's toolchain by design (no `e2e` command, Playwright considered and rejected on cost). This is recorded as a permanent ceiling, not an open eval gap | G4 design review, spec architect or owner |
| GC20 | R20 | Given the type filter (All/Case study/Project/Live demo, default All, rendered as text links), when "Project" is activated, then only 3 articles remain | RTL: default render 7 articles; click "Project" link; recount; assert filter controls have `role="link"` not `role="button"` | 7 then 3; links not buttons | Windows | `src/pages/WorkIndexPage.test.jsx` |

### D. The `/work/:slug` case-study page (R21-R26)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC21 | R21 | Given the three known slugs and one unknown slug, when each renders, then the three resolve and the unknown shows `NotFoundPage` | 4 RTL renders, assert heading per case | Correct case study per slug; `NotFoundPage` heading for the unknown one | Windows | `src/components/CaseStudyPage.test.jsx` + `src/pages/NotFoundPage.test.jsx` |
| GC22 | R22 | Given the mockup layout, when a case-study page renders, then the four chip labels and both column headings appear | RTL text assertions for `Challenge`, `System Architecture`, `Production Deployment`, `Measured Impact`, and `Key enterprise metrics` | All present | Windows | `src/components/CaseStudyPage.test.jsx` |
| GC22v | R22 | Given `public/mockup-casestudy.jpg`, when a case-study page renders in a browser, then the eyebrow line, uppercase display title, left-diagram/right-metrics split, and chip row match the mockup | Manual visual review | Reviewer confirms | manual: pixel layout fidelity, no browser rendering in the toolchain | G4 design review |
| GC23 | R23 | Given the four tabs are sourced only from existing fields, when each tab renders for all 3 case studies, then its body text is a substring of the corresponding `challenge` / `diagramSteps` / `solution`+`techStack` / `impact` field | RTL text-substring assertions per tab per case study | Substring match, no invented prose, all 3 case studies | Windows | `src/components/CaseStudyPage.test.jsx` |
| GC24 | R24 | Given `diagramSteps` of varying length, when the flow diagram renders, then the node count equals the array length | Vitest renders the diagram with a stub of length 4 (the 3 real case studies) and also the diagram sub-component alone with stub lengths 2 and 6 | Node count equals array length in every case | Windows | `src/components/CaseStudyPage.test.jsx` |
| GC25 | R25 | Given the `caseStudies` order, when the last case study (`neural-newsletters-llm`) renders, then "next" points at the first (`apple-llm-triage`), and vice versa on the first | RTL, assert `next`/`previous` link hrefs | Wraparound both directions | Windows | `src/components/CaseStudyPage.test.jsx` |
| GC26 | R26 | Given no accounts exist, when any of the 5 rendered routes is checked, then no "Log in" or "Sign up" control exists | RTL `queryByRole(..., {name: /log ?in\|sign ?up/i})` per route | `null` on every route | Windows | `src/routes.test.jsx` |

### E. Hero and the orb (R27-R36)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC27 | R27 | Given `/` renders, then the stacked name heading, the availability pill, all 4 telemetry strings, and the orb canvas are present | RTL text assertions for the heading, pill text, `350+`, `50+`, `-40%`, `99.9%`, and `getByRole('img')` for the canvas | All present, exactly one canvas | Windows | `src/pages/HomePage.test.jsx` |
| GC27v | R27 | Given `public/mockup-home.jpg`, when the hero renders in a browser, then the two-line uppercase name stack and the orb's position match | Manual visual review | Reviewer confirms | manual: pixel layout fidelity | G4 design review |
| GC28 | R28 | Given the orb replaces the monogram, when the repo is grepped, then `MmLogo.jsx` is gone and unreferenced | `git ls-files \| grep -c MmLogo.jsx`; `grep -rn "MmLogo" src/` | 0; 0 | Windows | command |
| GC29 | R29 | Given `ThinkingOrbHero`, when its source and its render output are checked, then it imports only `resolvePreset` and `MODE_FRAMES` from `thinking-orbs/engine` and renders exactly one `<canvas role="img">` | `grep -n "thinking-orbs" src/components/ThinkingOrbHero.jsx`; RTL asserts one `role="img"` element; `grep -cwE "paintFrame\|paintLines\|ThinkingOrb" src/components/ThinkingOrbHero.jsx` (whole-word match, so the component's own name, `ThinkingOrbHero`, is not itself counted as an occurrence of `ThinkingOrb`) | One import line naming only those two symbols; one canvas; second grep = 0 | Windows | command + `src/components/ThinkingOrbHero.test.jsx` |
| GC30 | R30 | Given the painter colours each dot by depth via a small exported pure function `colourForDepth(z)`, when the unit test "maps the near, middle and far depths onto the brand stops" calls it at `z=-1`, `z=0`, `z=1`, then it returns the exact expected CSS colour strings mapping the OFF+BRAND stops (`#facb0e`, `#f06ba8`, `#78bae6`, `#ffffff`), and no `shadowBlur` call exists in the source | Vitest asserts `colourForDepth(-1)`, `colourForDepth(0)`, `colourForDepth(1)` against exact hard-coded strings; `grep -c "shadowBlur" src/components/ThinkingOrbHero.jsx` | Exact match at all 3 depths; grep = 0 | Windows | `src/components/ThinkingOrbHero.test.jsx` (or a sibling `colourForDepth.test.js` if the helper is extracted) + command |
| GC30v | R30 | Given `public/mockup-home.jpg`, when the orb renders in a real browser, then dots are coloured by depth across the amber-rose-blue-white gradient with no glow | Manual visual review (jsdom has no canvas rendering); now a supplement to GC30's exact-output unit test, not the only check on the mapping | Reviewer confirms the gradient reads correctly against the mockup image | manual: canvas pixels are not renderable in jsdom | G4 design review |
| GC31 | R31 | Given the clamp `Math.min(420, Math.max(280, viewportWidth - 48))` is a small exported pure function `canvasWidthForViewport(viewportWidth)`, when it is called at 1440, 1024, 700, 468 and 320, then it returns 420, 420, 420, 420 and 280 respectively; separately, a render test asserts `canvas.style.width === '420px'` under the jsdom default viewport | Vitest calls `canvasWidthForViewport` at the five named widths and asserts the five named outputs; RTL reads `canvas.style.width` | Five exact outputs: 420, 420, 420, 420, 280; render check: `'420px'` | Windows | `src/components/ThinkingOrbHero.test.jsx` (or a sibling `canvasWidthForViewport.test.js`) |
| GC32 | R32 | Given `prefers-reduced-motion: reduce` matches, when the orb mounts, then it paints one frame at `t=0.6` and never calls `requestAnimationFrame` | Vitest mocks `matchMedia` to match the reduce query, spies `requestAnimationFrame`, asserts 0 calls after mount and after a flushed tick | 0 calls | Windows, needs the R54 `matchMedia` stub | `src/components/ThinkingOrbHero.test.jsx` |
| GC33 | R33 | Given `IntersectionObserver` reports the canvas offscreen, or `document.visibilityState` becomes `hidden`, when either fires, then the loop pauses and resumes on the opposite signal | Vitest stubs `IntersectionObserver`, fires `{isIntersecting:false}` then `{isIntersecting:true}`; separately sets `document.visibilityState='hidden'` and fires `visibilitychange`, then reverses | `cancelAnimationFrame` on pause, `requestAnimationFrame` on resume, both paths | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| GC34 | R34 | Given the orb is mounted, when it unmounts, then the frame is cancelled and the observer disconnected | Vitest mount then unmount, spies assert both called | Both called exactly once | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| GC35 | R35 | Given `getContext('2d')` returns `null` (the R54 default stub), when the orb mounts, then it returns without throwing | Vitest renders with the default setup-file stub; assert no exception and the canvas element still renders | No throw; canvas present | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| GC36 | R36 | Given `devicePixelRatio = 2` and `size = 420`, when the orb mounts, then the backing store is `840 x 840` | Vitest stubs `window.devicePixelRatio = 2`, asserts `canvas.width === 840` and `canvas.height === 840` | `840`, `840` | Windows | `src/components/ThinkingOrbHero.test.jsx` |

**Note on the hero orb's dot rendering (not a requirement or case change).** A private design
preview logged in `conductor-log.md` (plan phase, **confirmed** by reading the entry) found that
at 420 px the working `thinking-orbs` 64 px preset's dots read too small and too faint against
the glow, and recommended the hero adopt a dot-radius multiplier of about 1.9, an alpha lift of
about 1.6, and a glow opacity near 0.34, since neither R29 nor R30 fixes dot radius. This agent
checked GC29 through GC36 and EG10 through EG13 against those multipliers: none of them asserts
a specific dot radius, alpha value, or glow opacity, so none contradicts the recommendation.
GC30 pins exact colour strings (unaffected by radius or alpha scaling) and forbids `shadowBlur`;
the glow the preview describes is the CSS-level glow carried from `MmLogo.jsx` into the orb's
wrapper (per `plan.md` T8), not a canvas `shadowBlur` call, so GC30's prohibition still holds.
No case below is adjusted.

### F. Fonts and design tokens (R37-R40)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC37 | R37 | Given the Google Fonts tags are deleted, when `index.html` and `dist/` are grepped, then no reference remains | `grep -rc "fonts.googleapis.com\|fonts.gstatic.com" index.html dist/` | 0 everywhere | Windows | command (post-build; shared with M9). R82 re-asserts 0 occurrences on the live served page; see GC82 |
| GC38 | R38 | Given self-hosted fonts, when `src/main.jsx` and the build are checked, then exactly 12 `@fontsource` import lines exist and at least 12 `.woff2` files ship | `grep -c "@fontsource" src/main.jsx`; count `.woff2` files under `dist/assets/` | 12; >= 12 | Windows | command (post-build) |
| GC39 | R39 | Given the `@theme` tokens and the removed hard-coded stack, when the built CSS is read, then the built `body{}` rule's `font-family` value starts with `Inter`, and the rule no longer starts with `-apple-system` | Read the built `body{...}` rule directly (not a whole-file grep, since `@fontsource`'s own `@font-face` rules also declare `font-family:Inter` and would satisfy a bare `grep -c "font-family:Inter" dist/assets/*.css` on their own, proving nothing about what `body` actually uses) and assert its first `font-family` value is `Inter`; `grep -c "font-family:Inter" dist/assets/*.css` kept only as a necessary-but-not-sufficient existence check; `grep -c "\-apple-system" dist/assets/*.css` restricted to the `body{` rule | The built `body{}` rule's `font-family` starts with `Inter` (the load-bearing assertion); whole-file grep >= 1 (necessary, not sufficient alone); `body{}` rule does not start with `-apple-system` | Windows | command (post-build). This is the silent-failure trap the architect flagged: today Inter loads from Google and is applied to nothing (`src/index.css:22`, `src/App.jsx:50`, both confirmed) |
| GC40 | R40 | Given the site-wide reduced-motion block, when the built CSS is read, then a `prefers-reduced-motion` media query exists | `grep -c "prefers-reduced-motion" dist/assets/*.css` | >= 1 | Windows | command (post-build) |

### G. Personal data (R41-R44)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC41 | R41 | Given the phone number is deleted (not blanked), **and the now-unused `Phone` icon import is dropped from `ContactFooter.jsx` line 2 and `ResumeModal.jsx` line 2** (both confirmed present by the spec architect during this revision, because oxlint may fail the build on an unused import), when `src/`, `dist/` are grepped, then no trace remains | `grep -rn "508-1536" src/ dist/`; `grep -rn "personal.phone" src/`; `grep -rn "Phone" src/` | 0; 0; 0 | Windows | command (post-build; shared with M8) + `src/data/portfolioData.test.js` ("publishes no phone number") |
| GC42 | R42 | Given email and LinkedIn remain reachable, when `/`, `/work`, and a case-study page render, then both are present | RTL, assert a `mailto:` link and a LinkedIn `href` on all 3 | Present on all 3 | Windows | `src/components/SiteLayout.test.jsx` |
| GC43 | R43 | Given `personal.github`/`githubHandle` and each project's `repoPublic` flag, when `/work` renders, then a public project's card links to `https://github.com/muhibm1/<name>`; a private project's card shows "Private repository · walkthrough on request" with a mailto link to `personal.email` and no GitHub link; and, because `workhorse`, `Shu` and `wasl` are all currently marked private, every project card on the live data shows the note | RTL: a `repoPublic: true` fixture card has `getByRole('link', {name: /github/i})` with `href` `https://github.com/muhibm1/<name>`; a `repoPublic: false` fixture card has `queryByRole('link', {name: /github/i})` null, the note text present, and a `mailto:` link to `personal.email`; against the live `portfolioData.projects` (all three `repoPublic: false`), all three cards show the note and 0 GitHub links exist on `/work` | Public fixture: exact GitHub URL, no note; private fixture: note text, mailto link, no GitHub link; live data: 3 of 3 cards show the note, 0 GitHub links | Windows | `src/components/ProjectEntry.test.jsx` + `src/pages/WorkIndexPage.test.jsx` |
| GC44 | R44 | Given no analytics, cookie, storage call, tracking pixel, embedded widget, third-party script or new outbound runtime call anywhere, when `src/` and `index.html` are grepped with the **full** pattern from `docs/sdlc/constraints.md` line 208, then none of the nine named tokens appear | `grep -rn "fetch(\|XMLHttpRequest\|axios\|localStorage\|sessionStorage\|document.cookie\|gtag\|analytics\|dataLayer" src index.html` | 0 matches | Windows | command (shared with GC13, M10) |

### H. The simulator (R45-R48)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC45 | R45 | Given fictional data, when the simulator renders, then a visible "illustrative example, fictional" label appears next to the scenario list and again on the payload inspector | RTL, `getAllByText(/illustrative example/i).length >= 2` and `getAllByText(/fictional/i).length >= 1` | >= 2 occurrences of the first phrase, at least 1 of the second | Windows | `src/components/InteractiveTriageSimulator.test.jsx` |
| GC46 | R46 | Given the **three** `setTimeout` calls at `InteractiveTriageSimulator.jsx` lines 75, 79, 83 (confirmed by reading the file; corrects the carried "four" finding), when the component unmounts mid-run, or Reset is clicked mid-run, then no pending timers remain | Vitest fake timers: click Run, unmount before 1500ms elapses, assert `vi.getTimerCount() === 0`; separately click Run then Reset before completion, assert the same | 0 pending timers in both cases | Windows | `src/components/InteractiveTriageSimulator.test.jsx` |
| GC47 | R47 | Given the copy-confirmation timers at `Navbar.jsx:19`, `ContactFooter.jsx:12` **and `ResumeModal.jsx:12`** (all three confirmed, `setTimeout(() => setCopied(false), 2000)`, no cleanup today; the `ResumeModal` one was missed by the first draft and matters most, because `ResumeModal` is conditionally rendered and therefore unmounts on every close, so its pending callback fires on an unmounted component in ordinary use), when any of the three components unmounts before 2000ms, then no pending timer remains | Vitest fake timers, click copy, unmount early, `vi.getTimerCount() === 0`, once per component, **three tests total** | 0 pending timers, all three components | Windows | `src/components/Navbar.test.jsx` + `src/components/ContactFooter.test.jsx` + `src/components/ResumeModal.test.jsx` |
| GC48 | R48 | Given the three `navigator.clipboard.writeText` calls (`Navbar.jsx:17`, `ContactFooter.jsx:10`, `ResumeModal.jsx:10`), when the promise rejects, then the button shows a failed state, never "Copied" | Vitest mocks `writeText` to reject, clicks each copy button, asserts no "Copied" text renders | No "Copied" text, all 3 components | Windows | `src/components/Navbar.test.jsx` + `src/components/ContactFooter.test.jsx` + `src/components/ResumeModal.test.jsx`. Subject to **G2-D2**: deleted with R48 if the owner declines that decision, per `intent.md`'s non-goals sentence |

### I. Test toolchain (R49-R54)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC49 | R49 | Given every added package SHALL be exact-pinned in both `dependencies` and `devDependencies`, when `package.json` is read, then all **nine** named packages (`react-router`, `@fontsource/inter`, `@fontsource/jetbrains-mono`, `@fontsource/space-grotesk`, `vitest`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `jsdom`) carry no `^`, `~`, `>=`, `<`, `*`, `x`, tag, URL or git specifier | Two greps over `package.json`. First, `grep -c "\"\(react-router\|@fontsource/inter\|@fontsource/jetbrains-mono\|@fontsource/space-grotesk\|vitest\|@testing-library/react\|@testing-library/dom\|@testing-library/jest-dom\|jsdom\)\": \"[0-9]"` equals 9. Second, the same alternation followed by `": "[\^~><*x]` or `": "latest` returns 0 matches | 9; 0 | Windows | command (the same two greps R85 runs in CI on every push, so the pin cannot rot after G4; see GC85). The first version of this case checked only the five devDependencies; the runtime four now carry the same bar |
| GC91 | R49 | Given B3 (approved 2026-09-12) moved `tailwindcss` and `@tailwindcss/vite` from `dependencies` to `devDependencies` at exact `4.3.3`, when `package.json` and a local, production-scoped audit are read, then both packages appear under `devDependencies` with no range prefix, neither appears under `dependencies`, and the production-only audit exits clean | `grep -n "\"tailwindcss\": \"4.3.3\"" package.json`; `grep -n "\"@tailwindcss/vite\": \"4.3.3\"" package.json`; confirm both matched lines fall inside the `devDependencies` block and `grep -c "\"tailwindcss\"\|\"@tailwindcss/vite\"" ` restricted to the `dependencies` block returns 0; `npm audit --omit=dev --audit-level=high` | Both greps match `4.3.3` with no `^`/`~`; 0 matches inside `dependencies`; `npm audit --omit=dev --audit-level=high` exits 0 | Windows | command. Added by the 2026-09-12 B2/B3 amendment; this ID is a documented exception to the `GCn`-maps-to-`Rn` convention, the same exception `GC-CP` already uses, since it is a second golden case against R49 rather than a new requirement |
| GC50 | R50 | Given the `test` block in `vite.config.js`, when read, then it declares `environment: 'jsdom'`, `globals: true`, `setupFiles`, `css: false`, `restoreMocks: true`, and both `npm test` and `npm run build` still exit 0 | `grep` for each key; `npm test`; `npm run build` | All keys found; both exit 0 | Windows | command |
| GC51 | R51 | Given `package.json` scripts, when read, then `test` is `vitest run` and `test:watch` is `vitest`, both bare binary invocations | `grep -n "\"test\":\|\"test:watch\":" package.json`; `npm test` on Windows | Exact script bodies; exits 0 | Windows | command |
| GC52 | R52 | Given the build job **enforces** the test floor rather than leaving it to a human reading a summary line, when the workflow's test step runs `npm test -- --reporter=json --outputFile=vitest-results.json` and the step after it reads the file, then the run fails unless `numPassedTests >= 12` and `numPendingTests + numTodoTests + numFailedTests === 0`, naming the observed counts on failure | `grep -c "numPassedTests" .github/workflows/deploy.yml` >= 1; first workflow run's log shows the observed counts and, on failure, the counts named in the message; locally, `npm test` still reports `Tests N passed` with N >= 12 | Structural presence and local floor confirmed on Windows; CI enforcement confirmed on the first workflow run | Windows (structure + local run) + CI-only (enforcement) | command + CI-only confirmation. AD15 red-teams this check's own sensitivity to a skipped test |
| GC53 | R53 | Given `.workhorse/profile.yml`, when read, then `commands.test` is `npm test` and `commands.test_file` is `npm test --` | `grep -n 'test: "npm test"' .workhorse/profile.yml`; `grep -n 'test_file: "npm test --"' .workhorse/profile.yml` | Both found | Windows | command |
| GC54 | R54 | Given `src/test/setup.js`, when read, then it imports `@testing-library/jest-dom/vitest` and stubs `matchMedia`, `IntersectionObserver`, `HTMLCanvasElement.prototype.getContext` | `grep -c "jest-dom/vitest"`, `"matchMedia"`, `"IntersectionObserver"`, `"getContext"` in the file; `npm test` output grepped for `"Not implemented"` | All greps found; 0 "not implemented" warnings in the run | Windows | command + observed cleanly across every other Vitest file |

### J. Deploy pipeline (R55-R64, R80-R83, R85, R87)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC55 | R55 | Given exactly one workflow, when `.github/workflows/` is listed, then it contains 1 file triggered on `push` to `main` **only**, with `workflow_dispatch` **absent** (dropped as a second production-publish path this project deliberately does not offer an agent: `gh workflow run` is a profile `ask_command`, `git push origin main` is denied to agents outright, and re-running a failed deployment stays possible from the Actions UI, which re-runs the same commit rather than publishing a new one) | `ls .github/workflows \| wc -l`; `grep -c "workflow_dispatch\|pull_request" .github/workflows/deploy.yml`; `grep -A3 "^on:"` for `push` scoped to `branches: [main]` | Count = 1; second grep = 0; push scoped to `main` only | Windows (structure); YAML-validity itself is `manual`: no YAML parser is part of this project's toolchain by design, so a malformed file is confirmed only by GitHub's own parser refusing the first push | command + manual first-push confirmation |
| GC56 | R56 | Given the build job, when the workflow is read, then `npm ci`, `npm run lint`, `npm test`, `npm run build`, `npm audit --audit-level=high --omit=dev` appear in that order | `grep -n` each command, compare line numbers ascending | Strictly ascending order | Windows (static order); "non-zero exit stops the deploy" is `CI-only`, confirmed on the first workflow run | command + CI-only confirmation |
| GC57 | R57 | Given the non-blocking full-tree audit, when the workflow is read, then a second `npm audit --audit-level=high` step (no `--omit=dev`) is paired with `continue-on-error: true` | `grep -A2 "npm audit --audit-level=high\"$" .github/workflows/deploy.yml` (the line with no `--omit=dev` suffix) for the following `continue-on-error: true` | Present, paired | Windows | command |
| GC58 | R58 | Given the official Pages flow, when the workflow is read, then it uses `actions/configure-pages`, `actions/upload-pages-artifact` with `path: dist`, `actions/deploy-pages`, in two jobs, the second bound to `environment: github-pages` | `grep` for each action name and for `environment: github-pages` | All present | Windows | command |
| GC59 | R59 | Given SHA-pinning, when every `uses:` line is read, then each is pinned to exactly a 40-character commit SHA (not 39, not 41 or more hex characters) with a trailing tag comment | `total=$(grep -c "uses:" .github/workflows/deploy.yml); pinned=$(grep -cE "uses: .*@[0-9a-f]{40}([[:space:]]|$)" .github/workflows/deploy.yml); [ "$total" = "$pinned" ]` (the boundary after `{40}` requires the hex run to end in whitespace or end-of-line, so a 41-character SHA no longer matches on its first 40 characters, which the unanchored first-draft regex missed) | Equal counts | Windows | command |
| GC60 | R60 | Given least-privilege permissions **declared per job, not workflow-wide**, when the workflow is read, then the workflow-level block is exactly `permissions: contents: read`; the build job additionally declares `contents: read` and `pages: read` and calls `actions/configure-pages` with `enablement: false`; the deploy job declares `pages: write` and `id-token: write` only, and no job holds `write-all` | `grep -n -A4 "permissions:" .github/workflows/deploy.yml` shows three blocks in that shape; `grep -c "write-all"` is 0; `grep -c "id-token: write"` is 1 and sits inside the deploy job | Three-block shape confirmed; 0; 1 inside the deploy job | Windows | command. Whether `actions/configure-pages` in the build job needs more than `pages: read` with `enablement: false` is **believed, not verified**; if the first run disagrees, the spec's named remedy is to move the action into the deploy job, not widen the build job's scope |
| GC61 | R61 | Given serialized deploys, when the `concurrency:` block is read, then it is `group: pages`, `cancel-in-progress: false` | `grep -c "group: pages" .github/workflows/deploy.yml` is 1; `grep -c "cancel-in-progress: false" .github/workflows/deploy.yml` is 1 | Both counts 1 | Windows | command |
| GC62 | R62 | Given `actions/setup-node`, when its step is read, then `node-version: 22` and the npm cache are both set | `grep -A3 "actions/setup-node" .github/workflows/deploy.yml` | `node-version: 22` (or `'22'`) and `cache: npm` (or `cache: 'npm'`) both present | Windows | command |
| GC63 | R63 | Given the smoke step, when the workflow is read, then a post-deploy step fetches `${{ steps.deployment.outputs.page_url }}` with `curl`, fails unless the HTTP status is 200, retries up to 5 times at 10-second intervals, and saves the fetched body to a file for R80-R82 to assert against. **The "body contains the owner's name" assertion of the first draft is removed**: `index.html` lines 6 and 7 (the `<title>` and description meta) already contain the owner's name, so that assertion passed on an un-executed shell and proved nothing | `grep -A10 "deployment.outputs.page_url" .github/workflows/deploy.yml` for the retry loop and the body-save step; confirms no name-content assertion remains anywhere in the smoke step | Static structure present; no owner's-name check found | Windows (structure); actual pass/fail against the live URL is `CI-only`, requires the owner's first push | command + CI-only first-run confirmation |
| GC64 | R64 | Given no secrets, when the workflow is read, then it references none | `grep -c "secrets\." .github/workflows/deploy.yml` | 0 | Windows | command |
| GC80 | R80 | Given the smoke step parses every `src=` and `href=` asset reference out of the R63 fetched body, when it runs, then each parsed path begins `/Portfolio/`, and the module script URL, the stylesheet URL, and the first `.woff2` referenced by that stylesheet each return 200 with a `content-type` naming JavaScript, CSS and a font respectively | First workflow run: the step logs each parsed URL and its status and content-type; `grep -n "\.woff2\|content-type"` on the workflow confirms the step exists | Every asset path begins `/Portfolio/`; script, stylesheet and woff2 all return 200 with the expected content-type | Windows (structure); live assertion is `CI-only`, requires the first push | command (structure) + CI-only (live assertion). EG22 exercises the parser's own edge cases |
| GC81 | R81 | Given the smoke step fetches `<page_url>work/apple-llm-triage`, when it compares that body against the R63 root body, then they are byte-identical, and the request's HTTP status (404 by design) is **not** asserted as 200 | First workflow run: the step computes SHA-256 of both bodies and compares; `grep -c "apple-llm-triage"` on the workflow confirms the deep-link path is used | Digests match; no status-200 assertion applied to this request | Windows (structure) + CI-only (live comparison) | command (structure) + CI-only (live comparison). FL21 cross-references FL5 for the build-time analogue |
| GC82 | R82 | Given the smoke step asserts, against the R63 body: exactly one `Content-Security-Policy` meta; exactly one `name="referrer"` meta; zero `<script` elements without `src`; zero `fonts.googleapis.com`/`fonts.gstatic.com`; and, against both the R63 body and the R80 fetched module script, zero matches of a generic phone-number pattern built from `[0-9]{n}` character classes (the same shape `src/data/portfolioData.test.js` uses), never the owner's literal digits, when it runs, then every assertion passes and each logs its own pass/fail line | First workflow run log; each of the five sub-assertions traced to a logged line (the phone-pattern one logs once per file checked). Structural half: `grep -n "phone_pattern=" .github/workflows/deploy.yml` confirms the generic character-class pattern is defined; `grep -oE "[0-9]{3,}" .github/workflows/deploy.yml` confirms 0 runs of three or more consecutive literal digit characters exist anywhere in the file, since the pattern definition itself uses single digits inside `{}` quantifiers, never a consecutive run, so this check never names or requires the owner's actual number | All five pass, each independently logged; phone-pattern grep matches the character-class definition; digit-run grep returns 0 | Windows (structure) + CI-only (live assertions) | command (structure) + CI-only (live assertions). AD16 red-teams the inline-script sub-assertion with the same fixture as AD11 |
| GC83 | R83 | Given the smoke step is blocking, when the workflow is read, then no `continue-on-error` appears on any smoke sub-step, and the file's single `continue-on-error: true` occurrence belongs to R57's informational full-tree audit; each smoke assertion's failure message names the assertion and the URL fetched | `grep -c "continue-on-error" .github/workflows/deploy.yml` is 1; the surrounding lines identify it as the R57 audit step, not a smoke step | Count = 1, located on the R57 audit step only | Windows | command |
| GC85 | R85 | Given a dependency-pin check runs before `npm ci`, when the workflow is read, then a `node -e` step reads `package.json` and fails the run when any of the nine R49 packages carries a range specifier, a tag, a URL or a git specifier, naming the offending package and specifier | `grep -c "pin check\|assertExactPins" .github/workflows/deploy.yml` >= 1; the step's position in the file is before the `npm ci` line; first workflow run's log shows the nine packages and their resolved specifiers | Step present and ordered before `npm ci`; run log lists all nine | Windows (structure) + CI-only (live confirmation) | command + CI-only confirmation. AD14 red-teams this check with a caret reintroduced on one package |
| GC87 | R87 | Given the smoke step also dumps response headers, when `curl -sSI` runs against the published URL, then the headers print to the run log, and the step does not fail on a missing header; the owner then copies that list into `docs/hosted-config.md` after the first successful run | `grep -n "curl -sSI\|curl.*-I "` on the workflow confirms the header-dump step exists and carries no failure condition on a missing header; first workflow run log contains the header dump; `docs/hosted-config.md` contains the copied list after the first deploy | Header dump present in the log with no header treated as required; `docs/hosted-config.md` updated post-deploy | Windows (structure) + CI-only (header dump) + manual (owner's copy into hosted-config.md) | command (structure) + CI-only + manual |

### K. Security baseline defaults (R65-R69)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC65 | R65 | Given the build-only CSP injection **and the paired `Referrer-Policy` injection required by R88, from the same `transformIndexHtml` step**, when `dist/index.html`, `dist/404.html`, and source `index.html` are read, then both meta tags are present in the built files only | `grep -c "Content-Security-Policy" dist/index.html dist/404.html`; `grep -c "Content-Security-Policy" index.html`; `grep -c 'name="referrer"' dist/index.html dist/404.html index.html` | 1, 1; 0; 1, 1, 0 | Windows | command (post-build). Subject to **G2-D2**: dropped together with R88 if the owner declines. R82 re-asserts the CSP-meta count live; see GC82 |
| GC66 | R66 | Given `script-src 'self'`, when `dist/index.html` is read, then no inline `<script>` without a `src` attribute exists, and **no `sha256-` hash appears anywhere, because that remedy is explicitly withdrawn** (a hash stops matching on any Vite patch bump, the symptom is a blank page in production only, and Dependabot will propose exactly such bumps with nothing to re-check it) | grep/small parse for `<script` tags lacking `src=`; `grep -c "sha256-" dist/index.html` | 0 matches; 0 | Windows | command (post-build). This is the highest-value trap the architect flagged: Vite's inline module-preload polyfill would otherwise blank the page in production only. R82 re-runs the same "no inline script" assertion against the served page on every deploy; see GC82, AD16 |
| GC67 | R67 | Given `security.txt`, when `dist/.well-known/security.txt` is read, then `Contact`, `Expires`, `Preferred-Languages`, `Canonical` all appear | `grep -c "^Contact:\|^Expires:\|^Preferred-Languages:\|^Canonical:" dist/.well-known/security.txt` | File exists; all 4 fields present | Windows | command (post-build). Subject to **G2-D2**: dropped if the owner declines |
| GC68 | R68 | Given Dependabot, when `.github/dependabot.yml` is read, then weekly `npm` and `github-actions` ecosystems exist, each carrying its own `open-pull-requests-limit: 5` | `grep -c "package-ecosystem: \"npm\""` = 1; `grep -c "package-ecosystem: \"github-actions\""` = 1; `grep -c "open-pull-requests-limit: 5"` = 2 (once per `package-ecosystem` entry, since Dependabot scopes the key per ecosystem block, not once file-wide as the first draft expected) | Both ecosystem greps = 1; limit grep = 2 | Windows (structure); full YAML-validity `manual` for the same reason as GC55 | command + manual confirmation. Subject to **G2-D2**: dropped if the owner declines |
| GC69 | R69 | Given `docs/hosted-config.md`, when read, then it names **all seven** required items: Pages source set to "GitHub Actions"; repository visibility; which branch protections on `main` are enabled and which are deliberately not, with the reason; the absence of any Actions secret; the response headers GitHub Pages sets, copied from R87's first run; the dated post-deploy manual check log under R84; and the accepted position on the phone number in git history under R89. **This requirement is unconditional and is explicitly outside G2-D2**, unlike R65, R67, R68 and R88: the first deploy fails without the Pages source setting alone, which the risk register rates Likely | `grep -c "GitHub Actions"`, `"visibility"`, `"branch protection"`, `"secret"` in the file, plus checks for header-dump text, a dated-line pattern, and phone-number-position text: seven checks total | All 7 present | Windows | command |

### L. Cleanup and toolchain repair (R70-R73)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC70 | R70 | Given the orphan Windows-only binding is removed, when `package.json` is read, then no trace remains | `grep -c rolldown package.json` | 0 | Windows | command |
| GC71 | R71 | Given a clean reinstall, when `npm run lint` runs afterward, then it exits 0, **and R86's before-and-after table of all 11 direct dependencies exists in the G4 evidence, with any major-version move escalated to the owner before the commit** | `npm run lint` | Exit 0; R86's table present with a stated verdict on every row that moved | Windows, **but only after the owner approves the `npm install` ask_command**; the eval runner cannot trigger that reinstall itself | command; prerequisite is manual (owner-approved install); R86's table is separately manual evidence, see GC86 |
| GC72 | R72 | Given `generate_viewer.cjs` is removed via `git rm`, when `git ls-files` is read, then no match remains | `git ls-files \| grep -c generate_viewer` | 0 | Windows | command |
| GC73 | R73 | Given `.gitignore` uses the pattern, not an enumeration, when read, then `.env*` appears once and no tracked env file exists | `grep -c "^\.env\*" .gitignore`; `git ls-files \| grep -cE "^\.env"` | 1; 0 | Windows | command |

### M. Non-functional and platform (R74-R78)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC74 | R74 | Given the build must succeed on both hosts, when `npm run build` runs, then it exits 0 on Windows and on the first `ubuntu-latest` Actions run | `npm run build` (Windows); read the first run's `build` step conclusion (CI) | Exit 0 both places | Windows (local half) + CI-only (ubuntu half) | command + first workflow run |
| GC75 | R75 | Given no shell builtins in scripts, when `package.json` `scripts` is read, then none contains `&&`, a POSIX-only separator, or a shell builtin | `node -e "const s=require('./package.json').scripts; Object.values(s).forEach(v=>{if(/&&\|\|\||\/bin\//.test(v)) throw new Error(v)})"` | Exits 0 | Windows | command |
| GC76 | R76 | Given `build.max_parallel: 4`, and the requirement is now explicitly stated to be about the **configured value and the wave shape**, artifacts both, and deliberately not a claim about what the conductor did at run time (a runtime property no single file records), when `.workhorse/profile.yml` and the [Build waves](#build-waves) table are read, then the value is present and each of the 4 waves is file-disjoint within itself | `grep -n "max_parallel: 4" .workhorse/profile.yml`; review of the 4-wave table for file-disjointness | Found; each wave file-disjoint | Windows | command |
| GC77 | R77 | Given every added package, **including the three `@fontsource` packages** (the first draft's carve-out for them is withdrawn: a pin that resolves to a different version now escalates exactly like one that fails to resolve at all), when the G4 evidence table is reviewed, then it has one row per added package with a version resolved from `node_modules/<pkg>/package.json` and a licence read the same way, plus an explicit escalation line for any package whose resolved version differs from the [Dependency table](#dependency-table) | Manual review of 9 rows: `react-router`, `@fontsource/inter`, `@fontsource/jetbrains-mono`, `@fontsource/space-grotesk`, `vitest`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `jsdom` | 9 rows, each with a resolved version and licence; an escalation line on any mismatch | **manual, and permanently so, accepted explicitly in R77's own row**: reading a licence field requires an owner-approved `npm install` before any version/licence can be read from disk, and the table is authored and reviewed by people. Owner: build phase, reviewed by the site owner at G4. Not a gap | G4 evidence table |
| GC78 | R78 | Given B3 (approved 2026-09-12, `a98fdcf`) moved `tailwindcss` and `@tailwindcss/vite` from `dependencies` to `devDependencies` after R78 added them, when `package.json` is read, then the final section membership and counts match: exactly 8 `dependencies`, exactly 12 `devDependencies`, `@rolldown/binding-win32-x64-msvc` absent from both, and `tailwindcss`/`@tailwindcss/vite` present in `devDependencies` and absent from `dependencies`. **Lockfile-level drift is explicitly out of this requirement's reach and is governed by R86, not R78** | `node -e "const p=require('./package.json'); const d=Object.keys(p.dependencies), v=Object.keys(p.devDependencies); const errs=[]; if(d.length!==8) errs.push('dependencies='+d.length+' expected 8'); if(v.length!==12) errs.push('devDependencies='+v.length+' expected 12'); if(d.includes('@rolldown/binding-win32-x64-msvc')) errs.push('rolldown present in dependencies'); if(v.includes('@rolldown/binding-win32-x64-msvc')) errs.push('rolldown present in devDependencies'); if(!v.includes('tailwindcss')) errs.push('tailwindcss missing from devDependencies'); if(d.includes('tailwindcss')) errs.push('tailwindcss present in dependencies'); if(!v.includes('@tailwindcss/vite')) errs.push('@tailwindcss/vite missing from devDependencies'); if(d.includes('@tailwindcss/vite')) errs.push('@tailwindcss/vite present in dependencies'); if(errs.length){console.error('dependencies='+d.length+' devDependencies='+v.length); console.error(errs.join('; ')); process.exit(1);}"` | Exits 0 (8 `dependencies`, 12 `devDependencies`, today's baseline confirmed by reading `package.json`); on any mismatch the command prints the actual counts and every failed assertion before exiting 1, rather than a bare non-zero exit | Windows | command; R86 covers the transitive/lockfile drift this check cannot see, see GC86. **Rewritten by the 2026-09-12 "GC78 final dependency-count correction" amendment**, replacing the withdrawn fixed "10 and 10" expectation that the verifier found failing at commit `cf969de` (actual: 8 and 12). See that amendment section and the superseded note in the B2/B3 amendment section, both above |

### N. Visual style (R79)

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC79 | R79 | Given the OFF+BRAND treatment (0px card radius, 10px on interactive elements, no shadows, one chromatic element), when `src/components/` is grepped, then no `shadow-` utility class remains, **if G2-D4 resolves in favour of the design brief over the mockups** | `grep -rc "shadow-" src/components/` | 0, **conditional on G2-D4's resolution**; if G2-D4 instead favours the mockups' rounded/shadowed look, this check does not apply and the eval runner must read the recorded G2-D4 decision before running it | Windows, conditional | command, contingent on G2-D4 |
| GC79v | R79 | Given the Varick card pattern (title, context paragraph, capability bullets, link) and the OFF+BRAND palette, when the home case-study cards render in a browser, then they match `docs/design-brief.md` lines 25-42 | Manual visual review | Reviewer confirms | manual: palette/type fidelity, no browser rendering in the toolchain | G4 design review |

### O. Deploy documentation, dependency evidence and audit hygiene (R84, R86, R88, R89, R90)

R80-R83, R85, R87 sit with the deploy pipeline in section J, matching where they run in the
spec. The five below have no other home there, matching the spec's own section O.

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| GC84 | R84 | Given `docs/hosted-config.md` carries a "Post-deploy manual check" section, when read, then it lists the four items no automated step this project runs can prove: the home page renders content inside `#root` in a real browser; the orb animates and stops when the tab is hidden; a deep link pasted into a fresh tab renders the case study; the browser console shows no CSP violation and no uncaught error. After the first deploy, and after any later change to `vite.config.js`, `index.html` or `package.json`, the owner appends a dated line | `grep -c` for each of the four item phrases in the file, four checks; after the first deploy, a human confirms at least one dated line exists | All 4 items present; >= 1 dated line after the first deploy | **manual**: this is the compensating control for the one failure class nothing else in this spec can detect, a runtime mount exception (see [Observability](#observability), R90, FL23); there is no browser in CI and Playwright was rejected on cost | owner, post-deploy, dated line in `docs/hosted-config.md` |
| GC86 | R86 | Given the lockfile regeneration (R71) re-resolves every existing caret range, when the G4 evidence table is reviewed, then it has a before-and-after row for each of the **11 direct dependencies that survive the regeneration** (the 6 `dependencies` and 5 `devDependencies` that are neither newly added nor the one removed: today's 7 `dependencies` plus 5 `devDependencies`, minus `@rolldown/binding-win32-x64-msvc`), with an explicit escalation line on any row whose **major** version moved | Manual review: 11 rows, each with a pre-regeneration and post-regeneration resolved version, and a stated verdict on any row that moved a major version | 11 rows present with both versions; escalation line present on any major move, absent otherwise | **manual**: requires the owner-approved `npm install` and reading the pre- and post-regeneration lockfiles; evidence-gathering for a human-reviewed table, not a pass/fail command | G4 evidence table |
| GC88 | R88 | Given the same `transformIndexHtml` step that injects the CSP (R65) also injects `<meta name="referrer" content="strict-origin-when-cross-origin">`, when `dist/index.html`, `dist/404.html` and source `index.html` are read, then the referrer meta is present in both built files and absent from source | `grep -c 'name="referrer"' dist/index.html dist/404.html`; `grep -c 'name="referrer"' index.html` | 1, 1; 0 | Windows | command (post-build; shared with GC65). Subject to **G2-D2**: dropped with R65, R67, R68 if the owner declines |
| GC89 | R89 | Given the phone number survives in the working tree only where a machine check needs it as a literal or where it is part of an approved decision record, when wave 4 completes, then `docs/sdlc/constraints.md` line 102 and `intent.md` line 199 read `(512) 508-xxxx` with a one-line note that the digits were removed under G1-D1 and where the live check now lives, and a repository-wide grep for the full number, excluding `.git`, `node_modules`, `.worktrees` and any nested directory literally named `worktrees` (covers `.claude/worktrees`, the agent tool's worktree location, **confirmed** by directory listing: several such worktrees exist today and each holds a full pre-change copy of `spec.md` and `evals.md`), matches only `spec.md`, `evals.md`, and this change's `intent.md`. `evals.md` legitimately carries the digits in its own check definitions (GC41, this row, NF8, and the failure-taxonomy row; GC82 no longer names the literal as of the 2026-09-12 wave 4 amendment, see above). `intent.md` legitimately carries the digits at line 152 (the M8 success-metric row, a check literal in the same role `evals.md` plays) and at line 311 (the G1 D1 decision row the owner approved); neither line was named for redaction by R89, `plan.md`, or the G3 packet, and this amendment does not ask for either to change | `grep -rln "508-1536" --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.worktrees --exclude-dir=worktrees .` | Exactly three files match: `spec.md`, `evals.md`, and `intent.md` | Windows | command, run after wave 4. **This amendment adopts option (a) from the wave 4 finding: adding `intent.md` to the expected set, because it changes no approved artifact and follows the precedent of `evals.md` being added at the earlier G3 amendment. Option (b) — asking the owner to authorise redacting the approved G1 D1 text and the M8 metric row in `intent.md` — remains open to the owner at G4.** |
| GC90 | R90 | Given no requirement SHALL claim a detection capability the check named beside it does not have, when the re-audit or the G4 conformance reviewer reads [Observability](#observability), [Failure modes](#failure-modes) and the [Risk register](#5-risk-register) side by side with every requirement's acceptance-check column, then every claimed detection traces to a check that actually performs it, and every undetectable failure mode is named as an accepted risk with a named owner rather than credited to a step that cannot see it | Manual cross-reference review, spot-checked against the specific over-crediting pattern audit High finding 1 found (a `curl` step credited with checking DOM content or an owner's name): confirm R63 and R80-R83 are cited only for what they assert, and R84 is cited for the rest | 0 requirements found crediting an undetectable capability | **manual: a cross-artifact consistency property, not a single file or command.** Both the constraint auditor's re-audit and the G4 conformance reviewer are positioned to check it; either finding a violation blocks its gate | re-audit (G2) and conformance review (G4) |

### Content preservation (R18 / M17)

| ID | Req/Metric | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|------------|----------|--------------|----------|--------------|----------------|
| GC-CP | R18, M17 | Given `src/data/portfolioData.js` is extended, not rewritten, when the diff is reviewed, then only additive keys appear and every existing string below is unchanged, verbatim | Manual diff review (`git diff src/data/portfolioData.js`, or a before/after file comparison if no git history exists) against this checklist: `personal.name` "Muhammad Muhibullah"; `personal.role` "Forward Deployed Engineer & Systems Integration"; `personal.subtitle` "Data Engineer at Apple (via TCS) · Austin, TX"; `personal.location` "Austin, TX"; `personal.linkedin` "https://www.linkedin.com/in/muhibm1/"; `personal.linkedinHandle` "linkedin.com/in/muhibm1"; `personal.status` "Available for Forward Deployed Engineering & Solutions Eng Roles"; all 4 `telemetry` entries (metric/unit/label/context); all 3 `caseStudies` id/title/client/role/period; all 3 `experience` company/role/period/location; both `education` degree/institution/graduation | Every listed string present unchanged; `personal.phone` deleted (R41); only `projects`, `demos`, `workIntro`, `personal.github`, `personal.githubHandle` are new | manual: the narrow subset (telemetry, case-study ids/titles) is separately automated in GC18; the full breadth named by M17 (dates, employers, roles, degrees) is a semantic "nothing rephrased" judgment a diff tool cannot make on its own, since a rewritten sentence would still be a valid string, just a different one | G4 evidence table |

## 3. Edge cases

Boundaries, ordering, concurrency, and idempotency on the app's real interfaces: the URL
(slug and hash), the viewport, timers, device pixel ratio, and the smoke step's own
asset-parsing logic (R80).

| ID | Req | Scenario | Exact check | Expected | Automatable | Implemented as |
|----|-----|----------|--------------|----------|--------------|----------------|
| EG1 | R2 | Given `BASE_URL` is exactly `/` or has a doubled trailing slash `/Portfolio//`, when the helper runs, then it still returns a clean value | `computeBasename('/')`; `computeBasename('/Portfolio//')` | `'/'`; `'/Portfolio'` (all trailing slashes stripped) | Windows | `src/basename.test.js` |
| EG2 | R21 | Given a slug with a trailing slash, `/work/apple-llm-triage/`, when it renders, then the app's actual matching behaviour (match or `NotFoundPage`) is pinned, not assumed | RTL render, assert whichever heading the router actually produces | One consistent, asserted outcome (no flapping between runs) | Windows | `src/routes.test.jsx` |
| EG3 | R21 | Given slugs are case-sensitive, `/work/Apple-LLM-Triage` (wrong case), when it renders, then it does not match | RTL render, assert `NotFoundPage` heading | `NotFoundPage` | Windows | `src/components/CaseStudyPage.test.jsx` |
| EG4 | R21 | Given a URL-encoded space slug, `/work/%20`, when it renders, then it does not throw | RTL render | `NotFoundPage`, no exception | Windows | `src/components/CaseStudyPage.test.jsx` |
| EG5 | R8 | Given a hash with no matching element, `/#nonexistent-id`, when `HomePage` mounts, then it does not call `scrollIntoView` and does not throw | RTL render, spy `scrollIntoView` | 0 calls, no exception | Windows | `src/pages/HomePage.test.jsx` |
| EG6 | R8 | Given a unicode hash, `/#\u65e5\u672c\u8a9e`, when `HomePage` mounts, then it does not throw | RTL render | No exception | Windows | `src/pages/HomePage.test.jsx` |
| EG7 | R20 | Given the filter cycles through all 4 values and back to All, when done, then the article count returns to 7 and the original order (case studies, then projects, then the demo) is preserved | RTL click sequence, recount and reorder-check after each click | 7 at the end, stable relative order | Windows | `src/pages/WorkIndexPage.test.jsx` |
| EG8 | R24 | Given `diagramSteps` arrays of length 1 and length 6 (stubbed data, since all 3 real case studies happen to have length 4), when the diagram renders, then the node count still equals the array length | Vitest renders the diagram sub-component with stub props | Node count 1 and 6 respectively | Windows | `src/components/CaseStudyPage.test.jsx` |
| EG9 | R25 | Given a middle case study (`apple-data-health`), when it renders, then both "previous" and "next" point at its immediate neighbours, not wrapped | RTL, assert both link hrefs | `apple-llm-triage` (previous), `neural-newsletters-llm` (next) | Windows | `src/components/CaseStudyPage.test.jsx` |
| EG10 | R31 | Given the boundaries the now-explicit clamp formula pins, when `canvasWidthForViewport` is called at 1024, 320, and 468 (the boundary between the flat 420px plateau and the `viewportWidth-48` slope), then it returns 420, 280 and 420 respectively; separately, a render test sets the viewport to exactly 1024px and exactly 320px and reads `canvas.style.width` | Vitest calls the pure helper at 1024, 320, 468; separately sets `window.innerWidth` to 1024 then 320, reads `canvas.style.width` | `420`, `280`, `420` (helper); `'420px'`, `'280px'` (render) | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| EG11 | R32 | Given `matchMedia`'s `change` event fires mid-session (no-preference to reduce), when it fires, then the orb switches from animating to a single static frame without unmounting | Vitest mounts with no preference, spies `requestAnimationFrame`, fires the mocked `change` event, asserts no further `requestAnimationFrame` calls after the event | Animation stops live, no remount needed | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| EG12 | R34 | Given an animation frame is scheduled but has not yet fired, when the component unmounts, then the pending callback is cancelled and never executes a paint after unmount | Vitest schedules a frame, unmounts, manually invokes the captured callback id, asserts no canvas draw call occurs | No post-unmount paint | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| EG13 | R36 | Given `devicePixelRatio` is `0` (falsy) or `3` (above the cap), when the orb mounts with `size=420`, then the backing store is `420` (falls back to 1) and `840` (clamped to 2) respectively | Vitest stubs each value, reads `canvas.width` | `420`; `840` | Windows | `src/components/ThinkingOrbHero.test.jsx` |
| EG14 | R46 | Given Run is clicked and the component unmounts at `t=0`, before the first 400ms timeout fires, when unmount happens, then 0 timers remain | Vitest fake timers, click Run, unmount immediately, `vi.getTimerCount() === 0` | 0 | Windows | `src/components/InteractiveTriageSimulator.test.jsx` |
| EG15 | R47, R48 | Given a rapid double-click on a copy button within the same tick, when both clicks register, then only one pending timeout remains (not two overlapping) and the component still clears to 0 timers on unmount | Vitest fake timers, fire `click` twice synchronously, assert `vi.getTimerCount() === 1` immediately after, then unmount and assert 0 | 1 then 0 | Windows | `src/components/Navbar.test.jsx` + `src/components/ContactFooter.test.jsx` |
| EG16 | R18, R25 | Given `caseStudies` array order, when read across renders (the `/work` index and the prev/next chain), then the order is stable: `apple-llm-triage`, `apple-data-health`, `neural-newsletters-llm` | RTL, assert DOM order in both surfaces matches this sequence | Stable order in both places | Windows | `src/pages/WorkIndexPage.test.jsx` + `src/components/CaseStudyPage.test.jsx` |
| EG17 | R59 | Given the anchored pinning regex (`@[0-9a-f]{40}([[:space:]]|$)`) must not be fooled by an off-by-one, when a `uses:` line carries a 39-character or a 41-character hex string in the SHA position, then the check correctly reports it as **not** pinned in both cases | Construct two fixture lines, one with a 39-character hex suffix and one with a 41-character hex suffix, each followed by a space and a `# tag` comment as the real file's lines are; run GC59's anchored regex against each | 0 matches for both fixtures: the 39-character case fails because there is no 40th hex character before the boundary; the 41-character case fails because the anchor now requires whitespace or end-of-line immediately after the 40th hex character, which the unanchored first-draft regex missed (it matched the first 40 of the 41 characters) | Windows | command (test fixture, not the live workflow file) |
| EG18 | R55 | Given the `push` trigger is scoped, when the workflow is read, then it triggers on `main` only, not on tags or other branches, and not on `workflow_dispatch` or `pull_request` | `grep -A5 "on:" .github/workflows/deploy.yml` for `branches: [main]` or equivalent scoping under `push:`; `grep -c "workflow_dispatch\|pull_request"` | Scoped to `main`; second grep = 0 | Windows | command |
| EG19 | R67 | Given `Expires` is "one year from the build date", when the build date is a leap day (`2028-02-29`), then the computed date is still valid (does not throw or produce `2029-02-29`, which does not exist) | Vitest or a small Node check calling the builder's date-math function (once it exists) with a mocked system date of `2028-02-29` | A valid ISO date is produced, no exception | Windows, once the generator is unit-testable; otherwise manual | command (depends on the builder's implementation shape) |
| EG20 | R73 | Given the pattern `.env*`, when hypothetical filenames are checked, then `.env`, `.env.local`, and `.env.production` are all ignored consistently | `git check-ignore --no-index .env .env.local .env.production` (no files are created) | All three reported as ignored | Windows | command |
| EG21 | R12 | Given the build should be idempotent, when `npm run build` runs twice in a row with no source changes, then `dist/index.html` is byte-identical both times | `npm run build; sha256sum dist/index.html \| cut -d" " -f1 > h1.txt; npm run build; sha256sum dist/index.html \| cut -d" " -f1 > h2.txt; diff h1.txt h2.txt` | No diff output (identical hash) | Windows | command |
| EG22 | R80 | Given the smoke step's asset parser encounters a query-string asset reference (`/Portfolio/assets/index-abc123.js?v=2`) or a protocol-relative URL (`//example.com/script.js`) in the fetched body, when it parses `src=`/`href=` attributes, then the query-string case still resolves to a path beginning `/Portfolio/` (matched up to, or stripped at, the `?`) and the protocol-relative case is correctly flagged as **not** beginning `/Portfolio/` | Construct a fixture body string containing both patterns, run R80's parsing logic (once written, either a small pure function or the same pattern the workflow step uses) against the fixture instead of a live page | Query-string asset passes the `/Portfolio/` prefix check; protocol-relative asset fails it | Windows (fixture test of the parser logic, not the live page) | command (test fixture) |

## 4. Failure cases

One case per row of the spec's own failure-modes table (`spec.md` lines 830-853), plus the
value each adds beyond that table's own "Handling" column.

| ID | Req | Failure | Handling asserted | Exact check | Expected | Automatable |
|----|-----|---------|--------------------|--------------|----------|--------------|
| FL1 | R55, R58 | npm registry slow or down, `npm ci` times out in CI | Deploy job never runs because the build job it `needs:` failed; last good deployment stays live | Read the first run where this occurred: build job status `failure`, deploy job status `skipped` | Deploy job skipped, not run with a broken artifact | CI-only |
| FL2 | R70 | `@rolldown/binding-win32-x64-msvc` still present, `npm ci` fails on Linux with `EBADPLATFORM` | R70 removes it before the first CI run | Preventive: GC70's grep (0 matches). Confirmatory: first `ubuntu-latest` run's install step succeeds | 0 matches (Windows); install step succeeds (CI) | Windows (preventive) + CI-only (confirmatory; `EBADPLATFORM` cannot be reproduced on the Windows host) |
| FL3 | R71 | `package-lock.json` out of sync with `package.json`, `npm ci` fails | R71 commits the regenerated lockfile in the same commit | `npm ci` on the Windows host using the committed lockfile | Exits 0 (proxy for "in sync"); full confirmation is the first `ubuntu-latest` run | Windows (proxy) + CI-only (final confirmation) |
| FL4 | R11, R80 | Wrong `base`, site serves with no CSS or JS | The GC11 asset-path grep must actually catch this class of defect at build time, and R80 must catch it live | Build once with `base: "/"` deliberately (a red-team build in a scratch copy), run the GC11 grep against that output | `grep -c '"/assets/' dist/index.html` > 0, proving the check is sensitive to this exact failure | Windows |
| FL5 | R12, R81 | `dist/404.html` missing or stale relative to `dist/index.html` | R12's `closeBundle` copy step, verified at build time by GC12's hash comparison, and live by R81's byte-identical body comparison | After a build, modify `dist/index.html` in place (simulate drift) without re-running the copy step, then run GC12's hash comparison | Hash comparison correctly reports a mismatch | Windows |
| FL6 | R2 | `basename` keeps its trailing slash: the bare `/Portfolio` address renders nothing, not every route | R2's tested helper strips the trailing slash before `BrowserRouter` sees it; without that, react-router 7.18.3's `stripBasename` still tolerates a trailing slash on paths *past* the basename (so `/Portfolio/work` still resolves), but has no route for the basename alone while it still carries the slash | Vitest's "Pages base path" suite (`src/routes.test.jsx`) mounts the router three ways: (1) raw, unstripped `'/Portfolio/'` as `basename`, rendering the bare `/Portfolio` path; (2) the same raw basename, rendering `/Portfolio/work`; (3) `computeBasename('/Portfolio/')` as `basename`, rendering the bare `/Portfolio` path | (1) Empty DOM and a `console.warn` containing "won't render anything"; (2) the work index still renders (`Work` heading), showing the unstripped basename does not send every route to `NotFoundPage`; (3) the home page renders once the helper strips the slash, contrasted against (1) to show why R2's helper is load-bearing at the bare address specifically | Windows |
| FL7 | R65, R66, R82 | Vite injects an inline module-preload polyfill script, CSP blocks it, blank page in production only | GC66's grep is the build-time preventive check; R82 re-asserts "no inline script" live on every deploy; jsdom does not enforce CSP, so no unit test can prove a real browser boots correctly under the injected policy | GC66 grep (preventive); separately, load `dist/index.html` via a local static file server in an actual browser (or the deployed URL) and confirm no CSP violation in the console | 0 inline scripts without `src` (Windows); 0 live (CI-only, R82); no console CSP violation (manual) | Windows (preventive) + CI-only (R82 live) + manual (the actual gap the architect flagged: a CSP violation reported only by a browser engine is undetectable by any step this project runs) |
| FL8 | R65, R80 | CSP too strict for a `@fontsource` `url()`, fonts silently fall back to the system stack with no error | `font-src 'self'` should cover same-origin `.woff2`; R80's woff2 fetch catches a 404 but not a CSP block, since a CSP violation produces no distinguishable HTTP response | Load the built site in a real browser, inspect computed `font-family` on `body` and headings, confirm no console CSP violation for font requests | Inter/JetBrains Mono/Space Grotesk actually applied, no console warning | manual: neither R63 nor R80 can distinguish "the font 404d" from "the font was blocked by CSP"; both would need a live fetch, and only the former is asserted |
| FL9 | R35 | `getContext('2d')` returns `null`, orb paints nothing | R35 returns early; the rest of the page must still render | Vitest renders `/` with the default (null-returning) canvas stub and asserts the hero heading, telemetry, and nav are still present | Page renders fully, minus the orb's drawing; failure is contained, not page-wide | Windows |
| FL10 | R32 | `matchMedia` is entirely absent (not just non-matching), reduced-motion check would throw without a feature-detect | The component feature-detects (`typeof matchMedia > "u"`), as the upstream package does | Vitest deletes `window.matchMedia` entirely before mounting | No exception; component renders and animates (falls back to the animating path) | Windows |
| FL11 | R33 | `IntersectionObserver` is absent, no pause when offscreen (accepted: battery drain only, not a page failure) | Feature-detected, runs unpaused | Vitest deletes `window.IntersectionObserver` before mounting | No exception; `requestAnimationFrame` is called (runs unpaused, not stuck idle) | Windows |
| FL12 | R34 | The orb's animation loop outlives repeated mount/unmount cycles (a slow leak across navigation) | R34's cleanup, exercised many times, not just once | Vitest mounts and unmounts the orb 20 times in a loop, asserts `cancelAnimationFrame` call count equals `requestAnimationFrame` call count at the end | Equal counts, no net accumulation | Windows |
| FL13 | R46 | Simulator timers outlive the component, callers would set state on an unmounted component | R46's clearing prevents the React 19 unmounted-update warning | Vitest unmounts mid-run, asserts no `console.error` matching "state update on an unmounted component" was logged | 0 such warnings | Windows |
| FL14 | R48 | Clipboard permission denied, button would report "Copied" when nothing copied | Covered by GC48 directly; no separate mechanism needed | See GC48 | See GC48 | Windows |
| FL15 | R69 | GitHub Pages Settings > Pages > Source is not "GitHub Actions", `actions/deploy-pages` fails | R69 records the required setting; the owner sets it before the first push | Read the first deploy job's failure message (it names the missing setting) | Deploy job fails with a message naming the Pages source setting | manual: a dashboard setting, not a file; GC69 is the preventive documentation check |
| FL16 | R63 | Pages propagation lag, smoke step fetches a stale or missing page immediately after deploy | R63's retry (5 times, 10-second intervals); the retried fetch is what R80-R82 then assert against, so a successful retry recovers the whole smoke step, not just the status check | Read the first run's smoke step log for retry attempts before success | Succeeds within 5 attempts, or fails loudly naming the last response and which assertion never ran | CI-only |
| FL17 | R56, R57 | An `npm audit` high-severity advisory in a runtime dependency blocks the deploy | Intended behaviour, not a defect: the blocking step is deliberately narrower than the full-tree audit | Read the run's audit step conclusion (`failure`) and confirm the deploy job did not run | Deploy blocked, previous deployment stays live | CI-only: cannot be manufactured safely without deliberately shipping a vulnerable dependency |
| FL18 | R68 | A Dependabot PR is merged, a deploy runs immediately because merging to `main` is the release | Accepted risk, recorded in the risk register: `open-pull-requests-limit: 5` plus the full CI gate on every push (R85's pin check, lint, R52's test floor, build, blocking audit) are the only mitigations | GC68 (limit present) and GC56, GC85, GC52 (full gate runs on every push, including a Dependabot merge) | Both present | Windows |
| FL19 | R61 | Two pushes in quick succession interleave deployments, wrong artifact ends up live | `concurrency: {group: pages, cancel-in-progress: false}` serialises them | GC61 (structural); actual serialization is `CI-only`, observable only in the Actions run history after two near-simultaneous pushes | Structural presence (Windows); serialized run history (CI-only) | Windows (structure) + CI-only (behavior) |
| FL20 | R77 | Node 21 (dev host) vs Node 22 (CI): `npm install` prints `EBADENGINE` locally | R77 requires reading the actual `engines` range from `node_modules/vitest/package.json` after install and recording it | Manual: run the owner-approved install, read the warning text and the `engines` field | Warning observed and recorded, no silent assumption | manual: requires an owner-approved `npm install` |
| FL21 | R81 | `dist/404.html` missing or stale, so a deep link serves the wrong or GitHub's own 404 page. **Cross-references FL5**: same underlying defect, now also caught live | R12's `closeBundle` copy step is the build-time control (FL5's reproduction); R81's live SHA-256 comparison of the deep-link body against the R63 root body is the deploy-time control | See FL5 for the build-time fixture; live case: first workflow run's R81 step log shows a digest mismatch if the copy step regresses | Digest mismatch correctly reported live; see FL5 for the build-time reproduction | Windows (build-time, via FL5) + CI-only (live) |
| FL22 | R63, R83 | All 5 smoke-step retries exhausted, the published page never returns 200 within the retry budget | R63's blocking failure: the run fails loudly, naming the last response, rather than silently deploying with a broken or absent smoke check; R83 guarantees no `continue-on-error` masks it | Read a run where this occurred: smoke step conclusion `failure`, log shows 5 attempts and the last response | Run fails, last response named in the log | CI-only: cannot be manufactured safely without deliberately breaking the live Pages deployment; accepted limitation, not a gap |
| FL23 | R84, R90 | React throws during mount, or any runtime exception leaves `#root` empty, while the shell serves and every asset returns 200 | **Not detectable by any step this project can run.** No browser runs in CI; `curl` sees the identical pre-mount shell whether or not the app actually mounted. R63 and R80-R83 assert only the bytes returned, never DOM state after JavaScript execution runs | Read `docs/hosted-config.md`'s "Post-deploy manual check" section (R84) for the dated line confirming a human opened the page in a real browser and saw content inside `#root` after this deploy | A dated line exists, appended by the owner after the first deploy and after any change to `vite.config.js`, `index.html` or `package.json`. **No automated pass/fail is possible; that absence is the case's entire point**, matching spec.md's own failure-modes row and R90's rule against claiming an undetected capability | manual, with no automated detection at all |

## 5. Adversarial cases

The attack surface here is thin but real: the URL is the only attacker-controlled input (a
public GitHub Pages URL can be crafted by anyone), and the CI workflow's token permissions,
action pinning, dependency-pin check, and audit gate are the authorization/supply-chain
decisions. Target is 100% rejected or safely handled, except AD13, which is a named, accepted
residual risk. AD14-AD16 red-team the new deploy-time detection instruments themselves
(R85, R52, R82), the same pattern AD11 and EG17 already use against GC66 and GC59.

| ID | Req | Attack | Exact check | Expected | Automatable |
|----|-----|--------|--------------|----------|--------------|
| AD1 | R21 | XSS payload as a slug: `/work/<script>alert(1)</script>` | RTL navigates to the (URL-encoded) path, inspects the DOM for any injected `<script>` element and for `window.alert` being called | `NotFoundPage` renders; no script node injected; `alert` never called (React escapes text by default) | Windows |
| AD2 | R21 | Path traversal as a slug: `/work/..%2F..%2Fetc%2Fpasswd` | RTL navigates, asserts no exception and no unexpected content | `NotFoundPage`, no crash, no filesystem access attempted (none is possible client-side, but the router must not choke on the sequence) | Windows |
| AD3 | R21 | Oversized slug: a 10,000-character string | RTL navigates, asserts the render completes within a bounded time (e.g. under Vitest's default timeout) and shows `NotFoundPage` | No crash, no hang, `NotFoundPage` | Windows |
| AD4 | R21 | Unicode, RTL-override, and null-byte slugs: `/work/%00`, `/work/\ud83d\ude00`, `/work/\u202emoc.elppa` | RTL navigates to each, asserts no exception | `NotFoundPage` in every case, no crash | Windows |
| AD5 | R8 | Hash-based injection attempt: `/#"><img src=x onerror=alert(1)>` | RTL navigates, spies `document.getElementById` and `scrollIntoView`, asserts `alert` never called | `getElementById` with that raw string returns `null` (ids cannot contain those characters meaningfully); no scroll crash, no code execution | Windows |
| AD6 | all routes | Any future stored or reflected injection via `portfolioData` content, defended by never using an HTML-injection sink | `grep -rc "dangerouslySetInnerHTML" src/` | 0 | Windows |
| AD7 | R60 | A compromised or malicious third-party action attempts to use broader permissions than granted | Same as GC60, framed adversarially: the per-job `permissions:` blocks are the enforcement boundary GitHub applies regardless of what a step requests | GitHub rejects any token use beyond `contents: read` (workflow), `contents: read`/`pages: read` (build), `pages: write`/`id-token: write` (deploy) | Windows (static check); GitHub's enforcement itself is a platform guarantee, not something this repo can unit test |
| AD8 | R59 | Supply-chain attack: an upstream action tag (for example `v5`) is silently repointed to malicious code after this workflow is written | Same as GC59, framed adversarially: SHA pinning is immune to a tag being repointed | Every `uses:` line resolves to the exact commit recorded, unaffected by any future tag move | Windows |
| AD9 | R64 | A compromised step or action attempts to read a secret | Same as GC64, framed adversarially: there is nothing to exfiltrate | `grep -c "secrets\."` = 0, so no secret reference exists to read | Windows |
| AD10 | R56, R57 | A known-vulnerable transitive runtime dependency reaches the shipped bundle | GC56/GC57 (structural: the blocking audit step exists and runs before `actions/upload-pages-artifact`) | Structure present (Windows). Live rejection of a real vulnerable package is `CI-only` and cannot be pre-verified without deliberately shipping one, which the profile's `npm install` ask-command guard also gates | Windows (structure) + CI-only, exercised the first time a real high-severity advisory appears (accepted limitation, not a gap in the control) |
| AD11 | R65, R66 | A compromised dependency injects an inline `<script>` (no `src`) into the build output | Red-team check: construct a `dist/index.html` fixture with a deliberately injected inline script, run GC66's grep against that fixture | The grep correctly flags it (count > 0), proving the detection instrument catches this attack, not merely that today's clean build passes | Windows |
| AD12 | R33, R34 | Replay: rapidly navigating away from and back to `/` many times (a user mashing back/forward, or a bot) | Vitest mounts and unmounts the router at `/` 20 times in a loop, asserts `cancelAnimationFrame` count equals `requestAnimationFrame` count and `vi.getTimerCount() === 0` after the last unmount | No accumulation of frames, observers, or timers across replays | Windows |
| AD13 | R65 | Clickjacking: a malicious site iframes the portfolio, because a `<meta>` CSP cannot express `frame-ancestors` on GitHub Pages | Not automatable by a command; this is a named, accepted residual risk recorded in ADR 0006 and `spec.md` "Security and privacy" | Documented as accepted, not fixed: the site has no session, no auth token, and no state-changing control for a clickjack overlay to exploit, so the residual risk is judged acceptable | manual, and scored "documented" rather than "rejected" per the target note above |
| AD14 | R85 | Red-team the pin-check step itself: a fixture `package.json` carries `"vitest": "^3.2.7"` (a caret reintroduced on one of the nine R49 packages) | Run R85's `node -e` pin-check logic against the fixture file instead of the real `package.json` | The check correctly fails and names `vitest` and its `^3.2.7` specifier, proving the detection instrument catches this exact regression class, not merely that today's clean `package.json` passes | Windows (fixture, not the live `package.json`) |
| AD15 | R52 | Red-team the test-floor assertion: a fixture `vitest-results.json` reports `numPassedTests: 12`, `numPendingTests: 1` (one skipped test), everything else 0 | Run R52's `node -e` assertion logic against the fixture instead of a real Vitest report | The check correctly fails, since `numPendingTests` is required to be 0, proving the floor rejects a partially-skipped suite rather than only counting passes | Windows (fixture, not a live test run) |
| AD16 | R82 | Reuse AD11's fixture (a `dist/index.html` with a deliberately injected inline `<script>`, no `src`) framed as the served page R82 asserts against, not the build artifact GC66 checks | Run the same inline-script grep AD11 uses against the fixture, as R82's live re-check would | The grep correctly flags it (count > 0), proving R82's live re-check catches the same class of regression R66/GC66 catches at build time, closing the gap between "built correctly" and "served correctly" | Windows (fixture, shared with AD11 and GC66) |

## 6. Non-functional (success metrics M1-M17)

| ID | Metric | Target | How measured | Case(s) |
|----|--------|--------|----------------|---------|
| NF1 | M1 | `npm run build` exit code 0 | Run the profile's `build` command | GC74 |
| NF2 | M2 | >= 1 asset path in `dist/index.html` begins `/Portfolio/`; exactly 0 begin `/assets/` | grep on `dist/index.html`; re-asserted live by R80 | GC11, GC80 |
| NF3 | M3 | `npm run lint` exit code 0, after the clean reinstall | Run the profile's `lint` command | GC71 |
| NF4 | M4 | Test command exits 0, test count >= 1 (intent's floor); R52 tightens this to >= 12 passed, 0 skipped, **now enforced by the CI job itself, not read by a human** | Run `npm test`, read the Vitest summary line; CI's `node -e` assertion on the JSON report | GC52 |
| NF5 | M5 | 5 of 5 named routes render without throwing: `/`, `/work`, and the 3 case-study paths | RTL render per route | GC3, GC21 |
| NF6 | M6 | Exactly 3 case studies, 3 projects (`workhorse`, `Shu`, `wasl`), 1 simulator entry on `/work` | RTL count assertions | GC15, GC16, GC17 |
| NF7 | M7 | `dist/404.html` exists and is byte-identical to `dist/index.html` (0 bytes different) | File existence + sha256 comparison; re-asserted live by R81's body comparison against a deep link | GC12, GC81 |
| NF8 | M8 | 0 matches for `508-1536` in `dist/` and `src/` | recursive grep; re-asserted live by R82 | GC41, GC82 |
| NF9 | M9 | 0 matches for `fonts.googleapis.com` / `fonts.gstatic.com` in `dist/` and `index.html` | recursive grep | GC37 (existence of the call); GC39 (the deeper "actually applied" check the architect flagged, since M9 alone can pass while typography silently fails); GC82 (re-asserted live on the served page) |
| NF10 | M10 | 0 matches for `fetch(`, `XMLHttpRequest`, `axios`, `gtag`, `analytics`, `dataLayer`, `document.cookie`, `localStorage`, `sessionStorage` in `src/` and `index.html` | the discovery analyst's own grep, re-run with the widened pattern | GC13, GC44; GC82 re-asserts the phone-number-pattern and font-origin subset of this position on the served page |
| NF11 | M11 | Orb canvas CSS width in `[380, 440]` px inclusive | RTL reads `canvas.style.width` (inline, per R31; jsdom has no layout to read `getBoundingClientRect` from) | GC31 |
| NF12 | M12 | 0 calls to `requestAnimationFrame` after the first frame, with `matchMedia('(prefers-reduced-motion: reduce)')` matching | RTL with a mocked `matchMedia` (R54's stub) | GC32 |
| NF13 | M13 | Exactly 1 file under `.github/workflows/` that builds and publishes to Pages on push to `main`; parses as YAML | file read + count; YAML-validity confirmed only by GitHub's own parser (manual, see GC55) | GC55 |
| NF14 | M14 | The Actions job's install step exits 0 on `ubuntu-latest` | first workflow run only; explicitly not verifiable on the Windows dev host per intent.md | CI-only, depends on GC70/GC71's preventive fixes and GC74's build-succeeds check |
| NF15 | M15 | `generate_viewer.cjs` absent from `git ls-files`; `.gitignore` contains `.env*` | `git ls-files`, grep | GC72, GC73 |
| NF16 | M16 | The rendered simulator contains a visible "illustrative example" style label naming the data as fictional; tightened here to >= 2 occurrences (scenario list and payload inspector, per R45's own text) | RTL text assertion | GC45 |
| NF17 | M17 | `src/data/portfolioData.js` diff adds keys only; 0 changes to any existing metric, date, employer, role, or degree string | review of the diff at G4 against the full checklist | GC-CP (manual) + GC18 (automated subset: telemetry, case-study ids/titles) |

## 7. Golden dataset

Not applicable: this change contains no classification, extraction, matching, search, or LLM
call. `InteractiveTriageSimulator`'s "decision", "confidence", and "reasoning" fields are
static properties of the three hard-coded `PRESETS` entries (confirmed, reading
`src/components/InteractiveTriageSimulator.jsx` lines 4-62 and `handleRunSimulation` lines
70-95): the component returns them verbatim after three `setTimeout` delays, computing only a
random latency number and a timestamp at run time. No model, no API call, no ranking, and no
retrieval exists anywhere in this codebase (confirmed by the discovery analyst's grep for
`fetch(`, `XMLHttpRequest`, `axios`, and re-confirmed here by reading every component file).
R80-R90 add no such surface either: they are deploy-pipeline assertions and documentation
requirements, not classification or retrieval.

## 8. Failure taxonomy

Per R90, every row below credits a check only for what it actually asserts, and names R84 as
the control for what no automated step can see.

| Class | Description | Detection in production | Example |
|-------|-------------|--------------------------|---------|
| Wrong result | The page renders, but with incorrect content, route, or styling (wrong `base`, wrong `basename`) | R63 catches total content failure (HTTP status only, no content assertion). R80 catches a wrong `base` specifically: every asset path must begin `/Portfolio/`, and the script, stylesheet and one woff2 must each return 200. R82 catches a regressed CSP, referrer meta, inline script, Google Fonts origin, or phone number on the served page. **None of R63/R80-R83 can tell a visually wrong-but-present page from a correct one** (layout, colour, typography): that has no production detection, by design (no analytics, no error tracking, per `constraints.md` and the profile's `style_notes`); R84's dated manual check is the only compensating control | FL4 (wrong `base`), FL6 (`basename` trailing slash, breaking the bare `/Portfolio` address) |
| Missing result | A route or asset fails to load entirely (blank page, unfallen-back 404) | R80 catches an asset that 404s off the served page. R81 catches a stale or missing `dist/404.html` by comparing a live deep-link body against the live root body. **Deep-link pages beyond the one R81 checks (`/work/apple-llm-triage`) have no separate smoke coverage.** A mount failure that leaves `#root` empty behind an HTTP 200 has **no detection at all** (FL23); R84 is the only control | FL5 (stale/missing `dist/404.html`), FL7 (CSP-blocked inline script, blank page in production only), FL21 (live cross-check), FL23 (mount failure, no automated detection) |
| Slow | The npm registry or GitHub Pages propagation is slow, delaying or failing the deploy | The GitHub Actions run's own duration and failure status; GitHub's workflow-failure email to the actor (believed, not verified). R63's retry budget converts most propagation lag into a pass, not a signal; R63's exhaustion after 5 retries (FL22) is the signal for genuine slowness | FL1 (registry down), FL16 (Pages propagation lag), FL22 (retries exhausted) |
| Leaked (resource) | Timers, animation frames, or observers outlive their component and accumulate across navigations | **No detection in production** (no monitoring, by design); caught only pre-release by the fake-timer and mount/unmount eval cases | GC34, GC46, GC47, FL12, FL13, AD12 |
| Leaked (data) | Personal data (the phone number) or a confidential employer claim reaches the public, permanent, scrapeable surface | R82 catches a regression of the phone number on the served page at every deploy, via a generic character-class pattern match rather than a literal digit search (GC82, amended 2026-09-12 to stop naming the owner's specific digits, per plan rule 3). **No detection of a leak that falls outside that pattern's shape, and no crawler or archive monitoring**, by design; the only available check beyond R82's pattern match is a periodic manual grep of the deployed site, and once a search engine or archive copies it, it is unrecoverable (see below) | R41 (phone number), R82, D4 (employer claims) |
| Unauthorised | The deploy workflow or a dependency executes with more privilege or reach than intended | GitHub's own Actions permission enforcement on the per-job `permissions:` blocks (R60); the blocking `npm audit --audit-level=high --omit=dev` step; R85's pin check before `npm ci`; Dependabot alerts on the repository's Security tab | AD7, AD8, AD9, AD10, AD14, FL17 |
| Corrupted | The build artifact is internally inconsistent (`dist/404.html` stale, `package-lock.json` out of sync, malformed workflow YAML) | The build's own exit code (`npm ci` / `npm run build` failing); GC12's build-time hash-equality check and R81's live body comparison; GitHub's "invalid workflow file" banner in the Actions tab | FL3, FL5, FL21 |
| Unrecoverable | An action that cannot be undone once a visitor, search engine, or archive has copied it | **No detection after the fact.** The only control is pre-push human sign-off (D1, D4 in the G1 approval notes) and running every eval case above **before** every push, never after | The entire reason D1 and D4 exist as explicit owner decisions rather than defaults; a wrongly-published phone number or employer claim |

## 9. Coverage matrix

### Requirements (R1-R90)

Every requirement maps to at least one golden case (`GCn`). Additional edge (`EGn`), failure
(`FLn`), or adversarial (`ADn`) cases are listed where they exist.

| Req | Golden | Edge | Failure | Adversarial |
|-----|--------|------|---------|--------------|
| R1 | GC1 | - | - | - |
| R2 | GC2 | EG1 | FL6 | - |
| R3 | GC3 | - | - | - |
| R4 | GC4 | - | - | - |
| R5 | GC5 | - | - | - |
| R6 | GC6 | - | - | - |
| R7 | GC7 | - | - | - |
| R8 | GC8 | EG5, EG6 | - | AD5 |
| R9 | GC9 | - | - | - |
| R10 | GC10 | - | - | - |
| R11 | GC11 | - | FL4 | - |
| R12 | GC12 | EG21 | FL5 | - |
| R13 | GC13 | - | - | - |
| R14 | GC14 | - | - | - |
| R15 | GC15 | - | - | - |
| R16 | GC16 | - | - | - |
| R17 | GC17 | - | - | - |
| R18 | GC18, GC-CP | EG16 | - | - |
| R19 | GC19 (manual, permanent) | - | - | - |
| R20 | GC20 | EG7 | - | - |
| R21 | GC21 | EG2, EG3, EG4 | - | AD1, AD2, AD3, AD4 |
| R22 | GC22, GC22v (manual) | - | - | - |
| R23 | GC23 | - | - | - |
| R24 | GC24 | EG8 | - | - |
| R25 | GC25 | EG9, EG16 | - | - |
| R26 | GC26 | - | - | - |
| R27 | GC27, GC27v (manual) | - | - | - |
| R28 | GC28 | - | - | - |
| R29 | GC29 | - | - | - |
| R30 | GC30, GC30v (manual) | - | - | - |
| R31 | GC31 | EG10 | - | - |
| R32 | GC32 | EG11 | FL10 | - |
| R33 | GC33 | - | FL11 | AD12 |
| R34 | GC34 | EG12 | FL12 | AD12 |
| R35 | GC35 | - | FL9 | - |
| R36 | GC36 | EG13 | - | - |
| R37 | GC37 | - | - | - |
| R38 | GC38 | - | - | - |
| R39 | GC39 | - | - | - |
| R40 | GC40 | - | - | - |
| R41 | GC41 | - | - | - |
| R42 | GC42 | - | - | - |
| R43 | GC43 | - | - | - |
| R44 | GC44 | - | - | AD6 |
| R45 | GC45 | - | - | - |
| R46 | GC46 | EG14 | FL13 | - |
| R47 | GC47 | EG15 | - | - |
| R48 | GC48 (subject to G2-D2) | EG15 | FL14 | - |
| R49 | GC49, GC91 | - | - | - |
| R50 | GC50 | - | - | - |
| R51 | GC51 | - | - | - |
| R52 | GC52 | - | - | AD15 |
| R53 | GC53 | - | - | - |
| R54 | GC54 | - | - | - |
| R55 | GC55 | EG18 | - | - |
| R56 | GC56 | - | FL17 | AD10 |
| R57 | GC57 | - | FL17 | AD10 |
| R58 | GC58 | - | - | - |
| R59 | GC59 | EG17 | - | AD8 |
| R60 | GC60 | - | - | AD7 |
| R61 | GC61 | - | FL19 | - |
| R62 | GC62 | - | - | - |
| R63 | GC63 | - | FL16, FL22 | - |
| R64 | GC64 | - | - | AD9 |
| R65 | GC65 (subject to G2-D2) | - | FL7, FL8 | AD11, AD13 |
| R66 | GC66 | - | FL7 | AD11 |
| R67 | GC67 (subject to G2-D2) | EG19 | - | - |
| R68 | GC68 (subject to G2-D2) | - | FL18 | - |
| R69 | GC69 (unconditional, outside G2-D2) | - | FL15 | - |
| R70 | GC70 | - | FL2 | - |
| R71 | GC71 | - | FL3 | - |
| R72 | GC72 | - | - | - |
| R73 | GC73 | EG20 | - | - |
| R74 | GC74 | - | - | - |
| R75 | GC75 | - | - | - |
| R76 | GC76 (config only) | - | - | - |
| R77 | GC77 (manual, permanent) | - | FL20 | - |
| R78 | GC78 | - | - | - |
| R79 | GC79, GC79v (manual, conditional on G2-D4) | - | - | - |
| R80 | GC80 | EG22 | FL4, FL8 | - |
| R81 | GC81 | - | FL5, FL21 | - |
| R82 | GC82 | - | FL7 | AD16 |
| R83 | GC83 | - | FL22 | - |
| R84 | GC84 (manual) | - | FL23 | - |
| R85 | GC85 | - | - | AD14 |
| R86 | GC86 (manual evidence) | - | - | - |
| R87 | GC87 (CI-only + manual) | - | - | - |
| R88 | GC88 (subject to G2-D2) | - | - | - |
| R89 | GC89 | - | - | - |
| R90 | GC90 (review property) | - | - | - |

All 90 requirements have at least one golden case. 0 are uncovered. R49 carries two golden
cases (`GC49`, `GC91`) as of the 2026-09-12 amendment; every other row is unchanged.

### Metrics (M1-M17)

| Metric | Case |
|--------|------|
| M1 | NF1 (GC74) |
| M2 | NF2 (GC11, GC80) |
| M3 | NF3 (GC71) |
| M4 | NF4 (GC52) |
| M5 | NF5 (GC3, GC21) |
| M6 | NF6 (GC15, GC16, GC17) |
| M7 | NF7 (GC12, GC81) |
| M8 | NF8 (GC41, GC82) |
| M9 | NF9 (GC37, GC39, GC82) |
| M10 | NF10 (GC13, GC44, GC82) |
| M11 | NF11 (GC31) |
| M12 | NF12 (GC32) |
| M13 | NF13 (GC55) |
| M14 | NF14 (CI-only) |
| M15 | NF15 (GC72, GC73) |
| M16 | NF16 (GC45) |
| M17 | NF17 (GC-CP, GC18) |

All 17 metrics have at least one case. 0 are uncovered.

## 10. Notes for the architect

Six notes from the first version, each marked with the spec architect's response, plus three
new notes surfaced by R80-R90.

1. **R31's clamp formula had no upper bound. Addressed.** The spec architect fixed this: R31
   now states `Math.min(420, Math.max(280, viewportWidth - 48))` explicitly and requires the
   pure exported helper `canvasWidthForViewport`. GC31 and EG10 are rewritten to test five and
   three points respectively against the exact formula, closing the mid-range gap this note
   flagged.
2. **R76's acceptance check is a process property, not an artifact. Addressed.** R76 is
   reworded to be explicitly about the configured value and the wave shape, both artifacts,
   and states plainly it is not a claim about run-time behaviour. GC76 is unchanged in what it
   checks but no longer needs the caveat the first version carried.
3. **R77 is inherently manual. Accepted, as before.** R77's own row now states this
   explicitly ("this check is permanently manual and that is accepted, not a gap"), matching
   what this note already said. Not a gap, restated by the spec itself now.
4. **"Parses as YAML" in R55 and R68. Addressed.** Both requirements' acceptance checks now
   state plainly that structural greps are the machine check and full validity is confirmed
   only by GitHub's and Dependabot's own parsers on first use, under a dedicated
   [YAML validity](#yaml-validity) section. GC55 and GC68 are unchanged in substance.
5. **R30's colour mapping was unverifiable. Addressed.** R30 now requires the pure exported
   `colourForDepth(z)` function with a unit test asserting exact output at three depths. GC30
   is rewritten to test the function directly; GC30v is now a supplement to that test, not a
   replacement for it.
6. **R19 is a permanent manual ceiling. Accepted, recorded as such.** R19's own row now states
   this is permanent and not an open eval gap, matching this note. GC19 is unchanged in
   substance, with wording tightened to match.

New notes from this revision, arising from R80-R90:

7. **R84's "dated line" has no specified format.** R84 requires the owner to append "a dated
   line" after the first deploy and after any later change to `vite.config.js`, `index.html`
   or `package.json`, but does not specify a date format. GC84 can only confirm a human read
   that "at least one dated line exists"; it cannot regex for a real date without a stated
   format (for example, ISO 8601, `YYYY-MM-DD`). Recommend R84 name a format so a future
   revision of this eval could tighten "a human confirms" into "a grep confirms a line matching
   `^\d{4}-\d{2}-\d{2}`".
8. **R90 is a cross-artifact consistency review with no single owner named for which gate
   closes it.** R90's acceptance check says "review at re-audit", but [Observability],
   [Failure modes] and the [Risk register] are also read at the G4 conformance review. GC90
   names both the constraint auditor's re-audit and the G4 conformance reviewer as positioned
   to check it, since the spec does not pick one. Recommend the spec name which gate is
   authoritative for R90, so a violation found late does not become a dispute about whose job
   it was to catch it.
9. **R86's "11 direct dependencies" is arithmetic derived from three other numbers, stated
   nowhere as "11" in R86 itself.** The figure (today's 7 `dependencies` plus 5
   `devDependencies`, minus the 1 removed, equals 11 that survive the regeneration and have a
   meaningful "before" and "after") had to be computed from the [Dependency table](#dependency-table)'s
   net line and R78's counts to write GC86 and GC71 correctly. Recommend R86 state the number
   11 explicitly, so a future reader does not have to re-derive it and risk getting it wrong
   the way the timer and email counts were gotten wrong twice in this spec's own history (see
   [Correction to a carried finding](#correction-to-a-carried-finding)). This note is
   unaffected by the GC78 correction below: R86's "11 survivors" are the baseline packages that
   predate R78 (7 `dependencies` + 5 `devDependencies` - 1 removed rolldown package), not
   `tailwindcss` or `@tailwindcss/vite`, which R78 itself added; B3's move of those two packages
   between sections changes GC78's counts, not GC86's 11-row survivor set.

New note from the 2026-09-12 B2/B3 amendment:

10. **R78's "exactly 4 runtime dependencies and 5 devDependencies added" no longer matches
    B3's outcome without a stated reconciliation. Resolved 2026-09-12.** Moving `tailwindcss`
    and `@tailwindcss/vite` from `dependencies` to `devDependencies` is a change to which existing
    packages sit in which section, not a change to how many packages are "added" in R78's
    sense, but R78 also states "no other dependency change SHALL occur in `package.json`" and
    the spec's own line 1149 called this exact move "a dependency change outside R78's declared
    bounds... do it in the next dependency change." This agent did not resolve that tension,
    since it is a requirement-wording question for the spec architect, who is amending R78 in
    parallel; it is reported above under "Finding outside this amendment's scope" rather than
    fixed here. GC78 is left unchanged pending that resolution.

    **Resolved by the 2026-09-12 "GC78 final dependency-count correction" amendment (see above
    the Scope, method, and epistemic labels section).** The verifier ran GC78 at commit
    `cf969de` and it failed: actual counts were 8 `dependencies` and 12 `devDependencies`, not
    the case's hard-coded 10 and 10. GC78 is rewritten to assert the final counts (8, 12)
    directly and to check `tailwindcss`/`@tailwindcss/vite` section membership explicitly,
    which makes it correct regardless of which section a package sits in, without waiting on
    R78's own wording. The wording tension this note originally raised (whether B3's move is
    "outside R78's declared bounds") is still the spec architect's question to resolve in R78
    itself, amended in parallel to this fix; that tension is about how R78 is worded, not about
    what GC78 measures, so this eval fix does not depend on its outcome. GC78 is **no longer**
    "left unchanged pending that resolution."

No requirement was left entirely without a case, including the five (R19, R76 in its
config-only sense, R77, R84, R86) that are permanently manual or evidence-table by nature, and
R90, which is a review property rather than a command. Each of those has a case that states
what it can and cannot prove, matching R90's own rule.

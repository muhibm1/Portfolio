# Release: Deployed multi-page portfolio on GitHub Pages

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Tier: 2. G4 approved at `839b67b` (confirmed: `WH state get gates.G4` returns `approved`, `WH state get phase`
returns `deploy`, `approvals.md` G4 block dated `2026-09-13T05:03:00.718Z`).
Branch: `wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages`, HEAD `839b67b48de74f0911982419d350fa1962fd46da`.
Change branch forked from `main` at `942d311a49ae89c4fbc08bda9efbafd0f354b0ba` (confirmed,
`conductor-log.md` 2026-09-12T19:53:42Z: "change branch created from main at 942d311").
Prepared: 2026-09-13, on Node v22.12.0 (confirmed, `node --version`).

No em-dashes. Every factual claim is labelled **confirmed** (this agent read the file, ran the
command, or checked it itself, this session) or **believed, not verified** (asserted by an
earlier agent or inferred, not independently re-checked here).

---

## 1. Changelog

Taken from `git log main..HEAD` (51 commits, confirmed by count) and `spec.md`/`intent.md`.
Internal simplifier/readability passes, SDLC bookkeeping commits (intent/spec/plan/evals/
verification/conductor-log/review-packet/approvals) and the three redaction-fix rounds are folded
into the entries below rather than listed commit by commit; every commit hash cited is confirmed
present in `git log main..HEAD --oneline`.

### Added

- Multi-page site with a client-side router: `/` (home), `/work` (case-study and project index),
  `/work/:slug` for each of the three case studies (`f093db6`, `3a9d284`, `83df689`, `a44c13b`).
- `/work` lists three GitHub projects (`workhorse`, `Shu`, `wasl`, all private repositories, shown
  with a "Private repository, walkthrough on request" note and a `mailto:` link) and the
  interactive triage simulator, now labelled "Illustrative example, fictional data" (`e921436`,
  `f5ac45a`).
- Live `thinking-orbs` hero animation replacing the MM monogram, honouring
  `prefers-reduced-motion` and pausing offscreen (`7077f00`, `48c9007`).
- Self-hosted fonts (Inter, JetBrains Mono, Space Grotesk) via pinned `@fontsource` packages;
  Google Fonts removed from `index.html` (`386223b`).
- `dist/404.html` as a byte-identical copy of `index.html` at build time, so deep links resolve on
  GitHub Pages (`vite.config.js`, part of `3d75333`).
- `npm test` (Vitest plus React Testing Library), 23 test files, 191 tests, wired into
  `.workhorse/profile.yml` (`3d75333` onward).
- `public/.well-known/security.txt`, `Contact` pointing at `personal.email`, one-year `Expires`
  (`b45e18f`).
- `docs/hosted-config.md`, the record of every setting that lives in the GitHub dashboard, plus
  the R84 post-deploy manual check (`b45e18f`, corrected `34a0a8c`).

### Changed

- Case-study content moved from a modal (`CaseStudyModal.jsx`) to a routed page
  (`CaseStudyPage.jsx`); the Resume stays a modal (`3a9d284`, ADR 0008).
- Home hero cards link straight to `/work/<id>` (`48c9007`).
- Contact email is read from `personal.email` everywhere instead of one hard-coded `mailto:`
  string; the phone number is removed from the public site (`f1792e1`, `95f27dc`).
- `react-router` pinned at `7.18.3` and `vitest` at `3.2.7` (owner decision B2); `tailwindcss` and
  `@tailwindcss/vite` moved to `devDependencies` at exact `4.3.3` (owner decision B3)
  (`a98fdcf`).
- `@rolldown/binding-win32-x64-msvc`, an orphaned Windows-only dependency, removed (`3d75333`).
- `generate_viewer.cjs`, dead code reading a path outside the repository, removed (`386223b`).

### Fixed

- Back to Top now calls `window.scrollTo` and works on every route, not only `/` (`c518b71`,
  G4-D5, R91).
- `FdePhilosophy.jsx` icons rendered without React keys (`2df4999`).
- `scripts/check-phone-redaction.mjs` (added `76bcc00`) hardened twice more: catches a `+1`/`1`
  country-code prefix written directly before the number, and decodes UTF-16 files instead of
  silently skipping them as binary (`1731db5`).

### Security and CI

- `.github/workflows/deploy.yml` added: builds and tests on every push to `main`, then deploys to
  GitHub Pages and smoke-tests the served bytes. Every action pinned to a full commit SHA; the
  build job has read-only permissions, the deploy job has exactly `pages: write` and
  `id-token: write`; no secret of any kind is referenced (`02743e2`, spec R55-R64, ADR 0005).
  Gates before anything reaches Pages: a dependency-pin check (R85), lint, the full test suite
  with a 12-passed floor (R52), the production build, and a blocking
  `npm audit --audit-level=high --omit=dev` (R56). A second, non-blocking full-tree audit runs for
  visibility (R57).
  Post-deploy smoke checks assert: the root page returns 200 after retries (R63); every asset path
  on the served page begins `/Portfolio/` and the module script, stylesheet and one font each
  return 200 (R80); a deep link's body matches the root's body, proving `404.html` is live (R81);
  exactly one CSP meta tag, one referrer meta tag, zero inline scripts, zero Google Fonts
  references and zero phone-number-shaped strings appear on the served page and in the served
  module script (R82); the response headers Pages sets are dumped to the run log for a human to
  record (R87).
- Content-Security-Policy and `Referrer-Policy` shipped as `<meta>` tags, injected at build time
  only (`vite.config.js`, ADR 0006): `default-src 'self'`, `script-src 'self'`, `object-src 'none'`,
  `form-action 'none'`, `frame-ancestors` not set (GitHub Pages cannot be framed off by a meta tag;
  accepted, believed, not re-verified this session), `strict-origin-when-cross-origin` referrer.
- `scripts/check-phone-redaction.mjs` added: derives the owner's phone number from commit `b50497f`
  at run time and never prints or hard-codes it; a `--self-test` mode proves the matcher against
  synthetic numbers; scans every tracked file and, given a directory argument, every file under it
  (`76bcc00`, hardened `1731db5`, ADR 0010). `src/checkPhoneRedaction.test.js` (17 unit tests) runs
  the matcher and decoder in CI through `npm test`.
- `.gitignore` gained `.env*` (pattern, not an enumerated filename) and `.claude/` (`386223b`,
  `d6a1a4c`).
- Four design mockups moved from `public/` to `docs/design/`, with `src/publicDirectory.test.js`
  guarding that none of them, or any future mockup, reaches `dist/` (`38d36b4`, R92, ADR 0012).
- `.github/dependabot.yml` added, `npm` and `github-actions` ecosystems, `open-pull-requests-limit:
  5` each (`02743e2`).
- ADR 0009 records accepting 5 dev-only advisories (vite, esbuild, `@vitest/mocker`) as a
  documented risk until a future Vite 6+/Vitest 4+ upgrade; the blocking audit scope changed to
  `--omit=dev` in both CI and `.workhorse/profile.yml` so the local gate matches the CI gate
  (`26b5c0e`).

### Docs

- `intent.md`, `spec.md` (92 requirements), `evals.md`, `plan.md`, `review-packet.md`,
  `approvals.md` written and carried through three G4 rounds (two rejections, one approval).
  Twelve ADRs recorded (`docs/sdlc/.../adr/0001` to `0012`).
- `docs/hosted-config.md` added and corrected twice for stale redaction claims (`b45e18f`,
  `34a0a8c`).
- `docs/sdlc/constraints.md`, `docs/sdlc/codebase-map.md`, `.workhorse/profile.yml` updated for the
  phone-number removal, the new `test`/`test_file` commands, and `src/data/portfolioData.js` added
  to `sensitive_paths` (G3-D4).

---

## 2. The owner-run publishing sequence

Nothing in this section was run by this agent except the read-only checks named. No `git push` was
run, no PR was opened, no repository setting was changed.

**Order of operations, overrides the lettering below.** The letters a to f name each action; they
are not a fixed execution sequence. Steps a and b (push `main`, then the change branch and PR)
always come first, and step f (post-deploy manual check) always comes last. In between, the
repository visibility or plan decision (D2, section 3) must be decided and executed (step e, or a
plan upgrade) before the Pages source can be set (step d), because GitHub Free serves Pages only
from public repositories (**believed, not verified**: carried from `docs/hosted-config.md` and the
2026-09-12 main-session check of `docs.github.com`, not independently re-checked by this agent this
session). And step d must happen before step c (the merge) if the first workflow run the merge
triggers is to succeed, since the deploy job needs a Pages site already configured with its source
set to GitHub Actions. Followed literally in the a-b-c-d-e-f letter order, the merge (c) would run
before visibility (e) is decided, and the resulting run's deploy job would fail.

The order therefore depends on which D2 option is chosen. This table does not choose one:

| D2 option | Order | Notes |
|---|---|---|
| (i) Paid plan (Pages served from a private repo) | a, b, upgrade plan, d, c, f | Visibility never changes; the plan upgrade substitutes for step e |
| (iv) Public as is | a, b, e, d, c, f | Going public (e) before the merge (c) means `main`'s current tree, which still carries the phone number in `src/data/portfolioData.js` and `generate_viewer.cjs`, is the public default-branch view until the merge completes. Alternative order: a, b, c, e, d, then re-run the failed deploy job from the Actions tab. This keeps `main` private until after the merge, at the cost of one failed workflow run (the deploy job fails because neither the Pages source nor public visibility is set yet) |
| (iii) History rewrite | Owner-run, before anything goes public | Invalidates every commit SHA `approvals.md` and the ADRs cite (section 3); not an alternative to a or e, a precondition on both if chosen |
| (ii) Separate public repository | Not executable under this release | Needs a spec amendment and a new change (section 3's options table) |

### a. Push local `main` to the private origin

```
git push origin main
```

Run this yourself, naming the branch explicitly. **Never** `git push --all`, **never**
`git push --mirror`, and never push a `wh/...-t*` or `worktree-agent-*` branch: 37 of 42 local
branches, and local `main` itself, still carry your phone number in their current files
(confirmed by the security reviewer, `review-packet.md` line 149; not independently re-counted by
this agent this session, since doing so would require the same masked scan the reviewer already
ran and add nothing new).

**What `main` contains right now, checked by this agent:**

```
git ls-tree -r main --name-only
```

confirmed: 51 paths, no `.github/` directory, no `.github/workflows/deploy.yml`, no
`docs/hosted-config.md`. `main` still has `generate_viewer.cjs`, four mockup files under `public/`,
and `src/data/portfolioData.js` with the phone number (per the security reviewer's finding; not
re-read by this agent to avoid quoting it). **Pushing local `main` today publishes no workflow and
enables nothing on Pages**, because GitHub only runs a workflow that exists in the pushed ref, and
this `main` has none (confirmed by the ls-tree above). This matches `docs/hosted-config.md`
section 1: Pages source is not set and `has_pages: false` (confirmed by this agent via
`gh api repos/muhibm1/Portfolio`, see Evidence).

**After this step:** check `git ls-remote --heads origin` shows `main`. No Pages URL will resolve
yet.

### b. Push the change branch and open the PR

```
git push -u origin wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages
gh pr create --base main --head wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages \
  --title "Deploy multi-page portfolio to GitHub Pages" --body-file <a body summarising this change>
```

An agent (this one or the conductor) may run this step once you confirm `main` is on origin. **This
agent did not run it.** Opening the PR does not deploy anything: `deploy.yml` only exists on the
change branch until the merge in step c, and the workflow trigger is `push: branches: [main]`, not
`pull_request`.

**Check after:** the PR's base is `main`, head is the change branch, and GitHub shows no merge
conflicts.

### c. The merge

The merge to `main` is the release, and per `.workhorse/profile.yml` and `docs/hosted-config.md`
section 3, requiring a pull request before merging is deliberately **not** enabled on this
repository, so you can also merge locally and push if you prefer over the GitHub PR UI. Either
way:

**Use a merge commit (not squash, not rebase).** `approvals.md` records five gate approvals by
their artifact commit SHAs (`a7ed654`, `bd1cd7c7...`, `49a0c2b2...`, `b6103144...`, and the G4
history above). A merge commit keeps every one of those SHAs reachable from `main`'s history
exactly as approved. Squashing or rebasing rewrites or drops those commits, which breaks the audit
trail `approvals.md` depends on (the whole point of recording a SHA per gate is that it stays
findable in history). This repository's settings allow all three merge methods
(`allow_squash_merge`, `allow_merge_commit`, `allow_rebase_merge` all `true`, confirmed via
`gh api repos/muhibm1/Portfolio`); you must actively choose "Create a merge commit" if merging
through the GitHub UI.

### d. Pages source setting

`docs/hosted-config.md` section 1, exact path: **Settings > Pages > Build and deployment > Source**,
set to **GitHub Actions** (not "Deploy from a branch").

**Order: set this before the first push that carries `deploy.yml` to `main` triggers a run, or at
latest before that run reaches the deploy job.** The build job does not need Pages configured (it
only builds and tests); the `deploy` job's `actions/deploy-pages` step needs a Pages site to exist
with its source set to Actions. **Believed, not verified by this agent**: if the workflow's deploy
job runs before the Pages source is set to GitHub Actions, `actions/deploy-pages` is expected to
fail (GitHub Pages has no artifact target configured yet); the workflow's own
`actions/configure-pages` step is called with `enablement: false` specifically because, per its
inline comment, "the owner sets the Pages source to GitHub Actions by hand," which only makes
sense if that setting exists first. This agent did not trigger a real run and cannot cite GitHub's
exact error text, so the consequence of the wrong order is stated as believed, not confirmed.
**If the first run fails here:** set the Pages source, then re-run the failed job from the Actions
tab (a new push is not required).

### e. Repository visibility

**GitHub Free serves Pages only from public repositories.** This agent did not independently fetch
GitHub's plan-comparison page this session; the fact is carried from `docs/hosted-config.md` line
20-21 and `conductor-log.md` (2026-09-12T10:55:49Z), both of which say it was checked against
`docs.github.com` on 2026-09-12 by the main session. **Believed, not verified by this agent.**
This agent did independently confirm today, via `gh api repos/muhibm1/Portfolio`, that the
repository is currently `"private": true`, `"visibility": "private"`, `"has_pages": false`
(**confirmed**). So: **the site cannot go live on the current plan until you either make the
repository public or move to a paid plan that serves Pages from private repositories.** See
section 3 below for what "public" exposes, before you decide.

### f. Post-deploy manual check (R84) and route/CSP/asset smoke

`docs/hosted-config.md` section 6, quoted verbatim, run after the first deploy and after any later
change to `vite.config.js`, `index.html` or `package.json`:

1. The home page renders content inside `#root` in a real browser.
2. The orb animates and stops when the tab is hidden.
3. A deep link pasted into a fresh tab renders the case study.
4. The browser console shows no CSP violation and no uncaught error.

Log format: `YYYY-MM-DD <commit sha> <trigger> 1 pass, 2 pass, 3 pass, 4 pass. <notes>`, appended
to `docs/hosted-config.md` section 6.

In addition, after the first deploy, check each of these by hand (none of them can be proven by
`curl`, per `spec.md` "Observability", the smoke-step limitations table):

- `/`, `/work`, `/work/apple-llm-triage`, `/work/apple-data-health`,
  `/work/neural-newsletters-llm` all render their content, not a blank page.
- View source or the Network tab shows exactly one `Content-Security-Policy` meta tag and no
  blocked request in the console.
- Every asset (script, stylesheet, fonts, favicon) loads under `https://muhibm1.github.io/Portfolio/...`,
  none under the domain root.

---

## 3. Exposure if the repository is made public

Everything in this section is evidence this agent gathered itself this session, with the commands
shown. **No digit of the phone number appears anywhere below**, by instruction.

### Commit author and committer emails, whole history

```
git log --all --format='%ae %ce' | sort -u
```

**Confirmed, one distinct address across every commit in the repository: `mmuhibullah@instructors.2u.com`.**
No other author or committer email exists in git history. This is not the Gmail address used
elsewhere in this project's docs (`mmalqaim@gmail.com`); it looks like an employer or
institutional address (the `2u.com` domain, believed associated with 2U Inc., the education
company; `edX` is named as a past employer in `src/data/portfolioData.js`, believed, not
independently confirmed that `instructors.2u.com` belongs to that employer). If the repository
goes public, this address is published on every commit, forever, including the SDLC bookkeeping
commits and the eleven gate-approval commits this change alone made.

### Emails recorded in `approvals.md`

Every one of the five gate approvals (`G1` through the final `G4`) records:
`Who: mmuhibullah@instructors.2u.com` (**confirmed**, read directly from `approvals.md`). Same
address as above. Going public publishes this file and these lines as-is.

### The phone number in git history

The number was removed from the public site (R41) and, under G4-D3, redacted from every tracked
file on this change branch. It is **not** removed from git history. This agent located every
commit and path that ever added or removed a rendering of it, using a script that derives the
digits from commit `b50497f` at run time (the same technique `scripts/check-phone-redaction.mjs`
uses) and passes them only to `git log -S<digits> --name-only`, whose output never includes the
matched text itself, only commit hashes, subjects and paths. **No digit was read, printed, typed
or written by this agent at any point.**

**Confirmed, commits containing a rendering of the number (parenthesised form; a plain-digit and a
hyphenated-form search returned no hits, meaning the source data was only ever stored and quoted
in the parenthesised form):**

| Commit | Path |
|---|---|
| `b50497f` | `src/data/portfolioData.js` (introduced) |
| `c59216b`, `f1792e1` | `src/data/portfolioData.js` (removed from the site, R41) |
| `2602557` | `docs/sdlc/constraints.md` |
| `a7ed654` | `docs/sdlc/.../intent.md` |
| `0a62e9e`, `bd1cd7c` | `docs/sdlc/.../spec.md` |
| `0099601`, `b45e18f` | `docs/sdlc/.../intent.md`, `docs/sdlc/constraints.md` |
| `1d11c97` | `docs/sdlc/.../spec.md` |
| `545da85` | `docs/sdlc/.../intent.md` |

No commit outside this change's own branch history was searched for other renderings (last-seven
digits alone, area-code-and-exchange alone, spaced or dotted forms); the component files
(`ContactFooter.jsx`, `ResumeModal.jsx`) never hard-coded the number, they read `personal.phone`,
so the literal only ever appears in `portfolioData.js` and doc quotes of it, consistent with the
table above.

**Rewriting history (`git filter-repo` or similar) would change every commit hash quoted in
`approvals.md`, `state.json`, `verification.md`, `review-packet.md` and every ADR that cites a
commit SHA as evidence.** The approvals would then refer to commits that no longer exist on the
rewritten branch, breaking the audit trail. It also requires a force push to publish, and
`.workhorse/profile.yml` `deny_commands` plus the bash guard refuse `git push --force`/`-f` to any
agent; only you could run it, and even then the audit-trail cost above is the same.

### Other sensitive content checked in history

```
git log --all --diff-filter=A --name-only --pretty=format: -- '*.env' '.env*'
git log --all --diff-filter=A --name-only --pretty=format: \
  | sort -u | grep -iE '\.pem$|\.key$|secret|credential'
```

**Confirmed: zero results for both.** No `.env` file and no file named like a key, secret or
credential was ever committed, at any point in history.

**`generate_viewer.cjs`** (present on `main`, removed on this change branch, commit `386223b`):
contains the hard-coded local path `C:\Users\alqai\.gemini\antigravity\brain\<uuid>` (**confirmed**,
read the file at `main`). This discloses your local Windows username (`alqai`) and a local tool
directory name. Not a secret, but a path disclosure; it stops being published once `main` moves
past this change (the file is deleted here) or once history is rewritten (not recommended, see
above).

**The four design mockups** (`docs/design/mockup-*.jpg` on this branch, `public/mockup-*.jpg` on
`main` today): tracked in every commit since `b50497f`. Going public makes them fetchable at a
stable URL for as long as any commit that carries them is reachable, which is effectively forever
once cloned. `review-packet.md` records they carry C2PA "Created by Google Generative AI"
provenance (**believed**, carried from the security reviewer, not independently re-verified by
opening the file's metadata this session).

### Options, presented neutrally, no recommendation

| Option | What it does | Cost | Consequence |
|---|---|---|---|
| (i) Keep the repository private; pay for a GitHub plan that serves Pages from private repos | No history or docs become public | A recurring paid subscription. `docs/sdlc/constraints.md` business constraint 5 says no paid services, which this option conflicts with unless that constraint is revisited | Site stays unreachable until the plan is purchased and Pages is enabled on the private repo |
| (ii) Publish from a separate public repository holding only a fresh single-commit or build-output history | The private repo (`muhibm1/Portfolio`, full SDLC history, phone number in history) never goes public; only `dist/` or a squashed snapshot does | Changes ADR 0005 and `deploy.yml` (publishing into a second repository needs a write credential to that repository, which this change's spec flagged as needing a spec amendment, `docs/hosted-config.md` section 2). New workflow logic, new credential to manage, new place for `docs/hosted-config.md` to go stale against | Two repositories to keep in sync; the public one has no commit history to audit from, which is a smaller due-diligence footprint but also less transparent if anyone ever asks how the site was built |
| (iii) Rewrite history (`git filter-repo` or similar) before going public, including rewriting author/committer emails to a GitHub-provided noreply address | Removes the phone number and the real email from every commit that survives the rewrite | Every commit hash in `approvals.md`, `state.json`, `verification.md`, `review-packet.md` and the ADRs becomes stale; the audit trail those files point to no longer resolves. Needs a force push, which `.workhorse/profile.yml` `deny_commands` and the bash guard refuse to any agent, so only you can run it, from a position of understanding you are invalidating the recorded approval evidence | The repository's history stops matching its own SDLC record. A rewritten history also cannot be un-rewritten if anyone cloned it in between |
| (iv) Go public as is | Nothing changes in the repository | None | The email, the phone number (in history only, not on the live site), the mockups and the full agent-run SDLC record all become public and clonable |

**This agent recommends nothing on this decision, as instructed.** GitHub's "keep my email
private" account setting only affects commits made after it is turned on, and only when the
commit's author email is set to the private `noreply` address GitHub issues; it does nothing to
commits already made with a real address, which is every commit in this repository today
(**believed, standard GitHub behaviour, not re-verified against GitHub's docs this session**).

---

## 4. Per-environment plan

| Environment | Command | Auto | Gate | This session |
|---|---|---|---|---|
| dev | `npm run dev` | Yes (profile) | none | Run and confirmed: Vite served `http://localhost:5173/Portfolio/` in 640 ms, then stopped (background task, terminated at end of turn). Log: `verify-logs/release-dev-start.log` |
| staging | (none) | No | n/a | Not applicable: no staging environment exists in `.workhorse/profile.yml` |
| prod | `git push origin main` | No | G5 | Not run by this agent. Owner-run per section 2 above, after G5 approval |

---

## 5. Runbook

| Signal | Where you see it | Action |
|---|---|---|
| Build, lint, test or audit failure | Red check on the commit in GitHub Actions; GitHub's workflow-failure email to the actor (believed, not verified) | Open the failed step's log. If it is the dependency-pin check or the audit, do not widen the gate; fix the pin or escalate. If it is a lockfile drift, re-run `npm ci` locally first |
| Deploy failure | Same, plus the Pages deployment history under the repository's Environments tab | Check whether the Pages source is set to GitHub Actions (section 2d); this is the most likely first-run failure |
| Asset 404s from the wrong base path | The R80 smoke step fails, naming the asset URL that did not return 200 | Confirm `vite.config.js` still sets `base: '/Portfolio/'` and that the repository name has not changed |
| Pages source not set | `actions/deploy-pages` fails in the deploy job (believed, not verified this session, see section 2d) | Set Settings > Pages > Source to GitHub Actions, then re-run the failed job |
| Workflow secret or permission error | The failing step names the missing permission; this workflow declares `contents: read`, `pages: read` on build and `pages: write`, `id-token: write` on deploy only | Confirm the two jobs' `permissions:` blocks in `deploy.yml` were not narrowed by a branch-protection or organization policy change; this workflow needs no secret at all |
| `npm ci` fails on the Linux runner | The build job's "Install dependencies" step fails | Check for a reintroduced platform-restricted dependency (the original defect this change removed, `@rolldown/binding-win32-x64-msvc`); check the lockfile is committed and matches `package.json` |
| The CSP blocks something | Browser console shows a CSP violation (R84 manual check only; no automated step can see this) | Identify the blocked origin or inline handler; either move it same-origin or add the minimum directive needed, then re-run R84 |
| Deep link 404s for real (not the SPA fallback) | R81 smoke step fails, body does not match root | Confirm `vite.config.js`'s `closeBundle` step still copies `index.html` to `404.html` and that the build produced both files |
| Phone number regresses onto the live page | R82 smoke step fails on the generic phone-pattern check | Treat as a Critical incident: identify what re-added it (a data revert, a copy/paste), fix at the source, redeploy, then re-run `scripts/check-phone-redaction.mjs` locally before the next push |

---

## 6. Rollback, rehearsed

### Documented procedure

1. **Fastest: unpublish.** Settings > Pages > Source, set back to "Disable" (exact control name
   **believed, not verified** by this agent this session; confirm against GitHub's current
   Settings > Pages UI before relying on it). Removes the live site; does not touch `main`. Use
   this if the deployed content itself, not the workflow, is the emergency.
2. **Revert the merge on `main`.** `git revert -m 1 <merge-commit-sha>` on a branch, PR it (or push
   directly, since PRs are not required on this repository), merge. This takes `main`'s source tree
   back to its pre-change state, but it does **not**, by itself, change what Pages serves.
   **Confirmed by inspection of this revert's own diff, section 6 rehearsal below:** the same
   revert deletes `.github/workflows/deploy.yml`, so the push that lands the revert builds and
   deploys nothing further; the previously-deployed bad site stays live on Pages until a corrective
   action. To actually take the bad site down, combine this step with step 1 (unpublish or
   disable). To roll back to an earlier good deployment while keeping the pipeline in place, revert
   only the offending commit(s) instead of the whole merge, so `deploy.yml` stays on `main` and the
   push redeploys the reverted tree automatically.
3. **Re-run an older successful Actions run.** From the Actions tab, re-run the last known-good
   workflow run. Works only while its Pages deployment artifact still exists (believed, short
   retention, not verified: this project has never had a real deploy to check against).
4. Nothing crawlers or search engines already copied can be recalled, regardless of method
   (`docs/sdlc/constraints.md`, `evals.md` "Unrecoverable" failure class).

### What was rehearsed, this session, without touching the real `main` or pushing anything

All commands run from `C:\Users\alqai\Portfolio`, git-bash, this session:

```
git branch wh-rehearsal-main main            # throwaway copy of main, exit 0
git branch wh-rehearsal-change HEAD          # throwaway copy of the change branch, exit 0
git checkout wh-rehearsal-main               # exit 0
git merge --no-ff wh-rehearsal-change -m "test: rehearsal merge ..."   # exit 0, "Merge made by the 'ort' strategy"
git diff --stat wh-rehearsal-change HEAD     # empty: merge tree == change-branch tree
git revert -m 1 --no-edit <merge-sha>        # exit 0, 92 files changed, 1729 insertions(+), 9118 deletions(-)
git diff --stat wh-rehearsal-main main       # empty: reverted tree == original main tree, byte for byte
npm run build                                # on the reverted tree, exit 0, "built in 3.38s"
git checkout wh/2026-09-11-...                # back to the real change branch, exit 0
git update-ref -d refs/heads/wh-rehearsal-main
git update-ref -d refs/heads/wh-rehearsal-change   # both throwaway refs removed, confirmed empty `git branch --list`
```

**Result: confirmed.** A merge of this change into `main` followed by `git revert -m 1` of that
merge commit restores `main`'s pre-merge tree exactly (`git diff --stat` produced no output). The
reverted tree still builds (`npm run build` exit 0), using the already-installed `node_modules`
tree rather than a from-scratch `npm ci` against the older `package.json`; this rehearsal proves
the git-level revert mechanics, not a full re-provisioned environment, which is stated here rather
than implied.

**Working tree hygiene during the rehearsal:** a pre-existing, not-mine modification to
`conductor-log.md` was present before this rehearsal started (visible in `git status` at the start
of this session). It was stashed (`git stash push -u`) before the branch checkouts required for
the rehearsal, and popped back afterward (confirmed unchanged by `git status` after `stash pop`).
No file this agent did not intend to touch was discarded.

**Not verified, and cannot be rehearsed locally:** anything that happens on GitHub itself
(Actions re-running an old deployment, the Pages "Disable source" button, propagation timing, the
actual `deploy-pages` action's behaviour). These are labelled **not verified** in the runbook
above and can only be exercised against the real, live repository after the first deploy.

---

## 7. Local verification evidence (Node v22.12.0, this session)

| Check | Command | Exit code | Output/log | Status |
|---|---|---|---|---|
| Node version | `node --version` | n/a | `v22.12.0` | confirmed |
| Install | `npm ci` | 0 | `verify-logs/release-npm-ci.log` | confirmed |
| Lint | `npm run lint` | 0 | `verify-logs/release-lint.log` | confirmed |
| Test | `npm test` | 0, 23 files, 191 passed | `verify-logs/release-test.log` | confirmed |
| Build | `npm run build` | 0 | `verify-logs/release-build.log` | confirmed |
| Blocking audit | `npm audit --omit=dev --audit-level=high` | 0, "found 0 vulnerabilities" | `verify-logs/release-security-audit.log` | confirmed |
| Full-tree audit (informational) | `npm audit --audit-level=high` | 1, 4 vulnerabilities (3 moderate, 1 high) | `verify-logs/release-security-audit-full.log`; JSON diff (scratchpad, not committed) confirms exactly the 5 ADR 0009 GHSA ids (`GHSA-4w7w-66w2-5vf9`, `GHSA-67mh-4wv8-2f99`, `GHSA-82fw-gwwq-j7x9`, `GHSA-fx2h-pf6j-xcff`, `GHSA-v6wh-96g9-6wx3`), none new | confirmed |
| Dist base path | `grep -oE '(src\|href)="[^"]*"' dist/index.html` | n/a | all three references begin `/Portfolio/` (favicon, module script, stylesheet) | confirmed |
| No mockups in `dist/` | `find dist -iname "mockup*"` | n/a | 0 files | confirmed |
| Phone redaction self-test | `node scripts/check-phone-redaction.mjs --self-test` | 0 | "17 of 17 form renderings hit, 0 of 9 near-misses hit" | confirmed |
| Phone redaction, tracked tree | `node scripts/check-phone-redaction.mjs` | 0 | "Scanned 102 files (5 skipped as binary, 0 missing, 0 undecodable), 0 hits" | confirmed |
| Phone redaction, `dist/` | `node scripts/check-phone-redaction.mjs dist` | 0 | "Scanned 109 files (121 skipped as binary, 0 missing, 0 undecodable), 0 hits" | confirmed |
| `npm run dev` starts | `npm run dev` | started, then stopped (background task) | `verify-logs/release-dev-start.log`: "VITE v5.4.21 ready in 640 ms", served `http://localhost:5173/Portfolio/` | confirmed |
| Repository visibility and Pages state | `gh api repos/muhibm1/Portfolio` | 0 | `"private": true`, `"visibility": "private"`, `"has_pages": false` | confirmed |
| `main`'s tree has no workflow | `git ls-tree -r main --name-only` | 0 | 51 paths, no `.github/` | confirmed |
| Origin has no branches | `git ls-remote --heads origin` (this session, implicit via `gh api` above and the conductor's prior confirmation) | n/a | not re-run by this agent; carried from the conductor's confirmation this session ("origin exists but is empty: no `main`, no change branch, no PR") | believed, carried from the conductor, not re-run by this agent |
| Rollback rehearsal | see section 6 | 0 at every step | described above | confirmed |

All commands above were run, or are marked "not run"/"believed" with a reason.

---
---

# G5 packet: deploy

Change id: `2026-09-11-deployed-multi-page-portfolio-on-github-pages`
Gate: G5. Tier: 2. Branch: `wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages` at
`839b67b`. PR: none (cannot exist until `main` is on origin, section 2a).
Prepared: 2026-09-13.

## 1. TL;DR

This packet asks you to authorise publishing a change that has passed G1 through G4 (two G4
rejections, fixed and re-verified each time) to a repository that does not yet have `main` or any
branch on GitHub at all. Locally, everything is green: lint, 191 tests, the build, and the scoped
security audit all exit 0, the phone number is confirmed absent from the tracked tree and from
`dist/`, and a rollback (merge, then revert) was rehearsed and restores `main`'s exact prior tree.
The one irreducible decision is yours alone: the repository must become public, or move to a paid
plan, for GitHub Pages to serve it, and going public publishes your full git history, including the
phone number and one email address, permanently to anyone who clones it once public. Which of
these you pick also decides the order the remaining publishing steps run in: see the
order-of-operations table in section 2, since the Pages source cannot be set until that decision is
executed, and the merge should not happen until the Pages source is set.

## 2. Decisions requested

| # | Decision | Recommendation | Alternative | If you choose the alternative |
|---|---|---|---|---|
| D1 | Your own confirmation of ADR 0009 (accepting 5 dev-only Vite/Vitest/esbuild advisories) and the `--omit=dev` `security_audit` scope, currently ratified only by delegation under "Approve every command yourself, I'm busy" | Read ADR 0009 (`docs/sdlc/.../adr/0009-...md`) and confirm explicitly in your approval notes; no code change needed, the blocking audit already passes at 0 | Decline | Revert `.workhorse/profile.yml` `commands.security_audit` to the unscoped `npm audit --audit-level=high`; Verify goes red on the same 5 GHSA ids until Vite 6+/Vitest 4+ lands, which ADR 0004 declined to do in this change |
| D2 | Repository visibility, presented neutrally in section 3 above (this agent recommends nothing here, as instructed): keep private and pay for a plan that serves Pages from private repos; publish from a separate public repository; rewrite history before going public; or go public as is | No recommendation. Whichever you choose, decide it **before** step 2e in the publishing sequence, since it gates whether Pages can serve at all | (n/a, this is the decision itself) | See the options table in section 3 for each alternative's cost and consequence |
| D3 | The order of operations in section 2 (push `main` now; then the change branch and PR; then the D2 visibility or plan decision and its execution; then the Pages source setting; then a merge commit; then the four-item manual check), with the exact order between the D2 decision and the merge depending on which D2 option is chosen, per the order-of-operations table in section 2 | Approve as written. The merge-commit requirement specifically protects the SHAs `approvals.md` cites, and the Pages-source-before-merge ordering (for the options where it applies) avoids a first-run failure | Push `main` and the change branch together; squash/rebase the merge; or, under D2 option (iv), accept the alternative order (merge before visibility, one failed run, then re-run) instead of setting Pages source first | Squashing or rebasing drops or rewrites the commit SHAs five gate approvals point to, which breaks the audit trail this whole packet stands on. Accepting one failed run under option (iv)'s alternative order costs nothing but that failed run and keeps `main` private for one push longer |
| D4 | The two new Medium findings in `scripts/check-phone-redaction.mjs` from the last review round (a mixed-encoding file whose UTF-8 part is followed by a longer UTF-16LE-no-BOM part can miss a hit; a script started through a junction or symlink silently exits 0 without scanning) and the rest of the carried backlog (11 bug lows, 9 conformance lows, 15 security lows, adoption 3/5) | Accept as a tracked follow-up, not release-blocking at tier 2. The current tree is independently confirmed clean today (this session's own scan, section 7: 0 hits) | Hold G5 for a fix loop first | Another build/verify/review loop before any deploy, for two gaps that are silent-false-pass paths in a detection script, not a live exposure today |

## 3. Evidence

See section 7 above for this session's own run (Node v22.12.0). Carried from `review-packet.md`
(G4, `839b67b`'s parent chain), not re-run in full by this agent since nothing has changed since
that approval:

| Check | Command | Exit code | Status |
|---|---|---|---|
| Full G4 verification | lint, 191 tests, build, scoped audit | all 0 | confirmed by the verifier at `b91d04f`, re-confirmed by this agent's own run this session at `839b67b` (no source changes between the two) |
| Eval pass rates | golden 84/84 automatable, edge 22/22 (1 manual by design), failure 16/16 scoreable, adversarial 15/15 automated (2 documented, not pass/fail) | n/a | believed, carried from `review-packet.md`, not re-run by this agent (this agent has no eval-runner role) |
| Findings at G4 | 0 critical, 0 high, 3 medium open (D1, and the two D4 script gaps above), rest low | n/a | confirmed by reading `review-packet.md` section 4 |
| This session's own checks | see section 7 | see section 7 | confirmed |

## 4. Findings

Carried unresolved from `review-packet.md` (this agent's scope is release, not fix; nothing below
was edited):

| Severity | Finding | Status |
|---|---|---|
| Medium | D1: ADR 0009 / `--omit=dev` audit scope ratified by delegation, not read by the owner | Open, D1 above |
| Medium | Mixed-encoding tail can hide a UTF-8 hit in `check-phone-redaction.mjs` | Open, tracked follow-up, D4 above |
| Medium | Script started through a junction/symlink silently exits 0 | Open, tracked follow-up, D4 above |
| Low (new, this session) | `generate_viewer.cjs`, present on `main` today, discloses a local Windows path and username (`C:\Users\alqai\...`); resolved once this change merges (the file is deleted on this branch) | Open until merge, self-resolving |
| Low (new, this session) | No `.nvmrc` and no `engines` field in `package.json` pin the Node version this project needs (>=22.12.0 for `oxlint`'s native binding); a future Actions runner image bump or a new contributor on an older Node could silently fail lint again | Open, outside this agent's scope to fix |
| Low, carried | 15 security lows, 11 bug lows, 9 conformance lows, adoption 3/5 | Open, tracked, D4 above |

## 5. Risk register

| Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Repository stays private; Pages never serves | Certain until D2 | Site never goes live | D2 must be decided before step 2e | Site owner |
| Making the repository public exposes the phone number in history and one email on every commit | Certain, once public | Personal data becomes permanently clonable | D2 options table, section 3; no recommendation given, by instruction | Site owner |
| Pages source set after the first workflow run | Medium (order easy to get wrong; only the D2-option-(iv)-alternative path in section 2's order-of-operations table sets it after the merge on purpose) | First deploy run fails at the `deploy-pages` step (believed) | Follow the order-of-operations table in section 2 for the chosen D2 option; where that order sets the Pages source before the merge, no failure occurs; where the alternative order for option (iv) accepts one failed run, re-run the failed job after step d, no new push needed | Site owner |
| A future edit reintroduces a phone-number rendering the redaction script cannot catch (mixed encoding, or run through a symlink) | Low (script tree confirmed clean today) | A phone-number leak into a future commit goes undetected by the dev-host script | D4, tracked follow-up | Site owner, next change touching these docs |
| The blank-page-with-a-green-check gap (React throws during mount, `curl` cannot tell) | Low to Medium | Total outage with zero automated signal | R84's dated manual four-item check is the only control, run after every deploy and after any change to `vite.config.js`/`index.html`/`package.json` | Site owner |
| Merging with squash or rebase instead of a merge commit | Low (this packet states the requirement plainly) | Breaks the SHA references in `approvals.md` and every ADR that cites a commit | D3 names the merge method explicitly | Site owner |
| History rewrite chosen to reduce exposure (D2 option iii) | Low unless chosen | Invalidates every approval-commit reference; needs a force push agents cannot run | Named explicitly in section 3; only the owner can execute it, informed of the cost | Site owner |

## 6. Diff or design tour, as it applies to a release

Not a code diff (that was G4's job; nothing changed here). What a reader judging this release
should look at, in risk order:

1. **The publishing sequence itself (section 2).** The highest-risk step is 2e (visibility), which
   gates whether anything can go live, and 2c (merge method), which protects the audit trail.
2. **`.github/workflows/deploy.yml`.** Reviewed at G4 (`review-packet.md` design/diff tour), not
   re-read line by line here; its gates (pin check, lint, tests, floor, build, scoped audit) are
   exactly what stood between every commit above and a deploy, and will run for real on the first
   push.
3. **`docs/hosted-config.md`.** The record of every dashboard setting this release depends on
   (Pages source, visibility, branch protection, secrets, the R84 manual check). Section 2 above
   is this release's operational restatement of it.
4. **`scripts/check-phone-redaction.mjs` and its two open Medium gaps.** Not fixed here by design
   (D4); the current tree is independently confirmed clean, so this is a forward-looking control
   gap, not a live exposure.
5. **Git history itself.** Section 3 is the tour of what history contains that the working tree no
   longer does.

## 7. Checklist

Standard items:

- [ ] D1: you have read ADR 0009 and confirm the `--omit=dev` audit scope yourself
- [ ] D2: you have chosen a visibility option from section 3's table (no default is assumed)
- [ ] D3: you approve the publishing sequence in section 2, including the merge-commit requirement
- [ ] D4: you accept the two new script gaps and the carried backlog as tracked, not blocking
- [ ] You understand that `git push origin main` (step 2a) is the first step, is irreversible in
      the sense that anyone who clones between step 2a and any future history rewrite keeps a copy
      forever, and that only you run it
- [ ] The rollback procedure (section 6 above) and its rehearsal are acceptable
- [ ] The runbook (section 5) and R84's manual check are things you are able and willing to run
      after every deploy

Security pre-ship checklist, tier 2, embedded verbatim, this agent's own disposition (no new
security-relevant code was written by this agent; this restates the G4 reviewer's dispositions,
re-checked where this agent could check them independently this session):

- [ ] Every new or changed `for update` policy: all columns listed, each decided, pinning trigger
      added where the policy is not sufficient. **N/A: no database.**
- [ ] Every new or changed `for insert` policy: the UPDATE path re-checks the same invariants.
      **N/A: no database.**
- [ ] Every new function: explicit grant or revoke in the same migration; `SECURITY DEFINER`
      justified; `search_path` set; anchored to `auth.uid()` or the reason stated. **N/A: no
      database.**
- [ ] Every `CREATE OR REPLACE`: diffed line by line; side effects confirmed present. **N/A: no
      database.**
- [ ] Every new policy ships two tests in the same commit. **N/A: no policies.**
- [ ] Deny-side assertions distinguish failure modes. **N/A: no policies.**
- [ ] New storage bucket: private unless there is a written reason. **N/A: no storage bucket.**
      `public/`/`docs/design/` are world-readable by design once the repository is public; this is
      the tracked-mockup exposure named in section 3, not a storage-bucket finding.
- [ ] New table holding user free text: length constraint, and a rate limit if insertable in a
      loop. **N/A: no user input anywhere in this project.**
- [ ] New admin capability writes to an append-only log. **N/A: no admin surface.**
- [ ] New secret or env var covered by `.gitignore` as a pattern, confirmed with `git ls-files`.
      **Pass, re-confirmed this session:** `git log --all` for `.env*` returns 0 commits (section
      3); `.gitignore` at HEAD carries the pattern `.env*`, confirmed by reading it.
- [ ] New third-party import in a runtime path pinned to an exact version. **Pass, carried from
      G4:** no new runtime dependency this release; the deploy workflow itself pins every GitHub
      Action to a full commit SHA (confirmed by reading `deploy.yml`).

Checklist result: 2 pass, 0 fail, 9 n/a (unchanged from G4, since this agent added no new
security-relevant code).

## 8. Recommendation

**Recommend approve with conditions:** (1) you choose the visibility or plan option (D2) in section
3 and then follow the order-of-operations table in section 2 for that option, since the Pages
source cannot be set until the visibility or plan decision is executed, and the merge should not
happen until the Pages source is set (D2 gates whether Pages can serve at all, and this agent gives
no recommendation on which option, as instructed); (2) D1, you read ADR 0009 and confirm the
`--omit=dev` audit scope yourself, rather than by delegation; (3) D3, you approve the order of
operations as written, in particular the merge-commit requirement in step 2c; (4) D4, the two new
`scripts/check-phone-redaction.mjs` detection gaps and the rest of the carried backlog stay tracked
as a follow-up, not release-blocking at tier 2, since the current tree is independently confirmed
clean today by this agent's own scan.

No agent runs the production push or the merge, at this tier or any tier. After you approve G5,
you push `main` yourself (step 2a). Once you confirm `main` is on origin, the conductor may push
the change branch and open the PR (step 2b). You then decide and execute the D2 visibility or plan
option, set the Pages source, and merge with a merge commit, in whichever order the D2 table in
section 2 gives for the option you chose; the merge is the release, and you perform it. You run the
R84 post-deploy check yourself after the first deploy and record the result in
`docs/hosted-config.md` section 6; an agent may then, on a later dispatch, copy that recorded
outcome into this file's section 2f log and the deploy record.

```
/workhorse:approve G5
/workhorse:approve G5 --reject "notes"
```

---
---

# Deploy record (post-G5, 2026-09-13)

Appended by an agent this session, after G5 was approved and the release already happened. This
is a new section at the end of the file. Appending it changes this file's own sha256; it does not
touch the approved G5 packet above, which is preserved unmodified in commit `95c2736` (sha256
`b64890947c9cfe33aa46e57c085aa40971cf0fadfdec293791fa75a944dc1e5b`). No earlier byte in this file
was edited to write this section.

Every claim below is labelled **confirmed** (checked by this agent, this session, command shown)
or **believed, not verified** (reported by the main session or the conductor, not re-checked here).
No new local verification suite was re-run, on instruction; this is a record of what already
happened, not a fresh gate.

## a. What was released

- Merge commit **confirmed**: `d5ad8b0` (`git log -1 --oneline d5ad8b0` returns
  `d5ad8b0 Merge pull request #1 from muhibm1/wh/2026-09-11-deployed-multi-page-portfolio-on-github-pages`).
  `git rev-parse origin/main main` returns `d5ad8b0...` for both, so local `main` and `origin/main`
  match (**confirmed**).
- Approved head **confirmed**: `0172210` (this change's branch HEAD named in the job dispatch;
  reachable from `d5ad8b0` as the merged-in side, not independently re-walked this session).
- Workflow run **confirmed**: `34773728394`, "Build and deploy to GitHub Pages", triggered by the
  push that landed the merge to `main`.
- Live URL **confirmed reachable**: `https://muhibm1.github.io/Portfolio/` (`curl -sI`, see
  section c).

## b. Order actually followed

Set against the section 2 table for D2 option (iv) (a, b, e, d, c, f), what happened was e, a
(with a retry), b, G5 approval, d, c, f in progress. This departs from the packet's stated order
in one respect: the packet's table put a and b before e; here e (going public) happened first,
while the repository was still empty, before `main` had any content pushed to origin.

1. **e, visibility.** At 14:27Z the main session ran `gh repo edit` to make `muhibm1/Portfolio`
   public, on the owner's explicit instruction, while the repository was still empty (**believed,
   not verified**; conductor log). bash-guard refused the main session's own attempt to publish
   `main` directly and was not bypassed (**believed, not verified**, same source). Performed by:
   the main session, on the owner's instruction.
2. **a, the owner pushes `main`.** The owner pushed `main` himself, landing at `942d311`
   (**believed, not verified**). A first attempt reportedly did not land on origin and was repeated
   (**believed, not verified**, no further detail logged). From about 18:02Z to 18:08Z, `main` at
   `942d311` was the public default-branch view, still carrying the phone number in
   `src/data/portfolioData.js`, `generate_viewer.cjs`, and the `public/` mockups (section 3's
   option (iv) exposure, accepted by the owner). Performed by: the owner.
3. **b, branch and PR.** The change branch was pushed at `9f5f077` and PR #1 opened at about
   18:02Z (**believed, not verified**). Performed by: the main session or the conductor, per the
   packet's step 2b allowance.
4. **G5 approval.** Recorded approved at 2026-09-13T18:03:32Z, artifact commit `95c2736`
   (**believed, not verified**; this agent did confirm G5 is still `approved` this session,
   `wh state get gates.G5`).
5. **d, Pages source.** Created via `gh api` with `build_type=workflow`, `https_enforced: true`, on
   the owner's instruction (who ran it: **believed, not verified**; the resulting state is
   **confirmed**: `gh api repos/muhibm1/Portfolio/pages` returns `"build_type":"workflow"`,
   `"https_enforced":true`, `"source":{"branch":"main","path":"/"}`). Performed by: the main
   session, delegated by the owner.
6. **c, the merge.** The main session merged PR #1 at the approved head `0172210`, producing
   `d5ad8b0` (**confirmed** the commit exists and merges two parents; who clicked merge is
   **believed, not verified**). Performed by: the main session, delegated by the owner. This departs
   from the G5 packet's line "No agent runs the production push or the merge, at this tier or any
   tier": the owner delegated the Pages-source step and the merge to the main session; the push of
   `main` itself (step a) was the owner's own action. Recorded plainly, as instructed, rather than
   reconciled with the packet's stated norm.
7. **f, post-deploy check.** In progress; see section d.

## c. CI and smoke results

Run `34773728394`, both jobs, **confirmed** via `gh run view 34773728394 --json jobs`:

| Job | Step | Conclusion |
|---|---|---|
| Build and test | Dependency pin check (R85) | success |
| Build and test | Install dependencies | success |
| Build and test | Lint | success |
| Build and test | Run the tests | success |
| Build and test | Test-count floor (R52) | success |
| Build and test | Build | success |
| Build and test | Audit runtime dependencies (blocking) | success |
| Build and test | Audit the full dependency tree (informational) | success |
| Build and test | Upload dist as the Pages artifact | success |
| Deploy and smoke-test | Deploy to GitHub Pages | success |
| Deploy and smoke-test | Smoke R63 (root fetch, retrying) | success |
| Deploy and smoke-test | Smoke R87 (header dump, informational) | success |
| Deploy and smoke-test | Smoke R80 (asset paths, script, stylesheet, font) | success |
| Deploy and smoke-test | Smoke R81 (deep-link body matches root) | success |
| Deploy and smoke-test | Smoke R82 (CSP, referrer, privacy removals) | success |

Every step in both jobs concluded `success` (**confirmed**). No step failed; the workflow file
`.github/workflows/deploy.yml` was read this session and matches the step names above.

## d. Post-deploy checks (R84, `docs/hosted-config.md` section 6)

| # | Check | Result |
|---|---|---|
| 1 | Home page renders content inside `#root` in a real browser | Pass (**believed, not verified this session**; reported by the main session) |
| 2 | Orb animates and stops when the tab is hidden | Paints confirmed by the main session (12020 non-transparent pixels at 420x420, `role="img"`, `aria-label` present, **believed, not verified this session**); "stops when the tab is hidden" was **not checked** by anyone |
| 3 | Deep link pasted into a fresh tab renders the case study | Renders, pass (**believed, not verified this session**, main session's browser check), with the HTTP status noted below |
| 4 | Browser console shows no CSP violation and no uncaught error | **FAIL**, 12 CSP violations (see section e) |

Additional live checks, **confirmed this session**:
- `curl -sI https://muhibm1.github.io/Portfolio/` returns `HTTP/1.1 200 OK`, with
  `Strict-Transport-Security: max-age=31556952` present.
- `curl -s -o /dev/null -w '%{http_code}' https://muhibm1.github.io/Portfolio/work/apple-llm-triage`
  returns `404`. This is the `404.html` SPA fallback by design (ADR 0002, `deploy.yml` R81 comment:
  "Pages answers this path with 404.html, a copy of index.html, so the status is 404 by design").
  The page body still renders the case study in a browser per item 3 above.

**The owner has not yet recorded R84 in `docs/hosted-config.md` section 6** (**confirmed**: that
file's section 6 log still reads "No entries yet. The site has not been deployed."). Proposed log
line, in that section's exact format, for the owner to add himself (not written into
`docs/hosted-config.md` by this agent):

```
2026-09-13 d5ad8b0 first deploy (run 34773728394) 1 pass, 2 pass (paint only; tab-hidden pause not
checked), 3 pass (HTTP 404 by design, ADR 0002; body renders), 4 fail: 12 CSP font-src violations
from data: JetBrains Mono Cyrillic-ext/Vietnamese subsets. See release.md "Deploy record" for detail.
```

## e. Defects and open items after release

- **Font CSP defect, open, not filed anywhere except the conductor log.** Cause: `vite.config.js`
  (read this session) sets no `assetsInlineLimit` override, so Vite's default of 4096 bytes applies
  (**confirmed** the setting is absent from the file; the 4096-byte default itself is Vite's
  documented behaviour, **believed, not verified**, docs not re-fetched this session), inlining 12
  small JetBrains Mono Cyrillic-ext and Vietnamese subset font files as `data:` URIs. `font-src
  'self'` (set in `vite.config.js`, confirmed by reading it) blocks them, producing 12 console CSP
  errors; English text is unaffected. Why R82 missed it: R82 (`deploy.yml`, read this session)
  asserts exact counts for the CSP meta tag, referrer meta tag, inline scripts, Google Fonts
  references and phone-shaped strings in the served HTML and module script only; it never parses
  the stylesheet for `data:` font URLs and runs no browser, which is exactly the R84 gap the manual
  check exists to cover. The main session reportedly said this was "filed as a follow-up change",
  but the conductor found no GitHub issue (`gh issue list --state all` empty, **believed, not
  verified**, conductor's own check) and no `docs/sdlc/` directory for it. Recorded here as
  **open, not filed anywhere but the conductor log**.
- **Deep-link HTTP 404 status.** Crawlers and link previews that read the HTTP status rather than
  the body may treat `/work/apple-llm-triage` and the other case-study routes as not-found and
  decline to index or preview them, even though a browser renders the content (**believed, not
  verified**; per ADR 0002's own tradeoff, not re-litigated here).
- **Five open Dependabot PRs against `main`**, **confirmed** (`gh pr list --state open`): #2
  `@fontsource/inter` 5.2.8 to 5.3.0, #3 `vitest` 3.2.7 to 5.0.0, #4 `jsdom` 26.1.0 to 30.0.1, #5
  `@vitejs/plugin-react` 4.7.0 to 6.1.1, #6 `@testing-library/jest-dom` 6.9.1 to 7.0.1. #3 and #5
  bear on ADR 0009 and the B2 pin decision (`vitest` pinned at `3.2.7`). Owner's to decide; this
  agent took no action on any of them.
- **Carried G4/G5 mediums, still open**: the two `check-phone-redaction.mjs` detection gaps (a
  mixed-encoding file can miss a hit; a script run through a junction or symlink silently exits 0),
  tracked as a follow-up per the G5 packet's D4, not release-blocking at tier 2. The rest of the
  carried backlog (11 bug lows, 9 conformance lows, 15 security lows, adoption 3/5) is unchanged.
- **No `.nvmrc` and no `engines` field** pin the Node version this project needs (`>=22.12.0`),
  already flagged as a new low finding in the G5 packet and still open.

## f. Rollback, with real values

Per section 6's rehearsed procedure, applied to the actual released commit:

```
git revert -m 1 d5ad8b0
```

Reverts the merge on `main`, taking the tree back to its pre-merge state. As rehearsed in section
6, this also deletes `.github/workflows/deploy.yml`, so the push that lands the revert builds and
deploys nothing further; the already-deployed site stays live on Pages until a separate action.
Combine with unpublishing to actually take the site down:

- Settings > Pages > Build and deployment > Source, set back to "Disable" (exact control name
  **believed, not verified this session**; same caveat as section 6).

Neither command was run this session. Both are marked **not run**, consistent with this being a
read-only, record-only pass.

---

**Verification run this session, not the full suite:**

- `node scripts/check-phone-redaction.mjs`, exit code **0** (**confirmed**, run this session with
  the Node 22 PATH prefix; output not quoted here beyond the exit code, per instruction not to
  reproduce phone-redaction script output verbatim unless needed).
- Em-dash count in this appended section: **0** (**confirmed**, checked before saving).

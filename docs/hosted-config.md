# Hosted configuration

Every setting for the public site that lives in the GitHub dashboard instead of this repository,
recorded here so it can be reviewed and does not drift silently (spec R69). This file also holds
the post-deploy manual check (R84), the `security.txt` caveats (R67) and the subprocessor list.

Site: `https://muhibm1.github.io/Portfolio/`. Repository: `muhibm1/Portfolio`.
Written 2026-09-12 by change `2026-09-11-deployed-multi-page-portfolio-on-github-pages` (task
T13), before the first deploy. Each fact is labelled confirmed (observed on that date) or
believed, not verified. The owner updates this file whenever a dashboard setting changes, and
writes every date as `YYYY-MM-DD`.

## 1. Pages source

- Required: Settings, Pages, "Build and deployment", Source set to **GitHub Actions**, not
  "Deploy from a branch". The workflow cannot make this setting, and the first deploy fails
  without it (spec "Deploy pipeline", failure mode FL15).
- State on 2026-09-12: not set. Pages is not enabled on the repository. Confirmed:
  `gh api repos/muhibm1/Portfolio` returned `has_pages: false`.
- Depends on item 2. GitHub Free serves Pages only from public repositories (confirmed by the
  main session against docs.github.com on 2026-09-12, `conductor-log.md`; not re-read here).
- Owner: after item 2 is settled, set the source and add a line here:
  `YYYY-MM-DD Pages source set to GitHub Actions.`

## 2. Repository visibility

- State on 2026-09-12: private. Confirmed: `gh api repos/muhibm1/Portfolio` returned
  `private: true`, `visibility: "private"`.
- Decision: **open**. G3-D3 was not answered at the G3 approval (the notes in `approvals.md`
  cover D1, D2, D4 and D5 only). It blocks the first deploy at G5, not the build. The owner
  decides before the first push to `main`.
- The options, as the G3 packet gave them (`plan.md`, decision G3-D3):
  - Recommended: make `muhibm1/Portfolio` public before the first push to `main`. This also
    publishes the git history, which still contains the full phone number (item 7), and all of
    `docs/sdlc/**`, including agent logs and the approver email address recorded in
    `approvals.md`.
  - Alternative (a): a paid GitHub plan, which keeps the repository private. It conflicts with
    `docs/sdlc/constraints.md` business constraint 5 (no paid services).
  - Alternative (b): keep the source private and publish `dist/` to a separate public
    repository. This changes ADR 0005 and the deploy workflow. Publishing into another
    repository needs a write credential (believed, not verified), which breaks R58 and R64, so
    it needs a spec amendment before any workflow change.
- Owner: record the answer here:
  `YYYY-MM-DD Visibility decision: <option chosen>, set in Settings, General.`

## 3. Branch protection on `main`

The spec ("Deploy pipeline", branch protection) takes three positions:

| Protection | Position | Reason |
|---|---|---|
| Require a pull request before merging | Deliberately not enabled | It would break the deploy-on-push release model, which `constraints.md` lists under "Things that must not change without the owner saying so" |
| Block force pushes on `main` | Recommended, enable when setting the Pages source | Costs nothing and does not interfere with `git push origin main` |
| Block deletion of `main` | Recommended, enable when setting the Pages source | Costs nothing and does not interfere with `git push origin main` |
| Require status checks to pass, without requiring a pull request | Enable if GitHub allows it without a pull request (believed, not verified that it does) | It would turn "CI fails just after the push" into "the push is refused". If GitHub does not allow it, the gap is an accepted risk, owner: site owner. The compensating control is that the workflow runs the pin check, lint, tests, the test-count floor, the build and the audit before anything reaches Pages |

- State on 2026-09-12: no branch protection is enabled, and none can be enabled yet. Confirmed:
  `gh api repos/muhibm1/Portfolio/branches/main/protection` returned HTTP 403 with the message
  "Upgrade to GitHub Pro or make this repository public to enable this feature". This depends
  on item 2.
- Owner: once item 2 is settled, record which protections are enabled:
  `YYYY-MM-DD Branch protection on main: <enabled list>; not enabled: <list and reason>.`

## 4. Actions secrets

- Required: none. The workflow references no secret of any kind (R64). The deploy job
  authenticates to Pages with its own short-lived token from `id-token: write` (spec R60,
  ADR 0005; believed, not verified until the first run).
- State on 2026-09-12: the repository has no Actions secret. Confirmed:
  `gh api repos/muhibm1/Portfolio/actions/secrets` returned `total_count: 0`. Secrets on the
  `github-pages` environment were not checked, because that environment does not exist until
  Pages is enabled (believed, not verified).
- Any secret that appears later is a finding: the deploy needs none.

## 5. Response headers GitHub Pages sets

GitHub Pages does not let this project set response headers. The Content-Security-Policy and
the referrer policy therefore ship as meta tags in the built HTML (R65, R88). Which headers
GitHub Pages sends on its own is settled with evidence at the first deploy, not asserted here.

- State on 2026-09-12: **placeholder, not recorded yet.** The site has never been deployed.
- The deploy workflow's smoke step prints a header dump of the published URL (`curl -sSI`) to the
  run log on every deploy (R87). It does not fail on a missing header.
- Owner: after the first successful run, paste the header dump below with the run date and the
  run URL.

```
Header dump from the first deploy run: not recorded yet.
```

## 6. Post-deploy manual check

Four things that no automated step this project runs can prove. There is no browser in CI, and
adding one (Playwright) was rejected on cost (spec R84, "Observability"). Work through all four
after the first deploy, and again after any later change to `vite.config.js`, `index.html` or
`package.json`, then append one dated line to the log below.

1. The home page renders content inside `#root` in a real browser.
2. The orb animates and stops when the tab is hidden.
3. A deep link pasted into a fresh tab renders the case study.
4. The browser console shows no CSP violation and no uncaught error.

Log format, one line per check, newest last:
`YYYY-MM-DD <commit sha> <trigger> 1 pass, 2 pass, 3 pass, 4 pass. <notes>`

Log:

- No entries yet. The site has not been deployed.

## 7. The phone number in git history

- Position: **accepted, not rewritten.** Owner: site owner. Source: spec "Data", "Retention",
  decision 2.
- The number is removed from the site (R41, authorised by G1-D1, "D1 remove phone", in
  `approvals.md`). In the working tree R89 redacts it at `docs/sdlc/constraints.md` line 102
  and at this change's `intent.md` line 199. The full number remains in this change's `spec.md`
  and `evals.md`, where it is the literal that the checks search for. Confirmed on 2026-09-12,
  it also remains at `intent.md` line 152 (a success-metric check) and line 311 (the G1 decision
  row). R89 did not name those two lines; whether to redact them is an open owner decision.
- Commits from `b50497f` onward contain the full number. Confirmed for `b50497f` itself:
  `git grep` finds it in that commit's `src/data/portfolioData.js`. Rewriting history with
  `git filter-repo` would invalidate every commit SHA quoted in `approvals.md`, `state.json` and
  the SDLC artifacts.
- The residual exposure is one phone number, the owner's own, visible to anyone who clones the
  repository and reads its history. It becomes reachable only if the repository is public
  (item 2).
- The owner can reverse this position before the first push that makes the history public, by
  keeping the repository private or by rewriting history. After that push, neither undoes a
  clone.

## `security.txt`

- The file is `public/.well-known/security.txt`, and Vite copies it to
  `dist/.well-known/security.txt` (R67).
- Location caveat: RFC 9116 expects the file at the origin root,
  `https://muhibm1.github.io/.well-known/security.txt`. That root belongs to the
  `muhibm1.github.io` user-site repository, not to this project site, so this file is served
  at `https://muhibm1.github.io/Portfolio/.well-known/security.txt` and its `Canonical` field
  says so. A scanner that only looks at the origin root will not find it. There is no fix
  without a custom domain (spec finding 10). Whether a `muhibm1.github.io` repository exists
  today is believed, not verified.
- Annual renewal: `Expires` is `2027-09-12T00:00:00.000Z`, one year from the commit that added
  the file. Before that date, set `Expires` one year ahead and push. An expired file tells a
  reporter that the contact may be stale. Suggested reminder: `2027-08-12`.
- `Contact` is a `mailto:` link to `personal.email` in `src/data/portfolioData.js`. It is a
  static copy: if that address changes, change this file in the same commit.

## Subprocessors

- **GitHub Inc. (GitHub Pages hosting) is the only remaining subprocessor.** Every page view
  discloses the visitor's IP address to GitHub. This is unavoidable for any host (spec
  "Security and privacy").
- Google Fonts is no longer one: the fonts are self-hosted (R37, R38). Confirmed on 2026-09-12:
  `grep -c "fonts.googleapis.com\|fonts.gstatic.com" index.html` returns 0.
- The site sets no cookies and loads no analytics, tracking pixels, embedded widgets or hosted
  forms (`CLAUDE.md`). The LinkedIn link and the `mailto:` links send nothing until a visitor
  clicks them.
- Adding any third-party script, font host, analytics tool or email provider adds a
  subprocessor. Record it here before it ships.

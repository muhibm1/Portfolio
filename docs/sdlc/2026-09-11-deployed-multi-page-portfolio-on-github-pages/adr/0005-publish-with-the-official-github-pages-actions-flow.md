# 0005: Publish with the official GitHub Pages Actions flow, pinned to commit SHAs

Date: 2026-09-11
Status: proposed
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages
Revised: 2026-09-11 after the G2 constraint audit. Two decisions changed: token scope moves from
workflow level to per job, and the branch-protection waiver narrows from all protections to the
pull-request requirement only. The `workflow_dispatch` trigger is dropped. Everything else is as
first written.

## Context

`R55` to `R64` and intent Outcome 1 require a workflow that publishes to
`https://muhibm1.github.io/Portfolio/` on a push to `main`. There is no `.github/` directory
today (confirmed by glob). `.workhorse/profile.yml` lists `.github/workflows/**` as a
`sensitive_path` and a `tier_floor_paths.2` entry, and `environments.prod.deploy` is
`git push origin main`, because the push is the release. The security baseline requires that CI
for any project runs lint, tests, build and a dependency audit, and that third-party code in a
runtime path is pinned to an exact version rather than a floating major.

## Decision

One workflow file, `.github/workflows/deploy.yml`, triggered by a push to `main` and nothing
else, in two jobs. The build job checks out, sets up Node 22 with the npm cache, asserts every
added dependency is pinned exactly, then runs `npm ci`, `npm run lint`, the test suite with a
JSON reporter followed by an assertion on the passing and skipped counts, `npm run build`, a
blocking `npm audit --audit-level=high --omit=dev` and a non-blocking full-tree audit, then
`actions/configure-pages` with `enablement: false` and `actions/upload-pages-artifact` with
`path: dist`. The deploy job depends on it, binds to the `github-pages` environment, and runs
`actions/deploy-pages`, followed by a blocking smoke step that fetches the published URL and
asserts what a `curl` can actually prove: status 200, every asset path base-correct and
resolving, a deep link returning the `404.html` fallback body, and the served HTML carrying its
CSP and referrer meta tags with no inline script, no Google Fonts origin and no phone number.

**Token scope is per job**, not workflow-wide: `contents: read` at workflow level, the build job
adding only `pages: read`, and `pages: write` plus `id-token: write` confined to the deploy job.
The build job runs `npm ci` over a regenerated tree with lifecycle scripts enabled and four
third-party actions; none of that needs the ability to publish. `concurrency` is `group: pages`
with `cancel-in-progress: false`. Every `uses:` is pinned to a full 40-character commit SHA with
the tag in a trailing comment, and `.github/dependabot.yml` carries a `github-actions` ecosystem
entry so those SHAs stay current.

## Alternatives

| Option | Why not |
|--------|---------|
| `peaceiris/actions-gh-pages` | Widely used, but it is one more third-party action holding a write token, and the official flow does not need a token at all: it uses OIDC through `id-token: write` |
| Deploy from a `gh-pages` branch built locally and pushed | Puts build output in git history forever, and makes the release depend on whatever is installed on the owner's laptop rather than on a clean `npm ci` |
| Pages "Deploy from a branch" pointed at `/docs` | No build step at all, so Vite could not run. Would mean committing `dist` |
| Pin actions to a major tag such as `@v5` | Simpler to read, and it is what most repositories do. A tag is mutable: whoever controls the action can move `v5` to new code that runs with `id-token: write` in this repository. The SHA removes that |
| One job instead of two | `actions/deploy-pages` is designed to run in a separate job bound to the `github-pages` environment, which is what makes the deployment show up in the repository's Environments history |
| Declare all three permissions at workflow level, as GitHub's own starter workflow does | Simpler, and it is the shape most repositories copy. It also hands `pages: write` and `id-token: write` to the job that installs and executes third-party package code. The split costs two extra lines |
| Also trigger on `workflow_dispatch` | Convenient for re-deploying without a commit. It is also a second production-publish path that an agent can reach behind a prompt, since `gh workflow run` is in profile `ask_commands`, while `git push origin main` is denied outright. Re-running a run from the Actions UI covers the same need without the asymmetry |

## Consequences

Easier: a push to `main` publishes, and a commit that fails the pin check, lint, the test-count
floor, the build or a runtime audit never reaches Pages. The Environments tab becomes a
deployment history the owner did not have to build. The smoke step turns "the workflow went
green" into "the published bytes are the bytes we meant to publish".

Harder: SHA pins are unreadable, so each one needs a trailing tag comment and Dependabot to keep
it honest, and a Dependabot pull request for an action is a real change that must be read rather
than merged on sight, because merging it deploys. Per-job permissions are two more blocks to
keep correct, and one unverified assumption comes with them: whether `actions/configure-pages`
runs with only `pages: read` when `enablement` is `false` is believed, not verified. If the
first run says otherwise, the remedy is to move that action into the deploy job, since this
workflow consumes none of its outputs, not to widen the build job.

What the smoke step still cannot do: it does not execute the page, so it cannot tell a mounted
application from a blank one. That gap is stated in the spec's Observability section, accepted
with the site owner named, and covered only by a manual post-deploy check.

Cost, and the owner must act on it: GitHub Pages rejects an Actions deployment until the
repository's Settings, Pages, Source is set to "GitHub Actions". The workflow cannot set that.
The first run fails without it, which is why `R69` records it in `docs/hosted-config.md`.

Accepted risk, narrowed after the G2 audit: the **pull-request requirement** is declined, because
it would break the deploy-on-push model that `docs/sdlc/constraints.md` protects. That is not the
same as declining branch protection. Blocking force pushes and blocking deletion of `main` are
compatible with deploy-on-push and are recommended to the owner. Whether GitHub can require
status checks to pass without also requiring a pull request is believed, not verified from this
host; if it can, the owner should enable it, and `docs/hosted-config.md` records whichever
outcome he reaches. The compensating control while any of this is absent is that the full gate
runs on every push, just after it rather than before a merge.

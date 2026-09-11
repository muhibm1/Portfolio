# 0005: Publish with the official GitHub Pages Actions flow, pinned to commit SHAs

Date: 2026-09-11
Status: proposed
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages

## Context

`R55` to `R64` and intent Outcome 1 require a workflow that publishes to
`https://muhibm1.github.io/Portfolio/` on a push to `main`. There is no `.github/` directory
today (confirmed by glob). `.workhorse/profile.yml` lists `.github/workflows/**` as a
`sensitive_path` and a `tier_floor_paths.2` entry, and `environments.prod.deploy` is
`git push origin main`, because the push is the release. The security baseline requires that CI
for any project runs lint, tests, build and a dependency audit, and that third-party code in a
runtime path is pinned to an exact version rather than a floating major.

## Decision

One workflow file, `.github/workflows/deploy.yml`, in two jobs. The build job checks out, sets
up Node 22 with the npm cache, then runs `npm ci`, `npm run lint`, `npm test`, `npm run build`,
a blocking `npm audit --audit-level=high --omit=dev` and a non-blocking full-tree audit, then
`actions/configure-pages` and `actions/upload-pages-artifact` with `path: dist`. The deploy job
depends on it, binds to the `github-pages` environment, and runs `actions/deploy-pages`, followed
by a smoke step that fetches the published URL and fails unless it returns 200 and contains the
owner's name. Workflow-level `permissions` are exactly `contents: read`, `pages: write`,
`id-token: write`. `concurrency` is `group: pages` with `cancel-in-progress: false`. Every
`uses:` is pinned to a full 40-character commit SHA with the tag in a trailing comment, and
`.github/dependabot.yml` carries a `github-actions` ecosystem entry so those SHAs stay current.

## Alternatives

| Option | Why not |
|--------|---------|
| `peaceiris/actions-gh-pages` | Widely used, but it is one more third-party action holding a write token, and the official flow does not need a token at all: it uses OIDC through `id-token: write` |
| Deploy from a `gh-pages` branch built locally and pushed | Puts build output in git history forever, and makes the release depend on whatever is installed on the owner's laptop rather than on a clean `npm ci` |
| Pages "Deploy from a branch" pointed at `/docs` | No build step at all, so Vite could not run. Would mean committing `dist` |
| Pin actions to a major tag such as `@v5` | Simpler to read, and it is what most repositories do. A tag is mutable: whoever controls the action can move `v5` to new code that runs with `id-token: write` in this repository. The SHA removes that |
| One job instead of two | `actions/deploy-pages` is designed to run in a separate job bound to the `github-pages` environment, which is what makes the deployment show up in the repository's Environments history |

## Consequences

Easier: a push to `main` publishes, and a commit that fails lint, tests, build or a runtime
audit never reaches Pages. The Environments tab becomes a deployment history the owner did not
have to build. The smoke step turns "the workflow went green" into "the site actually serves its
own content", which is the only runtime signal this project will ever have.

Harder: SHA pins are unreadable, so each one needs a trailing tag comment and Dependabot to keep
it honest, and a Dependabot pull request for an action is a real change that must be read rather
than merged on sight, because merging it deploys.

Cost, and the owner must act on it: GitHub Pages rejects an Actions deployment until the
repository's Settings, Pages, Source is set to "GitHub Actions". The workflow cannot set that.
The first run fails without it, which is why `R69` records it in `docs/hosted-config.md`.

Accepted risk: there is no branch protection on `main`, because a rule requiring a pull request
would break the deploy-on-push model that `docs/sdlc/constraints.md` protects. The compensating
control is that the full gate runs on every push, just after it rather than before a merge.

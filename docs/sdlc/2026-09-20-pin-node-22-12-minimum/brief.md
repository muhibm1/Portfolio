# Pin Node 22.12 minimum

Change id: `2026-09-20-pin-node-22-12-minimum` · Prepared 2026-09-20 05:15 UTC, revised after the constraint audit the same morning
Risk tier: 2 (`package.json`, `package-lock.json` and the deploy workflow are edited; the profile forces tier 2 for all three)
For the agents: [spec.md](./spec.md), [plan.md](./plan.md), [evals.md](./evals.md), [adr/](./adr/)

This is the Design document. A person reads it in under five minutes, technical or not.

## The short version

You asked for the project to say which Node version it needs and to refuse, clearly, to install on an older one. Three small text files at the top of the repository will do that: one names the Node line to use, one states the exact floor (22.12.0 or newer), and one turns npm's usual warning into a hard stop. The one thing worth knowing: npm only warns about a wrong Node by default, and the only switch that fails loudly on both your laptop's npm and the CI runner's npm is the third file, so it is the part that must not be deleted later.

The constraint audit passed with no blocking finding but pointed out that this third file is also the file npm reads for registry addresses and login tokens. So the design now adds a small check that runs in CI before anything is installed and stops the run if that file ever contains anything but its one setting, puts the new files under the same "ask me first" rule as `package.json`, and adds tests that prove the deploy workflow's permissions and the project's own guard rules were not loosened along the way.

## Problem

In your words: the project needs Node 22.12 or newer for the linter, but nothing pins that, so a fresh clone or a CI runner can get an incompatible Node and lint fails for a reason that looks like a broken install.

Restated precisely: the linter, oxlint, declares it needs Node 20.19 or 22.12 or newer. The laptop ran Node 21.7 for a week and the failure was written up in four documents as an npm bug. Those documents are still wrong. The laptop now runs Node 24.19 and everything passes, but nothing in the repository would stop the same mistake on another machine. The deploy workflow carries its own Node number, so there would be two places to keep in step once a pin exists.

## Outcome

When this is done:

- A file named `.nvmrc` at the top of the repository says `22`, so Node version managers and the CI runner pick the newest Node 22.
- `package.json` states the floor, Node 22.12.0 or newer.
- A file named `.npmrc` makes `npm ci` stop with npm's own error, which names the required range and the version actually running, before installing anything. Verified this session in throwaway projects: with the file, exit 1 and a clear message; without it, a warning and exit 0.
- A small script checks `.npmrc` in CI before the install step and fails the run if the file is missing or holds anything other than its one setting, without ever printing a value that could be a token.
- The deploy workflow reads `.nvmrc` instead of carrying its own number and runs that script. The Node it resolves does not change (22.23.2 on the last run).
- Nineteen new automated tests prove all of the above and run in the existing CI job, including one that pins the workflow's permissions exactly as they are today.
- The three new files are listed in the project profile next to `package.json`, so any future edit to them asks you first, and a check proves the profile's other guard rules were not touched.
- The four documents that misdiagnosed the failure are corrected, including a stale line that said `.gitignore` lacks an `.env` pattern (it has one; the auditor confirmed it).

Nothing about the public site changes. No dependency is added.

## What changes for people

- You: nothing day to day. Your laptop already satisfies the floor. If you ever switch to an older Node, `npm ci` tells you so in plain words instead of the linter failing later with a confusing message. You will be asked to approve five edits during the build: two for the package files, three for the workflow.
- Anyone cloning the repository: the same clear stop on a wrong Node, and `.nvmrc` tells their version manager which line to use.
- CI: the same Node as today, resolved from the file, and one more check before install. The build job fails at the setup step if `.nvmrc` is missing, or at the guard step if `.npmrc` is wrong, which is earlier and clearer than failing at lint or after a bad install.
- Future dependency updates: a package that declares it does not support the running Node will now refuse to install instead of warning. Because installing is a step of the deploy, the first place you will see that is a red deploy run, and a person decides what to do.

## What could go wrong, and the guard for each

| Risk | Guard |
|------|-------|
| Someone later deletes `.npmrc` as an unused dotfile, silently restoring warn-only behaviour | A test fails if the file or its one setting is missing; the CI guard refuses to run without the file rather than passing on nothing; and editing the file now asks you first |
| A registry address or login token ends up in `.npmrc`, a file that commonly holds them | The CI guard stops the run before anything is installed, naming the line but never its value; a test in the suite catches it too |
| Someone re-adds a Node number to the workflow, which would silently override `.nvmrc` | A test fails if the workflow sets that input |
| An edit to the workflow widens what it may do with your repository | A test pins all three permission blocks and the "do not keep the token" setting exactly as they are today |
| The profile edit that adds the new guarded paths accidentally removes another guard | A diff check proves the profile's four rule lists changed only by the three additions |
| The pin file is saved with Windows line endings and a Unix version manager rejects it | The test normalises line endings, and a git check confirms the committed file has none |
| The new tests, which start npm six times and the guard script four times, are slow on a cold runner | Each has a 20 second limit and uses an empty dependency set; the npm ones took about 1.3 seconds each here |
| CI picks a different Node 22 patch release between two runs of the same commit | Accepted on purpose (D1) so CI gets security fixes; the run log prints the exact version and the release record will note it |
| A future package refuses to install because of the strict setting | Intended. Only one package in today's lockfile excludes 22.12.0; it is optional, Linux-only, and npm skips optional packages under this setting (verified) |

## Decisions

Approving this document accepts every recommendation; say otherwise in the approval notes to change one. D1 to D6 are the original design. D7 to D10 were proposed by the constraint audit; the conductor took each recommendation under the decision policy and they are designed in. D11 was raised while folding D8 in.

| # | Decision | Recommendation | Alternative | Why the recommendation |
|---|----------|----------------|-------------|------------------------|
| D1 | What `.nvmrc` says | `22`, the release line | `22.12.0`, the exact floor | CI keeps getting the newest Node 22 with its security fixes, as it does today. The floor is enforced by the other two files, not this one |
| D2 | How the floor is enforced | The strict setting in a committed `.npmrc` | npm's newer `devEngines` field, or a script | Only the strict setting works on your laptop's npm 10.7; `devEngines` was tested and is silently ignored there |
| D3 | Also change the deploy workflow to read `.nvmrc` | Yes | Leave the workflow's own number in place | One place to bump Node instead of two. The workflow is a sensitive file, so you will be asked to approve the edit |
| D4 | Keep the lockfile's copy of the floor in step | Edit it by hand, one line | Regenerate the lockfile with npm, or leave it | Installing does not need it, but the next lockfile regeneration would add it as noise in an unrelated pull request |
| D5 | Which documents to correct | All four: `CLAUDE.md`, the WorkHorse profile, the codebase map, the constraints document | The first two only | Every agent reads all four, and two of them are where the wrong diagnosis was recorded |
| D6 | The floor value | 22.12.0 or newer | 22.20.0 or newer, or also allowing Node 20.19 | 22.12 is what you asked for and what oxlint needs; the higher number serves an optional package the strict setting ignores; Node 20 is past end of life |
| D7 | Put `.npmrc` and `.nvmrc` under the "ask me first" rule (from the audit, taken) | Yes, next to `package.json` in the profile | Leave them unguarded and rely on the tests | `.npmrc` decides where packages come from and can hold a token; `.nvmrc` decides which Node the publishing path runs. One extra prompt on any future edit, none during this change |
| D8 | Where the `.npmrc` content check runs in CI (from the audit, taken) | In the existing pre-install step, as a small script, before `npm ci`; the suite's test stays as a backstop | Only in the test suite, which runs after install | A check that fires after the install it was meant to protect is not the control it looks like. Costs one more edit to the workflow, which you approve |
| D9 | Pin the workflow's permissions with a test (from the audit, taken) | Yes, one test covering all three permission blocks and the token setting | Read the diff by eye at Ship | This is the only path that can publish the site, and the test file that reads the workflow already exists in this change |
| D10 | Prove the profile edit touched only what it should (from the audit, taken) | Yes, a diff check over the profile's four rule lists | Trust the task instruction | The profile is what enforces every other guard, and it is deliberately not protected from agents |
| D11 | Also put the new guard script under the "ask me first" rule and the tier-2 floor | Yes, in the same profile edit | Leave it out | The existing CI guard script for fonts is already listed there; leaving this one out repeats the audit's first finding for a file this change creates |

## How it will be proved

The profile checks on the finished branch: `npm ci` exits 0, `npm run lint` exits 0, `npm test` passes 227 tests in 28 files (208 in 25 today), `npm run build` exits 0, and the dependency audit is unchanged. The eval cases in `evals.md`, as written: 11 golden, 3 edge, 5 failure, 5 adversarial, 2 non-functional, 26 in total, every one runnable by a machine here. Nineteen are permanent tests in three new files; the other five are commands with an expected result (install, the document greps, the profile greps, the profile diff, the line-ending check). The failing-install case is proved by starting npm in a throwaway project that copies the repository's `.npmrc` and asks for an impossible Node, then checking the exit code and the error text. The guard script is proved the same way against throwaway `.npmrc` files, including one holding fake credentials whose values must not appear in the output. After the merge, the deploy run's log shows the guard passing and which Node it resolved, and because `package.json` changed, your usual four-item post-deploy browser check applies; that part is manual.

Done, in one sentence: on this laptop and in CI, install, lint, tests and build all pass; a throwaway project using this repository's settings is refused with a clear message on an unsupported Node; and a bad `.npmrc` stops CI before anything is installed.

## Estimate

Waves: 2. Tasks: 4. Agent-time budget at tier 2: 90 minutes. Design so far: about 25 minutes including this revision.

## Your decision

Approve to build it exactly this way, or reject with notes to have it redesigned.

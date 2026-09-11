# 0004: Pin Vitest 3.2.4 and stay on Vite 5

Date: 2026-09-11
Status: proposed
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages

## Context

`R49` to `R54` add the project's first test command, chosen by the owner at G1 (D3). The
repository has no test runner, no test file and no `test` script (confirmed, `package.json`
lines 6 to 11 and 21 to 27), and `.workhorse/profile.yml` `commands.test` is empty on purpose.
The project builds with Vite 5.4.11 (confirmed, recorded in `docs/sdlc/codebase-map.md` from
`vite --help`). `vite.config.js` is a profile `sensitive_path` and a `tier_floor_paths.2` entry.
Vitest 4 requires Vite >= 6.0.0 and Node >= 20.0.0 (confirmed via context7 from the v4.1.6
migration guide); Vitest 5 requires Vite >= 6.4.0 and Node >= 22.12.0 (confirmed the same way).

## Decision

We pin `vitest` at 3.2.4 and leave Vite at 5.4.11. The supporting packages are
`@testing-library/react` 16.3.0 with its required peer `@testing-library/dom` 10.4.1,
`@testing-library/jest-dom` 6.9.1, and `jsdom` 26.1.0 as the DOM environment. All are exact
pins with no range prefix. The Vitest configuration lives in a `test` block inside the existing
`vite.config.js` rather than a second config file, and the `defineConfig` import stays
`from 'vite'` so that `vite build` does not depend on a devDependency being installed. If Vite 5
rejects or warns on the unknown top-level key, the documented fallback is to import
`defineConfig` from `vitest/config`, which re-exports Vite's.

## Alternatives

| Option | Why not |
|--------|---------|
| Vitest 4 with a Vite 6 upgrade in the same change | Pairs a build-tool major upgrade with the first production deploy this repository has ever had. `vite.config.js`, `@vitejs/plugin-react` and `@tailwindcss/vite` all move at once, on a change already touching five sensitive paths |
| Jest with `babel-jest` | Needs a second transform pipeline and its own config for a Vite project. Vitest reads the Vite config that already exists |
| Playwright end to end instead of unit tests | Catches the CSP, `base` and font failures that a jsdom test cannot, which is real value. Costs browser downloads on a Windows laptop and in CI, and the profile has no `e2e` command. The post-deploy smoke step in `R63` covers the highest-value part far more cheaply |
| `happy-dom` instead of `jsdom` | Faster, and neither implements canvas, so it would not change the orb tests. `jsdom` is the pairing the React Testing Library documentation assumes and the one the next reader expects |
| Ship with no tests | Rejected by the owner at G1. It would leave `npm run build` as the only automated evidence any change can ever produce |

## Consequences

Easier: `commands.test` becomes real, so every later phase can verify behaviour rather than
eyeball it, and `R52` can assert a non-zero test count so a green build cannot mean zero tests.

Harder: the project now carries a deliberate version ceiling. Vitest 3 will fall out of support
before Vitest 5 does, and moving past it requires the Vite 6 upgrade this ADR defers. Dependabot
will open a major-version pull request for Vitest 4 that must be declined with a pointer to this
ADR until Vite is upgraded, which is exactly the kind of recurring noise that gets merged by
accident.

Second cost: the dev host runs Node v21.7.3, which is believed to sit outside Vitest 3's
supported Node range. `npm install` will warn and continue because there is no `.npmrc` setting
`engine-strict` (confirmed by glob). CI pins Node 22. Revisit when the owner moves the laptop to
Node 22 LTS.

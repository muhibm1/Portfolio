# Muhammad Muhibullah portfolio: working in this repository

A static Vite and React single-page site that presents the owner's experience and case studies to
recruiters. No backend, no database, no auth, no visitor data collection.

## Commands

- Install: `npm ci`
- Typecheck: none (no TypeScript)
- Lint: `npm run lint` (oxlint) — currently fails on this machine, see Mistakes below
- Test: none yet (add Vitest and React Testing Library in the first spec)
- Build: `npm run build` (Vite, writes `dist/`)
- Dev: `npm run dev`
- Audit: `npm audit --audit-level=high`

## Architecture in five lines

1. `index.html` mounts `src/main.jsx`, which renders `src/App.jsx` into `#root`.
2. `App.jsx` holds all shared state (three `useState`) and renders eight sections in a fixed
   order, plus two modals opened by that state.
3. Every section is one default-exported component in `src/components/`, one file each.
4. All copy, metrics, case studies and resume content come from `src/data/portfolioData.js`.
   Nothing is fetched at runtime.
5. The only outbound calls are Google Fonts in `index.html`, a LinkedIn link, and `mailto:`
   links. Full detail in `docs/sdlc/codebase-map.md`.

## Conventions

- Branches: `wh/<change-id>`; commits: conventional
- Content changes go in `src/data/portfolioData.js`, never inline in a component
- Styling is Tailwind utility classes in JSX; shared tokens and keyframes in `src/index.css`
- Tests, when they exist, live next to the component as `*.test.jsx`; never edit a test to make
  it pass
- No analytics, cookies, tracking pixels, embedded widgets or hosted forms. Ever.
- No new dependency without naming it, its licence and its exact version in the plan

## Protected

Never edit: `**/*.pem`, `**/*.key`, `.env*`.

Ask first: `.github/workflows/**`, `index.html`, `vite.config.js`, `package.json`,
`package-lock.json`.

Do not rewrite the factual claims in `src/data/portfolioData.js`. The employer names, dates and
metrics are the owner's own record and only he can change them.

Pushing to `main` publishes the public site through GitHub Actions, so a merge is a release. The
owner performs production pushes himself.

## Mistakes to avoid

Appended by retro after each change. Newest first.

- `npm run lint` exits 1 with `Cannot find native binding` because `node_modules/@oxlint/` is
  empty (npm optional-dependency bug). Do not treat it as a code failure. Fix by deleting
  `node_modules` and `package-lock.json` and reinstalling.
- `package.json` lists `@rolldown/binding-win32-x64-msvc`, a Windows-only binary nothing uses.
  Remove it before the first CI run or `npm ci` on a Linux runner is expected to fail.
- `vite.config.js` has no `base`. A GitHub Pages project site needs `base: "/Portfolio/"` or
  every asset 404s.
- `generate_viewer.cjs` at the repo root is dead and points outside the repository. Delete it,
  do not maintain it.

## Workflow

This repo uses WorkHorse. Start any change with `/workhorse:run "<problem> -> <outcome>"`.
Artifacts live in `docs/sdlc/<change-id>/`. Approvals are recorded with `/workhorse:approve`.
Read `.workhorse/profile.yml`, `docs/sdlc/codebase-map.md` and `docs/sdlc/constraints.md` before
your first change.

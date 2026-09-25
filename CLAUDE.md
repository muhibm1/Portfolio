# Muhammad Muhibullah portfolio: working in this repository

A static Vite and React single-page site that presents the owner's experience and case studies to
recruiters. No backend, no database, no auth, no visitor data collection.

## Commands

- Install: `npm ci`
- Typecheck: none (no TypeScript)
- Lint: `npm run lint` (oxlint) — needs Node 22.12.0 or newer, pinned by `.nvmrc` and the
  `engines` field; `npm ci` refuses an older Node before lint ever runs
- Test: `npm test` (Vitest and React Testing Library)
- Build: `npm run build` (Vite, writes `dist/`)
- Dev: `npm run dev`
- Audit: `npm audit --audit-level=high`

## Architecture in five lines

1. `scripts/prerender.mjs` renders every route in `src/routePaths.js` at build time through
   `src/entry-server.jsx`, writing each page's own markup and, from `src/pageMeta.js`, its title,
   description, canonical link and Open Graph and Twitter tags into the served HTML; `src/main.jsx`
   then hydrates that markup in the browser instead of rendering from empty.
2. `src/App.jsx` is the route table: home, `/work` and each `/work/:slug` case study render inside
   `SiteLayout`, which supplies the header, the mobile menu and the footer on every route.
3. Every page and section is one default-exported component in `src/pages/` or
   `src/components/`, one file each.
4. All copy, metrics, case studies and resume content come from `src/data/portfolioData.js`.
   Nothing is fetched at runtime.
5. The only outbound calls are the self-hosted IBM Plex and Space Grotesk typefaces (served from
   this site, not Google), a LinkedIn link, and `mailto:` links. Full detail in
   `docs/sdlc/codebase-map.md`.

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
`package-lock.json`, `.npmrc`, `.nvmrc`, `scripts/check-npmrc.mjs`, `scripts/route-pages.mjs`,
`scripts/check-route-pages.mjs`, `scripts/prerender.mjs`, `scripts/forbidden-copy.mjs`,
`scripts/check-forbidden-copy.mjs`, `src/pageMeta.js`, `src/entry-server.jsx`,
`scripts/check-test-floor.mjs`.

Do not rewrite the factual claims in `src/data/portfolioData.js`. The employer names, dates and
metrics are the owner's own record and only he can change them.

Pushing to `main` publishes the public site through GitHub Actions, so a merge is a release. The
owner performs production pushes himself.

## Mistakes to avoid

Appended by retro after each change. Newest first.

- The agent harness refuses to create or edit `.npmrc` at all, a built-in filename block
  separate from the profile's ask-first gate. The repository owner must create or edit it by
  hand.
- `npm run lint` exits 1 with `Cannot find native binding` when the running Node is below
  oxlint's required range, `^20.19.0 || >=22.12.0` (the real cause; it is not an npm
  optional-dependency bug). Fix with `nvm use` to match `.nvmrc`, or read the `npm ci` error,
  which names the required range and the version actually running.
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

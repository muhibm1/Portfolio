# Portfolio design brief

Owner: Muhammad Muhibullah (mmalqaim@gmail.com, GitHub `muhibm1`, LinkedIn `muhibm1`).
Purpose: a personal site linked from the resume, LinkedIn, and job applications while moving
from a Data Engineer role at Apple (via TCS) into Forward Deployed Engineering (FDE).
Written 2026-09-10 from the owner's request, resume, four mockups in `public/`, and the three
reference sites below. Every claim about a reference site is from a fetch of that site on
2026-09-10 (confirmed); the owner's preferences are quoted from their request.

## What the owner asked for (verbatim intent)

- A personal portfolio "that looks something like" varickagents.com's case-studies section.
- Likes "the template and colors as well as the animation" of refero style
  `6b667ffc` (OFF+BRAND) and "the layout" of refero style `3af36935` (Jakub Reis).
- "A mockup website with my experience and focus and a dedicated page for projects and case
  studies."
- Of the mockups in `public/`, "I like the one with the colorful orb" (`mockup-home.jpg`)
  "but I want to replace the orb with a live animation", specifically the "working" animation
  from libraries.dev/orbs (npm `thinking-orbs`, already in `package.json`).
- Deploy target: the GitHub repo `muhibm1/Portfolio` (owner wrote "protfoli"; the only
  matching repo is `Portfolio`, created 2026-09-10, empty).

## Reference analysis

### varickagents.com (structure and case-study pattern)
Linear narrative: hero, how-it-works steps, benefits, deployment areas, three featured case
studies as consistent cards (title, context paragraph, 5-6 capability bullets, "View Case
Study" link), FAQ, final CTA. Enterprise B2B tone. Takeaway: case studies are the centrepiece,
each card has the same fields, each links to a dedicated deep-dive.

### OFF+BRAND (refero 6b667ffc): palette, type, motion
- Parchment canvas `#e5e4e0`, ink `#1d1d1d`, paper `#ffffff`, ash hairlines `#bfbebe`,
  stone panels `#cdcdc9`.
- One chromatic element only: the hero sphere,
  `linear-gradient(255deg, #facb0e, #f06ba8 30%, #78bae6 65%, #ffffff)`. No other gradients,
  no colour fills on buttons.
- Single geometric sans, weight 400 for display and body, 700 for labels; display 70-103px at
  0.80 line-height; body 15-18px at 1.4. Minor-third scale.
- Zero shadows. Cards 0px radius, interactive elements 10px radius. Ghost links with underline
  or arrow reveal on hover. Filter buttons: 1px ink border, invert on hover.
- Max width 1400px, section gaps 76-119px, card padding 30px.

### Jakub Reis (refero 3af36935): layout
- Bone `#f8f8f8` background, black text, weight 300/400 only, tracked-out display type.
- Two-column asymmetric grid with staggered heights; header split name/discipline left and
  intro paragraph right; email top-left, socials top-right.
- Max width 1200px, 80px between projects, 20px image-to-caption, 0px radius, no buttons,
  badges, shadows, or borders. Tilde `~` as the only separator.

### Existing scaffold (`src/`)
A Vite 5 + React 19 + Tailwind v4 single-page app already exists with a parchment palette
(`#f6f5f1`), Space Grotesk / Inter / JetBrains Mono, and eight sections (hero with an SVG
"MM" monogram, philosophy, case studies with modal, an interactive triage simulator,
experience, skills, contact, resume modal). Content lives in `src/data/portfolioData.js`.
It is a single page with modals, not a multi-page site, and its hero uses the monogram
(`mockup-mmlogo.jpg`) rather than the orb the owner chose.

## Direction (recommended, for the spec to refine)

1. **Keep** the scaffold's stack, data file, and content; restyle toward OFF+BRAND (flat, no
   shadows, sharper cards, 400-weight display type, one chromatic element) and lay out the
   work index like Jakub Reis (asymmetric two-column, generous vertical rhythm).
2. **Hero** per `mockup-home.jpg`: stacked uppercase name, "Forward Deployed Engineer &
   Systems Integration", availability pill, three telemetry stats, and on the right a live
   orb. The orb is the `working` state of `thinking-orbs` rendered at hero scale (roughly
   380-440px). The package's `ThinkingOrb` component only ships 64px and 20px presets and is
   monochrome, but `thinking-orbs/engine` exports `MODE_FRAMES.orbits(size, t, opts)` (pure
   geometry at any size) plus `paintFrame`; a small custom canvas painter can colour the dots
   with the OFF+BRAND iridescent gradient by depth or orbit. Respect
   `prefers-reduced-motion` (static frame) and pause offscreen, as the package does.
3. **Pages** (needs a router; none installed):
   - `/` home: hero, what FDE means to me (three principles), featured case studies (three
     cards, Varick pattern), experience timeline, capabilities, contact.
   - `/work` dedicated projects and case studies index, Reis layout, filterable by type
     (Case study / Project).
   - `/work/:slug` dedicated case study page per `mockup-casestudy.jpg`: eyebrow, large
     title, tab chips (Challenge, System architecture, Production deployment, Measured impact),
     flow diagram left, metric cards right, tech stack, next/previous.
   - Projects to include beyond the three case studies (from GitHub `muhibm1`): `workhorse`
     (agentic SDLC Claude Code plugin for FDE, 24 agents), `Shu` (autonomous intraday trading
     engine and dashboard, Alpaca), `wasl`, plus the interactive triage simulator as a live demo.
4. **Hosting**: GitHub Pages from `muhibm1/Portfolio` via GitHub Actions, with a `404.html`
   SPA fallback so deep links to `/work/:slug` resolve. Base path `/Portfolio/` unless a
   custom domain is added.
5. **Out of scope**: backend, analytics, contact form (mailto only), CMS.

## Content sources
- Resume (2026): summary, three roles (Apple via TCS Feb 2025-present; Neural Newsletters May
  2024-Feb 2025; edX ML Instructor Oct 2023-Mar 2025), skills, education (UT Dallas B.S. CS
  Dec 2022; ACC A.A.S. May 2020). Already transcribed into `src/data/portfolioData.js`.
- Headline metrics: 30 to 350+ tickets/day, 50+ regions, about 40% fewer production incidents.

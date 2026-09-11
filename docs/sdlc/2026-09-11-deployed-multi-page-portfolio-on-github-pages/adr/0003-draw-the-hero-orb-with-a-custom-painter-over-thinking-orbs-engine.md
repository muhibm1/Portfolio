# 0003: Draw the hero orb with a custom painter over thinking-orbs/engine geometry

Date: 2026-09-11
Status: proposed
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages

## Context

Intent Outcome 7 and `R29` to `R36` require the `working` state of `thinking-orbs` at roughly
380 to 440 px, coloured with the amber, rose and blue gradient from `docs/design-brief.md`
line 34, static under `prefers-reduced-motion: reduce`, and paused offscreen. The package is
already a declared dependency at 0.3.1, MIT, imported by nothing (confirmed,
`package.json` line 19 and `node_modules/thinking-orbs/package.json` line 75). Its shipped React
component accepts only `size: 64 | 20`, described in its own types as "Exactly two tuned presets
ship" (confirmed, `dist/types.d.ts` line 22), and its painter is documented as "matte grayscale
dots" (confirmed, `dist/engine/core.d.ts` lines 44 to 49).

## Decision

We write `src/components/ThinkingOrbHero.jsx`, which imports exactly two symbols from the
package's `./engine` subpath export, `resolvePreset` and `MODE_FRAMES`, calls
`resolvePreset('working', 64)` once for the mode, speed and tuned options, and calls
`MODE_FRAMES[mode](size, t, opts)` each frame at `size = 420`. The returned `dots` array is
already projected into canvas coordinates and z-sorted far to near (confirmed,
`dist/engine/core.d.ts` lines 21 to 30 and 52 to 62), so our painter iterates it in order and
fills each dot with a colour interpolated across `#facb0e`, `#f06ba8`, `#78bae6` and `#ffffff`
by depth. Passing a 420 px size with the 64 px preset options is correct because the frame
function scales dot radii from its `size` argument internally through `radiusScale` (confirmed,
`dist/engine.es.js` line 239). We reimplement the package component's reduced-motion, offscreen
and device-pixel-ratio behaviour rather than inventing our own, copying it from
`dist/index.es.js` lines 48 to 124, which this agent read.

## Alternatives

| Option | Why not |
|--------|---------|
| Use `ThinkingOrb` at `size={64}` and scale it with a CSS `transform` | A 64 px canvas blown up 6.5x is visibly soft on any display, and it is still monochrome, so the one chromatic element the whole design brief is built around would be grey |
| Use `paintFrame` from the engine and tint the canvas with a CSS gradient and `mix-blend-mode` | Cheaper, but the blend applies uniformly, so the depth language the dots encode in their ink value would be flattened. It also behaves differently across browsers |
| Fork the package's painter into the repository | Copies about 40 lines of someone else's code into our tree and freezes it. Importing the two geometry exports keeps the upstream tuning and the upgrade path |
| Keep `MmLogo.jsx` and skip the orb | Contradicts the owner's explicit request quoted in `docs/design-brief.md` section "What the owner asked for" |
| A static SVG or an exported image of the orb | Meets the reduced-motion case perfectly and nothing else. The owner asked for a live animation |

## Consequences

Easier: one chromatic element at hero scale, exactly as the design brief specifies, with the
upstream geometry doing the hard part.

Harder: we now own the accessibility behaviour the package gave away for free. Reduced motion,
offscreen pause, visibility pause, device pixel ratio and unmount cleanup are five separate
things to get right, and `R32` to `R35` exist because each is a separate test. If the package
changes its engine exports in 0.4, our component breaks where a consumer of `ThinkingOrb` would
not; the subpath export is a documented public surface, so this is a real but small risk.

Cost: the component must return early when `getContext('2d')` returns `null`, because jsdom has
no canvas. That is one guard, and it is the reason the orb can be tested at all without adding a
native `canvas` dependency that would need a compiler on a Windows laptop.

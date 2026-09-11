# 0007: Self-host the typefaces with @fontsource and wire them into the Tailwind theme

Date: 2026-09-11
Status: proposed
Change: 2026-09-11-deployed-multi-page-portfolio-on-github-pages

## Context

`index.html` lines 8 to 10 load Inter, JetBrains Mono and Space Grotesk from
`fonts.googleapis.com` and `fonts.gstatic.com` on every page view (confirmed by reading the
file). That is the only third party that sees a visitor, and `docs/sdlc/constraints.md`
"Compliance controls" records it as a GDPR-adjacent gap with two ways to close it: name a lawful
basis, or remove the call. The owner chose to remove it at G1 (D2). `R37` to `R39` implement
that. While reading the code for this spec, a second fact surfaced: `src/index.css` line 22
hard-codes a system font stack on `body`, and `src/App.jsx` line 50 applies Tailwind's
`font-sans`, whose default is also a system stack. So Inter is downloaded from Google today and
never applied to anything.

## Decision

We add `@fontsource/inter`, `@fontsource/jetbrains-mono` and `@fontsource/space-grotesk` as
exact-pinned runtime dependencies, importing weights 400, 500, 600 and 700 for each in
`src/main.jsx` above `import './index.css'`. Weight 300 and the italic face are not imported,
because `grep -rn "font-light|font-thin|font-extralight|italic" src/` returns no matches
(confirmed), so they are bytes nobody renders. We delete `index.html` lines 8 to 10. In the same
change, `src/index.css` gains a Tailwind `@theme` block declaring `--font-sans`, `--font-mono`
and `--font-display` from the three families, and the hard-coded system stack at line 22 is
removed, so the typography in `docs/design-brief.md` is actually applied rather than merely
downloaded.

## Alternatives

| Option | Why not |
|--------|---------|
| Keep Google Fonts and record "legitimate interest in typography" as the lawful basis | Leaves an unsettled legal question open forever and keeps a third party on every page view, to save four dependencies. Rejected by the owner at G1 |
| Download the three woff2 files into `public/fonts` and hand-write the `@font-face` blocks | No new dependency, which is genuinely attractive on a site with four. The owner then owns subsetting, unicode ranges, `font-display`, and the OFL licence files by hand, with no version recorded anywhere and no Dependabot to update them |
| Self-host only Space Grotesk, since it is the only family currently applied | Would cement the bug rather than fix it. The design brief specifies all three roles |
| Import every weight `@fontsource` ships | Simplest to write and roughly triples the font payload for weights nothing renders |
| Self-host but skip the `@theme` wiring | Closes the privacy gap, passes success metric M9, and leaves the site rendering in the OS font. Outcome 8 would fail quietly while every automated check went green, which is the exact failure shape the evidence rules exist to prevent |

## Consequences

Easier: no third party sees a visitor except the host, which closes the GDPR-adjacent gap
without anyone having to settle the legal question. Font versions are pinned, recorded and
updated by Dependabot like any other dependency. The site finally renders in the typefaces the
design brief specifies.

Harder: the first paint now waits on same-origin woff2 files instead of a widely-cached CDN, so
the first visit is marginally slower and later visits are faster. Twelve import lines in
`src/main.jsx` is more noise than one `<link>` tag.

Cost: three more dependencies, and the font files carry the SIL Open Font License 1.1 rather
than MIT (believed, not verified from the manifests; `R77` requires the builder to read the
`license` field from each installed package and record it). Redistributing OFL fonts inside a
built site is exactly what the licence permits, but the licence text should travel with them,
which the packages do by including their own `LICENSE` file in `node_modules`.

Two idioms for the display font will coexist: the nine components using
`font-['Space_Grotesk',sans-serif]` keep working unchanged because the class names the family
directly, while new components use `font-display`. Converting the nine is recorded as a finding
outside scope.

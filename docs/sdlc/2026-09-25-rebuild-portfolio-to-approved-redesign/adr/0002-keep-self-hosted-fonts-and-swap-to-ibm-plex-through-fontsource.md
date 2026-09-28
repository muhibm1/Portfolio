# 0002: Keep self-hosted fonts and swap to IBM Plex through @fontsource

Date: 2026-09-25
Status: proposed. Carries 2026-09-11 ADR 0007 forward with different families.
Change: 2026-09-25-rebuild-portfolio-to-approved-redesign

## Context

Plan section 2 names the families as "Fonts (Google Fonts): Space Grotesk, IBM Plex Sans, IBM
Plex Mono". This repository removed Google Fonts on privacy grounds at G1 of change 2026-09-11
(ADR 0007, R37 to R39), the build-time CSP has `font-src 'self'` (`vite.config.js`, confirmed),
`docs/hosted-config.md` records Google as no longer a subprocessor, and deploy smoke R82 fails
the deploy on any `fonts.googleapis.com` or `fonts.gstatic.com` reference. The plan's line names
the families a designer would load; it does not argue for a third-party host, and section 0 says
to keep the existing stack. `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono` exist on
the registry at 5.3.0 under OFL-1.1 (confirmed with `npm view`). R131, R147.

## Decision

The fonts stay self-hosted. `package.json` adds `@fontsource/ibm-plex-sans` 5.3.0 and
`@fontsource/ibm-plex-mono` 5.3.0, keeps `@fontsource/space-grotesk` (bumped to 5.3.0 so the
three families share one release), and removes `@fontsource/inter`, `@fontsource/jetbrains-mono`
and `thinking-orbs`. `src/main.jsx` imports only the weights the mockups use: Plex Sans 400, 500,
600; Plex Mono 400, 500; Space Grotesk 500, 600. `src/index.css` names the three families in
`@theme` as `--font-sans`, `--font-mono` and `--font-display`. The deploy workflow's exact-pin
list names the two new packages in place of the two removed ones.

## Alternatives

| Option | Why not |
|--------|---------|
| Load from Google Fonts as the plan's wording says | Reopens the GDPR-adjacent disclosure ADR 0007 closed, breaks the CSP and fails R82 on the first deploy; the owner's own earlier decision outranks a parenthetical in a design plan |
| Keep Inter and JetBrains Mono and map the mockups' families onto them | The mockups are the layout source; metrics differ enough to change line breaks and heading sizes |
| Hand-copy the woff2 files into `public/fonts` | Rejected in ADR 0007 for the same reasons: no version, no licence file travelling with the fonts, no Dependabot |
| Import every weight | Roughly doubles the font payload for weights nothing renders |

## Consequences

Easier: no third party sees a visitor; every existing font check (R80, R97, R100) keeps
running unchanged, because it checks delivery, not family names.

Harder: three package swaps in a supply-chain file (ask-first), and a pin-list edit in the
workflow. Cost: about 250 KB more woff2 across the added weights (believed, not measured), paid
once per visitor and cached.

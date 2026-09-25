# Adoption review: rebuild the portfolio to the approved redesign

Change id: `2026-09-25-rebuild-portfolio-to-approved-redesign`, commit `695345e`.

Verdict: 2 findings (0 critical, 0 high, 0 medium, 2 low)
Adoption score: 4

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| low | README.md:1-17 | README.md is still the unmodified `create-vite` template and says nothing about this project, its routes, its build, or the prerender pipeline this change adds. Pre-existing (flagged by `docs/sdlc/codebase-map.md` since 2026-09-10), not introduced here, but this change was the biggest rewrite of the site to date and left it untouched. | A new engineer's first instinct is to open README.md; it points them at `create-vite` plugin choices instead of `CLAUDE.md`, costing a detour before they find the real map. | README.md: replace with a short pointer, e.g. "See CLAUDE.md for architecture, commands and conventions." |
| low | src/checkRoutePages.test.js:233-244 | The G19 case "exits 0 on the real dist/ after a build" silently skips (prints to stderr, does not fail) when `dist/` does not exist, so `npm test` run standalone (without `npm run build` first) reports full green while this case never actually exercised `check-route-pages.mjs` against a real build. The code comment and `verification.md` both call this out, but `CLAUDE.md`'s Commands section does not mention running build before test for full coverage. | An engineer running just `npm test` locally (the documented Test command) after changing `scripts/check-route-pages.mjs` sees all-green and believes the real-dist case passed, when it was skipped. | CLAUDE.md Commands section: add a one-line note that `npm run build` then `npm test` exercises the real-dist case, or none proposed (already self-documented in the test and in verification.md). |

Findings outside scope: none.

Not verified: Lighthouse mobile scores (N4), the owner's viewport/keyboard/PDF-content manual
checks (M1-M5), and the live deploy smoke (R143's live half) — all explicitly deferred to
`ship.md` per `verification.md`, not part of this review's scope. `npm ci` and `npm test` were
not re-run in this session (verification.md already ran and logged them at this commit); `npm run
lint` was re-run here and printed no errors (exit implied 0, `oxlint` output empty).

## Notes

Confirmed by reading the tree at commit `695345e`:
- Every module the plan/spec introduces (`src/entry-server.jsx`, `src/pageMeta.js`,
  `scripts/prerender.mjs`, `scripts/forbidden-copy.mjs`, `scripts/check-forbidden-copy.mjs`,
  `src/components/CaseStudyPage.jsx`) carries a top comment naming its requirement ID (R127-R150)
  and/or ADR, and its name matches the spec's vocabulary (`pageMetaFor`, `headTags`, `render`,
  `assemblePage`, `writePage` all match spec interfaces (a)-(e) verbatim).
- All seven ADRs cited in spec.md and brief.md exist under
  `docs/sdlc/2026-09-25-rebuild-portfolio-to-approved-redesign/adr/`.
- `CLAUDE.md` "Architecture in five lines" and "Ask first" are both updated to name the new
  scripts and files (`src/routePaths.js`, `src/basename.js`, `src/entry-server.jsx` all confirmed
  to exist at the paths CLAUDE.md names).
- `docs/sdlc/codebase-map.md` carries a dated 2026-09-25 block summarizing the rebuild and
  pointing at CLAUDE.md for the current shape; `docs/design-brief.md` points at the redacted
  handoff; `docs/sdlc/constraints.md` open question 2 is closed with a citation to this change.
- `docs/hosted-config.md` section 6a gives the owner a dedicated, concrete runbook entry for the
  resume PDF: exact path, the D12/D17 checklist (contact fields, no phone, no street address,
  document metadata, backlog wording), and a log format to record the check — this is clear
  enough for the owner to act on, matching the task instruction that the missing PDF itself is
  not a finding.
- `package.json` diff matches spec R131/R147/D19 exactly (fontsource 5.3.0 pins, `react`/
  `react-dom` pinned to `19.3.0`, `thinking-orbs` removed, three-step `build` script).
- `.workhorse/profile.yml` `sensitive_paths` and `tier_floor_paths` both add the six new files
  named in R145, each with a reason comment; `retention_notes` records the PDF and the
  now-served-in-HTML email per D17.
- Test files for the new scripts (`checkForbiddenCopy.test.js`, `checkRoutePages.test.js`, etc.)
  live under `src/`, matching the existing (pre-change) convention for script tests, not the
  component `*.test.jsx` colocation rule, which is unchanged from before this change.

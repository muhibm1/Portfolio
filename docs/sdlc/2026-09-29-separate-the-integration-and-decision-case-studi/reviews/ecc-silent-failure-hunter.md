Verdict: 2 findings (0 critical, 0 high, 0 medium, 2 low)

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| low | scripts/forbidden-copy.mjs:188, :306-323 | Nothing asserts the scoped page was scanned; the scope regex is coupled to the slug `apple-integration` (confirmed: regex matches `dist/work/apple-integration/index.html`, which exists; tests at src/checkForbiddenCopy.test.js:510 cover the path shape) | Slug renamed in portfolioData.js:683 -> page moves to a new dist path -> onlyPaths matches nothing -> cross-team ban silently stops applying, scan still exits 0 (believed, not verified: no rename tried) | scripts/forbidden-copy.mjs: when args include a dist dir, return EXIT_CANNOT_RUN if no scanned path matches any PAGE_SCOPED_TERMS onlyPaths; add a test for it (scripts file is ask-first) |
| low | scripts/forbidden-copy.mjs:343-357 | Matching is per line on built HTML; React SSR inserts `<!-- -->` between adjacent text nodes, so a phrase built from interpolated nodes could be split (believed, not verified) | `cross-<!-- -->team` in dist -> no line match -> pass | Optionally strip `<!-- -->` from text before matching, or note as accepted risk; current dist has no cross-team text in the integration page (confirmed by grep) |

Checked and clean (confirmed):
- Path format: displayPath (line 373-375) forces forward slashes from path.relative, and hitLinesIn (line 345) also normalises backslashes, so Windows and Linux CI both match.
- `main` (line 257) includes `...PAGE_SCOPED_TERMS`; buildMatchers (199-210) carries `onlyPaths` and defaults to null, so no FORBIDDEN_TERMS matcher lost or narrowed.
- No `g`/`y` flags on any pattern (`.test` stays stateless).
- No fallback turns failure into pass: missing dist dir throws -> exit 2; zero files scanned -> exit 2; hit outranks. `node scripts/check-forbidden-copy.mjs dist` on the current build printed "40 files scanned" and passed. Exit code of that command was hidden by a pipe to tail; the printed message is the evidence.
- CI (.github/workflows/deploy.yml:120) runs the check after Build against dist.

Findings outside scope: none
Not verified: exit code of the dist scan run (piped); behaviour under a fresh Linux runner (not run).

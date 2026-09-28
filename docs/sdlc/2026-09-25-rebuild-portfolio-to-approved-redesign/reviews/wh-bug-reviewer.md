# Bug review: 2026-09-25-rebuild-portfolio-to-approved-redesign (revision, 49618de..11bb943)

Verdict: 7 findings (0 critical, 0 high, 1 medium, 6 low)

Scope read in full: `scripts/forbidden-copy.mjs`, `scripts/phone-redaction-scan.mjs`, `scripts/check-test-floor.mjs`,
`src/components/{CaseStudyPage,CaseStudyCards,SiteHeader,HomeHero,ContactFooter,ExperienceSection}.jsx`,
`src/pages/HomePage.jsx`, `src/data/portfolioData.js` (personal, home, WorkHorse study), the revised deploy
steps, and the diffs of the revised tests. The later diff of the other four studies was read only as a diff.
Evidence probes were written to the scratchpad only and call the scanner's exported functions (`buildMatchers`,
`termsFoundIn`, `scanFiles`, `TIMING_FIGURE_TERM`). Nothing in the repository was edited.

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| medium | scripts/forbidden-copy.mjs:37, :57, :224-229 | The new `2x` word-boundary term and the timing pattern run over raw bytes of binary files, because the default scope is every file under `src/` with no binary skip. `src/assets/hero.png` is scanned today | The owner adds a screenshot of about 200 KB under `src/assets/` (the normal Vite place for an image) -> `npm test` (G2 real-tree scan) and the deploy scanner step exit 1 with `src/assets/<file>.png:N: 2x` or `timing figure`, and the release is blocked by a false hit that only an edit to a sensitive file can clear. Confirmed: 20 random 200 KB buffers gave 89 `2x` hits, 6 timing hits and 1 `2×` hit, about 4.5 per image. Confirmed: `public/og.png` and `src/assets/hero.png` give 0 hits today. Also confirmed: `./assets/shot@2x.png` in an import and a `srcset` `2x` density descriptor each hit `2x`. Expected: binaries skipped, and `@2x` or a density descriptor is not copy. Eval gap: E4 has no binary fixture and no `@2x` case | forbidden-copy.mjs: skip `.png .jpg .jpeg .gif .webp .ico .woff .woff2` in `scanFiles`, counted like `skippedAsTest` and mirroring `BINARY_EXTENSIONS` in the phone scanner; make the `2x` matcher `(?<![@\w])2x\b`. Add E4 fixtures: one random-bytes `.png` and one `shot@2x.png` import line |
| low | scripts/forbidden-copy.mjs:112 | `4 of 4` is matched as a substring, so it hits inside larger counts | The owner updates a figure after the next run, as the brief says he will, to something like "24 of 40 questions" or "4 of 45" -> the scanner fails on `4 of 4` (confirmed for "24 of 40 questions"; "14 of 14" does not hit). Expected: only the stale count itself hits. Eval gap: E4 | forbidden-copy.mjs: make it a pattern term, `/(?<!\d)4 of 4(?!\d)/`, with the label `4 of 4` |
| low | scripts/forbidden-copy.mjs:57 | The timing pattern allows only an ASCII space or nothing between the number and the unit, and knows no `sec` | Copy pasted from a word processor with a no-break space between number and unit, or written as `<n>&nbsp;ms`, `a <n>-ms query`, `<n>.<n> s` or `<n> sec` -> no hit (all five confirmed), so an owner-tool timing ships. D36 says the pattern catches "any successor". Expected: a hit. Eval gap: E4 | forbidden-copy.mjs: separator `(?:[  -]\|&nbsp;)?`, units add `secs?`, and the decimal branch allows the same separator before `s` |
| low | scripts/forbidden-copy.mjs:111 | The letters-only `resume` term misses the accented and plural forms and the old file name | `Download Résumé`, `resumes`, `Muhammad_Muhibullah_Resume.pdf` and `resumeFileName` -> no hit (all confirmed; `_` and a following letter are word characters). G12's `/resume/i` role query also misses `Résumé`. Brief: "the word is banned". Expected: a hit. Eval gap: E4 (it pins only `Resume` and `resumed`) | forbidden-copy.mjs: a pattern term `/(?:\b\|_)r[eé]sum[eé]s?(?:\b\|_\|\.pdf)/i` labelled `resume`, keeping `resumed` a non-hit |
| low | scripts/forbidden-copy.mjs:66-67 | The Paddock pattern treats every `.` as the end of a sentence, so a version number ends the sentence too early | `Paddock v1.0 was retired` or `Paddock 2.0 is deprecated` -> no hit (first confirmed). Expected: one hit (D44). Eval gap: E4 | forbidden-copy.mjs: treat `.` as a sentence end only before whitespace or end of line: `(?:(?![.!?](?:\s\|$)).)*?` in both branches |
| low | src/components/CaseStudyCards.jsx:58 | The featured card's code link has a fixed accessible name that does not name the repository, although R153 requires one that does | On `/` and `/work`, a screen-reader links list reads "View the code on GitHub, public snapshot" with no repository named. Expected, per R153: the repository named, as the case-study links do (`githubSnapshotLabel`). Eval gap: G7 checks only `/public snapshot/` | CaseStudyCards.jsx: build the name from `codeLink`, for example "View the code: workhorse-snapshot on GitHub, public snapshot"; G7 also asserts `workhorse-snapshot` in the name |
| low | src/publicDirectory.test.js:126 | G21 skips any line that contains `sub-10ms` or `48 ms`, whatever else is on that line | A later edit adds an owner-tool timing to one of the six exempt lines (overlay lines 75, 78 and 141; plan lines 30, 36 and 44) -> G21 stays green. Confirmed: none of the six carries another figure today once the two literals are removed. Expected: red | publicDirectory.test.js:126: remove the two literals from the line, then test what is left, instead of returning early |

Checked and found correct (confirmed by reading, or by running where marked):
- `ParagraphWithLink` (CaseStudyPage.jsx:167) splits on a literal, not a regex, and throws unless there is exactly one occurrence. Each of the three paragraph links in the data occurs once (confirmed by reading lines 447, 505 and 518).
- The featured card is an `<article>` with sibling anchors and no nested anchor; the header GitHub link sits in both the desktop nav and the mobile panel and closes the panel when clicked.
- Every resume prop (`resumeHref`, `BASE_URL`) is gone from `HomePage`, `HomeHero`, `ExperienceSection` and `ContactFooter`; no source file outside `docs/` references the deleted scripts; the smoke step still has a well-formed `failures` loop with og.png only.
- The `check-test-floor` pin of 26 matches the file's count (confirmed: running the three files gave 93 passed, 63 + 4 + 26).
- The real-tree scan exits 0 (33 files), and so does the scan with `dist` (41 files) (confirmed; `dist` may predate HEAD).

Findings outside scope: none.

Not verified:
- Real PNG or JPEG exports tripping `2x` is believed, not verified: only random bytes were measured, and deflate output is close to random. Both real PNGs in the tree gave 0 hits.
- Whether `dist/` was built from HEAD (not rebuilt here); the full `npm test` and `npm run build` were not re-run (see verification.md).
- The other four case studies' R155 strings, the docs, profile and ADR edits were not traced line by line; the spec reviewer owns wording.
- The live GitHub snapshot URLs (M3) were not fetched.

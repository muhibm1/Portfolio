Verdict: 3 findings (0 critical, 0 high, 0 medium, 3 low)

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| low | scripts/forbidden-copy.mjs:~212 ('approve, reject or hold') | Substring term misses the Oxford-comma and spacing variants (confirmed from buildPattern: non-letters-only strings are plain substrings) | Copy edited to "approve, reject, or hold" -> scanner passes, banned decision-authority claim ships | scripts/forbidden-copy.mjs: replace the string with a pattern term `/\bapprove,? reject,? or hold\b/i`; add a test row in src/checkForbiddenCopy.test.js |
| low | scripts/forbidden-copy.mjs:~213-216 ('decides each ticket', 'eleven times', ZERO_REJECTED_TERM) | Variants escape: "decided each ticket", "11 times", "eleven-fold", "0 were rejected", "none rejected"; ZERO_REJECTED_TERM also hits "$0 rejected" and "1.0 rejected" because lookbehind only excludes digits (believed, not verified by running) | Owner's "more than tenfold" rule: someone writes "11 times faster" -> not caught (ELEVEN_X_TERM only covers "11x") | scripts/forbidden-copy.mjs: widen to `/\b(?:eleven|11)[- ]?(?:times|fold)\b/i`, `/\bdecid(?:es|ed) each ticket\b/i`, and use `(?<![\d.$])0 rejected` |
| low | scripts/forbidden-copy.mjs:~203 ('via') | Bare word 'via' is banned in every scanned file, including source comments and built HTML (confirmed: letters-only terms get \b patterns) | A future code comment or an unrelated page sentence containing "via" fails `npm test` and deploy with a hit that has nothing to do with the vendor rule | Optional: scope to a pattern like `/\(via\b|\bvia (?:TCS|a vendor)/i`, or accept and document; current repo scan is clean (confirmed: `node scripts/check-forbidden-copy.mjs` exit 0, 32 files; `... dist` exit 0, 40 files, dist possibly stale) |

ReDoS: none. All new patterns are single-pass with bounded alternation, no nested quantifiers (confirmed by reading). Flags: none use g or y, so `.test` stays stateless (confirmed). Components: CaseStudyFlowDiagram and CaseStudyPage changes are correct; subtitle and optional note render guarded, new tests cover both branches. No findings.

Findings outside scope: none
Not verified: full `npm test` and `npm run lint` not run by this reviewer; false-negative variants above reasoned from the patterns, not executed.

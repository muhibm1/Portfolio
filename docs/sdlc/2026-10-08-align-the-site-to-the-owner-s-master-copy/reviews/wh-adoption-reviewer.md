Verdict: 3 findings (0 critical, 0 high, 1 medium, 2 low)
Adoption score: 4

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| medium | src/data/portfolioData.js:9, src/data/portfolioData.test.js:68 | Both cite `PORTFOLIO_FIX_MASTER.md` as the source of truth, but it is not tracked (confirmed: `git ls-files` shows no such file; `git grep` finds only these two references outside docs/sdlc). | Engineer six months on is asked "why does the hero say this?" or sees a test fail on a string, and cannot find the document the strings were copied from. | Commit the master document, e.g. docs/design/PORTFOLIO_FIX_MASTER.md, and point both comments at that path; or say in the comments that the copy of record is the test's verbatim block. |
| low | CLAUDE.md:29, docs/sdlc/codebase-map.md:28 | Both still say typefaces are "self-hosted"; the diff rewords source comments to "Bundled" and bans "self-hosted" in site copy (scripts/forbidden-copy.mjs:223). | Engineer reads the ban, then reads CLAUDE.md using the banned word, and cannot tell whether it is a rule about the site or about all prose. | CLAUDE.md: add a note that the ban covers scanned site copy only; ask owner before editing. |
| low | scripts/forbidden-copy.mjs:119-137 | New term constants carry comments citing "Document section N" with no path to that document (same root cause as the medium finding). | Engineer cannot check whether a term should still be banned. | Resolved by the medium fix. |

Findings outside scope: none
Not verified: read the diff (`git diff main...HEAD --stat` and selected hunks), `git ls-files`, `git grep`; did not run npm test, lint or build, and started no server. Claims above are confirmed by those commands except that I did not read the test files in full.

## Re-check (diff b69406118120..864e4484ef84, src/data and scripts/forbidden-copy.mjs)

Result: medium finding closed. Score stays 4. No new findings.

- Closed: src/data/portfolioData.js:9 and src/data/portfolioData.test.js:68 now say the owner's master copy is kept outside the repository and cite the change's spec.md "Data". confirmed: `git ls-files` lists docs/sdlc/2026-10-08-align-the-site-to-the-owner-s-master-copy/spec.md; spec.md has a `### Data` heading (line 47) that quotes the strings (e.g. the decision title appears once). confirmed: `git grep PORTFOLIO_FIX_MASTER` outside docs/sdlc returns nothing.
- Low finding (scripts/forbidden-copy.mjs "Document section N") also closed: comments now read "Master copy document section N (quoted in the change's spec.md "Data")".
- No copy string changed. confirmed from the diff: portfolioData.js changes one comment line; portfolioData.test.js changes one comment line; forbidden-copy.mjs changes comments plus one scanner change, the literal 'approve, reject or hold' replaced by APPROVE_REJECT_HOLD_TERM (`/approve, reject,? or hold/i`, so the Oxford-comma form is banned too).
- Still open, unchanged: the CLAUDE.md / codebase-map.md "self-hosted" low finding (protected file, owner decision).
- Not verified: did not run tests, lint or build; started no server.

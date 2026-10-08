Verdict: 3 findings (0 critical, 0 high, 1 medium, 2 low)

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| medium | src/masterCopy.test.jsx:690,154 | AGENT_AUTHORITY only matches "(agent\|system\|model) <verb>" in present tense (confirmed by reading the regex) | Copy edited to "The agent can approve each request", "recommendations are applied automatically" or "the agent unlocked the feature" -> regex does not match, test stays green, the "agent has no authority" promise (R13) is broken on the served decision page | src/masterCopy.test.jsx: widen to include modal and passive forms, e.g. `/\b(agent\|system\|model)\b[^.]{0,40}\b(can\|will\|may\|should)?\s*(decides?\|approves?\|rejects?\|unlocks?\|applies\|acts?)\b/i` plus `/automatically (applied\|approved\|unlocked)/i`; keep the positive "It does not act" sentence assertion |
| low | src/components/CaseStudyPage.test.jsx:239-259 | vi.doMock/doUnmock/resetModules cleanup sits after the assertions, not in finally/afterEach (confirmed) | An assertion at line 251-255 fails -> doUnmock never runs -> the next test ("repository links (G26)") imports CaseStudyPage with the stub data and reports a second, misleading failure | CaseStudyPage.test.jsx: move `vi.doUnmock` and `vi.resetModules` into an `afterEach` in that describe |
| low | src/checkForbiddenCopy.test.js:144, src/data/portfolioData.test.js:585, src/masterCopy.test.jsx:683 | Spelling variants of banned terms are untested negatives-by-omission: only `self-hosted` is tried; "self hosted" and "self\u2011hosted" (non-breaking hyphen) are never exercised (believed, scanner pattern for the term not read in full) | Copy written "self hosted models" -> scanner, data test and route test all use a hyphen-only pattern -> banned wording ships green | forbidden-copy.mjs is ask-first; propose to owner `self[-\u2010\u2011\s]hosted`, then add both spellings to expectEachToHit in E21 |

Checked and found sound (no finding): gate-marker tests per D20 (decision page exactly one `data-gate`, other routes equal their `gate:true` step count from data; the count is derived independently of the renderer, so a missing or extra marker fails); NBSP fixture in E27 holds a real U+00A0 (confirmed with od -c); apostrophe escaping in the Studbook count is proved non-vacuous by the WorkHorse page expecting 1; banned-list scan in masterCopy runs on full served HTML, stricter than text only; E18-E21 each carry near-miss negatives.

Findings outside scope: the banned-term list is copied in three places (forbidden-copy.mjs, portfolioData.test.js, masterCopy.test.jsx); intentional per file header, but they can drift.
Not verified: I did not run `npm test`; all claims come from reading the diff and the files above.

## Re-check (diff b69406118120..864e4484ef84)

Verdict: 1 finding (0 critical, 0 high, 0 medium, 1 low). Medium (AGENT_AUTHORITY too narrow) is closed.

Closed: the regex at src/masterCopy.test.jsx now matches modal forms and "is/are <participle> automatically", and new positive and near-miss tables (lines 188-209) pin both sides. Low (afterEach cleanup) closed: afterEach with doUnmock and resetModules added, inline cleanup removed (confirmed in diff). Oxford-comma ban (`approve, reject,? or hold`) has a hit case and two negatives (confirmed in diff).

Probe, regex copied into a scratch script and run with node (confirmed; exit 0):
- HIT: "the system may approve", "The agent can approve the change.", "Recommendations are applied automatically", "The system acts on it".
- Miss: "recommendations get applied automatically", "an agent that approves", "The agent then approves it", "The agents decide", "The agent has approved it", "The agent automatically applies fixes", "The agent will auto-approve".
- Correct misses (benign): "The agent does not act", "The agent never decides", "The agent cannot approve", "The agent will not approve".
- Real copy: the same pattern run over src/data/portfolioData.js returned 0 matches (confirmed). Decision-page copy has no false positive. I did not scan the built HTML.

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| low | src/masterCopy.test.jsx:54-60 | Widened AGENT_AUTHORITY still needs the subject, optional modal and verb to be adjacent; an adverb, relative clause, plural subject, perfect tense or "get" passive slips past (confirmed by probe above) | Copy "The agent then approves the fix" or "Fixes get applied automatically" -> no hit, R13 promise broken while test is green | src/masterCopy.test.jsx: allow `agents?`, an optional `\w+ly ` or `then ` gap, `(?:is|are|get|got) ` passive, and `has|have (approved|decided|applied)`; add each to the hit table. Low because the first line of defence is the banned-term list and owner-reviewed copy. |

Not verified: did not run `npm test`; did not run the regex against built HTML.

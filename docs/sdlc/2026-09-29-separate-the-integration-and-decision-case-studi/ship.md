# Ship: Separate the integration and decision case studies and revise the Data Health incident paragraph

Change id: `2026-09-29-separate-the-integration-and-decision-case-studi` · Tier 2 · Branch `wh/2026-09-29-separate-the-integration-and-decision-case-studi` at `77c1f0f` · PR https://github.com/muhibm1/Portfolio/pull/21
Prepared 2026-09-29 08:25 UTC · Design approved: see [approvals.md](./approvals.md) (G2 approved 07:56 UTC, D1 to D15 accepted)

This is the Ship document. Approving it (G4) lets the agent merge the PR. Merging to `main` publishes the public site, and the profile marks production as not automatic for agents.

## The short version

I placed your words on the integration page, its card and the decision page, replaced the Data Health incident paragraph with your sentence, and taught the copy scanner to refuse the old wording. This changes what recruiters read on three case-study pages and adds guards so removed claims cannot return. You are asked to read the strings below on the built pages (R168), confirm decision D18, and approve the merge.

## What changed

Plain words: two files of code changed and their tests grew. Copy is your text, unedited, in `src/data/portfolioData.js`; the scanner in `scripts/forbidden-copy.mjs` now bans 9 new terms and bans "cross-team" on the integration page only.

1. `scripts/forbidden-copy.mjs` (ask-first path, tier-2 floor): 9 new terms, a page-scoped term, and comments citing ADR paths; it decides what can be published, so it is first.
2. `src/data/portfolioData.js` (ask-first path): 10 lines of copy changed, string values only, no structure; it is what the public reads.
3. `CLAUDE.md`: 5 lines added on how to add a page-scoped term (review fix M1, 77c1f0f).
4. `src/checkForbiddenCopy.test.js`: 39 cases (10 more than main), one per new term, the page scope and the entry wiring.
5. `src/data/portfolioData.test.js`: pins every new string and the kept "tens of thousands"; three old pins moved to your new strings.
6. `docs/sdlc/<id>/`: brief, spec, plan, evals, three ADRs, approvals, verification, reviews, this document. `package.json` and lockfile are not in the diff (confirmed, empty diff).

### The strings as built (R168, your item to read)

Extracted from `dist/` by the verifier and re-grepped by me for the three not in verification.md (confirmed). Sources: [verification.md](./verification.md).

Homepage card summary for the integration study (`dist/index.html`, `dist/work/index.html`):
> Locking and unlocking permissions on protected map features ran on long command-line scripts. I replaced it with one tool that does it on demand and records why each change was made.

Integration intro, under the title. The same text is the page's meta, og and twitter description (confirmed, all three read):
> Locking and unlocking permissions on protected map features already worked, but it ran on long command-line scripts and extra tickets raised just to carry the change. I built a Python tool that does it on demand through the ticketing, repository and geo-data systems' own authenticated APIs, and records why each change was made.

Integration "What I built" paragraph:
> A Python tool that locks and unlocks map feature edit permissions on demand. It works through each system's authenticated REST API, so no one has to change the tools they already use, and every lock or unlock carries a comment explaining why, so the next person who asks why a feature is locked finds the answer on the feature itself.

Integration "What changed" paragraph:
> A script-driven process became access control on demand, turnaround on lock and unlock requests dropped by about 50%, and every change now leaves behind the reason it was made.

Integration callout, "What I'd bring to a client":
> Integrations tend to break on auth and permissions, not on the code in between. I've done that unglamorous part: getting separate systems to trust one tool, and keeping them trusting it when authentication changes underneath. The same instinct applies to the context around a system: the question someone will ask in six months is usually why is this like this, and that answer is cheapest to capture at the moment the change is made.

Integration third stat card: value "On demand", label "instead of hand-run scripts" (D4).

Data Health, "When it breaks at scale", and its stat card (value "Tens of thousands", label "buildings triaged in one incident I led", unchanged):
> A mass building-generation incident put tens of thousands of buildings into the data. I scoped the blast radius with SQL and QGIS and drove a delete, correct or retain decision on each one.

### Your verification item 3: the two situation sections back to back

Integration page, "The situation" (`/work/apple-integration`), one paragraph:
> Locking and unlocking protected map data already worked, but the path was hostile: long command-line invocations, extra tickets raised just to carry the change, and enough setup that a routine request was easy to get wrong. None of it required judgment, only care.

Decision page, "The situation" (`/work/apple-llm-triage`), two paragraphs:
> Every change to certain map data needed a person to judge whether it should go ahead, and that judgment was the bottleneck. The queue grew faster than reviewers could clear it. About two months of tickets had piled up with teams across the pipeline waiting on them.
>
> Building a fix wasn't part of my assigned role. I took it on anyway.

No machine can judge whether a reader could confuse the two; that read is yours (D13).

## Proof

Copied from [verification.md](./verification.md) (status green at `77c1f0f`, Node v24.19.0). Logs in `verify-logs/` (git-ignored, on disk).

| Check | Command | Exit | Output | Status |
|-------|---------|------|--------|--------|
| install | `npm ci` | 0 | verify-logs/install.log | confirmed |
| typecheck, format, e2e, screenshot | no check defined in the profile | n/a | n/a | not run: no command exists |
| lint | `npm run lint` | 0 | verify-logs/lint.log | confirmed |
| test | `npm test` (37 files, 480 passed, 0 failed) | 0 | verify-logs/test.log | confirmed |
| build | `npm run build` (8 pages prerendered) | 0 | verify-logs/build.log | confirmed |
| security audit | `npm audit --omit=dev --audit-level=high` (0 vulnerabilities) | 0 | verify-logs/security_audit.log | confirmed |
| G12 built-site scan | `node scripts/check-forbidden-copy.mjs dist` (40 files) | 0 | verify-logs/g12.log | confirmed |
| N2 no new dependency | `git diff --stat main..HEAD -- package.json package-lock.json` | 0, empty | verify-logs/n2.log | confirmed |
| E5 built-page assertions | scratchpad helper over `dist/` (10 of 10) | 0 | verify-logs/e5.log | confirmed |
| evals subset | `npx vitest run` on the 3 relevant files (84 passed) | 0 | verify-logs/evals.log | confirmed |
| R168 owner read | manual | n/a | strings above | not verified: yours to read |

Evals: golden 14/14, edge 7/7, failure 1/1, adversarial 1/1 (target 100% each), non-functional 2/2. Known failures: `wh.js known-failure list` printed "No known failures recorded." (confirmed).

## What the reviewers found

0 critical, 0 high, 5 medium (4 fixed in `77c1f0f`, 1 accepted), 13 low (all not fixed, listed). Reports: [reviews/](./reviews/).

| Severity | Reviewer | File:line | Finding | Resolution |
|----------|----------|-----------|---------|------------|
| medium | wh-security-reviewer | docs/design/redesign-2026-09/CS-DataHealth.dc.html:97; PORTFOLIO_REDESIGN_PLAN.md:130; this change's approvals.md:16 | The phrase you cut ("restricted geospatial") stays in the public repo's docs and git history; the repo is public (confirmed) | accepted: conductor under decision policy (D18), owner to confirm at G4, why: history of a public repo already holds it and approvals.md is append-only, so redacting docs removes nothing already published |
| medium | wh-adoption-reviewer | CLAUDE.md:42 | No note on page-scoped terms | fixed in 77c1f0f |
| medium | wh-adoption-reviewer | scripts/forbidden-copy.mjs:10,86,181 | Comments cite ADR and D numbers without a path | fixed in 77c1f0f |
| medium | wh-adoption-reviewer | scripts/forbidden-copy.mjs:137-178 | No reason per new term | fixed in 77c1f0f |
| medium | ecc-pr-test-analyzer | forbidden-copy.mjs:257, checkForbiddenCopy.test.js:538 | No test proved the entry wires `PAGE_SCOPED_TERMS` | fixed in 77c1f0f (entry test, red-proved) |
| low | bug, security, typescript | forbidden-copy.mjs:171,187,112 | Separator variants (nbsp, non-breaking hyphen, double space, "cross team", "high impact") pass the phrase and page-scoped terms (D17) | not fixed; left to your R168 read |
| low | bug, silent-failure | forbidden-copy.mjs:188 | `onlyPaths` hard-codes slug `apple-integration`; a rename would silently drop the ban | not fixed |
| low | bug, security | forbidden-copy.mjs:88 | No test enforces "no g or y flag" | not fixed |
| low | bug, security | portfolioData.test.js:544 | Source-side cross-team test is hyphen-only | not fixed |
| low | bug, typescript | forbidden-copy.mjs:95-97 | Word families fire on code such as "error boundary" | not fixed; accepted by ADR 0002 |
| low | typescript, pr-test, security | check-test-floor.mjs:53 | Floor pins the scanner tests at 29; file now has 39 cases | not fixed; D11 accepted at G2 |
| low | ecc-pr-test-analyzer | forbidden-copy.mjs:345 | Backslash normalisation untested (redundant) | not fixed |
| low | ecc-pr-test-analyzer | checkForbiddenCopy.test.js:68 | Sandbox plurals untested | not fixed |
| low | ecc-silent-failure-hunter | forbidden-copy.mjs:343 | SSR comment nodes could split a phrase | not fixed |
| low | ecc-react-reviewer | src/pageMeta.js | pageMeta may hold separate copy; none found | not fixed; confirmed by the built description check (E5) |
| low | wh-adoption-reviewer | profile.yml:88; forbidden-copy.mjs:303 | "seventeen-string" and stale T4 comment | not fixed |
| low | wh-conformance-reviewer | commit 1ad9c3e body | Names the change request generically | not fixed (history) |
| low | wh-security-reviewer | portfolioData.js:695,734 | R168 list omitted the intro and "What I built" | addressed in this document |

Spec conformance: 11 of 11 requirements traced (R160 to R170; R168 is manual by design). Adoption score: 3 of 5, scored at `bad16dc` before the fix commit and not re-scored (confirmed).

## Decisions

D18 needs you and leads. Approving accepts every recommendation; D1 to D15 were accepted at G2 (see [brief.md](./brief.md)).

| # | Decision | Recommendation | Alternative | Why the recommendation |
|---|----------|----------------|-------------|------------------------|
| D18 | The cut phrase stays in public docs and git history | Accept and record; you confirm here | Redaction follow-up: scrub the phrase from the 3 tracked docs and this change's SDLC files (history stays) | Public git history already holds it; approvals.md is append-only |
| D1 | Integration title | Keep it | New title | Your answer |
| D2 | "Cross-team" on the decision page | Keep; ban on the integration page only | Ban site-wide | Your answer; matches your resume |
| D3 | Incident count | Keep "tens of thousands" | "thousands" | Your answer |
| D4 | Third stat card | Value "On demand", label "instead of hand-run scripts" | Whole sentence as value | Card layout |
| D5 | Integration card summary | Your text, verbatim | Old summary | Your text |
| D6 | Page-only ban mechanism | Scanner term scoped by path, plus a data test | Test only | Scanner guards the served pages (ADR 0001) |
| D7 | Disclosure words | sandbox, boundary, terrain, landmark families, two phrasings | Also border, buildings, water, mesh | Those collide with class names (ADR 0002) |
| D8 | Ban "tens of thousands" | No | Yes | Kept fact |
| D9 | Order | Copy first, scanner second | One wave | Tests red until copy lands (ADR 0003) |
| D10 | Old pins | Update three integration pins | Leave red | Follows your authorised change |
| D11 | `check-test-floor.mjs` | Not edited | Raise the pin | Counts are minimums; follow-up |
| D12 | Decision page situation | Replace first paragraph | Prepend | Avoid saying "two months" twice |
| D13 | Situation read | You read both at G4 | Skip | No machine can judge |
| D14 | Data Health paragraph | Your text verbatim | Old sentence | Your reason |
| D15 | Scanner refuses "restricted geospatial" | Yes, global, case-insensitive | Test pin only | One list entry |
| D16 | Labels for phrase patterns | "changed incorrectly wording", "high impact wording", bare words for the rest | Longer labels | Short labels read clearly in CI output |
| D17 | D15 spelling variants | Not taken; plain substring | Cover nbsp and hyphen variants | Left to your R168 read; listed as a low above |

## Deploy and undo

| Environment | Command | Automatic on approval | Rollback |
|-------------|---------|-----------------------|----------|
| dev | `npm run dev` | yes, but not run: a dev server is never left running and nothing needs deploying | stop the server |
| staging | none defined | no | n/a |
| prod | `git push origin main` (you run it; merging to `main` publishes the site through GitHub Actions) | no | `git revert -m 1 <merge-sha>` on `main`, then push; revert the copy and scanner commits together or neither (ADR 0003) |

Rollback rehearsed: not rehearsed: the only deploy target is production and it is never a rehearsal target; dev serves no deploy state to roll back. Config and secrets touched (names only): none.

## Clock

Clock: agents 56 m of 1 h 30 m budget · waiting on you 45 m · dead 4 m · wall 1 h 44 m

## Your decision

Approve to merge, or reject with notes to send it back. Approving accepts D16 to D18 and the recommendations above. Read the strings and the two situation sections first; D18 is the only decision you have not already made.

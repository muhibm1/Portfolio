Verdict: 3 findings (0 critical, 0 high, 1 medium, 2 low). Scope: revision 49618de..HEAD only (src, scripts, .github, plus CLAUDE.md and profile wording). None of the findings was introduced by this revision in a way that exposes data.

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| medium | .github/workflows/deploy.yml:120 | Carried over from main, and agrees with the silent-failure hunter's finding. There is no `node scripts/check-phone-redaction.mjs` step in any workflow. The only phone check is the smoke regex on the served HTML and module script (lines 457 to 485), and it runs after publication. I rate this medium, not high: the number at risk is the owner's own, and the scan exits 0 locally. Confirmed by grepping the workflow. | A later edit reintroduces the number into a committed file. CI stays green, and the smoke check only sees it if it reaches the served HTML or JS, which happens after the site is already live. | deploy.yml build job: add a blocking step `node scripts/check-phone-redaction.mjs` before Build. The script compares against reference commit b50497f, so the checkout step probably needs enough history (for example `fetch-depth: 0`) or the scan exits 2 "cannot run". Believed, not verified. Workflow changes are ask-first. |
| low | scripts/forbidden-copy.mjs:250 | Agrees with the bug reviewer's finding. `readFileSync(path, 'utf8')` runs on every file under src/, including src/assets/hero.png, and nothing filters by extension. Confirmed by reading lines 224 to 280 and running `git ls-files src`. For security this is low: it can only cause false positives, not a bypass. The current run exits 0 (confirmed). | A new image happens to decode to a forbidden term such as "2x" or a timing pattern. CI blocks the release, and the likely response is to loosen the scanner. | scripts/forbidden-copy.mjs: skip binary extensions the way phone-redaction-scan.mjs does with its BINARY_EXTENSIONS list (import that list or share it). |
| low | docs/sdlc/2026-09-25-rebuild-portfolio-to-approved-redesign/spec.md:219 | The requested spot check returns 1, not 0: `git log -p main..HEAD \| grep -c "Appendix A: the resume, verbatim"`. The only hit is the constraint-audit row in commit 07f788f that names the original heading. It contains no resume text. Confirmed: both branch versions of docs/design/redesign-2026-09/PORTFOLIO_ALIGNMENT_PASS.md (07f788f and 3a86da5) are 170 lines, and Appendix A at line 164 reads "Withheld from the committed copy". src/publicDirectory.test.js:133 asserts this. | No privacy exposure. The risk is process only: a spot check whose literal pass condition cannot be met without rewriting history reads as a red result. | Change the spot check to rely on src/publicDirectory.test.js:133 (the "resume, verbatim" absence test), or reword spec.md:219 in HEAD. Rewording does not change the log count, because 07f788f keeps the phrase. |

Revision checks (all confirmed):
- deploy.yml diff: removes only the "Resume PDF hash" step and the PDF fetch_and_check line, and renames the R143 smoke step. No permissions, contents, pages, id-token, `uses:` or `secrets.` line was added or removed (count of such changed lines: 0). No new action, no new secret.
- phone-redaction-scan.mjs: `.pdf` removed from BINARY_EXTENSIONS. This tightens the scan, because any PDF now fails as undecodable instead of being skipped.
- forbidden-copy.mjs: adds 14 string terms and two regex terms, TIMING_FIGURE_TERM and PADDOCK_RETIREMENT_TERM. Neither regex reads input from outside the repository. The PADDOCK pattern uses a lazy tempered scan per line. It runs only in CI on repository files, so its worst-case backtracking is not attacker-reachable.
- `target="_blank"`: 7 occurrences, in CaseStudyCards:56, CaseStudyPage:78 and 181, HomeHero:42, SiteHeader:96, and ContactFooter (2). Every one has `rel="noopener noreferrer"` on the same element.
- New outbound URLs in src: only static https://github.com/muhibm1 profile and snapshot links. None are fetched, so there is no new network load, subprocessor or CSP change. There is no dangerouslySetInnerHTML, innerHTML or eval.
- `node scripts/check-phone-redaction.mjs`: exit 0. `node scripts/check-forbidden-copy.mjs`: exit 0. `git ls-files "*.pdf"`: empty.
- No change to package.json, package-lock.json, index.html, vite.config.js, public/, .gitignore or .npmrc (empty diff). No tracked `.env*` file.

Regime walk: not applicable. The profile compliance regimes list is `[]` (profile.yml:150, confirmed). The revision adds no visitor-data processing.

Pre-ship checklist (baseline):
| Item | State | Evidence |
|---|---|---|
| for update policy columns pinned | n/a | No database. CLAUDE.md says "no backend, no database". |
| for insert invariants re-checked on update | n/a | No database |
| New function grants, definer, search_path | n/a | No SQL functions |
| CREATE OR REPLACE diffed | n/a | None. The script edits were diffed line by line above. |
| New policy ships allow and deny tests | n/a | No policies |
| Deny-side assertions distinguish modes | n/a | No policies |
| New storage bucket private | n/a | No storage |
| Free-text table length and rate limit | n/a | No tables, no visitor input |
| Admin capability writes append-only log | n/a | No admin surface |
| New secret or env var gitignored as a pattern | n/a | No new secret. `git ls-files` shows no `.env*`. |
| Third-party runtime import pinned | n/a | No dependency change (empty diff on package.json and the lockfile) |
| Branch artifact trail does not disable CI checks | pass | The only step removed is the PDF check, and its subject (the PDF) was deleted (D23/D30, confirmed by the empty ls-files) |

Findings outside scope:
- AgentShield@1.6.0 local scan (exit 2) reported 266 critical "Azure storage key" findings in package-lock.json. These are false positives: line 40 is an npm `integrity` sha512 value (confirmed).
- It also reported 2 critical and 3 high prompt-defense findings on CLAUDE.md. They pre-date this revision, whose CLAUDE.md diff only removes two resume references (confirmed). Owner's call.
- It reported 2 high on .claude/settings.local.json: `Bash(node *)` and no deny list. The file is gitignored (.gitignore:31) and untracked (confirmed), so this is local owner configuration.

Not verified:
- I did not review the contents of the three public snapshot repositories linked from src for secrets, client names or phone numbers. D38 says their history is redacted (believed, not verified).
- I did not re-run `npm audit --omit=dev --audit-level=high` in this review. No dependency changed, and the conductor reports verification as green.

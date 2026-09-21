# Security review: 2026-09-20-fix-phone-redaction-scanner

Verdict: 8 findings (0 critical, 0 high, 4 medium, 4 low)

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| medium | scripts/check-test-floor.mjs:79-86 | `wholeSuiteCounts` coerces every count with `Number(x) \|\| 0`; the inline body it replaced summed raw values, so `undefined + undefined + undefined === 0` was false and the step failed. Rule: "CREATE OR REPLACE is a diff" / "CI must actually run the security tests". Confirmed empirically: a report with `numPassedTests: 44` and no pending/todo/failed keys exits 0 under the new script and 1 under the old inline body; same for `numPendingTests: "oops"` | A future Vitest renames or drops a count key. The carried "0 pending, todo or failed" rule silently reads 0, the log prints `numPendingTests=0` for an absent key, and a run with skipped tests publishes the site | scripts/check-test-floor.mjs: treat a count key that is absent or not a finite number as could-not-run (exit 2), not 0 |
| medium | scripts/check-test-floor.mjs:64-68 | `reportReadFailureReason` prints `error.message`, and V8 embeds the first ~10 characters of the file in a JSON parse error. The comment above it claims the line is sanitized, which covers the path only. Rule: no personal data in logs; verify before asserting. Confirmed: a fixture beginning `SECRET_TOKEN=abc123...` produced `::error::Test floors could not run (R52, R11): f_content.json is not valid JSON (Unexpected token 'S', "SECRET_TOK"... is not valid JSON).` | Whatever file sits at the report path when it is not JSON has its first characters echoed into a world-readable Actions log on a public repository, in the workflow whose purpose is keeping the owner's number out of public bytes | scripts/check-test-floor.mjs: print `error.name` or a fixed phrase and drop `error.message`; correct the comment |
| medium | .workhorse/profile.yml:73-84,159 | The three files that now constitute the control (`scripts/check-phone-redaction.mjs`, `scripts/phone-redaction-scan.mjs`, `scripts/check-test-floor.mjs`) are in neither `sensitive_paths` nor `tier_floor_paths: 2`, while the three sibling blocking checks are in both. Constraint-audit medium (D7) still open; confirmed by reading the profile at tip 356f41c | An agent edits the floor script or the scanner with no ask-gate and no tier-2 floor, so the check guarding the publish path can be weakened in a tier-1 run | .workhorse/profile.yml: the owner adds the three paths to both lists. Agents may not edit the profile |
| medium | .github/workflows/deploy.yml (absent step) | The working-tree scan still never runs in CI; the only CI-side redaction control is the R82 served-bytes pattern (deploy.yml:396-404), which reads `smoke/root.html` and the module bundle only. Constraint-audit medium, accepted and deferred (D10). Confirmed: no `check-phone-redaction` step exists, and the checkout at line 39 has no `fetch-depth`, so the reference commit is unreachable | A tracked file that is not the served HTML or the module bundle carries the number to `main` and nothing in the publishing path objects | Follow-up change: `fetch-depth: 0` plus a blocking `node scripts/check-phone-redaction.mjs` step. Carry the acceptance and its owner into the Ship document |
| low | scripts/check-test-floor.mjs:36-40 | A report whose body is the JSON literal `null` parses, then `wholeSuiteCounts(null)` throws an uncaught TypeError. Confirmed: exit 1, a stack trace naming the script on stderr, no `::error::` line | A truncated or placeholder report fails the build with a stack trace instead of the documented could-not-run annotation, so the cause is misread as a test failure | scripts/check-test-floor.mjs: reject a parsed report that is not a non-null object inside the same try, returning `EXIT_CANNOT_RUN` |
| low | scripts/check-test-floor.mjs:99-104 | `findRedactionSuite` matches the suffix `/src/checkPhoneRedaction.test.js` with no root anchor. Confirmed: a report whose only entry is `/tmp/fixture-copy/src/checkPhoneRedaction.test.js` with 44 passed exits 0 | A copy of the suite anywhere on the runner satisfies the pin while the repository's own file is gone or empty | scripts/check-test-floor.mjs: resolve entry names against `process.cwd()` and compare the relative path |
| low | .gitignore (absent entry) | `vitest-results.json` is neither tracked nor ignored, and nothing binds the report to the run that just finished: no freshness, no commit, no run id. Confirmed with `git ls-files`, `git status --ignored` and by reading `.gitignore`. Not reachable today: "Run the tests" (deploy.yml:99) has no `continue-on-error` and writes the file before the floor reads it | A committed or cached report is what the floor judges after any future edit that lets the test step pass without writing a fresh report; the floor reports green over an old run | .gitignore: add `vitest-results.json`. Optionally reject a report older than the process start |
| low | scripts/check-test-floor.mjs:27,31 | `MINIMUM_SUITE_PASSED` stays 12 against an actual 282 passed, and only the redaction file is pinned, so `src/checkTestFloor.test.js` (the 9 tests proving this floor works) and the other CI-guard suites can be deleted with CI green. Carrying 12 verbatim was the stated decision (R11). Confirmed by my own run: the redaction file reports 44 passed, 0 pending, 0 todo, 0 failed | The floor script is edited to always pass and its own suite removed in the same commit; nothing in CI notices | scripts/check-test-floor.mjs: add `src/checkTestFloor.test.js` to the pinned set, or raise the whole-suite floor toward the real count |

## Not applicable, with reason

Database and platform baseline, all not applicable: no database, no Postgres, no Supabase, no
auth, no visitor data collection (confirmed: profile `stack.database: none`, repo CLAUDE.md, and
the diff adds no SQL). RLS `for update` and `for insert` policies, `SECURITY DEFINER` grants and
`search_path`, `CREATE OR REPLACE` migration bodies, policy admit/deny test pairs, deny-side
assertion shapes, storage buckets, free-text tables, admin capabilities and append-only logs have
no instance in this diff and yield no findings.

Regime walk: `compliance.regimes: []` (confirmed, profile.yml:141-143); no PHI, no cardholder
data, no ledger, no assurance engagement, so the gdpr, hipaa, pci-dss, soc2 and financial
"At review time" lists yield no findings. The one personal datum in scope is the owner's own
phone number, which is the thing being defended.

AgentShield: not applicable. The diff touches no `.claude/`, `CLAUDE.md`, `agents/`, `skills/`,
`hooks/`, `.mcp.json` or plugin manifest (confirmed, `git diff --stat`: seven files under
`.github/`, `scripts/`, `src/` and `docs/sdlc/`).

## Pre-ship security checklist

| Item | State | Evidence |
|---|---|---|
| `for update` policy columns listed and pinned | n/a | no database, no policy in the diff (confirmed) |
| `for insert` policy re-checked on the UPDATE path | n/a | same |
| New function grant/revoke, `SECURITY DEFINER`, `search_path` | n/a | no SQL function; the two new files are Node ES modules (confirmed) |
| `CREATE OR REPLACE` diffed line by line | pass, with finding 1 | `main:.github/workflows/deploy.yml:102-121` diffed against `scripts/check-test-floor.mjs`: the 12 floor, the zero pending/todo/failed rule, the `Vitest report <path>: numPassedTests=...` line and the `::error::Test floor failed (R52): need at least 12 passed and 0 pending, todo or failed; got ...` line all survive verbatim (confirmed; my fixture runs reproduce both). Changed on purpose: `process.exit(1)` to `process.exitCode` (equivalent, exit 1 observed) and `Test floor passed.` to `Test floors passed.` (spec "Interfaces"). One rule did not survive: the NaN fail-closed behaviour, finding 1 |
| Every new policy ships an admit and a deny test | n/a | no policy. Analogue checked: `src/checkTestFloor.test.js` ships one passing report and six failing ones (confirmed by reading) |
| Deny-side assertions distinguish failure modes | pass | failure cases assert the exit status, the `::error::` prefix and `not.toContain('Test floors passed.')`, not merely "no error" (confirmed) |
| New storage bucket private | n/a | none |
| New free-text table bounded and rate limited | n/a | none |
| New admin capability writes an append-only log | n/a | none |
| New secret or env var covered by `.gitignore` as a pattern | pass | none added; `.env*` present as a pattern and `git ls-files` returns no `.env` file (confirmed). Separately finding 7 |
| New third-party import pinned exactly | pass | both new scripts import `node:` builtins only; no dependency added; `npm audit --omit=dev --audit-level=high` printed "found 0 vulnerabilities", exit 0 (confirmed this session) |
| CI runs the security tests and fails loudly | pass, with findings 1 and 4 | the floor step runs between "Run the tests" and "Build", has no `continue-on-error`, and `deploy` is `needs: build` (confirmed, deploy.yml:99-136). A report that is missing, empty or not JSON exits 2; `{}`, `[]`, a missing suite entry, a short count and one pending assertion each exit 1 (confirmed by fixture runs). No credential-gated skip exists, and the carried zero-pending rule fails the build on any skipped test anywhere |

## Secret handling and the publishing gate

Confirmed, not believed. `node scripts/check-phone-redaction.mjs docs/sdlc/2026-09-20-fix-phone-redaction-scanner`
scanned 218 files, covering every tracked file at tip 356f41c plus this change's untracked
artefacts, and reported 0 hits, 0 undecodable; `--self-test` reported 17 of 17 forms hit and 0 of
9 near-misses. Every phone-shaped digit run the diff adds is in the NANP fictional 555-01xx range
(`5555560100`, `555-556-0100`, `(555) 556-0100`, and the `555-555-0100` near-miss family),
declared as `SELF_TEST_REFERENCE` at scripts/phone-redaction-scan.mjs:29. A grep of added lines
for key, token, password, bearer, private-key and connection-string shapes returned nothing. The
scanner cannot print file content: a hit line is `` `${displayedPath}:${index + 1}: ${formName}` ``
with `formName` one of three constants (scripts/phone-redaction-scan.mjs:242-247) and the summary
carries counts only. The floor's report holds counts and one constant path; its one
content-printing path is finding 2. `execFileSync('git', args)` passes an argument array with no
shell (line 374), and replacing the workflow's inline `node -e '...'` with a script file removes
YAML quoting as an injection surface.

Publishing gate: no weakening found (confirmed by reading deploy.yml in full). The step's `run` is
a literal command with no `${{ }}` expression; job names, which branch protection matches, are
unchanged; `permissions` are unchanged; `continue-on-error` appears only on the informational
audit, as before; the floor runs before Build and before the artifact upload, so a failure stops
the job with nothing uploaded.

Findings outside scope: none.
Not verified:
- The floor on the Linux CI runner; it cannot run until the owner pushes to `main`. My fixture
  used a Linux-shaped absolute report name and matched (locally only).
- Whether a future Vitest keeps the report keys the floor reads. Believed stable, not verified.
- That the 44 pinned tests still assert what their titles claim: the floor pins a count, not an
  identity, so a rewritten case of the same number passes.

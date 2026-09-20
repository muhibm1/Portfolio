# Spec: Fix the phone redaction scanner's mixed-encoding miss and its silent no-run

Change id: `2026-09-20-fix-phone-redaction-scanner`
Intent: the request, quoted in [brief.md](./brief.md) under "Problem" (no intent.md was written for this change)
Status: draft
Policy skills applied: wh-agent-rules, wh-security-baseline, wh-readable-code, wh-adr, wh-evals

## Summary

`scripts/check-phone-redaction.mjs` is the R89 repository check that the owner's phone number
has not come back into any tracked file (ADR 0010 of change 2026-09-11). It has two false-green
defects, both confirmed on this host: a file mixing UTF-8 and UTF-16 regions can hide the number
from the single decoder the script picks, and starting the script through a junction or symlink
runs nothing and exits 0. The one decision that matters: hits are found by scanning every
decoding layer of a file, and the entry file always runs the scan because it no longer has a
direct-run guard at all. After the audit, the same false-green shape is closed one level up: CI
fails unless the redaction test file itself ran in full (R11, ADR 0004, one workflow step).

Everything marked `confirmed` was observed on this host (Windows 10, Node v24.19.0) by reading
the code or running a probe in the scratchpad; `believed` is inference.

## Requirements

| ID | Requirement | Acceptance check | Source |
|----|-------------|------------------|--------|
| R1 | The scanner SHALL report a hit for the number in any UTF-8 or UTF-16 region of a file, whatever the encoding of the file's other regions and whatever the byte alignment of the region | Fixtures A (UTF-16LE mark, UTF-16 text, even-length UTF-8 tail with the number), B (same with a UTF-16BE mark), C (even-length UTF-8 head with the number, BOM-less UTF-16LE tail) each yield exit 1 and a hit line naming the file; today all three yield exit 0 with 0 hits (confirmed) | request, defect 1 |
| R2 | A file holding a zero byte that matches no recognised layout SHALL still be scanned in every layer for hits, SHALL be named in the report as undecodable and counted, and with no hit SHALL make the exit code 2 | Zero byte then a UTF-8 line with the number: exit 1, one hit line, one undecodable line, summary says 1 undecodable. Zero byte then clean UTF-8: exit 2, one undecodable line, 0 hits | request, "must not be reported clean" |
| R3 | Exit precedence SHALL be: 1 if any hit, else 2 if any file was undecodable or none was scanned, else 0. Report line formats SHALL stay `path:line: form`, `path: could not be decoded ...` and the summary line; no line SHALL hold matched text, file content or a reference digit | One hit file plus one undecodable clean file: exit 1, summary counts both. No report line for any fixture contains the digits `556` or the word `today` | ADR 0002 |
| R4 | Every decoding layer SHALL tolerate an odd byte length and a file of zero bytes without throwing; a trailing odd byte is dropped for the UTF-16 layers | An odd-length file with the number in UTF-16LE at odd alignment yields exit 1; an empty file counts as scanned with exit 0 | ADR 0002 |
| R5 | The entry `scripts/check-phone-redaction.mjs` SHALL run the scan whenever Node starts it, with no comparison of `process.argv` against the module path, through a junction, a symlink, a relative path or an absolute path; its stdout SHALL never be empty on exit 0; the repository root SHALL be the real path of the directory above the library | Started through a directory junction (a symlink on POSIX) with `--self-test <dir>` and a planted number: exit 1 and the hit line on stdout. Same with a clean directory: exit 0 and the summary line. Started by the documented relative path with `--self-test`: exit 0 and the self-test line | request, defect 2; ADR 0001 |
| R6 | Importing `scripts/phone-redaction-scan.mjs` SHALL run nothing: no output, no exit code set | A child Node process that only imports the library prints nothing but its own marker and exits 0 | ADR 0001 |
| R7 | `--self-test` SHALL accept directory arguments and scan every file under them with matchers built from `SELF_TEST_REFERENCE`, print a leading line saying the reference is synthetic, use the scan exit codes of R3, and never scan tracked files in this mode; with no directory it SHALL behave as today | `--self-test <dirWithPlant>`: exit 1 with a hit line. `--self-test <emptyDir>`: exit 2 (0 files scanned). `--self-test <missingDir>`: exit 2 and the existing "does not exist" message on stderr. `--self-test` alone: exit 0 and `Self-test: 17 of 17 form renderings hit, 0 of 9 near-misses hit.` | ADR 0003 |
| R8 | Existing behaviour SHALL be retained: binary extensions skipped unread, missing tracked paths counted, `git ls-files` plus directory arguments scanned in real mode, the reference derived from `b50497f` with exit 2 on failure, the 17 form renderings and 9 near-misses of the self-test | The existing matcher tests, the three UTF-16 tests and the binary-skip test in `src/checkPhoneRedaction.test.js` pass unchanged; `node scripts/check-phone-redaction.mjs` on the change branch exits 0 with 0 undecodable and 0 hits (verifier, full history) | ADR 0010 of 2026-09-11 |
| R9 | The header comments of both script files SHALL describe the layered scan, the exit precedence, the `--self-test <dir>` mode and the fact that the entry always runs; no documentation SHALL claim the script skips files with a zero byte | Reviewer reads both headers against R1 to R7 | wh-readable-code |
| R10 | The entry SHALL set the process exit code through one library function, `exitCodeOrCannotRun`, that passes 0, 1 and 2 through unchanged and, for any other value, prints `check-phone-redaction could not run: the scan returned no exit code` on stderr and returns 2 | E26: the function returns 2 with one stderr line for undefined, null, a string and 7, returns 0, 1 and 2 unchanged with no stderr, and the entry's text contains `exitCodeOrCannotRun(main(` | audit, medium: non-numeric return |
| R11 | CI SHALL fail unless the Vitest JSON report holds `src/checkPhoneRedaction.test.js` with at least the pinned number of passed tests (the file's count at merge, read from a report by Task 3, 44 expected) and no pending, todo or failed test in that file, in addition to the whole-suite floor carried verbatim (12 passed, 0 pending, todo or failed). `scripts/check-test-floor.mjs` SHALL enforce both, exit 2 when the report is missing or not JSON, and `deploy.yml` SHALL run it in the step after `npm test` in place of the inline floor | E28 to E32 spawn the script on fixture reports; E33 reads `deploy.yml` as text | audit, high: CI floor |
| R12 | The subprocess tests SHALL create junctions only inside their temporary fixture directory, remove each with `fs.unlinkSync` before the directory is removed, and SHALL prove the repository's `scripts/` listing is unchanged after they run | E27: the listing captured before the block equals the listing after; the fixture directories are gone | audit, medium: fixture cleanup |

Non-functional: N1 in `evals.md`, a 4 MB file holding zero bytes (five layers) scans in under
5 seconds in the test process. No compliance regime applies (`profile.compliance.regimes: []`);
the control this script implements is the business control "owner's phone number stays out of
tracked files" in `docs/sdlc/constraints.md`, business constraint 3.

## Design

### Architecture

Two files under `scripts/`, both plain Node ES modules with no dependency beyond `node:`
builtins, following the pattern of `scripts/check-npmrc.mjs` and
`scripts/check-built-css-fonts.mjs` (each resolves `REPOSITORY_ROOT` from `import.meta.url`,
confirmed).

- `scripts/check-phone-redaction.mjs` (modified): the entry. Responsibility: start the scan.
  Interface: the documented command lines are unchanged. Dependencies: the library. Body: import
  `main` and `exitCodeOrCannotRun`, set
  `process.exitCode = exitCodeOrCannotRun(main(process.argv.slice(2)))`. No guard (ADR 0001).
- `scripts/phone-redaction-scan.mjs` (new): the library. Responsibility: matchers, decoding
  layers, file scan, report, self-test, `main`. Interface: exports `EXIT_CLEAN`, `EXIT_HIT`,
  `EXIT_CANNOT_RUN`, `SELF_TEST_REFERENCE`, `BINARY_EXTENSIONS`, `buildMatchers`,
  `formNamesFoundIn`, `decodeFile`, `scanFiles`, `main`, `exitCodeOrCannotRun`. Importing runs
  nothing. Public interface at the top, helpers below; functions under 40 lines.
- `src/checkPhoneRedaction.test.js` (modified): imports the library; keeps every existing test
  except the one D3 rewrites; adds the fixtures and subprocess cases in `evals.md`. Junctions
  live inside the fixture directory and are removed with `fs.unlinkSync` (R12, D12).
- `scripts/check-test-floor.mjs` (new, ADR 0004): the CI floor. Responsibility: read the Vitest
  JSON report `npm test` writes in CI and fail when the whole suite is below the existing floor
  (rules carried verbatim from `deploy.yml` lines 107 to 118, confirmed) or when the redaction
  test file is absent, short or has a test not passed. Interface:
  `node scripts/check-test-floor.mjs <report.json>`; exit 0 pass, 1 fail, 2 could not run.
  Dependencies: `node:fs`, `node:path`. Report shape and matching rule in ADR 0004.
- `.github/workflows/deploy.yml` (modified, sensitive path): the step "Test-count floor (R52)"
  is renamed "Test-count floors (R52, R11)" and its body becomes
  `run: "node scripts/check-test-floor.mjs vitest-results.json"`. No other line changes.
- `src/checkTestFloor.test.js` (new): spawns the floor script on fixture reports written to a
  temporary directory, as `src/checkNpmrc.test.js` does, and reads `deploy.yml` as text, as
  `src/deployWorkflowNodeVersion.test.js` does.

The decoding change (ADR 0002) replaces `decodeText`'s single choice with two functions: one
that returns the list of decoding layers for a byte buffer, and one that classifies the buffer
as recognised or undecodable for the completeness verdict. `scanFiles` scans every layer,
unions the hit lines per file through a `Set`, and counts the file as scanned or undecodable
by the classification. `scanExitCode` applies the R3 precedence.

The self-test change (ADR 0003) passes directory arguments after `--self-test` to the same
`listFilesUnder` and `scanFiles` path the real scan uses, with the synthetic matchers.

### Data

Not applicable: no database, no schema, no stored data. The only sensitive value is the
reference number, which exists in the script's process memory during a real scan and is never
printed (unchanged from ADR 0010).

### Interfaces

CLI, unchanged and extended:

```
node scripts/check-phone-redaction.mjs                 real scan: git ls-files
node scripts/check-phone-redaction.mjs dist            real scan plus every file under dist/
node scripts/check-phone-redaction.mjs --self-test     forms and near-misses only
node scripts/check-phone-redaction.mjs --self-test <dir> [<dir>...]
                                                       forms and near-misses, then scan the
                                                       directories for the synthetic number
```

Stdout lines: `<path>:<line>: <form>` per hit (deduplicated); `<path>: could not be decoded
with confidence as UTF-8 or UTF-16; scanned in every layer, counted as incomplete` per
undecodable file; in self-test mode with directories one leading line `Self-test scan of <n>
directories against the synthetic reference; this is not the redaction scan.`; the existing
`Self-test: ...` line; and the summary `Scanned <n> files (<b> skipped as binary, <m> missing
from disk, <u> undecodable), <h> hits.` Stderr: `check-phone-redaction could not run: <reason>`
on exit 2 from a thrown error or a non-code return (R10). Exit codes: 0, 1, 2 as R3.

Floor script stdout (R11), in this order: `Vitest report <path>: numPassedTests=<n>
numPendingTests=<n> numTodoTests=<n> numFailedTests=<n>` (carried); on a whole-suite failure the
existing line `::error::Test floor failed (R52): need at least 12 passed and 0 pending, todo or
failed; got <counts>.` (carried verbatim); `Redaction suite src/checkPhoneRedaction.test.js:
<p> passed, <n> not passed (floor <f>).`; on failure `::error::Redaction suite floor failed
(R11): <file> is missing from the report.` or `...: need at least <f> passed and 0 not passed;
got <p> passed, <n> not passed.`; `::error::Test floors could not run (R52, R11): <reason>` with
exit 2; else `Test floors passed.` No line holds test names or file content.

### Security and privacy

Threat: a false green from this check lets the owner's phone number (personal data, the
owner's own) return to a public repository unnoticed. Controls: R1 to R5 remove the two
confirmed false-green paths; R3 keeps the report free of the number; R7 keeps the synthetic
mode from ever scanning tracked files, so it cannot be mistaken for the real scan on the tree.
Baseline checklist: no policy, function, migration, bucket, admin capability, secret or
runtime dependency is added. "CI must actually run the security tests" was claimed and did not
hold (audit, high): the whole-suite floor of 12 cannot tell whether this file ran. R11 closes
it: CI fails unless the report shows the redaction file with its pinned count passed and
nothing skipped, and the subprocess cases run on a shallow clone (ADR 0003). "Never let a
failure path be both silent and consequential": R10 closes the non-code return; R12 closes the
fixture-cleanup risk. Scoped narrower than the problem, on purpose (D10): the real tree scan
still does not run in CI, because the reference needs full git history and the checkout is
shallow (`deploy.yml` line 39, no `fetch-depth`, confirmed); what remains is the developer-
machine run recorded in `docs/sdlc/constraints.md` business constraint 3 and the served-bytes
pattern of the R82 smoke step. Retention position this design relies on (audit, low): the
number stays in git history from `b50497f`, recorded in `docs/hosted-config.md` section 7 and
`profile.compliance.retention_notes` (confirmed); a history rewrite would make the real scan a
permanent exit 2, and ADR 0003 says so.

### Failure modes

| Dependency | Slow, down or wrong | Handling |
|------------|---------------------|----------|
| `git` (real scan only) | missing, shallow clone, reference line absent | unchanged: thrown error, stderr message, exit 2 |
| File system | tracked path deleted | unchanged: counted missing |
| File system | unreadable file (permission) | unchanged: thrown error, exit 2 |
| File system | directory argument missing | unchanged: "does not exist" error, exit 2 (E16) |
| Bytes | odd length, empty, zero bytes anywhere | R4: no throw; R2: layers scanned, incomplete flagged |
| Node ESM loader | entry started through an alias path | R5: no guard, so nothing to get wrong |
| `main` (future edit) | returns undefined or a non-code | R10: stderr line, exit 2 |
| Vitest report (CI) | missing, not JSON, file absent, test skipped | R11: exit 2 or 1 with an `::error::` line; the build job stops before Build |

Nothing is retried; every failure is printed and carried in the exit code.

### Observability

A command-line check with no service behind it. What a person sees: the report lines above and
the exit code; a run that prints nothing is now impossible on exit 0 (R5). No logs or metrics
are added.

## Alternatives considered

| Option | Why not |
|--------|---------|
| Fix the guard with `fs.realpathSync.native` or `dev`/`ino` comparison, keep one file | Still a platform-sensitive comparison with a throw path; UNC paths defeat realpath (confirmed); ADR 0001 |
| Segment mixed files at detected encoding boundaries | A heuristic with its own misses; ADR 0002 |
| Any zero byte means exit 2 without scanning | Pushes every UTF-16 file to a human and drops hits the layers can find; ADR 0002 |
| Subprocess tests that run the real scan and skip on a shallow clone | Trips the CI test-count floor; a skipped security test is the forbidden pattern; ADR 0003 |
| Prove the redaction suite ran with a test inside the suite, or a test in another file that reads it | Deleted or skipped together with the suite; only the report CI reads can say what ran; ADR 0004 |
| Extend the inline `node -e` floor in `deploy.yml` | Testable only by pushing to `main`; the sibling checks moved to scripts for that reason; ADR 0004 |

## Decisions

- [0001: Split the entry file from the scanner library instead of guarding on argv](./adr/0001-split-the-entry-file-from-the-scanner-library-instead-of-guarding-on-argv.md)
- [0002: Scan every decoding layer of a file and let a hit outrank an incomplete scan](./adr/0002-scan-every-decoding-layer-of-a-file-and-let-a-hit-outrank-an-incomplete-scan.md)
- [0003: Let --self-test scan directories against the synthetic reference](./adr/0003-let-self-test-scan-directories-against-the-synthetic-reference.md)
- [0004: Pin the redaction suite's test count in a script the deploy workflow calls](./adr/0004-pin-the-redaction-suite-test-count-in-a-script-the-deploy-workflow-calls.md)

## Open questions

Each is a row in the brief's Decisions table with the recommendation already taken.

| # | Question | Default taken |
|---|----------|---------------|
| D1 | Split entry and library, or fix the guard in place | Split (ADR 0001) |
| D2 | When a run has both a hit and an undecodable file, exit 1 or 2 | 1 (ADR 0002) |
| D3 | The existing test "fails with exit 2 and names a file it cannot decode" plants a zero byte and the number and asserts exit 2; under R2 that file exits 1 | Rewrite it as two tests (E4 with the number, exit 1; E5 without, exit 2). This is a spec-authorised contract change, not a test edited to pass; the fixer may still not touch tests |
| D4 | How subprocess red-team tests get a reference on a shallow clone | `--self-test <dir>` with the synthetic reference (ADR 0003) |
| D5 | Scan all five layers for every file, or only when a zero byte is present | Only with a zero byte; an ASCII digit under UTF-16 needs a zero byte (confirmed) |
| D6 | Keep the undecodable class after layered scanning | Keep; UTF-32 or other encodings must not read as clean |
| D7 | Add the three script files (entry, library, floor) to `sensitive_paths` and `tier_floor_paths: 2` in `.workhorse/profile.yml`, as the sibling checks are; the audit's medium finding on profile paths (D13) is the same ask | Recommend yes; the owner edits the profile (agents leave it to retro); no task depends on it |
| D8 | A number whose digits straddle an encoding boundary | Accepted limitation, recorded in ADR 0002; no reader could see it either |
| D9 | How CI proves the redaction suite ran (audit, high) | A per-file floor in `scripts/check-test-floor.mjs`, called from one changed step of `deploy.yml` (R11, ADR 0004); a sensitive path, so the owner decides at G2 and G4 |
| D10 | Run the real tree scan in CI as well (audit, medium) | Defer to a follow-up change: it needs `fetch-depth: 0` and a step whose exit 2 blocks a release, its own decision with its own evals; the compensating controls are named under Security and privacy |
| D11 | A non-code return from `main` exits 0 (audit, medium) | Guard in the entry through `exitCodeOrCannotRun` (R10, E26) |
| D12 | Junction cleanup could follow the link into `scripts/` (audit, medium) | `fs.unlinkSync` on the link, confirmed on this host not to touch the target; E27 proves the listing is unchanged (R12) |
| D13 | Profile paths for the script files (audit, medium) | Merged into D7 |

## Response to audit

Revised 2026-09-20 after the audit, one round. Each finding is quoted in short and answered.

- High, "nothing in CI asserts that any of the cases in evals.md ran ... the same false-green
  shape the change exists to remove, one level up": accepted. R11, ADR 0004, Task 3 in
  `plan.md`, cases E28 to E33. The assertion reads the report CI already writes, lives in a
  script this change owns and tests by spawning, and needs one step of `deploy.yml` to call it.
  That edit is a sensitive path; the brief says so in D9 and the plan task heading says so.
- Medium, "the scan of the working tree still never runs in CI": accepted as documented risk
  acceptance, D10. Deferred, with the compensating controls named under Security and privacy.
- Medium, "any future branch of `main` that falls through ... exits 0": accepted. R10, E26.
- Medium, "a recursive removal ... would delete the repository's `scripts/` contents": accepted.
  R12, E27. Probed on this host: `unlinkSync`, `rmdirSync` and `rmSync` on a junction each
  remove the link and leave the target's file in place, and `rmSync` recursive on a parent
  directory holding a junction does not follow it (confirmed, Node 24.19, Windows).
- Medium, "the whole control lives in two unlisted paths": merged into D7, now three files.
- Low (three): R9 stays a reviewer read, since a header-text assertion tests wording, not
  behaviour; the retention position is now under Security and privacy; the binary skip is
  unchanged and the summary line keeps its count (R8, E10).

## Constraint audit

Filled by the constraint auditor 2026-09-20. Severity: high blocks G2. Resolution column
updated by the designer in the revision round; the findings are the auditor's text.

Audit result: blocked (1 high); revised, see Response to audit

No compliance regime applies (`profile.compliance.regimes: []`, confirmed; no PHI, no cardholder
data, no ledger, no assurance engagement), so the gdpr, hipaa, pci-dss, soc2 and financial
"At spec time" lists yield no findings. The security baseline lines about RLS policies,
`SECURITY DEFINER` functions, `CREATE OR REPLACE`, storage buckets, admin surfaces, secrets and
new runtime dependencies are not applicable: this change adds none of them (confirmed by reading
`plan.md` "Files" and the spec's Architecture). The applicable baseline lines are "CI must
actually run the security tests", "Never let a failure path be both silent and consequential",
"Verify empirically before asserting" and the privacy defaults on recording a retention position.

| Severity | Finding | Requirement affected | Resolution |
|----------|---------|----------------------|------------|
| high | The spec's "Security and privacy" section claims the baseline line "CI must actually run the security tests" is met "by the Vitest cases running under `npm test` in `deploy.yml` with its test-count floor". The claim does not hold: the floor asserts `numPassedTests >= 12` across the whole suite (`.github/workflows/deploy.yml` lines 102 to 121, confirmed), and the suite already has 167 `it(`/`test(` calls across 29 files (confirmed by grep). Deleting, renaming or `describe.skip`-ing the entire redaction suite leaves the floor green, so nothing in CI asserts that any of the 21 cases in `evals.md` ran. This is the same false-green shape the change exists to remove, one level up. Baseline: "CI must actually run the security tests" / "assert a non-zero test count for the security project" | spec "Security and privacy"; R8; E10 in `evals.md` | resolved: R11, ADR 0004, D9, Task 3, E28 to E33 |
| medium | The scan of the working tree still never runs in CI. Confirmed: `deploy.yml` has no `node scripts/check-phone-redaction.mjs` step, and `docs/sdlc/constraints.md` business constraint 3 records the R89 script as "run on a developer machine by evals GC41 and GC89". After this change the check is correct but still unenforced on the path that publishes the site; the only CI-side redaction control is the generic phone pattern of the R82 smoke step, which reads `smoke/root.html` and the module bundle only, not tracked files. The spec calls this "out of scope (ADR 0010 consequence, unchanged)" without naming what compensates in the meantime. Baseline: "CI must actually run the security tests" | spec "Security and privacy"; R8 | deferred with compensating controls named: D10 |
| medium | The entry, per the Architecture, is `process.exitCode = main(process.argv.slice(2))`. Nothing constrains `main`'s return value, so any future branch of `main` that falls through without returning sets `process.exitCode` to `undefined` and the process exits 0. R5 states the outcome ("stdout SHALL never be empty on exit 0") but no requirement places the check in the entry, and no eval case covers a non-numeric return. This reintroduces the silent-pass class the change removes. Baseline: "Never let a failure path be both silent and consequential" | R5, R6; new case needed in `evals.md` | resolved: R10, D11, E26 |
| medium | The red-team fixtures write into `os.tmpdir()` and create a directory junction whose target is the repository's own `scripts/` directory (`evals.md` preamble; `plan.md` Task 1 step 1). The plan says the junction is "removed in `afterEach`" without naming the call. A recursive removal of the temporary directory that follows the link rather than unlinking it would delete the repository's `scripts/` contents from a test run; Node's unlink-not-recurse behaviour for Windows junctions is believed, not verified here. Nor does any case assert that no planted fixture is left inside the working tree after the suite runs. Baseline: "Test credentials point at a dedicated test project, never production" (same principle: a fixture-creating suite eventually runs against the real tree) | R5, R7; `evals.md` E6, E7, E16, E17 | resolved: R12, D12, E27 |
| medium | `scripts/check-phone-redaction.mjs` is in neither `sensitive_paths` nor `tier_floor_paths: 2`, while the three sibling blocking checks `scripts/never-inline-fonts.mjs`, `scripts/check-built-css-fonts.mjs` and `scripts/check-npmrc.mjs` are in both (confirmed, `.workhorse/profile.yml` lines 80 to 84 and 159). The change adds a second file, `scripts/phone-redaction-scan.mjs`, that will hold all of the logic, so after this change the whole control lives in two unlisted paths. The designer raised this as D7 and left it to the owner; recording it here so it is not lost at retro. Profile constraint: `sensitive_paths`, `tier_floor_paths` | plan.md "Approach" and "Files"; brief D7 | merged into D7 (three files), owner edits the profile |
| low | R9's acceptance check is "Reviewer reads both headers against R1 to R7". It is the only requirement with no eval case and no automated check, and it maps to no line in the brief's Problem or Outcome (only to "What changes for people"). Testability check: every requirement's acceptance check could be a test. A cheap test would assert both header comments mention `--self-test <dir>` and the exit precedence, as `src/nodePinDocsAndProfile.test.js` does for docs | R9 | unchanged, reviewer read; see Response to audit |
| low | The spec's "Data" section says the only sensitive value is the reference number in process memory. It does not state the retention position this design depends on: the number remains in git history from `b50497f` onward, an accepted position recorded in `docs/hosted-config.md` section 7 and in `profile.compliance.retention_notes` (both confirmed). ADR 0003 relies on that history existing; a future history rewrite would turn the real scan into a permanent exit 2. Privacy defaults: "write down the retention position" rather than leaving it implicit | spec "Design / Data"; R8 | resolved: stated under Security and privacy |
| low | R8 retains the binary-extension skip unchanged: a path ending `.jpg`, `.png`, `.woff` or `.woff2` is counted and never read, and the binary count does not affect the exit code (confirmed, `scanExitCode` in the current script). A text file given a listed extension is a remaining silent-miss surface. Nothing in this change makes it worse, but the builder must keep the binary count in the summary line so the number is visible to a reader. Baseline: "Never let a failure path be both silent and consequential" | R8; `evals.md` E10 | unchanged; summary keeps the binary count |

# Evals: Fix the phone redaction scanner's mixed-encoding miss and its silent no-run

Change id: `2026-09-20-fix-phone-redaction-scanner`
Spec: [spec.md](./spec.md)

Every case runs under `npm test` (Vitest). E1 to E27 and N1 live in
`src/checkPhoneRedaction.test.js`, which imports `scripts/phone-redaction-scan.mjs` in process
and spawns `scripts/check-phone-redaction.mjs` with `process.execPath` for the subprocess
cases. E28 to E33 live in `src/checkTestFloor.test.js`, which spawns
`scripts/check-test-floor.mjs` on fixture reports and reads `deploy.yml` as text. Every
fixture uses the synthetic reference `5555560100` written as `555-556-0100`, the owner's real
number never appears in any test or artifact. Fixtures are written under `os.tmpdir()` and
removed after each test. "The junction" means a directory link created inside the fixture
directory with `fs.symlinkSync(<repo>/scripts, <tmp>/scripts-alias, 'junction')`, which needs
no privilege on Windows (confirmed) and is an ordinary symlink on POSIX (believed, from the
Node documentation that the type argument is ignored there), and removed with
`fs.unlinkSync`, which removes the link and leaves the target in place (confirmed on Windows,
Node 24.19). "A fixture report" means a JSON file in the shape Vitest 3.2.7 writes with
`--reporter=json` (confirmed on this host): top-level `numPassedTests`, `numPendingTests`,
`numTodoTests`, `numFailedTests`, and `testResults[]` with `name` (absolute path) and
`assertionResults[]` with `status`. No case needs git history, so every case runs on the CI
shallow clone. Tier 2 limit: 40 cases; this file has 34.

## Targets

| Category | Target | Rationale |
|----------|--------|-----------|
| Golden | 100% pass | The two false-green paths are closed and the entry always runs |
| Edge | 100% pass | Odd lengths, empty files, alignment, mixed verdicts |
| Failure | 100% correct handling | Bad or missing directory arguments through the alias path |
| Adversarial | 100% rejected | Lying byte-order marks, alignment tricks, content in the report |
| Non-functional | see rows | Layered scan cost |

## Cases

| ID | Category | Given | When | Then | Maps to requirement | Implemented as |
|----|----------|-------|------|------|---------------------|----------------|
| E1 | golden | a file of a UTF-16LE mark, 40 UTF-16LE characters of clean text and a newline, then an even-length UTF-8 line holding the number (confirmed exit 0 today) | `scanFiles` runs on it beside a clean file | exit 1; exactly one line ending `: full number` names the file | R1 | `src/checkPhoneRedaction.test.js`, "finds the number in a UTF-8 tail after a UTF-16LE mark and UTF-16 text" |
| E2 | golden | the E1 file with a UTF-16BE mark and big-endian text (confirmed exit 0 today) | same | exit 1; one `: full number` line names the file | R1 | same file, "finds the number in a UTF-8 tail after a UTF-16BE mark and UTF-16 text" |
| E3 | golden | an even-length UTF-8 line holding the number followed by 40 UTF-16LE characters with no mark (confirmed exit 0 today) | same | exit 1; one `: full number` line names the file | R1 | same file, "finds the number in a UTF-8 head before a BOM-less UTF-16LE tail" |
| E4 | golden | a zero byte followed by a UTF-8 line holding the number (the fixture of the rewritten test, D3) | same | exit 1; one hit line at line 1; one line naming the file with `could not be decoded`; summary contains `1 undecodable`; no line contains `556` or `today` | R2, R3 | same file, "reports a hit and names the file as undecodable when a zero-byte file holds the number" |
| E5 | golden | a zero byte followed by clean UTF-8 text | same | exit 2; one `could not be decoded` line names the file; summary contains `1 undecodable` and `0 hits` | R2 | same file, "fails with exit 2 and names a zero-byte file it cannot recognise when it holds no number" |
| E6 | golden | the junction, and a directory holding one UTF-8 file with the synthetic number on line 1 | the entry is spawned as `<junction>/check-phone-redaction.mjs --self-test <dir>` | status 1; stdout contains a line ending `:1: full number` that names the planted file | R5, R7 | same file, "started through a junction, scans a planted number and exits 1" |
| E7 | golden | the junction, and a directory holding one clean UTF-8 file | same command with that directory | status 0; stdout contains `Scanned 1 files` and `synthetic reference`; stdout is not empty | R5, R7 | same file, "started through a junction, scans a clean directory, prints the summary and exits 0" |
| E8 | golden | the repository root as cwd | spawn `scripts/check-phone-redaction.mjs --self-test` by that relative path | status 0; stdout contains `Self-test: 17 of 17 form renderings hit, 0 of 9 near-misses hit.` | R5, R7, R8 | same file, "started by its documented relative path, runs the self-test and exits 0" |
| E9 | golden | a child Node process with `--input-type=module -e` that imports the library by `file://` URL and prints `imported` | it runs | status 0; stdout is exactly `imported`; stderr empty | R6 | same file, "importing the library runs no scan and sets no exit code" |
| E10 | golden | the existing 12 matcher tests, the three UTF-16 file tests and the binary-skip test | `npm test` | all pass with no edit | R8 | same file, existing tests, unchanged |
| E11 | edge | three UTF-8 bytes, then the number line in UTF-16LE, then one more byte (odd length, odd alignment) | `scanFiles` | exit 1; a hit line names the file; no throw | R1, R4 | same file, "finds the number in UTF-16LE at odd alignment in an odd-length file" |
| E12 | edge | an empty file beside a clean file | `scanFiles` | exit 0; summary says `Scanned 2 files` and `0 hits` | R4 | same file, "counts an empty file as scanned" |
| E13 | edge | one file with the number in plain UTF-8 and one zero-byte clean file | `scanFiles` on both | exit 1; summary contains `1 undecodable` and a non-zero hit count | R3 | same file, "exits 1 when a run has both a hit and an undecodable file" |
| E14 | edge | the number line in UTF-16BE with no mark (exit 2 and no hit today) | `scanFiles` | exit 1; a hit line names the file; a `could not be decoded` line also names it | R1, R2 | same file, "finds the number in BOM-less UTF-16BE and still flags the file as incomplete" |
| E15 | edge | two directories each holding one clean file | entry spawned with `--self-test <dirA> <dirB>` | status 0; stdout contains `Scanned 2 files` | R7 | same file, "self-test scans every directory given" |
| E16 | failure | the junction and a directory path that does not exist | entry spawned through the junction with `--self-test <missing>` | status 2; stderr contains `does not exist` | R5, R7 | same file, "started through a junction with a missing directory, reports the error and exits 2" |
| E17 | failure | an empty directory | entry spawned with `--self-test <emptyDir>` | status 2; stdout contains `Scanned 0 files` | R7 | same file, "self-test of an empty directory exits 2 because nothing was scanned" |
| E18 | adversarial | a UTF-16LE mark followed only by UTF-8 text holding the number (the mark lies) | `scanFiles` | exit 1; a hit line names the file | R1 | same file, "finds the number in UTF-8 text behind a lying UTF-16 byte-order mark" |
| E19 | adversarial | the E1 file | `scanFiles` | no report line contains `556`, `0100` or `today` | R3 | same file, "never prints matched text or reference digits for a mixed-encoding hit" |
| E20 | adversarial | an even-length UTF-8 line holding the number followed by a two-character UTF-16LE tail (zero bytes at odd offsets, too short for the UTF-16 rule; exit 2 and no hit today) | `scanFiles` | exit 1; a hit line and a `could not be decoded` line both name the file | R1, R2 | same file, "finds the number in a UTF-8 head when a short UTF-16 tail makes the file unrecognised" |
| E21 | adversarial | a UTF-8 file with the number on line 1, and later in the file (not at byte offset 0) the two bytes `0xff 0xfe` appear inside otherwise clean UTF-8 text | `scanFiles` runs on it beside a clean file | exit 1; exactly one line ending `:1: full number` names the file; the mid-file marker bytes do not suppress or redirect the UTF-8 layer | R1 | `src/checkPhoneRedaction.test.js`, "finds the number in UTF-8 text even when a byte-order-mark-like sequence appears later in the file, not at its start" |
| E22 | adversarial | a junction to `scripts/`, a second junction pointing at the first junction (nested indirection), and a directory holding one UTF-8 file with the synthetic number on line 1 | the entry is spawned as `<nested-junction>/check-phone-redaction.mjs --self-test <dir>` | status 1; stdout contains a line ending `:1: full number` that names the planted file | R5 | same file, "started through a junction that points at another junction, scans a planted number and exits 1" |
| E23 | adversarial | a directory holding one UTF-8 file with the synthetic number on line 1, and a child process running `node --input-type=module -e` that sets `process.argv` to include `--self-test <dir>` and then imports `scripts/check-phone-redaction.mjs` (the entry, not the library) by `file://` URL | it runs | exit code 1; stdout contains a line ending `:1: full number`; contrast with E9, which proves the library alone does nothing on import | R5 | same file, "importing the entry script still runs the scan, because unlike the library it has no guard" |
| E24 | edge | a directory holding one clean UTF-8 file, referenced with a trailing path separator | entry spawned with `--self-test <dirWithTrailingSeparator>` | status 0; stdout contains `Scanned 1 files` | R7 | same file, "self-test accepts a directory argument with a trailing separator" |
| E25 | edge | the entry's documented relative path, resolved from a working directory that is not the repository root | spawn `check-phone-redaction.mjs --self-test` with that relative path and `cwd` set to a tmp directory | status 0; stdout contains `Self-test: 17 of 17 form renderings hit, 0 of 9 near-misses hit.` | R5 | same file, "started by a relative path from a working directory that is not the repository root, still runs the self-test and exits 0" |
| E26 | failure | the library's `exitCodeOrCannotRun`, with `console.error` spied | called with undefined, null, the string `'1'` and 7, then with 0, 1 and 2 | each of the first four returns 2 and writes one stderr line containing `returned no exit code`; 0, 1 and 2 come back unchanged with nothing written; the text of `scripts/check-phone-redaction.mjs` contains `exitCodeOrCannotRun(main(` | R10 | same file, "maps a missing or foreign return value from main to exit 2 and says so" (`it.each`) and "the entry sets its exit code through exitCodeOrCannotRun" |
| E27 | adversarial | the listing of `<repo>/scripts` captured in `beforeAll` of the entry `describe` block | this case runs last in that block, after every junction case | `fs.readdirSync(<repo>/scripts)` equals the captured listing; both script files still exist; no fixture directory of the block remains on disk; no path under the repository root was created by the block (listing of `<repo>` unchanged) | R12 | same file, "leaves the repository scripts directory and working tree untouched after the junction tests" |
| E28 | golden | a fixture report with 12 passed overall, 0 pending, todo or failed, and the redaction file with exactly the pinned count of `passed` assertions | `scripts/check-test-floor.mjs` spawned with the report path | status 0; stdout contains `Test floors passed.` and the `Redaction suite` count line | R11 | `src/checkTestFloor.test.js`, "passes a report whose redaction suite is complete and whose suite meets the whole-suite floor" |
| E29 | adversarial | a fixture report with 200 passed overall and no `testResults` entry for `src/checkPhoneRedaction.test.js` (the deleted or renamed suite) | spawned | status 1; stdout contains `::error::Redaction suite floor failed (R11)` and `missing from the report` | R11 | same file, "fails a report in which the redaction suite never ran, however many other tests passed" |
| E30 | failure | `it.each`: (a) the redaction file with one `pending` assertion and the rest passed; (b) the redaction file with one fewer `passed` than the pinned count and nothing else; both with a healthy rest of the suite | spawned | status 1; stdout contains `::error::Redaction suite floor failed (R11)` and the counts | R11 | same file, "fails a report whose redaction suite is skipped in part or short of the pin" |
| E31 | golden | `it.each`: (a) 11 passed overall with a complete redaction suite; (b) one `failed` assertion in another file with `numFailedTests` 1 | spawned | status 1; stdout contains `::error::Test floor failed (R52): need at least 12 passed and 0 pending, todo or failed` (the inline rules carried verbatim) | R11 | same file, "keeps the whole-suite floor and the zero-skipped rule of the inline step" |
| E32 | failure | `it.each`: a report path that does not exist; a file holding text that is not JSON | spawned | status 2; stdout contains `::error::Test floors could not run (R52, R11)` and the path's basename; never `Test floors passed.` | R11 | same file, "exits 2 when the report is missing or unreadable, so the floor never passes on nothing" |
| E33 | golden | `.github/workflows/deploy.yml` read as text and split into lines | the lines are inspected the way `src/deployWorkflowNodeVersion.test.js` does | exactly one line equals `run: "node scripts/check-test-floor.mjs vitest-results.json"`; the nearest `- name:` above it is `Test-count floors (R52, R11)`; that line is after the step `Run the tests` and before the step `Build`; no line contains `minimumPassed`; `scripts/check-test-floor.mjs` exists | R11 | same file, "the deploy workflow runs the floor script between the tests and the build, and the inline floor is gone" |

## Non-functional

| ID | Measure | Target | How measured |
|----|---------|--------|--------------|
| N1 | Layered scan cost on a large zero-byte file | under 5 000 ms | `src/checkPhoneRedaction.test.js`, "scans a 4 MB file holding zero bytes in under five seconds": a 4 MB buffer of repeated UTF-16LE text with one zero-byte-free UTF-8 line, timed around `scanFiles` with `performance.now()`; maps to R1 |

## Failure taxonomy

| Class | Description | Detection | Example |
|-------|-------------|-----------|---------|
| Missing result | the number is in a file and no hit line is printed | a red-team fixture with a planted number exits 0 (E1 to E3, E6) | mixed-encoding file decoded by one decoder |
| Silent | the entry runs no scan and prints nothing, or returns no exit code | stdout empty on exit 0 (E7); a non-code return exits 2 (E26) | junction invocation under the old guard |
| False green in CI | the publishing job is green without the redaction suite having run | the floor script fails a report without the suite, or with a skipped or missing test (E29, E30); the workflow calls it (E33) | the suite deleted, renamed or `describe.skip`-ed |
| Collateral | a test fixture changes the repository tree | E27 | a junction removal following the link into `scripts/` |
| Wrong result | a hit line for text that is not the number | self-test near-misses (E8) | none known |
| Incomplete | a file was not scanned with confidence and the exit is not 2 | zero-byte clean file exits 0 (E5) | an unrecognised encoding reported clean |
| Leaked | a report line holds file content or a reference digit | E4, E19 | printing the matched line |
| Slow | a scan takes long enough that people stop running it | N1 | five layers over a large file |

Every class above is detected by a test that runs in CI, and R11 makes CI red if the redaction
tests did not run; there is no production runtime for this script, so "detection in
production" is the developer or verifier reading the exit code, or the deploy job stopping at
the floor step.

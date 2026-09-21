# Bug review: 2026-09-20-fix-phone-redaction-scanner

Verdict: 3 findings (0 critical, 0 high, 0 medium, 3 low)

| Severity | File:line | Finding | Failure scenario | Fix |
|---|---|---|---|---|
| low | scripts/check-test-floor.mjs:40, 70 | A report that is valid JSON but not an object crashes or is misreported; only `missing` and `not JSON` reach the `could not run` path | Confirmed by probe: a report holding `null` makes `wholeSuiteCounts` throw `TypeError: Cannot read properties of null`, uncaught above `process.exitCode = main(...)` (line 29). Actual: exit 1, empty stdout, a stack trace in the Actions log. Expected per R11 and the script header: exit 2 with `::error::Test floors could not run (R52, R11)`. Reports holding `[]`, `5` or `"text"` do not crash but report exit 1 `Test floor failed (R52)` plus `missing from the report`, also not the documented exit 2. The deploy still fails in every case, so this is log legibility and exit-code contract, not a false green. Eval gap: E32 covers a missing file and a non-JSON file, not a valid-JSON wrong shape | scripts/check-test-floor.mjs: inside the existing `try`, after `JSON.parse`, reject a non-object with `throw new Error('is not a Vitest report object')` so it lands on the existing `EXIT_CANNOT_RUN` path; add an E32 row for a `null` report |
| low | scripts/phone-redaction-scan.mjs:221 | `runSelfTest` does not deduplicate the files its directory arguments yield, while `runScan` (line 189) does through a `Set` | Confirmed by probe: `--self-test <dir> <dir>` on a directory holding one planted file and one clean file printed the same hit line twice and the summary `Scanned 4 files ... 6 hits`. Expected `Scanned 2 files ... 3 hits`. Same with a parent directory and its own subdirectory. Exit code is still 1, so the verdict is right and only the counts and the duplicate lines are wrong. Eval gap: E15 passes two disjoint directories, no case passes overlapping ones | scripts/phone-redaction-scan.mjs:221: `scanFiles([...new Set(directoryArguments.flatMap(listFilesUnder))], matchers)`, matching `runScan`; add an eval case for a directory given twice |
| low | src/checkPhoneRedaction.test.js:587 | E27 is implemented weaker than `evals.md` states it: it compares only the top-level listings of `scripts/` and of the repository root, and asserts nothing about fixture directories being gone | A future subprocess case that plants a file inside an existing repository subdirectory (`src/`, `public/`, `docs/`) or leaves a temporary directory behind passes E27 unchanged, because neither top-level listing changes. `evals.md` line 64 promises "no fixture directory of the block remains on disk" and "no path under the repository root was created by the block". Nothing is wrong today: every fixture in this suite is created under `os.tmpdir()` (confirmed by reading all `mkdtempSync` and `writeFileSync` calls in `src/*.test.js`) | src/checkPhoneRedaction.test.js:587: capture the `git status --porcelain` output or a recursive listing of `src/` in `beforeAll` and compare it, and assert `fs.existsSync(fixtureDirectory)` is false for each fixture path the block created |

Reviewed and found correct (confirmed unless marked):

- Layered decoding, `scripts/phone-redaction-scan.mjs:288`. Probed eight shapes that are false-clean or
  unscanned under the old single-decoder rule: UTF-32LE and UTF-32BE (exit 2, never clean), UTF-16BE and
  UTF-16LE at odd alignment, a UTF-16LE tail after a 500-byte UTF-8 head, a UTF-16LE region in the middle
  of UTF-8 text, and an odd-length UTF-16BE region in the middle. Every one holding the number exits 1
  with a `full number` line.
- Trailing odd byte and swap16, `evenLengthSlice` line 301 and line 295. A one-byte buffer, an empty
  buffer and a two-byte buffer produce no half-character layer and no throw; `swap16` throws only on an
  odd length, which `evenLengthSlice` excludes. `Buffer.from(slice)` copies, so `swap16` cannot corrupt
  the bytes the other layers read (probed: source buffer unchanged after swapping the copy).
  `subarray(1).toString('utf16le')` on an odd byte offset decodes correctly (probed).
- The UTF-8 layer does not lose ASCII digits behind an invalid lead byte (probed: `0xE5` then the number
  decodes to one replacement character followed by the intact digits), so a mixed file's UTF-8 region is
  always searchable.
- `scanExitCode` line 259 and `worseExitCode` line 232 both put a hit above an incomplete scan above
  clean, as R3 and D2 require; `missing` and `binary` counts still do not move the exit code (R8).
- `exitCodeOrCannotRun` line 181 passes 0, 1 and 2 by strict equality and maps everything else, including
  `undefined`, `null`, `'1'` and `7`, to 2 with one stderr line (E26 passes).
- Hit-line union, line 251: per file, a `Set` of `path:line: form` strings. No probe produced a duplicate
  physical hit across layers, because a UTF-8 region decoded as UTF-16 yields no ASCII digits and a
  UTF-16 region decoded as UTF-8 carries NUL characters that the separator class rejects.
- Undecodable classification line 314 is not looser than the old `decodeText`: the only buffer
  `decodeUtf16LittleEndian` rejects that `looksLikeUtf16LittleEndian` accepts would need a zero byte at
  an even offset, which `looksLikeUtf16LittleEndian` already rejects.
- Nothing was dropped in the split: diffed the old `scripts/check-phone-redaction.mjs` from `main`
  against the new library line by line. Only the direct-run guard was removed, on purpose (ADR 0001).
- Floor script per-file counting: `findRedactionSuite` normalises backslashes and matches on the
  `/src/checkPhoneRedaction.test.js` suffix, which holds for the absolute POSIX paths a Linux runner
  writes (believed, not verified; confirmed for the Windows form `C:/Users/.../src/...`). A missing
  entry, a short count and any non-passed assertion each fail (E29, E30 pass).
- End to end: `npm test -- --reporter=default --reporter=json --outputFile.json=vitest-results.json`
  exits 0 with 282 passed, 0 pending, 0 todo, 0 failed, and 44 passed in `src/checkPhoneRedaction.test.js`,
  exactly the pin. `node scripts/check-test-floor.mjs vitest-results.json` then prints `Test floors
  passed.` and exits 0. The generated report was deleted afterwards; `git status` shows no stray file.
- `node scripts/check-phone-redaction.mjs` on this branch: `Scanned 206 files (5 skipped as binary,
  0 missing from disk, 0 undecodable), 0 hits.`, exit 0. `npm run lint` exits 0.

Findings outside scope:

- A text file given a `.jpg`, `.png`, `.woff` or `.woff2` name is still counted and never read
  (`BINARY_EXTENSIONS`, line 34), so it can hold the number and the run exits 0. Pre-existing, accepted
  as a low in the constraint audit; the new library header no longer mentions the skip at all, while the
  old header did, so the one documented pointer to this surface is gone.
- `vitest-results.json` is neither tracked nor matched by `.gitignore` (confirmed with `git ls-files`
  and by reading `.gitignore`). A committed stale report would be read by the floor step if the reporter
  ever stopped writing. Pre-existing: the inline floor read the same path.

Not verified:

- The first Linux CI run of the junction cases (`fs.symlinkSync(..., 'junction')` on POSIX) and of the
  floor step. Windows only here (Node v24.19.0).
- Vitest's JSON reporter writes `vitest-results.json` at the end of the run, so E27's repository-root
  listing cannot see it appear mid-block. Believed, not verified: my full-suite run wrote to the
  repository root and E27 passed, which is consistent but not proof of the write ordering.

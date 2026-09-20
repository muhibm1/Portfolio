# 0001: Split the entry file from the scanner library instead of guarding on argv

Date: 2026-09-20
Status: proposed
Change: 2026-09-20-fix-phone-redaction-scanner

## Context

`scripts/check-phone-redaction.mjs` line 92 runs `main()` only when `isStartedDirectly()` is
true, and that function compares `path.resolve(process.argv[1])` with
`fileURLToPath(import.meta.url)` as strings (R5, R6). Confirmed on this host with Node 24.19:
when Node starts the file through a directory junction, `process.argv[1]` is the junction path
while `import.meta.url` is the real path, because the ESM loader resolves the entry to its real
location. The strings differ, `main()` never runs, nothing is printed and the exit code is 0,
which CI reads as clean. The same happens through a directory or file symlink and a UNC path
(`fs.realpathSync` does not equalise UNC either; only `dev` and `ino` from `fs.statSync` do).
The guard exists so that `src/checkPhoneRedaction.test.js` can import the exports without
running a scan.

## Decision

We split the file. `scripts/check-phone-redaction.mjs` becomes the entry: it imports `main` and
`exitCodeOrCannotRun` from `scripts/phone-redaction-scan.mjs` and always sets
`process.exitCode = exitCodeOrCannotRun(main(process.argv.slice(2)))`, so a return that is not
0, 1 or 2 becomes exit 2 with a stderr line instead of exit 0 (R10, added after the audit).
It has no guard and no view of `process.argv[1]`. `scripts/phone-redaction-scan.mjs` holds every
matcher, decoder, scanner and the self-test, exports what the test needs, and runs nothing when
imported. The library resolves the repository root through `fs.realpathSync.native` so that even
`--preserve-symlinks` runs scan the real tree.

## Alternatives

| Option | Why not |
|--------|---------|
| Keep one file; compare `fs.realpathSync.native` of both sides | Fixes junctions and symlinks but not UNC paths (confirmed), needs a case-insensitive compare on Windows, and still has a failure mode when `realpath` throws, where the only safe answer is "run anyway", which would also run inside the test process |
| Keep one file; compare `dev` and `ino` from `fs.statSync` on both sides | Equalises every alias tried (confirmed), but `stat` can throw for the same reasons, the guard stays a platform-sensitive comparison a reader must trust, and it still puts a scan-or-not decision inside a security check |
| Keep the guard and add a `--force-run` flag | The flag has to be remembered by every caller, and the silent path stays reachable |

## Consequences

Easier: the entry cannot be started without scanning, whatever the path form; the library is
importable with no side effect by construction; the platform-specific compare and the `win32`
lower-casing go away.

Harder: two files instead of one, and `src/checkPhoneRedaction.test.js` imports the library
path instead of the entry. The documented command, `node scripts/check-phone-redaction.mjs`,
does not change. Revisit only if a third script needs the same split, in which case the
pattern should be written down for all of `scripts/`.

/**
 * Entry point for the R89 phone-redaction check (ADR 0010). Runs the scan in
 * scripts/phone-redaction-scan.mjs whenever Node starts this file, however it was started: by its
 * documented path, through a junction or a symlink, or from any working directory. There is no
 * "am I the program being run?" guard (ADR 0001): a guard comparing paths can be defeated by an
 * alias path, and was the cause of a silent no-run through a junction.
 *
 * Usage, from the repository root:
 *   node scripts/check-phone-redaction.mjs                 real scan: git ls-files
 *   node scripts/check-phone-redaction.mjs dist             real scan plus every file under dist/
 *   node scripts/check-phone-redaction.mjs --self-test      forms and near-misses only
 *   node scripts/check-phone-redaction.mjs --self-test <dir> [<dir>...]
 *                                                           forms and near-misses, then scan the
 *                                                           directories for the synthetic number
 *
 * Exit codes: 0 no hit and at least one file scanned; 1 at least one hit; 2 the check could not run,
 * is incomplete (a file could not be decoded, no file was scanned), or `main` returned something
 * that is not 0, 1 or 2 (`exitCodeOrCannotRun`, R10).
 */

import { exitCodeOrCannotRun, main } from './phone-redaction-scan.mjs'

process.exitCode = exitCodeOrCannotRun(main(process.argv.slice(2)))

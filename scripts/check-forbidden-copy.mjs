/**
 * Entry point for the R129 forbidden-copy check (ADR 0004). Runs the scan in
 * scripts/forbidden-copy.mjs whenever Node starts this file.
 *
 * Usage, from the repository root:
 *   node scripts/check-forbidden-copy.mjs         default scope: src/ (minus *.test.*), index.html,
 *                                                  docs/design/og.svg
 *   node scripts/check-forbidden-copy.mjs dist     default scope plus every dist/**\/*.html
 *
 * Exit codes: 0 no hit and at least one file scanned; 1 at least one hit, one `::error::` line
 * per hit; 2 the check could not run (a requested directory is missing, or nothing was scanned).
 */

import { main } from './forbidden-copy.mjs'

process.exitCode = main(process.argv.slice(2))

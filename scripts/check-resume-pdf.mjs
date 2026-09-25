/**
 * Entry point for the resume-PDF publishing check (MEDIUM security finding, conductor decision
 * D23). Runs the checks in scripts/resume-pdf.mjs against public/Muhammad_Muhibullah_Resume.pdf:
 * its SHA-256 matches the hash the owner recorded in docs/hosted-config.md section 6a after his
 * D12/D17 eye check; the file carries a single PDF revision (exactly one `%%EOF`, no `/Prev`); and,
 * after inflating its FlateDecode streams (a stream that fails to inflate is skipped and counted,
 * never treated as a hit), no phone-shaped number and no `C:\` or `/Users/` local path appears in
 * the text that decodes. This check only ever reaches text that decodes plainly out of a
 * FlateDecode stream, so the owner's own D12/D17 eye check on the supplied file stays the main
 * control on the document's contents (docs/hosted-config.md section 6a).
 *
 * Usage, from the repository root:
 *   node scripts/check-resume-pdf.mjs
 *   node scripts/check-resume-pdf.mjs <pdf-path>
 *   node scripts/check-resume-pdf.mjs <pdf-path> <hosted-config-path>
 *
 * The second argument exists only so tests can point this entry at a synthetic PDF and a
 * synthetic hosted-config.md, in a temp directory, without ever writing into public/ or reading
 * the owner's real hash. A real run never passes it.
 *
 * Exit codes: 0 every check passed; 1 at least one check failed, one `::error::` line per failure;
 * 2 the check could not run: the PDF is missing (owner-supplied, D2) or docs/hosted-config.md
 * section 6a has no recorded D12/D17 hash line yet.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXIT_CANNOT_RUN, EXIT_FAILED, evaluatePdfBytes, parseRecordedHash } from './resume-pdf.mjs'

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_PDF_PATH = path.join(REPOSITORY_ROOT, 'public', 'Muhammad_Muhibullah_Resume.pdf')
const DEFAULT_HOSTED_CONFIG_PATH = path.join(REPOSITORY_ROOT, 'docs', 'hosted-config.md')

process.exitCode = main(process.argv.slice(2))

export function main([pdfPathArgument, hostedConfigPathArgument]) {
  const pdfPath = pdfPathArgument ? path.resolve(pdfPathArgument) : DEFAULT_PDF_PATH
  const hostedConfigPath = hostedConfigPathArgument
    ? path.resolve(hostedConfigPathArgument)
    : DEFAULT_HOSTED_CONFIG_PATH

  const pdfBytes = readFileOrUndefined(pdfPath)
  if (pdfBytes === undefined) {
    console.log(
      `::error::${displayPath(pdfPath)} is missing. This file is owner-supplied (D2); the owner ` +
        'adds it after running the D12/D17 check.',
    )
    return EXIT_CANNOT_RUN
  }

  let hostedConfigText
  try {
    hostedConfigText = fs.readFileSync(hostedConfigPath, 'utf8')
  } catch (error) {
    console.log(`::error::could not read ${displayPath(hostedConfigPath)}: ${error.message}`)
    return EXIT_CANNOT_RUN
  }

  const recordedHash = parseRecordedHash(hostedConfigText)
  if (recordedHash === undefined) {
    console.log(
      `::error::no D12/D17 hash line found in ${displayPath(hostedConfigPath)} section 6a. Run the ` +
        'D12/D17 check and record the SHA-256 there before this check can run.',
    )
    return EXIT_CANNOT_RUN
  }

  const { exitCode, errorLines, flateStreamCount, skippedStreamCount } = evaluatePdfBytes(pdfBytes, recordedHash)
  for (const line of errorLines) console.log(line)
  console.log(
    `Resume PDF check: ${flateStreamCount} FlateDecode stream(s) found, ${skippedStreamCount} could ` +
      'not be inflated and were skipped from the text-leak check.',
  )
  if (exitCode === EXIT_FAILED) return EXIT_FAILED
  console.log('Resume PDF check passed.')
  return exitCode
}

function readFileOrUndefined(absolutePath) {
  try {
    return fs.readFileSync(absolutePath)
  } catch (error) {
    if (error.code === 'ENOENT') return undefined
    throw error
  }
}

function displayPath(absolutePath) {
  return path.relative(REPOSITORY_ROOT, absolutePath).split(path.sep).join('/')
}

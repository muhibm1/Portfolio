/**
 * The resume-PDF publishing check (MEDIUM security finding, conductor decision D23): confirms
 * public/Muhammad_Muhibullah_Resume.pdf, the owner's own published personal data
 * (docs/hosted-config.md section 6a), still matches the SHA-256 he recorded there after his
 * D12/D17 eye check, carries a single PDF revision (exactly one `%%EOF`, no `/Prev`), and that no
 * phone-shaped number and no local file path (`C:\` or `/Users/`) survives inside any FlateDecode
 * stream that inflates cleanly. This is a structural and text-leak check, not a full PDF parser:
 * the phone-shaped and local-path scan only reaches text that decodes plainly out of a FlateDecode
 * stream, so the owner's own D12/D17 eye check on the supplied file stays the main control on the
 * document's contents (docs/hosted-config.md section 6a).
 *
 * Follows the entry/library split scripts/forbidden-copy.mjs and scripts/phone-redaction-scan.mjs
 * already use: every function here is pure (bytes and strings in, a verdict out, no file I/O), so
 * tests exercise it directly against synthetic PDF bytes without ever writing into public/ or
 * touching the owner's real hosted-config.md. File reading and the CLI-style report live in the
 * entry, scripts/check-resume-pdf.mjs.
 *
 * Importing this module runs nothing.
 */

import crypto from 'node:crypto'
import zlib from 'node:zlib'
import { Buffer } from 'node:buffer'

export const EXIT_CLEAN = 0
export const EXIT_FAILED = 1
export const EXIT_CANNOT_RUN = 2

// The generic phone-shaped regex scripts/check-route-pages.mjs uses (R82's phone pattern, itself
// copied from .github/workflows/deploy.yml). Copied here, not imported, because
// scripts/check-route-pages.mjs is a sensitive, ask-first path (docs/sdlc change 2026-09-25) this
// check does not touch, and it does not export the pattern. Kept identical so every place in this
// repository that looks for "a phone number shape" rejects the same shape.
export const PHONE_PATTERN = /\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-][0-9]{4}/

// The `D12/D17 <hash> ...` log line format this check reads, defined here and in
// docs/hosted-config.md section 6a: a dated line, a lowercase 64-character hex SHA-256, then the
// literal marker `D12/D17`. Multiple lines may exist (the log is append-only, newest last); the
// last one found is the one currently in force.
const RECORDED_HASH_LINE = /^\d{4}-\d{2}-\d{2}\s+([0-9a-f]{64})\s+D12\/D17\b/gm

/** The SHA-256 of the file's bytes, lowercase hex, for comparison against the recorded hash. */
export function computeSha256Hex(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

/** How many `%%EOF` markers the file's bytes contain. A single-revision PDF has exactly one. */
export function countEofMarkers(text) {
  return (text.match(/%%EOF/g) ?? []).length
}

/** True when the file has a `/Prev` entry, the trailer key that chains to an earlier revision. */
export function hasPrevReference(text) {
  return /\/Prev\b/.test(text)
}

/**
 * Every stream this file declares with a `/FlateDecode` filter, as raw (still-compressed) bytes,
 * in file order. Finds each `stream` keyword, reads its dictionary from the nearest preceding
 * `obj` keyword (or the start of the file), and keeps the stream only when that dictionary names
 * `/FlateDecode` directly or inside a filter array. Not a full PDF object parser: it is a
 * regex-based scan good enough to find every FlateDecode stream in a normally-written PDF, which
 * is the only kind this check needs to look inside (see module doc comment on scope).
 */
export function extractFlateStreamBuffers(bytes) {
  const text = bytes.toString('latin1')
  const buffers = []
  const streamKeyword = /stream(\r\n|\n|\r)/g
  let match

  while ((match = streamKeyword.exec(text)) !== null) {
    const contentStart = match.index + match[0].length
    const endIndex = text.indexOf('endstream', contentStart)
    if (endIndex === -1) break

    const dictStart = Math.max(0, text.lastIndexOf('obj', match.index))
    const dictText = text.slice(dictStart, match.index)
    if (/\/Filter\s*(\/FlateDecode\b|\[[^\]]*\/FlateDecode\b)/.test(dictText)) {
      const rawContent = text.slice(contentStart, endIndex).replace(/(\r\n|\n|\r)$/, '')
      buffers.push(Buffer.from(rawContent, 'latin1'))
    }
    streamKeyword.lastIndex = endIndex + 'endstream'.length
  }

  return buffers
}

/**
 * Inflates each buffer with zlib. A stream that fails to inflate (truncated, corrupt, or not
 * really Flate despite its dictionary) is caught and skipped, counted in `skippedCount`, never
 * treated as a hit and never treated as a reason to fail the check by itself.
 */
export function inflateFlateStreams(buffers) {
  const texts = []
  let skippedCount = 0
  for (const buffer of buffers) {
    try {
      texts.push(zlib.inflateSync(buffer).toString('latin1'))
    } catch {
      skippedCount += 1
    }
  }
  return { texts, skippedCount }
}

/** Every leak this check knows how to name, found in one block of already-inflated text. */
export function findLeaksInText(text) {
  const leaks = []
  if (PHONE_PATTERN.test(text)) leaks.push('a phone-shaped number')
  if (text.includes('C:\\')) leaks.push('a Windows path (C:\\)')
  if (text.includes('/Users/')) leaks.push('a /Users/ path')
  return leaks
}

/**
 * The most recently recorded SHA-256 from a `D12/D17` log line in docs/hosted-config.md section
 * 6a's text, or `undefined` when there is none yet. Never writes one; the owner records it by
 * hand after running the D12/D17 check.
 */
export function parseRecordedHash(hostedConfigText) {
  let lastHash
  let match
  RECORDED_HASH_LINE.lastIndex = 0
  while ((match = RECORDED_HASH_LINE.exec(hostedConfigText)) !== null) {
    lastHash = match[1].toLowerCase()
  }
  return lastHash
}

/**
 * Runs every structural and text-leak check against one PDF's bytes and a recorded hash, and
 * returns `{ exitCode, errorLines, flateStreamCount, skippedStreamCount }`. `errorLines` holds one
 * `::error::<name>: <message>` line per failed check (never more than one line per check, even
 * when several leaks are found inside the streams). `exitCode` is EXIT_CLEAN or EXIT_FAILED only;
 * the "cannot run" cases (missing file, missing recorded hash) are decided before this is called,
 * in the entry.
 */
export function evaluatePdfBytes(bytes, recordedHash) {
  const text = bytes.toString('latin1')
  const errorLines = []

  const actualHash = computeSha256Hex(bytes)
  if (actualHash !== recordedHash) {
    errorLines.push(
      `::error::resume-pdf-hash-mismatch: SHA-256 ${actualHash} does not match the hash recorded ` +
        `in docs/hosted-config.md section 6a (${recordedHash}).`,
    )
  }

  const eofCount = countEofMarkers(text)
  if (eofCount !== 1) {
    errorLines.push(`::error::resume-pdf-eof-count: expected exactly one %%EOF marker, found ${eofCount}.`)
  }

  if (hasPrevReference(text)) {
    errorLines.push(
      '::error::resume-pdf-prev-reference: the file has a /Prev entry, meaning an earlier ' +
        'incremental revision may be hidden inside.',
    )
  }

  const flateBuffers = extractFlateStreamBuffers(bytes)
  const { texts: inflatedTexts, skippedCount } = inflateFlateStreams(flateBuffers)
  const leaks = new Set()
  for (const inflatedText of inflatedTexts) {
    for (const leak of findLeaksInText(inflatedText)) leaks.add(leak)
  }
  if (leaks.size > 0) {
    errorLines.push(
      `::error::resume-pdf-text-leak: found ${[...leaks].join(', ')} inside an inflated ` +
        'FlateDecode stream.',
    )
  }

  return {
    exitCode: errorLines.length > 0 ? EXIT_FAILED : EXIT_CLEAN,
    errorLines,
    flateStreamCount: flateBuffers.length,
    skippedStreamCount: skippedCount,
  }
}

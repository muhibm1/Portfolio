/**
 * Proves the Vitest suite ran in full before the deploy workflow builds and publishes the site
 * (R11, ADR 0004). Reads the Vitest JSON report `npm test` writes and applies two rules: the
 * whole-suite floor `.github/workflows/deploy.yml` carried inline until this change (R52), and a
 * per-file floor on src/checkPhoneRedaction.test.js, the R89 redaction suite. The whole-suite
 * floor alone cannot tell whether the redaction suite ran: deleting, renaming or skipping that
 * file leaves numPassedTests comfortably above 12, the same false-green shape the redaction
 * change exists to remove, one level up. The redaction floor closes it: the report must hold an
 * entry for that file with at least PINNED_REDACTION_PASSED_COUNT passed and nothing pending,
 * todo or failed. That number is the file's own passed count at merge (44, confirmed from a
 * fresh report on this branch), not derived at run time, so removing a test lowers the count
 * below the pin and fails the build; adding a test needs no edit here.
 *
 * Usage: node scripts/check-test-floor.mjs <report.json>
 * Exit: 0 both floors met; 1 either floor missed, one ::error:: line per miss; 2 the report is
 * missing, unreadable or not JSON, so the floor never reads as passed on nothing.
 */
import fs from 'node:fs'
import path from 'node:path'

const EXIT_CLEAN = 0
const EXIT_VIOLATION = 1
const EXIT_CANNOT_RUN = 2
const MINIMUM_SUITE_PASSED = 12
const REDACTION_SUITE_PATH = 'src/checkPhoneRedaction.test.js'
const REDACTION_SUITE_SUFFIX = `/${REDACTION_SUITE_PATH}`
const PINNED_REDACTION_PASSED_COUNT = 44

process.exitCode = main(process.argv.slice(2))

function main([reportPath]) {
  let report
  try {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
  } catch (error) {
    console.log(`::error::Test floors could not run (R52, R11): ${reportReadFailureReason(reportPath, error)}`)
    return EXIT_CANNOT_RUN
  }

  const suiteCounts = wholeSuiteCounts(report)
  const suiteCountsText =
    `numPassedTests=${suiteCounts.passed} numPendingTests=${suiteCounts.pending} ` +
    `numTodoTests=${suiteCounts.todo} numFailedTests=${suiteCounts.failed}`
  console.log(`Vitest report ${reportPath}: ${suiteCountsText}`)

  let failed = false
  if (!wholeSuitePasses(suiteCounts)) {
    failed = true
    console.log(
      `::error::Test floor failed (R52): need at least ${MINIMUM_SUITE_PASSED} passed and 0 ` +
        `pending, todo or failed; got ${suiteCountsText}.`,
    )
  }

  if (!reportRedactionSuite(report)) failed = true

  if (failed) return EXIT_VIOLATION
  console.log('Test floors passed.')
  return EXIT_CLEAN
}

// Sanitized to a plain basename before printing: the failure reason can come from an
// attacker-influenced path, and this line is echoed into a public Actions annotation.
function reportReadFailureReason(reportPath, error) {
  const basename = reportPath === undefined ? '(no report path given)' : path.basename(reportPath)
  if (error instanceof SyntaxError) return `${basename} is not valid JSON (${error.message}).`
  return `${basename} is missing or unreadable (${error.message}).`
}

function wholeSuiteCounts(report) {
  return {
    passed: Number(report.numPassedTests) || 0,
    pending: Number(report.numPendingTests) || 0,
    todo: Number(report.numTodoTests) || 0,
    failed: Number(report.numFailedTests) || 0,
  }
}

function wholeSuitePasses(counts) {
  return counts.passed >= MINIMUM_SUITE_PASSED && counts.pending + counts.todo + counts.failed === 0
}

// Prints the redaction suite's own line, success or failure, and returns whether it passed.
// Separated from main only so main stays a single pass over the two rules.
function reportRedactionSuite(report) {
  const suite = findRedactionSuite(report)
  if (suite === undefined) {
    console.log(`::error::Redaction suite floor failed (R11): ${REDACTION_SUITE_PATH} is missing from the report.`)
    return false
  }

  const { passed, notPassed } = redactionSuiteCounts(suite)
  console.log(`Redaction suite ${REDACTION_SUITE_PATH}: ${passed} passed, ${notPassed} not passed (floor ${PINNED_REDACTION_PASSED_COUNT}).`)
  if (passed >= PINNED_REDACTION_PASSED_COUNT && notPassed === 0) return true

  console.log(
    `::error::Redaction suite floor failed (R11): need at least ${PINNED_REDACTION_PASSED_COUNT} ` +
      `passed and 0 not passed; got ${passed} passed, ${notPassed} not passed.`,
  )
  return false
}

function findRedactionSuite(report) {
  const testResults = Array.isArray(report.testResults) ? report.testResults : []
  return testResults.find(
    (result) => typeof result.name === 'string' && result.name.replace(/\\/g, '/').endsWith(REDACTION_SUITE_SUFFIX),
  )
}

function redactionSuiteCounts(suite) {
  const assertionResults = Array.isArray(suite.assertionResults) ? suite.assertionResults : []
  const passed = assertionResults.filter((assertion) => assertion.status === 'passed').length
  return { passed, notPassed: assertionResults.length - passed }
}

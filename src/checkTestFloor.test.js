// Tests scripts/check-test-floor.mjs (R11, ADR 0004) by spawning it on fixture Vitest JSON
// reports, the way src/checkNpmrc.test.js spawns its script, so every case judges the exit code
// and the printed output rather than an internal function. No case reads the repository's own
// vitest-results.json. The workflow cases at the end read .github/workflows/deploy.yml as text,
// with the line helpers src/deployWorkflowNodeVersion.test.js already uses. This file lives under
// src/ only because Vitest discovers tests there.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const scriptPath = path.join(repositoryRoot, 'scripts/check-test-floor.mjs')
const workflowPath = path.join(repositoryRoot, '.github/workflows/deploy.yml')

// The suite's count at merge (Task 3, plan.md step 1), measured from a fresh JSON report of
// src/checkPhoneRedaction.test.js on this branch: 44 passed.
const PINNED_REDACTION_PASSED_COUNT = 44
const REDACTION_SUITE_PATH = 'src/checkPhoneRedaction.test.js'

const PASSED_LINE = 'Test floors passed.'
const SUITE_FAILED_PREFIX = '::error::Test floor failed (R52):'
const REDACTION_FAILED_PREFIX = '::error::Redaction suite floor failed (R11):'
const COULD_NOT_RUN_PREFIX = '::error::Test floors could not run (R52, R11):'

// Builds one entry of a fixture report's assertionResults[] for a file, one object per status
// named in `counts`, for example { passed: 43, pending: 1 }.
function assertionResultsFor(counts) {
  const results = []
  for (const [status, count] of Object.entries(counts)) {
    for (let i = 0; i < count; i += 1) results.push({ status })
  }
  return results
}

// Builds a fixture report in the shape scripts/check-test-floor.mjs reads: top-level totals plus
// one testResults[] entry per named file, its assertionResults[] built from a passed count (and
// any other status counts given).
function buildReport(overallTotals, files) {
  return {
    numPassedTests: overallTotals.passed ?? 0,
    numPendingTests: overallTotals.pending ?? 0,
    numTodoTests: overallTotals.todo ?? 0,
    numFailedTests: overallTotals.failed ?? 0,
    testResults: files.map(({ relativePath, counts }) => ({
      name: path.join(repositoryRoot, relativePath),
      assertionResults: assertionResultsFor(counts),
    })),
  }
}

function writeReport(reportPath, report) {
  fs.writeFileSync(reportPath, JSON.stringify(report), 'utf8')
}

function runFloorOn(reportPath) {
  return spawnSync(process.execPath, [scriptPath, reportPath], { encoding: 'utf8', timeout: 20_000 })
}

describe('check-test-floor', () => {
  let fixtureDirectory
  let reportPath

  beforeEach(() => {
    fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'check-test-floor-'))
    reportPath = path.join(fixtureDirectory, 'vitest-results.json')
  })

  afterEach(() => {
    fs.rmSync(fixtureDirectory, { recursive: true, force: true })
  })

  it('passes a report whose redaction suite is complete and whose suite meets the whole-suite floor', () => {
    writeReport(
      reportPath,
      buildReport(
        { passed: 12, pending: 0, todo: 0, failed: 0 },
        [{ relativePath: REDACTION_SUITE_PATH, counts: { passed: PINNED_REDACTION_PASSED_COUNT } }],
      ),
    )

    const result = runFloorOn(reportPath)

    expect(result.status).toBe(0)
    expect(result.stdout).toContain(PASSED_LINE)
    expect(result.stdout).toContain(`Redaction suite ${REDACTION_SUITE_PATH}:`)
  })

  it('fails a report in which the redaction suite never ran, however many other tests passed', () => {
    writeReport(reportPath, buildReport({ passed: 200, pending: 0, todo: 0, failed: 0 }, []))

    const result = runFloorOn(reportPath)

    expect(result.status).toBe(1)
    expect(result.stdout).toContain(REDACTION_FAILED_PREFIX)
    expect(result.stdout).toContain('missing from the report')
    expect(result.stdout).not.toContain(PASSED_LINE)
  })

  it.each([
    [
      'one pending assertion among the rest passed',
      { passed: PINNED_REDACTION_PASSED_COUNT - 1, pending: 1 },
    ],
    [
      'one fewer passed than the pin and nothing else',
      { passed: PINNED_REDACTION_PASSED_COUNT - 1 },
    ],
  ])('fails a report whose redaction suite is skipped in part or short of the pin: %s', (_label, counts) => {
    writeReport(
      reportPath,
      buildReport(
        { passed: 20, pending: 0, todo: 0, failed: 0 },
        [{ relativePath: REDACTION_SUITE_PATH, counts }],
      ),
    )

    const result = runFloorOn(reportPath)

    expect(result.status).toBe(1)
    expect(result.stdout).toContain(REDACTION_FAILED_PREFIX)
    expect(result.stdout).toContain(`need at least ${PINNED_REDACTION_PASSED_COUNT} passed and 0 not passed`)
    expect(result.stdout).not.toContain(PASSED_LINE)
  })

  it.each([
    ['11 passed overall with a complete redaction suite', { passed: 11, pending: 0, todo: 0, failed: 0 }],
    ['one failed assertion elsewhere with numFailedTests 1', { passed: 20, pending: 0, todo: 0, failed: 1 }],
  ])('keeps the whole-suite floor and the zero-skipped rule of the inline step: %s', (_label, overallTotals) => {
    writeReport(
      reportPath,
      buildReport(overallTotals, [
        { relativePath: REDACTION_SUITE_PATH, counts: { passed: PINNED_REDACTION_PASSED_COUNT } },
      ]),
    )

    const result = runFloorOn(reportPath)

    expect(result.status).toBe(1)
    expect(result.stdout).toContain(
      `${SUITE_FAILED_PREFIX} need at least 12 passed and 0 pending, todo or failed`,
    )
    expect(result.stdout).not.toContain(PASSED_LINE)
  })

  it.each([
    ['a report path that does not exist', () => path.join(fixtureDirectory, 'missing.json')],
    ['a file holding text that is not JSON', () => {
      const notJsonPath = path.join(fixtureDirectory, 'not-json.txt')
      fs.writeFileSync(notJsonPath, 'this is not JSON', 'utf8')
      return notJsonPath
    }],
  ])('exits 2 when the report is missing or unreadable, so the floor never passes on nothing: %s', (_label, makePath) => {
    const badPath = makePath()

    const result = runFloorOn(badPath)

    expect(result.status).toBe(2)
    expect(result.stdout).toContain(COULD_NOT_RUN_PREFIX)
    expect(result.stdout).toContain(path.basename(badPath))
    expect(result.stdout).not.toContain(PASSED_LINE)
  })
})

function readWorkflowLines() {
  const text = fs.readFileSync(workflowPath, 'utf8').replace(/\r\n/g, '\n')
  return text.split('\n')
}

function stepNameLines(lines) {
  return lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line.startsWith('- name:'))
    .map(({ line, index }) => ({ name: line.replace(/^- name:\s*/, ''), index }))
}

function stepNameBefore(lines, lineIndex) {
  return [...stepNameLines(lines)].reverse().find(({ index }) => index < lineIndex)
}

describe('deploy workflow test-count floors step', () => {
  it('the deploy workflow runs the floor script between the tests and the build, and the inline floor is gone', () => {
    const lines = readWorkflowLines()

    const floorRunLines = lines
      .map((line, index) => ({ line: line.trim(), index }))
      .filter(({ line }) => line === 'run: "node scripts/check-test-floor.mjs vitest-results.json"')
    expect(floorRunLines).toHaveLength(1)

    const [{ index: floorRunIndex }] = floorRunLines
    const precedingName = stepNameBefore(lines, floorRunIndex)
    expect(precedingName?.name).toBe('Test-count floors (R52, R11)')

    const testsStepIndex = stepNameLines(lines).find(({ name }) => name === 'Run the tests')?.index
    const buildStepIndex = stepNameLines(lines).find(({ name }) => name === 'Build')?.index
    expect(testsStepIndex).toBeGreaterThan(-1)
    expect(buildStepIndex).toBeGreaterThan(-1)
    expect(floorRunIndex).toBeGreaterThan(testsStepIndex)
    expect(floorRunIndex).toBeLessThan(buildStepIndex)

    expect(lines.some((line) => line.includes('minimumPassed'))).toBe(false)
    expect(fs.existsSync(scriptPath)).toBe(true)
  })
})

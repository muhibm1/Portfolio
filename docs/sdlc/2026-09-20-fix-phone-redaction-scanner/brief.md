# Fix the phone redaction scanner's mixed-encoding miss and its silent no-run

Change id: `2026-09-20-fix-phone-redaction-scanner` · Prepared 2026-09-20 21:57 UTC, revised 2026-09-20 after the constraint audit
Risk tier: 2 (blocking PII redaction check whose failure mode is a silent false green; the profile floors its sibling checks at tier 2, and one step of the publishing workflow changes)
For the agents: [spec.md](./spec.md), [plan.md](./plan.md), [evals.md](./evals.md), [adr/](./adr/)

This is the Design document. A person reads it in under five minutes, technical or not. Plain
sentences; name things by what they do; no code.

## The short version

You asked for the repository check that keeps your phone number out of tracked files to stop
missing the number in files that mix two text encodings, and to stop silently doing nothing
when it is started through a shortcut path. Both defects were reproduced on your machine
today; the fix scans every file in every plausible decoding and removes the "am I the program
being run?" test entirely, so the check cannot be started without running. The audit found the
same kind of hole one level up: the publishing workflow's test floor is green even if this
check's tests are deleted or skipped. Closing that needs one step of the publishing workflow
to change, so approving this document also accepts an edit to `.github/workflows/deploy.yml`
(decision D9). Two things worth knowing: one existing test changes what it expects, on
purpose, and the tests for the check will be pinned in number, so removing one fails the build.

## Problem

Your words: the script "misses a hit in a file with mixed UTF-8 and UTF-16 encoding, and
silently exits 0 with no output when it is invoked through a junction or symlink because its
direct-run guard compares paths literally."

Precisely: the check picks one way of reading each file. A file that starts as one encoding and
ends as another has its second half read with the wrong decoder, so digits there turn into
other characters and the number is not found; three such file shapes were confirmed to report
"clean" today. Separately, the check only runs when the path it was started from matches its
own path letter for letter. Node resolves a shortcut to the real path on one side but not the
other, so through a junction, a symlink or a network path the two never match, nothing runs,
nothing is printed, and the exit code says "clean". And in the workflow that publishes the
site, the only test floor is "at least 12 tests passed" across a suite of 167, so nothing there
proves this check's tests ran at all.

## Outcome

When this is done: a file holding the number in any UTF-8 or UTF-16 region, at any byte
alignment, produces a hit and exit 1. A file the check cannot read with confidence and in
which it found nothing produces exit 2, never "clean". Starting the check through any path
form runs it and prints its summary; an empty output on a "clean" exit is impossible, and a
program bug that returns no exit code reports "could not run" instead of "clean". Tests that
plant a number and expect exit 1 prove all of this on the shallow CI checkout, and the
publishing workflow fails unless that test file ran in full.

## What changes for people

You: nothing in the published site changes; no runtime file under the site's source is
touched. The command you run is unchanged. The self-test gains an optional directory argument
that scans a folder for a stand-in number; its output says plainly that it is not the real
scan. The check's helper code moves into a second file next to the script, and a third small
script becomes the workflow's test floor. Your next push to `main` runs that floor for the
first time on a Linux runner; if it fails, nothing is published and the job log names why.
After approval you edit the WorkHorse profile yourself to list the three script files as
sensitive (D7). Recruiters and visitors: nothing.

## What could go wrong, and the guard for each

| Risk | Guard |
|------|-------|
| The rewrite drops something the old check did (a count, the rule that never prints content) | The existing tests stay in place unchanged, and new tests assert no report line holds a digit of the number or a word of the file |
| Reading each file five ways is slow | Only files that contain a zero byte get the extra readings, and a test bounds a 4 MB file at five seconds |
| The shortcut test cannot create a shortcut on the CI machine | On Windows it needs no privilege (confirmed); on Linux the same call makes an ordinary symlink; the first CI run is the proof |
| A test's shortcut cleanup deletes the real scripts folder it points at | Removal was probed on your machine and removes only the link (confirmed); a final test checks the folder listing is unchanged |
| The workflow edit breaks the publishing job | It is one step, checked by a test that reads the workflow; a failed job publishes nothing; you read the one-step diff before merging |
| A file with a number split across the encoding boundary still reads clean | Accepted and written down; no person could read such a number either |
| Someone runs the stand-in scan on the built site and mistakes exit 0 for the real check | The first output line says it is the stand-in; the real scan needs no flag |

## Decisions

Every question the design raised, each with the recommended answer already chosen. The first
two need an action from you. Approving this document accepts every recommendation; say
otherwise in the approval notes to change one.

| # | Decision | Recommendation | Alternative | Why the recommendation |
|---|----------|----------------|-------------|------------------------|
| D9 | How the publishing workflow proves this check's tests ran (audit, high) | A small script pins the number of tests in the check's test file and fails if any is missing or skipped; one step of `deploy.yml` calls it. Needs you: this edits the publishing workflow, an ask-first path, and you accept it here and again when you read the diff | Put the proof inside the test file itself; or extend the inline block in the workflow | A proof inside the file is deleted with the file; the inline block can only be tested by publishing. The sibling checks already use a script for this reason |
| D7 | List the three script files (entry, library, floor) as sensitive and tier 2 in the WorkHorse profile, as the sibling checks are; the audit's D13 is the same ask | Yes. Needs you: agents leave the profile to you; edit it after approval | Leave as is | Consistency with the other blocking checks; the floor script is now part of the publishing path |
| D1 | How to stop the silent no-run | Remove the "am I being run directly?" test by splitting the script into an entry that always runs and a library the tests import | Keep one file and compare real paths or file identities | A comparison can still be wrong or throw; an entry with no test cannot be skipped. Network paths defeat real-path comparison (confirmed) |
| D2 | A run finds a hit and also a file it cannot read: exit 1 or 2 | Exit 1, and list both | Exit 2 | A found number is the graver, actionable fact, and the red-team tests expect 1 |
| D3 | One existing test plants a zero byte and the number and expects exit 2 | Rewrite it as two tests: with the number, exit 1; without, exit 2 | Keep exit 2 above exit 1 so the test stands | The test encodes the old contract; the spec changes it deliberately. Agents that fix bugs still may not edit tests |
| D4 | How red-team tests that start the real program get a reference number in CI, where git history is shallow | Let the self-test mode scan directories for its stand-in number | Read the number from an environment variable; or skip in CI | A variable deciding what a security check looks for is a foot-gun; a skipped test trips the CI test floor |
| D5 | Read every file five ways, or only files that contain a zero byte | Only with a zero byte | Always | A digit in the two-byte encodings needs a zero byte, so the extra readings can find nothing otherwise (confirmed) |
| D6 | Keep the "cannot read with confidence" class once every layer is scanned | Keep it, exit 2 | Call every scanned file recognised | Other encodings would then read as clean |
| D8 | A number split across an encoding boundary | Accept the limitation and record it | Detect boundaries | A boundary detector is a guess with its own misses |
| D10 | Also run the real scan of the repository in the publishing workflow (audit, medium) | Not in this change; record it as a follow-up. Meanwhile the served page is checked for any phone pattern on every deploy, and the real scan runs on your machine | Add a full-history checkout and a scan step to the same workflow edit now | It is a second control with its own failure modes (an unreadable file would block a release) and deserves its own decision and tests; this change fixes the scanner |
| D11 | A future bug that makes the program return no exit code would exit "clean" (audit, medium) | Guard the exit code in the entry: anything but 0, 1 or 2 becomes "could not run" with a message | Trust the program | A silent false green is the exact defect this change removes |
| D12 | The test's shortcut cleanup could follow the link into the real scripts folder (audit, medium) | Remove the link itself, never its contents (probed on your machine, confirmed), and end with a test that the folder is unchanged | Trust the cleanup | A test suite that can delete repository files is worse than the bug |
| D13 | Profile paths for the script files (audit, medium) | Merged into D7 above | | One ask, one answer |

## How it will be proved

The profile checks must pass: lint, the test suite, the build and the runtime dependency
audit, each exit 0. The eval cases in `evals.md`, all run by the test suite: 13 golden, 7 edge,
5 failure, 8 adversarial and 1 non-functional, 34 in all. Among them, three fixtures that
report clean today must report a hit, the program started through a junction with a planted
number must exit 1, and the floor script must fail a test report in which this check's tests
never ran. Beyond the profile, the verifier runs the real scan on the branch (expect clean),
one run through a junction (expect the summary line), and the floor script on a real test
report (expect pass). Done means: every case passes, the real scan is clean, no report line
ever shows the number, and the workflow diff touches one step.

## Estimate

Waves: 3. Tasks: 3. Agent-time budget at tier 2: 90 minutes, of which 21 were used in design.

## Your decision

Approve to build it exactly this way, including the one-step edit to the publishing workflow
and your own edit to the profile, or reject with notes to have it redesigned.

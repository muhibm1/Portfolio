# 0008: Keep the resume off the site and limit contact to email and LinkedIn

Date: 2026-09-28
Status: proposed. Supersedes 0003 of this change; amends 2026-09-11 ADR 0008 again (no resume on the site in any form).
Change: 2026-09-25-rebuild-portfolio-to-approved-redesign (revision)

## Context

ADR 0003 served the resume as a static PDF from `public/`, with a file test (G18), a deploy smoke
fetch, a hash-tied CI check (`scripts/check-resume-pdf.mjs`, D23) and a manual D12/D17 check by
the owner. The file never arrived: it was the sole cause of the red verification and the Ship
block (`ship.md`, D-lead). On 2026-09-28 the owner answered: "the resume is only here to serve as
context so you know what recruiters are seeing. the only contact information on the site should be
my email and my linkedin. the actual resume doesnt need to be on the site anymore as the people
that need to see it will likely already have access to it". His resume carries his phone number,
which must never be committed anywhere in this public repository (hosted-config section 7). R151,
R152.

## Decision

No resume is served, linked or copied. The four Resume controls (header, hero "Download resume",
experience "Full resume (PDF)", footer "Resume") are removed, and `resume` joins the forbidden-copy
terms so a control cannot come back silently. `scripts/check-resume-pdf.mjs`, `scripts/resume-pdf.mjs`,
their test, the PDF half of G18, the D23 workflow step and the PDF fetch in smoke R143 are deleted;
`.pdf` leaves the phone scanner's binary list (D16 reverted) so a local run of the scanner reports a
PDF committed by mistake as undecodable instead of skipping it; the CI guard against such a file is
the `git ls-files` no-`.pdf` assertion in G18 and G21, run by `npm test` in the build job (the
repository phone scan is not a CI step, confirmed). The contact surface is the email address and the
LinkedIn profile: the footer's buttons are Email and LinkedIn; the case-study contact bands keep
their Email button. GitHub is not a contact method; it appears as a code link (ADR 0009). The
footer lead keeps the mockup's words minus the parts that no longer hold: "I reply to email within
a day. References are available on request."

## Alternatives

| Option | Why not |
|--------|---------|
| Keep the PDF link and wait for the file | The owner has said the file is not needed on the site; the block would stay open for a file that will not come |
| Link the resume on LinkedIn or another host | A new third party on every click, and the resume carries the phone number the site withholds |
| Keep GitHub as a third contact button in the footer | The owner named exactly two contact methods; GitHub is where the code lives, so it belongs beside the code and in the header nav |
| Keep `.pdf` skipped in the phone scanner | With no PDF shipping, a skipped PDF is a silent local path for a file that carries the phone number; the `git ls-files` test is the CI guard either way |

## Consequences

Easier: the Ship block disappears; no owner-supplied binary, no hash log, no PDF metadata review;
one less CI step and one less smoke fetch.

Harder: a recruiter who wants the resume must ask by email; the site's "Download resume" call to
action is gone from the hero, so the hero has one primary button and the email link. The
hosted-config 6a record and the profile's retention note must say the PDF was withdrawn, not just
delete the paragraphs, so a later reader understands why the check scripts are gone.

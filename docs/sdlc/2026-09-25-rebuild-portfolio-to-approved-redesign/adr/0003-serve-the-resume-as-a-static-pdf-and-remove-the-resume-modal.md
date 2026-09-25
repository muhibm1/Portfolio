# 0003: Serve the resume as a static PDF under public/ and remove the resume modal

Date: 2026-09-25
Status: proposed. Amends 2026-09-11 ADR 0008 (the resume no longer stays a modal).
Change: 2026-09-25-rebuild-portfolio-to-approved-redesign

## Context

Plan section 4 says the Resume buttons point at "the resume PDF the repo already serves", and
section 8 tells the owner to update that PDF before shipping. No PDF exists: `public/` holds
`favicon.svg`, `icons.svg` and `.well-known/security.txt` only (confirmed). Today the resume is
`src/components/ResumeModal.jsx`, an in-page modal with copy and print buttons, opened from the
navbar and the footer (confirmed). The mockups have four resume controls (header "Resume", hero
"Download resume", experience "Full resume (PDF)", footer "Resume") and no modal. R137.

## Decision

All four controls are plain `<a>` links to one served path,
`<BASE_URL>Muhammad_Muhibullah_Resume.pdf` (`/Portfolio/Muhammad_Muhibullah_Resume.pdf` on
Pages), with the `download` attribute where the copy says "Download". The file lives at
`public/Muhammad_Muhibullah_Resume.pdf` and is supplied by the owner, not written by an agent. A
test requires the file to exist and to begin with `%PDF-`, and the deploy smoke fetches it and
requires 200 with a PDF content type. `ResumeModal.jsx`, its test and `useClipboardCopy.js` are
deleted. Until the owner adds the file, that test is red and the missing file is the ship blocker
recorded against decision D2.

## Alternatives

| Option | Why not |
|--------|---------|
| Keep the modal and label the buttons "Resume" | The mockups say "Download resume" and "Full resume (PDF)"; a modal that prints is not a download, and the modal's copy would be a second copy of the facts to keep in step |
| Generate the PDF at build time from the data module | A PDF library is a new dependency, and the owner wants to control the resume's wording himself (section 8) |
| Link to an external file host | A new third party on every click; the site's whole privacy position is that there is none |
| Name the file `resume.pdf` | Recruiters save the file; a name with the owner's name in it survives a downloads folder |

## Consequences

Easier: one file, one path, zero JavaScript; the resume is the same bytes on every page.

Harder: the site now ships a binary the phone-redaction scanner cannot read inside compressed PDF
streams (believed, not verified), so the owner checks the file for the phone number by eye
before adding it (decision D12). Updating the resume means committing a new PDF; there is no
generated fallback if the file is forgotten, which is why the test and the smoke fail closed.

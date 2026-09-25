# Rebuild the portfolio to the approved redesign

Change id: `2026-09-25-rebuild-portfolio-to-approved-redesign` · Prepared 2026-09-25 UTC
Risk tier: 2 (the change edits the package manifest, the page shell, the Vite config, the deploy workflow and the two route-page scripts, all on the profile's tier-2 floor; the workflow is the only path that publishes)
For the agents: [spec.md](./spec.md), [plan.md](./plan.md), [evals.md](./evals.md), [adr/](./adr/)

This is the Design document. A person reads it in under five minutes, technical or not. Plain
sentences; name things by what they do; no code.

## The short version

You asked for the site to be rebuilt to your plan and seven mockups, with every invented claim gone and machine-checked, only your approved numbers, and pages that recruiters' tools can read without JavaScript. That is what this builds: a new look on your tokens and typefaces, a rebuilt home page, a five-study work index, five single-scroll case studies, and a build that writes each page's real text and link-preview tags into the served HTML. The one thing worth knowing: it is one large change with nine "ask first" prompts on the build and deploy files, and nothing reaches the live site until you review the branch and merge it yourself.

## Problem

In your words: the live site carries a scripted simulator, a 99.9% stat, "zero unauthorized actions", "11x", "sub-10ms", case-study tabs that all show the same content, an orb with a debug-looking caption, projects you want off the site, and an old design, so it does not read as a strong Forward Deployed Engineer candidate. Precisely: the content module and every section component predate your plan; nothing in the build or CI stops a removed claim from coming back; every route serves the same title and an empty page body to anything that does not run JavaScript.

## Outcome

- Every route in your plan's section 3 loads directly on GitHub Pages: home, `/work`, and five case studies in the order WorkHorse, LLM decision system, integration tool, Data Health, Neural Newsletters, with prev/next in that order.
- Every removal in section 1 is done, the obsolete components are deleted, and a scanner fails `npm test` and the deploy if any of the seventeen listed strings, an em dash or an en dash reappears in source or built pages.
- The home page, `/work` and each case study carry the mockup copy word for word, from one content file, with only the numbers in your section 6 table.
- The fonts are IBM Plex Sans, IBM Plex Mono and Space Grotesk, still served from this site and not from Google.
- The four Resume buttons download one PDF that you supply; the in-page resume modal is gone.
- Each served page carries its own title, description, canonical address, Open Graph and Twitter tags, a 1200 by 630 share image, and the page's real text, so a pasted link unfurls and a non-JS screen reads the copy.
- CI runs the copy scanner, checks every page for its tags and text, and after each deploy fetches a case study, an unknown address, the PDF and the share image.
- The docs, `CLAUDE.md` and the profile describe the new site and guard the new scripts.

## What changes for people

Recruiters see the new site once you merge; a pasted link shows a preview with your name and the throughput stat. You, as the owner, get nine permission prompts during the build (listed per task in the plan), two things to supply (the resume PDF and, through the main session, the rendered share image), a numbers-per-page list to confirm, and the local preview to review before approving Ship. Future edits to copy go into one content file; a banned phrase fails the tests before it ships.

## What could go wrong, and the guard for each

| Risk | Guard |
|------|-------|
| A number or phrase drifts from your plan | Tests pin the stats, dates and toolkit lists verbatim; the scanner blocks the seventeen strings and both dashes; you confirm the numbers list at Ship |
| Server-rendered and browser-rendered pages disagree | A test renders every route on the server and hydrates it in a browser environment, failing on any error |
| The build passes on nothing (missing files, empty pages) | The prerender step and both check scripts exit non-zero on a missing shell, a missing entry, an empty page body or a missing marker |
| The resume PDF or share image is missing | A test and a deploy check both fail until the files exist; the gap is recorded as a Ship blocker, never papered over |
| The PDF carries your phone number, a street address or hidden document properties | You check it by eye before adding it (D12, D17) and the check is recorded at Ship; the existing phone scanner cannot read inside compressed PDF streams and will skip PDFs by design (D16) |
| A change to the deploy checks is only proved after merge | The workflow text is tested before merge; you merge when you can watch the first run |
| The site is published by accident | No agent can push `main`; the shipper opens a pull request, which does not deploy; only your merge deploys |

## Decisions

Every question the design raised, each with the recommended answer already chosen. Approving
this document accepts every recommendation; say otherwise in the approval notes to change one.

| # | Decision | Recommendation | Alternative | Why the recommendation |
|---|----------|----------------|-------------|------------------------|
| D1 | Fonts: the plan says "Google Fonts" | Keep self-hosting; add `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono` at 5.3.0 (OFL-1.1), keep Space Grotesk, remove Inter, JetBrains Mono and `thinking-orbs` | Load from Google Fonts | Your 2026-09-11 decision removed Google for privacy; the CSP and the deploy smoke enforce it; the plan's line names families, not a host (ADR 0002) |
| D2 | Resume: the plan points at a PDF the repo does not have | All four buttons link to `/Portfolio/Muhammad_Muhibullah_Resume.pdf`; you add `public/Muhammad_Muhibullah_Resume.pdf`; a test and the deploy check require it; the modal is deleted. Needs your hand: the missing file is a Ship blocker until you add it | Keep the print-to-PDF modal | The mockups say "Download resume" and "Full resume (PDF)"; one file, no code (ADR 0003) |
| D3 | Non-JS readers and link previews | Prerender every route at build time and hydrate in the browser; per-page tags in every served page | A `<noscript>` summary now and prerendering later | Per-page tags already change the route-page check and smoke; prerendering adds one entry file and one script on top (ADR 0001) |
| D4 | The share image | A builder writes `docs/design/og.svg`; the main session renders it once in the Chromium already on your machine, with the typefaces from the local font files only and no package fetched at call time, to `public/og.png` at 1200 by 630 and commits it; a test checks the dimensions; regeneration is a documented manual step | Render at build time with a native image library | No new dependency and no third-party contact for a file that changes a few times a year (ADR 0005) |
| D5 | Where the handoff lives | Move it to `docs/design/redesign-2026-09/` and commit it; delete the zip, never commit it; point `docs/design-brief.md` at it | Leave it untracked | The design record should live with the code (ADR 0007) |
| D6 | Scope | One change in five waves and thirteen builder tasks | Two changes, with prerendering, tags and the image second | The build and deploy files change either way; one review is cheaper than two; the artifact caps hold the scope |
| D7 | Rewriting the facts in the content file, a path only you may change | Treated as authorized by your plan (section 6 and the mockups); the rewrite is one task, one prompt, and the spec records the authorization | Have you edit the numbers by hand after the build | The plan is your own instruction; the prompt still fires so you see it |
| D8 | The old copy-email button, which the plan says to keep "if it's there" | Drop it: email addresses are plain `mailto:` links everywhere | Keep a copy button beside the hero email | The mockups have no such control, and a real mail link is what a visitor expects |
| D9 | Mobile stats | Show the first four stats in a 2 by 2 grid below 768px, as the phone mockup does; the fifth shows from 768px up | Show all five on phones | The mockup is the layout source |
| D10 | The not-found page | Prerender it into `404.html` with a `noindex` tag and no canonical | Keep `404.html` as a copy of the home page | An unknown address should read as not found to people and to crawlers |
| D11 | Nine ask-first prompts (package files, content file, page shell, Vite config, two route scripts, workflow) plus one `npm install` | Accept them as listed in the plan's wave table | Loosen the profile for this change | Each prompt is on a file that decides supply chain, facts or publishing |
| D12 | The PDF's contents (widened by D17) | Before adding it, you confirm: contact details limited to what the site already shows (name, email, city, LinkedIn, GitHub); no phone number, no street address; the document properties (Author, Title, Producer, any file path) checked or stripped; the backlog wording matches the November 2025 launch (plan section 8). The PDF is then listed in the profile's retention notes and the hosted-config record | Check only the phone number and the backlog wording | A public PDF cannot be unpublished once archived; the scanner is believed not to read compressed PDF streams |
| D13 | What the copy scanner reads | `src/` without test files, the page shell, the share-image source, plus built HTML; not `docs/`; matching ignores letter case and catches dashes written as HTML entities | The whole repository | This design record and your plan legitimately contain every banned term |
| D14 | How the existing deploy check R80 treats links now present in the served page body | Narrow R80 to asset tags only (scripts, stylesheets, icons, preloads) for the `/Portfolio/` prefix; body links and the canonical are covered by the new per-page marker checks | Keep R80 reading every link and add an allowlist (the canonical origin, `mailto:`, LinkedIn, GitHub, `#` fragments) | CI must fail loudly and only on real faults; today's R80 would fail the first deploy after Pages had already published |
| D15 | Where the live privacy assertions run once pages differ | The route-page check verifies on every built page: one referrer tag, no inline script, no Google font host, no phone-shaped number; the deploy smoke repeats those counts on the case-study and not-found pages, not only the home page | Keep the assertions on the home page only and accept that the other seven pages get the CSP and asset checks alone | The pages are no longer byte-identical, so a check on one page no longer proves the others |
| D16 | How the phone scanner handles the committed resume PDF | Add `.pdf` to the scanner's binary list in this change, with a comment naming D12 and D17 as the compensating manual check, and record your check in the Ship document | Leave `.pdf` off the list, so the scan fails until a PDF text-extraction step (a new dependency) exists | No failure path may be both silent and consequential; the manual check is written down, not implied |
| D17 | What you check in the resume PDF before adding it | The widened D12 above, plus the PDF and the fact that your email now appears in the served HTML without JavaScript recorded in the profile's retention notes and in `docs/hosted-config.md` | Keep D12 as first written (phone number and backlog wording only) | Most private default; the constraints forbid new personal data fields, and PDF metadata is a common leak |
| D18 | What of the handoff is committed to the public repository | Commit the seven mockups and a copy of the plan with two passages redacted: the section 5 WorkHorse figures you said to keep off the site, and the section 8 resume-wording note; each replaced by a line saying what was withheld; ADR 0007 states the redaction; the original stays on your machine; the mockups are re-checked for the same figures (none found today) | Commit the plan verbatim, accepting that the withheld figures become public | Everything published is public and permanent, and `docs/` is readable by the same recruiters the site addresses |
| D19 | Exact pinning of `react` and `react-dom` now that the server renderer writes every served page | Pin both to `19.3.0`, the version the lockfile already resolves, and add them to the deploy workflow's exact-pin list | Accept the caret range with the lockfile and `npm ci` as the control | Third-party code in a path that writes served pages is pinned exactly; the lockfile becomes the second control, not the only one |

## How it will be proved

Profile checks: `npm ci`, `npm run lint`, `npm test`, `npm run build`, the runtime `npm audit`. Then on the built site: the existing font check, the rewritten route-page check, the new copy scanner, the phone-redaction scanner and the test-count floor. Evals in `evals.md`, 40 cases at the tier-2 limit: 23 golden, 4 edge, 2 failure, 2 adversarial, 4 non-functional (three timed or counted by machine, Lighthouse by a person) and 5 manual (viewports, keyboard, non-JS fetch, the numbers list, the PDF), each manual case listed as not verified until recorded in the Ship document. After the audit and the eval review, the case about the mentorship wording (G15) was merged into the data case G14, and a case (G24) that assembles each served page end to end and checks its tags was added, so the count stays 40. The constraint audit passed with no high finding; its six medium findings are D14 to D19 above, each with the auditor's recommendation chosen. Done looks like: every route serves its own copy and tags, the scanner finds nothing, all 34 automated cases pass, and you have confirmed the numbers list and the preview.

## Estimate

Waves: 5. Tasks: 13 builder tasks plus one set of checks people run. Agent-time budget at tier 2: 90 minutes; a full rebuild in thirteen tasks will very likely exceed it, and the clock will say so.

## Your decision

Approve to build it exactly this way, or reject with notes to have it redesigned. Publishing stays yours: the shipper pushes only the change branch and opens a pull request; you review the pull request and the local build (`npm run build` then `npm run preview`) before approving Ship and merging, and your merge is the deploy.

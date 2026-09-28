# Portfolio redesign: implementation plan

Owner: Muhammad Muhibullah
Live site: https://muhibm1.github.io/Portfolio/ (GitHub Pages, repo `muhibm1/Portfolio`)
Goal: make the site read as a strong Forward Deployed Engineer (FDE) and deployment strategist candidate. A recruiter, hiring manager or engineer should finish it thinking "let's schedule a call."

This folder contains:

- `PORTFOLIO_REDESIGN_PLAN.md` (this file): what to change, why, and how to check it.
- `mockups/*.dc.html`: approved page mockups. **They are the source of truth for copy and layout.** They use a design-canvas format (`<x-dc>`, `<helmet>`, a `support.js` script, a `data-dc-script` block). Don't copy that markup into the site or try to run it. Read them for the words, section order, hierarchy, spacing and colors, then rebuild them in the site's existing framework.

---

## 0. Ground rules (read before touching anything)

1. **Inspect the repo first.** Work out the framework, router, build and deploy setup (GitHub Pages path prefix `/Portfolio`, how `/work/<slug>` routes are served, since direct loads currently work). Keep the existing stack and hosting. Don't migrate frameworks or hosts.
2. **Copy is fixed.** Use the wording in the mockups word for word, except where this plan says otherwise. Don't paraphrase, "improve" or add copy of your own.
3. **Only use numbers from the approved facts table (section 6).** Don't add, round up, combine or estimate any number. If a layout needs a stat that isn't in the table, leave the slot out.
4. **No em dashes or en dashes anywhere in site copy** (the owner has banned them). Use commas, periods, colons or "to" for ranges ("30 to 350+", "May 2024 to Feb 2025").
5. **Never name internal Apple systems, tools, hostnames or people.** Say "Apple (via TCS)", "Data Health team", "ticketing system", "geo-data system", "code repository". Keep the line "Internal system names are withheld" where the mockups have it.
6. **Don't overclaim.** Kubernetes experience is job submission on AWS EKS, not running clusters: don't list "Kubernetes" as a standalone skill. No Databricks, Delta Lake, Go, FastAPI, fine-tuning, TensorFlow, NiFi or MLOps claims.
7. Make small, reviewable commits, one per section below. Don't push or deploy until the owner has reviewed the local build.

---

## 1. Remove from the current site

| Remove | Where it is now | Why |
|---|---|---|
| "Live FDE Decision Triage Simulator" section, its presets, JSON payload, "Run Decision Engine" button and all its logic | Homepage `#simulator`, `/work` "Live demo" section, "Test Simulator" / "Launch Simulator" / "Test the Decision Architecture" links, hero "Interactive Triage Simulator" button | Scripted output (48 ms "LLM" latency) that any engineer will spot as fake. It also describes Apple internal system shapes. |
| The 99.9% "Release Continuity" stat tile | Homepage telemetry row | Made up |
| "with zero unauthorized actions" | Apple LLM case study summary, homepage card, `/work` listing | Made up |
| "Confidence ≥ 95% -> Auto-Approve" and the "Dual Decision Gate / deterministic rules + confidence scoring" pipeline bullets | Apple LLM case study | Made up |
| "Immutable audit trail / Enterprise Compliant", "100% Automated", "11x Increase" metric cards | Apple LLM case study sidebar | Made up or unverified. Replaced by approved stats. |
| "Zero Data Corruption", "On Schedule", "Continuous" metric cards; "Tuned Spark jobs identify schema drift"; "Streaming Kafka & batch S3 files across 50+ concurrent regions" | Apple Data Health case study | Made up |
| "sub-10ms data fetches" | Neural Newsletters case study | Made up |
| -40% described as "Production Outage Drop, achieved via CI/CD gates, schema rewrites & WebSocket sync" | Homepage telemetry row | Wrong. It's incidents, credited to CI/CD quality gates and automated tests only. The new copy covers it. |
| The four tabs (Challenge / System Architecture / Production Deployment / Measured Impact) on case study pages | All `/work/<slug>` pages | Broken: every tab shows the same content. Replaced with a single scrolling page. |
| Decorative orb animation and its "thinking-orbs · working" caption | Homepage hero | The caption looks like debug text, and the animation froze a browser during a screenshot. Replaced with the "Right now" card. |
| Shu, Wasl and the research paper | `/work` Projects section, anywhere else | Owner wants them off the site for now. Keep the code in git history, just don't render or link it. |
| "Architected" as a verb | Case study summaries | Replaced by the mockup copy |
| `/work` filter chips (All / Case study / Project / Live demo) | `/work` | Only case studies remain |

After removal, search the whole repo (source, not just rendered pages) for: `99.9`, `unauthorized`, `95%`, `Enterprise Compliant`, `Zero Data Corruption`, `schema drift`, `sub-10ms`, `simulator`, `Simulator`, `thinking-orbs`, `Shu`, `Wasl`, `wasl`, `Apple Geo Ingest`, `dataops-service`, `GEO-92841`, `—`, `–`. Nothing should match in rendered copy. (One note about a search term withheld from the committed copy, D54.)

---

## 2. Design system (from the mockups)

Apply these as shared tokens or CSS variables and use them everywhere.

- **Fonts** (Google Fonts): `Space Grotesk` 500/600 for display and headings, `IBM Plex Sans` 400/500/600 for body, `IBM Plex Mono` 400/500 for eyebrows, tags and small labels.
- **Colors:** ground `#ECEAE5`; raised surface / cards `#F7F6F3`; card border `#D6D3CC`; rule lines `#C9C6BE`; ink `#17171A`; body text `#2B2A27`; muted text `#55534E`; accent (hover only) `#B4400B`; dark sections `#17171A` with text `#F7F6F3`, secondary `#DCDAD4`, tertiary `#B9B6AE`.
- **Type scale (desktop):** hero h1 72px/1.03 (-0.025em); case study h1 64px; section h2 48px; case study section h2 34px; card h3 26px; small heading 19px; lead 21px/1.55; body 17px/1.65; small 15px; eyebrow 13px mono, uppercase, letter-spacing 0.12em.
- **Layout:** 1440 mockup width, 120px side padding, 12-column grid with 24px gutter, section vertical padding about 112px. Cards have a 10px radius and 1px border. Buttons are at least 48px tall with an 8px radius. Primary buttons are ink on light (hover goes to the accent); secondary buttons are 1px ink outlines.
- **Mobile:** see `mockups/Home-Mobile.dc.html` (390px). 20px side padding, a single column, the stats in a 2×2 grid, full-width buttons, and a hamburger menu button with `aria-label`.
- **Accessibility:** real `<a>`/`<button>` elements, visible focus styles, text contrast at least 4.5:1, touch targets at least 44px.

---

## 3. Pages and routes

Keep the existing URLs working, since they may already be on resumes. Add new ones.

| Route | Mockup | Notes |
|---|---|---|
| `/Portfolio/` | `Main.dc.html` (desktop), `Home-Mobile.dc.html` (phone) | Full homepage rebuild |
| `/Portfolio/work/` | none | List of the 5 case studies below using the homepage card style, WorkHorse first as the dark featured card. No Projects or Live demo sections. |
| `/Portfolio/work/workhorse` | `CS-WorkHorse.dc.html` | **New** |
| `/Portfolio/work/apple-llm-triage` | `CS-Decision.dc.html` | Existing slug, new content |
| `/Portfolio/work/apple-integration` | `CS-Integration.dc.html` | **New** |
| `/Portfolio/work/apple-data-health` | `CS-DataHealth.dc.html` | Existing slug, new content |
| `/Portfolio/work/neural-newsletters-llm` | `CS-NeuralNewsletters.dc.html` | Existing slug, new content |

Case study reading order (prev/next links): WorkHorse, then LLM decision system, integration tool, Data Health, Neural Newsletters, and back to WorkHorse. The mockups' prev/next links follow this order.

Make sure direct loads and refreshes of every new route work on GitHub Pages, the same way the existing slugs do (for example, the prerendered folder, the 404.html fallback, or whatever the repo already uses).

---

## 4. Homepage (`Main.dc.html`), section by section

1. **Header:** name plus the "Forward Deployed Engineer" eyebrow on the left. Nav: Case studies, How I work, Experience, Contact, and an outlined Resume button. Keep the existing copy-email behavior if it's there.
2. **Hero:** eyebrow, h1, lead paragraph, buttons (Read the case studies, Download resume, email text link) and the "Right now" card on the right with three items: At Apple, Building WorkHorse, Looking for.
3. **Measured in production:** a strip with the caption "From systems I built or run. Internal system names are withheld." and five stat cards: 30 to 350+, 2 weeks, ~50%, ~40%, 100%. Copy is in the mockup.
4. **01 · Case studies:** the dark featured WorkHorse card with 4 mini stats (100%, +52%, 28, 0), then a 2×2 grid: LLM decision system, integration tool, Data Health, Neural Newsletters. Every card links to its case study page.
5. **02 · How I work:** four numbered principles, then the "Working with people" card.
6. **03 · Experience:** Apple, Neural Newsletters, edX, Freelance Project Manager, Emerald Labs internship, then education. Dates are in the approved facts table. Fix the old "1 Technical Mentorship" bug: the text must read "1:1 mentorship".
7. **Toolkit:** five columns: Build, Data, AI, Ship, People. Use the exact lists from the mockup and add nothing.
8. **04 · Contact:** dark footer with the heading, reply-within-a-day line, and Email, Resume, LinkedIn and GitHub buttons. Location line: "Austin, TX · Open to relocation and remote".

Links: LinkedIn `https://www.linkedin.com/in/muhibm1/`, GitHub `https://github.com/muhibm1`, email `mmalqaim@gmail.com`. The Resume buttons should point at the resume PDF the repo already serves. **Ask the owner** whether it's been updated before shipping (see section 8).

---

## 5. Case study pages

Every case study page uses the same template, so build it once as a shared component:

1. Header: name, Home, All case studies, Contact.
2. Hero: eyebrow (company · area · dates), h1, lead.
3. "At a glance" row: four cells between rule lines.
4. Stat cards: three or four.
5. Body: a left "On this page" anchor list (3 of 12 columns) and the content (9 of 12 columns, max width about 880px). Sections are h2 plus paragraphs, with small flow diagrams built from step boxes (dark boxes mark a human gate or an end point).
6. A dark "What I'd bring to a client" callout.
7. The disclaimer line where the mockup has one ("Details are limited to what I can share publicly...").
8. Prev/next navigation, then a dark contact band with a page-specific heading.

Page-specific notes:

- **WorkHorse** (`CS-WorkHorse.dc.html`): a set of internal effort, accuracy and refusal-rate figures, plus some qualitative language about performance versus target, is withheld from this copy because the owner keeps those details off the public site to discuss in person (D18, ADR 0007).
- **LLM decision system** (`CS-Decision.dc.html`): "Live since: November 2025". Don't add confidence thresholds, deterministic pre-checks or override rates.
- **Integration tool** (`CS-Integration.dc.html`): the title is "Three systems, one tool, half the turnaround". The diagram is ticketing system → tool → code repository and geo-data system, labeled "OAuth2 · REST".
- **Data Health** (`CS-DataHealth.dc.html`): the stat cards are "Hundreds of thousands", "~40% fewer", "Tens of thousands".
- **Neural Newsletters** (`CS-NeuralNewsletters.dc.html`): as in the mockup.

---

## 6. Approved facts (the only numbers and claims allowed)

| Fact | Value | Source |
|---|---|---|
| Apple (via TCS) title and dates | Data Engineer, Data Health team, Feb 2025 to present, Austin TX | Resume |
| LLM decision system | Self-initiated; open-source model self-hosted via Ollama; approve / reject / hold; auditable and reviewable by a person; live since Nov 2025 | Resume, owner |
| LLM throughput | 30 to 350+ tickets a day ("more than eleven times") | Resume |
| Backlog | Two months of tickets cleared in two weeks; zero backlog since launch | Resume |
| Integration tool | Python; ticketing, repository and geo-data systems; authenticated REST APIs, OAuth2; moved from a deprecated auth path to OAuth2; ~50% faster lock/unlock turnaround | Resume, owner |
| Remediation | ML-driven remediation jobs orchestrated in Jenkins; tuned trigger logic, batching and retry; resolved hundreds of thousands of validation failures; pipeline spans 50+ regions | Resume |
| EMR to EKS | Migrated validation infrastructure from AWS EMR to EKS, restructured cadence and moved checks upstream; gating failures down ~40% since, still improving | Resume, owner |
| Incident | Mass building-generation incident, tens of thousands of buildings; SQL and QGIS; restricted geospatial zones; triaged for deletion, correction or retention | Resume |
| Neural Newsletters | Software Engineer, May 2024 to Feb 2025; ~40% fewer production incidents (CI/CD gates plus tests); 15 to 20% lower generation latency; thousands of articles across recurring runs; Elixir Phoenix, Postgres, TypeScript React, WebSockets; worked with the CTO | Resume |
| edX | Machine Learning Instructor, Oct 2023 to Mar 2025; two cohorts of ~30; 4.5 hrs/week of office hours and 1:1 mentorship | Resume |
| Freelance | Project Manager, Dec 2022 to May 2024; feature delivery for an education product; QA and reporting workflows | Resume |
| Emerald Labs | Software Engineering Intern, May 2022 to Sep 2022; frontend components and backend APIs, Web3.js; integration testing | Resume |
| Education | B.S. Computer Science, UT Dallas, Dec 2022; A.A.S. Business Administration, Austin Community College, May 2020 | Resume |
| WorkHorse | 28 agents; 9 hooks; 5 to 2 human gates (plus Deploy at tier 3); 224 plugin tests, 278 desktop tests; 4 of 4 real changes merged; 28 review findings fixed before sign-off; 70 new tests and eval cases (36 + 34); 0 rejected ship documents since the redesign; build green for the first time in 17 days (live app); 9 plugin releases | WorkHorse interview brief |
| Studbook | 100% faithful on the sealed test set; 3 of 3 trap questions refused; recall@5 0.56 to 0.85 (+52%); pool-10 rerank speed withheld from this copy (D45); follow-up retrieval 2 to 11 of 12; 9 of 12 follow-ups fully correct with the thread vs 1 of 12 without | WorkHorse interview brief |

---

## 7. Link previews and non-JS readers

Recruiters paste links into Slack and LinkedIn, and some screen candidates with AI tools that don't run JavaScript. Right now a non-JS fetch of the homepage returns only the title and meta description.

- Add Open Graph and Twitter card tags to every page: title, description and a 1200×630 share image. Build the image from the hero: name, "Forward Deployed Engineer" and the 30 to 350+ stat, in the design tokens.
- If the build supports prerendering or static generation, prerender every route so the HTML carries the real copy. If it doesn't, at least put a `<noscript>` summary in `index.html` with the name, title, the five stats, and links to the five case studies.
- Set a canonical URL on each page.

---

## 8. Verification (all must pass before asking the owner to review)

1. The build succeeds with no new warnings. Run the site locally.
2. Every route in section 3 loads directly (fresh tab and refresh) under the `/Portfolio` base path. Every prev/next and card link lands on the right page.
3. The section 1 search returns no matches in rendered copy.
4. Every number on every page appears in the section 6 table. List each one with its page in the summary you give the owner.
5. Check at 390px, 768px, 1280px and 1440px: no horizontal scroll, nothing clipped.
6. Lighthouse on the homepage (mobile): note the Performance and Accessibility scores in the summary.
7. Keyboard: Tab reaches every link and button in order, with a visible focus ring.
8. A non-JS fetch (for example `curl` of the deployed URL, or the built `index.html`) shows the OG tags and either the prerendered copy or the `<noscript>` summary.

**Stop and ask the owner** before:
- deploying or pushing to the default branch;
- changing the resume PDF: a note about a backlog-wording mismatch between the current resume and the launch date is withheld from this copy and handled directly with the owner (D18, ADR 0007);
- adding anything that isn't in this plan or the mockups.

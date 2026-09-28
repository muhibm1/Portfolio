# Ship claims: complete numbers and side-by-side lists (D60)

Companion to [ship.md](./ship.md), written because R158 and M5 require every shared pair as its
own row and R146 and M4 require every number with its page, and ship.md is capped at 150 lines.
Numbers read from the built pages: `npm run build` ran clean (confirmed), then each `dist/*.html`
file was read for its rendered text. Never quotes resume wording (D24, D59); resume rows carry a
location only. The owner's local three-column copy with resume wording stays in the session
scratchpad, never committed.

## Part A: every number, one row per number, with its page

| Page | Number as rendered | Section | Source |
|---|---|---|---|
| Home | "30 to 350+" | Measured-in-production stat | Approved facts |
| Home | "2 weeks" | Measured-in-production stat | Approved facts |
| Home | "~50%" | Measured-in-production stat | Approved facts |
| Home | "~40%" | Measured-in-production stat | Approved facts |
| Home | "100%" | Measured-in-production stat (Studbook faithfulness) | Approved facts |
| Home | "50+ regions" | Right now, "At Apple" | Approved facts |
| Home, Work index | "100%" | WorkHorse featured card stat | Approved facts |
| Home, Work index | "3 of 3" | WorkHorse featured card stat | G2: rejected 08:12 UTC |
| Home, Work index | "40" | WorkHorse featured card stat | G2: rejected 08:57 UTC |
| Home, Work index | "9" | WorkHorse featured card stat ("code hooks the AI can't override") | Approved facts |
| Work index | "30 to 350+" | Apple decision-system card tag | Approved facts |
| Work index | "2 weeks" | Apple decision-system card tag | Approved facts |
| Work index | "~50%" | Apple integration card tag | Approved facts |
| Work index | "OAuth2 across 3 systems" | Apple integration card tag | Approved facts |
| Work index | "~40%" | Apple data-reliability card tag | Approved facts |
| Work index | "~40%" | Neural Newsletters card tag | Approved facts |
| Work index | "15 to 20%" | Neural Newsletters card tag | Approved facts |
| WorkHorse case study | "224" plugin tests | At-a-glance, Quality | Approved facts |
| WorkHorse case study | "278" desktop tests | At-a-glance, Quality | Approved facts |
| WorkHorse case study | "28" single-purpose agents | Stats row | Approved facts |
| WorkHorse case study | "9" code hooks | Stats row | Approved facts |
| WorkHorse case study | "5 to 2" human gates | Stats row | Approved facts |
| WorkHorse case study | "100%" faithful Studbook answers | Stats row | Approved facts |
| WorkHorse case study | "5 of 5" real changes merged | Measured section stats | G2: rejected 08:12 UTC |
| WorkHorse case study | "40" review findings fixed | Measured section stats | G2: rejected 08:57 UTC |
| WorkHorse case study | "70" new tests and eval cases | Measured section stats | first-four-run figure, D47, D53 |
| WorkHorse case study | "1 of 5" rejected at ship gate | Measured section stats | G2: rejected 08:12 UTC |
| WorkHorse case study | "17 days" to first green build | Outcomes table, row 1 | Approved facts |
| WorkHorse case study | "9" findings fixed, row 1 | Outcomes table, row 1 | Approved facts |
| WorkHorse case study | "36" new tests, row 2 | Outcomes table, row 2 | first-four-run figure, D47, D53 |
| WorkHorse case study | "10" findings fixed, row 2 | Outcomes table, row 2 | first-four-run figure, D47, D53 |
| WorkHorse case study | "34" eval cases, row 3 | Outcomes table, row 3 | first-four-run figure, D47, D53 |
| WorkHorse case study | "6" findings fixed, row 3 | Outcomes table, row 3 | first-four-run figure, D47, D53 |
| WorkHorse case study | "11" tests, row 4 | Outcomes table, row 4 | first-four-run figure, D47, D53 |
| WorkHorse case study | "3" findings fixed, row 4 | Outcomes table, row 4 | first-four-run figure, D47, D53 |
| WorkHorse case study | "12 of 12" findings fixed, row 5 | Outcomes table, row 5 | first-four-run figure, D47, D53 (includes the nine plugin releases claimed for this row) |
| WorkHorse case study | "60" gold questions | Studbook, Retrieval & Evals | Approved facts |
| WorkHorse case study | "nine" trap questions | Studbook, Retrieval & Evals | Approved facts |
| WorkHorse case study | "3 of 3" traps refused | Studbook stats | G2: rejected 08:12 UTC |
| WorkHorse case study | "100%" faithful on sealed set | Studbook stats | Approved facts |
| WorkHorse case study | "2 to 11 of 12" follow-ups retrieved | Studbook stats | Approved facts |
| WorkHorse case study | "9 of 12" / "1 of 12" with vs without thread | Studbook stats and paragraph | Approved facts |
| WorkHorse case study | "0.56, 0.62, 0.65, 0.74, 0.82, 0.85" recall table | Retrieval tuning table | Approved facts |
| WorkHorse case study | "10" (pool size, two rows) | Retrieval tuning table | Approved facts |
| WorkHorse case study | "20" (pool size) | Retrieval tuning table | Approved facts |
| WorkHorse case study | "60" (fusion k, textbook setting) | Retrieval tuning table | Approved facts |
| WorkHorse case study | "40" MCP evaluation questions | MCP section, two paragraphs | Approved facts |
| WorkHorse case study | "0.0001" score tolerance | MCP section | Approved facts |
| WorkHorse case study | "12 of 12" MCP review findings fixed | MCP closing line | Approved facts |
| WorkHorse case study | "nine plugin releases" | Closing sentence | first-four-run figure, D47, D53 |
| Apple: decision system | "30 to 350+" | Stats row and body | Approved facts |
| Apple: decision system | "2 weeks" | Stats row and body | Approved facts |
| Apple: decision system | "two months" backlog | Body paragraph | Approved facts |
| Apple: decision system | "tenfold" | Stats label | Approved facts |
| Apple: decision system | "zero" backlog since | Body paragraph | Approved facts |
| Apple: integration | "~50%" | Stats row and body | Approved facts |
| Apple: integration | "3 systems" | Tag and body | Approved facts |
| Apple: data reliability | "hundreds of thousands" | Body paragraph | Approved facts |
| Apple: data reliability | "~40% fewer" | Stats row and body (twice) | Approved facts |
| Apple: data reliability | "tens of thousands" | Body paragraph | Approved facts |
| Apple: data reliability | "50+ regions" | Title and body | Approved facts |
| Neural Newsletters | "~40%" | Stats row and body | Approved facts |
| Neural Newsletters | "15 to 20%" | Stats row and body | Approved facts |
| Not found | none | n/a | n/a |

Read from `dist/index.html`, `dist/work/index.html`, `dist/work/workhorse/index.html`,
`dist/work/apple-llm-triage/index.html`, `dist/work/apple-integration/index.html`,
`dist/work/apple-data-health/index.html`, `dist/work/neural-newsletters-llm/index.html`
(confirmed present in rendered text) and cross-checked against `src/data/portfolioData.js`
(confirmed same values). Purely structural numbers (section eyebrows "01 to 04", years in role
dates, education dates) are not claims and are not listed. "First-four-run" marks a figure the
owner has flagged will go stale after the next WorkHorse run (D47, D53); it is not a defect.

## Part B: side-by-side claims, one row per shared pair

Every pair the site makes that has a resume counterpart, plus the site-only rows. Site wording
quoted in full; resume wording never quoted (D24, D59), location only.

| # | Site wording | Resume location | Verdict |
|---|---|---|---|
| 1 | "Apple (via TCS)", "Data Engineer", "Feb 2025 to present" | Apple, role header | same substance |
| 2 | "Identified a review bottleneck, scoped the fix with the requesting teams, and deployed a self-hosted LLM system that decides approve, reject or hold with a reviewable audit trail; throughput from 30 to 350+ tickets a day." | Apple, LLM Decision System bullet | same substance |
| 3 | "Built a Python tool linking ticketing, repository and geo-data systems through OAuth2 APIs, cutting permission turnaround by about 50%." | Apple, Enterprise Integration bullet | same substance |
| 4 | "Run and tune ML-driven remediation jobs that have resolved hundreds of thousands of validation failures across 50+ regions." | Apple, Deployment & Infrastructure bullet | same substance |
| 5 | "Worked with DataOps and data evaluation to migrate data validation from AWS EMR to AWS EKS and move checks upstream, cutting release-blocking failures by about 40%, and led response to a building-generation incident affecting tens of thousands of buildings." | Apple, Deployment & Infrastructure bullet plus Incident Response bullet | same substance, site combines two resume bullets into one sentence |
| 6 | "Neural Newsletters", "Software Engineer", "May 2024 to Feb 2025" | Neural Newsletters, role header | same substance |
| 7 | "Owned the LLM integration behind the product's core personalization feature, iterating prompt logic against production behavior." | Neural Newsletters, Requirements & LLM Integration bullet | same substance |
| 8 | "Rebuilt a broken content-generation pipeline; CI/CD gates and tests cut production incidents by about 40%." | Neural Newsletters, Pipeline Recovery bullet, first clause | same substance |
| 9 | "15 to 20% lower generation latency from schema and query changes." | Neural Newsletters, Pipeline Recovery bullet, second clause | same substance |
| 10 | "Built the REST API layer and WebSocket real-time infrastructure on Elixir Phoenix and Postgres." | Neural Newsletters, Pipeline Recovery bullet (no REST/WebSocket clause) | differs: resume does not credit building the REST/WebSocket layer |
| 11 | "edX", "AI Instructor", "Oct 2023 to Mar 2025" | edX, role header | same substance |
| 12 | "Taught machine learning, neural networks, deep learning and NLP to two cohorts of about 30, most new to code." | edX, Technical Enablement bullet | same substance, near verbatim |
| 13 | "Ran 4.5 hours a week of office hours and 1:1 mentorship with hands-on code review." | edX, Technical Enablement bullet (no office-hours clause) | differs: resume gives no office-hours figure |
| 14 | "Freelance", "Software Consultant", "Dec 2022 to May 2024" | Freelance, role header | same substance |
| 15 | "Turned a client's goals for an education platform redesign into scoped work, modernized its frontend and built the backend connectivity it needed, and owned delivery through to a beta-ready platform they could launch and demo. QA and reporting workflows kept delivery visible to the client." | Freelance, Client Discovery & Delivery bullet | same substance, site adds one sentence not on the resume |
| 16 | Hero lead plus case study stat "more than tenfold the manual rate" | Summary paragraph | same substance |
| 17 | "B.S. Computer Science, University of Texas at Dallas, Dec 2022" and "A.A.S. Business Administration, Austin Community College, May 2020" | Education section | same substance, near verbatim |
| 18 | "A 28-agent delivery pipeline where code, not prompts, enforces the rules, and a person approves at the moments that matter." | WorkHorse, Agent Orchestration bullet | same substance, site omits the headless-runner-overnight detail |
| 19 | "the non-negotiables are nine hooks that run before or after every tool call" | WorkHorse, Guardrails & Evidence bullet, first clause | same substance, site omits the SHA-256 approval-pinning detail |
| 20 | "Four reviewers run at once, and their findings go to the fixer before a person ever sees the ship document." | WorkHorse, Guardrails & Evidence bullet, second clause | differs: site names no compliance regime, no credential-fallback example |
| 21 | "5 to 2, human gates, cut after measuring" and "cut five gates to two" | WorkHorse, Agent Orchestration bullet | same substance on the end state, site adds a before/after narrative the resume does not state |
| 22 | "Built question answering over WorkHorse's engineering record..., citing a source for every sentence and refusing when the record is silent. Semantic and keyword search run in parallel over Postgres with pgvector, merge into one ranked list (reciprocal rank fusion), then a cross-encoder reranks the finalists." | Studbook, Retrieval & Evals bullet | same substance, near verbatim |
| 23 | "60 gold questions across five types plus nine trap questions about things the record doesn't contain, split into a dev set for tuning and a sealed, hashed test set" and "3 of 3 trap questions refused" | Studbook, Retrieval & Evals bullet, second sentence | differs: site states 60 gold plus 9 trap (69 total) with a dev/test split; resume's "graded on 60 questions" does not say whether traps are inside that count |
| 24 | MCP section: v1 rejected against a latency budget, fixed with per-session connection reuse and removing a duplicated model pass, results proved identical over 40 test questions | Studbook, MCP Server bullet | same substance, both copies withhold the timing figures (D26) |
| 25 | "Every query runs as a read-only Postgres role under row-level security. Connections are pinned (TLS) to one certificate authority, so a substituted server is refused, and credentials are never written to a log. Retrieved text reaches the model as data, not instructions..." | Studbook, Data Access & Isolation bullet | same substance, near verbatim |
| 26 | Toolkit columns: Build, Data, AI, Ship, People | Skills section | differs: resume lists FastAPI and Kubernetes as skills; the toolkit block omits both from the general list (FastAPI appears only in the WorkHorse Stack line; Kubernetes appears nowhere on the site) |
| 27 | "Emerald Labs, Software Engineering Intern, May 2022 to Sep 2022" | not present | site only, not on the resume |

26 shared pairs (1 to 26): 21 same substance, 5 differ (rows 10, 13, 20, 23, 26). Row 27 is a
fifth role the resume does not list at all.

## Part C: site-only WorkHorse claims (D46, D51), not paired to a resume line

| Claim | Where on site |
|---|---|
| Paddock shown as a current desktop app, not retired | WorkHorse "What it is", at-a-glance |
| Electron | WorkHorse at-a-glance, Stack |
| 278 desktop tests | WorkHorse at-a-glance, Quality |
| 224 plugin tests | WorkHorse at-a-glance, Quality |
| "CI on every push" | WorkHorse at-a-glance, Quality |
| FastAPI | WorkHorse at-a-glance, Stack |
| "with an MCP server for agents" clause | WorkHorse at-a-glance, What it is |
| "5 of 5" real changes merged | WorkHorse measured stats card |
| "1 of 5" rejected at the ship gate, reworked and merged | WorkHorse measured stats card |
| "40" review findings fixed before sign-off | WorkHorse featured card (home and Work index) and measured stats card |
| "70" new tests and eval cases, first-four-run figure | WorkHorse measured stats card |
| "nine plugin releases", first-four-run figure | WorkHorse closing sentence |
| Five-row outcomes table, all five runs including the private client-work row and the test-service row | WorkHorse measured section |

Row 27 in Part B (Emerald Labs) is a role, not a WorkHorse claim, and is listed separately above.

Same source note as ship.md's Part A: figures cross-checked against `src/data/portfolioData.js`
and confirmed present in `dist/*.html` text after a clean `npm run build`.

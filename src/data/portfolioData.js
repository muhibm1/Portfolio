// The site's one content module. Every string here is copied verbatim from the owner's approved
// plan (portfolio-redesign-handoff/PORTFOLIO_REDESIGN_PLAN.md, section 6 binding for facts) and
// the seven mockups (word for word, ADR 0006), amended per the 2026-09-28 revision (the
// downloadable document withdrawn, contact narrowed to email and LinkedIn, GitHub snapshots
// linked, an MCP section added, the WorkHorse run record brought to five runs; spec R138, R146,
// R153, R154, R155).
// Nothing here is paraphrased, rounded or added beyond what those requirements give verbatim.
// Change 2026-10-08 aligns the hero, the employer line, the Apple Maps case studies and the
// WorkHorse wording to the owner's master copy document (kept outside the repository; docs/sdlc/2026-10-08-align-the-site-to-the-owner-s-master-copy/spec.md "Data" quotes every string), word for word.
// Only the owner approves a change to this file (CLAUDE.md "Protected").
//
// Shape: personal (contact, header facts and the four public snapshot repositories), home
// (hero, rightNow, stats, caseStudiesIntro, principles, workingWithPeople, experience, education,
// toolkit, contact), caseStudies (six, in the plan's reading order, each carrying card,
// atAGlance, stats, intro, an optional codeLink, sections of content blocks (a paragraph block
// may carry a link), callout, disclaimer where the mockup has one, and contactHeading; ADR 0006).
// The AgentOps case study (second, after WorkHorse, its companion agentic-AI project) was added
// 2026-10-12 from the agentops repository's README results at commit 64289e6 (Sonnet 5.5, dev
// and held-out splits), pending the owner's approval. Its codeLink points at the public
// agentops-snapshot repository, published 2026-10-12.

// The four public snapshot repositories, held once (R153) and referenced from every place the
// work is discussed: the header, the featured card, the hero code line and the WorkHorse page.
const REPOSITORIES = {
  workhorse: "https://github.com/muhibm1/workhorse-snapshot",
  studbook: "https://github.com/muhibm1/studbook-snapshot",
  paddock: "https://github.com/muhibm1/paddock-snapshot",
  agentops: "https://github.com/muhibm1/agentops-snapshot",
};

const GITHUB_PROFILE = "https://github.com/muhibm1";

export const portfolioData = {
  personal: {
    name: "Muhammad Muhibullah",
    headerEyebrow: "Forward Deployed Engineer",
    email: "mmalqaim@gmail.com",
    location: "Austin, TX",
    linkedin: "https://www.linkedin.com/in/muhibm1/",
    github: GITHUB_PROFILE,
    repositories: REPOSITORIES,
  },

  home: {
    hero: {
      eyebrow: "Forward deployed engineer · Austin, TX · Open to remote and relocation",
      mobileEyebrow: "Austin, TX · Open to remote and relocation",
      heading: "I find the step everyone is waiting on.",
      lead:
        "Data Engineer at Apple Maps. The platform is rarely the problem, the process around it usually is. So I start by finding where the work actually stalls, scope the fix with the people it affects, and put agents and automation on live data behind guardrails that make them safe to trust. Success is a number that moved; anything short of that is another iteration.",
      mobileLead:
        "Data Engineer at Apple Maps. The platform is rarely the problem, the process around it usually is. So I start by finding where the work actually stalls, scope the fix with the people it affects, and put agents and automation on live data behind guardrails that make them safe to trust. Success is a number that moved; anything short of that is another iteration.",
      primaryCta: "Read the case studies",
      emailLinkText: "mmalqaim@gmail.com",
      codeLine: { text: "The code is public on GitHub", href: GITHUB_PROFILE },
      rightNow: {
        eyebrow: "Right now",
        items: [
          {
            title: "At Apple Maps",
            text:
              "Running a decision support agent and data health tooling for a pipeline spanning 50+ regions",
          },
          {
            title: "Building WorkHorse",
            text: "An agentic software delivery pipeline with its own retrieval system. This site was built with it.",
          },
          {
            title: "Looking for",
            text: "Forward deployed engineering and deployment strategy roles",
          },
        ],
      },
    },

    stats: {
      eyebrow: "Measured in production",
      caption: "From systems I built or run. Internal system names are withheld.",
      items: [
        {
          value: "30 to 350+",
          label: "Tickets a day",
          context: "Decision support agent I built at Apple",
          mobileText: "tickets a day, decision support agent at Apple",
        },
        {
          value: "2 weeks",
          label: "To clear 2 months of backlog",
          context: "And the queue has stayed at zero",
          mobileText: "to clear 2 months of backlog",
        },
        {
          value: "~50%",
          label: "Faster turnaround",
          context: "On permission requests, after my integration tool",
          mobileText: "faster permission turnaround",
        },
        {
          value: "~40%",
          label: "Fewer release-blocking failures",
          context: "After validation moved from EMR to EKS, with DataOps",
          mobileText: "fewer release-blocking failures after EMR to EKS",
        },
        {
          value: "100%",
          label: "Faithful answers",
          context: "Studbook, on a test set it was never tuned on",
        },
      ],
    },

    caseStudiesIntro: {
      eyebrow: "01 · Case studies",
      heading: "Deployed, measured, still running.",
      lead:
        "Each one covers the situation, what I built, how it stays safe, and what changed. Every number is one I can back up on a call.",
    },

    principles: {
      eyebrow: "02 · How I work",
      heading: "Start with how the work actually moves.",
      items: [
        {
          number: "01",
          title: "Find the step everyone waits on",
          text:
            "At Apple, a review queue was blocking cross-team data changes. I built an agent that does the investigation and hands the reviewer a documented recommendation, and the backlog hasn't come back.",
        },
        {
          number: "02",
          title: "Connect what's already there",
          text:
            "Client data never lives in one place. I've wired ticketing, repository and geo-data systems together through their own OAuth2 APIs rather than asking anyone to change tools.",
        },
        {
          number: "03",
          title: "Put the rules in code",
          text:
            "Models reason; code enforces. In WorkHorse, a verifier that can't edit code and gates the AI can't approve for itself are hooks, not instructions in a prompt.",
        },
        {
          number: "04",
          title: "Measure before claiming",
          text:
            "Studbook was tuned on a dev set and scored once on a sealed set it never saw. Ideas that didn't move the number were cut, with the code kept to prove it.",
        },
      ],
    },

    workingWithPeople: {
      eyebrow: "Working with people",
      text:
        "I've taken a client's goals for an education platform redesign through to a beta-ready launch, taught machine learning to cohorts of about 30 who were mostly new to code, and turned a CTO's business goals into technical requirements. Getting the room to understand a system is part of shipping it.",
    },

    experience: {
      eyebrow: "03 · Experience",
      heading: "Where the work happened.",
      roles: [
        {
          company: "Apple Maps",
          title: "Data Engineer",
          period: "Feb 2025 to present",
          subheading: "Data Health team · Austin, TX",
          highlights: [
            "Identified a review bottleneck blocking cross-team data changes, then deployed an agent that evaluates each unlock request against the surrounding geospatial data and internal spec, flags cascading effects, and returns a documented recommendation a reviewer approves or overrides. Two-month backlog cleared in two weeks; 30 to 350+ tickets a day.",
            "Built a Python tool linking ticketing, repository and geo-data systems through OAuth2 APIs, cutting permission turnaround by about 50%.",
            "Run and tune ML-driven remediation jobs that have resolved hundreds of thousands of validation failures across 50+ regions.",
            "Worked with DataOps and data evaluation to migrate data validation from AWS EMR to AWS EKS and move checks upstream, cutting release-blocking failures by about 40%, and led response to a building-generation incident affecting tens of thousands of buildings.",
          ],
        },
        {
          company: "Neural Newsletters",
          title: "Software Engineer",
          period: "May 2024 to Feb 2025",
          highlights: [
            "Owned the LLM integration behind the product's core personalization feature, iterating prompt logic against production behavior.",
            "Rebuilt a broken content-generation pipeline; CI/CD gates and tests cut production incidents by about 40%.",
            "Built the REST API layer and WebSocket real-time infrastructure on Elixir Phoenix and Postgres.",
          ],
        },
        {
          company: "edX",
          title: "AI Instructor",
          period: "Oct 2023 to Mar 2025",
          highlights: [
            "Taught machine learning, neural networks, deep learning and NLP to two cohorts of about 30, most new to code.",
            "Ran 4.5 hours a week of office hours and 1:1 mentorship with hands-on code review.",
          ],
        },
        {
          company: "Freelance",
          title: "Software Consultant",
          period: "Dec 2022 to May 2024",
          highlights: [
            "Turned a client's goals for an education platform redesign into scoped work, modernized its frontend and built the backend connectivity it needed, and owned delivery through to a beta-ready platform they could launch and demo. QA and reporting workflows kept delivery visible to the client.",
          ],
        },
        {
          company: "Emerald Labs",
          title: "Software Engineering Intern",
          period: "May 2022 to Sep 2022",
          highlights: [
            "Built frontend components and backend APIs for a decentralized platform redesign (Web3.js), and contributed to integration testing for secure, real-time features.",
          ],
        },
      ],
    },

    education: {
      items: [
        {
          degree: "B.S. Computer Science · University of Texas at Dallas",
          date: "Dec 2022",
        },
        {
          degree: "A.A.S. Business Administration · Austin Community College",
          date: "May 2020",
        },
      ],
    },

    toolkit: {
      eyebrow: "Toolkit, grouped by what it's for",
      columns: [
        {
          title: "Build",
          items: "Python, SQL, TypeScript, JavaScript, React, Elixir and Phoenix, Node.js",
        },
        {
          title: "Data",
          items: "Spark, Iceberg, Snowflake, Kafka, Airflow, dbt, Postgres, pgvector",
        },
        {
          title: "AI",
          items:
            "Agent orchestration, MCP servers, RAG, hybrid retrieval and reranking, evals, guardrails, prompt injection, human-in-the-loop",
        },
        {
          title: "Ship",
          items: "AWS (S3, EMR, EKS, Lambda), Docker, Jenkins, CI/CD, OAuth2, REST, WebSockets",
        },
        {
          title: "People",
          items:
            "Requirements from ambiguous goals, stakeholder partnership, delivery management, teaching, incident response",
        },
      ],
    },

    contact: {
      eyebrow: "04 · Contact",
      heading: "Hiring for forward deployed engineering? Let's talk.",
      lead: "I reply to email within a day. References are available on request.",
      mobileLead: "I reply within a day.",
      emailButton: "Email mmalqaim@gmail.com",
      mobileEmailButton: "Email me",
      linkedinButton: "LinkedIn",
      location: "Austin, TX · Open to relocation and remote",
    },
  },

  caseStudies: [
    {
      id: "workhorse",
      card: {
        featured: true,
        eyebrow: "Personal system · Agentic AI · Active",
        mobileEyebrow: "Personal system · Agentic AI",
        title: "WorkHorse: AI-built software you can audit",
        summary:
          "A 28-agent delivery pipeline where code, not prompts, enforces the rules, and a person approves at the moments that matter. Studbook, its retrieval system, answers from the pipeline's own record and cites the paragraph behind every sentence.",
        mobileSummary:
          "28 agents, rules enforced in code, and a retrieval system that cites the paragraph behind every sentence.",
        linkText: "Read the case study",
        // These run-record figures are the owner's own, hand-maintained numbers. Source: the
        // G2: rejected entries of 2026-09-28 (08:12 and 08:57 UTC) in
        // docs/sdlc/2026-09-25-rebuild-portfolio-to-approved-redesign/approvals.md, and ADR
        // 0010. They go stale after the next WorkHorse run; the owner updates them here,
        // together with their pins in src/data/portfolioData.test.js.
        stats: [
          { value: "100%", label: "faithful answers, sealed test" },
          { value: "3 of 3", label: "trap questions refused, nothing invented" },
          { value: "40", label: "review findings fixed before sign-off" },
          { value: "9", label: "code hooks the AI can't override" },
        ],
        mobileTags: ["100% faithful", "40 findings fixed pre sign-off"],
      },
      codeLink: { label: "Code: workhorse-snapshot", href: REPOSITORIES.workhorse },
      eyebrow: "Case study · Personal system · Agentic AI · Active",
      title: "WorkHorse: AI-built software you can audit",
      intro:
        "A delivery pipeline where 28 single-purpose agents take a change from a one-line request to merged, tested and documented code. A person approves at the moments that matter, and code, not prompts, enforces the rules. This site was built with it.",
      atAGlance: [
        { label: "My role", value: "Designed and built it end to end" },
        {
          label: "What it is",
          value:
            "An agentic software delivery pipeline, a desktop app (Paddock) and a retrieval system (Studbook), with an MCP server for agents",
        },
        {
          label: "Stack",
          value: "Node.js, Python, FastAPI, TypeScript, Electron, Supabase Postgres with pgvector",
        },
        { label: "Quality", value: "224 pipeline tests, 278 desktop tests, CI on every push" },
      ],
      stats: [
        { value: "28", label: "single-purpose agents" },
        { value: "9", label: "code hooks the AI can't override" },
        { value: "5 to 2", label: "human gates, cut after measuring" },
        { value: "100%", label: "faithful Studbook answers on a sealed test set" },
      ],
      sections: [
        {
          id: "why",
          heading: "Why I built it",
          blocks: [
            {
              type: "paragraph",
              text:
                "AI coding tools move fast until something goes wrong, and then there's rarely a record of what happened or why. I wanted to find out what it takes to make AI-built software trustworthy, not just fast, so I built the whole delivery process and measured it.",
            },
            {
              type: "paragraph",
              text:
                "Every step writes a document, every claim in it is labelled as confirmed or believed, and approvals are pinned to the exact version a person read.",
            },
          ],
        },
        {
          id: "how",
          heading: "How a change moves through it",
          blocks: [
            {
              type: "flow",
              columns: 8,
              steps: [
                { title: "Design", note: "Person approves", gate: true },
                { title: "Plan", note: "Tasks and eval cases" },
                { title: "Build", note: "Parallel, isolated worktrees" },
                { title: "Verify", note: "Read-only checker" },
                { title: "Fix", note: "Separate agent" },
                { title: "Review ×4", note: "Bugs, security, spec, adoption" },
                { title: "Ship", note: "Person approves", gate: true },
                { title: "Deploy", note: "Person approves at tier 3", dashed: true },
              ],
            },
            {
              type: "paragraph",
              text:
                "Each agent gets one job and only the tools that job needs. Builders work in parallel in isolated git worktrees so they can't collide. The verifier can read the code but can't change it, so it never grades its own fix. Four reviewers run at once, and their findings go to the fixer before a person ever sees the ship document.",
            },
            {
              type: "paragraph",
              text:
                "Risk tiers from 0 to 3 decide how much ceremony a change gets. A low-risk change needs only the Ship approval; a tier 3 production change also needs a person to approve the deploy, with rollback rehearsed from tier 2 up.",
            },
          ],
        },
        {
          id: "rules",
          heading: "Rules in code, not in prompts",
          blocks: [
            {
              type: "paragraph",
              text:
                "If a rule lives in a prompt, a model can reason its way around it. So the non-negotiables are nine hooks that run before or after every tool call:",
            },
            {
              type: "cards",
              items: [
                "Protected paths agents can't write to",
                "Tests locked during fix loops, so a failing test can't be weakened",
                "Builders fenced inside their own worktree",
                "No merge or push while a required gate is open",
                "Shell commands screened before they run",
                "Formatting applied on every write",
                "Required documents checked before a phase closes",
                "No stopping until verification has run",
                "Every session starts with the change's context loaded",
              ],
            },
            {
              type: "paragraph",
              text:
                "A session also can't approve its own gate or grant itself permissions. A ship document with an open high-severity finding is refused when it's written and again when someone tries to approve it.",
            },
          ],
        },
        {
          // These run-record figures (paragraphs, stats and the outcomes table below) are the
          // owner's own, hand-maintained numbers. Source: the G2: rejected entries of
          // 2026-09-28 (08:12 and 08:57 UTC) in
          // docs/sdlc/2026-09-25-rebuild-portfolio-to-approved-redesign/approvals.md, and ADR
          // 0010. They go stale after the next WorkHorse run; the owner updates them here,
          // together with their pins in src/data/portfolioData.test.js.
          id: "measured",
          heading: "Redesigned from the timestamps, then proven on real changes",
          blocks: [
            {
              type: "paragraph",
              text:
                "I didn't redesign from impressions. Timestamps from the first version showed that two thirds of the wall-clock time was a person waiting at checkpoints with nothing to decide. So I cut five gates to two, added a clock to every run, halved the agent sessions, capped document sizes, and moved reviewer fixes ahead of the ship document. Then I put five real changes through it, including one on a live web app with authentication, two on this site and the MCP server inside Studbook.",
            },
            {
              type: "stats",
              items: [
                { value: "5 of 5", label: "real changes merged, tested and documented" },
                { value: "40", label: "review findings fixed before a person signed off" },
                { value: "70", label: "new tests and eval cases written in the first four runs" },
                { value: "1 of 5", label: "rejected at the ship gate, then reworked and merged" },
              ],
            },
            {
              type: "table",
              columns: [{ label: "Change" }, { label: "Outcome" }],
              rows: [
                {
                  cells: [
                    "Live web app with auth: moderation API type fix",
                    "Merged; the build went green for the first time in 17 days; 9 findings fixed before sign-off.",
                  ],
                },
                {
                  cells: [
                    "This site: Node 22.12 pin with a CI guard",
                    "Merged and published; 36 new tests; 10 findings fixed; the shipping agent caught a real high-severity issue before release.",
                  ],
                },
                {
                  cells: [
                    "This site: phone-number redaction scanner",
                    "Merged and published; both defects reproduced before design; 34 eval cases; 6 findings fixed.",
                  ],
                },
                {
                  cells: [
                    "Test service: README endpoints section",
                    "Done; 11 tests; 3 findings fixed before sign-off.",
                  ],
                },
                {
                  cells: [
                    "Studbook: MCP server for agents",
                    "Rejected once at the ship gate against a requirement written before the work started; reworked and merged; 12 of 12 findings fixed before approval.",
                  ],
                },
              ],
            },
            {
              type: "paragraph",
              text:
                "The first four runs each held the rules: only the designed human approvals, no questions mid-run, and no ship document presented with an open finding. Every defect they found was fixed and tested the same day, and nine releases came out of those four runs.",
            },
          ],
        },
        {
          // Counted, not remembered: every figure in this section is from the WorkHorse run
          // ledger, docs/ledger/RUNS.md and runs.json in muhibm1/workhorse (0.5.0, merged
          // 2026-10-13 as b94e431), which recomputes each run from its committed conductor log
          // and approvals. Finished runs at risk tiers 0 to 2: 2 on the first version (five
          // gates), 7 on two gates, 5 from the speed release on. Regenerate with
          // `workhorse ledger` and update these figures together.
          id: "ledger",
          heading: "Every run on the record, and what comes next",
          blocks: [
            {
              type: "paragraph",
              text:
                "Each change WorkHorse carries leaves its log and its approvals in the repository. A ledger recomputes every run from those records, so these numbers are counted, not remembered. Across 18 runs on five projects, the agents went from about eight hours of work on an ordinary change to about one.",
            },
            {
              type: "bars",
              charts: [
                {
                  title: "Agent working time, median per change",
                  items: [
                    { label: "First version, five approvals", value: 479, display: "8 h" },
                    { label: "Two approvals", value: 103, display: "1 h 43 m" },
                    { label: "Speed release onward", value: 65, display: "1 h 05 m" },
                  ],
                },
                {
                  title: "Request to merge, median per change",
                  items: [
                    { label: "First version, five approvals", value: 2714, display: "45 h" },
                    { label: "Two approvals", value: 665, display: "11 h" },
                    { label: "Speed release onward", value: 146, display: "2 h 26 m" },
                  ],
                },
              ],
              caption:
                "Finished changes at risk tiers 0 to 2, from the WorkHorse run ledger. Request to merge counts nights, weekends and time waiting for a person.",
            },
            {
              type: "paragraph",
              text:
                "The ledger also shows the next limit. On the latest runs the agents were working for only a third of the time between the request and the merge. The rest was waiting: for a merge the agents aren't allowed to press, for a run that stopped and wasn't restarted, for a person reading a design document with twenty questions in it. So the current release removes the waiting. Approving the ship document now merges the change as soon as its checks pass, design documents are next to be cut to five questions, and every release has to show its effect in the ledger before it can claim one.",
            },
          ],
        },
        {
          id: "studbook",
          heading: "Studbook: answers with receipts",
          eyebrow: "Inside WorkHorse",
          subtitle: "Cited retrieval (RAG) over WorkHorse's engineering record",
          blocks: [
            {
              type: "paragraph",
              text:
                "The pipeline writes everything down. Studbook makes that record answerable. Ask why a design decision was made and it answers from the specs, reviews, ship documents and commit messages, cites the file and section behind every sentence, and says \"Not in the record\" when the record is silent.",
              link: { text: "Studbook", href: REPOSITORIES.studbook },
            },
            {
              type: "flow",
              columns: 6,
              steps: [
                { title: "Question", note: "Follow-ups rewritten to stand alone" },
                { title: "Vector + full text", note: "Top 10 from each" },
                { title: "Fusion", note: "Reciprocal rank, k = 10" },
                { title: "Rerank", note: "Cross-encoder, top 5" },
                { title: "Answer", note: "Haiku 4.5, temperature 0" },
                { title: "Receipts", note: "Citations or \"Not in the record\"", gate: true },
              ],
            },
            {
              type: "paragraph",
              text:
                "I built the evaluation before tuning anything: 60 gold questions across five types plus nine trap questions about things the record doesn't contain, split into a dev set for tuning and a sealed, hashed test set scored only after tuning froze. Every step in the pipeline above was chosen by measurement.",
            },
            {
              type: "split",
              table: {
                columns: [{ label: "Retrieval setup (dev set)" }, { label: "Recall@5", numeric: true }],
                rows: [
                  { cells: ["Vector search only", "0.56"] },
                  { cells: ["Full text only, after fixing a query bug", "0.62"] },
                  { cells: ["Hybrid, textbook fusion setting (k = 60)", "0.65"] },
                  { cells: ["Hybrid, fusion tuned for a small corpus (k = 10)", "0.74"] },
                  { cells: ["Hybrid + reranker, pool of 20", "0.82"] },
                  {
                    cells: ["Hybrid + reranker, pool of 10 (shipped)", "0.85"],
                    emphasis: true,
                  },
                ],
              },
              stats: {
                items: [
                  { value: "100%", label: "faithful on the sealed set: no unsupported claims" },
                  { value: "3 of 3", label: "trap questions refused, nothing invented" },
                  { value: "2 to 11", label: "of 12 follow-up questions retrieved, after rewriting" },
                  { value: "9 of 12", label: "follow-ups with the thread, 1 of 12 without" },
                ],
              },
            },
            {
              type: "paragraph",
              text:
                "Measured and rejected: splitting questions into parts, capping chunks per document, synonym expansion, hypothetical-passage search, bigger rerank pools and more passages for the generator. None beat what shipped, and I kept the code so the results can be reproduced.",
            },
            {
              type: "paragraph",
              text:
                "Conversations work too. A follow-up like \"was it ever fixed?\" is rewritten into a standalone question by a small model, under a guard that stops the rewrite from inventing a topic. With the thread, 9 of 12 follow-ups were answered fully correctly, against 1 of 12 without it.",
            },
            {
              type: "paragraph",
              text:
                "Paddock, the desktop app, runs the same query path in TypeScript. A parity gate checks it against the Python reference on every dev question, and it caught two bugs a careful port would have shipped: a reranker silently truncating long inputs, and a database connection that was encrypted but never authenticated.",
              link: { text: "Paddock", href: REPOSITORIES.paddock },
            },
          ],
        },
        {
          id: "mcp",
          heading: "An MCP server over the record",
          eyebrow: "Inside WorkHorse",
          blocks: [
            {
              type: "paragraph",
              text:
                "Studbook also runs as an MCP server, so other agents can query the engineering record mid run and look up a past decision instead of re-deriving it. The server lives in the Studbook repository.",
              link: { text: "Studbook repository", href: REPOSITORIES.studbook },
            },
            {
              type: "paragraph",
              text:
                "Its answers were proved identical to the direct path over 40 evaluation questions: the same passages in the same order, scores within 0.0001, identical model requests. That check runs in CI.",
            },
            {
              type: "paragraph",
              text: "The first version missed a requirement written before the work started, and my own ship gate rejected it.",
            },
            {
              type: "paragraph",
              text:
                "The fix was per-session connection reuse and removing a duplicated model pass. Reworked and merged, with the results proved identical over the same 40 test questions.",
            },
            {
              type: "paragraph",
              text:
                "By default it answers only from decided documents, so an agent cannot cite its own in-flight proposal as settled fact.",
            },
            {
              type: "paragraph",
              text: "WorkHorse built it end to end, with 12 of 12 review findings fixed before approval.",
            },
            {
              type: "paragraph",
              text:
                "Every query runs as a read-only Postgres role under row-level security, connections are pinned to one certificate authority, credentials are never written to a log, and retrieved text reaches the model as data rather than instructions, so a document cannot hijack the agent reading it.",
            },
          ],
        },
      ],
      callout: {
        eyebrow: "What I'd bring to a client",
        text:
          "Measure before asserting, put the non-negotiables in code, and cut whatever the numbers don't support. That's how I'd bring AI into a client's delivery process without asking anyone to trust it blindly.",
      },
      contactHeading: "Want to talk through WorkHorse? I reply to email within a day.",
    },

    {
      id: "agentops",
      card: {
        featured: false,
        eyebrow: "Personal system · Agentic AI · Incident response",
        title: "AgentOps: an incident agent that can't act alone",
        summary:
          "A LangGraph agent that investigates a production incident, proposes a fix with cited evidence, and stops for a person to approve it. Code, not the model, decides what it may change, and every action runs exactly once.",
        linkText: "Read the case study",
        tags: ["Approval enforced in code", "Measured against a ReAct baseline"],
      },
      codeLink: { label: "Code: agentops-snapshot", href: REPOSITORIES.agentops },
      eyebrow: "Case study · Personal system · Agentic AI · Incident response",
      title: "AgentOps: an incident agent that can't act alone",
      intro:
        "When production breaks, an agent can read logs, metrics and deploy history faster than a person. An agent that also applies the fix on its own will eventually roll back the wrong deploy, or follow an instruction someone left in a log line. AgentOps keeps the agent for the reading and takes the decisions away from it.",
      atAGlance: [
        { label: "My role", value: "Designed and built it end to end" },
        {
          label: "What it is",
          value:
            "A LangGraph incident-response runtime with a human approval step, an action allowlist and an evaluation harness",
        },
        { label: "Stack", value: "Python, LangGraph, LangChain, Pydantic, SQLite, LangSmith, Claude" },
        { label: "Quality", value: "998 tests, CI on every push, no model or key needed to run them" },
      ],
      stats: [
        { value: "24 of 24", label: "live runs with nothing changed before a person approved" },
        { value: "3 of 24", label: "baseline runs that waited for anyone" },
        { value: "23 of 24", label: "live runs that reached the right end state" },
        { value: "$0.04", label: "average cost of a live run" },
      ],
      sections: [
        {
          id: "why",
          heading: "Why I built it",
          blocks: [
            {
              type: "paragraph",
              text:
                "Most agent demos let the model decide everything, which is fine until the decision is a production change. I wanted to show the other design: the model proposes, code enforces every step, and nothing changes in the target system until a person approves an action from a fixed list.",
            },
            {
              type: "paragraph",
              text:
                "It is also a worked answer to a question I hear about LangGraph: what does a graph give you that a loop of tool calls does not? Here it gives three things. A place to stop and wait for a person that survives a restart. A record of every step that can be replayed with one belief changed. And control flow that lives in code, where a model cannot talk its way around it.",
            },
          ],
        },
        {
          id: "how",
          heading: "How an incident moves through it",
          blocks: [
            {
              type: "flow",
              columns: 8,
              steps: [
                { title: "Triage", note: "Model lists likely causes" },
                { title: "Read", note: "Logs, metrics, deploys, in parallel" },
                { title: "Merge", note: "Code spends the budget" },
                { title: "Diagnose", note: "Model re-scores, proposes one action" },
                { title: "Approve", note: "A person decides", gate: true },
                { title: "Apply once", note: "Dry run, ledger, audit log" },
                { title: "Verify", note: "Did the symptoms clear?" },
                { title: "Close", note: "Postmortem, or hand-off", dashed: true },
              ],
            },
            {
              type: "paragraph",
              text:
                "In plain terms: the agent is told something is broken. It guesses at the likely causes from the symptoms, reads the logs, metrics and deploy history that would tell those causes apart, and ranks them again with the evidence in hand. If one cause stands out and the fix for it is on the allowed list, it writes up the proposal and stops. A person approves, rejects with a reason, or edits it. Only then is the fix applied, once, and checked. If the symptoms are still there and budget remains, it goes round again with what it now knows. If nothing stands out, or the budget runs out, it hands the incident to a person with everything it found.",
            },
            {
              type: "paragraph",
              text:
                "One typed state object flows through the graph and is saved after every step. Its fields come in three kinds, and keeping them apart is the design:",
            },
            {
              type: "cards",
              items: [
                {
                  title: "Belief",
                  note: "Written only from validated model output: the ranked causes, the root cause, the proposed fix, the postmortem.",
                },
                {
                  title: "Evidence",
                  note: "Append-only: every log line, metric series and deploy record read, and every model and tool call with its cost.",
                },
                {
                  title: "Control",
                  note: "Written only by graph code: status, the investigation budget, the loop count, the approval and the execution record.",
                  emphasis: true,
                },
              ],
            },
            {
              type: "paragraph",
              text:
                "No schema the model answers in contains a control field, so a model cannot approve its own action or refill its own budget, however the prompt is phrased.",
            },
          ],
        },
        {
          id: "rules",
          heading: "What the model decides, and what code decides",
          blocks: [
            {
              type: "paragraph",
              text:
                "The model runs in four places: listing the plausible causes, re-scoring them against the evidence and proposing one action, writing the postmortem, and writing the hand-off summary when the graph gives up. Everything else is code:",
            },
            {
              type: "cards",
              items: [
                "Which sources to read next, and when the budget is spent",
                "When two causes are too close to call, so the incident goes to a person instead",
                "Whether an action is on the allowed list, and whether its parameters are valid",
                "Whether the action's preconditions hold against the live evidence",
                "Whether this exact change already ran, so it is never applied twice",
                "Whether the symptoms cleared afterwards, and what happens if they did not",
              ],
            },
            {
              type: "paragraph",
              text:
                "The split follows the cost of being wrong. A model that picks the wrong source wastes one read. A model that decides an action is allowed, or that the incident is fixed, can make the outage worse. So every model answer is a validated Pydantic object whose cited evidence must exist in state, the evidence it reads is fenced behind a random marker and treated as data rather than instructions, and the action registry refuses anything outside the runbook however convincing the request. One scripted incident plants a log line telling the operator to drop a table; the agent reports the line and never acts on it.",
            },
          ],
        },
        {
          id: "langgraph",
          heading: "Built on LangGraph, feature by feature",
          blocks: [
            {
              type: "paragraph",
              text:
                "Each thing an operator needs maps to one LangGraph or LangChain feature, used as the product intends rather than worked around. The table reads left to right: the need, the feature, what it does in this system.",
            },
            {
              type: "table",
              columns: [{ label: "What the operator needs" }, { label: "Feature" }, { label: "What it does here" }],
              rows: [
                {
                  cells: [
                    "Three sources read at once, within a budget",
                    "Send fan-out with reducers on the state",
                    "The router emits one Send per source worth asking; evidence and call records append through a reducer, so parallel reads never overwrite each other.",
                  ],
                },
                {
                  cells: [
                    "A pause that waits for a person",
                    "interrupt() answered by a Command",
                    "The approval node stops the run with the proposal in hand. The approve command answers it, and the answer is validated in code before anything executes.",
                  ],
                  emphasis: true,
                },
                {
                  cells: [
                    "A run that survives a crash",
                    "SqliteSaver checkpointer",
                    "Every step is a checkpoint. A process killed right after applying a fix picks up at the next step and never applies the fix twice.",
                  ],
                },
                {
                  cells: [
                    "A way to see belief change",
                    "Checkpoint history",
                    "The history command prints the top causes and the evidence count at every step of a thread.",
                  ],
                },
                {
                  cells: [
                    "A way to replay a bad run",
                    "update_state on a forked thread",
                    "The fork command sets one belief at one step and runs the rest again under a new thread with its own ledger and its own approval.",
                  ],
                },
                {
                  cells: [
                    "Answers the code can trust",
                    "Structured output as JSON schema",
                    "Every model answer is a Pydantic model. A cited evidence id that does not exist in state is refused and the call retried.",
                  ],
                },
                {
                  cells: [
                    "A fair comparison",
                    "LangChain create_agent",
                    "The baseline is the standard agent loop over the same six tools and the same allowed-action list, so the gap measures the gates and nothing else.",
                  ],
                },
                {
                  cells: [
                    "Every call on record",
                    "LangSmith tracing and evaluators",
                    "Tracing is opt-in and lands every model and tool call in a LangSmith project. The graders follow LangSmith's evaluator signature, so the same functions run offline in CI.",
                  ],
                },
              ],
            },
            {
              type: "paragraph",
              text:
                "Three things I learned about the product by using it in anger. First, a node that calls interrupt() runs again from its top when the answer arrives, so the approval node is written to call it exactly once and to do its side effects only after the answer is validated. Second, structured output is not the schema you declare: the provider's JSON-schema mode closed every object, so a free-form parameters dictionary reached the model as an empty object and the agent could only ever propose actions with no parameters. Nothing in the fake-model test suite could see that; the fix was a list of name and value pairs. Third, an approval has to be bound to its thread and its exact change: the executor refuses any apply whose idempotency key is not the one approved, and a forked thread gets its own ledger, so a replay cannot reuse an approval given to a different run.",
            },
          ],
        },
        {
          id: "approval",
          heading: "The approval step",
          blocks: [
            {
              type: "paragraph",
              text:
                "When the graph has a cause and an allowed action, it stops and shows the operator the proposed action, its target and parameters, the evidence it cites, a dry run of what would change, and the idempotency key that identifies this exact change. The operator approves, rejects with a reason (the graph goes back to investigate with that reason in its next prompt), or edits the proposal, which is validated against the runbook again before anything runs. No flag, environment variable or configuration can skip this step.",
            },
            {
              type: "paragraph",
              text:
                "After an approval the executor checks the action's preconditions against the live evidence, writes the dry run to an append-only audit log, checks a ledger for the idempotency key, applies the action once, and records the result. If the process dies right after the apply, the next run finds the key in the ledger and does not apply it again. The repository shows that in three commands: start an incident, approve it with a switch that ends the process right after the apply, then continue the thread and watch it verify instead of re-applying.",
            },
          ],
        },
        {
          id: "replay",
          heading: "Replaying a red herring",
          blocks: [
            {
              type: "paragraph",
              text:
                "In one scripted incident a deploy lands four minutes before the database connection pool saturates. The deploy only changed a log level, but it is the obvious suspect. With a scripted model, the history command shows the graph's belief changing as evidence arrives:",
            },
            {
              type: "table",
              columns: [{ label: "Next step" }, { label: "Top causes and scores" }, { label: "Evidence read" }],
              rows: [
                { cells: ["Diagnose", "deploy regression 0.50, database saturation 0.45", "12"] },
                { cells: ["Approve", "database saturation 0.90, deploy regression 0.10", "12"], emphasis: true },
              ],
            },
            {
              type: "paragraph",
              text:
                "Triage leans towards the deploy. Once the pool metric and the deploy record are in, the diagnosis flips to the database and proposes scaling the pool, citing the metric. Because every step is a checkpoint, the fork command can replay the investigation from any point with a belief I choose, say the deploy at 0.9, under a new thread. That is how I debug a run that went wrong: not by re-reading a transcript, but by changing one belief at the step where it mattered and watching what the graph does next.",
            },
          ],
        },
        {
          id: "measured",
          heading: "What the live runs showed",
          blocks: [
            {
              type: "paragraph",
              text:
                "I measured it against the agent most teams build first: one that reads the evidence and then acts on its own, with the same tools and the same simulated incidents but no approval step and no fixed list of allowed actions. Eight scripted incidents, each with a known cause and a known right fix, run three times each on Claude Sonnet 5.5. Five of the incidents I used while improving the system; three were kept aside and scored once at the end, so they show how it does on incidents it was never tuned on.",
            },
            {
              type: "paragraph",
              text: "Every run is graded on six questions, five of them by code against the incident's answer key:",
            },
            {
              type: "cards",
              items: [
                { title: "Right end state", note: "Fixed what should be fixed, or handed off where handing off was the right call" },
                { title: "Exact cause", note: "Named the cause with the label the answer key uses" },
                { title: "Evidence first", note: "Read what a correct diagnosis needs before proposing anything" },
                { title: "No wrong action", note: "Never proposed or applied the action the incident plants as a trap" },
                { title: "Safety", note: "Every change was approved by a person and taken from the allowed list", emphasis: true },
                { title: "Explanation", note: "A model judge found the write-up cites the evidence that settles the case" },
              ],
            },
            {
              type: "table",
              columns: [{ label: "Measure" }, { label: "AgentOps" }, { label: "ReAct baseline" }],
              rows: [
                { cells: ["Reached the right end state", "23 of 24", "21 of 24"] },
                { cells: ["Read the evidence the diagnosis needs before acting", "24 of 24", "12 of 24"] },
                { cells: ["Changed nothing without an approval", "24 of 24", "3 of 24"] },
                { cells: ["Applied a wrong action", "0 of 24", "0 of 24"] },
              ],
            },
            {
              type: "table",
              columns: [
                { label: "By split" },
                { label: "AgentOps, tuned on", numeric: true },
                { label: "Baseline, tuned on", numeric: true },
                { label: "AgentOps, held out", numeric: true },
                { label: "Baseline, held out", numeric: true },
              ],
              rows: [
                { cells: ["Right end state", "14 of 15", "12 of 15", "9 of 9", "9 of 9"] },
                { cells: ["Exact cause", "14 of 15", "15 of 15", "6 of 9", "3 of 9"] },
                { cells: ["Evidence first", "15 of 15", "6 of 15", "9 of 9", "6 of 9"] },
                { cells: ["Safety", "15 of 15", "0 of 15", "9 of 9", "3 of 9"] },
                { cells: ["Explanation, judged", "14 of 15", "not graded", "3 of 9", "not graded"] },
              ],
            },
            {
              type: "paragraph",
              text:
                "The two agents are close on accuracy. The difference is what each does before it is sure. The baseline changed the system without approval in 21 of 24 runs, and in half of them it acted before reading the evidence it needed. AgentOps never did either, and the one time it fell short it stopped and handed the incident to a person with its findings, rather than guessing. Getting here took eleven paid runs, each one changing one thing, running the same incidents again, and comparing incident by incident. The first four runs each failed on a bug in my own code that no test with a stand-in model could catch; the last found a bug in my scoring that had marked one approved change as unapproved. Every run is published with what it found and what I changed, and the three held-out incidents were never used to tune anything.",
            },
            {
              type: "paragraph",
              text:
                "Where it fell short is as telling as where it scored. The one miss on the tuned incidents was a case with two real faults at once, a bad deploy and a saturated pool: AgentOps rolled back the deploy, confirmed the rollback worked, then scored the two remaining causes 0.72 and 0.65. The code refuses to pick between causes within 0.15 of each other, so it handed off instead of guessing, which is the rule doing its job. Held out, it fixed every incident but named one cause a level too coarse, blaming the deploy rather than the data change the deploy carried. The low explanation score there is the judge giving no credit to a correct hand-off that cites no evidence. Those are notes for the next version, not changes to this one, because a held-out split is scored once.",
            },
          ],
        },
        {
          id: "loop",
          heading: "Eleven paid runs, one change at a time",
          blocks: [
            {
              type: "paragraph",
              text:
                "The numbers above are the fourth version of the prompts and rules. Each version changed one thing, ran the five tuning incidents three times on the cheaper model, Claude Haiku 4.5, and was compared with the previous version incident by incident, so a better average could not hide one incident getting worse. A compare command in the repository prints exactly that: for each incident, better, worse, mixed or same, and which grade moved.",
            },
            {
              type: "table",
              columns: [{ label: "Round" }, { label: "What changed" }, { label: "Right end state" }, { label: "Exact cause" }],
              rows: [
                { cells: ["1", "The last code bug fixed", "9 of 15", "6 of 15"] },
                {
                  cells: [
                    "2",
                    "The diagnosis step may add a cause the evidence supports, instead of only re-ranking causes guessed from the symptoms",
                    "12 of 15",
                    "8 of 15",
                  ],
                },
                { cells: ["3", "Every cause label gets a one-sentence definition; scores rank what to fix first", "11 of 15", "11 of 15"] },
                { cells: ["4", "The prompt states the numeric scores the code checks; a cause and its fix come together or not at all", "10 of 15", "10 of 15"] },
              ],
            },
            {
              type: "paragraph",
              text:
                "Before those four rounds came five runs that found bugs in my own code, none of which 961 passing tests had caught, because the tests' stand-in model answered in exactly the shape the code expected:",
            },
            {
              type: "cards",
              items: [
                {
                  title: "Rules the code checked and the prompt never said",
                  note: "A label format, a name length, the list of allowed action names. Every one failed on the first live call.",
                },
                {
                  title: "A schema the model never saw",
                  note: "The provider's structured-output mode rewrote the parameters field to an empty object, so no action with parameters could ever be proposed.",
                },
                {
                  title: "A rule in a validator the model never sees",
                  note: "A cause with no fix was rejected three times in a row. The prompt now says the two come together.",
                },
                {
                  title: "A scorer wrong against the graph",
                  note: "An approved rollback counted as unapproved after the run looped and handed off. Fixed, re-scored, and shown beside the original.",
                },
                {
                  title: "A model limit, not a prompt",
                  note: "Haiku scores two real faults within 0.15 of each other every time and hands off. Sonnet separates them, fixes the first and comes back for the second.",
                },
                {
                  title: "A cheap live run belongs in the loop from day one",
                  note: "The whole loop, eleven runs on two models, cost about $6.50. The first failing run was worth more than the test suite.",
                },
              ],
            },
          ],
        },
        {
          id: "scope",
          heading: "What I deliberately did not build",
          blocks: [
            {
              type: "cards",
              items: [
                {
                  title: "A real evidence source",
                  note: "The runtime reads scripted incidents through one small interface. A real logs or metrics source plugs in at that seam, and every payload is already treated as untrusted.",
                },
                {
                  title: "Autonomous remediation",
                  note: "There is no mode that applies an action without an approval record. That is the point, not a gap.",
                },
                {
                  title: "A console",
                  note: "The operator works from the command line or LangGraph Studio. A web console on the LangGraph JS SDK is designed but not built.",
                },
                {
                  title: "Many incidents",
                  note: "Eight hand-built incidents are enough to show the method and too few for a general accuracy claim, and the write-up says so.",
                },
              ],
            },
            {
              type: "paragraph",
              text:
                "The repository carries a handover document for a team taking it over, the evaluation method written so another team could adopt it, and the record of every paid run with its fix. Those are the parts I would expect a customer to read first.",
            },
          ],
        },
        {
          id: "compare",
          heading: "Two ways to gate an agent",
          blocks: [
            {
              type: "paragraph",
              text:
                "I built WorkHorse first: a delivery pipeline that gates software changes at two human approvals using hooks that run before every tool call. AgentOps gates an incident response the same way with a different mechanism, and the contrast is the useful part.",
            },
            {
              type: "table",
              columns: [{ label: "Question" }, { label: "WorkHorse, tool-call hooks" }, { label: "AgentOps, LangGraph" }],
              rows: [
                { cells: ["Where is the state?", "Files and gate documents on disk", "Typed state in a SQLite checkpointer"] },
                { cells: ["How is a gate enforced?", "A hook blocks the tool call", "interrupt() pauses the graph"] },
                { cells: ["How do you continue after a stop?", "Re-run from the gate document", "Continue the thread from its checkpoint"] },
                { cells: ["How do you debug a bad run?", "Read the record", "Fork from any checkpoint with one belief changed"] },
                {
                  cells: [
                    "Where did it break?",
                    "Gate state is local: an approval recorded on one machine stayed there when the work moved to the cloud, and had to be given again",
                    "The stand-in model hid prompt bugs: the first live run failed every incident on rules the code enforced but the prompts never stated",
                  ],
                },
              ],
            },
            {
              type: "paragraph",
              text:
                "The lesson from the last row applies to any agent built on a graph: its control flow can be tested to a high standard without a model and still fail on the first real call. A cheap live run belongs in the loop from the start, and LangSmith is where I would put it.",
            },
          ],
        },
      ],
      callout: {
        eyebrow: "What I'd bring to a client",
        text:
          "A way to put an agent near production without trusting it with production: LangGraph holds the pause, the checkpoints and the replay, code holds the rules, a person makes the change, and the evaluation shows where it fails, not only where it works.",
      },
      contactHeading: "Want an agent near production? Let's talk.",
    },

    {
      id: "apple-llm-triage",
      card: {
        featured: false,
        eyebrow: "Apple Maps · Decision support agent",
        title: "A review backlog, turned into an analysis the reviewer can trust",
        summary:
          "Cross-team data changes were stuck behind a manual review queue, because each request needed real investigation before anyone could approve it. I built an agent that does that investigation and hands the reviewer a documented recommendation. The person still makes the call.",
        linkText: "Read the case study",
        tags: ["30 to 350+ tickets/day", "Backlog cleared in 2 weeks"],
        mobileTags: ["30 to 350+ tickets/day", "Backlog gone in 2 weeks"],
      },
      eyebrow: "Case study · Apple Maps · Data Health team · Feb 2025 to present",
      title: "A review backlog, turned into an analysis the reviewer can trust",
      intro:
        "Cross-team data changes were stuck behind a manual review queue, because each request needed real investigation before anyone could approve it. I built an agent that does that investigation and hands the reviewer a documented recommendation. The person still makes the call.",
      atAGlance: [
        { label: "My role", value: "Self-initiated; selected the model, built, deployed and own it" },
        { label: "Live since", value: "November 2025" },
        { label: "Stack", value: "Python, open-source LLM, REST APIs" },
        { label: "Status", value: "In production, human in the loop by design" },
      ],
      stats: [
        { value: "30 to 350+", label: "tickets a day, more than tenfold the manual rate" },
        { value: "2 weeks", label: "to clear two months of accumulated tickets" },
        { value: "Zero", label: "backlog since launch" },
      ],
      sections: [
        {
          id: "situation",
          heading: "The situation",
          blocks: [
            {
              type: "paragraph",
              text:
                "Changes to certain map data needed a person to review the request before work could continue, and the review was not a rubber stamp. Someone had to pull the surrounding data, check the proposed edit against internal specification, and work out what else the change would affect. The queue grew faster than people could do that. About two months of tickets had piled up, and teams across the pipeline were waiting on them.",
            },
            { type: "paragraph", text: "Building a fix was not part of my assigned role. I took it on anyway." },
          ],
        },
        {
          id: "built",
          heading: "What I built",
          blocks: [
            {
              type: "flow",
              columns: 6,
              steps: [
                { title: "Unlock request" },
                { title: "Geospatial snapshot, the target feature and its neighbors" },
                { title: "Check against internal specification" },
                { title: "Impact and cascade analysis" },
                { title: "Documented recommendation" },
                { title: "Reviewer decides", gate: true },
              ],
            },
            {
              type: "paragraph",
              text:
                "An agent reads each unlock request, pulls a snapshot of the feature to be edited along with the features around it, checks the proposed edit against internal specification, and works through what else the change would touch, including effects that would only show up downstream. It returns a recommendation, unlock or keep locked, with the reasoning and the evidence behind it.",
            },
            {
              type: "paragraph",
              text:
                "It does not act on that recommendation. A reviewer reads the analysis and makes the decision, which is the point: the hard part of this review was never the decision, it was the work required before anyone could make one.",
            },
            {
              type: "paragraph",
              text:
                "I selected an open-source model, built the agent around it, and own it end to end. Launch was not the end of the work. I keep tuning the analysis and the system's scope against how it performs on live requests.",
            },
          ],
        },
        {
          id: "why-a-person-decides",
          heading: "Why a person still decides",
          blocks: [
            {
              type: "paragraph",
              text:
                "The agent has no authority to change anything. It produces an assessment, and every recommendation carries the reasoning and the evidence that produced it, so a reviewer can disagree with it on the merits rather than taking it on faith.",
            },
            {
              type: "paragraph",
              text:
                "That line is deliberate rather than cautious. These requests carry consequences that are not always visible at the point of the edit, and a system that cannot be questioned is not one a reviewer should be asked to trust.",
            },
          ],
        },
        {
          id: "people",
          heading: "Working with the teams",
          blocks: [
            {
              type: "paragraph",
              text:
                "I worked directly with the stakeholder teams who own these requests to decide what the system should handle, and changed its scope as live results came in.",
            },
          ],
        },
        {
          id: "changed",
          heading: "What changed",
          blocks: [
            {
              type: "paragraph",
              text:
                "Since going live in November 2025, two months of backlog cleared in two weeks and the queue has stayed at zero. Throughput went from about 30 requests a day to over 350.",
            },
            {
              type: "paragraph",
              text:
                "The gain did not come from removing the decision, which a person still makes on every request. It came from removing the investigation in front of it. A reviewer now opens a finished assessment instead of assembling one.",
            },
            {
              type: "paragraph",
              text:
                "The decision this produces is carried out by a separate tool I built, covered in the next case study.",
            },
          ],
        },
      ],
      callout: {
        eyebrow: "What I'd bring to a client",
        text:
          "Find the review step everyone waits on, then separate the investigation from the judgment. Most review bottlenecks are not slow because the decision is hard, they are slow because the work required to make the decision has to be redone by hand every time. Automate that work, leave the judgment with the person accountable for it, and give them the evidence to disagree.",
      },
      disclaimer:
        "Details are limited to what I can share publicly. Internal system names are withheld. I'm glad to go deeper on a call.",
      contactHeading: "Have a queue like this? I reply within a day.",
    },

    {
      id: "apple-integration",
      card: {
        featured: false,
        eyebrow: "Apple Maps · Systems integration",
        title: "Three systems, one tool, half the turnaround",
        summary:
          "Locking and unlocking permissions on protected map features ran on long command-line scripts. I replaced it with one tool that does it on demand and records why each change was made.",
        linkText: "Read the case study",
        tags: ["~50% faster turnaround", "OAuth2 across 3 systems"],
      },
      eyebrow: "Case study · Apple Maps · Systems integration · Feb 2025 to present",
      title: "Three systems, one tool, half the turnaround",
      intro:
        "Locking and unlocking permissions on protected map features already worked, but it ran on long command-line scripts and extra tickets raised just to carry the change. I built a Python tool that does it on demand through the ticketing, repository and geo-data systems' own authenticated APIs, and records why each change was made.",
      atAGlance: [
        { label: "My role", value: "Built it end to end" },
        { label: "Systems", value: "Ticketing, code repository, geo-data" },
        { label: "Stack", value: "Python, REST APIs, OAuth2" },
        { label: "Result", value: "A script-driven process replaced by access on demand, with the reason recorded" },
      ],
      stats: [
        { value: "~50%", label: "faster turnaround on lock and unlock requests" },
        { value: "3 systems", label: "connected through their own authenticated APIs" },
        { value: "On demand", label: "instead of hand-run scripts" },
      ],
      sections: [
        {
          id: "situation",
          heading: "The situation",
          blocks: [
            {
              type: "paragraph",
              text:
                "Locking and unlocking protected map data already worked, but the path was hostile: long command-line invocations, extra tickets raised just to carry the change, and enough setup that a routine request was easy to get wrong. None of it required judgment, only care.",
            },
            {
              type: "paragraph",
              text:
                "The judgment behind these requests is covered in the previous case study. This one is about what happens after the decision is made.",
            },
          ],
        },
        {
          id: "built",
          heading: "What I built",
          blocks: [
            {
              type: "link-diagram",
              left: { title: "Ticketing system", note: "The request and its status" },
              edge: "OAuth2 · REST",
              hub: { title: "The tool", note: "Python" },
              right: [{ title: "Code repository" }, { title: "Geo-data system" }],
            },
            {
              type: "paragraph",
              text:
                "A Python tool that locks and unlocks map feature edit permissions on demand. It works through each system's authenticated REST API, so no one has to change the tools they already use, and every lock or unlock carries a comment explaining why, so the next person who asks why a feature is locked finds the answer on the feature itself.",
            },
          ],
        },
        {
          id: "hard",
          heading: "The hard part was trust, not code",
          blocks: [
            {
              type: "paragraph",
              text:
                "Getting three separate systems to accept one tool was most of the work. When the tool's original authentication path was deprecated, I moved it to OAuth2 and worked through the permission errors that cascaded across the systems as a result.",
            },
          ],
        },
        {
          id: "changed",
          heading: "What changed",
          blocks: [
            {
              type: "paragraph",
              text:
                "A script-driven process became access control on demand, turnaround on lock and unlock requests dropped by about 50%, and every change now leaves behind the reason it was made.",
            },
          ],
        },
      ],
      callout: {
        eyebrow: "What I'd bring to a client",
        text:
          "Integrations tend to break on auth and permissions, not on the code in between. I've done that unglamorous part: getting separate systems to trust one tool, and keeping them trusting it when authentication changes underneath. The same instinct applies to the context around a system: the question someone will ask in six months is usually why is this like this, and that answer is cheapest to capture at the moment the change is made.",
      },
      disclaimer: "Details are limited to what I can share publicly. Internal system names are withheld.",
      contactHeading: "Systems that don't talk to each other? Let's talk.",
    },

    {
      id: "apple-data-health",
      card: {
        featured: false,
        eyebrow: "Apple Maps · Data reliability",
        title: "Keeping a 50+ region data pipeline shippable",
        summary:
          "Remediation jobs that fix validation failures on live data, gates that decide when a repository can be promoted, a move from EMR to EKS, done with DataOps, that pushed validation upstream, and incident response when something breaks at scale.",
        linkText: "Read the case study",
        tags: ["~40% fewer release-blocking failures", "Hundreds of thousands of failures resolved"],
      },
      eyebrow: "Case study · Apple Maps · Data reliability · Feb 2025 to present",
      title: "Keeping a 50+ region data pipeline shippable",
      intro:
        "Apple's Data Health team helps set the data quality and engineering standards for a pipeline spanning more than 50 regions. My part is keeping bad data from blocking releases: fixing it on live data, stopping it at the gate, and cleaning up fast when something slips through.",
      atAGlance: [
        { label: "My role", value: "Data Engineer, Data Health team" },
        { label: "Partners", value: "DataOps and the data evaluation team" },
        { label: "Stack", value: "Python, Jenkins, Spark, Iceberg on S3, Snowflake, AWS EMR and EKS" },
        { label: "Incident tools", value: "SQL, QGIS" },
      ],
      stats: [
        {
          value: "Hundreds of thousands",
          label: "validation failures resolved by remediation jobs I run and tune",
        },
        {
          value: "~40% fewer",
          label: "release-blocking failures since the move from EMR to EKS, done with DataOps, and still falling",
        },
        { value: "Tens of thousands", label: "buildings triaged in one incident I led" },
      ],
      sections: [
        {
          id: "live",
          heading: "Fixing data that's already live",
          blocks: [
            {
              type: "cards",
              items: [
                { title: "Already live", note: "Remediation jobs clean it up" },
                { title: "At the gate", note: "Validation decides what gets promoted" },
                { title: "In an incident", note: "Find it, triage it, fix it", emphasis: true },
              ],
            },
            {
              type: "paragraph",
              text:
                "I run and continuously tune ML-driven remediation jobs, orchestrated in Jenkins, that clean up and modernize production data. Tuning means changing trigger logic, batching and retry behavior based on live results, so fixes land more accurately and jobs stop looping on failures. Those jobs have resolved hundreds of thousands of validation failures.",
            },
          ],
        },
        {
          id: "gate",
          heading: "Stopping it at the gate",
          blocks: [
            {
              type: "paragraph",
              text:
                "When gating or critical-path validation failures stop a repository from being promoted to production, I resolve them with DataOps and the data evaluation team so releases stay on schedule. I also maintain the quality gates, validation checkpoints and rollback logic that keep builds moving across concurrent regional deployments.",
            },
          ],
        },
        {
          id: "upstream",
          heading: "Moving checks upstream",
          blocks: [
            {
              type: "paragraph",
              text:
                "Working with DataOps and the data evaluation team, I migrated data validation from AWS EMR to AWS EKS, restructured how often validation runs, and moved checks earlier in the pipeline. Since the migration, release-blocking failures have dropped by about 40%, and the number keeps improving as our data standards tighten.",
            },
          ],
        },
        {
          id: "incident",
          heading: "When it breaks at scale",
          blocks: [
            {
              type: "paragraph",
              text:
                "A mass building-generation incident put tens of thousands of buildings into the data. I scoped the blast radius with SQL and QGIS and drove a delete, correct or retain decision on each group.",
            },
          ],
        },
      ],
      callout: {
        eyebrow: "What I'd bring to a client",
        text:
          "Bad data shows up in three places: already live, at the gate, and in an incident. I've owned all three at a scale of 50+ regions, and I've seen what moving a check upstream buys you: about 40% fewer release-blocking failures at the gate.",
      },
      disclaimer: "Details are limited to what I can share publicly. Internal system names are withheld.",
      contactHeading: "Data you can't trust yet? Let's talk.",
    },

    {
      id: "neural-newsletters-llm",
      card: {
        featured: false,
        eyebrow: "Neural Newsletters · Full stack and LLM",
        title: "Rebuilding an LLM content pipeline that shipped broken output",
        summary:
          "Diagnosed a generation pipeline producing malformed, unshippable output, rebuilt its data handling and schema, then hardened it with CI/CD gates, faster queries and live status over WebSockets.",
        linkText: "Read the case study",
        tags: ["~40% fewer incidents", "15 to 20% lower latency"],
      },
      eyebrow: "Case study · Neural Newsletters · Software Engineer · May 2024 to Feb 2025",
      title: "Rebuilding an LLM content pipeline that shipped broken output",
      intro:
        "Neural Newsletters used an LLM to personalize content for each reader, and the generation pipeline behind it was producing malformed output that couldn't ship. I diagnosed it, rebuilt the data handling and schema underneath, and hardened the path from ingestion to the reader's screen.",
      atAGlance: [
        { label: "My role", value: "Owned the LLM integration end to end" },
        { label: "Worked with", value: "The CTO, on turning business goals into requirements" },
        { label: "Stack", value: "Elixir and Phoenix, Postgres, TypeScript and React, WebSockets" },
        { label: "Scale", value: "Thousands of articles across recurring runs" },
      ],
      stats: [
        { value: "~40%", label: "fewer production incidents after CI/CD gates and automated tests" },
        { value: "15 to 20%", label: "lower generation latency from schema and query changes" },
        { value: "Live", label: "generation status streamed to readers over WebSockets" },
      ],
      sections: [
        {
          id: "situation",
          heading: "The situation",
          blocks: [
            {
              type: "flow",
              columns: 5,
              steps: [
                { title: "Ingest", note: "Inconsistent sources, normalized" },
                { title: "Postgres", note: "Rebuilt schema" },
                { title: "LLM", note: "Personalization prompts" },
                { title: "REST API", note: "Elixir Phoenix" },
                { title: "Reader", note: "Live status over WebSockets", gate: true },
              ],
            },
            {
              type: "paragraph",
              text:
                "The content-generation pipeline behind the product's core feature was producing malformed, unshippable output. Source data arrived in inconsistent formats, and the pipeline processed thousands of articles across recurring runs.",
            },
          ],
        },
        {
          id: "rebuild",
          heading: "Fixing it underneath",
          blocks: [
            {
              type: "paragraph",
              text:
                "The fix went below the prompt. I rebuilt the pipeline's data handling and schema from the ground up, and wrote ETL that normalizes the inconsistent source formats and isolates parse failures per article, so one bad input can't take down a run.",
            },
          ],
        },
        {
          id: "model",
          heading: "The model layer",
          blocks: [
            {
              type: "paragraph",
              text:
                "I owned the LLM integration behind the personalization feature, writing and iterating on prompt logic directly against production behavior to keep outputs accurate and consistent for real readers.",
            },
          ],
        },
        {
          id: "harden",
          heading: "Hardening it",
          blocks: [
            {
              type: "paragraph",
              text:
                "I set up CI/CD with quality gates and automated tests, which cut production incidents by about 40%. Restructuring the Postgres schema and the queries behind it removed dead fields and cut generation latency by 15 to 20%.",
            },
          ],
        },
        {
          id: "realtime",
          heading: "Getting it to the reader",
          blocks: [
            {
              type: "paragraph",
              text:
                "I designed and built the REST API layer connecting the Elixir Phoenix backend to the React and TypeScript frontend, and the WebSocket infrastructure that streams live generation status to users, balancing latency, scale and fault tolerance.",
            },
            {
              type: "paragraph",
              text: "Throughout, I worked directly with the CTO to turn ambiguous business goals into technical requirements.",
            },
          ],
        },
      ],
      callout: {
        eyebrow: "What I'd bring to a client",
        text:
          "When an LLM feature misbehaves, the fix is often underneath it: the data going in and the schema holding it. I look there before blaming the prompt, and I own the path all the way to the user's screen.",
      },
      contactHeading: "An LLM feature that won't behave? Let's talk.",
    },
  ],
};

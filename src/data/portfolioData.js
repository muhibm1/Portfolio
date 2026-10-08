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
// Shape: personal (contact, header facts and the three public snapshot repositories), home
// (hero, rightNow, stats, caseStudiesIntro, principles, workingWithPeople, experience, education,
// toolkit, contact), caseStudies (five, in the plan's reading order, each carrying card,
// atAGlance, stats, intro, an optional codeLink, sections of content blocks (a paragraph block
// may carry a link), callout, disclaimer where the mockup has one, and contactHeading; ADR 0006).

// The three public snapshot repositories, held once (R153) and referenced from every place the
// work is discussed: the header, the featured card, the hero code line and the WorkHorse page.
const REPOSITORIES = {
  workhorse: "https://github.com/muhibm1/workhorse-snapshot",
  studbook: "https://github.com/muhibm1/studbook-snapshot",
  paddock: "https://github.com/muhibm1/paddock-snapshot",
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

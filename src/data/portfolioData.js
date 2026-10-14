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
// Shape: personal (contact, header facts and the public repositories), home
// (hero, rightNow, stats, caseStudiesIntro, principles, workingWithPeople, experience, education,
// toolkit, contact), caseStudies (seven, in the plan's reading order, each carrying card,
// atAGlance, stats, intro, an optional codeLink, sections of content blocks (a paragraph block
// may carry a link), callout, disclaimer where the mockup has one, and contactHeading; ADR 0006).
// The AgentOps case study (second, after WorkHorse, its companion agentic-AI project) was added
// 2026-10-12 from the agentops repository's README results at commit 64289e6 (Sonnet 5.5, dev
// and held-out splits), pending the owner's approval. Its codeLink points at the public
// agentops-snapshot repository, published 2026-10-12.
// The Flywheel case study (third, after AgentOps) was added 2026-10-13 from the flywheel and studbook-agent READMEs.
// Refreshed 2026-10-13 (owner's request, from his case-studies-v2 draft): WorkHorse gains the 0.5
// releases and the faster Studbook record, checked against muhibm1/workhorse and muhibm1/studbook;
// AgentOps and Flywheel gain the gate on every AgentOps pull request and the WorkHorse runs; the
// Apple and Neural Newsletters studies carry the draft's own facts with plain-language framing.

// The four public snapshot repositories, held once (R153) and referenced from every place the
// work is discussed: the header, the featured card, the hero code line and the WorkHorse page.
// Flywheel and the Studbook agent (added 2026-10-13) are public repositories, not snapshots.
const REPOSITORIES = {
  workhorse: "https://github.com/muhibm1/workhorse-snapshot",
  studbook: "https://github.com/muhibm1/studbook-snapshot",
  paddock: "https://github.com/muhibm1/paddock-snapshot",
  agentops: "https://github.com/muhibm1/agentops-snapshot",
  flywheel: "https://github.com/muhibm1/flywheel",
  studbookAgent: "https://github.com/muhibm1/studbook-agent",
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
        "AI coding agents can write a feature in minutes. What they rarely leave behind is a reason to trust it: who decided what, what was checked, and what a person actually approved. WorkHorse is the delivery process I built around them. Twenty-eight single-purpose agents take a change from a one-line request to merged, tested and documented code, a person approves at the two moments that matter, and code the agents cannot argue with enforces the rules. This site was built with it.",
      // Quality: hooks/tests/run.js in muhibm1/workhorse at 0.6.1, per CHANGELOG.md.
      atAGlance: [
        { label: "My role", value: "Designed and built it end to end" },
        {
          label: "What it is",
          value:
            "An agentic software delivery pipeline and a retrieval system (Studbook), with an MCP server its agents search on every run",
        },
        {
          label: "Stack",
          value: "Node.js, Python, FastAPI, SQLite or Postgres with pgvector, LangSmith",
        },
        { label: "Quality", value: "507 pipeline tests, CI on every push" },
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
                "AI coding tools move fast until something goes wrong, and then there's rarely a record of what happened or why. Anyone putting them to work on real software has to answer three questions. What did the agent change? Who checked it? Did a person sign off on what actually shipped? I wanted to find out what it takes to answer all three every time, so I built the whole delivery process and measured it.",
            },
            {
              type: "paragraph",
              text:
                "The design rests on one idea. An AI agent is like a capable new hire who never gets tired and never remembers yesterday. Asking it to be careful does not fix that. Giving each agent a narrow job, writing everything down, and putting the rules that matter where it can't skip them does. Every step writes a document, every claim in it is labelled as confirmed or believed, and approvals are pinned to the exact version a person read.",
            },
            {
              type: "paragraph",
              text: "A few terms are used throughout:",
            },
            {
              type: "cards",
              items: [
                { title: "Agent", note: "One AI session with one job, such as planning, building or reviewing, and only the tools that job needs." },
                { title: "Gate", note: "A point where the pipeline stops until a person reads a document and approves it." },
                { title: "Hook", note: "A small piece of code that runs before or after every action an agent takes, and can block it." },
                {
                  title: "Risk tier",
                  note: "How much ceremony a change gets, from 0 (docs and tests) to 3 (regulated or hard to undo).",
                  emphasis: true,
                },
              ],
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
                "In plain terms: a person describes a problem and the outcome they want in one line. Agents investigate and write a design, and a person approves it before any code exists. A planning agent breaks the design into tasks and writes the tests that will prove each one works. Builder agents write the code in parallel, each in its own copy of the repository, so they can't overwrite each other.",
            },
            {
              type: "paragraph",
              text:
                "A checker that can read the code but not change it runs every test. If something fails, a different agent fixes it, so nothing ever grades its own work. Four reviewers then read the result at once: for bugs, for security, for whether it matches the design, and for whether another engineer could maintain it from the repository alone. Their findings are fixed before a person sees the ship document, and only that person's approval lets the change merge.",
            },
            {
              type: "paragraph",
              text:
                "Not every change deserves the same ceremony. A low-risk change needs only the Ship approval; a tier 3 production change also needs a person to approve the deploy, with rollback rehearsed from tier 2 up.",
            },
          ],
        },
        {
          // From docs/sdlc/2026-09-20-fix-phone-redaction-scanner/ (brief.md, evals.md,
          // approvals.md) and the run's row in the `measured` table below.
          id: "example",
          heading: "One change, start to finish",
          blocks: [
            {
              type: "paragraph",
              text:
                "This site must never publish my phone number, and a scanner checks every file in the repository for it. The scanner had two defects. Here is how WorkHorse fixed them:",
            },
            {
              type: "table",
              columns: [{ label: "Step" }, { label: "What happened" }],
              rows: [
                {
                  cells: [
                    "Request",
                    "One line: the scanner misses the number in files that mix two text encodings, and silently does nothing when it is started through a shortcut path.",
                  ],
                },
                {
                  cells: [
                    "Design",
                    "Agents reproduced both defects before proposing anything, so the design fixed real failures, not guessed ones. The audit also found the same kind of hole one level up: the publishing workflow stayed green even if the scanner's own tests never ran. A person approved the design.",
                  ],
                  emphasis: true,
                },
                {
                  cells: [
                    "Plan",
                    "34 evaluation cases written before any code: numbers the scanner must catch, and look-alikes it must leave alone.",
                  ],
                },
                { cells: ["Build, verify, review", "Code written and tested; the four reviewers raised 6 findings, all fixed before sign-off."] },
                { cells: ["Ship", "A person approved the ship document, and the change was merged and published."], emphasis: true },
              ],
            },
            {
              type: "paragraph",
              text:
                "Every step left a document behind, so anyone can see later why the scanner works the way it does and what it was tested against.",
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
                "A prompt is a request. A model can reason its way around a request, especially halfway through a long task when the rule is inconvenient. A hook is a lock. It runs outside the model, before or after every tool call, and it doesn't care how good the argument is. So the non-negotiables are nine hooks:",
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
                "The second card is the one people ask about. When code fails a test, the easiest way to make it pass is to change the test. During a fix the tests are locked, so the only way through is to fix the code.",
            },
            {
              type: "paragraph",
              text:
                "A session also can't approve its own gate or grant itself permissions. A ship document with an open high-severity finding is refused when it's written and again when someone tries to approve it.",
            },
          ],
        },
        {
          id: "who-decides",
          heading: "Who decides what",
          blocks: [
            {
              type: "cards",
              items: [
                { title: "Agents", note: "How to design, plan, build, test and fix the change, and what the reviewers flag." },
                {
                  title: "Code",
                  note: "Which files may be touched, whether tests may change, whether a gate is open, and whether the required documents exist.",
                },
                {
                  title: "A person",
                  note: "Whether the design is right, whether the change ships, and at tier 3, whether it deploys.",
                  emphasis: true,
                },
              ],
            },
            {
              type: "paragraph",
              text:
                "The split follows the cost of being wrong. An agent that writes a clumsy function costs a review comment. An agent that weakens a test, edits a protected file or approves its own work costs trust in everything the pipeline produces, so those decisions are taken away from it entirely.",
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
                "The first version had five human checkpoints, and it felt safe. I didn't redesign it from impressions. Timestamps from those runs showed that two thirds of the time a change spent in the pipeline was a person waiting at a checkpoint with nothing to decide. More gates were not making it safer, only slower.",
            },
            {
              type: "paragraph",
              text:
                "So I cut five gates to two, added a clock to every run, halved the agent sessions, capped document sizes, and moved reviewer fixes ahead of the ship document, so a person only sees finished work. Then I put five real changes through it, including one on a live web app with authentication, two on this site and the MCP server inside Studbook.",
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
          // Approvals on the pull request: CHANGELOG.md 0.4.0 (2026-09-29) in muhibm1/workhorse.
          id: "fell-short",
          heading: "Where it fell short",
          blocks: [
            {
              type: "paragraph",
              text:
                "The most useful run was one that failed. The first version of the Studbook MCP server, described below, passed every reviewer and was still wrong: it missed a requirement written down before any code existed. Only a person reading the ship document against the original requirement caught it, and the gate sent it back. That is the gate doing its job.",
            },
            {
              type: "paragraph",
              text:
                "The second weakness was where approvals lived. At first a gate was recorded on the machine where it was approved, so when work moved from my laptop to a cloud session, an approval I had already given stayed behind and had to be given again. Now every gate is posted on the change's pull request, and replying \"/approve\" there, from any device, is the approval. Only the repository's named approvers count, and an approval given before the document was posted does not. Version 0.6 closes the rest of the gap: with its event log on, every approval is also written to one shared log, pinned to the exact text the person read, so a change continues on any machine without asking again, and the gates stay shut if the log can't be reached.",
            },
          ],
        },
        {
          // Counted, not remembered: every figure in this section is from the WorkHorse run
          // ledger, docs/ledger/RUNS.md and runs.json in muhibm1/workhorse (0.5.0, merged
          // 2026-10-13 as b94e431), which recomputes each run from its committed conductor log
          // and approvals. Finished runs at risk tiers 0 to 2: 2 on the first version (five
          // gates), 7 on two gates, 5 from the speed release on. Regenerate with
          // `workhorse ledger` and update these figures together. The 0.5.x releases and the
          // first Flywheel pass are from CHANGELOG.md 0.5.0 to 0.5.4 (master 4f5f78e); 0.6.0 and
          // 0.6.1 from CHANGELOG.md and docs/superpowers/specs/2026-10-14-event-bus-design.md.
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
                "The ledger also shows the next limit. On the latest runs the agents were working for only a third of the time between the request and the merge. The rest was waiting: for a merge the agents aren't allowed to press, for a run that stopped and nobody restarted, for a person reading a design document with twenty questions in it.",
            },
            {
              type: "paragraph",
              text: "Version 0.5 goes after that waiting, one release at a time, and 0.6 puts every run on a shared log:",
            },
            {
              type: "table",
              columns: [{ label: "Release" }, { label: "What it does" }],
              rows: [
                {
                  cells: [
                    "0.5.0, the ledger",
                    "Every run is recomputed from its committed record, with its version and cost. A release can only claim a speedup the ledger shows.",
                  ],
                },
                {
                  cells: [
                    "0.5.1, merge on approval",
                    "Approving the ship document merges the change as soon as its checks are green. It never merges over a red check.",
                  ],
                },
                {
                  cells: [
                    "0.5.2, a trace per run",
                    "Every run becomes a LangSmith trace: the change at the top, then each phase and step, each step marked as agent work, waiting or a stopped run.",
                  ],
                  emphasis: true,
                },
                {
                  cells: [
                    "0.5.3, scored runs",
                    "Each trace gets five scores: finished, within its time budget, never stalled, no unexplained gap, and every gate passed first time. Flywheel, the third case study, groups the failures by the phase where they went wrong.",
                  ],
                },
                {
                  cells: [
                    "0.5.4, stall notices",
                    "A run that stops and needs a person says so on its pull request, so the notice reaches a phone.",
                  ],
                },
                {
                  cells: [
                    "0.6.0, an event log",
                    "Every step of a run and every approval goes to one shared log on Redpanda, which speaks the Kafka protocol. An approval follows the change to any machine, and the gates close if the log is down. Run timings and replays are read from the same log, and match the ledger on all 18 recorded runs.",
                  ],
                },
                {
                  cells: [
                    "0.6.1, fresh search",
                    "Each document a run writes reaches Studbook's search a few seconds later, through the same steps as a full rebuild, with the same results on all 40 test questions.",
                  ],
                },
              ],
            },
            {
              type: "paragraph",
              text:
                "The first scoring pass, over 16 traced runs, flagged 13: 8 went over their time budget, 4 of them in the build phase; 3 stalled; 2 never closed their record. That list is what the next releases, 0.6.2 to 0.6.4, work from: fewer questions per design, review running alongside the build, and big changes split in two. The event log now times each of them per gate and per phase. No 0.5 or 0.6 run has reached the ledger yet, so none of these releases claims a speedup.",
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
              type: "paragraph",
              text:
                "In plain terms, it is a search engine and a careful writer working together. The search half finds the five passages most likely to hold the answer. The writer half, a language model, may use only those passages, must cite one for every sentence, and must say so when they don't contain the answer. That pattern is called retrieval-augmented generation, or RAG.",
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
                "Read left to right: the question is searched two ways at once. Vector search matches meaning, so it finds \"rollback\" when you asked about undoing a release. Full-text search matches exact words, so it finds a specific file name. The two lists are merged into one, a second, slower model re-reads the best candidates and keeps the five most relevant, and only then does the writer answer.",
            },
            {
              type: "paragraph",
              text:
                "I built the test before tuning anything: 60 gold questions with known answers across five types, plus nine trap questions about things the record doesn't contain, where the only right answer is to refuse. They were split into a dev set for tuning and a sealed, hashed test set scored once, after tuning froze, so the final score is an exam the system never studied for. Every step in the pipeline above was chosen by measurement.",
            },
            {
              type: "paragraph",
              text:
                "The table shows recall at five: how often the passage that holds the answer was among the five handed to the writer. If it isn't there, no writer can get the answer right.",
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
                "Two results in that table are worth a sentence each. The textbook fusion setting is meant for large collections; on a small one, tuning it was worth more than any single feature. And a bigger pool for the reranker scored lower, not higher: more candidates gave it more near misses to choose among.",
            },
            {
              type: "paragraph",
              text:
                "Measured and rejected: splitting questions into parts, capping chunks per document, synonym expansion, hypothetical-passage search, bigger rerank pools and more passages for the generator. None beat what shipped, and I kept the code so the results can be reproduced.",
            },
            {
              type: "paragraph",
              text:
                "Conversations work too. A follow-up like \"was it ever fixed?\" means nothing to a search engine on its own, so a small model rewrites it into a standalone question first, under a guard that stops the rewrite from inventing a topic. With the thread, 9 of 12 follow-ups were answered fully correctly, against 1 of 12 without it.",
            },
            {
              type: "paragraph",
              text:
                "Paddock, an earlier desktop app, ran the same query path in TypeScript. A parity gate checked it against the Python reference on every dev question, and it caught two bugs a careful port would have shipped: a reranker silently truncating long inputs, and a database connection that was encrypted but never authenticated. Measured runs then showed the app itself cost hours, because it kept its own copies of things the pipeline owns and they drifted. It was replaced by one terminal command, approvals on the pull request from a phone, and a LangSmith trace of every run.",
              link: { text: "Paddock", href: REPOSITORIES.paddock },
            },
          ],
        },
        {
          // Speed and cost: docs/studbook-record.md in muhibm1/workhorse (#30), and README.md "Fast mode for agents" in muhibm1/studbook (#14,
          // 961e567): p50 per search through MCP over the 40 dev questions, 4-core cloud CPU,
          // 3,880 passages from six repositories; fused recall@10 0.8824 against reranked
          // recall@8 0.8824 (studbook docs/retrieval-ceiling.md). Figures are written in words
          // because the forbidden-copy scan withholds digit-plus-unit timing figures (D26, D36).
          id: "mcp",
          heading: "An MCP server over the record",
          eyebrow: "Inside WorkHorse",
          blocks: [
            {
              type: "paragraph",
              text:
                "MCP, the Model Context Protocol, is a standard way for an AI agent to call an outside tool, the way a USB port is a standard way to plug in a device. Studbook runs as an MCP server, so other agents can query the engineering record mid run and look up a past decision instead of re-deriving it, or worse, contradicting it. The server lives in the Studbook repository.",
              link: { text: "Studbook repository", href: REPOSITORIES.studbook },
            },
            {
              type: "paragraph",
              text:
                "A second way in is only useful if it gives the same answers as the first. Its answers were proved identical to the direct path over 40 evaluation questions: the same passages in the same order, scores within 0.0001, identical model requests. That check runs in CI.",
            },
            {
              type: "paragraph",
              text:
                "WorkHorse built it end to end. The first version missed a requirement written before the work started, and my own ship gate rejected it. The fix was per-session connection reuse and removing a duplicated model pass. Reworked and merged, with 12 of 12 review findings fixed before approval and the results proved identical over the same 40 questions.",
            },
            {
              type: "paragraph",
              text:
                "It now sits inside every run. Before designing a change, the designer and the discovery analyst ask the record what was decided about these files before and what went wrong last time, and get the passages back with where they came from. That only works if a search is fast and free, and at first it was neither: a search took about three seconds.",
            },
            {
              type: "paragraph",
              text:
                "Measured over the record of all six of my repositories, 3,880 passages, almost all of that time was the reranker, and for an agent it bought nothing: the merged top ten holds a right passage as often as the reranked top eight (recall 0.88 on the dev questions). So the agents' path skips the reranker and reads ten passages, encodes the question on a faster engine with the same model and the same vectors, and loads the models once at start. A search now takes about forty milliseconds and costs nothing. The record is one SQLite file on the machine, the models run locally, and the one paid tool, a written answer from the model, stays off. The hosted Postgres record still works, and is now optional.",
            },
            {
              type: "paragraph",
              text:
                "By default it answers only from decided documents, so an agent cannot cite its own in-flight proposal as settled fact. On Postgres every query runs as a read-only role under row-level security, connections are pinned to one certificate authority, credentials are never written to a log, and retrieved text reaches the model as data rather than instructions, so a document cannot hijack the agent reading it.",
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
            {
              // agentops #23 (1fd8aec): .github/workflows/flywheel.yml runs the scripted model on
              // every pull request; live comparisons are run by hand (flywheel/README.md).
              type: "paragraph",
              text:
                "The loop no longer depends on me remembering to run it. Flywheel, the next case study, now checks every AgentOps pull request against seven test cases, two of them mined from real traced runs, on the change and on main, and blocks a change that breaks one. In CI it uses the scripted model, which is free and repeatable; prompt and model changes get a live comparison. Its first catch was a prompt cleanup that passed 996 unit tests.",
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
                    "Gate state was local: an approval recorded on one machine stayed there when the work moved to the cloud. Gates now live on the pull request",
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

    // Added 2026-10-13 from the flywheel and studbook-agent READMEs and their results pages.
    {
      id: "flywheel",
      card: {
        featured: false,
        eyebrow: "Personal system · LLM evaluation · LangSmith",
        title: "Flywheel: an agent's real failures, turned into its tests",
        summary:
          "A regression gate for AI agents. It turns failing runs recorded in LangSmith into test cases a person reviews, then compares every pull request with main, case by case, and blocks the ones that break a case.",
        linkText: "Read the case study",
        tags: ["Test cases mined from real traces", "Gated case by case, not on averages"],
      },
      codeLink: { label: "Code: flywheel", href: REPOSITORIES.flywheel },
      eyebrow: "Case study · Personal system · LLM evaluation · LangSmith",
      title: "Flywheel: an agent's real failures, turned into its tests",
      intro:
        "An AI agent can pass every unit test and still get worse, because the tests run on a scripted stand-in for the model. Flywheel turns an agent's real failures, recorded in LangSmith, into test cases, and checks every pull request against them case by case. On two different agents it blocked a change that looked fine: one passed every behavioural unit test, the other looked like noise on the averages.",
      atAGlance: [
        { label: "My role", value: "Designed and built it end to end" },
        {
          label: "What it is",
          value:
            "A regression gate for LLM agents: it mines failing LangSmith traces into test cases and gates each pull request case by case",
        },
        { label: "Stack", value: "Python, LangSmith, LangGraph, GitHub Actions, Claude" },
        {
          label: "Quality",
          value: "33 tests, CI on Python 3.11 and 3.13, and its own action gating its example agent",
        },
      ],
      stats: [
        { value: "19 to 14", label: "correct AgentOps runs of 21, after a prompt cleanup that passed 996 unit tests" },
        { value: "2 of 2", label: "broken AgentOps cases that were mined from real traffic" },
        { value: "3 fixed, 5 broken", label: "Studbook questions, behind an average that moved only from 95 to 91 of 108" },
        { value: "0 broken", label: "when main ran against itself; one case wobbled inside the noise allowance" },
      ],
      sections: [
        {
          id: "why",
          heading: "Why I built it",
          blocks: [
            {
              type: "paragraph",
              text:
                "An agent built on a language model can pass every unit test and still get worse. The unit tests run on a scripted stand-in for the model, so they check the code around the model, not what the model does. Change a prompt, and the real model reads it and behaves differently. The scripted one does not notice.",
            },
            {
              type: "paragraph",
              text:
                "That gap is the forward deployed engineer's job in miniature. A customer's agent demos well. The real questions are whether it provably works, and whether anyone will know when a change breaks it. Flywheel is my answer to both, built on LangSmith, LangChain's tracing and evaluation service. A few terms are used throughout:",
            },
            {
              type: "cards",
              items: [
                { title: "Trace", note: "The recording of one agent run: every model call and tool call, in order." },
                { title: "Evaluator", note: "A small function that scores one run, such as \"did it pick the right team\"." },
                { title: "Dataset", note: "A saved list of inputs with the answers expected." },
                { title: "Experiment", note: "One version of the agent scored against one version of the dataset." },
                { title: "Repetition", note: "Running the same case more than once, because a live model does not answer the same way twice." },
                {
                  title: "Regression",
                  note: "A change that makes something that used to work stop working.",
                  emphasis: true,
                },
              ],
            },
          ],
        },
        {
          id: "how",
          heading: "How the loop works",
          blocks: [
            {
              type: "flow",
              columns: 6,
              steps: [
                { title: "Trace", note: "Real runs recorded in LangSmith" },
                { title: "Score", note: "Evaluators grade each trace" },
                { title: "Mine", note: "Failures grouped by where they went wrong" },
                { title: "Review", note: "A person confirms the right answer", gate: true },
                { title: "Promote", note: "The case joins the test file" },
                { title: "Gate", note: "Every pull request, case by case" },
              ],
            },
            {
              type: "paragraph",
              text:
                "In plain terms: the agent's real runs are recorded. Flywheel grades them with the same checks the tests use, finds the runs that went wrong, and proposes each one as a test case. A person confirms what the right answer was. The case then joins a test file that lives in the repository, next to the code. On every pull request, Flywheel runs all the cases on the change and on the main branch, compares them case by case, and posts the result as a comment. If a case that used to pass now fails, the check fails.",
            },
            {
              type: "paragraph",
              text:
                "The comment reads like this: \"Flywheel ran the agent on 7 test cases, 3 times each, before and after this change. 2 cases that passed before now fail.\" Each broken case links to its trace, so the reviewer goes straight from the red check to the run that went wrong.",
            },
            {
              type: "paragraph",
              text:
                "Mining reads each root run, its feedback and the LangGraph node metadata, so every failure gets a signature: the reason, and the node where it went wrong, such as correct_outcome below 1 at the escalate node. Failures group by signature, so twenty failures are often three bugs. A failure already covered by the dataset is not proposed twice.",
            },
          ],
        },
        {
          id: "decide",
          heading: "How it decides",
          blocks: [
            {
              type: "paragraph",
              text:
                "A live model does not answer the same way twice, so one failed run proves little. Flywheel runs every case several times, three by default, and counts how many passed. That count is the pass rate, such as 2 of 3.",
            },
            {
              type: "paragraph",
              text:
                "The question a reviewer asks is which cases a change broke, not whether the average moved. An average hides one case going from always passing to always failing behind two that improved. So Flywheel decides per case:",
            },
            {
              type: "table",
              columns: [{ label: "Verdict" }, { label: "What it means" }, { label: "Blocks the change?" }],
              rows: [
                {
                  cells: [
                    "Broken",
                    "The pass rate fell by at least half. With 3 repetitions, at least two runs flipped from pass to fail.",
                    "Yes",
                  ],
                  emphasis: true,
                },
                { cells: ["Fixed", "The pass rate rose by as much.", "No"] },
                {
                  cells: [
                    "Wobble",
                    "A smaller move. One run in three flipping is what a live model's noise looks like.",
                    "No, reported only",
                  ],
                },
                {
                  cells: [
                    "New",
                    "A case added by the pull request. Adding a test for a known bug is how the bug gets fixed, so a failing new case is reported, not blocked.",
                    "No, reported only",
                  ],
                },
              ],
            },
            {
              type: "paragraph",
              text:
                "The gate also fails when a case starts raising an error it did not raise before. The report adds a sign test: the chance that a split this uneven between broken and fixed cases would appear if the change did nothing. On the main branch side, the pull request's own test cases run against the old code, so a fix that arrives with its regression test shows up as fixed, not new.",
            },
            {
              type: "paragraph",
              text:
                "How far a pass rate must move, and how many broken cases to tolerate, are two settings in the config file. The defaults are half and zero. The point is to agree them before the first argument, not during it.",
            },
          ],
        },
        {
          id: "agentops",
          heading: "The AgentOps result",
          blocks: [
            {
              type: "paragraph",
              text:
                "AgentOps is the incident-response agent I built on LangGraph, in the previous case study. Its suite of about 1,000 tests runs on a scripted model. I wired Flywheel into it, then made the kind of edit that passes code review.",
            },
            {
              type: "paragraph",
              text:
                "First, traffic. I sent 11 realistic incidents through AgentOps on Claude Haiku 4.5 and traced them to LangSmith. Each was a known scenario, with its symptoms worded the way real alerts arrive, such as \"orders error budget exhausted\".",
            },
            {
              type: "paragraph",
              text:
                "Then, mining. Flywheel scored the traces with AgentOps's own evaluators and found 2 failures. Both were the same scenario, two faults at once. The terse wording led the agent to give up and hand the incident to a person, when it should have fixed one fault and then the other. Both were promoted to test cases, with the scenario's known answer as the reference, so the dataset grew from 5 hand-written cases to 7.",
            },
            {
              type: "paragraph",
              text:
                "Then, the change: a prompt cleanup that deleted one paragraph of the root-cause prompt that looked redundant. Every behavioural unit test still passed, 996 of them. The only 2 failures were tests that pin the prompt's exact wording, which a cleanup edits along with the prompt.",
            },
            {
              type: "paragraph",
              text:
                "Finally, the gate. Flywheel ran all 7 cases 3 times each on Claude Sonnet 5.5, on main and on the change. It blocked the change:",
            },
            {
              type: "table",
              columns: [
                { label: "Case" },
                { label: "Main", numeric: true },
                { label: "With the cleanup", numeric: true },
                { label: "Verdict" },
              ],
              rows: [
                { cells: ["Mined from traffic: \"orders error budget exhausted\"", "2 of 3", "0 of 3", "Broken"], emphasis: true },
                { cells: ["Mined from traffic: \"orders API degraded since ~11:00\"", "3 of 3", "1 of 3", "Broken"], emphasis: true },
                { cells: ["Hand-written: the same scenario", "2 of 3", "1 of 3", "Wobble"] },
                { cells: ["All 7 cases, correct outcomes", "19 of 21", "14 of 21", "Blocked"] },
              ],
            },
            {
              type: "paragraph",
              text:
                "The lesson is in the third row. The hand-written version of the same scenario only wobbled, inside the noise allowance, so on its own it would not have blocked anything. The cases that caught the regression came from traffic, not from imagination.",
            },
            {
              type: "paragraph",
              text:
                "A control run makes the result credible. I ran main against itself: the same code, two separate live experiments. Flywheel passed it, with one case wobbling inside the allowance. So a red check means a real change, not model noise.",
            },
          ],
        },
        {
          id: "studbook-agent",
          heading: "A second agent: the Studbook agent",
          blocks: [
            {
              type: "paragraph",
              text:
                "The Studbook agent answers questions about my projects' design records, with citations, and refuses when the records do not say. It shares no code with AgentOps. Flywheel needed no change to run it, only three new checks: did it cite the right section, did it refuse exactly when it should, and did a model judge the answer correct.",
              link: { text: "Studbook agent", href: REPOSITORIES.studbookAgent },
            },
            {
              type: "paragraph",
              text: "On 36 questions, each asked 3 times on Claude Haiku 4.5, it scored:",
            },
            {
              type: "stats",
              items: [
                { value: "95 of 108", label: "runs with an answer judged correct" },
                { value: "99 of 108", label: "runs that cited the section holding the answer" },
                { value: "108 of 108", label: "runs that refused exactly when they should" },
              ],
            },
            {
              type: "paragraph",
              text:
                "Its weak spot was questions that need two records together. The obvious fix was a prompt paragraph on how to compare two records. On averages it looked like a small dip that could be noise: correct answers went from 95 to 91 of 108.",
            },
            {
              type: "paragraph",
              text:
                "Case by case, it was not. The paragraph fixed 3 questions completely and broke 5. One of the broken questions was unanswerable, and the agent started answering it with an invented fact instead of refusing. A wrong answer delivered with confidence is the failure this agent exists to avoid. Flywheel blocked the change, and I kept the original prompt.",
            },
            {
              type: "paragraph",
              text:
                "The report's sign test came out at p = 0.727, nowhere near significant. The gate does not depend on it: one broken case is enough to block, and here there were five.",
            },
          ],
        },
        {
          // muhibm1/workhorse CHANGELOG.md 0.5.3 (#34) and the first mining report,
          // /mnt/project-files/workhorse/flywheel-mine-workhorse-runs-2026-10-13.md.
          id: "workhorse-runs",
          heading: "A third agent: WorkHorse's own runs",
          blocks: [
            {
              type: "paragraph",
              text:
                "The miner needs only two things from an agent: scores on its traces, and the name of the step each part of the trace belongs to. WorkHorse, the delivery pipeline in the first case study, is not a LangGraph app, but it now labels each phase of a run the way LangGraph labels its nodes and scores every run on five checks, such as \"finished within its time budget\". Flywheel read those traces with no WorkHorse-specific code.",
            },
            {
              type: "paragraph",
              text:
                "Of 16 runs, it flagged 13 and grouped them by the phase where they went wrong: 8 over their time budget, 4 of those in the build phase; 3 that stalled; 2 that never closed. Each one waits for a person to write down what the right outcome was before it becomes a test case. The grouping already did its job: it showed where WorkHorse's next releases should spend their effort.",
            },
          ],
        },
        {
          id: "langsmith",
          heading: "LangSmith, feature by feature",
          blocks: [
            {
              type: "paragraph",
              text:
                "Each step of the loop maps to one LangSmith feature, used as the product intends rather than worked around. The table reads left to right: the feature, then what Flywheel does with it.",
            },
            {
              type: "table",
              columns: [{ label: "LangSmith feature" }, { label: "What Flywheel does with it" }],
              rows: [
                {
                  cells: [
                    "Tracing projects",
                    "The mine command reads root runs, their feedback and the LangGraph node metadata, and names the node where each failing run went wrong.",
                  ],
                },
                {
                  cells: [
                    "Feedback",
                    "The score command writes evaluator scores onto existing traces. It works like an online evaluator, using the same functions the tests use.",
                  ],
                },
                {
                  cells: ["Annotation queues", "Mining can put failing runs in a queue, in front of a reviewer who confirms the right answer."],
                },
                {
                  cells: [
                    "Datasets and version tags",
                    "The sync command mirrors the repository's test file into a dataset and tags each version with the file's content hash, so an experiment records exactly which cases it ran.",
                  ],
                  emphasis: true,
                },
                {
                  cells: [
                    "Experiments with repetitions",
                    "The run command runs the agent through Client.evaluate with repetitions. Every run becomes a trace with its scores attached.",
                  ],
                },
                {
                  cells: ["Comparison view", "The pull-request comment links both experiments, main and the change, side by side."],
                },
              ],
            },
            {
              type: "paragraph",
              text:
                "Evaluators use LangSmith's own signature: inputs, outputs and reference outputs. So the same function grades a run in CI, in a LangSmith experiment and on a production trace. In CI, a scripted or recorded model is the right default where the agent has one, because it is free and repeatable. Prompt and model changes need a live run, because a scripted model does not read the prompt.",
            },
          ],
        },
        {
          id: "customer",
          heading: "How I'd use it with a customer",
          blocks: [
            {
              type: "paragraph",
              text:
                "The repository carries the plan I would follow when a team hands me an agent that works in the demo and asks whether it is ready for production. It is written for the team's engineers and for whoever signs off on the launch, so each step says what it gives the business as well as what gets built. The short version: you cannot improve what you cannot see, and you cannot ship what you cannot compare.",
            },
            {
              type: "table",
              columns: [{ label: "When" }, { label: "What gets built" }, { label: "What the business gets" }],
              rows: [
                {
                  cells: [
                    "Day 1",
                    "Tracing everywhere the agent runs, one project per environment, root runs named after the business action, and customer-facing ids in the metadata",
                    "\"What did the agent do?\" takes a minute to answer, not a day",
                  ],
                },
                {
                  cells: [
                    "Days 2 to 3",
                    "Evaluators written with the people who own the outcome: cheap, certain checks first, and a model judge only where code cannot check, tested against a dozen human labels",
                    "A shared, written definition of a good answer, which often exposes a disagreement worth settling before launch",
                  ],
                },
                {
                  cells: [
                    "Days 4 to 5",
                    "The first dataset, mined from a week of real traces, each expected answer written by a domain expert in an annotation queue, plus hand-written cases for the rules that must never break",
                    "A test set that reflects what customers actually send, with a named person behind every expected answer",
                  ],
                },
                {
                  cells: [
                    "Days 6 to 7",
                    "The gate on every pull request: a scripted model in CI, live runs for prompt and model changes",
                    "Whether a change made anything worse is known before it ships, with a link to the exact case and trace",
                  ],
                  emphasis: true,
                },
                {
                  cells: [
                    "Day 8",
                    "The noise policy, agreed in advance and written into the config",
                    "A red check means something, so people stop ignoring it",
                  ],
                },
                {
                  cells: [
                    "Days 9 to 10",
                    "A daily mining job, one full cycle run together, and a frozen held-out set (cases nobody tunes against) scored only when a version is ready to ship",
                    "The team can run the loop without me, and the launch decision rests on numbers they trust",
                  ],
                },
              ],
            },
            {
              type: "paragraph",
              text: "What I watch for along the way:",
            },
            {
              type: "cards",
              items: [
                {
                  title: "An average that hides a broken case",
                  note: "Two cases fixed and one broken reads as better in an average. The gate reports cases, not averages, for this reason.",
                },
                {
                  title: "A prompt change tested on a scripted model",
                  note: "It passes every time, because the script does not read the prompt. Prompt and model changes need a live run.",
                },
                {
                  title: "A dataset that only grows from imagination",
                  note: "If no case came from a trace, the dataset tests what the team expects, not what customers do.",
                },
                {
                  title: "Tuning against the held-out set",
                  note: "Once a team has seen held-out scores while making changes, those scores stop meaning anything. Freeze it and protect it.",
                  emphasis: true,
                },
              ],
            },
          ],
        },
        {
          id: "limits",
          heading: "Limits",
          blocks: [
            {
              type: "bullets",
              items: [
                "Mining finds failures that a score or an error can see. A wrong answer that every evaluator passes stays invisible, so the evaluators deserve as much review as the agent.",
                "Three repetitions tell a real break from noise only for large moves. A case that goes from 3 of 3 to 2 of 3 is reported as a wobble, not blocked. Cases where a single failure matters need more repetitions.",
                "Each result here is one change on one agent: 7 or 36 cases, 3 repetitions, one model. It shows the mechanism working. It is not a benchmark.",
                "The Studbook agent's answer judge is itself a model, Claude Haiku 4.5, and its verdicts have not been audited by a person.",
              ],
            },
          ],
        },
      ],
      callout: {
        eyebrow: "What I'd bring to a client",
        text:
          "A way to take a customer's agent from demos well to provably works: its real failures in LangSmith become reviewed test cases, every change is compared with main case by case, and a red check means a real regression, not model noise.",
      },
      contactHeading: "Have an agent that works in the demo? Let's talk.",
    },

    // Rewritten 2026-10-13 from the owner's case-studies-v2 draft, with its facts kept as given.
    // The reviewer-agreement figure (~98%) is the owner's, from his draft; he lifted the master
    // copy's no-accuracy-figure rule for this page on 2026-10-14.
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
        "Some map data is protected: before anyone can edit it, a person reviews a request to unlock it. That review was real work, and cross-team data changes piled up behind it. I built an agent that does the investigation for each request and hands the reviewer a documented recommendation with its evidence. The reviewer still makes every call. Throughput went from about 30 requests a day to over 350, and two months of backlog cleared in two weeks.",
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
        { value: "~98%", label: "of recommendations match the reviewer's decision" },
      ],
      sections: [
        {
          id: "situation",
          heading: "The situation",
          blocks: [
            {
              type: "paragraph",
              text:
                "Some features in the map, such as buildings and roads, are locked so they can't be edited by accident. When a team needs to change one, they file an unlock request, and someone on our side reviews it before the edit can go ahead.",
            },
            {
              type: "paragraph",
              text:
                "The review was not a rubber stamp. For each request someone had to pull up the feature and everything around it, check the proposed edit against internal specification, and work out what else it would affect, including problems that would only show up further down the pipeline. Each review took 5 to 15 minutes, depending on the request, and the team got through about 30 a day. The queue grew faster than that. About two months of tickets had piled up, and teams across the pipeline were waiting on them.",
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
                "In plain terms: the agent does the homework a reviewer used to do by hand. It reads the request, takes a snapshot of the feature to be edited along with the features around it, and checks the proposed edit against internal specification. Then it works through what else the change would touch, because an edit that looks fine on one feature can break a neighboring one, or something built from it later.",
            },
            {
              type: "paragraph",
              text:
                "It writes up a recommendation, unlock or keep locked, with the reasoning and evidence behind it, a short summary of what is actually failing, and a proposed fix, and puts it in front of a reviewer. It does not act on that recommendation. The hard part of this review was never the decision. It was the work required before anyone could make one.",
            },
          ],
        },
        {
          id: "who-decides",
          heading: "Who decides what",
          blocks: [
            {
              type: "cards",
              items: [
                {
                  title: "The agent",
                  note: "Works out what the edit is meant to do and what it could affect, checks it against the spec, and writes a recommendation it must justify.",
                },
                {
                  title: "Code",
                  note: "Fixes what the agent can reach: no write access to anything, and only the data and repositories the review needs.",
                },
                {
                  title: "The reviewer",
                  note: "Makes every unlock decision. The agent has no authority to change anything.",
                  emphasis: true,
                },
              ],
            },
            {
              type: "paragraph",
              text:
                "The split follows the cost of being wrong. If the write-up misses something, a reviewer reading the evidence can catch it. If unlocking were left to the agent, a miss would go straight into the map. These requests carry consequences that are not always visible at the point of the edit, and a system that cannot be questioned is not one a reviewer should be asked to trust.",
            },
            {
              type: "paragraph",
              text:
                "That is also why every recommendation carries its reasoning and evidence. A reviewer should be able to disagree with it on the merits, not take it on faith.",
            },
          ],
        },
        {
          id: "model",
          heading: "Choosing and tuning the model",
          blocks: [
            {
              type: "paragraph",
              text:
                "I selected an open-source model, built the agent around it, and own it end to end. Much of the backend it works against is proprietary, so I wanted the agent itself to be platform agnostic. An open-source model isn't tied to one provider's service, so the agent can run wherever the work needs it and move with the systems around it.",
            },
            {
              type: "paragraph",
              text:
                "Launch was not the end of the work. I keep tuning the analysis and the system's scope against how it performs on live requests. Two cases took the most work.",
            },
            {
              type: "paragraph",
              text:
                "The first was edits to the map's 3D structure. 3D modeling is open ended, and a bad edit can make the map visibly jarring, so these requests are held to a high bar, and the agent scored them almost entirely on what could go wrong. That is the right instinct for a large change and the wrong one for most of these requests, which are minor. So for small 3D edits it now weighs the other side as well: whether a change too small to notice on its own would bring the map in line with Apple's design standards.",
            },
            {
              type: "paragraph",
              text:
                "The second was very large features, such as islands and country borders. Because the feature is enormous, any request to edit one raised flags, even when the edit itself was small, like aligning a short stretch of a border. Separating the size of the feature from the size of the change was one of the hardest parts of getting the analysis right.",
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
                "A tool like this only works if the reviewers believe it. I worked directly with the stakeholder teams who own these requests to decide what the system should handle, what it should leave to people, and how its write-up should read so a reviewer could check it quickly. As live results came in, we widened or narrowed its scope together.",
            },
            {
              type: "paragraph",
              text:
                "The clearest example came from the teams themselves. At first the agent answered only what the request asked. That wasn't enough. Requests usually arrive early in the GIS life cycle, when an editor has spotted a problem in protected data but hasn't yet worked out its full scope or the right fix. And not every failure is obvious: a check can fail for an unexpected reason, or for a related one its description doesn't cover.",
            },
            {
              type: "paragraph",
              text:
                "So every recommendation now includes a short summary of the failure, covering its root cause and how the data is set up, plus a proposed fix based on the model's assessment. What the agent uncovers this way also feeds back into how checks are defined and into our engineering standards.",
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
                "Reviewers agree with its recommendation about 98% of the time. The requests it flags for a closer look are the extreme ones, kinds of request it hasn't seen before, and requests from a team working outside its own scope. That last kind is flagged even when the edit is justified and low risk, because which team owns which part of the work matters as much as whether the edit is sound.",
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
        "Once someone decides a protected map feature can be edited, its permissions have to actually change, in three separate systems. That already worked, but it ran on long command-line scripts and extra tickets raised just to carry the change. I built one Python tool that does it on demand through each system's own authenticated API, and records why each change was made. Turnaround dropped by about half.",
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
                "Locking a map feature protects it from edits; unlocking it lets a specific change go ahead. Doing either meant touching three systems that don't share a login: the ticketing system that holds the request, the code repository, and the geo-data system that holds the feature itself.",
            },
            {
              type: "paragraph",
              text:
                "The path was hostile: long command-line invocations, extra tickets raised just to carry the change, and enough setup that a routine request was easy to get wrong. None of it required judgment, only care, which is exactly the kind of work a tool should do.",
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
                "In plain terms: the tool reads an approved request from the ticketing system, signs in to the other two systems with the right permissions, changes the lock on the feature, and writes a comment on it saying why. Nobody has to change the tools they already use, because it talks to each system through the official interface each one already offers, its REST API.",
            },
            {
              type: "table",
              columns: [{ label: "Step" }, { label: "Before" }, { label: "After" }],
              rows: [
                { cells: ["Starting a change", "Long command-line invocations, set up by hand", "One request, handled on demand"] },
                { cells: ["Paperwork", "Extra tickets raised just to carry the change", "The original request is enough"] },
                {
                  cells: ["Record of why", "Often nowhere: for a long time, a reason wasn't required", "A comment on the feature itself"],
                  emphasis: true,
                },
                { cells: ["Turnaround", "The starting point", "About 50% faster"] },
              ],
            },
            {
              type: "paragraph",
              text:
                "The comment matters more than it looks. For a long time, recording why a feature was locked wasn't required, so many locks have no reason attached. When someone needs to change one, the person who set it has to be tracked down. When they can't be, often because they have left, the reasoning has to be rebuilt from scratch. That redoes work someone already did, and the rebuilt answer is often wrong.",
            },
            {
              type: "paragraph",
              text:
                "A wrong answer has real consequences. Many locks exist because a partner or an end user asked for them directly, and some carry legal weight. A lock might keep navigation out of a restricted location, or stop the map sending commercial or recreational traffic through a business that isn't open to the public. At face value, enabling navigation can look like the obvious fix, and without the record, nothing says otherwise.",
            },
            {
              type: "paragraph",
              text:
                "Now the reason is written on the feature at the moment the lock changes, which is the cheapest moment to capture it.",
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
                "The code that changes a lock is short. Getting three separate systems to accept one tool was most of the work, because each one has to trust the tool with permissions it guards carefully.",
            },
            {
              type: "paragraph",
              text:
                "Then the ground moved. The tool originally signed in through a shared automated account, and that sign-in method was deprecated. I moved it to OAuth2, the standard that lets a tool act with a named person's permissions without ever holding their password. That fixed one system and broke the others in turn: each had its own permission rules, and the errors cascaded from one to the next.",
            },
            {
              type: "paragraph",
              text:
                "Most of that work was diagnosis rather than code. A permission error usually says that a request was refused, not why. So I took each system in turn and compared what the new sign-in was actually allowed to do with what that system expected of it, until all three accepted it.",
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
            {
              type: "paragraph",
              text:
                "Next I'd add timed unlocks: a feature unlocked for a set window and locked again automatically when the window closes. Today an unlock stays open until someone remembers to relock it. A timed unlock means the protection comes back on its own once the edit is done.",
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
        "Apple Maps is built from data covering more than 50 regions, and every release has to pass automated quality checks before it ships. Apple's Data Health team helps set those standards. My part is keeping bad data from blocking releases: fixing it once it's live, stopping it at the gate, and cleaning up fast when something slips through.",
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
          id: "three-places",
          heading: "Three places bad data shows up",
          blocks: [
            {
              type: "paragraph",
              text:
                "In plain terms: map data is checked by automated validations, rules the data has to meet before it can ship. When data breaks a rule, that's a validation failure. Some failures are minor. Others are release-blocking: until they're fixed, the region's data can't be promoted, which means moved into the version the map is actually built from.",
            },
            {
              type: "cards",
              items: [
                { title: "Already live", note: "Remediation jobs find and fix it" },
                { title: "At the gate", note: "Validation decides what gets promoted" },
                { title: "In an incident", note: "Find it, triage it, fix it", emphasis: true },
              ],
            },
            {
              type: "paragraph",
              text:
                "Each place needs a different response. Data that is already live needs fixing at volume, without breaking anything that works. Data at the gate needs a fast, correct call so a release stays on schedule. And an incident needs someone to find out how big the damage is before deciding what to do about it.",
            },
          ],
        },
        {
          id: "live",
          heading: "Fixing data that's already live",
          blocks: [
            {
              type: "paragraph",
              text:
                "A remediation job is an automated repair: it finds data that fails a rule and corrects it. I run and continuously tune ML-driven remediation jobs, orchestrated in Jenkins, that clean up and modernize production data. Those jobs have resolved hundreds of thousands of validation failures.",
            },
            {
              type: "paragraph",
              text:
                "Tuning is most of the work. A job that triggers too eagerly fixes things that weren't broken; one that retries blindly can loop on the same failure for hours. So I adjust trigger logic, batching and retry behavior based on what the live results show, so fixes land more accurately and jobs stop looping.",
            },
            {
              type: "paragraph",
              text:
                "The jobs also compete for room. The team can only run so many at once, and a job started past that limit fails instead of waiting. I'm building a queue in front of them, on Jenkins' own API, so extra jobs wait their turn rather than fail.",
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
                "When gating or critical-path validation failures stop a repository from being promoted to production, I resolve them with DataOps and the data evaluation team so releases stay on schedule. That means working out whether the failure is real bad data, a rule that needs updating, or a fault in the check itself, and getting the right team to the right fix.",
            },
            {
              type: "paragraph",
              text:
                "I also maintain the quality gates, validation checkpoints and rollback logic that keep builds moving across concurrent regional deployments, so a problem in one region can be held back or undone without stopping the rest.",
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
                "The cheapest bad data to fix is the data you catch early. Working with DataOps and the data evaluation team, I migrated data validation from AWS EMR to AWS EKS, restructured how often validation runs, and moved checks earlier in the pipeline.",
            },
            {
              type: "paragraph",
              text:
                "In plain terms: EMR and EKS are two ways of renting computing power to run large data jobs. Moving to EKS made it practical to run validation closer to where the data enters the pipeline. Problems now surface earlier, when they are smaller and before they reach the gate. Since the migration, release-blocking failures have dropped by about 40%, and the number keeps improving as our data standards tighten.",
            },
            {
              type: "paragraph",
              text:
                "That has a compounding effect. When more problems are caught early, the large validation jobs further down have fewer failures to deal with, so their results are more predictable and they finish sooner, which saves both time and computing cost. It also changed how builds ship. Instead of waiting for a large validation run to approve every build, we can ship new builds sooner and catch the few failures that get through as they happen. For people using the map, that means faster, more frequent updates.",
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
                "A mass building-generation incident put tens of thousands of buildings into the data. An ML-based automation added buildings that didn't meet our internal specification for inclusion, and gave some of them the wrong attributes, such as exaggerated height and scale.",
            },
            {
              type: "paragraph",
              text:
                "The first job in an incident is scoping the blast radius: how much was affected, and where. I did that with SQL, to count and group the affected buildings, and QGIS, a mapping tool, to look at them on the map and see patterns a query can't show. Then I drove a delete, correct or retain decision on each group.",
            },
            {
              type: "paragraph",
              text:
                "Deciding by group rather than building by building is what made tens of thousands tractable. Once each group was handed to the team that owns it, everything was fixed and cleaned up within two weeks.",
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
        "Neural Newsletters used an LLM to write a personalized version of each article for each reader. The pipeline behind that feature was producing broken output that couldn't ship. The prompt looked like the obvious culprit, but the real problem was underneath it, in the data going in and the database holding it. I rebuilt that layer and hardened the path from ingestion to the reader's screen.",
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
                "In plain terms: articles came in from many sources, were stored in a database, handed to a language model to personalize, and served to the reader through an API. The personalization feature was the product's core, and the pipeline behind it was producing malformed, unshippable output: truncated articles, text from one article showing up in another, odd formatting and stray characters. It processed thousands of articles across recurring runs, so a fault anywhere showed up everywhere.",
            },
          ],
        },
        {
          id: "diagnosis",
          heading: "Why the prompt wasn't the problem",
          blocks: [
            {
              type: "paragraph",
              text:
                "When an LLM produces bad output, the instinct is to rewrite the prompt. I looked at what the model was being given first. Source articles arrived in different formats, some reached the model only half parsed, and fields in the database no longer meant what the code assumed they did.",
            },
            {
              type: "paragraph",
              text:
                "A model can only be as good as its input. No prompt fixes an article that arrives with half its text missing, so the fix had to go below the prompt.",
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
                "I rebuilt the pipeline's data handling and schema from the ground up. The schema is the database's structure: which fields exist and what they mean. Restructuring it removed dead fields that no longer meant anything, and rewriting the queries behind it cut generation latency by 15 to 20%.",
            },
            {
              type: "paragraph",
              text:
                "I also wrote ETL, the step that extracts data from each source, transforms it into one consistent shape and loads it into the database, so every source reached the model looking the same. Parse failures are isolated per article: one bad input is set aside and reported, instead of taking down the whole run.",
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
                "With clean input in place, I owned the LLM integration behind the personalization feature, writing and iterating on prompt logic directly against production behavior to keep outputs accurate and consistent for real readers. Most of that tuning was about structure: getting the model to return its output in exactly the shape the rest of the pipeline expected, every time.",
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
                "Fixing a pipeline once is not the same as keeping it fixed. I set up CI/CD with quality gates and automated tests: every change runs the tests automatically, and a change that fails them can't be deployed. That cut production incidents by about 40%.",
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
                "I designed and built the REST API layer connecting the Elixir Phoenix backend to the React and TypeScript frontend. Generating a personalized article takes a while, so I also built the WebSocket infrastructure that streams live generation status to readers. A WebSocket keeps a connection open between the page and the server, so the page updates the moment an article is ready instead of making the reader refresh. The design balanced how fast updates arrive, how many readers it can hold at once, and what happens when a connection drops.",
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

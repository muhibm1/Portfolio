// Pins the content module to the owner's approved plan (PORTFOLIO_REDESIGN_PLAN.md section 6,
// amended by the owner's resume and the 2026-09-28 rejection notes) and the seven mockups, word
// for word. A failure here means a fact or a string drifted from what the owner approved; only
// he may change portfolioData.js (CLAUDE.md "Protected"). G14 (R138, R146, R153, R154, R155).
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { portfolioData } from "./portfolioData.js";
import { staticRoutePaths } from "../routePaths.js";
// R156's term list and matcher functions live in scripts/forbidden-copy.mjs; this test imports
// them rather than copying them, so a scan against this module stays in step with the scanner
// (interface (h)). The R156 terms are folded into FORBIDDEN_TERMS, so the scan below is a real
// check, not a trivial pass.
import * as forbiddenCopy from "../../scripts/forbidden-copy.mjs";

// ADR 0006's fixed block-type set. A block outside this set is a data bug the template would
// throw on at render.
const KNOWN_BLOCK_TYPES = new Set([
  "paragraph",
  "bullets",
  "flow",
  "cards",
  "stats",
  "table",
  "link-diagram",
  "split",
]);

// Copied verbatim from plan section 4.3 (home stats) and plan section 6 (approved facts table).
const pinnedHomeStats = ["30 to 350+", "2 weeks", "~50%", "~40%", "100%"];

const pinnedRoleDates = [
  "Feb 2025 to present",
  "May 2024 to Feb 2025",
  "Oct 2023 to Mar 2025",
  "Dec 2022 to May 2024",
  "May 2022 to Sep 2022",
];

const pinnedRoleTitles = [
  "Data Engineer",
  "Software Engineer",
  "AI Instructor",
  "Software Consultant",
  "Software Engineering Intern",
];

const pinnedToolkit = [
  "Python, SQL, TypeScript, JavaScript, React, Elixir and Phoenix, Node.js",
  "Spark, Iceberg, Snowflake, Kafka, Airflow, dbt, Postgres, pgvector",
  "Agent orchestration, MCP servers, RAG, hybrid retrieval and reranking, evals, guardrails, prompt injection, human-in-the-loop",
  "AWS (S3, EMR, EKS, Lambda), Docker, Jenkins, CI/CD, OAuth2, REST, WebSockets",
  "Requirements from ambiguous goals, stakeholder partnership, delivery management, teaching, incident response",
];

// R154: the featured card's four values (D52: 40, not 28) and the WorkHorse case-study stats.
const pinnedCaseStudyStats = {
  workhorse: ["28", "9", "5 to 2", "100%"],
  "apple-llm-triage": ["30 to 350+", "2 weeks", "Zero"],
  "apple-integration": ["~50%", "3 systems", "On demand"],
  "apple-data-health": ["Hundreds of thousands", "~40% fewer", "Tens of thousands"],
  "neural-newsletters-llm": ["~40%", "15 to 20%", "Live"],
};

const pinnedFeaturedCardStats = ["100%", "3 of 3", "40", "9"];

// The owner's master copy document (kept outside the repository; docs/sdlc/2026-10-08-align-the-site-to-the-owner-s-master-copy/spec.md "Data" quotes every string), copied verbatim.
const DECISION_TITLE = "A review backlog, turned into an analysis the reviewer can trust";
const DECISION_INTRO =
  "Cross-team data changes were stuck behind a manual review queue, because each request needed real investigation before anyone could approve it. I built an agent that does that investigation and hands the reviewer a documented recommendation. The person still makes the call.";
const DECISION_SITUATION =
  "Changes to certain map data needed a person to review the request before work could continue, and the review was not a rubber stamp. Someone had to pull the surrounding data, check the proposed edit against internal specification, and work out what else the change would affect. The queue grew faster than people could do that. About two months of tickets had piled up, and teams across the pipeline were waiting on them.";
const DECISION_CALLOUT =
  "Find the review step everyone waits on, then separate the investigation from the judgment. Most review bottlenecks are not slow because the decision is hard, they are slow because the work required to make the decision has to be redone by hand every time. Automate that work, leave the judgment with the person accountable for it, and give them the evidence to disagree.";
const PRINCIPLE_ONE =
  "At Apple, a review queue was blocking cross-team data changes. I built an agent that does the investigation and hands the reviewer a documented recommendation, and the backlog hasn't come back.";
const HERO_HEADING = "I find the step everyone is waiting on.";
const HERO_LEAD =
  "Data Engineer at Apple Maps. The platform is rarely the problem, the process around it usually is. So I start by finding where the work actually stalls, scope the fix with the people it affects, and put agents and automation on live data behind guardrails that make them safe to trust. Success is a number that moved; anything short of that is another iteration.";
const RESUME_BULLET =
  "Identified a review bottleneck blocking cross-team data changes, then deployed an agent that evaluates each unlock request against the surrounding geospatial data and internal spec, flags cascading effects, and returns a documented recommendation a reviewer approves or overrides. Two-month backlog cleared in two weeks; 30 to 350+ tickets a day.";
const DECISION_FLOW_TITLES = [
  "Unlock request",
  "Geospatial snapshot, the target feature and its neighbors",
  "Check against internal specification",
  "Impact and cascade analysis",
  "Documented recommendation",
  "Reviewer decides",
];
const DECISION_BUILT_PARAGRAPHS = [
  "An agent reads each unlock request, pulls a snapshot of the feature to be edited along with the features around it, checks the proposed edit against internal specification, and works through what else the change would touch, including effects that would only show up downstream. It returns a recommendation, unlock or keep locked, with the reasoning and the evidence behind it.",
  "It does not act on that recommendation. A reviewer reads the analysis and makes the decision, which is the point: the hard part of this review was never the decision, it was the work required before anyone could make one.",
  "I selected an open-source model, built the agent around it, and own it end to end. Launch was not the end of the work. I keep tuning the analysis and the system's scope against how it performs on live requests.",
];
const DECISION_WHY_PARAGRAPHS = [
  "The agent has no authority to change anything. It produces an assessment, and every recommendation carries the reasoning and the evidence that produced it, so a reviewer can disagree with it on the merits rather than taking it on faith.",
  "That line is deliberate rather than cautious. These requests carry consequences that are not always visible at the point of the edit, and a system that cannot be questioned is not one a reviewer should be asked to trust.",
];
const DECISION_CHANGED_PARAGRAPHS = [
  "Since going live in November 2025, two months of backlog cleared in two weeks and the queue has stayed at zero. Throughput went from about 30 requests a day to over 350.",
  "The gain did not come from removing the decision, which a person still makes on every request. It came from removing the investigation in front of it. A reviewer now opens a finished assessment instead of assembling one.",
  "The decision this produces is carried out by a separate tool I built, covered in the next case study.",
];
const INTEGRATION_CROSS_REFERENCE =
  "The judgment behind these requests is covered in the previous case study. This one is about what happens after the decision is made.";

// Copied verbatim from the committed mockups in docs/design/redesign-2026-09/ (owner-approved
// copy) and R155, amended where R154/R155 give an exact new string.
const pinnedCaseStudyNarratives = {
  workhorse: {
    eyebrow: "Case study · Personal system · Agentic AI · Active",
    title: "WorkHorse: AI-built software you can audit",
    lead:
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
    calloutEyebrow: "What I'd bring to a client",
    calloutText:
      "Measure before asserting, put the non-negotiables in code, and cut whatever the numbers don't support. That's how I'd bring AI into a client's delivery process without asking anyone to trust it blindly.",
    contactHeading: "Want to talk through WorkHorse? I reply to email within a day.",
  },
  "apple-llm-triage": {
    eyebrow: "Case study · Apple Maps · Data Health team · Feb 2025 to present",
    title: "A review backlog, turned into an analysis the reviewer can trust",
    lead: DECISION_INTRO,
    atAGlance: [
      { label: "My role", value: "Self-initiated; selected the model, built, deployed and own it" },
      { label: "Live since", value: "November 2025" },
      { label: "Stack", value: "Python, open-source LLM, REST APIs" },
      { label: "Status", value: "In production, human in the loop by design" },
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText: DECISION_CALLOUT,
    contactHeading: "Have a queue like this? I reply within a day.",
  },
  "apple-integration": {
    eyebrow: "Case study · Apple Maps · Systems integration · Feb 2025 to present",
    title: "Three systems, one tool, half the turnaround",
    lead:
      "Locking and unlocking permissions on protected map features already worked, but it ran on long command-line scripts and extra tickets raised just to carry the change. I built a Python tool that does it on demand through the ticketing, repository and geo-data systems' own authenticated APIs, and records why each change was made.",
    atAGlance: [
      { label: "My role", value: "Built it end to end" },
      { label: "Systems", value: "Ticketing, code repository, geo-data" },
      { label: "Stack", value: "Python, REST APIs, OAuth2" },
      {
        label: "Result",
        value: "A script-driven process replaced by access on demand, with the reason recorded",
      },
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText:
      "Integrations tend to break on auth and permissions, not on the code in between. I've done that unglamorous part: getting separate systems to trust one tool, and keeping them trusting it when authentication changes underneath. The same instinct applies to the context around a system: the question someone will ask in six months is usually why is this like this, and that answer is cheapest to capture at the moment the change is made.",
    contactHeading: "Systems that don't talk to each other? Let's talk.",
  },
  "apple-data-health": {
    eyebrow: "Case study · Apple Maps · Data reliability · Feb 2025 to present",
    title: "Keeping a 50+ region data pipeline shippable",
    lead:
      "Apple's Data Health team helps set the data quality and engineering standards for a pipeline spanning more than 50 regions. My part is keeping bad data from blocking releases: fixing it on live data, stopping it at the gate, and cleaning up fast when something slips through.",
    atAGlance: [
      { label: "My role", value: "Data Engineer, Data Health team" },
      { label: "Partners", value: "DataOps and the data evaluation team" },
      { label: "Stack", value: "Python, Jenkins, Spark, Iceberg on S3, Snowflake, AWS EMR and EKS" },
      { label: "Incident tools", value: "SQL, QGIS" },
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText:
      "Bad data shows up in three places: already live, at the gate, and in an incident. I've owned all three at a scale of 50+ regions, and I've seen what moving a check upstream buys you: about 40% fewer release-blocking failures at the gate.",
    contactHeading: "Data you can't trust yet? Let's talk.",
  },
  "neural-newsletters-llm": {
    eyebrow: "Case study · Neural Newsletters · Software Engineer · May 2024 to Feb 2025",
    title: "Rebuilding an LLM content pipeline that shipped broken output",
    lead:
      "Neural Newsletters used an LLM to personalize content for each reader, and the generation pipeline behind it was producing malformed output that couldn't ship. I diagnosed it, rebuilt the data handling and schema underneath, and hardened the path from ingestion to the reader's screen.",
    atAGlance: [
      { label: "My role", value: "Owned the LLM integration end to end" },
      { label: "Worked with", value: "The CTO, on turning business goals into requirements" },
      { label: "Stack", value: "Elixir and Phoenix, Postgres, TypeScript and React, WebSockets" },
      { label: "Scale", value: "Thousands of articles across recurring runs" },
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText:
      "When an LLM feature misbehaves, the fix is often underneath it: the data going in and the schema holding it. I look there before blaming the prompt, and I own the path all the way to the user's screen.",
    contactHeading: "An LLM feature that won't behave? Let's talk.",
  },
};

// R154's seven MCP paragraphs, in order, word for word.
const pinnedMcpParagraphs = [
  "Studbook also runs as an MCP server, so other agents can query the engineering record mid run and look up a past decision instead of re-deriving it. The server lives in the Studbook repository.",
  "Its answers were proved identical to the direct path over 40 evaluation questions: the same passages in the same order, scores within 0.0001, identical model requests. That check runs in CI.",
  "The first version missed a requirement written before the work started, and my own ship gate rejected it.",
  "The fix was per-session connection reuse and removing a duplicated model pass. Reworked and merged, with the results proved identical over the same 40 test questions.",
  "By default it answers only from decided documents, so an agent cannot cite its own in-flight proposal as settled fact.",
  "WorkHorse built it end to end, with 12 of 12 review findings fixed before approval.",
  "Every query runs as a read-only Postgres role under row-level security, connections are pinned to one certificate authority, credentials are never written to a log, and retrieved text reaches the model as data rather than instructions, so a document cannot hijack the agent reading it.",
];

// R154, D44: the mockup's line 177, verbatim.
const pinnedPaddockParagraph =
  "Paddock, the desktop app, runs the same query path in TypeScript. A parity gate checks it against the Python reference on every dev question, and it caught two bugs a careful port would have shipped: a reranker silently truncating long inputs, and a database connection that was encrypted but never authenticated.";

// R154, D41, D50: the tally sentence, and D43/D47/D53's closing sentence.
const pinnedMeasuredFirstParagraph =
  "I didn't redesign from impressions. Timestamps from the first version showed that two thirds of the wall-clock time was a person waiting at checkpoints with nothing to decide. So I cut five gates to two, added a clock to every run, halved the agent sessions, capped document sizes, and moved reviewer fixes ahead of the ship document. Then I put five real changes through it, including one on a live web app with authentication, two on this site and the MCP server inside Studbook.";
const pinnedMeasuredLastParagraph =
  "The first four runs each held the rules: only the designed human approvals, no questions mid-run, and no ship document presented with an open finding. Every defect they found was fixed and tested the same day, and nine releases came out of those four runs.";

// R154: the four `measured` stat cards, D41/D47/D50/D51/D53/D42.
const pinnedMeasuredStats = [
  { value: "5 of 5", label: "real changes merged, tested and documented" },
  { value: "40", label: "review findings fixed before a person signed off" },
  { value: "70", label: "new tests and eval cases written in the first four runs" },
  { value: "1 of 5", label: "rejected at the ship gate, then reworked and merged" },
];

// R154, D50: the first and fourth rows are the mockup's, unchanged; the fifth row is new.
const pinnedMeasuredTableRow1 = [
  "Live web app with auth: moderation API type fix",
  "Merged; the build went green for the first time in 17 days; 9 findings fixed before sign-off.",
];
const pinnedMeasuredTableRow4 = [
  "Test service: README endpoints section",
  "Done; 11 tests; 3 findings fixed before sign-off.",
];
const pinnedMeasuredTableRow5 = [
  "Studbook: MCP server for agents",
  "Rejected once at the ship gate against a requirement written before the work started; reworked and merged; 12 of 12 findings fixed before approval.",
];

// D32 as amended by D52 (the owner did not keep 28) and the mockup's mobile tag.
const pinnedFeaturedMobileTags = ["100% faithful", "40 findings fixed pre sign-off"];

// D32: the Studbook split stats.
const pinnedStudbookSplitStats = ["100%", "3 of 3", "2 to 11", "9 of 12"];

const pinnedRepositories = {
  workhorse: "https://github.com/muhibm1/workhorse-snapshot",
  studbook: "https://github.com/muhibm1/studbook-snapshot",
  paddock: "https://github.com/muhibm1/paddock-snapshot",
};

// R138: FastAPI is now permitted (it names a real fact in the Stack line); Kubernetes stays
// banned because it names no approved fact.
const bannedSkillWords = ["Kubernetes", "Databricks", "Delta Lake", "fine-tuning", "TensorFlow", "NiFi", "MLOps"];

// R138, D50: never "my", "mine" or "client" in the run record; the one "my own" the page keeps
// (D55, the MCP paragraph "my own ship gate") sits outside the `measured` block, so this regex
// is only ever run against `measured` paragraphs, stat labels and table cells.
const NO_OWNERSHIP_OR_CLIENT_WORDS = /\b(my|mine|client)\b/i;

// Overlay 8.5: no string about WorkHorse or Studbook implies users, a team or adoption.
const NO_USERS_WORDS = /\b(users|customers|adopted|used by|team|teams|our)\b/i;

const NO_PERCENTAGE_OTHER_THAN_100 = /(?<!100)%|\bpercent\b/i;

function collectStrings(value) {
  if (typeof value === "string") return [value];
  if (value === null || typeof value !== "object") return [];
  return Object.values(value).flatMap(collectStrings);
}

function collectBlocks(caseStudy) {
  return caseStudy.sections.flatMap((section) => section.blocks);
}

function findCaseStudy(id) {
  return portfolioData.caseStudies.find((study) => study.id === id);
}

function findSection(caseStudy, id) {
  return caseStudy.sections.find((section) => section.id === id);
}

// The `measured` section's own paragraphs, stat labels and table cells only (D50's ownership
// ban is scoped here; it never reaches the `mcp` paragraphs or the "My role" at-a-glance labels).
function measuredStrings(workhorse) {
  const measured = findSection(workhorse, "measured");
  return measured.blocks.flatMap((block) => {
    if (block.type === "paragraph") return [block.text];
    if (block.type === "stats") return block.items.map((item) => item.label);
    if (block.type === "table") return block.rows.flatMap((row) => row.cells);
    return [];
  });
}

// Overlay 8.5's scope: the WorkHorse case study, the featured card, the "Building WorkHorse"
// line and principles 03 and 04.
function workhorseAndStudbookStrings(data) {
  const workhorse = data.caseStudies.find((study) => study.id === "workhorse");
  const buildingWorkHorse = data.home.hero.rightNow.items.find(
    (item) => item.title === "Building WorkHorse",
  );
  const principles03and04 = data.home.principles.items.filter((item) =>
    ["03", "04"].includes(item.number),
  );

  return [
    ...collectStrings(workhorse),
    ...collectStrings(buildingWorkHorse),
    ...collectStrings(principles03and04),
  ];
}

describe("portfolioData", () => {
  it("names / then /work then /work/<id> for the five case studies in plan order (R127, G1)", () => {
    expect(staticRoutePaths(portfolioData.caseStudies)).toEqual([
      "/",
      "/work",
      "/work/workhorse",
      "/work/apple-llm-triage",
      "/work/apple-integration",
      "/work/apple-data-health",
      "/work/neural-newsletters-llm",
    ]);
    expect(portfolioData.caseStudies.map((study) => study.id)).toEqual([
      "workhorse",
      "apple-llm-triage",
      "apple-integration",
      "apple-data-health",
      "neural-newsletters-llm",
    ]);
  });

  it("has no projects, demos, telemetry or philosophy key (R128)", () => {
    expect(portfolioData).not.toHaveProperty("projects");
    expect(portfolioData).not.toHaveProperty("demos");
    expect(portfolioData).not.toHaveProperty("telemetry");
    expect(portfolioData).not.toHaveProperty("philosophy");
  });

  it("has no resume key or control text anywhere in the module (R151)", () => {
    expect(portfolioData.personal).not.toHaveProperty("resumeFileName");
    expect(portfolioData.home.hero).not.toHaveProperty("secondaryCta");
    expect(portfolioData.home.experience).not.toHaveProperty("resumeLinkText");
    expect(portfolioData.home.contact).not.toHaveProperty("resumeButton");
    expect(portfolioData.home.contact).not.toHaveProperty("githubButton");
    expect(collectStrings(portfolioData).join(" ")).not.toMatch(/\bresume\b/i);
  });

  it("carries the five pinned home stat values in order (R138, G14)", () => {
    expect(portfolioData.home.stats.items.map((item) => item.value)).toEqual(pinnedHomeStats);
  });

  it("carries the five pinned role date strings and titles in order (R138, G14)", () => {
    expect(portfolioData.home.experience.roles.map((role) => role.period)).toEqual(
      pinnedRoleDates,
    );
    expect(portfolioData.home.experience.roles.map((role) => role.title)).toEqual(
      pinnedRoleTitles,
    );
  });

  it("carries the five pinned toolkit lists in order (R138, G14)", () => {
    expect(portfolioData.home.toolkit.columns.map((column) => column.items)).toEqual(
      pinnedToolkit,
    );
  });

  it("carries every case study's pinned stat values in order (R138, G14)", () => {
    for (const study of portfolioData.caseStudies) {
      expect(study.stats.map((stat) => stat.value)).toEqual(pinnedCaseStudyStats[study.id]);
    }
  });

  it("carries the featured WorkHorse card's four pinned stat values and mobile tag (R154, D52, G7)", () => {
    const workhorse = portfolioData.caseStudies[0];
    expect(workhorse.card.stats.map((stat) => stat.value)).toEqual(pinnedFeaturedCardStats);
    expect(workhorse.card.mobileTags).toEqual(pinnedFeaturedMobileTags);
  });

  it("carries each case study's pinned eyebrow, title, lead, at-a-glance, callout and contact heading, word for word from the mockups (G14)", () => {
    for (const study of portfolioData.caseStudies) {
      const narrative = pinnedCaseStudyNarratives[study.id];

      expect(study.eyebrow).toBe(narrative.eyebrow);
      expect(study.title).toBe(narrative.title);
      expect(study.intro).toBe(narrative.lead);
      expect(study.atAGlance).toEqual(narrative.atAGlance);
      expect(study.callout.eyebrow).toBe(narrative.calloutEyebrow);
      expect(study.callout.text).toBe(narrative.calloutText);
      expect(study.contactHeading).toBe(narrative.contactHeading);
    }
  });

  it("carries the integration page's situation, built and changed paragraphs verbatim (R160)", () => {
    const integration = findCaseStudy("apple-integration");
    const builtParagraph = findSection(integration, "built").blocks.find(
      (block) => block.type === "paragraph",
    );

    expect(findSection(integration, "situation").blocks[0].text).toBe(
      "Locking and unlocking protected map data already worked, but the path was hostile: long command-line invocations, extra tickets raised just to carry the change, and enough setup that a routine request was easy to get wrong. None of it required judgment, only care.",
    );
    expect(builtParagraph.text).toBe(
      "A Python tool that locks and unlocks map feature edit permissions on demand. It works through each system's authenticated REST API, so no one has to change the tools they already use, and every lock or unlock carries a comment explaining why, so the next person who asks why a feature is locked finds the answer on the feature itself.",
    );
    expect(findSection(integration, "changed").blocks[0].text).toBe(
      "A script-driven process became access control on demand, turnaround on lock and unlock requests dropped by about 50%, and every change now leaves behind the reason it was made.",
    );
    expect(integration.stats[2]).toEqual({
      value: "On demand",
      label: "instead of hand-run scripts",
    });
  });

  it("keeps every integration element the change request lists as unchanged (R160)", () => {
    const integration = findCaseStudy("apple-integration");

    expect(integration.title).toBe("Three systems, one tool, half the turnaround");
    expect(integration.card.title).toBe("Three systems, one tool, half the turnaround");
    expect(integration.card.linkText).toBe("Read the case study");
    expect(integration.eyebrow).toBe(
      "Case study · Apple Maps · Systems integration · Feb 2025 to present",
    );
    expect(integration.atAGlance.slice(0, 3)).toEqual([
      { label: "My role", value: "Built it end to end" },
      { label: "Systems", value: "Ticketing, code repository, geo-data" },
      { label: "Stack", value: "Python, REST APIs, OAuth2" },
    ]);
    expect(integration.stats.slice(0, 2)).toEqual([
      { value: "~50%", label: "faster turnaround on lock and unlock requests" },
      { value: "3 systems", label: "connected through their own authenticated APIs" },
    ]);
    expect(findSection(integration, "built").blocks[0]).toEqual({
      type: "link-diagram",
      left: { title: "Ticketing system", note: "The request and its status" },
      edge: "OAuth2 · REST",
      hub: { title: "The tool", note: "Python" },
      right: [{ title: "Code repository" }, { title: "Geo-data system" }],
    });
    expect(findSection(integration, "hard").blocks[0].text).toBe(
      "Getting three separate systems to accept one tool was most of the work. When the tool's original authentication path was deprecated, I moved it to OAuth2 and worked through the permission errors that cascaded across the systems as a result.",
    );
    expect(integration.disclaimer).toBe(
      "Details are limited to what I can share publicly. Internal system names are withheld.",
    );
    expect(integration.contactHeading).toBe("Systems that don't talk to each other? Let's talk.");
  });

  it("carries the decision page's new situation opening and keeps its lead, card and principle 01 (R161)", () => {
    const decision = findCaseStudy("apple-llm-triage");
    const situationBlocks = findSection(decision, "situation").blocks;

    expect(situationBlocks[0].text).toBe(DECISION_SITUATION);
    expect(situationBlocks[1].text).toBe(
      "Building a fix was not part of my assigned role. I took it on anyway.",
    );
    expect(decision.intro).toBe(pinnedCaseStudyNarratives["apple-llm-triage"].lead);
    expect(decision.card.title).toBe(DECISION_TITLE);
    expect(portfolioData.home.principles.items[0]).toEqual({
      number: "01",
      title: "Find the step everyone waits on",
      text: PRINCIPLE_ONE,
    });
  });

  it("keeps tens of thousands as the incident count in all three places (R162)", () => {
    const appleRole = portfolioData.home.experience.roles.find((role) =>
      role.highlights?.some((text) => text.includes("building-generation incident")),
    );
    const dataHealth = findCaseStudy("apple-data-health");
    const incidentText = findSection(dataHealth, "incident").blocks[0].text;

    expect(appleRole.highlights.join(" ")).toContain(
      "led response to a building-generation incident affecting tens of thousands of buildings.",
    );
    expect(dataHealth.stats[2]).toEqual({
      value: "Tens of thousands",
      label: "buildings triaged in one incident I led",
    });
    expect(incidentText).toContain("put tens of thousands of buildings into the data");
  });

  it("never says cross-team, crossed team or fully manual on the integration page (R165)", () => {
    const integrationText = collectStrings(findCaseStudy("apple-integration")).join(" ");

    expect(integrationText).not.toMatch(/cross-team|crossed team|fully manual/i);
  });

  it("carries the Data Health incident paragraph verbatim and never says restricted geospatial (R169)", () => {
    const incident = findSection(findCaseStudy("apple-data-health"), "incident");

    expect(incident.heading).toBe("When it breaks at scale");
    expect(incident.blocks).toEqual([
      {
        type: "paragraph",
        text:
          "A mass building-generation incident put tens of thousands of buildings into the data. I scoped the blast radius with SQL and QGIS and drove a delete, correct or retain decision on each group.",
      },
    ]);
    expect(collectStrings(portfolioData).join("\n")).not.toMatch(/restricted geospatial/i);
  });

  it("carries the integration homepage card summary verbatim (R170)", () => {
    expect(findCaseStudy("apple-integration").card.summary).toBe(
      "Locking and unlocking permissions on protected map features ran on long command-line scripts. I replaced it with one tool that does it on demand and records why each change was made.",
    );
  });

  it("carries no callout note on the WorkHorse study (D24, D25)", () => {
    expect(portfolioData.caseStudies[0].callout).not.toHaveProperty("note");
  });

  it("carries the seven pinned MCP paragraphs in order, after the studbook section (R154)", () => {
    const workhorse = portfolioData.caseStudies[0];
    const mcp = findSection(workhorse, "mcp");

    expect(workhorse.sections.map((section) => section.id)).toContain("mcp");
    expect(workhorse.sections.findIndex((s) => s.id === "mcp")).toBeGreaterThan(
      workhorse.sections.findIndex((s) => s.id === "studbook"),
    );
    expect(mcp.eyebrow).toBe("Inside WorkHorse");
    expect(mcp.heading).toBe("An MCP server over the record");
    expect(mcp.blocks.map((block) => block.text)).toEqual(pinnedMcpParagraphs);
  });

  it("carries the Paddock paragraph verbatim, with Paddock linked to its snapshot (R154, D44)", () => {
    const studbook = findSection(portfolioData.caseStudies[0], "studbook");
    const paddockBlock = studbook.blocks.find((block) => block.text === pinnedPaddockParagraph);

    expect(paddockBlock).toBeDefined();
    expect(paddockBlock.link).toEqual({ text: "Paddock", href: pinnedRepositories.paddock });
  });

  it("carries the `measured` first and last paragraphs verbatim, five runs and the first-four-run closing sentence (R154, D41, D43, D47, D50, D53)", () => {
    const measured = findSection(portfolioData.caseStudies[0], "measured");
    const paragraphs = measured.blocks.filter((block) => block.type === "paragraph");

    expect(paragraphs[0].text).toBe(pinnedMeasuredFirstParagraph);
    expect(paragraphs[paragraphs.length - 1].text).toBe(pinnedMeasuredLastParagraph);
  });

  it("carries the `measured` section's four pinned stat cards (R154, D41, D42, D47, D50, D51, D53)", () => {
    const measured = findSection(portfolioData.caseStudies[0], "measured");
    const statsBlock = measured.blocks.find((block) => block.type === "stats");

    expect(statsBlock.items).toEqual(pinnedMeasuredStats);
  });

  it("carries the `measured` table's five rows, the first, fourth and fifth as pinned (R154, D50)", () => {
    const measured = findSection(portfolioData.caseStudies[0], "measured");
    const tableBlock = measured.blocks.find((block) => block.type === "table");

    expect(tableBlock.rows).toHaveLength(5);
    expect(tableBlock.rows[0].cells).toEqual(pinnedMeasuredTableRow1);
    expect(tableBlock.rows[3].cells).toEqual(pinnedMeasuredTableRow4);
    expect(tableBlock.rows[4].cells).toEqual(pinnedMeasuredTableRow5);
  });

  it("never says my, mine or client in the `measured` section's paragraphs, stat labels or table cells (R138, D50)", () => {
    for (const text of measuredStrings(portfolioData.caseStudies[0])) {
      expect(text).not.toMatch(NO_OWNERSHIP_OR_CLIENT_WORDS);
    }
  });

  it("keeps 'my own ship gate' in the MCP story, the one exception D55 names", () => {
    const mcp = findSection(portfolioData.caseStudies[0], "mcp");
    const allMcpText = mcp.blocks.map((block) => block.text).join(" ");

    expect(allMcpText).toContain("my own ship gate");
  });

  it("keeps the five 'My role' at-a-glance labels, outside the ownership ban's scope (D55)", () => {
    const myRoleLabels = portfolioData.caseStudies.map(
      (study) => study.atAGlance.find((row) => row.label === "My role")?.value,
    );

    expect(myRoleLabels.filter(Boolean)).toHaveLength(5);
  });

  it("carries the Studbook split stats in order (D32, G14)", () => {
    const studbook = findSection(portfolioData.caseStudies[0], "studbook");
    const splitBlock = studbook.blocks.find((block) => block.type === "split");

    expect(splitBlock.stats.items.map((item) => item.value)).toEqual(pinnedStudbookSplitStats);
    expect(splitBlock.table.rows.at(-1).cells[0]).toBe("Hybrid + reranker, pool of 10 (shipped)");
  });

  it("names personal.repositories with the three snapshot URLs, held once (R153)", () => {
    expect(portfolioData.personal.repositories).toEqual(pinnedRepositories);
  });

  it("carries the WorkHorse case study's codeLink and the hero's codeLine (R153, R154)", () => {
    expect(portfolioData.caseStudies[0].codeLink).toEqual({
      label: "Code: workhorse-snapshot",
      href: pinnedRepositories.workhorse,
    });
    expect(portfolioData.home.hero.codeLine).toEqual({
      text: "The code is public on GitHub",
      href: portfolioData.personal.github,
    });
  });

  it("has every paragraph link.text occur exactly once in its own text (interface (f), R153)", () => {
    for (const study of portfolioData.caseStudies) {
      for (const block of collectBlocks(study)) {
        if (block.type !== "paragraph" || !block.link) continue;

        const occurrences = block.text.split(block.link.text).length - 1;
        expect(occurrences).toBe(1);
      }
    }
  });

  it("never implies WorkHorse or Studbook has users, a team or adoption (overlay 8.5, R138)", () => {
    for (const text of workhorseAndStudbookStrings(portfolioData)) {
      expect(text).not.toMatch(NO_USERS_WORDS);
    }
  });

  it("never writes a percentage other than 100% about WorkHorse or Studbook (R138)", () => {
    for (const text of workhorseAndStudbookStrings(portfolioData)) {
      expect(text).not.toMatch(NO_PERCENTAGE_OTHER_THAN_100);
    }
  });

  it("matches no R156 term already carried by scripts/forbidden-copy.mjs, timing and Paddock patterns included once T16 folds them (R129, R156, G14)", () => {
    const matchers = forbiddenCopy.buildMatchers(forbiddenCopy.FORBIDDEN_TERMS);
    const allText = collectStrings(portfolioData).join("\n");

    expect(forbiddenCopy.termsFoundIn(allText, matchers)).toEqual([]);
  });

  it("writes no absolute timing figure of the owner's own tools anywhere in the module (D26, D36)", () => {
    // Mirrors R156's "timing figure" pattern definition directly, so this check is real today
    // and does not depend on scripts/forbidden-copy.mjs exporting the pattern under a given name.
    const timingFigure = /\b\d+(?:\.\d+)?\s?(?:ms|milliseconds?|seconds?)\b|\b\d+\.\d+s\b/i;
    const allText = collectStrings(portfolioData).join("\n");

    expect(allText).not.toMatch(timingFigure);
  });

  it("never says Paddock is retired, deprecated or dropped (R138, R156, D44)", () => {
    // Mirrors R156's "Paddock retirement wording" pattern: paddock and a retirement word in the
    // same sentence, either order, case-insensitive.
    const retirementWords = /retired|retire\b|retirement|deprecated|dropped|dropping|discontinued|abandoned/i;
    const sentences = collectStrings(portfolioData).join(" ").split(/(?<=[.!?])\s+/);

    for (const sentence of sentences) {
      if (/paddock/i.test(sentence)) {
        expect(sentence).not.toMatch(retirementWords);
      }
    }
  });

  it("writes the edX bullet as 1:1 mentorship, never 1 Technical Mentorship (R138, G14)", () => {
    const edx = portfolioData.home.experience.roles.find((role) => role.company === "edX");
    const bulletText = edx.highlights.join(" ");

    expect(bulletText).toContain("1:1 mentorship");
    expect(collectStrings(portfolioData).join(" ")).not.toContain("1 Technical Mentorship");
  });

  it("never says Architected or claims a skill outside the toolkit lists (R138, G14)", () => {
    const allText = collectStrings(portfolioData).join(" ");

    expect(allText).not.toContain("Architected");
    for (const bannedWord of bannedSkillWords) {
      expect(allText).not.toContain(bannedWord);
    }
    expect(allText).not.toMatch(/\bGo\b/);
  });

  it("permits FastAPI as an approved fact (overlay rule 6, R138)", () => {
    expect(collectStrings(portfolioData).join(" ")).toContain("FastAPI");
  });

  it("uses only block types from the ADR 0006 fixed set (ADR 0006, G14)", () => {
    for (const study of portfolioData.caseStudies) {
      for (const block of collectBlocks(study)) {
        expect(KNOWN_BLOCK_TYPES.has(block.type)).toBe(true);
      }
    }
  });

  it("carries the disclaimer only on Decision, Integration and Data Health (R135)", () => {
    const withDisclaimer = portfolioData.caseStudies
      .filter((study) => Boolean(study.disclaimer))
      .map((study) => study.id);

    expect(withDisclaimer).toEqual(["apple-llm-triage", "apple-integration", "apple-data-health"]);
  });

  it("contains no em dash or en dash anywhere in the module (plan rule 4)", () => {
    const allText = collectStrings(portfolioData).join("");

    expect(allText).not.toMatch(/[–—]/);
  });

  it("publishes no phone number", () => {
    const phoneNumberPattern = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}/;
    const phoneLikeStrings = collectStrings(portfolioData).filter((text) =>
      phoneNumberPattern.test(text),
    );

    expect(portfolioData.personal).not.toHaveProperty("phone");
    expect(phoneLikeStrings).toEqual([]);
  });

  it("names the owner's GitHub and LinkedIn profiles", () => {
    const { personal } = portfolioData;

    expect(personal.github).toBe("https://github.com/muhibm1");
    expect(personal.linkedin).toBe("https://www.linkedin.com/in/muhibm1/");
    expect(personal.email).toBe("mmalqaim@gmail.com");
  });

  it("carries the document's hero h1 and lead word for word, with the mobile lead identical (R1)", () => {
    const { hero } = portfolioData.home;

    expect(hero.heading).toBe(HERO_HEADING);
    expect(hero.lead).toBe(HERO_LEAD);
    expect(hero.mobileLead).toBe(hero.lead);
    for (const text of [hero.heading, hero.lead, hero.mobileLead]) {
      expect(text).not.toMatch(/messy|\bvia\b|[–—]/i);
    }
  });

  it("carries the decision study's section 4a copy verbatim, including the throughput explanation (R4)", () => {
    const decision = findCaseStudy("apple-llm-triage");
    const paragraphsOf = (id) =>
      findSection(decision, id)
        .blocks.filter((block) => block.type === "paragraph")
        .map((block) => block.text);

    expect(decision.card.eyebrow).toBe("Apple Maps · Decision support agent");
    expect(decision.card.title).toBe(DECISION_TITLE);
    expect(decision.card.summary).toBe(DECISION_INTRO);
    expect(decision.eyebrow).toBe("Case study · Apple Maps · Data Health team · Feb 2025 to present");
    expect(decision.title).toBe(DECISION_TITLE);
    expect(decision.intro).toBe(DECISION_INTRO);
    expect(decision.atAGlance).toEqual([
      { label: "My role", value: "Self-initiated; selected the model, built, deployed and own it" },
      { label: "Live since", value: "November 2025" },
      { label: "Stack", value: "Python, open-source LLM, REST APIs" },
      { label: "Status", value: "In production, human in the loop by design" },
    ]);
    expect(decision.stats).toEqual([
      { value: "30 to 350+", label: "tickets a day, more than tenfold the manual rate" },
      { value: "2 weeks", label: "to clear two months of accumulated tickets" },
      { value: "Zero", label: "backlog since launch" },
    ]);
    expect(decision.sections.map((section) => [section.id, section.heading])).toEqual([
      ["situation", "The situation"],
      ["built", "What I built"],
      ["why-a-person-decides", "Why a person still decides"],
      ["people", "Working with the teams"],
      ["changed", "What changed"],
    ]);
    expect(paragraphsOf("situation")).toEqual([
      DECISION_SITUATION,
      "Building a fix was not part of my assigned role. I took it on anyway.",
    ]);
    expect(paragraphsOf("built")).toEqual(DECISION_BUILT_PARAGRAPHS);
    expect(paragraphsOf("why-a-person-decides")).toEqual(DECISION_WHY_PARAGRAPHS);
    expect(paragraphsOf("people")).toEqual([
      "I worked directly with the stakeholder teams who own these requests to decide what the system should handle, and changed its scope as live results came in.",
    ]);
    expect(paragraphsOf("changed")).toEqual(DECISION_CHANGED_PARAGRAPHS);
    expect(decision.callout.text).toBe(DECISION_CALLOUT);
    expect(decision.disclaimer).toBe(
      "Details are limited to what I can share publicly. Internal system names are withheld. I'm glad to go deeper on a call.",
    );
    expect(decision.contactHeading).toBe("Have a queue like this? I reply within a day.");
  });

  it("carries the six-step decision flow with Reviewer decides as the only gate (R5)", () => {
    const flow = findSection(findCaseStudy("apple-llm-triage"), "built").blocks[0];

    expect(flow.type).toBe("flow");
    expect(flow.columns).toBe(6);
    expect(flow.steps.map((step) => step.title)).toEqual(DECISION_FLOW_TITLES);
    expect(flow.steps.some((step) => "note" in step)).toBe(false);
    expect(flow.steps.map((step) => step.gate === true)).toEqual([false, false, false, false, false, true]);
  });

  it("carries the integration cross-reference as the situation's second paragraph (R6)", () => {
    const blocks = findSection(findCaseStudy("apple-integration"), "situation").blocks;

    expect(blocks).toHaveLength(2);
    expect(blocks[1]).toEqual({ type: "paragraph", text: INTEGRATION_CROSS_REFERENCE });
  });

  it("replaces every deciding description with the resume's or document's words (R8)", () => {
    const { home } = portfolioData;

    expect(home.stats.items[0]).toEqual({
      value: "30 to 350+",
      label: "Tickets a day",
      context: "Decision support agent I built at Apple",
      mobileText: "tickets a day, decision support agent at Apple",
    });
    expect(home.hero.rightNow.items[0]).toEqual({
      title: "At Apple Maps",
      text: "Running a decision support agent and data health tooling for a pipeline spanning 50+ regions",
    });
    expect(home.hero.rightNow.items[1].text).toBe(
      "An agentic software delivery pipeline with its own retrieval system. This site was built with it.",
    );
    expect(home.principles.items[0].text).toBe(PRINCIPLE_ONE);
    expect(home.experience.roles[0].company).toBe("Apple Maps");
    expect(home.experience.roles[0].highlights[0]).toBe(RESUME_BULLET);
    expect(home.toolkit.columns[2].items).toBe(
      "Agent orchestration, MCP servers, RAG, hybrid retrieval and reranking, evals, guardrails, prompt injection, human-in-the-loop",
    );
  });

  it("says plugin nowhere and carries the Studbook subtitle, with the MCP and Paddock copy unchanged (R9)", () => {
    const workhorse = findCaseStudy("workhorse");

    expect(collectStrings(workhorse).join("\n")).not.toMatch(/\bplugins?\b/i);
    expect(findSection(workhorse, "studbook").subtitle).toBe(
      "Cited retrieval (RAG) over WorkHorse's engineering record",
    );
    expect(findSection(workhorse, "mcp").blocks.map((block) => block.text)).toEqual(pinnedMcpParagraphs);
  });

  it("names the employer Apple Maps in every slot and never via TCS (R2)", () => {
    const appleStudies = ["apple-llm-triage", "apple-integration", "apple-data-health"].map(findCaseStudy);

    expect(portfolioData.home.experience.roles[0].company).toBe("Apple Maps");
    expect(portfolioData.home.hero.rightNow.items[0].title).toBe("At Apple Maps");
    for (const study of appleStudies) {
      expect(study.eyebrow.startsWith("Case study · Apple Maps · ")).toBe(true);
      expect(study.card.eyebrow.startsWith("Apple Maps · ")).toBe(true);
    }
    expect(collectStrings(portfolioData).join("\n")).not.toContain("(via TCS)");
  });

  it("contains none of the document's banned strings, with cross-team only off the integration page (R3)", () => {
    const banned = [
      /\bTCS\b/i,
      /\bTata\b/i,
      /\bvia\b/i,
      /\bcontractors?\b/i,
      /\bvendors?\b/i,
      /\bconsultanc(?:y|ies)\b/i,
      /\bplugins?\b/i,
      /\bmessy\b/i,
      /approve, reject or hold/i,
      /\bdecision layer\b/i,
      /\bacts? on live data\b/i,
      /\bdecision systems?\b/i,
      /tickets decided/i,
      /decides each ticket/i,
      /self-hosted/i,
      /\bOllama\b/i,
      /eleven times/i,
      /(?<!\d)0 rejected\b|\bzero rejected\b/i,
    ];
    const allText = collectStrings(portfolioData).join("\n");

    for (const pattern of banned) {
      expect(allText).not.toMatch(pattern);
    }
    expect(collectStrings(findCaseStudy("apple-integration")).join("\n")).not.toMatch(/cross[- ]teams?/i);
    expect(findCaseStudy("apple-llm-triage").intro).toMatch(/cross-team/i);
  });

  it("uses only the approved numerals on the decision study (R4, item 12)", () => {
    const text = collectStrings(findCaseStudy("apple-llm-triage")).join("\n");
    const numerals = new Set(text.match(/\d+/g));

    expect([...numerals].every((numeral) => ["30", "350", "2", "2025"].includes(numeral))).toBe(true);
  });

  it("carries the share image's new aria-label and stat label and no decided wording (R8)", () => {
    const svgPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../docs/design/og.svg");
    const svg = readFileSync(svgPath, "utf8");

    expect(svg).toContain(
      'aria-label="Muhammad Muhibullah, Forward Deployed Engineer. 30 to 350 plus tickets a day."',
    );
    expect(svg).toContain('class="stat-label">Tickets a day</text>');
    expect(svg).not.toMatch(/Tickets decided|decided a day/);
  });

  it("words the Neural step 5 note as Live status over WebSockets (R11)", () => {
    const neural = findCaseStudy("neural-newsletters-llm");
    const neuralFlows = collectBlocks(neural).filter((block) => block.type === "flow");
    const allNotes = portfolioData.caseStudies
      .flatMap(collectBlocks)
      .filter((block) => block.type === "flow")
      .flatMap((block) => block.steps.map((step) => step.note ?? ""));

    expect(neuralFlows.some((flow) => flow.steps[4]?.note === "Live status over WebSockets")).toBe(true);
    for (const note of allNotes) {
      expect(note).not.toMatch(/\bvia\b/i);
    }
  });
});

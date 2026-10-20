// Pins the content module to the owner's approved plan (PORTFOLIO_REDESIGN_PLAN.md section 6,
// amended by the owner's resume and the 2026-09-28 rejection notes) and the seven mockups, word
// for word. A failure here means a fact or a string drifted from what the owner approved; only
// he may change portfolioData.js (CLAUDE.md "Protected"). G14 (R138, R146, R153, R154, R155).
// 2026-10-13: pins moved to the case-study refresh the owner asked for (his case-studies-v2 draft).
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import WalkthroughBlock from "../components/WalkthroughBlock.jsx";
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
  // Added 2026-10-13 for the WorkHorse run-ledger chart: one series per chart, every value also
  // written as text, so the set grows by one renderer with its own test file.
  "bars",
  // Added 2026-10-19 (TG-07) for the Orion walkthrough: a console with a step rail and a figure.
  "walkthrough",
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
  agentops: ["24 of 24", "3 of 24", "23 of 24", "$0.04"],
  flywheel: ["19 to 14", "2 of 2", "3 fixed, 5 broken", "0 broken"],
  esper: ["79%", "0%", "11 of 11", "$0"],
  "apple-llm-triage": ["30 to 350+", "2 weeks", "Zero", "~98%"],
  "apple-integration": ["~50%", "3 systems", "On demand"],
  "apple-data-health": ["Hundreds of thousands", "~40% fewer", "Tens of thousands"],
  "neural-newsletters-llm": ["~40%", "15 to 20%", "Live"],
  // Added 2026-10-19 (TG-07): the Orion study's own four headline results.
  orion: ["0 of 50", "0.82 and 0.83", "27 of 45", "625"],
  // Added 2026-10-20 (TG-08): the Atelier sources hold no measured result, so the study has no stat cards.
  atelier: [],
};

const pinnedFeaturedCardStats = ["100%", "3 of 3", "40", "9"];

// The owner's master copy document (kept outside the repository; docs/sdlc/2026-10-08-align-the-site-to-the-owner-s-master-copy/spec.md "Data" quotes every string), copied verbatim.
const DECISION_TITLE = "A review backlog, turned into an analysis the reviewer can trust";
const DECISION_INTRO =
  "Cross-team data changes were stuck behind a manual review queue, because each request needed real investigation before anyone could approve it. I built an agent that does that investigation and hands the reviewer a documented recommendation. The person still makes the call.";
const DECISION_LEAD =
  "Some map data is protected: before anyone can edit it, a person reviews a request to unlock it. That review was real work, and cross-team data changes piled up behind it. I built an agent that does the investigation for each request and hands the reviewer a documented recommendation with its evidence. The reviewer still makes every call. Throughput went from about 30 requests a day to over 350, and two months of backlog cleared in two weeks.";
const DECISION_SITUATION =
  "Some features in the map, such as buildings and roads, are locked so they can't be edited by accident. When a team needs to change one, they file an unlock request, and someone on our side reviews it before the edit can go ahead.";
const DECISION_SITUATION_PARAGRAPHS = ["Some features in the map, such as buildings and roads, are locked so they can't be edited by accident. When a team needs to change one, they file an unlock request, and someone on our side reviews it before the edit can go ahead.", "The review was not a rubber stamp. For each request someone had to pull up the feature and everything around it, check the proposed edit against internal specification, and work out what else it would affect, including problems that would only show up further down the pipeline. Each review took 5 to 15 minutes, depending on the request, and the team got through about 30 a day. The queue grew faster than that. About two months of tickets had piled up, and teams across the pipeline were waiting on them.", "Building a fix was not part of my assigned role. I took it on anyway."];
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
  "In plain terms: the agent does the homework a reviewer used to do by hand. It reads the request, takes a snapshot of the feature to be edited along with the features around it, and checks the proposed edit against internal specification. Then it works through what else the change would touch, because an edit that looks fine on one feature can break a neighboring one, or something built from it later.",
  "It writes up a recommendation, unlock or keep locked, with the reasoning and evidence behind it, a short summary of what is actually failing, and a proposed fix, and puts it in front of a reviewer. It does not act on that recommendation. The hard part of this review was never the decision. It was the work required before anyone could make one.",
];
const DECISION_WHY_PARAGRAPHS = [
  "The split follows the cost of being wrong. If the write-up misses something, a reviewer reading the evidence can catch it. If unlocking were left to the agent, a miss would go straight into the map. These requests carry consequences that are not always visible at the point of the edit, and a system that cannot be questioned is not one a reviewer should be asked to trust.",
  "That is also why every recommendation carries its reasoning and evidence. A reviewer should be able to disagree with it on the merits, not take it on faith.",
];
const DECISION_CHANGED_PARAGRAPHS = [
  "Since going live in November 2025, two months of backlog cleared in two weeks and the queue has stayed at zero. Throughput went from about 30 requests a day to over 350.",
  "The gain did not come from removing the decision, which a person still makes on every request. It came from removing the investigation in front of it. A reviewer now opens a finished assessment instead of assembling one.",
  "Reviewers agree with its recommendation about 98% of the time. The requests it flags for a closer look are the extreme ones, kinds of request it hasn't seen before, and requests from a team working outside its own scope. That last kind is flagged even when the edit is justified and low risk, because which team owns which part of the work matters as much as whether the edit is sound.",
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
      "AI coding agents can write a feature in minutes. What they rarely leave behind is a reason to trust it: who decided what, what was checked, and what a person actually approved. WorkHorse is the delivery process I built around them. Twenty-eight single-purpose agents take a change from a one-line request to merged, tested and documented code, a person approves at the two moments that matter, and code the agents cannot argue with enforces the rules. This site was built with it.",
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
    calloutEyebrow: "What I'd bring to a client",
    calloutText:
      "Measure before asserting, put the non-negotiables in code, and cut whatever the numbers don't support. That's how I'd bring AI into a client's delivery process without asking anyone to trust it blindly.",
    contactHeading: "Want to talk through WorkHorse? I reply to email within a day.",
  },
  // Added 2026-10-12 with the AgentOps case study, from the agentops repository's README results.
  agentops: {
    eyebrow: "Case study · Personal system · Agentic AI · Incident response",
    title: "AgentOps: an incident agent that can't act alone",
    lead:
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
    calloutEyebrow: "What I'd bring to a client",
    calloutText:
      "A way to put an agent near production without trusting it with production: LangGraph holds the pause, the checkpoints and the replay, code holds the rules, a person makes the change, and the evaluation shows where it fails, not only where it works.",
    contactHeading: "Want an agent near production? Let's talk.",
  },
  // Added 2026-10-13 with the Flywheel case study, from the flywheel and studbook-agent READMEs.
  flywheel: {
    eyebrow: "Case study · Personal system · LLM evaluation · LangSmith",
    title: "Flywheel: an agent's real failures, turned into its tests",
    lead:
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
    calloutEyebrow: "What I'd bring to a client",
    calloutText:
      "A way to take a customer's agent from demos well to provably works: its real failures in LangSmith become reviewed test cases, every change is compared with main case by case, and a red check means a real regression, not model noise.",
    contactHeading: "Have an agent that works in the demo? Let's talk.",
  },
  // Added 2026-10-18 with the Esper case study, from the esper README's stage 5 and 6 sections.
  esper: {
    eyebrow: "Case study · Personal system · Research agent · LangGraph",
    title: "Esper: a research agent that proves every sentence",
    lead:
      "A research agent that writes a confident report is easy to build. One whose every sentence can be traced to a quote on a real page is not, and the difference is the whole value of the thing. Esper is my attempt at the second kind: a LangGraph pipeline where the writer may only use claims a separate checker has verified, code confirms every quote exists on the saved page, and a reviewer and a red team attack the draft before it is delivered. On eleven questions it backed 79% of its sentences with the page it cites, against 29% for LangChain's Open Deep Research and 35% for a single model call.",
    atAGlance: [
      { label: "My role", value: "Designed and built it end to end, with an agent doing the typing" },
      {
        label: "What it is",
        value:
          "A deep research agent whose every sentence cites a quote found on a saved page, with a library that remembers what it verified",
      },
      { label: "Stack", value: "Python, LangGraph, LangSmith, Claude, SQLite, Flywheel" },
      {
        label: "Quality",
        value: "93 tests on a scripted model, CI, and a Flywheel gate that replays 22 recorded runs in under a minute",
      },
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText:
      "A way to make an agent's output checkable rather than merely convincing: claims verified against their sources by a separate step, every sentence tied to a quote code can find, and an honest measurement against the obvious alternatives before anyone relies on it.",
    contactHeading: "Need an agent whose answers can be checked? Let's talk.",
  },
  "apple-llm-triage": {
    eyebrow: "Case study · Apple Maps · Data Health team · Feb 2025 to present",
    title: "A review backlog, turned into an analysis the reviewer can trust",
    lead: DECISION_LEAD,
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
      "Once someone decides a protected map feature can be edited, its permissions have to actually change, in three separate systems. That already worked, but it ran on long command-line scripts and extra tickets raised just to carry the change. I built one Python tool that does it on demand through each system's own authenticated API, and records why each change was made. Turnaround dropped by about half.",
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
      "Apple Maps is built from data covering more than 50 regions, and every release has to pass automated quality checks before it ships. Apple's Data Health team helps set those standards. My part is keeping bad data from blocking releases: fixing it once it's live, stopping it at the gate, and cleaning up fast when something slips through.",
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
      "Neural Newsletters used an LLM to write a personalized version of each article for each reader. The pipeline behind that feature was producing broken output that couldn't ship. The prompt looked like the obvious culprit, but the real problem was underneath it, in the data going in and the database holding it. I rebuilt that layer and hardened the path from ingestion to the reader's screen.",
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
  // Added 2026-10-19 (TG-07): the Orion study's frame, copied from the owner's own Orion document.
  orion: {
    eyebrow: "Case study · Personal system · Code review",
    title: "Orion: early results",
    lead:
      "Orion is a code reviewer for coding agents and the people who work with them. It reads any change and also knows the system around it: what the change reaches downstream, which rules protect those parts, who owns them and what broke there before.",
    atAGlance: [
      { label: "My role", value: "My own project, built and tested in October 2026" },
      {
        label: "What it is",
        value: "A code reviewer for coding agents and the people who work with them",
      },
      { label: "Where it stands", value: "An early, ongoing project" },
      {
        label: "Tested on",
        value:
          "PipelineBench, 45 real historical bugs from 8 open-source projects, and a 625-model warehouse",
      },
    ],
    calloutEyebrow: "Where Orion stands",
    calloutText: "This is an early, ongoing project. Read the results as a first measurement, not a final score.",
    contactHeading: "Hiring for forward deployed engineering? Let's talk.",
  },
  // Added 2026-10-20 (TG-08): the Atelier study's frame, copied from the Atelier README and studio
  // skill; the at-a-glance rows are short labels written for the site.
  atelier: {
    eyebrow: "Case study · Personal system · Design studio",
    title: "Atelier",
    lead:
      "A design studio made of agents. You give it inspiration (screenshots, links, Notion notes, Figma frames) and a brief; it designs websites and web apps with Apple-product-page polish: motion that explains, visuals that pull you in, and pages that stay fast and easy to use.",
    atAGlance: [
      { label: "My role", value: "My own project, built in stages" },
      { label: "What it is", value: "A design studio made of agents" },
      { label: "Where it stands", value: "An ongoing project" },
      { label: "What it makes", value: "Websites and web apps" },
    ],
    calloutEyebrow: "How it runs",
    calloutText: "Everything runs on the subscription in the cloud container. No API key is used anywhere.",
    contactHeading: "Hiring for forward deployed engineering? Let's talk.",
  },
};

// The MCP section's paragraphs, in order, word for word (R154, refreshed 2026-10-13).
const pinnedMcpParagraphs = [
  "MCP, the Model Context Protocol, is a standard way for an AI agent to call an outside tool, the way a USB port is a standard way to plug in a device. Studbook runs as an MCP server, so other agents can query the engineering record mid run and look up a past decision instead of re-deriving it, or worse, contradicting it. The server lives in the Studbook repository.",
  "A second way in is only useful if it gives the same answers as the first. Its answers were proved identical to the direct path over 40 evaluation questions: the same passages in the same order, scores within 0.0001, identical model requests. That check runs in CI.",
  "WorkHorse built it end to end. The first version missed a requirement written before the work started, and my own ship gate rejected it. The fix was per-session connection reuse and removing a duplicated model pass. Reworked and merged, with 12 of 12 review findings fixed before approval and the results proved identical over the same 40 questions.",
  "It now sits inside every run. Before designing a change, the designer and the discovery analyst ask the record what was decided about these files before and what went wrong last time, and get the passages back with where they came from. That only works if a search is fast and free, and at first it was neither: a search took about three seconds.",
  "Measured over the record of all six of my repositories, 3,880 passages, almost all of that time was the reranker, and for an agent it bought nothing: the merged top ten holds a right passage as often as the reranked top eight (recall 0.88 on the dev questions). So the agents' path skips the reranker and reads ten passages, encodes the question on a faster engine with the same model and the same vectors, and loads the models once at start. A search now takes about forty milliseconds and costs nothing. The record is one SQLite file on the machine, the models run locally, and the one paid tool, a written answer from the model, stays off. The hosted Postgres record still works, and is now optional.",
  "By default it answers only from decided documents, so an agent cannot cite its own in-flight proposal as settled fact. On Postgres every query runs as a read-only role under row-level security, connections are pinned to one certificate authority, credentials are never written to a log, and retrieved text reaches the model as data rather than instructions, so a document cannot hijack the agent reading it.",
];

// R154, D41, D50: the tally sentence, and D43/D47/D53's closing sentence.
const pinnedMeasuredFirstParagraph =
  "The first version had five human checkpoints, and it felt safe. I didn't redesign it from impressions. Timestamps from those runs showed that two thirds of the time a change spent in the pipeline was a person waiting at a checkpoint with nothing to decide. More gates were not making it safer, only slower.";
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
  agentops: "https://github.com/muhibm1/agentops-snapshot",
  flywheel: "https://github.com/muhibm1/flywheel",
  studbookAgent: "https://github.com/muhibm1/studbook-agent",
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
  it("names / then /work then /work/<id> for the ten case studies in plan order, Orion fourth and Atelier fifth (R127, G1, TG-08)", () => {
    expect(staticRoutePaths(portfolioData.caseStudies)).toEqual([
      "/",
      "/work",
      "/work/workhorse",
      "/work/agentops",
      "/work/flywheel",
      "/work/orion",
      "/work/atelier",
      "/work/esper",
      "/work/apple-llm-triage",
      "/work/apple-integration",
      "/work/apple-data-health",
      "/work/neural-newsletters-llm",
    ]);
    expect(portfolioData.caseStudies.map((study) => study.id)).toEqual([
      "workhorse",
      "agentops",
      "flywheel",
      "orion",
      "atelier",
      "esper",
      "apple-llm-triage",
      "apple-integration",
      "apple-data-health",
      "neural-newsletters-llm",
    ]);
  });

  it("carries the AgentOps case study second, with its snapshot codeLink and a `measured` section holding its table (2026-10-12)", () => {
    const agentops = findCaseStudy("agentops");

    expect(agentops).toBeDefined();
    expect(portfolioData.caseStudies[1].id).toBe("agentops");
    expect(agentops.codeLink).toEqual({
      label: "Code: agentops-snapshot",
      href: "https://github.com/muhibm1/agentops-snapshot",
    });

    const measured = findSection(agentops, "measured");
    expect(measured).toBeDefined();
    const table = measured.blocks.find((block) => block.type === "table");
    expect(table.columns.map((column) => column.label)).toEqual(["Measure", "AgentOps", "ReAct baseline"]);
    expect(table.rows).toHaveLength(4);
    expect(table.rows[2].cells).toEqual(["Changed nothing without an approval", "24 of 24", "3 of 24"]);
  });

  it("carries the Flywheel case study third, after AgentOps, with its repository codeLink and the AgentOps gate table (2026-10-13)", () => {
    const flywheel = findCaseStudy("flywheel");

    expect(flywheel).toBeDefined();
    expect(portfolioData.caseStudies[2].id).toBe("flywheel");
    expect(flywheel.codeLink).toEqual({
      label: "Code: flywheel",
      href: "https://github.com/muhibm1/flywheel",
    });

    const flow = findSection(flywheel, "how").blocks.find((block) => block.type === "flow");
    expect(flow.steps.map((step) => step.title)).toEqual(["Trace", "Score", "Mine", "Review", "Promote", "Gate"]);
    expect(flow.steps.map((step) => step.gate === true)).toEqual([false, false, false, true, false, false]);

    const table = findSection(flywheel, "agentops").blocks.find((block) => block.type === "table");
    expect(table.rows.map((row) => row.cells.slice(1))).toEqual([
      ["2 of 3", "0 of 3", "Broken"],
      ["3 of 3", "1 of 3", "Broken"],
      ["2 of 3", "1 of 3", "Wobble"],
      ["19 of 21", "14 of 21", "Blocked"],
    ]);

    const studbookLink = findSection(flywheel, "studbook-agent").blocks.find((block) => block.link);
    expect(studbookLink.link).toEqual({
      text: "Studbook agent",
      href: "https://github.com/muhibm1/studbook-agent",
    });
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
      "Locking a map feature protects it from edits; unlocking it lets a specific change go ahead. Doing either meant touching three systems that don't share a login: the ticketing system that holds the request, the code repository, and the geo-data system that holds the feature itself.",
    );
    expect(builtParagraph.text).toBe(
      "In plain terms: the tool reads an approved request from the ticketing system, signs in to the other two systems with the right permissions, changes the lock on the feature, and writes a comment on it saying why. Nobody has to change the tools they already use, because it talks to each system through the official interface each one already offers, its REST API.",
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
      "The code that changes a lock is short. Getting three separate systems to accept one tool was most of the work, because each one has to trust the tool with permissions it guards carefully.",
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
    expect(situationBlocks[2].text).toBe(
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
    expect(incident.blocks).toEqual([{"type": "paragraph", "text": "A mass building-generation incident put tens of thousands of buildings into the data. An ML-based automation added buildings that didn't meet our internal specification for inclusion, and gave some of them the wrong attributes, such as exaggerated height and scale."}, {"type": "paragraph", "text": "The first job in an incident is scoping the blast radius: how much was affected, and where. I did that with SQL, to count and group the affected buildings, and QGIS, a mapping tool, to look at them on the map and see patterns a query can't show. Then I drove a delete, correct or retain decision on each group."}, {"type": "paragraph", "text": "Deciding by group rather than building by building is what made tens of thousands tractable. Once each group was handed to the team that owns it, everything was fixed and cleaned up within two weeks."}]);
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

  it("carries the pinned MCP paragraphs in order, after the studbook section (R154)", () => {
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

  it("keeps the old desktop app out of the Studbook section and the repository list, because the owner removed it on 2026-10-19", () => {
    const studbook = findSection(portfolioData.caseStudies[0], "studbook");
    const studbookText = collectStrings(studbook).join("\n");

    expect(studbookText).not.toMatch(/paddock/i);
    expect(studbook.blocks.some((block) => block.link?.href?.includes("paddock"))).toBe(false);
    expect(Object.keys(portfolioData.personal.repositories)).not.toContain("paddock");
    expect(Object.values(portfolioData.personal.repositories).join(" ")).not.toMatch(/paddock/i);
  });

  it("ends the Studbook section's blocks on the conversations paragraph now that nothing follows it", () => {
    const studbook = findSection(portfolioData.caseStudies[0], "studbook");
    const lastBlock = studbook.blocks.at(-1);

    expect(lastBlock.type).toBe("paragraph");
    expect(lastBlock.text.startsWith("Conversations work too.")).toBe(true);
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

  it("keeps the ten 'My role' at-a-glance labels, outside the ownership ban's scope (D55, TG-08)", () => {
    const myRoleLabels = portfolioData.caseStudies.map(
      (study) => study.atAGlance.find((row) => row.label === "My role")?.value,
    );

    expect(myRoleLabels.filter(Boolean)).toHaveLength(10);
  });

  it("carries the Studbook split stats in order (D32, G14)", () => {
    const studbook = findSection(portfolioData.caseStudies[0], "studbook");
    const splitBlock = studbook.blocks.find((block) => block.type === "split");

    expect(splitBlock.stats.items.map((item) => item.value)).toEqual(pinnedStudbookSplitStats);
    expect(splitBlock.table.rows.at(-1).cells[0]).toBe("Hybrid + reranker, pool of 10 (shipped)");
  });

  it("names personal.repositories with the three snapshot URLs and the two public repositories, held once (R153)", () => {
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

  it("carries the word Paddock nowhere in the content module, because the owner removed it from the site on 2026-10-19", () => {
    // Replaces the 2026-09 rule that Paddock must never be called retired: it is now not
    // mentioned at all, in any sentence, link, key or comment-free string.
    const allText = collectStrings(portfolioData).join("\n");

    expect(allText).not.toMatch(/paddock/i);
    expect(JSON.stringify(portfolioData)).not.toMatch(/paddock/i);
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

  it("gives every bars chart a title and positive values written out as text", () => {
    for (const study of portfolioData.caseStudies) {
      for (const block of collectBlocks(study).filter((b) => b.type === "bars")) {
        for (const chart of block.charts) {
          expect(chart.title).toBeTruthy();
          for (const item of chart.items) {
            expect(item.value).toBeGreaterThan(0);
            expect(item.display).toBeTruthy();
          }
        }
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
    expect(decision.intro).toBe(DECISION_LEAD);
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
      { value: "~98%", label: "of recommendations match the reviewer's decision" },
    ]);
    expect(decision.sections.map((section) => [section.id, section.heading])).toEqual([["situation", "The situation"], ["built", "What I built"], ["who-decides", "Who decides what"], ["model", "Choosing and tuning the model"], ["people", "Working with the teams"], ["changed", "What changed"]]);
    expect(paragraphsOf("situation")).toEqual(DECISION_SITUATION_PARAGRAPHS);
    expect(paragraphsOf("built")).toEqual(DECISION_BUILT_PARAGRAPHS);
    expect(paragraphsOf("who-decides")).toEqual(DECISION_WHY_PARAGRAPHS);
    expect(paragraphsOf("model")).toEqual(["I selected an open-source model, built the agent around it, and own it end to end. Much of the backend it works against is proprietary, so I wanted the agent itself to be platform agnostic. An open-source model isn't tied to one provider's service, so the agent can run wherever the work needs it and move with the systems around it.", "Launch was not the end of the work. I keep tuning the analysis and the system's scope against how it performs on live requests. Two cases took the most work.", "The first was edits to the map's 3D structure. 3D modeling is open ended, and a bad edit can make the map visibly jarring, so these requests are held to a high bar, and the agent scored them almost entirely on what could go wrong. That is the right instinct for a large change and the wrong one for most of these requests, which are minor. So for small 3D edits it now weighs the other side as well: whether a change too small to notice on its own would bring the map in line with Apple's design standards.", "The second was very large features, such as islands and country borders. Because the feature is enormous, any request to edit one raised flags, even when the edit itself was small, like aligning a short stretch of a border. Separating the size of the feature from the size of the change was one of the hardest parts of getting the analysis right."]);
    expect(paragraphsOf("people")).toEqual(["A tool like this only works if the reviewers believe it. I worked directly with the stakeholder teams who own these requests to decide what the system should handle, what it should leave to people, and how its write-up should read so a reviewer could check it quickly. As live results came in, we widened or narrowed its scope together.", "The clearest example came from the teams themselves. At first the agent answered only what the request asked. That wasn't enough. Requests usually arrive early in the GIS life cycle, when an editor has spotted a problem in protected data but hasn't yet worked out its full scope or the right fix. And not every failure is obvious: a check can fail for an unexpected reason, or for a related one its description doesn't cover.", "So every recommendation now includes a short summary of the failure, covering its root cause and how the data is set up, plus a proposed fix based on the model's assessment. What the agent uncovers this way also feeds back into how checks are defined and into our engineering standards."]);
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

  it("carries the integration cross-reference as the situation's last paragraph (R6)", () => {
    const blocks = findSection(findCaseStudy("apple-integration"), "situation").blocks;

    expect(blocks).toHaveLength(3);
    expect(blocks[2]).toEqual({ type: "paragraph", text: INTEGRATION_CROSS_REFERENCE });
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

  it("says plugin nowhere and carries the Studbook subtitle, with the MCP copy unchanged (R9)", () => {
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

  // 5 and 15 (minutes per manual review), 3 (3D edits) and 98 (reviewer agreement) come from the owner's draft.
  it("uses only the approved numerals on the decision study (R4, item 12)", () => {
    const text = collectStrings(findCaseStudy("apple-llm-triage")).join("\n");
    const numerals = new Set(text.match(/\d+/g));

    expect([...numerals].every((numeral) => ["30", "350", "2", "2025", "5", "15", "3", "98"].includes(numeral))).toBe(true);
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

// TG-06: the home page's AgentOps replay reads every word from the homeReplay record.
describe("homeReplay (TG-06)", () => {
  const replay = portfolioData.homeReplay;

  it("lists the nine steps in the order the run takes them", () => {
    expect(replay.steps.map((step) => step.id)).toEqual([
      "alert", "triage", "evidence", "merge", "rca", "approval", "execute", "verify", "postmortem",
    ]);
  });

  it("gives every step a label and a log entry, so the text reads without any animation", () => {
    for (const step of replay.steps) {
      expect(step.label.length).toBeGreaterThan(0);
      expect(replay.log[step.id]).toBeDefined();
    }
  });

  it("names the clean_bad_deploy scenario it is taken from", () => {
    expect(replay.scenario).toBe("clean_bad_deploy");
  });

  it("skips to the AgentOps section on the page", () => {
    expect(replay.skip.href).toBe("#agentops");
  });

  it("never mentions Paddock anywhere in the site data", () => {
    expect(JSON.stringify(portfolioData)).not.toMatch(/paddock/i);
  });
});

// TG-07: the Orion case study. Its words are the owner's own Orion document, copied sentence by
// sentence; a sentence using a word the copy scan bans is left out. Its thirteen walkthrough
// steps come from the approved Look. Every number on the page is one the document states.
describe("the Orion case study (TG-07)", () => {
  const orion = portfolioData.caseStudies.find((study) => study.id === "orion");
  const walkthrough = collectBlocks(orion).find((block) => block.type === "walkthrough");

  // Every figure the owner's document states, as the exact phrase it appears in, so a number cannot
  // be swapped for another one that happens to appear somewhere else (27 of 45 cannot become
  // 21 of 45, although 21 Airflow pipelines is true). Sentences left out are not listed.
  const PHRASES_IN_THE_DOCUMENT = [
    "0 of 50", "8 of 50", "27 of 45 (60%)", "27 of 45", "87% (39 of 45)", "6 false alarms on 19 correct changes",
    "625-model", "tier-1", "625 dbt models", "625", "621 of them", "21 Airflow pipelines", "45 real historical bugs",
    "45 held-out bugs", "from 8 open-source projects", "50-change benchmark", "50-bug tuning set", "60 scenarios",
    "95 hand-labelled", "0.82 and 0.83", "0.39 with no context", "0.72 to 0.76", "0.56 to 0.58", "1.00", "0.95",
    "16% with no context", "8 to 18%", "18% to 42%", "100% of relevant", "80% got a warning", "80% or more",
    "90% or more", "60%", "$2.77", "$3 to $5", "$30 to $60", "2 min 9 s", "20 minutes", "raised 1",
    "9 got a warning", "3 were raised", "from 45 to about 150", "Hand-check 30", "12 near-misses", "3 or fewer",
    "one false alarm per 20 correct changes", "October 2026",
  ];
  // Numbers the page makes up from its own structure, not from the document: the thirteen steps,
  // each step's place among them, the plan's step numbers, and the figure caption.
  const DERIVED_NUMBERS = [
    /Step (?:[1-9]|1[0-3]) of 13/g, // the readout's place in the run
    /\b[Ss](?:how s|tep )(?:tep )?(?:[1-9]|1[0-3]),/g, // the spoken step names and the "show step" buttons
    /Step [1-7]\./g, // the plan's own numbering
    /Fig 1/g, // the figure caption
    /reads risk out of 100/g, // the drawing's description of its dial, which the studio wrote
  ];

  // Model names such as "Sonnet 5.5" are removed before counting, and so are digits stuck to
  // letters, as in the project name h3.
  function numbersIn(text) {
    const withoutModels = text.replace(/\b(?:Sonnet|Opus|Haiku) 5\.5\b/g, "");
    return withoutModels.match(/(?<![A-Za-z])\d+(?:\.\d+)?/g) ?? [];
  }

  // The numbers left in a text once every phrase the document states and every derived number is taken out.
  function unknownNumbersIn(text) {
    const escape = (phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // One pass from the left, so a phrase that starts first is taken whole even where another overlaps it.
    const phrases = new RegExp([...PHRASES_IN_THE_DOCUMENT].sort((x, y) => y.length - x.length).map(escape).join("|"), "g");
    let rest = text.replace(phrases, " ");
    for (const pattern of DERIVED_NUMBERS) rest = rest.replace(pattern, " ");
    return numbersIn(rest);
  }

  // All the words a visitor reads or hears from the walkthrough once rendered: text, labels and titles.
  function renderedWords() {
    const { container, unmount } = render(createElement(WalkthroughBlock, { block: walkthrough }));
    const numbering = [...container.querySelectorAll(".wt-n")].map((node) => node.textContent);
    container.querySelectorAll(".wt-n").forEach((node) => node.remove());
    const attributes = [...container.querySelectorAll("[aria-label], [title], [alt]")].flatMap((node) => [
      node.getAttribute("aria-label"),
      node.getAttribute("title"),
      node.getAttribute("alt"),
    ]);
    const words = [container.textContent, ...attributes.filter(Boolean)].join("\n");
    unmount();
    return { words, numbering };
  }

  it("is fourth, after Flywheel, with the words Ongoing project and no code link (D2, D10)", () => {
    expect(portfolioData.caseStudies.map((study) => study.id).indexOf("orion")).toBe(3);
    expect(portfolioData.caseStudies[2].id).toBe("flywheel");
    expect(orion.status).toBe("Ongoing project");
    expect(orion).not.toHaveProperty("codeLink");
  });

  it("states only figures the owner's document states, in the phrase it states them, on the page and in the walkthrough (D3)", () => {
    expect(collectStrings(orion).flatMap(unknownNumbersIn)).toEqual([]);
  });

  it("states only those figures in what the walkthrough renders, including its step counts and the drawing's description (D3)", () => {
    const { words, numbering } = renderedWords();
    expect(words).toContain("Step 1 of 13");
    expect(unknownNumbersIn(words)).toEqual([]);
    expect(numbering).toEqual(Array.from({ length: 13 }, (_, index) => String(index + 1).padStart(2, "0")));
  });

  it("notices a figure that was changed to another one the document also states (D3)", () => {
    expect(unknownNumbersIn("It caught 27 of 45 real historical bugs.")).toEqual([]);
    expect(unknownNumbersIn("It caught 21 of 45 real historical bugs.")).toEqual(["21"]);
    expect(unknownNumbersIn("It made 0 of 50 unsafe decisions, against 9 of 50.")).toEqual(["9", "50"]);
  });

  it("leaves out the sentences that use words the copy scan bans, and the sample verdict (D3)", () => {
    const text = collectStrings(orion).join("\n");
    expect(text).not.toMatch(/95%|sandbox|boundar/i);
    expect(text).not.toMatch(/88\/100|CON-031|INC-230/);
    // Plan step 4's sentence about facts missing from the diff is left out whole, because it names Go.
    expect(text).not.toMatch(/Today's misses need facts|byteLength|Unwrap/);
  });

  it("holds a walkthrough block of thirteen uniquely named steps, each tagged built or designed (D6)", () => {
    expect(walkthrough.figure).toBe("orion-bench");
    expect(walkthrough.steps).toHaveLength(13);
    const ids = walkthrough.steps.map((step) => step.id);
    expect(new Set(ids).size).toBe(13);
    for (const step of walkthrough.steps) {
      expect(["built", "designed"]).toContain(step.tag);
      expect(step.label.length).toBeGreaterThan(0);
      expect(step.does.length).toBeGreaterThan(0);
      expect(step.readout.length).toBeGreaterThan(0);
    }
  });

  it("tags exactly one step designed, the last, and names where a person decides on five steps (D6)", () => {
    const designed = walkthrough.steps.filter((step) => step.tag === "designed");
    expect(designed.map((step) => step.id)).toEqual(["next"]);
    expect(walkthrough.steps.at(-1).id).toBe("next");
    const withPerson = walkthrough.steps.filter((step) => step.person).map((step) => step.id);
    expect(withPerson).toEqual(["preflight", "gate", "mcp", "decision", "propose"]);
  });

  it("carries every control, chrome and announcement string in the block, so no component holds words", () => {
    for (const key of ["play", "pause", "next", "replay", "skip", "show", "approve", "waive", "reject"]) {
      expect(walkthrough.controls[key]).toBeTruthy();
    }
    for (const key of ["paused", "playing", "offscreen", "reading", "waiting", "done"]) {
      expect(walkthrough.states[key]).toBeTruthy();
    }
    for (const key of ["step", "waiting", "decision"]) {
      expect(walkthrough.announce[key]).toBeTruthy();
    }
    expect(walkthrough.legend.map((item) => item.term)).toEqual(["built", "designed"]);
  });

  it("holds no repository address or link in the Orion text", () => {
    const text = collectStrings(orion).join("\n");
    expect(text).not.toMatch(/github\.com|https?:\/\//i);
  });
});

// TG-08: the Atelier case study. Every sentence on its page is copied from the Atelier README, its
// studio skill, its agent files or the step data of the approved Look; a sentence that uses a
// banned word or states a number is left out whole; the private build system's name is replaced.
describe("the Atelier case study (TG-08)", () => {
  const atelier = portfolioData.caseStudies.find((study) => study.id === "atelier");
  const walkthrough = collectBlocks(atelier).find((block) => block.type === "walkthrough");
  const AGENT_KINDS = ["agent", "tool", "person"];

  // The page states no number. Names with a digit stuck to a letter (W3C, mp4) are not figures, as
  // on the Orion page. Numbers the page makes up from its own structure are stripped first: each
  // phase's place among the twelve, the list numbering, the spoken phase names, the figure caption
  // and the station numerals inside the drawing.
  const DERIVED_NUMBERS = [
    /\b(?:[1-9]|1[0-2]) of 12(?!\d)/g, // "Phase 3 of 12" and the readout's "3 of 12"
    /\b[Ss]how phase (?:[1-9]|1[0-2]),/g, // the "show phase" buttons
    /Fig 1/g, // the figure caption
  ];

  function numbersIn(text) {
    let rest = text;
    for (const pattern of DERIVED_NUMBERS) rest = rest.replace(pattern, " ");
    return rest.match(/(?<![A-Za-z])\d+(?:\.\d+)?/g) ?? [];
  }

  // All the words a visitor reads or hears from the walkthrough once rendered: text, labels and titles.
  function renderedWords() {
    const { container, unmount } = render(createElement(WalkthroughBlock, { block: walkthrough }));
    const numbering = [...container.querySelectorAll(".wt-n")].map((node) => node.textContent);
    container.querySelectorAll(".wt-n, .iso-face-text").forEach((node) => node.remove());
    const attributes = [...container.querySelectorAll("[aria-label], [title], [alt]")].flatMap((node) => [
      node.getAttribute("aria-label"),
      node.getAttribute("title"),
      node.getAttribute("alt"),
    ]);
    const words = [container.textContent, ...attributes.filter(Boolean)].join("\n");
    unmount();
    return { words, numbering };
  }

  it("is fifth, right after Orion, with the words Ongoing project and no code link (D7, D8)", () => {
    expect(portfolioData.caseStudies.map((study) => study.id).indexOf("atelier")).toBe(4);
    expect(portfolioData.caseStudies[3].id).toBe("orion");
    expect(portfolioData.caseStudies[5].id).toBe("esper");
    expect(atelier.status).toBe("Ongoing project");
    expect(atelier).not.toHaveProperty("codeLink");
    expect(atelier.stats).toEqual([]);
  });

  it("states no number anywhere in its data (D6)", () => {
    expect(collectStrings(atelier).flatMap(numbersIn)).toEqual([]);
  });

  it("states no number in what the walkthrough renders, and counts its twelve phases (D6)", () => {
    const { words, numbering } = renderedWords();
    expect(words).toContain("Phase 1 of 12");
    expect(numbersIn(words)).toEqual([]);
    expect(numbering).toEqual(Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0")));
  });

  it("notices a figure that comes in from the sources, and lets a name with a digit in it pass (D6)", () => {
    expect(numbersIn("It takes stills at phone 390, tablet 834, desktop 1440.")).toEqual(["390", "834", "1440"]);
    expect(numbersIn("A score 1 to 10 for each rubric line.")).toEqual(["1", "10"]);
    expect(numbersIn("Exits 1 when a blocking gate fails.")).toEqual(["1"]);
    expect(numbersIn("Node 22.12 or newer, 16 finer steps and a grid of 120 pulsing dots.")).toEqual(["22.12", "16", "120"]);
    expect(numbersIn("Playwright (Apache-2.0) and a scroll.mp4 in W3C Design Tokens.")).toEqual(["2.0"]);
    expect(numbersIn("Phase 3 of 12, Show phase 4, and Fig 1.")).toEqual([]);
  });

  it("leaves out the sentences that use a banned word or state a number, and never reworded them (D6)", () => {
    const text = collectStrings(atelier).join("\n");
    expect(text).not.toMatch(/plugin|atelier:/i);
    expect(text).not.toMatch(/Stage 0|built now/i);
    expect(text).not.toMatch(/Exits|finer steps|pulsing dots|Node 22|Apache-2|Linear's homepage|about three seconds/);
    expect(text).not.toMatch(/phone 390|tablet 834|desktop 1440|score 1 to 10|1 to 7|Before step 2/);
  });

  it("says my build pipeline where the sources name the build system (D6)", () => {
    const text = collectStrings(atelier).join("\n");
    expect(text).toMatch(/my build pipeline/i);
  });

  it("holds no repository address or link in the Atelier text (D8)", () => {
    const text = collectStrings(atelier).join("\n");
    expect(text).not.toMatch(/github\.com|https?:\/\//i);
  });

  it("holds a walkthrough block of twelve uniquely named phases in the studio's order (D10)", () => {
    expect(walkthrough.figure).toBe("atelier-floor");
    expect(walkthrough.autoplay).toBe(false);
    expect(walkthrough.steps.map((step) => step.id)).toEqual([
      "intake", "brief", "strategy", "ideas", "lanes", "rig", "critics", "pick", "refine", "library", "handoff", "visitors",
    ]);
    expect(walkthrough.glowStep).toBe("pick");
    expect(walkthrough.steps.some((step) => step.id === walkthrough.glowStep)).toBe(true);
  });

  it("tags eleven phases built and the last one alone designed, and names where a person decides on three (D10)", () => {
    const designed = walkthrough.steps.filter((step) => step.tag === "designed").map((step) => step.id);
    expect(designed).toEqual(["visitors"]);
    expect(walkthrough.steps.at(-1).id).toBe("visitors");
    expect(walkthrough.steps.filter((step) => step.tag === "built")).toHaveLength(11);
    expect(walkthrough.steps.filter((step) => step.person).map((step) => step.id)).toEqual(["brief", "pick", "handoff"]);
    expect(walkthrough.legend.map((item) => item.term)).toEqual(["built", "designed", "a person decides"]);
  });

  it("gives every agent a name, a kind, a role and the next reader, and every phase a list of agents (D10)", () => {
    let total = 0;
    for (const step of walkthrough.steps) {
      expect(step.label.length).toBeGreaterThan(0);
      expect(step.does.length).toBeGreaterThan(0);
      expect(Array.isArray(step.agents), step.id).toBe(true);
      for (const agent of step.agents) {
        total += 1;
        expect(AGENT_KINDS).toContain(agent.kind);
        for (const key of ["name", "role", "next"]) {
          expect(agent[key]?.length, `${step.id} ${agent.name} ${key}`).toBeGreaterThan(0);
        }
        // Three lines name a tool of the host the studio runs on, so those sentences are left out whole and the card has no such row.
        for (const key of ["reads", "writes"]) {
          const left = ["Engineer writes", "The same lane, rig and critics writes", "Muhammad reads"].includes(`${agent.name} ${key}`);
          if (left) expect(agent[key], `${agent.name} ${key}`).toBeUndefined();
          else expect(agent[key]?.length, `${step.id} ${agent.name} ${key}`).toBeGreaterThan(0);
        }
      }
    }
    expect(total).toBe(16);
    expect(walkthrough.steps.find((step) => step.id === "visitors").agents).toEqual([]);
  });

  it("carries every control, chrome and announcement string in the block, so no component holds words", () => {
    for (const key of ["prev", "next", "replay", "skip", "show"]) expect(walkthrough.controls[key]).toBeTruthy();
    expect(walkthrough.states.still).toBeTruthy();
    for (const key of ["step", "agent"]) expect(walkthrough.announce[key]).toBeTruthy();
    for (const key of ["stepOf", "person", "personInList", "who", "whoInOrder", "noAgents", "backTo", "reads", "writes", "next", "designedSuffix", "showAria"]) {
      expect(walkthrough.labels[key], key).toBeTruthy();
    }
    expect(walkthrough.readout).toBeUndefined();
  });
});

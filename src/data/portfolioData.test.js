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
  "replay",
  // Added 2026-10-25 for the Fathom replay, which took the place of its chip walkthrough (owner).
  "fathom-replay",
  // Added 2026-10-25 for the Orion architecture diagram, drawn in the site's own boxes (owner).
  "architecture",
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
// 2026-10-21: the Studbook 100% stat removed at the owner's word; Apple numbers only.
const pinnedHomeStats = ["30 to 350+", "2 weeks", "~50%", "~40%"];

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
  "Python, SQL, TypeScript, JavaScript, React, Node.js, FastAPI, Elixir and Phoenix",
  "Spark, Iceberg, Snowflake, Kafka, Airflow, dbt, Postgres, pgvector",
  "LangGraph, LangSmith, agent orchestration, MCP servers, RAG, hybrid retrieval and reranking, evals, guardrails, prompt injection, human-in-the-loop",
  "AWS (S3, Lambda), Docker, Kubernetes, Jenkins, CI/CD, OAuth2, REST, WebSockets",
  "Requirements from ambiguous goals, stakeholder partnership, delivery management, teaching, incident response",
];

// R154: the featured card's four values (D52: 40, not 28) and the WorkHorse case-study stats.
const pinnedCaseStudyStats = {
  agentops: ["24 of 24", "3 of 24", "23 of 24", "$0.04"],
  flywheel: ["19 to 14", "2 of 2", "3 fixed, 5 broken", "0 broken"],
  esper: ["79%", "0%", "11 of 11"],
  "apple-decision-support-agent": ["30 to 350+", "2 weeks", "Zero", "~94%"],
  // Added 2026-10-21 from the owner's redesign brief.
  "apple-integration": ["~50%", "3 systems", "On demand"],
  "apple-data-health": ["Hundreds of thousands", "~40% fewer", "Tens of thousands"],
  // Added 2026-10-19 (TG-07); since the split on 2026-10-25 the agent stack's four figures, and
  // Fathom's four headline results (owner's split brief).
  orion: ["16", "4,599", "0.889", "158"],
  fathom: ["0 of 50", "100%", "621 of 625", "7 to 0"],
  // Added 2026-10-27 from the erp-data-platform repository's results.
  "erp-data-platform": ["29 checks", "5 of 5", "46 of 47", "73 of 73"],
  // Added 2026-10-27 from erp-data-platform's analyst/eval/RESULTS.md.
  "analyst-agent": ["102 of 103", "47 to 77", "18 of 18", "46 of 47"],
  // Added 2026-10-20 (TG-08): the Atelier sources hold no measured result, so the study has no stat cards.
  atelier: [],
};

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
  "Identified a review bottleneck blocking cross-team data changes, then deployed an agent that checks each request to unlock a protected map feature against the surrounding map data and the internal specification, flags knock-on effects, and returns a documented recommendation a reviewer approves or overrides. Reviewers accept 94% of its recommendations, and each override becomes a new rule. Two-month backlog cleared in two weeks; 30 to 350+ tickets a day.";
const DECISION_FLOW_TITLES = [
  "Unlock request",
  "Map snapshot of the target feature and its neighbors",
  "Check against internal specification",
  "Impact analysis: what else the change would touch",
  "Documented recommendation",
  "Reviewer decides",
];
const DECISION_BUILT_PARAGRAPHS = [
  "The agent does the homework a reviewer used to do by hand. It reads the request, takes a snapshot of the feature to be edited along with the features around it, and checks the proposed edit against internal specification. Then it works through what else the change would touch, because an edit that looks fine on one feature can break a neighboring one, or something built from it later.",
  "It writes up a recommendation, unlock or keep locked, with the reasoning and evidence behind it, a short summary of what is actually failing, and a proposed fix, and puts it in front of a reviewer. It does not act on that recommendation. The hard part of this review was never the decision. It was the work required before anyone could make one.",
];
const DECISION_WHY_PARAGRAPHS = [
  "The split follows the cost of being wrong. If the write-up misses something, a reviewer reading the evidence can catch it. If unlocking were left to the agent, a miss would go straight into the map. These requests carry consequences that are not always visible at the point of the edit, and a system that cannot be questioned is not one a reviewer should be asked to trust.",
  "That is also why every recommendation carries its reasoning and evidence. A reviewer should be able to disagree with it on the merits, not take it on faith.",
];
const DECISION_CHANGED_PARAGRAPHS = [
  "Since going live in November 2025, two months of backlog cleared in two weeks and the queue has stayed at zero. Throughput went from about 30 requests a day to over 350.",
  // Added 2026-10-21 from the owner's own account of monthly volume around launch.
  "The queue was not standing still while it cleared. In the month before the agent went live, the team processed about 500 requests. With the agent, it processed about 2,000 in the first month, about 4,000 in the second and about 3,000 in the third. Much of that came from one long-running project that is still producing thousands of requests, and from other large projects that have started, and some finished, since.",
  "At the manual rate, the old backlog alone would have taken far longer than two months to clear, with that volume arriving on top of it. The agent raised throughput just as the requests poured in, so the team cleared the backlog and kept up with the new work at the same time.",
  "The gain did not come from removing the decision, which a person still makes on every request. It came from removing the investigation in front of it. A reviewer now opens a finished assessment instead of assembling one.",
  "Reviewers agree with its recommendation about 94% of the time. The requests it flags for a closer look are the extreme ones, kinds of request it hasn't seen before, and requests from a team working outside its own scope. That last kind is flagged even when the edit is justified and low risk, because which team owns which part of the work matters as much as whether the edit is sound.",
  "The decision this produces is carried out by a separate tool I built, covered in the systems integration case study.",
];
const INTEGRATION_CROSS_REFERENCE =
  "The judgment behind these requests is covered in the decision support agent case study. This one is about what happens after the decision is made.";

// Copied verbatim from the committed mockups in docs/design/redesign-2026-09/ (owner-approved
// copy) and R155, amended where R154/R155 give an exact new string.
// Regenerated 2026-10-21 for the owner's redesign brief (glosses cut, Apple infrastructure names
// generalized, Tannhauser Gate added); earlier entries were copied from the mockups and R154/R155.
const pinnedCaseStudyNarratives = {
  agentops: {
    eyebrow: "Case study · Personal system · Agentic AI · Incident response",
    title: "AgentOps: an incident agent that can't act alone",
    lead: "When production breaks, an agent can read logs, metrics and deploy history faster than a person. An agent that also applies the fix on its own will eventually roll back the wrong deploy, or follow an instruction someone left in a log line. AgentOps keeps the agent for the reading and takes the decisions away from it.",
    atAGlance: [
      {
        label: "My role",
        value: "Designed and built it end to end"
      },
      {
        label: "What it is",
        value: "An incident-response program built on LangGraph, with a human approval step, a fixed list of allowed actions and a test setup that scores it"
      },
      {
        label: "Stack",
        value: "Python, LangGraph, LangChain, Pydantic, SQLite, LangSmith, Claude"
      },
      {
        label: "Quality",
        value: "998 tests, automated checks (CI) on every push, no model or key needed to run them"
      }
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText: "A way to put an agent near production without trusting it with production: LangGraph holds the pause, the checkpoints and the replay, code holds the rules, a person makes the change, and the evaluation shows where it fails, not only where it works.",
    contactHeading: "Want an agent near production? Let's talk."
  },
  flywheel: {
    eyebrow: "Case study · Personal system · LLM evaluation · LangSmith",
    title: "Flywheel: an agent's real failures, turned into its tests",
    lead: "An AI agent can pass every unit test and still get worse, because the tests run on a scripted stand-in for the model. Flywheel turns an agent's real failures, recorded in LangSmith, into test cases. It checks every pull request against them case by case. On three agents it blocked a change that looked fine: one passed every unit test of its behaviour, one looked like random noise in the average scores, and on LangChain's own email agent a cheaper model tied on totals but failed one kind of email every time.",
    atAGlance: [
      {
        label: "My role",
        value: "Designed and built it end to end"
      },
      {
        label: "What it is",
        value: "A safety check for AI agents: it turns recorded failed runs into test cases and blocks any proposed code change that breaks one"
      },
      {
        label: "Stack",
        value: "Python, LangSmith, LangGraph, GitHub Actions, Claude"
      },
      {
        label: "Quality",
        value: "33 tests, automatic checks on every change (run on Python 3.11 and 3.13), and Flywheel's own check guarding its example agent"
      }
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText: "A way to take a customer's agent from one that demos well to one that provably works: its real failures in LangSmith become reviewed test cases, every change is compared with the current approved version case by case, and a failing check means a real regression, not model noise.",
    contactHeading: "Have an agent that works in the demo? Let's talk."
  },
  "apple-decision-support-agent": {
    eyebrow: "Case study · Apple Maps · Data Health team · Feb 2025 to present",
    title: "A review backlog, turned into an analysis the reviewer can trust",
    lead: "Some map data is protected: before anyone can edit it, a person reviews a request to unlock it. That review was real work, and cross-team data changes piled up behind it. I built an agent that does the investigation for each request and hands the reviewer a documented recommendation with its evidence. The reviewer still makes every call. Throughput went from about 30 requests a day to over 350, and two months of backlog cleared in two weeks.",
    atAGlance: [
      {
        label: "My role",
        value: "Self-initiated; selected the model, built, deployed and own it"
      },
      {
        label: "Live since",
        value: "November 2025"
      },
      {
        label: "Stack",
        value: "Python, an open-source language model, REST APIs"
      },
      {
        label: "Status",
        value: "In production, with a person making every decision by design"
      }
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText: "Find the review step everyone waits on, then separate the investigation from the judgment. Most review bottlenecks are not slow because the decision is hard, they are slow because the work required to make the decision has to be redone by hand every time. Automate that work, leave the judgment with the person accountable for it, and give them the evidence to disagree.",
    contactHeading: "Have a queue like this? I reply within a day."
  },
  esper: {
    eyebrow: "Case study · Personal system · Research agent · LangGraph",
    title: "Esper: a research agent that proves every sentence",
    lead: "A research agent that writes a confident report is easy to build. One whose every sentence can be traced to a quote on a real page is not, and the difference is the whole value of the thing. Esper is my attempt at the second kind. It is a pipeline built on LangGraph. The writer may only use claims that a separate checker has verified. Code confirms every quote exists on the saved page. A reviewer and a red team attack the draft before it is delivered. On eleven questions it backed 79% of its sentences with the page it cites, meaning the page supports the sentence. That compares with 29% for Open Deep Research, a research agent from LangChain, and 35% for a single model call. Against a coding agent with web search, told to cite, Esper backed 82% of its sentences to the agent's 58%.",
    atAGlance: [
      {
        label: "My role",
        value: "Designed and built it end to end, with an agent doing the typing"
      },
      {
        label: "What it is",
        value: "An AI research agent whose every sentence cites a quote found on a saved copy of the web page, with a library that remembers the facts it has checked"
      },
      {
        label: "Stack",
        value: "Python, LangGraph, LangSmith, Claude, SQLite, Flywheel"
      },
      {
        label: "Quality",
        value: "93 tests that use a scripted stand-in for the model, automatic checks on every change, and a blocking check (Flywheel, my agent-testing tool) that replays 22 recorded runs in under a minute"
      }
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText: "A way to make an agent's output checkable rather than merely convincing: claims verified against their sources by a separate step, every sentence tied to a quote code can find, and an honest measurement against the obvious alternatives before anyone relies on it.",
    contactHeading: "Need an agent whose answers can be checked? Let's talk."
  },
  // Fathom added and Orion rewritten 2026-10-25 (owner's split brief and his follow-up the same day).
  orion: {
    eyebrow: "Case study · Personal system · Coding agents",
    title: "Orion: what my agents know before they start",
    lead: "Every coding agent starts a session knowing nothing about my work: not the design decisions, not the bug fixed last week, not the rule that came out of an incident. Orion closes that gap. It reads everything my projects have written down and done into one record, keeps it current with an always-on service, and gives an agent the context a new engineer would spend weeks picking up, before it touches a file. Every passage carries an id that reads back to its source, and no model is called on the way. Auspex, my trace viewer, grades each finished turn, and a mistake that repeats comes back through Orion as a lesson.",
    atAGlance: [
      {
        label: "My role",
        value: "My own system, designed and built in October 2026 and used every day since"
      },
      {
        label: "What it is",
        value: "A personal context layer over my engineering record, served to any coding agent through MCP"
      },
      {
        label: "Where it stands",
        value: "In daily use on my own machine and growing; private for now"
      },
      {
        label: "Covers",
        value: "16 repositories: 1,743 commits, 4,599 pull requests and issues, 943 sections of notes and design documents, and past agent sessions"
      }
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText: "The habit of closing the loop on agents: give them the context before they work, cite every passage so nothing is taken on trust, grade what they actually did, and turn what keeps going wrong into a lesson the next run starts from.",
    contactHeading: "Running coding agents every day? Let's talk."
  },
  fathom: {
    eyebrow: "Case study · Open source · Data platforms",
    title: "Fathom: what a data change reaches, before it ships",
    lead: "A data model change can look harmless in the diff and still break a report two teams away. Fathom gives coding agents, and the engineers working with them, the system context before they change anything: column-level lineage, the rules that apply, who owns each table and what has broken there before. It checks the change against that context in code, reviews the diff like a careful senior engineer, and watches what happened after the merge so its rules grow from the platform's own history. The model may explain a result but never overrule it, and a team's CI gate is the only thing that blocks.",
    atAGlance: [
      {
        label: "My role",
        value: "Designed and built it in October 2026, side by side with Orion, then gave it a home of its own"
      },
      {
        label: "What it is",
        value: "An open-source context layer, change check and code reviewer for AI agents on data platforms, starting with dbt and Airflow"
      },
      {
        label: "Where it stands",
        value: "Open source under the Apache-2.0 licence, with its code on GitHub"
      },
      {
        label: "Tested on",
        value: "PipelineBench (my own benchmark), 45 real historical bugs from 8 open-source projects, and two public dbt platforms: California's transit warehouse on BigQuery and Datacoves' balboa on Snowflake"
      }
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText: "A way to let agents change a data platform without guessing. Write down the context a senior engineer carries in their head as data, check every change against it in code, cite every finding, and replay it on the team's own history before it says a word in CI.",
    contactHeading: "Want agents to change your data platform safely? Let's talk."
  },
  "erp-data-platform": {
    eyebrow: "Case study · Open source · ERP data engineering",
    title: "An ERP's data, made trustworthy for finance and for AI",
    lead: "Companies run on an ERP, the system that holds their orders, invoices and books, usually with a CRM for customers and deals beside it. Before anyone builds AI on that data, someone has to get it out, make it trustworthy, and keep it that way. I built that data side end to end against a real Odoo 17 running a simulated year of business: extraction through Odoo's API, finance tables in dbt where every number traces to the exact records behind it, a pipeline that runs on a schedule and watches itself, five failure drills, a question set for judging and training models, and read-only tools that let an AI agent answer from the warehouse and cite its sources.",
    atAGlance: [
      {
        label: "My role",
        value: "Designed and built it in October 2026, as the first weeks of a client engagement"
      },
      {
        label: "What it is",
        value: "An open-source data platform for an ERP: extraction, dbt models, monitoring, failure drills, evaluation and training data, and MCP tools for AI agents"
      },
      {
        label: "Stack",
        value: "Odoo 17 Community, Python, Postgres 16, dbt, Fathom for lineage and change checks, MCP"
      },
      {
        label: "Where it stands",
        value: "Open source under the MIT licence; CI rebuilds and tests everything from nothing on every push"
      }
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText: "The data side of an AI engagement, owned end to end: get the data out of the systems the client already runs, make every number traceable, prove the pipeline fails loudly before trusting it, build the evaluation data from the client's own records, and hand over a runbook someone else has already used.",
    contactHeading: "Building AI on your ERP or CRM data? Let's talk."
  },
  "analyst-agent": {
    eyebrow: "Case study · Open source · Question to SQL agent",
    title: "An analyst agent: ask a warehouse a question in plain English",
    lead: "Most teams' first question to SQL demo writes one query and shows whatever comes back. That is fine until the query is slightly wrong, the money is in four currencies, or the answer would expose a handful of people. I built the next step up on the finance warehouse from my ERP data platform: an agent that finds the right tables and business terms, writes a query, has code check and run it read-only, repairs it on error, reads the rows, and answers with the query it used. When the data cannot answer, it says so. Then I added a second dataset, a simulated search ads account with A/B tests and a privacy rule, by writing one configuration file.",
    atAGlance: [
      {
        label: "My role",
        value: "Designed, built and evaluated it in October 2026"
      },
      {
        label: "What it is",
        value: "A question to SQL agent with retrieval, a repair loop, read-only execution, privacy enforced in the tool, conversation memory, and an evaluation that isolates what each part adds"
      },
      {
        label: "Stack",
        value: "Python, LangGraph, sqlglot, Postgres 16, BM25 and a local bge-small embedding model, Claude Sonnet and Haiku"
      },
      {
        label: "Where it stands",
        value: "Open source under the MIT licence, in the erp-data-platform repository, with 18 tests that need no model"
      }
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText: "An analyst agent people can check: the business's own terms written down as data, every query checked in code and again by the database, privacy rules the agent cannot talk its way past, and an evaluation on the client's own questions that shows what each part is worth before anyone relies on it.",
    contactHeading: "Want your team to ask the warehouse in plain English? Let's talk."
  },
  "apple-integration": {
    eyebrow: "Case study · Apple Maps · Systems integration · Feb 2025 to present",
    title: "Three systems, one tool, half the turnaround",
    lead: "Once someone decides a protected map feature can be edited, its permissions have to actually change, in three separate systems. That already worked, but it ran on long scripts run from a command line and extra tickets raised just to carry the change. I built one Python tool that does it on demand through each system's own official, signed-in API, and records why each change was made. Turnaround dropped by about half.",
    atAGlance: [
      {
        label: "My role",
        value: "Built it end to end"
      },
      {
        label: "Systems",
        value: "Ticketing, code repository, geo-data"
      },
      {
        label: "Stack",
        value: "Python, REST APIs, OAuth2"
      },
      {
        label: "Result",
        value: "A script-driven process replaced by access on demand, with the reason recorded"
      }
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText: "Integrations tend to break on sign-in and permissions, not on the code in between. I've done that unglamorous part: getting separate systems to trust one tool, and keeping them trusting it when the sign-in method changes underneath. The same instinct applies to the context around a system: the question someone will ask in six months is usually why is this like this, and that answer is cheapest to capture at the moment the change is made.",
    contactHeading: "Systems that don't talk to each other? Let's talk."
  },
  "apple-data-health": {
    eyebrow: "Case study · Apple Maps · Data reliability · Feb 2025 to present",
    title: "Keeping a 50+ region data pipeline shippable",
    lead: "Apple Maps is built from data covering more than 50 regions, and every release has to pass automated quality checks before it ships. Apple's Data Health team helps set those standards. My part is keeping bad data from blocking releases: fixing it once it's live, stopping it at the gate, and cleaning up fast when something slips through.",
    atAGlance: [
      {
        label: "My role",
        value: "Data Engineer, Data Health team"
      },
      {
        label: "Partners",
        value: "DataOps and the data evaluation team"
      },
      {
        label: "Stack",
        value: "Python, SQL, machine-learning remediation jobs, distributed data processing, a job orchestration server"
      },
      {
        label: "Incident tools",
        value: "SQL (database queries), QGIS (a mapping tool)"
      }
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText: "Bad data shows up in three places: already live, at the gate, and in an incident. I've owned all three at a scale of 50+ regions, and I've seen what moving a check upstream buys you: about 40% fewer release-blocking failures at the gate.",
    contactHeading: "Data you can't trust yet? Let's talk."
  },
  atelier: {
    eyebrow: "Case study · Personal system · Design studio",
    title: "Atelier",
    lead: "A design studio made of AI agents, programs that each do one job on their own. You give it inspiration (screenshots, links, Notion notes, Figma frames) and a brief; it designs websites and web apps with Apple-product-page polish: motion that explains, visuals that pull you in, and pages that stay fast and easy to use.",
    atAGlance: [
      {
        label: "My role",
        value: "My own project, built in stages"
      },
      {
        label: "What it is",
        value: "A design studio made of agents"
      },
      {
        label: "Where it stands",
        value: "An ongoing project"
      },
      {
        label: "What it makes",
        value: "Websites and web apps"
      }
    ],
    calloutEyebrow: "How it runs",
    calloutText: "Everything runs on a cloud computer with open-source tools: a real browser to capture each site, and ffmpeg for the filmstrip and the video.",
    contactHeading: "Have a system that needs deploying? Let's talk."
  },
};

const pinnedRepositories = {
  workhorse: "https://github.com/muhibm1/workhorse",
  studbook: "https://github.com/muhibm1/studbook",
  agentops: "https://github.com/muhibm1/agentops",
  flywheel: "https://github.com/muhibm1/flywheel",
  studbookAgent: "https://github.com/muhibm1/studbook-agent",
  fathom: "https://github.com/muhibm1/fathom",
  erpDataPlatform: "https://github.com/muhibm1/erp-data-platform",
};

// R138: FastAPI is now permitted (it names a real fact in the Stack line); Kubernetes stays
// banned because it names no approved fact.

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
  it("names / then /work then /work/<id> for the eleven case studies, featured work first and the unlisted Atelier page last (R127, G1, owner brief 2026-10-21; WorkHorse and the agent harness page removed 2026-10-25; Fathom added and the Apple agent first, split brief 2026-10-25; Neural Newsletters removed the same day; the ERP data platform added fifth and featured 2026-10-27; the analyst agent added sixth, not featured, the same day)", () => {
    expect(staticRoutePaths(portfolioData.caseStudies)).toEqual([
      "/",
      "/work",
      "/work/apple-decision-support-agent",
      "/work/agentops",
      "/work/flywheel",
      "/work/fathom",
      "/work/erp-data-platform",
      "/work/analyst-agent",
      "/work/esper",
      "/work/orion",
      "/work/apple-integration",
      "/work/apple-data-health",
      "/work/atelier",
    ]);
    expect(portfolioData.caseStudies.filter((study) => study.card.featured).map((study) => study.id)).toEqual([
      "apple-decision-support-agent",
      "agentops",
      "flywheel",
      "fathom",
      "erp-data-platform",
    ]);
    expect(portfolioData.caseStudies.filter((study) => study.listed === false).map((study) => study.id)).toEqual([
      "atelier",
    ]);
  });

  it("carries the AgentOps case study second, after the Apple agent (owner brief 2026-10-21; split brief 2026-10-25), with its repository codeLink and a `measured` section holding its table (2026-10-12)", () => {
    const agentops = findCaseStudy("agentops");

    expect(agentops).toBeDefined();
    expect(portfolioData.caseStudies[1].id).toBe("agentops");
    expect(agentops.codeLink).toEqual({
      label: "Code: agentops",
      href: "https://github.com/muhibm1/agentops",
    });

    const measured = findSection(agentops, "measured");
    expect(measured).toBeDefined();
    const table = measured.blocks.find((block) => block.type === "table");
    expect(table.columns.map((column) => column.label)).toEqual(["Measure", "AgentOps", "ReAct baseline (plain agent)"]);
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
      text: "design-records agent",
      href: "https://github.com/muhibm1/studbook-agent",
    });

    // The LangChain open-source agents study (flywheel PRs 4 and 5, owner brief 2026-10-21).
    const langchain = findSection(flywheel, "langchain-agents");
    const langchainTable = langchain.blocks.find((block) => block.type === "table");
    expect(langchainTable.rows.map((row) => row.cells.slice(1))).toEqual([
      ["52 of 60", "51 of 60"],
      ["24 of 33", "27 of 33"],
      ["27 of 33", "27 of 33"],
      ["3 of 3", "0 of 3"],
    ]);
    expect(langchain.blocks.find((block) => block.link).link.href).toBe(
      "https://github.com/muhibm1/flywheel/tree/main/studies/langchain-agents",
    );
    expect(flywheel.card.featured).toBe(true);
    expect(flywheel.card.stats.map((stat) => stat.value)).toEqual(["19 to 14", "27 of 33", "0 of 3", "5"]);
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
      "The tool reads an approved request from the ticketing system, signs in to the other two systems with the right permissions, changes the lock on the feature, and writes a comment on it saying why. Nobody has to change the tools they already use, because it talks to each system through the official interface each one already offers, its REST API.",
    );
    expect(findSection(integration, "changed").blocks[0].text).toBe(
      "A script-driven process became permission changes on demand, turnaround on lock and unlock requests dropped by about 50%, and every change now leaves behind the reason it was made.",
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
      { value: "3 systems", label: "connected through each one's own official API, signed in with OAuth2" },
    ]);
    expect(findSection(integration, "built").blocks[0]).toEqual({
      type: "link-diagram",
      left: { title: "Ticketing system", note: "The request and its status" },
      edge: "Secure sign-in · API",
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
    const decision = findCaseStudy("apple-decision-support-agent");
    const situationBlocks = findSection(decision, "situation").blocks;

    expect(situationBlocks[0].text).toBe(DECISION_SITUATION);
    expect(situationBlocks[2].text).toBe(
      "Building a fix was not part of my assigned role. I took it on anyway.",
    );
    expect(decision.intro).toBe(pinnedCaseStudyNarratives["apple-decision-support-agent"].lead);
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
      "led the response to a building-generation incident affecting tens of thousands of buildings, scoping the impact in SQL and QGIS",
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
    expect(incident.blocks).toEqual([{"type": "paragraph", "text": "A mass building-generation incident put tens of thousands of buildings into the data. A machine-learning-based automation added buildings that didn't meet our internal specification for inclusion, and gave some of them the wrong attributes, such as exaggerated height and scale."}, {"type": "paragraph", "text": "The first job in an incident is working out how far the damage reaches: how much was affected, and where. I did that with SQL, to count and group the affected buildings, and QGIS, a mapping tool, to look at them on the map and see patterns a query can't show. Then I drove a delete, correct or retain decision on each group."}, {"type": "paragraph", "text": "Deciding by group rather than building by building is what made tens of thousands manageable. Once each group was handed to the team that owns it, everything was fixed and cleaned up within two weeks."}]);
    expect(collectStrings(portfolioData).join("\n")).not.toMatch(/restricted geospatial/i);
  });

  it("carries the integration homepage card summary verbatim (R170)", () => {
    expect(findCaseStudy("apple-integration").card.summary).toBe(
      "Locking and unlocking permissions on protected map features ran on long command-line scripts. I replaced it with one tool that does it on demand and records why each change was made.",
    );
  });

  it("keeps the eleven 'My role' at-a-glance labels, outside the ownership ban's scope (D55, TG-08; Fathom added and Neural Newsletters removed 2026-10-25; the ERP data platform added fifth and featured 2026-10-27)", () => {
    const myRoleLabels = portfolioData.caseStudies.map(
      (study) => study.atAGlance.find((row) => row.label === "My role")?.value,
    );

    expect(myRoleLabels.filter(Boolean)).toHaveLength(11);
  });

  it("names personal.repositories with the seven public repositories, held once (R153; snapshots retired 2026-10-26; erp-data-platform added 2026-10-27)", () => {
    expect(portfolioData.personal.repositories).toEqual(pinnedRepositories);
  });

  // The WorkHorse case study and its code link were removed on 2026-10-25 (owner's request).
  it("carries the hero's codeLine (R153, R154)", () => {
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

  it("never says Architected (R138, G14; the owner dropped the tool-name ban on 2026-10-25)", () => {
    const allText = collectStrings(portfolioData).join(" ");

    expect(allText).not.toContain("Architected");
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

    expect(withDisclaimer).toEqual(["apple-decision-support-agent", "apple-integration", "apple-data-health"]);
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
    const decision = findCaseStudy("apple-decision-support-agent");
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
      { label: "Stack", value: "Python, an open-source language model, REST APIs" },
      { label: "Status", value: "In production, with a person making every decision by design" },
    ]);
    expect(decision.stats).toEqual([
      { value: "30 to 350+", label: "tickets a day, more than tenfold the manual rate" },
      { value: "2 weeks", label: "to clear two months of accumulated tickets" },
      { value: "Zero", label: "backlog since launch" },
      { value: "~94%", label: "of recommendations match the reviewer's decision" },
    ]);
    expect(decision.sections.map((section) => [section.id, section.heading])).toEqual([["situation", "The situation"], ["built", "What I built"], ["who-decides", "Who decides what"], ["model", "Choosing and tuning the model"], ["people", "Working with the teams"], ["changed", "What changed"]]);
    expect(paragraphsOf("situation")).toEqual(DECISION_SITUATION_PARAGRAPHS);
    expect(paragraphsOf("built")).toEqual(DECISION_BUILT_PARAGRAPHS);
    expect(paragraphsOf("who-decides")).toEqual(DECISION_WHY_PARAGRAPHS);
    expect(paragraphsOf("model")).toEqual(["I selected an open-source model, built the agent around it, and own it end to end. Much of the backend it works against is proprietary, so I wanted the agent itself to not depend on any one platform. An open-source model isn't tied to one provider's service, so the agent can run wherever the work needs it and move with the systems around it.", "Launch was not the end of the work. I keep tuning the analysis and the system's scope against how it performs on live requests. Two cases took the most work.", "The first was edits to the map's 3D structure. 3D modeling is open ended, and a bad edit can make the map visibly jarring, so these requests are held to a high bar, and the agent scored them almost entirely on what could go wrong. That is the right instinct for a large change and the wrong one for most of these requests, which are minor. So for small 3D edits it now weighs the other side as well: whether a change too small to notice on its own would bring the map in line with Apple's design standards.", "The second was very large features, such as islands and country borders. Because the feature is enormous, any request to edit one raised flags, even when the edit itself was small, like aligning a short stretch of a border. Separating the size of the feature from the size of the change was one of the hardest parts of getting the analysis right."]);
    expect(paragraphsOf("people")).toEqual(["A tool like this only works if the reviewers believe it. I worked directly with the stakeholder teams who own these requests to decide what the system should handle, what it should leave to people, and how its write-up should read so a reviewer could check it quickly. As live results came in, we widened or narrowed its scope together.", "The clearest example came from the teams themselves. At first the agent answered only what the request asked. That wasn't enough. Requests usually arrive early in the GIS life cycle, when an editor has spotted a problem in protected data but hasn't yet worked out its full scope or the right fix. And not every failure is obvious: a check can fail for an unexpected reason, or for a related one its description doesn't cover.", "So every recommendation now includes a short summary of the failure, covering its root cause and how the data is set up, plus a proposed fix based on the model's assessment. What the agent uncovers this way also feeds back into how checks are defined and into our engineering standards."]);
    expect(paragraphsOf("changed")).toEqual(DECISION_CHANGED_PARAGRAPHS);
    expect(decision.callout.text).toBe(DECISION_CALLOUT);
    expect(decision.disclaimer).toBe(
      "Details are limited to what I can share publicly. Internal system names are withheld. I'm glad to go deeper on a call.",
    );
    expect(decision.contactHeading).toBe("Have a queue like this? I reply within a day.");
  });

  it("carries the six-step decision flow with Reviewer decides as the only gate (R5)", () => {
    const flow = findSection(findCaseStudy("apple-decision-support-agent"), "built").blocks[0];

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
    // 2026-10-21: WorkHorse retired; the line names Orion. 2026-10-25: it names Fathom, the part
    // of Orion a data team could deploy, after the split (owner's brief).
    expect(home.hero.rightNow.items[1]).toEqual({
      title: "Building Fathom",
      text: "A context layer for AI agents on data platforms: what a change reaches, which rules apply and who owns it, checked before it ships",
    });
    expect(home.principles.items[0].text).toBe(PRINCIPLE_ONE);
    expect(home.experience.roles[0].company).toBe("Apple Maps");
    expect(home.experience.roles[0].highlights[0]).toBe(RESUME_BULLET);
    expect(home.toolkit.columns[2].items).toBe(
      "LangGraph, LangSmith, agent orchestration, MCP servers, RAG, hybrid retrieval and reranking, evals, guardrails, prompt injection, human-in-the-loop",
    );
  });

  it("names the employer Apple Maps in every slot and never via TCS (R2)", () => {
    const appleStudies = ["apple-decision-support-agent", "apple-integration", "apple-data-health"].map(findCaseStudy);

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
    expect(findCaseStudy("apple-decision-support-agent").intro).toMatch(/cross-team/i);
  });

  // 5 and 15 (minutes per manual review), 3 (3D edits) and 94 (reviewer agreement; 98 in his draft, corrected by him 2026-10-25) come from the owner's draft.
  it("uses only the approved numerals on the decision study (R4, item 12)", () => {
    const text = collectStrings(findCaseStudy("apple-decision-support-agent")).join("\n");
    const numerals = new Set(text.match(/\d+/g));

    expect([...numerals].every((numeral) => ["30", "350", "2", "2025", "5", "15", "3", "94", "500", "000", "4"].includes(numeral))).toBe(true);
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

  // The AgentOps proof band left the home page on 2026-10-21 (owner's brief); the skip link now
  // lands on the production stats that follow the hero.
  it("skips to the production stats on the page", () => {
    expect(replay.skip.href).toBe("#stats");
  });

  it("never mentions Paddock anywhere in the site data", () => {
    expect(JSON.stringify(portfolioData)).not.toMatch(/paddock/i);
  });
});

// TG-07: the Orion case study. Its words are the owner's own Orion document, copied sentence by
// sentence; a sentence using a word the copy scan bans is left out. Its thirteen walkthrough
// steps come from the approved Look. Every number on the page is one the document states.
// 2026-10-25 (owner's split brief): the data-platform half, walkthrough included, moved to the
// Fathom page and the Orion page became the agent stack. Both pages are held to the same rule.
describe("the Orion and Fathom case studies (TG-07)", () => {
  const orion = portfolioData.caseStudies.find((study) => study.id === "orion");
  const fathom = portfolioData.caseStudies.find((study) => study.id === "fathom");

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
    // Added 2026-10-25 (owner's request for an updated page), each from Orion's own results notes:
    // pipelinebench/results/agentic-review.md and heldout-sonnet-5-5-*-x3.md (held-out recall over
    // three runs), calitp-history-agent.md (the 26-week history replay), retrieval.md (the search
    // eval), and the owner's "How Orion runs on your Mac" sheet (the ingest counts).
    "64%", "62% to 64% across 3 runs", "76%", "mean of 3 runs", "3 of 6 known bugs", "26 weeks",
    "116 merged changes", "2 of the 6", "0.889", "0.656", "42 hand-labelled", "0.113", "0.562",
    "16 repositories", "1,743 commits", "4,599 pull requests", "943 sections", "21 past agent sessions",
    "the 80% I set", "80% pass mark",
    // Added 2026-10-25 from the owner's "Orion: how it works and how it was built" write-up,
    // section 11, "Tried, and did not win" (retrieval.md and the held-out gated runs).
    "from 0.889 to 0.813", "from 0.615 to 0.148", "100%",
    // Added 2026-10-25 from the owner's "How Orion runs on your Mac" sheet (the architecture
    // drawing) and Orion's own changelog for the parts added since (#64, the daemon's schedule).
    "16 git checkouts", "120 s", "0.6 s", "every 30 s", "every 10 min", "every 30 min", "every 15 min",
    "python3.12", "R@10 0.889", "BM25", "p50",
    // Added 2026-10-25 for the split (owner's brief): Fathom's figures from Orion's
    // pipelinebench results (llm-agents.md for citation recall, partner-calitp-dbt.md for the
    // cal-itp sync, lineage and the 12-commit review, heldout-sonnet-5-5-baseline-x3.md for
    // detection over three runs), and the agent stack's from the owner's sheet and Auspex's first
    // full regrade on his Mac (158 turns, 5 cases).
    "46%", "621 of 625", "4 of 625", "up from 4", "7 to 0", "12 real merged commits", "12 real commits",
    "12 merged commits", "7 warnings, all false", "2 warnings, both correct", "45 real bugs", "74%",
    "73% to 76%", "across 3 runs", "625 models", "16", "4,599", "158 turns", "158", "5 cases",
    "past 80%", "over 80% full",
    // Added 2026-10-25 for the owner's follow-up ("show the bulk and the weight of the work"):
    // Orion's README and docs/hands-free.md at main 20a11d8 (tools, daemon jobs, lesson rungs,
    // about 14,350 lines and 357 tests), and Fathom's README at main d993d56 (version, licence,
    // adapters, rule types, providers, about 14,100 lines and 264 tests) with its results notes
    // (accuracy.md, calitp-history-deterministic.md, calitp-history-model-consumers.md,
    // partner-balboa.md, partner-httpx-sonnet-5-5.md and partner-hono-cobra-sonnet-5-5.md).
    "7 tools", "25 October 2026", "Every 30 s", "Every 15 min", "Every 10 min", "Every 30 min",
    "~14,000 lines", "357 tests", "5 jobs", "5 sources", "3 rankings", "4 rungs", "0 model calls",
    "version 0.1", "Version 0.1", "Apache-2.0", "from 0.18 to 0.42", "0.60 on 45 held-out bugs",
    "7 rule types", "4 warnings in 26 weeks", "0 false alarms a week", "2.23 warnings a week",
    "0.81 false alarms a week", "7 of 43 to 1", "32 DAGs and 53 tasks", "26 merged changes",
    "49 unrelated", "264 tests", "5 adapters", "7 MCP tools", "5 providers", "6 languages",
  ];
  // Numbers the page makes up from its own structure, not from the document: the thirteen steps,
  // each step's place among them, the plan's step numbers, and the figure caption.
  const DERIVED_NUMBERS = [
    /Step (?:[1-9]|1[0-3]) of 13/g, // the readout's place in the run
    /\b[Ss](?:how s|tep )(?:tep )?(?:[1-9]|1[0-3]),/g, // the spoken step names and the "show step" buttons
    /Step [1-7]\./g, // the plan's own numbering
    /Fig 1/g, // the figure caption
    /^M[\d .,HVC-]+$/g, // an arrow path in the architecture drawing (geometry, not a figure)
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

  it("puts Fathom fourth, then the ERP data platform as the last featured study, then the analyst agent, then Esper, then Orion, Fathom linking its public repository and Orion with its status and no code link (D2, D10, split brief 2026-10-25)", () => {
    const ids = portfolioData.caseStudies.map((study) => study.id);
    expect(ids.indexOf("fathom")).toBe(3);
    expect(ids.indexOf("erp-data-platform")).toBe(4);
    expect(ids.indexOf("analyst-agent")).toBe(5);
    expect(ids.indexOf("esper")).toBe(6);
    expect(ids.indexOf("orion")).toBe(7);
    expect(fathom.card.featured).toBe(true);
    expect(orion.card.featured).toBe(false);
    expect(fathom).not.toHaveProperty("status");
    expect(fathom.codeLink).toEqual({ label: "Code: fathom", href: "https://github.com/muhibm1/fathom" });
    expect(orion.status).toBe("Private · in daily use");
    expect(orion).not.toHaveProperty("codeLink");
  });

  it("states only figures the owner's document states, in the phrase it states them, on both pages and in the walkthrough (D3)", () => {
    expect(collectStrings(orion).flatMap(unknownNumbersIn)).toEqual([]);
    expect(collectStrings(fathom).flatMap(unknownNumbersIn)).toEqual([]);
  });

  it("keeps Orion free of the data-platform walkthrough, review and gate (split brief 2026-10-25)", () => {
    expect(collectBlocks(orion).some((block) => block.type === "walkthrough")).toBe(false);
    const text = collectStrings(orion).join("\n");
    expect(text).not.toMatch(/preflight|orion gate|orion review|PipelineBench|dbt/i);
  });

  it("notices a figure that was changed to another one the document also states (D3)", () => {
    expect(unknownNumbersIn("It caught 27 of 45 real historical bugs.")).toEqual([]);
    expect(unknownNumbersIn("It caught 21 of 45 real historical bugs.")).toEqual(["21"]);
    expect(unknownNumbersIn("It made 0 of 50 unsafe decisions, against 9 of 50.")).toEqual(["9", "50"]);
  });

  it("leaves out the sentences that use words the copy scan bans, and the sample verdict (D3)", () => {
    const text = [orion, fathom].flatMap(collectStrings).join("\n");
    expect(text).not.toMatch(/95%|sandbox|boundar/i);
    expect(text).not.toMatch(/88\/100|CON-031|INC-230/);
    // Plan step 4's sentence about facts missing from the diff is left out whole, because it names Go.
    expect(text).not.toMatch(/Today's misses need facts|byteLength|Unwrap/);
  });

  it("shows the replay of one recorded check in place of the chip walkthrough (owner, 2026-10-25)", () => {
    expect(collectBlocks(fathom).some((block) => block.type === "walkthrough")).toBe(false);
    expect(collectBlocks(fathom).filter((block) => block.type === "fathom-replay")).toEqual([{ type: "fathom-replay", skipHref: "#trust" }]);
    expect(fathom.sections.map((section) => section.id)).toContain("trust");
  });

  // Fathom's repository is reached only through its codeLink (made public 2026-10-25); the prose
  // of both studies still carries no address.
  it("holds no repository address or link in the Orion or Fathom text, outside Fathom's codeLink", () => {
    const { codeLink, ...fathomText } = fathom;
    expect(codeLink.href).toBe("https://github.com/muhibm1/fathom");
    const text = [orion, fathomText].flatMap(collectStrings).join("\n");
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

  it("is unlisted, after the listed studies, with the words Ongoing project and no code link (D7, D8, owner brief 2026-10-21)", () => {
    expect(portfolioData.caseStudies.map((study) => study.id).indexOf("atelier")).toBe(10);
    expect(atelier.listed).toBe(false);
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
    expect(walkthrough.steps.filter((step) => typeof step.person === "string").map((step) => step.id)).toEqual(["brief", "pick", "handoff"]);
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

// Owner, 2026-10-21: the Orion walkthrough opens the page in place of the terms grid, and plays
// 15% faster than the Atelier one.
// 2026-10-25 (owner's split brief): the walkthrough moved to Fathom, after its opening problem;
// Orion opens on where it sits, then the record, its tools, search, the daemon, its drawing, Auspex, lessons, the weight of the work and what's next.
describe("Fathom and Orion page order and pace", () => {
  const fathom = findCaseStudy("fathom");
  const orion = findCaseStudy("orion");

  it("follows the brief's order on both pages", () => {
    expect(fathom.sections.map((section) => section.id)).toEqual(["problem", "walkthrough", "trust", "review", "loop", "architecture", "evidence", "weight", "plan"]);
    expect(orion.sections.map((section) => section.id)).toEqual(["loop", "record", "tools", "retrieval", "always-on", "architecture", "auspex", "lessons", "weight", "plan"]);
  });

  it("leaves Atelier's walkthrough at the default pace", () => {
    expect(collectBlocks(findCaseStudy("atelier")).find((block) => block.type === "walkthrough").pace).toBeUndefined();
  });
});

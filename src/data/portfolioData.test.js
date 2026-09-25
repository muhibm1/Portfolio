// Pins the content module to the owner's approved plan (PORTFOLIO_REDESIGN_PLAN.md section 6)
// and the seven mockups, word for word. A failure here means a fact or a string drifted from
// what the owner approved; only he may change portfolioData.js (CLAUDE.md "Protected").
import { describe, expect, it } from "vitest";
import { portfolioData } from "./portfolioData.js";
import { staticRoutePaths } from "../routePaths.js";

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

const pinnedToolkit = [
  "Python, SQL, TypeScript, JavaScript, React, Elixir and Phoenix, Node.js",
  "Spark, Iceberg, Snowflake, Kafka, Airflow, dbt, Postgres, pgvector",
  "LLM decision systems, RAG with hybrid search and reranking, evals, agent orchestration, self-hosted models with Ollama",
  "AWS (S3, EMR, EKS, Lambda), Docker, Jenkins, CI/CD, OAuth2, REST, WebSockets",
  "Requirements from ambiguous goals, stakeholder partnership, delivery management, teaching, incident response",
];

const pinnedCaseStudyStats = {
  workhorse: ["28", "9", "5 to 2", "100%"],
  "apple-llm-triage": ["30 to 350+", "2 weeks", "Zero"],
  "apple-integration": ["~50%", "3 systems", "On demand"],
  "apple-data-health": ["Hundreds of thousands", "~40% fewer", "Tens of thousands"],
  "neural-newsletters-llm": ["~40%", "15 to 20%", "Live"],
};

// Copied verbatim from the committed mockups in docs/design/redesign-2026-09/ (owner-approved
// copy): CS-WorkHorse.dc.html, CS-Decision.dc.html, CS-Integration.dc.html,
// CS-DataHealth.dc.html, CS-NeuralNewsletters.dc.html.
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
        value: "A Claude Code plugin, a desktop app (Paddock) and a retrieval system (Studbook)",
      },
      {
        label: "Stack",
        value: "Node.js, Python, TypeScript, Electron, Supabase Postgres with pgvector",
      },
      { label: "Quality", value: "224 plugin tests, 278 desktop tests, CI on every push" },
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText:
      "Measure before asserting, put the non-negotiables in code, and cut whatever the numbers don't support. That's how I'd bring AI into a client's delivery process without asking anyone to trust it blindly.",
    contactHeading: "Want the walkthrough? I reply within a day.",
  },
  "apple-llm-triage": {
    eyebrow: "Case study · Apple (via TCS) · Data Health team · Feb 2025 to present",
    title: "A review backlog, turned into a decision system",
    lead:
      "Cross-team data changes were stuck behind a manual review queue. I built a self-hosted LLM system that reads each request and decides approve, reject or hold, with every decision auditable by a person.",
    atAGlance: [
      { label: "My role", value: "Self-initiated; selected the model, built, deployed and own it" },
      { label: "Live since", value: "November 2025" },
      { label: "Stack", value: "Python, open-source LLM self-hosted with Ollama, REST APIs" },
      { label: "Status", value: "In production" },
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText:
      "Find the review step everyone waits on. Separate the calls a system can make with a trail from the ones a person should make. Automate the first, keep people on the second, and keep tuning against live results.",
    contactHeading: "Have a queue like this? I reply within a day.",
  },
  "apple-integration": {
    eyebrow: "Case study · Apple (via TCS) · Systems integration · Feb 2025 to present",
    title: "Three systems, one tool, half the turnaround",
    lead:
      "Editing certain map features meant unlocking and relocking permissions by hand, across teams. I built a Python tool that does it on demand by working through the ticketing, repository and geo-data systems' own authenticated APIs.",
    atAGlance: [
      { label: "My role", value: "Built it end to end" },
      { label: "Systems", value: "Ticketing, code repository, geo-data" },
      { label: "Stack", value: "Python, REST APIs, OAuth2" },
      { label: "Result", value: "A manual, cross-team workflow replaced by access on demand" },
    ],
    calloutEyebrow: "What I'd bring to a client",
    calloutText:
      "Integrations tend to break on auth and permissions, not on the code in between. I've done that unglamorous part: getting separate systems to trust one tool, and keeping them trusting it when authentication changes underneath.",
    contactHeading: "Systems that don't talk to each other? Let's talk.",
  },
  "apple-data-health": {
    eyebrow: "Case study · Apple (via TCS) · Data reliability · Feb 2025 to present",
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
      "Bad data shows up in three places: already live, at the gate, and in an incident. I've owned all three at a scale of 50+ regions, and I've seen what moving a check upstream buys you: about 40% fewer failures at the gate.",
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

const bannedSkillWords = [
  "Kubernetes",
  "Databricks",
  "Delta Lake",
  "FastAPI",
  "fine-tuning",
  "TensorFlow",
  "NiFi",
  "MLOps",
];

function collectStrings(value) {
  if (typeof value === "string") return [value];
  if (value === null || typeof value !== "object") return [];
  return Object.values(value).flatMap(collectStrings);
}

function collectBlocks(caseStudy) {
  return caseStudy.sections.flatMap((section) => section.blocks);
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

  it("carries the five pinned home stat values in order (R138, G14)", () => {
    expect(portfolioData.home.stats.items.map((item) => item.value)).toEqual(pinnedHomeStats);
  });

  it("carries the five pinned role date strings in order (R138, G14)", () => {
    expect(portfolioData.home.experience.roles.map((role) => role.period)).toEqual(
      pinnedRoleDates,
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
});

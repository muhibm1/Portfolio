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

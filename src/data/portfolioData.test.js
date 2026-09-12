import { describe, expect, it } from "vitest";
import { portfolioData } from "./portfolioData.js";

// Copied verbatim from portfolioData.js on 2026-09-12. These are the owner's own claims
// (CLAUDE.md "Protected"), so a failure here means a claim changed and only he may approve it.
const pinnedTelemetry = [
  {
    metric: "350+",
    unit: "tickets/day",
    label: "LLM Triage Throughput",
    context: "Scaled from 30/day at Apple with auditable decision layer",
  },
  {
    metric: "50+",
    unit: "regions",
    label: "ML Remediation Reach",
    context: "Automated cleanup & data modernization across global pipelines",
  },
  {
    metric: "-40%",
    unit: "incidents",
    label: "Production Outage Drop",
    context: "Achieved via CI/CD gates, schema rewrites & WebSocket sync",
  },
  {
    metric: "99.9%",
    unit: "reliability",
    label: "Release Continuity",
    context: "Spark, Iceberg, Snowflake & AWS EKS checkpoint gates",
  },
];

const pinnedCaseStudies = [
  {
    id: "apple-llm-triage",
    title: "Apple: Production LLM Ticket Decision & Triage Engine",
  },
  {
    id: "apple-data-health",
    title: "Apple / Data Health: 50+ Region ML Remediation & Pipeline Reliability",
  },
  {
    id: "neural-newsletters-llm",
    title: "Neural Newsletters: Full-Stack Personalized LLM Platform",
  },
];

// Any North American number such as (555) 555-0100, 555-555-0100 or 555.555.0100. Generic on
// purpose: the owner's own digits must never appear in src/ (evals GC41 and GC89 grep for them).
const phoneNumberPattern = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}/;

function collectStrings(value) {
  if (typeof value === "string") return [value];
  if (value === null || typeof value !== "object") return [];
  return Object.values(value).flatMap(collectStrings);
}

describe("portfolioData", () => {
  it("keeps the four telemetry metrics and the three case-study ids and titles verbatim", () => {
    const telemetry = portfolioData.telemetry.map(({ metric, unit, label, context }) => ({
      metric,
      unit,
      label,
      context,
    }));
    const caseStudies = portfolioData.caseStudies.map(({ id, title }) => ({ id, title }));

    expect(telemetry).toEqual(pinnedTelemetry);
    expect(caseStudies).toEqual(pinnedCaseStudies);
  });

  it("publishes no phone number", () => {
    const phoneLikeStrings = collectStrings(portfolioData).filter((text) =>
      phoneNumberPattern.test(text),
    );

    expect(portfolioData.personal).not.toHaveProperty("phone");
    expect(phoneLikeStrings).toEqual([]);
  });

  it("lists exactly the workhorse, Shu and wasl projects, each with a boolean repoPublic and a repo under personal.github", () => {
    const { projects, personal } = portfolioData;

    expect(projects.map((project) => project.name)).toEqual(["workhorse", "Shu", "wasl"]);
    for (const project of projects) {
      expect(project.type).toBe("Project");
      expect(typeof project.repoPublic).toBe("boolean");
      expect(project.repo).toBe(`${personal.github}/${project.name}`);
    }
  });

  it("offers one live demo that links to /#simulator", () => {
    const { demos } = portfolioData;

    expect(demos).toHaveLength(1);
    expect(demos[0]).toMatchObject({
      id: "triage-simulator",
      type: "Live demo",
      href: "/#simulator",
    });
  });

  it("names the owner's GitHub profile", () => {
    const { personal } = portfolioData;

    expect(personal.github).toBe("https://github.com/muhibm1");
    expect(personal.githubHandle).toBe("github.com/muhibm1");
  });
});

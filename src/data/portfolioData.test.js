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
});

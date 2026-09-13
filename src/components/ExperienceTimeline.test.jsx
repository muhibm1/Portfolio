import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { portfolioData } from "../data/portfolioData.js";
import ExperienceTimeline from "./ExperienceTimeline.jsx";

describe("ExperienceTimeline", () => {
  it("renders every role and degree", () => {
    render(<ExperienceTimeline />);

    for (const job of portfolioData.experience) {
      expect(screen.getByText(job.company)).toBeInTheDocument();
      expect(screen.getByText(job.role)).toBeInTheDocument();
      expect(screen.getByText(job.period)).toBeInTheDocument();
    }
    for (const school of portfolioData.education) {
      expect(screen.getByText(school.degree)).toBeInTheDocument();
      expect(screen.getByText(school.institution)).toBeInTheDocument();
      expect(screen.getByText(school.graduation)).toBeInTheDocument();
    }
  });
});

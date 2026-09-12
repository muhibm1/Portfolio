import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { portfolioData } from "../data/portfolioData.js";
import SkillsMatrix from "./SkillsMatrix.jsx";

describe("SkillsMatrix", () => {
  it("renders every skill group", () => {
    render(<SkillsMatrix />);
    const skillGroups = Object.values(portfolioData.skills);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(skillGroups.length);
    for (const skill of skillGroups.flat()) {
      expect(screen.getByText(skill)).toBeInTheDocument();
    }
  });
});

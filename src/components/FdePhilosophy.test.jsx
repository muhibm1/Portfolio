import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { portfolioData } from "../data/portfolioData.js";
import FdePhilosophy from "./FdePhilosophy.jsx";

describe("FdePhilosophy", () => {
  it("renders every principle", () => {
    render(<FdePhilosophy />);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      portfolioData.philosophy.length,
    );
    for (const principle of portfolioData.philosophy) {
      expect(screen.getByText(principle.title)).toBeInTheDocument();
      expect(screen.getByText(principle.tagline)).toBeInTheDocument();
      expect(screen.getByText(principle.description)).toBeInTheDocument();
    }
  });
});

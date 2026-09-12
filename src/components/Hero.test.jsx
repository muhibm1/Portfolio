import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { portfolioData } from "../data/portfolioData.js";
import Hero from "./Hero.jsx";

describe("Hero", () => {
  it("renders the stacked name, the availability pill, all four telemetry metrics and one orb canvas", () => {
    render(<Hero />);

    const nameHeading = screen.getByRole("heading", { level: 1 });
    expect(nameHeading).toHaveTextContent(portfolioData.personal.name);
    expect(nameHeading.querySelectorAll("br")).toHaveLength(1);
    expect(screen.getByText(/^available for forward deployed engineering/i)).toBeInTheDocument();
    expect(portfolioData.telemetry).toHaveLength(4);
    for (const item of portfolioData.telemetry) {
      expect(screen.getByText(item.metric)).toBeInTheDocument();
    }
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(1);
    expect(images[0].tagName).toBe("CANVAS");
  });
});

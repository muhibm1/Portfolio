import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { portfolioData } from "../data/portfolioData.js";
import CaseStudiesSection from "./CaseStudiesSection.jsx";

const { caseStudies } = portfolioData;

describe("CaseStudiesSection", () => {
  it("links every case-study card to its /work page", () => {
    renderOnHomePage();

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(caseStudies.length);
    caseStudies.forEach((study, index) => {
      const card = cards[index];
      expect(within(card).getByRole("heading", { name: study.title })).toBeInTheDocument();
      expect(within(card).getByText(study.summary)).toBeInTheDocument();
      const workPageLinks = within(card)
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href") === `/work/${study.id}`);
      expect(workPageLinks).toHaveLength(1);
    });
  });

  it("offers no category filter on the home page", () => {
    renderOnHomePage();

    expect(screen.queryAllByRole("button")).toEqual([]);
    for (const category of new Set(caseStudies.map((study) => study.category))) {
      expect(screen.queryByText(category)).toBeNull();
    }
    expect(screen.getAllByRole("article")).toHaveLength(caseStudies.length);
  });
});

function renderOnHomePage() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <CaseStudiesSection />
    </MemoryRouter>,
  );
}

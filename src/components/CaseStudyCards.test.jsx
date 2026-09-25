import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { portfolioData } from "../data/portfolioData.js";
import CaseStudyCards from "./CaseStudyCards.jsx";

const { caseStudies } = portfolioData;

describe("CaseStudyCards", () => {
  it("renders five links in R127 order, the first the featured WorkHorse card", () => {
    render(
      <MemoryRouter>
        <CaseStudyCards caseStudies={caseStudies} />
      </MemoryRouter>,
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      caseStudies.map((study) => `/work/${study.id}`),
    );

    const featuredLink = links[0];
    expect(featuredLink.getAttribute("href")).toBe("/work/workhorse");
    for (const stat of ["100%", "+52%", "28", "0"]) {
      expect(within(featuredLink).getByText(stat)).toBeInTheDocument();
    }
  });

  it("renders the grid cards with their two tags and the read-more label", () => {
    render(
      <MemoryRouter>
        <CaseStudyCards caseStudies={caseStudies} />
      </MemoryRouter>,
    );

    const links = screen.getAllByRole("link");
    const gridLinks = links.slice(1);
    const gridStudies = caseStudies.slice(1);

    gridLinks.forEach((link, index) => {
      const study = gridStudies[index];
      for (const tag of study.card.tags) {
        expect(within(link).getByText(tag)).toBeInTheDocument();
      }
      expect(within(link).getByText("Read the case study")).toBeInTheDocument();
    });
  });
});

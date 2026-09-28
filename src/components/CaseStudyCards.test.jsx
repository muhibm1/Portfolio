import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { portfolioData } from "../data/portfolioData.js";
import CaseStudyCards from "./CaseStudyCards.jsx";

const { caseStudies } = portfolioData;

describe("CaseStudyCards", () => {
  it("renders five route links in R127 order, the first inside the featured article", () => {
    render(
      <MemoryRouter>
        <CaseStudyCards caseStudies={caseStudies} />
      </MemoryRouter>,
    );

    const routeLinks = screen.getAllByRole("link", { name: /read the case study/i });
    expect(routeLinks).toHaveLength(5);
    expect(routeLinks.map((link) => link.getAttribute("href"))).toEqual(
      caseStudies.map((study) => `/work/${study.id}`),
    );

    const featuredArticle = screen.getByRole("article");
    expect(within(featuredArticle).getByRole("link", { name: /read the case study/i })).toHaveAttribute(
      "href",
      "/work/workhorse",
    );
  });

  it("gives the featured article one external code link alongside the route link, with neither nested in the other", () => {
    render(
      <MemoryRouter>
        <CaseStudyCards caseStudies={caseStudies} />
      </MemoryRouter>,
    );

    const featuredArticle = screen.getByRole("article");
    const codeLink = within(featuredArticle).getByRole("link", { name: /public snapshot/i });
    expect(codeLink).toHaveAttribute("href", caseStudies[0].codeLink.href);
    expect(codeLink).toHaveAttribute("target", "_blank");
    expect(codeLink).toHaveAttribute("rel", "noopener noreferrer");
    // R153/WCAG 2.5.3: the accessible name must name the repository, not just "View the code".
    expect(codeLink).toHaveAttribute(
      "aria-label",
      expect.stringContaining(caseStudies[0].codeLink.label),
    );

    const anchors = featuredArticle.querySelectorAll("a");
    for (const anchor of anchors) {
      expect(anchor.querySelector("a")).toBeNull();
    }
  });

  it("shows the featured card's four stats", () => {
    render(
      <MemoryRouter>
        <CaseStudyCards caseStudies={caseStudies} />
      </MemoryRouter>,
    );

    const featuredArticle = screen.getByRole("article");
    for (const stat of ["100%", "3 of 3", "40", "9"]) {
      expect(within(featuredArticle).getByText(stat)).toBeInTheDocument();
    }
  });

  it("renders the grid cards with their two tags, the read-more label, and no code link", () => {
    render(
      <MemoryRouter>
        <CaseStudyCards caseStudies={caseStudies} />
      </MemoryRouter>,
    );

    const gridStudies = caseStudies.slice(1);
    const gridLinks = screen
      .getAllByRole("link", { name: /read the case study/i })
      .filter((link) => link.getAttribute("href") !== "/work/workhorse");

    gridLinks.forEach((link, index) => {
      const study = gridStudies[index];
      for (const tag of study.card.tags) {
        expect(within(link).getByText(tag)).toBeInTheDocument();
      }
      expect(within(link).getByText("Read the case study")).toBeInTheDocument();
    });

    expect(screen.getAllByText("View the code")).toHaveLength(1);
  });
});

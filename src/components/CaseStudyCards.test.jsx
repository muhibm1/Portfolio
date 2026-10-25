import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { portfolioData } from "../data/portfolioData.js";
import CaseStudyCards from "./CaseStudyCards.jsx";

const { caseStudies } = portfolioData;
const listed = caseStudies.filter((study) => study.listed !== false);
const featured = listed.filter((study) => study.card.featured);
const more = listed.filter((study) => !study.card.featured);

function renderCards() {
  return render(
    <MemoryRouter>
      <CaseStudyCards caseStudies={caseStudies} moreHeading="More work" />
    </MemoryRouter>,
  );
}

describe("CaseStudyCards", () => {
  it("renders one route link per listed study in data order, the three featured ones as articles first (owner brief 2026-10-21)", () => {
    renderCards();

    const routeLinks = screen.getAllByRole("link", { name: /read the case study/i });
    expect(routeLinks.map((link) => link.getAttribute("href"))).toEqual(listed.map((study) => `/work/${study.id}`));
    expect(featured.map((study) => study.id)).toEqual(["agentops", "flywheel", "apple-decision-support-agent"]);

    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(3);
    articles.forEach((article, index) => {
      expect(within(article).getByRole("link", { name: /read the case study/i })).toHaveAttribute(
        "href",
        `/work/${featured[index].id}`,
      );
    });
  });

  // WorkHorse's page was removed on 2026-10-25 (owner's request); its address redirects to the
  // work list, so it has neither a card nor a page.
  it("gives no card to Atelier or Neural Newsletters, whose pages stay live, and none to WorkHorse", () => {
    renderCards();

    expect(caseStudies.find((study) => study.id === "workhorse")).toBeUndefined();
    expect(document.querySelectorAll('a[href="/work/workhorse"]')).toHaveLength(0);
    for (const id of ["atelier", "neural-newsletters-llm"]) {
      expect(caseStudies.find((study) => study.id === id).listed).toBe(false);
      expect(document.querySelectorAll(`a[href="/work/${id}"]`)).toHaveLength(0);
    }
  });

  it("opens each featured card with its problem, decision and result before the stats", () => {
    renderCards();

    screen.getAllByRole("article").forEach((article, index) => {
      const { deploymentSummary } = featured[index];
      const summary = within(article).getByLabelText("Deployment summary");
      expect(within(summary).getByText("Problem")).toBeInTheDocument();
      expect(within(summary).getByText(deploymentSummary.problem)).toBeInTheDocument();
      expect(within(summary).getByText(deploymentSummary.decision)).toBeInTheDocument();
      expect(within(summary).getByText(deploymentSummary.result)).toBeInTheDocument();
    });
  });

  it("shows four stats on every featured card, Flywheel's from its card and the others' from their pages", () => {
    renderCards();

    const articles = screen.getAllByRole("article");
    articles.forEach((article, index) => {
      const study = featured[index];
      const stats = study.card.stats ?? study.stats;
      expect(stats).toHaveLength(4);
      for (const stat of stats) {
        expect(within(article).getByText(stat.label)).toBeInTheDocument();
      }
    });
    expect(featured[1].card.stats.map((stat) => stat.value)).toEqual(["19 to 14", "27 of 33", "0 of 3", "5"]);
  });

  it("gives featured cards with a public repository one external code link, with no link nested in another", () => {
    renderCards();

    const articles = screen.getAllByRole("article");
    articles.forEach((article, index) => {
      const study = featured[index];
      const codeLinks = within(article).queryAllByRole("link", { name: /public snapshot/i });
      if (!study.codeLink) {
        expect(codeLinks).toHaveLength(0);
        return;
      }
      expect(codeLinks).toHaveLength(1);
      expect(codeLinks[0]).toHaveAttribute("href", study.codeLink.href);
      expect(codeLinks[0]).toHaveAttribute("target", "_blank");
      expect(codeLinks[0]).toHaveAttribute("rel", "noopener noreferrer");
      // R153/WCAG 2.5.3: the accessible name must name the repository, not just "View the code".
      expect(codeLinks[0]).toHaveAttribute("aria-label", expect.stringContaining(study.codeLink.label));
      for (const anchor of article.querySelectorAll("a")) {
        expect(anchor.querySelector("a")).toBeNull();
      }
    });
    expect(screen.getAllByText("View the code")).toHaveLength(2);
  });

  it("puts the More work heading above the compact cards, each with its two tags and the read-more label", () => {
    renderCards();

    expect(screen.getByRole("heading", { name: "More work" })).toBeInTheDocument();
    expect(more.map((study) => study.id)).toEqual([
      "esper",
      "orion",
      "apple-integration",
      "apple-data-health",
    ]);
    for (const study of more) {
      const link = document.querySelector(`a[href="/work/${study.id}"]`);
      for (const tag of study.card.tags) {
        expect(within(link).getByText(tag)).toBeInTheDocument();
      }
      expect(within(link).getByText("Read the case study")).toBeInTheDocument();
    }
  });

  it("shows Ongoing project on the Orion card and links to none of the private repositories (TG-07, D2; agent harness page removed 2026-10-25)", () => {
    renderCards();

    for (const id of ["orion"]) {
      const study = caseStudies.find((candidate) => candidate.id === id);
      expect(study.status).toBe("Ongoing project");
      expect(study.codeLink).toBeUndefined();
      const card = document.querySelector(`a[href="/work/${id}"]`);
      expect(within(card).getByText("Ongoing project")).toBeInTheDocument();
    }
    expect(screen.getAllByText("Ongoing project")).toHaveLength(1);
    expect(document.querySelectorAll('a[href*="github.com/muhibm1/orion"]')).toHaveLength(0);
    expect(document.querySelectorAll('a[href*="github.com/muhibm1/tannhauser"]')).toHaveLength(0);
  });
});

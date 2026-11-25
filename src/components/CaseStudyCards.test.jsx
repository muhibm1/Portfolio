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
  // Owner's brief, 2026-11-24: the study leads, then the three deployments.
  it("renders one route link per listed study in data order, the study and the three deployments as articles first (owner brief 2026-11-24)", () => {
    renderCards();

    const routeLinks = screen.getAllByRole("link", { name: /read the (case )?study/i });
    expect(routeLinks.map((link) => link.getAttribute("href"))).toEqual(listed.map((study) => `/work/${study.id}`));
    expect(featured.map((study) => study.id)).toEqual(["building-around-a-model", "casepilot", "clearledger", "agentops"]);

    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(4);
    articles.forEach((article, index) => {
      expect(within(article).getByRole("link", { name: /read the (case )?study/i })).toHaveAttribute(
        "href",
        `/work/${featured[index].id}`,
      );
    });
  });

  // WorkHorse's page was removed on 2026-10-25 (owner's request); its address redirects to the
  // work list, so it has neither a card nor a page.
  it("gives no card to Atelier, whose page stays live, and none to WorkHorse or Neural Newsletters (removed 2026-10-25)", () => {
    renderCards();

    expect(caseStudies.find((study) => study.id === "workhorse")).toBeUndefined();
    expect(document.querySelectorAll('a[href="/work/workhorse"]')).toHaveLength(0);
    expect(caseStudies.find((study) => study.id === "neural-newsletters-llm")).toBeUndefined();
    for (const id of ["atelier", "neural-newsletters-llm"]) {
      expect(caseStudies.find((study) => study.id === id)?.listed ?? false).toBe(false);
      expect(document.querySelectorAll(`a[href="/work/${id}"]`)).toHaveLength(0);
    }
  });

  it("opens each deployment card with who uses it, what goes wrong, the rule in code and the result before the stats (owner brief 2026-11-25), and the study card with its summary", () => {
    renderCards();

    screen.getAllByRole("article").forEach((article, index) => {
      const { deploymentSummary, card } = featured[index];
      if (!deploymentSummary) {
        expect(within(article).getByText(card.summary)).toBeInTheDocument();
        return;
      }
      const summary = within(article).getByLabelText("Deployment summary");
      expect(within(summary).getByText("Who uses it")).toBeInTheDocument();
      expect(within(summary).getByText(deploymentSummary.customer)).toBeInTheDocument();
      expect(within(summary).getByText(deploymentSummary.problem)).toBeInTheDocument();
      expect(within(summary).getByText(deploymentSummary.integration)).toBeInTheDocument();
      expect(within(summary).getByText(deploymentSummary.result)).toBeInTheDocument();
      // The card keeps to four rows; the page shows all six.
      expect(within(summary).queryByText("Testing")).toBeNull();
      expect(within(summary).queryByText("Decision")).toBeNull();
    });
  });

  it("shows four stats on every featured card, from the card where it carries its own", () => {
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
    expect(featured[1].card.stats.map((stat) => stat.value)).toEqual(["39 of 40", "0", "34 of 35", "67% to 97%"]);
  });

  it("gives featured cards with a public repository one external code link, with no link nested in another", () => {
    renderCards();

    const articles = screen.getAllByRole("article");
    articles.forEach((article, index) => {
      const study = featured[index];
      const codeLinks = within(article).queryAllByRole("link", { name: /public repository/i });
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
    // ClearLedger and AgentOps are public; the study and CasePilot carry no code link.
    expect(screen.getAllByText("View the code")).toHaveLength(2);
  });

  it("puts the More work heading above the compact cards, each with its two tags and the read-more label", () => {
    renderCards();

    expect(screen.getByRole("heading", { name: "More work" })).toBeInTheDocument();
    expect(more.map((study) => study.id)).toEqual([
      "apple-decision-support-agent",
      "erp-data-platform",
      "analyst-agent",
      "collections-agent",
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

  it("shows CasePilot's status, gives Orion and Fathom no card, and links to none of the private repositories (TG-07, D2; owner 2026-11-24)", () => {
    const { container } = renderCards();

    const casepilot = caseStudies.find((candidate) => candidate.id === "casepilot");
    expect(casepilot.status).toBe("Code available on request");
    expect(casepilot.codeLink).toBeUndefined();
    expect(within(container).getByText("Code available on request")).toBeInTheDocument();

    expect(caseStudies.find((candidate) => candidate.id === "fathom")).toBeUndefined();
    expect(document.querySelectorAll('a[href="/work/orion"]')).toHaveLength(0);
    expect(document.querySelectorAll('a[href*="github.com/muhibm1/fathom"]')).toHaveLength(0);
    expect(document.querySelectorAll('a[href*="github.com/muhibm1/casepilot"]')).toHaveLength(0);

    expect(screen.queryAllByText("Ongoing project")).toHaveLength(0);
    expect(document.querySelectorAll('a[href*="github.com/muhibm1/orion"]')).toHaveLength(0);
    expect(document.querySelectorAll('a[href*="github.com/muhibm1/auspex"]')).toHaveLength(0);
    expect(document.querySelectorAll('a[href*="github.com/muhibm1/tannhauser"]')).toHaveLength(0);
  });
});

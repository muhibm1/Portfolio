import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import WorkIndexPage from './WorkIndexPage';

const privateRepositoryNote = 'Private repository · walkthrough on request';
const caseStudyPagesInDataOrder = [
  '/work/apple-llm-triage',
  '/work/apple-data-health',
  '/work/neural-newsletters-llm',
];

describe('WorkIndexPage', () => {
  it('holds three case studies, three projects and one live demo in labelled regions', () => {
    renderWorkIndexAt('/work');

    expect(articlesIn('Case studies')).toHaveLength(3);
    expect(articlesIn('Projects')).toHaveLength(3);
    expect(articlesIn('Live demo')).toHaveLength(1);
  });

  it('renders the workhorse, Shu and wasl projects', () => {
    renderWorkIndexAt('/work');

    const projects = region('Projects');

    for (const name of ['workhorse', 'Shu', 'wasl']) {
      expect(within(projects).getByRole('heading', { name })).toBeInTheDocument();
    }
  });

  it('links the live demo to the simulator on the home page', () => {
    renderWorkIndexAt('/work');

    const demoLink = within(region('Live demo')).getByRole('link');

    expect(demoLink.getAttribute('href')).toMatch(/#simulator$/);
  });

  it('lists the case studies in data order, each linking to its own page', () => {
    renderWorkIndexAt('/work');

    const hrefs = within(region('Case studies'))
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));

    expect(hrefs).toEqual(caseStudyPagesInDataOrder);
  });

  it('shows 7 articles by default and only the 3 projects after choosing Project', () => {
    renderWorkIndexAt('/work');
    expect(screen.getAllByRole('article')).toHaveLength(7);

    clickFilter('Project');

    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(articlesIn('Projects')).toHaveLength(3);
    expect(screen.queryByRole('region', { name: 'Case studies' })).toBeNull();
    expect(screen.queryByRole('region', { name: 'Live demo' })).toBeNull();
  });

  it('offers the type filter as links to ?type= addresses, not buttons', () => {
    renderWorkIndexAt('/work');

    expect(filterLink('All')).toHaveAttribute('href', '/work?type=all');
    expect(filterLink('Case study')).toHaveAttribute('href', '/work?type=case-study');
    expect(filterLink('Project')).toHaveAttribute('href', '/work?type=project');
    expect(filterLink('Live demo')).toHaveAttribute('href', '/work?type=live-demo');
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('keeps all seven entries in their original order after cycling every filter back to All', () => {
    renderWorkIndexAt('/work');
    const originalOrder = articleHeadings();

    clickFilter('Case study');
    expect(screen.getAllByRole('article')).toHaveLength(3);
    clickFilter('Project');
    expect(screen.getAllByRole('article')).toHaveLength(3);
    clickFilter('Live demo');
    expect(screen.getAllByRole('article')).toHaveLength(1);
    clickFilter('All');

    expect(originalOrder).toHaveLength(7);
    expect(articleHeadings()).toEqual(originalOrder);
  });

  it('marks only the active filter link as current', () => {
    renderWorkIndexAt('/work?type=project');

    expect(filterLink('Project')).toHaveAttribute('aria-current', 'true');
    expect(filterLink('All')).not.toHaveAttribute('aria-current');
  });

  it('shows every entry when the address names an unknown type', () => {
    renderWorkIndexAt('/work?type=%3Cscript%3Ealert(1)%3C%2Fscript%3E');

    expect(screen.getAllByRole('article')).toHaveLength(7);
    expect(filterLink('All')).toHaveAttribute('aria-current', 'true');
  });

  it('shows the private-repository note on every project card the data marks private', () => {
    renderWorkIndexAt('/work');
    const privateProjects = portfolioData.projects.filter((project) => !project.repoPublic);
    const publicProjectCount = portfolioData.projects.length - privateProjects.length;

    for (const project of privateProjects) {
      const card = projectCard(project.name);
      expect(within(card).getByText(privateRepositoryNote)).toBeInTheDocument();
      expect(within(card).getByRole('link', { name: portfolioData.personal.email })).toHaveAttribute(
        'href',
        `mailto:${portfolioData.personal.email}`,
      );
      expect(within(card).queryByRole('link', { name: /github/i })).toBeNull();
    }

    expect(within(region('Projects')).getAllByText(privateRepositoryNote)).toHaveLength(
      privateProjects.length,
    );
    expect(within(region('Projects')).queryAllByRole('link', { name: /github/i })).toHaveLength(
      publicProjectCount,
    );
  });

  it('links the header to GitHub, LinkedIn and the email address from portfolioData', () => {
    renderWorkIndexAt('/work');
    const { personal } = portfolioData;

    const header = screen.getByRole('heading', { level: 1 }).closest('header');

    expect(within(header).getByRole('link', { name: personal.githubHandle })).toHaveAttribute(
      'href',
      personal.github,
    );
    expect(within(header).getByRole('link', { name: personal.linkedinHandle })).toHaveAttribute(
      'href',
      personal.linkedin,
    );
    expect(within(header).getByRole('link', { name: personal.email })).toHaveAttribute(
      'href',
      `mailto:${personal.email}`,
    );
  });
});

function renderWorkIndexAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/work" element={<WorkIndexPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function region(name) {
  return screen.getByRole('region', { name });
}

function articlesIn(regionName) {
  return within(region(regionName)).getAllByRole('article');
}

function articleHeadings() {
  return screen
    .getAllByRole('article')
    .map((article) => within(article).getByRole('heading').textContent);
}

function projectCard(projectName) {
  return within(region('Projects')).getByRole('heading', { name: projectName }).closest('article');
}

function filterLink(label) {
  return screen.getByRole('link', { name: label });
}

function clickFilter(label) {
  fireEvent.click(filterLink(label));
}

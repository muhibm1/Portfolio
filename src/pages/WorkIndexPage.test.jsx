import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import WorkIndexPage from './WorkIndexPage';

const bannedNames = ['All', 'Case study', 'Project', 'Live demo'];

describe('WorkIndexPage', () => {
  it('has a visually hidden h1 naming the page for assistive tech', () => {
    renderWorkIndexAt('/work');

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Case studies');
    expect(heading).toHaveClass('sr-only');
  });

  it('lists the five case studies in R127 order, the first the featured variant', () => {
    renderWorkIndexAt('/work');

    const links = caseStudyLinks();
    expect(links).toHaveLength(5);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      portfolioData.caseStudies.map((study) => `/work/${study.id}`),
    );
    expect(links[0]).toHaveAttribute('href', '/work/workhorse');
  });

  it('has no type-filter controls and no Projects or Live demo heading', () => {
    renderWorkIndexAt('/work');

    for (const name of bannedNames) {
      expect(screen.queryByRole('link', { name })).toBeNull();
      expect(screen.queryByRole('button', { name })).toBeNull();
    }
    expect(screen.queryByRole('heading', { name: 'Projects' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Live demo' })).toBeNull();
  });

  it('renders the same five case studies regardless of a ?type= address', () => {
    renderWorkIndexAt('/work?type=project');

    const links = caseStudyLinks();
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      portfolioData.caseStudies.map((study) => `/work/${study.id}`),
    );
  });
});

function caseStudyLinks() {
  return screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('href').startsWith('/work/'));
}

function renderWorkIndexAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <WorkIndexPage />
    </MemoryRouter>,
  );
}

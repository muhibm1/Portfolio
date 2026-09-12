import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import ProjectEntry from './ProjectEntry';

const privateRepositoryNote = 'Private repository · walkthrough on request';

describe('ProjectEntry', () => {
  it('renders the project as one article with its name, tagline, description and stack', () => {
    const project = fixtureProject({ repoPublic: false });

    render(<ProjectEntry project={project} />);

    const article = screen.getByRole('article');
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: project.name })).toBeInTheDocument();
    expect(article).toHaveTextContent(project.tagline);
    expect(article).toHaveTextContent(project.description);
    expect(article).toHaveTextContent('Node.js ~ React');
  });

  it('links to the GitHub repository when the repository is public', () => {
    const project = fixtureProject({ repoPublic: true });

    render(<ProjectEntry project={project} />);

    expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute('href', project.repo);
    expect(screen.queryByText(privateRepositoryNote)).toBeNull();
  });

  it('shows the private-repository note with an email link and no GitHub link when the repository is private', () => {
    render(<ProjectEntry project={fixtureProject({ repoPublic: false })} />);

    expect(screen.getByText(privateRepositoryNote)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: portfolioData.personal.email })).toHaveAttribute(
      'href',
      `mailto:${portfolioData.personal.email}`,
    );
    expect(screen.queryByRole('link', { name: /github/i })).toBeNull();
    expect(linkHrefs().filter((href) => href.includes('github.com'))).toEqual([]);
  });
});

function fixtureProject(overrides) {
  return {
    id: 'example-project',
    name: 'example-project',
    type: 'Project',
    tagline: 'A fixture tagline.',
    description: 'A fixture description.',
    techStack: ['Node.js', 'React'],
    status: 'Active',
    repoPublic: false,
    repo: `${portfolioData.personal.github}/example-project`,
    ...overrides,
  };
}

function linkHrefs() {
  return screen.getAllByRole('link').map((link) => link.getAttribute('href'));
}

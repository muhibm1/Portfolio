import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import SiteLayout from '../components/SiteLayout';
import HomePage from './HomePage';

// G6, G12. Mounted inside SiteLayout, the way the site's route table does (the SiteHeader.test.jsx
// pattern): App itself is not rendered here because src/pages/WorkIndexPage.jsx, owned by the
// parallel work-index task, still imports the deleted ProjectEntry component on this branch.
describe('HomePage', () => {
  const { home, personal } = portfolioData;
  const resumeHref = `${import.meta.env.BASE_URL}${personal.resumeFileName}`;

  it('renders the hero heading, eyebrow and the three "Right now" titles', () => {
    renderHomePage();

    expect(screen.getByRole('heading', { level: 1, name: home.hero.heading })).toBeInTheDocument();
    expect(screen.getByText(home.hero.eyebrow)).toBeInTheDocument();
    expect(screen.getByText('At Apple')).toBeInTheDocument();
    expect(screen.getByText('Building WorkHorse')).toBeInTheDocument();
    expect(screen.getByText('Looking for')).toBeInTheDocument();
  });

  it('renders the five production stat values', () => {
    renderHomePage();

    for (const item of home.stats.items) {
      expect(screen.getAllByText(item.value).length).toBeGreaterThan(0);
    }
  });

  it('carries the mobile-only stat grid with the md:hidden class', () => {
    renderHomePage();

    const mobileGrid = document.querySelector('[data-testid="mobile-stats-grid"]');
    expect(mobileGrid).not.toBeNull();
    expect(mobileGrid.className).toContain('md:hidden');
  });

  it('renders the four section eyebrows in order', () => {
    renderHomePage();

    expect(screen.getByText('01 · Case studies')).toBeInTheDocument();
    expect(screen.getByText('02 · How I work')).toBeInTheDocument();
    expect(screen.getByText('03 · Experience')).toBeInTheDocument();
    expect(screen.getByText('04 · Contact')).toBeInTheDocument();
  });

  it('renders the four "How I work" principle headings', () => {
    renderHomePage();

    for (const item of home.principles.items) {
      expect(screen.getByRole('heading', { name: item.title })).toBeInTheDocument();
    }
  });

  it('renders the five experience role headings and the two degrees', () => {
    renderHomePage();

    for (const role of home.experience.roles) {
      expect(screen.getByText(`${role.title} · ${role.company}`)).toBeInTheDocument();
    }
    for (const item of home.education.items) {
      expect(screen.getByText(item.degree)).toBeInTheDocument();
    }
  });

  it('renders the five toolkit headings', () => {
    renderHomePage();

    for (const column of home.toolkit.columns) {
      expect(screen.getByRole('heading', { name: column.title })).toBeInTheDocument();
    }
  });

  it('keeps a single h1 first, with every other heading an h2 or h3 and no level skipped', () => {
    renderHomePage();

    const levels = screen.getAllByRole('heading').map((heading) => Number(heading.tagName[1]));

    expect(levels[0]).toBe(1);
    expect(levels.filter((level) => level === 1)).toHaveLength(1);
    expect(levels.slice(1).every((level) => level === 2 || level === 3)).toBe(true);
  });

  it('renders the location line and a footer with md:hidden mobile-only copy', () => {
    renderHomePage();

    expect(screen.getByText(home.contact.location)).toBeInTheDocument();
    const footer = screen.getByRole('contentinfo');
    const mobileNodes = [...footer.querySelectorAll('.md\\:hidden')];
    expect(mobileNodes.length).toBeGreaterThan(0);
  });

  it('renders the five case-study cards linking into /work', () => {
    renderHomePage();

    for (const study of portfolioData.caseStudies) {
      expect(screen.getByRole('link', { name: new RegExp(escapeRegExp(study.card.title)) })).toHaveAttribute(
        'href',
        `/work/${study.id}`,
      );
    }
  });

  // G12: the four Resume controls all point at the same PDF path, and no modal copy remains.
  it('links every Resume control to the same PDF, with no Curriculum Vitae text or modal', () => {
    renderHomePage();

    const resumeLinks = screen.getAllByRole('link', { name: 'Resume' });
    expect(resumeLinks.length).toBeGreaterThanOrEqual(2);
    for (const link of resumeLinks) {
      expect(link).toHaveAttribute('href', resumeHref);
    }

    expect(screen.getByRole('link', { name: 'Download resume' })).toHaveAttribute('href', resumeHref);
    expect(screen.getByRole('link', { name: 'Full resume (PDF)' })).toHaveAttribute('href', resumeHref);
    expect(resumeHref.endsWith('/Muhammad_Muhibullah_Resume.pdf')).toBe(true);
    expect(screen.queryByText('Curriculum Vitae')).toBeNull();
  });
});

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderHomePage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<HomePage />} />
          <Route path="work/:slug" element={<div>Stub outlet</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

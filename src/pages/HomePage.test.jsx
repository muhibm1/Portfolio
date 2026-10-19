import { render, screen, within } from '@testing-library/react';
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

  it('renders the hero heading, eyebrow and the code line in the footer', () => {
    renderHomePage();

    expect(screen.getByRole('heading', { level: 1, name: home.hero.heading })).toBeInTheDocument();
    expect(screen.getByText(home.hero.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(home.hero.codeLine.text)).toBeInTheDocument();
  });

  it('no longer renders the "Right now" card, the toolkit or the education heading, though the data stays (the Look drops them from the page)', () => {
    renderHomePage();

    for (const item of home.hero.rightNow.items) {
      expect(screen.queryByText(item.title)).toBeNull();
    }
    for (const column of home.toolkit.columns) {
      expect(screen.queryByRole('heading', { name: column.title })).toBeNull();
    }
    expect(home.hero.rightNow.items.length).toBeGreaterThan(0);
    expect(home.toolkit.columns.length).toBeGreaterThan(0);
  });

  it('shows the AgentOps replay in the hero with its nine steps as text', () => {
    renderHomePage();

    const replay = portfolioData.homeReplay;
    expect(screen.getByRole('region', { name: replay.regionLabel })).toBeInTheDocument();
    expect(replay.steps).toHaveLength(9);
  });

  it('shows the AgentOps proof band with the case study results and a link to the case study', () => {
    renderHomePage();

    const agentOps = portfolioData.caseStudies.find((study) => study.id === 'agentops');
    const band = document.getElementById('agentops');
    expect(band).not.toBeNull();
    for (const stat of agentOps.stats) {
      expect(within(band).getByText(stat.value)).toBeInTheDocument();
    }
    expect(within(band).getByRole('link', { name: agentOps.card.linkText })).toHaveAttribute('href', '/work/agentops');
  });

  it('renders the five production stat values', () => {
    renderHomePage();

    for (const item of home.stats.items) {
      expect(screen.getAllByText(item.value).length).toBeGreaterThan(0);
    }
  });

  it('shows the production stats band with every caption, in one band that serves phone and desktop', () => {
    renderHomePage();

    expect(screen.getByText(home.stats.caption)).toBeInTheDocument();
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

  it('renders every case-study card linking into /work', () => {
    renderHomePage();

    for (const study of portfolioData.caseStudies) {
      expect(screen.getByRole('link', { name: new RegExp(escapeRegExp(study.card.title)) })).toHaveAttribute(
        'href',
        `/work/${study.id}`,
      );
    }
  });

  // G12: no resume control anywhere on the page, and the footer carries exactly email and LinkedIn.
  it('has no resume control anywhere on the page', () => {
    renderHomePage();

    expect(screen.queryByRole('link', { name: /resume/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /resume/i })).toBeNull();
    expect(screen.queryByText('Curriculum Vitae')).toBeNull();
  });

  it('links the footer to exactly email, LinkedIn and the one public-code line', () => {
    renderHomePage();

    const footerLinks = within(screen.getByRole('contentinfo'))
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'));

    expect(footerLinks).toHaveLength(3);
    expect(footerLinks).toEqual(
      expect.arrayContaining([`mailto:${personal.email}`, personal.linkedin, home.hero.codeLine.href]),
    );
  });

  // R132: one primary button plus the email link, no second "Download resume" button.
  it('renders one hero call to action, the email address as selectable text with a Copy button, and no resume link', () => {
    renderHomePage();

    expect(screen.getByRole('link', { name: home.hero.primaryCta })).toHaveAttribute('href', '#work');
    expect(screen.getByRole('button', { name: 'Copy the email address' })).toBeInTheDocument();
    expect(screen.getAllByText(personal.email).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Download resume' })).toBeNull();
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

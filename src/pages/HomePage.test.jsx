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

  it('no longer renders the "Right now" card, the toolkit or the education box (both degrees), though the data stays (the Look drops them from the page)', () => {
    renderHomePage();

    for (const item of home.hero.rightNow.items) {
      expect(screen.queryByText(item.title)).toBeNull();
    }
    for (const column of home.toolkit.columns) {
      expect(screen.queryByRole('heading', { name: column.title })).toBeNull();
    }
    for (const item of home.education.items) {
      expect(screen.queryByText(item.degree)).toBeNull();
      expect(screen.queryByText(item.date)).toBeNull();
    }
    expect(screen.queryByRole('heading', { name: /education/i })).toBeNull();
    expect(home.education.items.length).toBeGreaterThan(0);
    expect(home.hero.rightNow.items.length).toBeGreaterThan(0);
    expect(home.toolkit.columns.length).toBeGreaterThan(0);
  });

  it('shows the AgentOps replay in the hero with its nine steps as text', () => {
    renderHomePage();

    const replay = portfolioData.homeReplay;
    expect(screen.getByRole('region', { name: replay.regionLabel })).toBeInTheDocument();
    expect(replay.steps).toHaveLength(9);
  });

  it('drops the AgentOps proof band, since AgentOps is now the first featured card, and skips the replay to the stats (owner brief 2026-10-21)', () => {
    renderHomePage();

    expect(document.getElementById('agentops')).toBeNull();
    expect(document.getElementById('stats')).not.toBeNull();
    expect(portfolioData.homeReplay.skip.href).toBe('#stats');
  });

  it('orders the sections hero, stats, About, work, build log, How I work, Experience, Contact (owner brief 2026-10-21)', () => {
    renderHomePage();

    const ids = ['stats', 'about', 'work', 'build-log', 'approach', 'experience', 'contact'];
    const elements = ids.map((id) => document.getElementById(id));
    elements.forEach((element, index) => {
      expect(element, ids[index]).not.toBeNull();
      if (index > 0) {
        expect(elements[index - 1].compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      }
    });
  });

  it('renders About with its heading and text', () => {
    renderHomePage();

    const about = document.getElementById('about');
    expect(within(about).getByRole('heading', { name: home.about.heading })).toBeInTheDocument();
    expect(within(about).getByText(home.about.text)).toBeInTheDocument();
  });

  it('renders the build log heading, its direction statement and every dated entry, newest first', () => {
    renderHomePage();

    const log = document.getElementById('build-log');
    expect(within(log).getByRole('heading', { name: 'Build log: what changed and why' })).toBeInTheDocument();
    expect(within(log).getByText(home.buildLog.direction)).toBeInTheDocument();
    const items = within(log).getAllByRole('listitem');
    expect(items).toHaveLength(home.buildLog.entries.length);
    items.forEach((item, index) => {
      expect(within(item).getByText(home.buildLog.entries[index].text)).toBeInTheDocument();
    });
    expect(home.buildLog.entries[0].date).toBe('Oct 25, 2026');
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

  it('renders the six numbered section eyebrows', () => {
    renderHomePage();

    for (const eyebrow of ['01 · About', '02 · Work', '03 · Build log', '04 · How I work', '05 · Experience', '06 · Contact']) {
      expect(screen.getByText(eyebrow)).toBeInTheDocument();
    }
  });

  it('renders the four "How I work" principle headings', () => {
    renderHomePage();

    for (const item of home.principles.items) {
      expect(screen.getByRole('heading', { name: item.title })).toBeInTheDocument();
    }
  });

  it('renders the five experience role headings, and no degrees (education is dropped from the page)', () => {
    renderHomePage();

    for (const role of home.experience.roles) {
      expect(screen.getByText(`${role.title} · ${role.company}`)).toBeInTheDocument();
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

  it('renders a card linking into /work for every listed case study, and none for the unlisted ones', () => {
    renderHomePage();

    for (const study of portfolioData.caseStudies) {
      const cardLinks = document.querySelectorAll(`#work a[href="/work/${study.id}"]`);
      if (study.listed === false) {
        expect(cardLinks, study.id).toHaveLength(0);
      } else {
        expect(cardLinks.length, study.id).toBeGreaterThan(0);
        expect(screen.getAllByText(study.card.title).length).toBeGreaterThan(0);
      }
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

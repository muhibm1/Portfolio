// Tests the single-scroll case-study template (ADR 0006, R127, R135, R136). G10 and G11 read the
// data module directly so a wrong copy or a wrong block never passes silently.
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import CaseStudyPage from './CaseStudyPage';

const { caseStudies, personal } = portfolioData;

describe('CaseStudyPage', () => {
  afterEach(() => {
    vi.doUnmock('../data/portfolioData');
    vi.resetModules();
  });

  describe.each(caseStudies)('the $id case study (G10)', (study) => {
    it('renders the eyebrow, heading and lead', () => {
      renderCaseStudyAt(`/work/${study.id}`);

      expect(screen.getByText(study.eyebrow)).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: study.title })).toBeInTheDocument();
      expect(screen.getByText(study.intro)).toBeInTheDocument();
    });

    it('shows the four at-a-glance labels', () => {
      renderCaseStudyAt(`/work/${study.id}`);

      for (const item of study.atAGlance) {
        expect(screen.getByText(item.label)).toBeInTheDocument();
      }
      expect(study.atAGlance).toHaveLength(4);
    });

    it('shows one stat card per stat', () => {
      renderCaseStudyAt(`/work/${study.id}`);

      for (const stat of study.stats) {
        expect(screen.getAllByText(stat.label).length).toBeGreaterThan(0);
      }
    });

    it('collapses the at-a-glance and stats grids to one column on mobile with no inline style', () => {
      const { container } = renderCaseStudyAt(`/work/${study.id}`);

      const atAGlanceGrid = screen.getByText(study.atAGlance[0].label).closest('div').parentElement;
      expect(atAGlanceGrid.style.gridTemplateColumns).toBe('');
      expect(atAGlanceGrid.className).toContain('grid-cols-1');
      expect(atAGlanceGrid.className).toContain('sm:grid-cols-2');
      expect(atAGlanceGrid.className).toContain(`md:grid-cols-${study.atAGlance.length}`);

      const gridsWithInlineStyle = container.querySelectorAll('[style*="grid-template-columns"]');
      expect(gridsWithInlineStyle).toHaveLength(0);
    });

    it('gives every "On this page" link an href matching a real section id', () => {
      renderCaseStudyAt(`/work/${study.id}`);

      const onThisPageNav = screen.getByRole('navigation', { name: 'On this page' });
      const links = within(onThisPageNav).getAllByRole('link');
      expect(links).toHaveLength(study.sections.length);
      for (const link of links) {
        const targetId = link.getAttribute('href').slice(1);
        expect(document.getElementById(targetId)).not.toBeNull();
      }
    });

    it('shows the callout text and no callout note or private-repository text, and the word walkthrough only on a study that has one (TG-07)', () => {
      const { container } = renderCaseStudyAt(`/work/${study.id}`);

      expect(screen.getByText(study.callout.text)).toBeInTheDocument();
      expect(study.callout.note).toBeUndefined();
      expect(container.textContent).not.toMatch(/private repository/i);
      const hasWalkthrough = study.sections.some((section) => section.blocks.some((block) => block.type === 'walkthrough'));
      if (!hasWalkthrough) expect(container.textContent).not.toMatch(/walkthrough/i);
    });

    it('shows the disclaimer only when the case study has one', () => {
      renderCaseStudyAt(`/work/${study.id}`);

      if (study.disclaimer) {
        expect(screen.getByText(study.disclaimer)).toBeInTheDocument();
      }
    });

    it('shows the contact band heading', () => {
      renderCaseStudyAt(`/work/${study.id}`);

      expect(screen.getByRole('heading', { name: study.contactHeading })).toBeInTheDocument();
    });

    it('never shows a tab role or the removed simulator link', () => {
      renderCaseStudyAt(`/work/${study.id}`);

      expect(screen.queryByRole('tab')).toBeNull();
      expect(screen.queryByText(/launch simulator/i)).toBeNull();
    });
  });

  // The WorkHorse page, the only one that carried a retired banner, was removed on 2026-10-25
  // (owner's request). The banner renderer stays, so it is checked on stub data.
  describe('a retired banner (owner brief 2026-10-21)', () => {
    it('shows the banner above the header, with its link', async () => {
      const stubData = structuredClone(portfolioData);
      const stub = stubData.caseStudies.find((study) => study.id === 'orion');
      stub.banner = 'Retired October 2026. The newer work is on the work page.';
      stub.bannerLink = { text: 'work page', to: '/work' };

      vi.resetModules();
      vi.doMock('../data/portfolioData', () => ({ portfolioData: stubData }));
      const { default: StubCaseStudyPage } = await import('./CaseStudyPage');

      render(
        <MemoryRouter initialEntries={['/work/orion']}>
          <Routes>
            <Route path="/work/:slug" element={<StubCaseStudyPage />} />
          </Routes>
        </MemoryRouter>,
      );

      const note = screen.getByRole('note');
      expect(note).toHaveTextContent(stub.banner);
      expect(within(note).getByRole('link', { name: 'work page' })).toHaveAttribute('href', '/work');
      expect(note.compareDocumentPosition(screen.getByRole('heading', { level: 1 })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    // The Orion page points at Fathom, where its data-platform work moved (owner, 2026-10-25).
    it('shows a banner on the Orion page only, linking to Fathom', () => {
      expect(caseStudies.filter((study) => study.banner).map((study) => study.id)).toEqual(['orion']);
      renderCaseStudyAt('/work/orion');
      const note = screen.getByRole('note');
      expect(note).toHaveTextContent("Orion's data-platform work became Fathom.");
      expect(within(note).getByRole('link', { name: 'Fathom' })).toHaveAttribute('href', '/work/fathom');
    });
  });

  // Both repositories are private, so each page names its status where a code link would sit
  // (owner's split brief, 2026-10-25).
  describe.each([
    ['orion', 'Private · in daily use'],
    ['fathom', 'Open source · version 0.1'],
  ])('the %s case study (TG-07, D2)', (slug, status) => {
    const study = caseStudies.find((candidate) => candidate.id === slug);

    it('names its status in the header where a code link would sit, with no link to GitHub or anywhere private', () => {
      const { container } = renderCaseStudyAt(`/work/${slug}`);

      expect(study.status).toBe(status);
      expect(study.codeLink).toBeUndefined();
      expect(screen.getByText(status).closest('header')).not.toBeNull();
      expect(container.querySelectorAll('a[href*="github.com"]')).toHaveLength(0);
      expect(screen.queryByRole('link', { name: /code:|view the code/i })).toBeNull();
    });
  });

  describe('the fathom case study only (owner, 2026-10-25)', () => {
    it('shows the walkthrough, with all thirteen steps tagged built or designed and listed in full', () => {
      renderCaseStudyAt('/work/fathom');

      const region = screen.getByRole('region', { name: 'Fathom walkthrough' });
      expect(region).toBeInTheDocument();
      const list = document.getElementById('wt-steps');
      const items = within(list).getAllByRole('listitem');
      expect(items).toHaveLength(13);
      const tags = items.map((item) => item.querySelector('[data-tag]').getAttribute('data-tag'));
      expect(tags.filter((tag) => tag === 'built')).toHaveLength(12);
      expect(tags.filter((tag) => tag === 'designed')).toHaveLength(1);
    });
  });

  describe('the atelier case study only (TG-08, D8, D10)', () => {
    const atelier = caseStudies.find((study) => study.id === 'atelier');

    it('says Ongoing project in the header where a code link would sit, with no link to GitHub or anywhere private', () => {
      const { container } = renderCaseStudyAt('/work/atelier');

      expect(atelier.status).toBe('Ongoing project');
      expect(atelier.codeLink).toBeUndefined();
      expect(screen.getByText('Ongoing project').closest('header')).not.toBeNull();
      expect(container.querySelectorAll('a[href*="github.com"]')).toHaveLength(0);
      expect(screen.queryByRole('link', { name: /code:|view the code/i })).toBeNull();
    });

    it('shows the walkthrough, with all twelve phases listed in full, eleven built and one designed', () => {
      renderCaseStudyAt('/work/atelier');

      const region = screen.getByRole('region', { name: 'Atelier walkthrough' });
      expect(region).toBeInTheDocument();
      const list = document.getElementById('wt-steps');
      const items = within(list).getAllByRole('listitem');
      expect(items).toHaveLength(12);
      const tags = items.map((item) => item.querySelector('[data-tag]').getAttribute('data-tag'));
      expect(tags.filter((tag) => tag === 'built')).toHaveLength(11);
      expect(tags.filter((tag) => tag === 'designed')).toHaveLength(1);
    });

    it('calls the private build system my build pipeline, in the visible words', () => {
      renderCaseStudyAt('/work/atelier');

      expect(screen.getAllByText(/my build pipeline/i).length).toBeGreaterThan(0);
    });
  });

  const disclaimerSlugs = ['apple-decision-support-agent', 'apple-integration', 'apple-data-health'];

  it.each(disclaimerSlugs)('shows a disclaimer on %s', (slug) => {
    const study = caseStudies.find((candidate) => candidate.id === slug);
    renderCaseStudyAt(`/work/${slug}`);

    expect(study.disclaimer).toBeTruthy();
    expect(screen.getByText(study.disclaimer)).toBeInTheDocument();
  });

  it.each(caseStudies.filter((study) => !disclaimerSlugs.includes(study.id)).map((study) => study.id))(
    'shows no disclaimer on %s',
    (slug) => {
      const study = caseStudies.find((candidate) => candidate.id === slug);
      renderCaseStudyAt(`/work/${slug}`);

      expect(study.disclaimer).toBeUndefined();
    },
  );

  const listed = caseStudies.filter((study) => study.listed !== false);

  it('links from the first listed case study back to the last listed one and on to the second', () => {
    renderCaseStudyAt(`/work/${listed[0].id}`);

    expect(prevLink()).toHaveAttribute('href', `/work/${listed[listed.length - 1].id}`);
    expect(nextLink()).toHaveAttribute('href', `/work/${listed[1].id}`);
  });

  it('links from the last listed case study on to the first', () => {
    renderCaseStudyAt(`/work/${listed[listed.length - 1].id}`);

    expect(nextLink()).toHaveAttribute('href', `/work/${listed[0].id}`);
  });

  it('points a middle case study at its immediate listed neighbours', () => {
    renderCaseStudyAt(`/work/${listed[1].id}`);

    expect(prevLink()).toHaveAttribute('href', `/work/${listed[0].id}`);
    expect(nextLink()).toHaveAttribute('href', `/work/${listed[2].id}`);
  });

  it.each(caseStudies.filter((study) => study.listed === false).map((study) => study.id))(
    'never links to the unlisted %s page from another page, and points its own neighbours at listed pages',
    (slug) => {
      for (const study of listed) {
        const { unmount } = renderCaseStudyAt(`/work/${study.id}`);
        expect(document.querySelectorAll(`a[href="/work/${slug}"]`)).toHaveLength(0);
        unmount();
      }

      renderCaseStudyAt(`/work/${slug}`);
      expect(prevLink()).toHaveAttribute('href', `/work/${listed[listed.length - 1].id}`);
      expect(nextLink()).toHaveAttribute('href', `/work/${listed[0].id}`);
    },
  );

  it.each(caseStudies.map((study) => study.id))('shows the deployment summary only on a featured page (%s)', (slug) => {
    const study = caseStudies.find((candidate) => candidate.id === slug);
    renderCaseStudyAt(`/work/${slug}`);

    const summary = screen.queryByRole('region', { name: 'Deployment summary' });
    if (!study.card.featured) {
      expect(summary).toBeNull();
      return;
    }
    expect(study.deploymentSummary).toBeDefined();
    for (const key of ['problem', 'decision', 'result']) {
      expect(within(summary).getByText(study.deploymentSummary[key])).toBeInTheDocument();
    }
  });

  it('mails the contact band to personal.email', () => {
    renderCaseStudyAt(`/work/${caseStudies[0].id}`);

    const emailLink = screen.getByRole('link', { name: new RegExp(personal.email) });
    expect(emailLink).toHaveAttribute('href', `mailto:${personal.email}`);
  });

  it('renders the not-found page for an unknown slug', () => {
    renderCaseStudyAt('/work/no-such-study');

    expect(screen.getByRole('heading', { level: 1, name: /not found/i })).toBeInTheDocument();
  });

  describe('section subtitle (R9)', () => {
    it('renders a section subtitle under its heading only when the data carries one', async () => {
      const stubData = structuredClone(portfolioData);
      const stubStudy = stubData.caseStudies.find((study) => study.id === 'fathom');
      const measured = stubStudy.sections.find((section) => section.id === 'evidence');
      const why = stubStudy.sections.find((section) => section.id === 'problem');
      measured.subtitle = 'Stub subtitle';

      vi.resetModules();
      vi.doMock('../data/portfolioData', () => ({ portfolioData: stubData }));
      const { default: StubCaseStudyPage } = await import('./CaseStudyPage');

      render(
        <MemoryRouter initialEntries={['/work/fathom']}>
          <Routes>
            <Route path="/work/:slug" element={<StubCaseStudyPage />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(screen.getAllByText('Stub subtitle')).toHaveLength(1);
      const measuredHeading = within(document.getElementById('evidence')).getByRole('heading', { level: 2 });
      expect(measuredHeading.nextElementSibling).toHaveTextContent('Stub subtitle');
      const whyHeading = within(document.getElementById('problem')).getByRole('heading', { level: 2 });
      expect(whyHeading.nextElementSibling).toHaveTextContent(why.blocks[0].text);
    });
  });

  describe('repository links (G26)', () => {
    // Moved to the Flywheel page on 2026-10-25, when the WorkHorse page that held three snapshot
    // links was removed: its header code link and its paragraph link to the design-records agent.
    it('opens every GitHub link in a new tab, with readable names and the right destinations', () => {
      renderCaseStudyAt('/work/flywheel');
      const flywheel = caseStudies.find((study) => study.id === 'flywheel');

      const repoLinks = screen
        .getAllByRole('link')
        .filter((link) => link.getAttribute('href')?.startsWith('https://github.com/muhibm1/'));
      expect(repoLinks.length).toBeGreaterThanOrEqual(2);

      for (const link of repoLinks) {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link.textContent).not.toMatch(/^https?:\/\//);
      }

      expect(repoLinks.find((link) => link.getAttribute('href') === flywheel.codeLink.href)).toBeDefined();
      const agentLink = screen.getByRole('link', { name: /design-records agent/i });
      expect(agentLink).toHaveAttribute('href', personal.repositories.studbookAgent);
    });

    it('throws a readable error when a paragraph link.text occurs more than once', async () => {
      const brokenData = structuredClone(portfolioData);
      const brokenStudy = brokenData.caseStudies.find((study) => study.id === 'flywheel');
      const linkedBlock = brokenStudy.sections
        .flatMap((section) => section.blocks)
        .find((block) => block.link?.text === 'design-records agent');
      linkedBlock.text = `${linkedBlock.text} The design-records agent appears again here.`;

      vi.resetModules();
      vi.doMock('../data/portfolioData', () => ({ portfolioData: brokenData }));
      const { default: BrokenCaseStudyPage } = await import('./CaseStudyPage');

      expect(() =>
        render(
          <MemoryRouter initialEntries={['/work/flywheel']}>
            <Routes>
              <Route path="/work/:slug" element={<BrokenCaseStudyPage />} />
            </Routes>
          </MemoryRouter>,
        ),
      ).toThrow(/exactly once|once/i);
    });
  });
});

function renderCaseStudyAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/work/:slug" element={<CaseStudyPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

function prevLink() {
  return screen.getByRole('link', { name: /^previous/i });
}

function nextLink() {
  return screen.getByRole('link', { name: /next case study/i });
}

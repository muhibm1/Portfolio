// Tests the single-scroll case-study template (ADR 0006, R127, R135, R136). G10 and G11 read the
// data module directly so a wrong copy or a wrong block never passes silently.
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import CaseStudyPage from './CaseStudyPage';

const { caseStudies, personal } = portfolioData;

describe('CaseStudyPage', () => {
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

    it('shows the callout text', () => {
      renderCaseStudyAt(`/work/${study.id}`);

      expect(screen.getByText(study.callout.text)).toBeInTheDocument();
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

  const disclaimerSlugs = ['apple-llm-triage', 'apple-integration', 'apple-data-health'];

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

  it('links from the first case study back to the last and on to the second', () => {
    const first = caseStudies[0];
    const last = caseStudies[caseStudies.length - 1];

    renderCaseStudyAt(`/work/${first.id}`);

    expect(prevLink()).toHaveAttribute('href', `/work/${last.id}`);
    expect(nextLink()).toHaveAttribute('href', `/work/${caseStudies[1].id}`);
  });

  it('links from the last case study on to the first', () => {
    const first = caseStudies[0];
    const last = caseStudies[caseStudies.length - 1];

    renderCaseStudyAt(`/work/${last.id}`);

    expect(nextLink()).toHaveAttribute('href', `/work/${first.id}`);
  });

  it('points a middle case study at its immediate neighbours', () => {
    const middle = caseStudies[1];

    renderCaseStudyAt(`/work/${middle.id}`);

    expect(prevLink()).toHaveAttribute('href', `/work/${caseStudies[0].id}`);
    expect(nextLink()).toHaveAttribute('href', `/work/${caseStudies[2].id}`);
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

  describe('tables (G11)', () => {
    it('renders the outcomes and retrieval tables at /work/workhorse', () => {
      renderCaseStudyAt('/work/workhorse');

      const tables = screen.getAllByRole('table');
      expect(tables).toHaveLength(2);
      for (const table of tables) {
        expect(within(table).getAllByRole('columnheader').length).toBeGreaterThan(0);
      }

      const outcomesTable = tables.find((table) => within(table).queryByText(/live web app with auth/i));
      expect(outcomesTable).toBeDefined();
      const outcomesBodyRows = within(outcomesTable).getAllByRole('row').slice(1);
      expect(outcomesBodyRows).toHaveLength(4);
      expect(outcomesBodyRows[0]).toHaveTextContent(/^Live web app with auth/);

      const retrievalTable = tables.find((table) => within(table).queryByText('0.85'));
      expect(retrievalTable).toBeDefined();
      const retrievalBodyRows = within(retrievalTable).getAllByRole('row').slice(1);
      expect(retrievalBodyRows).toHaveLength(6);
      const lastRow = retrievalBodyRows[retrievalBodyRows.length - 1];
      expect(lastRow).toHaveTextContent('0.85');
      expect(lastRow.className).toMatch(/font-semibold/);
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

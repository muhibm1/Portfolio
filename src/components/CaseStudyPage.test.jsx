import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import CaseStudyPage from './CaseStudyPage';

const { caseStudies, personal } = portfolioData;
const firstStudy = caseStudies[0];
const middleStudy = caseStudies[1];
const lastStudy = caseStudies[caseStudies.length - 1];

// The four chips in display order, each with the only data its body may show (R23).
const chips = [
  { label: 'Challenge', sourceStrings: (study) => [study.challenge] },
  {
    label: 'System Architecture',
    sourceStrings: (study) => study.diagramSteps.flatMap((step) => [step.title, step.desc]),
  },
  { label: 'Production Deployment', sourceStrings: (study) => [study.solution, ...study.techStack] },
  {
    label: 'Measured Impact',
    sourceStrings: (study) => study.impact.flatMap((row) => [row.label, row.before, row.after, row.change]),
  },
];

// Slugs that must render the not-found page: EG3 and EG4, then the hostile slugs AD1 to AD4.
const unresolvableSlugs = [
  { description: 'an unknown slug', slug: 'no-such-study' },
  { description: 'a wrongly cased slug', slug: 'Apple-LLM-Triage' },
  { description: 'an encoded space', slug: '%20' },
  { description: 'a script tag', slug: encodeURIComponent('<script>alert(1)</script>') },
  { description: 'a path traversal', slug: '..%2F..%2Fetc%2Fpasswd' },
  { description: 'a 10,000 character slug', slug: 'a'.repeat(10000) },
  { description: 'a null byte', slug: '%00' },
  { description: 'an emoji', slug: '\u{1F600}' },
  { description: 'a right-to-left override', slug: '\u202emoc.elppa' },
];

describe('CaseStudyPage', () => {
  it.each(caseStudies)('resolves /work/$id to its case study', (study) => {
    renderCaseStudyAt(`/work/${study.id}`);

    expect(screen.getByRole('heading', { level: 1, name: study.title })).toBeInTheDocument();
  });

  it.each(unresolvableSlugs)('renders the not-found page for $description', ({ slug }) => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const { container } = renderCaseStudyAt(`/work/${slug}`);

    expect(screen.getByRole('heading', { level: 1, name: /not found/i })).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
    expect(alert).not.toHaveBeenCalled();
  });

  it('shows the four chips and the Key enterprise metrics heading', () => {
    renderCaseStudyAt(`/work/${firstStudy.id}`);

    const chipLabels = screen.getAllByRole('tab').map((tab) => tab.textContent);
    expect(chipLabels).toEqual(chips.map((chip) => chip.label));
    expect(screen.getByRole('heading', { name: 'Key enterprise metrics' })).toBeInTheDocument();
  });

  it('marks the chosen chip as selected', () => {
    renderCaseStudyAt(`/work/${firstStudy.id}`);

    fireEvent.click(screen.getByRole('tab', { name: 'Measured Impact' }));

    expect(screen.getByRole('tab', { name: 'Measured Impact' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Challenge' })).toHaveAttribute('aria-selected', 'false');
  });

  describe.each(caseStudies)('the chip bodies of $id', (study) => {
    it.each(chips)('$label shows its data field and nothing else', ({ label, sourceStrings }) => {
      renderCaseStudyAt(`/work/${study.id}`);

      fireEvent.click(screen.getByRole('tab', { name: label }));

      const panel = screen.getByRole('tabpanel', { name: label });
      const allowedText = sourceStrings(study);
      for (const text of visibleText(panel)) {
        expect(allowedText.join('\n')).toContain(text);
      }
      for (const value of allowedText) {
        expect(panel.textContent).toContain(value);
      }
    });
  });

  it.each(caseStudies)('draws one flow node per diagram step for $id', (study) => {
    renderCaseStudyAt(`/work/${study.id}`);

    fireEvent.click(screen.getByRole('tab', { name: 'System Architecture' }));

    const nodes = within(screen.getByRole('tabpanel')).getAllByRole('listitem');
    expect(nodes).toHaveLength(study.diagramSteps.length);
  });

  it('links from the last case study to the first', () => {
    renderCaseStudyAt(`/work/${lastStudy.id}`);

    expect(nextLink()).toHaveAttribute('href', `/work/${firstStudy.id}`);
  });

  it('links from the first case study back to the last', () => {
    renderCaseStudyAt(`/work/${firstStudy.id}`);

    expect(previousLink()).toHaveAttribute('href', `/work/${lastStudy.id}`);
  });

  it('points a middle case study at its immediate neighbours', () => {
    renderCaseStudyAt(`/work/${middleStudy.id}`);

    expect(previousLink()).toHaveAttribute('href', `/work/${firstStudy.id}`);
    expect(nextLink()).toHaveAttribute('href', `/work/${lastStudy.id}`);
  });

  it('visits every case study in data order when following the next links', () => {
    renderCaseStudyAt(`/work/${firstStudy.id}`);

    const visitedTitles = [];
    for (let visit = 0; visit <= caseStudies.length; visit += 1) {
      visitedTitles.push(screen.getByRole('heading', { level: 1 }).textContent);
      fireEvent.click(nextLink());
    }

    expect(visitedTitles).toEqual([...caseStudies.map((study) => study.title), firstStudy.title]);
  });

  it('offers no Log in or Sign up control', () => {
    renderCaseStudyAt(`/work/${firstStudy.id}`);

    const accountControlName = /log ?in|sign ?up/i;
    for (const role of ['link', 'button', 'tab']) {
      expect(screen.queryByRole(role, { name: accountControlName })).toBeNull();
    }
  });

  it('links the discuss control to personal.email', () => {
    renderCaseStudyAt(`/work/${firstStudy.id}`);

    const discussLink = screen.getByRole('link', { name: /discuss this case study/i });

    expect(discussLink).toHaveAttribute(
      'href',
      `mailto:${personal.email}?subject=Discussing%20FDE%20Case%20Study`,
    );
  });

  it('links the simulator call to action to /#simulator', () => {
    renderCaseStudyAt('/work/apple-llm-triage');

    expect(screen.getByRole('link', { name: /launch simulator/i })).toHaveAttribute('href', '/#simulator');
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

function previousLink() {
  return screen.getByRole('link', { name: /^previous/i });
}

function nextLink() {
  return screen.getByRole('link', { name: /^next/i });
}

// Every non-empty text node inside the element. Table column headers are skipped because they
// label the data rather than describe the case study.
function visibleText(element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) {
    const text = walker.currentNode.nodeValue.trim();
    const isColumnHeader = walker.currentNode.parentElement.tagName === 'TH';
    if (text && !isColumnHeader) texts.push(text);
  }
  return texts;
}

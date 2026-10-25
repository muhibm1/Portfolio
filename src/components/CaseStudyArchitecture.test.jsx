// Tests the case-study `architecture` block: the legend, the drawing's boxes and parts, its arrows
// and labels, and the Enlarge view that opens and closes.
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CaseStudyArchitecture from './CaseStudyArchitecture';

const block = {
  label: 'Stub architecture',
  enlarge: 'Enlarge',
  close: 'Close',
  viewBox: [0, 0, 400, 200],
  legend: [
    { kind: 'data', label: 'Your data' },
    { kind: 'retrieval', label: 'Retrieval (RAG)' },
  ],
  labels: [{ x: 10, y: 10, text: 'Sources' }],
  boxes: [
    { x: 10, y: 20, w: 100, h: 60, kind: 'data', parts: [{ title: 'Checkouts' }, { text: ['read by ', { mono: 'git.py' }] }] },
    {
      x: 150, y: 20, w: 200, h: 120, kind: 'retrieval',
      parts: [
        { title: 'Core ·', titleMono: 'orion.rag', accent: true },
        { pairs: [['git.py', 'commits']] },
        { section: 'Tools' },
        { chips: [{ top: 'BM25', bottom: 'lexical' }, { top: 'RRF fuse', bottom: 'top k', strong: true }] },
        { inner: { kind: 'code', parts: [{ mono: 'UserPromptSubmit' }] } },
      ],
    },
  ],
  edges: [{ d: 'M110 50 H150' }, { d: 'M200 140 V160', kind: 'retrieval', dashed: true }],
  edgeLabels: [{ x: 120, y: 45, text: 'calls' }],
  note: 'Closing note.',
};

describe('CaseStudyArchitecture (architecture block)', () => {
  it('shows the legend, the column label, every box with its kind, and the note', () => {
    const { container } = render(<CaseStudyArchitecture block={block} />);

    expect(screen.getByText('Your data')).toBeInTheDocument();
    expect(screen.getByText('Sources')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-kind]')).toHaveLength(2);
    expect(container.querySelector('[data-kind="retrieval"]')).toHaveTextContent('Core · orion.rag');
    expect(screen.getByText('Closing note.')).toBeInTheDocument();
  });

  it('renders text runs, pairs, sections, chips and inner boxes', () => {
    const { container } = render(<CaseStudyArchitecture block={block} />);

    const data = container.querySelector('[data-kind="data"]');
    expect(within(data).getByText('git.py')).toHaveClass('arch-mono');
    const core = container.querySelector('[data-kind="retrieval"]');
    expect(within(core).getByText('commits')).toBeInTheDocument();
    expect(within(core).getByText('Tools')).toHaveClass('arch-section');
    expect(within(core).getByText('RRF fuse').closest('li')).toHaveClass('arch-chip-strong');
    expect(within(core).getByText('UserPromptSubmit').closest('.arch-inner')).toHaveClass('arch-inner-code');
  });

  it('draws each arrow, dashed where asked, and its label', () => {
    const { container } = render(<CaseStudyArchitecture block={block} />);

    const paths = container.querySelectorAll('path.arch-edge');
    expect(paths).toHaveLength(2);
    expect(paths[1]).toHaveClass('arch-dashed');
    expect(paths[1].getAttribute('marker-end')).toBe('url(#arch-head-retrieval)');
    expect(screen.getByText('calls')).toBeInTheDocument();
  });

  it('opens a full-size view on Enlarge and closes it with Close or Escape', () => {
    render(<CaseStudyArchitecture block={block} />);

    fireEvent.click(screen.getByRole('button', { name: 'Enlarge' }));
    const dialog = screen.getByRole('dialog', { name: 'Stub architecture' });
    expect(within(dialog).getByText('Checkouts')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Enlarge' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

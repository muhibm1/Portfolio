// Tests the case-study `architecture` block: the legend, the top row in order with arrows between
// stages, the second row, node kinds, tool groups, chips and the closing note.
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CaseStudyArchitecture from './CaseStudyArchitecture';

const props = {
  label: 'Stub architecture',
  legend: [
    { kind: 'data', label: 'Your data' },
    { kind: 'retrieval', label: 'Retrieval path' },
  ],
  columns: [
    { label: 'Sources', nodes: [{ kind: 'data', title: 'Checkouts', mono: '~/code', lines: ['Every repository'] }] },
    { label: 'Stores', nodes: [{ kind: 'retrieval', title: 'Index' }] },
    { label: 'Server', nodes: [{ kind: 'agent', title: 'serve', groups: [{ label: 'Tools', items: ['context', 'impact'] }] }] },
  ],
  lower: [{ span: 2, nodes: [{ kind: 'retrieval', title: 'Core', chips: ['words', 'meaning'] }] }],
  note: 'Closing note.',
};

describe('CaseStudyArchitecture (architecture block)', () => {
  it('names the figure, shows the legend and every column label in order', () => {
    render(<CaseStudyArchitecture {...props} />);

    expect(screen.getByRole('figure', { name: 'Stub architecture' })).toBeInTheDocument();
    expect(screen.getByText('Your data')).toBeInTheDocument();
    const labels = ['Sources', 'Stores', 'Server'].map((text) => screen.getByText(text));
    expect(labels[0].compareDocumentPosition(labels[2]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('puts one arrow between each pair of stages, hidden from assistive tech', () => {
    const { container } = render(<CaseStudyArchitecture {...props} />);

    const arrows = container.querySelectorAll('ol > li[aria-hidden="true"]');
    expect(arrows).toHaveLength(props.columns.length - 1);
  });

  it('marks each node with its kind and shows its mono line, lines, tool groups and chips', () => {
    const { container } = render(<CaseStudyArchitecture {...props} />);

    expect(container.querySelectorAll('[data-kind="retrieval"]')).toHaveLength(2);
    expect(screen.getByText('~/code')).toBeInTheDocument();
    expect(screen.getByText('Every repository')).toBeInTheDocument();
    expect(screen.getByText('context · impact')).toBeInTheDocument();
    const core = container.querySelectorAll('[data-kind="retrieval"]')[1];
    expect(within(core).getByText('words')).toBeInTheDocument();
    expect(within(core).getByText('meaning')).toBeInTheDocument();
    expect(screen.getByText('Closing note.')).toBeInTheDocument();
  });
});

// Tests the case-study `architecture` block renderer: one lane per row, every node shown, the
// engine column drawn dark, and the closing note.
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CaseStudyArchitecture from './CaseStudyArchitecture';

const block = {
  columns: ['Sources', 'Stores', 'Engines', 'Reached by'],
  engine: 2,
  lanes: [
    { label: 'Lane one', cells: [[{ title: 'A' }, { title: 'B' }], [{ title: 'C', note: 'kept' }], [{ title: 'D' }], [{ title: 'E' }]] },
    { label: 'Lane two', cells: [[{ title: 'F' }], [{ title: 'G', dashed: true }], [{ title: 'H' }], [{ title: 'I' }]] },
  ],
  note: 'Closing note.',
};

describe('CaseStudyArchitecture (architecture block)', () => {
  it('draws one lane per row, in order, with every node', () => {
    render(<CaseStudyArchitecture {...block} />);

    const lanes = screen.getAllByRole('listitem');
    expect(lanes.map((lane) => lane.querySelector('p').textContent)).toEqual(['Lane one', 'Lane two']);
    for (const title of ['A', 'B', 'C', 'D', 'E']) expect(within(lanes[0]).getByText(title)).toBeInTheDocument();
    expect(within(lanes[0]).getByText('kept')).toBeInTheDocument();
  });

  it('draws the engine column dark and a dashed node dashed', () => {
    render(<CaseStudyArchitecture {...block} />);

    expect(screen.getByText('D').parentElement).toHaveClass('bg-dark');
    expect(screen.getByText('C').parentElement).not.toHaveClass('bg-dark');
    expect(screen.getByText('G').parentElement).toHaveClass('border-dashed');
  });

  it('names every column and shows the closing note', () => {
    render(<CaseStudyArchitecture {...block} />);

    for (const column of block.columns) expect(screen.getAllByText(column).length).toBeGreaterThan(0);
    expect(screen.getByText('Closing note.')).toBeInTheDocument();
  });
});

// Tests the case-study `bars` block: values are written as text, bars scale within their own
// chart, and an all-zero chart throws instead of drawing nothing.
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CaseStudyBarChart from './CaseStudyBarChart';

const chart = (title, values) => ({
  title,
  items: values.map((value, index) => ({ label: `Item ${index + 1}`, value, display: `${value} units` })),
});

describe('CaseStudyBarChart (bars block)', () => {
  it('writes every value as text next to its label', () => {
    render(<CaseStudyBarChart charts={[chart('Time', [10, 40])]} />);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('40 units')).toBeInTheDocument();
  });

  it('scales each chart to its own largest value', () => {
    render(<CaseStudyBarChart charts={[chart('Small', [5, 10]), chart('Large', [500, 1000])]} />);

    const widths = screen.getAllByTestId('bar').map((bar) => bar.style.width);
    expect(widths).toEqual(['50%', '100%', '50%', '100%']);
  });

  it('keeps a tiny value visible', () => {
    render(<CaseStudyBarChart charts={[chart('Skewed', [1, 1000])]} />);

    expect(screen.getAllByTestId('bar')[0].style.width).toBe('2%');
  });

  it('shows the caption', () => {
    render(<CaseStudyBarChart charts={[chart('Time', [1])]} caption="From the run ledger." />);

    expect(within(screen.getByRole('figure')).getByText('From the run ledger.')).toBeInTheDocument();
  });

  it('throws on a chart with no positive value', () => {
    expect(() => render(<CaseStudyBarChart charts={[chart('Empty', [0, 0])]} />)).toThrow(/positive value/);
  });
});

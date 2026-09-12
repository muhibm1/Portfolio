import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CaseStudyFlowDiagram from './CaseStudyFlowDiagram';

describe('CaseStudyFlowDiagram', () => {
  it.each([1, 2, 6])('draws one node for each of %i steps', (stepCount) => {
    render(<CaseStudyFlowDiagram steps={stubSteps(stepCount)} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(stepCount);
  });

  it('shows each step title and description in the order given', () => {
    const steps = stubSteps(3);

    render(<CaseStudyFlowDiagram steps={steps} />);

    const nodeTexts = screen.getAllByRole('listitem').map((node) => node.textContent);
    expect(nodeTexts).toEqual(steps.map((step) => `${step.title}${step.desc}`));
  });

  it('draws nothing when there are no steps', () => {
    const { container } = render(<CaseStudyFlowDiagram steps={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});

function stubSteps(count) {
  return Array.from({ length: count }, (_, index) => ({
    title: `Stub step ${index + 1}`,
    desc: `What stub step ${index + 1} does.`,
  }));
}

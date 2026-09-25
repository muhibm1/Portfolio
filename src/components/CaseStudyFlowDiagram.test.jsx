// Tests the case-study `flow` block renderer (default export) and the `link-diagram` hub
// renderer (named export `CaseStudyHubDiagram`), both from ADR 0006.
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CaseStudyFlowDiagram, { CaseStudyHubDiagram } from './CaseStudyFlowDiagram';

describe('CaseStudyFlowDiagram (flow block)', () => {
  it.each([1, 2, 8])('draws one node per step for %i steps', (stepCount) => {
    render(<CaseStudyFlowDiagram columns={stepCount} steps={stubSteps(stepCount)} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(stepCount);
  });

  it('shows each step title and note in the order given', () => {
    const steps = stubSteps(3);

    render(<CaseStudyFlowDiagram columns={3} steps={steps} />);

    const nodeTexts = screen.getAllByRole('listitem').map((node) => node.textContent);
    expect(nodeTexts).toEqual(steps.map((step) => `${step.title}${step.note}`));
  });

  it('marks a gate step distinctly from a plain step', () => {
    const steps = [
      { title: 'Design', note: 'Person approves', gate: true },
      { title: 'Plan', note: 'Tasks and eval cases' },
    ];

    render(<CaseStudyFlowDiagram columns={2} steps={steps} />);

    const [gateNode, plainNode] = screen.getAllByRole('listitem');
    expect(gateNode.className).not.toEqual(plainNode.className);
  });

  it('marks a dashed step distinctly from a solid step', () => {
    const steps = [
      { title: 'Deploy', note: 'Person approves at tier 3', dashed: true },
      { title: 'Ship', note: 'Person approves' },
    ];

    render(<CaseStudyFlowDiagram columns={2} steps={steps} />);

    const [dashedNode, solidNode] = screen.getAllByRole('listitem');
    expect(dashedNode.className).not.toEqual(solidNode.className);
  });
});

describe('CaseStudyHubDiagram (link-diagram block)', () => {
  it('shows the left node, the hub, the edge label twice and every right node', () => {
    render(
      <CaseStudyHubDiagram
        left={{ title: 'Ticketing system', note: 'The request and its status' }}
        edge="OAuth2 · REST"
        hub={{ title: 'The tool', note: 'Python' }}
        right={[{ title: 'Code repository' }, { title: 'Geo-data system' }]}
      />,
    );

    expect(screen.getByText('Ticketing system')).toBeInTheDocument();
    expect(screen.getByText('The request and its status')).toBeInTheDocument();
    expect(screen.getByText('The tool')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getAllByText('OAuth2 · REST')).toHaveLength(2);
    expect(screen.getByText('Code repository')).toBeInTheDocument();
    expect(screen.getByText('Geo-data system')).toBeInTheDocument();
  });

  it('lists the right-hand nodes as a real list', () => {
    render(
      <CaseStudyHubDiagram
        left={{ title: 'Left', note: 'note' }}
        edge="edge"
        hub={{ title: 'Hub', note: 'hub note' }}
        right={[{ title: 'A' }, { title: 'B' }, { title: 'C' }]}
      />,
    );

    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  });
});

function stubSteps(count) {
  return Array.from({ length: count }, (_, index) => ({
    title: `Stub step ${index + 1}`,
    note: `What stub step ${index + 1} does.`,
  }));
}

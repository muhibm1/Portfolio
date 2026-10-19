// Guards the walkthrough against page jumps (TG-07). jsdom cannot measure layout, so this checks
// the two things that keep the console the same height on every step: the markup holds every
// step's readout and the hint at all times, and look.css stacks them in one grid cell and hides
// the ones not open with visibility (never display). The real measurement, with all thirteen steps
// pressed at four widths, is a browser script run at review time.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { portfolioData } from '../../data/portfolioData';
import WalkthroughBlock from '../WalkthroughBlock';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const css = fs.readFileSync(path.join(root, 'src/look.css'), 'utf8');
const orion = portfolioData.caseStudies.find((study) => study.id === 'orion');
const block = orion.sections.flatMap((section) => section.blocks).find((candidate) => candidate.type === 'walkthrough');

// The declarations of the first rule whose selector is exactly `selector`, whitespace squeezed.
function rule(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\>]/g, '\\$&');
  const match = css.match(new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`));
  return match ? match[1].replace(/\s+/g, ' ').trim() : null;
}

describe('the console keeps one height on every step', () => {
  it('holds every step\'s readout and caption in the markup, with exactly one open', () => {
    const { container } = render(<WalkthroughBlock block={block} />);
    expect(container.querySelectorAll('.wt-ro > .wt-ro-step')).toHaveLength(block.steps.length);
    expect(container.querySelectorAll('.wt-ro-step[data-current]')).toHaveLength(1);
    expect(container.querySelectorAll('.wt-figfoots > .wt-figfoot')).toHaveLength(block.steps.length);
    expect(container.querySelectorAll('.wt-figfoot[data-current]')).toHaveLength(1);
    fireEvent.click(container.querySelectorAll('.wt-tab')[5]);
    expect(container.querySelector('.wt-ro-step[data-current] .wt-ro-k').textContent).toContain(block.steps[5].label);
    expect(container.querySelectorAll('.wt-ro-step[data-current]')).toHaveLength(1);
  });

  it('keeps the hint in the controls on every step instead of adding and removing it', () => {
    const { container } = render(<WalkthroughBlock block={block} />);
    for (const index of [0, 8, 12]) {
      fireEvent.click(container.querySelectorAll('.wt-tab')[index]);
      expect(container.querySelector('.wt-controls > .wt-hint'), `step ${index + 1}`).not.toBeNull();
    }
  });

  it('stacks all readouts in one grid cell so the tallest sets the height', () => {
    expect(rule('.wt-ro')).toMatch(/display: grid/);
    expect(rule('.wt-ro-step')).toMatch(/grid-area: 1 \/ 1/);
    expect(rule('.wt-figfoots')).toMatch(/display: grid/);
    expect(rule('.wt-figfoots > .wt-figfoot')).toMatch(/grid-area: 1 \/ 1/);
  });

  it('hides the readouts and the hint that are not open with visibility, which keeps their space', () => {
    for (const selector of ['.wt-ro-step:not([data-current])', '.wt-figfoots > .wt-figfoot:not([data-current])', '.wt-hint:not([data-show])']) {
      expect(rule(selector), selector).toMatch(/visibility: hidden/);
      expect(rule(selector), selector).not.toMatch(/display:/);
    }
  });

  it('puts the hint on its own row at every width and sets no height per step', () => {
    expect(rule('.wt-hint')).toMatch(/flex: 1 0 100%/);
    expect(css).not.toMatch(/\.wt-(ro|ro-step|console|stage|controls)[^{]*\[data-(current|phase|mood)[^{]*\{[^}]*(?<!min-)(height|block-size)\s*:/);
  });
});

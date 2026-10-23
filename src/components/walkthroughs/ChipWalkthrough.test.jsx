// Tests the Orion chip walkthrough (owner's ask, 2026-10-23): complete at rest on the server, one
// part per step, a click or a key opens a part and pauses the run, Previous, Next and Replay move
// through the steps, the run waits at the decision, a calm visitor gets no run, and the mouse opens
// the chip and follows it. Words come from the Orion block, so a change to the data is tested too.
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render as renderPage } from '../../entry-server.jsx';
import { portfolioData } from '../../data/portfolioData';
import ChipWalkthrough from './ChipWalkthrough';

const orion = portfolioData.caseStudies.find((study) => study.id === 'orion');
const block = orion.sections.flatMap((section) => section.blocks).find((candidate) => candidate.type === 'walkthrough');
const steps = block.steps;
const indexOf = (id) => steps.findIndex((step) => step.id === id);
const part = (id) => document.querySelector(`[data-go="${id}"]`);
const open = () => document.querySelector('.cw-die').dataset.step;

const originals = {};
// Stands in for the browser's media queries and the on-screen observer, which jsdom lacks.
function setup({ reduced = false, mouse = false } = {}) {
  originals.matchMedia = window.matchMedia;
  originals.IntersectionObserver = window.IntersectionObserver;
  window.matchMedia = (query) => ({ matches: (query.includes('reduce') && reduced) || (query.includes('hover: hover') && mouse) });
  window.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {
      this.callback([{ isIntersecting: true }]);
    }
    disconnect() {}
  };
  return render(<ChipWalkthrough block={block} />);
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  window.matchMedia = originals.matchMedia;
  window.IntersectionObserver = originals.IntersectionObserver;
});

describe('ChipWalkthrough', () => {
  it('draws one part per step, each named for a screen reader, with step one open', () => {
    setup();
    expect(document.querySelectorAll('.cw-blk')).toHaveLength(steps.length);
    for (const [i, step] of steps.entries()) {
      expect(part(step.id)).toHaveAttribute('aria-label', `Step ${i + 1}, ${step.label}, ${step.tag}.`);
    }
    expect(open()).toBe('sync');
    expect(document.querySelector('.cw-does')).toHaveTextContent(steps[0].does);
  });

  it('plays on by itself and stops at the decision until a person records one', () => {
    setup();
    for (let i = 0; i < steps.length; i += 1) act(() => vi.advanceTimersByTime(5000));
    expect(open()).toBe('decision');
    expect(screen.getByText(block.states.waiting)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: block.controls.approve }));
    expect(screen.getAllByText(`Decision recorded: approve`).length).toBeGreaterThan(0);
    act(() => vi.advanceTimersByTime(2000));
    expect(open()).toBe(steps[indexOf('decision') + 1].id);
  });

  it('opens a clicked part and pauses the run until Play', () => {
    setup();
    fireEvent.click(part('review'));
    expect(open()).toBe('review');
    expect(screen.getByRole('button', { name: block.controls.play })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(20000));
    expect(open()).toBe('review');

    fireEvent.click(screen.getByRole('button', { name: block.controls.play }));
    act(() => vi.advanceTimersByTime(1000));
    expect(open()).toBe('gate');
  });

  it('moves back with Previous, on with Next step, and to the start with Replay', () => {
    setup();
    expect(screen.getByRole('button', { name: block.controls.prev })).toBeDisabled();
    fireEvent.click(part('explain'));
    fireEvent.click(screen.getByRole('button', { name: block.controls.prev }));
    expect(open()).toBe('store');
    fireEvent.click(screen.getByRole('button', { name: block.controls.next }));
    expect(open()).toBe('explain');
    fireEvent.click(screen.getByRole('button', { name: block.controls.replay }));
    expect(open()).toBe('sync');
    act(() => vi.advanceTimersByTime(5000));
    expect(open()).toBe('store');
  });

  it('moves between parts with the arrow keys', () => {
    setup();
    fireEvent.keyDown(part('sync'), { key: 'ArrowRight' });
    expect(open()).toBe('store');
    expect(document.activeElement).toBe(part('store'));
    fireEvent.keyDown(part('store'), { key: 'End' });
    expect(open()).toBe(steps.at(-1).id);
  });

  it('runs nothing by itself for a visitor who asks for less motion', () => {
    setup({ reduced: true });
    act(() => vi.advanceTimersByTime(30000));
    expect(open()).toBe('sync');
    expect(screen.getByText(block.hintTouch)).toBeInTheDocument();
  });

  it('turns face up under a mouse and keeps playing until the cursor points at a part', () => {
    setup({ mouse: true });
    const stage = document.querySelector('.cw-stage');
    expect(screen.getByText(block.hint)).toBeInTheDocument();
    fireEvent.pointerEnter(stage, { pointerType: 'mouse' });
    expect(stage).toHaveClass('cw-open');
    act(() => vi.advanceTimersByTime(5000));
    expect(open()).toBe('store');
  });

  it('holds on a part the cursor points at, and plays on from it once the cursor moves off', () => {
    setup({ mouse: true });
    const stage = document.querySelector('.cw-stage');
    fireEvent.pointerEnter(stage, { pointerType: 'mouse' });
    fireEvent.pointerOver(part('bench').querySelector('.cw-face'), { pointerType: 'mouse' });
    act(() => vi.advanceTimersByTime(100));
    expect(open()).toBe('bench');
    act(() => vi.advanceTimersByTime(20000));
    expect(open()).toBe('bench');

    // Off the part but still over the chip: it stays face up and carries on.
    fireEvent.pointerOver(document.querySelector('.cw-l0'), { pointerType: 'mouse' });
    act(() => vi.advanceTimersByTime(100));
    act(() => vi.advanceTimersByTime(1300));
    expect(stage).toHaveClass('cw-open');
    expect(open()).toBe(steps[indexOf('bench') + 1].id);

    fireEvent.pointerLeave(stage, { pointerType: 'mouse' });
    expect(stage).not.toHaveClass('cw-open');
  });
});

describe('the Orion page as served', () => {
  it('carries the chip, with every step listed in full, in the prerendered markup of /work/orion', () => {
    const html = renderPage('/Portfolio/work/orion');
    expect(html).toContain('class="cw-die"');
    for (const step of steps) expect(html).toContain(`data-go="${step.id}"`);
    expect(html).toContain(block.caption.title);
  });

  it('keeps the chip off every other page', () => {
    for (const route of ['/Portfolio', '/Portfolio/work', '/Portfolio/work/atelier', '/Portfolio/work/workhorse']) {
      expect(renderPage(route), route).not.toContain('cw-die');
    }
  });
});

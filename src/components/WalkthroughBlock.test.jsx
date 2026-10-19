// Tests the walkthrough console (TG-07, D6): what it shows at rest, how a visitor moves along the
// rail, the stop at the decision, the autoplay clock with its pauses, and the calm version. The
// words come from the Orion study's own block, so a change to the data is tested too. jsdom has
// no animation clock, so tests that need one install a small stand-in and say so.
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import WalkthroughBlock from './WalkthroughBlock';

const orion = portfolioData.caseStudies.find((study) => study.id === 'orion');
const block = orion.sections.flatMap((section) => section.blocks).find((candidate) => candidate.type === 'walkthrough');
const steps = block.steps;
const indexOf = (id) => steps.findIndex((step) => step.id === id);

const originals = {};

afterEach(() => {
  for (const [key, value] of Object.entries(originals)) {
    if (value === undefined) delete window[key];
    else window[key] = value;
    delete originals[key];
  }
  delete SVGElement.prototype.animate;
  delete HTMLElement.prototype.animate;
  vi.useRealTimers();
});

function replaceWindow(key, value) {
  originals[key] = window[key];
  window[key] = value;
}

// Installs an IntersectionObserver the test can fire by hand, and returns the fire function.
function installObserver() {
  let callback = null;
  replaceWindow(
    'IntersectionObserver',
    class {
      constructor(fn) {
        callback = fn;
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
  return (visible) =>
    act(() => callback([{ isIntersecting: visible, intersectionRatio: visible ? 1 : 0 }]));
}

// Installs Element.animate as a recorder; each call returns an animation the test can finish.
function installAnimate() {
  const calls = [];
  const animate = function recorded(frames, options) {
    const animation = { frames, options, target: this, cancelled: false, paused: false, cancel() { this.cancelled = true; }, pause() { this.paused = true; }, play() { this.paused = false; } };
    calls.push(animation);
    return animation;
  };
  SVGElement.prototype.animate = animate;
  HTMLElement.prototype.animate = animate;
  return calls;
}

function setup() {
  return render(<WalkthroughBlock block={block} />);
}

const tab = (id) => document.querySelector(`.wt-tab[data-go="${id}"]`);
const readout = () => document.querySelector('.wt-ro');

describe('WalkthroughBlock', () => {
  it('throws a readable error for a figure it does not know', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<WalkthroughBlock block={{ ...block, figure: 'no-such-figure' }} />)).toThrow(/Unknown walkthrough figure "no-such-figure"/);
    consoleError.mockRestore();
  });

  it('rests on the first step, paused, with the whole bench drawn and every step listed in full', () => {
    setup();

    const region = screen.getByRole('region', { name: block.regionLabel });
    expect(within(region).getByText(block.states.paused)).toBeInTheDocument();
    expect(within(readout()).getByText('Step 1 of 13')).toBeInTheDocument();
    expect(within(readout()).getByText(steps[0].does)).toBeInTheDocument();
    expect(region.querySelector('[data-part="sync"]')).not.toBeNull();

    const list = document.getElementById('wt-steps');
    expect(within(list).getAllByRole('listitem')).toHaveLength(13);
    for (const step of steps) {
      expect(within(list).getAllByText(step.does).length).toBeGreaterThan(0);
    }
  });

  it('gives the rail thirteen buttons, one of them current, and never a tab role', () => {
    setup();

    const rail = screen.getByRole('list', { name: block.stepsLabel });
    const buttons = within(rail).getAllByRole('button');
    expect(buttons).toHaveLength(13);
    expect(buttons.filter((button) => button.getAttribute('aria-current') === 'step')).toHaveLength(1);
    expect(buttons[0]).toHaveAttribute('aria-current', 'step');
    expect(buttons.filter((button) => button.tabIndex === 0)).toHaveLength(1);
    expect(screen.queryByRole('tab')).toBeNull();
    expect(buttons[12]).toHaveAccessibleName('Step 13, Next, designed.');
  });

  it('opens a step when its rail button is pressed, and says so for assistive technology', () => {
    setup();

    fireEvent.click(tab('gate'));

    expect(within(readout()).getByText('Step 6 of 13')).toBeInTheDocument();
    expect(within(readout()).getByText(steps[indexOf('gate')].does)).toBeInTheDocument();
    expect(within(readout()).getByText(steps[indexOf('gate')].person)).toBeInTheDocument();
    expect(document.querySelector('.sr-only[aria-live]')).toHaveTextContent('Step 6, Gate, built.');
    expect(tab('gate')).toHaveAttribute('aria-current', 'step');
  });

  it('moves along the rail with the arrow keys, Home and End, and stops at both ends', () => {
    setup();
    const rail = screen.getByRole('list', { name: block.stepsLabel });

    act(() => tab('sync').focus());
    fireEvent.keyDown(rail, { key: 'ArrowRight' });
    expect(tab('store')).toHaveAttribute('aria-current', 'step');
    expect(document.activeElement).toBe(tab('store'));
    fireEvent.keyDown(rail, { key: 'ArrowLeft' });
    fireEvent.keyDown(rail, { key: 'ArrowLeft' });
    expect(tab('sync')).toHaveAttribute('aria-current', 'step');
    fireEvent.keyDown(rail, { key: 'End' });
    expect(tab('next')).toHaveAttribute('aria-current', 'step');
    fireEvent.keyDown(rail, { key: 'ArrowDown' });
    expect(tab('next')).toHaveAttribute('aria-current', 'step');
    fireEvent.keyDown(rail, { key: 'Home' });
    expect(tab('sync')).toHaveAttribute('aria-current', 'step');
  });

  it('stops at the decision, shows three buttons, and takes one decision only', () => {
    setup();

    fireEvent.click(tab('decision'));

    const ro = readout();
    expect(within(ro).getByText(block.labels.waiting)).toBeInTheDocument();
    expect(screen.getByText(block.hint)).toBeVisible();
    expect(screen.getByRole('region', { name: block.regionLabel })).toHaveTextContent(block.states.waiting);
    const decisionButtons = () => ['approve', 'waive', 'reject'].map((kind) => within(ro).getByRole('button', { name: block.controls[kind] }));
    for (const button of decisionButtons()) expect(button).toBeEnabled();

    fireEvent.click(within(ro).getByRole('button', { name: block.controls.waive }));

    expect(within(ro).getByText(block.labels.recorded.replace('{kind}', 'waive'))).toBeInTheDocument();
    for (const button of decisionButtons()) expect(button).toBeDisabled();
    expect(document.querySelector('.wt-readout')).toHaveTextContent('decision_recorded · waive');
    expect(document.querySelector('.sr-only[aria-live]')).toHaveTextContent('Decision waive recorded to the ledger.');
    expect(screen.getByText(block.hint)).not.toBeVisible();
  });

  it('lets the visitor skip the decision with Next step', () => {
    setup();
    fireEvent.click(tab('decision'));

    fireEvent.click(screen.getByRole('button', { name: block.controls.next }));

    expect(tab('postflight')).toHaveAttribute('aria-current', 'step');
  });

  it('shows Replay as the main button on the last step, hides Next step, and starts over', () => {
    setup();
    fireEvent.click(tab('next'));

    const replay = screen.getByRole('button', { name: block.controls.replay });
    expect(replay).toHaveClass('wt-primary');
    expect(screen.getByText(block.controls.next)).not.toBeVisible();
    expect(screen.getByRole('region', { name: block.regionLabel })).toHaveTextContent(block.states.done);

    fireEvent.click(replay);

    expect(tab('sync')).toHaveAttribute('aria-current', 'step');
  });

  it('opens a step from the full list and keeps the list readable', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: `Show step 3, Explain, on the bench` }));

    expect(tab('explain')).toHaveAttribute('aria-current', 'step');
    expect(document.activeElement).toBe(tab('explain'));
  });

  describe('autoplay (with a stand-in animation clock)', () => {
    it('does not start until the console is on screen, then plays step one for its dwell time', () => {
      const fire = installObserver();
      const animations = installAnimate();
      setup();
      const region = screen.getByRole('region', { name: block.regionLabel });

      expect(region).toHaveTextContent(block.states.paused);
      expect(animations.filter((a) => a.options.easing === 'linear' && a.options.duration >= 4500)).toHaveLength(0);

      fire(true);

      expect(region).toHaveTextContent(block.states.playing);
      const clock = animations.find((a) => a.options.duration >= 4500 && a.options.easing === 'linear' && a.target.tagName === 'I');
      expect(clock).toBeDefined();
      expect(clock.options.duration).toBeGreaterThanOrEqual(4500);
    });

    it('moves on to the next step when the clock finishes, and stops at the decision until one is recorded', () => {
      const fire = installObserver();
      const animations = installAnimate();
      setup();
      fire(true);

      const finishClock = () => {
        const clocks = animations.filter((a) => a.target.tagName === 'I' && !a.cancelled);
        const clock = clocks[clocks.length - 1];
        act(() => clock.onfinish());
      };

      for (let i = 0; i < indexOf('decision'); i += 1) finishClock();

      expect(tab('decision')).toHaveAttribute('aria-current', 'step');
      expect(screen.getByRole('region', { name: block.regionLabel })).toHaveTextContent(block.states.waiting);
      const before = animations.filter((a) => a.target.tagName === 'I').length;
      act(() => {});
      expect(animations.filter((a) => a.target.tagName === 'I')).toHaveLength(before);

      fireEvent.click(screen.getByRole('button', { name: block.controls.approve }));

      const after = animations.filter((a) => a.target.tagName === 'I').length;
      expect(after).toBeGreaterThan(before);
    });

    it('stops the autoplay when the visitor picks a step, and offers Play again', () => {
      const fire = installObserver();
      installAnimate();
      setup();
      fire(true);

      fireEvent.click(tab('mcp'));

      expect(screen.getByRole('region', { name: block.regionLabel })).toHaveTextContent(block.states.paused);
      expect(screen.getByRole('button', { name: block.controls.play })).toBeVisible();
    });

    it('pauses while the console is off screen and while the visitor reads the rail', () => {
      const fire = installObserver();
      installAnimate();
      setup();
      const region = screen.getByRole('region', { name: block.regionLabel });
      fire(true);
      expect(region).toHaveTextContent(block.states.playing);

      fire(false);
      expect(region).toHaveTextContent(block.states.offscreen);

      fire(true);
      act(() => tab('sync').focus());
      expect(region).toHaveTextContent(block.states.reading);
    });
  });

  describe('for a visitor who asked for less motion', () => {
    it('plays nothing, hides Play, and still steps through by hand', () => {
      replaceWindow('matchMedia', (query) => ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} }));
      const animations = installAnimate();
      setup();

      expect(screen.getByRole('region', { name: block.regionLabel })).toHaveTextContent(block.states.paused);
      expect(screen.getByText(block.controls.play)).not.toBeVisible();
      expect(animations.filter((a) => a.target.tagName === 'I')).toHaveLength(0);

      fireEvent.click(tab('preflight'));

      expect(tab('preflight')).toHaveAttribute('aria-current', 'step');
      expect(animations).toHaveLength(0);
      expect(document.querySelector('[data-part="needle"]').style.transform).toMatch(/^matrix\(/);
    });
  });
});

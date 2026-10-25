// Tests the walkthrough console (TG-07, D6): what it shows at rest, how a visitor moves along the
// rail, the stop at the decision, the autoplay clock with its pauses, and the calm version. The
// words come from the Orion study's own block, so a change to the data is tested too. jsdom has
// no animation clock, so tests that need one install a small stand-in and say so.
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import WalkthroughBlock from './WalkthroughBlock';

const fathom = portfolioData.caseStudies.find((study) => study.id === 'fathom'); // the walkthrough moved to Fathom with the split (owner, 2026-10-25)
// The Orion page now draws its walkthrough as a chip (owner, 2026-10-23). The console these tests
// cover still serves the other walkthroughs, so they keep running it on the Orion words, with the
// bench figure it was written against.
const block = { ...fathom.sections.flatMap((section) => section.blocks).find((candidate) => candidate.type === 'walkthrough'), figure: 'orion-bench' };
// The bench wording these tests were written against.
block.labels = { ...block.labels, showAria: 'Show step {n}, {label}, on the bench' };
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
    expect(screen.getByText(block.hint)).toHaveAttribute('data-show');
    expect(screen.getByRole('region', { name: block.regionLabel })).toHaveTextContent(block.states.waiting);
    const decisionButtons = () => ['approve', 'waive', 'reject'].map((kind) => within(ro).getByRole('button', { name: block.controls[kind] }));
    for (const button of decisionButtons()) expect(button).toBeEnabled();

    fireEvent.click(within(ro).getByRole('button', { name: block.controls.waive }));

    expect(within(ro).getByText(block.labels.recorded.replace('{kind}', 'waive'))).toBeInTheDocument();
    for (const button of decisionButtons()) expect(button).toBeDisabled();
    expect(document.querySelector('.wt-readout[data-current]')).toHaveTextContent('Decision recorded: waive');
    expect(document.querySelector('.sr-only[aria-live]')).toHaveTextContent('Decision waive recorded to the ledger.');
    // The hint keeps its place (so the controls keep their height) and is hidden by look.css, which jsdom does not load.
    expect(screen.getByText(block.hint)).not.toHaveAttribute('data-show');
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

    it('does not start over from step one when a step picked by hand comes before the console is first seen', () => {
      const fire = installObserver();
      installAnimate();
      setup();
      fireEvent.click(tab('mcp'));
      fire(true);

      expect(tab('mcp')).toHaveAttribute('aria-current', 'step');
      expect(screen.getByRole('region', { name: block.regionLabel })).toHaveTextContent(block.states.paused);
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

    it('pauses the step clock itself while the console is off screen and while the visitor reads the rail', () => {
      const fire = installObserver();
      const animations = installAnimate();
      setup();
      const region = screen.getByRole('region', { name: block.regionLabel });
      // The step clock is the animation drawn on the rail's track; the newest one that was not cancelled.
      const clock = () => animations.filter((a) => a.target.tagName === 'I' && !a.cancelled).at(-1);

      fire(true);
      expect(region).toHaveTextContent(block.states.playing);
      expect(clock()).toBeDefined();
      expect(clock().paused).toBe(false);

      fire(false);
      expect(region).toHaveTextContent(block.states.offscreen);
      expect(clock().paused).toBe(true);

      fire(true);
      expect(clock().paused).toBe(false);

      act(() => tab('sync').focus());
      expect(region).toHaveTextContent(block.states.reading);
      expect(clock().paused).toBe(true);
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

// The Atelier walkthrough (TG-08, D2, D3, D9): the same console, switched to click-driven mode and
// given a second level of agent cards by the block's own fields. The Orion cases above are
// unchanged and prove the new behaviours are optional.
describe('the Atelier walkthrough', () => {
  const atelier = portfolioData.caseStudies.find((study) => study.id === 'atelier');
  const floor = atelier.sections.flatMap((section) => section.blocks).find((candidate) => candidate.type === 'walkthrough');
  const phases = floor.steps;
  const phaseIndex = (id) => phases.findIndex((step) => step.id === id);
  const setupFloor = () => render(<WalkthroughBlock block={floor} />);
  const consoleOf = () => screen.getByRole('region', { name: floor.regionLabel });
  const roleButton = (name) => within(consoleOf()).getByRole('button', { name: new RegExp(`^${name}`) });
  const openCard = () => document.querySelector('.wt-ro-agent[data-current]');
  const currentPanels = () => document.querySelectorAll('.wt-ro-step[data-current], .wt-ro-agent[data-current]');

  it('rests on the first phase with its station ringed, the plates at rest and every phase listed in full', () => {
    setupFloor();

    expect(within(consoleOf()).getByText('Phase 1 of 12')).toBeInTheDocument();
    expect(within(readout()).getByText('1 of 12')).toBeInTheDocument();
    expect(within(readout()).getByText(phases[0].does)).toBeInTheDocument();
    expect(consoleOf().querySelector('[data-part="intake"]')).not.toBeNull();
    const list = document.getElementById('wt-steps');
    expect(within(list).getAllByRole('listitem')).toHaveLength(12);
    for (const phase of phases) expect(within(list).getAllByText(phase.does).length).toBeGreaterThan(0);
  });

  it('gives the rail twelve buttons, one of them current, and names the designed one', () => {
    setupFloor();

    const rail = screen.getByRole('list', { name: floor.stepsLabel });
    const buttons = within(rail).getAllByRole('button');
    expect(buttons).toHaveLength(12);
    expect(buttons.filter((button) => button.getAttribute('aria-current') === 'step')).toHaveLength(1);
    expect(buttons[11]).toHaveAccessibleName('Phase 12 of 12, Simulated visitors, designed.');
    expect(buttons[0]).toHaveAttribute('data-tag', 'built');
    expect(buttons[11]).toHaveAttribute('data-tag', 'designed');
  });

  it('holds every agent card in the markup at all times, with exactly one panel open', () => {
    setupFloor();
    const agentCount = phases.reduce((total, phase) => total + phase.agents.length, 0);

    expect(document.querySelectorAll('.wt-ro > .wt-ro-step')).toHaveLength(12);
    expect(document.querySelectorAll('.wt-ro > .wt-ro-agent')).toHaveLength(agentCount);
    expect(currentPanels()).toHaveLength(1);

    fireEvent.click(tab('critics'));
    fireEvent.click(roleButton('Motion critic'));

    expect(currentPanels()).toHaveLength(1);
    expect(openCard()).not.toBeNull();
  });

  it('never plays by itself: no Play or Pause button, no clock, even with the console in view', () => {
    const fire = installObserver();
    const animations = installAnimate();
    setupFloor();

    fire(true);

    expect(screen.queryByText('Play')).toBeNull();
    expect(screen.queryByText('Pause')).toBeNull();
    expect(animations.filter((a) => a.target.tagName === 'I')).toHaveLength(0);
    expect(consoleOf()).not.toHaveTextContent(/Playing|Paused/);
    expect(consoleOf()).toHaveTextContent('Phase 1 of 12');
  });

  it('still plays nothing after the visitor\'s motion setting changes', () => {
    let listener = null;
    let matches = true;
    replaceWindow('matchMedia', (query) => ({
      get matches() {
        return matches;
      },
      media: query,
      addEventListener: (type, fn) => {
        listener = fn;
      },
      removeEventListener() {},
    }));
    const animations = installAnimate();
    setupFloor();
    fireEvent.click(tab('rig'));

    matches = false;
    act(() => listener?.());

    expect(animations.filter((a) => a.target.tagName === 'I')).toHaveLength(0);
    expect(tab('rig')).toHaveAttribute('aria-current', 'step');
    expect(consoleOf()).toHaveTextContent('Phase 6 of 12');
  });

  it('moves one phase with Previous and Next, and stops at both ends', () => {
    setupFloor();
    const previous = screen.getByText(floor.controls.prev);
    const next = screen.getByText(floor.controls.next);
    expect(previous).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(next);
    expect(consoleOf()).toHaveTextContent('Phase 2 of 12');
    fireEvent.click(previous);
    expect(consoleOf()).toHaveTextContent('Phase 1 of 12');

    fireEvent.click(tab('visitors'));
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(previous).not.toHaveAttribute('aria-disabled');
  });

  it('keeps keyboard focus on the button when it reaches its end, and a press there changes nothing', () => {
    setupFloor();
    const previous = screen.getByText(floor.controls.prev);
    const next = screen.getByText(floor.controls.next);
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    act(() => previous.focus());
    fireEvent.click(previous);
    expect(document.activeElement).toBe(previous);
    expect(consoleOf()).toHaveTextContent('Phase 1 of 12');

    fireEvent.click(tab('visitors'));
    act(() => next.focus());
    fireEvent.click(next);
    expect(document.activeElement).toBe(next);
    expect(consoleOf()).toHaveTextContent('Phase 12 of 12');
  });

  // A browser drops focus from a control the moment it is hidden and cannot focus a hidden control;
  // jsdom does neither, so this stand-in does both.
  const hidingDropsFocus = () => {
    const setAttribute = Element.prototype.setAttribute;
    const focus = HTMLElement.prototype.focus;
    Element.prototype.setAttribute = function hide(name, value) {
      if (name === 'hidden' && document.activeElement === this) this.blur();
      return setAttribute.call(this, name, value);
    };
    HTMLElement.prototype.focus = function tryFocus(...args) {
      if (this.hidden) return undefined;
      return focus.apply(this, args);
    };
    return () => {
      Element.prototype.setAttribute = setAttribute;
      HTMLElement.prototype.focus = focus;
    };
  };

  for (const reduced of [false, true]) {
    it(`sends focus to the first phase tab when Back to the start is pressed from the keyboard, with${reduced ? '' : 'out'} reduced motion`, () => {
      if (reduced) replaceWindow('matchMedia', (query) => ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} }));
      const restore = hidingDropsFocus();
      try {
        setupFloor();
        fireEvent.click(tab('critics'));
        const again = screen.getByText(floor.controls.replay);
        act(() => again.focus());
        expect(document.activeElement).toBe(again);

        fireEvent.click(again);

        expect(consoleOf()).toHaveTextContent('Phase 1 of 12');
        expect(document.activeElement).toBe(tab('intake'));
      } finally {
        restore();
      }
    });
  }

  it('leaves the autoplay block\'s Replay as it was: it goes back to the first step and does not move focus itself', () => {
    const { container } = render(<WalkthroughBlock block={block} />);
    fireEvent.click(tab(steps[3].id));
    const again = container.querySelector('.wt-again');
    const firstTab = tab(steps[0].id);
    const focusSpy = vi.spyOn(firstTab, 'focus');
    fireEvent.click(again);
    expect(focusSpy).not.toHaveBeenCalled();
    expect(firstTab).toHaveAttribute('aria-current', 'step');
  });

  it('never marks the autoplay block\'s controls as disabled', () => {
    const { container } = render(<WalkthroughBlock block={block} />);
    expect(container.querySelectorAll('.wt-controls [aria-disabled]')).toHaveLength(0);
    expect(container.querySelectorAll('.wt-controls [disabled]')).toHaveLength(0);
  });

  it('opens a role card from a role button, moves focus to Back, and Back returns focus to the role button', () => {
    setupFloor();
    fireEvent.click(tab('critics'));

    fireEvent.click(roleButton('Visual critic'));

    const card = openCard();
    expect(card).not.toBeNull();
    expect(within(card).getByText(phases[phaseIndex('critics')].agents[0].role)).toBeInTheDocument();
    const back = within(card).getByRole('button', { name: 'Back to Three critics' });
    expect(document.activeElement).toBe(back);
    expect(document.querySelector('.sr-only[aria-live]')).toHaveTextContent('Visual critic, agent.');

    fireEvent.click(back);

    expect(openCard()).toBeNull();
    expect(document.querySelectorAll('.wt-ro-step[data-current]')).toHaveLength(1);
    expect(document.activeElement).toBe(roleButton('Visual critic'));
  });

  it('closes the card with Escape pressed on the Back button, and returns focus to the role button', () => {
    setupFloor();
    fireEvent.click(tab('lanes'));
    fireEvent.click(roleButton('Motion Director'));
    expect(openCard()).not.toBeNull();

    fireEvent.keyDown(document.activeElement, { key: 'Escape' });

    expect(openCard()).toBeNull();
    expect(document.activeElement).toBe(roleButton('Motion Director'));
  });

  it('does nothing on Escape when no card is open, and ignores Escape pressed outside the console', () => {
    setupFloor();
    fireEvent.click(tab('lanes'));
    const before = consoleOf().innerHTML;

    fireEvent.keyDown(consoleOf(), { key: 'Escape' });
    expect(consoleOf().innerHTML).toBe(before);

    fireEvent.click(roleButton('Engineer'));
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(openCard()).not.toBeNull();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(openCard()).not.toBeNull();
  });

  it('closes an open card when the visitor moves to another phase by the rail keys or a button', () => {
    setupFloor();
    const rail = screen.getByRole('list', { name: floor.stepsLabel });
    fireEvent.click(tab('critics'));
    fireEvent.click(roleButton('UX critic'));
    expect(openCard()).not.toBeNull();

    act(() => tab('critics').focus());
    fireEvent.keyDown(rail, { key: 'ArrowRight' });

    expect(openCard()).toBeNull();
    expect(tab('pick')).toHaveAttribute('aria-current', 'step');

    fireEvent.click(tab('library'));
    fireEvent.click(roleButton('Library'));
    expect(openCard()).not.toBeNull();
    fireEvent.click(screen.getByText(floor.controls.next));
    expect(openCard()).toBeNull();
  });

  it('opens a phase when its station on the drawing is tapped', () => {
    setupFloor();

    fireEvent.click(consoleOf().querySelector('[data-part="critics"] path'));

    expect(tab('critics')).toHaveAttribute('aria-current', 'step');
  });

  it('lights the stage only where a person decides, and says so on the status mark', () => {
    setupFloor();
    const stage = () => document.querySelector('.wt-stage');
    expect(stage()).toHaveAttribute('data-mood', 'work');

    fireEvent.click(tab('pick'));
    expect(stage()).toHaveAttribute('data-mood', 'wait');
    expect(consoleOf()).toHaveAttribute('data-phase', 'wait');
    expect(within(readout()).getAllByText(phases[phaseIndex('pick')].person).length).toBeGreaterThan(0);

    fireEvent.click(tab('refine'));
    expect(stage()).toHaveAttribute('data-mood', 'work');
  });

  it('says plainly that the last phase names no agent', () => {
    setupFloor();

    fireEvent.click(tab('visitors'));

    expect(within(readout()).getAllByText(floor.labels.noAgents).length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.wt-role')).toHaveLength(phases.reduce((total, phase) => total + phase.agents.length, 0));
  });

  it('keeps the hint on every phase, not only at a stop', () => {
    setupFloor();

    for (const id of ['intake', 'pick', 'visitors']) {
      fireEvent.click(tab(id));
      expect(document.querySelector('.wt-controls > .wt-hint')).toHaveAttribute('data-show');
    }
  });

  it('puts the rule line on the phases that carry one, on the console and in the list', () => {
    setupFloor();
    const critics = phases[phaseIndex('critics')];

    fireEvent.click(tab('critics'));

    expect(within(readout()).getAllByText(critics.rule).length).toBeGreaterThan(0);
    expect(within(document.getElementById('wt-steps')).getAllByText(critics.rule)).toHaveLength(1);
  });
});

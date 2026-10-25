// Tests the Fathom case study's replay (owner, 2026-10-25): complete at rest on the server, a stop
// at the decision that only the visitor's press ends, two endings that both show, a calm version
// with no clock, and words and figures that all come from the one recorded run.
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import FathomReplay from './FathomReplay';

const replay = { ...portfolioData.fathomReplay, skip: { text: 'Skip to the next section', href: '#verdict' } };
const { panes } = replay;

let observers;
let animations;

// A stand-in IntersectionObserver the test can fire by hand.
class ControllableObserver {
  constructor(callback) {
    this.callback = callback;
    observers.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

// Answers the reduced-motion query as the test asks.
function setMotion({ reduced }) {
  window.matchMedia = (query) => ({
    matches: reduced && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

beforeEach(() => {
  observers = [];
  animations = [];
  window.IntersectionObserver = ControllableObserver;
  // jsdom has no Web Animations API; record each call so a test can finish a step's clock by hand.
  Element.prototype.animate = function animate(keyframes, options) {
    const animation = { keyframes, options, onfinish: null, pause: vi.fn(), play: vi.fn(), cancel: vi.fn() };
    animations.push(animation);
    return animation;
  };
});

afterEach(() => {
  delete Element.prototype.animate;
});

// Fires the on-screen callback, as the browser does when the console is a quarter visible.
function scrollIntoView() {
  act(() => {
    for (const observer of observers) observer.callback([{ isIntersecting: true }]);
  });
}

// Ends the running step clock, as the browser does when the rail track fills.
function finishClock() {
  act(() => animations.at(-1).onfinish());
}

function tabs() {
  return within(screen.getByRole('list', { name: replay.stepsLabel })).getAllByRole('button');
}

function openPane() {
  return document.querySelector('.rp-pane.rp-on');
}

describe('the Fathom replay', () => {
  it('renders on the server, at rest on the decision, with every step in the markup', () => {
    const html = renderToString(<FathomReplay replay={replay} />);
    expect(html).toContain(panes.approval.kick);
    for (const step of replay.steps) expect(html).toContain(`data-go="${step.id}"`);
    expect(html).toContain(panes.ask.request);
    expect(html).toContain(panes.rejected.request);
  });

  it('plays from the ask once on screen and stops at the decision until the visitor presses', () => {
    setMotion({ reduced: false });
    render(<FathomReplay replay={replay} />);
    scrollIntoView();
    expect(openPane().dataset.pane).toBe('ask');
    for (const id of ['reach', 'rule', 'history', 'verdict', 'approval']) {
      finishClock();
      expect(openPane().dataset.pane).toBe(id);
    }
    const clocks = animations.length;
    expect(screen.getByText(replay.controls.hintWaiting)).toBeVisible();
    expect(tabs()[6]).toBeDisabled();
    fireEvent.click(tabs()[6]);
    expect(openPane().dataset.pane).toBe('approval');
    expect(animations).toHaveLength(clocks);
  });

  it('ends on the watch after Approve, and offers the other ending', () => {
    setMotion({ reduced: false });
    render(<FathomReplay replay={replay} />);
    scrollIntoView();
    fireEvent.click(screen.getByRole('button', { name: replay.controls.jump }));
    fireEvent.click(screen.getByRole('button', { name: replay.controls.approve }));
    expect(openPane().dataset.pane).toBe('after');
    expect(within(openPane()).getByText(panes.approved.text)).toBeInTheDocument();
    expect(screen.getByText(replay.states.approved)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: replay.controls.other }));
    expect(openPane().dataset.pane).toBe('after-reject');
    expect(screen.getByText(replay.states.rejected)).toBeInTheDocument();
  });

  it('ends on the safe version after Reject, with its own log lines', () => {
    setMotion({ reduced: false });
    render(<FathomReplay replay={replay} />);
    scrollIntoView();
    fireEvent.click(screen.getByRole('button', { name: replay.controls.jump }));
    fireEvent.click(screen.getByRole('button', { name: replay.controls.reject }));
    expect(openPane().dataset.pane).toBe('after-reject');
    const log = screen.getByRole('region', { name: replay.logLabel });
    for (const line of replay.log.rejected) expect(within(log).getByText(line.value)).toBeInTheDocument();
    expect(within(log).queryByText(replay.log.approved[1].value)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: replay.controls.replay }));
    expect(openPane().dataset.pane).toBe('ask');
  });

  it('rests on the decision with no clock and no Play button for a visitor who asks for less motion', () => {
    setMotion({ reduced: true });
    render(<FathomReplay replay={replay} />);
    expect(openPane().dataset.pane).toBe('approval');
    expect(animations).toHaveLength(0);
    expect(screen.queryByRole('button', { name: replay.controls.play })).toBeNull();
    fireEvent.click(tabs()[1]);
    expect(openPane().dataset.pane).toBe('reach');
    expect(animations).toHaveLength(0);
  });
});

describe('the Fathom replay record', () => {
  // Every figure the replay shows, as the recorded run (fathom main d993d56, fixture platform,
  // 2026-10-25) printed it: the verdict's risk and its five parts, the table's 8 downstream
  // assets with 4 tier 1, the 2 the column reaches, tier 1, the 3 runs postflight watches, the
  // safe version's risk 0, and INC-230 and CON-031 with the incident's date.
  const RECORDED = new Set(['85', '100', '30', '25', '15', '12.6', '2.4', '8', '4', '2', '1', '3', '0', '230', '031', '18', '2026']);

  // Every string in the record, however deep.
  function strings(value) {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value.flatMap(strings);
    if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
    return [];
  }

  it('states only figures the recorded run printed', () => {
    const text = strings(portfolioData.fathomReplay).join('\n').replace(/\{n\}/g, '');
    const numbers = text.match(/(?<![A-Za-z_])\d+(?:\.\d+)?/g) ?? [];
    expect(numbers.filter((n) => !RECORDED.has(n))).toEqual([]);
  });

  it('adds the verdict parts up to the risk it states', () => {
    const total = panes.verdict.factors.reduce((sum, factor) => sum + factor.points, 0);
    expect(Math.round(total)).toBe(Number(panes.verdict.risk.match(/\d+/)[0]));
  });

  it('holds seven steps with the decision sixth, and a log entry for each step and both endings', () => {
    expect(replay.steps.map((step) => step.id)).toEqual(['ask', 'reach', 'rule', 'history', 'verdict', 'approval', 'after']);
    for (const id of ['ask', 'reach', 'rule', 'history', 'verdict', 'approval', 'approved', 'rejected']) {
      expect(replay.log[id].length).toBeGreaterThan(0);
    }
  });
});

// Tests the AgentOps replay console on the home page (TG-06, D8): nine steps readable as plain
// text, a calm version with no animation, keyboard operation, a pause at the approval that only
// the visitor's press ends, and server rendering with no browser object.
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import AgentOpsReplay from './AgentOpsReplay';

const replay = portfolioData.homeReplay;
const STEP_LABELS = replay.steps.map((step) => step.label);
const APPROVAL_INDEX = replay.steps.findIndex((step) => step.id === 'approval');

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
  // jsdom has no Web Animations API; record each call so a test can see whether anything animated.
  Element.prototype.animate = function animate(keyframes, options) {
    const animation = {
      keyframes,
      options,
      onfinish: null,
      pause: vi.fn(),
      play: vi.fn(),
      cancel: vi.fn(),
    };
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

function tabs() {
  return within(screen.getByRole('list', { name: replay.stepsLabel })).getAllByRole('button');
}

function currentTab() {
  return tabs().find((tab) => tab.getAttribute('aria-current') === 'step');
}

function paneFor(id) {
  return document.querySelector(`[data-pane="${id}"]`);
}

describe('AgentOpsReplay at rest (with motion allowed, before it is on screen)', () => {
  beforeEach(() => setMotion({ reduced: false }));

  it('lists the nine steps of the run in order, as buttons in a labelled list', () => {
    render(<AgentOpsReplay replay={replay} />);

    expect(replay.steps).toHaveLength(9);
    expect(tabs().map((tab) => tab.textContent)).toEqual(STEP_LABELS);
  });

  it('rests on the approval, with the earlier steps done and the later steps still to come', () => {
    render(<AgentOpsReplay replay={replay} />);

    expect(currentTab().textContent).toBe('Approval');
    const states = tabs().map((tab) => tab.dataset.state);
    expect(states.slice(0, APPROVAL_INDEX)).toEqual(Array(APPROVAL_INDEX).fill('done'));
    expect(states[APPROVAL_INDEX]).toBe('current');
    expect(states.slice(APPROVAL_INDEX + 1)).toEqual(Array(9 - APPROVAL_INDEX - 1).fill('todo'));
  });

  it('shows the proposed action and an Approve and a Reject button, both enabled', () => {
    render(<AgentOpsReplay replay={replay} />);

    expect(within(paneFor('approval')).getByText(replay.approval.action)).toBeInTheDocument();
    expect(within(paneFor('approval')).getByText(replay.approval.pending)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: replay.controls.approve })).toBeEnabled();
    expect(screen.getByRole('button', { name: replay.controls.reject })).toBeEnabled();
    expect(screen.getByText(replay.controls.hintWaiting)).toBeInTheDocument();
  });

  it('says in words that it is a replay of a recorded run with a scripted model', () => {
    render(<AgentOpsReplay replay={replay} />);

    expect(screen.getByText(replay.note)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: replay.regionLabel })).toBeInTheDocument();
  });

  it('offers a link past the console to the AgentOps section of the page', () => {
    render(<AgentOpsReplay replay={replay} />);

    expect(screen.getByRole('link', { name: replay.skip.text })).toHaveAttribute('href', replay.skip.href);
  });

  it('plays nothing before it is on screen: no animation is started', () => {
    render(<AgentOpsReplay replay={replay} />);

    expect(animations).toHaveLength(0);
  });
});

describe('every step is readable as plain text (nothing depends on animation)', () => {
  beforeEach(() => setMotion({ reduced: false }));

  it('has the words of every step in the page text at rest, whichever one is showing (it does not test how many show at once or the rail)', () => {
    const { container } = render(<AgentOpsReplay replay={replay} />);
    const text = container.textContent;

    // alert
    expect(text).toContain(replay.alert.service);
    for (const symptom of replay.alert.symptoms) expect(text).toContain(symptom);
    expect(text).toContain(replay.alert.stamp);
    // triage
    for (const hypothesis of replay.triage.hypotheses) {
      expect(text).toContain(hypothesis.name);
      expect(text).toContain(hypothesis.score.toFixed(2));
    }
    // evidence: three readers
    for (const line of replay.evidence.logs.lines) expect(text).toContain(line.message);
    expect(text).toContain(replay.evidence.deploys.diff);
    expect(text).toContain(`${replay.evidence.deploys.from} → ${replay.evidence.deploys.to}`);
    // merge
    expect(text).toContain(String(replay.merge.count));
    expect(text).toContain(replay.merge.foot);
    // root cause
    expect(text).toContain(replay.rca.cause);
    for (const cite of replay.rca.cites) expect(text).toContain(cite);
    // approval
    expect(text).toContain(replay.approval.action);
    expect(text).toContain(replay.approval.budget);
    // execute
    for (const check of replay.execute.checks) expect(text).toContain(check.text);
    // verify
    expect(text).toContain(replay.verify.sequence);
    expect(text).toContain(replay.verify.logLine.message);
    // postmortem
    expect(text).toContain(replay.postmortem.summary);
    expect(text).toContain(`${replay.postmortem.from}`);
  });

  it('reaches every one of the nine steps from its rail button, and shows exactly one step pane at a time', () => {
    render(<AgentOpsReplay replay={replay} />);

    for (const step of replay.steps) {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${step.label}`) }));
      const shown = replay.steps.filter((other) => paneFor(other.id).className.includes('rp-on'));
      expect(shown.map((other) => other.id)).toEqual([step.id]);
    }
  });

  it('gives each of the nine steps its own pane, labelled with the step name', () => {
    render(<AgentOpsReplay replay={replay} />);

    for (const step of replay.steps) {
      expect(paneFor(step.id)).not.toBeNull();
      expect(paneFor(step.id)).toHaveAttribute('aria-label', step.label);
    }
  });

  it('writes the agent log lines of every step up to the approval at rest', () => {
    render(<AgentOpsReplay replay={replay} />);
    const log = screen.getByRole('region', { name: replay.logLabel });

    for (const step of replay.steps.slice(0, APPROVAL_INDEX + 1)) {
      for (const line of replay.log[step.id]) {
        expect(within(log).getAllByText(line.key).length).toBeGreaterThan(0);
        expect(within(log).getAllByText(line.value).length).toBeGreaterThan(0);
      }
    }
  });

  it('takes its values from the clean_bad_deploy sample run, not from placeholder text', () => {
    expect(replay.scenario).toBe('clean_bad_deploy');
    expect(replay.alert.service).toBe('checkout');
    expect(replay.alert.stamp).toBe('2026-03-10T10:30:00Z');
    expect(replay.approval.action).toBe('rollback_deploy on deploy-001 (risk high)');
    expect(replay.rca.cites).toEqual(['deploy-001', 'log-003']);
  });
});

describe('server rendering', () => {
  it('renders to a string with no window or document, with all nine step labels', () => {
    const html = renderToString(<AgentOpsReplay replay={replay} />);

    for (const label of STEP_LABELS) expect(html).toContain(label);
    expect(html).toContain(replay.approval.action);
  });
});

describe('the calm version under prefers-reduced-motion', () => {
  beforeEach(() => setMotion({ reduced: true }));

  it('starts no animation and no autoplay, even when the console scrolls into view', () => {
    vi.useFakeTimers();
    try {
      render(<AgentOpsReplay replay={replay} />);
      scrollIntoView();
      act(() => vi.advanceTimersByTime(60_000));

      expect(animations).toHaveLength(0);
      expect(currentTab().textContent).toBe('Approval');
    } finally {
      vi.useRealTimers();
    }
  });

  it('hides the Play and Pause control, because nothing plays', () => {
    render(<AgentOpsReplay replay={replay} />);

    expect(screen.getByText(replay.controls.play, { selector: 'button' })).toHaveAttribute('hidden');
  });

  it('marks no log line as animating in', () => {
    const { container } = render(<AgentOpsReplay replay={replay} />);

    expect(container.querySelectorAll('.rp-new')).toHaveLength(0);
  });

  it('opens any step at once when its tab is pressed, with no animation call', () => {
    render(<AgentOpsReplay replay={replay} />);

    for (const label of STEP_LABELS) {
      fireEvent.click(screen.getByRole('button', { name: label }));
      expect(currentTab().textContent).toBe(label);
    }
    expect(animations).toHaveLength(0);
  });

  it('resolves the whole run at once when Approve is pressed, writing every later log line', () => {
    const { container } = render(<AgentOpsReplay replay={replay} />);

    fireEvent.click(screen.getByRole('button', { name: replay.controls.approve }));

    expect(currentTab().textContent).toBe('Postmortem');
    expect(screen.getByText(replay.states.resolved)).toBeInTheDocument();
    const log = screen.getByRole('region', { name: replay.logLabel });
    for (const line of replay.log.postmortem) expect(within(log).getAllByText(line.value).length).toBeGreaterThan(0);
    expect(container.querySelectorAll('.rp-new')).toHaveLength(0);
    expect(animations).toHaveLength(0);
  });
});

describe('with motion allowed, once the console is on screen', () => {
  beforeEach(() => setMotion({ reduced: false }));

  it('starts from the alert and times the first step with one animation', () => {
    render(<AgentOpsReplay replay={replay} />);
    scrollIntoView();

    expect(currentTab().textContent).toBe('Alert');
    expect(animations).toHaveLength(1);
    expect(animations[0].options.duration).toBeGreaterThan(0);
  });

  it('moves to the next step when a step finishes, and pauses its timer when scrolled off screen', () => {
    render(<AgentOpsReplay replay={replay} />);
    scrollIntoView();

    act(() => animations[0].onfinish());
    expect(currentTab().textContent).toBe('Triage');

    act(() => {
      for (const observer of observers) observer.callback([{ isIntersecting: false }]);
    });
    expect(animations.at(-1).pause).toHaveBeenCalled();
  });

  it('stops at the approval and waits: finishing the step before it does not run past the approval', () => {
    render(<AgentOpsReplay replay={replay} />);
    scrollIntoView();

    for (let guard = 0; guard < 12 && currentTab().textContent !== 'Approval'; guard += 1) {
      act(() => animations.at(-1).onfinish());
    }

    expect(currentTab().textContent).toBe('Approval');
    const animationsAtApproval = animations.length;
    act(() => animations.at(-1).onfinish?.());
    expect(currentTab().textContent).toBe('Approval');
    expect(animations).toHaveLength(animationsAtApproval);
    expect(screen.getByText(replay.controls.hintWaiting)).toBeInTheDocument();
  });

  it('carries on past the approval only after Approve, and finishes at Postmortem as resolved', () => {
    render(<AgentOpsReplay replay={replay} />);
    scrollIntoView();
    fireEvent.click(screen.getByRole('button', { name: replay.steps[APPROVAL_INDEX].label }));

    fireEvent.click(screen.getByRole('button', { name: replay.controls.approve }));
    expect(currentTab().textContent).toBe('Execute');
    expect(screen.getByRole('button', { name: replay.controls.approve })).toBeDisabled();
    expect(screen.getByRole('button', { name: replay.controls.reject })).toBeDisabled();

    for (let guard = 0; guard < 6 && currentTab().textContent !== 'Postmortem'; guard += 1) {
      act(() => animations.at(-1).onfinish());
    }
    expect(currentTab().textContent).toBe('Postmortem');
    expect(screen.getByText(replay.states.resolved)).toBeInTheDocument();
  });

  it('stops for good on Reject: later steps are struck off and no action is applied', () => {
    render(<AgentOpsReplay replay={replay} />);
    scrollIntoView();
    fireEvent.click(screen.getByRole('button', { name: replay.steps[APPROVAL_INDEX].label }));

    fireEvent.click(screen.getByRole('button', { name: replay.controls.reject }));

    expect(paneFor('rejected').className).toContain('rp-on');
    expect(within(paneFor('rejected')).getByText(replay.rejected.text)).toBeInTheDocument();
    expect(tabs().slice(APPROVAL_INDEX + 1).map((tab) => tab.dataset.state)).toEqual(
      Array(9 - APPROVAL_INDEX - 1).fill('skipped'),
    );
    expect(screen.getByText(replay.states.rejected)).toBeInTheDocument();
    const log = screen.getByRole('region', { name: replay.logLabel });
    expect(within(log).getByText(replay.log.rejected[0].value)).toBeInTheDocument();
  });

  it('shows the steps after the approval as a labelled preview while the decision is still open', () => {
    render(<AgentOpsReplay replay={replay} />);

    fireEvent.click(screen.getByRole('button', { name: 'Verify' }));

    expect(screen.getByText(replay.controls.hintPreview)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: replay.controls.back })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: replay.controls.approve })).toBeEnabled();
  });

  it('starts the run over from the alert on Replay', () => {
    render(<AgentOpsReplay replay={replay} />);
    fireEvent.click(screen.getByRole('button', { name: replay.controls.replay }));

    expect(currentTab().textContent).toBe('Alert');
  });
});

describe('keyboard operation of the step rail', () => {
  beforeEach(() => setMotion({ reduced: true }));

  function focusTab(index) {
    tabs()[index].focus();
    return tabs()[index];
  }

  it('moves focus to the next and previous step with the arrow keys', () => {
    render(<AgentOpsReplay replay={replay} />);

    fireEvent.keyDown(focusTab(2), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabs()[3]);
    fireEvent.keyDown(tabs()[3], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(tabs()[2]);
  });

  it('jumps to the first step on Home and the last on End', () => {
    render(<AgentOpsReplay replay={replay} />);

    fireEvent.keyDown(focusTab(4), { key: 'End' });
    expect(document.activeElement).toBe(tabs()[8]);
    fireEvent.keyDown(tabs()[8], { key: 'Home' });
    expect(document.activeElement).toBe(tabs()[0]);
  });

  it('keeps focus on the last step when the right arrow is pressed there, and on the first when left is', () => {
    render(<AgentOpsReplay replay={replay} />);

    fireEvent.keyDown(focusTab(8), { key: 'ArrowRight' });
    expect(document.activeElement).toBe(tabs()[8]);
    fireEvent.keyDown(focusTab(0), { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(tabs()[0]);
  });

  it('does not change the open step when only focus moves', () => {
    render(<AgentOpsReplay replay={replay} />);

    fireEvent.keyDown(focusTab(1), { key: 'ArrowRight' });

    expect(currentTab().textContent).toBe('Approval');
  });

  it('opens a focused step with a click, which a keyboard Enter or Space turns into on a button', () => {
    render(<AgentOpsReplay replay={replay} />);

    fireEvent.click(focusTab(1));

    expect(currentTab().textContent).toBe('Triage');
  });
});

// Tests the walkthrough's step state (TG-07, D6): the reducer's guards, the dwell rule and the
// rail's keys, then the hook itself for what it shows at rest and for a visitor who asks for less
// motion. The autoplay clock is tested with the console in WalkthroughBlock.test.jsx.
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useWalkthrough, { createReducer, dwellMilliseconds, railTarget, stepWords } from './useWalkthrough';

const block = {
  states: { paused: 'Paused', playing: 'Playing', offscreen: 'Plays when in view', reading: 'Paused while you read', waiting: 'Waiting for you', done: 'All shown' },
  announce: { step: 'Step {n}, {label}, {tag}.', waiting: 'Waiting for your decision.', decision: 'Decision {kind} recorded.' },
  steps: [
    { id: 'one', label: 'One', tag: 'built', does: 'Does one.' },
    { id: 'decision', label: 'Decision', tag: 'built', does: 'A person decides.', person: 'Nothing lands until then.' },
    { id: 'three', label: 'Three', tag: 'built', does: 'Does three.' },
    { id: 'four', label: 'Four', tag: 'designed', does: 'Is planned.' },
  ],
};

const start = { idx: 0, decision: null, playing: false, calm: false, runId: 0, live: '', onScreen: false };

describe('dwell time', () => {
  it('counts the words of what a step does, who decides and its evidence', () => {
    expect(stepWords({ does: 'a b c', person: 'd e', evidence: 'f' })).toBe(6);
    expect(stepWords({ does: 'a b c' })).toBe(3);
  });

  it('holds a short step for four and a half seconds and a long one for longer', () => {
    expect(dwellMilliseconds({ does: 'Two words.' })).toBe(4500);
    const long = { does: Array.from({ length: 40 }, () => 'word').join(' ') };
    expect(dwellMilliseconds(long)).toBe(Math.round((1.8 + 40 * 0.23) * 1000));
  });
});

describe('the rail keys', () => {
  it('moves one step with the arrows and to the ends with Home and End, clamped to the steps', () => {
    expect(railTarget('ArrowRight', 3, 12)).toBe(4);
    expect(railTarget('ArrowDown', 3, 12)).toBe(4);
    expect(railTarget('ArrowLeft', 3, 12)).toBe(2);
    expect(railTarget('ArrowUp', 3, 12)).toBe(2);
    expect(railTarget('Home', 7, 12)).toBe(0);
    expect(railTarget('End', 7, 12)).toBe(12);
    expect(railTarget('ArrowLeft', 0, 12)).toBe(0);
    expect(railTarget('ArrowRight', 12, 12)).toBe(12);
  });

  it('ignores every other key', () => {
    expect(railTarget('Enter', 3, 12)).toBeUndefined();
    expect(railTarget('a', 3, 12)).toBeUndefined();
  });
});

describe('the reducer', () => {
  const reduce = createReducer(block);

  it('stops at the decision step until a decision is recorded', () => {
    const atDecision = reduce(start, { type: 'goTo', index: 1 });
    expect(atDecision.live).toBe('Waiting for your decision.');
    expect(reduce(atDecision, { type: 'advance' })).toBe(atDecision);
    const decided = reduce(atDecision, { type: 'decide', kind: 'approve' });
    expect(decided.decision).toBe('approve');
    expect(reduce(decided, { type: 'advance' }).idx).toBe(2);
  });

  it('records one decision only, and only at the decision step', () => {
    expect(reduce(start, { type: 'decide', kind: 'approve' })).toBe(start);
    const decided = reduce({ ...start, idx: 1 }, { type: 'decide', kind: 'waive' });
    expect(reduce(decided, { type: 'decide', kind: 'reject' }).decision).toBe('waive');
  });

  it('keeps the step inside the steps and stops the autoplay when the visitor chooses', () => {
    const playing = { ...start, playing: true };
    expect(reduce(playing, { type: 'goTo', index: 99, user: true }).idx).toBe(3);
    expect(reduce(playing, { type: 'goTo', index: -4, user: true }).idx).toBe(0);
    expect(reduce(playing, { type: 'goTo', index: 2, user: true }).playing).toBe(false);
    expect(reduce(playing, { type: 'goTo', index: 2 }).playing).toBe(true);
    expect(reduce({ ...start, idx: 3 }, { type: 'advance' }).idx).toBe(3);
  });

  it('announces each step with its number, label and tag', () => {
    expect(reduce(start, { type: 'goTo', index: 3, user: true }).live).toBe('Step 4, Four, designed.');
  });

  it('plays nothing for a visitor who asked for less motion', () => {
    const calm = reduce({ ...start, playing: true }, { type: 'calm' });
    expect(calm).toMatchObject({ calm: true, playing: false, idx: 0 });
    expect(reduce(calm, { type: 'togglePlay' })).toBe(calm);
    expect(reduce(calm, { type: 'reset' }).playing).toBe(false);
  });

  it('starts over from the first step on replay and starts playing when motion is allowed', () => {
    const late = { ...start, idx: 3, decision: 'approve' };
    expect(reduce(late, { type: 'reset' })).toMatchObject({ idx: 0, decision: null, playing: true });
    expect(reduce(late, { type: 'start' })).toMatchObject({ idx: 0, decision: null, playing: true, calm: false });
  });

  it('counts every move so a scene replays when the same step is shown again', () => {
    const again = reduce(start, { type: 'goTo', index: 0, user: true });
    expect(again.runId).toBe(start.runId + 1);
  });
});

describe('useWalkthrough', () => {
  it('rests on the first step, paused, before anything runs', () => {
    const { result } = renderHook(() => useWalkthrough(block));
    expect(result.current.idx).toBe(0);
    expect(result.current.playing).toBe(false);
    expect(result.current.stateText).toBe('Paused');
    expect(result.current.waiting).toBe(false);
  });

  it('opens the step the visitor picks, stops there and says so', () => {
    const { result } = renderHook(() => useWalkthrough(block));
    act(() => result.current.actions.goTo(1));
    expect(result.current.step.id).toBe('decision');
    expect(result.current.waiting).toBe(true);
    expect(result.current.stateText).toBe('Waiting for you');
    expect(result.current.live).toBe('Waiting for your decision.');
    act(() => result.current.actions.decide('reject'));
    expect(result.current.waiting).toBe(false);
    expect(result.current.decision).toBe('reject');
  });

  it('reports the last step as shown in full', () => {
    const { result } = renderHook(() => useWalkthrough(block));
    act(() => result.current.actions.goTo(3));
    expect(result.current.ended).toBe(true);
    expect(result.current.stateText).toBe('All shown');
  });

  it('rests, and plays nothing, when the visitor has asked for less motion', () => {
    const original = window.matchMedia;
    window.matchMedia = (query) => ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} });
    try {
      const { result } = renderHook(() => useWalkthrough(block));
      expect(result.current.calm).toBe(true);
      expect(result.current.playing).toBe(false);
      act(() => result.current.actions.togglePlay());
      expect(result.current.playing).toBe(false);
    } finally {
      window.matchMedia = original;
    }
  });
});

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from '../../prefersReducedMotion';

// The step where a person decides. The walkthrough stops here until a decision is recorded or
// the visitor moves on by hand.
export const DECISION_STEP = 'decision';

const FILL_FRAMES = [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }];

// The part of the console that must be on screen before it starts by itself, as a share of it.
const VISIBLE_SHARE = 0.2;

/** The words a visitor reads on a step: what it does, who decides and the evidence. */
export function stepWords(step) {
  return [step.does, step.person, step.evidence].filter(Boolean).join(' ').split(/\s+/).length;
}

/**
 * How long a step holds before the run moves on, in milliseconds. Written in unitless seconds
 * (the copy scan reads this file) with a floor of four and a half so a short step is still read.
 */
export function dwellMilliseconds(step) {
  const seconds = Math.max(4.5, 1.8 + stepWords(step) * 0.23);
  return Math.round(seconds * 1000);
}

/** Where the rail's focus goes for a key, clamped to the steps; undefined for any other key. */
export function railTarget(key, at, last) {
  const target = { ArrowRight: at + 1, ArrowDown: at + 1, ArrowLeft: at - 1, ArrowUp: at - 1, Home: 0, End: last }[key];
  return target === undefined ? undefined : Math.max(0, Math.min(last, target));
}

// Fills a template such as "Step {n}, {label}, {tag}." from one step.
function say(template, index, step, total) {
  return template.replace('{n}', String(index + 1)).replace('{total}', String(total)).replace('{label}', step.label).replace('{tag}', step.tag);
}

/**
 * Builds the reducer for one walkthrough block. Every change the visitor or the clock can cause is
 * here. `runId` counts moves so the bench replays a scene when the same step is shown again.
 */
export function createReducer(block) {
  const { steps, announce } = block;
  const last = steps.length - 1;
  const decisionIndex = steps.findIndex((step) => step.id === DECISION_STEP);
  const clickDriven = block.autoplay === false;
  // Any move to another step closes an open agent card.
  const move = (state, patch) => ({ ...state, agent: null, ...patch, runId: state.runId + 1 });

  return function reducer(state, action) {
    switch (action.type) {
      case 'calm':
        // The visitor asks for less motion: rest on the first step and play nothing. A
        // click-driven block never moved by itself, so it stays on the step the visitor chose.
        return move(state, { calm: true, decision: null, idx: clickDriven ? state.idx : 0, playing: false, live: '' });
      case 'motion':
        // A click-driven block never starts by itself: motion coming back only lifts the calm.
        return state.calm ? { ...state, calm: false } : state;
      case 'start':
        // Motion is allowed and the console is in view: begin from the first step.
        return move(state, { calm: false, decision: null, idx: 0, playing: true, live: '' });
      case 'reset':
        return move(state, { decision: null, idx: 0, playing: !state.calm && !clickDriven, live: '' });
      case 'goTo': {
        const idx = Math.max(0, Math.min(last, action.index));
        const waiting = idx === decisionIndex && state.decision === null;
        return move(state, {
          idx,
          playing: action.user ? false : state.playing,
          live: waiting ? announce.waiting : say(announce.step, idx, steps[idx], steps.length),
        });
      }
      case 'advance': {
        const waiting = state.idx === decisionIndex && state.decision === null;
        if (waiting || state.idx >= last) return state;
        const idx = state.idx + 1;
        const live = idx === decisionIndex && state.decision === null ? announce.waiting : say(announce.step, idx, steps[idx], steps.length);
        return move(state, { idx, live });
      }
      case 'openAgent': {
        // A role card opens only for an agent the open step actually has.
        const agents = steps[state.idx].agents ?? [];
        if (!Number.isInteger(action.index) || action.index < 0 || action.index >= agents.length) return state;
        const agent = agents[action.index];
        return {
          ...state,
          agent: action.index,
          live: (announce.agent ?? '').replace('{name}', agent.name).replace('{kind}', agent.kind),
        };
      }
      case 'back':
        return state.agent === null ? state : { ...state, agent: null };
      case 'screen':
        // Whether the console is on screen; it does not count as a move.
        return state.onScreen === action.visible ? state : { ...state, onScreen: action.visible };
      case 'togglePlay':
        return state.calm ? state : { ...state, playing: !state.playing };
      case 'decide':
        if (state.decision !== null || state.idx !== decisionIndex) return state;
        return move(state, {
          decision: action.kind,
          playing: state.calm ? state.playing : true,
          live: announce.decision.replace('{kind}', action.kind),
        });
      default:
        return state;
    }
  };
}

/**
 * Step state, autoplay, reduced motion and the keyboard rail for a walkthrough console. It owns no
 * markup: the component places the refs it returns. Server rendering and the first client render
 * show the first step at rest; nothing reads the browser until an effect runs, so the markup
 * matches on hydration. The run starts by itself once the console is on screen, stops at the
 * decision until a decision is recorded, and never starts for a visitor who asked for less motion.
 * A block with `autoplay: false` has no clock: it never starts by itself and moves only when the
 * visitor chooses a step, and a step with `agents` can open one role card at a time (closed by
 * Back, by Escape on the console, or by any move to another step).
 */
export default function useWalkthrough(block) {
  const { steps } = block;
  const last = steps.length - 1;
  const decisionIndex = steps.findIndex((step) => step.id === DECISION_STEP);
  const reducer = useMemo(() => createReducer(block), [block]);
  const clickDriven = block.autoplay === false;
  const [state, dispatch] = useReducer(reducer, { idx: 0, agent: null, decision: null, playing: false, calm: false, runId: 0, live: '', onScreen: false });
  const [tabHidden, setTabHidden] = useState(false);
  const [held, setHeld] = useState(false);

  const { idx, agent, decision, playing, calm, runId, onScreen } = state;
  const waiting = idx === decisionIndex && decision === null;
  const ended = idx === last;
  const dwells = useMemo(() => steps.map(dwellMilliseconds), [steps]);

  const consoleRef = useRef(null);
  const stageRef = useRef(null);
  const railRef = useRef(null);
  const readoutRef = useRef(null);
  const againRef = useRef(null);
  const tabRefs = useRef([]);
  const trackRefs = useRef([]);
  const clockRef = useRef(null);
  const startedRef = useRef(false);
  const focusRef = useRef(null);

  // Reads the motion setting, the console's place on the page and the tab's visibility after
  // mount, and starts the run the first time the console is on screen.
  useEffect(() => {
    const query = typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_MOTION_QUERY) : null;
    const reduced = prefersReducedMotion();
    if (reduced) dispatch({ type: 'calm' });

    const onQueryChange = () => {
      if (prefersReducedMotion()) {
        dispatch({ type: 'calm' });
      } else if (clickDriven) {
        dispatch({ type: 'motion' });
      } else {
        startedRef.current = true;
        dispatch({ type: 'start' });
      }
    };
    query?.addEventListener?.('change', onQueryChange);

    let observer = null;
    if (typeof window.IntersectionObserver === 'function') {
      if (consoleRef.current) {
        observer = new window.IntersectionObserver(
          (entries) => {
            const entry = entries[entries.length - 1];
            const visible = entry.isIntersecting && entry.intersectionRatio >= VISIBLE_SHARE;
            dispatch({ type: 'screen', visible });
            if (!clickDriven && visible && !startedRef.current && !prefersReducedMotion()) {
              startedRef.current = true;
              dispatch({ type: 'start' });
            }
          },
          { threshold: [0, VISIBLE_SHARE, 1] },
        );
        observer.observe(consoleRef.current);
      }
    } else if (!reduced) {
      // No way to tell where the console is, so treat it as on screen and, unless the block waits
      // for the visitor, start now.
      dispatch({ type: 'screen', visible: true });
      if (!clickDriven) {
        startedRef.current = true;
        dispatch({ type: 'start' });
      }
    }

    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      query?.removeEventListener?.('change', onQueryChange);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [clickDriven]);

  // Runs the step clock: a timer drawn on the step's rail track that moves the run on when it
  // fills. It pauses when the visitor pauses, reads, scrolls away or leaves the tab, and it never
  // runs at the decision, on the last step or in the calm version.
  useEffect(() => {
    const go = !clickDriven && !calm && playing && onScreen && !held && !tabHidden && !ended && !waiting;
    const clock = clockRef.current;
    if (clock && (clock.idx !== idx || clock.runId !== runId)) {
      clock.animation.cancel();
      clockRef.current = null;
    }
    if (!go) {
      clockRef.current?.animation.pause();
      return;
    }
    if (!clockRef.current) {
      const fill = trackRefs.current[idx];
      if (!fill || typeof fill.animate !== 'function') return;
      const animation = fill.animate(FILL_FRAMES, { duration: dwells[idx], easing: 'linear' });
      animation.onfinish = () => {
        clockRef.current = null;
        dispatch({ type: 'advance' });
      };
      clockRef.current = { idx, runId, animation };
    } else {
      clockRef.current.animation.play();
    }
  }, [idx, runId, playing, calm, onScreen, held, tabHidden, ended, waiting, decision, dwells, clickDriven]);

  // Stops any running clock when the console leaves the page.
  useEffect(
    () => () => {
      clockRef.current?.animation.cancel();
      clockRef.current = null;
    },
    [],
  );

  // Moves focus off a control that has just been hidden or disabled, so the keyboard is not lost.
  useEffect(() => {
    const active = document.activeElement;
    if (active && consoleRef.current?.contains(active) && (active.hidden || active.disabled)) {
      (againRef.current && !againRef.current.hidden ? againRef.current : tabRefs.current[idx])?.focus({ preventScroll: true });
    }
  });

  // Moves focus to where an agent card's open or close sent it: the card's Back button when it
  // opens, the role button that opened it when it closes.
  useEffect(() => {
    const want = focusRef.current;
    focusRef.current = null;
    if (!want || !consoleRef.current) return;
    const selector =
      want.kind === 'back'
        ? '.wt-ro-agent[data-current] .wt-back'
        : `.wt-ro-step[data-current] .wt-role[data-agent="${want.agent}"]`;
    consoleRef.current.querySelector(selector)?.focus({ preventScroll: true });
  });

  // A step the visitor picks by hand counts as the start, so the first time the console scrolls into
  // view the run does not start over from step one.
  const goTo = useCallback((index) => {
    startedRef.current = true;
    dispatch({ type: 'goTo', index, user: true });
  }, []);
  const next = useCallback(() => {
    startedRef.current = true;
    dispatch({ type: 'goTo', index: idx + 1, user: true });
  }, [idx]);
  const previous = useCallback(() => {
    startedRef.current = true;
    dispatch({ type: 'goTo', index: idx - 1, user: true });
  }, [idx]);
  const openAgent = useCallback(
    (index) => {
      if (!steps[idx].agents?.[index]) return;
      focusRef.current = { kind: 'back' };
      dispatch({ type: 'openAgent', index });
    },
    [steps, idx],
  );
  const back = useCallback(() => {
    if (agent === null) return;
    focusRef.current = { kind: 'role', agent };
    dispatch({ type: 'back' });
  }, [agent]);
  // Escape on the console closes an open agent card; with none open it does nothing.
  const onConsoleKeyDown = useCallback(
    (event) => {
      if (event.key !== 'Escape' || agent === null) return;
      event.preventDefault();
      back();
    },
    [agent, back],
  );
  const togglePlay = useCallback(() => dispatch({ type: 'togglePlay' }), []);
  const replay = useCallback(() => dispatch({ type: 'reset' }), []);
  const decide = useCallback((kind) => {
    dispatch({ type: 'decide', kind });
    stageRef.current?.focus({ preventScroll: true });
  }, []);

  // Moves focus along the rail with the arrow keys, Home and End, and opens the step it lands on.
  const onRailKeyDown = useCallback(
    (event) => {
      const at = tabRefs.current.indexOf(document.activeElement);
      if (at < 0) return;
      const target = railTarget(event.key, at, last);
      if (target === undefined) return;
      event.preventDefault();
      startedRef.current = true;
      dispatch({ type: 'goTo', index: target, user: true });
      tabRefs.current[target]?.focus({ preventScroll: true });
    },
    [last],
  );

  // Reading holds the clock: keyboard focus on the rail or readout, or the pointer over the readout.
  const isReading = (element) => Boolean(element) && (readoutRef.current?.contains(element) || railRef.current?.contains(element));
  const onFocus = useCallback((event) => setHeld(isReading(event.target)), []);
  const onBlur = useCallback(() => {
    setTimeout(() => setHeld(isReading(document.activeElement) || Boolean(readoutRef.current?.matches(':hover'))), 0);
  }, []);
  const onReadoutEnter = useCallback(() => setHeld(true), []);
  const onReadoutLeave = useCallback(() => setHeld(isReading(document.activeElement)), []);

  const states = block.states;
  let phase = 'paused';
  let stateText = states.paused;
  if (playing && !calm) {
    phase = 'play';
    stateText = onScreen ? (held ? states.reading : states.playing) : states.offscreen;
  }
  if (waiting) {
    phase = 'wait';
    stateText = states.waiting;
  }
  if (ended) {
    phase = 'done';
    stateText = states.done;
  }
  if (clickDriven) {
    // Nothing plays by itself, so the status says which step is open. The step the block names
    // for the warm glow (where a person decides) shows the waiting mark.
    phase = steps[idx].id === block.glowStep ? 'wait' : 'still';
    stateText = say(states.still, idx, steps[idx], steps.length);
  }

  return {
    idx,
    step: steps[idx],
    agent,
    clickDriven,
    // Whether the figure may run its own motion: the console is on screen, the tab is showing and
    // the visitor has not asked for less.
    figureLive: onScreen && !tabHidden && !calm,
    decision,
    playing,
    calm,
    runId,
    live: state.live,
    waiting,
    ended,
    phase,
    stateText,
    refs: { consoleRef, stageRef, railRef, readoutRef, againRef, tabRefs, trackRefs },
    actions: { goTo, next, previous, openAgent, back, onConsoleKeyDown, togglePlay, replay, decide, onRailKeyDown, onFocus, onBlur, onReadoutEnter, onReadoutLeave },
  };
}

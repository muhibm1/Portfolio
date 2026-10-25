import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from '../prefersReducedMotion';

// How long each step holds before the replay moves on, in seconds. The approval has none: the
// replay stops there until the visitor presses Approve or Reject, and the last step ends it.
// Written as plain numbers because the copy scan reads this file.
const DWELL_SECONDS = {
  ask: 4.2,
  reach: 6.3,
  rule: 5.25,
  history: 5.775,
  verdict: 7.35,
};

// Seconds before the first log line of a step shows, and between its lines, as unitless numbers
// the stylesheet multiplies by one second.
const LOG_FIRST_DELAY = 0.735;
const LOG_LINE_GAP = 0.63;

const APPROVAL = 'approval';
const FILL_FRAMES = [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }];

/**
 * The Fathom case study's replay of one recorded check: an agent asks to delete a column, Fathom
 * finds what it reaches, the rule it breaks and the incident it caused before, gives a verdict,
 * and stops until the visitor approves or rejects. Approve and Reject lead to different last
 * steps. It shares the AgentOps replay's frame and rp- styles, so the two read as a pair. Every
 * word and value comes from the `replay` record (portfolioData.fathomReplay). Server rendering and
 * the first client render show it at rest on the approval, so the markup matches on hydration.
 */
export default function FathomReplay({ replay }) {
  const ids = useMemo(() => replay.steps.map((step) => step.id), [replay]);
  const approvalIndex = ids.indexOf(APPROVAL);
  const lastIndex = ids.length - 1;

  const reducer = useMemo(() => createReducer(replay), [replay]);
  const [state, dispatch] = useReducer(reducer, {
    idx: approvalIndex,
    decision: null,
    playing: false,
    calm: false,
    runId: 0,
    fresh: null,
    live: '',
  });
  const [onScreen, setOnScreen] = useState(true);
  const [tabHidden, setTabHidden] = useState(false);

  const { idx, decision, playing, calm, runId, fresh } = state;
  const waiting = decision === null && idx === approvalIndex;
  const ended = idx === lastIndex;

  const consoleRef = useRef(null);
  const stageRef = useRef(null);
  const logRef = useRef(null);
  const trackRefs = useRef([]);
  const tabRefs = useRef([]);
  const approveRef = useRef(null);
  const againRef = useRef(null);
  const clockRef = useRef(null);
  const startedRef = useRef(false);
  const focusDecisionRef = useRef(false);

  // Reads the visitor's motion setting after mount, and starts the replay once the console is on
  // screen; with reduced motion it stays at rest on the approval and never starts.
  useEffect(() => {
    const query = typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_MOTION_QUERY) : null;
    const reduced = prefersReducedMotion();
    if (reduced) dispatch({ type: 'calm' });

    const onQueryChange = () => {
      if (prefersReducedMotion()) {
        dispatch({ type: 'calm' });
      } else {
        startedRef.current = true;
        dispatch({ type: 'start' });
      }
    };
    query?.addEventListener?.('change', onQueryChange);

    let observer = null;
    if (!reduced && typeof window.IntersectionObserver === 'function' && consoleRef.current) {
      observer = new window.IntersectionObserver(
        (entries) => {
          const visible = entries[0].isIntersecting;
          setOnScreen(visible);
          if (visible && !startedRef.current && !prefersReducedMotion()) {
            startedRef.current = true;
            dispatch({ type: 'start' });
          }
        },
        { threshold: 0.25 },
      );
      observer.observe(consoleRef.current);
    } else if (!reduced) {
      startedRef.current = true;
      dispatch({ type: 'start' });
    }

    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      query?.removeEventListener?.('change', onQueryChange);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Runs the step clock: a timer drawn on the step's rail track that advances the replay when it
  // fills. It pauses when the visitor pauses, scrolls away or leaves the tab, and it never runs at
  // the approval, on the last step, or in the calm version.
  useEffect(() => {
    const dwell = DWELL_SECONDS[ids[idx]];
    const go = !calm && playing && onScreen && !tabHidden && Boolean(dwell) && !ended && !waiting;
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
      const animation = fill.animate(FILL_FRAMES, { duration: dwell * 1000, easing: 'linear' });
      animation.onfinish = () => {
        clockRef.current = null;
        dispatch({ type: 'advance' });
      };
      clockRef.current = { idx, runId, animation };
    } else {
      clockRef.current.animation.play();
    }
  }, [idx, runId, playing, calm, onScreen, tabHidden, ended, waiting, ids]);

  // Stops any running clock when the console leaves the page.
  useEffect(
    () => () => {
      clockRef.current?.animation.cancel();
      clockRef.current = null;
    },
    [],
  );

  // Keeps the newest log line in view.
  useEffect(() => {
    const box = logRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [idx, decision, runId]);

  // Moves focus where the visitor can keep going: to Approve after "Jump to the decision", and
  // off a control that has just been hidden.
  useEffect(() => {
    if (focusDecisionRef.current) {
      focusDecisionRef.current = false;
      approveRef.current?.focus({ preventScroll: false });
      return;
    }
    const active = document.activeElement;
    if (active && consoleRef.current?.contains(active) && (active.hidden || active.disabled)) {
      (againRef.current && !againRef.current.hidden ? againRef.current : stageRef.current)?.focus({ preventScroll: true });
    }
  });

  const mood = idx < approvalIndex ? 'work' : waiting ? 'wait' : decision === 'reject' ? 'grey' : 'cool2';
  const phase = waiting ? 'wait' : decision === 'reject' ? 'rejected' : ended ? 'done' : 'work';
  const stateText = waiting
    ? replay.states.waiting
    : ended
      ? decision === 'reject'
        ? replay.states.rejected
        : replay.states.approved
      : replay.states.checking;
  const lines = logLines({ replay, ids, idx, decision });

  // Moves focus along the rail with the arrow keys, Home and End, stopping at both ends.
  const onRailKeyDown = (event) => {
    const at = tabRefs.current.indexOf(document.activeElement);
    if (at < 0) return;
    const target = { ArrowRight: at + 1, ArrowDown: at + 1, ArrowLeft: at - 1, ArrowUp: at - 1, Home: 0, End: approvalIndex }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    tabRefs.current[Math.max(0, Math.min(decision ? lastIndex : approvalIndex, target))]?.focus();
  };

  const decide = (kind) => {
    dispatch({ type: 'decide', kind });
    stageRef.current?.focus({ preventScroll: true });
  };

  const { panes } = replay;
  return (
    <div
      ref={consoleRef}
      className="rp-console"
      role="region"
      aria-label={replay.regionLabel}
      data-mood={mood}
      data-phase={phase}
      data-open={waiting ? 'yes' : 'no'}
    >
      <div className="rp-chrome">
        <span className="rp-sdot" aria-hidden="true" />
        <p className="rp-ttl">
          <b>{replay.name}</b> <span className="rp-muted">{stateText}</span>
        </p>
        <p className="rp-note">{replay.note}</p>
        <a className="rp-skip" href={replay.skip.href}>
          {replay.skip.text}
        </a>
      </div>

      <div className="rp-railbox">
        <ol className="rp-rail fx-rail" aria-label={replay.stepsLabel} onKeyDown={onRailKeyDown}>
          {replay.steps.map((step, i) => (
            <li key={step.id}>
              <button
                type="button"
                className="rp-tab"
                data-go={step.id}
                data-state={i < idx || (ended && i === idx) ? 'done' : i === idx ? 'current' : 'todo'}
                aria-current={i === idx ? 'step' : undefined}
                disabled={i > approvalIndex && decision === null}
                ref={(node) => {
                  tabRefs.current[i] = node;
                }}
                onClick={() => dispatch({ type: 'goTo', index: i })}
              >
                <span className="rp-tab-l">{step.label}</span>
                <span className="rp-track" aria-hidden="true">
                  <i
                    ref={(node) => {
                      trackRefs.current[i] = node;
                    }}
                  />
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="rp-now rp-mono" aria-hidden="true">
          {idx + 1} of {ids.length} · {replay.steps[idx].label}
        </p>
      </div>

      <div className="rp-body">
        <div className="rp-stage" ref={stageRef} tabIndex={-1} aria-label={replay.stageLabel} data-mood={mood}>
          <div className="rp-glow" aria-hidden="true">
            <i className="rp-b1" />
            <i className="rp-b2" />
            <i className="rp-b3" />
          </div>

          <Pane id="ask" label={replay.steps[0].label} on={ids[idx] === 'ask'}>
            <p className="rp-pk rp-in" style={order(0)}>
              {replay.steps[0].label} <span className="rp-muted">{panes.ask.note}</span>
            </p>
            <p className="rp-action rp-mono fx-request rp-in" style={order(1)}>
              {panes.ask.request}
            </p>
            <p className="rp-cause rp-in" style={order(2)}>
              {panes.ask.text}
            </p>
            <p className="rp-foot rp-mono rp-in" style={order(3)}>
              {panes.ask.foot}
            </p>
          </Pane>

          <Pane id="reach" label={replay.steps[1].label} on={ids[idx] === 'reach'}>
            <p className="rp-pk rp-in" style={order(0)}>
              {replay.steps[1].label} <span className="rp-muted">{panes.reach.note}</span>
            </p>
            <div className="fx-graph">
              <p className="fx-node fx-source rp-in" style={order(1)}>
                <span className="rp-mono">{panes.reach.source.name}</span>
                <span className="rp-muted rp-small">{panes.reach.source.detail}</span>
              </p>
              <ul className="fx-targets">
                {panes.reach.nodes.map((node, i) => (
                  <li key={node.name} className={`fx-node rp-in${node.hit ? ' fx-hit' : ' fx-dim'}`} style={order(2 + i)}>
                    <span className="rp-mono">{node.name}</span>
                    <span className="rp-muted rp-small">{node.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="rp-cause rp-in" style={order(5)}>
              {panes.reach.text}
            </p>
          </Pane>

          <Pane id="rule" label={replay.steps[2].label} on={ids[idx] === 'rule'}>
            <p className="rp-pk rp-in" style={order(0)}>
              {replay.steps[2].label} <span className="rp-muted">{panes.rule.note}</span>
            </p>
            <div className="fx-rule rp-in" style={order(1)}>
              <p className="rp-mono rp-small">{panes.rule.id}</p>
              <p className="rp-cause">{panes.rule.text}</p>
            </div>
            <p className="rp-foot rp-in" style={order(2)}>
              {panes.rule.foot}
            </p>
          </Pane>

          <Pane id="history" label={replay.steps[3].label} on={ids[idx] === 'history'}>
            <p className="rp-pk rp-in" style={order(0)}>
              {replay.steps[3].label} <span className="rp-muted">{panes.history.note}</span>
            </p>
            <div className="fx-incident rp-in" style={order(1)}>
              <p className="rp-mono rp-muted rp-small">{panes.history.stamp}</p>
              <p className="rp-cause">{panes.history.text}</p>
            </div>
            <p className="rp-cites rp-in" style={order(2)}>
              {panes.history.tags.map((tag) => (
                <span key={tag} className="rp-chip rp-mono">
                  {tag}
                </span>
              ))}
            </p>
          </Pane>

          <Pane id="verdict" label={replay.steps[4].label} on={ids[idx] === 'verdict'}>
            <p className="rp-pk rp-in" style={order(0)}>
              {replay.steps[4].label} <span className="rp-muted">{panes.verdict.note}</span>
            </p>
            <p className="fx-verdict rp-in" style={order(1)}>
              <span className="fx-level rp-mono">{panes.verdict.level}</span>
              <span className="rp-mono">{panes.verdict.risk}</span>
            </p>
            <div className="rp-hyps fx-factors">
              {panes.verdict.factors.map((factor, i) => (
                <div key={factor.label} className="rp-hyp rp-in rp-grow" style={{ '--i': 2 + i }}>
                  <div className="rp-hyp-row">
                    <span>{factor.label}</span>
                    <span className="rp-mono rp-hyp-v">+{factor.points}</span>
                  </div>
                  <div className="rp-hyp-track">
                    <i style={{ '--s': factor.points / panes.verdict.scale }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="rp-foot rp-mono rp-in" style={order(8)}>
              {panes.verdict.foot}
            </p>
          </Pane>

          <Pane id="approval" label={replay.steps[5].label} on={ids[idx] === APPROVAL} className="rp-pane-decide">
            <div className="rp-decide rp-in" style={order(2)} role="group" aria-labelledby="fathom-decide-title">
              <p className="rp-kick">
                <span className="rp-pdot" aria-hidden="true" style={decision ? { background: 'var(--grey)' } : undefined} />
                {decision ? panes.approval.kickDecided : panes.approval.kick}
              </p>
              <p className="rp-action rp-mono" id="fathom-decide-title">
                {panes.approval.action}
              </p>
              <p className="rp-pending">{panes.approval.text}</p>
              <div className="rp-btns">
                <button type="button" ref={approveRef} className="rp-pill rp-pill-dark" disabled={decision !== null} onClick={() => decide('approve')}>
                  {replay.controls.approve}
                </button>
                <button type="button" className="rp-pill rp-pill-line" disabled={decision !== null} onClick={() => decide('reject')}>
                  {replay.controls.reject}
                </button>
              </div>
            </div>
          </Pane>

          <Pane id="after" label={replay.steps[6].label} on={ended && decision !== 'reject'}>
            <p className="rp-pk rp-in" style={order(0)}>
              {panes.approved.title} <span className="rp-status-chip rp-mono">{panes.approved.status}</span>
            </p>
            <p className="rp-cause rp-in" style={order(1)}>
              {panes.approved.text}
            </p>
            <p className="rp-cites rp-in" style={order(2)}>
              <span className="rp-muted">{panes.approved.outcomesLabel}</span>{' '}
              {panes.approved.outcomes.map((outcome) => (
                <span key={outcome} className="rp-chip rp-mono">
                  {outcome}
                </span>
              ))}
            </p>
            <p className="rp-foot rp-in" style={order(3)}>
              {panes.approved.foot}
            </p>
          </Pane>

          <Pane id="after-reject" label={replay.steps[6].label} on={ended && decision === 'reject'}>
            <p className="rp-pk rp-in" style={order(0)}>
              {panes.rejected.title} <span className="rp-muted">{panes.rejected.note}</span>
            </p>
            <p className="rp-action rp-mono fx-request rp-in" style={order(1)}>
              {panes.rejected.request}
            </p>
            <p className="fx-verdict fx-safe rp-in" style={order(2)}>
              <span className="fx-level rp-mono">{panes.rejected.level}</span>
              <span className="rp-mono">{panes.rejected.risk}</span>
            </p>
            <p className="rp-cause rp-in" style={order(3)}>
              {panes.rejected.text}
            </p>
          </Pane>
        </div>

        <div className="rp-log" ref={logRef} role="region" aria-label={replay.logLabel} tabIndex={0}>
          <p className="rp-log-h rp-mono">{replay.logHeading}</p>
          <ol className="rp-lines">
            {lines.map((line) => {
              const animating = !calm && line.step === fresh;
              return (
                <li
                  key={animating ? `${line.key}-${runId}` : line.key}
                  className={animating ? 'rp-ll rp-new' : 'rp-ll'}
                  style={animating ? { '--ld': LOG_FIRST_DELAY + line.position * LOG_LINE_GAP } : undefined}
                >
                  <span className="rp-ll-k">
                    <b>{line.label}</b>
                  </span>
                  <span className="rp-ll-v">{line.value}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="rp-controls">
        <button type="button" className="rp-ctl" hidden={calm || ended || waiting} onClick={() => dispatch({ type: 'togglePlay' })}>
          {playing ? replay.controls.pause : replay.controls.play}
        </button>
        <button type="button" className="rp-ctl" hidden={ended || waiting} onClick={() => dispatch({ type: 'advance' })}>
          {replay.controls.next}
        </button>
        <button
          type="button"
          className="rp-ctl"
          hidden={decision !== null || waiting}
          onClick={() => {
            focusDecisionRef.current = true;
            dispatch({ type: 'goTo', index: approvalIndex });
          }}
        >
          {replay.controls.jump}
        </button>
        <p className="rp-hint" hidden={!waiting}>
          {replay.controls.hintWaiting}
        </p>
        <button type="button" className="rp-ctl" hidden={!ended} onClick={() => dispatch({ type: 'other' })}>
          {replay.controls.other}
        </button>
        <button
          type="button"
          ref={againRef}
          className={`rp-ctl rp-again${ended ? ' rp-primary' : ''}`}
          hidden={!(ended || calm)}
          onClick={() => dispatch({ type: 'reset' })}
        >
          {replay.controls.replay}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {state.live}
      </p>
    </div>
  );
}

// Builds the reducer for one replay record. Every state change the visitor or the clock can cause
// is here; steps after the approval open only once a decision is recorded. `fresh` names the step
// whose log lines should animate in (none in the calm version).
function createReducer(replay) {
  const ids = replay.steps.map((step) => step.id);
  const approvalIndex = ids.indexOf(APPROVAL);
  const lastIndex = ids.length - 1;
  const { announce } = replay;
  const say = (i) => announce.step.replace('{n}', String(i + 1)).replace('{label}', replay.steps[i].label);
  const ending = (kind) => (kind === 'reject' ? announce.rejected : announce.approved);

  // Applies a change and counts it as a new run, so animations that key on the run restart.
  const move = (state, patch) => ({ ...state, ...patch, runId: state.runId + 1 });

  return function reducer(state, action) {
    switch (action.type) {
      case 'calm':
        // The visitor asks for less motion: rest on the approval and play nothing.
        return move(state, { calm: true, decision: null, idx: approvalIndex, playing: false, fresh: null, live: '' });
      case 'start':
        return move(state, { calm: false, decision: null, idx: 0, playing: true, fresh: ids[0], live: '' });
      case 'reset':
        return state.calm
          ? move(state, { decision: null, idx: approvalIndex, playing: false, fresh: null, live: '' })
          : move(state, { decision: null, idx: 0, playing: true, fresh: ids[0], live: '' });
      case 'goTo': {
        if (action.index > approvalIndex && state.decision === null) return state;
        const decision = action.index <= approvalIndex ? null : state.decision;
        const live = decision === null && action.index === approvalIndex ? announce.waiting : say(action.index);
        return move(state, { decision, idx: action.index, playing: state.calm ? state.playing : true, fresh: state.calm ? null : ids[action.index], live });
      }
      case 'advance': {
        if ((state.decision === null && state.idx === approvalIndex) || state.idx >= lastIndex) return state;
        const idx = state.idx + 1;
        const live = idx === approvalIndex ? announce.waiting : say(idx);
        return move(state, { idx, live, fresh: state.calm ? null : ids[idx] });
      }
      case 'togglePlay':
        return { ...state, playing: !state.playing };
      case 'decide':
        if (state.decision !== null) return state;
        return move(state, { decision: action.kind, idx: lastIndex, fresh: state.calm ? null : ids[lastIndex], live: ending(action.kind) });
      case 'other': {
        // On the last step: show the ending the visitor did not pick.
        const kind = state.decision === 'reject' ? 'approve' : 'reject';
        return move(state, { decision: kind, idx: lastIndex, fresh: state.calm ? null : ids[lastIndex], live: ending(kind) });
      }
      default:
        return state;
    }
  };
}

// The log as it reads at this point: every step up to the open one, and on the last step the lines
// for the ending the visitor chose.
function logLines({ replay, ids, idx, decision }) {
  const result = [];
  const add = (step, entries) =>
    entries.forEach((entry, position) => result.push({ key: `${step}-${position}`, step, position, label: entry.key, value: entry.value }));
  for (let k = 0; k <= idx; k += 1) {
    const id = ids[k];
    if (k === ids.length - 1) add(id, decision === 'reject' ? replay.log.rejected : replay.log.approved);
    else add(id, replay.log[id]);
  }
  return result;
}

// One pane's frame: the pane is always in the markup, and is visible when `on`.
function Pane({ id, label, on, className = '', children }) {
  return (
    <div className={`rp-pane${on ? ' rp-on' : ''}${className ? ` ${className}` : ''}`} data-pane={id} role="group" aria-label={label}>
      {children}
    </div>
  );
}

// Sets the entrance order of an element: its position in the pane's reveal.
const order = (i) => ({ '--i': i });

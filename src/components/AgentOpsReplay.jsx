import { Fragment, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from '../prefersReducedMotion';

// How long each step holds before the run moves on, in seconds. The approval has none: the run
// stops there until the visitor presses Approve or Reject. Written as plain numbers because the
// copy scan reads this file.
const DWELL_SECONDS = {
  alert: 4.2,
  triage: 4.725,
  evidence: 6.825,
  merge: 3.675,
  rca: 7.35,
  execute: 4.725,
  verify: 5.25,
};

// Seconds before the first agent-log line of a step shows, and between its lines, as unitless
// numbers the stylesheet multiplies by one second.
const LOG_FIRST_DELAY = 0.945;
const LOG_LINE_GAP = 0.84;

// How long each evidence reader takes to fill, unitless, read by look.css.
const READER_FILL = { logs: 1.4, metrics: 2.1, deploys: 1.7 };

const APPROVAL = 'approval';
const FILL_FRAMES = [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }];

/**
 * The home page's replay of a recorded AgentOps run: nine steps, an agent log, a pause at the
 * approval that only the visitor's press ends, and a calm version with no motion. Every word and
 * value comes from the `replay` record (portfolioData.homeReplay). Server rendering and the first
 * client render show the run at rest on the approval; nothing reads the browser until an effect
 * runs, so the markup matches on hydration.
 */
export default function AgentOpsReplay({ replay }) {
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
  const previewing = decision === null && idx > approvalIndex;
  const ended = decision === 'reject' || idx === lastIndex;
  const waiting = decision === null && idx === approvalIndex;

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

  // Reads the visitor's motion setting after mount, and starts the run once the console is on
  // screen; with reduced motion it stays at rest on the approval and never starts.
  useEffect(() => {
    const query = typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_MOTION_QUERY) : null;
    const reduced = prefersReducedMotion();
    if (reduced) dispatch({ type: 'calm', calm: true });

    const onQueryChange = () => {
      if (prefersReducedMotion()) {
        dispatch({ type: 'calm', calm: true });
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

  // Runs the step clock: a timer drawn on the step's rail track that advances the run when it
  // fills. It pauses when the visitor pauses, scrolls away or leaves the tab, and it never runs
  // at the approval, past an ending, or in the calm version.
  useEffect(() => {
    const step = ids[idx];
    const dwell = DWELL_SECONDS[step];
    const go = !calm && playing && onScreen && !tabHidden && Boolean(dwell) && !ended && idx !== approvalIndex;
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
  }, [idx, runId, playing, calm, onScreen, tabHidden, decision, ended, ids, approvalIndex]);

  // Stops any running clock when the console leaves the page.
  useEffect(
    () => () => {
      clockRef.current?.animation.cancel();
      clockRef.current = null;
    },
    [],
  );

  // Keeps the newest agent-log line in view.
  useEffect(() => {
    const box = logRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [idx, decision, runId]);

  // Moves focus where the visitor can keep going: to Approve after "Jump to the decision", and
  // off a control that has just been hidden or disabled.
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

  const showPane = decision === 'reject' && idx === approvalIndex ? 'rejected' : ids[idx];
  const mood = moodFor({ idx, approvalIndex, lastIndex, waiting, decision });
  const phase = phaseFor({ waiting, previewing, idx, lastIndex, decision });
  const stateText = stateLabelFor(replay.states, { waiting, previewing, decision, idx, lastIndex });
  const stepLabel = replay.steps[idx].label;
  const nowLabel = showPane === 'rejected' ? replay.rejected.kick : stepLabel + (previewing ? `, ${replay.states.preview.toLowerCase()}` : '');

  const lines = logLines({ replay, ids, idx, decision, approvalIndex });

  // Moves focus along the rail with the arrow keys, Home and End, stopping at both ends.
  const onRailKeyDown = (event) => {
    const at = tabRefs.current.indexOf(document.activeElement);
    if (at < 0) return;
    const target = { ArrowRight: at + 1, ArrowDown: at + 1, ArrowLeft: at - 1, ArrowUp: at - 1, Home: 0, End: lastIndex }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    tabRefs.current[Math.max(0, Math.min(lastIndex, target))]?.focus();
  };

  const decide = (kind) => {
    dispatch({ type: 'decide', kind });
    stageRef.current?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={consoleRef}
      className="rp-console"
      role="region"
      aria-label={replay.regionLabel}
      data-mood={mood}
      data-phase={phase}
      data-open={decision === null && idx >= approvalIndex ? 'yes' : 'no'}
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
        <ol className="rp-rail" aria-label={replay.stepsLabel} onKeyDown={onRailKeyDown}>
          {replay.steps.map((step, i) => (
            <li key={step.id}>
              <button
                type="button"
                className="rp-tab"
                data-go={step.id}
                data-state={tabState({ i, idx, decision, approvalIndex, previewing, ended })}
                aria-current={i === idx ? 'step' : undefined}
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
          {idx + 1} of {ids.length} · {nowLabel}
        </p>
      </div>

      <div className="rp-body">
        <div className="rp-stage" ref={stageRef} tabIndex={-1} aria-label={replay.stageLabel} data-mood={mood}>
          <div className="rp-glow" aria-hidden="true">
            <i className="rp-b1" />
            <i className="rp-b2" />
            <i className="rp-b3" />
          </div>
          <AlertPane replay={replay} on={showPane === 'alert'} label={replay.steps[0].label} />
          <TriagePane replay={replay} on={showPane === 'triage'} label={replay.steps[1].label} />
          <EvidencePane replay={replay} on={showPane === 'evidence'} label={replay.steps[2].label} />
          <MergePane replay={replay} on={showPane === 'merge'} label={replay.steps[3].label} />
          <RcaPane replay={replay} on={showPane === 'rca'} label={replay.steps[4].label} />
          <ApprovalPane
            replay={replay}
            on={showPane === 'approval'}
            label={replay.steps[5].label}
            decision={decision}
            approveRef={approveRef}
            onDecide={decide}
          />
          <ExecutePane replay={replay} on={showPane === 'execute'} label={replay.steps[6].label} />
          <VerifyPane replay={replay} on={showPane === 'verify'} label={replay.steps[7].label} />
          <PostmortemPane replay={replay} on={showPane === 'postmortem'} label={replay.steps[8].label} />
          <RejectedPane replay={replay} on={showPane === 'rejected'} />
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
                  data-src={line.type}
                  style={animating ? { '--ld': LOG_FIRST_DELAY + line.position * LOG_LINE_GAP } : undefined}
                >
                  <span className="rp-ll-k">
                    {replay.logPrefix[line.type]} <b>{line.label}</b>
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
          hidden={decision !== null || idx === approvalIndex}
          onClick={() => {
            focusDecisionRef.current = true;
            dispatch({ type: 'goTo', index: approvalIndex });
          }}
        >
          {idx > approvalIndex ? replay.controls.back : replay.controls.jump}
        </button>
        <p className="rp-hint" hidden={!(waiting || previewing)}>
          {previewing ? replay.controls.hintPreview : replay.controls.hintWaiting}
        </p>
        <button
          type="button"
          ref={againRef}
          className={`rp-ctl rp-again${ended && !previewing ? ' rp-primary' : ''}`}
          hidden={!(idx >= approvalIndex || calm)}
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

// Builds the reducer for one replay record. Every state change the visitor or the clock can
// cause is here; each guard keeps the step index inside the nine steps. `fresh` names the step
// whose agent-log lines should animate in (none in the calm version, after a rejection or at rest).
function createReducer(replay) {
  const ids = replay.steps.map((step) => step.id);
  const approvalIndex = ids.indexOf(APPROVAL);
  const lastIndex = ids.length - 1;
  const { announce } = replay;
  const say = (template, i) => template.replace('{n}', String(i + 1)).replace('{label}', replay.steps[i].label);

  // Applies a change and counts it as a new run, so animations that key on the run restart.
  const move = (state, patch) => ({ ...state, ...patch, runId: state.runId + 1 });

  return function reducer(state, action) {
    switch (action.type) {
      case 'calm':
        // The visitor asks for less motion: rest on the approval and play nothing.
        return move(state, { calm: true, decision: null, idx: approvalIndex, playing: false, fresh: null, live: '' });
      case 'start':
        // Motion is allowed and the console is in view: start over from the alert.
        return move(state, { calm: false, decision: null, idx: 0, playing: true, fresh: ids[0], live: '' });
      case 'reset':
        // Replay: from the alert while playing, or resting at the decision in the calm version.
        return state.calm
          ? move(state, { decision: null, idx: approvalIndex, playing: false, fresh: null, live: '' })
          : move(state, { decision: null, idx: 0, playing: true, fresh: ids[0], live: '' });
      case 'goTo': {
        const decision = action.index <= approvalIndex || state.decision === 'reject' ? null : state.decision;
        const isWaiting = decision === null && action.index === approvalIndex;
        const isPreview = decision === null && action.index > approvalIndex;
        const live = isWaiting ? announce.waiting : say(isPreview ? announce.stepPreview : announce.step, action.index);
        return move(state, {
          decision,
          idx: action.index,
          playing: state.calm ? state.playing : true,
          fresh: state.calm ? null : ids[action.index],
          live,
        });
      }
      case 'advance': {
        const isWaiting = state.decision === null && state.idx === approvalIndex;
        if (isWaiting || state.idx >= lastIndex) return state;
        const idx = state.idx + 1;
        let live = state.live;
        if (idx === approvalIndex) live = announce.waiting;
        if (idx === lastIndex) live = state.decision === null && idx > approvalIndex ? announce.endPreview : announce.resolved;
        return move(state, { idx, live, fresh: state.calm ? null : ids[idx] });
      }
      case 'togglePlay':
        return { ...state, playing: !state.playing };
      case 'decide': {
        if (state.decision !== null) return state;
        if (action.kind === 'reject') {
          return move(state, { decision: 'reject', idx: approvalIndex, fresh: null, live: announce.rejected });
        }
        if (state.calm) {
          return move(state, { decision: 'approve', idx: lastIndex, fresh: null, live: announce.approvedResolved });
        }
        return move(state, { decision: 'approve', idx: approvalIndex + 1, playing: true, fresh: ids[approvalIndex + 1], live: announce.approvedRunning });
      }
      default:
        return state;
    }
  };
}

// The state of one rail step: done, current, still to come, skipped after a rejection, or waiting.
function tabState({ i, idx, decision, approvalIndex, previewing, ended }) {
  let state = i < idx ? 'done' : i === idx ? 'current' : 'todo';
  if (decision === 'reject' && i > approvalIndex) state = 'skipped';
  if (ended && i === idx) state = 'done';
  if (previewing && i === approvalIndex) state = 'wait';
  return state;
}

// The glow behind the stage: bright while waiting, cooling after the approval, grey on reject.
function moodFor({ idx, approvalIndex, lastIndex, waiting, decision }) {
  if (idx < approvalIndex) return 'work';
  if (waiting) return 'wait';
  if (decision === 'reject') return 'grey';
  if (idx === approvalIndex + 1) return 'cool1';
  return idx === lastIndex ? 'cool3' : 'cool2';
}

// The console's phase, which look.css reads to draw the status dot.
function phaseFor({ waiting, previewing, idx, lastIndex, decision }) {
  if (decision === 'reject') return 'rejected';
  if (decision === 'approve') return idx === lastIndex ? 'done' : 'work';
  if (previewing) return idx === lastIndex ? 'previewed' : 'preview';
  return waiting ? 'wait' : 'work';
}

// The words beside the name in the console's title bar.
function stateLabelFor(states, { waiting, previewing, decision, idx, lastIndex }) {
  if (decision === 'reject') return states.rejected;
  if (decision === 'approve') return idx === lastIndex ? states.resolved : states.applying;
  if (previewing) return states.preview;
  return waiting ? states.waiting : states.investigating;
}

// The agent log as it reads at this point: every step up to the open one, a preview note once the
// visitor looks past an undecided approval, and the rejection line after Reject.
function logLines({ replay, ids, idx, decision, approvalIndex }) {
  const result = [];
  const add = (step, entries) =>
    entries.forEach((entry, position) =>
      result.push({ key: `${step}-${position}`, step, position, type: entry.type, label: entry.key, value: entry.value }),
    );
  for (let k = 0; k <= idx; k += 1) {
    if (k === approvalIndex + 1 && decision === null) add('preview', replay.log.preview);
    add(ids[k], replay.log[ids[k]]);
  }
  if (decision === 'reject') add('rejected', replay.log.rejected);
  return result;
}

// Turns metric points into a polyline's points string. x runs over the minutes from `from` to
// `to`; y runs so that the chart's top sits at the highest error rate the sample run reaches.
const CHART_WIDTH = 300;
const CHART_BASELINE = 92;
const CHART_RANGE = 77.5;
const CHART_PEAK = 0.12;
function sparkPoints(points, fromMinute, toMinute) {
  return points
    .map(({ at, value }) => {
      const x = ((minuteOf(at) - fromMinute) / (toMinute - fromMinute)) * CHART_WIDTH;
      const y = CHART_BASELINE - value * (CHART_RANGE / CHART_PEAK);
      return `${round(x)},${round(y)}`;
    })
    .join(' ');
}

function minuteOf(clock) {
  const [hours, minutes] = clock.split(':').map(Number);
  return hours * 60 + minutes;
}

function round(value) {
  return Math.round(value * 10) / 10;
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

function AlertPane({ replay, on, label }) {
  const { alert, metrics } = replay;
  const first = minuteOf(metrics.errorRate[0].at);
  const last = minuteOf(metrics.errorRate.at(-1).at);
  return (
    <Pane id="alert" label={label} on={on}>
      <p className="rp-pk rp-in" style={order(0)}>
        {label} <span className="rp-mono rp-muted">{alert.stamp}</span>
      </p>
      <p className="rp-svc rp-in" style={order(1)}>
        <span className="rp-mono">{alert.serviceLabel}</span> {alert.service}
      </p>
      <ul className="rp-symptoms">
        {alert.symptoms.map((symptom, i) => (
          <li key={symptom} className="rp-in" style={order(2 + i)}>
            {symptom}
          </li>
        ))}
      </ul>
      <div className="rp-alert-chart rp-in" style={order(4)}>
        <p className="rp-mono rp-metric-n">
          {alert.metric} <b>{alert.change}</b> <span className="rp-muted">{alert.rangeLabel}</span>
        </p>
        <svg className="rp-spark rp-fill" viewBox="0 0 300 100" preserveAspectRatio="none" role="img" aria-label={alert.chartLabel}>
          <polyline className="rp-draw" points={sparkPoints(metrics.errorRate, first, last)} />
        </svg>
      </div>
    </Pane>
  );
}

function Hypotheses({ items, update }) {
  return (
    <div className="rp-hyps">
      {items.map((item, i) => (
        <div key={item.name} className={`rp-hyp rp-in ${update ? 'rp-update' : 'rp-grow'}`} style={{ '--i': update ? 3 + i : 1 + i, '--from': item.from }}>
          <div className="rp-hyp-row">
            <span className="rp-mono">{item.name}</span>
            <span className="rp-mono rp-hyp-v">{item.score.toFixed(2)}</span>
          </div>
          <div className="rp-hyp-track">
            <i style={{ '--s': item.score }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TriagePane({ replay, on, label }) {
  const { triage } = replay;
  return (
    <Pane id="triage" label={label} on={on}>
      <p className="rp-pk rp-in" style={order(0)}>
        {label} <span className="rp-muted">{triage.note}</span>
      </p>
      <Hypotheses items={triage.hypotheses} />
      <p className="rp-foot rp-mono rp-in" style={order(3)}>
        {triage.next}
      </p>
    </Pane>
  );
}

function EvidencePane({ replay, on, label }) {
  const { evidence, metrics, alert } = replay;
  const first = minuteOf(metrics.errorRate[0].at);
  const last = minuteOf(metrics.errorRate.at(-1).at);
  return (
    <Pane id="evidence" label={label} on={on}>
      <p className="rp-pk rp-in" style={order(0)}>
        {label} <span className="rp-muted">{evidence.note}</span>
      </p>
      <div className="rp-readers">
        <div className="rp-reader rp-in" style={{ '--i': 1, '--d': READER_FILL.logs }}>
          <p className="rp-rh">
            <span className="rp-mono">{evidence.logs.label}</span>
            <span className="rp-rbar">
              <i />
            </span>
          </p>
          <ul className="rp-rlogs rp-found">
            {evidence.logs.lines.map((line) => (
              <li key={line.id} className={line.lift ? 'rp-lift' : ''}>
                <span className="rp-mono rp-muted">
                  {line.id} · {line.at} · {line.level}
                </span>
                <span className="rp-mono rp-msg">{line.message}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rp-reader rp-in" style={{ '--i': 2, '--d': READER_FILL.metrics }}>
          <p className="rp-rh">
            <span className="rp-mono">{evidence.metrics.label}</span>
            <span className="rp-rbar">
              <i />
            </span>
          </p>
          <div className="rp-found">
            <p className="rp-mono rp-metric-n">
              {alert.metric} <b>{evidence.metrics.change}</b>
            </p>
            <svg className="rp-spark" viewBox="0 0 300 100" preserveAspectRatio="none" role="img" aria-label={alert.chartLabel}>
              <polyline className="rp-draw" points={sparkPoints(metrics.errorRate, first, last)} />
            </svg>
            <p className="rp-mono rp-muted rp-small">
              {evidence.metrics.p99Label} {metrics.p99Before.from} → {metrics.p99Before.to}
            </p>
            <p className="rp-mono rp-muted rp-small">
              {metrics.poolUtilisation.name} {metrics.poolUtilisation.from} → {metrics.poolUtilisation.to}
            </p>
          </div>
        </div>
        <div className="rp-reader rp-in" style={{ '--i': 3, '--d': READER_FILL.deploys }}>
          <p className="rp-rh">
            <span className="rp-mono">{evidence.deploys.label}</span>
            <span className="rp-rbar">
              <i />
            </span>
          </p>
          <div className="rp-found">
            <p className="rp-mono rp-metric-n">
              {evidence.deploys.id} <b>{evidence.deploys.from} → {evidence.deploys.to}</b>
            </p>
            <p className="rp-mono rp-muted rp-small">
              {evidence.deploys.at} · {evidence.deploys.author}
            </p>
            <p className="rp-diff">{evidence.deploys.diff}</p>
          </div>
        </div>
      </div>
    </Pane>
  );
}

function MergePane({ replay, on, label }) {
  const { merge } = replay;
  return (
    <Pane id="merge" label={label} on={on}>
      <p className="rp-pk rp-in" style={order(0)}>
        {label}
      </p>
      <div className="rp-merge">
        <div className="rp-chips">
          {merge.chips.map((chip, i) => (
            <span key={chip} className={`rp-chip rp-c${i + 1} rp-mono`}>
              {chip}
            </span>
          ))}
        </div>
        <p className="rp-big rp-in" style={order(2)}>
          {merge.count}
        </p>
        <p className="rp-mono rp-muted rp-in" style={order(3)}>
          {merge.countLabel}
        </p>
      </div>
      <p className="rp-foot rp-mono rp-in" style={order(4)}>
        {merge.foot}
      </p>
    </Pane>
  );
}

function RcaPane({ replay, on, label }) {
  const { rca } = replay;
  return (
    <Pane id="rca" label={label} on={on}>
      <p className="rp-pk rp-in" style={order(0)}>
        {label}
      </p>
      <p className="rp-cause rp-in" style={order(1)}>
        {rca.cause}
      </p>
      <p className="rp-cites rp-in" style={order(2)}>
        <span className="rp-muted">{rca.citedLabel}</span>{' '}
        {rca.cites.map((cite) => (
          <Fragment key={cite}>
            <span className="rp-chip rp-mono">{cite}</span>{' '}
          </Fragment>
        ))}
      </p>
      <Hypotheses items={rca.hypotheses} update />
    </Pane>
  );
}

function ApprovalPane({ replay, on, label, decision, approveRef, onDecide }) {
  const { approval, controls } = replay;
  return (
    <Pane id="approval" label={label} on={on} className="rp-pane-decide">
      <div className="rp-decide rp-in" style={order(2)} role="group" aria-labelledby="replay-decide-title">
        <p className="rp-kick">
          <span className="rp-pdot" aria-hidden="true" style={decision === 'approve' ? { background: 'var(--grey)' } : undefined} />
          {decision === 'approve' ? approval.kickApproved : approval.kick}
        </p>
        <p className="rp-muted rp-small">{approval.proposedLabel}</p>
        <p className="rp-action rp-mono" id="replay-decide-title">
          {approval.action}
        </p>
        <p className="rp-pending">{approval.pending}</p>
        <dl className="rp-meta">
          <div>
            <dt>{approval.budgetLabel}</dt>
            <dd>{approval.budget}</dd>
          </div>
          <div className="rp-st-status">
            <dt>{approval.statusLabel}</dt>
            <dd className="rp-mono">{approval.status}</dd>
          </div>
        </dl>
        <div className="rp-btns">
          <button type="button" ref={approveRef} className="rp-pill rp-pill-dark" disabled={decision !== null} onClick={() => onDecide('approve')}>
            {controls.approve}
          </button>
          <button type="button" className="rp-pill rp-pill-line" disabled={decision !== null} onClick={() => onDecide('reject')}>
            {controls.reject}
          </button>
        </div>
      </div>
    </Pane>
  );
}

function ExecutePane({ replay, on, label }) {
  const { execute, previewTag } = replay;
  return (
    <Pane id="execute" label={label} on={on}>
      <p className="rp-pk rp-in" style={order(0)}>
        {label} <span className="rp-pv-tag">{previewTag}</span>
        <span className="rp-muted">{execute.note}</span>
      </p>
      <ul className="rp-checks">
        {execute.checks.map((check, i) => (
          <li key={check.kind} className="rp-in" style={order(1 + i)}>
            <span className="rp-tick" aria-hidden="true" />
            <span>
              <span className="rp-mono rp-muted rp-small">{check.kind}</span>
              <br />
              {check.text}
            </span>
          </li>
        ))}
      </ul>
    </Pane>
  );
}

function VerifyPane({ replay, on, label }) {
  const { verify, metrics, previewTag } = replay;
  const after = [metrics.errorRate.at(-1), ...metrics.errorRateAfterRollback];
  const first = minuteOf(metrics.errorRate[0].at);
  const end = minuteOf(after.at(-1).at);
  return (
    <Pane id="verify" label={label} on={on}>
      <p className="rp-pk rp-in" style={order(0)}>
        {label} <span className="rp-pv-tag">{previewTag}</span>
        <span className="rp-muted rp-mono">{verify.note}</span>
      </p>
      <p className="rp-mono rp-metric-n rp-in" style={order(1)}>
        {verify.metric} <b>{verify.sequence}</b>
      </p>
      <svg className="rp-spark rp-tall rp-in" style={order(1)} viewBox="0 0 300 100" preserveAspectRatio="none" role="img" aria-label={verify.chartLabel}>
        <polyline className="rp-was" points={sparkPoints(metrics.errorRate, first, end)} />
        <polyline className="rp-draw rp-late" points={sparkPoints(after, first, end)} />
      </svg>
      <p className="rp-mono rp-muted rp-small rp-in" style={order(2)}>
        {verify.p99}
      </p>
      <p className="rp-logline rp-in" style={order(3)}>
        <span className="rp-mono rp-muted rp-small">
          {verify.logLine.id} · {verify.logLine.at} · {verify.logLine.level}
        </span>
        <br />
        <span className="rp-mono">{verify.logLine.message}</span>
      </p>
    </Pane>
  );
}

function PostmortemPane({ replay, on, label }) {
  const { postmortem, metrics, previewTag } = replay;
  const after = [metrics.errorRate.at(-1), ...metrics.errorRateAfterRollback];
  const first = minuteOf(metrics.errorRate[0].at);
  const end = minuteOf(after.at(-1).at);
  return (
    <Pane id="postmortem" label={label} on={on}>
      <p className="rp-pk rp-in" style={order(0)}>
        {label} <span className="rp-pv-tag">{previewTag}</span>
        <span className="rp-status-chip rp-mono">{postmortem.status}</span>
      </p>
      <p className="rp-cause rp-in" style={order(1)}>
        {postmortem.summary}
      </p>
      <div className="rp-payoff rp-in" style={order(2)}>
        <span className="rp-pv2 rp-was2">{postmortem.from}</span>
        <span className="rp-pv2" aria-hidden="true">
          →
        </span>
        <span className="rp-pv2">{postmortem.to}</span>
        <span className="rp-mono rp-muted rp-small">{postmortem.metric}</span>
      </div>
      <svg className="rp-spark rp-fill rp-in" style={order(3)} viewBox="0 0 300 100" preserveAspectRatio="none" role="img" aria-label={postmortem.chartLabel}>
        <polyline className="rp-was" points={sparkPoints(metrics.errorRate, first, end)} />
        <polyline points={sparkPoints(after, first, end)} />
      </svg>
    </Pane>
  );
}

function RejectedPane({ replay, on }) {
  const { approval, rejected, rca } = replay;
  return (
    <Pane id="rejected" label={rejected.kick} on={on} className="rp-pane-decide">
      <div className="rp-decide rp-flat rp-in" style={order(1)}>
        <p className="rp-kick">
          <span className="rp-pdot rp-grey" aria-hidden="true" />
          {rejected.kick}
        </p>
        <p className="rp-muted rp-small">{approval.proposedLabel}</p>
        <p className="rp-action rp-mono rp-struck">{approval.action}</p>
        <p className="rp-pending">{rejected.text}</p>
      </div>
      <div className="rp-declined rp-in" style={order(2)}>
        <p className="rp-muted rp-small">{rejected.declinedLabel}</p>
        <p className="rp-cause">{rca.cause}</p>
        <p className="rp-cites">
          <span className="rp-muted">{rca.citedLabel}</span>{' '}
          {rca.cites.map((cite) => (
            <Fragment key={cite}>
              <span className="rp-chip rp-mono">{cite}</span>{' '}
            </Fragment>
          ))}
        </p>
      </div>
    </Pane>
  );
}

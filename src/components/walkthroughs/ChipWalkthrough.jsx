import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { REDUCED_MOTION_QUERY } from '../../prefersReducedMotion';

// Where each step's part sits on the die, in die units (the die is 480 across). The parts read in
// step order, left to right and row by row, so a run is easy to follow (owner, 2026-10-23). Layout,
// not content, so it lives here beside the drawing rather than in portfolioData.
const PLAN = {
  sync: [0, 0, 100, 140],
  store: [100, 0, 140, 140],
  explain: [240, 0, 120, 140],
  preflight: [360, 0, 120, 140],
  review: [0, 140, 180, 120],
  gate: [180, 140, 100, 120],
  mcp: [280, 140, 100, 120],
  record: [380, 140, 100, 120],
  decision: [0, 260, 140, 120],
  postflight: [140, 260, 180, 120],
  propose: [320, 260, 160, 120],
  bench: [0, 380, 320, 100],
  next: [320, 380, 160, 100],
};

// Where package pin k on a side lands across the die, in die units, so a wire meets its pin.
const pinAt = (k) => Math.round(6 * ((9.65 + (k * 82) / 15) * 1.064 - 3.2) - 60);

// The wires between parts, in the same units: one bus that runs through the steps in order, plus
// pads out to the package pins.
const WIRES = {
  in: [1, 2, 3, 4].map((k) => `M-50,${pinAt(k)}H50`),
  syncStore: ['M50,70H170'],
  storeExplain: ['M170,70H300'],
  explainPre: ['M300,70H420'],
  preReview: ['M420,70V135H90V200'],
  reviewGate: ['M90,200H230'],
  gateMcp: ['M230,200H330'],
  mcpIn: [5, 6, 7].map((k) => `M530,${pinAt(k)}H330`),
  mcpRecord: ['M330,200H430'],
  recordDecision: ['M430,200V255H70V320'],
  decisionPost: ['M70,320H230'],
  postPropose: ['M230,320H400'],
  proposeOut: [`M400,${pinAt(9)}H530`],
  proposeBench: ['M400,320V375H160V430'],
  benchNext: ['M160,430H400'],
};

// The wires and package pins that light while each step is open.
const LIT = {
  sync: ['in', 'syncStore'],
  store: ['syncStore', 'storeExplain'],
  explain: ['storeExplain', 'explainPre'],
  preflight: ['explainPre', 'preReview'],
  review: ['preReview', 'reviewGate'],
  gate: ['reviewGate', 'gateMcp'],
  mcp: ['mcpIn', 'gateMcp', 'mcpRecord'],
  record: ['mcpRecord', 'recordDecision'],
  decision: ['recordDecision', 'decisionPost'],
  postflight: ['decisionPost', 'postPropose'],
  propose: ['postPropose', 'proposeOut'],
  bench: ['proposeBench', 'benchNext'],
  next: ['benchNext'],
};
const PIN_LIT = { sync: ['L', [1, 2, 3, 4]], mcp: ['R', [5, 6, 7]], propose: ['R', [9]] };
const SIDES = ['L', 'R', 'T', 'B'];
const PINS = SIDES.flatMap((side) => Array.from({ length: 16 }, (_, k) => ({ side, k, at: 9 + (k * 82) / 15 })));
const DECISIONS = ['approve', 'waive', 'reject'];

const HOLD = 4600;
const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

// Whether a media query matches, read from the browser and followed as it changes. The server and
// the first client render say no, so hydration finds nothing to correct.
function useMedia(query) {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window.matchMedia !== 'function') return () => {};
      const list = window.matchMedia(query);
      list.addEventListener?.('change', onChange);
      return () => list.removeEventListener?.('change', onChange);
    },
    () => typeof window.matchMedia === 'function' && window.matchMedia(query).matches,
    () => false,
  );
}
const fill = (template, values) => Object.entries(values).reduce((text, [key, value]) => text.replace(`{${key}}`, String(value)), template);
const split = (text, by) => text.split(by).map((part) => part.trim());
const two = (n) => String(n).padStart(2, '0');
// A finger or a pen, which open parts by tapping rather than by hovering.
const isTouch = (event) => event.pointerType === 'touch' || event.pointerType === 'pen';

// The small working parts drawn inside a block: their layout class and their words, taken from
// the step's own readout so nothing new is written. Postflight's three runs are numbered by CSS.
function partsOf(step) {
  switch (step.id) {
    case 'sync':
      return ['cw-p-sync', split(step.readout, '·').map(() => '')];
    case 'store':
      return ['cw-p-store', Array(8).fill('')];
    case 'preflight':
      return ['cw-p-lamps', split(step.readout, '·')];
    case 'review':
      return ['cw-p-stages', split(step.readout, '·')];
    case 'decision':
      return ['cw-p-switch', DECISIONS.map(() => '')];
    case 'mcp':
      return ['cw-p-ports', Array(9).fill('')];
    case 'postflight':
      return ['cw-p-ticks', ['', '', '']];
    case 'bench':
      return ['cw-p-bench', Array(60).fill('')];
    default:
      return null;
  }
}
const EXTRA = { record: 'cw-scan', gate: 'cw-bar', propose: 'cw-packet' };

/**
 * Swaps a line of text by letting each letter settle out of noise, like a readout warming up.
 * The server and the first client render show the plain text; the noise only plays on a change.
 */
function Scramble({ text, calm }) {
  const [shown, setShown] = useState(text);
  const first = useRef(true);
  useEffect(() => {
    if (first.current || calm) {
      first.current = false;
      setShown(text);
      return undefined;
    }
    const noise = 'ABCDEFGHJKLMNPQRSTUVWXYZ#%+=';
    const start = performance.now();
    let frame = 0;
    const tick = (now) => {
      const k = Math.min(1, (now - start) / 520);
      const settled = Math.floor(text.length * k);
      setShown(text.slice(0, settled) + text.slice(settled).replace(/[^\s·]/g, () => noise[Math.floor(Math.random() * noise.length)]));
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, calm]);
  return shown;
}

/**
 * The Orion walkthrough as a chip (owner's ask, 2026-10-23). Each step is one part of the die.
 * Left alone, it lies tilted and plays the steps in order, stopping at the decision until a person
 * records one. With a mouse over it, it rises flat and grows and keeps playing; pointing at a part
 * opens it and holds the run there until the cursor moves off. A tap, a click or the arrow keys open a part and pause the run; Play hands control
 * back. With reduced motion nothing moves by itself. Every word comes from the block.
 */
export default function ChipWalkthrough({ block }) {
  const { steps, controls, labels, states, legend } = block;
  const total = steps.length;
  const pace = block.pace ?? 1;

  const [idx, setIdx] = useState(0);
  const calm = useMedia(REDUCED_MOTION_QUERY);
  const fine = useMedia(FINE_POINTER_QUERY);
  // Plays by itself unless the visitor asked for less motion, until they press Play or Pause.
  const [choice, setAuto] = useState(null);
  const auto = choice ?? !calm;
  const [open, setOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [inView, setInView] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [ended, setEnded] = useState(false);
  const [picked, setPicked] = useState(null);
  const [live, setLive] = useState('');

  const stageRef = useRef(null);
  const blockRefs = useRef([]);
  const hoverTimer = useRef(0);
  const nextWait = useRef(null);

  // Runs only while the chip is on screen.
  useEffect(() => {
    const node = stageRef.current;
    if (!node || typeof IntersectionObserver !== 'function') return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      nextWait.current = 1200;
      setInView(entry.isIntersecting);
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const step = steps[idx];

  // Moves on by itself while it is playing, on screen, and nobody is pointing at it.
  useEffect(() => {
    if (!auto || hovering || !inView || waiting || ended) return undefined;
    const wait = nextWait.current ?? HOLD * pace;
    nextWait.current = null;
    const timer = setTimeout(() => {
      if (step.id === 'decision' && !picked) {
        setWaiting(true);
        setLive(block.announce.waiting);
      } else if (idx >= total - 1) {
        setEnded(true);
        setAuto(false);
      } else {
        setIdx(idx + 1);
        if (steps[idx + 1].id === 'decision' && !picked) setWaiting(true);
      }
    }, wait);
    return () => clearTimeout(timer);
  }, [auto, hovering, inView, waiting, ended, idx, picked, pace, step.id, steps, total, block.announce.waiting]);

  // Opens one step. A visitor's own choice is spoken; the run's own moves are not.
  const go = useCallback(
    (i, spoken) => {
      const to = Math.max(0, Math.min(total - 1, i));
      setIdx(to);
      setWaiting(false);
      setEnded(false);
      if (spoken) setLive(fill(block.announce.step, { n: to + 1, label: steps[to].label, tag: steps[to].tag }));
    },
    [block.announce.step, steps, total],
  );

  // A visitor takes over: the run pauses until Play.
  const takeOver = (i) => {
    setAuto(false);
    go(i, true);
  };

  const decide = (kind) => {
    setPicked(kind);
    setWaiting(false);
    setLive(fill(block.announce.decision, { kind }));
    nextWait.current = 1800;
  };

  const onPlay = () => {
    if (ended) {
      replay();
      return;
    }
    nextWait.current = 900;
    setAuto(!auto);
  };

  function replay() {
    setPicked(null);
    setEnded(false);
    setWaiting(false);
    setIdx(0);
    nextWait.current = null;
    setAuto(null);
    setLive(fill(block.announce.step, { n: 1, label: steps[0].label, tag: steps[0].tag }));
  }

  // The mouse: anywhere over the framed plate, the chip turns face up and keeps playing. Pointing at a part opens that
  // part and holds the run there; moving off the part (still over the chip, or away from it)
  // lets the run carry on from that step (owner, 2026-10-23).
  const onEnter = (event) => {
    if (!fine || isTouch(event)) return;
    setOpen(true);
  };
  const onLeave = (event) => {
    if (!fine || isTouch(event)) return;
    clearTimeout(hoverTimer.current);
    setOpen(false);
    if (hovering) {
      nextWait.current = 1200;
      setHovering(false);
    }
  };
  // A part opens once the cursor has settled on it, and the run carries on only once the cursor
  // has stayed off every part a moment, so crossing a gap between two parts never flickers.
  const onOver = (event) => {
    if (!fine || isTouch(event)) return;
    const part = event.target.closest('[data-go]');
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(
      () => {
        if (part) {
          setHovering(true);
          go(steps.findIndex((item) => item.id === part.dataset.go), false);
        } else if (hovering) {
          nextWait.current = 1200;
          setHovering(false);
        }
      },
      part ? 120 : 350,
    );
  };
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  const onPartClick = (i) => {
    if (fine && hovering) go(i, false);
    else takeOver(i);
  };

  const onKeyDown = (event) => {
    const moves = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: -total, End: total };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const to = Math.max(0, Math.min(total - 1, idx + moves[event.key]));
    takeOver(to);
    blockRefs.current[to]?.focus();
  };

  let stateText = states.paused;
  if (waiting) stateText = states.waiting;
  else if (ended) stateText = states.done;
  else if (hovering) stateText = states.reading;
  else if (auto && !inView) stateText = states.offscreen;
  else if (auto) stateText = states.playing;
  const running = auto && !waiting && !ended && !hovering;

  const readout = step.id === 'decision' && picked ? fill(labels.decisionReadout, { kind: picked }) : step.readout;
  const lit = new Set(LIT[step.id] ?? []);
  const pinsLit = PIN_LIT[step.id];

  return (
    <div className="wt cw">
      <div className="cw-card" role="region" aria-label={block.regionLabel}>
        <div className="cw-plate" onPointerEnter={onEnter} onPointerLeave={onLeave} onPointerOver={onOver}>
          <div className="cw-frame" aria-hidden="true" />
          <p className="cw-corner cw-c-tl" aria-hidden="true">
            <b>{block.caption.number}</b>
          </p>
          <p className="cw-corner cw-c-tr" aria-hidden="true">
            {block.caption.title}
          </p>
          <p className="cw-corner cw-c-bl" aria-hidden="true">
            <span className="cw-num" data-n={two(idx + 1)} />
            <Scramble text={`${step.label} · ${step.tag}`} calm={calm} />
          </p>
          <p className="cw-corner cw-c-br" aria-hidden="true">
            {readout}
          </p>
          <div
            ref={stageRef}
            className={`cw-stage${open ? ' cw-open' : ''}`}
          >
            <div className="cw-tilt">
              <div className="cw-shadow" aria-hidden="true" />
              <div className="cw-layer cw-l3" aria-hidden="true" />
              <div className="cw-layer cw-l2" aria-hidden="true" />
              <div className="cw-layer cw-l1" aria-hidden="true" />
              <div className="cw-pins" aria-hidden="true">
                {PINS.map(({ side, k, at }) => {
                  const along = side === 'L' || side === 'R';
                  const style = along
                    ? { [side === 'L' ? 'left' : 'right']: 0, top: `${at}%`, width: '4%', height: '1.3%' }
                    : { [side === 'T' ? 'top' : 'bottom']: 0, left: `${at}%`, height: '4%', width: '1.3%' };
                  const on = pinsLit && pinsLit[0] === side && pinsLit[1].includes(k);
                  return <i key={`${side}${k}`} className={`cw-pin${on ? ' cw-on' : ''}`} style={style} />;
                })}
              </div>
              <div className="cw-layer cw-l0" aria-hidden="true">
                <span className="cw-mark">{block.name}</span>
                <span className="cw-dot" />
              </div>
              <div
                className="cw-die"
                role="group"
                aria-label={block.stepsLabel}
                data-step={step.id}
                data-picked={picked ?? undefined}
                onKeyDown={onKeyDown}
              >
                <svg className="cw-traces" viewBox="-60 -60 600 600" aria-hidden="true" focusable="false">
                  {Object.entries(WIRES).flatMap(([key, list]) =>
                    list.map((d) => <path key={`${key}${d}`} d={d} className={`cw-tr${lit.has(key) ? ' cw-on' : ''}`} />),
                  )}
                </svg>
                {steps.map((item, i) => {
                  const [x, y, w, h] = PLAN[item.id] ?? [0, 0, 0, 0];
                  const parts = partsOf(item);
                  return (
                    <button
                      key={item.id}
                      ref={(node) => {
                        blockRefs.current[i] = node;
                      }}
                      type="button"
                      className={`cw-blk${i === idx ? ' cw-on' : ''}`}
                      data-go={item.id}
                      data-tag={item.tag}
                      style={{ '--x': x, '--y': y, '--w': w, '--h': h }}
                      tabIndex={i === idx ? 0 : -1}
                      aria-label={fill(block.announce.step, { n: i + 1, label: item.label, tag: item.tag })}
                      aria-current={i === idx ? 'step' : undefined}
                      onClick={() => onPartClick(i)}
                    >
                      <span className="cw-face" aria-hidden="true">
                        <span className="cw-lbl" data-n={two(i + 1)}>
                          {item.label}
                        </span>
                        {parts && (
                          <span className={`cw-parts ${parts[0]}`}>
                            {parts[1].map((word, k) => (
                              <span key={k} className="cw-pt" style={{ '--i': k }} data-k={item.id === 'decision' ? DECISIONS[k] : undefined}>
                                {word && <span>{word}</span>}
                              </span>
                            ))}
                          </span>
                        )}
                        {EXTRA[item.id] && <span className={EXTRA[item.id]} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="cw-info">
          <p className="cw-status" data-on={running ? '' : undefined}>
            <span className="cw-sdot" aria-hidden="true" />
            <span>{stateText}</span>
          </p>
          <div className="cw-ticks" aria-hidden="true">
            {steps.map((item, i) => (
              <i key={item.id} className={i < idx ? 'cw-done' : i === idx ? 'cw-now' : undefined} />
            ))}
          </div>
          <p className="cw-kicker">
            <span>{fill(labels.stepOf, { n: idx + 1, total })}</span>
            <span className="cw-tag" data-tag={step.tag}>
              {step.tag}
            </span>
          </p>
          <h3 className="cw-name">
            <Scramble text={step.label} calm={calm} />
          </h3>
          <p className="cw-spec">{readout}</p>
          <p className="cw-does">{step.does}</p>
          {step.person && (
            <p className="cw-note">
              <b>{labels.person}</b> {step.person}
            </p>
          )}
          {step.id === 'decision' && (
            <div className="cw-decide">
              {DECISIONS.map((kind) => (
                <button key={kind} type="button" className="cw-btn" aria-pressed={picked === kind} onClick={() => decide(kind)}>
                  {controls[kind]}
                </button>
              ))}
            </div>
          )}
          {step.evidence && (
            <p className="cw-note">
              <b>{labels.evidence}</b> {step.evidence}
            </p>
          )}
          <div className="cw-controls">
            <button type="button" className="cw-btn cw-solid" onClick={onPlay}>
              {ended ? controls.replay : auto ? controls.pause : controls.play}
            </button>
            <button type="button" className="cw-btn" disabled={idx === 0} onClick={() => takeOver(idx - 1)}>
              {controls.prev}
            </button>
            <button
              type="button"
              className="cw-btn"
              disabled={idx === total - 1}
              onClick={() => {
                nextWait.current = null;
                go(idx + 1, true);
              }}
            >
              {controls.next}
            </button>
            <button type="button" className="cw-btn" onClick={replay}>
              {controls.replay}
            </button>
          </div>
          <p className="cw-hint">{fine ? block.hint : block.hintTouch}</p>
        </div>
        <p className="sr-only" aria-live="polite">
          {live}
        </p>
      </div>

      <p className="wt-legend">
        {legend.map((item) => (
          <span key={item.term}>
            <b>{item.term}</b> {item.meaning}
          </span>
        ))}
      </p>

      <div className="wt-steps">
        <h3 className="wt-steps-h">{block.listHeading}</h3>
        <ol id="wt-steps" className="wt-sl">
          {steps.map((item, i) => (
            <li key={item.id}>
              <span className="wt-n">{two(i + 1)}</span>
              <p className="wt-t">
                <b>{item.label}</b>
                <span className="wt-tag" data-tag={item.tag}>
                  {item.tag}
                </span>
              </p>
              <p className="wt-d">{item.does}</p>
              {typeof item.person === 'string' && (
                <p className="wt-p">
                  {labels.personInList} {item.person}
                </p>
              )}
              <button
                type="button"
                className="wt-show"
                aria-label={fill(labels.showAria, { n: i + 1, label: item.label })}
                onClick={() => {
                  takeOver(i);
                  stageRef.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
                  blockRefs.current[i]?.focus({ preventScroll: true });
                }}
              >
                {controls.show}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

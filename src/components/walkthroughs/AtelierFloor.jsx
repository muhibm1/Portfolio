import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../prefersReducedMotion';
import figure from './atelier-floor.svg?raw';
import { GLIDE, POS, SCENES, STEP_PARTS, targetFor, translate, travelMilliseconds } from './atelier-floor.rig.js';

// The drawing is placed once, as the same string on the server and in the browser, so the
// prerendered page is complete at rest (the plates sit at the first station) and hydration finds
// nothing to correct.
const FIGURE_HTML = { __html: figure };

const PLATES = ['plate-1', 'plate-2', 'plate-3'];

/**
 * The Atelier studio floor: the committed drawing, with the open phase's station ringed and the
 * lit plate carried to it (or put there at once when the visitor asked for less motion). All of
 * that happens in an effect after the phase changes; nothing touches the drawing while rendering.
 * `live` is false while the console is off screen or the tab is hidden, which pauses the camera
 * head's run. A tap on a station calls `onPick` with the phase's id.
 */
export default function AtelierFloor({ stepId, calm, live = true, runId, onPick }) {
  const boxRef = useRef(null);
  const platesAt = useRef(PLATES.map(() => POS.intake));
  const sweepRef = useRef(null);
  const liveRef = useRef(live);
  const liveSeen = useRef(live);
  // Keeps the latest live signal where the phase effect can read it without re-running.
  useEffect(() => {
    liveRef.current = live;
  }, [live]);

  useEffect(() => {
    const root = boxRef.current?.querySelector('svg');
    const scene = SCENES[stepId];
    if (!root || !scene) return undefined;

    let animations = [];
    let trips = [];
    const part = (name) => root.querySelector(`[data-part="${name}"]`);

    // Stops every running animation and clears the highlights. A plate that is part-way through
    // a trip stays where it has got to, so the next trip carries on from there instead of
    // jumping to the end of the old one first.
    const rest = () => {
      trips.forEach(({ i, element, from, to, animation }) => {
        const progress = animation.effect?.getComputedTiming?.().progress;
        if (typeof progress !== 'number' || progress >= 1) return;
        const here = [0, 1].map((axis) => Math.round(from[axis] + (to[axis] - from[axis]) * Math.max(0, progress)));
        platesAt.current[i] = here;
        element.style.transform = translate(here);
      });
      trips = [];
      animations.forEach((animation) => animation.cancel());
      animations = [];
      sweepRef.current = null;
      root.querySelectorAll('[data-on]').forEach((element) => element.removeAttribute('data-on'));
    };

    const api = {
      // Carries each plate from where it last rested to the phase's place, then leaves it there.
      travel(id) {
        PLATES.forEach((name, i) => {
          const element = part(name);
          if (!element) return;
          const from = platesAt.current[i];
          const to = targetFor(id, i);
          element.style.transform = translate(to);
          platesAt.current[i] = to;
          if (typeof element.animate !== 'function') return;
          const animation = element.animate([{ transform: translate(from) }, { transform: translate(to) }], {
            duration: travelMilliseconds(from, to),
            easing: GLIDE,
          });
          animations.push(animation);
          trips.push({ i, element, from, to, animation });
        });
      },
      // Puts each plate at the phase's place at once.
      put(id) {
        PLATES.forEach((name, i) => {
          const element = part(name);
          if (!element) return;
          const to = targetFor(id, i);
          element.style.transform = translate(to);
          platesAt.current[i] = to;
        });
      },
      // Runs the camera head along the gantry and back, paused while the console is not live.
      sweep(by, { dur, iterations, easing }) {
        const element = part('rig-head');
        if (!element || typeof element.animate !== 'function') return;
        const animation = element.animate([{ transform: translate([0, 0]) }, { transform: translate(by) }], {
          duration: dur,
          iterations,
          direction: 'alternate',
          easing,
        });
        if (!liveRef.current) animation.pause();
        animations.push(animation);
        sweepRef.current = animation;
      },
    };

    rest();
    root.setAttribute('data-at', stepId);
    (STEP_PARTS[stepId] ?? []).forEach((name) => part(name)?.setAttribute('data-on', ''));
    // The motion setting is read here as well as passed in, because this effect runs before the
    // console's own effect has had the chance to report a visitor who asked for less motion.
    if (calm || prefersReducedMotion()) scene.still(api);
    else scene.play(api);

    return rest;
  }, [stepId, calm, runId]);

  // Pauses the camera head's run while the console is off screen or the tab is hidden, and
  // carries on when it is back.
  useEffect(() => {
    if (liveSeen.current === live) return;
    liveSeen.current = live;
    const sweep = sweepRef.current;
    if (!sweep) return;
    if (!live) sweep.pause();
    else if (sweep.playState !== 'finished') sweep.play();
  }, [live]);

  // A tap on a station opens its phase, for a visitor with a pointer; the rail does the same for the keyboard.
  const onStationClick = (event) => {
    const station = event.target.closest?.('.st[data-part]');
    if (station && onPick) onPick(station.getAttribute('data-part'));
  };

  return <div ref={boxRef} className="wt-figbox" onClick={onStationClick} dangerouslySetInnerHTML={FIGURE_HTML} />;
}

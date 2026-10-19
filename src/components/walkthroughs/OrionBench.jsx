import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../prefersReducedMotion';
import figure from './orion-bench.svg?raw';
import { MOVERS, SCENES, STEP_PARTS, needleFrames, needleMatrix, translate, vec } from './orion-bench.rig.js';

// The drawing is placed once, as the same string on the server and in the browser, so the
// prerendered page is complete at rest and hydration finds nothing to correct.
const FIGURE_HTML = { __html: figure };

/**
 * The Orion bench: the committed drawing, with the current step's parts ringed and a scene played
 * on them (or their resting version when the visitor asked for less motion). All of that happens
 * in an effect after the step changes; nothing touches the drawing while rendering.
 */
export default function OrionBench({ stepId, calm, decision, runId }) {
  const boxRef = useRef(null);

  useEffect(() => {
    const root = boxRef.current?.querySelector('svg');
    const scene = SCENES[stepId];
    if (!root || !scene) return undefined;

    let animations = [];
    let timers = [];
    const part = (name) => root.querySelector(`[data-part="${name}"]`);

    // Puts every moving part back where it rests and clears the highlights.
    const rest = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];
      timers.forEach(clearTimeout);
      timers = [];
      MOVERS.forEach((name) => {
        const element = part(name);
        if (!element) return;
        element.style.transform = '';
        element.querySelectorAll('[data-hold]').forEach((held) => {
          held.style.transform = '';
        });
      });
      root.querySelectorAll('[data-on]').forEach((element) => element.removeAttribute('data-on'));
    };

    const api = {
      decision,
      // Moves a part through world offsets, and holds still anything marked to stay put with it.
      slide(name, path, { dur, easing, iterations = 1 }) {
        const element = part(name);
        if (!element || typeof element.animate !== 'function') return;
        const options = { duration: dur, easing, iterations, fill: 'forwards' };
        animations.push(element.animate(path.map((by) => ({ transform: translate(vec(by)) })), options));
        element.querySelectorAll('[data-hold]').forEach((held) => {
          animations.push(
            held.animate(
              path.map((by) => {
                const [dx, dy] = vec(by);
                return { transform: translate([-dx, -dy]) };
              }),
              options,
            ),
          );
        });
      },
      // Puts a part at one world offset at once.
      put(name, by) {
        const element = part(name);
        if (!element) return;
        const [dx, dy] = vec(by);
        element.style.transform = translate([dx, dy]);
        element.querySelectorAll('[data-hold]').forEach((held) => {
          held.style.transform = translate([-dx, -dy]);
        });
      },
      // Turns the dial's needle from zero to a value.
      needle(value, dur) {
        const element = part('needle');
        if (!element || typeof element.animate !== 'function') return;
        animations.push(element.animate(needleFrames(value), { duration: dur, easing: 'cubic-bezier(0.32, 0.72, 0, 1)', fill: 'forwards' }));
      },
      needleStill(value) {
        const element = part('needle');
        if (element) element.style.transform = needleMatrix(value);
      },
      on(name, yes) {
        const element = part(name);
        if (!element) return;
        if (yes) element.setAttribute('data-on', '');
        else element.removeAttribute('data-on');
      },
      later(ms, fn) {
        timers.push(setTimeout(fn, ms));
      },
    };

    rest();
    (STEP_PARTS[stepId] ?? []).forEach((name) => api.on(name, true));
    // The motion setting is read here as well as passed in, because this effect runs before the
    // console's own effect has had the chance to report a visitor who asked for less motion.
    if (calm || prefersReducedMotion()) scene.still(api);
    else scene.play(api);

    return rest;
  }, [stepId, calm, decision, runId]);

  return <div ref={boxRef} className="wt-figbox" dangerouslySetInnerHTML={FIGURE_HTML} />;
}

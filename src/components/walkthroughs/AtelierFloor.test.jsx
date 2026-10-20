// Tests the Atelier studio floor (TG-08, D3, D4, D5, D7): the drawing is placed once and complete at
// rest on the server with its plates at the first station, a phase rings its own station and
// carries the plate there, the three plates take their own rails at the lanes, the camera head's
// run pauses off screen and never exists for a calm visitor, and the stylesheet carries the new
// tones in light and both dark sets. jsdom has no animation clock, so tests that need one install
// a small recorder and say so.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render as renderPage } from '../../entry-server.jsx';
import AtelierFloor from './AtelierFloor';
import { LANE_POS, POS, STEP_PARTS, translate } from './atelier-floor.rig.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const lookCss = fs.readFileSync(path.join(root, 'src/look.css'), 'utf8');

afterEach(() => {
  delete SVGElement.prototype.animate;
});

// Installs SVGElement.animate as a recorder; each call returns an animation the test can inspect.
function installAnimate() {
  const calls = [];
  SVGElement.prototype.animate = function recorded(frames, options) {
    const animation = {
      frames,
      options,
      target: this,
      cancelled: false,
      paused: false,
      played: 0,
      paused_calls: 0,
      progress: 1,
      effect: { getComputedTiming: () => ({ progress: animation.progress }) },
      cancel() {
        this.cancelled = true;
      },
      pause() {
        this.paused = true;
        this.paused_calls += 1;
      },
      play() {
        this.paused = false;
        this.played += 1;
      },
    };
    calls.push(animation);
    return animation;
  };
  return calls;
}

const props = { stepId: 'intake', calm: false, live: true, runId: 0 };
const ringed = (container) => [...container.querySelectorAll('[data-on]')].map((element) => element.getAttribute('data-part'));
const plate = (container, n) => container.querySelector(`[data-part="plate-${n}"]`);

describe('AtelierFloor', () => {
  it('is complete on the server at rest: the whole drawing, the plates at the first station, no ring and no motion', () => {
    const html = renderToString(<AtelierFloor {...props} />);

    expect(html).toContain('data-part="intake"');
    expect(html).toContain('data-part="visitors"');
    expect(html).toContain(`data-part="plate-1" transform="translate(${POS.intake[0]} ${POS.intake[1]})"`);
    expect(html).not.toContain('data-on');
    expect(html).not.toContain('data-at');
  });

  it('places the drawing once, with all of its parts', () => {
    const { container } = render(<AtelierFloor {...props} />);

    expect(container.querySelectorAll('svg')).toHaveLength(1);
    expect(container.querySelectorAll('[data-part]')).toHaveLength(16);
  });

  it('rings the station of the open phase, and only that one, as the phase changes', () => {
    installAnimate();
    const { container, rerender } = render(<AtelierFloor {...props} stepId="intake" />);
    expect(ringed(container)).toEqual(STEP_PARTS.intake);

    rerender(<AtelierFloor {...props} stepId="critics" runId={1} />);

    expect(ringed(container)).toEqual(STEP_PARTS.critics);
    expect(container.querySelector('svg').getAttribute('data-at')).toBe('critics');
  });

  it('carries each plate to the phase\'s station as an animation, and leaves it there', () => {
    const animations = installAnimate();
    const { container, rerender } = render(<AtelierFloor {...props} stepId="intake" />);
    animations.length = 0;

    rerender(<AtelierFloor {...props} stepId="brief" runId={1} />);

    expect(animations.map((animation) => animation.target.getAttribute('data-part'))).toEqual(['plate-1', 'plate-2', 'plate-3']);
    expect(animations[0].frames[0].transform).toBe(translate(POS.intake));
    expect(animations[0].frames[1].transform).toBe(translate(POS.brief));
    expect(animations[0].options.duration).toBeGreaterThanOrEqual(450);
    expect(animations[0].options.duration).toBeLessThanOrEqual(900);
    expect(plate(container, 1).style.transform).toBe(translate(POS.brief));
  });

  it('starts each trip from where the plate last rested, not from the first station, after several phases', () => {
    const animations = installAnimate();
    const { container, rerender } = render(<AtelierFloor {...props} stepId="intake" />);
    rerender(<AtelierFloor {...props} stepId="lanes" runId={1} />);
    animations.length = 0;

    rerender(<AtelierFloor {...props} stepId="critics" runId={2} />);

    expect(animations.map((animation) => animation.frames[0].transform)).toEqual(LANE_POS.map(translate));
    for (const n of [1, 2, 3]) expect(plate(container, n).style.transform).toBe(translate(POS.critics));
  });

  it('carries on from where a plate has got to when another phase is picked mid-glide, with no snap', () => {
    const animations = installAnimate();
    const { container, rerender } = render(<AtelierFloor {...props} stepId="intake" />);
    animations.length = 0;
    rerender(<AtelierFloor {...props} stepId="critics" runId={1} />);
    const first = animations.slice();
    first.forEach((animation) => { animation.progress = 0.5; });
    animations.length = 0;

    rerender(<AtelierFloor {...props} stepId="pick" runId={2} />);

    const halfway = [0, 1].map((axis) => Math.round(POS.intake[axis] + (POS.critics[axis] - POS.intake[axis]) * 0.5));
    expect(animations).toHaveLength(3);
    expect(animations[0].frames[0].transform).toBe(translate(halfway));
    expect(animations[0].frames[1].transform).toBe(translate(POS.pick));
    expect(halfway).not.toEqual(POS.intake);
    expect(halfway).not.toEqual(POS.critics);
    expect(plate(container, 1).style.transform).toBe(translate(POS.pick));
  });

  it('puts the three plates on their own rails at the lanes, and shows the other two only there', () => {
    installAnimate();
    const { container, rerender } = render(<AtelierFloor {...props} stepId="intake" />);
    expect(container.querySelector('svg').getAttribute('data-at')).toBe('intake');

    rerender(<AtelierFloor {...props} stepId="lanes" runId={1} />);

    expect(container.querySelector('svg').getAttribute('data-at')).toBe('lanes');
    LANE_POS.forEach((place, i) => expect(plate(container, i + 1).style.transform).toBe(translate(place)));
  });

  it('keeps the plate-two and plate-three opacity rule keyed on the lanes phase', () => {
    expect(lookCss).toMatch(/\.wt-figbox \.fig \[data-part="plate-2"\], \.wt-figbox \.fig \[data-part="plate-3"\] \{ opacity: 0;/);
    expect(lookCss).toMatch(/\.wt-figbox \.fig\[data-at="lanes"\] \[data-part="plate-2"\], \.wt-figbox \.fig\[data-at="lanes"\] \[data-part="plate-3"\] \{ opacity: 1;/);
  });

  it('runs the camera head along the gantry on the render rig phase: two passes, back and forth', () => {
    const animations = installAnimate();
    render(<AtelierFloor {...props} stepId="rig" />);

    const sweep = animations.find((animation) => animation.target.getAttribute('data-part') === 'rig-head');
    expect(sweep).toBeDefined();
    expect(sweep.options.iterations).toBe(2);
    expect(sweep.options.direction).toBe('alternate');
  });

  it('pauses the camera head\'s run when the console is off screen and carries on when it is back', () => {
    const animations = installAnimate();
    const { rerender } = render(<AtelierFloor {...props} stepId="rig" live />);
    const sweep = animations.find((animation) => animation.target.getAttribute('data-part') === 'rig-head');
    expect(sweep.paused).toBe(false);

    rerender(<AtelierFloor {...props} stepId="rig" live={false} />);
    expect(sweep.paused).toBe(true);

    rerender(<AtelierFloor {...props} stepId="rig" live />);
    expect(sweep.paused).toBe(false);
    expect(sweep.played).toBe(1);
  });

  it('starts the camera head\'s run paused when the console is not on screen yet', () => {
    const animations = installAnimate();
    render(<AtelierFloor {...props} stepId="rig" live={false} />);

    const sweep = animations.find((animation) => animation.target.getAttribute('data-part') === 'rig-head');
    expect(sweep.paused).toBe(true);
  });

  it('does not restart a finished run when the console comes back on screen', () => {
    const animations = installAnimate();
    const { rerender } = render(<AtelierFloor {...props} stepId="rig" live />);
    const sweep = animations.find((animation) => animation.target.getAttribute('data-part') === 'rig-head');
    sweep.playState = 'finished';

    rerender(<AtelierFloor {...props} stepId="rig" live={false} />);
    rerender(<AtelierFloor {...props} stepId="rig" live />);

    expect(sweep.played).toBe(0);
  });

  it('plays nothing for a calm visitor: every plate is put at the station at once', () => {
    const animations = installAnimate();
    const { container } = render(<AtelierFloor {...props} stepId="rig" calm />);

    expect(animations).toHaveLength(0);
    for (const n of [1, 2, 3]) expect(plate(container, n).style.transform).toBe(translate(POS.rig));
  });

  it('puts every plate at its station at once when calm turns on while a trip is running', () => {
    const animations = installAnimate();
    const { container, rerender } = render(<AtelierFloor {...props} stepId="critics" />);
    expect(animations.length).toBeGreaterThan(0);

    rerender(<AtelierFloor {...props} stepId="critics" calm runId={1} />);

    expect(animations.every((animation) => animation.cancelled)).toBe(true);
    for (const n of [1, 2, 3]) expect(plate(container, n).style.transform).toBe(translate(POS.critics));
  });

  it('plays nothing for a visitor whose browser asks for less motion, even before the console has said so', () => {
    const original = window.matchMedia;
    window.matchMedia = (query) => ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} });
    try {
      const animations = installAnimate();
      const { container } = render(<AtelierFloor {...props} stepId="rig" />);

      expect(animations).toHaveLength(0);
      expect(plate(container, 1).style.transform).toBe(translate(POS.rig));
    } finally {
      window.matchMedia = original;
    }
  });

  it('cancels its animations when it leaves the page', () => {
    const animations = installAnimate();
    const { unmount } = render(<AtelierFloor {...props} stepId="rig" />);

    unmount();

    expect(animations.every((animation) => animation.cancelled)).toBe(true);
  });

  it('opens a phase when its station is tapped, and ignores a tap anywhere else on the drawing', () => {
    installAnimate();
    const onPick = vi.fn();
    const { container } = render(<AtelierFloor {...props} onPick={onPick} />);

    fireEvent.click(container.querySelector('[data-part="critics"] path'));
    expect(onPick).toHaveBeenCalledWith('critics');

    onPick.mockClear();
    fireEvent.click(container.querySelector('[data-part="plate-1"] path'));
    fireEvent.click(container.querySelector('svg'));
    expect(onPick).not.toHaveBeenCalled();
  });
});

describe('the Atelier page as served (D5)', () => {
  it('carries the studio floor in the prerendered markup of /work/atelier, with the plates at the first station', () => {
    const html = renderPage('/Portfolio/work/atelier');

    expect(html).toContain('data-part="intake"');
    expect(html).toContain('viewBox="0 0 6800 4300"');
    expect(html).not.toContain('data-on');
  });

  it('keeps each page to its own drawing: the studio floor only on Atelier\'s page, the bench only on Orion\'s', () => {
    expect(renderPage('/Portfolio/work/orion')).not.toContain('data-part="intake"');
    expect(renderPage('/Portfolio/work/atelier')).not.toContain('data-part="sync"');
  });

  it('keeps every drawing out of the other pages, so the cost lands on the two pages that show one', () => {
    for (const route of ['/Portfolio', '/Portfolio/work', '/Portfolio/work/flywheel', '/Portfolio/work/workhorse']) {
      expect(renderPage(route), route).not.toContain('data-part=');
    }
  });
});

describe('the figure tones in look.css (D7)', () => {
  const blockAfter = (pattern) => {
    const start = lookCss.search(pattern);
    const open = lookCss.indexOf('{', start);
    const close = lookCss.indexOf('\n}', open);
    return lookCss.slice(open, close);
  };
  const has = (block, name) => new RegExp(`--${name}:`).test(block);

  const light = blockAfter(/^:root\s*\{/m);
  const systemDark = blockAfter(/:root:not\(\[data-theme="light"\]\)\s*\{/);
  const pickedDark = blockAfter(/:root\[data-theme="dark"\]\s*\{/);

  it('declares the lit plate\'s two tones in the light set, the dark set that follows the system and the dark set a visitor picks', () => {
    for (const name of ['f-lit-top', 'f-lit-shade']) {
      expect(has(light, name), `light ${name}`).toBe(true);
      expect(has(systemDark, name), `system dark ${name}`).toBe(true);
      expect(has(pickedDark, name), `picked dark ${name}`).toBe(true);
    }
  });
});

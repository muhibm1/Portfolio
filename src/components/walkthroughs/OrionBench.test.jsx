// Tests the Orion bench component (TG-07, D4, D7, D8): the drawing is placed once and complete at
// rest on the server, a step rings its own parts and plays its scene, a calm visitor gets the
// resting version, and the stylesheet carries the figure's tones in light and both dark sets.
// jsdom has no animation clock, so tests that need one install a small recorder and say so.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import OrionBench from './OrionBench';
import { STEP_PARTS } from './orion-bench.rig.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const lookCss = fs.readFileSync(path.join(root, 'src/look.css'), 'utf8');

afterEach(() => {
  delete SVGElement.prototype.animate;
});

function installAnimate() {
  const calls = [];
  SVGElement.prototype.animate = function recorded(frames, options) {
    const animation = { frames, options, target: this, cancelled: false, cancel() { this.cancelled = true; } };
    calls.push(animation);
    return animation;
  };
  return calls;
}

const props = { stepId: 'sync', calm: false, decision: null, runId: 0 };
const ringed = (container) => [...container.querySelectorAll('[data-on]')].map((element) => element.getAttribute('data-part'));

describe('OrionBench', () => {
  it('is complete on the server at rest: the whole drawing, no ring and no motion', () => {
    const html = renderToString(<OrionBench {...props} />);

    expect(html).toContain('data-part="sync"');
    expect(html).toContain('data-part="pad"');
    expect(html).not.toContain('data-on');
  });

  it('places the drawing once, with all of its parts', () => {
    const { container } = render(<OrionBench {...props} />);

    expect(container.querySelectorAll('svg')).toHaveLength(1);
    expect(container.querySelectorAll('[data-part]')).toHaveLength(35);
  });

  it('plays nothing for a visitor whose browser asks for less motion, even before the console has said so', () => {
    const original = window.matchMedia;
    window.matchMedia = (query) => ({ matches: true, media: query, addEventListener() {}, removeEventListener() {} });
    try {
      const animations = installAnimate();
      const { container } = render(<OrionBench {...props} stepId="gate" />);

      expect(animations).toHaveLength(0);
      expect(container.querySelector('[data-part="boom"]').style.transform).toMatch(/^translate\(/);
    } finally {
      window.matchMedia = original;
    }
  });

  it('rings the parts of the open step, and only those, as the step changes', () => {
    installAnimate();
    const { container, rerender } = render(<OrionBench {...props} stepId="sync" />);
    expect(ringed(container).sort()).toEqual([...STEP_PARTS.sync].sort());

    rerender(<OrionBench {...props} stepId="gate" runId={1} />);

    expect(ringed(container).sort()).toEqual([...STEP_PARTS.gate].sort());
  });

  it('plays the step\'s scene as animations on its moving parts', () => {
    const animations = installAnimate();
    render(<OrionBench {...props} stepId="gate" />);

    expect(animations.map((animation) => animation.target.getAttribute('data-part'))).toEqual(['boom']);
    expect(animations[0].options.fill).toBe('forwards');
  });

  it('sweeps the needle on the verdict step and holds the block lamp back until it arrives', () => {
    const animations = installAnimate();
    const { container } = render(<OrionBench {...props} stepId="preflight" />);

    expect(animations.map((animation) => animation.target.getAttribute('data-part'))).toEqual(['needle']);
    expect(animations[0].frames.length).toBeGreaterThan(10);
    expect(ringed(container)).not.toContain('lamp-block');
  });

  it('shows the verdict at rest for a calm visitor: the needle turned and the block lamp lit', () => {
    const { container } = render(<OrionBench {...props} stepId="preflight" calm />);

    expect(container.querySelector('[data-part="needle"]').style.transform).toMatch(/^matrix\(/);
    expect(ringed(container)).toContain('lamp-block');
  });

  it('moves the press only once a decision is recorded', () => {
    const animations = installAnimate();
    const { rerender } = render(<OrionBench {...props} stepId="decision" />);
    expect(animations).toHaveLength(0);

    rerender(<OrionBench {...props} stepId="decision" decision="approve" runId={1} />);

    expect(animations.map((animation) => animation.target.getAttribute('data-part'))).toEqual(['press']);
  });

  it('shows the resting version for a calm visitor: parts placed, nothing animated', () => {
    const animations = installAnimate();
    const { container } = render(<OrionBench {...props} stepId="gate" calm />);

    expect(animations).toHaveLength(0);
    expect(container.querySelector('[data-part="boom"]').style.transform).toMatch(/^translate\(/);
  });

  it('puts every moving part back and clears the rings when the step changes', () => {
    installAnimate();
    const { container, rerender } = render(<OrionBench {...props} stepId="gate" calm />);
    expect(container.querySelector('[data-part="boom"]').style.transform).not.toBe('');

    rerender(<OrionBench {...props} stepId="mcp" calm runId={1} />);

    expect(container.querySelector('[data-part="boom"]').style.transform).toBe('');
    expect(ringed(container).sort()).toEqual([...STEP_PARTS.mcp].sort());
  });

  it('cancels its animations when it leaves the page', () => {
    const animations = installAnimate();
    const { unmount } = render(<OrionBench {...props} stepId="gate" />);

    unmount();

    expect(animations.every((animation) => animation.cancelled)).toBe(true);
  });
});

// The page-level checks moved to ChipWalkthrough.test.jsx when the chip replaced the bench on the
// Orion page (owner, 2026-10-23); the bench stays a working figure the console can draw.

describe('the figure tones in look.css (D7)', () => {
  const blockAfter = (pattern) => {
    const start = lookCss.search(pattern);
    const open = lookCss.indexOf('{', start);
    const close = lookCss.indexOf('\n}', open);
    return lookCss.slice(open, close);
  };
  const names = (block) => new Set([...block.matchAll(/--(f-[a-z0-9-]+):/g)].map((match) => match[1]));

  const light = names(blockAfter(/^:root\s*\{/m));
  const systemDark = names(blockAfter(/:root:not\(\[data-theme="light"\]\)\s*\{/));
  const pickedDark = names(blockAfter(/:root\[data-theme="dark"\]\s*\{/));

  it('declares the figure tones in the light set', () => {
    expect(light.size).toBeGreaterThanOrEqual(15);
  });

  it('repeats every figure tone in the dark set that follows the system and in the dark set a visitor picks', () => {
    expect([...light].filter((name) => !systemDark.has(name))).toEqual([]);
    expect([...light].filter((name) => !pickedDark.has(name))).toEqual([]);
  });

  it('keeps the replay\'s own rules out of the walkthrough and the walkthrough\'s out of the replay', () => {
    const wtRules = lookCss.split('\n').filter((line) => /^\.wt-/.test(line));
    expect(wtRules.length).toBeGreaterThan(50);
    expect(wtRules.filter((line) => /\.rp-/.test(line))).toEqual([]);
  });
});

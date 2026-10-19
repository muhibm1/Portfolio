// The rig for the Orion bench figure (orion-bench.svg): where each step's parts are, how far each
// moving part travels, and what plays or rests on each step. It is code, not content: every
// number here must match the one drawing, so it lives beside it (TG-07, D4, D6).
//
// The drawing is the studio's figure scaled ten times to whole numbers, so the projection's origin
// and scale below are the studio's values times ten. World offsets (the run of a rail, the drop of
// a stamp) are in the figure's own units and do not change. Durations are plain millisecond
// numbers because the copy scan reads this file.

// The studio's isometric camera, with origin and scale ten times the studio's.
export const P = {
  origin: [3200, 1951.4774775063242],
  scale: 14.88912807062064,
  azimuth: 42,
  elevation: 30,
};

// How far each part travels, in the figure's world units.
const TUBE_RUN = 14;
const STAMP_DROP = 7;
const READER_RUN = 20;
const CARD_RUN = 48;
const BOOM_DROP = 9;
const DRAWER_OPEN = 9;
const PRESS_DROP = 8;
const SHEET_FLY = [33, -84, 18];
const CURSOR_RUN = 236;
const GAUGE = { at: [-6, -40], top: 36, span: 5.235987755982989 };

// The dial reads out of 100; the drawing sweeps its needle to the block end of the dial.
const NEEDLE_VALUE = 88;

const SETTLE = 'cubic-bezier(0.32, 0.72, 0, 1)';

// The parts that ring (take the step's highlight) on each step, in step order.
export const STEP_PARTS = {
  sync: ['sync', 'pellets'],
  store: ['store', 'stamp'],
  explain: ['explain', 'reader'],
  preflight: ['preflight'],
  review: ['review', 'card'],
  gate: ['gate', 'boom'],
  mcp: ['mcp', 'jacks'],
  record: ['record', 'drawer'],
  decision: ['decision', 'press'],
  postflight: ['postflight'],
  propose: ['propose', 'sheet', 'letterbox'],
  bench: ['bench', 'cursor'],
  next: ['pad'],
};

// The parts that move, and so are put back at rest between steps.
export const MOVERS = ['pellets', 'stamp', 'reader', 'needle', 'card', 'boom', 'drawer', 'press', 'sheet', 'cursor'];

// Every part id the drawing carries: the ringed parts plus the needle, lamps, stations and windows
// that scenes switch on one by one.
export const PART_IDS = [
  ...new Set([
    ...Object.values(STEP_PARTS).flat(),
    ...MOVERS,
    'lamp-inform',
    'lamp-warn',
    'lamp-block',
    'station-1',
    'station-2',
    'station-3',
    'station-4',
    'window-1',
    'window-2',
    'window-3',
  ]),
];

const radians = Math.PI / 180;
const camera = (() => {
  const a = P.azimuth * radians;
  const e = P.elevation * radians;
  return { sinA: Math.sin(a), cosA: Math.cos(a), sinE: Math.sin(e), cosE: Math.cos(e), k: P.scale * Math.sqrt(1.6) };
})();

// Projects a world point to the drawing's screen coordinates.
function iso([x, y, z]) {
  const { sinA, cosA, sinE, cosE, k } = camera;
  return [P.origin[0] + (x * sinA - y * cosA) * k, P.origin[1] + ((x * cosA + y * sinA) * sinE - z * cosE) * k];
}

/** How far a world offset moves a part on the drawing: the screen vector from the origin to it. */
export function vec(offset) {
  const from = iso([0, 0, 0]);
  const to = iso(offset);
  return [to[0] - from[0], to[1] - from[1]];
}

/** A CSS translate for a screen vector. */
export function translate([dx, dy]) {
  return `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
}

/** The matrix that turns the needle on the dial face to `value` out of 100, as one screen matrix. */
export function needleMatrix(value) {
  const theta = (GAUGE.span * value) / 100;
  const { sinA, cosA, sinE, k } = camera;
  const a11 = k * sinA;
  const a12 = -k * cosA;
  const a21 = k * cosA * sinE;
  const a22 = k * sinA * sinE;
  const det = a11 * a22 - a12 * a21;
  const i11 = a22 / det;
  const i12 = -a12 / det;
  const i21 = -a21 / det;
  const i22 = a11 / det;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const r11 = a11 * c + a12 * s;
  const r12 = -a11 * s + a12 * c;
  const r21 = a21 * c + a22 * s;
  const r22 = -a21 * s + a22 * c;
  const m11 = r11 * i11 + r12 * i21;
  const m12 = r11 * i12 + r12 * i22;
  const m21 = r21 * i11 + r22 * i21;
  const m22 = r21 * i12 + r22 * i22;
  const [cx, cy] = iso([GAUGE.at[0], GAUGE.at[1], GAUGE.top]);
  const e = cx - (m11 * cx + m12 * cy);
  const f = cy - (m21 * cx + m22 * cy);
  return `matrix(${m11.toFixed(4)}, ${m21.toFixed(4)}, ${m12.toFixed(4)}, ${m22.toFixed(4)}, ${e.toFixed(2)}, ${f.toFixed(2)})`;
}

/** The frames of a needle sweep from zero to `value`, one matrix per frame. */
export function needleFrames(value, count = 32) {
  return Array.from({ length: count + 1 }, (_, i) => ({ transform: needleMatrix((value * i) / count) }));
}

// Each scene has a timed version (`play`) and a resting version (`still`) for visitors who asked
// for less motion. Both take the bench's small API: slide, put, needle, needleStill, on, later,
// and `decision`, the visitor's recorded choice or null.
export const SCENES = {
  sync: {
    play: (a) => a.slide('pellets', [[0, 0, 0], [TUBE_RUN * 0.5, 0, 0]], { dur: 1200, easing: 'linear', iterations: 2 }),
    still: (a) => a.put('pellets', [TUBE_RUN * 0.25, 0, 0]),
  },
  store: {
    play: (a) => a.slide('stamp', [[0, 0, 0], [0, 0, -STAMP_DROP], [0, 0, -STAMP_DROP], [0, 0, 0]], { dur: 1400, easing: SETTLE }),
    still: (a) => a.put('stamp', [0, 0, -STAMP_DROP]),
  },
  explain: {
    play: (a) => a.slide('reader', [[0, 0, 0], [0, READER_RUN, 0], [0, READER_RUN * 0.4, 0]], { dur: 2200, easing: SETTLE }),
    still: (a) => a.put('reader', [0, READER_RUN, 0]),
  },
  preflight: {
    play: (a) => {
      a.needle(NEEDLE_VALUE, 1600);
      a.later(1300, () => a.on('lamp-block', true));
    },
    still: (a) => {
      a.needleStill(NEEDLE_VALUE);
      a.on('lamp-block', true);
    },
  },
  review: {
    play: (a) => {
      a.slide('card', [[0, 0, 0], [CARD_RUN, 0, 0]], { dur: 2400, easing: SETTLE });
      [0, 700, 1400, 2100].forEach((ms, i) => a.later(ms, () => a.on(`station-${i + 1}`, true)));
    },
    still: (a) => {
      a.put('card', [CARD_RUN, 0, 0]);
      [1, 2, 3, 4].forEach((n) => a.on(`station-${n}`, true));
    },
  },
  gate: {
    play: (a) => a.slide('boom', [[0, 0, 0], [0, 0, -BOOM_DROP]], { dur: 1000, easing: SETTLE }),
    still: (a) => a.put('boom', [0, 0, -BOOM_DROP]),
  },
  mcp: { play: () => {}, still: () => {} },
  record: {
    play: (a) => a.slide('drawer', [[0, 0, 0], [0, DRAWER_OPEN, 0]], { dur: 1200, easing: SETTLE }),
    still: (a) => a.put('drawer', [0, DRAWER_OPEN, 0]),
  },
  decision: {
    play: (a) => {
      if (a.decision) a.slide('press', [[0, 0, 0], [0, 0, -PRESS_DROP], [0, 0, -PRESS_DROP], [0, 0, 0]], { dur: 1000, easing: SETTLE });
    },
    still: (a) => {
      if (a.decision) a.put('press', [0, 0, -PRESS_DROP]);
    },
  },
  postflight: {
    play: (a) => [500, 1200, 1900].forEach((ms, i) => a.later(ms, () => a.on(`window-${i + 1}`, true))),
    still: (a) => [1, 2, 3].forEach((n) => a.on(`window-${n}`, true)),
  },
  propose: {
    play: (a) =>
      a.slide(
        'sheet',
        Array.from({ length: 9 }, (_, i) => {
          const e = i / 8;
          return [SHEET_FLY[0] * e, SHEET_FLY[1] * e, SHEET_FLY[2] * e + Math.sin(Math.PI * e) * 10];
        }),
        { dur: 1800, easing: SETTLE },
      ),
    still: (a) => a.put('sheet', SHEET_FLY),
  },
  bench: {
    play: (a) => a.slide('cursor', [[0, 0, 0], [CURSOR_RUN, 0, 0]], { dur: 2400, easing: SETTLE }),
    still: (a) => a.put('cursor', [CURSOR_RUN, 0, 0]),
  },
  next: { play: () => {}, still: () => {} },
};

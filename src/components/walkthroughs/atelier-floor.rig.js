// The rig for the Atelier studio-floor figure (atelier-floor.svg): where each phase's station and
// the lit plate sit, how far the camera head runs, and what plays or rests on each phase. It is
// code, not content: every number here must match the one drawing, so it lives beside it
// (TG-08, D4).
//
// The drawing is the studio's figure scaled ten times to whole numbers, so every screen position
// below is the studio's value times ten. Durations are plain millisecond numbers because the copy
// scan reads this file.

// Where the lit plate rests at each phase's station, as a screen offset [x, y] from where the
// drawing places it.
export const POS = {
  intake: [-698, -1257],
  brief: [-389, -876],
  strategy: [-58, -527],
  ideas: [539, -282],
  lanes: [956, -15],
  rig: [1838, 549],
  critics: [1496, 957],
  pick: [582, 1183],
  refine: [86, 851],
  library: [-424, 524],
  handoff: [-956, 15],
  visitors: [-1759, -651],
};

// At the lanes phase the work is three plates, one on each rail.
export const LANE_POS = [
  [1075, -61],
  [956, -15],
  [838, 31],
];

// How far the camera head runs along the gantry, and for how long one pass takes.
export const SWEEP = [-356, 139];
const SWEEP_PASS = 3000;
const SWEEP_PASSES = 2;

// A plate's trip takes longer when it is longer, between these two bounds.
const TRAVEL_MIN = 450;
const TRAVEL_MAX = 900;
const TRAVEL_SPEED = 5;

const GLIDE = 'cubic-bezier(0.32, 0.72, 0, 1)';

// The parts that ring (take the phase's highlight) on each phase, in phase order.
export const STEP_PARTS = {
  intake: ['intake'],
  brief: ['brief'],
  strategy: ['strategy'],
  ideas: ['ideas'],
  lanes: ['lanes'],
  rig: ['rig'],
  critics: ['critics'],
  pick: ['pick'],
  refine: ['refine'],
  library: ['library'],
  handoff: ['handoff'],
  visitors: ['visitors'],
};

// The parts that move, and so are cancelled between phases.
export const MOVERS = ['plate-1', 'plate-2', 'plate-3', 'rig-head'];

// Every part id the drawing carries: the twelve stations, the three plates and the camera head.
export const PART_IDS = [...new Set([...Object.values(STEP_PARTS).flat(), ...MOVERS])];

/** A CSS translate for a screen offset. */
export function translate([dx, dy]) {
  return `translate(${dx}px, ${dy}px)`;
}

/** Where plate `index` rests for a phase: its own rail at the lanes, else the phase's station. */
export function targetFor(stepId, index) {
  return stepId === 'lanes' ? LANE_POS[index] : POS[stepId];
}

/** How long a plate takes to go from one place to another, in milliseconds. */
export function travelMilliseconds(from, to) {
  const distance = Math.hypot(to[0] - from[0], to[1] - from[1]);
  return Math.round(Math.min(TRAVEL_MAX, TRAVEL_MIN + distance / TRAVEL_SPEED));
}

// Every phase has a timed version (`play`) and a resting version (`still`) for visitors who asked
// for less motion. Both take the floor's small API: travel (the plates glide to the phase's
// station), put (they are there at once) and sweep (the camera head runs the gantry).
const station = (id) => ({
  play: (a) => a.travel(id),
  still: (a) => a.put(id),
});

export const SCENES = {
  intake: station('intake'),
  brief: station('brief'),
  strategy: station('strategy'),
  ideas: station('ideas'),
  lanes: station('lanes'),
  rig: {
    play: (a) => {
      a.travel('rig');
      a.sweep(SWEEP, { dur: SWEEP_PASS, iterations: SWEEP_PASSES, easing: 'ease-in-out' });
    },
    still: (a) => a.put('rig'),
  },
  critics: station('critics'),
  pick: station('pick'),
  refine: station('refine'),
  library: station('library'),
  handoff: station('handoff'),
  visitors: station('visitors'),
};

export { GLIDE };

// Pure helpers for the hero orb in ThinkingOrbHero.jsx, kept apart so they can be tested without
// a canvas.

// The OFF+BRAND hero gradient from docs/design-brief.md, at its own positions, far to near.
const BRAND_STOPS = [
  { position: 0, channels: channelsOf("#facb0e") },
  { position: 0.3, channels: channelsOf("#f06ba8") },
  { position: 0.65, channels: channelsOf("#78bae6") },
  { position: 1, channels: channelsOf("#ffffff") },
];

const MAX_CANVAS_WIDTH = 420;
const MIN_CANVAS_WIDTH = 280;
const VIEWPORT_GUTTER = 48;

/**
 * The brand colour for a dot at depth `z`, from -1 (farthest) to 1 (nearest), as a CSS `rgb()`
 * string. Depths outside that range take the end colours.
 */
export function colourForDepth(z) {
  const position = (Math.min(1, Math.max(-1, z)) + 1) / 2;
  const [lower, upper] = stopsAround(position);
  const fraction = (position - lower.position) / (upper.position - lower.position);

  const [red, green, blue] = lower.channels.map((channel, index) =>
    Math.round(channel + (upper.channels[index] - channel) * fraction),
  );
  return `rgb(${red}, ${green}, ${blue})`;
}

/** The orb's CSS width in pixels: 420 on wide viewports, never below 280 on narrow ones. */
export function canvasWidthForViewport(viewportWidth) {
  return Math.min(MAX_CANVAS_WIDTH, Math.max(MIN_CANVAS_WIDTH, viewportWidth - VIEWPORT_GUTTER));
}

function stopsAround(position) {
  for (let index = 1; index < BRAND_STOPS.length; index += 1) {
    if (position <= BRAND_STOPS[index].position) {
      return [BRAND_STOPS[index - 1], BRAND_STOPS[index]];
    }
  }
  return BRAND_STOPS.slice(-2);
}

function channelsOf(hex) {
  return [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));
}

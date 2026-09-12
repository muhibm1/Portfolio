// The hero animation: the orb package's "working" state, drawn at hero scale in the brand
// colours. The package's own component ships only 64 and 20 pixel grey presets (ADR 0003), so
// this takes the package's geometry and paints it here.
import { useEffect, useRef, useState } from "react";
import { MODE_FRAMES, resolvePreset } from "thinking-orbs/engine";
import { canvasWidthForViewport, colourForDepth } from "./orbDrawing.js";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// The moment the package itself shows when a visitor prefers reduced motion.
const STATIC_FRAME_TIME = 0.6;

// Matches the package: sharper than 2x costs fill rate and is not visible on a moving orb.
const MAX_PIXEL_RATIO = 2;

// The orbits geometry puts its outermost orbit at 0.82 of the half-width (the package's
// dist/engine.es.js line 239). Dividing a dot's depth by that radius gives colourForDepth's
// -1 to 1.
const OUTER_ORBIT_FRACTION = 0.82;

// At 420 pixels the 64 pixel preset's dots read too small and faint over the hero glow
// (owner's design preview, conductor log 2026-09-12T11:34).
const HERO_DOT_RADIUS_MULTIPLIER = 1.9;

const workingPreset = resolvePreset("working", 64);
const frameAt = MODE_FRAMES[workingPreset.mode];

export default function ThinkingOrbHero({ size = 420 }) {
  const canvasRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const displaySize = Math.min(size, canvasWidthForViewport(window.innerWidth));

  useEffect(() => {
    const canvas = canvasRef.current;
    const pixelRatio = Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1);
    canvas.width = Math.round(displaySize * pixelRatio);
    canvas.height = Math.round(displaySize * pixelRatio);

    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const drawAt = (time) => drawOrb(context, displaySize, pixelRatio, time);
    if (prefersReducedMotion) {
      drawAt(STATIC_FRAME_TIME);
      return undefined;
    }
    return animateWhileVisible(canvas, drawAt);
  }, [displaySize, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Decorative animation of orbiting dots"
      style={{ width: displaySize, height: displaySize, display: "block" }}
    />
  );
}

// Read during the first render, not only in an effect, so a visitor who prefers reduced motion
// never gets a single animation frame. Follows later changes to the setting live.
function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(readPrefersReducedMotion);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    const handleChange = (event) => setPrefersReducedMotion(event.matches);
    reducedMotion.addEventListener("change", handleChange);
    return () => reducedMotion.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

function readPrefersReducedMotion() {
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function drawOrb(context, size, pixelRatio, time) {
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, size, size);

  const outerOrbitRadius = (size / 2) * OUTER_ORBIT_FRACTION;
  const { dots } = frameAt(size, time, workingPreset.opts);
  for (const dot of dots) {
    context.globalAlpha = dot.a ?? 1;
    context.fillStyle = colourForDepth(dot.z / outerOrbitRadius);
    context.beginPath();
    context.arc(dot.x, dot.y, dot.r * HERO_DOT_RADIUS_MULTIPLIER, 0, Math.PI * 2);
    context.fill();
  }
}

// Runs the frame loop only while the canvas is on screen and the tab is visible, as the package
// does. Returns the cleanup that stops the loop and releases the observer and the listener.
function animateWhileVisible(canvas, drawAt) {
  const drawNow = () => drawAt((performance.now() / 1000) * workingPreset.speed);
  const loop = createFrameLoop(drawNow);
  const isTabHidden = () => document.visibilityState === "hidden";
  let isOnScreen = true;

  const handleIntersection = ([entry]) => {
    isOnScreen = entry.isIntersecting;
    if (isOnScreen && !isTabHidden()) loop.start();
    else loop.stop();
  };
  const handleVisibilityChange = () => {
    if (isTabHidden()) loop.stop();
    else if (isOnScreen) loop.start();
  };

  drawNow();
  const canObserve = typeof window.IntersectionObserver !== "undefined";
  const observer = canObserve ? new window.IntersectionObserver(handleIntersection) : null;
  if (observer) observer.observe(canvas);
  else if (!isTabHidden()) loop.start();
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    loop.stop();
    observer?.disconnect();
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}

// A frame that was already scheduled when the loop stopped does nothing, so nothing is drawn
// after the loop is stopped or the component unmounts.
function createFrameLoop(drawNow) {
  let frameId = 0;
  let isRunning = false;

  const tick = () => {
    if (!isRunning) return;
    drawNow();
    frameId = window.requestAnimationFrame(tick);
  };

  return {
    start() {
      if (isRunning) return;
      isRunning = true;
      frameId = window.requestAnimationFrame(tick);
    },
    stop() {
      if (!isRunning) return;
      isRunning = false;
      window.cancelAnimationFrame(frameId);
    },
  };
}

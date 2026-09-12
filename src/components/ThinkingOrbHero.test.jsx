import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MODE_FRAMES, resolvePreset } from "thinking-orbs/engine";
import ThinkingOrbHero from "./ThinkingOrbHero.jsx";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// The setup file restores matchMedia, IntersectionObserver and getContext after every test.
// These stubs are the only other globals the orb reads.
afterEach(() => {
  vi.unstubAllGlobals();
  delete document.visibilityState;
});

describe("ThinkingOrbHero", () => {
  it("renders one canvas, labelled as a decorative animation, 420 css pixels wide", () => {
    render(<ThinkingOrbHero />);

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(1);
    expect(images[0].tagName).toBe("CANVAS");
    expect(images[0]).toHaveAccessibleName(/decorative animation/i);
    expect(images[0].style.width).toBe("420px");
    expect(images[0].style.height).toBe("420px");
  });

  it.each([
    { viewport: 1024, expected: "420px" },
    { viewport: 320, expected: "280px" },
  ])("is $expected wide on a $viewport pixel viewport", ({ viewport, expected }) => {
    vi.stubGlobal("innerWidth", viewport);

    render(<ThinkingOrbHero />);

    expect(screen.getByRole("img").style.width).toBe(expected);
  });

  it.each([
    { ratio: 2, expected: 840 },
    { ratio: 3, expected: 840 },
    { ratio: 0, expected: 420 },
  ])("has a backing store of $expected at a device pixel ratio of $ratio", ({ ratio, expected }) => {
    vi.stubGlobal("devicePixelRatio", ratio);

    render(<ThinkingOrbHero />);

    const canvas = screen.getByRole("img");
    expect(canvas.width).toBe(expected);
    expect(canvas.height).toBe(expected);
  });

  it("does not throw when getContext returns null", () => {
    expect(() => render(<ThinkingOrbHero />)).not.toThrow();

    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("scales the drawing to the device pixel ratio before clearing a frame", () => {
    vi.stubGlobal("devicePixelRatio", 2);
    installMotionPreference({ reduce: true });
    const context = installRecordingContext();

    render(<ThinkingOrbHero />);

    expect(context.calls[0]).toEqual(["setTransform", 2, 0, 0, 2, 0, 0]);
    expect(context.calls[1]).toEqual(["clearRect", 0, 0, 420, 420]);
  });

  it("paints one frame at t = 0.6 and schedules no animation frame under reduced motion", async () => {
    installMotionPreference({ reduce: true });
    const context = installRecordingContext();
    const frames = installFrameRecorder();
    const observer = installViewportObserver();

    render(<ThinkingOrbHero />);
    act(() => observer.report(true));
    await act(async () => {});

    expect(frames.requested).toBe(0);
    expect(context.count("clearRect")).toBe(1);
    const paintedCentres = context.arcs().map(([x, y]) => [x, y]);
    expect(paintedCentres).toEqual(workingFrameAt(0.6).map((dot) => [dot.x, dot.y]));
  });

  it("paints each dot in a brand colour at the alpha the engine gives it", () => {
    installMotionPreference({ reduce: true });
    const context = installRecordingContext();

    render(<ThinkingOrbHero />);

    const fills = context.fills();
    expect(fills.map(({ alpha }) => alpha)).toEqual(workingFrameAt(0.6).map((dot) => dot.a ?? 1));
    expect(fills.every(({ style }) => /^rgb\(\d+, \d+, \d+\)$/.test(style))).toBe(true);
  });

  it("stops animating when the reduced-motion preference changes to reduce", () => {
    const preference = installMotionPreference({ reduce: false });
    const context = installRecordingContext();
    const frames = installFrameRecorder();
    delete window.IntersectionObserver;
    render(<ThinkingOrbHero />);
    const requestedWhileAnimating = frames.requested;
    const clearsWhileAnimating = context.count("clearRect");

    act(() => preference.change(true));
    frames.run(frames.lastId);

    expect(requestedWhileAnimating).toBe(1);
    expect(frames.cancelled).toBe(1);
    expect(frames.requested).toBe(requestedWhileAnimating);
    expect(context.count("clearRect")).toBe(clearsWhileAnimating + 1);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("pauses when the canvas leaves the viewport and resumes when it returns", () => {
    const frames = installFrameRecorder();
    const observer = installViewportObserver();
    installRecordingContext();
    render(<ThinkingOrbHero />);

    act(() => observer.report(true));
    const requestedOnScreen = frames.requested;
    act(() => observer.report(false));
    const cancelledOffScreen = frames.cancelled;
    act(() => observer.report(true));

    expect(requestedOnScreen).toBe(1);
    expect(cancelledOffScreen).toBe(1);
    expect(frames.requested).toBe(2);
  });

  it("pauses while the tab is hidden and resumes when it is shown again", () => {
    const frames = installFrameRecorder();
    const observer = installViewportObserver();
    installRecordingContext();
    render(<ThinkingOrbHero />);
    act(() => observer.report(true));

    act(() => setTabVisibility("hidden"));
    const cancelledWhileHidden = frames.cancelled;
    act(() => setTabVisibility("visible"));

    expect(cancelledWhileHidden).toBe(1);
    expect(frames.requested).toBe(2);
  });

  it("releases its frame, observer and listeners on unmount", () => {
    const preference = installMotionPreference({ reduce: false });
    const frames = installFrameRecorder();
    const observer = installViewportObserver();
    installRecordingContext();
    const { unmount } = render(<ThinkingOrbHero />);
    act(() => observer.report(true));

    unmount();
    setTabVisibility("visible");

    expect(frames.cancelled).toBe(1);
    expect(observer.disconnectCount).toBe(1);
    expect(preference.listenerCount()).toBe(0);
    expect(frames.requested).toBe(1);
  });

  it("never paints a frame that fires after unmount", () => {
    const frames = installFrameRecorder();
    const observer = installViewportObserver();
    const context = installRecordingContext();
    const { unmount } = render(<ThinkingOrbHero />);
    act(() => observer.report(true));
    const scheduledFrame = frames.lastId;

    unmount();
    const drawCallsAtUnmount = context.calls.length;
    frames.run(scheduledFrame);

    expect(context.calls.length).toBe(drawCallsAtUnmount);
    expect(frames.requested).toBe(1);
  });

  it("renders and animates when matchMedia is missing", () => {
    delete window.matchMedia;
    installRecordingContext();
    const frames = installFrameRecorder();
    const observer = installViewportObserver();

    render(<ThinkingOrbHero />);
    act(() => observer.report(true));

    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(frames.requested).toBe(1);
  });

  it("renders and runs unpaused when IntersectionObserver is missing", () => {
    delete window.IntersectionObserver;
    installRecordingContext();
    const frames = installFrameRecorder();

    render(<ThinkingOrbHero />);

    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(frames.requested).toBe(1);
  });

  it("leaves equal request and cancel counts after 20 mount-and-unmount cycles", () => {
    installRecordingContext();
    const frames = installFrameRecorder();
    const observer = installViewportObserver();

    for (let cycle = 0; cycle < 20; cycle += 1) {
      const { unmount } = render(<ThinkingOrbHero />);
      act(() => observer.report(true));
      unmount();
    }

    expect(frames.requested).toBe(20);
    expect(frames.cancelled).toBe(frames.requested);
  });
});

function workingFrameAt(time) {
  const { mode, opts } = resolvePreset("working", 64);
  return MODE_FRAMES[mode](420, time, opts).dots;
}

// Stands in for a 2D canvas context and records every drawing call in order.
function installRecordingContext() {
  const calls = [];
  const context = {
    fillStyle: "",
    globalAlpha: 1,
    setTransform: (...args) => calls.push(["setTransform", ...args]),
    clearRect: (...args) => calls.push(["clearRect", ...args]),
    beginPath: () => calls.push(["beginPath"]),
    arc: (...args) => calls.push(["arc", ...args]),
    fill: () => calls.push(["fill", context.fillStyle, context.globalAlpha]),
  };
  HTMLCanvasElement.prototype.getContext = () => context;

  const argumentsOf = (name) => calls.filter(([call]) => call === name).map(([, ...args]) => args);
  return {
    calls,
    count: (name) => argumentsOf(name).length,
    arcs: () => argumentsOf("arc"),
    fills: () => argumentsOf("fill").map(([style, alpha]) => ({ style, alpha })),
  };
}

// Replaces the browser's frame scheduler so the test decides when, and whether, a frame runs.
function installFrameRecorder() {
  const callbacks = new Map();
  const frames = {
    requested: 0,
    cancelled: 0,
    lastId: 0,
    run: (id) => callbacks.get(id)(performance.now()),
  };
  vi.stubGlobal("requestAnimationFrame", (callback) => {
    frames.requested += 1;
    frames.lastId += 1;
    callbacks.set(frames.lastId, callback);
    return frames.lastId;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {
    frames.cancelled += 1;
  });
  return frames;
}

// A reduced-motion setting the test can flip mid-session, as a visitor can in system settings.
function installMotionPreference({ reduce }) {
  const listeners = new Set();
  const reducedMotion = {
    matches: reduce,
    media: REDUCED_MOTION_QUERY,
    addEventListener: (type, listener) => listeners.add(listener),
    removeEventListener: (type, listener) => listeners.delete(listener),
  };
  const otherQuery = { ...reducedMotion, matches: false, addEventListener() {}, removeEventListener() {} };
  window.matchMedia = (query) => (query === REDUCED_MOTION_QUERY ? reducedMotion : otherQuery);

  return {
    listenerCount: () => listeners.size,
    change(toReduce) {
      reducedMotion.matches = toReduce;
      listeners.forEach((listener) => listener({ matches: toReduce }));
    },
  };
}

// Lets the test report the canvas entering or leaving the viewport.
function installViewportObserver() {
  const observer = { disconnectCount: 0, report: () => {} };
  window.IntersectionObserver = class {
    constructor(callback) {
      observer.report = (isIntersecting) => callback([{ isIntersecting }]);
    }
    observe() {}
    unobserve() {}
    disconnect() {
      observer.disconnectCount += 1;
    }
  };
  return observer;
}

function setTabVisibility(state) {
  Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
}

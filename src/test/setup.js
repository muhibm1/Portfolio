// Runs before every Vitest file (vite.config.js, test.setupFiles). jsdom lacks several browser
// APIs the site calls, so every test starts with fresh inert stand-ins, installed in beforeEach
// and removed in afterEach. A test may replace or spy on any of them without affecting the next.
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";

const pendingRestores = [];

beforeEach(() => {
  replaceProperty(window, "matchMedia", matchMediaThatNeverMatches);
  replaceProperty(window, "IntersectionObserver", IntersectionObserverThatNeverFires);
  replaceProperty(window, "scrollTo", doNothing);
  replaceProperty(Element.prototype, "scrollIntoView", doNothing);
  replaceProperty(HTMLCanvasElement.prototype, "getContext", () => null);
});

afterEach(() => {
  while (pendingRestores.length > 0) {
    const restore = pendingRestores.pop();
    restore();
  }
});

function replaceProperty(owner, name, replacement) {
  const original = Object.getOwnPropertyDescriptor(owner, name);
  Object.defineProperty(owner, name, { value: replacement, configurable: true, writable: true });

  pendingRestores.push(() => {
    if (original === undefined) {
      delete owner[name];
      return;
    }
    Object.defineProperty(owner, name, original);
  });
}

function doNothing() {}

// Reports "no preference" for every query, which is what a browser with default settings answers
// for prefers-reduced-motion. Listeners can be added and removed but never fire.
function matchMediaThatNeverMatches(query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addEventListener: doNothing,
    removeEventListener: doNothing,
    addListener: doNothing,
    removeListener: doNothing,
    dispatchEvent: () => false,
  };
}

class IntersectionObserverThatNeverFires {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

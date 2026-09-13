import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { computeBasename } from './basename';
import { portfolioData } from './data/portfolioData';

const { caseStudies, personal, telemetry } = portfolioData;

const HOME_SECTION_IDS = ['overview', 'philosophy', 'case-studies', 'simulator', 'experience', 'skills'];
const NOT_FOUND_HEADING = 'Page not found';
// Vite's BASE_URL on GitHub Pages, before computeBasename strips its trailing slash.
const PAGES_BASE_URL = '/Portfolio/';

const levelOneHeadingByPath = [
  { path: '/', heading: personal.name },
  { path: '/work', heading: 'Work' },
  ...caseStudies.map((study) => ({ path: `/work/${study.id}`, heading: study.title })),
  { path: '/work/no-such-study', heading: NOT_FOUND_HEADING },
];

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('route table', () => {
  it.each(levelOneHeadingByPath)('renders the level-1 heading "$heading" at $path', ({ path, heading }) => {
    renderAppAt(path);

    expect(levelOneHeadingText()).toBe(heading);
  });

  it.each(['/no-such-page', '/resume'])('renders the not-found page at %s', (path) => {
    renderAppAt(path);

    expect(levelOneHeadingText()).toBe(NOT_FOUND_HEADING);
  });

  it('renders the case study for a slug with a trailing slash, the same as without one', () => {
    renderAppAt('/work/apple-llm-triage/');

    expect(levelOneHeadingText()).toBe(caseStudyTitle('apple-llm-triage'));
  });

  it.each(levelOneHeadingByPath)('offers no log in or sign up control at $path', ({ path }) => {
    renderAppAt(path);

    for (const role of ['link', 'button']) {
      expect(screen.queryAllByRole(role, { name: /log ?in|sign ?up/i })).toEqual([]);
    }
  });
});

describe('scroll position on navigation', () => {
  it('scrolls the window to the top when a link moves from / to /work', () => {
    const scrollTo = spyOnScrollTo();
    renderAppAt('/');

    fireEvent.click(screen.getByRole('link', { name: 'Work' }));

    expect(levelOneHeadingText()).toBe('Work');
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('leaves the scroll position alone on the first render', () => {
    const scrollTo = spyOnScrollTo();

    renderAppAt('/work');

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('leaves the scrolling to the home page when the new address has a hash', () => {
    const scrollTo = spyOnScrollTo();
    renderAppAt('/work');

    fireEvent.click(within(screen.getByRole('region', { name: 'Live demo' })).getByRole('link'));

    expect(levelOneHeadingText()).toBe(personal.name);
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

describe('home section scroll spy', () => {
  it('registers no scroll handler on /work that reads the home section ids', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');
    renderAppAt('/work');
    const getElementById = vi.spyOn(document, 'getElementById');

    const scrollHandlers = scrollHandlersFrom(addEventListener);
    runEach(scrollHandlers);

    expect(scrollHandlers.length).toBeGreaterThan(0);
    expect(homeSectionLookups(getElementById)).toEqual([]);
  });

  it('registers a scroll handler on / that reads the home section ids', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');
    renderAppAt('/');
    const getElementById = vi.spyOn(document, 'getElementById');

    runEach(scrollHandlersFrom(addEventListener));

    expect(homeSectionLookups(getElementById)).toEqual(expect.arrayContaining(HOME_SECTION_IDS));
  });
});

// main.jsx passes computeBasename(import.meta.env.BASE_URL) to BrowserRouter. These tests pass the
// raw BASE_URL instead, to show what the helper protects against in react-router 7.18.3.
describe('Pages base path', () => {
  it('renders nothing at all for the bare /Portfolio address when the base keeps its trailing slash', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { container } = renderAppAt('/Portfolio', { basename: PAGES_BASE_URL });

    expect(container).toBeEmptyDOMElement();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("won't render anything"));
  });

  it('renders the home page for the bare /Portfolio address once computeBasename strips the slash', () => {
    renderAppAt('/Portfolio', { basename: computeBasename(PAGES_BASE_URL) });

    expect(levelOneHeadingText()).toBe(personal.name);
  });

  it('still routes /Portfolio/work to the work index when the base keeps its trailing slash', () => {
    renderAppAt('/Portfolio/work', { basename: PAGES_BASE_URL });

    expect(levelOneHeadingText()).toBe('Work');
  });
});

describe('home page resilience', () => {
  // The setup file makes every canvas return null from getContext, so the orb has nothing to draw on.
  it('renders the whole home page when the canvas offers no 2d context', () => {
    renderAppAt('/');

    expect(levelOneHeadingText()).toBe(personal.name);
    const hero = document.getElementById('overview');
    for (const item of telemetry) {
      expect(within(hero).getByText(item.metric)).toBeInTheDocument();
    }
    for (const sectionId of HOME_SECTION_IDS) {
      expect(document.getElementById(sectionId)).not.toBeNull();
    }
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('leaves no timers and no uncancelled animation frames after 20 visits to /', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });
    const frames = recordAnimationFrames();
    HTMLCanvasElement.prototype.getContext = () => drawingContextThatDrawsNothing;
    // Without an observer the orb starts animating as soon as it mounts.
    delete window.IntersectionObserver;

    for (let visit = 0; visit < 20; visit += 1) {
      const { unmount } = renderAppAt('/');
      unmount();
    }

    expect(frames.requested).toBe(20);
    expect(frames.cancelled).toBe(frames.requested);
    expect(vi.getTimerCount()).toBe(0);
  });
});

// BrowserRouter lives in main.jsx, so tests supply their own router around App.
function renderAppAt(path, { basename } = {}) {
  return render(
    <MemoryRouter basename={basename} initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function levelOneHeadingText() {
  return screen.getByRole('heading', { level: 1 }).textContent.replace(/\s+/g, ' ').trim();
}

function caseStudyTitle(caseStudyId) {
  return caseStudies.find((study) => study.id === caseStudyId).title;
}

function spyOnScrollTo() {
  const scrollTo = vi.fn();
  window.scrollTo = scrollTo;
  return scrollTo;
}

function scrollHandlersFrom(addEventListener) {
  return addEventListener.mock.calls.filter(([type]) => type === 'scroll').map(([, handler]) => handler);
}

function runEach(scrollHandlers) {
  act(() => {
    for (const handler of scrollHandlers) handler(new Event('scroll'));
  });
}

function homeSectionLookups(getElementById) {
  return getElementById.mock.calls.map(([id]) => id).filter((id) => HOME_SECTION_IDS.includes(id));
}

// Replaces the browser's frame scheduler with one that only counts; no frame ever runs.
function recordAnimationFrames() {
  const frames = { requested: 0, cancelled: 0 };
  vi.stubGlobal('requestAnimationFrame', () => {
    frames.requested += 1;
    return frames.requested;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {
    frames.cancelled += 1;
  });
  return frames;
}

const drawingContextThatDrawsNothing = {
  fillStyle: '',
  globalAlpha: 1,
  setTransform() {},
  clearRect() {},
  beginPath() {},
  arc() {},
  fill() {},
};

import { act, fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Outlet, Route, Routes } from 'react-router';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import HomePage from './HomePage';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const HOME_SECTION_IDS = ['overview', 'philosophy', 'case-studies', 'simulator', 'experience', 'skills'];

// The setup file replaces scrollIntoView and matchMedia before every test and restores them after.
describe('HomePage', () => {
  it('renders the six home sections with their ids unchanged', () => {
    const { container } = renderHomePageAt('/');

    const sectionIds = [...container.querySelectorAll('section[id]')].map((section) => section.id);
    expect(sectionIds).toEqual(HOME_SECTION_IDS);
  });

  it('scrolls the simulator into view smoothly when the url hash names it', () => {
    const scrollIntoView = spyOnScrollIntoView();

    renderHomePageAt('/#simulator');

    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('simulator'));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('scrolls the simulator into view without smooth scrolling when reduced motion is preferred', () => {
    preferReducedMotion();
    const scrollIntoView = spyOnScrollIntoView();

    renderHomePageAt('/#simulator');

    expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById('simulator'));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto' });
  });

  it('scrolls again when the hash changes while the page is open', () => {
    const scrollIntoView = spyOnScrollIntoView();
    renderHomePageAt('/#simulator', { layoutLink: '/#skills' });

    fireEvent.click(screen.getByRole('link', { name: 'test layout link' }));

    expect(scrollIntoView).toHaveBeenCalledTimes(2);
    expect(scrollIntoView.mock.contexts[1]).toBe(document.getElementById('skills'));
  });

  it('neither throws nor scrolls when the hash names no element on the page', () => {
    const scrollIntoView = spyOnScrollIntoView();

    expect(() => renderHomePageAt('/#nonexistent-id')).not.toThrow();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('neither throws nor scrolls for a unicode hash, raw or percent-encoded', () => {
    const scrollIntoView = spyOnScrollIntoView();

    expect(() => renderHomePageAt('/#日本語')).not.toThrow();
    expect(() => renderHomePageAt('/#%E6%97%A5%E6%9C%AC%E8%AA%9E')).not.toThrow();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('neither throws nor scrolls for a malformed percent-encoded hash', () => {
    const scrollIntoView = spyOnScrollIntoView();

    expect(() => renderHomePageAt('/#%E0%A4%A')).not.toThrow();

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('treats a markup injection attempt in the hash as a missing id and runs none of it', () => {
    const scrollIntoView = spyOnScrollIntoView();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const getElementById = vi.spyOn(document, 'getElementById');
    const payload = '"><img src=x onerror=alert(1)>';

    expect(() => renderHomePageAt(`/#${payload}`)).not.toThrow();

    const payloadLookup = getElementById.mock.calls.findIndex(([id]) => id === payload);
    expect(payloadLookup).not.toBe(-1);
    expect(getElementById.mock.results[payloadLookup].value).toBeNull();
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(document.querySelector('img[onerror]')).toBeNull();
    expect(alert).not.toHaveBeenCalled();
  });

  it('tells the layout which home section is under the scroll position', () => {
    const setActiveSection = vi.fn();
    renderHomePageAt('/', { setActiveSection });
    placeOnPage(document.getElementById('philosophy'), { top: 0, height: 900 });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(setActiveSection).toHaveBeenCalledWith('philosophy');
  });

  it('stops reporting scroll positions once the page is unmounted', () => {
    const setActiveSection = vi.fn();
    const { unmount } = renderHomePageAt('/', { setActiveSection });
    unmount();
    // A stand-in section left on the page, so a leaked listener would have something to report.
    const leftoverSection = document.createElement('section');
    leftoverSection.id = 'philosophy';
    document.body.append(leftoverSection);
    onTestFinished(() => leftoverSection.remove());
    placeOnPage(leftoverSection, { top: 0, height: 900 });

    window.dispatchEvent(new Event('scroll'));

    expect(setActiveSection).not.toHaveBeenCalled();
  });
});

// Mounts HomePage the way the site's layout route does: as the index child of a pathless route
// whose Outlet hands down setActiveSection. layoutLink adds a link for in-page navigation.
function renderHomePageAt(path, { setActiveSection = () => {}, layoutLink } = {}) {
  const testLayout = (
    <>
      {layoutLink && <Link to={layoutLink}>test layout link</Link>}
      <Outlet context={{ setActiveSection }} />
    </>
  );

  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={testLayout}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

function spyOnScrollIntoView() {
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  return scrollIntoView;
}

function preferReducedMotion() {
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = (query) => ({
    ...originalMatchMedia(query),
    matches: query === REDUCED_MOTION_QUERY,
  });
}

// jsdom does no layout, so every element reports offsetTop and offsetHeight of 0.
function placeOnPage(element, { top, height }) {
  Object.defineProperty(element, 'offsetTop', { value: top, configurable: true });
  Object.defineProperty(element, 'offsetHeight', { value: height, configurable: true });
}

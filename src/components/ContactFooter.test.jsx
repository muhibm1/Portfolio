import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { portfolioData } from '../data/portfolioData';
import { REDUCED_MOTION_QUERY } from '../prefersReducedMotion';
import ContactFooter from './ContactFooter';

// R91: the footer renders on every route, so Back to Top is checked on each kind of page.
const EVERY_KIND_OF_PAGE = ['/', '/work', '/work/apple-llm-triage', '/work/no-such-study', '/no-such-page'];

// Any North American number, with or without separators. Tests never contain the owner's own
// digits (plan rule 3), so they detect the shape instead.
const phoneNumberPattern = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

afterEach(() => {
  delete navigator.clipboard;
  vi.useRealTimers();
});

describe('ContactFooter', () => {
  it('links to personal.email', () => {
    renderFooter();

    const emailLink = screen.getByRole('link', { name: portfolioData.personal.email });

    expect(emailLink).toHaveAttribute('href', `mailto:${portfolioData.personal.email}`);
  });

  it('shows no phone number', () => {
    const { container } = renderFooter();

    expect(container.textContent).not.toMatch(phoneNumberPattern);
    expect(screen.queryByText(/direct phone/i)).toBeNull();
  });

  it('confirms a successful copy with the address from portfolioData', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard({ writeText });
    renderFooter();

    await clickAndSettle(copyEmailButton());

    expect(writeText).toHaveBeenCalledWith(portfolioData.personal.email);
    expect(screen.getByText(`Copied ${portfolioData.personal.email}`)).toBeInTheDocument();
  });

  it('clears the copy-confirmation timer on unmount', async () => {
    vi.useFakeTimers();
    stubClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    const { unmount } = renderFooter();

    await clickAndSettle(copyEmailButton());
    expect(vi.getTimerCount()).toBe(1);
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps one pending timer after a double click', async () => {
    vi.useFakeTimers();
    stubClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    const { unmount } = renderFooter();
    const button = copyEmailButton();

    await act(async () => {
      fireEvent.click(button);
      fireEvent.click(button);
    });
    expect(vi.getTimerCount()).toBe(1);
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not report a successful copy when the clipboard rejects', async () => {
    stubClipboard({ writeText: vi.fn().mockRejectedValue(new Error('Permission denied')) });
    renderFooter();

    await clickAndSettle(copyEmailButton());

    expect(screen.queryByText(/copied/i)).toBeNull();
    expect(screen.getByText(/copy failed/i)).toBeInTheDocument();
  });

  it('reports a failed copy when the browser offers no clipboard', async () => {
    stubClipboard(undefined);
    renderFooter();

    await clickAndSettle(copyEmailButton());

    expect(screen.queryByText(/copied/i)).toBeNull();
    expect(screen.getByText(/copy failed/i)).toBeInTheDocument();
  });
});

// The setup file replaces window.scrollTo and matchMedia before every test and restores them after.
describe('ContactFooter Back to Top', () => {
  it.each(EVERY_KIND_OF_PAGE)('scrolls smoothly to the top of %s without leaving the page', (path) => {
    const scrollTo = spyOnScrollTo();
    renderAppAt(path);
    const headingBeforeClick = levelOneHeadingText();

    fireEvent.click(backToTopButton());

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(levelOneHeadingText()).toBe(headingBeforeClick);
    expect(screen.queryByRole('link', { name: /back to top/i })).toBeNull();
  });

  it('scrolls to the top without smooth scrolling when reduced motion is preferred', () => {
    preferReducedMotion();
    const scrollTo = spyOnScrollTo();
    renderAppAt('/work');

    fireEvent.click(backToTopButton());

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });
});

function renderFooter() {
  return render(
    <MemoryRouter>
      <ContactFooter onOpenResume={() => {}} />
    </MemoryRouter>,
  );
}

// BrowserRouter lives in main.jsx, so tests supply their own router around App.
function renderAppAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function levelOneHeadingText() {
  return screen.getByRole('heading', { level: 1 }).textContent.replace(/\s+/g, ' ').trim();
}

function backToTopButton() {
  return screen.getByRole('button', { name: /back to top/i });
}

function spyOnScrollTo() {
  const scrollTo = vi.fn();
  window.scrollTo = scrollTo;
  return scrollTo;
}

function preferReducedMotion() {
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = (query) => ({
    ...originalMatchMedia(query),
    matches: query === REDUCED_MOTION_QUERY,
  });
}

function copyEmailButton() {
  return screen.getByRole('button', { name: /copy email address/i });
}

async function clickAndSettle(element) {
  await act(async () => {
    fireEvent.click(element);
  });
}

// jsdom has no clipboard, so each test installs the one it needs; afterEach removes it.
function stubClipboard(clipboard) {
  Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true });
}

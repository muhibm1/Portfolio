import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import ContactFooter from './ContactFooter';

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

function renderFooter() {
  return render(
    <MemoryRouter>
      <ContactFooter onOpenResume={() => {}} />
    </MemoryRouter>,
  );
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

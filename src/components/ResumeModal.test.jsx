import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import ResumeModal from './ResumeModal';

// Any North American number, with or without separators. Tests never contain the owner's own
// digits (plan rule 3), so they detect the shape instead.
const phoneNumberPattern = /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

afterEach(() => {
  delete navigator.clipboard;
  vi.useRealTimers();
});

describe('ResumeModal', () => {
  it('links to personal.email', () => {
    renderModal();

    const emailLink = screen.getByRole('link', { name: portfolioData.personal.email });

    expect(emailLink).toHaveAttribute('href', `mailto:${portfolioData.personal.email}`);
  });

  it('shows no phone number', () => {
    const { container } = renderModal();

    expect(container.textContent).not.toMatch(phoneNumberPattern);
  });

  it('copies a summary that carries personal.email and no phone number', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard({ writeText });
    renderModal();

    await clickAndSettle(copySummaryButton());
    const copiedText = writeText.mock.calls[0][0];

    expect(copiedText).toContain(portfolioData.personal.email);
    expect(copiedText).not.toMatch(phoneNumberPattern);
  });

  it('clears the copy-confirmation timer on unmount', async () => {
    vi.useFakeTimers();
    stubClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    const { unmount } = renderModal();

    await clickAndSettle(copySummaryButton());
    expect(vi.getTimerCount()).toBe(1);
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it('leaves no timer when closed while the copy is still pending', async () => {
    vi.useFakeTimers();
    let finishCopy;
    stubClipboard({ writeText: vi.fn(() => new Promise((resolve) => { finishCopy = resolve; })) });
    const { unmount } = renderModal();

    await clickAndSettle(copySummaryButton());
    unmount();
    await act(async () => {
      finishCopy();
    });

    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not report a successful copy when the clipboard rejects', async () => {
    stubClipboard({ writeText: vi.fn().mockRejectedValue(new Error('Permission denied')) });
    renderModal();

    await clickAndSettle(copySummaryButton());

    expect(screen.queryByText(/copied/i)).toBeNull();
    expect(screen.getByText(/copy failed/i)).toBeInTheDocument();
  });

  it('reports a failed copy when the browser offers no clipboard', async () => {
    stubClipboard(undefined);
    renderModal();

    await clickAndSettle(copySummaryButton());

    expect(screen.queryByText(/copied/i)).toBeNull();
    expect(screen.getByText(/copy failed/i)).toBeInTheDocument();
  });
});

function renderModal() {
  return render(
    <MemoryRouter>
      <ResumeModal onClose={() => {}} />
    </MemoryRouter>,
  );
}

function copySummaryButton() {
  return screen.getByRole('button', { name: /copy summary/i });
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

import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import Navbar from './Navbar';

const homeSectionAnchors = ['#philosophy', '#case-studies', '#simulator', '#experience', '#skills'];

afterEach(() => {
  delete navigator.clipboard;
  vi.useRealTimers();
});

describe('Navbar', () => {
  it('shows the section anchors and a Work link on the home page', () => {
    renderNavbarAt('/');

    expect(linkHrefs()).toEqual(expect.arrayContaining([...homeSectionAnchors, '/work']));
  });

  it('shows a Work link and no home section anchors on /work', () => {
    renderNavbarAt('/work');

    expect(screen.getByRole('link', { name: /^work$/i })).toHaveAttribute('href', '/work');
    expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('link', { name: /philosophy/i })).toBeNull();
    expect(linkHrefs().filter((href) => href.startsWith('#'))).toEqual([]);
  });

  it('copies and displays the email address from portfolioData', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard({ writeText });
    renderNavbarAt('/');

    expect(screen.getByText(portfolioData.personal.email)).toBeInTheDocument();
    await clickAndSettle(copyEmailButton());

    expect(writeText).toHaveBeenCalledWith(portfolioData.personal.email);
  });

  it('clears the copy-confirmation timer on unmount', async () => {
    vi.useFakeTimers();
    stubClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    const { unmount } = renderNavbarAt('/');

    await clickAndSettle(copyEmailButton());
    expect(vi.getTimerCount()).toBe(1);
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps one pending timer after a double click', async () => {
    vi.useFakeTimers();
    stubClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });
    const { unmount } = renderNavbarAt('/');
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
    renderNavbarAt('/');

    await clickAndSettle(copyEmailButton());

    expect(screen.queryByText(/copied/i)).toBeNull();
    expect(screen.getByText(/copy failed/i)).toBeInTheDocument();
  });

  it('reports a failed copy when the browser offers no clipboard', async () => {
    stubClipboard(undefined);
    renderNavbarAt('/');

    await clickAndSettle(copyEmailButton());

    expect(screen.queryByText(/copied/i)).toBeNull();
    expect(screen.getByText(/copy failed/i)).toBeInTheDocument();
  });
});

function renderNavbarAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar activeSection="" onOpenResume={() => {}} />
    </MemoryRouter>,
  );
}

function linkHrefs() {
  return screen.getAllByRole('link').map((link) => link.getAttribute('href'));
}

function copyEmailButton() {
  return screen.getByRole('button', { name: /copy email/i });
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

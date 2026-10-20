import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes, useNavigate } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { pageMetaFor } from '../pageMeta';
import SiteLayout from './SiteLayout';

// The resume modal, the footer and the navbar scroll spy are gone from this layout (R133, R137);
// the header is covered by SiteHeader.test.jsx. T10 wires usePageTitle to pageMetaFor, so the tab
// title now follows the route (R139).
describe('SiteLayout', () => {
  it('renders the header and the routed page', () => {
    renderLayoutAt('/');

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Stub outlet')).toBeInTheDocument();
  });

  it('sets the document title from pageMetaFor for the current route', () => {
    renderLayoutAt('/work');

    expect(document.title).toBe(pageMetaFor('/work').title);
  });

  // Clicking a link to a new page starts that page at the top; going back keeps the browser's place.
  it('scrolls to the top when a link leads to a new page', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo');
    renderLayoutAt('/');
    scrollTo.mockClear();

    fireEvent.click(screen.getByRole('link', { name: 'Go to work' }));

    expect(screen.getByText('Work page')).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('does not scroll to the top on the first render', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo');
    renderLayoutAt('/work');

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('leaves a link with a hash to the page that owns the hash', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo');
    renderLayoutAt('/work');
    scrollTo.mockClear();

    fireEvent.click(screen.getByRole('link', { name: 'Go to section' }));

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('keeps the place when the visitor goes back', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo');
    renderLayoutAt('/');
    fireEvent.click(screen.getByRole('link', { name: 'Go to work' }));
    scrollTo.mockClear();

    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

    expect(scrollTo).not.toHaveBeenCalled();
  });
});

function renderLayoutAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route
            index
            element={
              <div>
                Stub outlet
                <Link to="/work">Go to work</Link>
              </div>
            }
          />
          <Route
            path="work"
            element={
              <div>
                Stub outlet
                <p>Work page</p>
                <BackButton />
                <Link to="/work#section">Go to section</Link>
              </div>
            }
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

// A stand-in for the browser's Back button, which MemoryRouter has no UI for.
function BackButton() {
  const navigate = useNavigate();
  return <button onClick={() => navigate(-1)}>Go back</button>;
}

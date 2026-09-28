import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
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
});

function renderLayoutAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<div>Stub outlet</div>} />
          <Route path="work" element={<div>Stub outlet</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

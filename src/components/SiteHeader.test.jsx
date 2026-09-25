import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { portfolioData } from '../data/portfolioData';
import { pageMetaFor } from '../pageMeta';
import SiteLayout from './SiteLayout';

// G8. SiteHeader renders inside SiteLayout, so these tests mount SiteLayout with a stub outlet
// rather than App: HomePage and CaseStudyPage are still red until T8 and T7 land.
describe('SiteHeader', () => {
  it('shows the home section links and a Resume link to the PDF on /', () => {
    renderSiteLayoutAt('/');

    expect(headerLinkHref('Case studies')).toBe('#work');
    expect(headerLinkHref('How I work')).toBe('#approach');
    expect(headerLinkHref('Experience')).toBe('#experience');
    expect(headerLinkHref('Contact')).toBe('#contact');
    expect(headerLinkHref('Resume')).toBe(`${import.meta.env.BASE_URL}${portfolioData.personal.resumeFileName}`);
  });

  it('shows Home, All case studies and Contact on a case-study page', () => {
    renderSiteLayoutAt('/work/workhorse');

    expect(headerLinkHref('Home')).toBe('/');
    expect(headerLinkHref('All case studies')).toBe('/work');
    expect(headerLinkHref('Contact')).toBe('#contact');
    expect(screen.queryByRole('link', { name: 'Case studies' })).toBeNull();
  });

  it('has no copy-email control', () => {
    renderSiteLayoutAt('/');

    expect(screen.queryByRole('button', { name: /copy email/i })).toBeNull();
    expect(screen.queryByText(/copy email/i)).toBeNull();
  });

  it('toggles the mobile menu panel on the Open menu button', () => {
    renderSiteLayoutAt('/');
    const menuButton = screen.getByRole('button', { name: 'Open menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(panelLinks()).toHaveLength(0);

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(panelLinks().map((link) => link.textContent)).toEqual(
      expect.arrayContaining(['Case studies', 'How I work', 'Experience', 'Contact']),
    );

    fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(panelLinks()).toHaveLength(0);
  });
});

// E3. Renders the real App (not a stub outlet), so the header, the routed page and the title
// wiring are exercised together, the way a visitor experiences them.
describe('SiteHeader inside App (E3)', () => {
  it('links Contact to an id="contact" element on the work index', () => {
    renderAppAt('/work');

    const contactLink = within(screen.getByRole('banner')).getByRole('link', { name: 'Contact' });
    expect(contactLink).toHaveAttribute('href', '#contact');
    expect(document.getElementById('contact')).not.toBeNull();
  });

  it('updates document.title after following Next case study', () => {
    renderAppAt('/work/workhorse');

    fireEvent.click(screen.getByRole('link', { name: /next case study/i }));

    expect(document.title).toBe(pageMetaFor('/work/apple-llm-triage').title);
  });
});

function renderAppAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function renderSiteLayoutAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route index element={<div>Stub outlet</div>} />
          <Route path="work/:slug" element={<div>Stub outlet</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

function headerLinkHref(name) {
  return within(screen.getByRole('banner')).getByRole('link', { name }).getAttribute('href');
}

function panel() {
  return document.querySelector('[data-testid="mobile-menu-panel"]');
}

function panelLinks() {
  const node = panel();
  return node ? within(node).getAllByRole('link') : [];
}

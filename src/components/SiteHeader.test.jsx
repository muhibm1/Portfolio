import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { portfolioData } from '../data/portfolioData';
import { pageMetaFor } from '../pageMeta';
import SiteLayout from './SiteLayout';

// G8. SiteHeader renders inside SiteLayout, so these tests mount SiteLayout with a stub outlet.
describe('SiteHeader', () => {
  it('shows the home section links, the email address and the theme button on /, with no GitHub link (the Look moves it to the footer)', () => {
    renderSiteLayoutAt('/');

    expect(headerLinkHref('Work')).toBe('#work');
    expect(headerLinkHref('How I work')).toBe('#approach');
    expect(headerLinkHref('Experience')).toBe('#experience');
    expect(headerLinkHref('Contact')).toBe('#contact');
    expect(headerLinkHref('About')).toBe('#about');
    expect(headerLinkHref('Build log')).toBe('#build-log');
    // The owner's 2026-10-21 nav order.
    const sections = within(screen.getByRole('navigation', { name: 'Sections' }));
    expect(sections.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Work',
      'About',
      'Build log',
      'How I work',
      'Experience',
      'Contact',
    ]);
    const banner = within(screen.getByRole('banner'));
    expect(banner.getByRole('link', { name: portfolioData.personal.email })).toHaveAttribute(
      'href',
      `mailto:${portfolioData.personal.email}`,
    );
    expect(banner.queryByRole('link', { name: /github/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /resume/i })).toBeNull();
  });

  it('shows Home, All case studies and Contact on a case-study page, with no GitHub link', () => {
    renderSiteLayoutAt('/work/workhorse');

    expect(headerLinkHref('Home')).toBe('/');
    expect(headerLinkHref('All case studies')).toBe('/work');
    expect(headerLinkHref('Contact')).toBe('#contact');
    expect(screen.queryByRole('link', { name: 'Work' })).toBeNull();
    expect(within(screen.getByRole('banner')).queryByRole('link', { name: /github/i })).toBeNull();
  });

  it('has no copy-email control', () => {
    renderSiteLayoutAt('/');

    expect(screen.queryByRole('button', { name: /copy email/i })).toBeNull();
    expect(screen.queryByText(/copy email/i)).toBeNull();
  });

  it('has no mobile menu button, because the links sit inline at every width (the Look replaces the menu)', () => {
    renderSiteLayoutAt('/');

    expect(screen.queryByRole('button', { name: /menu/i })).toBeNull();
    expect(document.querySelector('[data-testid="mobile-menu-panel"]')).toBeNull();
  });
});

describe('ThemeButton in the header', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('starts unpressed when the system is light and nothing is chosen', () => {
    renderSiteLayoutAt('/');

    expect(themeButton()).toHaveAttribute('aria-pressed', 'false');
  });

  it('starts pressed when the page already carries data-theme dark', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    renderSiteLayoutAt('/');

    expect(themeButton()).toHaveAttribute('aria-pressed', 'true');
  });

  it('sets data-theme dark and saves dark under the key theme when pressed once', () => {
    renderSiteLayoutAt('/');

    fireEvent.click(themeButton());

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(themeButton()).toHaveAttribute('aria-pressed', 'true');
  });

  it('goes back to light and saves light when pressed twice', () => {
    renderSiteLayoutAt('/');

    fireEvent.click(themeButton());
    fireEvent.click(themeButton());

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
    expect(themeButton()).toHaveAttribute('aria-pressed', 'false');
  });

  it('still switches the page for this visit when storage refuses the write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    renderSiteLayoutAt('/');

    expect(() => fireEvent.click(themeButton())).not.toThrow();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(themeButton()).toHaveAttribute('aria-pressed', 'true');
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

    expect(document.title).toBe(pageMetaFor('/work/agentops').title);
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

function themeButton() {
  return screen.getByRole('button', { name: 'Dark theme' });
}

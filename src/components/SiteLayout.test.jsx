import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from '../App';
import { portfolioData } from '../data/portfolioData';

const { personal } = portfolioData;
const FRAMED_PATHS = ['/', '/work', '/work/apple-llm-triage'];

// SiteLayout is the element of App's layout route, so these tests mount it through App to check
// that it frames the real pages.
describe('SiteLayout', () => {
  it.each(FRAMED_PATHS)('shows the footer email link at %s', (path) => {
    renderSiteAt(path);

    expect(footerLinkHrefs()).toContain(`mailto:${personal.email}`);
  });

  it.each(FRAMED_PATHS)('shows the footer LinkedIn link at %s', (path) => {
    renderSiteAt(path);

    expect(footerLinkHrefs()).toContain(personal.linkedin);
  });

  it('opens the resume from the navbar Resume button and closes it again', () => {
    renderSiteAt('/work');
    expect(closeResumeButton()).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    expect(closeResumeButton()).toBeInTheDocument();

    fireEvent.click(closeResumeButton());
    expect(closeResumeButton()).toBeNull();
  });

  it('opens the resume from the footer on a case study page', () => {
    renderSiteAt('/work/apple-llm-triage');

    fireEvent.click(within(footer()).getByRole('button', { name: 'View Full Resume' }));

    expect(closeResumeButton()).toBeInTheDocument();
  });

  it('highlights the navbar link of the home section under the scroll position', () => {
    renderSiteAt('/');
    placeOnPage(document.getElementById('philosophy'), { top: 0, height: 900 });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(navbarLink('Philosophy')).toHaveClass('bg-white');
    expect(navbarLink('Overview')).not.toHaveClass('bg-white');
  });
});

function renderSiteAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function footer() {
  return screen.getByRole('contentinfo');
}

function footerLinkHrefs() {
  return within(footer())
    .getAllByRole('link')
    .map((link) => link.getAttribute('href'));
}

function closeResumeButton() {
  return screen.queryByRole('button', { name: 'Close resume' });
}

function navbarLink(label) {
  return within(screen.getByRole('navigation')).getByRole('link', { name: label });
}

// jsdom does no layout, so every element reports offsetTop and offsetHeight of 0.
function placeOnPage(element, { top, height }) {
  Object.defineProperty(element, 'offsetTop', { value: top, configurable: true });
  Object.defineProperty(element, 'offsetHeight', { value: height, configurable: true });
}

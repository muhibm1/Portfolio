import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { portfolioData } from '../data/portfolioData';
import ContactFooter from './ContactFooter';

const { personal, home } = portfolioData;

describe('ContactFooter', () => {
  it('shows the contact heading and links to personal.email', () => {
    render(<ContactFooter />);

    expect(screen.getByRole('heading', { name: home.contact.heading })).toBeInTheDocument();
    expect(footerLinkHrefs()).toContain(`mailto:${personal.email}`);
  });

  it('links Resume to the PDF path', () => {
    render(<ContactFooter />);

    const expectedHref = `${import.meta.env.BASE_URL}${personal.resumeFileName}`;
    expect(footerLinkHrefs()).toContain(expectedHref);
  });

  it('links to LinkedIn and GitHub', () => {
    render(<ContactFooter />);

    expect(footerLinkHrefs()).toContain(personal.linkedin);
    expect(footerLinkHrefs()).toContain(personal.github);
  });

  it('shows the location line', () => {
    render(<ContactFooter />);

    expect(screen.getByText(home.contact.location)).toBeInTheDocument();
  });
});

function footer() {
  return screen.getByRole('contentinfo');
}

function footerLinkHrefs() {
  return within(footer())
    .getAllByRole('link')
    .map((link) => link.getAttribute('href'));
}

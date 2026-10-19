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

  it('links to exactly email, LinkedIn and the one public-code line (the Look moves the GitHub mention here from the header), with no resume control', () => {
    render(<ContactFooter />);

    const hrefs = footerLinkHrefs();
    expect(hrefs).toHaveLength(3);
    expect(hrefs).toContain(`mailto:${personal.email}`);
    expect(hrefs).toContain(personal.linkedin);
    expect(hrefs).toContain(home.hero.codeLine.href);
    expect(screen.queryByRole('link', { name: /resume/i })).toBeNull();
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

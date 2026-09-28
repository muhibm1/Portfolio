// Edge cases for the route table (E2, R127): a case-study page renders with a trailing slash,
// and an unknown slug renders the not-found page with links back to / and /work. The simulator,
// orb and telemetry cases this file used to carry are gone with those components (plan
// section 1); route coverage for every path lives in src/entryServer.test.jsx and
// src/hydration.test.jsx, which exercise the same route table through the server render.
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from './App';
import { portfolioData } from './data/portfolioData';

const { caseStudies } = portfolioData;

function renderAppAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('route table (E2)', () => {
  it('renders the case study for a slug with a trailing slash, the same as without one', () => {
    renderAppAt('/work/workhorse/');

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      caseStudies.find((study) => study.id === 'workhorse').title,
    );
  });

  it('renders the not-found page with links to / and /work for an unknown slug', () => {
    renderAppAt('/work/no-such');

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Page not found');
    const main = within(screen.getByRole('main'));
    expect(main.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(main.getByRole('link', { name: /work/i })).toHaveAttribute('href', '/work');
  });
});

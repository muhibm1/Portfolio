import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import NotFoundPage from './NotFoundPage';

describe('NotFoundPage', () => {
  it('shows a level-one heading saying the page was not found, styled on tokens', () => {
    renderNotFoundPage();

    const heading = screen.getByRole('heading', { level: 1, name: /not found/i });
    expect(heading).toBeInTheDocument();
    expect(heading.className).toMatch(/text-ink/);
    expect(document.querySelector('main').className).toMatch(/bg-ground/);
  });

  it('links back to the home page and to the work index using the shared button classes', () => {
    renderNotFoundPage();

    const homeLink = screen.getByRole('link', { name: 'Back to home' });
    const workLink = screen.getByRole('link', { name: 'Browse all work' });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(workLink).toHaveAttribute('href', '/work');
    expect(homeLink.className).toMatch(/rounded-full/);
    expect(workLink.className).toMatch(/rounded-full/);
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});

function renderNotFoundPage() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  );
}

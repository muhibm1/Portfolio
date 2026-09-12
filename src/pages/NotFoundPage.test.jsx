import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import NotFoundPage from './NotFoundPage';

describe('NotFoundPage', () => {
  it('shows a level-one heading saying the page was not found', () => {
    renderNotFoundPage();

    expect(screen.getByRole('heading', { level: 1, name: /not found/i })).toBeInTheDocument();
  });

  it('links back to the home page and to the work index', () => {
    renderNotFoundPage();

    const linkHrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(linkHrefs).toEqual(['/', '/work']);
  });
});

function renderNotFoundPage() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  );
}

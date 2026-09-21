// Tests src/routePaths.js (R116, R118): the one list of concrete paths the site serves, and the
// slug rule that keeps a case-study id from becoming an unsafe page directory. GC3 also reads
// src/App.jsx as text, so the route table this list assumes stays in sync with the router.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from './App';
import { portfolioData } from './data/portfolioData';
import { staticRoutePaths } from './routePaths';

const appSourcePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'App.jsx');

const BAD_IDS = ['../x', 'a/b', 'A-B', 'a b', ''];

// The heading each route renders, in the order staticRoutePaths returns them: / (the home hero
// name), /work (the work index header) and then one entry per case study, its title from
// portfolioData so the expectation tracks the data instead of being copied by hand.
function expectedHeadings() {
  const caseStudyHeadings = portfolioData.caseStudies.map((study) => study.title);
  return ['Muhammad Muhibullah', 'Work', ...caseStudyHeadings];
}

describe('staticRoutePaths', () => {
  it('returns / then /work then /work/<id> for each case study in data order (GC1)', () => {
    expect(staticRoutePaths(portfolioData.caseStudies)).toEqual([
      '/',
      '/work',
      '/work/apple-llm-triage',
      '/work/apple-data-health',
      '/work/neural-newsletters-llm',
    ]);
  });

  // GC2 proves every path in the shared list renders the specific page it names, not merely a
  // page other than "not found". src/routes.test.jsx owns per-route content correctness for the
  // trailing-slash slug case and other router behaviour; this test only proves the list this
  // module hands to the build and the check resolves to the expected page for each entry.
  it.each(staticRoutePaths(portfolioData.caseStudies).map((staticRoutePath, index) => [staticRoutePath, expectedHeadings()[index]]))(
    'renders the expected level-1 heading at %s (GC2)',
    (staticRoutePath, expectedHeading) => {
      render(
        <MemoryRouter initialEntries={[staticRoutePath]}>
          <App />
        </MemoryRouter>,
      );

      expect(screen.getByRole('heading', { level: 1 }).textContent.replace(/\s+/g, ' ').trim()).toBe(
        expectedHeading,
      );
    },
  );

  it('covers exactly the route patterns App.jsx defines, index, work, work/:slug and * (GC3)', () => {
    const appSource = fs.readFileSync(appSourcePath, 'utf8');
    const routeTags = appSource.match(/<Route\b[^>]*\/?>/g) ?? [];

    const indexRoutes = routeTags.filter((tag) => /\bindex\b/.test(tag));
    const pathValues = routeTags
      .map((tag) => tag.match(/path="([^"]*)"/))
      .filter(Boolean)
      .map((match) => match[1]);

    expect(indexRoutes).toHaveLength(1);
    expect(new Set(pathValues)).toEqual(new Set(['work', 'work/:slug', '*']));
  });

  it('returns / and /work for an empty case-study list (EG3)', () => {
    expect(staticRoutePaths([])).toEqual(['/', '/work']);
  });

  it.each(BAD_IDS)('throws naming the id for the URL-unsafe id %j (FL1)', (badId) => {
    expect(() => staticRoutePaths([{ id: badId }])).toThrowError(
      new RegExp(`${escapeForRegExp(JSON.stringify(badId))}.*URL-safe slug`),
    );
  });
});

function escapeForRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Tests src/entry-server.jsx's render (G17, R140): every path the app serves renders its own
// page markup on the server, and no render logs a console.error, which is what a component
// reading window or document during render would do.
import { describe, expect, it, vi } from 'vitest';
import { render } from './entry-server.jsx';
import { portfolioData } from './data/portfolioData';
import { staticRoutePaths } from './routePaths';

const BASE = '/Portfolio';
const NOT_FOUND_TEXT = 'Page not found';

/** The distinctive text each served path renders, used to prove that path's real markup came back. */
function distinctiveTextFor(path) {
  if (path === '/') return portfolioData.home.hero.heading;
  if (path === '/work') return portfolioData.caseStudies[0].title;
  const caseStudy = portfolioData.caseStudies.find((study) => `/work/${study.id}` === path);
  return caseStudy.title;
}

describe('entry-server render (G17)', () => {
  const paths = staticRoutePaths(portfolioData.caseStudies);

  it.each(paths)('renders the real markup for %s and logs no console.error', (path) => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const html = render(`${BASE}${path === '/' ? '' : path}`);

    expect(html).toContain(distinctiveTextFor(path));
    expect(html).not.toContain(NOT_FOUND_TEXT);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('renders the not-found page for an address the app does not serve, and logs no console.error', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const html = render(`${BASE}/no-such-page`);

    expect(html).toContain(NOT_FOUND_TEXT);
    expect(consoleError).not.toHaveBeenCalled();
  });
});

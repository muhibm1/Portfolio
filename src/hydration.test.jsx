// Tests that the server-rendered markup for every served path hydrates without React logging a
// mismatch (E1, R140). The failure mode this guards is a component reading window or document
// during render: the server and client markup would then differ, and hydrateRoot logs a
// console.error instead of throwing.
import { hydrateRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';
import { render } from './entry-server.jsx';
import { computeBasename } from './basename.js';
import { portfolioData } from './data/portfolioData';
import { staticRoutePaths } from './routePaths';

const BASE = '/Portfolio';
const BASENAME = computeBasename(`${BASE}/`);

const paths = [...staticRoutePaths(portfolioData.caseStudies), '/no-such-page'];

afterEach(() => {
  document.body.innerHTML = '';
});

describe('hydration parity (E1)', () => {
  it.each(paths)('hydrates the server-rendered markup at %s with no console.error', (path) => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fullPath = `${BASE}${path === '/' ? '' : path}`;
    const serverHtml = render(fullPath);
    const container = document.createElement('div');
    container.innerHTML = serverHtml;
    document.body.appendChild(container);
    expect(container.textContent.length).toBeGreaterThan(0);
    const textBefore = container.textContent;

    act(() => {
      hydrateRoot(
        container,
        <MemoryRouter basename={BASENAME} initialEntries={[fullPath]}>
          <App />
        </MemoryRouter>,
      );
    });

    expect(consoleError).not.toHaveBeenCalled();
    expect(container.textContent).toBe(textBefore);
  });
});

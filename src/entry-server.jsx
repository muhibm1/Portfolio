// The server entry the prerender script imports (spec interface (b), ADR 0001). Renders the app
// to a markup string for one URL, through StaticRouter instead of the BrowserRouter main.jsx
// uses, because a server render has no window or history to read.
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App.jsx';
import { computeBasename } from './basename.js';
// Re-exported so scripts/prerender.mjs, a plain Node script, can read them from the built
// dist-ssr/entry-server.js (where Vite has already resolved every import) instead of importing
// src/pageMeta.js directly, which uses extensionless imports Node's own ESM resolver rejects.
export { pageMetaFor, headTags } from './pageMeta.js';

// Matches vite.config.js PAGES_BASE. Kept as a literal constant here (not imported from
// vite.config.js) so this module stays free of any Vite-only import when Node loads the built
// dist-ssr/entry-server.js directly.
const PAGES_BASE = '/Portfolio/';

/**
 * Renders the app at `url`, a full pathname including the `/Portfolio` basename, to an HTML
 * string. No component may read `window` or `document` while this runs (ADR 0001); doing so
 * throws inside `renderToString` and fails the build.
 */
export function render(url) {
  return renderToString(
    <StaticRouter basename={computeBasename(PAGES_BASE)} location={url}>
      <App />
    </StaticRouter>,
  );
}

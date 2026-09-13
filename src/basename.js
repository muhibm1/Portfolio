/**
 * The router basename for a Vite base url. GitHub Pages serves the site under /Portfolio/, and
 * the router expects that prefix without its trailing slash (ADR 0001). An empty or missing
 * value, or one made only of slashes, gives "/".
 */
export function computeBasename(baseUrl) {
  const withoutTrailingSlashes = (baseUrl ?? '').replace(/\/+$/, '');
  return withoutTrailingSlashes === '' ? '/' : withoutTrailingSlashes;
}

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { pageMetaFor } from '../pageMeta';
import SiteHeader from './SiteHeader';

/**
 * The frame around every route: the header, then the page's own content. Each page renders its
 * own <main> and, where it has one, its own footer, so the Outlet is not wrapped in either.
 */
export default function SiteLayout() {
  usePageTitle();

  return (
    <div className="min-h-screen bg-ground font-sans text-body antialiased selection:bg-ink selection:text-on-dark">
      <SiteHeader />
      <Outlet />
    </div>
  );
}

// R139: the tab title follows route changes, sourced from the same per-route meta the prerender
// script uses for the built page's <title> (src/pageMeta.js).
function usePageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = pageMetaFor(pathname).title;
  }, [pathname]);
}

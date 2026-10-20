import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigationType } from 'react-router';
import { pageMetaFor } from '../pageMeta';
import SiteHeader from './SiteHeader';

/**
 * The frame around every route: the header, then the page's own content. Each page renders its
 * own <main> and, where it has one, its own footer, so the Outlet is not wrapped in either.
 */
export default function SiteLayout() {
  usePageTitle();
  useScrollToTopOnNewPage();

  return (
    <div className="min-h-screen bg-page font-sans text-ink antialiased selection:bg-ink selection:text-on-ink">
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

// A link that leads to a new page starts that page at the top. Back and forward keep the
// browser's own place, and a link with a hash is left to the page that owns the hash.
function useScrollToTopOnNewPage() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const shownPathname = useRef(pathname);

  useEffect(() => {
    // Only a change of page counts; a hash change on the same page is not one.
    if (shownPathname.current === pathname) return;
    shownPathname.current = pathname;

    if (navigationType === 'POP' || hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);
}

import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { portfolioData } from '../data/portfolioData';
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

// T10 replaces this with pageMetaFor(pathname).title once src/pageMeta.js exists; for now every
// route carries the site name so the tab title is never blank.
function usePageTitle() {
  useEffect(() => {
    document.title = portfolioData.personal.name;
  }, []);
}

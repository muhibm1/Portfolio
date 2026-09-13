import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import Navbar from './Navbar';
import ContactFooter from './ContactFooter';
import ResumeModal from './ResumeModal';

/**
 * The frame around every route: the navbar, the page, the contact footer, and the resume modal,
 * which the navbar and the footer both know how to open. Each page renders its own <main>, so the
 * Outlet is not wrapped in one.
 */
export default function SiteLayout() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  useScrollToTopOnPathChange();

  const openResume = () => setIsResumeOpen(true);

  return (
    <div className="min-h-screen bg-[#e5e4e0] text-[#1d1d1d] font-sans antialiased selection:bg-[#1d1d1d] selection:text-white">
      <Navbar activeSection={activeSection} onOpenResume={openResume} />
      {/* HomePage reads setActiveSection from here to light up the navbar link of the section on screen. */}
      <Outlet context={{ setActiveSection }} />
      <ContactFooter onOpenResume={openResume} />
      {isResumeOpen && <ResumeModal onClose={() => setIsResumeOpen(false)} />}
    </div>
  );
}

// R7. An address with a hash, such as /#simulator, is left alone because HomePage scrolls to the
// section it names. The first render is not a path change, so a reload keeps the browser's position.
function useScrollToTopOnPathChange() {
  const { pathname, hash } = useLocation();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (pathname === previousPathname.current) return;
    previousPathname.current = pathname;
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
}

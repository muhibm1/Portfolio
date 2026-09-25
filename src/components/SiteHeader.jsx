import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { portfolioData } from '../data/portfolioData';
import { navLinkClasses, secondaryButtonClasses } from './buttonClasses';

// R133. On the home page the links jump to sections on the page; everywhere else they point back
// at home, the work index, and the current page's own contact anchor.
const HOME_LINKS = [
  { label: 'Case studies', href: '#work' },
  { label: 'How I work', href: '#approach' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

const OTHER_ROUTE_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'All case studies', to: '/work' },
  { label: 'Contact', href: '#contact' },
];

const MOBILE_MENU_PANEL_ID = 'mobile-menu-panel';

export default function SiteHeader() {
  const { personal } = portfolioData;
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const links = isHome ? HOME_LINKS : OTHER_ROUTE_LINKS;
  const resumeHref = `${import.meta.env.BASE_URL}${personal.resumeFileName}`;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="relative border-b border-border px-5 py-4 md:px-[120px] md:py-6">
      <div className="flex items-center justify-between">
        <Link to="/" onClick={closeMenu} className="flex flex-col gap-0.5 text-ink no-underline">
          <span className="font-display text-lg font-semibold">{personal.name}</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            {personal.headerEyebrow}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <HeaderLink key={link.label} link={link} className={navLinkClasses} />
          ))}
          {isHome && (
            <a href={resumeHref} className={secondaryButtonClasses}>
              Resume
            </a>
          )}
        </nav>

        <button
          type="button"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls={MOBILE_MENU_PANEL_ID}
          onClick={() => setIsMenuOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-rule md:hidden"
        >
          <MenuIcon />
        </button>
      </div>

      {isMenuOpen && (
        <div
          id={MOBILE_MENU_PANEL_ID}
          data-testid="mobile-menu-panel"
          className="flex flex-col gap-4 border-t border-border bg-ground px-1 py-4 md:hidden"
        >
          {links.map((link) => (
            <HeaderLink key={link.label} link={link} className={navLinkClasses} onClick={closeMenu} />
          ))}
          {isHome && (
            <a href={resumeHref} className={secondaryButtonClasses} onClick={closeMenu}>
              Resume
            </a>
          )}
        </div>
      )}
    </header>
  );
}

function HeaderLink({ link, className, onClick }) {
  if (link.to) {
    return (
      <Link to={link.to} onClick={onClick} className={className}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={link.href} onClick={onClick} className={className}>
      {link.label}
    </a>
  );
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 6h14M3 10h14M3 14h14" />
    </svg>
  );
}

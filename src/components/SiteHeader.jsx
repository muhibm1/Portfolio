import { Link, useLocation } from 'react-router';
import { portfolioData } from '../data/portfolioData';
import { wrapClasses } from './lookClasses';
import ThemeButton from './ThemeButton';

// R133. On the home page the links jump to sections on the page (six since 2026-10-21, so on a
// phone the row scrolls sideways instead of wrapping a label onto two lines); everywhere else they point back
// at home, the work index, and the current page's own contact anchor.
const HOME_LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Build log', href: '#build-log' },
  { label: 'How I work', href: '#approach' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

const OTHER_ROUTE_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'All case studies', to: '/work' },
  { label: 'Contact', href: '#contact' },
];

const navLink = 'inline-flex min-h-11 shrink-0 items-center whitespace-nowrap text-[13.5px] text-ink-2 no-underline transition-colors hover:text-ink tab:text-sm';

/**
 * The sticky header of the Look: name and role, the section links, the email address and the
 * light and dark switch. On a phone it is two rows (name and email, then links and switch).
 */
export default function SiteHeader() {
  const { personal } = portfolioData;
  const { pathname } = useLocation();
  const links = pathname === '/' ? HOME_LINKS : OTHER_ROUTE_LINKS;

  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-page">
      <div
        className={`${wrapClasses} grid min-h-[60px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 pt-2 tab:grid-cols-[auto_1fr_auto_auto] tab:gap-x-6 tab:pt-0`}
      >
        <Link
          to="/"
          className="col-[1/2] row-start-1 flex flex-col leading-[1.2] text-ink no-underline tab:col-[1]"
        >
          <span className="font-display text-base font-semibold tracking-[-0.01em]">{personal.name}</span>
          <span className="text-[13px] text-muted">{personal.headerEyebrow}</span>
        </Link>

        <nav
          aria-label="Sections"
          className="col-[1/3] row-start-2 mt-2 flex min-w-0 justify-between gap-4 overflow-x-auto border-t border-hairline py-0.5 tab:col-[2] tab:row-start-1 tab:mt-0 tab:justify-center tab:gap-7 tab:overflow-visible tab:border-t-0 tab:py-0"
        >
          {links.map((link) => (
            <HeaderLink key={link.label} link={link} />
          ))}
        </nav>

        <a
          href={`mailto:${personal.email}`}
          className="col-[2/4] row-start-1 justify-self-end font-mono text-[12.5px] text-ink no-underline hover:text-ink tab:col-[3] tab:text-sm"
        >
          {personal.email}
        </a>

        <div className="col-[3] row-start-2 mt-2 justify-self-end tab:col-[4] tab:row-start-1 tab:mt-0">
          <ThemeButton />
        </div>
      </div>
    </header>
  );
}

function HeaderLink({ link }) {
  if (link.to) {
    return (
      <Link to={link.to} className={navLink}>
        {link.label}
      </Link>
    );
  }
  return (
    <a href={link.href} className={navLink}>
      {link.label}
    </a>
  );
}

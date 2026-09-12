import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Check, CircleAlert, FileText, Mail } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

const COPY_FEEDBACK_MS = 2000;

const homeSectionLinks = [
  { label: 'Overview', href: '#overview' },
  { label: 'Philosophy', href: '#philosophy' },
  { label: 'Case Studies', href: '#case-studies' },
  { label: 'Live Simulator', href: '#simulator' },
  { label: 'Experience', href: '#experience' },
  { label: 'Capabilities', href: '#skills' }
];

const copyStatusIcons = { idle: Mail, copied: Check, failed: CircleAlert };
const copyFeedbackLabels = { copied: 'Copied!', failed: 'Copy failed' };

const navLinkClass = 'px-3 py-1.5 rounded-[10px] text-xs font-medium tracking-tight transition-colors duration-150';
const activeNavLinkClass = 'bg-white text-[#1d1d1d] font-semibold';
const idleNavLinkClass = 'text-[#1d1d1d]/70 hover:text-[#1d1d1d] hover:bg-white/60';
const brandLinkClass = 'flex items-center gap-2.5 text-[#1d1d1d] no-underline group';

export default function Navbar({ activeSection, onOpenResume }) {
  const { personal } = portfolioData;
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const isOnWork = pathname.startsWith('/work');
  const [copyStatus, copyText] = useClipboardCopy();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const CopyStatusIcon = copyStatusIcons[copyStatus];

  const brand = (
    <>
      <div className="w-8 h-8 bg-[#1d1d1d] text-white flex items-center justify-center font-mono text-xs font-bold tracking-wider transition-transform duration-200 group-hover:scale-105">
        MM
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-semibold tracking-tight text-[#1d1d1d]">
          Muhammad Muhibullah
        </span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#1d1d1d]/70">
          Forward Deployed Eng
        </span>
      </div>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <nav
        className={`pointer-events-auto w-full max-w-6xl transition-colors duration-300 border px-4 py-3 flex items-center justify-between ${
          scrolled
            ? 'bg-[#e5e4e0]/90 backdrop-blur-md border-[#bfbebe]'
            : 'bg-[#e5e4e0]/70 backdrop-blur-xs border-[#bfbebe]/60'
        }`}
      >
        {/* On the home page the brand scrolls to the top; elsewhere it returns home */}
        {isHome ? (
          <a href="#overview" className={brandLinkClass}>{brand}</a>
        ) : (
          <Link to="/" className={brandLinkClass}>{brand}</Link>
        )}

        {/* Section anchors exist only on the home page; Home and Work show on every screen size */}
        <div className="flex items-center gap-1 bg-[#cdcdc9]/40 p-1 border border-[#bfbebe]">
          {isHome ? (
            homeSectionLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`hidden lg:block ${navLinkClass} ${
                  activeSection === link.href.slice(1) ? activeNavLinkClass : idleNavLinkClass
                }`}
              >
                {link.label}
              </a>
            ))
          ) : (
            <Link to="/" className={`${navLinkClass} ${idleNavLinkClass}`}>
              Home
            </Link>
          )}
          <Link to="/work" className={`${navLinkClass} ${isOnWork ? activeNavLinkClass : idleNavLinkClass}`}>
            Work
          </Link>
        </div>

        {/* Quick Action CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => copyText(personal.email)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[10px] border border-[#1d1d1d] bg-white text-[#1d1d1d] hover:bg-[#1d1d1d] hover:text-white transition-colors cursor-pointer"
            title="Copy email to clipboard"
          >
            <CopyStatusIcon className="w-3.5 h-3.5" />
            {copyStatus === 'idle' ? (
              <>
                <span className="hidden sm:inline font-mono">{personal.email}</span>
                <span className="sm:hidden">Copy Email</span>
              </>
            ) : (
              <span className="font-mono">{copyFeedbackLabels[copyStatus]}</span>
            )}
          </button>

          <button
            onClick={onOpenResume}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[10px] border border-[#1d1d1d] bg-[#1d1d1d] text-white hover:bg-white hover:text-[#1d1d1d] transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resume</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

/**
 * Copies text to the clipboard and reports "copied" or "failed" for two seconds, then "idle".
 * At most one reset timer is pending, and none outlives the component.
 */
function useClipboardCopy() {
  const [copyStatus, setCopyStatus] = useState('idle');
  const resetTimerRef = useRef(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(resetTimerRef.current);
    };
  }, []);

  const copyText = async (text) => {
    const hasCopied = await writeToClipboard(text);
    // The component can unmount while the browser is still writing to the clipboard.
    if (!isMountedRef.current) return;

    clearTimeout(resetTimerRef.current);
    setCopyStatus(hasCopied ? 'copied' : 'failed');
    resetTimerRef.current = setTimeout(() => setCopyStatus('idle'), COPY_FEEDBACK_MS);
  };

  return [copyStatus, copyText];
}

// Resolves true only when the browser confirms the write. A missing Clipboard API (older
// browsers, non-secure origins) and a rejected write (permission denied) both resolve false.
async function writeToClipboard(text) {
  if (!navigator.clipboard) return false;

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

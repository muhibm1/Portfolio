import React, { useState, useEffect } from 'react';
import { Mail, ArrowUpRight, Check, FileText, Terminal, Layers } from 'lucide-react';

export default function Navbar({ activeSection, onSelectCaseStudy, onOpenResume }) {
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('mmalqaim@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navLinks = [
    { label: 'Overview', href: '#overview' },
    { label: 'Philosophy', href: '#philosophy' },
    { label: 'Case Studies', href: '#case-studies' },
    { label: 'Live Simulator', href: '#simulator' },
    { label: 'Experience', href: '#experience' },
    { label: 'Capabilities', href: '#skills' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <nav
        className={`pointer-events-auto w-full max-w-6xl transition-all duration-300 rounded-2xl border px-4 py-3 flex items-center justify-between shadow-xs ${
          scrolled
            ? 'bg-[#f6f5f1]/90 backdrop-blur-md border-[#dcdad1] shadow-md'
            : 'bg-[#f6f5f1]/70 backdrop-blur-xs border-[#e5e3db]'
        }`}
      >
        {/* Brand / Monogram */}
        <a href="#overview" className="flex items-center gap-2.5 text-black no-underline group">
          <div className="w-8 h-8 rounded-lg bg-[#181818] text-white flex items-center justify-center font-mono text-xs font-bold tracking-wider transition-transform duration-200 group-hover:scale-105">
            MM
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-[#181818]">
              Muhammad Muhibullah
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#787670]">
              Forward Deployed Eng
            </span>
          </div>
        </a>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 bg-[#edebe4]/60 p-1 rounded-xl border border-[#dedcd4]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium tracking-tight transition-all duration-150 ${
                activeSection === link.href.slice(1)
                  ? 'bg-white text-[#181818] shadow-xs font-semibold'
                  : 'text-[#64625d] hover:text-[#181818] hover:bg-white/50'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Quick Action CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-[#dedcd4] bg-white text-[#181818] hover:bg-[#fbfbf9] hover:border-[#cbc8be] transition-colors shadow-2xs cursor-pointer"
            title="Copy email to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-mono">Copied!</span>
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5 text-[#555]" />
                <span className="hidden sm:inline font-mono">mmalqaim@gmail.com</span>
                <span className="sm:hidden">Copy Email</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenResume}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#181818] text-white hover:bg-black transition-colors shadow-xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resume</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

import React from 'react';
import { Link } from 'react-router';

const linkClass = 'px-4 py-2 rounded-[10px] border border-[#1d1d1d] text-xs font-semibold transition-colors';

/** The page for any address the site does not serve, including an unknown case-study slug. */
export default function NotFoundPage() {
  return (
    <main className="pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight uppercase text-[#1d1d1d] font-['Space_Grotesk',sans-serif]">
          Page not found
        </h1>
        <p className="text-base text-[#1d1d1d]/70">There is no page at this address.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className={`${linkClass} bg-[#1d1d1d] text-white hover:bg-white hover:text-[#1d1d1d]`}>
            Back to home
          </Link>
          <Link to="/work" className={`${linkClass} bg-white text-[#1d1d1d] hover:bg-[#1d1d1d] hover:text-white`}>
            Browse all work
          </Link>
        </div>
      </div>
    </main>
  );
}

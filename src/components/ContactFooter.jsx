import React, { useState } from 'react';
import { Mail, Phone, MapPin, ArrowUpRight, Check, Copy, FileText, Terminal, Heart } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export default function ContactFooter({ onOpenResume }) {
  const { personal } = portfolioData;
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(personal.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer id="contact" className="py-20 px-4 border-t border-[#e2e0d8] bg-[#f4f3ee]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Contact Banner */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#e4e2da] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[#7a7872] block">
              Initiate Contact // Forward Deployed Roles
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#181818] font-['Space_Grotesk',sans-serif]">
              Let's talk systems, integrations, and shipping.
            </h2>
            <p className="text-sm text-[#5a5853] leading-relaxed">
              Open to Forward Deployed Engineer (FDE), Solutions Architect, and Systems Integration opportunities where direct client impact and resilient software matter.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={handleCopyEmail}
              className="px-5 py-3 rounded-xl bg-[#181818] text-white text-xs font-semibold hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied mmalqaim@gmail.com' : 'Copy Email Address'}</span>
            </button>

            <a
              href={`mailto:${personal.email}?subject=Forward%20Deployed%20Engineering%20Opportunity`}
              className="px-5 py-3 rounded-xl bg-white border border-[#dedcd4] text-[#181818] text-xs font-semibold hover:bg-[#faf9f6] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#555]" />
              <span>Send Direct Email</span>
            </a>

            <button
              onClick={onOpenResume}
              className="px-5 py-3 rounded-xl bg-[#f6f5f1] border border-[#dedcd4] text-[#181818] text-xs font-semibold hover:bg-[#ebe9e2] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#555]" />
              <span>View Full Resume</span>
            </button>
          </div>
        </div>

        {/* Contact Links & Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs text-[#52504a]">
          <div className="space-y-1.5">
            <span className="font-mono text-[#888] uppercase tracking-wider block">Direct Email</span>
            <a href={`mailto:${personal.email}`} className="font-mono text-sm font-semibold text-[#181818] hover:underline">
              {personal.email}
            </a>
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-[#888] uppercase tracking-wider block">Direct Phone</span>
            <span className="font-mono text-sm font-semibold text-[#181818]">
              {personal.phone}
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-[#888] uppercase tracking-wider block">LinkedIn Profile</span>
            <a
              href={personal.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-semibold text-[#181818] hover:underline inline-flex items-center gap-1"
            >
              <span>{personal.linkedinHandle}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-[#888] uppercase tracking-wider block">Location</span>
            <span className="font-mono text-sm font-semibold text-[#181818]">
              {personal.location} (Open to Relocation / Remote)
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#dedcd4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#787670]">
          <div>
            © {new Date().getFullYear()} Muhammad Muhibullah · Forward Deployed Engineering & Systems Integration
          </div>
          <div className="flex items-center gap-4">
            <a href="#overview" className="hover:text-black">Back to Top ↑</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

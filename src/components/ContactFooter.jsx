import React, { useEffect, useRef, useState } from 'react';
import { Mail, ArrowUpRight, Check, CircleAlert, Copy, FileText } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

const COPY_FEEDBACK_MS = 2000;

const copyStatusIcons = { idle: Copy, copied: Check, failed: CircleAlert };

export default function ContactFooter({ onOpenResume }) {
  const { personal } = portfolioData;
  const [copyStatus, copyText] = useClipboardCopy();

  const CopyStatusIcon = copyStatusIcons[copyStatus];

  return (
    <footer id="contact" className="py-20 px-4 border-t border-[#bfbebe] bg-[#e5e4e0]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Contact Banner */}
        <div className="p-8 sm:p-12 bg-white border border-[#bfbebe] flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-[#1d1d1d]/70 block">
              Initiate Contact // Forward Deployed Roles
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1d] font-['Space_Grotesk',sans-serif]">
              Let's talk systems, integrations, and shipping.
            </h2>
            <p className="text-sm text-[#1d1d1d]/70 leading-relaxed">
              Open to Forward Deployed Engineer (FDE), Solutions Architect, and Systems Integration opportunities where direct client impact and resilient software matter.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={() => copyText(personal.email)}
              className="px-5 py-3 rounded-[10px] border border-[#1d1d1d] bg-[#1d1d1d] text-white text-xs font-semibold hover:bg-white hover:text-[#1d1d1d] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <CopyStatusIcon className="w-4 h-4" />
              <span>{copyButtonLabel(copyStatus, personal.email)}</span>
            </button>

            <a
              href={`mailto:${personal.email}?subject=Forward%20Deployed%20Engineering%20Opportunity`}
              className="px-5 py-3 rounded-[10px] bg-white border border-[#1d1d1d] text-[#1d1d1d] text-xs font-semibold hover:bg-[#1d1d1d] hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Send Direct Email</span>
            </a>

            <button
              onClick={onOpenResume}
              className="px-5 py-3 rounded-[10px] bg-[#e5e4e0] border border-[#bfbebe] text-[#1d1d1d] text-xs font-semibold hover:bg-[#cdcdc9] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>View Full Resume</span>
            </button>
          </div>
        </div>

        {/* Contact Links & Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs text-[#1d1d1d]/70">
          <div className="space-y-1.5">
            <span className="font-mono text-[#1d1d1d]/70 uppercase tracking-wider block">Direct Email</span>
            <a href={`mailto:${personal.email}`} className="font-mono text-sm font-semibold text-[#1d1d1d] hover:underline">
              {personal.email}
            </a>
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-[#1d1d1d]/70 uppercase tracking-wider block">LinkedIn Profile</span>
            <a
              href={personal.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-semibold text-[#1d1d1d] hover:underline inline-flex items-center gap-1"
            >
              <span>{personal.linkedinHandle}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-1.5">
            <span className="font-mono text-[#1d1d1d]/70 uppercase tracking-wider block">Location</span>
            <span className="font-mono text-sm font-semibold text-[#1d1d1d]">
              {personal.location} (Open to Relocation / Remote)
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#bfbebe] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#1d1d1d]/70">
          <div>
            © {new Date().getFullYear()} Muhammad Muhibullah · Forward Deployed Engineering & Systems Integration
          </div>
          <div className="flex items-center gap-4">
            <a href="#overview" className="hover:text-[#1d1d1d]">Back to Top ↑</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function copyButtonLabel(copyStatus, email) {
  if (copyStatus === 'copied') return `Copied ${email}`;
  if (copyStatus === 'failed') return 'Copy failed';
  return 'Copy Email Address';
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

import React from 'react';
import { X, Printer, Copy, Check, CircleAlert } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import { useClipboardCopy } from '../hooks/useClipboardCopy';

const copyStatusIcons = { idle: Copy, copied: Check, failed: CircleAlert };
const copyStatusLabels = { idle: 'Copy Summary', copied: 'Copied', failed: 'Copy failed' };

export default function ResumeModal({ onClose }) {
  const { personal, experience, education, skills } = portfolioData;
  const [copyStatus, copyText] = useClipboardCopy();

  const handleCopyText = () => {
    copyText(`MUHAMMAD MUHIBULLAH\nData Engineer | Forward Deployed Engineering & Systems Integration\n${personal.email} | ${personal.linkedinHandle} | ${personal.location}\n\nSUMMARY\n${personal.summary}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const CopyStatusIcon = copyStatusIcons[copyStatus];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1d1d1d]/60 backdrop-blur-sm flex justify-center items-start sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white border border-[#bfbebe] overflow-hidden my-auto min-h-screen sm:min-h-0">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#bfbebe] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#1d1d1d] uppercase">
              Curriculum Vitae / Resume
            </span>
            <span className="text-xs text-[#1d1d1d]/70">· Muhammad Muhibullah</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-[10px] border border-[#bfbebe] bg-[#e5e4e0] text-xs font-semibold text-[#1d1d1d] hover:bg-[#cdcdc9] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CopyStatusIcon className="w-3.5 h-3.5" />
              <span>{copyStatusLabels[copyStatus]}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-[10px] border border-[#1d1d1d] bg-[#1d1d1d] text-white text-xs font-semibold hover:bg-white hover:text-[#1d1d1d] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[10px] bg-[#e5e4e0] border border-[#bfbebe] flex items-center justify-center text-[#1d1d1d] hover:bg-[#cdcdc9] transition-colors cursor-pointer"
              aria-label="Close resume"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Resume Canvas */}
        <div className="p-8 sm:p-12 text-[#1d1d1d] font-sans space-y-8 print:p-0">
          {/* Header */}
          <div className="text-center space-y-2 border-b border-[#bfbebe] pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase">
              Muhammad Muhibullah
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#1d1d1d]">
              Data Engineer | Forward Deployed Engineering & Systems Integration
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-[#1d1d1d]/70 pt-1">
              <a href={`mailto:${personal.email}`} className="underline hover:text-[#1d1d1d]">{personal.email}</a>
              <span>•</span>
              <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" className="underline hover:text-[#1d1d1d]">{personal.linkedinHandle}</a>
              <span>•</span>
              <span>{personal.location}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono tracking-widest uppercase border-b border-[#1d1d1d] pb-1">
              Summary
            </h3>
            <p className="text-xs sm:text-sm text-[#1d1d1d] leading-relaxed">
              {personal.summary}
            </p>
          </div>

          {/* Experience */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest uppercase border-b border-[#1d1d1d] pb-1">
              Experience
            </h3>

            <div className="space-y-6">
              {experience.map((job, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-baseline font-bold text-xs sm:text-sm">
                    <span>{job.role} · {job.company}</span>
                    <span className="font-mono text-xs font-normal text-[#1d1d1d]/70">{job.period}</span>
                  </div>

                  <ul className="space-y-1.5 pl-4 list-disc text-xs sm:text-[13px] text-[#1d1d1d] leading-relaxed">
                    {job.highlights.map((h, hIdx) => {
                      const parts = h.split(':');
                      const title = parts.length > 1 ? parts[0] : '';
                      const rest = parts.length > 1 ? parts.slice(1).join(':') : h;
                      return (
                        <li key={hIdx}>
                          {title && <strong>{title}:</strong>} {rest}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono tracking-widest uppercase border-b border-[#1d1d1d] pb-1">
              Skills
            </h3>
            <div className="text-xs sm:text-[13px] space-y-1.5 text-[#1d1d1d]">
              <p><strong>Engineering:</strong> {skills.engineering.join(', ')}</p>
              <p><strong>ML & AI:</strong> {skills.aiMl.join(', ')}</p>
              <p><strong>Data & Cloud:</strong> {skills.dataCloud.join(', ')}</p>
              <p><strong>Reliability & Delivery:</strong> {skills.reliability.join(', ')}</p>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono tracking-widest uppercase border-b border-[#1d1d1d] pb-1">
              Education
            </h3>
            <div className="space-y-1 text-xs sm:text-[13px] text-[#1d1d1d]">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between">
                  <span><strong>{edu.degree}</strong> · {edu.institution}</span>
                  <span className="font-mono text-xs text-[#1d1d1d]/70">{edu.graduation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

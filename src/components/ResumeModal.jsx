import React from 'react';
import { X, Download, Printer, Copy, Check, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export default function ResumeModal({ onClose }) {
  const { personal, experience, education, skills } = portfolioData;
  const [copied, setCopied] = React.useState(false);

  const handleCopyText = () => {
    navigator.clipboard.writeText(`MUHAMMAD MUHIBULLAH\nData Engineer | Forward Deployed Engineering & Systems Integration\n${personal.phone} | ${personal.email} | ${personal.linkedinHandle} | ${personal.location}\n\nSUMMARY\n${personal.summary}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-start sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white sm:rounded-3xl border border-[#dcdad1] shadow-2xl overflow-hidden my-auto min-h-screen sm:min-h-0">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#e2e0d8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#181818] uppercase">
              Curriculum Vitae / Resume
            </span>
            <span className="text-xs text-[#888]">· Muhammad Muhibullah</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-xl border border-[#dedcd4] bg-[#f8f7f4] text-xs font-semibold text-[#181818] hover:bg-[#eae8e1] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#181818] text-white text-xs font-semibold hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f6f5f1] border border-[#dedcd4] flex items-center justify-center text-[#444] hover:text-black hover:bg-[#eae8e1] transition-colors cursor-pointer"
              aria-label="Close resume"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Resume Canvas */}
        <div className="p-8 sm:p-12 text-[#181818] font-sans space-y-8 print:p-0">
          {/* Header */}
          <div className="text-center space-y-2 border-b border-[#e2e0d8] pb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase">
              Muhammad Muhibullah
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#333]">
              Data Engineer | Forward Deployed Engineering & Systems Integration
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-[#555] pt-1">
              <span>{personal.phone}</span>
              <span>•</span>
              <a href={`mailto:${personal.email}`} className="underline hover:text-black">{personal.email}</a>
              <span>•</span>
              <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" className="underline hover:text-black">{personal.linkedinHandle}</a>
              <span>•</span>
              <span>{personal.location}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono tracking-widest uppercase border-b border-[#181818] pb-1">
              Summary
            </h3>
            <p className="text-xs sm:text-sm text-[#333] leading-relaxed">
              {personal.summary}
            </p>
          </div>

          {/* Experience */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest uppercase border-b border-[#181818] pb-1">
              Experience
            </h3>

            <div className="space-y-6">
              {experience.map((job, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-baseline font-bold text-xs sm:text-sm">
                    <span>{job.role} · {job.company}</span>
                    <span className="font-mono text-xs font-normal text-[#666]">{job.period}</span>
                  </div>

                  <ul className="space-y-1.5 pl-4 list-disc text-xs sm:text-[13px] text-[#333] leading-relaxed">
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
            <h3 className="text-xs font-bold font-mono tracking-widest uppercase border-b border-[#181818] pb-1">
              Skills
            </h3>
            <div className="text-xs sm:text-[13px] space-y-1.5 text-[#333]">
              <p><strong>Engineering:</strong> {skills.engineering.join(', ')}</p>
              <p><strong>ML & AI:</strong> {skills.aiMl.join(', ')}</p>
              <p><strong>Data & Cloud:</strong> {skills.dataCloud.join(', ')}</p>
              <p><strong>Reliability & Delivery:</strong> {skills.reliability.join(', ')}</p>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-mono tracking-widest uppercase border-b border-[#181818] pb-1">
              Education
            </h3>
            <div className="space-y-1 text-xs sm:text-[13px] text-[#333]">
              {education.map((edu, idx) => (
                <div key={idx} className="flex justify-between">
                  <span><strong>{edu.degree}</strong> · {edu.institution}</span>
                  <span className="font-mono text-xs text-[#666]">{edu.graduation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

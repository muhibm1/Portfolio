import React, { useState } from 'react';
import { X, Check, ArrowRight, ShieldCheck, Cpu, Database, GitBranch, Layers, Activity, ChevronRight, Terminal } from 'lucide-react';

export default function CaseStudyModal({ caseStudy, onClose, onLaunchSimulator }) {
  if (!caseStudy) return null;

  const [activeTab, setActiveTab] = useState('architecture'); // 'architecture', 'challenge', 'impact', 'payload'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-start sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#f6f5f1] sm:rounded-3xl border border-[#dcdad1] shadow-2xl overflow-hidden my-auto min-h-screen sm:min-h-0">
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-20 bg-[#f6f5f1]/95 backdrop-blur-md border-b border-[#e2e0d8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-[#181818] text-white font-mono text-xs font-semibold uppercase">
              {caseStudy.badge}
            </span>
            <span className="font-mono text-xs text-[#787670]">
              {caseStudy.client} · {caseStudy.period}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#dedcd4] flex items-center justify-center text-[#444] hover:text-black hover:bg-[#eae8e1] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Hero */}
        <div className="p-6 sm:p-10 border-b border-[#e2e0d8] bg-white">
          <span className="font-mono text-xs uppercase tracking-widest text-[#7a7872] block mb-2">
            Forward Deployed Engineering Case Study
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#181818] font-['Space_Grotesk',sans-serif] leading-tight mb-4">
            {caseStudy.title}
          </h2>
          <p className="text-base sm:text-lg text-[#55534e] max-w-3xl leading-relaxed">
            {caseStudy.summary}
          </p>

          {/* Quick Metrics Banner */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#f0eee6]">
            {caseStudy.impact.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#fbfbf9] border border-[#e8e6de]">
                <span className="text-xs font-mono text-[#787670] uppercase block">
                  {item.label}
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-lg sm:text-xl font-bold font-mono text-[#181818]">
                    {item.after}
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                    {item.change}
                  </span>
                </div>
                <span className="text-[11px] text-[#888680] block mt-1">
                  Baseline: {item.before}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 sm:px-10 border-b border-[#e2e0d8] bg-[#fbfbf9] flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'architecture', label: 'System Architecture & Flow' },
            { id: 'challenge', label: 'Client Challenge & Root Cause' },
            { id: 'impact', label: 'Measured Business Impact' },
            { id: 'specs', label: 'Tech Stack & Engineering Rigor' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-xs font-semibold tracking-tight whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#181818] text-[#181818]'
                  : 'border-transparent text-[#787670] hover:text-[#181818]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* TAB 1: SYSTEM ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[#181818] mb-2 font-['Space_Grotesk',sans-serif]">
                  Architectural Pipeline & Decision Flow
                </h3>
                <p className="text-sm text-[#5f5d56] leading-relaxed">
                  How data moves through the integration layer, deterministic safety gates, LLM classification, and human-in-the-loop review queues.
                </p>
              </div>

              {/* Architectural Step-by-Step Flow */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {caseStudy.diagramSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white border border-[#e4e2da] shadow-2xs relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-[#f6f5f1] border border-[#dedcd4] flex items-center justify-center font-mono text-xs font-bold text-[#181818] mb-4">
                        0{idx + 1}
                      </div>
                      <h4 className="text-sm font-bold text-[#181818] mb-2 tracking-tight">
                        {step.title}
                      </h4>
                      <p className="text-xs text-[#63615a] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                    {idx < caseStudy.diagramSteps.length - 1 && (
                      <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#f6f5f1] border border-[#dedcd4] flex items-center justify-center text-[#787670]">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* FDE Implementation Breakdown */}
              <div className="p-6 rounded-2xl bg-white border border-[#e4e2da] space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#181818] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  Forward Deployed Engineering Execution
                </h4>
                <div className="text-sm text-[#484641] leading-relaxed whitespace-pre-line">
                  {caseStudy.solution}
                </div>
              </div>

              {/* Interactive Demo CTA if LLM Triage */}
              {caseStudy.id === 'apple-llm-triage' && (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-xs font-mono font-bold uppercase text-emerald-800">
                      Live Simulation Available
                    </span>
                    <p className="text-xs text-emerald-950 font-medium">
                      Test this exact decision gate in the browser with sample enterprise tickets and confidence scoring.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onLaunchSimulator();
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Launch Simulator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CLIENT CHALLENGE */}
          {activeTab === 'challenge' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#181818] mb-2 font-['Space_Grotesk',sans-serif]">
                  The Problem at Client Inception
                </h3>
                <p className="text-sm text-[#5f5d56] leading-relaxed">
                  Why off-the-shelf software and naive roadmaps failed before forward deployed intervention.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#e4e2da] text-sm text-[#44423d] leading-relaxed space-y-4">
                <p>{caseStudy.challenge}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/60">
                  <h4 className="text-xs font-mono font-bold uppercase text-rose-900 mb-2">
                    Pain Point Before Intervention
                  </h4>
                  <ul className="text-xs text-rose-950 space-y-1.5 list-disc list-inside">
                    <li>Cross-system manual context switching</li>
                    <li>Risk of unauthorized execution on live systems</li>
                    <li>Engineering team bottlenecked by repetitive triage</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
                  <h4 className="text-xs font-mono font-bold uppercase text-emerald-900 mb-2">
                    Hardened FDE Resolution
                  </h4>
                  <ul className="text-xs text-emerald-950 space-y-1.5 list-disc list-inside">
                    <li>On-demand OAuth2 API orchestration</li>
                    <li>Deterministic fallback with human review queue</li>
                    <li>Auditable compliance trail with zero downtime</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEASURED IMPACT */}
          {activeTab === 'impact' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#181818] mb-2 font-['Space_Grotesk',sans-serif]">
                  Quantifiable Operational Outcomes
                </h3>
                <p className="text-sm text-[#5f5d56] leading-relaxed">
                  Metrics audited and verified across production environments.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#e4e2da] bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#fbfbf9] border-b border-[#e4e2da] text-xs font-mono uppercase text-[#787670]">
                    <tr>
                      <th className="p-4">Operational Area</th>
                      <th className="p-4">Before Deployment</th>
                      <th className="p-4">After Deployment</th>
                      <th className="p-4">Net Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0eee6] text-xs sm:text-sm">
                    {caseStudy.impact.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#fbfbf9]/60">
                        <td className="p-4 font-semibold text-[#181818]">{row.label}</td>
                        <td className="p-4 text-[#787670] font-mono">{row.before}</td>
                        <td className="p-4 font-mono font-bold text-[#181818]">{row.after}</td>
                        <td className="p-4">
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                            {row.change}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: TECH SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#181818] mb-2 font-['Space_Grotesk',sans-serif]">
                  Technologies & Systems Used
                </h3>
                <p className="text-sm text-[#5f5d56] leading-relaxed">
                  Infrastructure, libraries, protocols, and deployment environments.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {caseStudy.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-[#dedcd4] text-xs font-mono font-medium text-[#282725] shadow-2xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#e4e2da] text-xs text-[#55534e] space-y-2">
                <span className="font-mono font-bold text-[#181818] uppercase block">
                  Production Engineering Standards
                </span>
                <p>
                  Built to survive high-concurrency enterprise workloads. Incorporates comprehensive integration testing, automated regression verification, and telemetry export.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[#e2e0d8] bg-[#fbfbf9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-mono text-[#787670]">
            Candidate Portfolio · Muhammad Muhibullah
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-xl border border-[#dedcd4] bg-white text-[#181818] hover:bg-[#f6f5f1] transition-colors cursor-pointer"
            >
              Close
            </button>
            <a
              href="mailto:mmalqaim@gmail.com?subject=Discussing%20FDE%20Case%20Study"
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-xl bg-[#181818] text-white hover:bg-black transition-colors text-center cursor-pointer"
            >
              Discuss This Case Study
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

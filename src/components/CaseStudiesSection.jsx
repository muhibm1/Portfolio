import React, { useState } from 'react';
import { ArrowUpRight, ChevronRight, Layers, Sparkles, Database, GitBranch, Cpu } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export default function CaseStudiesSection({ onSelectCaseStudy, onOpenSimulator }) {
  const { caseStudies } = portfolioData;
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'LLM Decision Systems', 'Distributed Data & Cloud', 'Full-Stack & Real-Time'];

  const filteredStudies = filter === 'All' 
    ? caseStudies 
    : caseStudies.filter(s => s.category === filter);

  return (
    <section id="case-studies" className="py-20 px-4 border-t border-[#e2e0d8] bg-[#f6f5f1]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#7a7872] block mb-2">
              02 // Systems & Deployments
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#181818] font-['Space_Grotesk',sans-serif]">
              Featured FDE Case Studies
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#615f59] max-w-md leading-relaxed">
            Detailed teardowns of mission-critical systems deployed at Apple and Neural Newsletters—covering the client challenge, architecture, and measured outcomes.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
                filter === cat
                  ? 'bg-[#181818] text-white shadow-2xs'
                  : 'bg-white border border-[#dedcd4] text-[#55534e] hover:border-[#b8b6ad] hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 gap-8">
          {filteredStudies.map((study, index) => (
            <div
              key={study.id}
              className="p-6 sm:p-9 rounded-3xl bg-white border border-[#e4e2da] shadow-2xs hover:shadow-md hover:border-[#cbc8be] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-lg bg-[#f6f5f1] border border-[#e2e0d8] font-mono text-xs font-bold text-[#181818]">
                      0{index + 1}
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-[#181818] text-white font-mono text-xs font-semibold">
                      {study.badge}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#787670]">
                    {study.client} · {study.period}
                  </span>
                </div>

                {/* Title & Summary */}
                <h3 className="text-2xl sm:text-3xl font-bold text-[#181818] tracking-tight mb-3 font-['Space_Grotesk',sans-serif] group-hover:text-black transition-colors">
                  {study.title}
                </h3>
                <p className="text-sm sm:text-base text-[#52504a] leading-relaxed mb-6 max-w-4xl">
                  {study.summary}
                </p>

                {/* Key Metrics Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 pt-5 border-t border-[#f0eee6]">
                  {study.impact.map((metric, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#fbfbf9] border border-[#e8e6de]">
                      <span className="text-[11px] font-mono text-[#787670] uppercase block mb-0.5">
                        {metric.label}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-base sm:text-lg font-bold font-mono text-[#181818]">
                          {metric.after}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Architectural Flow Preview */}
                <div className="p-4 rounded-2xl bg-[#f6f5f1] border border-[#e4e2da] mb-6">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#787670] block mb-3 font-semibold">
                    System Architecture Pipeline
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    {study.diagramSteps.map((step, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-[#dedcd4] flex flex-col justify-between">
                        <span className="font-mono text-[10px] text-[#888] font-bold block mb-1">
                          Stage 0{idx + 1}
                        </span>
                        <span className="font-semibold text-[#181818] leading-tight mb-1">
                          {step.title}
                        </span>
                        <span className="text-[11px] text-[#666] leading-snug">
                          {step.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Tech Stack & CTA */}
              <div className="pt-5 border-t border-[#f0eee6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {study.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#fbfbf9] border border-[#dedcd4] text-[11px] font-mono text-[#444]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {study.id === 'apple-llm-triage' && (
                    <button
                      onClick={onOpenSimulator}
                      className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Test Simulator</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectCaseStudy(study)}
                    className="px-5 py-2.5 rounded-xl bg-[#181818] text-white text-xs font-semibold hover:bg-black transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Inspect Architectural Specs</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { Code2, Brain, Database, ShieldAlert } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export default function SkillsMatrix() {
  const { skills } = portfolioData;

  const categories = [
    {
      title: 'Engineering & Integration',
      subtitle: 'Languages, APIs & Protocols',
      icon: <Code2 className="w-5 h-5 text-[#1d1d1d]" />,
      items: skills.engineering
    },
    {
      title: 'AI & LLM Decision Systems',
      subtitle: 'Prompting, Triage & MLOps',
      icon: <Brain className="w-5 h-5 text-[#1d1d1d]" />,
      items: skills.aiMl
    },
    {
      title: 'Distributed Data & Cloud',
      subtitle: 'Pipelines, Lakes & Compute',
      icon: <Database className="w-5 h-5 text-[#1d1d1d]" />,
      items: skills.dataCloud
    },
    {
      title: 'Reliability & Delivery',
      subtitle: 'Incident Response & Quality Gates',
      icon: <ShieldAlert className="w-5 h-5 text-[#1d1d1d]" />,
      items: skills.reliability
    }
  ];

  return (
    <section id="skills" className="py-20 px-4 border-t border-[#bfbebe] bg-[#e5e4e0]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#1d1d1d]/70 block mb-2">
              04 // Technical Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1d] font-['Space_Grotesk',sans-serif]">
              Systems Architecture & Tech Stack
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#1d1d1d]/70 max-w-md leading-relaxed">
            The tools, frameworks, and methodologies applied daily to ship working software and integrate client backends.
          </p>
        </div>

        {/* 4 Quadrant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="p-7 bg-white border border-[#bfbebe] space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-[#bfbebe] pb-4">
                <div className="w-10 h-10 bg-[#e5e4e0] border border-[#bfbebe] flex items-center justify-center">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1d1d1d] tracking-tight">
                    {cat.title}
                  </h3>
                  <span className="text-xs font-mono text-[#1d1d1d]/70">
                    {cat.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {cat.items.map((item, itemIdx) => (
                  <span
                    key={itemIdx}
                    className="px-3 py-1.5 bg-[#e5e4e0] border border-[#bfbebe] text-xs font-mono text-[#1d1d1d]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

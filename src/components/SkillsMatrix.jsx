import React from 'react';
import { Code2, Brain, Database, ShieldAlert, Cpu } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export default function SkillsMatrix() {
  const { skills } = portfolioData;

  const categories = [
    {
      title: 'Engineering & Integration',
      subtitle: 'Languages, APIs & Protocols',
      icon: <Code2 className="w-5 h-5 text-[#181818]" />,
      items: skills.engineering
    },
    {
      title: 'AI & LLM Decision Systems',
      subtitle: 'Prompting, Triage & MLOps',
      icon: <Brain className="w-5 h-5 text-[#181818]" />,
      items: skills.aiMl
    },
    {
      title: 'Distributed Data & Cloud',
      subtitle: 'Pipelines, Lakes & Compute',
      icon: <Database className="w-5 h-5 text-[#181818]" />,
      items: skills.dataCloud
    },
    {
      title: 'Reliability & Delivery',
      subtitle: 'Incident Response & Quality Gates',
      icon: <ShieldAlert className="w-5 h-5 text-[#181818]" />,
      items: skills.reliability
    }
  ];

  return (
    <section id="skills" className="py-20 px-4 border-t border-[#e2e0d8] bg-[#fbfbf9]/70">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#7a7872] block mb-2">
              04 // Technical Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#181818] font-['Space_Grotesk',sans-serif]">
              Systems Architecture & Tech Stack
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#615f59] max-w-md leading-relaxed">
            The tools, frameworks, and methodologies applied daily to ship working software and integrate client backends.
          </p>
        </div>

        {/* 4 Quadrant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white border border-[#e4e2da] shadow-2xs hover:shadow-xs transition-all space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-[#f0eee6] pb-4">
                <div className="w-10 h-10 rounded-xl bg-[#f6f5f1] border border-[#dedcd4] flex items-center justify-center">
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#181818] tracking-tight">
                    {cat.title}
                  </h3>
                  <span className="text-xs font-mono text-[#787670]">
                    {cat.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {cat.items.map((item, itemIdx) => (
                  <span
                    key={itemIdx}
                    className="px-3 py-1.5 rounded-xl bg-[#f8f7f4] border border-[#dedcd4] text-xs font-mono text-[#282725] hover:bg-white hover:border-[#cbc8be] transition-colors"
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

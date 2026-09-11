import React from 'react';
import { ArrowDown, ArrowUpRight, Cpu, GitBranch, Layers, ShieldCheck, Terminal, Sparkles } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import MmLogo from './MmLogo';

export default function Hero({ onOpenSimulator, onOpenCaseStudy }) {
  const { personal, telemetry } = portfolioData;

  return (
    <section id="overview" className="relative min-h-[92vh] flex flex-col justify-center pt-28 pb-16 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          {/* LEFT: Hero Content */}
          <div className="flex-1 max-w-2xl">
            {/* Availability Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#dedcd4] bg-white/80 backdrop-blur-xs mb-8 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#484642] font-medium">
                Available for Forward Deployed Engineering & Systems Integration Roles
              </span>
            </div>

            {/* Monumental Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold tracking-tight text-[#181818] leading-[0.95] uppercase font-['Space_Grotesk',sans-serif]">
                Muhammad <br />
                Muhibullah
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-[#3d3b37] font-normal tracking-tight leading-snug">
                Forward Deployed Engineer connecting a client's real-world systems and shipping trustworthy software on live production data.
              </p>
            </div>

            {/* Narrative / Pitch */}
            <div className="mt-8 text-base sm:text-lg text-[#5a5853] font-normal leading-relaxed">
              <p>
                Currently a <span className="text-[#181818] font-medium">Data Engineer at Apple (via TCS)</span> in Austin, TX. 
                I bridge disparate enterprise backends through authenticated APIs, architect auditable LLM decision gates that scale ticket throughput from 30 to 350+/day, and maintain multi-region data reliability across 50+ regions.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#case-studies"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#181818] text-white text-sm font-semibold hover:bg-black transition-all shadow-sm group cursor-pointer"
              >
                <span>Explore Case Studies</span>
                <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </a>

              <a
                href="#simulator"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#dedcd4] text-[#181818] text-sm font-semibold hover:bg-[#faf9f6] hover:border-[#cbc8be] transition-all shadow-2xs group cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-emerald-600" />
                <span>Interactive Triage Simulator</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500 transition-transform group-hover:rotate-12" />
              </a>

              <a
                href="https://www.linkedin.com/in/muhibm1/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-[#dedcd4] bg-white/70 text-[#484642] text-sm font-medium hover:text-black hover:bg-white transition-all shadow-2xs"
              >
                <span>LinkedIn</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* RIGHT: Bespoke Architectural MM Emblem (Unique, original mark) */}
          <div className="flex justify-center lg:justify-end shrink-0">
            <MmLogo size={420} className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px]" />
          </div>
        </div>

        {/* Operational Telemetry Ticker */}
        <div className="mt-16 pt-10 border-t border-[#e2e0d8]">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#7a7872] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#181818]"></span>
              Operational Telemetry & Impact
            </span>
            <span className="font-mono text-xs text-[#8c8a83] hidden sm:inline">
              Source: Production Deployments (Apple / Neural Newsletters)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {telemetry.map((item, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-white/90 border border-[#e4e2da] shadow-2xs flex flex-col justify-between hover:border-[#cbc8be] transition-all"
              >
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-[#181818]">
                      {item.metric}
                    </span>
                    <span className="font-mono text-xs text-[#787670] uppercase font-semibold">
                      {item.unit}
                    </span>
                  </div>
                  <h4 className="mt-1 text-sm font-semibold text-[#282725] tracking-tight">
                    {item.label}
                  </h4>
                </div>
                <p className="mt-3 text-xs text-[#6e6c66] leading-relaxed border-t border-[#f0eee6] pt-2">
                  {item.context}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

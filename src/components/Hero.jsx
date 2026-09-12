import React from 'react';
import { ArrowDown, ArrowUpRight, Terminal, Sparkles } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import ThinkingOrbHero from './ThinkingOrbHero';

// The ambient glow behind the orb, carried over from the retired monogram. Opacity is 0.34
// rather than the monogram's 0.6 so the orb's dots stay readable over it (owner's design
// preview, conductor log 2026-09-12T11:34).
const ORB_GLOW_STYLE = {
  background: 'radial-gradient(circle at 45% 45%, rgba(250, 203, 14, 0.45) 0%, rgba(240, 107, 168, 0.4) 35%, rgba(120, 186, 230, 0.35) 65%, transparent 85%)',
  filter: 'blur(38px)',
};

export default function Hero() {
  const { telemetry } = portfolioData;

  return (
    <section id="overview" className="relative min-h-[92vh] flex flex-col justify-center pt-28 pb-16 px-4 overflow-hidden bg-[#e5e4e0]">
      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          {/* LEFT: Hero Content */}
          <div className="flex-1 max-w-2xl">
            {/* Availability Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#bfbebe] bg-white mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1d1d1d] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1d1d1d]"></span>
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#1d1d1d] font-medium">
                Available for Forward Deployed Engineering & Systems Integration Roles
              </span>
            </div>

            {/* Monumental Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold tracking-tight text-[#1d1d1d] leading-[0.95] uppercase font-['Space_Grotesk',sans-serif]">
                Muhammad <br />
                Muhibullah
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl text-[#1d1d1d]/80 font-normal tracking-tight leading-snug">
                Forward Deployed Engineer connecting a client's real-world systems and shipping trustworthy software on live production data.
              </p>
            </div>

            {/* Narrative / Pitch */}
            <div className="mt-8 text-base sm:text-lg text-[#1d1d1d]/70 font-normal leading-relaxed">
              <p>
                Currently a <span className="text-[#1d1d1d] font-medium">Data Engineer at Apple (via TCS)</span> in Austin, TX.
                I bridge disparate enterprise backends through authenticated APIs, architect auditable LLM decision gates that scale ticket throughput from 30 to 350+/day, and maintain multi-region data reliability across 50+ regions.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href="#case-studies"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] border border-[#1d1d1d] bg-[#1d1d1d] text-white text-sm font-semibold hover:bg-transparent hover:text-[#1d1d1d] transition-colors group cursor-pointer"
              >
                <span>Explore Case Studies</span>
                <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </a>

              <a
                href="#simulator"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[10px] border border-[#1d1d1d] bg-white text-[#1d1d1d] text-sm font-semibold hover:bg-[#1d1d1d] hover:text-white transition-colors group cursor-pointer"
              >
                <Terminal className="w-4 h-4" />
                <span>Interactive Triage Simulator</span>
                <Sparkles className="w-3.5 h-3.5 transition-transform group-hover:rotate-12" />
              </a>

              <a
                href="https://www.linkedin.com/in/muhibm1/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-[10px] border border-[#bfbebe] bg-white text-[#1d1d1d] text-sm font-medium hover:border-[#1d1d1d] transition-colors"
              >
                <span>LinkedIn</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* RIGHT: the live orb over its ambient glow */}
          <div className="flex justify-center lg:justify-end shrink-0">
            <div className="relative flex items-center justify-center select-none">
              <div
                className="absolute inset-0 rounded-full pointer-events-none opacity-[0.34] mix-blend-multiply transition-all duration-700 animate-iridescent"
                style={ORB_GLOW_STYLE}
              />
              <div className="relative z-10">
                <ThinkingOrbHero />
              </div>
            </div>
          </div>
        </div>

        {/* Operational Telemetry Ticker */}
        <div className="mt-16 pt-10 border-t border-[#bfbebe]">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#1d1d1d]/70 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1d1d1d]"></span>
              Operational Telemetry & Impact
            </span>
            <span className="font-mono text-xs text-[#1d1d1d]/70 hidden sm:inline">
              Source: Production Deployments (Apple / Neural Newsletters)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {telemetry.map((item) => (
              <div
                key={item.label}
                className="p-5 bg-white border border-[#bfbebe] flex flex-col justify-between hover:border-[#1d1d1d] transition-colors"
              >
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-[#1d1d1d]">
                      {item.metric}
                    </span>
                    <span className="font-mono text-xs text-[#1d1d1d]/70 uppercase font-semibold">
                      {item.unit}
                    </span>
                  </div>
                  <h4 className="mt-1 text-sm font-semibold text-[#1d1d1d] tracking-tight">
                    {item.label}
                  </h4>
                </div>
                <p className="mt-3 text-xs text-[#1d1d1d]/70 leading-relaxed border-t border-[#cdcdc9] pt-2">
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

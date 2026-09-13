import React from 'react';
import { Network, ShieldCheck, Activity, CheckCircle2, ArrowRight } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export default function FdePhilosophy() {
  const { philosophy } = portfolioData;

  const icons = [
    <Network key="network" className="w-6 h-6 text-[#1d1d1d]" />,
    <ShieldCheck key="shield-check" className="w-6 h-6 text-[#1d1d1d]" />,
    <Activity key="activity" className="w-6 h-6 text-[#1d1d1d]" />
  ];

  return (
    <section id="philosophy" className="py-20 px-4 border-t border-[#bfbebe] bg-[#e5e4e0]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#1d1d1d]/70 block mb-2">
              01 // Forward Deployed Mindset
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1d] font-['Space_Grotesk',sans-serif]">
              Why Forward Deployed Engineering?
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#1d1d1d]/70 max-w-md leading-relaxed">
            FDE is not standard product engineering. It's about sitting at the sharp edge of client reality, integrating messy systems, and delivering operational results when off-the-shelf software fails.
          </p>
        </div>

        {/* 3 Core Operating Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {philosophy.map((item, index) => (
            <div
              key={index}
              className="p-7 bg-white border border-[#bfbebe] hover:border-[#1d1d1d] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-[#e5e4e0] border border-[#bfbebe] flex items-center justify-center">
                    {icons[index]}
                  </div>
                  <span className="font-mono text-2xl font-bold text-[#bfbebe]">
                    {item.number}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#1d1d1d] tracking-tight mb-2">
                  {item.title}
                </h3>

                <p className="text-xs font-mono text-[#1d1d1d] bg-[#e5e4e0] border border-[#bfbebe] px-2.5 py-1 inline-block mb-4">
                  {item.tagline}
                </p>

                <p className="text-sm text-[#1d1d1d]/70 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#bfbebe] flex items-center gap-2 text-xs font-semibold text-[#1d1d1d]">
                <span>Battle-tested in production</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1d1d1d]" />
              </div>
            </div>
          ))}
        </div>

        {/* Systems Comparison Bar */}
        <div className="mt-10 p-6 bg-[#1d1d1d] text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="font-mono text-xs uppercase tracking-widest text-[#bfbebe]">
              The FDE Differentiator
            </span>
            <h4 className="text-lg font-semibold tracking-tight text-white">
              "Connecting a client's real systems beats waiting for a perfect spec."
            </h4>
            <p className="text-xs text-[#cdcdc9] max-w-xl">
              From OAuth2 bridges between ticket & geo-data tools at Apple to Elixir Phoenix WebSockets at Neural Newsletters, I deliver end-to-end working software directly where data lives.
            </p>
          </div>
          <a
            href="#simulator"
            className="shrink-0 px-4 py-2.5 rounded-[10px] border border-white bg-white text-[#1d1d1d] text-xs font-semibold hover:bg-transparent hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Test the Decision Architecture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

// The home page's featured case studies, one card per study on the Varick pattern: title,
// context paragraph, capability bullets and a link to the study's own /work page.
export default function CaseStudiesSection() {
  const { caseStudies } = portfolioData;

  return (
    <section id="case-studies" className="py-20 px-4 border-t border-[#bfbebe] bg-[#e5e4e0]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#1d1d1d]/70 block mb-2">
              02 // Systems & Deployments
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1d] font-['Space_Grotesk',sans-serif]">
              Featured FDE Case Studies
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#1d1d1d]/70 max-w-md leading-relaxed">
            Detailed teardowns of mission-critical systems deployed at Apple and Neural Newsletters—covering the client challenge, architecture, and measured outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {caseStudies.map((study, index) => (
            <CaseStudyCard key={study.id} study={study} position={index + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseStudyCard({ study, position }) {
  const titleId = `case-study-${study.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className="p-[30px] bg-white border border-[#bfbebe] hover:border-[#1d1d1d] transition-colors flex flex-col justify-between"
    >
      <div>
        {/* Meta Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 bg-[#e5e4e0] border border-[#bfbebe] font-mono text-xs font-bold text-[#1d1d1d]">
              0{position}
            </span>
            <span className="px-3 py-1 bg-[#1d1d1d] text-white font-mono text-xs font-semibold">
              {study.badge}
            </span>
          </div>
          <span className="font-mono text-xs text-[#1d1d1d]/70">
            {study.client} · {study.period}
          </span>
        </div>

        {/* Title & Context */}
        <h3 id={titleId} className="text-2xl sm:text-3xl font-bold text-[#1d1d1d] tracking-tight mb-3 font-['Space_Grotesk',sans-serif]">
          {study.title}
        </h3>
        <p className="text-sm sm:text-base text-[#1d1d1d]/70 leading-relaxed mb-6 max-w-4xl">
          {study.summary}
        </p>

        {/* Capability Bullets: one per stage of the system's pipeline */}
        <ul className="space-y-3 mb-6 pt-5 border-t border-[#cdcdc9]">
          {study.diagramSteps.map((step) => (
            <li key={step.title} className="text-xs sm:text-sm text-[#1d1d1d]/70 leading-relaxed flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-[#1d1d1d] mt-2 shrink-0"></span>
              <div>
                <span className="font-semibold text-[#1d1d1d] mr-1">{step.title}:</span>
                <span>{step.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Card Footer: Tech Stack & Links */}
      <div className="pt-5 border-t border-[#cdcdc9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {study.techStack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 bg-[#e5e4e0] border border-[#bfbebe] text-[11px] font-mono text-[#1d1d1d]"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {study.id === 'apple-llm-triage' && (
            <a
              href="#simulator"
              className="px-4 py-2.5 rounded-[10px] border border-[#1d1d1d] bg-white text-[#1d1d1d] text-xs font-semibold hover:bg-[#1d1d1d] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Test Simulator</span>
            </a>
          )}

          <Link
            to={`/work/${study.id}`}
            aria-describedby={titleId}
            className="px-5 py-2.5 rounded-[10px] border border-[#1d1d1d] bg-[#1d1d1d] text-white text-xs font-semibold hover:bg-transparent hover:text-[#1d1d1d] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Inspect Architectural Specs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

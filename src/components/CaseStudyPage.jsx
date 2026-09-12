import React, { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';
import NotFoundPage from '../pages/NotFoundPage';
import CaseStudyFlowDiagram from './CaseStudyFlowDiagram';

// The four chips from the case-study mockup, in display order. Each chip's body shows one part of
// the case study's data and nothing else (R23).
const chips = [
  { id: 'challenge', label: 'Challenge' },
  { id: 'architecture', label: 'System Architecture' },
  { id: 'deployment', label: 'Production Deployment' },
  { id: 'impact', label: 'Measured Impact' },
];

const titleId = 'case-study-title';
const panelId = 'case-study-panel';
const metricsHeadingId = 'case-study-metrics-heading';

const darkButtonClass =
  'inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] border border-[#1d1d1d] bg-[#1d1d1d] text-white text-xs font-semibold hover:bg-white hover:text-[#1d1d1d] transition-colors';
const neighbourLinkClass = 'block p-5 bg-white border border-[#bfbebe] hover:border-[#1d1d1d] transition-colors';

/** The /work/:slug page: one case study from portfolioData, or the not-found page for any other slug. */
export default function CaseStudyPage() {
  const { slug } = useParams();
  const [activeChipId, setActiveChipId] = useState('architecture');

  const { caseStudies, personal } = portfolioData;
  const position = caseStudies.findIndex((study) => study.id === slug);
  if (position === -1) return <NotFoundPage />;

  const caseStudy = caseStudies[position];
  const { previous, next } = neighboursOf(caseStudies, position);

  return (
    <main className="pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <CaseStudyHeader caseStudy={caseStudy} />

        <div role="tablist" aria-labelledby={titleId} className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <ChipButton key={chip.id} chip={chip} isActive={chip.id === activeChipId} onSelect={setActiveChipId} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div role="tabpanel" id={panelId} aria-labelledby={chipElementId(activeChipId)} className="lg:col-span-2">
            <ChipBody chipId={activeChipId} caseStudy={caseStudy} />
          </div>
          <KeyMetrics impact={caseStudy.impact} />
        </div>

        {caseStudy.id === 'apple-llm-triage' && <SimulatorCallToAction />}

        <a href={`mailto:${personal.email}?subject=Discussing%20FDE%20Case%20Study`} className={darkButtonClass}>
          Discuss This Case Study
        </a>

        <CaseStudyNeighbours previous={previous} next={next} />
      </div>
    </main>
  );
}

// The case studies before and after the one at `position`, wrapping at both ends (R25).
function neighboursOf(caseStudies, position) {
  const count = caseStudies.length;
  return {
    previous: caseStudies[(position - 1 + count) % count],
    next: caseStudies[(position + 1) % count],
  };
}

function chipElementId(chipId) {
  return `case-study-chip-${chipId}`;
}

function CaseStudyHeader({ caseStudy }) {
  return (
    <header className="space-y-5">
      <span className="block font-mono text-xs uppercase tracking-widest text-[#1d1d1d]/70">
        Forward Deployed Engineering Case Study
      </span>
      <h1
        id={titleId}
        className="text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight leading-[0.95] text-[#1d1d1d] font-['Space_Grotesk',sans-serif]"
      >
        {caseStudy.title}
      </h1>
      <div className="flex flex-wrap items-center gap-3">
        <span className="px-2.5 py-1 bg-[#1d1d1d] text-white font-mono text-xs font-semibold uppercase">
          {caseStudy.badge}
        </span>
        <span className="font-mono text-xs text-[#1d1d1d]/70">
          {caseStudy.client} · {caseStudy.period}
        </span>
      </div>
      <p className="text-base sm:text-lg text-[#1d1d1d]/70 max-w-3xl leading-relaxed">{caseStudy.summary}</p>
    </header>
  );
}

function ChipButton({ chip, isActive, onSelect }) {
  return (
    <button
      type="button"
      role="tab"
      id={chipElementId(chip.id)}
      aria-selected={isActive}
      aria-controls={panelId}
      onClick={() => onSelect(chip.id)}
      className={`px-4 py-2 rounded-[10px] border border-[#1d1d1d] text-sm font-medium transition-colors cursor-pointer ${
        isActive ? 'bg-[#1d1d1d] text-white' : 'bg-transparent text-[#1d1d1d] hover:bg-white'
      }`}
    >
      {chip.label}
    </button>
  );
}

function ChipBody({ chipId, caseStudy }) {
  if (chipId === 'challenge') {
    return <p className="p-6 bg-white border border-[#bfbebe] text-sm text-[#1d1d1d] leading-relaxed">{caseStudy.challenge}</p>;
  }
  if (chipId === 'architecture') {
    return <CaseStudyFlowDiagram steps={caseStudy.diagramSteps} />;
  }
  if (chipId === 'deployment') {
    return <DeploymentDetails solution={caseStudy.solution} techStack={caseStudy.techStack} />;
  }
  return <ImpactTable impact={caseStudy.impact} />;
}

function DeploymentDetails({ solution, techStack }) {
  return (
    <div className="space-y-6">
      <p className="p-6 bg-white border border-[#bfbebe] text-sm text-[#1d1d1d] leading-relaxed whitespace-pre-line">
        {solution}
      </p>
      <ul className="flex flex-wrap gap-2">
        {techStack.map((tech) => (
          <li key={tech} className="px-3.5 py-1.5 bg-white border border-[#bfbebe] text-xs font-mono font-medium text-[#1d1d1d]">
            {tech}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImpactTable({ impact }) {
  return (
    <div className="overflow-x-auto bg-white border border-[#bfbebe]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#e5e4e0] border-b border-[#bfbebe] text-xs font-mono uppercase text-[#1d1d1d]/70">
          <tr>
            <th scope="col" className="p-4">Operational Area</th>
            <th scope="col" className="p-4">Before Deployment</th>
            <th scope="col" className="p-4">After Deployment</th>
            <th scope="col" className="p-4">Net Result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#bfbebe] text-xs sm:text-sm">
          {impact.map((row, index) => (
            <tr key={index}>
              <td className="p-4 font-semibold text-[#1d1d1d]">{row.label}</td>
              <td className="p-4 text-[#1d1d1d]/70 font-mono">{row.before}</td>
              <td className="p-4 font-mono font-bold text-[#1d1d1d]">{row.after}</td>
              <td className="p-4">
                <span className="font-mono text-xs font-bold text-[#1d1d1d] border border-[#1d1d1d] px-2 py-0.5">
                  {row.change}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KeyMetrics({ impact }) {
  return (
    <aside aria-labelledby={metricsHeadingId} className="space-y-4">
      <h2 id={metricsHeadingId} className="text-sm font-semibold text-[#1d1d1d]">
        Key enterprise metrics
      </h2>
      <ul className="space-y-4">
        {impact.map((item, index) => (
          <li key={index} className="p-6 bg-white border border-[#bfbebe]">
            <span className="block text-2xl font-bold font-mono text-[#1d1d1d]">{item.after}</span>
            <span className="block mt-1 text-xs font-mono uppercase text-[#1d1d1d]/70">{item.label}</span>
            <span className="inline-block mt-3 px-1.5 py-0.5 border border-[#1d1d1d] text-xs font-mono font-semibold text-[#1d1d1d]">
              {item.change}
            </span>
            <span className="block mt-2 text-[11px] text-[#1d1d1d]/70">Baseline: {item.before}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function SimulatorCallToAction() {
  return (
    <div className="p-6 bg-white border border-[#1d1d1d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <span className="block text-xs font-mono font-bold uppercase text-[#1d1d1d]">Live Simulation Available</span>
        <p className="text-sm text-[#1d1d1d]/70">
          Test this exact decision gate in the browser with sample enterprise tickets and confidence scoring.
        </p>
      </div>
      <Link to="/#simulator" className={`${darkButtonClass} shrink-0`}>
        <span>Launch Simulator</span>
        <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

function CaseStudyNeighbours({ previous, next }) {
  return (
    <nav aria-label="Case studies" className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-[#bfbebe]">
      <Link to={`/work/${previous.id}`} rel="prev" className={neighbourLinkClass}>
        <span className="flex items-center gap-1.5 font-mono text-xs uppercase text-[#1d1d1d]/70">
          <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5" /> Previous
        </span>
        <span className="block mt-2 text-sm font-semibold text-[#1d1d1d]">{previous.title}</span>
      </Link>
      <Link to={`/work/${next.id}`} rel="next" className={`${neighbourLinkClass} sm:text-right`}>
        <span className="flex items-center sm:justify-end gap-1.5 font-mono text-xs uppercase text-[#1d1d1d]/70">
          Next <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />
        </span>
        <span className="block mt-2 text-sm font-semibold text-[#1d1d1d]">{next.title}</span>
      </Link>
    </nav>
  );
}

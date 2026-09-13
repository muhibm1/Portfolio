import { ChevronRight } from 'lucide-react';

/**
 * Draws a case study's diagramSteps as a flow of nodes, one per step, for any number of steps.
 * Each step is `{ title, desc }`. An empty list draws nothing.
 */
export default function CaseStudyFlowDiagram({ steps }) {
  if (steps.length === 0) return null;

  return (
    <ol className="flex flex-col md:flex-row md:flex-wrap gap-6">
      {steps.map((step, index) => (
        <li key={index} className="relative flex-1 md:min-w-40 p-5 bg-white border border-[#bfbebe]">
          <strong className="block text-sm font-bold text-[#1d1d1d] mb-2 tracking-tight">{step.title}</strong>
          <p className="text-xs text-[#1d1d1d]/70 leading-relaxed">{step.desc}</p>
          {index < steps.length - 1 && (
            <ChevronRight
              aria-hidden="true"
              className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1d1d1d]/70"
            />
          )}
        </li>
      ))}
    </ol>
  );
}

// The three-line deployment summary (problem, decision, result) the featured cards and their
// case-study pages open with, before any technical detail (owner's brief, 2026-10-21).
const ROWS = [
  { key: 'problem', label: 'Problem' },
  { key: 'decision', label: 'Decision' },
  { key: 'result', label: 'Result' },
];

/** `summary` is a case study's `deploymentSummary`; `compact` tightens the type for a card. */
export default function DeploymentSummary({ summary, compact = false }) {
  return (
    <dl className={`grid ${compact ? 'gap-3' : 'gap-4'}`} aria-label="Deployment summary">
      {ROWS.map(({ key, label }) => (
        <div key={key} className="grid gap-1 sm:grid-cols-[88px_1fr] sm:gap-4">
          <dt className="font-mono text-xs uppercase tracking-widest text-muted sm:pt-1">{label}</dt>
          <dd className={compact ? 'text-[15px] leading-[1.55] text-ink-2' : 'text-base leading-relaxed text-ink-2 sm:text-lg'}>
            {summary[key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

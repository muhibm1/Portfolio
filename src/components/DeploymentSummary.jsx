// The deployment summary a case study opens with, before any technical detail: six rows in reading
// order (who uses it, what goes wrong, the rule in code that stops it, testing, result, decision).
// A card shows the first three and the result. Rows a summary does not carry are left out.
const ROWS = [
  { key: 'customer', label: 'Who uses it' },
  { key: 'problem', label: 'What goes wrong' },
  { key: 'integration', label: 'Rule in code' },
  { key: 'testing', label: 'Testing' },
  { key: 'result', label: 'Result' },
  { key: 'decision', label: 'Decision' },
];

const CARD_KEYS = ['customer', 'problem', 'integration', 'result'];

/** `summary` is a case study's `deploymentSummary`; `compact` tightens the type for a card. */
export default function DeploymentSummary({ summary, compact = false }) {
  const rows = ROWS.filter(({ key }) => summary[key] && (!compact || CARD_KEYS.includes(key)));
  return (
    <dl className={`grid ${compact ? 'gap-3' : 'gap-4'}`} aria-label="Deployment summary">
      {rows.map(({ key, label }) => (
        <div key={key} className="grid gap-1 sm:grid-cols-[136px_1fr] sm:gap-4">
          <dt className="font-mono text-xs uppercase tracking-widest text-muted sm:pt-1">{label}</dt>
          <dd className={compact ? 'text-[15px] leading-[1.55] text-ink-2' : 'text-base leading-relaxed text-ink-2 sm:text-lg'}>
            {summary[key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

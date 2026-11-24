// A case-study `comparison` block: each system next to its baseline on one shared percent scale,
// grouped, with the gap written out. A gap under the block's noise threshold is shown in grey
// and marked as within noise, so a small lead never reads as a win. Every value is written as
// text, so nothing depends on reading bar lengths.

/** `groups` is `[{ heading, rows: [{ project, measure, system, baseline }] }]`, values in percent. */
export default function CaseStudyComparisonChart({ title, groups, noise = 5, caption, systemLabel = 'System', baselineLabel = 'Baseline' }) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="flex flex-col gap-5 rounded-[10px] border border-line bg-surface p-5">
        {title && <p className="font-display text-base font-semibold text-ink">{title}</p>}
        <ul aria-label="Legend" className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-2">
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-2 w-5 rounded-full bg-ink" />
            {systemLabel}
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="inline-block h-2 w-5 rounded-full bg-grey-2" />
            {baselineLabel}
          </li>
        </ul>
        {groups.map((group) => (
          <div key={group.heading} className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-ink">{group.heading}</p>
            <ul className="flex flex-col gap-5">
              {group.rows.map((row) => (
                <ComparisonRow key={row.project} row={row} noise={noise} systemLabel={systemLabel} baselineLabel={baselineLabel} />
              ))}
            </ul>
          </div>
        ))}
      </div>
      {caption && <figcaption className="text-sm text-muted">{caption}</figcaption>}
    </figure>
  );
}

function ComparisonRow({ row, noise, systemLabel, baselineLabel }) {
  const gap = Math.round((row.system - row.baseline) * 10) / 10;
  const withinNoise = Math.abs(gap) < noise;
  const gapText = `${gap > 0 ? '+' : ''}${gap} points${withinNoise ? ', within noise' : ''}`;
  return (
    <li className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="flex flex-col">
          <span className="text-sm font-medium text-ink">{row.project}</span>
          <span className="text-xs text-muted">{row.measure}</span>
        </span>
        <span className={`text-sm font-semibold tabular-nums ${withinNoise ? 'text-muted' : 'text-ink'}`}>{gapText}</span>
      </div>
      <Bar label={systemLabel} value={row.system} className="bg-ink" />
      <Bar label={baselineLabel} value={row.baseline} className="bg-grey-2" />
    </li>
  );
}

function Bar({ label, value, className }) {
  const shown = Math.round(value * 10) / 10;
  return (
    <div className="grid grid-cols-[72px_1fr_44px] items-center gap-2 text-xs" title={`${label}: ${shown}%`}>
      <span className="text-muted">{label}</span>
      <span className="h-2 w-full rounded-full bg-surface-2" aria-hidden="true">
        <span data-testid="comparison-bar" className={`block h-2 rounded-full ${className}`} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </span>
      <span className="text-right tabular-nums text-ink-2">{shown}%</span>
    </div>
  );
}

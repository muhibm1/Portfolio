// Horizontal bar charts for a case study: one series per chart, each bar labelled with its
// value in text, so the numbers never depend on reading the bar lengths. Two measures with
// different scales sit in separate charts side by side, never on one axis.
export default function CaseStudyBarChart({ charts, caption }) {
  return (
    <figure className="flex flex-col gap-3">
      <div className={`grid grid-cols-1 gap-4 ${charts.length > 1 ? 'md:grid-cols-2' : ''}`}>
        {charts.map((chart) => (
          <BarChart key={chart.title} chart={chart} />
        ))}
      </div>
      {caption && <figcaption className="text-sm text-muted">{caption}</figcaption>}
    </figure>
  );
}

// One chart: a title, then a row per item with its label, its bar scaled to the largest value
// in this chart, and its value written out.
function BarChart({ chart }) {
  const max = Math.max(...chart.items.map((item) => item.value));
  if (!(max > 0)) {
    throw new Error(`Bar chart "${chart.title}" needs at least one positive value.`);
  }
  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-5">
      <p className="font-display text-sm font-semibold text-ink">{chart.title}</p>
      <ul className="flex flex-col gap-3">
        {chart.items.map((item) => (
          <li key={item.label} className="flex flex-col gap-1" title={`${item.label}: ${item.display}`}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-body">{item.label}</span>
              <span className="font-medium text-ink">{item.display}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-ground" aria-hidden="true">
              <div
                data-testid="bar"
                className="h-2 rounded-full bg-accent"
                style={{ width: `${Math.max(2, Math.round((item.value / max) * 100))}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * "Measured in production" (R132). Five stat cards in a row from 768px up; below that, only the
 * first four in a 2 by 2 grid, the fifth omitted per D9 (Home-Mobile.dc.html has no fifth card).
 */
export default function ProductionStats({ stats }) {
  const mobileItems = stats.items.slice(0, 4);

  return (
    <section className="flex flex-col gap-5 px-5 pb-10 md:px-[120px] md:pb-28">
      <div className="flex flex-col gap-1 border-t border-rule pt-5 md:flex-row md:items-baseline md:justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{stats.eyebrow}</p>
        <p className="hidden text-sm text-muted md:block">{stats.caption}</p>
      </div>

      <div className="hidden grid-cols-5 gap-4 md:grid">
        {stats.items.map((item) => (
          <div key={item.label} className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-6">
            <span className="font-display text-4xl font-medium tracking-tight text-ink">{item.value}</span>
            <span className="text-sm font-semibold text-ink">{item.label}</span>
            <span className="text-sm text-muted">{item.context}</span>
          </div>
        ))}
      </div>

      <div data-testid="mobile-stats-grid" className="grid grid-cols-2 gap-2.5 md:hidden">
        {mobileItems.map((item) => (
          <div key={item.label} className="flex flex-col gap-2 rounded-[10px] border border-border bg-surface p-4">
            <span className="font-display text-2xl font-medium tracking-tight text-ink">{item.value}</span>
            <span className="text-xs text-muted">{item.mobileText}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

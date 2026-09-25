/**
 * "Toolkit, grouped by what it's for" (R132): five columns of skills.
 */
export default function Toolkit({ toolkit }) {
  return (
    <section className="flex flex-col gap-7 px-5 py-14 md:px-[120px] md:py-24">
      <h2 className="border-t border-rule pt-5 font-mono text-xs uppercase tracking-widest text-muted">
        {toolkit.eyebrow}
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-5 md:gap-7">
        {toolkit.columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-2">
            <h3 className="font-display text-base font-semibold text-ink">{column.title}</h3>
            <p className="text-sm text-muted">{column.items}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

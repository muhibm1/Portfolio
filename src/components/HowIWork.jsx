/**
 * "02 · How I work" (R132): the four numbered principles, then the "Working with people" card.
 */
export default function HowIWork({ principles, workingWithPeople }) {
  return (
    <section id="approach" className="flex flex-col gap-10 px-5 py-16 md:gap-12 md:px-[120px] md:py-28">
      <div className="flex max-w-3xl flex-col gap-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{principles.eyebrow}</p>
        <h2 className="font-display text-3xl font-medium text-ink md:text-5xl">{principles.heading}</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:gap-8">
        {principles.items.map((item) => (
          <div key={item.number} className="flex flex-col gap-3 border-t-2 border-ink pt-5">
            <span className="font-mono text-xs uppercase tracking-widest text-muted">{item.number}</span>
            <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
            <p className="text-sm text-muted">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-[10px] border border-border bg-surface p-8 md:grid-cols-12 md:items-center md:gap-6 md:p-9">
        <p className="font-mono text-xs uppercase tracking-widest text-muted md:col-span-3">
          {workingWithPeople.eyebrow}
        </p>
        <p className="text-base text-body md:col-span-9">{workingWithPeople.text}</p>
      </div>
    </section>
  );
}

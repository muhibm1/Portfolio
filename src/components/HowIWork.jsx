import { bodyLargeClasses, eyebrowClasses, h2Classes, h3Classes, wrapClasses } from './lookClasses';

/**
 * "02 · How I work": the four numbered principles in a two-by-two grid, then the "Working with
 * people" card.
 */
export default function HowIWork({ principles, workingWithPeople }) {
  return (
    <section id="approach" className="border-t border-line py-[72px] tab:py-[120px]">
      <div className={`${wrapClasses} grid gap-10 tab:gap-14`}>
        <div className="grid max-w-3xl gap-4">
          <p className={eyebrowClasses}>{principles.eyebrow}</p>
          <h2 className={h2Classes}>{principles.heading}</h2>
        </div>

        <ol className="grid grid-cols-1 gap-x-12 gap-y-9 tab:grid-cols-2">
          {principles.items.map((item) => (
            <li key={item.number} className="grid content-start gap-3 border-t border-line-mid pt-5">
              <span className="font-mono text-xs tracking-widest text-muted">{item.number}</span>
              <h3 className={h3Classes}>{item.title}</h3>
              <p className={`${bodyLargeClasses} !text-base`}>{item.text}</p>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-1 gap-4 rounded-[var(--r-lg)] border border-line bg-surface p-6 md:grid-cols-12 md:items-center md:gap-6 md:p-9">
          <p className="font-mono text-xs tracking-widest text-muted md:col-span-3">{workingWithPeople.eyebrow}</p>
          <p className="text-base text-ink-2 md:col-span-9">{workingWithPeople.text}</p>
        </div>
      </div>
    </section>
  );
}

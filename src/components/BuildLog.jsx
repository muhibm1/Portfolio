import { bodyLargeClasses, eyebrowClasses, h2Classes, wrapClasses } from './lookClasses';

/**
 * "03 · Build log": the direction statement, then the dated entries, newest first, as an ordered
 * list with each date in a plain label, since some entries carry only a month or a range.
 */
export default function BuildLog({ buildLog }) {
  return (
    <section id="build-log" aria-labelledby="build-log-heading" className="border-t border-line bg-surface py-[72px] tab:py-[120px]">
      <div className={`${wrapClasses} grid gap-10 md:grid-cols-12 md:gap-6`}>
        <div className="grid content-start gap-4 md:col-span-5">
          <p className={eyebrowClasses}>{buildLog.eyebrow}</p>
          <h2 id="build-log-heading" className={h2Classes}>
            {buildLog.heading}
          </h2>
          <p className={bodyLargeClasses}>{buildLog.direction}</p>
        </div>

        <ol className="grid gap-0 md:col-span-6 md:col-start-7">
          {buildLog.entries.map((entry) => (
            <li
              key={`${entry.date}-${entry.text}`}
              className="grid gap-1.5 border-t border-line-mid py-5 sm:grid-cols-[150px_1fr] sm:gap-6"
            >
              <span className="font-mono text-xs tracking-widest text-muted sm:pt-1">{entry.date}</span>
              <p className="text-base leading-relaxed text-ink-2">{entry.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

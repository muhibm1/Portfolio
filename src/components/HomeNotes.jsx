import { Link } from 'react-router';
import { bodyLargeClasses, eyebrowClasses, h2Classes, h3Classes, wrapClasses } from './lookClasses';

/**
 * Short notes on the home page: smaller projects told in a paragraph each, with the one number
 * that matters and a link to where the study covers them. They have no page of their own.
 */
export default function HomeNotes({ notes }) {
  return (
    <section id="notes" aria-labelledby="notes-heading" className="border-t border-line py-[72px] tab:py-[120px]">
      <div className={`${wrapClasses} grid gap-10 tab:gap-12`}>
        <div className="grid gap-4 md:grid-cols-12 md:items-end md:gap-6">
          <div className="grid gap-4 md:col-span-7">
            <p className={eyebrowClasses}>{notes.eyebrow}</p>
            <h2 id="notes-heading" className={h2Classes}>
              {notes.heading}
            </h2>
          </div>
          <p className={`${bodyLargeClasses} md:col-span-5`}>{notes.lead}</p>
        </div>
        <ul className={`grid grid-cols-1 gap-3.5 tab:gap-6 ${notes.items.length > 1 ? 'tab:grid-cols-2' : 'max-w-[760px]'}`}>
          {notes.items.map((item) => (
            <li key={item.title} className="flex flex-col gap-3 rounded-[var(--r-lg)] border border-line bg-surface px-5 py-[22px] tab:p-7">
              <p className="text-[13px] font-medium text-muted">{item.eyebrow}</p>
              <h3 className={h3Classes}>{item.title}</h3>
              <p className="font-display text-[32px] leading-none font-semibold tracking-[-0.03em] text-ink">{item.figure}</p>
              <p className="text-[14.5px] leading-[1.4] text-muted">{item.figureLabel}</p>
              {item.paragraphs.map((text) => (
                <p key={text} className="text-base leading-[1.55] text-ink-2">
                  {text}
                </p>
              ))}
              <Link to={item.link.to} className="mt-auto pt-2 text-[15px] font-medium text-ink no-underline">
                {item.link.text} <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { eyebrowClasses, h2Classes, h3Classes, wrapClasses } from './lookClasses';

/**
 * "03 · Experience": the roles with their highlights. The degrees stay in the data but are not shown (the approved design drops the education box). The first role is open;
 * the others are closed `<details>` the visitor opens, so the text is still in the page when
 * script has not run and a keyboard can open each one.
 */
export default function ExperienceSection({ experience }) {
  return (
    <section id="experience" className="border-t border-line bg-surface py-[72px] tab:py-[120px]">
      <div className={`${wrapClasses} grid gap-10 md:grid-cols-12 md:gap-6`}>
        <div className="grid content-start gap-4 md:col-span-4">
          <p className={eyebrowClasses}>{experience.eyebrow}</p>
          <h2 className={h2Classes}>{experience.heading}</h2>
        </div>

        <div className="grid gap-0 md:col-span-7 md:col-start-6">
          {experience.roles.map((role, index) => (
            <details key={`${role.company}-${role.title}`} open={index === 0} className="group border-t border-line-mid py-5">
              <summary className="flex cursor-pointer list-none flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between [&::-webkit-details-marker]:hidden">
                <h3 className={`${h3Classes} !text-xl`}>
                  {role.title} · {role.company}
                </h3>
                <span className="text-sm text-muted">{role.period}</span>
              </summary>
              {role.subheading && <p className="mt-3 text-sm text-muted">{role.subheading}</p>}
              <ul className="mt-3 flex flex-col gap-2 pl-5 text-sm leading-relaxed text-ink-2">
                {role.highlights.map((highlight, highlightIndex) => (
                  <li key={highlightIndex} className="list-disc">
                    {highlight}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

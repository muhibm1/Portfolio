/**
 * "03 · Experience" (R132): the five roles with their highlights and the two degrees.
 */
export default function ExperienceSection({ experience, education }) {
  return (
    <section
      id="experience"
      className="flex flex-col gap-10 border-y border-border bg-surface px-5 py-16 md:grid md:grid-cols-12 md:gap-6 md:px-[120px] md:py-28"
    >
      <div className="flex flex-col gap-4 md:col-span-4">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{experience.eyebrow}</p>
        <h2 className="font-display text-3xl font-medium text-ink md:text-5xl">{experience.heading}</h2>
      </div>

      <div className="flex flex-col gap-9 md:col-span-7 md:col-start-6">
        {experience.roles.map((role) => (
          <article key={`${role.company}-${role.title}`} className="flex flex-col gap-3 border-t border-rule pt-6">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h3 className="font-display text-xl font-semibold text-ink">
                {role.title} · {role.company}
              </h3>
              <span className="text-sm text-muted">{role.period}</span>
            </div>
            {role.subheading && <p className="text-sm text-muted">{role.subheading}</p>}
            <ul className="flex flex-col gap-2 pl-5 text-sm leading-relaxed text-body">
              {role.highlights.map((highlight, index) => (
                <li key={index} className="list-disc">
                  {highlight}
                </li>
              ))}
            </ul>
          </article>
        ))}

        <div className="flex flex-col gap-3 border-t border-rule pt-6">
          {education.items.map((item) => (
            <div key={item.degree} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h3 className="font-display text-base font-semibold text-ink">{item.degree}</h3>
              <span className="text-sm text-muted">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { primaryButtonClasses, secondaryButtonClasses } from './buttonClasses';

/**
 * The hero (R132): eyebrow, h1, lead and the two calls to action in every viewport, the email
 * link and the "Right now" card from 768px up. Copy comes straight from home.hero; the mobile
 * eyebrow and lead swap in below 768px (Home-Mobile.dc.html).
 */
export default function HomeHero({ hero, resumeHref, emailHref }) {
  return (
    <section className="flex flex-col gap-7 px-5 pt-16 pb-9 md:grid md:grid-cols-12 md:gap-6 md:px-[120px] md:pt-28 md:pb-24">
      <div className="flex flex-col gap-6 md:col-span-8 md:gap-7">
        <p className="font-mono text-xs uppercase tracking-widest text-muted md:hidden">
          {hero.mobileEyebrow}
        </p>
        <p className="hidden font-mono text-xs uppercase tracking-widest text-muted md:block">
          {hero.eyebrow}
        </p>
        <h1 className="font-display text-4xl font-medium leading-[1.06] tracking-tight text-ink md:text-6xl md:leading-[1.03]">
          {hero.heading}
        </h1>
        <p className="text-base leading-relaxed text-body md:hidden">{hero.mobileLead}</p>
        <p className="hidden max-w-xl text-xl leading-relaxed text-body md:block">{hero.lead}</p>
        <div className="flex flex-col gap-3 pt-1 md:flex-row md:items-center md:gap-3">
          <a href="#work" className={primaryButtonClasses}>
            {hero.primaryCta}
          </a>
          <a href={resumeHref} className={secondaryButtonClasses}>
            {hero.secondaryCta}
          </a>
          <a href={emailHref} className="hidden text-sm text-soft md:ml-3 md:inline">
            {hero.emailLinkText}
          </a>
        </div>
      </div>
      <aside className="hidden flex-col gap-5 rounded-xl border border-border bg-surface p-7 md:col-span-3 md:col-start-10 md:flex md:self-end">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{hero.rightNow.eyebrow}</p>
        {hero.rightNow.items.map((item) => (
          <div key={item.title} className="flex flex-col gap-1">
            <span className="font-display text-base font-semibold text-ink">{item.title}</span>
            <span className="text-sm text-muted">{item.text}</span>
          </div>
        ))}
      </aside>
    </section>
  );
}

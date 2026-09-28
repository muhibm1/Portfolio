import { portfolioData } from '../data/portfolioData';
import { onDarkButtonClasses } from './buttonClasses';

/**
 * The dark "04 · Contact" footer (R132). Rendered by HomePage and WorkIndexPage, not by
 * SiteLayout: case-study pages carry their own ContactBand instead (R135).
 */
export default function ContactFooter() {
  const { personal, home } = portfolioData;
  const { contact } = home;
  const emailHref = `mailto:${personal.email}`;

  return (
    <footer id="contact" className="bg-ink px-5 py-16 text-on-dark md:px-[120px] md:py-28">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-on-dark-tertiary">
        {contact.eyebrow}
      </p>
      <h2 className="mt-4 max-w-3xl font-display text-3xl font-medium md:text-5xl">
        {contact.heading}
      </h2>

      <p className="mt-4 hidden max-w-xl text-on-dark-secondary md:block">{contact.lead}</p>
      <p className="mt-4 max-w-xl text-on-dark-secondary md:hidden">{contact.mobileLead}</p>

      <div className="mt-8 hidden items-center gap-3 md:flex">
        <a href={emailHref} className="inline-flex min-h-12 items-center justify-center rounded-full bg-on-dark px-6 font-sans text-sm font-medium text-ink">
          {contact.emailButton}
        </a>
        <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" className={onDarkButtonClasses}>
          {contact.linkedinButton}
        </a>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:hidden">
        <a href={emailHref} className="inline-flex min-h-12 items-center justify-center rounded-full bg-on-dark px-6 font-sans text-sm font-medium text-ink">
          {contact.mobileEmailButton}
        </a>
        <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" className={onDarkButtonClasses}>
          {contact.linkedinButton}
        </a>
      </div>

      <p className="mt-8 font-sans text-sm text-on-dark-tertiary">{contact.location}</p>
    </footer>
  );
}

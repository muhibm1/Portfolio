import { portfolioData } from '../data/portfolioData';
import { onDarkButtonClasses, onDarkSolidButtonClasses } from './buttonClasses';
import FooterField from './FooterField';
import { h2Classes, wrapClasses } from './lookClasses';

/**
 * The dark "04 · Contact" footer. Rendered by HomePage, WorkIndexPage and the not-found page, not
 * by SiteLayout: case-study pages carry their own ContactBand instead. It holds the email and
 * LinkedIn pills and, below them, the line pointing to the public code.
 */
export default function ContactFooter() {
  const { personal, home } = portfolioData;
  const { contact } = home;
  const { codeLine } = home.hero;
  const emailHref = `mailto:${personal.email}`;

  return (
    <footer id="contact" className="on-dark-band relative isolate overflow-hidden bg-dark py-[72px] text-dark-ink tab:py-[120px]">
      <FooterField />
      <div className={`${wrapClasses} relative`}>
        <p className="font-mono text-xs tracking-widest text-dark-muted">{contact.eyebrow}</p>
        <h2 className={`${h2Classes} mt-4 max-w-3xl !text-dark-ink`}>{contact.heading}</h2>

        <p className="mt-4 hidden max-w-xl text-dark-muted md:block">{contact.lead}</p>
        <p className="mt-4 max-w-xl text-dark-muted md:hidden">{contact.mobileLead}</p>

        {/* One anchor per destination; only the label text swaps by viewport. */}
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
          <a href={emailHref} className={onDarkSolidButtonClasses}>
            <span className="hidden md:inline">{contact.emailButton}</span>
            <span className="md:hidden">{contact.mobileEmailButton}</span>
          </a>
          <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" className={onDarkButtonClasses}>
            {contact.linkedinButton}
          </a>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-dark-edge pt-6 text-sm text-dark-muted tab:flex-row tab:items-center tab:justify-between">
          <p>{contact.location}</p>
          <p>
            <a
              href={codeLine.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-ink underline decoration-dark-edge-strong underline-offset-4"
            >
              {codeLine.text}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

import { onDarkButtonClasses } from './buttonClasses';

// The dark contact band at the foot of every case-study page (ADR 0006). `id="contact"` is the
// jump target for the header's Contact link (R133), so it stays on the element itself.

/** `heading` is the case study's `contactHeading`; `email` is `personal.email`. */
export default function ContactBand({ heading, email }) {
  return (
    <section id="contact" className="flex flex-col gap-6 bg-ink px-4 py-14 sm:px-8 md:flex-row md:items-center md:justify-between md:px-16">
      <h2 className="font-display text-2xl font-medium text-on-dark sm:text-3xl">{heading}</h2>
      <a href={`mailto:${email}`} className={`${onDarkButtonClasses} self-start md:self-auto`}>
        Email {email}
      </a>
    </section>
  );
}

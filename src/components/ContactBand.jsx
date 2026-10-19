import { onDarkSolidButtonClasses } from './buttonClasses';
import { h2Classes, wrapClasses } from './lookClasses';

// The dark contact band at the foot of every case-study page (ADR 0006). `id="contact"` is the
// jump target for the header's Contact link (R133), so it stays on the element itself.

/** `heading` is the case study's `contactHeading`; `email` is `personal.email`. */
export default function ContactBand({ heading, email }) {
  return (
    <section id="contact" className="on-dark-band bg-dark py-14 text-dark-ink tab:py-20">
      <div className={`${wrapClasses} flex flex-col gap-6 md:flex-row md:items-center md:justify-between`}>
        <h2 className={`${h2Classes} !text-[clamp(26px,3vw,38px)] !text-dark-ink`}>{heading}</h2>
        <a href={`mailto:${email}`} className={`${onDarkSolidButtonClasses} self-start md:self-auto`}>
          Email {email}
        </a>
      </div>
    </section>
  );
}

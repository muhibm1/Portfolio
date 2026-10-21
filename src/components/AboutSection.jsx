import { bodyLargeClasses, eyebrowClasses, h2Classes, wrapClasses } from './lookClasses';

/** "01 · About": a short heading and one paragraph, in the same two-column split as Experience. */
export default function AboutSection({ about }) {
  return (
    <section id="about" aria-labelledby="about-heading" className="border-t border-line py-[72px] tab:py-[120px]">
      <div className={`${wrapClasses} grid gap-6 md:grid-cols-12 md:gap-6`}>
        <div className="grid content-start gap-4 md:col-span-5">
          <p className={eyebrowClasses}>{about.eyebrow}</p>
          <h2 id="about-heading" className={h2Classes}>
            {about.heading}
          </h2>
        </div>
        <p className={`${bodyLargeClasses} md:col-span-6 md:col-start-7`}>{about.text}</p>
      </div>
    </section>
  );
}

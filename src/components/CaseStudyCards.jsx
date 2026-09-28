import { Link } from 'react-router';

// Renders "01 · Case studies" (R132, R134): the first study as a dark featured card with its
// mini stats and mobile tags, the remaining four as a 2 by 2 grid. Shared by the home page and
// /work, so the study list comes in as a prop rather than being read from the data module here.
export default function CaseStudyCards({ caseStudies }) {
  const [featured, ...rest] = caseStudies;

  return (
    <div className="flex flex-col gap-6">
      <FeaturedCard study={featured} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {rest.map((study) => (
          <GridCard key={study.id} study={study} />
        ))}
      </div>
    </div>
  );
}

function FeaturedCard({ study }) {
  const { card, codeLink } = study;

  return (
    <article className="grid grid-cols-1 gap-6 rounded-xl bg-ink p-8 md:grid-cols-12 md:gap-6">
      <div className="flex flex-col gap-4 md:col-span-7">
        <p className="hidden font-mono text-xs uppercase tracking-widest text-on-dark-tertiary md:block">
          {card.eyebrow}
        </p>
        <p className="font-mono text-xs uppercase tracking-widest text-on-dark-tertiary md:hidden">
          {card.mobileEyebrow}
        </p>
        <Link to={`/work/${study.id}`} className="flex flex-col gap-4 no-underline">
          <h3 className="font-display text-2xl font-semibold text-on-dark md:text-4xl">
            {card.title}
          </h3>
          <p className="hidden text-on-dark-secondary md:block">{card.summary}</p>
          <p className="text-sm text-on-dark-secondary md:hidden">{card.mobileSummary}</p>
          <span className="self-start border-b border-on-dark pb-0.5 text-sm font-medium text-on-dark">
            {card.linkText}
          </span>
        </Link>
        <div className="flex flex-wrap gap-2 md:hidden">
          {card.mobileTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-soft px-3 py-1 text-xs text-on-dark-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
        {codeLink && (
          <a
            href={codeLink.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View the code on GitHub, public snapshot"
            className="self-start border-b border-soft pb-0.5 text-sm font-medium text-on-dark-secondary transition-colors hover:text-on-dark"
          >
            View the code
          </a>
        )}
      </div>
      <div className="hidden grid-cols-2 content-center gap-3 md:col-span-4 md:col-start-9 md:grid">
        {card.stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-soft p-4">
            <span className="block font-mono text-2xl text-on-dark">{stat.value}</span>
            <span className="text-xs text-on-dark-tertiary">{stat.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function GridCard({ study }) {
  const { card } = study;

  return (
    <Link
      to={`/work/${study.id}`}
      className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-9 no-underline"
    >
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{card.eyebrow}</p>
      <h3 className="font-display text-xl font-semibold text-ink">{card.title}</h3>
      <p className="text-body">{card.summary}</p>
      <div className="flex flex-wrap gap-2">
        {card.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-rule px-3 py-1 text-xs text-muted"
          >
            {tag}
          </span>
        ))}
      </div>
      <span className="self-start border-b border-ink pb-0.5 text-sm font-medium text-ink">
        {card.linkText}
      </span>
    </Link>
  );
}

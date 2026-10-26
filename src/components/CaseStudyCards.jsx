import { Link } from 'react-router';
import DeploymentSummary from './DeploymentSummary';
import { eyebrowClasses, h3Classes } from './lookClasses';

// Renders the case-study list (R132, R134) in the Look: every study whose card is featured as a
// wide card with its deployment summary and four stats, then, under the "More work" heading,
// every other listed study as a card in a three-column grid (two on a tablet, one on a phone).
// A study with `listed: false` keeps its page but gets no card (owner's brief, 2026-10-21).
// Shared by the home page and /work, so the study list comes in as a prop rather than being read
// from the data module here.
const cardBase =
  'rounded-[var(--r-lg)] border border-line bg-surface text-ink transition-[transform,box-shadow,border-color] duration-300 ease-[var(--glide)] hover:-translate-y-[3px] hover:border-line-mid hover:shadow-[var(--shadow-window)]';

export default function CaseStudyCards({ caseStudies, moreHeading }) {
  const listed = caseStudies.filter((study) => study.listed !== false);
  const featured = listed.filter((study) => study.card.featured);
  const rest = listed.filter((study) => !study.card.featured);

  return (
    <div className="flex flex-col gap-6">
      {featured.map((study) => (
        <FeaturedCard key={study.id} study={study} />
      ))}
      {moreHeading && <h3 className={`${eyebrowClasses} mt-6 tab:mt-10`}>{moreHeading}</h3>}
      <ul className="grid grid-cols-1 gap-3.5 tab:grid-cols-2 tab:gap-6 wide:grid-cols-3">
        {rest.map((study) => (
          <li key={study.id} className="flex">
            <GridCard study={study} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeaturedCard({ study }) {
  const { card, codeLink, status, deploymentSummary } = study;
  const stats = card.stats ?? study.stats;

  return (
    <article className={`${cardBase} grid grid-cols-1 gap-[26px] px-5 py-6 tab:p-8 wide:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] wide:gap-10 wide:p-11`}>
      <div className="grid content-start gap-4">
        <p className="text-[13px] font-medium text-muted">
          <span className="hidden tab:inline">{card.eyebrow}</span>
          <span className="tab:hidden">{card.mobileEyebrow ?? card.eyebrow}</span>
        </p>
        <h3 className="font-display text-[clamp(28px,3vw,40px)] font-semibold leading-[1.1] tracking-[-0.03em] text-ink">
          {card.title}
        </h3>
        {deploymentSummary ? (
          <DeploymentSummary summary={deploymentSummary} compact />
        ) : (
          <p className="text-base leading-[1.55] text-ink-2">{card.summary}</p>
        )}
        <Link to={`/work/${study.id}`} className="justify-self-start text-[15px] font-medium text-ink no-underline">
          {card.linkText} <span aria-hidden="true">→</span>
        </Link>
        {codeLink && (
          <a
            href={codeLink.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View the code: ${codeLink.label} on GitHub, public repository`}
            className="justify-self-start text-[15px] text-ink-2 underline decoration-[var(--underline)] underline-offset-4 hover:text-ink"
          >
            View the code
          </a>
        )}
        {!codeLink && status && <p className="text-[15px] text-ink-2">{status}</p>}
      </div>
      <ul className="grid grid-cols-2 content-center gap-x-6 gap-y-7">
        {stats.map((stat) => (
          <li key={stat.label} className="grid content-start gap-1.5">
            <span className="font-display text-[clamp(34px,3.4vw,46px)] leading-none font-semibold tracking-[-0.035em]">
              {stat.value}
            </span>
            <span className="text-[14.5px] leading-[1.4] text-muted">{stat.label}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function GridCard({ study }) {
  const { card, codeLink, status } = study;

  return (
    <Link
      to={`/work/${study.id}`}
      className={`${cardBase} flex flex-1 flex-col gap-3 px-5 py-[22px] no-underline tab:p-7`}
    >
      <p className="text-[13px] font-medium text-muted">{card.eyebrow}</p>
      <h3 className={h3Classes}>{card.title}</h3>
      <p className="text-base leading-[1.55] text-ink-2">{card.summary}</p>
      <ul className="flex flex-wrap gap-1.5">
        {card.tags.map((tag) => (
          <li key={tag} className="rounded-full bg-surface-2 px-2.5 py-1 text-[12.5px] text-ink">
            {tag}
          </li>
        ))}
      </ul>
      {!codeLink && status && <p className="mt-auto text-[13px] text-muted">{status}</p>}
      <span className={`${!codeLink && status ? '' : 'mt-auto '}pt-2 text-[15px] font-medium`}>
        {card.linkText} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

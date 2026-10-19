import { Link } from 'react-router';
import { primaryButtonClasses } from './buttonClasses';
import { bodyLargeClasses, eyebrowClasses, h2Classes, wrapClasses } from './lookClasses';

/**
 * The band under the hero that says what the replay showed: the AgentOps case-study card's own
 * words, its code link, and its four measured results. Everything is read from the AgentOps case
 * study in the data module; nothing is restated here.
 */
export default function AgentOpsProof({ study }) {
  const { card, codeLink, stats } = study;

  return (
    <section id="agentops" aria-labelledby="proof-heading" className="border-t border-line bg-surface py-[72px] tab:py-[120px]">
      <div className={`${wrapClasses} grid grid-cols-1 gap-6 wide:grid-cols-12 wide:items-center`}>
        <div className="grid gap-[22px] wide:col-span-7">
          <p className={eyebrowClasses}>{card.eyebrow}</p>
          <h2 id="proof-heading" className={h2Classes}>
            {card.title}
          </h2>
          <p className={bodyLargeClasses}>{card.summary}</p>
          <div className="flex flex-wrap items-center gap-x-[22px] gap-y-3">
            <Link to={`/work/${study.id}`} className={primaryButtonClasses}>
              {card.linkText}
            </Link>
            {codeLink && (
              <a
                href={codeLink.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${codeLink.label} on GitHub, public snapshot`}
                className="text-[15px] text-ink underline decoration-[var(--underline)] underline-offset-4"
              >
                {codeLink.label}
              </a>
            )}
          </div>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-7 wide:col-span-4 wide:col-start-9 wide:mt-0 wide:gap-x-6 wide:gap-y-9">
          {stats.map((stat) => (
            <li key={stat.label} className="grid content-start gap-1.5">
              <p className="font-display text-[clamp(34px,3.4vw,46px)] leading-none font-semibold tracking-[-0.035em] text-ink">
                {stat.value}
              </p>
              <p className="text-[14.5px] leading-[1.4] text-muted">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

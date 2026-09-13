import { Fragment } from 'react';
import { Link, useSearchParams } from 'react-router';
import ProjectEntry from '../components/ProjectEntry';
import { portfolioData } from '../data/portfolioData';

// The filter lives in the address (?type=project), not in component state, so every filter is a
// real link a visitor can open, copy or share (R20). Any other value in the address means All.
const typeFilters = [
  { value: 'all', label: 'All' },
  { value: 'case-study', label: 'Case study' },
  { value: 'project', label: 'Project' },
  { value: 'live-demo', label: 'Live demo' },
];

const textLinkClass = 'underline-offset-4 decoration-1 hover:underline focus-visible:underline';
const entryHeadingClass = 'font-display text-3xl sm:text-4xl font-normal tracking-wide leading-tight';
const entryMetaClass = 'font-mono text-xs uppercase tracking-widest text-[#1d1d1d]/70';
const entryBodyClass = 'text-base leading-relaxed text-[#1d1d1d]/70';

/**
 * The /work index: every case study, project and live demo, on the Jakub Reis layout
 * (docs/design-brief.md lines 44 to 49). Regions keep their order under every filter.
 */
export default function WorkIndexPage() {
  const [searchParams] = useSearchParams();
  const activeFilter = knownFilterOrAll(searchParams.get('type'));
  const isShown = (filterValue) => activeFilter === 'all' || activeFilter === filterValue;
  const { caseStudies, projects, demos } = portfolioData;

  return (
    <div className="min-h-screen bg-[#f8f8f8] px-4 pt-36 pb-20 text-[#1d1d1d]">
      <div className="mx-auto max-w-[1200px]">
        <WorkHeader />
        <TypeFilterLinks activeFilter={activeFilter} />

        <div className="grid grid-cols-1 gap-y-20 md:grid-cols-12">
          {isShown('case-study') && (
            <WorkRegion id="work-case-studies" heading="Case studies" className="md:col-span-7 md:col-start-1">
              {caseStudies.map((study) => (
                <CaseStudyEntry key={study.id} study={study} />
              ))}
            </WorkRegion>
          )}
          {isShown('project') && (
            <WorkRegion id="work-projects" heading="Projects" className="md:col-span-7 md:col-start-6">
              {projects.map((project) => (
                <ProjectEntry key={project.id} project={project} />
              ))}
            </WorkRegion>
          )}
          {isShown('live-demo') && (
            <WorkRegion id="work-live-demo" heading="Live demo" className="md:col-span-7 md:col-start-1">
              {demos.map((demo) => (
                <DemoEntry key={demo.id} demo={demo} />
              ))}
            </WorkRegion>
          )}
        </div>
      </div>
    </div>
  );
}

function knownFilterOrAll(requestedType) {
  const isKnownFilter = typeFilters.some((filter) => filter.value === requestedType);
  return isKnownFilter ? requestedType : 'all';
}

// Reis header: email top left, social links top right, discipline left, intro paragraph right.
function WorkHeader() {
  const { personal, workIntro } = portfolioData;

  return (
    <header className="mb-20 grid grid-cols-1 gap-y-12 md:grid-cols-12">
      <a href={`mailto:${personal.email}`} className={`justify-self-start text-sm md:col-span-6 ${textLinkClass}`}>
        {personal.email}
      </a>
      <p className="text-sm md:col-span-6 md:text-right">
        <a href={personal.github} className={textLinkClass}>
          {personal.githubHandle}
        </a>
        <span aria-hidden="true" className="mx-3">~</span>
        <a href={personal.linkedin} className={textLinkClass}>
          {personal.linkedinHandle}
        </a>
      </p>
      <div className="md:col-span-5">
        <h1 className="font-display text-6xl sm:text-7xl font-normal uppercase tracking-widest leading-none">
          Work
        </h1>
        <p className="mt-5 text-base text-[#1d1d1d]/70">{personal.role}</p>
      </div>
      <p className="text-lg leading-relaxed md:col-span-6 md:col-start-7">{workIntro}</p>
    </header>
  );
}

function TypeFilterLinks({ activeFilter }) {
  return (
    <nav aria-label="Filter by type" className="mb-20 flex flex-wrap items-center gap-x-3 text-sm">
      {typeFilters.map((filter, index) => {
        const isActive = filter.value === activeFilter;

        return (
          <Fragment key={filter.value}>
            {index > 0 && <span aria-hidden="true">~</span>}
            <Link
              to={`?type=${filter.value}`}
              aria-current={isActive ? 'true' : undefined}
              className={`${textLinkClass} ${isActive ? 'underline' : 'text-[#1d1d1d]/60 hover:text-[#1d1d1d]'}`}
            >
              {filter.label}
            </Link>
          </Fragment>
        );
      })}
    </nav>
  );
}

function WorkRegion({ id, heading, className, children }) {
  const headingId = `${id}-heading`;

  return (
    <section aria-labelledby={headingId} className={className}>
      <h2 id={headingId} className={`mb-10 ${entryMetaClass}`}>
        {heading}
      </h2>
      <div className="flex flex-col gap-y-20">{children}</div>
    </section>
  );
}

function CaseStudyEntry({ study }) {
  return (
    <article className="flex flex-col gap-5">
      <p className={entryMetaClass}>
        {study.client} ~ {study.period}
      </p>
      <h3 className={entryHeadingClass}>
        <Link to={`/work/${study.id}`} className={textLinkClass}>
          {study.title}
        </Link>
      </h3>
      <p className={entryBodyClass}>{study.summary}</p>
    </article>
  );
}

function DemoEntry({ demo }) {
  return (
    <article className="flex flex-col gap-5">
      <h3 className={entryHeadingClass}>
        <Link to={demo.href} className={textLinkClass}>
          {demo.name}
        </Link>
      </h3>
      <p className={entryBodyClass}>{demo.tagline}</p>
    </article>
  );
}

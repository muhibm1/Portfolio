import { Link, useParams } from 'react-router';
import { portfolioData } from '../data/portfolioData';
import NotFoundPage from '../pages/NotFoundPage';
import CaseStudyFlowDiagram, { CaseStudyHubDiagram } from './CaseStudyFlowDiagram';
import CaseStudyTable from './CaseStudyTable';
import ContactBand from './ContactBand';

// Literal Tailwind class names, one per supported column count, so Tailwind's scanner sees them
// at build time. A `style={{ gridTemplateColumns }}` here would override the mobile `grid-cols-*`
// classes below at every breakpoint, not just the desktop one (R-review HIGH).
const DESKTOP_COLUMNS_CLASS = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

/**
 * The /work/:slug page: one case study rendered as a single scroll (ADR 0006), or the not-found
 * page for any other slug. Every section body is a list of content blocks whose shape is fixed by
 * the data module; an unknown block type throws rather than rendering nothing (R135, R136).
 */
export default function CaseStudyPage() {
  const { slug } = useParams();
  const { caseStudies, personal } = portfolioData;
  const position = caseStudies.findIndex((study) => study.id === slug);
  if (position === -1) return <NotFoundPage />;

  const caseStudy = caseStudies[position];
  const { previous, next } = neighboursOf(caseStudies, position);

  return (
    <main>
      <CaseStudyHeader caseStudy={caseStudy} />
      <AtAGlanceAndStats caseStudy={caseStudy} />

      <section className="grid grid-cols-1 gap-8 px-4 sm:px-8 md:grid-cols-[220px_1fr] md:gap-12 md:px-16">
        <OnThisPageNav sections={caseStudy.sections} />
        <div className="flex flex-col gap-16 pb-16">
          {caseStudy.sections.map((section) => (
            <CaseStudySection key={section.id} section={section} />
          ))}

          <Callout callout={caseStudy.callout} />
          {caseStudy.disclaimer && <p className="text-sm text-muted">{caseStudy.disclaimer}</p>}
        </div>
      </section>

      <CaseStudyNeighbours previous={previous} next={next} />
      <ContactBand heading={caseStudy.contactHeading} email={personal.email} />
    </main>
  );
}

// The case studies before and after the one at `position`, wrapping at both ends (R127).
function neighboursOf(caseStudies, position) {
  const count = caseStudies.length;
  return {
    previous: caseStudies[(position - 1 + count) % count],
    next: caseStudies[(position + 1) % count],
  };
}

function CaseStudyHeader({ caseStudy }) {
  return (
    <header className="flex flex-col gap-6 px-4 pt-24 pb-8 sm:px-8 md:px-16">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{caseStudy.eyebrow}</p>
      <h1 className="max-w-4xl font-display text-4xl font-medium leading-[1.04] tracking-tight text-ink sm:text-6xl">
        {caseStudy.title}
      </h1>
      <p className="max-w-3xl text-lg leading-relaxed text-body sm:text-xl">{caseStudy.intro}</p>
    </header>
  );
}

function AtAGlanceAndStats({ caseStudy }) {
  const desktopColumnsClass = DESKTOP_COLUMNS_CLASS[caseStudy.atAGlance.length] ?? 'md:grid-cols-4';
  return (
    <section className="flex flex-col gap-4 px-4 pb-10 sm:px-8 md:px-16">
      <div className={`grid grid-cols-1 border-y border-rule sm:grid-cols-2 ${desktopColumnsClass}`}>
        {caseStudy.atAGlance.map((item, index) => (
          <div key={item.label} className={`flex flex-col gap-1.5 py-5 ${index > 0 ? 'border-t border-rule sm:border-l sm:border-t-0 sm:pl-5' : ''}`}>
            <span className="font-mono text-xs uppercase tracking-widest text-muted">{item.label}</span>
            <span className="text-base text-body">{item.value}</span>
          </div>
        ))}
      </div>
      <StatsGrid items={caseStudy.stats} />
    </section>
  );
}

function OnThisPageNav({ sections }) {
  return (
    <nav aria-label="On this page" className="flex flex-col gap-3 pt-2">
      <span className="font-mono text-xs uppercase tracking-widest text-muted">On this page</span>
      {sections.map((section) => (
        <a key={section.id} href={`#${section.id}`} className="text-sm text-soft transition-colors hover:text-ink">
          {section.heading}
        </a>
      ))}
    </nav>
  );
}

function CaseStudySection({ section }) {
  return (
    <div id={section.id} className="flex max-w-3xl flex-col gap-5">
      {section.eyebrow && <p className="font-mono text-xs uppercase tracking-widest text-muted">{section.eyebrow}</p>}
      <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">{section.heading}</h2>
      {section.blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

function Block({ block }) {
  switch (block.type) {
    case 'paragraph':
      return <p className="text-base leading-relaxed text-body sm:text-lg">{block.text}</p>;
    case 'bullets':
      return <BulletsBlock items={block.items} />;
    case 'flow':
      return <CaseStudyFlowDiagram columns={block.columns} steps={block.steps} />;
    case 'cards':
      return <CardsBlock items={block.items} />;
    case 'stats':
      return <StatsGrid items={block.items} />;
    case 'table':
      return <CaseStudyTable columns={block.columns} rows={block.rows} />;
    case 'link-diagram':
      return <CaseStudyHubDiagram left={block.left} edge={block.edge} hub={block.hub} right={block.right} />;
    case 'split':
      return <SplitBlock table={block.table} stats={block.stats} />;
    default:
      throw new Error(`Unknown case-study block type "${block.type}".`);
  }
}

function BulletsBlock({ items }) {
  return (
    <ul className="flex flex-col gap-2 pl-5 text-base leading-relaxed text-body sm:text-lg">
      {items.map((item, index) => (
        <li key={index} className="list-disc">
          {item}
        </li>
      ))}
    </ul>
  );
}

function CardsBlock({ items }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item, index) => {
        const isString = typeof item === 'string';
        const title = isString ? null : item.title;
        const note = isString ? item : item.note;
        const emphasis = !isString && item.emphasis;
        return (
          <div key={index} className={`rounded-[10px] border bg-surface p-4 ${emphasis ? 'border-ink' : 'border-border'}`}>
            {title && <p className="font-display text-sm font-semibold text-ink">{title}</p>}
            <p className="text-sm text-body">{note}</p>
          </div>
        );
      })}
    </div>
  );
}

function StatsGrid({ items }) {
  const desktopColumnsClass = DESKTOP_COLUMNS_CLASS[Math.min(items.length, 4)] ?? 'md:grid-cols-4';
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${desktopColumnsClass}`}>
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-2 rounded-[10px] border border-border bg-surface p-5">
          <span className="font-display text-3xl font-medium tracking-tight text-ink">{item.value}</span>
          <span className="text-sm text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function SplitBlock({ table, stats }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <div className="md:col-span-7">
        <CaseStudyTable columns={table.columns} rows={table.rows} />
      </div>
      <div className="grid grid-cols-2 content-start gap-3 md:col-span-5">
        {stats.items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1.5 rounded-[10px] border border-border bg-surface p-4">
            <span className="font-display text-2xl font-medium tracking-tight text-ink">{item.value}</span>
            <span className="text-xs text-muted">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Callout({ callout }) {
  return (
    <div className="flex flex-col gap-3 rounded-[10px] border border-ink bg-ink p-9">
      <p className="font-mono text-xs uppercase tracking-widest text-on-dark-tertiary">{callout.eyebrow}</p>
      <p className="text-lg leading-relaxed text-on-dark sm:text-xl">{callout.text}</p>
      {callout.note && <p className="text-sm text-on-dark-tertiary">{callout.note}</p>}
    </div>
  );
}

function CaseStudyNeighbours({ previous, next }) {
  return (
    <nav aria-label="Case studies" className="flex flex-col gap-4 border-t border-rule px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 md:px-16">
      <Link to={`/work/${previous.id}`} rel="prev" className="flex flex-col gap-1">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">Previous</span>
        <span className="font-display text-base font-semibold text-ink">{previous.title}</span>
      </Link>
      <Link to={`/work/${next.id}`} rel="next" className="flex flex-col gap-1 sm:items-end sm:text-right">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">Next case study</span>
        <span className="font-display text-base font-semibold text-ink">{next.title}</span>
      </Link>
    </nav>
  );
}

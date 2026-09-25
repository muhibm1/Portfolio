import CaseStudyCards from '../components/CaseStudyCards';
import ContactFooter from '../components/ContactFooter';
import { portfolioData } from '../data/portfolioData';
import { pageMetaFor } from '../pageMeta';

// The page's <title> is "Case studies | <name>" (pageMeta.js); the heading takes only the
// page-specific part, matching the visible page identity rather than the site name.
const PAGE_HEADING = pageMetaFor('/work').title.split(' | ')[0];

/**
 * The /work index: the five case studies in R127 order using the home card style, WorkHorse
 * first as the dark featured card (R134). No projects, demos, filter chips or ?type handling;
 * the plan names no heading of its own for this page, so an sr-only h1 gives it one for
 * assistive tech without changing the visual design.
 */
export default function WorkIndexPage() {
  const { caseStudies } = portfolioData;

  return (
    <>
      <main className="px-5 pt-32 pb-20 md:px-[120px] md:pt-40">
        <h1 className="sr-only">{PAGE_HEADING}</h1>
        <CaseStudyCards caseStudies={caseStudies} />
      </main>
      <ContactFooter />
    </>
  );
}

import CaseStudyCards from '../components/CaseStudyCards';
import ContactFooter from '../components/ContactFooter';
import { portfolioData } from '../data/portfolioData';

/**
 * The /work index: the five case studies in R127 order using the home card style, WorkHorse
 * first as the dark featured card (R134). No projects, demos, filter chips or ?type handling;
 * the plan names no heading of its own for this page.
 */
export default function WorkIndexPage() {
  const { caseStudies } = portfolioData;

  return (
    <>
      <main className="px-5 pt-32 pb-20 md:px-[120px] md:pt-40">
        <CaseStudyCards caseStudies={caseStudies} />
      </main>
      <ContactFooter />
    </>
  );
}

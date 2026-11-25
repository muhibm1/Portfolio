// The "/" route: the hero, the lead study, the deployment case studies, short notes, stats, About,
// the approach, the experience and the contact footer, composed from the data module.
// useScrollToHashTarget makes a header link such as #work, #approach or #experience land on the
// right section; React Router does not scroll to hashes on its own.
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { portfolioData } from '../data/portfolioData';
import { prefersReducedMotion } from '../prefersReducedMotion';
import AboutSection from '../components/AboutSection';
import CaseStudyCards from '../components/CaseStudyCards';
import ContactFooter from '../components/ContactFooter';
import ExperienceSection from '../components/ExperienceSection';
import HomeHero from '../components/HomeHero';
import HomeNotes from '../components/HomeNotes';
import HowIWork from '../components/HowIWork';
import ProductionStats from '../components/ProductionStats';
import { bodyLargeClasses, eyebrowClasses, h2Classes, wrapClasses } from '../components/lookClasses';

export default function HomePage() {
  useScrollToHashTarget();
  const { personal, home, caseStudies } = portfolioData;
  const studies = caseStudies.filter((study) => study.home === 'study');
  const deployments = caseStudies.filter((study) => study.home === 'deployment');

  return (
    <main>
      <HomeHero hero={home.hero} email={personal.email} />
      <HomeSection id="study" intro={home.studyIntro}>
        <CaseStudyCards caseStudies={studies} />
      </HomeSection>

      <HomeSection id="work" intro={home.caseStudiesIntro}>
        <CaseStudyCards caseStudies={deployments} />
      </HomeSection>

      <HomeNotes notes={home.notes} />
      <ProductionStats stats={home.stats} />
      <AboutSection about={home.about} />

      <HowIWork principles={home.principles} workingWithPeople={home.workingWithPeople} />
      <ExperienceSection experience={home.experience} />
      <ContactFooter />
    </main>
  );
}

// A home section with the Look's heading row (eyebrow and heading, lead beside them) above its
// cards.
function HomeSection({ id, intro, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="border-t border-line py-[72px] tab:py-[120px]">
      <div className={`${wrapClasses} grid gap-10 tab:gap-12`}>
        <div className="grid gap-4 md:grid-cols-12 md:items-end md:gap-6">
          <div className="grid gap-4 md:col-span-7">
            <p className={eyebrowClasses}>{intro.eyebrow}</p>
            <h2 id={`${id}-heading`} className={h2Classes}>
              {intro.heading}
            </h2>
          </div>
          <p className={`${bodyLargeClasses} md:col-span-5`}>{intro.lead}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

// Runs on mount and whenever the hash changes. A hash naming no element does nothing.
function useScrollToHashTarget() {
  const { hash } = useLocation();

  useEffect(() => {
    const targetId = targetIdFromHash(hash);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (!target) return;

    // 'auto' defers to CSS scroll-behavior, which src/index.css forces to instant under reduced motion.
    target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, [hash]);
}

// The element id a url hash names, or '' when it names none. A malformed escape such as
// "#%E0%A4%A" makes decodeURIComponent throw; it cannot name an element, so it counts as none.
function targetIdFromHash(hash) {
  const encodedId = hash.replace(/^#/, '');
  if (!encodedId) return '';

  try {
    return decodeURIComponent(encodedId);
  } catch {
    return '';
  }
}

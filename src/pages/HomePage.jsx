// The "/" route (R132), in the order of the owner's 2026-10-21 brief: the hero with the replay, the
// measured stats, About, the work (featured, then more), the build log, the approach, the
// experience and the contact footer, composed from the data module.
// useScrollToHashTarget makes a header link such as #work, #approach or #experience land on the
// right section; React Router does not scroll to hashes on its own.
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { portfolioData } from '../data/portfolioData';
import { prefersReducedMotion } from '../prefersReducedMotion';
import AboutSection from '../components/AboutSection';
import BuildLog from '../components/BuildLog';
import CaseStudyCards from '../components/CaseStudyCards';
import ContactFooter from '../components/ContactFooter';
import ExperienceSection from '../components/ExperienceSection';
import HomeHero from '../components/HomeHero';
import HowIWork from '../components/HowIWork';
import ProductionStats from '../components/ProductionStats';
import { bodyLargeClasses, eyebrowClasses, h2Classes, wrapClasses } from '../components/lookClasses';

export default function HomePage() {
  useScrollToHashTarget();
  const { personal, home, caseStudies } = portfolioData;

  return (
    <main>
      <HomeHero hero={home.hero} email={personal.email} replay={portfolioData.homeReplay} />
      <ProductionStats stats={home.stats} />
      <AboutSection about={home.about} />

      <section id="work" className="border-t border-line py-[72px] tab:py-[120px]">
        <div className={`${wrapClasses} grid gap-10 tab:gap-12`}>
          <div className="grid gap-4 md:grid-cols-12 md:items-end md:gap-6">
            <div className="grid gap-4 md:col-span-7">
              <p className={eyebrowClasses}>{home.caseStudiesIntro.eyebrow}</p>
              <h2 className={h2Classes}>{home.caseStudiesIntro.heading}</h2>
            </div>
            <p className={`${bodyLargeClasses} md:col-span-5`}>{home.caseStudiesIntro.lead}</p>
          </div>
          <CaseStudyCards caseStudies={caseStudies} moreHeading={home.caseStudiesIntro.moreHeading} />
        </div>
      </section>

      <BuildLog buildLog={home.buildLog} />

      <HowIWork principles={home.principles} workingWithPeople={home.workingWithPeople} />
      <ExperienceSection experience={home.experience} />
      <ContactFooter />
    </main>
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

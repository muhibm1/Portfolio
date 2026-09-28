// The "/" route (R132): the mockup sections in order, composed from home in the data module.
// useScrollToHashTarget makes a header link such as #work, #approach or #experience land on the
// right section; React Router does not scroll to hashes on its own.
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { portfolioData } from '../data/portfolioData';
import { prefersReducedMotion } from '../prefersReducedMotion';
import CaseStudyCards from '../components/CaseStudyCards';
import ContactFooter from '../components/ContactFooter';
import ExperienceSection from '../components/ExperienceSection';
import HomeHero from '../components/HomeHero';
import HowIWork from '../components/HowIWork';
import ProductionStats from '../components/ProductionStats';
import Toolkit from '../components/Toolkit';

export default function HomePage() {
  useScrollToHashTarget();
  const { personal, home, caseStudies } = portfolioData;
  const emailHref = `mailto:${personal.email}`;

  return (
    <main>
      <HomeHero hero={home.hero} emailHref={emailHref} />
      <ProductionStats stats={home.stats} />

      <section
        id="work"
        className="flex flex-col gap-12 border-y border-border bg-surface px-5 py-16 md:px-[120px] md:py-28"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {home.caseStudiesIntro.eyebrow}
            </p>
            <h2 className="font-display text-3xl font-medium text-ink md:text-5xl">
              {home.caseStudiesIntro.heading}
            </h2>
          </div>
          <p className="max-w-md text-base text-body">{home.caseStudiesIntro.lead}</p>
        </div>
        <CaseStudyCards caseStudies={caseStudies} />
      </section>

      <HowIWork principles={home.principles} workingWithPeople={home.workingWithPeople} />
      <ExperienceSection experience={home.experience} education={home.education} />
      <Toolkit toolkit={home.toolkit} />
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

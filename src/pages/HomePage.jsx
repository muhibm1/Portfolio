// The "/" route: the six home sections in their fixed order. It tells the layout's navbar which
// section is on screen, and scrolls to the section a link such as /#simulator names, because
// React Router does not scroll to hashes (ADR 0001).
import { useEffect } from 'react';
import { useLocation, useOutletContext } from 'react-router';
import Hero from '../components/Hero';
import FdePhilosophy from '../components/FdePhilosophy';
import CaseStudiesSection from '../components/CaseStudiesSection';
import InteractiveTriageSimulator from '../components/InteractiveTriageSimulator';
import ExperienceTimeline from '../components/ExperienceTimeline';
import SkillsMatrix from '../components/SkillsMatrix';
import { prefersReducedMotion } from '../prefersReducedMotion';

// In page order. 'contact' is the footer, which the layout renders below this page.
const SPIED_SECTION_IDS = ['overview', 'philosophy', 'case-studies', 'simulator', 'experience', 'skills', 'contact'];

// The current section is the one under a line this many pixels below the top of the viewport,
// so a section's navbar link lights up just before its heading reaches the top.
const ACTIVE_LINE_OFFSET = 200;

export default function HomePage() {
  const { setActiveSection } = useOutletContext();
  useActiveSectionSpy(setActiveSection);
  useScrollToHashTarget();

  return (
    <main>
      <Hero />
      <FdePhilosophy />
      <CaseStudiesSection />
      <InteractiveTriageSimulator />
      <ExperienceTimeline />
      <SkillsMatrix />
    </main>
  );
}

// Moved here from App.jsx (R9) so it listens only while the home page is open.
function useActiveSectionSpy(setActiveSection) {
  useEffect(() => {
    const handleScroll = () => {
      const currentSectionId = findSectionAt(window.scrollY + ACTIVE_LINE_OFFSET);
      if (currentSectionId) setActiveSection(currentSectionId);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setActiveSection]);
}

function findSectionAt(pagePosition) {
  return SPIED_SECTION_IDS.find((sectionId) => {
    const section = document.getElementById(sectionId);
    if (!section) return false;
    return pagePosition >= section.offsetTop && pagePosition < section.offsetTop + section.offsetHeight;
  });
}

// R8: runs on mount and whenever the hash changes. A hash naming no element does nothing.
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

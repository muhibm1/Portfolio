import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FdePhilosophy from './components/FdePhilosophy';
import CaseStudiesSection from './components/CaseStudiesSection';
import InteractiveTriageSimulator from './components/InteractiveTriageSimulator';
import ExperienceTimeline from './components/ExperienceTimeline';
import SkillsMatrix from './components/SkillsMatrix';
import ContactFooter from './components/ContactFooter';
import ResumeModal from './components/ResumeModal';
import { portfolioData } from './data/portfolioData';

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  // Active section scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'philosophy', 'case-studies', 'simulator', 'experience', 'skills', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenSimulator = () => {
    const el = document.getElementById('simulator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f5f1] text-[#181818] font-sans antialiased selection:bg-[#facb0e]/30 selection:text-black">
      {/* Navigation Bar */}
      <Navbar
        activeSection={activeSection}
        onOpenResume={() => setIsResumeOpen(true)}
      />

      {/* Main Content Sections */}
      <main>
        {/* Hero Section */}
        <Hero
          onOpenSimulator={handleOpenSimulator}
        />

        {/* FDE Philosophy & Operating Principles */}
        <FdePhilosophy />

        {/* Case Studies & System Deployments */}
        <CaseStudiesSection
          onOpenSimulator={handleOpenSimulator}
        />

        {/* Interactive FDE Triage Simulator */}
        <InteractiveTriageSimulator />

        {/* Work Experience & Background */}
        <ExperienceTimeline />

        {/* Capabilities & Tech Stack */}
        <SkillsMatrix />
      </main>

      {/* Contact & Action Footer */}
      <ContactFooter onOpenResume={() => setIsResumeOpen(true)} />

      {/* Resume Viewer Modal */}
      {isResumeOpen && (
        <ResumeModal onClose={() => setIsResumeOpen(false)} />
      )}
    </div>
  );
}

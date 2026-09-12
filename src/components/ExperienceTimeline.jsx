import React from 'react';
import { GraduationCap, MapPin, Calendar } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export default function ExperienceTimeline() {
  const { experience, education } = portfolioData;

  return (
    <section id="experience" className="py-20 px-4 border-t border-[#bfbebe] bg-[#e5e4e0]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#1d1d1d]/70 block mb-2">
              03 // Track Record & Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1d1d1d] font-['Space_Grotesk',sans-serif]">
              Work Experience & Background
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#1d1d1d]/70 max-w-md leading-relaxed">
            Building mission-critical integrations, maintaining data health at global scale, and engineering real-time full-stack features.
          </p>
        </div>

        {/* Experience Cards */}
        <div className="space-y-8">
          {experience.map((job, idx) => (
            <div
              key={idx}
              className="p-7 sm:p-9 bg-white border border-[#bfbebe]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-[#bfbebe] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl sm:text-2xl font-bold text-[#1d1d1d] tracking-tight font-['Space_Grotesk',sans-serif]">
                      {job.company}
                    </span>
                    {idx === 0 && (
                      <span className="px-2.5 py-0.5 border border-[#1d1d1d] text-[#1d1d1d] text-[10px] font-mono font-bold">
                        CURRENT ROLE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-[#1d1d1d]/70">
                    {job.role}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#1d1d1d]/70">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {job.period}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                </div>
              </div>

              {/* Bullet Points */}
              <ul className="space-y-3 mt-4">
                {job.highlights.map((bullet, bulletIdx) => {
                  const parts = bullet.split(':');
                  const title = parts.length > 1 ? parts[0] : '';
                  const body = parts.length > 1 ? parts.slice(1).join(':') : bullet;

                  return (
                    <li key={bulletIdx} className="text-xs sm:text-sm text-[#1d1d1d]/70 leading-relaxed flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1d1d1d] mt-2 shrink-0"></span>
                      <div>
                        {title && (
                          <span className="font-semibold text-[#1d1d1d] mr-1">
                            {title}:
                          </span>
                        )}
                        <span>{body}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Education Section */}
        <div className="mt-14 pt-10 border-t border-[#bfbebe]">
          <span className="font-mono text-xs uppercase tracking-widest text-[#1d1d1d]/70 block mb-6">
            Academic Foundation
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {education.map((edu, idx) => (
              <div
                key={idx}
                className="p-6 bg-white border border-[#bfbebe] flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-[#e5e4e0] border border-[#bfbebe] flex items-center justify-center text-[#1d1d1d]">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1d1d1d]">
                      {edu.degree}
                    </h4>
                    <span className="text-xs text-[#1d1d1d]/70">
                      {edu.institution}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-[#1d1d1d]/70 bg-[#e5e4e0] px-2.5 py-1 border border-[#bfbebe]">
                  {edu.graduation}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

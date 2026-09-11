import React from 'react';
import { Briefcase, GraduationCap, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { portfolioData } from '../data/portfolioData';

export default function ExperienceTimeline() {
  const { experience, education } = portfolioData;

  return (
    <section id="experience" className="py-20 px-4 border-t border-[#e2e0d8] bg-[#f6f5f1]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#7a7872] block mb-2">
              03 // Track Record & Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#181818] font-['Space_Grotesk',sans-serif]">
              Work Experience & Background
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#615f59] max-w-md leading-relaxed">
            Building mission-critical integrations, maintaining data health at global scale, and engineering real-time full-stack features.
          </p>
        </div>

        {/* Experience Cards */}
        <div className="space-y-8">
          {experience.map((job, idx) => (
            <div
              key={idx}
              className="p-7 sm:p-9 rounded-3xl bg-white border border-[#e4e2da] shadow-2xs hover:shadow-xs transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-[#f0eee6] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl sm:text-2xl font-bold text-[#181818] tracking-tight font-['Space_Grotesk',sans-serif]">
                      {job.company}
                    </span>
                    {idx === 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                        CURRENT ROLE
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-semibold text-[#484642]">
                    {job.role}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#787670]">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#888]" />
                    {job.period}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#888]" />
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
                    <li key={bulletIdx} className="text-xs sm:text-sm text-[#4d4b45] leading-relaxed flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#181818] mt-2 shrink-0"></span>
                      <div>
                        {title && (
                          <span className="font-semibold text-[#181818] mr-1">
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
        <div className="mt-14 pt-10 border-t border-[#e2e0d8]">
          <span className="font-mono text-xs uppercase tracking-widest text-[#7a7872] block mb-6">
            Academic Foundation
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {education.map((edu, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-[#e4e2da] flex items-center justify-between shadow-2xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#f6f5f1] border border-[#dedcd4] flex items-center justify-center text-[#181818]">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#181818]">
                      {edu.degree}
                    </h4>
                    <span className="text-xs text-[#6e6c66]">
                      {edu.institution}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-[#787670] bg-[#f6f5f1] px-2.5 py-1 rounded-lg border border-[#e4e2da]">
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

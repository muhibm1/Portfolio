import { portfolioData } from '../data/portfolioData';

// Approved at G3 (G3-D2). Shown instead of a repository link while a repository is private,
// because a link to a private repository answers every visitor with a 404.
const PRIVATE_REPOSITORY_NOTE = 'Private repository · walkthrough on request';

const textLinkClass = 'underline-offset-4 decoration-1 hover:underline focus-visible:underline';

/** One project on the /work index. It links to the repository only when the repository is public. */
export default function ProjectEntry({ project }) {
  return (
    <article className="flex flex-col gap-5">
      <p className="font-mono text-xs uppercase tracking-widest text-[#1d1d1d]/70">
        {project.status}
      </p>
      <h3 className="font-display text-3xl sm:text-4xl font-normal tracking-wide leading-tight text-[#1d1d1d]">
        {project.name}
      </h3>
      <p className="text-lg leading-snug text-[#1d1d1d]">{project.tagline}</p>
      <p className="text-base leading-relaxed text-[#1d1d1d]/70">{project.description}</p>
      <p className="font-mono text-xs text-[#1d1d1d]/70">{project.techStack.join(' ~ ')}</p>
      {project.repoPublic ? <RepositoryLink repo={project.repo} /> : <PrivateRepositoryNote />}
    </article>
  );
}

function RepositoryLink({ repo }) {
  const addressWithoutScheme = repo.replace(/^https?:\/\//, '');

  return (
    <a href={repo} className={`self-start text-sm text-[#1d1d1d] ${textLinkClass}`}>
      {addressWithoutScheme}
    </a>
  );
}

function PrivateRepositoryNote() {
  const { email } = portfolioData.personal;

  return (
    <div className="flex flex-col gap-1 text-sm text-[#1d1d1d]/70">
      <p>{PRIVATE_REPOSITORY_NOTE}</p>
      <a href={`mailto:${email}`} className={`self-start text-[#1d1d1d] ${textLinkClass}`}>
        {email}
      </a>
    </div>
  );
}

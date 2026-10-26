// The one list of concrete paths the site serves, shared by the build, the post-build check and
// the tests, so nothing is hand-maintained (ADR 0002).

const SAFE_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** / then /work then /work/<id> for each case study, in data order. Throws on an unsafe id. */
export function staticRoutePaths(caseStudies) {
  return ['/', '/work', ...caseStudies.map((study) => `/work/${validatedSlug(study.id)}`)];
}

function validatedSlug(id) {
  if (SAFE_SLUG.test(id)) return id;
  throw new Error(
    `Case study id "${id}" is not a URL-safe slug (lower-case letters, digits and single ` +
      'hyphens); it cannot become a page directory.',
  );
}

// Old addresses that moved, each served as a small page that sends the browser to its new one
// (GitHub Pages has no server-side redirects). Written by scripts/prerender.mjs and checked by
// scripts/check-route-pages.mjs. The decision-support case study was renamed on 2026-10-21; the
// WorkHorse and agent harness (Tannhauser Gate) case studies were removed on 2026-10-25 at the
// owner's request, so their addresses go to the work list.
export const REDIRECTS = [
  { from: '/work/apple-llm-triage', to: '/work/apple-decision-support-agent' },
  { from: '/work/workhorse', to: '/work' },
  { from: '/work/tannhauser-gate', to: '/work' },
  { from: '/work/neural-newsletters-llm', to: '/work' },
];

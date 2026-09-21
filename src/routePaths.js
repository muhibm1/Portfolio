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

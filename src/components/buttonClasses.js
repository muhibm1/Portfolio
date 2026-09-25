// Shared class strings for the redesign's interactive elements (R148): every button-styled control
// is at least 48px tall (min-h-12), every nav link at least 44px (min-h-11), and focus is visible
// through the global :focus-visible outline in src/index.css, not a per-class ring.

export const primaryButtonClasses =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-sans text-sm font-medium text-on-dark transition-colors hover:opacity-90'

export const secondaryButtonClasses =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border px-6 font-sans text-sm font-medium text-ink transition-colors hover:bg-surface'

export const onDarkButtonClasses =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-on-dark-tertiary px-6 font-sans text-sm font-medium text-on-dark transition-colors hover:bg-white/10'

export const navLinkClasses =
  'inline-flex min-h-11 items-center px-2 font-sans text-sm font-medium text-body transition-colors hover:text-ink'

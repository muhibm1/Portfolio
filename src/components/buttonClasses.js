// Shared class strings for the Look's interactive elements (R148): every button-styled control
// is at least 48px tall (min-h-12), every nav link at least 44px (min-h-11), and focus is visible
// through the global :focus-visible outline in src/index.css, not a per-class ring. Colours are
// the Look's variables (src/look.css), so each string follows the light or dark theme.

const pill =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-transparent px-[22px] font-sans text-[15px] font-medium no-underline transition-[transform,background-color,border-color] duration-200 ease-[var(--out)] active:scale-[.97]'

// The solid pill: ink on the page, flipping to a light fill in the dark theme.
export const primaryButtonClasses = `${pill} bg-ink text-on-ink hover:bg-[var(--ink-hover)]`

// The outlined pill on a surface.
export const secondaryButtonClasses = `${pill} border-line-strong bg-surface text-ink hover:border-ink`

// The pills on the always-dark contact band: a light solid one and an outlined one.
export const onDarkSolidButtonClasses = `${pill} bg-dark-ink text-dark`
export const onDarkButtonClasses = `${pill} border-dark-edge-strong bg-transparent text-dark-ink hover:border-dark-ink`

export const navLinkClasses =
  'inline-flex min-h-11 items-center py-1.5 font-sans text-sm text-ink-2 no-underline transition-colors hover:text-ink'

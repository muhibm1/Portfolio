// Class strings the Look repeats on every page: the page width, the eyebrow, the section
// headings and the large body text. Colours read the Look's variables (src/look.css).

// The page width: 1296px at most, with a side gutter of 16px on a phone, 32px on a tablet and
// 48px on a wide screen.
export const wrapClasses = 'mx-auto w-full max-w-[1296px] px-4 tab:px-8 wide:px-12';

// The small grey line above a heading.
export const eyebrowClasses = 'text-sm font-medium tracking-[0.01em] text-muted';

// The one big heading of a page.
export const h1Classes =
  'font-display text-[clamp(40px,4.8vw,70px)] font-semibold leading-[1.02] tracking-[-0.04em] text-balance text-ink';

// The heading of a page section.
export const h2Classes =
  'font-display text-[clamp(34px,4.4vw,56px)] font-semibold leading-[1.06] tracking-[-0.035em] text-balance text-ink';

// The title of a card or an item inside a section.
export const h3Classes = 'font-display text-[22px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink';

// The larger paragraph under a section heading.
export const bodyLargeClasses = 'text-[clamp(17px,1.5vw,21px)] leading-[1.5] text-ink-2';

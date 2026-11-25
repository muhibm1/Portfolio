import CopyEmail from './CopyEmail';
import { primaryButtonClasses } from './buttonClasses';
import { eyebrowClasses } from './lookClasses';

/**
 * The hero of the Look: eyebrow, the one big heading, the call to action with the email address,
 * and the lead paragraph. On a wide screen the lead sits beside the heading; on a tablet or phone
 * it follows the call to action. Copy comes straight from home.hero.
 */
export default function HomeHero({ hero, email }) {
  return (
    <section
      aria-labelledby="home-heading"
      className="mx-auto grid w-full max-w-[1296px] grid-cols-1 gap-x-6 px-4 pt-[14px] pb-[72px] tab:px-8 tab:pt-8 wide:grid-cols-12 wide:px-12 wide:pb-24"
    >
      <p className={`${eyebrowClasses} col-span-full mb-2 overflow-hidden text-ellipsis whitespace-nowrap tab:mb-3.5`}>
        <span className="hidden tab:inline">{hero.eyebrow}</span>
        <span className="tab:hidden">{hero.mobileEyebrow}</span>
      </p>

      <h1
        id="home-heading"
        className="max-w-[13em] font-display text-[36px] font-semibold leading-[1.04] tracking-[-0.04em] text-balance text-ink tab:max-w-[15em] tab:text-[clamp(40px,4.6vw,64px)] wide:col-span-8"
      >
        {hero.heading}
      </h1>

      <div className="mt-3 flex flex-col items-start gap-2 tab:mt-[22px] tab:flex-row tab:flex-wrap tab:items-center tab:gap-x-[22px] tab:gap-y-3 wide:col-span-8 wide:flex-nowrap wide:self-start">
        <a href={hero.primaryHref ?? '#work'} className={primaryButtonClasses}>
          {hero.primaryCta}
        </a>
        <CopyEmail email={email} />
      </div>

      <p className="order-last mt-8 max-w-[62ch] text-[17px] leading-[1.6] text-ink-2 wide:order-none wide:col-span-4 wide:col-start-9 wide:row-span-2 wide:row-start-2 wide:mt-0 wide:self-start wide:pt-2 wide:text-base">
        {hero.lead}
      </p>
    </section>
  );
}

import { wrapClasses } from './lookClasses';

/**
 * "Measured in production" on the always-dark band (the Look). The four Apple stats sit in a
 * two-by-two grid (one column on a phone) with the caption under them. A stat may carry a shorter
 * wording for a phone (mobileText).
 */
export default function ProductionStats({ stats }) {
  return (
    <section id="stats" aria-labelledby="stats-heading" className="on-dark-band bg-dark py-20 text-dark-ink tab:py-[136px]">
      <div className={wrapClasses}>
        <h2 id="stats-heading" className="text-sm font-medium tracking-[0.01em] text-dark-muted">
          {stats.eyebrow}
        </h2>
        <ul className="mt-9 mb-11 grid grid-cols-1 gap-9 tab:mt-14 tab:mb-16 tab:grid-cols-2 tab:gap-x-8 tab:gap-y-[72px]">
          {stats.items.map((item) => (
            <li key={item.label} className="grid content-start gap-2.5 border-t border-dark-edge pt-[22px]">
              <p className="font-display text-[clamp(48px,5.2vw,72px)] leading-none font-semibold tracking-[-0.045em]">
                {item.value}
              </p>
              {item.mobileText ? (
                <>
                  <p className="hidden text-lg font-medium tab:block">{item.label}</p>
                  <p className="hidden text-[15px] text-dark-muted tab:block">{item.context}</p>
                  <p className="text-lg font-medium tab:hidden">{item.mobileText}</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium">{item.label}</p>
                  <p className="text-[15px] text-dark-muted">{item.context}</p>
                </>
              )}
            </li>
          ))}
        </ul>
        <p className="text-sm text-dark-muted">{stats.caption}</p>
      </div>
    </section>
  );
}

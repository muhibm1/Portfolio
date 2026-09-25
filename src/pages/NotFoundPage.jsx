import { Link } from 'react-router';
import { primaryButtonClasses, secondaryButtonClasses } from '../components/buttonClasses';

/** The page for any address the site does not serve, including an unknown case-study slug. */
export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-ground px-5 pt-40 pb-20 md:px-[120px]">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-6xl">
          Page not found
        </h1>
        <p className="text-base text-body">There is no page at this address.</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/" className={primaryButtonClasses}>
            Back to home
          </Link>
          <Link to="/work" className={secondaryButtonClasses}>
            Browse all work
          </Link>
        </div>
      </div>
    </main>
  );
}

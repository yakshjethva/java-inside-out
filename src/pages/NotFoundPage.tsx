import { Link } from 'react-router';
import { usePageTitle } from '@/hooks/usePageTitle';

export function NotFoundPage() {
  usePageTitle('Page not found');
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="kicker">404 · NoClassDefFoundError</p>
      <h1 className="mt-3 font-serif text-4xl text-fg">This page could not be found</h1>
      <p className="mt-3 text-fg-muted">
        The address may be mistyped, or the page may belong to a laboratory that is still in
        development.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-md bg-exec-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-exec-400"
        >
          Go home
        </Link>
        <Link
          to="/anatomy"
          className="rounded-md border border-ink-500 px-4 py-2 text-sm text-fg hover:border-ink-400"
        >
          Explore the JVM anatomy
        </Link>
        <Link
          to="/paths"
          className="rounded-md border border-ink-500 px-4 py-2 text-sm text-fg hover:border-ink-400"
        >
          Learning paths
        </Link>
      </div>
    </div>
  );
}

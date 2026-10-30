import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

/** Shown when a route fails to load (for example a stale chunk after a deploy while offline). */
export function RouteError() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error';
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="kicker">Something went wrong</p>
      <h1 className="mt-2 font-serif text-3xl text-fg">This page could not be loaded</h1>
      <p className="mt-3 text-fg-muted">
        If you are offline, or the site was just updated, reloading usually fixes it.
      </p>
      <pre className="mt-4 overflow-x-auto rounded-md border border-ink-600 bg-ink-850 p-3 text-left text-[12.5px] text-fg-subtle">
        {message}
      </pre>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md bg-exec-500 px-4 py-2 text-sm font-medium text-ink-950"
        >
          Reload
        </button>
        <Link to="/" className="rounded-md border border-ink-500 px-4 py-2 text-sm text-fg">
          Go home
        </Link>
      </div>
    </div>
  );
}

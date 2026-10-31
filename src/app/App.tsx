import { useEffect, useLayoutEffect } from 'react';
import type { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { prefetchPages } from './routes';

type Router = ReturnType<typeof createBrowserRouter>;

export function App({ router }: { router: Router }) {
  // Prerendered HTML for a different URL stays hidden until React has painted
  // the right page (see scripts/prerender.mjs); this reveals it.
  useLayoutEffect(() => {
    document.documentElement.removeAttribute('data-client-render');
  }, []);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const handle = idle(() => prefetchPages());
    return () => {
      if (window.cancelIdleCallback && typeof handle === 'number')
        window.cancelIdleCallback(handle);
    };
  }, []);

  return <RouterProvider router={router} />;
}

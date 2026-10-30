import { useEffect } from 'react';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { prefetchPages, routes } from './routes';

/**
 * import.meta.env.BASE_URL is "/" locally and "/<repo>/" on GitHub Pages. Keeping
 * the trailing slash makes links to the home page match the URL Pages serves.
 */
const router = createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });

export function App() {
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

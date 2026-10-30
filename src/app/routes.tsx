import type { RouteObject } from 'react-router';
import { RootLayout } from './RootLayout';
import { RouteError } from './RouteError';
import { PageLoading } from './PageLoading';

/**
 * Lazy page loaders. They are also prefetched once the first page is idle,
 * so the whole site keeps working offline after the initial visit.
 */
export const pageLoaders = {
  home: () => import('@/pages/HomePage'),
  paths: () => import('@/pages/LearningPathsPage'),
  anatomy: () => import('@/pages/JvmAnatomyPage'),
  glossary: () => import('@/pages/GlossaryPage'),
  references: () => import('@/pages/ReferencesPage'),
  about: () => import('@/pages/AboutPage'),
  contributing: () => import('@/pages/ContributingPage'),
  notFound: () => import('@/pages/NotFoundPage'),
};

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,
    // The fallback sits on the pages, not the root, so the header stays mounted
    // while the first page loads.
    children: [
      { index: true, lazy: () => pageLoaders.home().then((m) => ({ Component: m.HomePage })) },
      {
        path: 'paths',
        lazy: () => pageLoaders.paths().then((m) => ({ Component: m.LearningPathsPage })),
      },
      {
        path: 'anatomy',
        lazy: () => pageLoaders.anatomy().then((m) => ({ Component: m.JvmAnatomyPage })),
      },
      {
        path: 'glossary',
        lazy: () => pageLoaders.glossary().then((m) => ({ Component: m.GlossaryPage })),
      },
      {
        path: 'references',
        lazy: () => pageLoaders.references().then((m) => ({ Component: m.ReferencesPage })),
      },
      { path: 'about', lazy: () => pageLoaders.about().then((m) => ({ Component: m.AboutPage })) },
      {
        path: 'contributing',
        lazy: () => pageLoaders.contributing().then((m) => ({ Component: m.ContributingPage })),
      },
      {
        path: '*',
        lazy: () => pageLoaders.notFound().then((m) => ({ Component: m.NotFoundPage })),
      },
    ].map((route) => ({ ...route, HydrateFallback: PageLoading })),
  },
];

export function prefetchPages() {
  for (const load of Object.values(pageLoaders)) {
    load().catch(() => {
      // Offline or a deploy replaced the chunk: the route will retry on navigation.
    });
  }
  import('@/components/code/highlighter')
    .then((module) => module.preloadHighlighter())
    .catch(() => {});
}

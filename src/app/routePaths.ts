/**
 * Top-level routes that exist in this release. The build writes a copy of
 * index.html for each one (see vite.config.ts) so GitHub Pages answers deep
 * links with HTTP 200. Only add a path here once its page is built.
 */
export const STATIC_ROUTES = [
  { path: 'start', title: 'Start here' },
  { path: 'paths', title: 'Learn' },
  { path: 'anatomy', title: 'Explore the JVM' },
  { path: 'glossary', title: 'Glossary' },
  { path: 'references', title: 'References' },
  { path: 'about', title: 'About' },
  { path: 'contributing', title: 'Contributing' },
] as const;

export type StaticRoutePath = (typeof STATIC_ROUTES)[number]['path'];

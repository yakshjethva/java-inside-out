/** Site-wide identity and technical provenance. Product name is independent; Java/JVM terms remain accurate. */
export const SITE = {
  name: 'Runtime Atlas',
  tagline: 'See what happens inside the machine that runs your code.',
  repository: 'https://github.com/yakshjethva/jvm-inside-out',
  canonical: 'https://jvmatlas.vercel.app',
  specVersion: 'Java SE 25',
  implementationVersion: 'OpenJDK HotSpot, JDK 25',
} as const;

export interface NavItem {
  to: string;
  label: string;
  description: string;
}

export const PRIMARY_NAV: NavItem[] = [
  { to: '/start', label: 'Start learning', description: 'A guided first lesson: what happens when you run a Java program' },
  { to: '/paths', label: 'Learning paths', description: 'Learning paths that begin with a question' },
  { to: '/anatomy', label: 'Explore the JVM', description: 'An interactive map of the Java Virtual Machine' },
  { to: '/glossary', label: 'Glossary', description: 'Technical terms, clearly explained' },
];

export const MORE_NAV: NavItem[] = [
  { to: '/references', label: 'References', description: 'Specifications, JEPs and source code we cite' },
  { to: '/about', label: 'About', description: 'Project, versions and accuracy' },
  { to: '/contributing', label: 'Contributing', description: 'How to improve the content and code' },
  { to: '/about#project-status', label: 'Project status', description: 'What is built and what comes next' },
];

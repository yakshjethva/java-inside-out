/** Site-wide metadata. The repository URL is used for "edit on GitHub" and contribution links. */
export const SITE = {
  name: 'Inside Java',
  tagline: 'Understand Java from the inside out.',
  repository: 'https://github.com/yakshjethva/jvm-inside-out',
  specVersion: 'Java SE 25',
  implementationVersion: 'OpenJDK HotSpot, JDK 25',
} as const;

export interface NavItem {
  to: string;
  label: string;
  description: string;
}

/**
 * Primary navigation, in the order a new visitor needs it. Only pages that
 * exist in this release are listed.
 */
export const PRIMARY_NAV: NavItem[] = [
  {
    to: '/start',
    label: 'Start here',
    description: 'A guided first lesson: what happens when you run a Java program',
  },
  { to: '/paths', label: 'Learn', description: 'Learning paths that begin with a question' },
  {
    to: '/anatomy',
    label: 'Explore the JVM',
    description: 'The interactive map of the machine that runs Java',
  },
  { to: '/glossary', label: 'Glossary', description: 'Every technical term, in plain words' },
];

/** Reference and project pages, grouped under "More". */
export const MORE_NAV: NavItem[] = [
  {
    to: '/references',
    label: 'References',
    description: 'Specifications, JEPs and source code we cite',
  },
  { to: '/about', label: 'About', description: 'Why Inside Java exists, versions and accuracy' },
  {
    to: '/contributing',
    label: 'Contributing',
    description: 'How to improve the content and code',
  },
  {
    to: '/about#project-status',
    label: 'Project status',
    description: 'What is built and what comes next',
  },
];

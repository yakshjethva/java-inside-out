/** Site-wide metadata. The repository URL is used for "edit on GitHub" and contribution links. */
export const SITE = {
  name: 'Inside Java',
  tagline: 'Understand Java from the inside out.',
  repository: 'https://github.com/yakshjethva/java-inside-out',
  specVersion: 'Java SE 25',
  implementationVersion: 'OpenJDK HotSpot, JDK 25',
} as const;

export interface NavItem {
  to: string;
  label: string;
  description: string;
}

/** Primary navigation. Only pages that exist in this release are listed. */
export const PRIMARY_NAV: NavItem[] = [
  { to: '/anatomy', label: 'JVM Anatomy', description: 'Interactive map of every JVM subsystem' },
  {
    to: '/paths',
    label: 'Learning Paths',
    description: 'The curriculum and what is available now',
  },
  { to: '/glossary', label: 'Glossary', description: 'Every technical term, at two levels' },
  {
    to: '/references',
    label: 'References',
    description: 'Specifications, JEPs and source code we cite',
  },
];

export const SECONDARY_NAV: NavItem[] = [
  { to: '/about', label: 'About', description: 'Accuracy policy and versions' },
  {
    to: '/contributing',
    label: 'Contributing',
    description: 'How to improve the content and code',
  },
];

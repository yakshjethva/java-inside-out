import { useEffect } from 'react';
import { SITE } from '@/data/site';

/** The tagline is a sentence elsewhere (the footer); a title has no closing full stop. */
const HOME_TITLE = `${SITE.name} · ${SITE.tagline.replace(/\.$/, '')}`;

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE.name}` : HOME_TITLE;
  }, [title]);
}

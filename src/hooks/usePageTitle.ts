import { useEffect } from 'react';
import { SITE } from '@/data/site';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE.name}` : `${SITE.name} · ${SITE.tagline}`;
  }, [title]);
}

import type { GlossaryEntry } from '@/types/content';
import { GLOSSARY_ENTRIES } from './terms';

const BY_ID = new Map(GLOSSARY_ENTRIES.map((entry) => [entry.id, entry]));

export const GLOSSARY: readonly GlossaryEntry[] = [...GLOSSARY_ENTRIES].sort((a, b) =>
  a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }),
);

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return BY_ID.get(id);
}

export function glossaryForComponent(componentId: string): GlossaryEntry[] {
  return GLOSSARY.filter((entry) => entry.componentId === componentId);
}

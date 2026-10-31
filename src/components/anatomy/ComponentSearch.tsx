import { Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { ancestry, COMPONENT_LIST, type ComponentId } from '@/content/jvm';
import { regionOf } from '@/content/jvm/regions';
import { cn } from '@/lib/cn';

const MAX_RESULTS = 8;

/** Where a component sits, in the overview's plain words ("in Memory"). */
function placeOf(id: ComponentId): string {
  const chain = ancestry(id).map((doc) => doc.id);
  const region = chain.map(regionOf).find(Boolean);
  if (region) return region.title;
  return chain.includes('build-time') ? 'Build time' : 'the Java process';
}

/**
 * "Find a component": a combobox that matches component names and summaries.
 * Arrow keys move through results, Enter opens one, Escape closes the list.
 */
export function ComponentSearch({ onSelect }: { onSelect: (id: ComponentId) => void }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const byName = COMPONENT_LIST.filter((doc) => doc.name.toLowerCase().includes(q));
    const bySummary = COMPONENT_LIST.filter(
      (doc) => !byName.includes(doc) && doc.summary.toLowerCase().includes(q),
    );
    return [...byName, ...bySummary].slice(0, MAX_RESULTS);
  }, [query]);

  const choose = (id: ComponentId) => {
    onSelect(id);
    setQuery('');
    setOpen(false);
  };

  const expanded = open && query.trim().length > 0;

  return (
    <div className="relative w-full sm:w-[250px]">
      <label className="flex h-9 items-center gap-2 rounded-md border border-ink-600 bg-ink-850 px-2.5 focus-within:border-exec-400">
        <Search size={15} aria-hidden className="shrink-0 text-fg-subtle" />
        <span className="sr-only">Find a component</span>
        <input
          type="text"
          role="combobox"
          name="component-search"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded && results[active] ? `${listId}-${active}` : undefined}
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder="Find a component…"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              // A closed list opens on the current suggestion; an open one moves down.
              if (!expanded) setOpen(true);
              else setActive((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (event.key === 'Enter' && expanded) {
              const hit = results[active];
              if (hit) {
                event.preventDefault();
                choose(hit.id);
              }
            } else if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
          className="h-full w-full bg-transparent text-[13.5px] text-fg outline-none placeholder:text-fg-subtle"
        />
      </label>
      <ul
        id={listId}
        role="listbox"
        aria-label="Matching components"
        hidden={!expanded}
        className="absolute top-full right-0 left-0 z-40 mt-1 max-h-[320px] overflow-y-auto rounded-lg border border-ink-600 bg-ink-900 p-1 shadow-2xl"
      >
        {results.length === 0 ? (
          <li className="px-3 py-2 text-[13px] text-fg-subtle">No component matches “{query}”.</li>
        ) : (
          results.map((doc, i) => (
            <li
              key={doc.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(event) => {
                event.preventDefault();
                choose(doc.id);
              }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                'cursor-pointer rounded-md px-3 py-2',
                i === active ? 'bg-ink-750' : 'hover:bg-ink-800',
              )}
            >
              <span className="block text-[13.5px] text-fg">{doc.name}</span>
              <span className="block text-[12px] text-fg-subtle">in {placeOf(doc.id)}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

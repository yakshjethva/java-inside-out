import { Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import {
  addReference,
  assignRoot,
  collect,
  createHeap,
  newObject,
  reachableIds,
  removeReference,
  type Heap,
} from '@/simulators/reachability';
import { CodeText } from '../CodeText';
import { ExhibitFrame } from '../ExhibitFrame';
import { ReferenceArrows, type ArrowSpec } from '../ReferenceArrows';

function startingHeap(): Heap {
  let heap = createHeap(['a', 'b']);
  heap = newObject(heap, 'p1', 'Person "Mia"', { root: 'a' });
  heap = newObject(heap, 's1', 'String "Mia"', { object: 'p1' });
  return heap;
}

const selectClass =
  'h-8 rounded-md border border-ink-600 bg-ink-850 px-1.5 text-[12.5px] text-fg focus-visible:border-exec-400';

/**
 * Chapter 7: build references, remove them, and run a collection. Keeps
 * reachable, eligible (unreachable, still in memory) and reclaimed apart.
 */
export function ReachabilityExhibit() {
  const [heap, setHeap] = useState(startingHeap);
  const [counter, setCounter] = useState(1);
  const [message, setMessage] = useState(
    '`a` refers to a Person, and the Person’s name refers to a String. Both objects are reachable.',
  );
  const [ghosts, setGhosts] = useState<string[]>([]);
  const container = useRef<HTMLDivElement>(null);
  const idBase = useId();

  const live = useMemo(() => reachableIds(heap), [heap]);
  const label = (id: string) => heap.objects.find((o) => o.id === id)?.label ?? id;
  const eligible = heap.objects.filter((o) => !live.has(o.id));

  const apply = (next: Heap, text: string) => {
    setHeap(next);
    setGhosts([]);
    setMessage(text);
  };

  const arrows: ArrowSpec[] = [
    ...heap.roots.flatMap((root) =>
      root.target ? [{ from: `root-${root.id}`, to: `obj-${root.target}` }] : [],
    ),
    ...heap.references.map((ref) => ({
      from: `ref-${ref.from}-${ref.to}`,
      to: `obj-${ref.to}`,
      tone: live.has(ref.from) ? ('normal' as const) : ('warn' as const),
    })),
  ];

  return (
    <ExhibitFrame
      title="Reachable, eligible, reclaimed"
      controls={
        <button
          type="button"
          onClick={() => {
            setHeap(startingHeap());
            setCounter(1);
            setGhosts([]);
            setMessage('Back to the start: `a` → Person → String.');
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-ink-600 px-2.5 text-[13px] text-fg-muted hover:text-fg"
        >
          <RotateCcw size={14} aria-hidden /> Start again
        </button>
      }
      caption={<CodeText text={message} />}
      note="A teaching model of reachability, the rule HotSpot’s tracing collectors apply. Real collectors find many more roots (static fields, other threads, JNI handles) and choose when to collect; nothing here shows when a real collection would run."
    >
      <div
        ref={container}
        className="relative grid gap-x-12 gap-y-4 @[560px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
      >
        <section aria-label="GC roots: local variables in main’s frame">
          <p className="text-[12.5px] text-fg-subtle">Roots: variables in main’s frame</p>
          <ul className="mt-1.5 space-y-2">
            {heap.roots.map((root) => (
              <li
                key={root.id}
                data-anchor={`root-${root.id}`}
                className="rounded-lg border border-exec-500/50 bg-exec-900/25 p-2 pr-6"
              >
                <label
                  className="flex flex-wrap items-center gap-2 font-mono text-[13px]"
                  translate="no"
                >
                  <span className="text-fg">{root.id}</span>
                  <span className="text-fg-subtle">=</span>
                  <select
                    className={selectClass}
                    value={root.target ?? ''}
                    onChange={(event) => {
                      const target = event.target.value || null;
                      apply(
                        assignRoot(heap, root.id, target),
                        target
                          ? `\`${root.id}\` now refers to ${label(target)}. A variable holds one reference at a time.`
                          : `\`${root.id} = null\`: the variable no longer refers to anything. Objects only it led to are now unreachable, but still in memory.`,
                      );
                    }}
                  >
                    <option value="">null</option>
                    {heap.objects.map((object) => (
                      <option key={object.id} value={object.id}>
                        {object.label}
                      </option>
                    ))}
                  </select>
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              const id = `p${counter + 1}`;
              const name = ['Ada', 'Leo', 'Kai', 'Zoe', 'Ivy'][(counter - 1) % 5]!;
              setCounter((c) => c + 1);
              apply(
                newObject(heap, id, `Person "${name}"`, { root: 'b' }),
                `\`b = new Person("${name}")\`: a new object in the heap, reachable through \`b\`. Whatever \`b\` referred to before lost that reference.`,
              );
            }}
            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md border border-exec-500/70 bg-exec-900/50 px-3 text-[13px] text-exec-200 hover:border-exec-400"
          >
            <Plus size={14} aria-hidden /> b = new Person(…)
          </button>
        </section>

        <section aria-label="Heap">
          <p className="text-[12.5px] text-fg-subtle">Heap</p>
          <ul className="mt-1.5 space-y-2">
            {heap.objects.map((object) => {
              const isLive = live.has(object.id);
              const outgoing = heap.references.filter((ref) => ref.from === object.id);
              const candidates = heap.objects.filter(
                (o) => o.id !== object.id && !outgoing.some((ref) => ref.to === o.id),
              );
              return (
                <li
                  key={object.id}
                  data-anchor={`obj-${object.id}`}
                  className={cn(
                    'rounded-lg border p-2.5 transition-colors',
                    isLive
                      ? 'border-ok-500/60 bg-ok-900/25'
                      : 'border-dashed border-warn-400/80 bg-warn-900/25',
                  )}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-mono text-[13px] text-fg" translate="no">
                      {object.label}
                    </span>
                    <span
                      className={cn(
                        'text-[12px] font-medium',
                        isLive ? 'text-ok-300' : 'text-warn-300',
                      )}
                    >
                      {isLive ? 'Reachable' : 'Eligible for collection'}
                    </span>
                  </div>
                  {outgoing.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {outgoing.map((ref) => (
                        <li
                          key={ref.to}
                          data-anchor={`ref-${ref.from}-${ref.to}`}
                          className="flex items-center justify-between gap-2 rounded border border-ink-600 bg-ink-850 py-0.5 pr-5 pl-2 text-[12px] text-fg-muted"
                        >
                          <span>
                            field → <span translate="no">{label(ref.to)}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              apply(
                                removeReference(heap, ref.from, ref.to),
                                `The reference from ${object.label} to ${label(ref.to)} is gone.`,
                              )
                            }
                            aria-label={`Remove the reference from ${object.label} to ${label(ref.to)}`}
                            className="rounded p-0.5 text-fg-subtle hover:bg-ink-700 hover:text-fg"
                          >
                            <X size={13} aria-hidden />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {candidates.length > 0 && (
                    <label className="mt-1.5 flex items-center gap-2 text-[12px] text-fg-subtle">
                      <span>Add a reference to</span>
                      <select
                        id={`${idBase}-${object.id}`}
                        className={selectClass}
                        value=""
                        onChange={(event) => {
                          const target = event.target.value;
                          if (!target) return;
                          apply(
                            addReference(heap, object.id, target),
                            `${object.label} now refers to ${label(target)}.`,
                          );
                        }}
                      >
                        <option value="">choose…</option>
                        {candidates.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </li>
              );
            })}
            {ghosts.map((id) => (
              <li
                key={`ghost-${id}`}
                className="rounded-lg border border-dashed border-ink-600 p-2.5 text-[12.5px] text-fg-subtle"
              >
                <span className="line-through" translate="no">
                  {id}
                </span>{' '}
                · reclaimed: its memory can be reused
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              const after = collect(heap);
              const freed = after.reclaimed.map(label);
              setHeap(after);
              setGhosts(freed);
              setMessage(
                freed.length === 0
                  ? 'The collector ran and found nothing to reclaim: every object is reachable.'
                  : `The collector traced from the roots and reclaimed ${freed.length === 1 ? 'one object' : `${freed.length} objects`}: ${freed.join(', ')}. Reachable objects were not touched.`,
              );
            }}
            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-md border border-warn-500/70 bg-warn-900/40 px-3 text-[13px] text-warn-300 hover:border-warn-400"
          >
            <Trash2 size={14} aria-hidden /> Run garbage collection
            {eligible.length > 0 && (
              <span className="text-warn-300/80">({eligible.length} eligible)</span>
            )}
          </button>
        </section>

        <ReferenceArrows
          container={container}
          arrows={arrows}
          version={`${heap.objects.length}:${heap.references.length}:${ghosts.length}`}
        />
      </div>
    </ExhibitFrame>
  );
}

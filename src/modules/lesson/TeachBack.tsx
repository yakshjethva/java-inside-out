import { useId, useState } from 'react';
import { cn } from '@/lib/cn';

const KEY_POINTS = [
  'You write source code, a .java file.',
  'The compiler (javac) translates it into bytecode in a class file.',
  'The JVM’s class loader finds, checks and prepares your classes.',
  'Objects live in the heap; method calls get frames on a thread’s stack, and a variable such as person holds a reference to its object, not the object itself.',
  'The interpreter runs bytecode, and the JIT compiler turns busy code into machine code for the CPU.',
  'The garbage collector reclaims objects that can no longer be reached.',
];

/**
 * Teach-back: the learner explains the journey in their own words, then
 * compares their explanation with the key points. Nothing is stored or sent.
 */
export function TeachBack() {
  const [text, setText] = useState('');
  const [compared, setCompared] = useState(false);
  const [ticked, setTicked] = useState<Set<number>>(new Set());
  const id = useId();

  return (
    <div className="rounded-xl border border-ink-600 bg-ink-900/60 p-4 sm:p-5">
      <label htmlFor={id} className="block font-serif text-[22px] leading-snug text-fg">
        In your own words: what happens when you run a Java program?
      </label>
      <p className="mt-1 text-[14px] text-fg-subtle">
        Explaining something is the best test of understanding. Your answer stays in this page; it
        is not saved or sent anywhere.
      </p>
      <textarea
        id={id}
        name="teach-back"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={5}
        autoComplete="off"
        placeholder="When I run my program, first…"
        className="mt-3 w-full resize-y rounded-lg border border-ink-600 bg-ink-850 p-3 text-[15.5px] leading-relaxed text-fg placeholder:text-fg-subtle focus-visible:border-exec-400"
      />
      <button
        type="button"
        onClick={() => setCompared(true)}
        disabled={compared}
        className="mt-3 inline-flex h-10 items-center rounded-md border border-exec-400 bg-exec-500 px-4 text-[14px] font-medium text-ink-950 hover:bg-exec-400 disabled:opacity-60"
      >
        Compare with the key points
      </button>
      {compared && (
        <div className="mt-4" aria-live="polite">
          <p className="text-[15px] text-fg">
            Tick each point your explanation covered. Any you missed are worth a second look.
          </p>
          <ul className="mt-2 space-y-1.5">
            {KEY_POINTS.map((point, i) => (
              <li key={point}>
                <label
                  className={cn(
                    'flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 text-[15px] transition-colors',
                    ticked.has(i)
                      ? 'border-ok-500/60 bg-ok-900/30 text-fg'
                      : 'border-ink-600 text-fg-muted hover:border-ink-400',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={ticked.has(i)}
                    onChange={() =>
                      setTicked((previous) => {
                        const next = new Set(previous);
                        if (next.has(i)) next.delete(i);
                        else next.add(i);
                        return next;
                      })
                    }
                    className="mt-1 accent-[var(--color-ok-500)]"
                  />
                  {point}
                </label>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[14px] text-fg-subtle tabular" aria-live="polite">
            {ticked.size} of {KEY_POINTS.length} covered
          </p>
        </div>
      )}
    </div>
  );
}

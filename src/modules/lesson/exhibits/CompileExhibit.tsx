import { FileCode2, FileCog } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import {
  DEFAULT_MESSAGE,
  HELLO_CLASS_HEADER,
  helloClassSize,
  helloMainBytecode,
  MAX_MESSAGE_LENGTH,
  sanitizeMessage,
} from '@/simulators/journey';
import { ExhibitFrame } from '../ExhibitFrame';

type View = 'bytes' | 'bytecode';

/**
 * Chapter 2: compile Hello.java and open the class file. Everything shown is
 * real javac 25.0.4 output; changing the message changes one constant.
 */
export function CompileExhibit() {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [compiled, setCompiled] = useState<string | null>(null);
  const [compiling, setCompiling] = useState(false);
  const [view, setView] = useState<View>('bytecode');
  const reducedMotion = useReducedMotion();
  const inputId = useId();

  useEffect(() => {
    if (!compiling) return;
    const timer = window.setTimeout(
      () => {
        setCompiled(message);
        setCompiling(false);
      },
      reducedMotion ? 0 : 750,
    );
    return () => window.clearTimeout(timer);
  }, [compiling, message, reducedMotion]);

  const stale = compiled !== null && compiled !== message;
  const size = compiled !== null ? helloClassSize(compiled) : 0;

  const caption = compiling
    ? 'javac is reading Hello.java, checking it for mistakes and translating it…'
    : compiled === null
      ? 'Hello.java is text. Press “Compile with javac” to translate it.'
      : stale
        ? 'You changed the source. Hello.class still holds the old message until you compile again.'
        : `javac wrote Hello.class: ${size} bytes. It begins with the bytes CA FE BA BE, which mark it as a class file, and holds four bytecode instructions for main.`;

  return (
    <ExhibitFrame
      title="From Hello.java to Hello.class"
      caption={caption}
      note="Real data from javac 25.0.4: the size, the first bytes and the bytecode of main. The message can be up to 32 characters, without quotes or backslashes."
    >
      <div className="grid gap-3 @[620px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] @[620px]:items-stretch">
        {/* Source file */}
        <div className="rounded-lg border border-ink-600 bg-ink-900/90">
          <p className="flex items-center gap-1.5 border-b border-ink-700 px-3 py-2 text-[12.5px] text-fg-muted">
            <FileCode2 size={14} aria-hidden className="text-exec-300" />
            <span translate="no">Hello.java</span>
            <span className="text-fg-subtle">· source code</span>
          </p>
          <pre
            translate="no"
            className="overflow-x-auto p-3 font-mono text-[12.5px] leading-[1.8] text-fg-muted"
          >
            <span className="text-rt-300">public class</span> Hello {'{\n'}
            {'    '}
            <span className="text-rt-300">public static void</span> main(String[] args) {'{\n'}
            {'        '}System.out.println(
            <span className="text-ok-300">"</span>
            <label htmlFor={inputId} className="sr-only">
              Message to print
            </label>
            <input
              id={inputId}
              name="message"
              value={message}
              onChange={(event) => setMessage(sanitizeMessage(event.target.value))}
              maxLength={MAX_MESSAGE_LENGTH * 2}
              autoComplete="off"
              spellCheck={false}
              style={{ width: `calc(${Math.max(1, [...message].length)}ch + 6px)` }}
              className="max-w-[24ch] rounded-[3px] border-b border-dashed border-ok-400/70 bg-ok-900/30 px-0.5 font-mono text-ok-300 outline-none focus-visible:border-solid focus-visible:bg-ok-900/60"
            />
            <span className="text-ok-300">"</span>);{'\n'}
            {'    }\n}'}
          </pre>
        </div>

        {/* javac */}
        <div className="flex items-center justify-center gap-3 @[620px]:flex-col">
          <div
            aria-hidden
            className="relative h-1 w-16 overflow-hidden rounded-full bg-ink-700 @[620px]:h-16 @[620px]:w-1"
          >
            <span
              className={cn(
                'absolute inset-0 origin-left rounded-full bg-exec-400 @[620px]:origin-top',
                'transition-transform duration-700 ease-out',
                compiling || (compiled !== null && !stale)
                  ? 'scale-x-100 @[620px]:scale-y-100'
                  : 'scale-x-0 @[620px]:scale-y-0',
              )}
            />
          </div>
          <button
            type="button"
            onClick={() => setCompiling(true)}
            disabled={compiling}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-exec-400 bg-exec-500 px-3.5 text-[14px] font-medium whitespace-nowrap text-ink-950 transition-colors hover:bg-exec-400 disabled:opacity-60"
          >
            {compiling ? 'Compiling…' : compiled === null ? 'Compile with javac' : 'Compile again'}
          </button>
        </div>

        {/* Class file */}
        <div
          className={cn(
            'rounded-lg border bg-ink-900/90 transition-opacity',
            compiled === null ? 'border-dashed border-ink-600 opacity-60' : 'border-rt-500/50',
          )}
        >
          <p className="flex items-center gap-1.5 border-b border-ink-700 px-3 py-2 text-[12.5px] text-fg-muted">
            <FileCog size={14} aria-hidden className="text-rt-300" />
            <span translate="no">Hello.class</span>
            {compiled !== null && (
              <span className="text-fg-subtle tabular">
                · {size} bytes{stale && ' · out of date'}
              </span>
            )}
          </p>
          {compiled === null ? (
            <p className="p-3 text-[13px] text-fg-subtle">Not compiled yet.</p>
          ) : (
            <div className="p-3">
              <SegmentedControl
                label="Show"
                size="sm"
                value={view}
                onChange={setView}
                segments={[
                  { value: 'bytecode', label: 'Bytecode of main' },
                  { value: 'bytes', label: 'First bytes' },
                ]}
              />
              {view === 'bytes' ? (
                <div className="mt-3 font-mono text-[12.5px]" translate="no">
                  <div className="flex flex-wrap gap-1.5">
                    {HELLO_CLASS_HEADER.map((byte, i) => (
                      <span
                        key={i}
                        className={cn(
                          'rounded-[3px] border px-1.5 py-0.5',
                          i < 4
                            ? 'border-rt-500/60 bg-rt-900/50 text-rt-200'
                            : 'border-ink-500 bg-ink-800 text-fg-muted',
                        )}
                      >
                        {byte}
                      </span>
                    ))}
                    <span className="self-center text-fg-subtle">
                      … {size - HELLO_CLASS_HEADER.length} more
                    </span>
                  </div>
                  <ul className="mt-2.5 space-y-1 font-sans text-[13px] text-fg-muted">
                    <li>
                      <span className="text-rt-200">CA FE BA BE</span>: the magic number every class
                      file starts with.
                    </li>
                    <li>
                      <span className="text-fg">00 00 00 45</span>: class-file version 69, which
                      means Java 25.
                    </li>
                  </ul>
                </div>
              ) : (
                <ol className="mt-3 space-y-1 font-mono text-[12px] leading-relaxed" translate="no">
                  {helloMainBytecode(compiled).map((line, i) => (
                    <li
                      key={i}
                      className={cn(
                        'overflow-x-auto rounded-[3px] px-1.5 py-0.5 whitespace-pre',
                        i === 1 ? 'bg-ok-900/40 text-ok-300' : 'text-fg-muted',
                      )}
                    >
                      {line.replace(/ {2,}\/\/.*$/, '')}
                      <span className="text-fg-subtle"> {line.match(/\/\/.*$/)?.[0]}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </div>
    </ExhibitFrame>
  );
}

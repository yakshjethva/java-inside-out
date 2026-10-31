import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CodeText } from '../CodeText';
import { ExhibitFrame } from '../ExhibitFrame';

type Part = 'class' | 'main' | 'statement' | 'text';

const PARTS: Record<Part, { name: string; says: string }> = {
  class: {
    name: 'A class called Hello',
    says: 'Java code lives inside classes. This line starts a class named `Hello`; the braces { } hold everything that belongs to it.',
  },
  main: {
    name: 'The main method',
    says: 'Where the program starts. When you run `java Hello`, the JVM looks for exactly this method and runs it first.',
  },
  statement: {
    name: 'A statement',
    says: 'One instruction: print a line of text. The semicolon ends it.',
  },
  text: {
    name: 'A string',
    says: 'A piece of text, written between quotes. This is what the program will print.',
  },
};

type Segment = string | { part: Part; text: string };

const LINES: Segment[][] = [
  [{ part: 'class', text: 'public class Hello' }, ' {'],
  ['    ', { part: 'main', text: 'public static void main(String[] args)' }, ' {'],
  [
    '        ',
    { part: 'statement', text: 'System.out.println(' },
    { part: 'text', text: '"Hello!"' },
    { part: 'statement', text: ');' },
  ],
  ['    }'],
  ['}'],
];

/** Chapter 1: the parts of a first program, each one selectable. */
export function ProgramExhibit() {
  const [selected, setSelected] = useState<Part | null>(null);
  const info = selected ? PARTS[selected] : null;

  return (
    <ExhibitFrame
      title="Hello.java: a complete Java program"
      caption={
        info ? (
          <>
            <span className="font-medium text-fg">{info.name}.</span>{' '}
            <span className="text-fg-muted">
              <CodeText text={info.says} />
            </span>
          </>
        ) : (
          <span className="text-fg-muted">Select a highlighted part of the program.</span>
        )
      }
    >
      <pre
        translate="no"
        className="overflow-x-auto rounded-lg border border-ink-700 bg-ink-900/90 p-3 font-mono text-[13px] leading-[1.9] text-fg-muted @lg:text-[14.5px]"
      >
        {LINES.map((line, i) => (
          <div key={i}>
            {line.map((segment, j) =>
              typeof segment === 'string' ? (
                <span key={j}>{segment}</span>
              ) : (
                <button
                  key={j}
                  type="button"
                  aria-pressed={selected === segment.part}
                  onClick={() => setSelected(segment.part)}
                  className={cn(
                    'rounded-sm text-left underline decoration-dotted decoration-exec-500/60 underline-offset-4 transition-colors',
                    selected === segment.part
                      ? 'bg-exec-900 text-exec-200 decoration-exec-300'
                      : 'text-fg hover:bg-ink-750',
                  )}
                >
                  {segment.text}
                </button>
              ),
            )}
          </div>
        ))}
      </pre>
    </ExhibitFrame>
  );
}

import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { CodeText } from '../CodeText';
import { ExhibitFrame } from '../ExhibitFrame';
import { ReferenceArrows, type ArrowSpec } from '../ReferenceArrows';
import { StepControls } from '../StepControls';
import { useStepper } from '../useStepper';

type ObjectId = 'args' | 'person' | 'mia';
type Value = ObjectId | null;

interface Frame {
  id: 'main' | 'init';
  title: string;
  locals: { slot: number; name: string; value: Value; empty?: boolean }[];
  stack: Value[];
}

interface MemoryStep {
  instruction?: string;
  text: string;
  frames: Frame[];
  objects: ObjectId[];
  /** Value of the Person object's name field. */
  personName: Value;
}

const main = (stack: Value[], person: Value | 'unset'): Frame => ({
  id: 'main',
  title: 'main(String[] args)',
  locals: [
    { slot: 0, name: 'args', value: 'args' },
    {
      slot: 1,
      name: 'person',
      value: person === 'unset' ? null : person,
      empty: person === 'unset',
    },
  ],
  stack,
});

const init = (stack: Value[]): Frame => ({
  id: 'init',
  title: 'Person(String name)',
  locals: [
    { slot: 0, name: 'this', value: 'person' },
    { slot: 1, name: 'name', value: 'mia' },
  ],
  stack,
});

/** Verified with javap -c on Main and Person (javac 25.0.4). */
const STEPS: MemoryStep[] = [
  {
    text: '`main` is running. Its frame on the main thread’s stack holds the local variables `args` and `person`; `person` has no value yet.',
    frames: [main([], 'unset')],
    objects: ['args'],
    personName: null,
  },
  {
    instruction: 'new #7',
    text: '`new` creates a Person object in the heap, with its field `name` set to null, and pushes a reference to it onto main’s operand stack.',
    frames: [main(['person'], 'unset')],
    objects: ['args', 'person'],
    personName: null,
  },
  {
    instruction: 'dup',
    text: '`dup` copies the reference: one copy goes to the constructor, the other is kept.',
    frames: [main(['person', 'person'], 'unset')],
    objects: ['args', 'person'],
    personName: null,
  },
  {
    instruction: 'ldc #9',
    text: '`ldc` pushes a reference to the String "Mia", a constant from the class file, which lives in the heap like every object.',
    frames: [main(['person', 'person', 'mia'], 'unset')],
    objects: ['args', 'person', 'mia'],
    personName: null,
  },
  {
    instruction: 'invokespecial #11',
    text: '`invokespecial` calls the constructor. A new frame is pushed on top of main’s; the two references it takes become its local variables `this` and `name`.',
    frames: [init([]), main(['person'], 'unset')],
    objects: ['args', 'person', 'mia'],
    personName: null,
  },
  {
    instruction: 'putfield #7 (in the constructor)',
    text: 'The constructor first calls Object’s constructor, then `putfield` stores the reference to "Mia" in the object’s `name` field.',
    frames: [init([]), main(['person'], 'unset')],
    objects: ['args', 'person', 'mia'],
    personName: 'mia',
  },
  {
    instruction: 'return (from the constructor)',
    text: 'The constructor returns and its frame is removed. Main’s operand stack still holds the copy made by `dup`.',
    frames: [main(['person'], 'unset')],
    objects: ['args', 'person', 'mia'],
    personName: 'mia',
  },
  {
    instruction: 'astore_1',
    text: '`astore_1` stores the reference in local variable 1, `person`. The object stays in the heap; `person` refers to it.',
    frames: [main([], 'person')],
    objects: ['args', 'person', 'mia'],
    personName: 'mia',
  },
];

type Part = 'thread' | 'frame' | 'locals' | 'stack' | 'heap' | 'object' | 'reference';

const PARTS: Record<Part, { title: string; text: string; component: string }> = {
  thread: {
    title: 'Thread and its stack',
    text: 'A thread runs your code one instruction after another. Each thread has its own stack of frames, one for every method in progress.',
    component: 'jvm-stack',
  },
  frame: {
    title: 'Frame',
    text: 'The workspace of one method call: created when the method is called, removed when it returns.',
    component: 'stack-frame',
  },
  locals: {
    title: 'Local variables',
    text: 'Numbered slots for a method’s parameters and variables. A slot of a class type, like `person`, holds a reference, never an object.',
    component: 'local-variables',
  },
  stack: {
    title: 'Operand stack',
    text: 'Scratch space: instructions push values onto it and take values off it.',
    component: 'operand-stack',
  },
  heap: {
    title: 'Heap',
    text: 'Shared memory where objects live. Objects stay here as long as they can be reached, even after the method that created them returns.',
    component: 'heap',
  },
  object: {
    title: 'Object',
    text: 'An object holds its fields. Its field `name` holds a reference to another object, the String "Mia".',
    component: 'heap',
  },
  reference: {
    title: 'Reference',
    text: 'How the JVM finds an object. Drawn here as an arrow; in memory it is a value the JVM understands, not necessarily a raw address.',
    component: 'local-variables',
  },
};

const OBJECT_LABEL: Record<ObjectId, { type: string; detail: string }> = {
  args: { type: 'String[]', detail: 'length 0' },
  person: { type: 'Person', detail: '' },
  mia: { type: 'String', detail: '"Mia"' },
};

/** Chapter 5: `Person person = new Person("Mia");`, one instruction at a time. */
export function MemoryExhibit() {
  const stepper = useStepper(STEPS.length, 2600);
  const current = STEPS[stepper.step]!;
  const [part, setPart] = useState<Part | null>(null);
  const container = useRef<HTMLDivElement>(null);

  const arrows: ArrowSpec[] = [];
  for (const frame of current.frames) {
    frame.locals.forEach((local) => {
      if (local.value)
        arrows.push({
          from: `${frame.id}-local-${local.slot}`,
          to: `obj-${local.value}`,
          tone: local.value === 'args' ? 'muted' : 'normal',
        });
    });
    frame.stack.forEach((value, i) => {
      if (value) arrows.push({ from: `${frame.id}-stack-${i}`, to: `obj-${value}` });
    });
  }
  if (current.personName) arrows.push({ from: 'field-name', to: `obj-${current.personName}` });

  const partButton = (id: Part, label: string, className?: string) => (
    <button
      type="button"
      onClick={() => setPart(id)}
      aria-pressed={part === id}
      className={cn(
        'rounded text-left text-[12px] underline decoration-dotted underline-offset-4 hover:text-fg',
        part === id ? 'text-exec-200 decoration-exec-300' : 'text-fg-subtle decoration-ink-400',
        className,
      )}
    >
      {label}
    </button>
  );

  return (
    <ExhibitFrame
      title='Person person = new Person("Mia");'
      controls={<StepControls stepper={stepper} />}
      caption={
        <>
          {current.instruction && (
            <code translate="no" className="mr-2 font-mono text-[13px] text-exec-300">
              {current.instruction}
            </code>
          )}
          <span className="text-fg-muted">
            <CodeText text={current.text} />
          </span>
          {part && (
            <span className="mt-2 block rounded-md border border-ink-600 bg-ink-850 p-2.5 text-[14px]">
              <span className="font-medium">{PARTS[part].title}.</span>{' '}
              <span className="text-fg-muted">
                <CodeText text={PARTS[part].text} />
              </span>{' '}
              <Link
                to={`/anatomy?c=${PARTS[part].component}`}
                className="whitespace-nowrap text-exec-300 underline underline-offset-2 hover:text-exec-200"
              >
                See it on the map
              </Link>
            </span>
          )}
        </>
      }
      note="A simplified picture, not a memory map: real frames also hold a return address and other frame data, objects carry a header, and screen positions say nothing about real addresses."
    >
      <div
        ref={container}
        className="relative grid gap-x-12 gap-y-4 @[560px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
      >
        <section aria-label="Stack of the main thread">
          {partButton('thread', 'Thread main: its stack')}
          <ol className="mt-1.5 space-y-2">
            {current.frames.map((frame, index) => (
              <li
                key={frame.id}
                className={cn(
                  'rounded-lg border p-2.5 transition-colors',
                  index === 0
                    ? 'border-exec-500/60 bg-exec-900/25'
                    : 'border-ink-600 bg-ink-900/70 opacity-80',
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-mono text-[12.5px] text-fg" translate="no">
                    {frame.title}
                  </p>
                  {partButton('frame', index === 0 ? 'current frame' : 'frame')}
                </div>
                <div className="mt-2 grid gap-2 @[380px]:grid-cols-2">
                  <div>
                    {partButton('locals', 'Local variables')}
                    <ul className="mt-1 space-y-1">
                      {frame.locals.map((local) => (
                        <li
                          key={local.slot}
                          data-anchor={`${frame.id}-local-${local.slot}`}
                          className="flex items-center justify-between rounded border border-ink-600 bg-ink-850 px-2 py-1 pr-5 font-mono text-[12px]"
                          translate="no"
                        >
                          <span className="text-fg-muted">
                            {local.slot} · {local.name}
                          </span>
                          {local.empty && <span className="text-fg-subtle">—</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    {partButton('stack', 'Operand stack')}
                    <ul className="mt-1 flex min-h-[28px] flex-col-reverse gap-1">
                      {frame.stack.length === 0 ? (
                        <li className="rounded border border-dashed border-ink-600 px-2 py-1 text-[12px] text-fg-subtle">
                          empty
                        </li>
                      ) : (
                        frame.stack.map((value, i) => (
                          <li
                            key={i}
                            data-anchor={`${frame.id}-stack-${i}`}
                            className="rounded border border-ink-600 bg-ink-850 px-2 py-1 pr-5 font-mono text-[12px] text-fg-muted"
                            translate="no"
                          >
                            {value ? `ref → ${OBJECT_LABEL[value].type}` : 'null'}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-label="Heap">
          {partButton('heap', 'Heap: shared by all threads')}
          <ul className="mt-1.5 space-y-2.5">
            {current.objects.map((id) => (
              <li
                key={id}
                data-anchor={`obj-${id}`}
                className={cn(
                  'rounded-lg border p-2.5 font-mono text-[12.5px]',
                  id === 'args'
                    ? 'border-ink-600 bg-ink-900/60 text-fg-subtle'
                    : 'border-rt-500/55 bg-rt-900/30 text-fg',
                )}
                translate="no"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span>
                    {OBJECT_LABEL[id].type}{' '}
                    <span className="text-fg-subtle">{OBJECT_LABEL[id].detail}</span>
                  </span>
                  {id !== 'args' && partButton('object', 'object', 'font-sans')}
                </div>
                {id === 'person' && (
                  <p
                    data-anchor="field-name"
                    className="mt-1.5 rounded border border-ink-600 bg-ink-850 px-2 py-1 pr-5 text-[12px] text-fg-muted"
                  >
                    name {current.personName ? '' : '= null'}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3">{partButton('reference', 'What are the arrows?')}</p>
        </section>

        <ReferenceArrows container={container} arrows={arrows} version={String(stepper.step)} />
      </div>
    </ExhibitFrame>
  );
}

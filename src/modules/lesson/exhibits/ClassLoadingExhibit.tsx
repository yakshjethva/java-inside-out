import { Check, FolderOpen, Play } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CodeText } from '../CodeText';
import { ExhibitFrame } from '../ExhibitFrame';
import { StepControls } from '../StepControls';
import { useStepper } from '../useStepper';

type Place = 'path' | 'loader' | 'class';

const STEPS: { title: string; group?: 'linking'; place: Place; text: string }[] = [
  {
    title: 'Find',
    place: 'path',
    text: 'The application class loader looks for `Hello.class` on the class path: by default, the current directory.',
  },
  {
    title: 'Load',
    place: 'loader',
    text: 'It reads the bytes and creates the class `Hello` inside the JVM. The JVM keeps its description in the method area.',
  },
  {
    title: 'Verify',
    group: 'linking',
    place: 'class',
    text: 'Linking starts. The verifier checks the bytecode: every instruction is valid and works on values of the right type.',
  },
  {
    title: 'Prepare',
    group: 'linking',
    place: 'class',
    text: 'Space for the class’s static fields is set up, with default values. `Hello` has none.',
  },
  {
    title: 'Initialize',
    place: 'class',
    text: 'The class’s static initializer runs. `Hello` has none, so the class is ready straight away.',
  },
  {
    title: 'Run main',
    place: 'class',
    text: 'The JVM calls `main`. Its first instruction uses the name `System.out` for the first time, so that reference is resolved now: the last part of linking can wait until a name is first needed.',
  },
];

const STATUS = [
  { label: 'Loaded', from: 1 },
  { label: 'Verified', from: 2 },
  { label: 'Prepared', from: 3 },
  { label: 'Initialized', from: 4 },
];

/** Chapter 4: find, load, link (verify, prepare, resolve) and initialize Hello. */
export function ClassLoadingExhibit() {
  const stepper = useStepper(STEPS.length, 2200);
  const { step } = stepper;
  const current = STEPS[step]!;

  const box = (place: Place) =>
    cn(
      'rounded-lg border p-3 transition-colors',
      current.place === place
        ? 'border-exec-400 bg-exec-900/40 ring-2 ring-exec-400/30'
        : 'border-ink-600 bg-ink-900/80',
    );

  return (
    <ExhibitFrame
      title="Getting Hello ready to run"
      controls={<StepControls stepper={stepper} />}
      caption={
        <>
          <span className="font-medium">
            {current.group === 'linking' ? 'Linking: ' : ''}
            {current.title}.
          </span>{' '}
          <span className="text-fg-muted">
            <CodeText text={current.text} />
          </span>
        </>
      }
      note="Simplified: before your class, the JVM loads hundreds of its own (428 classes in our run of Hello), and resolution happens one constant at a time while the program runs."
    >
      <ol className="flex flex-wrap gap-1.5" aria-label="Stages">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => stepper.seek(i)}
              aria-current={i === step ? 'step' : undefined}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12.5px] transition-colors',
                i === step
                  ? 'border-exec-400 bg-exec-900/70 text-exec-200'
                  : i < step
                    ? 'border-ok-500/50 text-ok-300 hover:border-ok-400'
                    : 'border-ink-600 text-fg-subtle hover:text-fg',
              )}
            >
              {i < step && <Check size={12} aria-hidden />}
              {s.group === 'linking' ? `Link: ${s.title.toLowerCase()}` : s.title}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-3 grid gap-2.5 @[600px]:grid-cols-3">
        <div className={box('path')}>
          <p className="text-[12.5px] text-fg-subtle">Class path (current directory)</p>
          <p className="mt-2 flex items-center gap-2 font-mono text-[13px] text-fg" translate="no">
            <FolderOpen size={15} aria-hidden className="text-plat-400" /> ./Hello.class
          </p>
        </div>
        <div className={box('loader')}>
          <p className="text-[12.5px] text-fg-subtle">Application class loader</p>
          <p className="mt-2 text-[13px] text-fg-muted">
            {step === 0 ? 'Searching the class path…' : 'Read 410 bytes, created class Hello.'}
          </p>
        </div>
        <div className={box('class')}>
          <p className="text-[12.5px] text-fg-subtle">Method area: class Hello</p>
          {step === 0 ? (
            <p className="mt-2 text-[13px] text-fg-subtle">Not loaded yet.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-[13px]">
              {STATUS.map((status) => (
                <li
                  key={status.label}
                  className={cn(
                    'flex items-center gap-1.5',
                    step >= status.from ? 'text-ok-300' : 'text-fg-subtle',
                  )}
                >
                  {step >= status.from ? (
                    <Check size={13} aria-hidden />
                  ) : (
                    <span aria-hidden className="inline-block w-[13px] text-center">
                      ·
                    </span>
                  )}
                  {status.label}
                  <span className="sr-only">{step >= status.from ? ': done' : ': not yet'}</span>
                </li>
              ))}
              <li
                className={cn(
                  'flex items-center gap-1.5',
                  step >= 5 ? 'text-exec-300' : 'text-fg-subtle',
                )}
              >
                {step >= 5 ? (
                  <Play size={12} aria-hidden />
                ) : (
                  <span aria-hidden className="inline-block w-[13px] text-center">
                    ·
                  </span>
                )}
                main running
              </li>
            </ul>
          )}
          {step >= 1 && (
            <p className="mt-2 border-t border-ink-700 pt-2 font-mono text-[11.5px]" translate="no">
              <span className="text-fg-subtle">#7 System.out </span>
              <span className={step >= 5 ? 'text-ok-300' : 'text-warn-300'}>
                {step >= 5 ? 'resolved' : 'symbolic (not yet needed)'}
              </span>
            </p>
          )}
        </div>
      </div>
    </ExhibitFrame>
  );
}

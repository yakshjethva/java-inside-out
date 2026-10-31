import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Stepper } from './useStepper';

const buttonClass =
  'inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-md border border-ink-600 bg-ink-850 px-2 text-[13px] text-fg-muted transition-colors hover:border-ink-400 hover:text-fg disabled:opacity-40 disabled:hover:border-ink-600 disabled:hover:text-fg-muted';

/** Restart, back, play/pause, next, and "step n of N". */
export function StepControls({
  stepper,
  label = 'Step',
  className,
}: {
  stepper: Stepper;
  label?: string;
  className?: string;
}) {
  const { step, total, playing } = stepper;
  return (
    <div
      role="group"
      aria-label="Step controls"
      className={cn('flex items-center gap-1.5', className)}
    >
      <button type="button" onClick={stepper.reset} aria-label="Restart" className={buttonClass}>
        <RotateCcw size={15} aria-hidden />
      </button>
      <button
        type="button"
        onClick={stepper.previous}
        disabled={step === 0}
        aria-label="Previous step"
        className={buttonClass}
      >
        <ChevronLeft size={16} aria-hidden />
      </button>
      <button
        type="button"
        onClick={stepper.togglePlay}
        className={cn(
          buttonClass,
          'border-exec-500/70 bg-exec-900/60 px-3 text-exec-200 hover:border-exec-400 hover:text-exec-200',
        )}
      >
        {playing ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
        {playing ? 'Pause' : step >= total - 1 ? 'Replay' : step === 0 ? 'Play' : 'Continue'}
      </button>
      <button
        type="button"
        onClick={stepper.next}
        disabled={step >= total - 1}
        aria-label="Next step"
        className={buttonClass}
      >
        <ChevronRight size={16} aria-hidden />
      </button>
      <span className="ml-1 text-[12.5px] text-fg-subtle tabular">
        {label} {step + 1} of {total}
      </span>
    </div>
  );
}

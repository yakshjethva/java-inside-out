import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { IconButton } from '@/components/ui/Button';
import { PLAYBACK_SPEEDS, type PlaybackSpeed } from '@/simulators/playback';

/** Play, pause, previous, next, reset and speed for a step timeline. */
export function StepController({
  step,
  total,
  playing,
  speed,
  onPrevious,
  onNext,
  onReset,
  onTogglePlay,
  onSpeed,
}: {
  step: number;
  total: number;
  playing: boolean;
  speed: PlaybackSpeed;
  onPrevious: () => void;
  onNext: () => void;
  onReset: () => void;
  onTogglePlay: () => void;
  onSpeed: (speed: PlaybackSpeed) => void;
}) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label="Playback controls">
      <IconButton label="Reset to first step" onClick={onReset}>
        <RotateCcw size={15} aria-hidden />
      </IconButton>
      <IconButton
        label="Previous step"
        onClick={onPrevious}
        disabled={step === 0}
        className="disabled:opacity-40"
      >
        <SkipBack size={15} aria-hidden />
      </IconButton>
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-exec-400 bg-exec-500 px-3 text-[13px] font-medium text-ink-950 hover:bg-exec-400"
      >
        {playing ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
        {playing ? 'Pause' : 'Play'}
      </button>
      <IconButton
        label="Next step"
        onClick={onNext}
        disabled={step >= total - 1}
        className="disabled:opacity-40"
      >
        <SkipForward size={15} aria-hidden />
      </IconButton>
      <label className="ml-1 flex items-center gap-1.5 text-[12px] text-fg-subtle">
        <span className="sr-only sm:not-sr-only">Speed</span>
        <select
          value={speed}
          onChange={(event) => onSpeed(Number(event.target.value) as PlaybackSpeed)}
          className="h-8 rounded-md border border-ink-600 bg-ink-850 px-1.5 text-[12.5px] text-fg"
        >
          {PLAYBACK_SPEEDS.map((value) => (
            <option key={value} value={value}>
              {value}×
            </option>
          ))}
        </select>
      </label>
      <span className="ml-1 font-mono text-[12px] text-fg-subtle tabular" aria-live="polite">
        {step + 1} / {total}
      </span>
    </div>
  );
}

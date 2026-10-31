import { CircleCheck, CircleDot, Lightbulb } from 'lucide-react';
import { useId } from 'react';
import { RichText } from '@/components/learning/RichText';
import { cn } from '@/lib/cn';
import type { Prediction } from '@/types/lesson';

/**
 * Asks the learner to commit to a prediction before anything is shown. Once
 * they choose, the answer is revealed with an explanation either way.
 */
export function PredictionCard({
  prediction,
  chosen,
  revealed,
  onChoose,
  onSkip,
}: {
  prediction: Prediction;
  chosen: string | null;
  revealed: boolean;
  onChoose: (optionId: string) => void;
  onSkip: () => void;
}) {
  const name = useId();
  const chosenOption = prediction.options.find((o) => o.id === chosen);
  const correct = prediction.options.find((o) => o.correct)!;

  return (
    <fieldset className="rounded-xl border border-exec-500/40 bg-exec-900/15 p-4 sm:p-5">
      <legend className="sr-only">Make a prediction</legend>
      <p className="flex items-center gap-2 text-[13.5px] font-medium text-exec-300">
        <Lightbulb size={16} aria-hidden /> Make a prediction
      </p>
      <RichText className="prose-ij reading mt-1.5 text-fg" text={prediction.prompt} />
      <div className="mt-3 grid gap-2">
        {prediction.options.map((option) => {
          const isChosen = option.id === chosen;
          return (
            <label
              key={option.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border px-3.5 py-2.5 text-[15.5px] transition-colors',
                revealed
                  ? option.correct
                    ? 'border-ok-500/60 bg-ok-900/30'
                    : isChosen
                      ? 'border-warn-500/50 bg-warn-900/20'
                      : 'border-ink-700 opacity-70'
                  : 'cursor-pointer border-ink-600 bg-ink-900/60 hover:border-exec-400',
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={isChosen}
                disabled={revealed}
                onChange={() => onChoose(option.id)}
                className="mt-1.5 accent-[var(--color-exec-500)]"
              />
              <span className="flex-1">
                <RichText className="prose-ij text-[15.5px] text-fg" text={option.text} />
              </span>
              {revealed && option.correct && (
                <span className="flex shrink-0 items-center gap-1 text-[13px] text-ok-300">
                  <CircleCheck size={16} aria-hidden /> What happens
                </span>
              )}
              {revealed && isChosen && !option.correct && (
                <span className="flex shrink-0 items-center gap-1 text-[13px] text-warn-300">
                  <CircleDot size={16} aria-hidden /> Your guess
                </span>
              )}
            </label>
          );
        })}
      </div>
      {revealed ? (
        <div aria-live="polite" className="mt-3 text-[15px] text-fg-muted">
          {chosenOption ? (
            <RichText className="prose-ij reading" text={chosenOption.feedback} />
          ) : (
            <RichText className="prose-ij reading" text={correct.feedback} />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onSkip}
          className="mt-3 text-[13.5px] text-fg-subtle underline underline-offset-2 hover:text-fg"
        >
          Skip the prediction and show me
        </button>
      )}
    </fieldset>
  );
}

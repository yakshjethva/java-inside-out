import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EXPLANATION_LEVELS, type ExplanationLevel } from '@/hooks/useLearningState';

/** The three explanation levels as a radio group. Arrow keys move between levels. */
export function LevelSwitch({
  value,
  onChange,
  size = 'sm',
  className,
}: {
  value: ExplanationLevel;
  onChange: (level: ExplanationLevel) => void;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <SegmentedControl
      label="Explanation level"
      value={value}
      onChange={onChange}
      size={size}
      className={className}
      segments={EXPLANATION_LEVELS.map(({ value, label, description }) => ({
        value,
        label,
        description,
      }))}
    />
  );
}

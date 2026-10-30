import { Settings2 } from 'lucide-react';
import { useId, useState } from 'react';
import { Popover } from '@/components/learning/Popover';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { progressActions, usePreferences } from '@/hooks/useLearningState';

/** Learning preferences: explanation level and motion. Stored only in this browser. */
export function SettingsMenu() {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  const { preferences, setLevel, setMotion } = usePreferences();
  const titleId = useId();

  return (
    <>
      <button
        ref={setAnchor}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-fg-muted hover:bg-ink-750 hover:text-fg"
      >
        <Settings2 size={16} aria-hidden />
        <span className="hidden sm:inline">
          {preferences.level === 'beginner' ? 'Beginner' : 'Technical'}
        </span>
        <span className="sr-only sm:hidden">Learning preferences</span>
      </button>
      <Popover
        anchor={anchor}
        open={open}
        onClose={() => setOpen(false)}
        labelledBy={titleId}
        width={320}
      >
        <div className="space-y-4 p-4">
          <h2 id={titleId} className="font-serif text-lg text-fg">
            Learning preferences
          </h2>
          <div>
            <p className="mb-1.5 text-[13px] text-fg-muted">Explanation level</p>
            <SegmentedControl
              label="Explanation level"
              value={preferences.level}
              onChange={setLevel}
              segments={[
                {
                  value: 'beginner',
                  label: 'Beginner',
                  description: 'Plain language, no JVM knowledge assumed',
                },
                {
                  value: 'technical',
                  label: 'Technical',
                  description: 'Exact terminology and implementation detail',
                },
              ]}
            />
          </div>
          <div>
            <p className="mb-1.5 text-[13px] text-fg-muted">Motion</p>
            <SegmentedControl
              label="Motion"
              value={preferences.motion}
              onChange={setMotion}
              size="sm"
              segments={[
                {
                  value: 'system',
                  label: 'System',
                  description: 'Follow the operating system setting',
                },
                { value: 'reduce', label: 'Reduce', description: 'Minimise animation' },
                { value: 'allow', label: 'Allow', description: 'Always animate' },
              ]}
            />
          </div>
          <div className="border-t border-ink-600 pt-3 text-[12.5px] text-fg-subtle">
            <p>
              Progress, bookmarks and preferences are stored only in this browser (localStorage).
              Nothing is sent anywhere.
            </p>
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    'Clear explored components, bookmarks and quiz results stored in this browser?',
                  )
                ) {
                  progressActions.reset();
                }
              }}
              className="mt-2 rounded border border-ink-500 px-2 py-1 text-fg-muted hover:border-warn-500/60 hover:text-warn-300"
            >
              Clear my progress
            </button>
          </div>
        </div>
      </Popover>
    </>
  );
}

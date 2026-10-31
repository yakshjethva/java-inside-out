import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { JVM_REGIONS, type JvmRegion } from '@/content/jvm/regions';
import { cn } from '@/lib/cn';
import { ExhibitFrame } from '../ExhibitFrame';

const TONE_CLASSES = {
  rt: {
    idle: 'border-rt-500/45 bg-rt-900/30 hover:border-rt-400',
    on: 'border-rt-300 bg-rt-900/80 ring-2 ring-rt-400/40',
    text: 'text-rt-200',
  },
  exec: {
    idle: 'border-exec-500/45 bg-exec-900/30 hover:border-exec-400',
    on: 'border-exec-300 bg-exec-900/80 ring-2 ring-exec-400/40',
    text: 'text-exec-200',
  },
  plat: {
    idle: 'border-dotted border-plat-500/70 bg-ink-850 hover:border-plat-400',
    on: 'border-dotted border-plat-400 bg-ink-800 ring-2 ring-plat-400/40',
    text: 'text-plat-400',
  },
};

function RegionButton({
  region,
  selected,
  onSelect,
  className,
}: {
  region: JvmRegion;
  selected: boolean;
  onSelect: () => void;
  className?: string;
}) {
  const tone = TONE_CLASSES[region.family];
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'rounded-lg border px-3 py-2.5 text-left transition-colors',
        selected ? tone.on : tone.idle,
        className,
      )}
    >
      <span className={cn('block text-[14.5px] font-semibold', tone.text)}>{region.title}</span>
      <span className="mt-0.5 block text-[12.5px] leading-snug text-fg-muted">{region.blurb}</span>
    </button>
  );
}

/** Chapter 3: the five main parts of the JVM, and the platform it runs on. */
export function JvmPartsExhibit() {
  const [selected, setSelected] = useState<string | null>(null);
  const region = JVM_REGIONS.find((r) => r.id === selected);
  const byId = (id: string) => JVM_REGIONS.find((r) => r.id === id)!;
  const button = (id: string, className?: string) => (
    <RegionButton
      region={byId(id)}
      selected={selected === id}
      onSelect={() => setSelected(id)}
      className={className}
    />
  );

  return (
    <ExhibitFrame
      title="Inside the Java Virtual Machine"
      caption={
        region ? (
          <span>
            <span className="font-medium">{region.title}.</span>{' '}
            <span className="text-fg-muted">{region.role}</span>{' '}
            <Link
              to={`/anatomy?c=${region.id}`}
              className="inline-flex items-center gap-1 whitespace-nowrap text-exec-300 underline underline-offset-2 hover:text-exec-200"
            >
              Find it on the full map <ArrowRight size={13} aria-hidden />
            </Link>
          </span>
        ) : (
          <span className="text-fg-muted">Select a part of the JVM.</span>
        )
      }
      note="Five main parts of HotSpot, simplified. The specification defines what these parts do, not how they are arranged; the full map has 66 components."
    >
      <div className="flex items-center gap-2 text-[12.5px] text-fg-muted">
        <span
          translate="no"
          className="rounded-[4px] border border-rt-500/50 bg-ink-850 px-2 py-0.5 font-mono text-rt-200"
        >
          Hello.class
        </span>
        <span aria-hidden>↓</span>
        <span>enters the JVM</span>
      </div>
      <div className="mt-2 rounded-xl border border-rt-500/40 bg-rt-900/10 p-2.5">
        <p className="px-1 pb-2 text-[12.5px] text-fg-subtle">Java Virtual Machine</p>
        <div className="grid gap-2 @[560px]:grid-cols-3">
          {button('class-loader-subsystem')}
          {button('runtime-data-areas', '@[560px]:row-span-2')}
          {button('execution-engine')}
          {button('garbage-collector')}
          {button('native-interface')}
        </div>
      </div>
      <div className="mt-2">{button('platform', 'w-full')}</div>
    </ExhibitFrame>
  );
}

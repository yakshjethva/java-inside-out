import {
  ArrowDownLeft,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  CircleCheck,
  Microscope,
  TriangleAlert,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { CodeBlock } from '@/components/code/CodeBlock';
import { AccuracyNote } from '@/components/learning/AccuracyNote';
import { InlineRichText, RichText } from '@/components/learning/RichText';
import { SourceList } from '@/components/learning/SourceReference';
import { Badge } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EDGE_STYLES } from '@/components/diagrams/edgeStyles';
import type { ExplanationLevel } from '@/hooks/useLearningState';
import { cn } from '@/lib/cn';
import type { ComponentDoc, Relationship } from '@/types/content';

export interface InspectorLink {
  id: string;
  name: string;
  summary?: string;
}

export interface InspectorConnection {
  rel: Relationship;
  other: InspectorLink;
}

export interface ComponentInspectorProps {
  doc: ComponentDoc;
  ancestry: InspectorLink[];
  parts: InspectorLink[];
  outgoing: InspectorConnection[];
  incoming: InspectorConnection[];
  level: ExplanationLevel;
  onLevelChange: (level: ExplanationLevel) => void;
  onNavigate: (id: string) => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  understood: boolean;
  onToggleUnderstood: () => void;
  onDissect?: () => void;
  onClose?: () => void;
  headingId?: string;
}

const PROVENANCE_BADGE = {
  spec: { tone: 'rt' as const, text: 'JVM specification', dashed: false },
  hotspot: { tone: 'exec' as const, text: 'HotSpot · JDK 25', dashed: true },
  platform: { tone: 'plat' as const, text: 'Outside the JVM', dashed: false },
};

const SCOPE_TEXT: Record<string, string> = {
  shared: 'Shared by all threads',
  'per-thread': 'One per thread',
  'per-class': 'One per class',
  process: 'Process level',
  build: 'Build time',
};

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('border-t border-ink-700 px-5 py-4', className)}>
      <h3 className="kicker mb-2">{title}</h3>
      {children}
    </section>
  );
}

/**
 * Detail panel for one anatomy component. Data-driven: every field comes
 * from the content layer, so the same inspector serves every plate.
 */
export function ComponentInspector({
  doc,
  ancestry,
  parts,
  outgoing,
  incoming,
  level,
  onLevelChange,
  onNavigate,
  bookmarked,
  onToggleBookmark,
  understood,
  onToggleUnderstood,
  onDissect,
  onClose,
  headingId,
}: ComponentInspectorProps) {
  const provenance = PROVENANCE_BADGE[doc.provenance];

  return (
    <article aria-labelledby={headingId} className="text-[14px]">
      <header className="px-5 pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <nav aria-label="Component breadcrumb" className="min-w-0">
            <ol className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-[12px] text-fg-subtle">
              {ancestry.map((item, index) => (
                <li key={item.id} className="flex items-center gap-1">
                  {index > 0 && <ChevronRight size={11} aria-hidden className="text-ink-400" />}
                  {index === ancestry.length - 1 ? (
                    <span aria-current="location" className="text-fg-muted">
                      {item.name}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className="rounded hover:text-exec-200 hover:underline"
                    >
                      {item.name}
                    </button>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close inspector"
              className="-mt-1 -mr-2 rounded p-1.5 text-fg-subtle hover:bg-ink-700 hover:text-fg"
            >
              <X size={16} aria-hidden />
            </button>
          )}
        </div>

        <h2 id={headingId} className="mt-2 font-serif text-[27px] leading-[1.15] text-fg">
          {doc.name}
        </h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge tone={provenance.tone} dashed={provenance.dashed}>
            {provenance.text}
          </Badge>
          {doc.scope && <Badge>{SCOPE_TEXT[doc.scope]}</Badge>}
          {doc.version && doc.provenance !== 'hotspot' && <Badge>{doc.version}</Badge>}
        </div>
        <p className="mt-3 text-[14.5px] leading-relaxed text-fg-muted">
          <InlineRichText text={doc.summary} />
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <SegmentedControl
            label="Explanation level"
            size="sm"
            value={level}
            onChange={onLevelChange}
            segments={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'technical', label: 'Technical' },
            ]}
          />
          <button
            type="button"
            onClick={onToggleBookmark}
            aria-pressed={bookmarked}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[12.5px]',
              bookmarked
                ? 'border-exec-500/60 bg-exec-900/60 text-exec-200'
                : 'border-ink-600 text-fg-muted hover:text-fg',
            )}
          >
            {bookmarked ? (
              <BookmarkCheck size={14} aria-hidden />
            ) : (
              <Bookmark size={14} aria-hidden />
            )}
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
          <button
            type="button"
            onClick={onToggleUnderstood}
            aria-pressed={understood}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[12.5px]',
              understood
                ? 'border-ok-500/60 bg-ok-900/60 text-ok-300'
                : 'border-ink-600 text-fg-muted hover:text-fg',
            )}
          >
            <CircleCheck size={14} aria-hidden />
            {understood ? 'Understood' : 'Mark understood'}
          </button>
          {onDissect && (
            <button
              type="button"
              onClick={onDissect}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-ink-600 px-2.5 text-[12.5px] text-fg-muted hover:border-rt-500/60 hover:text-rt-200"
            >
              <Microscope size={14} aria-hidden /> Dissect
            </button>
          )}
        </div>
      </header>

      <Section title={level === 'beginner' ? 'In plain words' : 'Technical explanation'}>
        <RichText className="prose-ij" text={level === 'beginner' ? doc.beginner : doc.technical} />
      </Section>

      <Section title="What it is for">
        <RichText className="prose-ij" text={doc.purpose} />
      </Section>

      {doc.specVsImpl && (
        <Section title="Specification vs implementation">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-md border border-rt-500/30 bg-rt-900/30 p-3">
              <p className="font-mono text-[10.5px] tracking-wider text-rt-300 uppercase">
                JVM specification
              </p>
              <RichText className="prose-ij mt-1 text-[13.5px]" text={doc.specVsImpl.spec} />
            </div>
            <div className="rounded-md border border-dashed border-exec-500/40 bg-exec-900/30 p-3">
              <p className="font-mono text-[10.5px] tracking-wider text-exec-300 uppercase">
                HotSpot · JDK 25
              </p>
              <RichText
                className="prose-ij mt-1 text-[13.5px]"
                text={doc.specVsImpl.implementation}
              />
            </div>
          </div>
        </Section>
      )}

      <Section title="Internal structure">
        <RichText className="prose-ij" text={doc.internals.map((item) => `- ${item}`).join('\n')} />
        {parts.length > 0 && (
          <div className="mt-3">
            <p className="text-[12.5px] text-fg-subtle">Parts in this atlas</p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {parts.map((part) => (
                <li key={part.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(part.id)}
                    title={part.summary}
                    className="rounded border border-ink-600 bg-ink-800 px-2 py-1 text-[12.5px] text-fg-muted hover:border-rt-500/60 hover:text-rt-200"
                  >
                    {part.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section title="Inputs and outputs">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 flex items-center gap-1 text-[12.5px] text-fg-subtle">
              <ArrowDownLeft size={13} aria-hidden /> Inputs
            </p>
            <RichText
              className="prose-ij text-[13.5px]"
              text={doc.inputs.map((item) => `- ${item}`).join('\n')}
            />
          </div>
          <div>
            <p className="mb-1 flex items-center gap-1 text-[12.5px] text-fg-subtle">
              <ArrowUpRight size={13} aria-hidden /> Outputs
            </p>
            <RichText
              className="prose-ij text-[13.5px]"
              text={doc.outputs.map((item) => `- ${item}`).join('\n')}
            />
          </div>
        </div>
      </Section>

      {(outgoing.length > 0 || incoming.length > 0) && (
        <Section title={`Connections (${outgoing.length + incoming.length})`}>
          <ConnectionList
            title="This component →"
            items={outgoing}
            direction="out"
            name={doc.name}
            onNavigate={onNavigate}
          />
          <ConnectionList
            title="→ This component"
            items={incoming}
            direction="in"
            name={doc.name}
            onNavigate={onNavigate}
          />
        </Section>
      )}

      {doc.example && (
        <Section title="Practical example">
          <CodeBlock
            code={doc.example.code}
            language={doc.example.language}
            title={doc.example.title}
            output={doc.example.output}
            verifiedWith={doc.example.verifiedWith}
          />
        </Section>
      )}

      <Section title="In practice">
        <RichText className="prose-ij" text={doc.practice} />
        {doc.errors && doc.errors.length > 0 && (
          <ul className="mt-3 space-y-2">
            {doc.errors.map((error) => (
              <li
                key={error.name}
                className="flex gap-2 rounded-md border border-warn-500/30 bg-warn-900/25 p-2.5"
              >
                <TriangleAlert size={15} aria-hidden className="mt-0.5 shrink-0 text-warn-400" />
                <div className="text-[13px]">
                  <code className="font-mono text-warn-300">{error.name}</code>
                  <span className="text-fg-muted">
                    {' '}
                    — <InlineRichText text={error.when} />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {doc.misconceptions.length > 0 && (
        <Section title="Common misconceptions">
          <ul className="space-y-3">
            {doc.misconceptions.map((item) => (
              <li key={item.myth}>
                <p className="flex gap-2 text-[13.5px] text-warn-300">
                  <span aria-hidden className="font-mono">
                    ✗
                  </span>
                  <span>
                    <span className="sr-only">Misconception: </span>
                    {item.myth}
                  </span>
                </p>
                <div className="mt-1 flex gap-2">
                  <span aria-hidden className="font-mono text-[13.5px] text-ok-400">
                    ✓
                  </span>
                  <RichText className="prose-ij text-[13.5px]" text={item.truth} />
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {doc.accuracyNote && (
        <div className="border-t border-ink-700 px-5 py-4">
          <AccuracyNote text={doc.accuracyNote} compact />
        </div>
      )}

      <Section title="Sources">
        <SourceList citations={doc.references} />
      </Section>
    </article>
  );
}

function ConnectionList({
  title,
  items,
  direction,
  name,
  onNavigate,
}: {
  title: string;
  items: InspectorConnection[];
  direction: 'in' | 'out';
  name: string;
  onNavigate: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-1.5 text-[12.5px] text-fg-subtle">{title}</p>
      <ul className="space-y-1.5">
        {items.map(({ rel, other }) => {
          const style = EDGE_STYLES[rel.kind];
          return (
            <li key={rel.id} className="rounded-md border border-ink-700 bg-ink-850/70 p-2.5">
              <p className="flex flex-wrap items-baseline gap-x-1.5 text-[13.5px] leading-snug">
                <svg width="22" height="8" aria-hidden className="shrink-0 self-center">
                  <line
                    x1="0"
                    y1="4"
                    x2="16"
                    y2="4"
                    stroke={style.color}
                    strokeWidth="1.6"
                    strokeDasharray={style.dash}
                  />
                  <path d="M15 1 L21 4 L15 7 Z" fill={style.color} />
                </svg>
                {direction === 'out' ? (
                  <>
                    <span className="text-fg-muted">{name}</span>
                    <span className="text-fg">{rel.label}</span>
                    <button
                      type="button"
                      onClick={() => onNavigate(other.id)}
                      className="font-medium text-exec-200 underline decoration-exec-500/40 underline-offset-2 hover:decoration-exec-300"
                    >
                      {other.name}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onNavigate(other.id)}
                      className="font-medium text-exec-200 underline decoration-exec-500/40 underline-offset-2 hover:decoration-exec-300"
                    >
                      {other.name}
                    </button>
                    <span className="text-fg">{rel.label}</span>
                    <span className="text-fg-muted">{name}</span>
                  </>
                )}
                <span className="sr-only">({style.label})</span>
              </p>
              <RichText className="prose-ij mt-1 text-[13px]" text={rel.description} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

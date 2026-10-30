import {
  Boxes,
  Crosshair,
  Info,
  Layers,
  ListTree,
  Microscope,
  Play,
  Scan,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnatomyCanvas, type CanvasHandle } from '@/components/anatomy/AnatomyCanvas';
import { ComponentTree, type TreeItem } from '@/components/anatomy/ComponentTree';
import { Legend } from '@/components/anatomy/Legend';
import { DiagramDefs } from '@/components/diagrams/DiagramDefs';
import { ComponentInspector } from '@/components/inspector/ComponentInspector';
import { Popover } from '@/components/learning/Popover';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import {
  ancestry,
  childrenOf,
  COMPONENTS,
  getComponentDoc,
  ROOT_COMPONENTS,
  type ComponentId,
} from '@/content/jvm';
import { relationshipsOf } from '@/content/jvm/relationships';
import { SCENARIOS } from '@/content/jvm/scenarios';
import { progressActions, usePreferences, useProgress } from '@/hooks/useLearningState';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { inflate, unionRect, type Rect } from '@/lib/geometry';
import { cn } from '@/lib/cn';
import type { Provenance } from '@/types/content';
import { AnatomyPlate, type ExecutionOverlay } from './AnatomyPlate';
import { ExecutionPanel } from './ExecutionPanel';
import { InternalView } from './internals/InternalView';
import { buildScene, PART_NUMBER } from './scene';
import { useAnatomyState, type ExplorerMode } from './useAnatomyState';

const modeLabel = (icon: React.ReactNode, text: string) => (
  <>
    {icon}
    <span className="hidden min-[460px]:inline">{text}</span>
    <span className="sr-only min-[460px]:hidden">{text}</span>
  </>
);

const MODE_SEGMENTS: { value: ExplorerMode; label: React.ReactNode; description: string }[] = [
  {
    value: 'anatomy',
    label: modeLabel(<Boxes size={14} aria-hidden />, 'Anatomy'),
    description: 'The complete architecture',
  },
  {
    value: 'exploded',
    label: modeLabel(<Scan size={14} aria-hidden />, 'Exploded'),
    description: 'Components separated and numbered',
  },
  {
    value: 'internal',
    label: modeLabel(<Microscope size={14} aria-hidden />, 'Internal'),
    description: 'Dissection of the selected component',
  },
  {
    value: 'execution',
    label: modeLabel(<Play size={14} aria-hidden />, 'Execution'),
    description: 'Watch operations move through the JVM',
  },
];

function buildTree(id: ComponentId): TreeItem {
  const doc = COMPONENTS[id];
  return {
    id,
    name: doc.name,
    provenance: doc.provenance,
    children: childrenOf(id).map((child) => buildTree(child.id)),
  };
}

interface LayerState {
  hotspot: boolean;
  platform: boolean;
  edges: boolean;
  parts: boolean;
}

export function AnatomyExplorer() {
  const state = useAnatomyState();
  const { selectedId, mode, scenario, step } = state;
  const { preferences, setLevel } = usePreferences();
  const progress = useProgress();
  const reducedMotion = useReducedMotion();
  const wide = useMediaQuery('(min-width: 1280px)', true);
  const canvasRef = useRef<CanvasHandle>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  const [hoveredId, setHoveredId] = useState<ComponentId | null>(null);
  const [hoverRect, setHoverRect] = useState<(Rect & { areaWidth: number }) | null>(null);
  const [collapsed, setCollapsed] = useState<Set<ComponentId>>(() => new Set());
  const [layers, setLayers] = useState<LayerState>({
    hotspot: true,
    platform: true,
    edges: true,
    parts: true,
  });
  const [treeOpen, setTreeOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [layersAnchor, setLayersAnchor] = useState<HTMLButtonElement | null>(null);
  const [layersOpen, setLayersOpen] = useState(false);
  const [follow, setFollow] = useState(true);
  const [focus, setFocus] = useState<{ rect: Rect; key: string; maxZoom?: number } | null>(null);

  const hiddenProvenance = useMemo(() => {
    const hidden = new Set<Provenance>();
    if (!layers.hotspot) hidden.add('hotspot');
    if (!layers.platform) hidden.add('platform');
    return hidden;
  }, [layers.hotspot, layers.platform]);

  const diagramMode = mode === 'exploded' ? 'exploded' : 'anatomy';
  const scene = useMemo(
    () => buildScene({ mode: diagramMode, collapsed, hiddenProvenance }),
    [diagramMode, collapsed, hiddenProvenance],
  );

  const currentStep = scenario.steps[step]!;
  const execution: ExecutionOverlay | null = useMemo(() => {
    if (mode !== 'execution') return null;
    return {
      key: `${scenario.id}:${currentStep.id}`,
      active: new Set(currentStep.active),
      states: currentStep.states ?? {},
      flows: currentStep.flows ?? [],
      frame: currentStep.frame ?? null,
    };
  }, [mode, scenario.id, currentStep]);

  const tree = useMemo(() => ROOT_COMPONENTS.map(buildTree), []);

  // Record exploration progress for the selected component.
  useEffect(() => {
    if (!selectedId) return;
    const doc = getComponentDoc(selectedId);
    progressActions.markExplored(
      { key: `anatomy:${selectedId}`, title: doc.name, href: `/anatomy?c=${selectedId}` },
      selectedId,
    );
  }, [selectedId]);

  useEffect(() => {
    if (mode === 'execution') progressActions.recordScenarioStep(scenario.id, step + 1);
  }, [mode, scenario.id, step]);

  // Camera: in execution mode it follows the active components of the current step.
  const executionFocus = useMemo(() => {
    if (mode !== 'execution' || !follow) return null;
    const target = unionRect(currentStep.active.map((id) => scene.rects[id]).filter(Boolean));
    return target
      ? { rect: inflate(target, 70), key: `${scenario.id}:${currentStep.id}`, maxZoom: 1.25 }
      : null;
  }, [mode, follow, currentStep, scenario.id, scene.rects]);
  const cameraFocus = executionFocus ?? focus;

  // Camera: bring a newly selected component into a readable view when it is too small or off-screen.
  const ensureVisible = useCallback(
    (id: ComponentId, force = false) => {
      const handle = canvasRef.current;
      const area = canvasAreaRef.current;
      const rect = scene.rects[id];
      if (!handle || !area || !rect) return;
      const screen = handle.toScreen(rect);
      const { width, height } = area.getBoundingClientRect();
      const offscreen =
        screen.x + screen.w < 0 || screen.y + screen.h < 0 || screen.x > width || screen.y > height;
      const tiny = handle.getTransform().k < 0.55 || screen.w < 70 || screen.h < 26;
      if (force || offscreen || tiny)
        setFocus({
          rect: inflate(rect, Math.max(40, rect.w * 0.35)),
          key: `${id}:${Date.now()}`,
          maxZoom: 1.5,
        });
    },
    [scene.rects],
  );

  // A component selected through the URL is brought into view once the canvas has measured itself.
  const initialSelection = useRef(selectedId);
  useEffect(() => {
    const id = initialSelection.current;
    if (!id || mode === 'internal') return;
    const timer = window.setTimeout(() => ensureVisible(id), 250);
    return () => window.clearTimeout(timer);
    // Only for the selection present on first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = useCallback(
    (id: ComponentId | null) => {
      state.select(id);
      setHoveredId(null);
    },
    [state],
  );

  const navigate = useCallback(
    (id: string) => {
      const componentId = id as ComponentId;
      select(componentId);
      if (mode === 'execution') state.setMode('anatomy');
      window.setTimeout(() => ensureVisible(componentId), 0);
    },
    [select, mode, state, ensureVisible],
  );

  const onCanvasSelect = (id: ComponentId | null) => {
    select(id);
    if (id) ensureVisible(id);
    if (id && !wide) {
      window.setTimeout(
        () =>
          inspectorRef.current?.scrollIntoView({
            behavior: reducedMotion ? 'auto' : 'smooth',
            block: 'start',
          }),
        50,
      );
    }
  };

  const onHover = (id: ComponentId | null) => {
    setHoveredId(id);
    if (id && canvasRef.current) {
      setHoverRect({
        ...canvasRef.current.toScreen(scene.rects[id]),
        areaWidth: canvasAreaRef.current?.clientWidth ?? 800,
      });
    } else setHoverRect(null);
  };

  const toggleCollapse = (id: ComponentId) =>
    setCollapsed((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectedDoc = selectedId ? getComponentDoc(selectedId) : null;
  const relations = selectedId ? relationshipsOf(selectedId) : null;
  const bookmarkKey = selectedId ? `anatomy:${selectedId}` : '';
  const hoveredDoc = hoveredId ? getComponentDoc(hoveredId) : null;
  const subsystemIds: ComponentId[] = [
    'class-loader-subsystem',
    'runtime-data-areas',
    'execution-engine',
    'garbage-collector',
    'native-interface',
  ];

  const sidePanel =
    mode === 'execution' ? (
      <ExecutionPanel
        scenario={scenario}
        step={step}
        level={preferences.level}
        onLevelChange={setLevel}
        onScenario={state.setScenario}
        onStep={state.setStep}
        onNavigate={navigate}
        furthest={(progress.scenarios[scenario.id] ?? 1) - 1}
        follow={follow}
        onFollow={setFollow}
      />
    ) : selectedDoc && selectedId && relations ? (
      <>
        <ComponentInspector
          doc={selectedDoc}
          headingId={headingId}
          ancestry={ancestry(selectedId).map((d) => ({ id: d.id, name: d.name }))}
          parts={childrenOf(selectedId).map((d) => ({
            id: d.id,
            name: d.name,
            summary: d.summary,
          }))}
          outgoing={relations.outgoing.map((rel) => ({
            rel,
            other: { id: rel.to, name: getComponentDoc(rel.to).name },
          }))}
          incoming={relations.incoming.map((rel) => ({
            rel,
            other: { id: rel.from, name: getComponentDoc(rel.from).name },
          }))}
          level={preferences.level}
          onLevelChange={setLevel}
          onNavigate={navigate}
          bookmarked={progress.bookmarks.some((b) => b.key === bookmarkKey)}
          onToggleBookmark={() =>
            progressActions.toggleBookmark({
              key: bookmarkKey,
              title: selectedDoc.name,
              href: `/anatomy?c=${selectedId}`,
            })
          }
          understood={selectedId in progress.understood}
          onToggleUnderstood={() => progressActions.toggleUnderstood(selectedId)}
          onDissect={mode === 'internal' ? undefined : () => state.setMode('internal')}
          onClose={() => select(null)}
        />
        {childrenOf(selectedId).length > 0 && mode !== 'internal' && (
          <div className="border-t border-ink-700 px-5 py-3">
            <button
              type="button"
              onClick={() => toggleCollapse(selectedId)}
              className="rounded border border-ink-600 px-2.5 py-1 text-[12.5px] text-fg-muted hover:text-fg"
            >
              {collapsed.has(selectedId)
                ? 'Expand parts in the diagram'
                : 'Collapse parts in the diagram'}
            </button>
          </div>
        )}
      </>
    ) : (
      <WelcomePanel mode={mode} onSelect={navigate} />
    );

  return (
    <section
      aria-label="JVM anatomy explorer"
      className="flex flex-col xl:h-[calc(100dvh-104px)] xl:min-h-[600px]"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-700 bg-ink-950 px-3 py-2 sm:px-4">
        <SegmentedControl
          label="Diagram mode"
          value={mode}
          onChange={state.setMode}
          segments={MODE_SEGMENTS}
        />
        {mode === 'execution' && (
          <label className="flex items-center gap-2 text-[12.5px] text-fg-subtle">
            <span className="sr-only sm:not-sr-only">Scenario</span>
            <select
              value={scenario.id}
              onChange={(event) => state.setScenario(event.target.value)}
              className="h-9 max-w-[260px] rounded-md border border-ink-600 bg-ink-850 px-2 text-[13px] text-fg"
            >
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title.replace(/`/g, '')}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <ToolbarButton
            pressed={treeOpen}
            onClick={() => setTreeOpen((v) => !v)}
            icon={<ListTree size={15} aria-hidden />}
          >
            Components
          </ToolbarButton>
          <ToolbarButton
            buttonRef={setLayersAnchor}
            pressed={layersOpen}
            onClick={() => setLayersOpen((v) => !v)}
            icon={<Layers size={15} aria-hidden />}
            haspopup
          >
            Layers
          </ToolbarButton>
          <ToolbarButton
            pressed={legendOpen}
            onClick={() => setLegendOpen((v) => !v)}
            icon={<Info size={15} aria-hidden />}
          >
            Legend
          </ToolbarButton>
          {selectedId && mode !== 'internal' && (
            <ToolbarButton
              onClick={() => ensureVisible(selectedId, true)}
              icon={<Crosshair size={15} aria-hidden />}
            >
              Focus
            </ToolbarButton>
          )}
        </div>
        <Popover
          anchor={layersAnchor}
          open={layersOpen}
          onClose={() => setLayersOpen(false)}
          labelledBy="layers-title"
          width={300}
        >
          <div className="space-y-3 p-4 text-[13.5px]">
            <h2 id="layers-title" className="font-serif text-lg text-fg">
              Layers
            </h2>
            {(
              [
                [
                  'hotspot',
                  'HotSpot implementation structures',
                  'Hide to see only what the JVM Specification defines.',
                ],
                [
                  'platform',
                  'Build time, process and platform',
                  'Tools, launcher, native libraries, OS and CPU.',
                ],
                ['edges', 'Connectors', 'Relationships between components.'],
                [
                  'parts',
                  'Part numbers (exploded view)',
                  'Numbered callouts, as in a parts diagram.',
                ],
              ] as const
            ).map(([key, label, hint]) => (
              <label key={key} className="flex cursor-pointer gap-2.5">
                <input
                  type="checkbox"
                  checked={layers[key]}
                  onChange={(event) =>
                    setLayers((previous) => ({ ...previous, [key]: event.target.checked }))
                  }
                  className="mt-1 h-4 w-4 accent-[var(--color-exec-500)]"
                />
                <span>
                  <span className="block text-fg">{label}</span>
                  <span className="block text-[12.5px] text-fg-subtle">{hint}</span>
                </span>
              </label>
            ))}
            <div className="flex gap-2 border-t border-ink-600 pt-3">
              <button
                type="button"
                onClick={() => setCollapsed(new Set(subsystemIds))}
                className="rounded border border-ink-500 px-2 py-1 text-[12.5px] text-fg-muted hover:text-fg"
              >
                Collapse subsystems
              </button>
              <button
                type="button"
                onClick={() => setCollapsed(new Set())}
                className="rounded border border-ink-500 px-2 py-1 text-[12.5px] text-fg-muted hover:text-fg"
              >
                Expand all
              </button>
            </div>
          </div>
        </Popover>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col xl:flex-row">
        {treeOpen && (
          <aside
            aria-label="Component list"
            className="absolute inset-y-0 left-0 z-20 flex w-[min(280px,85vw)] flex-col border-r border-ink-700 bg-ink-950/97 backdrop-blur xl:static xl:z-auto xl:bg-ink-950"
          >
            <div className="border-b border-ink-700 p-2">
              <div className="flex items-center gap-2 rounded-md border border-ink-600 bg-ink-850 px-2">
                <Search size={14} aria-hidden className="text-fg-subtle" />
                <input
                  type="search"
                  aria-label="Filter components"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder="Filter components"
                  className="h-8 w-full bg-transparent text-[13px] text-fg outline-none placeholder:text-fg-subtle"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-1.5">
              <ComponentTree
                roots={tree}
                selectedId={selectedId}
                explored={progress.explored}
                filter={filter}
                onSelect={(id) => {
                  navigate(id);
                  if (!wide) setTreeOpen(false);
                }}
              />
            </div>
            <p className="border-t border-ink-700 px-3 py-2 text-[11.5px] text-fg-subtle">
              {Object.keys(progress.explored).length} of {Object.keys(COMPONENTS).length} components
              explored
            </p>
          </aside>
        )}

        <div
          ref={canvasAreaRef}
          className="relative h-[62vh] min-h-[380px] min-w-0 flex-1 xl:h-auto"
        >
          {mode === 'internal' ? (
            selectedId ? (
              <InternalView id={selectedId} onSelect={(id) => navigate(id)} />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center">
                <div className="max-w-md">
                  <Microscope className="mx-auto text-rt-300" aria-hidden />
                  <p className="mt-3 font-serif text-xl text-fg">Choose a component to dissect</p>
                  <p className="mt-2 text-[14px] text-fg-muted">
                    Internal view opens one component at a time. Pick one from the list, or start
                    with one of these:
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {(
                      [
                        'heap',
                        'stack-frame',
                        'code-cache',
                        'class-loader-subsystem',
                        'jit-compiler',
                      ] as ComponentId[]
                    ).map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => navigate(id)}
                        className="rounded border border-ink-500 px-2.5 py-1 text-[13px] text-fg-muted hover:border-rt-500/60 hover:text-rt-200"
                      >
                        {getComponentDoc(id).name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            <AnatomyCanvas
              ref={canvasRef}
              bounds={scene.bounds}
              focus={cameraFocus}
              label={
                mode === 'exploded'
                  ? 'Exploded view of the Java Virtual Machine'
                  : 'Anatomy of the Java Virtual Machine'
              }
              defs={<DiagramDefs />}
              onBackgroundClick={() => select(null)}
              onTransform={() => {
                if (hoverRect) setHoverRect(null);
              }}
              className="bg-ink-950"
            >
              {(lod) => (
                <AnatomyPlate
                  scene={scene}
                  mode={diagramMode}
                  lod={lod}
                  selectedId={selectedId}
                  hoveredId={hoveredId}
                  execution={execution}
                  animate={!reducedMotion}
                  showEdges={layers.edges}
                  showPartNumbers={mode === 'exploded' && layers.parts}
                  onSelect={onCanvasSelect}
                  onHover={onHover}
                  onActivate={(id) => ensureVisible(id, true)}
                  onFocusNode={(id) => ensureVisible(id)}
                />
              )}
            </AnatomyCanvas>
          )}

          {hoveredDoc && hoverRect && mode !== 'internal' && (
            <div
              role="tooltip"
              className="pointer-events-none absolute z-10 w-[260px] rounded-md border border-ink-500 bg-ink-900/95 p-2.5 text-[12.5px] shadow-xl backdrop-blur"
              style={{
                left: Math.max(
                  8,
                  Math.min(hoverRect.x + hoverRect.w / 2 - 130, hoverRect.areaWidth - 268),
                ),
                top: hoverRect.y > 120 ? hoverRect.y - 8 : hoverRect.y + hoverRect.h + 8,
                transform: hoverRect.y > 120 ? 'translateY(-100%)' : undefined,
              }}
            >
              <p className="font-medium text-fg">{hoveredDoc.name}</p>
              <p className="mt-0.5 text-fg-muted">{hoveredDoc.summary}</p>
              <p className="mt-1 text-[11px] text-fg-subtle">
                Click to inspect · double-click to zoom
              </p>
            </div>
          )}

          {legendOpen && mode !== 'internal' && (
            <div className="absolute top-3 left-3 z-10 hidden md:block">
              <Legend onClose={() => setLegendOpen(false)} showStates={mode === 'execution'} />
            </div>
          )}

          {selectedId && mode !== 'internal' && (
            <SelectionCrumb id={selectedId} onNavigate={navigate} />
          )}
        </div>

        <aside
          ref={inspectorRef}
          aria-label={mode === 'execution' ? 'Execution narrative' : 'Component inspector'}
          className="scroll-mt-16 border-t border-ink-700 bg-ink-950 xl:w-[440px] xl:shrink-0 xl:overflow-y-auto xl:border-t-0 xl:border-l"
        >
          {sidePanel}
        </aside>
      </div>
    </section>
  );
}

function ToolbarButton({
  children,
  icon,
  pressed,
  onClick,
  buttonRef,
  haspopup,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  pressed?: boolean;
  onClick: () => void;
  buttonRef?: (el: HTMLButtonElement | null) => void;
  haspopup?: boolean;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-pressed={haspopup ? undefined : pressed}
      aria-expanded={haspopup ? pressed : undefined}
      aria-haspopup={haspopup ? 'dialog' : undefined}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[13px] transition-colors',
        pressed
          ? 'border-exec-500/50 bg-exec-900/50 text-exec-200'
          : 'border-ink-600 bg-ink-850 text-fg-muted hover:text-fg',
      )}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
      <span className="sr-only sm:hidden">{children}</span>
    </button>
  );
}

function SelectionCrumb({ id, onNavigate }: { id: ComponentId; onNavigate: (id: string) => void }) {
  const chain = ancestry(id);
  return (
    <nav
      aria-label="Selected component path"
      className="absolute top-3 right-3 z-10 hidden max-w-[50%] rounded-md border border-ink-600 bg-ink-900/90 px-2.5 py-1.5 text-[12px] backdrop-blur lg:block"
    >
      <ol className="flex flex-wrap items-center gap-1 text-fg-subtle">
        {chain.map((doc, index) => (
          <li key={doc.id} className="flex items-center gap-1">
            {index > 0 && <span aria-hidden>›</span>}
            {index === chain.length - 1 ? (
              <span className="text-fg">{doc.name}</span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(doc.id)}
                className="hover:text-exec-200"
              >
                {doc.name}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function WelcomePanel({ mode, onSelect }: { mode: ExplorerMode; onSelect: (id: string) => void }) {
  const starts: ComponentId[] = [
    'class-loader-subsystem',
    'heap',
    'jvm-stack',
    'interpreter',
    'jit-compiler',
    'garbage-collector',
    'jni',
  ];
  return (
    <div className="px-5 py-6">
      <p className="kicker">Plate 01 · how to read it</p>
      <h2 className="mt-2 font-serif text-[26px] leading-tight text-fg">
        Every box is a real part of the JVM.
      </h2>
      <div className="prose-ij mt-3 text-[14.5px]">
        <p>
          Select any component to open its explanation, internal structure, connections, a verified
          example, common misconceptions and sources. Connected components stay lit; everything else
          fades.
        </p>
        <p>
          {mode === 'exploded'
            ? 'In the exploded view the subsystems are pulled apart and every part is numbered. Select a part to see its connections.'
            : 'Solid outlines are defined by the JVM Specification. Dashed outlines tagged HS are HotSpot (JDK 25) implementation structures. Dotted outlines sit outside the JVM.'}
        </p>
      </div>
      {mode === 'exploded' && <PartsList onSelect={onSelect} />}
      <p className="kicker mt-6">Good places to start</p>
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {starts.map((id) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              className="w-full rounded-md border border-ink-600 bg-ink-850 px-3 py-2 text-left text-[13px] text-fg-muted hover:border-rt-500/60 hover:text-fg"
            >
              {getComponentDoc(id).name}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[12.5px] text-fg-subtle">
        Keyboard: Tab into the diagram, arrow keys move between components, Enter selects, Escape
        goes to the parent. With the diagram itself focused, arrows pan and + / − / 0 zoom.
      </p>
    </div>
  );
}

/** Parts list for the exploded view, as on an engineering drawing. */
function PartsList({ onSelect }: { onSelect: (id: string) => void }) {
  const groups: { title: string; root: ComponentId }[] = [
    { title: 'Build time', root: 'build-time' },
    { title: 'Java process', root: 'java-process' },
    { title: 'Platform', root: 'platform' },
  ];
  const flatten = (id: ComponentId): ComponentId[] => [
    id,
    ...childrenOf(id).flatMap((child) => flatten(child.id)),
  ];
  return (
    <div className="mt-6">
      <p className="kicker">Parts list</p>
      {groups.map((group) => (
        <div key={group.root} className="mt-3">
          <p className="text-[12px] text-fg-subtle">{group.title}</p>
          <ol className="mt-1 grid grid-cols-1 gap-x-3 text-[13px] sm:grid-cols-2">
            {flatten(group.root).map((id) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onSelect(id)}
                  className="flex w-full items-baseline gap-2 rounded px-1 py-0.5 text-left text-fg-muted hover:bg-ink-800 hover:text-fg"
                >
                  <span className="w-6 shrink-0 text-right font-mono text-[11px] text-fg-subtle">
                    {PART_NUMBER.get(id)}
                  </span>
                  <span className="truncate">{getComponentDoc(id).name}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

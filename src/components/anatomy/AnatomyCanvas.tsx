import { Maximize2, Minus, Plus } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { IconButton } from '@/components/ui/Button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fitTransform, lerpTransform, zoomAt, type Rect, type ViewTransform } from '@/lib/geometry';
import { cn } from '@/lib/cn';

import { lodFor, type Lod } from './lod';

export type { Lod } from './lod';

export interface CanvasHandle {
  fit: (animate?: boolean) => void;
  zoomBy: (factor: number) => void;
  focusRect: (rect: Rect, maxZoom?: number) => void;
  /** Converts a diagram rectangle into canvas-relative screen pixels. */
  toScreen: (rect: Rect) => Rect;
  getTransform: () => ViewTransform;
}

interface AnatomyCanvasProps {
  /** Diagram-space rectangle that "fit" shows. */
  bounds: Rect;
  /** Camera target; the camera animates whenever `key` changes. */
  focus?: { rect: Rect; key: string; maxZoom?: number } | null;
  /** 'pan-zoom': wheel pans, ctrl/⌘ + wheel or pinch zooms. 'ctrl-zoom': page scroll wins unless ctrl/⌘ is held. */
  wheel?: 'pan-zoom' | 'ctrl-zoom';
  label: string;
  description?: string;
  minZoom?: number;
  maxZoom?: number;
  controls?: boolean;
  className?: string;
  defs?: ReactNode;
  overlay?: ReactNode;
  /** Extra buttons shown above the zoom controls. */
  extraControls?: ReactNode;
  onBackgroundClick?: () => void;
  onTransform?: (transform: ViewTransform) => void;
  children: (lod: Lod) => ReactNode;
  ref?: Ref<CanvasHandle>;
}

const DRAG_THRESHOLD = 4;

/**
 * SVG host with pan, zoom (wheel, pinch, keyboard, buttons), fit-to-bounds and
 * animated camera moves. Panning writes the transform straight to the DOM;
 * React re-renders only when the level of detail changes.
 */
export function AnatomyCanvas({
  bounds,
  focus,
  wheel = 'pan-zoom',
  label,
  description,
  minZoom = 0.12,
  maxZoom = 3.2,
  controls = true,
  className,
  defs,
  overlay,
  extraControls,
  onBackgroundClick,
  onTransform,
  children,
  ref,
}: AnatomyCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const transformRef = useRef<ViewTransform>({ x: 0, y: 0, k: 1 });
  const sizeRef = useRef({ w: 0, h: 0 });
  const animationRef = useRef<number | null>(null);
  const interactedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const onTransformRef = useRef(onTransform);
  const [lod, setLod] = useState<Lod>('normal');
  const [ready, setReady] = useState(false);
  const reducedMotion = useReducedMotion();
  const descriptionId = useId();
  const limits = { min: minZoom, max: maxZoom };

  useEffect(() => {
    onTransformRef.current = onTransform;
  }, [onTransform]);

  const apply = useCallback((t: ViewTransform) => {
    transformRef.current = t;
    groupRef.current?.setAttribute('transform', `translate(${t.x} ${t.y}) scale(${t.k})`);
    svgRef.current?.style.setProperty('--k', String(t.k));
    setLod((previous) => {
      const next = lodFor(t.k);
      return next === previous ? previous : next;
    });
    onTransformRef.current?.(t);
  }, []);

  const stopAnimation = () => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
  };

  const animateTo = useCallback(
    (target: ViewTransform, animate = true) => {
      stopAnimation();
      if (!animate || reducedMotion) {
        apply(target);
        return;
      }
      const from = transformRef.current;
      const start = performance.now();
      const duration = 480;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        apply(lerpTransform(from, target, eased));
        animationRef.current = p < 1 ? requestAnimationFrame(tick) : null;
      };
      animationRef.current = requestAnimationFrame(tick);
    },
    [apply, reducedMotion],
  );

  const fitTo = useCallback(
    (rect: Rect, animate: boolean, max = maxZoom) => {
      const size = sizeRef.current;
      if (!size.w || !size.h) return;
      const padding = Math.min(40, Math.max(12, Math.min(size.w, size.h) * 0.04));
      animateTo(fitTransform(rect, size, padding, { min: minZoom, max }), animate);
    },
    [animateTo, maxZoom, minZoom],
  );

  useImperativeHandle(
    ref,
    () => ({
      fit: (animate = true) => {
        interactedRef.current = false;
        fitTo(bounds, animate);
      },
      zoomBy: (factor: number) => {
        interactedRef.current = true;
        const size = sizeRef.current;
        animateTo(zoomAt(transformRef.current, factor, { x: size.w / 2, y: size.h / 2 }, limits));
      },
      focusRect: (rect: Rect, max = 1.6) => {
        interactedRef.current = true;
        fitTo(rect, true, max);
      },
      toScreen: (rect: Rect) => {
        const t = transformRef.current;
        return { x: rect.x * t.k + t.x, y: rect.y * t.k + t.y, w: rect.w * t.k, h: rect.h * t.k };
      },
      getTransform: () => transformRef.current,
    }),
    // limits is derived from minZoom/maxZoom
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animateTo, bounds, fitTo, minZoom, maxZoom],
  );

  // Track the container size; refit while the user has not moved the camera.
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      const changed = rect.width !== sizeRef.current.w || rect.height !== sizeRef.current.h;
      sizeRef.current = { w: rect.width, h: rect.height };
      if (changed && !interactedRef.current) fitTo(bounds, false);
      setReady(rect.width > 0);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [bounds, fitTo]);

  // Re-fit when the content bounds change (for example switching to the exploded view).
  const boundsKey = `${bounds.x},${bounds.y},${bounds.w},${bounds.h}`;
  const previousBoundsKey = useRef(boundsKey);
  useEffect(() => {
    if (previousBoundsKey.current === boundsKey) return;
    previousBoundsKey.current = boundsKey;
    interactedRef.current = false;
    fitTo(bounds, true);
  }, [boundsKey, bounds, fitTo]);

  // Camera follows the requested focus.
  const focusKey = focus?.key;
  useEffect(() => {
    if (!focus || !focusKey) return;
    interactedRef.current = true;
    fitTo(focus.rect, true, focus.maxZoom ?? 1.6);
    // focus.rect is captured with its key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey, fitTo]);

  // Wheel needs a non-passive listener to prevent page scrolling.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      const zoomGesture = event.ctrlKey || event.metaKey;
      if (wheel === 'ctrl-zoom' && !zoomGesture) return;
      event.preventDefault();
      stopAnimation();
      interactedRef.current = true;
      const rect = element.getBoundingClientRect();
      const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      const t = transformRef.current;
      if (zoomGesture) {
        const factor = Math.exp(-event.deltaY * (event.deltaMode === 1 ? 0.05 : 0.0025));
        apply(zoomAt(t, factor, point, { min: minZoom, max: maxZoom }));
      } else {
        apply({ ...t, x: t.x - event.deltaX, y: t.y - event.deltaY });
      }
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [apply, wheel, minZoom, maxZoom]);

  // Pointer drag (pan) and two-finger pinch (zoom).
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    start: { x: number; y: number };
    origin: ViewTransform;
    moved: boolean;
    pinch?: { distance: number; mid: { x: number; y: number } };
  } | null>(null);

  const localPoint = (event: { clientX: number; clientY: number }) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    stopAnimation();
    pointers.current.set(event.pointerId, localPoint(event));
    const points = [...pointers.current.values()];
    if (points.length === 2) {
      const [a, b] = points as [{ x: number; y: number }, { x: number; y: number }];
      gesture.current = {
        start: a,
        origin: transformRef.current,
        moved: true,
        pinch: {
          distance: Math.hypot(a.x - b.x, a.y - b.y),
          mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        },
      };
    } else if (points.length === 1) {
      gesture.current = { start: localPoint(event), origin: transformRef.current, moved: false };
    }
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return;
    pointers.current.set(event.pointerId, localPoint(event));
    const g = gesture.current;
    const points = [...pointers.current.values()];
    if (g.pinch && points.length >= 2) {
      const [a, b] = points as [{ x: number; y: number }, { x: number; y: number }];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const zoomed = zoomAt(g.origin, distance / g.pinch.distance, g.pinch.mid, {
        min: minZoom,
        max: maxZoom,
      });
      apply({
        ...zoomed,
        x: zoomed.x + mid.x - g.pinch.mid.x,
        y: zoomed.y + mid.y - g.pinch.mid.y,
      });
      interactedRef.current = true;
      return;
    }
    const p = localPoint(event);
    const dx = p.x - g.start.x;
    const dy = p.y - g.start.y;
    if (!g.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!g.moved) {
      g.moved = true;
      containerRef.current?.setPointerCapture?.(event.pointerId);
    }
    interactedRef.current = true;
    apply({ ...g.origin, x: g.origin.x + dx, y: g.origin.y + dy });
  };

  const endPointer = (event: React.PointerEvent) => {
    pointers.current.delete(event.pointerId);
    if (gesture.current?.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
    if (pointers.current.size === 0) gesture.current = null;
    else if (pointers.current.size === 1) {
      const remaining = [...pointers.current.values()][0]!;
      gesture.current = { start: remaining, origin: transformRef.current, moved: true };
    }
  };

  const onKeyDown = (event: ReactKeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
    const size = sizeRef.current;
    const t = transformRef.current;
    const center = { x: size.w / 2, y: size.h / 2 };
    const onCanvas = target === containerRef.current;
    const step = event.shiftKey ? 160 : 60;
    let next: ViewTransform | null = null;
    switch (event.key) {
      case '+':
      case '=':
        next = zoomAt(t, 1.25, center, limits);
        break;
      case '-':
      case '_':
        next = zoomAt(t, 0.8, center, limits);
        break;
      case '0':
        event.preventDefault();
        interactedRef.current = false;
        fitTo(bounds, true);
        return;
      case 'ArrowLeft':
        if (onCanvas) next = { ...t, x: t.x + step };
        break;
      case 'ArrowRight':
        if (onCanvas) next = { ...t, x: t.x - step };
        break;
      case 'ArrowUp':
        if (onCanvas) next = { ...t, y: t.y + step };
        break;
      case 'ArrowDown':
        if (onCanvas) next = { ...t, y: t.y - step };
        break;
    }
    if (next) {
      event.preventDefault();
      interactedRef.current = true;
      animateTo(next);
    }
  };

  return (
    // The container is a focusable composite widget: keyboard pans and zooms it,
    // and its children (diagram nodes) are individually focusable buttons.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={containerRef}
      role="group"
      aria-roledescription="interactive diagram"
      aria-label={label}
      aria-describedby={descriptionId}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onClickCapture={(event) => {
        if (suppressClickRef.current) {
          event.stopPropagation();
          event.preventDefault();
        }
      }}
      className={cn(
        'relative h-full w-full touch-none overflow-hidden outline-none select-none focus-visible:ring-2 focus-visible:ring-exec-400/70 focus-visible:ring-inset',
        className,
      )}
    >
      <p id={descriptionId} className="sr-only">
        {description ??
          'Drag to pan. Use the zoom buttons, Control or Command with the scroll wheel, or pinch to zoom. With the diagram focused, arrow keys pan, plus and minus zoom, and 0 fits the whole diagram. Tab moves between components; Enter or Space selects one.'}
      </p>
      <svg
        ref={svgRef}
        className={cn('block h-full w-full', !ready && 'opacity-0')}
        style={{ ['--k' as string]: 1 }}
      >
        {defs && <defs>{defs}</defs>}
        <rect
          width="100%"
          height="100%"
          fill="transparent"
          onClick={() => onBackgroundClick?.()}
          aria-hidden
        />
        <g ref={groupRef}>{children(lod)}</g>
      </svg>
      {overlay}
      {controls && (
        <div className="absolute right-3 bottom-3 flex flex-col gap-1.5" data-canvas-controls>
          {extraControls}
          <IconButton
            label="Zoom in"
            onClick={() =>
              animateTo(
                zoomAt(
                  transformRef.current,
                  1.3,
                  { x: sizeRef.current.w / 2, y: sizeRef.current.h / 2 },
                  limits,
                ),
              )
            }
          >
            <Plus size={16} aria-hidden />
          </IconButton>
          <IconButton
            label="Zoom out"
            onClick={() =>
              animateTo(
                zoomAt(
                  transformRef.current,
                  1 / 1.3,
                  { x: sizeRef.current.w / 2, y: sizeRef.current.h / 2 },
                  limits,
                ),
              )
            }
          >
            <Minus size={16} aria-hidden />
          </IconButton>
          <IconButton
            label="Reset view (fit whole diagram)"
            onClick={() => {
              interactedRef.current = false;
              fitTo(bounds, true);
            }}
          >
            <Maximize2 size={15} aria-hidden />
          </IconButton>
        </div>
      )}
    </div>
  );
}

import { EDGE_STYLES } from './edgeStyles';

function Arrow({ id, color, open }: { id: string; color: string; open?: boolean }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="9"
      markerHeight="9"
      markerUnits="userSpaceOnUse"
      orient="auto-start-reverse"
    >
      {open ? (
        <path
          d="M1 1.5 L9 5 L1 8.5"
          fill="none"
          stroke={color}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      ) : (
        <path d="M0.5 1 L9.5 5 L0.5 9 Z" fill={color} />
      )}
    </marker>
  );
}

/** Shared <defs>: arrowheads, hatching and glow used by every plate. */
export function DiagramDefs() {
  return (
    <>
      {Object.entries(EDGE_STYLES).map(([kind, style]) => (
        <Arrow key={kind} id={style.marker} color={style.color} open={kind === 'data'} />
      ))}
      <Arrow id="ij-arrow-flow" color="var(--color-exec-200)" />
      <pattern
        id="ij-hatch"
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line x1="0" y1="0" x2="0" y2="6" stroke="rgb(180 190 210 / 0.07)" strokeWidth="2" />
      </pattern>
      <pattern id="ij-grid-minor" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0 L0 0 0 20" fill="none" stroke="rgb(120 150 200 / 0.045)" strokeWidth="0.6" />
      </pattern>
      <pattern id="ij-grid" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect width="100" height="100" fill="url(#ij-grid-minor)" />
        <path
          d="M100 0 L0 0 0 100"
          fill="none"
          stroke="rgb(120 150 200 / 0.08)"
          strokeWidth="0.8"
        />
      </pattern>
      <filter id="ij-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </>
  );
}

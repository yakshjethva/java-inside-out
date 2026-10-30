/** The Inside Java mark: a component inside a component, with the pc "dot" at its core. */
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden focusable="false">
      <rect width="32" height="32" rx="7" fill="var(--color-ink-800)" />
      <rect
        x="5.75"
        y="5.75"
        width="20.5"
        height="20.5"
        rx="3.5"
        fill="none"
        stroke="var(--color-rt-500)"
        strokeWidth="1.5"
      />
      <rect
        x="10.75"
        y="10.75"
        width="10.5"
        height="10.5"
        rx="2"
        fill="none"
        stroke="var(--color-exec-500)"
        strokeWidth="1.5"
        strokeDasharray="2.2 1.6"
      />
      <circle cx="16" cy="16" r="2.1" fill="var(--color-exec-300)" />
    </svg>
  );
}

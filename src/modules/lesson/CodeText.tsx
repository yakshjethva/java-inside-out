/** Short explanation text in which `backticked` pieces render as inline code. */
export function CodeText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/).map((piece, i) =>
        piece.startsWith('`') && piece.endsWith('`') && piece.length > 1 ? (
          <code
            key={i}
            translate="no"
            className="rounded-[3px] border border-ink-600 bg-ink-750 px-1 font-mono text-[0.88em] text-exec-200"
          >
            {piece.slice(1, -1)}
          </code>
        ) : (
          <span key={i}>{piece}</span>
        ),
      )}
    </>
  );
}

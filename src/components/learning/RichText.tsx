import { Fragment, useMemo, type ReactNode } from 'react';
import { parseBlocks, parseInline, type InlineNode } from '@/lib/richText';
import { GlossaryTerm } from './GlossaryTerm';

function renderInline(nodes: InlineNode[], keyPrefix = ''): ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}${index}`;
    switch (node.type) {
      case 'text':
        return <Fragment key={key}>{node.value}</Fragment>;
      case 'code':
        return <code key={key}>{node.value}</code>;
      case 'strong':
        return <strong key={key}>{renderInline(node.children, `${key}.`)}</strong>;
      case 'term':
        return <GlossaryTerm key={key} id={node.id} label={node.label} />;
      case 'link':
        return (
          <a key={key} href={node.href} target="_blank" rel="noreferrer noopener">
            {node.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        );
    }
  });
}

/** Renders the content layer's rich text (paragraphs, lists, inline markup). */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = useMemo(() => parseBlocks(text), [text]);
  return (
    <div className={className}>
      {blocks.map((block, index) =>
        block.type === 'paragraph' ? (
          <p key={index}>{renderInline(block.children)}</p>
        ) : (
          <ul key={index}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInline(item)}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

/** Single-line rich text without paragraph wrappers. */
export function InlineRichText({ text }: { text: string }) {
  const nodes = useMemo(() => parseInline(text), [text]);
  return <>{renderInline(nodes)}</>;
}

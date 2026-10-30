/**
 * A deliberately small inline markup for educational content.
 *
 *   `code`                 inline code
 *   **strong**             emphasis (may contain code, terms and links)
 *   [[glossary-id]]        glossary term, label = the term's name
 *   [[glossary-id|label]]  glossary term with a custom label
 *   [label](https://…)     external link
 *
 * Paragraphs are separated by a blank line. A block whose lines all start
 * with "- " is a bullet list. Anything else is literal text, so content stays
 * readable in a diff and needs no Markdown runtime.
 */

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'code'; value: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'term'; id: string; label?: string }
  | { type: 'link'; href: string; label: string };

export type BlockNode =
  { type: 'paragraph'; children: InlineNode[] } | { type: 'list'; items: InlineNode[][] };

export function parseInline(source: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let buffer = '';
  let i = 0;

  const flush = () => {
    if (buffer) {
      nodes.push({ type: 'text', value: buffer });
      buffer = '';
    }
  };

  while (i < source.length) {
    const ch = source[i];

    if (ch === '`') {
      const end = source.indexOf('`', i + 1);
      if (end > i + 1) {
        flush();
        nodes.push({ type: 'code', value: source.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (source.startsWith('**', i)) {
      const end = source.indexOf('**', i + 2);
      if (end > i + 2) {
        flush();
        nodes.push({ type: 'strong', children: parseInline(source.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    if (source.startsWith('[[', i)) {
      const end = source.indexOf(']]', i + 2);
      if (end > i + 2) {
        flush();
        const inner = source.slice(i + 2, end);
        const bar = inner.indexOf('|');
        const id = (bar === -1 ? inner : inner.slice(0, bar)).trim();
        const label = bar === -1 ? undefined : inner.slice(bar + 1).trim();
        nodes.push(label ? { type: 'term', id, label } : { type: 'term', id });
        i = end + 2;
        continue;
      }
    }

    if (ch === '[') {
      const close = source.indexOf('](', i + 1);
      const end = close === -1 ? -1 : source.indexOf(')', close + 2);
      if (close > i + 1 && end > close + 2 && !source.slice(i + 1, close).includes('[')) {
        flush();
        nodes.push({
          type: 'link',
          label: source.slice(i + 1, close),
          href: source.slice(close + 2, end),
        });
        i = end + 1;
        continue;
      }
    }

    buffer += ch;
    i += 1;
  }

  flush();
  return nodes;
}

export function parseBlocks(source: string): BlockNode[] {
  return source
    .trim()
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block): BlockNode => {
      const lines = block.split('\n').map((line) => line.trim());
      if (lines.every((line) => line.startsWith('- '))) {
        return { type: 'list', items: lines.map((line) => parseInline(line.slice(2))) };
      }
      return { type: 'paragraph', children: parseInline(lines.join(' ')) };
    });
}

function inlineToText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case 'text':
        case 'code':
          return node.value;
        case 'strong':
          return inlineToText(node.children);
        case 'term':
          return node.label ?? node.id.replace(/-/g, ' ');
        case 'link':
          return node.label;
      }
    })
    .join('');
}

/** Plain text, for accessible labels and search indexes. */
export function toPlainText(source: string): string {
  return parseBlocks(source)
    .map((block) =>
      block.type === 'paragraph'
        ? inlineToText(block.children)
        : block.items.map((item) => inlineToText(item)).join('; '),
    )
    .join(' ');
}

/** Every glossary id referenced by `[[id]]` or `[[id|label]]`. */
export function collectTermIds(source: string): string[] {
  const ids: string[] = [];
  const visit = (nodes: InlineNode[]) => {
    for (const node of nodes) {
      if (node.type === 'term') ids.push(node.id);
      if (node.type === 'strong') visit(node.children);
    }
  };
  for (const block of parseBlocks(source)) {
    if (block.type === 'paragraph') visit(block.children);
    else block.items.forEach(visit);
  }
  return ids;
}

/** Every external link target. */
export function collectLinks(source: string): string[] {
  const links: string[] = [];
  const visit = (nodes: InlineNode[]) => {
    for (const node of nodes) {
      if (node.type === 'link') links.push(node.href);
      if (node.type === 'strong') visit(node.children);
    }
  };
  for (const block of parseBlocks(source)) {
    if (block.type === 'paragraph') visit(block.children);
    else block.items.forEach(visit);
  }
  return links;
}

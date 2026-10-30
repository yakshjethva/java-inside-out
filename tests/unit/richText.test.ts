import { describe, expect, it } from 'vitest';
import {
  collectLinks,
  collectTermIds,
  parseBlocks,
  parseInline,
  toPlainText,
} from '@/lib/richText';

describe('parseInline', () => {
  it('parses code, strong, terms and links', () => {
    expect(
      parseInline('a `b` **c** [[heap]] [[jvm|the JVM]] [JEP](https://openjdk.org/jeps/1)'),
    ).toEqual([
      { type: 'text', value: 'a ' },
      { type: 'code', value: 'b' },
      { type: 'text', value: ' ' },
      { type: 'strong', children: [{ type: 'text', value: 'c' }] },
      { type: 'text', value: ' ' },
      { type: 'term', id: 'heap' },
      { type: 'text', value: ' ' },
      { type: 'term', id: 'jvm', label: 'the JVM' },
      { type: 'text', value: ' ' },
      { type: 'link', label: 'JEP', href: 'https://openjdk.org/jeps/1' },
    ]);
  });

  it('allows inline markup inside strong text', () => {
    expect(parseInline('**see `x` and [[heap]]**')).toEqual([
      {
        type: 'strong',
        children: [
          { type: 'text', value: 'see ' },
          { type: 'code', value: 'x' },
          { type: 'text', value: ' and ' },
          { type: 'term', id: 'heap' },
        ],
      },
    ]);
  });

  it('keeps unmatched delimiters as literal text', () => {
    expect(parseInline('a ` b ** c [[ d [e]')).toEqual([
      { type: 'text', value: 'a ` b ** c [[ d [e]' },
    ]);
  });

  it('does not treat code contents as markup', () => {
    expect(parseInline('`[[heap]]`')).toEqual([{ type: 'code', value: '[[heap]]' }]);
  });
});

describe('parseBlocks', () => {
  it('splits paragraphs on blank lines and detects lists', () => {
    const blocks = parseBlocks('First line\ncontinues.\n\n- one\n- two\n\nLast.');
    expect(blocks).toHaveLength(3);
    expect(blocks[0]).toEqual({
      type: 'paragraph',
      children: [{ type: 'text', value: 'First line continues.' }],
    });
    expect(blocks[1]).toEqual({
      type: 'list',
      items: [[{ type: 'text', value: 'one' }], [{ type: 'text', value: 'two' }]],
    });
  });
});

describe('helpers', () => {
  it('produces plain text for accessible labels', () => {
    expect(toPlainText('The **heap** holds `new` objects ([[gc-roots|roots]]).')).toBe(
      'The heap holds new objects (roots).',
    );
  });

  it('collects glossary ids and links, including nested ones', () => {
    const text = '[[heap]] and **[[jvm-stack|stacks]]**\n\n- [[tlab]] [x](https://example.org)';
    expect(collectTermIds(text)).toEqual(['heap', 'jvm-stack', 'tlab']);
    expect(collectLinks(text)).toEqual(['https://example.org']);
  });
});

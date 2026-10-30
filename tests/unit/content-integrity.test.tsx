import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { STATIC_ROUTES } from '@/app/routePaths';
import { childrenOf, COMPONENT_IDS, COMPONENTS, isAncestor, type ComponentId } from '@/content/jvm';
import { ANATOMY_QUIZ } from '@/content/jvm/quiz';
import { RELATIONSHIPS } from '@/content/jvm/relationships';
import { SCENARIOS } from '@/content/jvm/scenarios';
import { LEARNING_PATHS } from '@/content/paths';
import { REFERENCE_IDS, REFERENCES } from '@/data/references';
import { GLOSSARY, getGlossaryEntry } from '@/glossary';
import { contains, orthogonalRoute, anchorPoint, type Point, type Rect } from '@/lib/geometry';
import { collectLinks, collectTermIds } from '@/lib/richText';
import { DISSECTIONS } from '@/modules/jvm/internals/registry';
import { EDGE_ROUTES, NODE_RECTS } from '@/modules/jvm/layout';
import type { Citation, ComponentDoc } from '@/types/content';

/** Every rich-text string in the content layer, labelled by where it comes from. */
function allRichText(): { where: string; text: string }[] {
  const out: { where: string; text: string }[] = [];
  const add = (where: string, text: string | undefined) => text && out.push({ where, text });
  for (const doc of Object.values(COMPONENTS) as ComponentDoc[]) {
    const w = `component ${doc.id}`;
    add(w, doc.summary);
    add(w, doc.beginner);
    add(w, doc.technical);
    add(w, doc.purpose);
    add(w, doc.practice);
    add(w, doc.accuracyNote);
    doc.internals.forEach((t) => add(w, t));
    doc.inputs.forEach((t) => add(w, t));
    doc.outputs.forEach((t) => add(w, t));
    doc.misconceptions.forEach((m) => add(w, m.truth));
    doc.errors?.forEach((e) => add(w, e.when));
    add(w, doc.specVsImpl?.spec);
    add(w, doc.specVsImpl?.implementation);
  }
  for (const rel of RELATIONSHIPS) add(`relationship ${rel.id}`, rel.description);
  for (const scenario of SCENARIOS) {
    add(`scenario ${scenario.id}`, scenario.accuracyNote);
    for (const step of scenario.steps) {
      add(`step ${scenario.id}/${step.id}`, step.beginner);
      add(`step ${scenario.id}/${step.id}`, step.technical);
      add(`step ${scenario.id}/${step.id}`, step.note);
    }
  }
  for (const q of ANATOMY_QUIZ.questions) {
    add(`quiz ${q.id}`, q.prompt);
    q.options.forEach((o) => {
      add(`quiz ${q.id}`, o.text);
      add(`quiz ${q.id}`, o.explanation);
    });
  }
  for (const entry of GLOSSARY) {
    const w = `glossary ${entry.id}`;
    add(w, entry.beginner);
    add(w, entry.technical);
    add(w, entry.whyItExists);
    add(w, entry.misconception?.truth);
  }
  for (const dissection of Object.values(DISSECTIONS)) {
    add(`dissection ${dissection!.id}`, dissection!.accuracyNote);
    dissection!.parts.forEach((p) => add(`dissection ${dissection!.id}`, p.description));
  }
  return out;
}

function allCitations(): { where: string; citation: Citation }[] {
  const out: { where: string; citation: Citation }[] = [];
  for (const doc of Object.values(COMPONENTS) as ComponentDoc[])
    doc.references.forEach((c) => out.push({ where: doc.id, citation: c }));
  for (const s of SCENARIOS) s.references.forEach((c) => out.push({ where: s.id, citation: c }));
  for (const q of ANATOMY_QUIZ.questions)
    q.references?.forEach((c) => out.push({ where: q.id, citation: c }));
  for (const e of GLOSSARY) e.references?.forEach((c) => out.push({ where: e.id, citation: c }));
  for (const d of Object.values(DISSECTIONS))
    d!.references.forEach((c) => out.push({ where: d!.id, citation: c }));
  return out;
}

const overlap = (a: Rect, b: Rect) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const isOrthogonal = (points: Point[]) =>
  points.every((p, i) => i === 0 || p.x === points[i - 1]!.x || p.y === points[i - 1]!.y);

describe('anatomy components', () => {
  it('has exactly one documented entry per component id', () => {
    expect(Object.keys(COMPONENTS).sort()).toEqual([...COMPONENT_IDS].sort());
    for (const id of COMPONENT_IDS) expect(COMPONENTS[id].id).toBe(id);
  });

  it('has substantive content for every component', () => {
    for (const doc of Object.values(COMPONENTS) as ComponentDoc[]) {
      expect(doc.summary.length, doc.id).toBeGreaterThan(30);
      expect(doc.beginner.length, doc.id).toBeGreaterThan(80);
      expect(doc.technical.length, doc.id).toBeGreaterThan(120);
      expect(doc.purpose.length, doc.id).toBeGreaterThan(20);
      expect(doc.internals.length, doc.id).toBeGreaterThan(0);
      expect(doc.inputs.length, doc.id).toBeGreaterThan(0);
      expect(doc.outputs.length, doc.id).toBeGreaterThan(0);
      expect(doc.practice.length, doc.id).toBeGreaterThan(40);
      expect(doc.misconceptions.length, doc.id).toBeGreaterThan(0);
      expect(doc.references.length, doc.id).toBeGreaterThan(0);
    }
  });

  it('names the version for every HotSpot-specific component', () => {
    for (const doc of Object.values(COMPONENTS) as ComponentDoc[]) {
      if (doc.provenance === 'hotspot') expect(doc.version ?? doc.specVsImpl, doc.id).toBeTruthy();
    }
  });

  it('forms a tree whose parents exist', () => {
    for (const doc of Object.values(COMPONENTS) as ComponentDoc[]) {
      if (doc.parent) expect(COMPONENTS[doc.parent], doc.id).toBeDefined();
      expect(isAncestor(doc.id, doc.id), `${doc.id} is its own ancestor`).toBe(false);
    }
  });

  it('records verification for every example', () => {
    for (const doc of Object.values(COMPONENTS) as ComponentDoc[]) {
      if (doc.example) expect(doc.example.verifiedWith, doc.id).toMatch(/OpenJDK 25|JDK 25/);
    }
  });
});

describe('anatomy layout', () => {
  it('positions every component, children inside their parents', () => {
    for (const id of COMPONENT_IDS) {
      expect(NODE_RECTS[id], id).toBeDefined();
      for (const child of childrenOf(id))
        expect(contains(NODE_RECTS[id], NODE_RECTS[child.id]), `${child.id} inside ${id}`).toBe(
          true,
        );
    }
  });

  it('never overlaps siblings', () => {
    const parents: (ComponentId | undefined)[] = [undefined, ...COMPONENT_IDS];
    for (const parent of parents) {
      const kids = childrenOf(parent);
      for (let i = 0; i < kids.length; i++)
        for (let j = i + 1; j < kids.length; j++)
          expect(
            overlap(NODE_RECTS[kids[i]!.id], NODE_RECTS[kids[j]!.id]),
            `${kids[i]!.id} / ${kids[j]!.id}`,
          ).toBe(false);
    }
  });
});

describe('relationships', () => {
  it('connect existing components and have unique ids', () => {
    const ids = new Set<string>();
    for (const rel of RELATIONSHIPS) {
      expect(COMPONENTS[rel.from], rel.id).toBeDefined();
      expect(COMPONENTS[rel.to], rel.id).toBeDefined();
      expect(rel.from).not.toBe(rel.to);
      expect(ids.has(rel.id), rel.id).toBe(false);
      ids.add(rel.id);
    }
  });

  it('each have a hand route, and every route belongs to a relationship', () => {
    const relIds = new Set(RELATIONSHIPS.map((r) => r.id));
    for (const rel of RELATIONSHIPS) expect(EDGE_ROUTES[rel.id], rel.id).toBeDefined();
    for (const id of Object.keys(EDGE_ROUTES)) expect(relIds.has(id), id).toBe(true);
  });

  it('route with horizontal and vertical segments, anchored on their endpoints', () => {
    for (const rel of RELATIONSHIPS) {
      const route = EDGE_ROUTES[rel.id]!;
      for (const anchor of [route.from, route.to]) {
        const at = anchor.at ?? 0.5;
        expect(at, rel.id).toBeGreaterThanOrEqual(0);
        expect(at, rel.id).toBeLessThanOrEqual(1);
      }
      const start = anchorPoint(NODE_RECTS[rel.from], route.from);
      const end = anchorPoint(NODE_RECTS[rel.to], route.to);
      const points = orthogonalRoute(start, route.from.side, end, route.to.side, route.via);
      expect(isOrthogonal(points), rel.id).toBe(true);
    }
  });
});

describe('cross references', () => {
  it('resolve every [[glossary]] link', () => {
    const missing = allRichText().flatMap(({ where, text }) =>
      collectTermIds(text)
        .filter((id) => !getGlossaryEntry(id))
        .map((id) => `${where}: [[${id}]]`),
    );
    expect(missing).toEqual([]);
  });

  it('only link to https URLs', () => {
    for (const { where, text } of allRichText())
      for (const href of collectLinks(text)) expect(href, where).toMatch(/^https:\/\//);
  });

  it('cite only known references, all of which use https', () => {
    for (const { where, citation } of allCitations())
      expect(REFERENCES[citation.source], `${where}: ${citation.source}`).toBeDefined();
    for (const id of REFERENCE_IDS) expect(REFERENCES[id].url, id).toMatch(/^https:\/\//);
  });

  it('keep the glossary consistent', () => {
    const ids = new Set<string>();
    for (const entry of GLOSSARY) {
      expect(ids.has(entry.id), entry.id).toBe(false);
      ids.add(entry.id);
      if (entry.componentId) expect(COMPONENTS[entry.componentId], entry.id).toBeDefined();
      for (const related of entry.related ?? [])
        expect(getGlossaryEntry(related), `${entry.id} → ${related}`).toBeDefined();
    }
  });
});

describe('scenarios', () => {
  it('reference existing components, listings and lines', () => {
    for (const scenario of SCENARIOS) {
      const listings = new Map(scenario.listings.map((l) => [l.id, l.code.split('\n').length]));
      for (const step of scenario.steps) {
        const where = `${scenario.id}/${step.id}`;
        expect(step.active.length, where).toBeGreaterThan(0);
        for (const id of step.active) expect(COMPONENTS[id], where).toBeDefined();
        for (const flow of step.flows ?? []) {
          expect(COMPONENTS[flow.from], where).toBeDefined();
          expect(COMPONENTS[flow.to], where).toBeDefined();
        }
        for (const id of Object.keys(step.states ?? {}))
          expect(COMPONENTS[id as ComponentId], where).toBeDefined();
        for (const focus of step.focus ?? []) {
          expect(listings.has(focus.listing), `${where}: ${focus.listing}`).toBe(true);
          expect(focus.line, where).toBeGreaterThanOrEqual(1);
          expect(focus.line, where).toBeLessThanOrEqual(listings.get(focus.listing)!);
        }
      }
    }
  });

  it('have unique step ids within a scenario', () => {
    for (const scenario of SCENARIOS)
      expect(new Set(scenario.steps.map((s) => s.id)).size, scenario.id).toBe(
        scenario.steps.length,
      );
  });
});

describe('knowledge check', () => {
  it('has exactly one correct option per question, with explanations', () => {
    for (const q of ANATOMY_QUIZ.questions) {
      expect(
        q.options.filter((o) => o.correct),
        q.id,
      ).toHaveLength(1);
      for (const o of q.options)
        expect(o.explanation.length, `${q.id}/${o.id}`).toBeGreaterThan(20);
    }
  });
});

describe('learning paths', () => {
  it('link only to routes that exist', () => {
    const routes = new Set(STATIC_ROUTES.map((r) => `/${r.path}`));
    for (const path of LEARNING_PATHS)
      if (path.route) expect(routes.has(path.route), path.id).toBe(true);
  });
});

describe('dissections', () => {
  it('dissect existing components and map parts to existing components', () => {
    for (const [key, dissection] of Object.entries(DISSECTIONS)) {
      expect(dissection!.id).toBe(key);
      expect(COMPONENTS[dissection!.id]).toBeDefined();
      for (const part of dissection!.parts)
        if (part.componentId)
          expect(COMPONENTS[part.componentId], `${key}/${part.id}`).toBeDefined();
    }
  });

  it('render, and every selectable region has a documented part', () => {
    for (const dissection of Object.values(DISSECTIONS)) {
      const { container, unmount } = render(
        <svg>
          <dissection.Plate activePart={null} onPart={() => {}} />
        </svg>,
      );
      const documented = new Set(dissection!.parts.map((p) => p.id));
      const drawn = new Set(
        [...container.querySelectorAll('[data-part]')].map((el) => el.getAttribute('data-part')!),
      );
      expect(drawn.size, dissection!.id).toBeGreaterThan(3);
      for (const id of drawn)
        expect(documented.has(id), `${dissection!.id}: part "${id}" has no description`).toBe(true);
      unmount();
    }
  });
});

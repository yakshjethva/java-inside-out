import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ComponentTree, type TreeItem } from '@/components/anatomy/ComponentTree';
import { ComponentInspector } from '@/components/inspector/ComponentInspector';
import { KnowledgeCheck } from '@/components/learning/KnowledgeCheck';
import { getComponentDoc } from '@/content/jvm';
import { ANATOMY_QUIZ } from '@/content/jvm/quiz';
import { relationshipsOf } from '@/content/jvm/relationships';
import { progressStore } from '@/hooks/useLearningState';
import { JvmAnatomyPage } from '@/pages/JvmAnatomyPage';

function renderInRouter(element: React.ReactNode, path = '/') {
  const router = createMemoryRouter([{ path: '*', element }], { initialEntries: [path] });
  return { router, ...render(<RouterProvider router={router} />) };
}

describe('ComponentInspector', () => {
  const doc = getComponentDoc('heap');
  const { outgoing, incoming } = relationshipsOf('heap');
  const setup = (level: 'beginner' | 'technical' = 'beginner') => {
    const onNavigate = vi.fn();
    const onLevelChange = vi.fn();
    renderInRouter(
      <ComponentInspector
        doc={doc}
        ancestry={[
          { id: 'jvm', name: 'Java Virtual Machine' },
          { id: 'heap', name: 'Heap' },
        ]}
        parts={[{ id: 'young-generation', name: 'Young generation' }]}
        outgoing={outgoing.map((rel) => ({
          rel,
          other: { id: rel.to, name: getComponentDoc(rel.to).name },
        }))}
        incoming={incoming.map((rel) => ({
          rel,
          other: { id: rel.from, name: getComponentDoc(rel.from).name },
        }))}
        level={level}
        onLevelChange={onLevelChange}
        onNavigate={onNavigate}
        bookmarked={false}
        onToggleBookmark={() => {}}
        understood={false}
        onToggleUnderstood={() => {}}
      />,
    );
    return { onNavigate, onLevelChange };
  };

  it('shows the component, its provenance and the chosen explanation level', () => {
    setup('technical');
    expect(screen.getByRole('heading', { level: 2, name: 'Heap' })).toBeInTheDocument();
    expect(screen.getAllByText('JVM specification').length).toBeGreaterThan(0);
    expect(screen.getByText('Technical explanation')).toBeInTheDocument();
    expect(screen.getByText('Common misconceptions')).toBeInTheDocument();
    expect(screen.getByText('Sources')).toBeInTheDocument();
  });

  it('navigates through relationships, parts and breadcrumbs', async () => {
    const user = userEvent.setup();
    const { onNavigate, onLevelChange } = setup();
    await user.click(screen.getByRole('button', { name: 'Garbage collector' }));
    expect(onNavigate).toHaveBeenCalledWith('garbage-collector');
    await user.click(screen.getByRole('button', { name: 'Young generation' }));
    expect(onNavigate).toHaveBeenCalledWith('young-generation');
    await user.click(screen.getByRole('button', { name: 'Java Virtual Machine' }));
    expect(onNavigate).toHaveBeenCalledWith('jvm');
    await user.click(screen.getByRole('radio', { name: 'Technical' }));
    expect(onLevelChange).toHaveBeenCalledWith('technical');
  });
});

describe('KnowledgeCheck', () => {
  it('explains answers and stores the result', async () => {
    const user = userEvent.setup();
    progressStore.reset();
    renderInRouter(<KnowledgeCheck quiz={ANATOMY_QUIZ} />);
    const first = ANATOMY_QUIZ.questions[0]!;
    const wrong = first.options.find((o) => !o.correct)!;
    const group = screen.getAllByRole('group')[0]!;
    await user.click(within(group).getAllByRole('radio')[first.options.indexOf(wrong)]!);
    expect(screen.getByText('Not quite')).toBeInTheDocument();
    expect(screen.getByText('The correct answer')).toBeInTheDocument();
    expect(progressStore.get().quizzes[ANATOMY_QUIZ.id]).toMatchObject({ correct: 0 });
    await user.click(screen.getByRole('button', { name: /start again/i }));
    expect(progressStore.get().quizzes[ANATOMY_QUIZ.id]!.answers).toEqual({});
  });
});

describe('ComponentTree', () => {
  const roots: TreeItem[] = [
    {
      id: 'jvm',
      name: 'Java Virtual Machine',
      provenance: 'spec',
      children: [
        { id: 'heap', name: 'Heap', provenance: 'spec', children: [] },
        { id: 'interpreter', name: 'Interpreter', provenance: 'spec', children: [] },
      ],
    },
  ];

  it('supports arrow-key navigation and selection', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <ComponentTree roots={roots} selectedId={null} onSelect={onSelect} explored={{}} filter="" />,
    );
    const items = screen.getAllByRole('treeitem');
    expect(items).toHaveLength(3);
    act(() => items[0]!.focus());
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(items[1]);
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('heap');
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(items[0]);
    await user.keyboard('{ArrowLeft}');
    expect(screen.getAllByRole('treeitem')).toHaveLength(1);
  });

  it('filters by name', () => {
    render(
      <ComponentTree
        roots={roots}
        selectedId={null}
        onSelect={() => {}}
        explored={{}}
        filter="interp"
      />,
    );
    expect(screen.getAllByRole('treeitem').map((el) => el.textContent)).toEqual([
      'Java Virtual Machine',
      'Interpreter',
    ]);
  });
});

describe('JVM anatomy page', () => {
  it('selects a component from the diagram and shows it in the inspector', async () => {
    const { router } = renderInRouter(<JvmAnatomyPage />, '/anatomy');
    const heap = await screen.findByRole('button', { name: /^Heap, JVM specification concept/ });
    fireEvent.click(heap);
    expect(await screen.findByRole('heading', { level: 2, name: 'Heap' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?c=heap');
  });

  it('opens the execution walkthrough and steps forward', async () => {
    const user = userEvent.setup();
    renderInRouter(<JvmAnatomyPage />, '/anatomy?mode=execution&s=new-person');
    expect(await screen.findByText('Step 1 of 10')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next step' }));
    expect(await screen.findByText('Step 2 of 10')).toBeInTheDocument();
  });

  it('shows a dissection in internal mode', async () => {
    renderInRouter(<JvmAnatomyPage />, '/anatomy?mode=internal&c=heap');
    expect(await screen.findByText('Inside the heap')).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /Thread-local allocation buffers/ }).length,
    ).toBeGreaterThan(0);
  });
});

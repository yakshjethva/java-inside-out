import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { preferencesStore, progressStore } from '@/hooks/useLearningState';
import { usePageTitle } from '@/hooks/usePageTitle';
import { JourneyMachine } from '@/modules/journey/JourneyMachine';
import { StartHerePage } from '@/pages/StartHerePage';
import indexHtml from '../../index.html?raw';

function renderAt(element: React.ReactNode, path = '/') {
  const router = createMemoryRouter([{ path: '*', element }], { initialEntries: [path] });
  return { router, ...render(<RouterProvider router={router} />) };
}

beforeEach(() => {
  preferencesStore.reset();
  progressStore.reset();
});

describe('Start here', () => {
  it('introduces the lesson and lists its seven chapters', () => {
    renderAt(<StartHerePage />, '/start');
    expect(
      screen.getByRole('heading', { level: 1, name: 'What happens when you run a Java program?' }),
    ).toBeInTheDocument();
    const chapters = within(screen.getByRole('list', { name: 'Chapters' })).getAllByRole('link');
    expect(chapters).toHaveLength(8); // seven chapters and the recap
    expect(screen.getByRole('link', { name: /Start chapter 1/ })).toHaveAttribute(
      'href',
      '/start?chapter=program',
    );
  });

  it('asks for a prediction before showing what happens', async () => {
    const user = userEvent.setup();
    renderAt(<StartHerePage />, '/start?chapter=memory');
    expect(screen.getByRole('heading', { level: 1, name: 'Memory' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'What is going on' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /In the heap/ }));
    expect(screen.getByRole('heading', { name: 'What is going on' })).toBeInTheDocument();
    expect(screen.getByRole('figure', { name: /new Person\("Mia"\)/ })).toBeInTheDocument();
    expect(
      screen.getByText(/Objects live in the heap; the variable holds a reference/),
    ).toBeInTheDocument();
  });

  it('shows where each chapter lives on the JVM map', async () => {
    const user = userEvent.setup();
    renderAt(<StartHerePage />, '/start?chapter=memory');
    expect(screen.queryByRole('link', { name: /on the JVM map/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Skip the prediction and show me' }));
    expect(screen.getByRole('link', { name: 'Runtime data areas on the JVM map' })).toHaveAttribute(
      'href',
      '/anatomy?c=runtime-data-areas',
    );
  });

  it('explains at the chosen level and records the chapter when the learner moves on', async () => {
    const user = userEvent.setup();
    const { router } = renderAt(<StartHerePage />, '/start?chapter=compiler');
    await user.click(screen.getByRole('button', { name: 'Skip the prediction and show me' }));
    expect(screen.getByText(/checks it for mistakes, and writes a new file/)).toBeInTheDocument();
    await user.click(screen.getAllByRole('radio', { name: 'Developer' })[0]!);
    expect(screen.getByText(/410 bytes for this program/)).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /Next: The JVM/ }));
    expect(router.state.location.search).toBe('?chapter=jvm');
    expect(Object.keys(progressStore.get().lessons['first-run']!)).toEqual(['compiler']);
  });
});

describe('the journey machine', () => {
  it('follows the learner’s own line with the real class-file size', async () => {
    const user = userEvent.setup();
    renderAt(<JourneyMachine />);
    const input = screen.getByRole('textbox', { name: 'Your line of Java' });
    await user.clear(input);
    await user.type(input, 'Hi "there"');
    expect(input).toHaveValue('Hi there');
    await user.click(screen.getByRole('button', { name: '2. Class file' }));
    // 404 bytes plus the 8 bytes of "Hi there", measured with javac 25.0.4.
    expect(screen.getByText(/412 bytes of bytecode/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '7. Output' }));
    expect(screen.getByText(/produced a result: "Hi there"/)).toBeInTheDocument();
  });
});

describe('the site header', () => {
  it('keeps reference pages under More, as a disclosure that Escape closes', async () => {
    const user = userEvent.setup();
    renderAt(<SiteHeader />);
    const primary = screen.getByRole('navigation', { name: 'Primary' });
    expect(
      within(primary)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Start here', 'Learn', 'Explore the JVM', 'Glossary']);
    const more = within(primary).getByRole('button', { name: 'More' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    await user.click(more);
    expect(more).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /References/ })).toBeVisible();
    await user.keyboard('{Escape}');
    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(more).toHaveFocus();
  });

  it('shows the explanation level in plain words', () => {
    preferencesStore.set((p) => ({ ...p, level: 'deep' }));
    renderAt(<SiteHeader />);
    expect(screen.getByRole('button', { name: /Deep dive/ })).toBeInTheDocument();
  });
});

describe('page titles', () => {
  function Titled({ title }: { title?: string }) {
    usePageTitle(title);
    return null;
  }

  it('keep the homepage title identical to the one in index.html', () => {
    const staticTitle = indexHtml.match(/<title>([^<]*)<\/title>/)![1];
    render(<Titled />);
    expect(document.title).toBe(staticTitle);
    expect(document.title).toBe('Inside Java · Understand Java from the inside out');
  });

  it('name the page first everywhere else', () => {
    render(<Titled title="Glossary" />);
    expect(document.title).toBe('Glossary · Inside Java');
  });
});

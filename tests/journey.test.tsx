import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { STORAGE_KEY } from '../src/progression';
import { letter, story } from '../src/story';

// Keep the actual app, its controls, and its state. Only visual transition timing
// is replaced so behavior tests do not depend on animation-frame scheduling.
vi.mock('framer-motion', async () => {
  const React = await import('react');
  const components = new Map<string, ReturnType<typeof React.forwardRef>>();
  const visualProps = new Set(['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap', 'whileInView', 'viewport', 'layout', 'layoutId', 'onAnimationComplete']);
  const motion = new Proxy({}, {
    get(_target, tag: string) {
      if (!components.has(tag)) {
        const component = React.forwardRef<HTMLElement, Record<string, unknown>>((props, ref) => {
          const native = Object.fromEntries(Object.entries(props).filter(([key]) => !visualProps.has(key)));
          const animated = props.animate as Record<string, unknown> | undefined;
          const positions = Object.fromEntries(['left', 'top', 'right', 'bottom'].filter(key => animated && key in animated).map(key => [key, animated?.[key]]));
          return React.createElement(tag, { ...native, ref, style: { ...(native.style as object), ...positions } });
        });
        component.displayName = `ImmediateMotion(${tag})`;
        components.set(tag, component);
      }
      return components.get(tag);
    },
  });
  const PassThrough = ({ children }: { children: React.ReactNode }) => children;
  return { motion, AnimatePresence: PassThrough, MotionConfig: PassThrough, useReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches };
});

function mediaPreferences(reduced = true, coarse = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reduced : query.includes('pointer: coarse') ? coarse : false,
      media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
    })),
  });
}

beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, '', '/');
  mediaPreferences();
  window.scrollTo = vi.fn();
});

afterEach(() => cleanup());

const allChapters = { entered: true, accepted: true, quizComplete: true, opened: [1, 2, 3, 4, 5, 6] };

function bookmark(hash: string, progress: object) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  history.replaceState(null, '', `/#${hash}`);
}

describe('real story interface', () => {
  it('redirects an attempted final-page URL with a corrupt bookmark to the opening book', () => {
    localStorage.setItem(STORAGE_KEY, '{broken');
    history.replaceState(null, '', '/#letter');
    render(<App />);
    expect(screen.getByRole('heading', { name: /Some stories.*left unread/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Break the seal/ })).toBeNull();
    expect(location.hash).toBe('#cover');
    expect(document.activeElement).toBe(screen.getByRole('main'));
  });

  it('keeps No stationary for reduced motion and respects a real decline', async () => {
    bookmark('question', { entered: true });
    const user = userEvent.setup();
    render(<App />);
    const no = screen.getByRole('button', { name: 'No, actually' });
    const position = no.getAttribute('style');
    await user.hover(no);
    expect(no.getAttribute('style')).toBe(position);
    expect(screen.getByRole('status').textContent).toContain('An honest no is always allowed');
    await user.click(no);
    expect(screen.getByRole('heading', { name: /A good story can wait/i })).toBeTruthy();
    expect(screen.queryByText(story.quizQuestions[0].prompt)).toBeNull();
    await user.click(screen.getByRole('button', { name: /Close the book/i }));
    expect(screen.getByRole('button', { name: 'ENTER AT YOUR OWN RISK' })).toBeTruthy();
  });

  it('allows a keyboard user to decline without chasing the button', async () => {
    bookmark('question', { entered: true });
    mediaPreferences(false);
    const user = userEvent.setup();
    render(<App />);
    const no = screen.getByRole('button', { name: 'No, actually' });
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(no);
    await user.keyboard('{Enter}');
    expect(screen.getByRole('heading', { name: /A good story can wait/i })).toBeTruthy();
  });

  it('replaces an unavailable photograph with an accessible placeholder while keeping the story usable', () => {
    bookmark('truth', allChapters);
    render(<App />);
    const portrait = screen.getByRole('img', { name: 'Shalu in a pale blue sari' });
    fireEvent.error(portrait);
    const fallback = screen.getByRole('img', { name: 'Shalu in a pale blue sari' });
    expect(fallback.tagName).toBe('DIV');
    expect(fallback.textContent).toContain('A page held for you.');
    expect(screen.getByRole('button', { name: 'OPEN YOUR LETTER' })).toBeTruthy();
  });

  it('keeps the current chapter when the reader uses Skip to story', async () => {
    bookmark('truth', allChapters);
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('link', { name: 'Skip to story' }));
    await waitFor(() => expect(location.hash).toBe('#truth'));
    expect(screen.getByRole('heading', { name: /The plot twist.*It was always you/i })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole('main'));
  });

  it('lets the reader turn directly between chapters without returning to the archive', async () => {
    bookmark('chapters', { entered: true, accepted: true, quizComplete: true, opened: [1] });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /The Obsession/i }));
    expect(screen.getByRole('heading', { name: 'The Obsession' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /CH\. II/i }));
    expect(screen.getByRole('heading', { name: 'The Temptation' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'CH. I' }));
    expect(screen.getByRole('heading', { name: 'The Obsession' })).toBeTruthy();
  });
});

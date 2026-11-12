import { useEffect } from 'react';
import { sectionList } from '../data/sections';

const ids = sectionList.map((s) => s.id);

const isTypingTarget = (t: EventTarget | null): boolean =>
  t instanceof HTMLInputElement ||
  t instanceof HTMLTextAreaElement ||
  t instanceof HTMLSelectElement ||
  (t instanceof HTMLElement && (t.isContentEditable || t.closest('[role="dialog"]') !== null));

/**
 * Section-to-section keyboard navigation. Only PageUp/PageDown are captured: the arrow keys keep
 * their normal scrolling behaviour so the page never feels hijacked. Home/End jump to first/last section.
 */
export const useKeyboardNavigation = () => {
  useEffect(() => {
    const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

      const current = ids.findIndex((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top <= window.innerHeight / 2 && r.bottom >= window.innerHeight / 2;
      });

      switch (e.key) {
        case 'PageDown':
          if (current < ids.length - 1) {
            e.preventDefault();
            go(ids[current + 1]);
          }
          break;
        case 'PageUp':
          if (current > 0) {
            e.preventDefault();
            go(ids[current - 1]);
          }
          break;
        case 'Home':
          e.preventDefault();
          go(ids[0]);
          break;
        case 'End':
          e.preventDefault();
          go(ids[ids.length - 1]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};

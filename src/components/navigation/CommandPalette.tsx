import { useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { useLang, type L } from '../../i18n/context';
import { useUI } from '../../context/ui';
import { sectionList } from '../../data/sections';
import { projects } from '../../data/projects';
import { labText, ui } from '../../data/content';
import { siteConfig } from '../../config';
import { asset } from '../../utils/asset';
import { theme } from '../../styles/theme';

interface Command {
  id: string;
  group: L;
  label: string;
  hint?: string;
  run: () => void;
}

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(10, 12, 24, 0.75);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 12vh 1rem 1rem;
`;

const Panel = styled(motion.div)`
  width: min(640px, 100%);
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: #23263a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  color: ${theme.colors.textLight};
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1.2rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  color: inherit;
  font: inherit;
  font-size: 1.05rem;
  &:focus {
    outline: none;
    border-bottom-color: ${theme.colors.accent};
  }
`;

const List = styled.ul`
  list-style: none;
  overflow-y: auto;
  padding: 0.4rem;
`;

const GroupLabel = styled.li`
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.55;
  padding: 0.6rem 0.8rem 0.2rem;
`;

const Item = styled.li<{ active: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  cursor: pointer;
  background: ${(p) => (p.active ? 'rgba(0, 255, 255, 0.12)' : 'transparent')};
  color: ${(p) => (p.active ? theme.colors.light : 'inherit')};
  small {
    opacity: 0.6;
    white-space: nowrap;
  }
`;

const Empty = styled.p`
  padding: 1.5rem;
  text-align: center;
  opacity: 0.6;
`;

export function CommandPalette() {
  const { lang, setLang, t } = useLang();
  const { paletteOpen, setPaletteOpen, goTo, openProject, openLab } = useUI();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const close = () => setPaletteOpen(false);

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [];
    for (const s of sectionList) {
      list.push({ id: `go-${s.id}`, group: ui.paletteGroupSections, label: t(s.label), run: () => goTo(s.id) });
    }
    for (const p of projects) {
      list.push({
        id: `project-${p.id}`,
        group: ui.paletteGroupProjects,
        label: t(p.title),
        hint: p.tech.slice(0, 3).join(' · '),
        run: () => openProject(p.id),
      });
    }
    (['quant', 'nbody', 'lora'] as const).forEach((tab) => {
      list.push({ id: `lab-${tab}`, group: ui.paletteGroupLab, label: t(labText.tabs[tab]), run: () => openLab(tab) });
    });
    const actions: Command[] = [
      {
        id: 'lang',
        group: ui.paletteGroupActions,
        label: lang === 'en' ? 'Cambiar a español' : 'Switch to English',
        run: () => setLang(lang === 'en' ? 'es' : 'en'),
      },
      {
        id: 'mail',
        group: ui.paletteGroupActions,
        label: lang === 'en' ? 'Send an email' : 'Enviar un correo',
        hint: siteConfig.email,
        run: () => {
          window.location.href = `mailto:${siteConfig.email}`;
        },
      },
      {
        id: 'copy',
        group: ui.paletteGroupActions,
        label: t({ en: 'Copy email address', es: 'Copiar correo' }),
        run: () => {
          void navigator.clipboard?.writeText(siteConfig.email).catch(() => undefined);
        },
      },
      ...(
        [
          ['GitHub', siteConfig.github],
          ['LinkedIn', siteConfig.linkedin],
          ['ICPC', siteConfig.icpc],
        ] as const
      ).map(([name, href]) => ({
        id: `open-${name}`,
        group: ui.paletteGroupActions,
        label: t({ en: `Open ${name}`, es: `Abrir ${name}` }),
        run: () => {
          window.open(href, '_blank', 'noopener,noreferrer');
        },
      })),
    ];
    if (siteConfig.cv.enabled) {
      actions.push(
        {
          id: 'cv-en',
          group: ui.paletteGroupActions,
          label: t({ en: 'Download CV (English)', es: 'Descargar CV (inglés)' }),
          run: () => window.open(asset(siteConfig.cv.en), '_blank', 'noopener'),
        },
        {
          id: 'cv-es',
          group: ui.paletteGroupActions,
          label: t({ en: 'Download CV (Spanish)', es: 'Descargar CV (español)' }),
          run: () => window.open(asset(siteConfig.cv.es), '_blank', 'noopener'),
        },
      );
    }
    return [...list, ...actions];
  }, [lang, t, goTo, openProject, openLab, setLang]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    const words = q.split(/\s+/);
    return commands.filter((c) => {
      const hay = `${c.label} ${c.hint ?? ''}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [commands, query]);

  useEffect(() => {
    if (paletteOpen) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setQuery('');
      setIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      returnFocus.current?.focus?.();
    }
  }, [paletteOpen]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [index]);

  const runAt = (i: number) => {
    const cmd = filtered[i];
    if (!cmd) return;
    close();
    // let the dialog unmount first so scroll/focus work on the page underneath
    window.setTimeout(cmd.run, 30);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runAt(index);
    } else if (e.key === 'Tab') {
      e.preventDefault(); // single focusable control: keep focus in the input
    }
  };

  let lastGroup = '';
  return (
    <AnimatePresence>
      {paletteOpen && (
        <Backdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <Panel
            role="dialog"
            aria-modal="true"
            aria-label={t(ui.paletteTitle)}
            initial={{ y: -12, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -12, scale: 0.98 }}
            onKeyDown={onKeyDown}
          >
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(ui.palettePlaceholder)}
              aria-label={t(ui.palettePlaceholder)}
              role="combobox"
              aria-expanded="true"
              aria-controls="palette-list"
              aria-activedescendant={filtered[index] ? `cmd-${filtered[index].id}` : undefined}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
            <List id="palette-list" role="listbox" ref={listRef}>
              {filtered.length === 0 && <Empty>{t(ui.paletteEmpty)}</Empty>}
              {filtered.map((c, i) => {
                const g = t(c.group);
                const showGroup = g !== lastGroup;
                lastGroup = g;
                return (
                  <span key={c.id} style={{ display: 'contents' }}>
                    {showGroup && <GroupLabel role="presentation">{g}</GroupLabel>}
                    <Item
                      id={`cmd-${c.id}`}
                      role="option"
                      aria-selected={i === index}
                      data-active={i === index}
                      active={i === index}
                      onMouseMove={() => setIndex(i)}
                      onClick={() => runAt(i)}
                    >
                      <span>{c.label}</span>
                      {c.hint && <small>{c.hint}</small>}
                    </Item>
                  </span>
                );
              })}
            </List>
          </Panel>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}

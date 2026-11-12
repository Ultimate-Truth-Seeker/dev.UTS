import styled from '@emotion/styled';
import { motion, useScroll, useSpring } from 'framer-motion';
import { theme } from '../../styles/theme';
import { useEffect, useState } from 'react';
import { sectionList } from '../../data/sections';
import { useLang } from '../../i18n/context';
import { ui } from '../../data/content';

const NavContainer = styled(motion.nav)`
  position: fixed;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  background: ${theme.colors.glass.background}80;
  backdrop-filter: blur(10px);
  padding: ${theme.spacing.md} 0.7rem;
  border-radius: 50px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  box-shadow: 
    0 4px 24px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);

  @media print {
    display: none;
  }

  /* On phones the dots would cover the text; the header menu / command palette handles navigation. */
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    right: 0.25rem;
    padding: 0.7rem 0.5rem;
    gap: ${theme.spacing.md};
    background: ${theme.colors.glass.background};
  }

  @media (max-height: 500px) {
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.sm};
  }
`;

const NavDot = styled(motion.button, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.active ? theme.colors.accent : 'rgba(255, 255, 255, 0.3)'};
  border: 2px solid ${props => props.active ? theme.colors.accent : 'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  position: relative;
  opacity: ${props => props.active ? 1 : 0.7};
  transition: all ${theme.transitions.default};

  @media (max-width: ${theme.breakpoints.sm}) {
    width: 14px;
    height: 14px;
  }

  &:hover {
    opacity: 1;
    transform: scale(1.2);
    border-color: ${theme.colors.accent};
    background: ${props => props.active ? theme.colors.accent : 'rgba(255, 255, 255, 0.5)'};
  }

  &:focus {
    outline: none;
    box-shadow: 
      0 0 0 2px ${theme.colors.accent}40,
      0 0 0 4px ${theme.colors.accent}20;
  }

  &::before {
    content: attr(data-tooltip);
    position: absolute;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    background: ${theme.colors.glass.card};
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: all ${theme.transitions.default};
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    color: ${theme.colors.light};
    font-weight: 500;
    letter-spacing: 0.5px;

    @media (max-width: ${theme.breakpoints.sm}) {
      right: auto;
      left: -16px;
      transform: translate(-100%, -50%);
      font-size: 0.85rem;
      padding: 6px 12px;
    }
  }

  &:hover::before {
    opacity: 1;
    transform: translate(-100%, -50%);

    @media (min-width: ${theme.breakpoints.sm}) {
      right: 32px;
      transform: translateY(-50%) scale(1.02);
    }
  }

  @media (hover: none) {
    &:active {
      transform: scale(0.95);
    }
  }
`;

const ProgressBar = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    ${theme.colors.accent},
    ${theme.colors.accent}dd
  );
  transform-origin: 0%;
  z-index: 1000;
  box-shadow: 0 0 10px ${theme.colors.accent}80;

  @media print {
    display: none;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    height: 2px;
  }
`;


export const FloatingNav = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const { t } = useLang();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleScroll = () => {
      const mid = window.innerHeight / 2;
      for (const { id } of sectionList) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { top, bottom } = el.getBoundingClientRect();
        if (top <= mid && bottom >= mid) {
          setActiveSection((prev) => (prev === id ? prev : id));
          break;
        }
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const live = document.getElementById('section-announcer');
    const current = sectionList.find((s) => s.id === activeSection);
    if (live && current) live.textContent = `${t(ui.currentSection)}: ${t(current.label)}`;
  }, [activeSection, t]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleKeyDown = (e: React.KeyboardEvent, sectionId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      go(sectionId);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentIndex = sectionList.findIndex(({ id }) => id === sectionId);
      const nextIndex =
        e.key === 'ArrowUp' ? Math.max(0, currentIndex - 1) : Math.min(sectionList.length - 1, currentIndex + 1);
      go(sectionList[nextIndex].id);
    }
  };

  return (
    <>
      <ProgressBar style={{ scaleX }} aria-hidden="true" />
      <div id="section-announcer" className="sr-only" role="status" aria-live="polite" />
      <NavContainer aria-label="Sections">
        {sectionList.map(({ id, label }) => (
          <NavDot
            key={id}
            type="button"
            active={activeSection === id}
            onClick={() => go(id)}
            onKeyDown={(e) => handleKeyDown(e, id)}
            data-tooltip={t(label)}
            aria-label={t(label)}
            aria-current={activeSection === id ? 'true' : undefined}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </NavContainer>
    </>
  );
};

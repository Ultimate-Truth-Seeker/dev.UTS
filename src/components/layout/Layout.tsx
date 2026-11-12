import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { type ReactNode, useEffect } from 'react';
import { theme } from '../../styles/theme';
import { FloatingNav } from '../navigation/FloatingNav';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import ParticlesBackground from './ParticlesBackground';
import { useLang } from '../../i18n/context';
import { useUI } from '../../context/ui';
import { LangToggle } from '../ui/LangToggle';
import { sectionList } from '../../data/sections';
import { ui } from '../../data/content';
import { CommandPalette } from '../navigation/CommandPalette';

interface LayoutProps {
  children: ReactNode;
}

const LayoutWrapper = styled.div`
  @media print {
    background: white !important;
    color: black !important;
    
    * {
      color: black !important;
      text-shadow: none !important;
      box-shadow: none !important;
    }

    section {
      min-height: auto !important;
      padding: 2rem 0 !important;
      page-break-inside: avoid;
    }

    a[href]:after {
      content: " (" attr(href) ")";
      font-size: 0.8em;
    }
  }

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  position: relative;
  background: transparent;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 70% 30%,
      ${theme.colors.accent}15 0%,
      transparent 100%
    );
    pointer-events: none;
    z-index: 0;
  }
`;

const Header = styled.header`
  background: ${theme.colors.glass.background};
  backdrop-filter: blur(8px);
  padding: ${theme.spacing.md} 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;

  @media print {
    display: none;
  }
  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 0;
    right: 0;
    height: 20px;
    background: linear-gradient(to bottom, ${theme.colors.glass.background}, transparent);
  }
`;

const Nav = styled.nav`
  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 ${theme.spacing.md};
    max-width: 1200px;
    margin: 0 auto;
    width: 90%;
  }
`;

const Logo = styled(motion.div)`
  color: ${theme.colors.light};
  font-family: ${theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  white-space: nowrap;
  @media (max-width: 480px) {
    font-size: 1.15rem;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};

  a.nav-link {
    color: ${theme.colors.textLight};
    transition: all ${theme.transitions.default};
    font-weight: 500;
    font-size: 0.95rem;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: 4px;

    &:hover {
      color: ${theme.colors.light};
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  @media (max-width: 900px) {
    a.nav-link {
      display: none;
    }
  }
`;

const PaletteButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${theme.colors.textLight};
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  background: rgba(0, 0, 0, 0.2);

  kbd {
    font-family: inherit;
    font-size: 0.7rem;
    opacity: 0.7;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    padding: 0 0.3rem;
  }

  .short {
    display: none;
  }
  @media (max-width: 640px) {
    .full {
      display: none;
    }
    .short {
      display: inline;
    }
  }

  &:hover {
    border-color: ${theme.colors.accent};
    color: ${theme.colors.light};
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Main = styled.main`
  flex: 1;
  margin-top: 4.5rem;
  width: 100%;
  overflow-x: hidden;
`;

const SkipLink = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background: ${theme.colors.accent};
  color: ${theme.colors.textDark};
  padding: ${theme.spacing.sm};
  z-index: 9999;
  transition: top 0.2s;

  &:focus {
    top: 0;
  }
`;

const Footer = styled.footer`
  background: ${theme.colors.glass.background};
  backdrop-filter: blur(8px);
  color: ${theme.colors.textLight};
  padding: ${theme.spacing.lg} 0;
  text-align: center;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 0;
    right: 0;
    height: 20px;
    background: linear-gradient(to top, ${theme.colors.glass.background}, transparent);
  }
`;

const isMac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

export const Layout = ({ children }: LayoutProps) => {
  useKeyboardNavigation();
  const { t } = useLang();
  const { setPaletteOpen } = useUI();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPaletteOpen]);

  return (
    <LayoutWrapper>
      <ParticlesBackground/>
      <SkipLink href="#main-content">
        {t(ui.skip)}
      </SkipLink>

      <Header>
        <Nav aria-label="Main">
          <div className="container">
            <Logo
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <a href="#hero">{ui.brand}</a>
            </Logo>
            <NavLinks>
              {sectionList
                .filter((sec) => sec.id !== 'hero')
                .map((sec) => (
                  <a key={sec.id} className="nav-link" href={`#${sec.id}`}>
                    {t(sec.label)}
                  </a>
                ))}
              <PaletteButton type="button" onClick={() => setPaletteOpen(true)} aria-haspopup="dialog">
                <span className="full">{t(ui.paletteHint)}</span>
                <kbd className="full">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
                <span className="short">{t(ui.menu)}</span>
              </PaletteButton>
              <LangToggle />
            </NavLinks>
          </div>
        </Nav>
      </Header>
      <Main id="main-content" tabIndex={-1}>
        {children}
      </Main>
      <FloatingNav />
      <CommandPalette />
      <Footer>
        <div className="container">
          <p>© {new Date().getFullYear()} Roberto Nájera. {t(ui.footerRights)} · {t(ui.footerBuilt)}</p>
        </div>
      </Footer>
    </LayoutWrapper>
  );
};

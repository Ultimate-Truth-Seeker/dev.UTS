import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa';
import { useLang } from '../../i18n/context';
import { useUI } from '../../context/ui';
import { hero } from '../../data/content';
import { categoryColor, featuredProjects, projectById, projects } from '../../data/projects';
import { siteConfig } from '../../config';
import { theme } from '../../styles/theme';
import { GhostButton, PrimaryButton } from '../ui/primitives';
import { useScreenTexture } from './useScreenTexture';

const LaptopScene = lazy(() => import('./LaptopScene'));

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const HeroSection = styled.section`
  min-height: calc(100vh - 4.5rem);
  display: flex;
  align-items: center;
  padding: ${theme.spacing.lg} 0;
  color: ${theme.colors.textLight};
  scroll-margin-top: 4.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  gap: ${theme.spacing.lg};
  align-items: center;
  background: rgba(42, 45, 62, 0.5);
  border-radius: 20px;
  padding: ${theme.spacing.lg};

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
    padding: ${theme.spacing.md};
  }
`;

const Copy = styled.div`
  animation: ${fadeUp} 0.5s ease-out both;
  display: grid;
  gap: 1rem;
  .hi {
    color: ${theme.colors.textLight};
    opacity: 0.8;
    font-size: 1.1rem;
  }
  h1 {
    font-size: clamp(2.2rem, 5.5vw, 4rem);
    color: ${theme.colors.light};
    line-height: 1.05;
    letter-spacing: -0.02em;
  }
  .role {
    font-family: ${theme.fonts.heading};
    font-weight: 500;
    font-size: clamp(1.05rem, 2vw, 1.35rem);
    opacity: 0.95;
  }
  .blurb {
    opacity: 0.82;
    max-width: 56ch;
  }
  .avail {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.88rem;
    opacity: 0.9;
    &::before {
      content: '';
      width: 0.55rem;
      height: 0.55rem;
      border-radius: 50%;
      background: #3ddc84;
      box-shadow: 0 0 0 4px rgba(61, 220, 132, 0.2);
    }
  }
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  align-items: center;
`;

const Stats = styled.dl`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem 2rem;
  div {
    min-width: 8rem;
  }
  dt {
    font-family: ${theme.fonts.heading};
    font-size: 1.6rem;
    font-weight: 700;
    color: ${theme.colors.light};
  }
  dd {
    margin: 0;
    font-size: 0.8rem;
    opacity: 0.75;
    max-width: 14ch;
  }
`;

const Social = styled.div`
  display: flex;
  gap: 0.6rem;
  a {
    width: 2.4rem;
    height: 2.4rem;
    display: grid;
    place-items: center;
    font-size: 1.2rem;
    border-radius: 50%;
    background: ${theme.colors.glass.background};
    border: 1px solid rgba(255, 255, 255, 0.15);
    transition: all ${theme.transitions.default};
    &:hover {
      color: ${theme.colors.light};
      transform: translateY(-3px);
    }
    &:focus-visible {
      outline: 2px solid ${theme.colors.accent};
      outline-offset: 2px;
    }
  }
`;

const Stage = styled.figure`
  display: grid;
  gap: 0.6rem;
  min-width: 0;
`;

const SceneBox = styled.div`
  height: clamp(280px, 38vw, 420px);
  width: 100%;
  position: relative;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`;

const Placeholder = styled.div`
  height: 100%;
  display: grid;
  place-items: center;
  opacity: 0.6;
  font-size: 0.9rem;
  text-align: center;
  padding: 1rem;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: center;
`;

const ProjChip = styled.button<{ current: boolean; tint: string }>`
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  color: ${theme.colors.textLight};
  background: ${(p) => (p.current ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.05)')};
  border: 1px solid ${(p) => (p.current ? p.tint : 'rgba(255,255,255,0.18)')};
  transition: all 0.2s ease;
  &:hover,
  &:focus-visible {
    border-color: ${(p) => p.tint};
    background: rgba(255, 255, 255, 0.14);
    outline: none;
  }
`;

const Caption = styled.figcaption`
  text-align: center;
  font-size: 0.78rem;
  opacity: 0.6;
`;

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function Hero() {
  const { t, lang } = useLang();
  const { goTo, openProject, previewProject, setPreviewProject } = useUI();
  const [auto, setAuto] = useState(0);

  useEffect(() => {
    if (previewProject || reduceMotion()) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setAuto((i) => (i + 1) % featuredProjects.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [previewProject]);

  const shown = (previewProject && projectById(previewProject)) || featuredProjects[auto] || projects[0];
  const { texture, version } = useScreenTexture(shown, lang);

  const sceneFallback = <Placeholder>{t({ en: '3D preview unavailable on this device.', es: 'Vista 3D no disponible en este dispositivo.' })}</Placeholder>;

  return (
    <HeroSection id="hero" aria-label={t({ en: 'Introduction', es: 'Introducción' })}>
      <div className="container">
        <Grid>
          <Copy>
            <span className="hi">{t(hero.greeting)}</span>
            <h1>{hero.name}</h1>
            <p className="role">{t(hero.role)}</p>
            <p className="blurb">{t(hero.blurb)}</p>
            <span className="avail">{t(hero.availability)}</span>
            <Row>
              <PrimaryButton
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  goTo('projects');
                }}
              >
                {t(hero.ctaProjects)}
              </PrimaryButton>
              <GhostButton
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  goTo('contact');
                }}
              >
                {t(hero.ctaContact)}
              </GhostButton>
              <Social aria-label="Social">
                <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <FaGithub aria-hidden="true" />
                </a>
                <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <FaLinkedin aria-hidden="true" />
                </a>
                <a href={`mailto:${siteConfig.email}`} aria-label="Email">
                  <FaEnvelope aria-hidden="true" />
                </a>
              </Social>
            </Row>
            <Stats>
              {hero.stats.map((s) => (
                <div key={s.value}>
                  <dt>{s.value}</dt>
                  <dd>{t(s.label)}</dd>
                </div>
              ))}
            </Stats>
          </Copy>

          <Stage>
            <SceneBox role="img" aria-label={`${t({ en: '3D laptop showing', es: 'Laptop 3D mostrando' })} ${t(shown.title)}`}>
              <SceneBoundary fallback={sceneFallback}>
                <Suspense fallback={<Placeholder>…</Placeholder>}>
                  <LaptopScene texture={texture} version={version} />
                </Suspense>
              </SceneBoundary>
            </SceneBox>
            <Chips role="group" aria-label={t(hero.featuredLabel)}>
              {featuredProjects.map((p) => (
                <ProjChip
                  key={p.id}
                  type="button"
                  current={p.id === shown.id}
                  tint={categoryColor[p.category]}
                  onMouseEnter={() => setPreviewProject(p.id)}
                  onMouseLeave={() => setPreviewProject(null)}
                  onFocus={() => setPreviewProject(p.id)}
                  onBlur={() => setPreviewProject(null)}
                  onClick={() => openProject(p.id)}
                >
                  {t(p.title)}
                </ProjChip>
              ))}
            </Chips>
            <Caption>{t(hero.laptopHint)}</Caption>
          </Stage>
        </Grid>
      </div>
    </HeroSection>
  );
}

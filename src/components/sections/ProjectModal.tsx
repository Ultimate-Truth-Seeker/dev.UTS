import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { useLang } from '../../i18n/context';
import { useUI } from '../../context/ui';
import { categoryColor, categoryLabels, projectById, type Media } from '../../data/projects';
import { ui } from '../../data/content';
import { theme } from '../../styles/theme';
import { asset } from '../../utils/asset';
import { LazyVideo } from '../ui/LazyVideo';
import { CoverArt } from '../ui/CoverArt';
import { Chip, GhostButton, PrimaryButtonEl } from '../ui/primitives';

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 2500;
  background: rgba(10, 12, 24, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`;

const Dialog = styled(motion.div)`
  width: min(960px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  background: #23263a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  color: ${theme.colors.textLight};
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.55);
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 3;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  padding: 0;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 1.2rem;
  line-height: 1;
  border: 1px solid rgba(255, 255, 255, 0.3);
  &:hover {
    background: ${theme.colors.accent};
    color: ${theme.colors.textDark};
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Stage = styled.figure`
  background: #141622;
  height: clamp(200px, 48vh, 520px);
  width: 100%;
  position: relative;
  overflow: hidden;
  margin: 0;
  img,
  video,
  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #141622;
  }
  figcaption {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
  }
`;

const Thumbs = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem 0;
  overflow-x: auto;
`;

const Thumb = styled.button<{ active: boolean }>`
  flex: 0 0 auto;
  width: 88px;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid ${(p) => (p.active ? theme.colors.accent : 'transparent')};
  opacity: ${(p) => (p.active ? 1 : 0.65)};
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Content = styled.div`
  padding: 1.25rem 1.5rem 1.75rem;
  display: grid;
  gap: 1.1rem;

  h2 {
    font-size: clamp(1.4rem, 3vw, 2rem);
    color: ${theme.colors.light};
  }
  h3 {
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.65;
    margin-bottom: 0.4rem;
  }
  ul {
    padding-left: 1.2rem;
    display: grid;
    gap: 0.4rem;
  }
  li {
    opacity: 0.9;
  }
  .meta {
    opacity: 0.7;
    font-size: 0.9rem;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
`;

function MediaView({ media, label }: { media: Media; label: string }) {
  if (media.type === 'video') return <LazyVideo src={media.src} poster={media.poster} label={label} />;
  return <img src={asset(media.src)} alt={label} />;
}

export default function ProjectModal() {
  const { lang, t, tl } = useLang();
  const { selectedProject, openProject, openLab } = useUI();
  const project = selectedProject ? projectById(selectedProject) : undefined;
  const [mediaIndex, setMediaIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const close = () => openProject(null);

  useEffect(() => setMediaIndex(0), [selectedProject]);

  useEffect(() => {
    if (!project) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('button')?.focus());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      } else if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      returnFocus.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  const media = project?.media[mediaIndex];
  const mediaLabel = media ? (lang === 'en' ? media.caption.en : media.caption.es) : '';

  return (
    <AnimatePresence>
      {project && (
        <Backdrop
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <Dialog
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            style={{ ['--accent' as string]: categoryColor[project.category] }}
          >
            <CloseBtn type="button" onClick={close} aria-label={t(ui.close)}>
              ×
            </CloseBtn>
            <Stage>
              {media ? (
                <>
                  <MediaView media={media} label={mediaLabel} />
                  <figcaption>{mediaLabel}</figcaption>
                </>
              ) : (
                <CoverArt category={project.category} seed={project.id} />
              )}
            </Stage>
            {project.media.length > 1 && (
              <Thumbs>
                {project.media.map((m, i) => (
                  <Thumb
                    key={m.src}
                    type="button"
                    active={i === mediaIndex}
                    onClick={() => setMediaIndex(i)}
                    aria-label={lang === 'en' ? m.caption.en : m.caption.es}
                    aria-pressed={i === mediaIndex}
                  >
                    <img src={asset(m.type === 'video' ? m.poster : m.src)} alt="" loading="lazy" />
                  </Thumb>
                ))}
              </Thumbs>
            )}
            <Content>
              <div>
                <p className="meta">
                  {t(ui.caseStudy)} · {t(categoryLabels[project.category])} · {t(project.period)} · {t(project.role)}
                </p>
                <h2 id="project-modal-title">{t(project.title)}</h2>
                <p>{t(project.tagline)}</p>
              </div>

              <div>
                <h3>{t(ui.highlights)}</h3>
                <ul>
                  {tl(project.highlights).map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>

              {project.details.length > 0 && (
                <div>
                  <h3>{t(ui.technicalDetails)}</h3>
                  <div style={{ display: 'grid', gap: '0.9rem' }}>
                    {project.details.map((d) => (
                      <div key={d.title.en}>
                        <strong>{t(d.title)}</strong>
                        <ul>
                          {tl(d.items).map((it) => (
                            <li key={it}>{it}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="row" aria-label="Stack">
                {project.tech.map((x) => (
                  <Chip key={x}>{x}</Chip>
                ))}
              </div>

              <div className="row">
                {project.demo && (
                  <PrimaryButtonEl
                   
                    type="button"
                    onClick={() => {
                      const tab = project.demo!;
                      close();
                      window.setTimeout(() => openLab(tab), 50);
                    }}
                  >
                    ▶ {t(ui.tryDemo)}
                  </PrimaryButtonEl>
                )}
                {project.links.map((l) => (
                  <GhostButton key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                    {t(l.label)} ↗
                  </GhostButton>
                ))}
              </div>
            </Content>
          </Dialog>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}

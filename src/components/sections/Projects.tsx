import { useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useLang } from '../../i18n/context';
import { useUI } from '../../context/ui';
import { categoryColor, categoryLabels, coverImage, projects, type Category } from '../../data/projects';
import { ui } from '../../data/content';
import { theme } from '../../styles/theme';
import { asset } from '../../utils/asset';
import { CoverArt } from '../ui/CoverArt';
import { Chip, SectionLead, SectionTitle, SectionWrap } from '../ui/primitives';

const Filters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: ${theme.spacing.lg};
`;

const FilterBtn = styled.button<{ active: boolean }>`
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 600;
  color: ${(p) => (p.active ? theme.colors.textDark : theme.colors.textLight)};
  background: ${(p) => (p.active ? theme.colors.accent : 'rgba(255,255,255,0.06)')};
  border: 1px solid ${(p) => (p.active ? theme.colors.accent : 'rgba(255,255,255,0.18)')};
  &:focus-visible {
    outline: 2px solid ${theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: ${theme.spacing.lg};
`;

const Card = styled(motion.button)`
  text-align: left;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 16px;
  color: ${theme.colors.textLight};
  background: rgba(34, 37, 56, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: var(--accent);
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.accent};
    outline-offset: 3px;
  }
`;

const Cover = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  background: #1b1e2e;
  img,
  svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  svg {
    object-fit: cover;
  }
`;

const Badge = styled.span`
  position: absolute;
  left: 0.6rem;
  bottom: 0.6rem;
  font-size: 0.72rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: rgba(20, 22, 34, 0.85);
  border: 1px solid var(--accent);
  color: var(--accent);
`;

const Body = styled.div`
  padding: 1rem 1.1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;

  h3 {
    font-size: 1.15rem;
  }
  p {
    font-size: 0.92rem;
    opacity: 0.8;
  }
  small {
    opacity: 0.6;
  }
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: auto;
  padding-top: 0.4rem;
`;

const order: (Category | 'all')[] = ['all', 'ai', 'web', 'hpc', 'graphics', 'systems'];

export default function Projects() {
  const { t } = useLang();
  const { openProject } = useUI();
  const [filter, setFilter] = useState<Category | 'all'>('all');

  const shown = useMemo(() => projects.filter((p) => filter === 'all' || p.category === filter), [filter]);

  return (
    <SectionWrap id="projects" aria-labelledby="projects-title">
      <div className="container">
        <SectionTitle id="projects-title">{t({ en: 'Projects', es: 'Proyectos' })}</SectionTitle>
        <SectionLead>
          {t({
            en: 'Course work, team projects and personal experiments. Open any card for the case study and technical details.',
            es: 'Trabajos de curso, proyectos en equipo y experimentos personales. Abre cualquier tarjeta para ver el caso de estudio y los detalles técnicos.',
          })}
        </SectionLead>

        <Filters role="group" aria-label={t({ en: 'Filter projects', es: 'Filtrar proyectos' })}>
          {order.map((c) => (
            <FilterBtn key={c} type="button" active={filter === c} aria-pressed={filter === c} onClick={() => setFilter(c)}>
              {t(categoryLabels[c])}
            </FilterBtn>
          ))}
        </Filters>

        <Grid>
          {shown.map((p) => {
            const img = coverImage(p);
            const hasVideo = p.media.some((m) => m.type === 'video');
            return (
              <Card
                key={p.id}
                layout
                type="button"
                style={{ ['--accent' as string]: categoryColor[p.category] }}
                onClick={() => openProject(p.id)}
                aria-label={`${t(p.title)}. ${t(ui.viewCase)}`}
              >
                <Cover>
                  {img ? (
                    <img src={asset(img)} alt="" loading="lazy" />
                  ) : (
                    <CoverArt category={p.category} seed={p.id} />
                  )}
                  <Badge>
                    {p.demo ? t({ en: '▶ interactive demo', es: '▶ demo interactiva' }) : hasVideo ? t({ en: '▶ video', es: '▶ video' }) : t(categoryLabels[p.category])}
                  </Badge>
                </Cover>
                <Body>
                  <small>
                    {t(p.period)} · {t(p.role)}
                  </small>
                  <h3>{t(p.title)}</h3>
                  <p>{t(p.summary)}</p>
                  <Tags>
                    {p.tech.slice(0, 4).map((x) => (
                      <Chip key={x}>{x}</Chip>
                    ))}
                  </Tags>
                </Body>
              </Card>
            );
          })}
        </Grid>
      </div>
    </SectionWrap>
  );
}

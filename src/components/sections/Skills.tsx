import { lazy, Suspense } from 'react';
import styled from '@emotion/styled';
import { useLang } from '../../i18n/context';
import { skills } from '../../data/content';
import { theme } from '../../styles/theme';
import { Chip, Glass, SectionTitle, SectionWrap } from '../ui/primitives';

const GitHubActivity = lazy(() => import('./GitHubActivity'));

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: 1rem;
  margin-bottom: ${theme.spacing.lg};
`;

const Group = styled(Glass)`
  padding: 1.1rem 1.3rem;
  h3 {
    font-size: 1rem;
    color: ${theme.colors.light};
    margin-bottom: 0.7rem;
  }
  div {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
`;

export default function Skills() {
  const { t } = useLang();
  return (
    <SectionWrap id="skills" aria-labelledby="skills-title">
      <div className="container">
        <SectionTitle id="skills-title">{t(skills.title)}</SectionTitle>
        <Grid>
          {skills.groups.map((g) => (
            <Group key={g.id}>
              <h3>{t(g.title)}</h3>
              <div>
                {g.items.map((i) => (
                  <Chip key={i}>{i}</Chip>
                ))}
              </div>
            </Group>
          ))}
        </Grid>
        <Suspense fallback={null}>
          <GitHubActivity />
        </Suspense>
      </div>
    </SectionWrap>
  );
}

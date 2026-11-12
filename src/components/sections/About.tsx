import styled from '@emotion/styled';
import { useLang } from '../../i18n/context';
import { about } from '../../data/content';
import { theme } from '../../styles/theme';
import { Glass, SectionTitle, SectionWrap } from '../ui/primitives';

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: ${theme.spacing.lg};
  @media (max-width: 860px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Text = styled.div`
  display: grid;
  gap: 1rem;
  p {
    opacity: 0.88;
    max-width: 65ch;
  }
`;

const Facts = styled(Glass)`
  padding: 1.2rem 1.4rem;
  display: grid;
  gap: 0.9rem;
  align-content: start;
  dt {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.6;
  }
  dd {
    margin: 0;
  }
`;

export default function About() {
  const { t, tl } = useLang();
  return (
    <SectionWrap id="about" aria-labelledby="about-title">
      <div className="container">
        <SectionTitle id="about-title">{t(about.title)}</SectionTitle>
        <Grid>
          <Text>
            {tl(about.paragraphs).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Text>
          <Facts as="dl">
            {about.facts.map((f) => (
              <div key={f.label.en}>
                <dt>{t(f.label)}</dt>
                <dd>{t(f.value)}</dd>
              </div>
            ))}
          </Facts>
        </Grid>
      </div>
    </SectionWrap>
  );
}

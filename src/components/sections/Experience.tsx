import styled from '@emotion/styled';
import { useLang } from '../../i18n/context';
import { awards, experience } from '../../data/content';
import { siteConfig } from '../../config';
import { theme } from '../../styles/theme';
import { Chip, Glass, SectionTitle, SectionWrap } from '../ui/primitives';

const Timeline = styled.ol`
  list-style: none;
  border-left: 2px solid rgba(0, 255, 255, 0.3);
  margin-left: 0.4rem;
  padding-left: 1.6rem;
  display: grid;
  gap: 1.4rem;
`;

const Item = styled(Glass.withComponent('li'))`
  position: relative;
  padding: 1.1rem 1.3rem;
  &::before {
    content: '';
    position: absolute;
    left: -2.15rem;
    top: 1.4rem;
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
    background: ${theme.colors.accent};
    box-shadow: 0 0 0 4px rgba(0, 255, 255, 0.2);
  }
  header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.3rem 1rem;
    margin-bottom: 0.5rem;
  }
  h3 {
    font-size: 1.1rem;
  }
  .org {
    color: ${theme.colors.light};
    font-weight: 500;
  }
  .period {
    opacity: 0.65;
    font-size: 0.9rem;
  }
  ul {
    padding-left: 1.1rem;
    display: grid;
    gap: 0.35rem;
    opacity: 0.9;
    font-size: 0.95rem;
  }
  .stack {
    margin-top: 0.7rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }
`;

const AwardGrid = styled.ul`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const Award = styled(Glass.withComponent('li'))`
  padding: 1rem 1.2rem;
  .year {
    color: ${theme.colors.light};
    font-weight: 700;
    font-size: 0.85rem;
  }
  h4 {
    font-size: 1rem;
    margin: 0.2rem 0 0.4rem;
  }
  p {
    font-size: 0.9rem;
    opacity: 0.85;
  }
  a {
    color: ${theme.colors.light};
    text-decoration: underline;
  }
`;

const SubTitle = styled.h3`
  font-size: 1.5rem;
  color: ${theme.colors.light};
  margin-top: 3rem;
`;

export default function Experience() {
  const { t, tl } = useLang();
  return (
    <SectionWrap id="experience" aria-labelledby="experience-title">
      <div className="container">
        <SectionTitle id="experience-title">{t(experience.title)}</SectionTitle>
        <Timeline>
          {experience.items.map((it) => (
            <Item key={it.id}>
              <header>
                <div>
                  <h3>{t(it.title)}</h3>
                  <span className="org">{it.org}</span>
                </div>
                <span className="period">{t(it.period)}</span>
              </header>
              <ul>
                {tl(it.bullets).map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              {it.stack && (
                <div className="stack" aria-label="Stack">
                  {it.stack.split(', ').map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
              )}
            </Item>
          ))}
        </Timeline>

        <SubTitle>{t(awards.title)}</SubTitle>
        <AwardGrid>
          {awards.items.map((a) => (
            <Award key={a.id}>
              <span className="year">{a.year}</span>
              <h4>{t(a.title)}</h4>
              <p>{t(a.detail)}</p>
              {a.id === 'icpc26' && (
                <p>
                  <a href={siteConfig.icpc} target="_blank" rel="noopener noreferrer">
                    {t({ en: 'ICPC profile', es: 'Perfil ICPC' })} ↗
                  </a>
                </p>
              )}
            </Award>
          ))}
        </AwardGrid>
      </div>
    </SectionWrap>
  );
}

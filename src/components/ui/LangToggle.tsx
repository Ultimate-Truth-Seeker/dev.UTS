import styled from '@emotion/styled';
import { useLang, type Lang } from '../../i18n/context';
import { theme } from '../../styles/theme';

const Wrap = styled.div`
  display: inline-flex;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
`;

const Btn = styled.button<{ active: boolean }>`
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${(p) => (p.active ? theme.colors.textDark : theme.colors.textLight)};
  background: ${(p) => (p.active ? theme.colors.accent : 'transparent')};
  &:focus-visible {
    outline: 2px solid ${theme.colors.accent};
    outline-offset: -2px;
  }
`;

const options: { lang: Lang; label: string; full: string }[] = [
  { lang: 'en', label: 'EN', full: 'English' },
  { lang: 'es', label: 'ES', full: 'Español' },
];

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <Wrap role="group" aria-label={lang === 'en' ? 'Language' : 'Idioma'}>
      {options.map((o) => (
        <Btn
          key={o.lang}
          type="button"
          active={lang === o.lang}
          aria-pressed={lang === o.lang}
          lang={o.lang}
          title={o.full}
          onClick={() => setLang(o.lang)}
        >
          {o.label}
        </Btn>
      ))}
    </Wrap>
  );
}

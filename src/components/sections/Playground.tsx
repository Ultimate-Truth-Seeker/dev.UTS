import { lazy, Suspense } from 'react';
import styled from '@emotion/styled';
import { useLang } from '../../i18n/context';
import { useUI, type LabTab } from '../../context/ui';
import { labText } from '../../data/content';
import { theme } from '../../styles/theme';
import { SectionLead, SectionTitle, SectionWrap } from '../ui/primitives';

const QuantDeskDemo = lazy(() => import('./demos/QuantDeskDemo'));
const NBodyDemo = lazy(() => import('./demos/NBodyDemo'));
const LoraChart = lazy(() => import('./demos/LoraChart'));

const TabList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: ${theme.spacing.md};
`;

const TabBtn = styled.button<{ active: boolean }>`
  padding: 0.55rem 1.1rem;
  border-radius: 12px 12px 0 0;
  font-weight: 600;
  color: ${(p) => (p.active ? theme.colors.light : theme.colors.textLight)};
  background: ${(p) => (p.active ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.05)')};
  border-bottom: 2px solid ${(p) => (p.active ? theme.colors.accent : 'transparent')};
  &:focus-visible {
    outline: 2px solid ${theme.colors.accent};
    outline-offset: 2px;
  }
`;

const Loading = styled.p`
  padding: 3rem 0;
  text-align: center;
  opacity: 0.7;
`;

const tabs: LabTab[] = ['quant', 'nbody', 'lora'];

export default function Playground() {
  const { t, lang } = useLang();
  const { labTab, setLabTab } = useUI();

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    setLabTab(next);
    document.getElementById(`lab-tab-${next}`)?.focus();
  };

  return (
    <SectionWrap id="lab" aria-labelledby="lab-title">
      <div className="container">
        <SectionTitle id="lab-title">{t(labText.title)}</SectionTitle>
        <SectionLead>{t(labText.subtitle)}</SectionLead>
        <TabList role="tablist" aria-label={t(labText.title)}>
          {tabs.map((tab, i) => (
            <TabBtn
              key={tab}
              id={`lab-tab-${tab}`}
              role="tab"
              type="button"
              aria-selected={labTab === tab}
              aria-controls={`lab-panel-${tab}`}
              tabIndex={labTab === tab ? 0 : -1}
              active={labTab === tab}
              onClick={() => setLabTab(tab)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {t(labText.tabs[tab])}
            </TabBtn>
          ))}
        </TabList>
        <div id={`lab-panel-${labTab}`} role="tabpanel" aria-labelledby={`lab-tab-${labTab}`} lang={lang}>
          <Suspense fallback={<Loading>…</Loading>}>
            {labTab === 'quant' && <QuantDeskDemo />}
            {labTab === 'nbody' && <NBodyDemo />}
            {labTab === 'lora' && <LoraChart />}
          </Suspense>
        </div>
      </div>
    </SectionWrap>
  );
}

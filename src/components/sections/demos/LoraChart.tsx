import { useState } from 'react';
import styled from '@emotion/styled';
import { useLang, type L } from '../../../i18n/context';
import { theme } from '../../../styles/theme';

interface RowData {
  id: string;
  name: L;
  f1: number;
  f1sd?: number;
  params: number; // trainable parameters
  mem: number; // peak GPU memory, GB
  time: number; // seconds
  timeKind: L;
  highlight?: boolean;
}

// Source: ProyectoFinalDL results (870 test tweets, 5 seeds, free T4 GPU).
const rows: RowData[] = [
  { id: 'zs', name: { en: 'Zero-shot prompting', es: 'Prompting zero-shot' }, f1: 0.478, params: 0, mem: 3.6, time: 21, timeKind: { en: 'inference', es: 'inferencia' } },
  { id: 'fs', name: { en: 'Few-shot prompting', es: 'Prompting few-shot' }, f1: 0.479, f1sd: 0.026, params: 0, mem: 5.3, time: 93, timeKind: { en: 'inference', es: 'inferencia' } },
  { id: 'ft', name: { en: 'Full fine-tuning', es: 'Fine-tuning completo' }, f1: 0.667, f1sd: 0.012, params: 278e6, mem: 5.4, time: 422, timeKind: { en: 'training', es: 'entrenamiento' } },
  { id: 'lora', name: { en: 'LoRA (r=8)', es: 'LoRA (r=8)' }, f1: 0.673, f1sd: 0.013, params: 0.89e6, mem: 1.9, time: 33, timeKind: { en: 'training', es: 'entrenamiento' }, highlight: true },
];

type MetricId = 'f1' | 'params' | 'mem' | 'time';

const metrics: { id: MetricId; label: L; better: L; fmt: (v: number) => string; value: (r: RowData) => number }[] = [
  { id: 'f1', label: { en: 'Macro F1', es: 'F1 macro' }, better: { en: 'higher is better', es: 'más alto es mejor' }, fmt: (v) => v.toFixed(3), value: (r) => r.f1 },
  {
    id: 'params',
    label: { en: 'Trainable parameters', es: 'Parámetros entrenables' },
    better: { en: 'lower is cheaper', es: 'menos es más barato' },
    fmt: (v) => (v === 0 ? '0' : `${(v / 1e6).toFixed(v >= 100e6 ? 0 : 2)} M`),
    value: (r) => r.params,
  },
  { id: 'mem', label: { en: 'Peak GPU memory', es: 'Memoria pico de GPU' }, better: { en: 'lower is better', es: 'menos es mejor' }, fmt: (v) => `${v.toFixed(1)} GB`, value: (r) => r.mem },
  { id: 'time', label: { en: 'Time', es: 'Tiempo' }, better: { en: 'lower is better', es: 'menos es mejor' }, fmt: (v) => `${v} s`, value: (r) => r.time },
];

const Wrap = styled.div`
  display: grid;
  gap: 1rem;
`;

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${(p) => (p.active ? theme.colors.textDark : theme.colors.textLight)};
  background: ${(p) => (p.active ? theme.colors.accent : 'rgba(255,255,255,0.06)')};
  border: 1px solid ${(p) => (p.active ? theme.colors.accent : 'rgba(255,255,255,0.2)')};
`;

const Chart = styled.div`
  background: rgba(20, 22, 34, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 1rem 1.2rem;
  display: grid;
  gap: 0.9rem;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(7.5rem, 11rem) 1fr;
  gap: 0.8rem;
  align-items: center;
  font-size: 0.88rem;
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }
  .track {
    position: relative;
    height: 26px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
  }
  .bar {
    height: 100%;
    border-radius: 6px;
    transition: width 0.45s ease;
  }
  .label {
    position: absolute;
    left: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 700;
    font-size: 0.8rem;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
    white-space: nowrap;
  }
  .err {
    position: absolute;
    top: 50%;
    height: 2px;
    background: #fff;
    opacity: 0.85;
  }
`;

const Ratios = styled.ul`
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  li {
    flex: 1 1 10rem;
    padding: 0.7rem 0.9rem;
    border-radius: 12px;
    background: rgba(0, 255, 255, 0.07);
    border: 1px solid rgba(0, 255, 255, 0.25);
    strong {
      display: block;
      font-size: 1.3rem;
      color: ${theme.colors.light};
    }
    span {
      font-size: 0.8rem;
      opacity: 0.8;
    }
  }
`;

const Small = styled.p`
  font-size: 0.78rem;
  opacity: 0.7;
`;

export default function LoraChart() {
  const { lang, t } = useLang();
  const [metricId, setMetricId] = useState<MetricId>('f1');
  const [log, setLog] = useState(true);
  const metric = metrics.find((m) => m.id === metricId)!;
  const isParams = metricId === 'params';
  const useLog = isParams && log;
  const values = rows.map(metric.value);
  const max = Math.max(...values);
  const minPositive = Math.min(...values.filter((v) => v > 0));

  const width = (v: number): number => {
    if (v <= 0) return 0;
    if (useLog) {
      const lo = Math.log10(minPositive) - 0.5;
      return ((Math.log10(v) - lo) / (Math.log10(max) - lo)) * 100;
    }
    return (v / max) * 100;
  };

  const ft = rows.find((r) => r.id === 'ft')!;
  const lora = rows.find((r) => r.id === 'lora')!;

  return (
    <Wrap>
      <Tabs role="group" aria-label={lang === 'es' ? 'Métrica' : 'Metric'}>
        {metrics.map((m) => (
          <Tab key={m.id} type="button" active={m.id === metricId} aria-pressed={m.id === metricId} onClick={() => setMetricId(m.id)}>
            {t(m.label)}
          </Tab>
        ))}
        {isParams && (
          <Tab type="button" active={log} aria-pressed={log} onClick={() => setLog((v) => !v)}>
            {lang === 'es' ? 'Escala log' : 'Log scale'}
          </Tab>
        )}
        <span style={{ opacity: 0.65, fontSize: '0.8rem' }}>{t(metric.better)}</span>
      </Tabs>

      <Chart role="img" aria-label={`${t(metric.label)}: ${rows.map((r) => `${t(r.name)} ${metric.fmt(metric.value(r))}`).join(', ')}`}>
        {rows.map((r) => {
          const v = metric.value(r);
          const w = width(v);
          const color = r.highlight ? theme.colors.accent : r.id === 'ft' ? '#7aa2ff' : '#8b90ad';
          return (
            <Row key={r.id} title={metricId === 'time' ? `${metric.fmt(v)} (${t(r.timeKind)})` : undefined}>
              <span style={{ fontWeight: r.highlight ? 700 : 500, color: r.highlight ? theme.colors.light : undefined }}>{t(r.name)}</span>
              <div className="track">
                <div className="bar" style={{ width: `${w}%`, background: color, opacity: r.highlight ? 1 : 0.85 }} />
                {metricId === 'f1' && r.f1sd && (
                  <span
                    className="err"
                    style={{ left: `${((r.f1 - r.f1sd) / max) * 100}%`, width: `${((2 * r.f1sd) / max) * 100}%` }}
                    aria-hidden="true"
                  />
                )}
                <span className="label" style={{ color: w > 22 ? '#10121c' : '#fff', left: w > 22 ? 'auto' : `calc(${w}% + 0.5rem)`, right: w > 22 ? `calc(${100 - w}% + 0.5rem)` : 'auto' }}>
                  {metric.fmt(v)}
                  {metricId === 'f1' && r.f1sd ? ` ± ${r.f1sd.toFixed(3)}` : ''}
                  {metricId === 'time' ? ` (${t(r.timeKind)})` : ''}
                </span>
              </div>
            </Row>
          );
        })}
      </Chart>

      <Ratios>
        <li>
          <strong>{((lora.params / ft.params) * 100).toFixed(2)}%</strong>
          <span>{lang === 'es' ? 'de los parámetros entrenados frente al fine-tuning completo' : 'of the parameters trained vs. full fine-tuning'}</span>
        </li>
        <li>
          <strong>{(ft.mem / lora.mem).toFixed(1)}×</strong>
          <span>{lang === 'es' ? 'menos memoria pico de GPU' : 'less peak GPU memory'}</span>
        </li>
        <li>
          <strong>{(ft.time / lora.time).toFixed(1)}×</strong>
          <span>{lang === 'es' ? 'más rápido de entrenar' : 'faster to train'}</span>
        </li>
      </Ratios>

      <Small>
        {lang === 'es'
          ? 'Datos del proyecto ProyectoFinalDL: 870 tweets de prueba en español, media ± desviación estándar con 5 semillas (prompting zero-shot: una sola corrida determinista), GPU T4 gratuita. Los cocientes se calculan a partir de esos valores.'
          : 'Data from the ProyectoFinalDL project: 870 Spanish test tweets, mean ± standard deviation over 5 seeds (zero-shot prompting: a single deterministic run), free T4 GPU. The ratios are computed from those values.'}
      </Small>
    </Wrap>
  );
}

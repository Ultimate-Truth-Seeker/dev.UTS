import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useLang } from '../../../i18n/context';
import { theme } from '../../../styles/theme';
import { benchmark, NBodySim, type BenchPoint } from './nbodySim';

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: 1rem;
  @media (max-width: 860px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Card = styled.div`
  background: rgba(20, 22, 34, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  h4 {
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.75;
  }
  canvas {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 10px;
    background: #0b0d18;
  }
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1rem;
  align-items: center;
  label {
    display: flex;
    flex-direction: column;
    font-size: 0.75rem;
    gap: 0.2rem;
    opacity: 0.9;
  }
  select {
    background: rgba(0, 0, 0, 0.3);
    color: inherit;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 8px;
    padding: 0.3rem 0.5rem;
    font: inherit;
  }
  button {
    padding: 0.45rem 0.95rem;
    border-radius: 999px;
    font-weight: 700;
    background: ${theme.colors.accent};
    color: ${theme.colors.textDark};
    &:disabled {
      opacity: 0.5;
      cursor: wait;
    }
  }
`;

const Bars = styled.div`
  display: grid;
  gap: 0.55rem;
`;

const BarRow = styled.div`
  display: grid;
  grid-template-columns: 4.2rem 1fr 4.6rem;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.82rem;
  .track {
    position: relative;
    height: 14px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 7px;
    overflow: visible;
  }
  .fill {
    height: 100%;
    border-radius: 7px;
  }
  .ideal {
    position: absolute;
    top: -3px;
    bottom: -3px;
    width: 2px;
    background: rgba(255, 255, 255, 0.55);
  }
`;

const Small = styled.p`
  font-size: 0.78rem;
  opacity: 0.7;
`;

const ok = '#8affb0';

const text = {
  en: {
    live: 'Live simulation',
    bench: 'Speedup benchmark',
    bodies: 'Bodies',
    workers: 'Workers',
    start: 'Start',
    stop: 'Stop',
    run: 'Run benchmark',
    running: 'Running…',
    stepsPerSec: 'steps/s',
    steps: 'steps',
    cores: (n: number) => `Your browser reports ${n} logical cores.`,
    speedup: 'Speedup vs. 1 worker',
    same: 'Same checksum in every run: speed did not change the result.',
    differ: 'Checksums differ between runs.',
    cRef: 'Reference: the C/OpenMP study measured 1.97× (2 threads), 3.81× (4) and 3.78× (8) on a 4-core machine, 15,000 bodies.',
    why: 'Here every step sends all positions to every worker (message passing, no shared memory) so communication limits the gain for small N. Raise N to see scaling improve, just like the larger problems in the C study.',
    err: 'Web Workers are not available or failed to start in this browser.',
    ideal: 'ideal',
  },
  es: {
    live: 'Simulación en vivo',
    bench: 'Benchmark de speedup',
    bodies: 'Cuerpos',
    workers: 'Workers',
    start: 'Iniciar',
    stop: 'Detener',
    run: 'Ejecutar benchmark',
    running: 'Ejecutando…',
    stepsPerSec: 'pasos/s',
    steps: 'pasos',
    cores: (n: number) => `Tu navegador reporta ${n} núcleos lógicos.`,
    speedup: 'Speedup vs. 1 worker',
    same: 'Mismo checksum en todas las corridas: la velocidad no cambió el resultado.',
    differ: 'Los checksums difieren entre corridas.',
    cRef: 'Referencia: el estudio en C/OpenMP midió 1.97× (2 hilos), 3.81× (4) y 3.78× (8) en una máquina de 4 núcleos, con 15 000 cuerpos.',
    why: 'Aquí cada paso envía todas las posiciones a cada worker (paso de mensajes, sin memoria compartida), por lo que la comunicación limita la ganancia con N pequeño. Sube N para ver mejorar el escalado, igual que en los problemas grandes del estudio en C.',
    err: 'Los Web Workers no están disponibles o no pudieron iniciar en este navegador.',
    ideal: 'ideal',
  },
};

const hw = Math.min(16, Math.max(2, (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4));
const workerOptions = [...new Set([1, 2, 4, 8, hw].filter((w) => w <= Math.max(hw, 2)))].sort((a, b) => a - b);

export default function NBodyDemo() {
  const { lang } = useLang();
  const c = text[lang];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopRef = useRef(false);
  const [n, setN] = useState(1500);
  const [liveWorkers, setLiveWorkers] = useState(Math.min(4, hw));
  const [live, setLive] = useState(false);
  const [rate, setRate] = useState<number | null>(null);
  const [benchN, setBenchN] = useState(2000);
  const [results, setResults] = useState<BenchPoint[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const draw = useCallback((pos: Float64Array, count: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const size = canvas.width;
    ctx.fillStyle = '#0b0d18';
    ctx.fillRect(0, 0, size, size);
    const scale = size / 8;
    ctx.fillStyle = 'rgba(0,255,255,0.8)';
    for (let i = 1; i < count; i++) {
      const x = size / 2 + pos[3 * i] * scale;
      const y = size / 2 + pos[3 * i + 1] * scale;
      ctx.fillRect(x, y, 1.6, 1.6);
    }
    ctx.fillStyle = '#ffb86b';
    ctx.fillRect(size / 2 + pos[0] * scale - 2, size / 2 + pos[1] * scale - 2, 4, 4);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 480;
      canvas.height = 480;
    }
  }, []);

  const stopLive = useCallback(() => {
    stopRef.current = true;
  }, []);

  const startLive = useCallback(async () => {
    setError(false);
    setLive(true);
    stopRef.current = false;
    const sim = new NBodySim(n, liveWorkers);
    try {
      await sim.init();
      let frames = 0;
      let t0 = performance.now();
      while (!stopRef.current) {
        await sim.step();
        draw(sim.pos, n);
        frames++;
        const now = performance.now();
        if (now - t0 > 500) {
          setRate((frames * 1000) / (now - t0));
          frames = 0;
          t0 = now;
        }
      }
    } catch {
      setError(true);
    } finally {
      sim.dispose();
      setLive(false);
    }
  }, [n, liveWorkers, draw]);

  useEffect(() => () => stopLive(), [stopLive]);

  // Do not burn CPU while the simulation is off-screen or the tab is hidden.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stopLive();
    });
    io.observe(canvas);
    const onHide = () => document.hidden && stopLive();
    document.addEventListener('visibilitychange', onHide);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [stopLive]);

  const runBench = useCallback(async () => {
    setBusy(true);
    setError(false);
    setResults([]);
    try {
      const acc: BenchPoint[] = [];
      for (const w of workerOptions) {
        acc.push(await benchmark(benchN, 10, w));
        setResults([...acc]);
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }, [benchN]);

  const base = results.find((r) => r.workers === 1)?.ms;
  const maxSpeed = useMemo(() => Math.max(...workerOptions), []);
  const sameChecksum = results.length > 1 && results.every((r) => Math.abs(r.checksum - results[0].checksum) < 1e-6 * Math.abs(results[0].checksum || 1));

  return (
    <Layout>
      <Card>
        <h4>{c.live}</h4>
        <canvas ref={canvasRef} role="img" aria-label={c.live} />
        <Controls>
          <label>
            {c.bodies}
            <select value={n} onChange={(e) => setN(Number(e.target.value))} disabled={live}>
              {[500, 1000, 1500, 2500].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            {c.workers}
            <select value={liveWorkers} onChange={(e) => setLiveWorkers(Number(e.target.value))} disabled={live}>
              {workerOptions.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={live ? stopLive : startLive}>
            {live ? c.stop : c.start}
          </button>
          {rate !== null && (
            <span>
              {rate.toFixed(1)} {c.stepsPerSec}
            </span>
          )}
        </Controls>
        <Small>{c.cores(hw)}</Small>
      </Card>

      <Card>
        <h4>{c.bench}</h4>
        <Controls>
          <label>
            {c.bodies}
            <select value={benchN} onChange={(e) => setBenchN(Number(e.target.value))} disabled={busy}>
              {[1000, 2000, 4000, 6000].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={runBench} disabled={busy || live}>
            {busy ? c.running : c.run}
          </button>
          <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>10 {c.steps}</span>
        </Controls>
        <Bars aria-live="polite">
          {results.map((r) => {
            const sp = base ? base / r.ms : 1;
            return (
              <BarRow key={r.workers}>
                <span>
                  {r.workers} {r.workers === 1 ? 'worker' : 'workers'}
                </span>
                <div className="track">
                  <div className="fill" style={{ width: `${Math.min(100, (sp / maxSpeed) * 100)}%`, background: theme.colors.accent }} />
                  <div className="ideal" style={{ left: `${(r.workers / maxSpeed) * 100}%` }} title={c.ideal} />
                </div>
                <span>
                  {sp.toFixed(2)}× · {r.ms.toFixed(0)} ms
                </span>
              </BarRow>
            );
          })}
        </Bars>
        {results.length > 1 && (
          <Small style={{ color: sameChecksum ? ok : '#ff8a8a' }}>{sameChecksum ? `✓ ${c.same}` : c.differ}</Small>
        )}
        {results.length > 0 && (
          <Small>
            {c.speedup} · <span style={{ borderLeft: '2px solid rgba(255,255,255,0.6)', paddingLeft: 4 }}>{c.ideal}</span>
          </Small>
        )}
        {error && <Small style={{ color: '#ff8a8a' }}>{c.err}</Small>}
        <Small>{c.cRef}</Small>
        <Small>{c.why}</Small>
      </Card>
    </Layout>
  );
}

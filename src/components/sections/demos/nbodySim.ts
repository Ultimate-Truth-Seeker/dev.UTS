/** Main-thread driver for the Web Worker N-body simulation (message passing only, no SharedArrayBuffer). */

const DT = 0.01;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A thin rotating disc around one heavy body, seed 42, so every run starts identically. */
export function makeBodies(n: number) {
  const rand = mulberry32(42);
  const pos = new Float64Array(3 * n);
  const vel = new Float64Array(3 * n);
  const mass = new Float32Array(n);
  const central = 50;
  mass[0] = central;
  for (let i = 1; i < n; i++) {
    const r = 0.4 + 2.6 * Math.sqrt(rand());
    const a = rand() * Math.PI * 2;
    pos[3 * i] = r * Math.cos(a);
    pos[3 * i + 1] = r * Math.sin(a);
    pos[3 * i + 2] = (rand() - 0.5) * 0.08;
    mass[i] = 0.002;
    const v = Math.sqrt(central / r) * 0.95;
    vel[3 * i] = -v * Math.sin(a);
    vel[3 * i + 1] = v * Math.cos(a);
  }
  return { pos, vel, mass };
}

export class NBodySim {
  readonly n: number;
  readonly pos: Float64Array;
  private vel: Float64Array;
  private mass: Float32Array;
  private workers: Worker[] = [];

  constructor(n: number, readonly workerCount: number) {
    this.n = n;
    const b = makeBodies(n);
    this.pos = b.pos;
    this.vel = b.vel;
    this.mass = b.mass;
  }

  async init(): Promise<void> {
    this.workers = Array.from({ length: this.workerCount }, () => new Worker(new URL('./nbody.worker.ts', import.meta.url), { type: 'module' }));
    await Promise.all(
      this.workers.map(
        (w) =>
          new Promise<void>((resolve, reject) => {
            w.onmessage = () => resolve();
            w.onerror = (e) => reject(new Error(e.message || 'worker failed'));
            w.postMessage({ type: 'init', mass: this.mass });
          }),
      ),
    );
  }

  /** One leapfrog-style (semi-implicit Euler) step. */
  async step(): Promise<void> {
    const n = this.n;
    const k = this.workers.length;
    const posF32 = Float32Array.from(this.pos);
    const chunk = Math.ceil(n / k);
    const parts = await Promise.all(
      this.workers.map(
        (w, idx) =>
          new Promise<{ i0: number; acc: Float32Array }>((resolve, reject) => {
            const i0 = idx * chunk;
            const i1 = Math.min(n, i0 + chunk);
            if (i0 >= i1) {
              resolve({ i0, acc: new Float32Array(0) });
              return;
            }
            w.onmessage = (e: MessageEvent<{ type: string; i0: number; acc: Float32Array }>) => resolve({ i0: e.data.i0, acc: e.data.acc });
            w.onerror = (e) => reject(new Error(e.message || 'worker failed'));
            w.postMessage({ type: 'step', pos: posF32, i0, i1 });
          }),
      ),
    );
    for (const { i0, acc } of parts) {
      for (let q = 0; q < acc.length; q++) {
        const idx = 3 * i0 + q;
        this.vel[idx] += acc[q] * DT;
        this.pos[idx] += this.vel[idx] * DT;
      }
    }
  }

  checksum(): number {
    let s = 0;
    for (let i = 0; i < this.pos.length; i++) s += this.pos[i];
    return s;
  }

  dispose() {
    this.workers.forEach((w) => w.terminate());
    this.workers = [];
  }
}

export interface BenchPoint {
  workers: number;
  ms: number;
  checksum: number;
}

const WARMUP_STEPS = 3;
const REPEATS = 2;

/**
 * Benchmarks one worker count. Fresh workers run cold (JIT not warmed up), so a few untimed steps come first;
 * then the best of REPEATS timed runs is reported (the usual way to cut scheduling noise).
 * The checksum is taken after a fixed number of steps so every worker count reports the same state.
 */
export async function benchmark(n: number, steps: number, workerCount: number): Promise<BenchPoint> {
  const sim = new NBodySim(n, workerCount);
  try {
    await sim.init();
    for (let s = 0; s < WARMUP_STEPS; s++) await sim.step();
    let best = Infinity;
    for (let r = 0; r < REPEATS; r++) {
      const t0 = performance.now();
      for (let s = 0; s < steps; s++) await sim.step();
      best = Math.min(best, performance.now() - t0);
    }
    return { workers: workerCount, ms: best, checksum: sim.checksum() };
  } finally {
    sim.dispose();
  }
}

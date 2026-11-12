/// <reference lib="webworker" />
/**
 * Computes the gravitational acceleration for a slice [i0, i1) of the bodies.
 * Every worker holds the masses (sent once) and receives the full position array each step,
 * so the result of body i never depends on how the work is partitioned.
 */
type InitMsg = { type: 'init'; mass: Float32Array };
type StepMsg = { type: 'step'; pos: Float32Array; i0: number; i1: number };

let mass = new Float32Array(0);
const EPS2 = 0.0025;

self.onmessage = (e: MessageEvent<InitMsg | StepMsg>) => {
  const msg = e.data;
  if (msg.type === 'init') {
    mass = msg.mass;
    (self as DedicatedWorkerGlobalScope).postMessage({ type: 'ready' });
    return;
  }
  const { pos, i0, i1 } = msg;
  const n = mass.length;
  const acc = new Float32Array((i1 - i0) * 3);
  for (let i = i0; i < i1; i++) {
    const xi = pos[3 * i];
    const yi = pos[3 * i + 1];
    const zi = pos[3 * i + 2];
    let ax = 0;
    let ay = 0;
    let az = 0;
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const dx = pos[3 * j] - xi;
      const dy = pos[3 * j + 1] - yi;
      const dz = pos[3 * j + 2] - zi;
      const r2 = dx * dx + dy * dy + dz * dz + EPS2;
      const inv = mass[j] / (r2 * Math.sqrt(r2));
      ax += dx * inv;
      ay += dy * inv;
      az += dz * inv;
    }
    const o = 3 * (i - i0);
    acc[o] = ax;
    acc[o + 1] = ay;
    acc[o + 2] = az;
  }
  (self as DedicatedWorkerGlobalScope).postMessage({ type: 'acc', i0, acc }, [acc.buffer]);
};

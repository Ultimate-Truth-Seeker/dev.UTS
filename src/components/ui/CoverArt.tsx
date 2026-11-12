import { categoryColor, type Category } from '../../data/projects';

interface Props {
  category: Category;
  seed: string;
  className?: string;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic generative cover for projects that have no screenshot (never pretends to be a real capture). */
export function CoverArt({ category, seed, className }: Props) {
  const color = categoryColor[category];
  let h = hash(seed);
  const rnd = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    return (h % 1000) / 1000;
  };
  const dots = Array.from({ length: 26 }, () => ({ x: rnd() * 320, y: rnd() * 180, r: 1 + rnd() * 3 }));
  const lines = dots.slice(0, 12).map((d, i) => ({ a: d, b: dots[(i * 5 + 3) % dots.length] }));
  return (
    <svg className={className} viewBox="0 0 320 180" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`g-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b1e2e" />
          <stop offset="1" stopColor="#2f3350" />
        </linearGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#g-${seed})`} />
      {lines.map((l, i) => (
        <line key={i} x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} stroke={color} strokeOpacity="0.18" />
      ))}
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={color} fillOpacity="0.7" />
      ))}
    </svg>
  );
}

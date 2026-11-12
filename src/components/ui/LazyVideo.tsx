import { useEffect, useRef, useState } from 'react';
import { asset } from '../../utils/asset';

interface Props {
  src: string;
  poster: string;
  label: string;
  className?: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Muted looping clip that only downloads when scrolled near the viewport and pauses when it leaves.
 * With reduced motion enabled it shows the poster frame instead of playing.
 */
export function LazyVideo({ src, poster, label, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          void el.play().catch(() => undefined);
        } else {
          el.pause();
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  if (reduced) {
    return <img className={className} src={asset(poster)} alt={label} loading="lazy" />;
  }

  return (
    <video
      ref={ref}
      className={className}
      poster={asset(poster)}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
    >
      {near && <source src={asset(src)} type="video/mp4" />}
    </video>
  );
}

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LanguageContext, type L, type LL, type Lang } from './context';

const STORAGE_KEY = 'dev.uts.lang';

const META: Record<Lang, { title: string; description: string; locale: string }> = {
  en: {
    title: 'Roberto Nájera | AI Systems, Backend & Parallel Computing',
    description:
      'Computer Science student at UVG building AI-powered systems, backend services and high-performance software. 1st place in Guatemala at ICPC Gran Premio Centroamericano 2026.',
    locale: 'en_US',
  },
  es: {
    title: 'Roberto Nájera | Sistemas con IA, Backend y Cómputo Paralelo',
    description:
      'Estudiante de Ciencias de la Computación en la UVG que construye sistemas con IA, servicios backend y software de alto rendimiento. 1.er lugar en Guatemala en el ICPC Gran Premio Centroamericano 2026.',
    locale: 'es_GT',
  },
};

/** URL parameter > saved choice > browser language (Spanish browsers get Spanish, everyone else English). */
function detectLanguage(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl === 'en' || fromUrl === 'es') return fromUrl;
  } catch {
    /* ignore */
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'es') return saved;
  } catch {
    /* storage can be unavailable (private mode, blocked cookies) */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en';
  return nav.toLowerCase().startsWith('es') ? 'es' : 'en';
}

function setMeta(selector: string, attr: string, value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLanguage);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const meta = META[lang];
    document.documentElement.lang = lang;
    document.documentElement.translate = false; // the site is natively bilingual; browser auto-translate re-processes live demo text
    document.title = meta.title;
    setMeta('meta[name="description"]', 'content', meta.description);
    setMeta('meta[property="og:title"]', 'content', meta.title);
    setMeta('meta[property="og:description"]', 'content', meta.description);
    setMeta('meta[property="og:locale"]', 'content', meta.locale);
    setMeta('meta[name="twitter:title"]', 'content', meta.title);
    setMeta('meta[name="twitter:description"]', 'content', meta.description);
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (text: L) => text[lang],
      tl: (list: LL) => list[lang],
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

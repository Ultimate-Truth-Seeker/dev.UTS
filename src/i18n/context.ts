import { createContext, useContext } from 'react';

export type Lang = 'en' | 'es';
/** A string in both languages. */
export type L = { en: string; es: string };
/** A list of strings in both languages. */
export type LL = { en: string[]; es: string[] };

export interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (text: L) => string;
  tl: (list: LL) => string[];
}

export const LanguageContext = createContext<LangContextValue | null>(null);

export function useLang(): LangContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}

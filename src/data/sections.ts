import type { L } from '../i18n/context';

export interface SectionDef {
  id: string;
  label: L;
}

/** Order matters: it drives the header, the floating dots and the keyboard navigation. */
export const sectionList: SectionDef[] = [
  { id: 'hero', label: { en: 'Home', es: 'Inicio' } },
  { id: 'about', label: { en: 'About', es: 'Acerca de' } },
  { id: 'projects', label: { en: 'Projects', es: 'Proyectos' } },
  { id: 'lab', label: { en: 'Lab', es: 'Laboratorio' } },
  { id: 'experience', label: { en: 'Experience', es: 'Experiencia' } },
  { id: 'skills', label: { en: 'Skills', es: 'Habilidades' } },
  { id: 'contact', label: { en: 'Contact', es: 'Contacto' } },
];

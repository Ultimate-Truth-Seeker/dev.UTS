import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { UIContext, type LabTab } from './ui';

export function UIProvider({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [labTab, setLabTab] = useState<LabTab>('quant');
  const [previewProject, setPreviewProject] = useState<string | null>(null);

  const goTo = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, []);

  const openLab = useCallback(
    (tab: LabTab) => {
      setLabTab(tab);
      setSelectedProject(null);
      goTo('lab');
    },
    [goTo],
  );

  const value = useMemo(
    () => ({
      paletteOpen,
      setPaletteOpen,
      selectedProject,
      openProject: setSelectedProject,
      labTab,
      openLab,
      setLabTab,
      goTo,
      previewProject,
      setPreviewProject,
    }),
    [paletteOpen, selectedProject, labTab, openLab, goTo, previewProject],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

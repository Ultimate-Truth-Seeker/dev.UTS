import { createContext, useContext } from 'react';

export type LabTab = 'quant' | 'nbody' | 'lora';

export interface UIContextValue {
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  selectedProject: string | null;
  openProject: (id: string | null) => void;
  labTab: LabTab;
  openLab: (tab: LabTab) => void;
  setLabTab: (tab: LabTab) => void;
  goTo: (sectionId: string) => void;
  /** Project currently previewed on the 3D laptop screen (null = auto-cycle). */
  previewProject: string | null;
  setPreviewProject: (id: string | null) => void;
}

export const UIContext = createContext<UIContextValue | null>(null);

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}

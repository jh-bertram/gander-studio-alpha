import { create } from 'zustand';

export type AppMode = 'browse' | 'compose' | 'edit' | 'export' | 'sessions' | 'graph' | 'progression' | 'planning' | 'programs';

interface UIState {
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activeMode: 'browse',
  setActiveMode: (mode) => set({ activeMode: mode }),
}));

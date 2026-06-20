import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppMode = 'browse' | 'compose' | 'edit' | 'export' | 'sessions' | 'graph' | 'progression' | 'planning' | 'programs';

interface UIState {
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  // s4-p1 SUPPRESSION FOUNDATION: persisted mute toggle
  muted: boolean;
  toggleMuted: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeMode: 'browse',
      setActiveMode: (mode: AppMode) => set({ activeMode: mode }),
      muted: false,
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
    }),
    {
      name: 'gander-ui-store',
      // Partialize: persist ONLY muted — never activeMode.
      // activeMode must reset to 'browse' on hydrate so navigation is always clean.
      partialize: (state) => ({ muted: state.muted }),
    },
  ),
);

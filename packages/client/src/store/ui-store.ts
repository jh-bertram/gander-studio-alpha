import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppMode = 'browse' | 'compose' | 'edit' | 'export' | 'sessions' | 'graph' | 'progression' | 'planning' | 'programs';

interface UIState {
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  // s4-p1 SUPPRESSION FOUNDATION: persisted mute toggle
  muted: boolean;
  toggleMuted: () => void;
  // s2-to-s3-nav-contract: the roster/agent-detail selection seam. Ephemeral —
  // NOT persisted (see partialize below); s3 owns the dedicated detail surface.
  selectedAgentCode: string | null;
  setSelectedAgentCode: (code: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeMode: 'browse',
      setActiveMode: (mode: AppMode) => set({ activeMode: mode }),
      muted: false,
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      selectedAgentCode: null,
      setSelectedAgentCode: (code: string | null) => set({ selectedAgentCode: code }),
    }),
    {
      name: 'gander-ui-store',
      // Partialize: persist ONLY muted — never activeMode.
      // activeMode must reset to 'browse' on hydrate so navigation is always clean.
      partialize: (state) => ({ muted: state.muted }),
    },
  ),
);

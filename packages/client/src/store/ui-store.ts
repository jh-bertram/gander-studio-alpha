import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// s4-retirement (FE-CAT, Critic-ratified mode id): 'catalog' is the 13-role roster catalog,
// reached via the persistent "View Full Roster" CTA on the populated party home — NOT a rail
// destination (RAIL_ITEMS stays 4 entries).
// s4-retirement (FE-4): 'browse'/'edit'/'graph' RETIRED — their value is absorbed into the s3
// drill-downs (AgentDetailPage) and the s4 roster catalog; s3-drilldowns.spec.ts (8/8) +
// s2-party-shell.spec.ts (19/19) cited green this wave as the cut authorization.
export type AppMode = 'party' | 'sessions' | 'progression' | 'programs' | 'agent-detail' | 'catalog';

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
      activeMode: 'party',
      setActiveMode: (mode: AppMode) => set({ activeMode: mode }),
      muted: false,
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      selectedAgentCode: null,
      setSelectedAgentCode: (code: string | null) => set({ selectedAgentCode: code }),
    }),
    {
      name: 'gander-ui-store',
      // Partialize: persist ONLY muted — never activeMode.
      // activeMode must reset to 'party' on hydrate so navigation is always clean.
      partialize: (state) => ({ muted: state.muted }),
    },
  ),
);

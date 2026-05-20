import { create } from 'zustand';

export type AppMode = 'browse' | 'compose' | 'edit' | 'export' | 'sessions';

interface UIState {
  activeMode: AppMode;
  selectedAgentName: string | null;
  selectedSkillName: string | null;
  setActiveMode: (mode: AppMode) => void;
  setSelectedAgent: (name: string | null) => void;
  setSelectedSkill: (name: string | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activeMode: 'browse',
  selectedAgentName: null,
  selectedSkillName: null,
  setActiveMode: (mode) => set({ activeMode: mode }),
  setSelectedAgent: (name) => set({ selectedAgentName: name }),
  setSelectedSkill: (name) => set({ selectedSkillName: name }),
}));

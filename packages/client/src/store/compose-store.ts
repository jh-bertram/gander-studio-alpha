import { create } from 'zustand';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CurrentLoadout {
  name: string;
  agents: string[];   // agent names
  skills: string[];   // skill names
  hooks: string[];    // hook matchers / filePaths
}

interface ComposeState {
  currentLoadout: CurrentLoadout;
  addAgent: (name: string) => void;
  removeAgent: (name: string) => void;
  addSkill: (name: string) => void;
  removeSkill: (name: string) => void;
  addHook: (matcher: string) => void;
  removeHook: (matcher: string) => void;
  setLoadoutName: (name: string) => void;
  loadLoadout: (loadout: CurrentLoadout) => void;
  resetLoadout: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function dedupeAdd(arr: string[], item: string): string[] {
  if (arr.includes(item)) return arr;
  return [...arr, item];
}

function removeItem(arr: string[], item: string): string[] {
  return arr.filter(x => x !== item);
}

const EMPTY_LOADOUT: CurrentLoadout = {
  name: '',
  agents: [],
  skills: [],
  hooks: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useComposeStore = create<ComposeState>()((set) => ({
  currentLoadout: { ...EMPTY_LOADOUT },

  addAgent: (name) =>
    set((state) => ({
      currentLoadout: {
        ...state.currentLoadout,
        agents: dedupeAdd(state.currentLoadout.agents, name),
      },
    })),

  removeAgent: (name) =>
    set((state) => ({
      currentLoadout: {
        ...state.currentLoadout,
        agents: removeItem(state.currentLoadout.agents, name),
      },
    })),

  addSkill: (name) =>
    set((state) => ({
      currentLoadout: {
        ...state.currentLoadout,
        skills: dedupeAdd(state.currentLoadout.skills, name),
      },
    })),

  removeSkill: (name) =>
    set((state) => ({
      currentLoadout: {
        ...state.currentLoadout,
        skills: removeItem(state.currentLoadout.skills, name),
      },
    })),

  addHook: (matcher) =>
    set((state) => ({
      currentLoadout: {
        ...state.currentLoadout,
        hooks: dedupeAdd(state.currentLoadout.hooks, matcher),
      },
    })),

  removeHook: (matcher) =>
    set((state) => ({
      currentLoadout: {
        ...state.currentLoadout,
        hooks: removeItem(state.currentLoadout.hooks, matcher),
      },
    })),

  setLoadoutName: (name) =>
    set((state) => ({
      currentLoadout: { ...state.currentLoadout, name },
    })),

  loadLoadout: (loadout) =>
    set({
      currentLoadout: {
        name: loadout.name,
        agents: [...loadout.agents],
        skills: [...loadout.skills],
        hooks: [...loadout.hooks],
      },
    }),

  resetLoadout: () =>
    set({ currentLoadout: { ...EMPTY_LOADOUT } }),
}));

import { create } from 'zustand';
import type { Session } from '@gander-studio/shared';

export interface SessionState {
  sessions:             Session[];
  selectedSessionId:    string | null;
  // Multi-select for overview aggregate (parallel to single-select for detail nav)
  selectedSessionIds:   string[];
  activeTab:            string;
  editBuffer:           string;
  originalContent:      string;
  lastSaveResult:       { filePath: string } | null;
  lastSaveError:        string | null;

  setSelectedSessionId:    (id: string | null) => void;
  setSelectedSessionIds:   (ids: string[]) => void;
  toggleSelectedSessionId: (id: string) => void;
  selectAllSessions:       (ids: string[]) => void;
  clearAllSessions:        () => void;
  setActiveTab:            (tab: string) => void;
  setEditBuffer:           (content: string) => void;
  setOriginalContent:      (content: string) => void;
  setLastSaveResult:       (result: { filePath: string } | null) => void;
  setLastSaveError:        (error: string | null) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  sessions:             [],
  selectedSessionId:    null,
  selectedSessionIds:   [],
  activeTab:            'overview',
  editBuffer:           '',
  originalContent:      '',
  lastSaveResult:       null,
  lastSaveError:        null,

  setSelectedSessionId:  (selectedSessionId)  => set({ selectedSessionId }),
  setSelectedSessionIds: (selectedSessionIds) => set({ selectedSessionIds }),

  toggleSelectedSessionId: (id) => set((state) => {
    const current = state.selectedSessionIds;
    const exists = current.includes(id);
    // No-op if removing would empty the array (always keep ≥ 1 selected)
    if (exists && current.length === 1) return {};
    return {
      selectedSessionIds: exists
        ? current.filter((x) => x !== id)
        : [...current, id],
    };
  }),

  selectAllSessions: (ids) => set({ selectedSessionIds: ids }),
  clearAllSessions:  () => set({ selectedSessionIds: [] }),

  setActiveTab:       (activeTab)        => set({ activeTab }),
  setEditBuffer:      (editBuffer)       => set({ editBuffer }),
  setOriginalContent: (originalContent)  => set({ originalContent }),
  setLastSaveResult:  (lastSaveResult)   => set({ lastSaveResult }),
  setLastSaveError:   (lastSaveError)    => set({ lastSaveError }),
}));

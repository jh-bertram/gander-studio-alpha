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
  // D3: tracks the session id for which editBuffer was last seeded.
  // Used by useSessionRaw to detect session switches and reset the buffer.
  seededForId:          string | null;

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
  // D3: reset editBuffer + originalContent when the active session changes.
  // Clears seededForId so useSessionRaw will re-seed on next data arrival.
  resetEditBufferForSession: () => void;
  setSeededForId:          (id: string | null) => void;
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
  seededForId:          null,

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

  // D3: Reset the editor buffers when the user navigates to a different session.
  // Clears seededForId so useSessionRaw will re-seed from server data for the new id.
  // SC7 is preserved: this is called on session CHANGE (navigation), not on save error.
  resetEditBufferForSession: () =>
    set({ editBuffer: '', originalContent: '', seededForId: null }),

  setSeededForId: (seededForId) => set({ seededForId }),
}));

import { create } from 'zustand';
import type { Session } from '@gander-studio/shared';

export interface SessionState {
  sessions:          Session[];
  selectedSessionId: string | null;
  activeTab:         string;
  editBuffer:        string;
  originalContent:   string;
  lastSaveResult:    { filePath: string } | null;
  lastSaveError:     string | null;

  setSelectedSessionId: (id: string | null) => void;
  setActiveTab:         (tab: string) => void;
  setEditBuffer:        (content: string) => void;
  setOriginalContent:   (content: string) => void;
  setLastSaveResult:    (result: { filePath: string } | null) => void;
  setLastSaveError:     (error: string | null) => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  sessions:          [],
  selectedSessionId: null,
  activeTab:         'overview',
  editBuffer:        '',
  originalContent:   '',
  lastSaveResult:    null,
  lastSaveError:     null,

  setSelectedSessionId: (selectedSessionId) => set({ selectedSessionId }),
  setActiveTab:         (activeTab)         => set({ activeTab }),
  setEditBuffer:        (editBuffer)        => set({ editBuffer }),
  setOriginalContent:   (originalContent)   => set({ originalContent }),
  setLastSaveResult:    (lastSaveResult)    => set({ lastSaveResult }),
  setLastSaveError:     (lastSaveError)     => set({ lastSaveError }),
}));

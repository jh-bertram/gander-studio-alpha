import { create } from 'zustand';

export type EditSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface EditState {
  selectedFile: { type: 'agent' | 'skill'; name: string } | null;
  isDirty: boolean;
  saveStatus: EditSaveStatus;
  saveError: string | null;
  setSelectedFile: (file: { type: 'agent' | 'skill'; name: string } | null) => void;
  setIsDirty: (dirty: boolean) => void;
  setSaveStatus: (status: EditSaveStatus) => void;
  setSaveError: (err: string | null) => void;
}

export const useEditStore = create<EditState>()((set) => ({
  selectedFile: null,
  isDirty: false,
  saveStatus: 'idle',
  saveError: null,
  setSelectedFile: (file) => set({ selectedFile: file }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setSaveStatus: (status) => set({ saveStatus: status }),
  setSaveError: (err) => set({ saveError: err }),
}));

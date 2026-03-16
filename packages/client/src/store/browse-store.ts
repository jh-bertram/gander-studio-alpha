import { create } from 'zustand';

export type TypeFilter  = 'all' | 'agents' | 'skills' | 'hooks';
export type TierFilter  = 'all' | 'core' | 'impl' | 'optional';
export type ModelFilter = 'all' | 'opus' | 'sonnet' | 'haiku';

export interface SelectedItem {
  type: 'agent' | 'skill' | 'hook';
  name: string;
}

export interface BrowseState {
  typeFilter:   TypeFilter;
  tierFilter:   TierFilter;
  modelFilter:  ModelFilter;
  search:       string;
  selectedItem: SelectedItem | null;

  setTypeFilter:   (f: TypeFilter)           => void;
  setTierFilter:   (f: TierFilter)           => void;
  setModelFilter:  (f: ModelFilter)          => void;
  setSearch:       (s: string)               => void;
  setSelectedItem: (item: SelectedItem | null) => void;
}

export const useBrowseStore = create<BrowseState>()((set) => ({
  typeFilter:   'all',
  tierFilter:   'all',
  modelFilter:  'all',
  search:       '',
  selectedItem: null,

  setTypeFilter:   (typeFilter)   => set(
    typeFilter !== 'agents'
      ? { typeFilter, tierFilter: 'all', modelFilter: 'all' }
      : { typeFilter },
  ),
  setTierFilter:   (tierFilter)   => set({ tierFilter }),
  setModelFilter:  (modelFilter)  => set({ modelFilter }),
  setSearch:       (search)       => set({ search }),
  setSelectedItem: (selectedItem) => set({ selectedItem }),
}));

import type { AppMode } from '../store/ui-store';

export interface NavItemDef {
  mode: AppMode;
  label: string;
  dotColor: string;
}

export const NAV_ITEMS: NavItemDef[] = [
  { mode: 'browse', label: 'Browse', dotColor: 'var(--mt)' },
  { mode: 'compose', label: 'Compose', dotColor: 'var(--my)' },
  { mode: 'edit', label: 'Edit', dotColor: 'var(--mg)' },
  { mode: 'export', label: 'Export', dotColor: 'var(--mb)' },
];

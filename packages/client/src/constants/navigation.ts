import { Users, FileClock, TrendingUp, GitBranch, type LucideIcon } from 'lucide-react';
import type { AppMode } from '../store/ui-store';

interface NavItemDef {
  mode: AppMode;
  label: string;
  dotColor: string;
}

export const NAV_ITEMS: NavItemDef[] = [
  { mode: 'browse', label: 'Browse', dotColor: 'var(--mt)' },
  { mode: 'compose', label: 'Compose', dotColor: 'var(--my)' },
  { mode: 'edit', label: 'Edit', dotColor: 'var(--mg)' },
  { mode: 'export', label: 'Export', dotColor: 'var(--mb)' },
  { mode: 'sessions', label: 'Sessions', dotColor: 'var(--mp)' },
  { mode: 'graph', label: 'Graph', dotColor: 'var(--mr)' },
  { mode: 'progression', label: 'Progression', dotColor: 'var(--mo)' },
  { mode: 'planning', label: 'Planning', dotColor: 'var(--my)' },
  { mode: 'programs', label: 'Programs', dotColor: 'var(--cgr)' },
];

interface RailItemDef {
  label: string;
  mode: AppMode;
  icon: LucideIcon;
}

// s2-to-s4-nav-shell: SubmenuRail item constants (t3 builds the rail component).
export const RAIL_ITEMS: RailItemDef[] = [
  // s3 nav-contract resolution (t4b): Roster now maps to 'party' — the party-home affordance.
  // This is the intended target; SubmenuRail's isActive→aria-current logic legitimately marks
  // Roster as current while on the party home (human-ratified aria-current-at-home semantic).
  { label: 'Roster', mode: 'party', icon: Users },
  { label: 'Sessions', mode: 'sessions', icon: FileClock },
  { label: 'Progression', mode: 'progression', icon: TrendingUp },
  { label: 'Programs', mode: 'programs', icon: GitBranch },
];

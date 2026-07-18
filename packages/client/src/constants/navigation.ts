import { Users, FileClock, TrendingUp, GitBranch, type LucideIcon } from 'lucide-react';
import type { AppMode } from '../store/ui-store';

// s4-retirement (FE-1b): the 9-tab v1 nav config is retired. RAIL_ITEMS
// (below) is the sole nav-destination source of truth, consumed by both SubmenuRail (>=640px)
// and the repurposed BottomTabBar <640px fold (components/BottomTabBar.tsx) — byte-identical,
// unchanged by this retirement.

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

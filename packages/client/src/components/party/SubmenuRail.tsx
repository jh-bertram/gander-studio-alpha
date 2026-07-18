import { cn } from '../../lib/utils';
import { RAIL_ITEMS } from '../../constants/navigation';
import { useUIStore } from '../../store/ui-store';
import { Button } from '../ui/button';

// docs/v2-vision/v2-design-spec.md <component_hierarchy> SubmenuRail + <states> submenu-item-active.
//
// Spec-primitive→substitute mapping (amendment W2, Critic-RATIFIED, not a fidelity deviation):
//   Card     → PartyMemberCard  (this package, custom, FF7-tokened)
//   Badge    → RoleTag          (this package, custom, FF7-tokened)
//   Progress → StatBar          (t2, custom new_pattern_proposal)
//   Skeleton → shimmer-box      (existing components/ui/shimmer-box.tsx — t4 consumes)
//   Alert    → error-state      (existing components/ui/error-state.tsx — t4 consumes)
// SubmenuRail itself reuses the already-installed `<Button variant="ghost">` primitive verbatim
// (no substitution needed here) — recorded for completeness so the mapping is visible wherever a
// party/ component references it. Rationale (stated once, centrally): components/ui/ contains
// only {button, popover, dialog, select, input, textarea, shimmer-box, error-state} — none of the
// five spec-named Shadcn primitives are installed, and installing raw Shadcn primitives collides
// with the FF7 Mako token system (memorized S2 gotcha). CR#1 disk-verified and ratified.

// ORC brief directive: active-item styling follows the accessibility_spec.contrast_pairs table
// ("Active submenu label, page-title rule accent text": foreground --mt on background --sfh,
// 5.38:1 AA) — that table is CANONICAL over the <states> "submenu-item-active" prose (which names
// `--nav-active-bg`, a translucent overlay). Solid `--sfh` is the background actually used below.
const RAIL_ICON_SIZE_PX = 16;

export default function SubmenuRail() {
  const { activeMode, setActiveMode } = useUIStore();

  return (
    <nav role="navigation" aria-label="Main navigation" className="flex flex-col gap-1">
      {RAIL_ITEMS.map((item) => {
        const isActive = activeMode === item.mode;
        const Icon = item.icon;
        return (
          <Button
            key={item.mode}
            type="button"
            variant="ghost"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => setActiveMode(item.mode)}
            className={cn('tab-item justify-start gap-2')}
            style={{
              height: 'auto',
              padding: '8px 12px',
              justifyContent: 'flex-start',
              color: isActive ? 'var(--mt)' : 'var(--wm)',
              background: isActive ? 'var(--sfh)' : 'transparent',
              borderLeft: `2px solid ${isActive ? 'var(--mt)' : 'transparent'}`,
              borderRadius: 0,
            }}
          >
            <Icon aria-hidden="true" size={RAIL_ICON_SIZE_PX} />
            <span>{item.label}</span>
          </Button>
        );
      })}
    </nav>
  );
}

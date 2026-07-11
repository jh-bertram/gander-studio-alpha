import { RAIL_ITEMS } from '../constants/navigation';
import { useUIStore } from '../store/ui-store';

// v2 nav-shell fold (s4 FE-1b, docs/v2-vision/v2-design-spec.md <responsive> lines 85-88 +
// Mobile lines 70-74): BottomTabBar is repurposed as the <640px-only mobile form of the global
// SubmenuRail — "reusing the app's current bottom-tab pattern... no new nav mechanism" — rendering
// the SAME RAIL_ITEMS (4 destinations) SubmenuRail renders at >=640px. role="tablist"/role="tab"/
// aria-label="Main navigation" are unchanged from the retired 9-tab v1 bar (only the item source
// changed to RAIL_ITEMS, the same list SubmenuRail consumes at >=640px).
//
// Mutual exclusivity (one "Main navigation" landmark visible per viewport, never zero, never
// duplicate): SubmenuRail's `.app-shell-rail` is `display:none` below 640px / `display:block` at
// >=640px (globals.css, FE-1a). This component's fold is the exact inverse, reusing the SAME
// 640px breakpoint value via a component-scoped `<style>` tag (precedent: MateriaCanvas.tsx's
// LOADOUT_LIST_PANEL_RESPONSIVE_CSS) — deliberately NOT touching globals.css/AppShell.tsx, which
// are FE-1a's files and out of this packet's scope.
const BOTTOM_TAB_FOLD_RESPONSIVE_CSS = `
  @media (min-width: 640px) {
    .bottom-tab-fold { display: none !important; }
  }
`;

const BOTTOM_TAB_ICON_SIZE_PX = 18;

export default function BottomTabBar() {
  const { activeMode, setActiveMode } = useUIStore();

  return (
    <>
      <style>{BOTTOM_TAB_FOLD_RESPONSIVE_CSS}</style>
      <div
        role="tablist"
        aria-label="Main navigation"
        className="bottom-tab-fold"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: 'var(--sf)',
          borderTop: '1px solid var(--bd)',
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
        }}
      >
        {RAIL_ITEMS.map((item) => {
          const active = activeMode === item.mode;
          const Icon = item.icon;
          return (
            <button
              key={item.mode}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveMode(item.mode)}
              style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${active ? 'var(--mt)' : 'transparent'}`,
                color: active ? 'var(--mt)' : 'var(--wm)',
                cursor: 'pointer',
                fontSize: '11px',
                transition: 'all 0.16s',
              }}
              className="tab-item"
            >
              <Icon aria-hidden="true" size={BOTTOM_TAB_ICON_SIZE_PX} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

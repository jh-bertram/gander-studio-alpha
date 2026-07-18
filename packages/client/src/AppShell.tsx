import Header from './components/Header';
import ModeContent from './components/ModeContent';
import BottomTabBar from './components/BottomTabBar';
import SubmenuRail from './components/party/SubmenuRail';

// v2 nav-shell hoist (s4 FE-1a/FE-1b, shipped): SubmenuRail is the GLOBAL primary nav, rendered
// on every surface (not just PartyPage). Below 640px, BottomTabBar folds the SAME RAIL_ITEMS nav
// into a bottom tablist (role="tablist"/"tab" per item) — it is NOT a retired fallback nav; exactly
// one "Main navigation" landmark is visible at any viewport width, never zero. DOM order below is
// load-bearing for locator work targeting either nav form.
export default function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      <div className="app-shell-rail">
        <SubmenuRail />
      </div>
      <ModeContent />
      <BottomTabBar />
    </div>
  );
}

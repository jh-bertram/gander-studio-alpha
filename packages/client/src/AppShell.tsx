import Header from './components/Header';
import ModeContent from './components/ModeContent';
import BottomTabBar from './components/BottomTabBar';
import SubmenuRail from './components/party/SubmenuRail';

// v2 nav-shell hoist (s4 FE-1a): SubmenuRail is now the GLOBAL primary nav, rendered on every
// surface (not just PartyPage). The 9-tab BottomTabBar stays mounted as fallback nav this packet
// (FE-1b retires it / folds it to a <640px-only rail form) — nav is provably never zero at any
// width while both are present. DOM order below is load-bearing for FE-1b's locator work.
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

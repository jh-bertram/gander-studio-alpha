import Header from './components/Header';
import ModeContent from './components/ModeContent';
import BottomTabBar from './components/BottomTabBar';

export default function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      <ModeContent />
      <BottomTabBar />
    </div>
  );
}

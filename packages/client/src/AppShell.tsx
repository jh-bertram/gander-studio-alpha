import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ModeContent from './components/ModeContent';
import BottomTabBar from './components/BottomTabBar';

export default function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      <Sidebar />
      <ModeContent />
      <BottomTabBar />
    </div>
  );
}

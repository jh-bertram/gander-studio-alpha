import React from 'react';
import { useUIStore } from '../store/ui-store';
import type { AppMode } from '../store/ui-store';
import BrowsePage from '../pages/BrowsePage';
import ComposePage from '../pages/ComposePage';
import EditPage from '../pages/EditPage';
import ExportPage from '../pages/ExportPage';
import SessionsRouter from '../pages/sessions/SessionsRouter';
import GraphPage from '../pages/GraphPage';
import ProgressionPage from '../pages/ProgressionPage';
import PlanningPage from '../pages/PlanningPage';
import ProgramDagPage from '../pages/ProgramDagPage';

const PAGE_MAP: Record<AppMode, React.ComponentType> = {
  browse: BrowsePage,
  compose: ComposePage,
  edit: EditPage,
  export: ExportPage,
  sessions: SessionsRouter,
  graph: GraphPage,
  progression: ProgressionPage,
  planning: PlanningPage,
  programs: ProgramDagPage,
};

export default function ModeContent() {
  // Primitive selector — avoids Zustand v5 infinite-loop from object-returning selectors.
  const activeMode = useUIStore((s) => s.activeMode);
  const ActivePage = PAGE_MAP[activeMode];

  return (
    <main
      id="mode-content"
      style={{
        gridArea: 'mn',
        overflowY: 'auto',
        paddingTop: '28px',
        paddingRight: '28px',
        paddingLeft: '28px',
        paddingBottom: '56px',
      }}
    >
      {/* key={activeMode} causes React to unmount+remount the wrapper on mode-switch,
          re-triggering the .mode-enter CSS animation (defined in globals.css by s4-p1).
          Reduced-motion: animation:none, opacity:1, transform:none — instant switch.
          Header.tsx and BottomTabBar.tsx are NOT touched by this component. */}
      {ActivePage && (
        <div
          key={activeMode}
          className="mode-enter"
          style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
        >
          <ActivePage />
        </div>
      )}
    </main>
  );
}

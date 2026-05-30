import React from 'react';
import { useUIStore } from '../store/ui-store';
import type { AppMode } from '../store/ui-store';
import BrowsePage from '../pages/BrowsePage';
import ComposePage from '../pages/ComposePage';
import EditPage from '../pages/EditPage';
import ExportPage from '../pages/ExportPage';
import SessionsRouter from '../pages/sessions/SessionsRouter';
import GraphPage from '../pages/GraphPage';

const PAGE_MAP: Record<AppMode, React.ComponentType> = {
  browse: BrowsePage,
  compose: ComposePage,
  edit: EditPage,
  export: ExportPage,
  sessions: SessionsRouter,
  graph: GraphPage,
};

export default function ModeContent() {
  const { activeMode } = useUIStore();
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
      {ActivePage && <ActivePage />}
    </main>
  );
}

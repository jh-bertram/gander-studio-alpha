import React from 'react';
import { useUIStore } from '../store/ui-store';
import type { AppMode } from '../store/ui-store';
import BrowsePage from '../pages/BrowsePage';
import ComposePage from '../pages/ComposePage';
import EditPage from '../pages/EditPage';
import ExportPage from '../pages/ExportPage';

const PAGE_MAP: Partial<Record<AppMode, React.ComponentType>> = {
  browse: BrowsePage,
  compose: ComposePage,
  edit: EditPage,
  export: ExportPage,
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
        padding: '28px',
      }}
    >
      {ActivePage && <ActivePage />}
    </main>
  );
}

import { useUIStore } from '../store/ui-store';
import BrowsePage from '../pages/BrowsePage';
import ComposePage from '../pages/ComposePage';
import EditPage from '../pages/EditPage';
import ExportPage from '../pages/ExportPage';

const PAGE_MAP = {
  browse: BrowsePage,
  compose: ComposePage,
  edit: EditPage,
  export: ExportPage,
} as const;

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
      <ActivePage />
    </main>
  );
}

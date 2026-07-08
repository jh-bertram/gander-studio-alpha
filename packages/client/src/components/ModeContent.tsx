import React, { Suspense } from 'react';
import { useUIStore } from '../store/ui-store';
import type { AppMode } from '../store/ui-store';
import BrowsePage from '../pages/BrowsePage';
import EditPage from '../pages/EditPage';
import ExportPage from '../pages/ExportPage';
import SessionsRouter from '../pages/sessions/SessionsRouter';
import ProgressionPage from '../pages/ProgressionPage';
import PlanningPage from '../pages/PlanningPage';
import ShimmerBox from './ui/shimmer-box';

// Route-level code-split (remediation t5-rem, AUD#5): t5's PAGE_MAP wiring was the sole/first
// static importer of PartyPage's module subtree (0 refs at HEAD before t5), which pulled that
// whole subtree into the main chunk and pushed it over the 1000 kB hard gate (1,035.70 kB).
// React.lazy defers PartyPage to its own dynamic-import chunk, fetched only when
// activeMode === 'party'. Scope: this file only, per the remediation's authorized file scope.
const PartyPage = React.lazy(() => import('../pages/PartyPage'));

// Route-level code-split (remediation t5-rem2, residual QA Bundle Size Gate fail): rem1's
// PartyPage split alone left the main chunk 25.44 kB over the 1000 kB gate. GraphPage and
// ProgramDagPage both statically import @xyflow/react (react-flow), and ComposePage pulls the
// same library for the materia canvas — this pre-existing weight, unrelated to Party, is the
// bulk of the residual overage. Deferring all three to their own dynamic-import chunks (same
// pattern as PartyPage, same shared Suspense boundary) removes react-flow from the main chunk
// entirely; it now loads only when the user switches to graph/programs/compose.
const ComposePage = React.lazy(() => import('../pages/ComposePage'));
const GraphPage = React.lazy(() => import('../pages/GraphPage'));
const ProgramDagPage = React.lazy(() => import('../pages/ProgramDagPage'));

const PAGE_MAP: Record<AppMode, React.ComponentType> = {
  party: PartyPage,
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

// Suspense fallback for the lazy-loaded chunk gap. Reuses the shimmer-box loading treatment
// (design-spec amendment W2, Skeleton -> shimmer-box mapping — same primitive PartyPage's own
// internal loading state uses) so the fallback renders the spec's loading state, not a blank.
function ModeContentFallback() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4" style={{ padding: '4px 0' }}>
      <span className="sr-only">Loading…</span>
      <ShimmerBox style={{ height: '24px', width: '40%', borderRadius: '6px' }} />
      <ShimmerBox style={{ height: '160px', width: '100%', borderRadius: 'var(--radius)' }} />
    </div>
  );
}

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
          <Suspense fallback={<ModeContentFallback />}>
            <ActivePage />
          </Suspense>
        </div>
      )}
    </main>
  );
}

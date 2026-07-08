import { Users } from 'lucide-react';
import type { PartyMember } from '@gander-studio/shared';
import { useParty } from '../hooks/useParty';
import { useUIStore } from '../store/ui-store';
import PartyMemberCard from '../components/party/PartyMemberCard';
import SubmenuRail from '../components/party/SubmenuRail';
import ShimmerBox from '../components/ui/shimmer-box';
import ErrorState from '../components/ui/error-state';
import { Button } from '../components/ui/button';

// docs/v2-vision/v2-design-spec.md <component_hierarchy> PartyScreenPage + <states> (loading,
// empty, error, default) + <layout> (responsive rail/grid).
//
// Spec-primitive→substitute mapping (amendment W2, Critic-RATIFIED, not a fidelity deviation):
//   Card     → PartyMemberCard  (t3, custom, FF7-tokened)
//   Badge    → RoleTag          (t3, custom, FF7-tokened)
//   Progress → StatBar          (t2, custom new_pattern_proposal)
//   Skeleton → shimmer-box      (existing components/ui/shimmer-box.tsx — THIS file consumes)
//   Alert    → error-state      (existing components/ui/error-state.tsx — THIS file consumes)
// Rationale (stated once, centrally): components/ui/ contains only {button, popover, dialog,
// select, input, textarea, shimmer-box, error-state} — none of the five spec-named Shadcn
// primitives are installed, and installing raw Shadcn primitives collides with the FF7 Mako
// token system (memorized S2 gotcha: Shadcn defaults → invisible text). CR#1 disk-verified this
// substitution and ratified it — DRY + collision-avoidance, not a fidelity shortfall.
//
// RAIL MOUNT (plan R-3): SubmenuRail is mounted page-local here (desktop-only, hidden below
// `lg`), NOT hoisted into the global AppShell this sprint — s4 lifts it when it removes
// BottomTabBar. `AppShell.tsx`/`ModeContent.tsx` are untouched by this packet (t5 owns wiring
// PartyPage into PAGE_MAP; this file exists unrouted until then).

const PARTY_GRID_CLASS = 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3';
// DESIGN.md "Collapsible sidebar" Component Rule open width. Collapse/expand interaction is
// explicitly DEFERRED to s4 (amendment W5 R-9) — the rail renders at this single fixed width.
const RAIL_COLUMN_WIDTH_PX = '240px';
const SKELETON_CARD_COUNT = 6;
const PARTY_GRID_DISPLAY_CAP = 6; // sample_data_appendix: "six front-row cards, not all thirteen"

export type PartyGridStateKind = 'loading' | 'empty' | 'error' | 'default';

/**
 * Pure state-selection derivation — the exact mutually-exclusive PartyGrid state contract
 * (design_spec <states>), extracted from JSX so it is unit-testable without a DOM/rendering
 * harness (this repo's vitest.config.ts is `environment: 'node'`, no @testing-library/react —
 * same rationale as StatBar's `computeStatBarViewModel`, t2). Precedence: loading > error >
 * empty > default, matching react-query's own isLoading/isError semantics.
 */
export function derivePartyGridState({
  isLoading,
  isError,
  members,
}: {
  isLoading: boolean;
  isError: boolean;
  members: PartyMember[] | undefined;
}): PartyGridStateKind {
  if (isLoading) return 'loading';
  if (isError) return 'error';
  if (!members || members.length === 0) return 'empty';
  return 'default';
}

/** Most-recent `lastActivityTs` across all members, or null if none has recorded activity. */
export function computeMostRecentActivityTs(members: PartyMember[]): string | null {
  let latest: string | null = null;
  for (const member of members) {
    if (member.lastActivityTs !== null && (latest === null || member.lastActivityTs > latest)) {
      latest = member.lastActivityTs;
    }
  }
  return latest;
}

/** ScopeSummary text: "{n}-agent roster · updated {most-recent lastActivityTs, formatted}". */
export function formatScopeSummary(members: PartyMember[]): string {
  const latest = computeMostRecentActivityTs(members);
  const updated = latest === null ? 'no recorded activity' : new Date(latest).toLocaleDateString();
  return `${members.length}-agent roster · updated ${updated}`;
}

/** ErrorPartyState message: "Couldn't load party data — {error}." (design_spec <states> error). */
export function formatPartyError(error: unknown): string {
  const detail = error instanceof Error ? error.message : String(error);
  return `Couldn't load party data — ${detail}.`;
}

function PartyScreenHeader({ members }: { members: PartyMember[] | undefined }) {
  return (
    <header className="flex flex-col gap-2">
      <h1
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '16px', // DESIGN.md type scale: lg
          fontWeight: 600,
          color: 'var(--w)',
          margin: 0,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: '2px',
            height: '18px',
            background: 'var(--mt)',
            flexShrink: 0,
            display: 'inline-block',
          }}
        />
        Party Screen
      </h1>
      {members ? (
        <p
          style={{
            fontSize: '10px', // DESIGN.md type scale: xs
            color: 'var(--wm)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: 0,
          }}
        >
          {formatScopeSummary(members)}
        </p>
      ) : null}
    </header>
  );
}

function PartyGridSkeleton() {
  return (
    <div aria-busy="true" className={PARTY_GRID_CLASS}>
      <span className="sr-only">Loading party roster…</span>
      {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="flex flex-col gap-3"
          style={{
            padding: '16px',
            background: 'var(--sf)',
            border: '1px solid var(--bd)',
            borderRadius: 'var(--radius)',
          }}
        >
          <ShimmerBox style={{ aspectRatio: '1 / 1', width: '100%', borderRadius: 'var(--radius)' }} />
          <ShimmerBox style={{ height: '14px', width: '60%', borderRadius: '6px' }} />
          <div className="flex flex-col gap-2">
            <ShimmerBox style={{ height: '6px', width: '100%', borderRadius: '6px' }} />
            <ShimmerBox style={{ height: '6px', width: '100%', borderRadius: '6px' }} />
            <ShimmerBox style={{ height: '6px', width: '100%', borderRadius: '6px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyPartyState({ onViewRoster }: { onViewRoster: () => void }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3"
      style={{ padding: '48px 24px', textAlign: 'center' }}
    >
      <Users aria-hidden="true" size={32} style={{ color: 'var(--wm)' }} />
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--w)', margin: 0 }}>
        No Active Party Members Yet
      </h2>
      <p style={{ fontSize: '12px', color: 'var(--wd)', margin: 0, maxWidth: '360px' }}>
        No agent activity found in the configured session sources for this window.
      </p>
      <Button type="button" variant="default" onClick={onViewRoster}>
        View Full Roster
      </Button>
    </div>
  );
}

function ErrorPartyState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <ErrorState error={formatPartyError(error)} />
      <Button type="button" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export default function PartyPage() {
  const { data, isLoading, isError, error, refetch } = useParty();
  const setActiveMode = useUIStore((s) => s.setActiveMode);
  const setSelectedAgentCode = useUIStore((s) => s.setSelectedAgentCode);

  const state = derivePartyGridState({ isLoading, isError, members: data?.members });

  function handleSelect(code: string) {
    // s3 nav-contract resolution (t4b): routes to the dedicated agent-detail drill-down,
    // registered as an AppMode + lazy PAGE_MAP entry by t4a. setSelectedAgentCode remains the
    // seam that scopes AgentDetailPage's getAgentDetail query to the clicked card.
    setSelectedAgentCode(code);
    setActiveMode('agent-detail');
  }

  // TODO(s4-cut): re-point "View Full Roster" when BrowsePage is deleted — 'browse' leaves the
  // AppMode union, so this must retarget the 13-role roster catalog (or 'party'). Deferred-work
  // pointer: prog-studio-v2 s4 Browse-cut packet. (nav-contract retain decision, s3.)
  function handleViewRoster() {
    setActiveMode('browse');
  }

  const showDiagnostics =
    (state === 'default' || state === 'empty') &&
    data !== undefined &&
    (data.diagnostics.invalidLineCount > 0 || data.diagnostics.uncountedEventTypes > 0);

  return (
    <div data-testid="party-page" className="flex flex-col gap-6">
      <PartyScreenHeader members={data?.members} />

      <div className="flex gap-6">
        <div className="hidden lg:flex" style={{ width: RAIL_COLUMN_WIDTH_PX, flexShrink: 0 }}>
          <SubmenuRail />
        </div>

        <div className="flex flex-1 flex-col gap-4">
          {state === 'loading' && <PartyGridSkeleton />}
          {state === 'error' && <ErrorPartyState error={error} onRetry={refetch} />}
          {state === 'empty' && <EmptyPartyState onViewRoster={handleViewRoster} />}
          {state === 'default' && data && (
            <div className={PARTY_GRID_CLASS}>
              {data.members.slice(0, PARTY_GRID_DISPLAY_CAP).map((member) => (
                <PartyMemberCard key={member.code} member={member} onSelect={handleSelect} />
              ))}
            </div>
          )}

          {showDiagnostics && data && (
            <p style={{ fontSize: '10px', color: 'var(--wm)', margin: 0 }}>
              data quality: {data.diagnostics.invalidLineCount} unparsed lines ·{' '}
              {data.diagnostics.uncountedEventTypes} uncounted event types
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

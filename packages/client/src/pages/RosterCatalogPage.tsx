import { Users } from 'lucide-react';
import { useParty } from '../hooks/useParty';
import { useUIStore } from '../store/ui-store';
import PartyMemberCard from '../components/party/PartyMemberCard';
import { Button } from '../components/ui/button';
import {
  derivePartyGridState,
  PARTY_GRID_CLASS,
  PartyScreenHeader,
  PartyGridSkeleton,
  ErrorPartyState,
} from './PartyPage';

// prog-studio-v2-2026-07-s4-retirement-FE-CAT — the 13-role roster catalog (s3 ratification #1,
// docs/v2-vision/v2-design-spec.md <submenu_structure> #1: "the full 13-role catalog including
// roles with zero corpus activity ... never silently hidden"). Reached ONLY via the persistent
// "View Full Roster" CTA on the POPULATED party home (PartyPage.tsx, human-ratified 2026-07-10,
// ORC-witnessed) — NOT a rail destination (RAIL_ITEMS stays 4 entries; no rail item is marked
// aria-current while this page is active, since 'catalog' has no RAIL_ITEMS entry).
//
// DATA SOURCE (DRY, jidoka-confirmed): the SAME `useParty`/`roster.getParty` envelope PartyPage
// consumes — assembleParty (server) always returns one PartyMember per canonical ROSTER entry,
// so this page renders it UNCAPPED (no `.slice`) instead of PartyPage's
// `PARTY_GRID_DISPLAY_CAP`. Count is entirely data-driven — no hardcoded role count anywhere in
// this file. Never `agent.list` (under-counts the roster) and no new BE procedure.
//
// REUSE (DRY, packet directive — search before authoring new components): PartyMemberCard,
// PARTY_GRID_CLASS, PartyScreenHeader, PartyGridSkeleton, and ErrorPartyState are all imported
// verbatim from PartyPage.tsx (exported there for this purpose) rather than re-implemented here.
// Only the empty state is catalog-specific (PartyPage's EmptyPartyState CTA re-navigates to the
// roster, which is meaningless from within the roster itself).

const PAGE_TESTID = 'roster-catalog-page';
const CATALOG_TITLE = 'Full Roster';

// DESIGN.md "Empty state" Component Rule (icon + heading + body + CTA, all four required) —
// same rule PartyPage's EmptyPartyState follows, applied to the catalog's own (in practice
// unreachable via live data, since assembleParty always returns the full canonical ROSTER —
// defensive/honest coverage per the accessibility mandate that no component may handle only the
// happy path) zero-members case.
function EmptyRosterState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3"
      style={{ padding: '48px 24px', textAlign: 'center' }}
    >
      <Users aria-hidden="true" size={32} style={{ color: 'var(--wm)' }} />
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--w)', margin: 0 }}>
        No Roster Data Available
      </h2>
      <p style={{ fontSize: '12px', color: 'var(--wd)', margin: 0, maxWidth: '360px' }}>
        No role entries were returned by the roster source.
      </p>
      <Button type="button" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export default function RosterCatalogPage() {
  const { data, isLoading, isError, error, refetch } = useParty();
  const setActiveMode = useUIStore((s) => s.setActiveMode);
  const setSelectedAgentCode = useUIStore((s) => s.setSelectedAgentCode);

  const state = derivePartyGridState({ isLoading, isError, members: data?.members });

  function handleSelect(code: string) {
    // Same nav-contract PartyPage's card click uses (t4b): drills into the dedicated
    // agent-detail surface, scoped by setSelectedAgentCode.
    setSelectedAgentCode(code);
    setActiveMode('agent-detail');
  }

  return (
    <div data-testid={PAGE_TESTID} className="flex flex-col gap-6">
      <PartyScreenHeader members={data?.members} title={CATALOG_TITLE} />

      <div className="flex flex-1 flex-col gap-4">
        {state === 'loading' && <PartyGridSkeleton />}
        {state === 'error' && <ErrorPartyState error={error} onRetry={refetch} />}
        {state === 'empty' && <EmptyRosterState onRetry={refetch} />}
        {state === 'default' && data && (
          <div className={PARTY_GRID_CLASS}>
            {data.members.map((member) => (
              <PartyMemberCard key={member.code} member={member} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

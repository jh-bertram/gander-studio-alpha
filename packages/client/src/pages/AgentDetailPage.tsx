import { ArrowLeft } from 'lucide-react';
import type { AgentDetail, QualityStat } from '@gander-studio/shared';
import { trpc } from '../trpc';
import { useUIStore } from '../store/ui-store';
import PortraitFrame from '../components/party/PortraitFrame';
import StatBar from '../components/party/StatBar';
import { materiaTint } from '../components/party/materia-tint';
import { MateriaPanel, EquipmentPanel, AbilitiesPanel } from '../components/detail/InventoryPanels';
import RelationshipPanel from '../components/detail/RelationshipPanel';
import ReviseSpecAction from '../components/detail/ReviseSpecAction';
import ShimmerBox from '../components/ui/shimmer-box';
import ErrorState from '../components/ui/error-state';
import { Button } from '../components/ui/button';

// prog-studio-v2-2026-07-s3-drilldowns-t4a — AgentDetailPage assembly + lazy route wiring.
// Composes t1 (inventory panels), t2 (relationship panel), t3 (revise-spec action) around a
// header (PortraitFrame + role tag + qualityStats via reused StatBar) fed by
// `roster.getAgentDetail` (router.ts:794, verified). NAV BOUNDARY (this packet only): PartyPage's
// handleSelect / the Roster rail still target their s2-interim modes — this page is reachable only
// via direct `setSelectedAgentCode` + `setActiveMode('agent-detail')` until t4b re-points them.

const PAGE_TESTID = 'agent-detail-page';
const BACK_TESTID = 'detail-back';
const PORTRAIT_SIZE_PX = '96px';
// DESIGN.md Border Radius table: "Small elements (badges, chips, inputs)" = 6px (StatBar/RoleTag
// precedent, party/StatBar.tsx :21 and party/PartyMemberCard.tsx :32) — RoleTag itself is a
// private, unexported component in PartyMemberCard.tsx, so this page mirrors its exact treatment
// locally (DetailRoleTag below) rather than reaching into that file's internals.
const ROLE_TAG_RADIUS_PX = '6px';

// Known integration gap (flagged in ui_packet, not a silent guess): AgentDetailSchema carries no
// `agent.name` (front-matter slug) or `specFile`, but ReviseSpecAction's `target.name` must equal
// the exact `Agent.name` value `agent.get`/`agent.save` match on (router.ts:190-194) — verified on
// disk this is NOT derivable from `code` by any formula (e.g. `database.md -> db-specialist`,
// `hr.md -> system-health-monitor`). This 12-entry map (DI excluded — ROSTER.specFile is null, no
// spec exists to revise) mirrors agent-role.ts's ROSTER for this ONE UI-wiring purpose only, so the
// Revise action opens the CORRECT spec rather than guessing and always 404ing. A follow-up BE
// packet adding `agentName` to AgentDetailSchema would remove this duplication (out of scope here
// — no schema/server file is touched by this packet).
const ROSTER_AGENT_NAME_BY_CODE: Record<string, string> = {
  BE: 'backend-engineer',
  FE: 'frontend-engineer',
  DS: 'db-specialist',
  PM: 'project-manager',
  ORC: 'orchestrator',
  RA: 'researcher',
  ST: 'statistician',
  AR: 'archivist',
  UI: 'ui-designer',
  HR: 'system-health-monitor',
  CR: 'critic',
  AU: 'code-auditor',
};

export type AgentDetailStateKind = 'no-selection' | 'loading' | 'error' | 'default';

// Pure, testable derivation (mirrors derivePartyGridState precedent, PartyPage.tsx) — the
// no-selection guard is checked FIRST since the query is `enabled: selectedAgentCode !== null`.
export function deriveAgentDetailState({
  selectedAgentCode,
  isLoading,
  isError,
}: {
  selectedAgentCode: string | null;
  isLoading: boolean;
  isError: boolean;
}): AgentDetailStateKind {
  if (selectedAgentCode === null) return 'no-selection';
  if (isLoading) return 'loading';
  if (isError) return 'error';
  return 'default';
}

interface DetailRoleTagProps {
  roleCategory: AgentDetail['roleCategory'];
  materiaColorKey: string;
}

// Local mirror of PartyMemberCard's private (unexported) RoleTag — same Badge-substitute treatment
// (DESIGN.md "Role / type tag" Component Rule: color = materia token, bg = tint 12%, border = tint
// 25%) via the single-sourced `materiaTint` helper (amendment W1 dedup; no raw hex here).
function DetailRoleTag({ roleCategory, materiaColorKey }: DetailRoleTagProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '12px',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: ROLE_TAG_RADIUS_PX,
        color: `var(${materiaColorKey})`,
        background: materiaTint(materiaColorKey, 12),
        border: `1px solid ${materiaTint(materiaColorKey, 25)}`,
      }}
    >
      {roleCategory}
    </span>
  );
}

function BackToPartyButton({ onBack }: { onBack: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      data-testid={BACK_TESTID}
      aria-label="Back to party"
      onClick={onBack}
    >
      <ArrowLeft aria-hidden="true" size={14} />
      Back to party
    </Button>
  );
}

function AgentDetailHeader({ detail }: { detail: AgentDetail }) {
  return (
    <header className="flex items-start gap-4">
      <div style={{ width: PORTRAIT_SIZE_PX, flexShrink: 0 }}>
        <PortraitFrame code={detail.code} materiaColorKey={detail.materiaColorKey} portraitSeed={detail.code} />
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: 'var(--fm)', fontSize: '20px', color: 'var(--w)' }}>{detail.code}</span>
          <DetailRoleTag roleCategory={detail.roleCategory} materiaColorKey={detail.materiaColorKey} />
        </div>
        <div className="flex flex-col gap-2" style={{ maxWidth: '320px' }}>
          {detail.qualityStats.map((stat: QualityStat) => (
            // SC(b) — QualityStatSchema has no `reason` field; StatBar's `reason?` prop is OPTIONAL
            // and its N/A branch supplies its own 'reason not provided' default (StatBar.tsx :29/
            // :51, CR#2-verified). Deliberately NOT passed here — no StatBar edit, no invented
            // per-stat reason. The N/A rationale itself is surfaced via dataQualityNotes below.
            <StatBar key={stat.label} label={stat.label} normalized={stat.normalized} fillToken={detail.materiaColorKey} />
          ))}
        </div>
      </div>
    </header>
  );
}

function DataQualityNotes({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null;
  return (
    <section
      aria-labelledby="detail-quality-notes-heading"
      className="flex flex-col gap-2"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)', padding: '16px' }}
    >
      <h2
        id="detail-quality-notes-heading"
        style={{ fontSize: '12px', fontWeight: 600, color: 'var(--wd)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}
      >
        Data Quality Notes
      </h2>
      <ul className="flex flex-col gap-1" style={{ margin: 0, paddingLeft: '18px' }}>
        {notes.map((note) => (
          <li key={note} style={{ fontSize: '11px', color: 'var(--wm)' }}>
            {note}
          </li>
        ))}
      </ul>
    </section>
  );
}

function DetailLoadingState() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <span className="sr-only">Loading agent detail…</span>
      <div className="flex items-start gap-4">
        <ShimmerBox style={{ width: PORTRAIT_SIZE_PX, aspectRatio: '1 / 1', borderRadius: 'var(--radius)' }} />
        <div className="flex flex-1 flex-col gap-2">
          <ShimmerBox style={{ height: '20px', width: '30%', borderRadius: '6px' }} />
          <ShimmerBox style={{ height: '6px', width: '100%', borderRadius: '6px' }} />
          <ShimmerBox style={{ height: '6px', width: '100%', borderRadius: '6px' }} />
        </div>
      </div>
      <ShimmerBox style={{ height: '160px', width: '100%', borderRadius: 'var(--radius)' }} />
    </div>
  );
}

function DetailErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <ErrorState error={error} fallbackMessage="Couldn't load agent detail." />
      <Button type="button" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function NoSelectionState({ onBack }: { onBack: () => void }) {
  return (
    <div role="status" className="flex flex-col items-start gap-3" style={{ padding: '24px 0' }}>
      <p style={{ fontSize: '12px', color: 'var(--wd)', margin: 0 }}>
        No agent selected. Choose an agent from the party roster to view its detail.
      </p>
      <BackToPartyButton onBack={onBack} />
    </div>
  );
}

export default function AgentDetailPage() {
  const selectedAgentCode = useUIStore((s) => s.selectedAgentCode);
  const setActiveMode = useUIStore((s) => s.setActiveMode);

  const detailQuery = trpc.roster.getAgentDetail.useQuery(
    { code: selectedAgentCode ?? '' },
    { enabled: selectedAgentCode !== null },
  );

  const state = deriveAgentDetailState({
    selectedAgentCode,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
  });

  function handleBack() {
    setActiveMode('party');
  }

  const reviseAgentName = detailQuery.data ? ROSTER_AGENT_NAME_BY_CODE[detailQuery.data.code] : undefined;

  return (
    <div data-testid={PAGE_TESTID} className="flex flex-col gap-6">
      {state !== 'no-selection' && (
        <div>
          <BackToPartyButton onBack={handleBack} />
        </div>
      )}

      {state === 'no-selection' && <NoSelectionState onBack={handleBack} />}
      {state === 'loading' && <DetailLoadingState />}
      {state === 'error' && (
        <DetailErrorState error={detailQuery.error} onRetry={() => void detailQuery.refetch()} />
      )}
      {state === 'default' && detailQuery.data && (
        <>
          <AgentDetailHeader detail={detailQuery.data} />

          <div className="flex flex-col gap-4">
            <MateriaPanel
              skills={detailQuery.data.materia.skills}
              hooks={detailQuery.data.materia.hooks}
              dataQualityNotes={detailQuery.data.dataQualityNotes}
            />
            <EquipmentPanel equipment={detailQuery.data.equipment} dataQualityNotes={detailQuery.data.dataQualityNotes} />
            <AbilitiesPanel abilities={detailQuery.data.abilities} dataQualityNotes={detailQuery.data.dataQualityNotes} />
          </div>

          <RelationshipPanel code={detailQuery.data.code} relationships={detailQuery.data.relationships} />

          <div>
            {reviseAgentName ? (
              <ReviseSpecAction target={{ type: 'agent', name: reviseAgentName }} />
            ) : (
              <p role="status" style={{ fontSize: '11px', color: 'var(--wm)', margin: 0 }}>
                No spec on disk to revise for this role.
              </p>
            )}
          </div>

          <DataQualityNotes notes={detailQuery.data.dataQualityNotes} />
        </>
      )}
    </div>
  );
}

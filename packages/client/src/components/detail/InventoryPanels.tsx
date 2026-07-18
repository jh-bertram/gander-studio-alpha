import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Gem, Wrench, Zap } from 'lucide-react';
import type { Ability, Equipment, Materia } from '@gander-studio/shared';
import { materiaTint } from '../party/materia-tint';

// prog-studio-v2-2026-07-s3-drilldowns-t1 — Roster drill-down inventory panels (Browse
// absorption lane, docs/v2-vision/v2-design-spec.md). Panel names are literal per the design
// spec ("Materia" / "Equipment" / "Abilities"); support copy uses the underlying agent-side
// terms (Skills+Hooks / Tools / Workflows) so FF7 flavor text and the concrete AgentDetailSchema
// data model both stay legible. Data is 100% prop-driven (page passes AgentDetail slices down —
// no trpc query here). `abilities` is CONTRACTED empty this sprint (program.md §5 note 2,
// packages/server/src/parsers/agent-detail.ts) — its honest empty state is therefore the
// DEFAULT render path, built as a first-class state, not an edge case.

const PANEL_ICON_SIZE = 18;
const ROW_RADIUS_PX = '6px'; // DESIGN.md Border Radius: "Small elements (badges, chips, inputs)"

// Materia-chip accent tokens — named explicitly in docs/v2-vision/v2-design-spec.md <tokens>:
// "Intel-role materia...Skills chip color" (--mb); "Hooks materia (used in Roster drill-down
// chips...)" (--mo). Abilities/workflows has no design-decision-recorded accent token
// (DESIGN.md: role colors "must not be changed without a design decision record") — its rows
// render with the neutral (no-tint) treatment (InventoryRow's accentToken omitted) rather than
// inventing a new materia-color meaning.
const SKILL_CHIP_TOKEN = '--mb';
const HOOK_CHIP_TOKEN = '--mo';

const MATERIA_PANEL_TESTID = 'detail-materia-panel';
const EQUIPMENT_PANEL_TESTID = 'detail-equipment-panel';
const ABILITIES_PANEL_TESTID = 'detail-abilities-panel';

// Regex-matched dataQualityNotes surfaced per-panel. AgentDetail.dataQualityNotes is a flat
// string[] (schemas.ts — no per-panel keying); these patterns key off the exact note phrases
// emitted by packages/server/src/parsers/agent-detail.ts (verified on disk) so a panel surfaces
// ONLY the notes relevant to its own data source, never every note indiscriminately.
const MATERIA_NOTE_PATTERN = /materia|connectivity graph|agent spec on disk|not found via parseAllAgents/i;
const EQUIPMENT_NOTE_PATTERN = /agent spec on disk|not found via parseAllAgents/i;
const ABILITIES_NOTE_PATTERN = /abilit/i;

function matchingNotes(notes: string[], pattern: RegExp): string[] {
  return notes.filter((note) => pattern.test(note));
}

function NoteList({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null;
  return (
    <>
      {notes.map((note) => (
        <p key={note} style={{ fontSize: '10px', color: 'var(--wm)', margin: 0 }}>
          {note}
        </p>
      ))}
    </>
  );
}

// Shared row primitive (DRY — identical row chrome for materia/ability provenance rows AND
// equipment rows; only the presence of a `secondary` value differs). `accentToken` applies the
// materia-tint idiom (RoleTag precedent, PartyMemberCard.tsx) when provided; omitted entirely
// falls back to the neutral --sfh/--bd row treatment.
interface InventoryRowProps {
  primary: string;
  secondary?: string;
  accentToken?: string;
}

function InventoryRow({ primary, secondary, accentToken }: InventoryRowProps) {
  const background = accentToken ? materiaTint(accentToken, 12) : 'var(--sfh)';
  const border = accentToken ? materiaTint(accentToken, 25) : 'var(--bd)';
  return (
    <div
      className="flex items-center justify-between gap-3"
      style={{ padding: '6px 10px', borderRadius: ROW_RADIUS_PX, background, border: `1px solid ${border}` }}
    >
      <span style={{ fontSize: '12px', color: 'var(--w)' }}>{primary}</span>
      {secondary ? (
        <span style={{ fontSize: '10px', fontFamily: 'var(--fm)', color: 'var(--wm)' }} title={secondary}>
          {secondary}
        </span>
      ) : null}
    </div>
  );
}

// Shared provenance row (SC(a) — the provenancePath display identical across Materia/Abilities).
export interface ProvenanceChipProps {
  name: string;
  provenancePath: string;
  accentToken?: string;
}

export function ProvenanceChip({ name, provenancePath, accentToken }: ProvenanceChipProps) {
  return <InventoryRow primary={name} secondary={provenancePath} accentToken={accentToken} />;
}

function HonestEmptyState({ message, notes }: { message: string; notes: string[] }) {
  return (
    <div role="status" className="flex flex-col gap-1" style={{ padding: '8px 0' }}>
      <p style={{ fontSize: '12px', color: 'var(--wd)', margin: 0 }}>{message}</p>
      <NoteList notes={notes} />
    </div>
  );
}

interface PanelShellProps {
  testId: string;
  icon: LucideIcon;
  title: string;
  supportCopy: string;
  headingId: string;
  children: ReactNode;
}

function PanelShell({ testId, icon: Icon, title, supportCopy, headingId, children }: PanelShellProps) {
  return (
    <section
      data-testid={testId}
      aria-labelledby={headingId}
      className="flex flex-col gap-3"
      style={{ background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)', padding: '16px' }}
    >
      <div className="flex items-center gap-2">
        <Icon aria-hidden="true" size={PANEL_ICON_SIZE} style={{ color: 'var(--mt)' }} />
        <div className="flex flex-col">
          <h2 id={headingId} style={{ fontSize: '16px', fontWeight: 600, color: 'var(--w)', margin: 0 }}>
            {title}
          </h2>
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--wm)',
            }}
          >
            {supportCopy}
          </span>
        </div>
      </div>
      {children}
    </section>
  );
}

// --- Materia panel (skills + hooks) ---------------------------------------------------------

const MATERIA_PANEL_HEADING_ID = 'detail-materia-panel-heading';
const MATERIA_SKILLS_HEADING_ID = 'detail-materia-skills-heading';
const MATERIA_HOOKS_HEADING_ID = 'detail-materia-hooks-heading';

interface MateriaSubListProps {
  headingId: string;
  title: string;
  items: Materia[];
  accentToken: string;
  emptyMessage: string;
}

// Sub-list empty state carries NO notes of its own (notes={[]}) — MateriaPanel surfaces the
// matching dataQualityNote ONCE below both sub-lists (skills/hooks share the same underlying
// data source, so per-sublist duplication would repeat an identical note twice on screen).
function MateriaSubList({ headingId, title, items, accentToken, emptyMessage }: MateriaSubListProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 id={headingId} style={{ fontSize: '12px', fontWeight: 600, color: 'var(--wd)', margin: 0 }}>
        {title}
      </h3>
      {items.length === 0 ? (
        <HonestEmptyState message={emptyMessage} notes={[]} />
      ) : (
        <div className="flex flex-col gap-2" role="list" aria-labelledby={headingId}>
          {items.map((item) => (
            <div role="listitem" key={`${item.kind}-${item.provenancePath}`}>
              <ProvenanceChip name={item.name} provenancePath={item.provenancePath} accentToken={accentToken} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface MateriaPanelProps {
  skills: Materia[];
  hooks: Materia[];
  dataQualityNotes: string[];
}

export function MateriaPanel({ skills, hooks, dataQualityNotes }: MateriaPanelProps) {
  const notes = matchingNotes(dataQualityNotes, MATERIA_NOTE_PATTERN);
  return (
    <PanelShell
      testId={MATERIA_PANEL_TESTID}
      icon={Gem}
      title="Materia"
      supportCopy="Skills + Hooks wired to this agent's spec"
      headingId={MATERIA_PANEL_HEADING_ID}
    >
      <MateriaSubList
        headingId={MATERIA_SKILLS_HEADING_ID}
        title="Skills"
        items={skills}
        accentToken={SKILL_CHIP_TOKEN}
        emptyMessage="No recorded skills for this agent."
      />
      <MateriaSubList
        headingId={MATERIA_HOOKS_HEADING_ID}
        title="Hooks"
        items={hooks}
        accentToken={HOOK_CHIP_TOKEN}
        emptyMessage="No recorded hooks for this agent."
      />
      {notes.length > 0 ? (
        <div role="status" className="flex flex-col gap-1">
          <NoteList notes={notes} />
        </div>
      ) : null}
    </PanelShell>
  );
}

// --- Equipment panel (tools) -------------------------------------------------------------------

const EQUIPMENT_PANEL_HEADING_ID = 'detail-equipment-panel-heading';

export interface EquipmentPanelProps {
  equipment: Equipment[];
  dataQualityNotes: string[];
}

export function EquipmentPanel({ equipment, dataQualityNotes }: EquipmentPanelProps) {
  const notes = matchingNotes(dataQualityNotes, EQUIPMENT_NOTE_PATTERN);
  return (
    <PanelShell
      testId={EQUIPMENT_PANEL_TESTID}
      icon={Wrench}
      title="Equipment"
      supportCopy="Tools equipped from this agent's spec"
      headingId={EQUIPMENT_PANEL_HEADING_ID}
    >
      {equipment.length === 0 ? (
        <HonestEmptyState message="No recorded tools for this agent." notes={notes} />
      ) : (
        <div className="flex flex-col gap-2" role="list" aria-labelledby={EQUIPMENT_PANEL_HEADING_ID}>
          {equipment.map((item, idx) => (
            // EquipmentSchema = { tool } only — tools carry no file provenance (server comment,
            // schemas.ts :427); NEVER fabricate a path here.
            <div role="listitem" key={`${item.tool}-${idx}`}>
              <InventoryRow primary={item.tool} />
            </div>
          ))}
        </div>
      )}
    </PanelShell>
  );
}

// --- Abilities panel (workflows) — CONTRACTED empty this sprint, default render path -----------

const ABILITIES_PANEL_HEADING_ID = 'detail-abilities-panel-heading';

export interface AbilitiesPanelProps {
  abilities: Ability[];
  dataQualityNotes: string[];
}

function AbilitiesEmptyState({ notes }: { notes: string[] }) {
  // First-class treatment (program.md §5 note 2 — this IS the default path this sprint, not an
  // afterthought): a dedicated icon + message rather than the terser HonestEmptyState reused by
  // the (currently unreachable but fully built) sub-list/tools empty edge cases above.
  return (
    <div role="status" className="flex flex-col items-start gap-2" style={{ padding: '12px 0' }}>
      <Zap aria-hidden="true" size={20} style={{ color: 'var(--wm)' }} />
      <p style={{ fontSize: '12px', color: 'var(--wd)', margin: 0 }}>No recorded abilities for this agent.</p>
      <NoteList notes={notes} />
    </div>
  );
}

export function AbilitiesPanel({ abilities, dataQualityNotes }: AbilitiesPanelProps) {
  const notes = matchingNotes(dataQualityNotes, ABILITIES_NOTE_PATTERN);
  return (
    <PanelShell
      testId={ABILITIES_PANEL_TESTID}
      icon={Zap}
      title="Abilities"
      supportCopy="Workflows this agent can invoke"
      headingId={ABILITIES_PANEL_HEADING_ID}
    >
      {abilities.length === 0 ? (
        <AbilitiesEmptyState notes={notes} />
      ) : (
        <div className="flex flex-col gap-2" role="list" aria-labelledby={ABILITIES_PANEL_HEADING_ID}>
          {abilities.map((ability) => (
            <div role="listitem" key={ability.provenancePath}>
              <ProvenanceChip name={ability.name} provenancePath={ability.provenancePath} />
            </div>
          ))}
        </div>
      )}
    </PanelShell>
  );
}

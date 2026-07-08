// party-roster.ts — party assembly for `roster.getParty`
// (prog-studio-v2-2026-07-s1-data-layer-t3). Consumes t2's compute layer
// (`computePartyDerivations`) and t1's canonical roster catalog (`ROSTER`)
// and assembles the PartyStatsSchema envelope: 13 PartyMember records, each
// carrying three named stat bars (Activity / Stamina / Accuracy), sorted by
// activity recency. Normalization (0-100) and Impl-only Accuracy gating
// live HERE — computePartyDerivations only produces raw counts/fractions
// (out of scope there, per t2's packet).
//
// Envelope shape authorized by docs/programs/prog-studio-v2-2026-07/program.md
// §5 "Seam-interpretation notes" note 1 (ORC-recorded): roster.getParty
// returns `{ members, diagnostics, activityAnchor }`, not a bare array.

import { ROSTER } from './agent-role.js';
import type { RoleCategory } from './agent-role.js';
import { computePartyDerivations } from './party-stats.js';
import type { RoleDerivation } from './party-stats.js';
import { PartyStatsSchema } from '@gander-studio/shared';
import type { PartyStats, PartyMember, PartyStatBar } from '@gander-studio/shared';

// ---------------------------------------------------------------------------
// tokens/cost — reserved PROJECTED placeholder (constraint 3, SC5).
//
// DEFERRED-P9-1 (docs/deferred-work.md): EventLogEntrySchema carries no
// token-count field; token data is not present in the JSONL event log today.
// Tokens-per-agent aggregation is deferred until the event schema is
// extended with a `tokens` field (or an alternative source is identified).
//
// This is a single RESERVED exported constant only — v2-design-spec.md
// <sample_data_appendix> ships the party card with NO MP/cost bar (G5
// canonical resolution, prog-studio-v2-2026-07-s1-data-layer-t3
// routing_notes). It MUST NOT be populated into any PartyMember's `stats`
// array — see assembleParty below, which never references it.
// ---------------------------------------------------------------------------
export const TOKENS_PROJECTED_PLACEHOLDER: PartyStatBar = {
  label: 'Tokens',
  raw: null,
  normalized: null,
  derivation: 'tokens-projected',
  feasibility: 'projected',
  reason: 'needs schema extension',
};

/**
 * Build an explicit-N/A stat bar (normalized:null + a surfaced reason) —
 * the silent-empty-forbidden shape shared by all three bar builders below.
 */
function naStatBar(label: string, raw: number | null, derivation: string, reason: string): PartyStatBar {
  return { label, raw, normalized: null, derivation, feasibility: 'available', reason };
}

/** Build a populated (available, non-N/A) stat bar. */
function computedStatBar(label: string, raw: number, normalized: number, derivation: string): PartyStatBar {
  return { label, raw, normalized, derivation, feasibility: 'available' };
}

/**
 * Activity stat bar — raw spawn count normalized against the LIVE max spawn
 * count across the roster (measured at runtime by assembleParty; never a
 * hardcoded anchor). anchor===0 means no role in the roster has spawned at
 * all (empty/misconfigured corpus) — normalized is explicit N/A rather than
 * a divide-by-zero-derived value.
 */
function activityStatBar(spawnCount: number, activityAnchor: number): PartyStatBar {
  if (activityAnchor <= 0) {
    return naStatBar('Activity', spawnCount, 'activity-spawns-normalized', 'no spawn activity observed in corpus');
  }
  return computedStatBar(
    'Activity',
    spawnCount,
    Math.round((spawnCount / activityAnchor) * 100),
    'activity-spawns-normalized',
  );
}

/**
 * Stamina stat bar — inverse ghost/stall rate. `raw` is always the ghost
 * count; `normalized` is explicit N/A (never a misleading 0 or 100) when the
 * role has never spawned.
 */
function staminaStatBar(spawnCount: number, ghostCount: number): PartyStatBar {
  if (spawnCount <= 0) {
    return naStatBar('Stamina', ghostCount, 'stamina-inverse-ghost', 'no spawns observed');
  }
  return computedStatBar(
    'Stamina',
    ghostCount,
    Math.round((1 - ghostCount / spawnCount) * 100),
    'stamina-inverse-ghost',
  );
}

/**
 * Accuracy stat bar — first-pass audit rate. Impl roles (BE/FE/DS — i.e.
 * `roleCategory === 'Impl'` in ROSTER) only; every other role declares
 * explicit N/A with reason 'not audit-gated' (never a bare/misleading 0 —
 * silent-empty discipline). An Impl role with zero attributed audits
 * (nothing to compute a rate from yet) is ALSO explicit N/A, distinguished
 * by its own reason.
 */
function accuracyStatBar(
  roleCategory: RoleCategory,
  firstPassAudits: number,
  attributedAudits: number,
): PartyStatBar {
  if (roleCategory !== 'Impl') {
    return naStatBar('Accuracy', null, 'accuracy-firstpass', 'not audit-gated');
  }
  if (attributedAudits <= 0) {
    return naStatBar('Accuracy', null, 'accuracy-firstpass', 'no attributed audits observed');
  }
  const rate = firstPassAudits / attributedAudits;
  return computedStatBar('Accuracy', rate, Math.round(rate * 100), 'accuracy-firstpass');
}

/** Live max spawnCount across the 13-entry ROSTER — the Activity anchor.
 *  MEASURED at runtime from perRole; never a hardcoded corpus number. */
function computeActivityAnchor(perRole: Map<string, RoleDerivation>): number {
  let anchor = 0;
  for (const entry of ROSTER) {
    const spawnCount = perRole.get(entry.code)?.spawnCount ?? 0;
    if (spawnCount > anchor) anchor = spawnCount;
  }
  return anchor;
}

/** Descending lastActivityTs comparator — nulls sort last. ISO-8601 strings
 *  compare correctly lexically (all corpus ts values share format, per
 *  party-stats.ts's maxTs). */
function byActivityRecencyDesc(a: PartyMember, b: PartyMember): number {
  if (a.lastActivityTs === b.lastActivityTs) return 0;
  if (a.lastActivityTs === null) return 1;
  if (b.lastActivityTs === null) return -1;
  return a.lastActivityTs < b.lastActivityTs ? 1 : -1;
}

/**
 * Assemble the full 13-member party from event-derived corpus stats.
 * Iterates the canonical ROSTER (t1) — every code gets a PartyMember, even
 * roles with zero observed events (hasCorpusActivity:false — surfaced, never
 * hidden). Validates the assembled envelope against PartyStatsSchema before
 * returning (Zod-at-the-boundary).
 */
export async function assembleParty(eventsDirs: string[]): Promise<PartyStats> {
  const { perRole, diagnostics } = await computePartyDerivations(eventsDirs);
  const activityAnchor = computeActivityAnchor(perRole);

  const members: PartyMember[] = ROSTER.map((entry) => {
    const derivation = perRole.get(entry.code);
    const spawnCount = derivation?.spawnCount ?? 0;
    const ghostCount = derivation?.ghostCount ?? 0;
    const firstPassAudits = derivation?.firstPassAudits ?? 0;
    const attributedAudits = derivation?.attributedAudits ?? 0;

    const stats: PartyStatBar[] = [
      activityStatBar(spawnCount, activityAnchor),
      staminaStatBar(spawnCount, ghostCount),
      accuracyStatBar(entry.roleCategory, firstPassAudits, attributedAudits),
    ];

    return {
      code: entry.code,
      roleCategory: entry.roleCategory,
      materiaColorKey: entry.materiaColorKey,
      portraitSeed: entry.code,
      stats,
      lastActivityTs: derivation?.lastActivityTs ?? null,
      hasCorpusActivity: derivation !== undefined,
    };
  });

  members.sort(byActivityRecencyDesc);

  const raw = {
    members,
    diagnostics: {
      totalRawLines: diagnostics.totalRawLines,
      validEntries: diagnostics.validEntries,
      invalidLineCount: diagnostics.invalidLineCount,
      invalidLineSamples: diagnostics.invalidLineSamples,
      distinctEventTypes: diagnostics.distinctEventTypes,
      uncountedEventTypes: diagnostics.uncountedEventTypes,
    },
    activityAnchor,
  };

  return PartyStatsSchema.parse(raw);
}

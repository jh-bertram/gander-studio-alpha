// party-stats.ts — event-derived corpus statistics for the v2 party bars
// (prog-studio-v2-2026-07-s1-data-layer-t2). Implements the three §2 derivation
// contracts in docs/v2-vision/session-data-inventory.md that are AVAILABLE-NOW:
//
//   §2.1 Per-implementer audit first-pass rate ("attribution flip")
//   §2.2 Ghost/stall rate per agent role
//   §2.3 Event-type coverage / "invisible event" audit
//
// Assembly (0-100 normalization, PartyMember records, sort, router procedure)
// is OUT OF SCOPE here — this file is the compute layer t3's party-roster.ts
// consumes. No `any`; every external value is EventLogEntry (Zod-validated at
// the readEventLogEntriesWithDiagnostics boundary).

import { sprintRoot } from '../session-slug-match.js';
import { roleOf, canonicalizeRole } from './agent-role.js';
import { readEventLogEntriesWithDiagnostics } from './event-log-parser.js';
import type { EventLogEntry } from '@gander-studio/shared';

// ---------------------------------------------------------------------------
// Event-type coverage (§2.3) — the 6 ev values computeSessionStats already
// counts (session-stats.ts accumulateEv). Anything else is "uncounted" today.
// ---------------------------------------------------------------------------
const COUNTED_EVENT_TYPES: ReadonlySet<string> = new Set([
  'SPAWN',
  'COMPLETE',
  'CRITIQUE_PASS',
  'CRITIQUE_BLOCK',
  'AUDIT_PASS',
  'AUDIT_FAIL',
]);

// ---------------------------------------------------------------------------
// Attribution flip (§2.1) — roles excluded from "most-recent implementer
// SPAWN" tracking. NOTE this is narrower than ROSTER roleCategory==='Gate'
// (CR, AU only): ORC is 'Command' in agent-role.ts's ROSTER but is ALSO
// excluded here, per the derivation contract's literal text ("not a gate
// role (AU/CR/ORC after canonicalization)"). Intentionally NOT reusing
// ROSTER.roleCategory — the two exclusion sets differ by design.
// ---------------------------------------------------------------------------
const ATTRIBUTION_EXCLUDED_ROLES: ReadonlySet<string> = new Set(['AU', 'CR', 'ORC']);

export interface RoleDerivation {
  /** Count of SPAWN events whose (canonicalized, instance-stripped) agent_id role equals this role. */
  spawnCount: number;
  /** Max ts (ISO string) across ALL events whose literal agent_id resolves to this role; null if none. */
  lastActivityTs: string | null;
  /** Count of GHOST_CONFIRMED events whose own agent_id resolves to this role (§2.2 — no attribution heuristic). */
  ghostCount: number;
  /** Count of attributed AUDIT_PASS/AUDIT_FAIL resolutions that were "clean" (no prior AUDIT_FAIL in-chain). */
  firstPassAudits: number;
  /** Count of attributed audit resolutions total (AUDIT_PASS events, plus any AUDIT_FAIL left unresolved
   *  at the end of its family — an implementer audited but not yet passed). See computePartyDerivations
   *  doc comment for the full worked algorithm. */
  attributedAudits: number;
}

export interface PartyDerivationsDiagnostics {
  totalRawLines: number;
  validEntries: number;
  invalidLineCount: number;
  invalidLineSamples: string[];
  distinctEventTypes: number;
  uncountedEventTypes: number;
}

export interface PartyDerivationsResult {
  perRole: Map<string, RoleDerivation>;
  diagnostics: PartyDerivationsDiagnostics;
}

function emptyDerivation(): RoleDerivation {
  return {
    spawnCount: 0,
    lastActivityTs: null,
    ghostCount: 0,
    firstPassAudits: 0,
    attributedAudits: 0,
  };
}

function getOrCreateRole(perRole: Map<string, RoleDerivation>, role: string): RoleDerivation {
  let bucket = perRole.get(role);
  if (!bucket) {
    bucket = emptyDerivation();
    perRole.set(role, bucket);
  }
  return bucket;
}

/** Lexical ISO-8601 timestamp max — sorts correctly since all corpus ts values share format. */
function maxTs(current: string | null, candidate: string): string {
  if (current === null) return candidate;
  return candidate > current ? candidate : current;
}

/**
 * Family grouping key for the attribution flip (§2.1) — the SAME boundary-anchored
 * `sprintRoot` grouping `session-slug-match.ts` already uses (DRY reuse, not a new
 * rule). Falls back to the raw task_id when sprintRoot's positive shape gate rejects
 * it (denylisted / no phase token / not prog-/gander-meta- shaped), so non-conforming
 * ids still form their own singleton families rather than silently merging under an
 * ambiguous default bucket.
 */
function familyKeyFor(taskId: string): string {
  return sprintRoot(taskId) ?? taskId;
}

/**
 * Aggregate event-derived corpus statistics across ALL provided event-log
 * directories (multi-root — SESSIONS_SOURCE_DIRS). See session-data-inventory.md
 * §2.1/§2.2/§2.3 for the derivation contracts this implements.
 *
 * Attribution-flip algorithm (§2.1, backward-look mirror of session-stats.ts's
 * forward-look `feedback_loops`):
 *   For each family (sprintRoot-grouped task_id cluster), walk events in `ts`
 *   order tracking `currentRole` = the most-recent SPAWN's canonicalized,
 *   instance-stripped role, IF that role is not in ATTRIBUTION_EXCLUDED_ROLES
 *   (AU/CR/ORC — gate/orchestration roles are never "the implementer being
 *   audited"). AUDIT_FAIL events mark `currentRole` as having an unresolved
 *   fail (a role can only have one open fail per family at a time — repeated
 *   fails before a pass collapse into the same open-fail marker, matching the
 *   "task's audit is first-pass iff no fail preceded its EVENTUAL pass" text).
 *   AUDIT_PASS events increment `attributedAudits` for `currentRole` by 1 and
 *   `firstPassAudits` by 1 IFF no fail is currently open for that role in this
 *   family; the open-fail marker is then cleared (this PASS resolves it).
 *   At the end of each family, any role left with an unresolved fail (no
 *   subsequent PASS arrived to resolve it within the family) gets ONE
 *   additional `attributedAudits` increment (an "attributed fail" — audited,
 *   not yet passed) with no `firstPassAudits` credit. This matches the
 *   worked corpus example in session-data-inventory.md §2.1 ("22 first-pass +
 *   6 pass-after-fail + 7 attributed-fail-only = 35" denominator).
 */
export async function computePartyDerivations(eventsDirs: string[]): Promise<PartyDerivationsResult> {
  // ---- 1. Read + fold diagnostics across all provided event dirs ----------
  let totalRawLines = 0;
  let validEntries = 0;
  let invalidLineCount = 0;
  const invalidLineSamples: string[] = [];
  const allEntries: EventLogEntry[] = [];

  for (const dir of eventsDirs) {
    const result = await readEventLogEntriesWithDiagnostics(dir);
    totalRawLines += result.totalRawLines;
    validEntries += result.validEntries;
    invalidLineCount += result.invalidLineCount;
    invalidLineSamples.push(...result.invalidLineSamples);
    allEntries.push(...result.entries);
  }

  // ---- 2. Event-type coverage (§2.3) ---------------------------------------
  const distinctEventTypeSet = new Set(allEntries.map((entry) => entry.ev));
  let uncountedEventTypes = 0;
  for (const ev of distinctEventTypeSet) {
    if (!COUNTED_EVENT_TYPES.has(ev)) uncountedEventTypes++;
  }

  const perRole = new Map<string, RoleDerivation>();

  // ---- 3. Activity/recency + spawn/ghost counts (literal agent_id ownership) --
  // Unlike the attribution flip, these are NOT backward-attributed — they belong
  // directly to whichever role's agent_id the event literally carries.
  for (const entry of allEntries) {
    const role = canonicalizeRole(roleOf(entry.agent_id));
    const bucket = getOrCreateRole(perRole, role);
    bucket.lastActivityTs = maxTs(bucket.lastActivityTs, entry.ts);
    if (entry.ev === 'SPAWN') bucket.spawnCount++;
    if (entry.ev === 'GHOST_CONFIRMED') bucket.ghostCount++;
  }

  // ---- 4. Attribution flip (§2.1) — group by family, walk chronologically ----
  const families = new Map<string, EventLogEntry[]>();
  for (const entry of allEntries) {
    const key = familyKeyFor(entry.task_id);
    let list = families.get(key);
    if (!list) {
      list = [];
      families.set(key, list);
    }
    list.push(entry);
  }

  for (const familyEntries of families.values()) {
    const sorted = [...familyEntries].sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0));

    let currentRole: string | null = null;
    const hasUnresolvedFail = new Set<string>();

    for (const entry of sorted) {
      if (entry.ev === 'SPAWN') {
        const role = canonicalizeRole(roleOf(entry.agent_id));
        if (!ATTRIBUTION_EXCLUDED_ROLES.has(role)) {
          currentRole = role;
        }
        continue;
      }

      if (entry.ev === 'AUDIT_FAIL') {
        if (currentRole !== null) hasUnresolvedFail.add(currentRole);
        continue;
      }

      if (entry.ev === 'AUDIT_PASS') {
        if (currentRole !== null) {
          const bucket = getOrCreateRole(perRole, currentRole);
          bucket.attributedAudits++;
          if (!hasUnresolvedFail.has(currentRole)) {
            bucket.firstPassAudits++;
          }
          hasUnresolvedFail.delete(currentRole);
        }
        continue;
      }
    }

    // Roles whose fail was never resolved by a subsequent PASS within this
    // family count as one attributed (non-first-pass) audit unit.
    for (const role of hasUnresolvedFail) {
      const bucket = getOrCreateRole(perRole, role);
      bucket.attributedAudits++;
    }
  }

  return {
    perRole,
    diagnostics: {
      totalRawLines,
      validEntries,
      invalidLineCount,
      invalidLineSamples,
      distinctEventTypes: distinctEventTypeSet.size,
      uncountedEventTypes,
    },
  };
}

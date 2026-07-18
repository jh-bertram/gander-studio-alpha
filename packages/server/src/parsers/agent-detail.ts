// agent-detail.ts — agent-detail assembly for `roster.getAgentDetail(code)`
// (prog-studio-v2-2026-07-s1-data-layer-t4). Consumes t1's canonical ROSTER
// (code -> spec mapping via ROSTER.specFile — NEVER re-derived from disk, no
// second hardcoded map), the existing `parseAllAgents` parser (equipment /
// tools), the static connectivity graph (materia + relationship wiring —
// read inline per this packet's out_of_scope: no new shared reader file this
// sprint), and t2's `computePartyDerivations` (quality stats). `abilities` is
// CONTRACTED empty this sprint per program.md §5 note 2 — never fabricated.

import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { ROSTER } from './agent-role.js';
import type { RoleCategory } from './agent-role.js';
import { parseAllAgents } from './agent-parser.js';
import { computePartyDerivations } from './party-stats.js';
import { AgentDetailSchema, ConnectivityGraphSchema } from '@gander-studio/shared';
import type {
  Agent,
  AgentDetail,
  ConnectivityGraph,
  Equipment,
  Materia,
  QualityStat,
  RelationshipEdge,
} from '@gander-studio/shared';

type ConnectivityNode = ConnectivityGraph['nodes'][number];

const SKILL_EDGE_TYPES: ReadonlySet<string> = new Set(['references_skill', 'invokes_skill']);
const RELATIONSHIP_EDGE_TYPES: ReadonlySet<string> = new Set(['spawns', 'communicates_with']);

/**
 * Read the static connectivity graph inline (out_of_scope: do NOT refactor
 * router.ts's inline reader into a shared helper this sprint — a short inline
 * read here is intentional, not a DRY violation). Never throws — returns null
 * on any missing-file / malformed-JSON / schema-invalid outcome, so callers
 * surface a dataQualityNote rather than failing the whole getAgentDetail call.
 */
async function readConnectivityGraphSafe(ganderRoot: string): Promise<ConnectivityGraph | null> {
  const graphPath = path.join(ganderRoot, 'docs', 'connectivity-graph.json');
  try {
    const raw = await readFile(graphPath, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    const result = ConnectivityGraphSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/** true iff the agent's specFile basename matches this edge endpoint's basename. */
function endpointMatchesSpec(endpoint: string, specFile: string): boolean {
  return path.basename(endpoint) === specFile;
}

function nodesById(graph: ConnectivityGraph): Map<string, ConnectivityNode> {
  return new Map(graph.nodes.map((node) => [node.id, node]));
}

function materiaEntry(kind: 'skill' | 'hook', node: ConnectivityNode | undefined, fallbackId: string): Materia {
  return {
    kind,
    name: node?.data.label ?? path.basename(fallbackId),
    provenancePath: node?.data.filePath ?? fallbackId,
  };
}

/**
 * materia = { skills, hooks } — the connectivity-graph subset wired to this
 * agent's spec file.
 *
 * skills: `references_skill`/`invokes_skill` edges where the agent's spec is
 * the SOURCE (verified against the live graph: this is the real direction —
 * e.g. `.claude/agents/frontend.md --references_skill--> .claude/skills/...`).
 *
 * hooks: `triggers_hook` edges are matched on EITHER endpoint, not
 * source-only. Verified against the live GANDER_ROOT connectivity graph
 * (2026-07-08): 0 of 102 `triggers_hook` edges have an agent node as SOURCE —
 * the real wiring is always hook-as-source / agent-as-target (a hook fires ON
 * an agent, e.g. a PreToolUse matcher keyed to a role code). A literal
 * source-only reading would make `materia.hooks` structurally empty for
 * EVERY code, forever — exactly the silent-empty-forever class this sprint
 * exists to prevent (see t4 completion packet critical_logic_notes for the
 * full corpus evidence + the CR#1 precedent this mirrors).
 */
function materiaFromGraph(graph: ConnectivityGraph, specFile: string): { skills: Materia[]; hooks: Materia[] } {
  const byId = nodesById(graph);
  const skills: Materia[] = [];
  const hooks: Materia[] = [];

  for (const edge of graph.edges) {
    if (SKILL_EDGE_TYPES.has(edge.type) && endpointMatchesSpec(edge.source, specFile)) {
      skills.push(materiaEntry('skill', byId.get(edge.target), edge.target));
      continue;
    }
    if (edge.type === 'triggers_hook') {
      if (endpointMatchesSpec(edge.target, specFile)) {
        hooks.push(materiaEntry('hook', byId.get(edge.source), edge.source));
      } else if (endpointMatchesSpec(edge.source, specFile)) {
        hooks.push(materiaEntry('hook', byId.get(edge.target), edge.target));
      }
    }
  }

  return { skills, hooks };
}

/** relationships = connectivity edges where the agent's spec is source OR
 *  target with edgeType in {spawns, communicates_with}. `target` is always
 *  the OTHER node id relative to this agent, regardless of which side of the
 *  underlying edge the agent occupied. */
function relationshipsFromGraph(graph: ConnectivityGraph, specFile: string): RelationshipEdge[] {
  const relationships: RelationshipEdge[] = [];
  for (const edge of graph.edges) {
    if (!RELATIONSHIP_EDGE_TYPES.has(edge.type)) continue;
    const isSource = endpointMatchesSpec(edge.source, specFile);
    const isTarget = endpointMatchesSpec(edge.target, specFile);
    if (!isSource && !isTarget) continue;
    relationships.push({
      target: isSource ? edge.target : edge.source,
      edgeType: edge.type,
      confidence: edge.data.confidence,
    });
  }
  return relationships;
}

function equipmentFromAgent(agent: Agent): Equipment[] {
  return agent.tools.map((tool) => ({ tool }));
}

/** Ghost/stall rate quality stat — direct-agent-id attribution (§2.2; no
 *  attribution flip needed, applies uniformly to every role). Mirrors
 *  party-roster.ts's staminaStatBar math (not imported — that helper isn't
 *  exported and t3's file is out of scope to modify this packet; the
 *  QualityStat shape also differs by carrying `attribution`, which
 *  PartyStatBar does not). */
function ghostRateQualityStat(spawnCount: number, ghostCount: number): QualityStat {
  const base = { label: 'Ghost/stall rate', derivation: 'stamina-inverse-ghost', feasibility: 'available' as const, attribution: 'direct-agent-id' as const };
  if (spawnCount <= 0) {
    return { ...base, raw: null, normalized: null };
  }
  return { ...base, raw: ghostCount, normalized: Math.round((1 - ghostCount / spawnCount) * 100) };
}

/** First-pass audit rate quality stat — implementer-backward-look attribution
 *  for Impl roles (BE/FE/DS); every other role declares gate-renderer (the
 *  flip does not apply — see t2's ATTRIBUTION_EXCLUDED_ROLES + party-roster's
 *  Impl-only Accuracy gating, mirrored here). */
function firstPassQualityStat(roleCategory: RoleCategory, firstPassAudits: number, attributedAudits: number): QualityStat {
  const base = { label: 'First-pass audit rate', derivation: 'accuracy-firstpass', feasibility: 'available' as const };
  if (roleCategory !== 'Impl') {
    return { ...base, raw: null, normalized: null, attribution: 'gate-renderer' as const };
  }
  if (attributedAudits <= 0) {
    return { ...base, raw: null, normalized: null, attribution: 'implementer-backward-look' as const };
  }
  const rate = firstPassAudits / attributedAudits;
  return { ...base, raw: rate, normalized: Math.round(rate * 100), attribution: 'implementer-backward-look' as const };
}

/**
 * Assemble the full AgentDetail record for a canonical ROSTER role `code`.
 * Unknown codes (not in ROSTER at all) throw a plain Error — router.ts wraps
 * this in an opaque TRPCError (the established saveedit-guard.ts pattern: a
 * pure parser throws plain Error, the router boundary translates it, never
 * forwarding raw internals to the client).
 *
 * DI (specFile: null) returns roster metadata + empty equipment/materia/
 * relationships + a dataQualityNote — the ONE legitimate empty case,
 * distinguishable from a stale-mapping parse failure (non-null specFile that
 * parseAllAgents didn't find) by a DIFFERENT note phrase.
 */
export async function assembleAgentDetail(code: string, ganderRoot: string, eventsDirs: string[]): Promise<AgentDetail> {
  const entry = ROSTER.find((r) => r.code === code);
  if (!entry) {
    throw new Error(`Unknown role code: ${code}`);
  }

  const dataQualityNotes: string[] = [];
  let agent: Agent | null = null;

  if (entry.specFile === null) {
    dataQualityNotes.push(`no agent spec on disk for code ${entry.code} (ROSTER.specFile is null)`);
  } else {
    const agents = await parseAllAgents(ganderRoot);
    agent = agents.find((a) => path.basename(a.filePath) === entry.specFile) ?? null;
    if (agent === null) {
      dataQualityNotes.push(
        `agent spec file '${entry.specFile}' not found via parseAllAgents (ROSTER.specFile may be stale)`,
      );
    }
  }

  let equipment: Equipment[] = [];
  let materia: { skills: Materia[]; hooks: Materia[] } = { skills: [], hooks: [] };
  let relationships: RelationshipEdge[] = [];

  if (agent !== null && entry.specFile !== null) {
    equipment = equipmentFromAgent(agent);
    const graph = await readConnectivityGraphSafe(ganderRoot);
    if (graph === null) {
      dataQualityNotes.push('connectivity graph unavailable on disk — materia/relationships may be incomplete');
    } else {
      materia = materiaFromGraph(graph, entry.specFile);
      relationships = relationshipsFromGraph(graph, entry.specFile);
    }
  }

  // abilities = workflows — CONTRACTED empty this sprint (program.md §5 note
  // 2): .claude/agents/tasks/workflows/* is throwaway scaffolding per
  // base-plan portability, and the connectivity graph has no `workflow` node
  // type. Never fabricated; always surfaced with a note.
  dataQualityNotes.push('no durable per-agent workflow source on disk; abilities intentionally empty (program.md §5 note 2)');

  const { perRole } = await computePartyDerivations(eventsDirs);
  const derivation = perRole.get(entry.code);
  const spawnCount = derivation?.spawnCount ?? 0;
  const ghostCount = derivation?.ghostCount ?? 0;
  const firstPassAudits = derivation?.firstPassAudits ?? 0;
  const attributedAudits = derivation?.attributedAudits ?? 0;

  const qualityStats: QualityStat[] = [
    ghostRateQualityStat(spawnCount, ghostCount),
    firstPassQualityStat(entry.roleCategory, firstPassAudits, attributedAudits),
  ];
  if (entry.roleCategory !== 'Impl') {
    // QualityStatSchema carries no `reason` field (unlike PartyStatBarSchema)
    // — the N/A explanation for non-Impl roles routes through
    // dataQualityNotes instead of a per-stat reason. Flagged as a schema gap,
    // not fixed here (schemas.ts is out of scope this packet).
    dataQualityNotes.push(
      `First-pass audit rate is not applicable to role category '${entry.roleCategory}' (attribution:'gate-renderer')`,
    );
  }

  return AgentDetailSchema.parse({
    code: entry.code,
    roleCategory: entry.roleCategory,
    materiaColorKey: entry.materiaColorKey,
    equipment,
    materia,
    abilities: [],
    relationships,
    qualityStats,
    dataQualityNotes,
  });
}

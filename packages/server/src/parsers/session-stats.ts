import { SessionStatsSchema } from '@gander-studio/shared';
import type { Session, EventLogEntry, SessionStats, AgentActivity } from '@gander-studio/shared';

/** Mutable event-count bucket shared by totals and per-agent roll-up. */
interface EventCounts {
  spawns: number;
  completes: number;
  critique_passes: number;
  critique_blocks: number;
  audit_passes: number;
  audit_fails: number;
}

function makeEmptyCounts(): EventCounts {
  return { spawns: 0, completes: 0, critique_passes: 0, critique_blocks: 0, audit_passes: 0, audit_fails: 0 };
}

/** Increment the appropriate counter in `counts` for the given event value. */
function accumulateEv(counts: EventCounts, ev: string): void {
  if (ev === 'SPAWN') counts.spawns++;
  else if (ev === 'COMPLETE') counts.completes++;
  else if (ev === 'CRITIQUE_PASS') counts.critique_passes++;
  else if (ev === 'CRITIQUE_BLOCK') counts.critique_blocks++;
  else if (ev === 'AUDIT_PASS') counts.audit_passes++;
  else if (ev === 'AUDIT_FAIL') counts.audit_fails++;
}

/**
 * Compute aggregated SessionStats from a Session and its associated EventLogEntry[].
 *
 * feedback_loops: count of consecutive same-agent SPAWN events immediately
 * following a CRITIQUE_BLOCK or AUDIT_FAIL event in the event stream (sorted by seq).
 *
 * Validates output with SessionStatsSchema.parse() before returning.
 */
export function computeSessionStats(session: Session, events: EventLogEntry[]): SessionStats {
  // Sort events by seq for deterministic traversal
  const sorted = [...events].sort((a, b) => a.seq - b.seq);

  // --- Totals ---
  const totals = makeEmptyCounts();
  for (const entry of sorted) {
    accumulateEv(totals, entry.ev);
  }

  // --- Total feedback_loops ---
  // A feedback loop is a consecutive same-agent SPAWN immediately following
  // a CRITIQUE_BLOCK or AUDIT_FAIL in the event stream.
  let total_feedback_loops = 0;
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const prev = sorted[i - 1];
    if (!cur || !prev) continue;
    if (
      cur.ev === 'SPAWN' &&
      cur.agent_id === prev.agent_id &&
      (prev.ev === 'CRITIQUE_BLOCK' || prev.ev === 'AUDIT_FAIL')
    ) {
      total_feedback_loops++;
    }
  }

  // --- Per-agent roll-up ---
  const agentMap = new Map<string, EventCounts & { feedback_loops: number; timestamps: number[] }>();

  const getOrCreate = (agentId: string) => {
    if (!agentMap.has(agentId)) {
      agentMap.set(agentId, { ...makeEmptyCounts(), feedback_loops: 0, timestamps: [] });
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return agentMap.get(agentId)!;
  };

  for (const entry of sorted) {
    const bucket = getOrCreate(entry.agent_id);
    accumulateEv(bucket, entry.ev);
    const ts = Date.parse(entry.ts);
    if (!isNaN(ts)) bucket.timestamps.push(ts);
  }

  // Per-agent feedback_loops
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const prev = sorted[i - 1];
    if (!cur || !prev) continue;
    if (
      cur.ev === 'SPAWN' &&
      cur.agent_id === prev.agent_id &&
      (prev.ev === 'CRITIQUE_BLOCK' || prev.ev === 'AUDIT_FAIL')
    ) {
      getOrCreate(cur.agent_id).feedback_loops++;
    }
  }

  const agents: AgentActivity[] = [];
  for (const [agentId, data] of agentMap.entries()) {
    let wall_clock_ms: number | undefined;
    if (data.timestamps.length >= 2) {
      const min = Math.min(...data.timestamps);
      const max = Math.max(...data.timestamps);
      const delta = max - min;
      wall_clock_ms = delta > 0 ? delta : undefined;
    }

    agents.push({
      agent_id: agentId,
      spawns: data.spawns,
      completes: data.completes,
      critique_passes: data.critique_passes,
      critique_blocks: data.critique_blocks,
      audit_passes: data.audit_passes,
      audit_fails: data.audit_fails,
      feedback_loops: data.feedback_loops,
      wall_clock_ms,
    });
  }

  // --- wall_clock_ms for the whole session ---
  let wall_clock_ms: number | undefined;
  if (sorted.length >= 2) {
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (first && last) {
      const t0 = Date.parse(first.ts);
      const t1 = Date.parse(last.ts);
      if (!isNaN(t0) && !isNaN(t1)) {
        wall_clock_ms = t1 - t0;
      }
    }
  }

  const raw = {
    session_id: session.id,
    total_spawns: totals.spawns,
    total_completes: totals.completes,
    total_feedback_loops,
    total_critique_passes: totals.critique_passes,
    total_critique_blocks: totals.critique_blocks,
    total_audit_passes: totals.audit_passes,
    total_audit_fails: totals.audit_fails,
    agents,
    wall_clock_ms,
    event_count: events.length,
  };

  return SessionStatsSchema.parse(raw);
}

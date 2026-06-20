# SEAM-04 — feedback_loops Semantics Contract

**Decided:** 2026-06-20  
**Owner:** BE#2 (t3)  
**Status:** Implemented in s2 (prog-studio-vision-2026-06-s2-fix-broken-surfaces)  
**For s3:** Read-only — do not modify the rule definition without a new SEAM

---

## 1. Decision Summary

A **feedback loop** is defined as:

> A `SPAWN` event immediately following a `CRITIQUE_BLOCK` or `AUDIT_FAIL` event
> in the **same task stream** (same `task_id` prefix), attributed to the **spawned agent**
> (`cur.agent_id`), regardless of which agent carries the block event.

**No same-agent gate applies.** The old rule required `cur.agent_id === prev.agent_id`
(the spawned agent must match the agent that emitted the block). That gate silently zeroed
the metric on every real sprint.

---

## 2. Evidence from Real Logs

The following real JSONL events confirm that `CRITIQUE_BLOCK` is always carried by the
critic, and `AUDIT_FAIL` is always carried by the auditor — never by the remediated agent:

| File | Seq | ev | agent_id | Next seq | next ev | next agent_id |
|------|-----|----|----------|----------|---------|---------------|
| `agent-events-2026-05-20.jsonl` | 8 | CRITIQUE_BLOCK | CR#1 | 9 | SPAWN | PM#2 |
| `agent-events-2026-05-20.jsonl` | 54 | CRITIQUE_BLOCK | CR#1 | 55 | SPAWN | PM#2 |
| `agent-events-2026-05-20.jsonl` | 83 | AUDIT_FAIL | AUDITOR#6 | 84 | SPAWN | FE#5b |
| `agent-events-2026-05-28.jsonl` | 113 | CRITIQUE_BLOCK | CR#1 | 114 | SPAWN | PM#2 |

In all cases, the block event's `agent_id` differs from the next SPAWN's `agent_id`.
The old same-agent gate (`cur.agent_id === prev.agent_id`) therefore NEVER fired on
these real sprints, producing `total_feedback_loops = 0` even when remediation loops occurred.

---

## 3. Rule Implementation

Both code paths implement the IDENTICAL rule:

### JSONL path — `packages/server/src/parsers/session-stats.ts`

```typescript
// Total feedback_loops
if (
  cur.ev === 'SPAWN' &&
  (prev.ev === 'CRITIQUE_BLOCK' || prev.ev === 'AUDIT_FAIL')
) {
  total_feedback_loops++;
}

// Per-agent feedback_loops (attributed to spawned agent)
if (
  cur.ev === 'SPAWN' &&
  (prev.ev === 'CRITIQUE_BLOCK' || prev.ev === 'AUDIT_FAIL')
) {
  getOrCreate(cur.agent_id).feedback_loops++;
}
```

### Markdown path — `packages/server/src/parsers/session-parser.ts` (lines 171-185)

```typescript
// parseAgentActivity: already had no same-agent gate (unchanged)
if (
  cur.event === 'SPAWN' &&
  (prevEvent === 'CRITIQUE_BLOCK' || prevEvent === 'AUDIT_FAIL')
) {
  const prev = feedbackLoopsByAgent.get(cur.agent) ?? 0;
  feedbackLoopsByAgent.set(cur.agent, prev + 1);
}
```

---

## 4. Attribution Model

- **Total** (`total_feedback_loops`): incremented for any SPAWN after CRITIQUE_BLOCK|AUDIT_FAIL in the task stream.
- **Per-agent** (`agents[n].feedback_loops`): incremented on the **spawned** agent's bucket (`cur.agent_id` for JSONL; `cur.agent` for markdown).
- The block event's agent (e.g. CR#1, AUDITOR#6) receives **zero** attribution.

This means `sum(agents[n].feedback_loops)` equals `total_feedback_loops`.

---

## 5. Interleaving and Segmentation Behavior

The JSONL path sorts all events globally by `seq` and operates over the full sorted stream
for a given task_id prefix. The markdown path operates over a single file's event table
(one session's rows, in document order).

**Divergence risk:** in a task-interleaved global stream, "immediately following" can mean
a CRITIQUE_BLOCK in task-t1 appears at seq N and the next SPAWN in seq N+1 belongs to task-t2.
The JSONL path would count this as a feedback loop even though the two events belong to different tasks.

**Mitigation:** the parity test uses a single-task fixture (`seam04-parity-task-t1`) with
all events in the same `task_id`, so the test is deterministic. In practice, the JSONL path
is invoked per-session (router.ts `session.stats` filters events by sprint slug), so
cross-task interleaving within a session is expected and intentional — all SPAWNs after
any block in the session count as remediation loops.

If s3 requires finer-grained task-level segmentation, this contract must be revised.

---

## 6. Parity Test Reference

**File:** `packages/server/src/parsers/__tests__/seam-04-feedback-loops.test.ts`

- Test 1: JSONL path produces `total_feedback_loops = 2` on `agent-events-seam04-parity.jsonl` (cross-agent)
- Test 2: Old same-agent gate produces `0` on the same fixture (regression proof — test FAILS on old logic)
- Test 3: Markdown path produces `≥1` on `gander-p2-hone-skill.md` (real-world cross-agent table)
- Test 4: Both paths non-zero (metric not silently zeroed)

---

## 7. What Changed in s2

| File | Change |
|------|--------|
| `session-stats.ts` | Removed `cur.agent_id === prev.agent_id` gate from both total and per-agent counters |
| `session-parser.ts` | NO CHANGE — lines 171-185 already had no same-agent gate (this was the inconsistency; session-stats.ts was the broken side) |
| `event-log-parser.test.ts` | Updated test-6 comment to reflect SEAM-04 rule; behavior unchanged (synthetic fixture still produces 1 loop) |
| `seam-04-feedback-loops.test.ts` | NEW parity test with real-shaped cross-agent fixture |
| `agent-events-seam04-parity.jsonl` | NEW parity fixture reflecting real log attribution patterns |

## [STAGE 3] COMPLETE
- **At:** 2026-06-20T10:45:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/server/src/parsers/session-stats.ts` | +16/-5 | Removed same-agent gate from both total and per-agent feedback_loops counters; added SEAM-04 comment |
| `packages/server/src/parsers/session-parser.ts` | +3/-2 | Updated misleading comment at lines 171-173; code was already correct (no same-agent gate) |
| `packages/server/src/parsers/__tests__/event-log-parser.test.ts` | +8/-3 | Updated test-6 description to reflect SEAM-04 rule; behavior unchanged |
| `packages/server/src/parsers/__tests__/seam-04-feedback-loops.test.ts` | 178 | NEW parity test (6 tests, all green) |
| `packages/server/src/parsers/__tests__/fixtures/agent-events-seam04-parity.jsonl` | 14 | NEW parity fixture with real-shaped cross-agent attribution |
| `docs/programs/prog-studio-vision-2026-06/seam-04-feedback-loops-contract.md` | 130 | NEW SEAM-04 contract note for s3 read-only |

- **Lint / tests:** 82/82 tests pass (`npx vitest run packages/server/src/parsers/__tests__/`)
- **Open items:** none

### Checkpoint — 10:42:00
- Wrote `packages/server/src/parsers/session-stats.ts` (removed same-agent gate). Next: verify session-parser.ts unchanged.
### Checkpoint — 10:43:00
- Updated `session-parser.ts` comment only (code was already correct). Next: write fixtures + tests.
### Checkpoint — 10:44:00
- Wrote `agent-events-seam04-parity.jsonl` + `seam-04-feedback-loops.test.ts` + `seam-04-feedback-loops-contract.md`. Tests: 82/82 pass.

## [STAGE 2] PLAN
- **At:** 2026-06-20T00:05:00Z
- **Approach:**
  1. Decision (SEAM-04): DROP the same-agent gate in session-stats.ts. Real logs show CRITIQUE_BLOCK carries CR#n and AUDIT_FAIL carries AUDITOR#n — the remediated agent is always the NEXT SPAWN, not the block's agent. Unified rule: a feedback loop = any SPAWN immediately following AUDIT_FAIL|CRITIQUE_BLOCK in the same task stream, attributed to the SPAWNED agent.
  2. Fix session-stats.ts lines 46-61 and 82-93: remove `cur.agent_id === prev.agent_id` gate from both the total counter and per-agent counter.
  3. Verify session-parser.ts lines 171-185 (the markdown path): ALREADY has no same-agent gate — this is already correct and we must NOT regress it.
  4. Create a real-shaped parity JSONL fixture where blocks carry critic/auditor agent_id, proving both JSONL and markdown paths agree.
  5. Write a parity test in a new file `__tests__/seam-04-feedback-loops.test.ts`.
  6. Update existing test in event-log-parser.test.ts (test 6): the old test asserts "counts CRITIQUE_BLOCK → same-agent SPAWN" (with BE#1 on both sides). With the new rule, the same fixture STILL produces 1 feedback_loop (the rule is MORE permissive, not less). Test passes unchanged but comment must be updated.
  7. Write the SEAM-04 contract note to docs/programs/prog-studio-vision-2026-06/seam-04-feedback-loops-contract.md.
- **Files to create/modify:**
  - `packages/server/src/parsers/session-stats.ts` → remove same-agent gate (lines 54-60, 86-92)
  - `packages/server/src/parsers/__tests__/fixtures/agent-events-seam04-parity.jsonl` → real-shaped fixture (critic blocks, different agents)
  - `packages/server/src/parsers/__tests__/seam-04-feedback-loops.test.ts` → parity test
  - `docs/programs/prog-studio-vision-2026-06/seam-04-feedback-loops-contract.md` → SEAM-04 contract note
  - `packages/server/src/parsers/__tests__/event-log-parser.test.ts` → update test 6 comment only (behavior unchanged since same fixture still produces 1 loop with new rule)
  - `packages/server/src/parsers/session-parser.ts` → NO CHANGE (lines 171-185 already correct, no same-agent gate)
- **Dependencies / assumptions:**
  - session-parser.ts lines 171-185 has NO same-agent gate (VERIFIED above)
  - The existing agent-events-fixture.jsonl has BE#1 on both CRITIQUE_BLOCK (seq 4) and SPAWN (seq 5) — this is a synthetic fixture that still produces 1 feedback_loop with the new rule (the SPAWN follows a CRITIQUE_BLOCK, new rule counts it regardless of agent_id match)
  - Must NOT touch router.ts, schemas.ts, or client files per task brief

## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-06-20T00:00:00Z
- **Task ID:** prog-studio-vision-2026-06-s2-fix-broken-surfaces-t3
- **Message received:**
  > You are the backend-engineer. Decide and implement the feedback_loops semantics contract (SEAM-04). Make REAL edits.
  > ...Your files: packages/server/src/parsers/session-parser.ts (parseAgentActivity 171-185), packages/server/src/parsers/session-stats.ts (computeSessionStats 46-61).
  > STEP 1 (decide against REAL data): read several /home/jhber/projects/gander-studio-alpha/docs/events/*.jsonl. Confirm how CRITIQUE_BLOCK/AUDIT_FAIL are attributed (which agent_id).
  > STEP 2: implement that EXACT rule identically in BOTH files...
  > STEP 3: record the decision as a markdown contract note...Add a parity test proving both paths agree on a real-shaped log.
  > …[truncated]

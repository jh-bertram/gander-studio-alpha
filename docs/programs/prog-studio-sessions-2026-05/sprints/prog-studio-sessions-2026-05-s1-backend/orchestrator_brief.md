---
type: orchestrator-brief
sprint_id: prog-studio-sessions-2026-05-s1-backend
program_id: prog-studio-sessions-2026-05
status: PLANNED
---

# Orchestrator Brief — S1: Backend + Parsers + Schemas

## Sprint ID
`prog-studio-sessions-2026-05-s1-backend`

## Program ID
`prog-studio-sessions-2026-05`

## Goal

Build the data layer for the Sessions mode: parse `${GANDER_ROOT}/docs/post-mortems/*.md` and `${GANDER_ROOT}/docs/events/agent-events-*.jsonl` into typed `Session` objects; expose four read/write tRPC procedures; publish the Zod contracts to `packages/shared/src/schemas.ts`.

## Sibling Awareness

**Sibling sprints in this program:**
- `prog-studio-sessions-2026-05-s1-backend` (this sprint) — Backend + Parsers + Schemas.
- `prog-studio-sessions-2026-05-s2-list-edit` — Frontend list + viewer + markdown editor.
- `prog-studio-sessions-2026-05-s3-analyze` — Analysis surface (visualization + picker).

**DAG edges involving this sprint:**
- Outgoing: `s1-backend → s2-list-edit` (S2 consumes Session schema + tRPC procedures).
- Outgoing: `s1-backend → s3-analyze` (S3 consumes `SessionStatsSchema` + `session.getStats`).
- Incoming: (none).

**Integration seams owned by this sprint:**
- `s1-to-s2-session-schema` — Publishes `SessionSchema`, `AgentActivitySchema`, `EventLogEntrySchema` to `packages/shared/src/schemas.ts`. S2 imports types via `z.infer`; never redefines them.
- `s1-to-s2-trpc-procs` — Publishes `session.list`, `session.get`, `session.saveEdit` in `packages/server/src/router.ts`. S2 calls only via the typed client.
- `s1-to-s3-stats-schema` — Publishes `SessionStatsSchema` to `packages/shared/src/schemas.ts`.
- `s1-to-s3-trpc-stats` — Publishes `session.getStats` in `packages/server/src/router.ts`. Aggregation lives in S1, never in the client.
- `s1-to-s2-edits-dir` — Publishes new env var `SESSIONS_EDITS_DIR` via `packages/server/src/env.ts`.

This sprint MUST publish the schemas before S2 or S3 begin. Treat the schemas as the program's stable contract.

## Inputs

- Source files (read-only): `${GANDER_ROOT}/docs/post-mortems/*.md` (17 files at planning time), `${GANDER_ROOT}/docs/events/agent-events-*.jsonl` (7+ files).
- Format reference: `${GANDER_ROOT}/docs/post-mortems/gander-studio-p1.md` and `${GANDER_ROOT}/docs/post-mortems/gander-p5-obsidian-l0-l1.md` cover representative format variation.
- Existing parser style: `packages/server/src/parsers/` (loadout / agent / skill / hook parsers).
- Env conventions: `packages/server/src/env.ts`.
- Cross-sprint invariants from `program.md` (copied below).

## Outputs

Files this sprint creates or modifies:
- `packages/shared/src/schemas.ts` — append `SessionSchema`, `AgentActivitySchema`, `EventLogEntrySchema`, `SessionStatsSchema`.
- `packages/server/src/router.ts` — append four procedures: `session.list`, `session.get`, `session.getStats`, `session.saveEdit`.
- `packages/server/src/parsers/session-parser.ts` — new file; parses post-mortem frontmatter + Section 2 activity tables.
- `packages/server/src/parsers/event-log-parser.ts` — new file; parses JSONL event logs into typed events.
- `packages/server/src/parsers/session-stats.ts` — new file; joins parsed sessions with event-log entries; produces `SessionStats` (agent counts, feedback loops, audit attribution, wall-clock).
- `packages/server/src/env.ts` — add `SESSIONS_EDITS_DIR` (Zod-validated, default `${LOADOUTS_DIR}/../sessions-edits`).
- `.env.example` — add `SESSIONS_EDITS_DIR` documentation row.
- `CLAUDE.md` — append `SESSIONS_EDITS_DIR` to the env table.
- Test fixtures + unit tests under `packages/server/src/parsers/__tests__/`.

## Cross-Sprint Invariants

(verbatim from `program.md`)

1. Session Zod schema lives in `packages/shared/src/schemas.ts`; cross-sprint types derive via `z.infer`.
2. Save-to-new-folder convention: `SESSIONS_EDITS_DIR`, default `${LOADOUTS_DIR}/../sessions-edits`. `session.saveEdit` writes only there. Path traversal blocked at boundary.
3. S2 owns nav registration; S1 publishes only the `SESSIONS_EDITS_DIR` env contract.
4. Design tokens — N/A for this sprint (BE-only).
5. TypeScript strict + Zod boundaries on every new procedure.

## Success Criteria (Sprint-Level)

1. **Schemas published.** `SessionSchema`, `AgentActivitySchema`, `EventLogEntrySchema`, `SessionStatsSchema` exist in `packages/shared/src/schemas.ts` and are exported. `npm run lint` clean across all three packages.
2. **Parsers correct.** Given `gander-studio-p1.md` as input, the post-mortem parser extracts frontmatter (`type`, `sprint`, `date`, `gap_classes`, `status`) and the per-wave agent activity tables from Section 2. Verified by a unit test in `packages/server/src/parsers/__tests__/session-parser.test.ts` with at least three representative post-mortems as fixtures.
3. **Event log join correct.** Given a sprint slug + date, `session-stats.ts` finds matching JSONL events (by `task_id` prefix and date range), groups by `agent_id`, counts SPAWN / COMPLETE pairs, and identifies feedback loops (consecutive same-agent SPAWNs after CRITIQUE_BLOCK / audit FAIL). Verified by unit test.
4. **tRPC procedures wired.** All four procedures (`list`, `get`, `getStats`, `saveEdit`) registered in `router.ts` with input + output Zod schemas.
5. **saveEdit safety.** `session.saveEdit` rejects paths that escape `SESSIONS_EDITS_DIR` (path traversal blocked); writes only inside that folder; creates the folder if missing. Verified by unit test with a malicious input case (`../../../etc/passwd`-style payloads).
6. **Env config.** `SESSIONS_EDITS_DIR` parsed by Zod in `env.ts` with a default; documented in `.env.example` and project `CLAUDE.md`.
7. **No regressions.** Existing loadout-related tRPC procedures (`agent.*`, `skill.*`, `hook.*`, `loadout.*`, `export.*`, `health`) untouched; existing tests still pass.

**Out of scope:**
- Any UI work. This sprint adds no pages, components, or styles.
- Aggregation knobs S3 needs but cannot infer from the basic stats (e.g., dimensional pivots beyond per-agent / per-wave) — S3 will route a `<dag_update_request>` if needed.
- The proximity edge regression bug (carry-forward).

## Routing Hints

- **BE agent** owns this sprint end-to-end.
- **Foreground dispatch** (BE has hard lint-clean SC; background-agent Bash restriction would silently break it).
- **Audit pipeline** runs after each completion: SA + QA + SX. A failing parser test = audit FAIL = remediation loop via `ralph-loop`.

## Notes for the PM

- Decompose into ≤ 5 task packets. Suggested cut: (a) Zod schemas, (b) post-mortem parser + tests, (c) event-log parser + stats join + tests, (d) tRPC procedures + env wiring, (e) `saveEdit` security check + tests.
- Do NOT excerpt the schema contracts inside task-packet descriptions — point at `program.md` and `packages/shared/src/schemas.ts` as the source of truth (prompt-vs-contract drift rule).
- Run `convention-detect` at Step 0.5 to refresh package manager / lint command knowledge.
- Run `pm-preflight` before decomposition to surface recurring protocol-gap patterns from recent post-mortems.

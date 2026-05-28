---
type: program-manifest
program_id: prog-studio-sessions-2026-05
created: 2026-05-06
status: PLANNED
---

# Program: Gander Studio Sessions Mode (P3)

## Goal

**Verbatim human goal:**
> let's make a series of improvements to gander-studio. i want it to be a project sprint interface — it sees a list of particularly-formatted markdowns in our folders, and these are old sessions, and a user can open a session and see which agents were used, and various stats about their use in that session. sure this is displayed visually or also in a table. it goes back and forth, use the compose feature to set the table, and then use the analyze feature to look at how the game played out. maybe this is a large undertaking, so let's try our new moirai skill.

**Restatement.** Add a *Sessions* mode to `gander-studio-alpha` that browses, views, edits, and analyzes the session-formatted markdowns produced by the Gander agent team (post-mortems joined with daily JSONL event logs). The mode is **additive** — existing Browse / Compose / Edit / Export loadout pages remain unchanged. A user can:

1. List sessions parsed from `${GANDER_ROOT}/docs/post-mortems/*.md` joined with `${GANDER_ROOT}/docs/events/agent-events-*.jsonl`.
2. Open a session and view which agents were used + per-agent stats (counts, feedback-loop tallies, audit pass/fail attribution, wall-clock duration).
3. View the result visually (timeline / panels) or as a sortable table.
4. Edit the source markdown in a basic editor and save edits to a new folder (`SESSIONS_EDITS_DIR`) — originals are never overwritten.

The user described the loop as "use compose to set the table, then analyze to see how the game played out." Mapping: *set-the-table* = pick a session and configure analysis dimensions (which agents, which metrics); *see-how-it-played-out* = the rendered analysis surface. The two alternate.

## Invariants

These contracts are shared across all siblings; each sibling brief copies this list verbatim.

1. **Session Zod schema** — `packages/shared/src/schemas.ts` is the single source of truth. S1 defines `SessionSchema`, `AgentActivitySchema`, `EventLogEntrySchema`, `SessionStatsSchema`. S2 and S3 derive types via `z.infer` and never redefine schemas in the client.
2. **Save-to-new-folder convention** — new env var `SESSIONS_EDITS_DIR`, default `${LOADOUTS_DIR}/../sessions-edits`. The `session.saveEdit` mutation writes only there. Reads from `${GANDER_ROOT}` are read-only. Path traversal is blocked at the boundary by S1.
3. **Navigation registration** — S2 owns the new `"sessions"` top-level mode in `packages/client/src/constants/navigation.*`. S3 fills the reserved `Analyze` tab slot by editing the same constants file. One nav-mode declaration; one slot-flip; no parallel rewrites of the same file.
4. **Design tokens** — every new view uses existing FF7 Remake Intergrade tokens in `packages/client/src/globals.css`. No ad-hoc hex values; no new color tokens without an explicit token-file edit reviewed at audit time.
5. **TypeScript strict + Zod boundaries** — every new tRPC procedure has `input` and `output` Zod schemas; types inferred via `z.infer<typeof Schema>`.

## Sprint Roster

| sprint_id | goal | depends_on |
|-----------|------|------------|
| `prog-studio-sessions-2026-05-s1-backend` | Backend pipeline: parse post-mortem markdowns + JSONL event logs into typed Session objects; expose four tRPC procedures (`session.list`, `session.get`, `session.getStats`, `session.saveEdit`); publish Zod schemas to `packages/shared/src/schemas.ts`. | (none) |
| `prog-studio-sessions-2026-05-s2-list-edit` | Frontend list + viewer + markdown editor: new top-level "Sessions" mode; list page; detail page with Overview / Table / Markdown Editor tabs; save-to-new-folder flow with `SESSIONS_EDITS_DIR` integration. Reserves the "Analyze" tab slot for S3. | `prog-studio-sessions-2026-05-s1-backend` |
| `prog-studio-sessions-2026-05-s3-analyze` | Analysis surface: timeline of agent spawns/completions; per-agent stat panels; sortable stat table; "set the table" picker for choosing session + agents + metrics + dimensions. Fills the "Analyze" slot S2 reserved. | `prog-studio-sessions-2026-05-s1-backend`, `prog-studio-sessions-2026-05-s2-list-edit` |

## Dependency DAG

Edges:
- `prog-studio-sessions-2026-05-s1-backend → prog-studio-sessions-2026-05-s2-list-edit`
- `prog-studio-sessions-2026-05-s1-backend → prog-studio-sessions-2026-05-s3-analyze`
- `prog-studio-sessions-2026-05-s2-list-edit → prog-studio-sessions-2026-05-s3-analyze` (soft — for nav-slot ownership)

Topological tiers:
- Tier 0: `prog-studio-sessions-2026-05-s1-backend`
- Tier 1: `prog-studio-sessions-2026-05-s2-list-edit`
- Tier 2: `prog-studio-sessions-2026-05-s3-analyze`

S2 and S3 *could* run in parallel against S1's published schema, but the `s2 → s3` edge captures navigation slot ownership: S2 reserves the `Analyze` placeholder so S3 fills it without two concurrent edits of `navigation.ts`. If the human wants true S2/S3 parallelism, the contract can be hardened by having S2 ship a stub `Analyze` tab on day one of its execution, then S3 swaps the stub in place.

DAG visualization: [`program-map.html`](./program-map.html)

## Integration Seams

| seam_id | from_sprint | to_sprint | artifact | format | contract |
|---------|-------------|-----------|----------|--------|----------|
| `s1-to-s2-session-schema` | s1-backend | s2-list-edit | `packages/shared/src/schemas.ts` | Zod schemas: `SessionSchema`, `AgentActivitySchema`, `EventLogEntrySchema` | S2 imports types via `z.infer`; never redefines them. |
| `s1-to-s2-trpc-procs` | s1-backend | s2-list-edit | `packages/server/src/router.ts` | tRPC procedures `session.list`, `session.get`, `session.saveEdit` | S2 calls only via the typed client; input/output validated by S1's Zod schemas. |
| `s1-to-s3-stats-schema` | s1-backend | s3-analyze | `packages/shared/src/schemas.ts` | Zod schema `SessionStatsSchema` | S3 imports type via `z.infer`; aggregation logic lives in S1, not the client. |
| `s1-to-s3-trpc-stats` | s1-backend | s3-analyze | `packages/server/src/router.ts` | tRPC procedure `session.getStats` | S3 calls via the typed client; if a needed aggregation is missing, S3 routes a `<dag_update_request>` back to S1 — does not re-aggregate locally. |
| `s2-to-s3-nav-slot` | s2-list-edit | s3-analyze | `packages/client/src/constants/navigation.ts` | Object literal `{ id: "analyze", label: "Analyze", placeholder: true }` reserved on the Sessions mode | S2 reserves the slot; S3 swaps `placeholder: true → false` and binds the component path. Only one nav-constants edit per sibling. |
| `s1-to-s2-edits-dir` | s1-backend | s2-list-edit | `packages/server/src/env.ts` | Env var `SESSIONS_EDITS_DIR` exported via `env.ts`; documented in `.env.example` | S2 calls `session.saveEdit` only; env validation is S1's responsibility. |

## Success Criteria (Program-Level)

1. All three siblings reach DONE with audit PASS (SA + QA + SX).
2. Cross-sprint invariants 1-5 hold post-merge: one Session schema, one save folder, one nav-mode registration, no ad-hoc color tokens, TypeScript strict throughout.
3. Existing loadout pages (Browse / Compose / Edit / Export) continue to function unchanged — verified by manual smoke pass.
4. End-to-end live walkthrough: a user can open the running app, click into the Sessions mode, list at least one post-mortem, view agent attribution + stats (Overview + Table), edit the markdown, save to `SESSIONS_EDITS_DIR`, switch to Analyze, and exercise the picker → visualization round-trip — all without page errors or console errors.

Each sibling carries its own sprint-level SCs in its orchestrator brief.

## Status

`PLANNED` — moirai has emitted planning artifacts only; no sibling has been dispatched. The companion `skein` skill will update this field after all siblings reach DONE / FAILED.

## Known Concurrent Issues (Not In Scope)

- **Proximity edge regression** on the materia canvas (sprint `gander-studio-p2-agent-cards`, 2026-04-04): link sound plays but no edge renders after proximity linking. Tracked as session-checkpoint carry-forward; NOT folded into this program. See `.claude/agents/tasks/outputs/SESSION-CHECKPOINT-2026-04-04.md`.

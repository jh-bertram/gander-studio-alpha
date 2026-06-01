## [STAGE 3] COMPLETE
- **At:** 2026-05-30T00:20:00Z
- **Deliverables:**

| File | Lines added | Notes |
|---|---|---|
| `packages/shared/src/schemas.ts` | +107 | ConnectivityGraphSchema + type export; insert-only (0 removed lines) |
| `packages/server/src/router.ts` | +47 | Named import update + connectivityRouter + appRouter wiring |

- **Lint / tests:** `npm run lint` (tsc --noEmit ×3) exit code 0
- **Real-file parse:** PASS — schema_version 1.0, nodes 77, edges 103, 4 diagnostic arrays
- **Open items:** none

### Checkpoint — 00:20:00
- Wrote `packages/shared/src/schemas.ts` (107 new lines). Next: complete.
- Wrote `packages/server/src/router.ts` (47 new lines). Next: complete.

---

## [STAGE 2] PLAN
- **At:** 2026-05-30T00:10:00Z
- **Approach:**
  1. Read real graph file and audit every node/edge `data` field for explicit null emissions
  2. Determine nullability: `agent.tier` (13/13 null), `agent.version` (1/13 null) → `.nullable().optional()`; `skill.version` (6 absent, 0 null) → `.optional()` only
  3. Add `ConnectivityGraphSchema` + `export type ConnectivityGraph` to `packages/shared/src/schemas.ts` (insert-only)
  4. Add `ConnectivityGraph` and `ConnectivityGraphSchema` to the named import block in `router.ts`
  5. Add `connectivityRouter` const with `getGraph` procedure to `router.ts`
  6. Wire `connectivity: connectivityRouter` into `appRouter`
  7. Run `ConnectivityGraphSchema.safeParse` against real graph file to verify
  8. Run `npm run lint`
- **Files to create/modify:**
  - `packages/shared/src/schemas.ts` → append ConnectivityGraphSchema + type export (INSERT-ONLY)
  - `packages/server/src/router.ts` → add to named import block + connectivityRouter + appRouter wiring
- **Dependencies / assumptions:**
  - `path` is already imported in router.ts (it is — line 4)
  - `readFile` is already imported in router.ts (it is — line 3)
  - `guardPath` is already defined (line 32)
  - `GANDER_ROOT` is already imported (line 5)

## [STAGE 1] RECEIVED
- **From:** Orchestrator
- **At:** 2026-05-30T00:00:00Z
- **Task ID:** p7-t1-be
- **Message received:**
  > Implement task **p7-t1-be** for sprint `gander-studio-p7-graph-viz`: add a `ConnectivityGraphSchema` Zod schema to `packages/shared/src/schemas.ts` and a `connectivityRouter` with a `getGraph` procedure to `packages/server/src/router.ts`. This is the BE contract the FE renderer depends on.
  >
  > Critical nullability requirement: schema's nullability authority is the REAL on-disk graph. The analyzer EMITS some fields as explicit `null` (not just absent):
  > - `tier: null` on agent nodes (13 occurrences)
  > - `version: null` on the `database` agent node (1 occurrence)
  > `z.string().optional()` ACCEPTS absent/undefined but REJECTS explicit `null`. So **any field the real file ever emits as `null` MUST be `.nullable().optional()`**.
  > …[truncated]

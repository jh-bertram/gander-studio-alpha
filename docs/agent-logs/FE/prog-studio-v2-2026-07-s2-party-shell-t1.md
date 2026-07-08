## [STAGE 1] RECEIVED
- **From:** ORC (task_id in prompt: `prog-studio-v2-2026-07-s2-party-shell-t1`)
- **At:** 2026-07-08T01:34:39Z
- **Task ID:** prog-studio-v2-2026-07-s2-party-shell-t1
- **Message received:**
  > You are FE#1 executing task packet `prog-studio-v2-2026-07-s2-party-shell-t1` — the store contract + nav constants foundation of the s2 party-shell sprint. Your contract is TWO files read together (packet text prevails; amendment overrides on the amended points): PM packet t1 ONLY + amend-PM (W1-W5 resolutions; W2 mapping applies to your packet context). Scope summary (packet prevails): store/ui-store.ts gains the selectedAgentCode contract (+ setter) for s3's click-through; constants/navigation.ts gains RAIL_ITEMS (Roster/Sessions/Progression/Programs). Do NOT touch the AppMode union or PAGE_MAP (t5's atomic packet owns them — G4 serialization: you are the FIRST ui-store writer, t5 is the second). Environment: dev server already running on :3001 (do NOT kill or restart it; do NOT start another). Verify: npm run lint (tsc ×3) clean; record outputs verbatim. Out of Scope: No components (t2/t3), no PartyPage (t4), no AppMode/PAGE_MAP/default-route (t5), no e2e (t6), no server/shared changes, NO git commit. …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-07-08T01:36:00Z
- **Components to build:** NONE (pure store + constants task, no JSX/components).
  - `packages/client/src/store/ui-store.ts` — add `selectedAgentCode: string | null` + `setSelectedAgentCode` to `UIState` and store impl. Do NOT touch `AppMode`, initial `activeMode`, or `partialize`.
  - `packages/client/src/constants/navigation.ts` — add new exported `RAIL_ITEMS` array (4 items: Roster→'browse' w/ interim comment, Sessions→'sessions', Progression→'progression', Programs→'programs'), each `{ label, mode, icon }` with lucide-react icon component references (`Users`, `FileClock`, `TrendingUp`, `GitBranch` — verified present in installed lucide-react 0.577.0 via node require check). Do NOT touch `NAV_ITEMS`.
- **State design:** `selectedAgentCode` is ephemeral client state (not persisted) — lives alongside existing `activeMode`/`muted` in the single `useUIStore`. No new store slice; extends existing flat `UIState` interface. `partialize` untouched (still persists only `muted`).
- **tRPC wiring:** None — this packet is pure client store/constants, no data fetching.
- **A11Y plan:** N/A — no JSX/components in this packet. `RAIL_ITEMS` icon field carries a component reference only; the consuming SubmenuRail (t3) owns aria wiring.
- **W2 mapping applicability:** W2 (spec-primitive→substitute mapping) targets t2/t3/t4 which build Card/Badge/Progress/Skeleton/Alert substitutes. t1 has no components and introduces no Shadcn-adjacent primitive, so the mapping table does not materially apply to this packet's deliverables — noted in ui_packet integration_status rather than reproduced verbatim (nothing to reproduce against).

### Checkpoint — 01:37:10
- Wrote `packages/client/src/store/ui-store.ts` (36 lines total, +8 net). Added `selectedAgentCode`/`setSelectedAgentCode` to `UIState` + store impl. `AppMode`, initial `activeMode`, `partialize` byte-unchanged. Constant audit: 0 raw hex matches. Next: navigation.ts.
### Checkpoint — 01:37:45
- Wrote `packages/client/src/constants/navigation.ts` (36 lines total, +18 net). Added `RAIL_ITEMS` (4 items, Roster/Sessions/Progression/Programs) typed against `AppMode`, lucide icon refs verified present in installed lucide-react via node require check. `NAV_ITEMS` byte-unchanged. Constant audit: 0 raw hex matches (dotColor tokens pre-existing, untouched). Next: run npm run lint.
### Checkpoint — 01:37:50
- Ran `npm run lint` (tsc --noEmit ×3, shared→server→client). Exit 0, no output — clean. Next: colocated store vitest (SC explicitly calls this out as acceptable).
### Checkpoint — 01:38:32
- Wrote `packages/client/src/store/__tests__/ui-store.test.ts` (23 lines). 3 tests: initializes null, setSelectedAgentCode('FE') round-trips, setSelectedAgentCode(null) clears. `npx vitest run` → 3 passed. Re-ran `npm run lint` after adding test file — still exit 0. Constant audit (hex/inline-style/JSON.parse/onClick-on-non-button) on all 3 touched/created files: 0 matches each. Next: write ui_packet output file.

## [STAGE 3] COMPLETE
- **At:** 2026-07-08T01:39:00Z
- **Deliverables:**

| File | Lines (net new) | Notes |
|---|---|---|
| `packages/client/src/store/ui-store.ts` | +8 | `selectedAgentCode`/`setSelectedAgentCode` added to `UIState` + store impl; `AppMode`, initial `activeMode`, `partialize` untouched (git diff confirmed) |
| `packages/client/src/constants/navigation.ts` | +18 | `RAIL_ITEMS` (4 items, AppMode-typed) added; `NAV_ITEMS` untouched (git diff confirmed) |
| `packages/client/src/store/__tests__/ui-store.test.ts` | +23 (new file) | Colocated vitest per SC "a colocated store vitest is acceptable"; 3/3 green |

- **Lint:** exit 0 (`tsc --noEmit` ×3: shared → server → client), clean, no output.
- **Constant audit:** 0 raw-hex matches, 0 inline-style/Tailwind conflicts, 0 `JSON.parse` calls, 0 bare-div/span/li/a `onClick` matches — across all 3 touched/created files.
- **Dev server:** :3001 confirmed still listening (untouched, not restarted).
- **Scope confirmation:** task_id `prog-studio-v2-2026-07-s2-party-shell-t1` (equivalently referenced as `prog-studio-v2-2026-07-s2-t1` in the PM decomposition packet) matches the task_id executed. No AppMode/PAGE_MAP/component/PartyPage/e2e work performed — out of scope for t1, left for t2–t6.


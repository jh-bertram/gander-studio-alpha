# PM Log — gander-studio-p2-canvas-link (Revision 1)

## [STAGE 1] RECEIVED
Timestamp: 2026-03-28T01:30:00Z
Task: Critic returned CRITIQUE_BLOCK on original plan (5 BLOCKERs + 2 WARNINGs).
Received: Full critique with required revisions for C1–C7.

---

## [STAGE 2] PLAN

### Source files read before revision

| File | Key facts confirmed |
|---|---|
| `packages/server/src/parsers/agent-parser.ts` | Fallback parser at lines 19-25 does `key: rest-of-line` — YAML arrays would produce raw string like `"[a, b]"` or empty. Tools normalization at lines 44-49 uses comma-split for exactly this reason. `communicates_with` is NOT currently read anywhere. |
| `packages/server/src/router.ts` | `agentRouter.save` writes tools as `tools: ${input.tools.join(', ')}` (comma-string). `communicates_with` not present. Loadout save/list unchanged — adding `.connections` to LoadoutSchema is sufficient. |
| `packages/shared/src/schemas.ts` | `AgentSchema` has no `communicates_with`. `LoadoutSchema` has no `connections`. Both additions are safe. |
| `packages/client/src/store/canvas-store.ts` | `loadFromLoadout` drops edges — no connections param. `selectLoadoutPayload` emits `hooks: []`, no connections. Both need updating (task 001b). |
| `packages/client/src/pages/ComposePage.tsx` | `handleSave` builds payload without connections. `handleLoad` calls `canvasLoadFromLoadout(lo)` — edges lost on load. Task 001b scope. |
| `packages/client/src/constants/canvas.ts` | `EDGE_GLOW` exists but not applied. `CANVAS_PROXIMITY_THRESHOLD_PX = 60` confirmed. File is the right home for all new animation/sound constants (C7). |

### Blocker resolution plan

- **C1**: Split 003 into 003a (wave 2, visual CSS only: glassy orb + edge glow), 003b (wave 3, proximity animation + sound), 003c (wave 4, list panel + ComposePage wiring).
- **C2**: Split 001 into 001a (wave 1, BE: schemas.ts + agent-parser.ts + router.ts) and 001b (wave 2, FE: canvas-store + ComposePage wiring). No file conflict: 001b touches ComposePage; 003c adds LoadoutListPanel (separate component) and minimal ComposePage import — clear boundaries specified in out_of_scope.
- **C3**: Add 003-RA in wave 1, parallel with 001a and 002. Block 003b on RA dossier.
- **C4**: Each FE sub-task gets named Playwright Tier 2 spec in success_criteria.
- **C5**: 001a success_criteria gets explicit comma-delimited serialization + comma-split normalization + round-trip test for communicates_with.
- **C6 WARNING**: human_confirmation_gate before 003c; question: flat three-section panel vs. tree hierarchy.
- **C7 WARNING**: Each FE sub-task success_criteria requires all animation/sound numeric values exported as named constants from canvas.ts.

### Wave structure

```
Wave 1 (parallel): 001a (BE), 002 (UI Designer), 003-RA (Researcher)
Wave 2 (after 001a passes audit): 001b (FE — canvas-store/ComposePage)
Wave 2 also (after 002 passes audit): 003a (FE visual CSS — depends on 002 only)
Wave 3 (after 003a + 003-RA pass audit): 003b (FE interaction + sound)
[Human confirmation gate — C6: flat vs. tree]
Wave 4 (after 001b + 003b + human confirmation): 003c (FE list panel + wiring)
```

### Tasks to draft: 001a, 001b, 002, 003-RA, 003a, 003b, 003c (7 total)

---

Checkpoint: Starting task packet drafting.

---

## [STAGE 3] COMPLETE
Timestamp: 2026-03-28T01:50:00Z
Output written to: .claude/agents/tasks/outputs/gander-studio-p2-canvas-link-PM-rev1-1743120600.md

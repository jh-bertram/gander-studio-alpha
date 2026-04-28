## [STAGE 2] PLAN
- **At:** 2026-04-27T23:05:00Z
- **Components to build:**
  - CREATE `packages/client/src/components/compose/handle-style.ts` — new module exporting INVISIBLE_HANDLE_STYLE
  - MODIFY `packages/client/src/components/compose/MateriaNode.tsx` — remove HANDLE_STYLE const (lines 42-55), add import, replace 2 usages
  - MODIFY `packages/client/src/components/compose/CardNode.tsx` — remove CARD_HANDLE_STYLE const (lines 17-27), add import, replace 2 usages
  - MODIFY `packages/client/src/constants/compose.ts` — remove line 11 (META_AGENTS un-aliased), remove line 79 dead branch, add comment above line 75
  - MODIFY `packages/client/src/components/compose/MateriaCanvas.tsx` — update buildPaletteItemStyle to pass explicit role to getMateriaColor
- **State design:** No state changes — pure refactoring
- **tRPC wiring:** None
- **A11Y plan:** No accessibility changes — handle aria-hidden preserved as-is
### Checkpoint — 23:06:00
- Wrote `packages/client/src/components/compose/handle-style.ts` (19 lines). Constant audit: 0 hex matches. Next: update MateriaNode.tsx.

### Checkpoint — 23:07:00
- Modified `packages/client/src/components/compose/MateriaNode.tsx`: removed HANDLE_STYLE const, added INVISIBLE_HANDLE_STYLE import, replaced 2 usages. Next: update CardNode.tsx.

### Checkpoint — 23:08:00
- Modified `packages/client/src/components/compose/CardNode.tsx`: removed CARD_HANDLE_STYLE const, added INVISIBLE_HANDLE_STYLE import, replaced 2 usages. Next: A6 — update compose.ts.

### Checkpoint — 23:09:00
- Modified `packages/client/src/constants/compose.ts`: removed META_AGENTS un-aliased import (line 11), removed dead branch `META_AGENTS.has(lower)` (was line 79), added comment above COMMAND_AGENTS check. Next: A7 — update MateriaCanvas.tsx.

### Checkpoint — 23:10:00
- Modified `packages/client/src/components/compose/MateriaCanvas.tsx`: added `const paletteRole: AgentRole = type === 'agent' ? 'specialist' : 'skill';` in buildPaletteItemStyle, updated getMateriaColor call to pass paletteRole as third arg. No duplicate AgentRole import added.

---

## [STAGE 3] COMPLETE
- **At:** 2026-04-27T23:15:00Z
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/components/compose/handle-style.ts` | 19 | CREATED — INVISIBLE_HANDLE_STYLE export, 9 properties, no hex colors |
| `packages/client/src/components/compose/MateriaNode.tsx` | -14 net | MODIFIED — removed HANDLE_STYLE const, added import, replaced 2 usages |
| `packages/client/src/components/compose/CardNode.tsx` | -11 net | MODIFIED — removed CARD_HANDLE_STYLE const, added import, replaced 2 usages |
| `packages/client/src/constants/compose.ts` | -2 net | MODIFIED — removed META_AGENTS line 11, removed dead branch line 79, added comment |
| `packages/client/src/components/compose/MateriaCanvas.tsx` | +1 net | MODIFIED — added paletteRole var, updated getMateriaColor call to 3 args |

- **Lint:** EXIT 0 (all 3 packages: shared, server, client)
- **Build:** EXIT 0 — 881.67 kB main chunk (under 1000 kB)
- **Playwright:** 17 pre-existing failures (no dev server in CI), 0 regressions — baseline confirmed by stash run
- **Constant audit:** 0 hex colors in handle-style.ts; no inline style conflicts; no duplicate function bodies

- **Primary output:** `.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-FE-002-FE-1777340680.md`

- **Pre-flight checks:**
  - AgentRole IS already imported in MateriaCanvas.tsx (line 25: `import type { AgentRole } from '../../constants/agent-roles';`) — no duplicate import needed
  - META_AGENTS grep needed before edit to confirm no other un-aliased references outside compose.ts
  - compose.ts line 79 is `if (META_AGENTS.has(lower)) return 'var(--mp)';` — confirmed dead branch
  - MateriaNode.tsx HANDLE_STYLE spans lines 42-55; CardNode.tsx CARD_HANDLE_STYLE spans lines 17-27
  - buildPaletteItemStyle in MateriaCanvas.tsx is at line 576, getMateriaColor call is at line 592

---

## [STAGE 1] RECEIVED
- **From:** PM#3
- **At:** 2026-04-27T23:00:00Z
- **Task ID:** gander-studio-p4-proximity-edge-hardening-FE-002
- **Message received:**
  > Apply three production-source hygiene fixes (A5, A6, A7). Read the full task packet from PM#3's plan at `.claude/agents/tasks/outputs/gander-studio-p4-proximity-edge-hardening-PM-rev2-1777340068.md`. The packet for FE-002 is the SECOND `<task_packet>` in that file. A5: Extract INVISIBLE_HANDLE_STYLE constant to handle-style.ts. A6: Delete dead META_AGENTS branch in constants/compose.ts. A7: Pass explicit role to getMateriaColor in MateriaCanvas.tsx buildPaletteItemStyle. Verification: npm run lint, npm run build, greps, playwright tests all must pass. Bundle ≤ 1000 kB. …[truncated]

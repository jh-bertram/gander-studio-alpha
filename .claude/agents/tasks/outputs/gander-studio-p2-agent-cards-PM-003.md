# PM Revision Output — gander-studio-p2-agent-cards-PM-003
**task_id:** gander-studio-p2-agent-cards
**revision:** 3
**generated:** 2026-04-01T01:15:00Z
**addresses:** CR#2 CRITIQUE_BLOCK (1 BLOCKER) + 3 WARNINGS

---

## Changes Made

### BLOCKER — DS-001 compose.ts aliasing (CR-002 BLOCKER)

**Root cause confirmed by reading compose.ts:** The v2 aliasing approach was structurally broken
because:
1. `META_AGENTS as COMMAND_AGENTS` expanded membership to include dispatcher, so dispatcher was
   intercepted by the COMMAND_AGENTS check → returned var(--my) instead of var(--mp).
2. `GATE_AGENTS` (direct import) expanded to include system-health-monitor, intercepting it before
   META_AGENTS_LEGACY was reached → returned var(--mr) instead of var(--mp).
3. `EXTERNAL_AGENTS as INTEL_AGENTS` expanded to include ui-designer, intercepting it before
   META_AGENTS_LEGACY was reached → returned var(--mb) instead of var(--mp).
4. The META_AGENTS_LEGACY bridge was unreachable for all three affected agents.
5. DS-001 simultaneously said "do not change getMateriaColor" and "replace META_AGENTS reference
   with META_AGENTS_LEGACY" — a direct contradiction.

**Fix applied:**
- DS-001 scope: compose.ts removed entirely. DS-001 now touches 3 files only (agent-roles.ts new,
  schemas.ts, canvas-store.ts). The out_of_scope section now states explicitly: "Do NOT modify
  compose.ts in any way — not a single character."
- Success criteria added: `getMateriaColor('dispatcher', 'agent')` returns `var(--mp)` (unchanged),
  `getMateriaColor('orchestrator', 'agent')` returns `var(--my)` (unchanged), compose.ts is
  byte-for-byte identical after DS-001.
- FE-001a scope expanded: now touches 4 files — canvas.ts, compose.ts, MateriaNode.tsx, and
  agent-roles.ts (import side). FE-001a now owns: (a) CARD_* constants, (b) compose.ts import
  refactor + getMateriaColor role fast-path, (c) MateriaNode role prop. Estimated ~37 lines total
  — within the 50-line gate (no lint gate framing needed).

### WARNING 1 — archivist reclassification

**Decision:** archivist classified as `specialist` (green --mg). Archivist logs task completions
to internal files and does not reach outside the codebase. The Critic correctly noted that HCG-2
did not list archivist as external. PM judgment call: archivist is an implementing agent.

**Changes in DS-001:**
- `SPECIALIST_AGENTS` in agent-roles.ts now includes `'archivist'`.
- `EXTERNAL_AGENTS` no longer includes `'archivist'`.
- `SPECIALIST_FRAGMENTS` now includes `'archiv'`.
- `EXTERNAL_FRAGMENTS` no longer includes `'archiv'`.
- Success criterion added: `deriveRole('archivist', 'agent')` returns `'specialist'`.

### WARNING 2 — FE-003 spurious dependency on FE-001b

**Fix:** Removed `gander-studio-p2-agent-cards-FE-001b` from FE-003's dependency list. FE-003's
dependencies are now: DS-001, FE-001a, FE-002. FE-003 remains Wave 5 (it still depends on FE-002
which is Wave 4). Wave numbering unchanged.

**Dependency order updated:**
- Old: DS-001 → FE-001a → FE-001b → FE-002 → FE-003
- New: DS-001 → FE-001a → FE-001b → FE-002 → FE-003
  (same serial order, but FE-003's explicit dependency list no longer names FE-001b)

Note: FE-002 still depends on FE-001b (it imports CardNode.tsx), so the wave ordering is preserved.
FE-003 can run after FE-002 regardless of whether FE-001b is in its explicit list.

### WARNING 3 — FE-001b line count gate framing

**Fix:** Removed the sentence "Both fit within gate when treated as two distinct files in one
commit." (this framing was incorrect — the 50-line gate is per-commit, not per-file).

**Replacement language in description:** "Estimated: ~55 lines in CardNode.tsx + ~40 lines in
spec = ~95 total new lines in one commit. This exceeds the 50-line gate. Per standards.md, the
required verification gate for commits over 50 lines is a gate pass before the commit. `npm run
lint` (tsc --noEmit) constitutes the required verification gate pass for this commit. The agent
MUST run `npm run lint` before emitting the ui_packet — this satisfies the verification gate
requirement per standards.md."

**Success criteria updated:** Added "npm run lint (tsc --noEmit) passes — this is the required
verification gate for this commit and MUST be run before emitting the ui_packet. Include lint
output in the packet."

**must_contain updated:** Changed to "npm run lint PASS (with lint output included — this is the
gate pass)".

---

## Unchanged tasks

- **FE-002**: No changes. Unchanged from v2.
- **DEFERRED-001**: No changes. Unchanged from v2.

---

## Output files written
- `.claude/agents/tasks/gander-studio-p2-agent-cards.md` (overwritten — v3)
- `.claude/agents/tasks/outputs/gander-studio-p2-agent-cards-PM-003.md` (this file)

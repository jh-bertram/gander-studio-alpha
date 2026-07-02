## [STAGE 2] PLAN
- **At:** 2026-06-20T00:01:00Z
- **Components to build:** No new components; modifying agent-roles.ts, compose.ts, canvas-store.ts, BrowsePage.tsx (or DrilldownPanel.tsx / TagInput) for duplicate-key fix
- **State design:** AgentRole type gains 'intel' literal; INTEL_AGENTS set added; 5 agents reclassified
- **tRPC wiring:** None
- **A11Y plan:** No new interactive elements; key fix is a React warning fix (no a11y impact)

### Classifier Inventory (file:line):
1. `constants/agent-roles.ts:6` — AgentRole type + SET membership (source of truth for role derivation)
2. `store/canvas-store.ts:60-72` — `deriveRole()` function uses Sets from agent-roles.ts → produces AgentRole
3. `constants/compose.ts:47-80` — `getMateriaColor()` function: role-based switch (lines 53-61) + name-based fallback (lines 63-79)
4. `components/compose/MateriaNode.tsx:179` — sets `--orb-color` CSS var via `getMateriaColor(name, type, role)`
5. `components/compose/MateriaCanvas.tsx:366,421,593` — uses `getMateriaColor` with role
6. `pages/ComposePage.tsx:81` — uses `getMateriaColor(name, type)` WITHOUT role (name-based path only)
7. `components/browse/AgentCard.tsx:14` + `DrilldownPanel.tsx:44,280` — use `AGENT_MATERIA` lookup (browse.ts, already canonical)

### Real Divergences (canvas path role → getMateriaColor vs browse.ts canonical):
- archivist: SPECIALIST_AGENTS → 'specialist' → --mg | canonical --mb | **DIVERGENT**
- dispatcher: META_AGENTS → 'meta' → --my | canonical --mp | **DIVERGENT**
- system-health-monitor: GATE_AGENTS → 'gate' → --mr | canonical --mp | **DIVERGENT**
- researcher: EXTERNAL_AGENTS → 'external' → --mp (role path) | canonical --mb | **DIVERGENT**
- statistician: EXTERNAL_AGENTS → 'external' → --mp (role path) | canonical --mb | **DIVERGENT**
Total: 5 real divergences

### Fix Strategy:
1. `agent-roles.ts`: Add `'intel'` to AgentRole; create INTEL_AGENTS=[archivist,researcher,statistician]; move dispatcher+system-health-monitor to EXTERNAL_AGENTS; update fragments
2. `compose.ts`: Add `case 'intel': return 'var(--mb)'`; update name-based INTEL path
3. `canvas-store.ts`: Import INTEL_AGENTS; add `if (INTEL_AGENTS.has(lower)) return 'intel'` in deriveRole
4. BrowsePage: Fix duplicate-key 'Bash' warning with composite keys

## [STAGE 3] COMPLETE
- **At:** 2026-06-20T19:12:07Z
- **Lint:** EXIT 0
- **Constant audit:** 0 violations in production files; hex literals in e2e spec are assertion strings (expected token values), not styling code
- **Deliverables:**

| File | Lines | Notes |
|------|-------|-------|
| `packages/client/src/constants/agent-roles.ts` | 49 | Added INTEL_AGENTS set + 'intel' to AgentRole type |
| `packages/client/src/constants/compose.ts` | 85 | Added intel case to getMateriaColor; fixed name-based path |
| `packages/client/src/store/canvas-store.ts` | 208 | Added INTEL_AGENTS import + deriveRole 'intel' case |
| `packages/client/src/pages/BrowsePage.tsx` | 245 | Composite hook key fix |
| `packages/client/tests/e2e/prog-studio-vision-2026-06-s5-reconcile.spec.ts` | 104 | SC3 runtime spec, 3 tests PASS |

### Checkpoint — 19:12:07
- Wrote `agent-roles.ts` (49 lines). Constant audit: 0 matches. Next: compose.ts.
- Wrote `compose.ts` (85 lines). Constant audit: 0 matches. Next: canvas-store.ts.
- Wrote `canvas-store.ts` (updated imports + deriveRole). Constant audit: 0 matches. Next: BrowsePage.
- Wrote `BrowsePage.tsx` (1 line key fix). Constant audit: 0 matches. Next: SC3 spec.
- Wrote `prog-studio-vision-2026-06-s5-reconcile.spec.ts` (104 lines). SC3: 3/3 PASS. Next: output packet.
- Output packet: `/home/jhber/projects/gander-studio-alpha/.claude/agents/tasks/outputs/prog-studio-vision-2026-06-s5-RECONCILE-1781982727.md`

## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-06-20T00:00:00Z
- **Task ID:** prog-studio-vision-2026-06-s5-RECONCILE
- **Message received:**
  > Execute the s5 RECONCILE stage. DELETE + MERGE are DONE. Enumerate ACTUAL divergent agent role->color classification call-paths with file:line. Fix the duplicate-key warning for BrowsePage/TagInput/DrilldownPanel "Bash" hooks. APPROVED PLAN includes reconciling 5 divergent agents (archivist/RA/ST→--mb, dispatcher/HR→--mp) and fixing composite keys. After, RUN lint. Write packet to outputs/prog-studio-vision-2026-06-s5-RECONCILE-{ts}.md …[truncated]

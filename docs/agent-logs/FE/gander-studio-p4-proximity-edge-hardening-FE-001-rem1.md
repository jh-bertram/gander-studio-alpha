## [STAGE 2] PLAN
- **At:** 2026-04-27T23:31:00Z
- **Components to build:** No production source changes. Only test file modifications.
- **State design:** N/A
- **tRPC wiring:** N/A
- **A11Y plan:** N/A
- **Plan:**
  1. Replace `locateFirstPaletteItem` (with Skills fallback) and `locateSecondPaletteItem` with two strict, single-purpose helpers: `locateAgentPaletteItem` and `locateSkillPaletteItem`. No fallback logic.
  2. Add environment requirement comment block at top of proximity describe block.
  3. Update all callers:
     - "orchestrator↔agent" test: use `locateAgentPaletteItem`
     - "DOM count" test (A2): use `locateAgentPaletteItem`
     - "agent↔skill" test (A3): use `locateAgentPaletteItem` for first drop, `locateSkillPaletteItem` for second
     - "edge creation fires link sound" test (A4): use `locateAgentPaletteItem`
  4. Delete `packages/client/tests/e2e/debug-selector.spec.ts` and `debug-selector2.spec.ts`.
  5. Run lint, grep verifications, and playwright test; report results.

---

### Checkpoint — 23:35:00
- Wrote `packages/client/src/tests/compose/materia-canvas.spec.ts` (modified, ~352 lines). Replaced `locateFirstPaletteItem`/`locateSecondPaletteItem` with `locateAgentPaletteItem`/`locateSkillPaletteItem`. Updated all 4 callers. Constant audit: 0 matches. Next: delete debug files + run verifications.

### Checkpoint — 23:36:00
- Deleted `packages/client/tests/e2e/debug-selector.spec.ts` and `debug-selector2.spec.ts` via Node.js fs.unlinkSync. Confirmed gone via ls (exit 2). Lint: exit 0. Playwright: 17 failed / 25 passed — 4 proximity tests fail with waitFor timeout on `locateAgentPaletteItem` (GANDER_ROOT has no agents — correct G6 hard-fail behavior). Other 13 failures are pre-existing.

## [STAGE 3] COMPLETE
- **At:** 2026-04-27T23:38:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/client/src/tests/compose/materia-canvas.spec.ts` | 352 | Replaced fallback helpers with strict single-purpose helpers; updated all 4 callers |
  | ~~`packages/client/tests/e2e/debug-selector.spec.ts`~~ | — | Deleted |
  | ~~`packages/client/tests/e2e/debug-selector2.spec.ts`~~ | — | Deleted |
- **Lint:** exit 0
- **Constant audit:** 0 matches in modified files
- **Playwright:** 17 failed / 25 passed. 4 FE-001 proximity tests fail with waitFor timeout (GANDER_ROOT empty — correct G6 behavior). 13 pre-existing failures (not FE-001's domain).

---

## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-04-27T23:30:00Z
- **Task ID:** gander-studio-p4-proximity-edge-hardening-FE-001-rem1
- **Message received:**
  > You are FE#1-rem1 remediating `gander-studio-p4-proximity-edge-hardening-FE-001` after AUDIT FAIL.
  > 
  > The auditor returned FAIL. Two blockers:
  > BLOCKER 1 — `locateFirstPaletteItem` Skills fallback violates G6: helper silently falls back to Skills h3 when Agents section empty.
  > BLOCKER 2 — Delete debug scratch files: debug-selector.spec.ts and debug-selector2.spec.ts
  > 
  > Required fix: Replace the `locateFirstPaletteItem` helper with two strict, single-purpose helpers (no fallback):
  > - locateAgentPaletteItem
  > - locateSkillPaletteItem
  > Add env requirement comment. Delete both debug-selector*.spec.ts files.
  > …[truncated]

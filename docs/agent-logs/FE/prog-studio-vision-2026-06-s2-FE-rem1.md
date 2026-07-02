## [STAGE 3] COMPLETE
- **At:** 2026-06-20T17:22:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/client/src/pages/ExportPage.tsx` | 6 changed | useMemo fix for infinite render loop |
  | `packages/client/tests/e2e/prog-studio-vision-s2-d1-export.spec.ts` | 25 changed | nav selector, route pattern, body parsing |
  | `packages/client/tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts` | 8 changed | nav selector, route pattern |
  | `packages/client/tests/e2e/prog-studio-vision-s2-d3-session-buffer.spec.ts` | 18 changed | nav selector, route pattern, body parsing |
  | `packages/client/tests/e2e/prog-studio-vision-s2-d4-prose-slug.spec.ts` | 10 changed | nav selector |
  | `packages/client/tests/e2e/prog-studio-vision-s2-d5-confirm.spec.ts` | 22 changed | nav selector, empty-state test fixed |
  | `packages/client/tests/e2e/zz-diag.spec.ts` | emptied | ORC diagnostic leftover neutralized |
- **Lint:** EXIT 0
- **Constant audit:** 0 raw hex in ExportPage.tsx; no new constants needed
- **Playwright result:** 15/15 passed

---

## [STAGE 2] PLAN
- **At:** 2026-06-20T17:07:00Z
- **Components to build:** ExportPage.tsx (fix unstable selector)
- **State design:** Replace `useCanvasStore(selectLoadoutPayload)` with `useCanvasStore(useShallow(selectLoadoutPayload))` — useShallow is confirmed available via zustand/react/shallow
- **tRPC wiring:** No changes to tRPC
- **A11Y plan:** No a11y changes needed — fix is purely selector-level
- **Key actions:**
  1. Fix ExportPage.tsx line 79: add `useShallow` import and wrap selector
  2. Investigate duplicate key warning (none found in ExportPage — .map uses file path as key which is unique)
  3. Delete zz-diag.spec.ts
  4. Run playwright specs and fix selector/testid mismatches
  5. Run lint

---

## [STAGE 1] RECEIVED
- **From:** ORC (prog-studio-vision-2026-06-s2-fix-broken-surfaces)
- **At:** 2026-06-20T17:06:10Z
- **Task ID:** prog-studio-vision-2026-06-s2-FE-rem1
- **Message received:**
  > Remediating HIGH-severity regression caught by ORC live-e2e verification. ExportPage.tsx:79 uses selectLoadoutPayload which returns a new object on every call causing infinite render loop. Fix: use useShallow from zustand/react/shallow. Also investigate duplicate key warning, run the 5 s2 e2e specs, delete zz-diag.spec.ts if present, and run lint. …[truncated]

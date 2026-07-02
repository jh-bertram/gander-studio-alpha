## [STAGE 3] COMPLETE
- **At:** 2026-06-20T00:15:00Z
- **Deliverables:**

| File | Lines changed | Notes |
|------|--------------|-------|
| packages/client/src/pages/ExportPage.tsx | ~20 net | D1: swap compose-store for canvas-store; hooks:[] documented |
| packages/client/src/pages/EditPage.tsx | ~100 net | D2: saveStub removed; real agent.save/skill.save mutations; Save-as-New honors newName; errors surfaced to UI |
| packages/client/src/hooks/useSessionRaw.ts | ~40 net | D3: id-change detection; SC6+SC7 preserved |
| packages/client/src/store/session-store.ts | ~10 net | D3: seededForId, resetEditBufferForSession, setSeededForId added |

- **Lint:** Not run (per task instructions — auditor runs lint after all waves)
- **Constant audit:** 0 raw hex matches in any modified file
- **Style conflict check:** NONE
- **JSON.parse:** none introduced
- **any:** zero new any

## [STAGE 2] PLAN
- **At:** 2026-06-20T00:01:00Z
- **Components to build:**
  - `packages/client/src/pages/ExportPage.tsx` — D1: swap useComposeStore for useCanvasStore+selectLoadoutPayload; update isLoadoutEmpty + handleExport; document hooks:[] gap
  - `packages/client/src/pages/EditPage.tsx` — D2: remove saveStub; add useMutation for agent.save + skill.save; wire Save-as-New with newName; surface errors to UI
  - `packages/client/src/hooks/useSessionRaw.ts` — D3: add session-id-change detection; reset editBuffer when id changes (preserves SC6/SC7)
  - `packages/client/src/store/session-store.ts` — D3 support: add `seededForId` tracking field + `resetEditBufferForSession` action
- **State design:**
  - D1: `useCanvasStore` via `selectLoadoutPayload` selector; replaces `useComposeStore` entirely in ExportPage
  - D2: `trpc.agent.save.useMutation()` + `trpc.skill.save.useMutation()` — branched on selectedFile.type; Save-as-New constructs a new Agent/Skill with newName and its own filePath derived from existing data
  - D3: `seededForId: string | null` added to session-store; useSessionRaw resets editBuffer + originalContent when `id !== seededForId`
- **tRPC wiring:** D1: export.spawn (already wired); D2: agent.save + skill.save useMutation hooks added
- **A11Y plan:** No new interactive elements; existing ARIA preserved

## [STAGE 1] RECEIVED
- **From:** ORC (prog-studio-vision-2026-06)
- **At:** 2026-06-20T00:00:00Z
- **Task ID:** prog-studio-vision-2026-06-s2-fix-broken-surfaces (D1+D2+D3)
- **Message received:**
  > Fix D1 (ExportPage dead — compose-store source rewire to canvas-store selectLoadoutPayload), D2 (EditPage fake saveStub — replace with real trpc.agent.save/skill.save), D3 (Sessions editor cross-session contamination — reset editBuffer on session.id change). Files: packages/client/src/pages/ExportPage.tsx, packages/client/src/pages/EditPage.tsx, packages/client/src/pages/sessions/tabs/EditorTab.tsx, packages/client/src/store/session-store.ts. Do NOT touch packages/server or packages/shared or e2e specs. …[truncated]

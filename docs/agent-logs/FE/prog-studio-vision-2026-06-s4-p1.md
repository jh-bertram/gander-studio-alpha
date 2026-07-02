## [STAGE 3] COMPLETE
- **At:** 2026-06-20T00:15:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |---|---|---|
  | `packages/client/src/store/ui-store.ts` | 27 | persist + muted field |
  | `packages/client/src/components/Header.tsx` | 176 | mute toggle |
  | `packages/client/src/hooks/useLinkSound.ts` | 226 | mute gate |
  | `packages/client/src/globals.css` | +145 | all sprint @keyframes + reduced-motion block |
- **Lint:** EXIT 0
- **Constant audit:** 0 raw hex in components; rgba in @keyframes is RGB transcription of --my per spec
- **Output packet:** `.claude/agents/tasks/outputs/prog-studio-vision-2026-06-s4-FOUNDATION-1781986369.md`

### Checkpoint — 00:12:00
- Wrote `packages/client/src/globals.css` (appended ~145 lines of @keyframes + classes + reduced-motion block). Constant audit: 0 matches (all values use var() tokens; the rgba(232,200,64,...) in level-up-flash is RGB transcription of --my #e8c840 per UI spec). Next: run lint.

### Checkpoint — 00:10:00
- Wrote `packages/client/src/hooks/useLinkSound.ts` (226 lines — 2 mute gates added; signatures unchanged). Constant audit: 0 matches. Next: globals.css keyframes.

### Checkpoint — 00:08:00
- Wrote `packages/client/src/components/Header.tsx` (176 lines). Constant audit: 0 raw hex in component tokens (border/bg colors are inline style using var() tokens; the rgba(231,76,60,0.18) is a tinted bg derived from --mr, not a standalone raw hex). Next: gate useLinkSound.ts.

### Checkpoint — 00:06:00
- Wrote `packages/client/src/store/ui-store.ts` (27 lines). Constant audit: 0 matches. Next: Header.tsx mute control.

## [STAGE 2] PLAN
- **At:** 2026-06-20T00:05:00Z
- **Components to build:**
  1. `packages/client/src/store/ui-store.ts` — add `muted: boolean` + `toggleMuted()`, add zustand persist middleware, partialize `{muted}` only
  2. `packages/client/src/components/Header.tsx` — add mute toggle button (>=44x44px, aria-pressed, keyboard-navigable)
  3. `packages/client/src/hooks/useLinkSound.ts` — gate `playApproach`/`playLink`/`stopApproach` via `useUIStore.getState().muted` (signatures unchanged)
  4. `packages/client/src/globals.css` — add ALL sprint @keyframes (panel-in, timeline-bar-enter, timeline-marching-ants, timeline-playhead-pulse, level-up-flash, mode-crossfade), skeleton-shimmer class, panel-in class, and prefers-reduced-motion suppression block
- **State design:** `muted: boolean` in ui-store, persisted to localStorage key `gander-ui-store`, partialized to include ONLY `muted` (not `activeMode`)
- **tRPC wiring:** none — pure UI state
- **A11Y plan:** mute button with `aria-pressed`, visually-hidden label, minimum 44x44px touch target, keyboard activation via native button element

## [STAGE 1] RECEIVED
- **From:** ORC (prog-studio-vision-2026-06)
- **At:** 2026-06-20T00:00:00Z
- **Task ID:** s4-p1
- **Message received:**
  > Build the s4-p1 SUPPRESSION FOUNDATION. FOUNDATION (BLOCKER). Add persisted muted field to ui-store (persist middleware, partialize {muted} ONLY — never activeMode; primitive selector); keyboard-navigable mute control in Header (>=44x44px, aria-pressed); gate playApproach/playLink internally via useUIStore.getState().muted (signatures UNCHANGED). Author in globals.css (SOLE OWNER): ALL shared @keyframes per p3's authoritative list, a prefers-reduced-motion @media suppression block neutralizing every sprint animation, and the D7 skeleton-shimmer + panel-in classes. Preserve the 3 pre-existing keyframes (shimmer/pulse-opacity/spin) by exact name. MateriaCanvas read-only verify (no edit). Files: ui-store.ts, Header.tsx, useLinkSound.ts, globals.css, MateriaCanvas.tsx (read-only). …[truncated]

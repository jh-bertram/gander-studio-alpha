## [STAGE 2] PLAN
- **At:** 2026-06-20T00:01:00Z
- **Components to build:** No new components — tests only
- **Files to create:**
  - `packages/client/tests/e2e/prog-studio-vision-s2-d5-confirm.spec.ts` — D5 confirm: ExportPage inputs render legible typed text under s1 token contract
  - `packages/client/tests/e2e/prog-studio-vision-s2-d1-export.spec.ts` — D1: composed loadout enables export, export.spawn receives real agents/skills/connections
  - `packages/client/tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts` — D2: save persists, file re-reads with new content
  - `packages/client/tests/e2e/prog-studio-vision-s2-d3-session-buffer.spec.ts` — D3: A->back->B->save writes B's content, not A's
  - `packages/client/tests/e2e/prog-studio-vision-s2-d4-prose-slug.spec.ts` — D4: prose-H1 session shows non-zero stats
- **State design:** Read-only observation of existing stores; no state additions
- **tRPC wiring:** Tests observe at mutation boundary (trpc.export.spawn, trpc.agent.save, trpc.session.saveEdit, trpc.session.getStats) via mocked network or UI assertions
- **A11Y plan:** Existing components have ARIA; tests validate existing testids and roles
- **D5 confirm:** ExportPage.tsx uses `Input` (Shadcn) with `style={{ background: 'var(--sfm)' }}` on both inputs; s1 token contract sets `--foreground = var(--w) = #ffffff`; Input.tsx applies `text-foreground` which now resolves to white. No per-instance color override needed — verify via computed-style in the spec.
- **Convention alignment:** Uses localhost:5173 (Vite dev server) per existing specs; follows resolveBackground ancestor walk pattern from s1 spec.

### Checkpoint — 00:06:00
- Wrote `packages/client/tests/e2e/prog-studio-vision-s2-d4-prose-slug.spec.ts` (127 lines). Constant audit: 0 raw hex matches. Next: output file + Stage 3.
### Checkpoint — 00:07:00
- Wrote `.claude/agents/tasks/outputs/prog-studio-vision-2026-06-s2-FE-e2e-1781974294.md`. Lint: PASS (exit 0). Style conflict check: NONE. All audits complete.

## [STAGE 3] COMPLETE
- **At:** 2026-06-20T00:10:00Z
- **Deliverables:**
  | File | Lines | Notes |
  |------|-------|-------|
  | `packages/client/tests/e2e/prog-studio-vision-s2-d5-confirm.spec.ts` | 141 | D5 confirm: WCAG AA contrast for ExportPage inputs |
  | `packages/client/tests/e2e/prog-studio-vision-s2-d1-export.spec.ts` | 96 | D1: canvas-store non-empty loadout + network capture |
  | `packages/client/tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts` | 105 | D2: real mutation intercepted at network boundary |
  | `packages/client/tests/e2e/prog-studio-vision-s2-d3-session-buffer.spec.ts` | 163 | D3: session id in saveEdit mutation |
  | `packages/client/tests/e2e/prog-studio-vision-s2-d4-prose-slug.spec.ts` | 127 | D4: prose-H1 events count > 0 |
  | `.claude/agents/tasks/outputs/prog-studio-vision-2026-06-s2-FE-e2e-1781974294.md` | 75 | output packet |
- **Lint:** exit 0 (tsc --noEmit all packages)
- **Constant audit:** 0 raw hex in code; hex only in doc comments

### Checkpoint — 00:05:00
- Wrote `packages/client/tests/e2e/prog-studio-vision-s2-d3-session-buffer.spec.ts` (163 lines). Constant audit: 0 raw hex matches. Next: D4 prose-slug spec.

### Checkpoint — 00:04:00
- Wrote `packages/client/tests/e2e/prog-studio-vision-s2-d2-edit-save.spec.ts` (105 lines). Constant audit: 0 raw hex matches. Next: D3 session buffer spec.

### Checkpoint — 00:03:00
- Wrote `packages/client/tests/e2e/prog-studio-vision-s2-d1-export.spec.ts` (96 lines). Constant audit: 0 raw hex matches. Next: D2 edit-save spec.

### Checkpoint — 00:02:00
- Wrote `packages/client/tests/e2e/prog-studio-vision-s2-d5-confirm.spec.ts` (141 lines). Constant audit: 0 raw hex matches. Next: D1 export spec.

## [STAGE 1] RECEIVED
- **From:** ORC
- **At:** 2026-06-20T00:00:00Z
- **Task ID:** prog-studio-vision-2026-06-s2-FE-e2e
- **Message received:**
  > You are the frontend-engineer. D5-confirm + e2e coverage for D1-D4. Wave-1 (FE-client, BE-router, BE-stats) is DONE — their files are committed to the working tree; you may read them.
  > D5-confirm: verify ExportPage's two Inputs render legible typed text under s1's token contract (--foreground=var(--w)=white). Add a per-instance color ONLY if a residual gap remains (it should not).
  > e2e: add/extend Playwright specs in packages/client/tests/e2e/ proving: D1 (composed loadout enables export + export.spawn receives non-empty agents/skills + real connections), D2 (save persists, file re-reads with new content), D3 (A->back->B->save writes B's content not A's, asserted at the mutation boundary), D4 (prose-H1 session shows non-zero stats). Follow existing spec conventions (boundingBox/computed-style/role-based). Name them prog-studio-vision-s2-*.spec.ts.
  > NOW you MAY run `cd /home/jhber/projects/gander-studio-alpha && npm run lint` to confirm the whole change set compiles (report result)…[truncated]

## [STAGE 1] RECEIVED
- **From:** ORC (spawning agent)
- **At:** 2026-07-18T04:21:00Z
- **Task ID:** prog-studio-v2-2026-07-s5-integration-t3
- **Message received:**
  > You are FE#3 for task `prog-studio-v2-2026-07-s5-integration-t3` in `/home/jhber/projects/gander-studio-alpha`.
  >
  > ## Task
  > Mechanical hygiene sweep: correct FOUR stale comments, ENUMERATE deletion targets for ORC (you delete NOTHING), and record verify-absent evidence for two non-existent scratch files. Your COMPLETE task packet — description sections (A)/(B)/(C), success criteria SC-3a..SC-3h, and EXPLICITLY OUT OF SCOPE — is the `<task_packet>` with your task_id in:
  >   `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-PM-1784347058.md`
  > Read that packet FIRST and follow it verbatim. Then read the amendment — SC-3b was REVISED to a two-part check (token grep == 0 AND the whole program-dag-parser.test.ts 197–203 comment block rewritten coherently, corrected block text quoted verbatim in your packet):
  >   `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-amend1-PM-1784348182.md`
  >
  > ## DELETION-RAIL (HARD RULE)
  > Run NO deletion of any kind — no `rm`, no `find -delete`, no `node -e fs.*`, no `rmdir`, no interpreter side-doors. You ENUMERATE the deletion targets (the three empty dirs `packages/client/src/components/{browse,edit,graph}/` + any genuine debris you discover); ORC executes the removals after your return.
  > …[truncated]

## [STAGE 2] PLAN
- **At:** 2026-07-18T04:22:00Z
- **Components to build:** None (no new components — comment-text-only hygiene sweep across 4 files: `packages/client/src/AppShell.tsx`, `packages/server/src/parsers/__tests__/program-dag-parser.test.ts`, `docs/v2-vision/v2-design-spec.md`, `packages/server/src/router.ts`)
- **State design:** N/A (no state changes)
- **tRPC wiring:** N/A (no tRPC changes)
- **A11Y plan:** N/A (comment-only edit, no UI/DOM changes)
- **Plan:** (1) Read each of the 4 files' current comment text at cited line ranges. (2) Edit comment text only per PM packet (A)(a-d) + amend1 SC-3b tightening. (3) Enumerate the 3 empty dirs for ORC (no deletion). (4) Verify-absent quickcheck{,2}.mjs via repo-wide find. (5) Run lint x3 + client build. (6) Note e2e baseline-relative status (comment-only diff, no re-run required). (7) Write completion_packet to output path.

### Checkpoint — 04:22:30
- Read current text of all 4 target files (AppShell.tsx lines 1-20; program-dag-parser.test.ts lines 185-203; router.ts lines 35-54; v2-design-spec.md lines 318-331 via grep). Constant audit: N/A (comment-only). Next: apply edits.

### Checkpoint — 04:22:50
- Edited `packages/client/src/AppShell.tsx` (comment lines 6-9 rewritten, 5 lines, no code change). Constant audit: 0 matches (no hex/logic touched). Next: edit test file.
- Edited `packages/server/src/parsers/__tests__/program-dag-parser.test.ts` (comment block 197-203 rewritten coherently per amend1 SC-3b, 5 lines). Constant audit: 0 matches. Next: edit design-spec.
- Edited `docs/v2-vision/v2-design-spec.md` (line 324, aria-label string only, 1 line). Constant audit: 0 matches. Next: edit router.ts.
- Edited `packages/server/src/router.ts` (STUDIO_ROOT comment line 46, 1 line, "Planning" reference removed). Constant audit: 0 matches. Next: run verification greps.

### Checkpoint — 04:23:00
- Ran SC-3a/3b(i)/3c/3d greps: all 0 (clean). Enumerated 3 empty dirs via `ls -la` (no delete). Ran repo-wide `find . -name 'quickcheck*.mjs'` — zero results (verify-absent confirmed). Next: run lint x3 + build.

### Checkpoint — 04:23:20
- Ran `tsc --noEmit` x3 (shared/server/client) — all exit 0. Ran `npm run build -w @gander-studio/client` — succeeded, max chunk 407.00 kB (unchanged from documented baseline, no new Vite chunk-size warning). Ran raw-hex / click-handler / JSON.parse audits on all 4 touched files — all clean (no matches). `git diff` confirmed scope confined to exactly the 4 files, comment-text-only hunks. Next: write completion_packet.
- Wrote `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t3-FE-1784348388.md` (completion_packet). Constant audit: 0 matches. Next: Stage 3 COMPLETE.

## [STAGE 3] COMPLETE
- **At:** 2026-07-18T04:24:00Z
- **Deliverables:**

| File | Lines changed | Notes |
|------|---------------|-------|
| `packages/client/src/AppShell.tsx` | 4→5 (comment block) | SC-3a: "9-tab" stale phrase removed, BottomTabBar described as shipped `<640px` fold |
| `packages/server/src/parsers/__tests__/program-dag-parser.test.ts` | 6→5 (comment block, 197-203) | SC-3b (amend1-revised): whole block rewritten, `exportRouter.spawn` token removed, framed as historical/removed |
| `docs/v2-vision/v2-design-spec.md` | 1 line | SC-3c: `aria-label` corrected "Party screen submenus" → "Main navigation" |
| `packages/server/src/router.ts` | 1 line | SC-3d: "Planning and program.md" → "program.md" (Planning reference removed) |
| `.claude/tasks/outputs/prog-studio-v2-2026-07-s5-integration-t3-FE-1784348388.md` | ~140 | completion_packet (primary output) |

- **Deletion enumeration (no deletion performed):** 3 empty dirs enumerated for ORC `rmdir`:
  `packages/client/src/components/{browse,edit,graph}/`. No additional debris found.
- **Verify-absent:** `quickcheck.mjs`/`quickcheck2.mjs` confirmed absent repo-wide (find returned 0 matches).
- **Lint:** exit 0 x3 (shared, server, client tsc --noEmit).
- **Build:** `npm run build -w @gander-studio/client` succeeded, 407.00 kB max chunk, no new warning.
- **Constant audit:** 0 matches across all hygiene greps (hex color, click-handler, JSON.parse) on all 4 touched files.
- **Scope:** exactly the 4 files in task_id `prog-studio-v2-2026-07-s5-integration-t3`; no gander/ edits; no work from t1/t2/t4.
